const channel = new BroadcastChannel("tab");

// send message to all tabs, after a new tab
channel.postMessage("newtab");
let activetab = true;
channel.addEventListener("message", (msg) => {
    if (msg.data === "newtab" && activetab) {
        // if there's a previously registered tab that can read the message, tell the other tab to kill itself
        channel.postMessage("blackmanthunderstorm");
    }

    if (msg.data === "blackmanthunderstorm") {
        activetab = false;
        //@ts-ignore
        for (const elm of [...document.children]) {
            elm.remove();
        }
        document.open();
        document.write(
            `
            <html>
            <head>
            <style>
            body {
                font-family: "Roboto", RobotoDraft, "Droid Sans", Arial, Helvetica, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                text-align: center;
                background: black;
                color: white;
                overflow: none;
                margin: 0;
            }
            #wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            </style>
            </head>
            <body>
            <div id="wrapper">
            <h1>AnuraOS is already running in another tab</h1>
            <p>Please close the other tab and reload.</p>
            </div>
            </body>
            </html>
            `,
        );
        document.close();
    }
});

const clickoffCheckerState = $state({
    active: false,
});

const clickoffChecker = (
    <div
        class={[
            use(clickoffCheckerState.active, (active) =>
                active
                    ? css`
                          position: absolute;
                          width: 100%;
                          height: 100%;
                          display: block;
                      `
                    : css`
                          display: none;
                      `,
            ),
        ]}
    />
);

const updateClickoffChecker = (show: boolean) => {
    clickoffCheckerState.active = show;
};

const contextMenu = new ContextMenu();
let taskbar: Taskbar;
let launcher: Launcher;
let oobeview: OobeView;
let quickSettings: QuickSettings;
let calendar: Calendar;
const alttab = new AltTabView();

let anura: Anura;
// global

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash);
    const swShared: any = {
        test: true,
    };

    (window as any).swShared = swShared;

    const comlinksrc = "/libs/comlink/comlink.min.mjs";
    const comlink = await import(comlinksrc);

    let conf, milestone, instancemilestone;

    try {
        conf = await (await fetch("/config.json")).json();
        milestone = await (await fetch("/MILESTONE")).text();

        console.log("writing config??");
        Filer.fs.writeFile("/config_cached.json", JSON.stringify(conf));
    } catch (e) {
        conf = JSON.parse(
            new TextDecoder().decode(
                await Filer.fs.promises.readFile("/config_cached.json"),
            ),
        );
    }

    anura = await Anura.new(conf);

    swShared.anura = anura;
    swShared.sh = new anura.fs.Shell();
    async function initComlink() {
        const { port1, port2 } = new MessageChannel();

        const msg = {
            anura_target: "anura.comlink.init",
            value: port2,
        };

        comlink.expose(swShared, port1);

        navigator.serviceWorker.controller!.postMessage(msg, [port2]);
        if (swShared.anura)
            navigator.serviceWorker.controller!.postMessage({
                anura_target: "anura.nohost.set",
            });
    }

    navigator.serviceWorker.addEventListener("controllerchange", initComlink);

    await navigator.serviceWorker.register("/anura-sw.js");
    initComlink();

    navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data.anura_target == "anura.sw.reinit") initComlink(); // this could accidentally be run twice but realistically there aren't any consequences for doing so
    });

    // Register built-in Node Polyfills
    anura.registerLib(new NodeFS());
    anura.registerLib(new NodePrelude());

    // Register vendored NPM packages
    anura.registerLib(new Comlink());
    anura.registerLib(new Mime());
    anura.registerLib(new Fflate());

    // console.log("comlink proxy", swProxy);
    // console.log(await swProxy.test);
    // console.log(await swProxy.testfn());

    launcher = new Launcher(
        clickoffChecker as HTMLDivElement,
        updateClickoffChecker,
    );

    quickSettings = new QuickSettings(
        clickoffChecker as HTMLDivElement,
        updateClickoffChecker,
    );

    calendar = new Calendar(
        clickoffChecker as HTMLDivElement,
        updateClickoffChecker,
    );

    taskbar = new Taskbar();

    oobeview = new OobeView();

    if (anura.platform.type == "mobile" || anura.platform.type == "tablet") {
        bootsplash.remove();
        document.body.appendChild(bootsplashMobile);
    } else {
        if (anura.settings.get("i-am-a-true-gangsta") === true) {
            bootsplash.remove();
            document.body.appendChild(gangstaBootsplash);
        }
    }

    document.body.classList.add("platform-" + anura.platform.type);

    if (anura.settings.get("blur-disable")) {
        document.body.classList.add("blur-disable");
    }

    if (milestone) {
        const stored = anura.settings.get("milestone");
        if (!stored) await anura.settings.set("milestone", milestone);
        else if (stored != milestone) {
            await anura.settings.set("milestone", milestone);
            if (anura.settings.get("use-sw-cache")) {
                const tracker = document.getElementById("systemstatus")!;
                const tracker_br = document.getElementById("systemstatus-br")!;
                tracker.style.display = "unset";
                tracker_br.style.display = "unset";
                tracker.innerText = "Anura is updating your system...";
                try {
                    await new Filer.fs.Shell().promises.rm("/anura_files", {
                        recursive: true,
                    });
                } catch {
                    console.log("cache already invalidated");
                }
                await preloadFiles(tracker);
            }
            console.log("invalidated cache");
            window.location.reload();
        }
    }

    Object.assign(window, {
        $store,
        anura,
    });

    anura.ui.init();

    if (!anura.settings.get("oobe-complete")) {
        // This is a new install, so an old version containing the old extension
        // handler system can't be installed. We can skip the migration.
        anura.settings.set("handler-migration-complete", true);
    }

    if (!anura.settings.get("handler-migration-complete")) {
        // Convert legacy file handlers
        // This is a one-time migration
        const extHandlers = anura.settings.get("FileExts") || {};

        console.log("migrating file handlers");
        console.log(extHandlers);

        for (const ext in extHandlers) {
            const handler = extHandlers[ext];
            if (handler.handler_type === "module") continue;
            if (handler.handler_type === "cjs") continue;
            if (typeof handler === "string") {
                if (handler === "/apps/libfileview.app/fileHandler.js") {
                    extHandlers[ext] = {
                        handler_type: "module",
                        id: "anura.fileviewer",
                    };
                    continue;
                }
                extHandlers[ext] = {
                    handler_type: "cjs",
                    path: handler,
                };
            }
        }
        anura.settings.set("FileExts", extHandlers);
        anura.settings.set("handler-migration-complete", true);
    }

    setTimeout(
        () => {
            setTimeout(() => {
                document.querySelector(".bootsplash")?.classList.add("hide");
            }, 350); // give the taskbar time to init
            setTimeout(() => {
                bootsplash.remove();
                bootsplashMobile.remove();
                gangstaBootsplash.remove();
            }, 550);
            anura.logger.debug("boot completed");
            document.dispatchEvent(new Event("anura-boot-completed"));
        },
        anura.settings.get("oobe-complete") ? 500 : 1500,
    );
});

document.addEventListener("anura-boot-completed", async () => {
    if (anura.settings.get("oobe-complete")) {
        document.dispatchEvent(new Event("anura-login-completed"));
    } else {
        document.body.appendChild(oobeview.element);
    }
});

document.addEventListener("anura-login-completed", async () => {
    anura.ui.theme = Theme.new(anura.settings.get("theme"));
    anura.ui.theme.apply();

    /**
     * These directories are used to load user apps and libs from
     * the filesystem, along with folder shortcuts and other things.
     *
     *
     */
    let directories = anura.settings.get("directories");

    if (!directories) {
        await anura.settings.set(
            "directories",
            (directories = {
                apps: "/userApps",
                libs: "/userLibs",
                init: "/userInit",
                opt: "/opt",
            }),
        );
    }

    /**
     * These directories are required for Anura to function
     * properly, and are automatically created if they
     * don't exist.
     *
     * This is a setting so that it can be changed by applications
     * that heavily modify the system. This will also be respected by
     * the file manager and other system utilities to prevent the user
     * from removing the shortcuts.
     */
    let requiredDirectories = anura.settings.get("requiredDirectories");

    if (!requiredDirectories) {
        await anura.settings.set(
            "requiredDirectories",
            (requiredDirectories = ["apps", "libs", "init", "opt"]),
        );
    }

    requiredDirectories.forEach(async (k: string) => {
        try {
            await anura.fs.promises.mkdir(directories[k]);
        } catch (e) {
            if (e.code !== "EEXIST") {
                console.error(e);
            }
        }
    });

    const generic = new GenericApp();
    anura.registerApp(generic);

    const browser = new BrowserApp();
    anura.registerApp(browser);

    const settings = new SettingsApp();
    anura.registerApp(settings);

    const about = new AboutApp();
    anura.registerApp(about);

    const wallpaper = new WallpaperSelector();
    anura.registerApp(wallpaper);

    const themeEditor = new ThemeEditor();
    anura.registerApp(themeEditor);

    const exploreApp = new ExploreApp();
    anura.registerApp(exploreApp);

    const dialog = new Dialog();
    const dialogApp = await anura.registerApp(dialog);
    (anura.dialog as any) = dialogApp;

    wallpaper.setWallpaper(
        anura.settings.get("wallpaper") ||
            "/assets/wallpaper/bundled_wallpapers/Nocturne.jpg",
    );

    for (const lib of anura.config.libs) {
        await anura.registerExternalLib(lib);
    }

    for (const app of anura.config.apps) {
        await anura.registerExternalApp(app);
    }

    // Initialize static UI components that utilize anura.ui after loading apps, scripts, libs, so that external apps and libraries can apply overrides.
    await quickSettings.init();
    await calendar.init();
    await launcher.init();
    await taskbar.init();

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(launcher.clickoffChecker);
    document.body.appendChild(quickSettings.quickSettingsElement);
    document.body.appendChild(calendar.element);
    document.body.appendChild(quickSettings.notificationCenterElement);
    document.body.appendChild(taskbar.element);
    document.body.appendChild(alttab.element);

    anura.ui.theme.apply();

    (window as any).taskbar = taskbar;

    // Initializes apps and libs from userApps/ and userLibs/ and runs any user specified init scripts
    await bootUserCustomizations();

    if (!anura.settings.get("x86-disabled")) {
        await bootx86();
    }

    if (anura.settings.get("kiosk-mode")) {
        taskbar.element.remove();
        // There is a race condition here, but it doesn't matter
        // because this feature is a joke
        await sleep(1000);
        anura.settings.get("kiosk-apps").forEach((app: string) => {
            anura.apps[app].open();
        });
    }

    document.addEventListener("contextmenu", function (e) {
        if (e.shiftKey) return;
        e.preventDefault();
    });

    document.addEventListener("keydown", (e) => {
        if (e.shiftKey && e.key.toLowerCase() == "tab") {
            e.preventDefault();
            alttab.onComboPress();
        }
        if (
            e.key.toLowerCase() === "meta" &&
            anura.settings.get("launcher-keybind")
        ) {
            quickSettings.close();
            calendar.close();
            launcher.toggleVisible();
            return;
        }
    });
    document.addEventListener("keyup", (e) => {
        // console.log("keyup", e);
        if (e.key.toLowerCase() === "shift") {
            alttab.onModRelease();
            return;
        }
    });

    anura.initComplete = true;
    taskbar.updateTaskbar();
    alttab.update();

    if (!anura.settings.get("explore-shown")) {
        exploreApp.open();
        anura.settings.set("explore-shown", true);
    }
});
async function bootx86() {
    const mgr = new x86MgrApp();
    await anura.registerApp(mgr);

    await anura.registerApp(new XFrogApp());

    await anura.registerApp(
        new XAppStub("X Calculator", "anura.xcalc", "", "xcalc"),
    );
    await anura.registerApp(new XAppStub("XTerm", "anura.xterm", "", "xterm"));
    anura.x86 = new V86Backend(anura.x86hdd);

    anura.settings
        .get("user-xapps")
        .forEach((stub: { name: string; cmd: string; id: string }) => {
            console.log("registering user xapp", stub);
            anura.registerApp(new XAppStub(stub.name, stub.id, "", stub.cmd));
        });
}
async function bootUserCustomizations() {
    const directories = anura.settings.get("directories");
    if ((await fetch("/fs/")).status === 404) {
        // Safe mode
        // Register recovery helper app
        const recovery = new RecoveryApp();
        anura.registerApp(recovery);
        anura.notifications.add({
            title: "Anura Error",
            description:
                "Anura has detected a system fault and booted in safe mode. Click this notification to enter the recovery app.",
            timeout: "never",
            callback: () => anura.apps["anura.recovery"].open(),
        });
    } else {
        // Not in safe mode
        // Load all user provided init scripts
        try {
            const files = await anura.fs.promises.readdir(directories["init"]);
            // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
            if (files) {
                for (const file of files) {
                    try {
                        const data = await anura.fs.promises.readFile(
                            directories["init"] + "/" + file,
                        );
                        try {
                            eval(new TextDecoder("utf-8").decode(data));
                        } catch (e) {
                            console.error(e);
                        }
                    } catch (e) {
                        anura.logger.error("Anura failed to load an app " + e);
                    }
                }
            }
        } catch (e) {
            anura.logger.error(e);
        }
    }

    // Load all persistent sideloaded libs
    try {
        const files = await anura.fs.promises.readdir(directories["libs"]);
        if (files == undefined) return;
        for (const file of files) {
            try {
                await anura.registerExternalLib(
                    `/fs/${directories["libs"]}/${file}/`,
                );
            } catch (e) {
                anura.logger.error("Anura failed to load a lib", e);
            }
        }
    } catch (e) {
        anura.logger.error(e);
    }

    // Load all persistent sideloaded apps
    try {
        const files = await anura.fs.promises.readdir(directories["apps"]);
        if (files) {
            for (const file of files) {
                try {
                    await anura.registerExternalApp(
                        `/fs/${directories["apps"]}/${file}/`,
                    );
                } catch (e) {
                    anura.logger.error("Anura failed to load an app", e);
                }
            }
        }
    } catch (e) {
        anura.logger.error(e);
    }
}
