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
        document.write("you already have an anura tab open");
        document.close();
    }
});

const taskbar = new Taskbar();
const launcher = new Launcher();
const contextMenu = new ContextMenu();
const bootsplash = new Bootsplash();
const oobeview = new OobeView();
const alttab = new AltTabView();

let anura: Anura;
// global

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash.element);

    await navigator.serviceWorker.register("/anura-sw.js");
    let conf, milestone, instancemilestone;
    try {
        conf = await (await fetch("/config.json")).json();
        milestone = await (await fetch("/MILESTONE")).text();
        instancemilestone = conf.milestone;

        console.log("writing config??");
        Filer.fs.writeFile("/config_cached.json", JSON.stringify(conf));
    } catch (e) {
        conf = JSON.parse(
            await new Promise((r) =>
                Filer.fs.readFile(
                    "/config_cached.json",
                    (_: any, b: Uint8Array) => r(new TextDecoder().decode(b)),
                ),
            ),
        );
    }

    anura = await Anura.new(conf);
    if (milestone) {
        const stored = anura.settings.get("milestone");
        if (!stored) await anura.settings.set("milestone", milestone);
        else if (
            stored != milestone ||
            anura.settings.get("instancemilestone") != instancemilestone
        ) {
            await anura.settings.set("milestone", milestone);
            await anura.settings.set("instancemilestone", instancemilestone);
            navigator.serviceWorker.controller!.postMessage({
                anura_target: "anura.cache.invalidate",
            });
            console.log("invalidated cache");
            window.location.reload();
        }
    }

    (window as any).anura = anura;

    setTimeout(
        () => {
            bootsplash.element.remove();
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
    const browser = new BrowserApp();
    anura.registerApp(browser);

    const settings = new SettingsApp();
    anura.registerApp(settings);

    const about = new AboutApp();
    anura.registerApp(about);

    const wallpaper = new WallpaperSelector();
    anura.registerApp(wallpaper);
    wallpaper.setWallpaper(
        anura.settings.get("wallpaper") ||
            "/assets/wallpaper/bundled_wallpapers/Default.jpg",
    );

    for (const app of anura.config.apps) {
        anura.registerExternalApp(app);
    }

    // Load all persistent sideloaded apps
    try {
        anura.fs.readdir("/userApps", (err: Error, files: string[]) => {
            // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
            if (files == undefined) return;
            files.forEach((file) => {
                try {
                    anura.registerExternalApp("/fs/userApps/" + file);
                } catch (e) {
                    anura.logger.error("Anura failed to load an app " + e);
                }
            });
        });
    } catch (e) {
        anura.logger.error(e);
    }
    // Load all user provided init scripts
    try {
        anura.fs.readdir("/userInit", (err: Error, files: string[]) => {
            // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
            if (files == undefined) return;
            files.forEach((file) => {
                try {
                    anura.fs.readFile(
                        "/userInit/" + file,
                        function (err: Error, data: Uint8Array) {
                            if (err) throw "Failed to read file";
                            try {
                                eval(new TextDecoder("utf-8").decode(data));
                            } catch (e) {
                                console.error(e);
                            }
                        },
                    );
                } catch (e) {
                    anura.logger.error("Anura failed to load an app " + e);
                }
            });
        });
    } catch (e) {
        anura.logger.error(e);
    }
    if ((await await fetch("/fs/")).status === 404) {
        const notif = anura.notifications.add({
            title: "Anura Error",
            description:
                "Anura has encountered an error with the Filesystem HTTP bridge, click this notification to restart",
            timeout: 50000,
            callback: () => window.location.reload(),
        });
    }

    if (!anura.settings.get("x86-disabled")) {
        await bootx86();
    }

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(launcher.clickoffChecker);
    document.body.appendChild(taskbar.element);
    document.body.appendChild(alttab.element);

    (window as any).taskbar = taskbar;

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
    });
    document.addEventListener("keyup", (e) => {
        // console.log("keyup", e);
        if (e.key.toLowerCase() === "shift") {
            alttab.onModRelease();
            return;
        }
    });

    // This feels wrong but it works and makes TSC happy
    launcher.clickoffChecker?.addEventListener("click", () => {
        launcher.toggleVisible();
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
