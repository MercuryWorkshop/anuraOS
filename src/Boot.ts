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

let anura: Anura;
// global

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash.element);
    if (!navigator.serviceWorker.controller) window.location.reload();

    const conf = await (await fetch("/config.json")).json();
    const milestone = await (await fetch("/MILESTONE")).text();
    const instancemilestone = conf.milestone;

    anura = await Anura.new(conf);
    if (
        anura.settings.get("milestone") != milestone ||
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
        // v86 stable. can enable it by default now

        const mgr = new x86MgrApp();
        await anura.registerApp(mgr);

        const finp: HTMLInputElement = React.createElement("input", {
            type: "file",
            id: "input",
        }) as unknown as HTMLInputElement;
        document.body.appendChild(finp);

        anura.x86 = new V86Backend(anura.x86hdd, mgr);
    }

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(launcher.clickoffChecker);
    document.body.appendChild(taskbar.element);

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

    // This feels wrong but it works and makes TSC happy
    launcher.clickoffChecker?.addEventListener("click", () => {
        launcher.toggleVisible();
    });
    anura.initComplete = true;
    taskbar.updateTaskbar();
});
