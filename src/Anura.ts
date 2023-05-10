declare var Filer: any;

const $ = document.querySelector.bind(document);

let taskbar = new Taskbar();
let launcher = new Launcher();
let contextMenu = new ContextMenu();
let bootsplash = new Bootsplash();
let oobeview = new OobeView();
let oobewelcomestep = new OobeWelcomeStep();
let oobeassetsstep = new OobeAssetsStep();

class Anura {
    x86: null | V86Backend;
    constructor() {
        if (localStorage.getItem("x86-enabled") === "true") {
            //this.x86 = new V86Backend(); //lemme fix my shit first
        }

        if (localStorage.getItem("use-expirimental-fs") === "true") {
            const script = document.createElement('script');
            script.src = "/assets/libs/filer.min.js"
            script.onload = () => {
                anura.fs = new Filer.FileSystem({
                    name: "anura-mainContext",
                    provider: new Filer.FileSystem.providers.IndexedDB()
                });
                anura.fs.readFileSync = async (path: string) => {
                    return await new Promise((resolve, reject) => {
                        return anura.fs.readFile(path, function async(err: any, data: any) {
                            resolve(new TextDecoder('utf8').decode(data))
                        })
                    })
                }
            }
            document.head.appendChild(script)
        }
    }
    fs: any = undefined
    syncRead = {}
    apps: any = {}
    Version = "0.2.0 alpha"
    logger = {
        log: Function = console.log.bind(console, "anuraOS:"),
        debug: Function = console.debug.bind(console, "anuraOS:"),
        warn: Function = console.warn.bind(console, "anuraOS:"),
        error: Function = console.error.bind(console, "anuraOS:")
    }
    x86fs = {
        async read(path: string) {
            // return await new Promise((resolve, reject) => {
            //     return cheerpOSGetFileBlob([], "/files/" + path, async (blob) => {
            //         resolve(await blob.text())
            //     })
            // })
        },
        write(path: string, data: string) {
            // cheerpjAddStringFile(`/str/${path}`, data);
            // Depressingly, we can't actually transfer the file to /home without it crashing the users shell //
            // The user must do it themselves //
        }
    }
    async registerApp(location: string) {
        let resp = await fetch(`${location}/manifest.json`);
        let manifest = await resp.json()

        let app = {
            name: manifest.name,
            location,
            manifest,
            windowinstance: null,
            async launch() {
                if (manifest.type == 'manual') { // This type of application is discouraged for sure but is the most powerful
                    fetch(`${location}/${manifest.handler}`)
                        .then(response => response.text())
                        .then((data) => {
                            top!.window.eval(data);
                            top!.window.eval(`loadingScript("${location}")`)
                        })
                } else {
                    if (this.windowinstance) return;
                    let win = AliceWM.create(this.manifest.wininfo, () => {
                        this.windowinstance = null;
                    });

                    let iframe: any = document.createElement("iframe")
                    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
                    iframe.setAttribute("src", `${location}/${manifest.index}`);

                    win.content.appendChild(iframe);
                }
            },
        };

        launcher.addShortcut(manifest.name, manifest.icon ? `${location}/${manifest.icon}` : "", app.launch.bind(app));

        this.apps[manifest.package] = app;
        return app;
    }
}
let anura = new Anura();

function openAppManager() {
    fetch("applicationmanager/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            window.eval(data);
        })
}

const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash.element);

    await sleep(2000);

    bootsplash.element.remove();
    anura.logger.debug("boot completed");
    document.dispatchEvent(new Event("anura-boot-completed"));
});

document.addEventListener("anura-boot-completed", async () => {
    document.body.appendChild(oobeview.element);
    oobeview.content.appendChild(oobewelcomestep.element);
    oobewelcomestep.nextButton.addEventListener("click", () => {
        oobewelcomestep.element.remove();
        oobeview.content.appendChild(oobeassetsstep.element);
        oobeassetsstep.nextButton.addEventListener("click", () => {
            oobeview.element.remove();
            document.dispatchEvent(new Event("anura-login-completed"));
        });
    });
});

document.addEventListener("anura-login-completed", () => {
    anura.registerApp("browser.app");
    anura.registerApp("fsapp.app");
    anura.registerApp("chide.app");

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(taskbar.element);

    (window as any).taskbar = taskbar;

    document.addEventListener("contextmenu", function(e) {
        if (e.shiftKey) return;
        e.preventDefault();
        const menu: any = document.querySelector(".custom-menu");
        menu.style.removeProperty("display");
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
    });

    document.addEventListener("click", (e) => {
        if (e.button != 0) return;
        (document.querySelector(".custom-menu")! as HTMLElement).style.setProperty("display", "none");
    });

});
(window as any).anura = anura;
