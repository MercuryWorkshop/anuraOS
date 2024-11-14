const channel = new BroadcastChannel("tab");

// send message to all tabs, after a new tab
channel.postMessage("newtab");
let activetab = true;
let splashToRemove: HTMLElement | null = null;
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
                          z-index: 9998;
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

let taskbar: Taskbar;
let launcher: Launcher;
let oobeview: OobeView;
let quickSettings: QuickSettings;
let calendar: Calendar;
const alttab = new AltTabView();

let anura: Anura;
// global

window.addEventListener("load", async () => {
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

        console.debug("writing config??");
        Filer.fs.writeFile("/config_cached.json", JSON.stringify(conf));
    } catch (e) {
        conf = JSON.parse(
            new TextDecoder().decode(
                await Filer.fs.promises.readFile("/config_cached.json"),
            ),
        );
    }

    anura = await Anura.new(conf);
    LocalFS.newOPFS("/opfs"); // mount opfs on boot

    if (anura.platform.type === "mobile" || anura.platform.type === "tablet") {
        splashToRemove = bootsplashMobile;
        document.body.appendChild(bootsplashMobile);
    } else {
        if (anura.config.tnbranding === true) {
            splashToRemove = TNBootSplash;
            document.body.appendChild(TNBootSplash);
            setupTNBootsplash();
        } else if (anura.settings.get("i-am-a-true-gangsta")) {
            splashToRemove = gangstaBootsplash;
            document.body.appendChild(gangstaBootsplash);
        } else {
            splashToRemove = bootsplash;
            document.body.appendChild(bootsplash);
        }
    }

    console.log(splashToRemove);

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
        if (event.data.anura_target === "anura.sw.reinit") initComlink(); // this could accidentally be run twice but realistically there aren't any consequences for doing so
    });

    // Create "Process" that controls the service worker

    const swProcess = new SWProcess();
    // We do not want the service worker process to be garbage collected
    // so we will store it in the Window object as well.
    anura.sw = swProcess;
    anura.processes.register(swProcess);

    if (milestone) {
        const stored = anura.settings.get("milestone");
        if (!stored) await anura.settings.set("milestone", milestone);
        else if (stored !== milestone) {
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
                    console.debug("cache already invalidated");
                }
                await preloadFiles(tracker);
            }
            console.debug("invalidated cache");
            window.location.reload();
        }
    }

    // Register requirements for anurad
    anura.registerLib(new AnuradHelpersLib());

    // Register anurad, claiming PID 1
    const anurad = new Anurad(1);

    anura.anurad = anurad;
    anura.processes.register(anurad);
    AnuradHelpers.setReady("anura.anurad");

    Object.entries(anura)
        .filter(([_, v]) => v !== undefined)
        .map(([k]) => "anura." + k)
        .forEach(AnuradHelpers.setReady);

    /**
     * These directories are used to load user apps and libs from
     * the filesystem, along with folder shortcuts and other things.
     */
    let directories = anura.settings.get("directories");

    const defaultDirectories = {
        apps: "/usr/apps",
        libs: "/usr/lib",
        init: "/usr/init",
        bin: "/usr/bin",
        opt: "/opt",
    };

    const sh = new anura.fs.Shell();

    /**
     * This is a migration for the new directory structure
     * introduced in AnuraOS 2.0.0. This is to ensure that
     * users who have been using AnuraOS for a while can
     * have a consistent experience with new installations.
     */
    const map = {
        apps: ["/userApps", "/usr/apps"],
        libs: ["/userLibs", "/usr/lib"],
        init: ["/userInit", "/usr/init"],
    };

    if (directories) {
        const needsMigration = Object.entries(map).filter(
            ([key, [old, _new]]) => directories[key] === old,
        );

        if (needsMigration.length > 0) {
            anura.notifications.add({
                title: "Anura Update",
                description:
                    "AnuraOS has been updated to a new version. Users are recommended to change the installation directory of their apps and libraries to /usr/ to ensure consistency with new installations.",
                timeout: "never",
                buttons: [
                    {
                        text: "Migrate Now",
                        callback: async () => {
                            const migrate = async (
                                oldPath: string,
                                newPath: string,
                            ) => {
                                const parent = newPath.split("/").slice(0, -1);
                                await sh.promises.mkdirp(parent.join("/"));
                                await anura.fs.promises.rename(
                                    oldPath,
                                    newPath,
                                );
                            };

                            await Promise.all(
                                needsMigration.map(
                                    async ([key, [old, newPath]]) => {
                                        directories[key] = newPath;
                                        await migrate(old!, newPath!);
                                    },
                                ),
                            );

                            await anura.settings.set(
                                "directories",
                                directories,
                            );
                        },
                    },
                ],
            });
        }
    } else {
        await anura.settings.set(
            "directories",
            (directories = defaultDirectories),
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

    if (!requiredDirectories || !requiredDirectories.includes("bin")) {
        await anura.settings.set(
            "requiredDirectories",
            (requiredDirectories = ["apps", "libs", "init", "bin", "opt"]),
        );
    }

    requiredDirectories.forEach(async (k: string) => {
        if (!directories[k]) {
            directories[k] =
                defaultDirectories[k as keyof typeof defaultDirectories];
            await anura.settings.set("directories", directories);
        }
        try {
            await sh.promises.mkdirp(directories[k]);
        } catch (e) {
            if (e.code !== "EEXIST") {
                console.error(e);
            }
        }
    });

    if ((await fetch("/fs/")).status !== 404) {
        try {
            const files = await anura.fs.promises.readdir(directories["init"]);
            if (files) {
                for (const file of files) {
                    // Init scripts have 2 modes:
                    // 1. Normal init scripts, ran after all apps and libs are loaded
                    // 2. anurad init scripts, ran before all apps and libs are loaded. These will end with .init.ajs and will be loaded here.
                    if (!file.endsWith(".init.ajs")) continue;

                    const data = await anura.fs.promises.readFile(
                        directories["init"] + "/" + file,
                    );
                    anurad.addInitScript(new TextDecoder("utf-8").decode(data));
                }
            }
        } catch (e) {
            anura.logger.error(e);
        }
    }

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

    document.body.classList.add("platform-" + anura.platform.type);

    if (anura.settings.get("blur-disable")) {
        document.body.classList.add("blur-disable");
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

        console.debug("migrating file handlers");
        console.debug(extHandlers);

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
                if (splashToRemove) {
                    splashToRemove.classList.add("hide");
                }
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
    AnuradHelpers.setStage("anura.boot");
    if (anura.settings.get("oobe-complete")) {
        document.dispatchEvent(new Event("anura-login-completed"));
    } else {
        document.body.appendChild(oobeview.element);
    }
});

document.addEventListener("anura-login-completed", async () => {
    AnuradHelpers.setStage("anura.login");
    const directories = anura.settings.get("directories");
    anura.ui.theme = Theme.new(anura.settings.get("theme"));
    anura.ui.theme.apply();
    AnuradHelpers.setReady("anura.ui.theme");

    const generic = new GenericApp();
    anura.registerApp(generic);

    const browser = new BrowserApp();
    anura.registerApp(browser);

    const settings = new SettingsApp();
    anura.registerApp(settings);

    const taskmgr = new TaskManager();
    anura.registerApp(taskmgr);

    const about = new AboutApp();
    anura.registerApp(about);

    const wallpaper = new WallpaperSelector();
    anura.registerApp(wallpaper);

    const themeEditor = new ThemeEditor();
    anura.registerApp(themeEditor);

    const explore = new ExploreApp();
    anura.registerApp(explore);

    const regedit = new RegEdit();
    anura.registerApp(regedit);

    const dialog = new Dialog();
    const dialogApp = await anura.registerApp(dialog);
    (anura.dialog as any) = dialogApp;
    AnuradHelpers.setReady("anura.dialog");

    wallpaper.setWallpaper(
        anura.settings.get("wallpaper") ||
            "/assets/wallpaper/bundled_wallpapers/Nocturne.jpg",
    );

    for (const bin of anura.config.bin) {
        const path = bin.split("/").slice(-1)[0];
        try {
            await anura.fs.promises.stat(directories.bin + "/" + path);
        } catch (e) {
            await anura.fs.promises.writeFile(
                directories.bin + "/" + path,
                await fetch(bin).then((r) => r.text()),
            );
        }
    }

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

    if (anura.platform.type === "mobile") {
        // Adjust styles for Taskbar right
        const tright: HTMLDivElement =
            taskbar.element.querySelector("#taskbar-right")!;
        tright.style.backgroundColor = "black";
        tright.style.top = "0";
        tright.style.right = "0";
        tright.style.height = "25px";
        tright.style.transform = "translateY(0%)";
        tright.style.width = "100%";
        tright.style.zIndex = "1000000";

        // Adjust styles taskinfo-container (has date and battery)
        const tinfocont: HTMLDivElement = tright.querySelector(
            "#taskinfo-container",
        )!;
        tinfocont.style.background = "black";
        tinfocont.style.right = "0";
        tinfocont.style.position = "absolute";

        // Adjust styles for date container
        const tdatecon: HTMLDivElement =
            tright.querySelector("#date-container")!;
        tdatecon.style.background = "black";

        document.body.appendChild(tright);

        // Adjust launcher CSS
        launcher.element.style.left = "0";
        launcher.element.style.top = "25px";
        launcher.element.style.borderRadius = "0";
        const aview: HTMLDivElement =
            launcher.element.querySelector(".appsView")!;
        aview.style.gridTemplateColumns = "1fr 1fr 1fr 1fr";
        launcher.state.active = true;
    }

    if (anura.platform.type === "tablet") {
        // Adjust styles for Taskbar right
        const tright: HTMLDivElement =
            taskbar.element.querySelector("#taskbar-right")!;
        tright.style.backgroundColor = "black";
        tright.style.top = "0";
        tright.style.right = "0";
        tright.style.height = "25px";
        tright.style.transform = "translateY(0%)";
        tright.style.width = "100%";
        tright.style.zIndex = "1000000";

        // Adjust styles taskinfo-container (has date and battery)
        const tinfocont: HTMLDivElement = tright.querySelector(
            "#taskinfo-container",
        )!;
        tinfocont.style.background = "black";
        tinfocont.style.right = "0";
        tinfocont.style.position = "absolute";

        // Adjust styles for date container
        const tdatecon: HTMLDivElement =
            tright.querySelector("#date-container")!;
        tdatecon.style.background = "black";

        document.body.appendChild(tright);

        // Adjust launcher CSS
        launcher.element.style.left = "0";
        launcher.element.style.top = "25px";
        launcher.element.style.borderRadius = "0";
        const aview: HTMLDivElement =
            launcher.element.querySelector(".appsView")!;
        aview.style.gridTemplateColumns = "1fr 1fr 1fr 1fr 1fr 1fr";
        launcher.state.active = true;
    }

    document.body.appendChild(launcher.element);
    document.body.appendChild(launcher.clickoffChecker);
    document.body.appendChild(quickSettings.quickSettingsElement);
    document.body.appendChild(calendar.element);
    document.body.appendChild(quickSettings.notificationCenterElement);
    document.body.appendChild(taskbar.element);
    document.body.appendChild(alttab.element);
    anura.systray = new Systray();
    AnuradHelpers.setReady("anura.systray");

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
        if (e.shiftKey && e.key.toLowerCase() === "tab") {
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
    AnuradHelpers.setReady("anura.initComplete");
    taskbar.updateTaskbar();
    alttab.update();

    if (!anura.settings.get("explore-shown")) {
        explore.open();
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
    AnuradHelpers.setReady("anura.x86");

    anura.settings
        .get("user-xapps")
        .forEach((stub: { name: string; cmd: string; id: string }) => {
            console.debug("registering user xapp", stub);
            anura.registerApp(new XAppStub(stub.name, stub.id, "", stub.cmd));
        });
    AnuradHelpers.setStage("anura.bootx86");
}
async function bootUserCustomizations() {
    const directories = anura.settings.get("directories");
    console.debug("directories", directories);
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
                    // Init scripts have 2 modes:
                    // 1. Normal init scripts, ran after all apps and libs are loaded
                    // 2. anurad init scripts, ran before all apps and libs are loaded. These will end with .init.ajs and will not be loaded here.
                    if (file.endsWith(".init.ajs")) continue;

                    try {
                        const data = await anura.fs.promises.readFile(
                            directories["init"] + "/" + file,
                        );
                        const script = `try {
                            ${new TextDecoder("utf-8").decode(data)}
                        } catch (e) {
                            console.error(e);
                        }`;

                        const process = anura.processes.create(script);
                        process.title = file;
                    } catch (e) {
                        anura.logger.error(
                            "Anura failed to load a script " + e,
                        );
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
        if (files === undefined) return;
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

    AnuradHelpers.setStage("anura.bootUserCustomizations");
}

function setupTNBootsplash() {
    const TNMark = document.createElement("span");
    TNMark.setAttribute(
        "style",
        "position: absolute; bottom: 70px; right: 10px",
    );
    TNMark.innerHTML =
        "Instance hosted by Titanium Network.<br>More mirrors at discord.gg/unblock";
    TNMark.onclick = () => {
        anura.apps["anura.browser"].open([
            "https://discord.com/invite/unblock/login",
        ]);
    };
    document.body.appendChild(TNMark);
}
