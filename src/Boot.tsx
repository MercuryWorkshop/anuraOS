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
                font-family: 'Roboto', system-ui, sans-serif;
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

const clickoffCheckerState = stateful({
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

const taskbar = new Taskbar();
const launcher = new Launcher(
    clickoffChecker as HTMLDivElement,
    updateClickoffChecker,
);
const quickSettings = new QuickSettings(
    clickoffChecker as HTMLDivElement,
    updateClickoffChecker,
);
const contextMenu = new ContextMenu();
const oobeview = new OobeView();
const alttab = new AltTabView();

let anura: Anura;
// global

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash);

    // Pass ?readwrite to allow readwrite access to the filesystem via filer.js
    await navigator.serviceWorker.register("/anura-sw.js?readwrite");
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

    // TODO: Serialize state in a way that nested statefuls are preserved
    function $store<T>(
        target: T,
        ident: string,
        backing:
            | string
            | ((
                  ident: string,
                  target: T,
              ) => {
                  get: () => T;
                  set: (val: T) => void;
              }) = "anura",
    ): Stateful<T> {
        let get: () => T;
        let set: (val: T) => void;
        if (typeof backing === "function") {
            const { get: g, set: s } = backing(ident, target);
            get = g;
            set = s;
        } else {
            switch (backing) {
                case "anura":
                    get = () =>
                        anura.settings.get(`dreamland.${ident}`) || target;
                    set = (val) =>
                        anura.settings.set(`dreamland.${ident}`, val);
                    break;
                case "localstorage":
                    get = () => {
                        const stored = localStorage.getItem(ident);
                        if (stored === null) return target;
                        return JSON.parse(stored);
                    };
                    set = (val) => {
                        localStorage.setItem(ident, JSON.stringify(val));
                    };
                    break;
                default:
                    throw new Error("invalid backing");
            }
        }
        target = get();

        addEventListener("beforeunload", () => {
            console.info("[dreamland.js]: saving " + ident);
            set(target);
        });

        return stateful(target);
    }

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
                try {
                    const list = await (await fetch("cache-load.json")).json();
                    /*
                     * The list has a few items that aren't exactly real
                     * as a result of the developers schizophrenia.
                     * Because of this, there will be a few errors on the fetch.
                     * These can safely be ignored, just like the voices in
                     * the developers head.
                     */
                    const chunkSize = 10;
                    const promises = [];
                    let i = 0;
                    for (const item in list) {
                        promises.push(fetch(list[item]));
                        if (Number(item) % chunkSize === chunkSize - 1) {
                            await Promise.all(promises);
                        }
                        tracker!.innerText = `Downloading anura system files, chunk ${i}/${list.length}`;
                        i++;
                    }
                    await Promise.all(promises);
                } catch (e) {
                    console.warn("error durring oobe preload", e);
                }
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
            bootsplash.remove();
            anura.logger.debug("boot completed");
            document.dispatchEvent(new Event("anura-boot-completed"));
        },
        anura.settings.get("oobe-complete") ? 1000 : 2000,
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

    const dialog = new Dialog();
    const dialogApp = await anura.registerApp(dialog);
    (anura.dialog as any) = dialogApp;

    wallpaper.setWallpaper(
        anura.settings.get("wallpaper") ||
            "/assets/wallpaper/bundled_wallpapers/Nocturne.jpg",
    );

    // Register built-in Node Polyfills
    anura.registerLib(new NodeFS());
    anura.registerLib(new NodePrelude());

    // Register vendored NPM packages
    anura.registerLib(new Comlink());

    for (const lib of anura.config.libs) {
        anura.registerExternalLib(lib);
    }

    for (const app of anura.config.apps) {
        anura.registerExternalApp(app);
    }

    /**
     * These directories are used to load user apps and libs from
     * the filesystem, along with folder shortcuts and other things.
     *
     *
     */
    let directories = anura.settings.get("directories");

    if (!directories) {
        anura.settings.set(
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
        anura.settings.set(
            "requiredDirectories",
            (requiredDirectories = ["apps", "libs", "init", "opt"]),
        );
    }

    requiredDirectories.forEach((k: string) => {
        anura.fs.exists(directories[k], (exists: boolean) => {
            if (!exists) {
                anura.fs.mkdir(directories[k]);
            }
        });
    });

    // Load all persistent sideloaded libs
    try {
        anura.fs.readdir(directories["libs"], (err: Error, files: string[]) => {
            if (files == undefined) return;
            console.log(files);
            files.forEach((file) => {
                try {
                    anura.registerExternalLib(
                        `/fs/${directories["libs"]}/${file}/`,
                    );
                } catch (e) {
                    anura.logger.error("Anura failed to load a lib " + e);
                }
            });
        });
    } catch (e) {
        anura.logger.error(e);
    }
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
            anura.fs.readdir(
                directories["init"],
                (err: Error, files: string[]) => {
                    // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
                    if (files == undefined) return;
                    files.forEach((file) => {
                        try {
                            anura.fs.readFile(
                                directories["init"] + "/" + file,
                                function (err: Error, data: Uint8Array) {
                                    if (err) throw "Failed to read file";
                                    try {
                                        eval(
                                            new TextDecoder("utf-8").decode(
                                                data,
                                            ),
                                        );
                                    } catch (e) {
                                        console.error(e);
                                    }
                                },
                            );
                        } catch (e) {
                            anura.logger.error(
                                "Anura failed to load an app " + e,
                            );
                        }
                    });
                },
            );
        } catch (e) {
            anura.logger.error(e);
        }
    }

    // Load all persistent sideloaded apps
    try {
        anura.fs.readdir(directories["apps"], (err: Error, files: string[]) => {
            // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
            if (files == undefined) return;
            files.forEach((file) => {
                try {
                    anura.registerExternalApp(
                        `/fs/${directories["apps"]}/${file}`,
                    );
                } catch (e) {
                    anura.logger.error("Anura failed to load an app " + e);
                }
            });
        });
    } catch (e) {
        anura.logger.error(e);
    }

    if (!anura.settings.get("x86-disabled")) {
        await bootx86();
    }

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(launcher.clickoffChecker);
    document.body.appendChild(quickSettings.quickSettingsElement);
    document.body.appendChild(quickSettings.notificationCenterElement);
    document.body.appendChild(taskbar.element);
    document.body.appendChild(alttab.element);

    (window as any).taskbar = taskbar;

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
        //     const menu: any = document.querySelector(".custom-menu");
        //     menu.style.removeProperty("display");
        //     menu.style.top = `${e.clientY}px`;
        //     menu.style.left = `${e.clientX}px`;
    });
    //
    // document.addEventListener("click", (e) => {
    //     if (e.button != 0) return;
    //     (
    //         document.querySelector(".custom-menu")! as HTMLElement
    //     ).style.setProperty("display", "none");
    // });

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
}
