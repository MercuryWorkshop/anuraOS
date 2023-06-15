declare var Filer: any;

const $ = document.querySelector.bind(document);

const dg: { [key: string]: any } = {};


let taskbar = new Taskbar();
let launcher = new Launcher();
let contextMenu = new ContextMenu();
let bootsplash = new Bootsplash();
let oobeview = new OobeView();
let oobewelcomestep = new OobeWelcomeStep();
let oobeassetsstep = new OobeAssetsStep();

type notifParams = {
    title?: string
    description?: string
    timeout?: number
    callback?: Function
    closeIndicator?: boolean
    // COMING SOON (hopefully)
    // icon?: string
    // buttons?: Array<{ text: string, callback: Function }>

}

class Anura {
    x86: null | V86Backend;
    constructor() {


        // File System Initialization //
        this.fs = new Filer.FileSystem({
            name: "anura-mainContext",
            provider: new Filer.FileSystem.providers.IndexedDB()
        });
        this.fs.readFileSync = async (path: string) => {
            return await new Promise((resolve, reject) => {
                return anura.fs.readFile(path, function async(err: any, data: any) {
                    resolve(new TextDecoder('utf8').decode(data))
                })
            })
        }

        // Notification Container //
        {
            let notif = document.createElement('div')
            notif.className = "notif-container"
            document.body.appendChild(notif)
        }
    }
    fs: any; // No Filer types, needs fixing later
    syncRead = {}
    apps: any = {}
    Version = "0.2.0 alpha"
    logger = {
        log: Function = console.log.bind(console, "anuraOS:"),
        debug: Function = console.debug.bind(console, "anuraOS:"),
        warn: Function = console.warn.bind(console, "anuraOS:"),
        error: Function = console.error.bind(console, "anuraOS:")
    }
    async registerApp(location: string) {
        let resp = await fetch(`${location}/manifest.json`);
        let manifest = await resp.json()
        
        if (manifest.package in anura.apps) {  //  Application already registered 
            throw 'Application already installed';
        }

        let app = {
            name: manifest.name,
            location,
            manifest,
            windowinstance: null,
            async launch() {
                if (manifest.type == 'manual') { // This type of application is discouraged for sure but is the most powerful
                    let req = await fetch(`${location}/${manifest.handler}`)
                    let data = await req.text();
                    top!.window.eval(data);
                    // top!.window.eval(`loadingScript("${location}",)`)
                    // @ts-ignore
                    loadingScript(location, app);
                } else {
                    // if (this.windowinstance) return;
                    let win = AliceWM.create(this.manifest.wininfo);
                    this.windowinstance = win;

                    let iframe = document.createElement("iframe");
                    iframe.setAttribute("style", "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;")
                    iframe.setAttribute("src", `${location}/${manifest.index}`);
                    win.content.appendChild(iframe);

                    (<any>iframe.contentWindow).anura = anura;
                    (<any>iframe.contentWindow).AliceWM = AliceWM;
                }
            },
        };

        launcher.addShortcut(manifest.name, manifest.icon ? `${location}/${manifest.icon}` : "", app.launch.bind(app), manifest.package);

        taskbar.addShortcut(`${location}/${manifest.icon}`, app.launch.bind(app), manifest.package);

        this.apps[manifest.package] = app;
        return app;
    }
    async python(appname: string) {
        return await new Promise((resolve, reject) => {
            let iframe = document.createElement("iframe")
            iframe.setAttribute("style", "display: none")
            iframe.setAttribute("src", "/apps/python.app/lib.html")
            iframe.id = appname
            iframe.onload = async function() {
                console.log("Called from python")
                //@ts-ignore
                let pythonInterpreter = await document.getElementById(appname).contentWindow.loadPyodide({
                    stdin: () => {
                        let result = prompt();
                        //@ts-ignore
                        echo(result);
                        return result;
                    },
                });
                pythonInterpreter.globals.set('AliceWM', AliceWM)
                pythonInterpreter.globals.set('anura', anura)
                //@ts-ignore
                pythonInterpreter.window = document.getElementById(appname).contentWindow;
                resolve(pythonInterpreter)
            }
            document.body.appendChild(iframe)
        })
    }
    notification = class {
        constructor(params: notifParams) {
            if (params) {
                if (params.title) {
                    this.title = params.title
                }
                if (params.description) {
                    this.description = params.description
                }
                if (params.timeout) {
                    this.timeout = params.timeout
                }
                if (params.callback) {
                    this.callback = this.callback
                }
                if (params.closeIndicator) {
                    this.closeIndicator = params.closeIndicator
                }
            }
        }
        title = "Anura Notification";
        description = "Anura Description";
        timeout = 2000;
        closeIndicator = false;
        callback() {
            return null;
        }
        async show() {
            let id = crypto.randomUUID()
            // initializing the elements
            let notifContainer = document.getElementsByClassName('notif-container')[0]
            let notif = document.createElement('div')
            notif.className = "notif"
            let notifBody = document.createElement('div')
            notifBody.className = "notif-body"
            let notifTitle = document.createElement('div')
            notifTitle.className = "notif-title"
            let notifDesc = document.createElement('div')
            notifDesc.className = "notif-description"
            if (this.closeIndicator) {
                let closeIndicator = document.createElement('div')
                closeIndicator.className = "notif-close-indicator"
                // temporary because im too lazy to make a span item properly, it's hardcoded so it's fine.
                closeIndicator.innerHTML = `<span class="material-symbols-outlined">close</span>`
                notif.appendChild(closeIndicator)
            }

            // assign relevant values
            notifTitle.innerText = this.title
            notifDesc.innerText = this.description
            notif.id = id

            let callback = this.callback
            notif.onclick = function() {
                deleteNotif()
                callback()
            }

            // adding the elements to the list
            notifBody.appendChild(notifTitle)
            notifBody.appendChild(notifDesc)
            notif.appendChild(notifBody)
            notifContainer?.appendChild(notif)

            // remove afyer period
            setTimeout(() => {
                deleteNotif()
            }, this.timeout);

            function deleteNotif() {
                const oldNotif = document.getElementById(id)!
                // do nothing if the notification is already deleted
                if (oldNotif == null) return; 
                oldNotif.style.opacity = "0"
                setTimeout(() => {
                    notifContainer?.removeChild(oldNotif)    
                }, 360);
            }
        }
    }
    get wsproxyURL() {
        let url = '';
        if (location.protocol == 'https:') {
            url += 'wss://'
        } else {
            url += 'ws://'
        }
        url += window.location.origin.split("://")[1]
        url += '/'
        return localStorage['wsproxy-url'] || url // let user define a systemwide wsproxy url to their prefered instance, fallback to obvious choice
    }
}

function openAppManager() {
    fetch("applicationmanager/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            window.eval(data);
        })
}

let anura: Anura;
const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash.element);

    await sleep(2000);
    anura = new Anura();
    (window as any).anura = anura;

    bootsplash.element.remove();
    anura.logger.debug("boot completed");
    document.dispatchEvent(new Event("anura-boot-completed"));
});

document.addEventListener("anura-boot-completed", async () => {
    // document.body.appendChild(oobeview.element);
    // oobeview.content.appendChild(oobewelcomestep.element);
    // oobewelcomestep.nextButton.addEventListener("click", () => {
    //     oobewelcomestep.element.remove();
    //     oobeview.content.appendChild(oobeassetsstep.element);
    //     oobeassetsstep.nextButton.addEventListener("click", () => {
    //         oobeview.element.remove();
    document.dispatchEvent(new Event("anura-login-completed"));
    //     });
    // });
});

document.addEventListener("anura-login-completed", async () => {
    anura.registerApp("apps/browser.app");
    anura.registerApp("apps/term.app");
    anura.registerApp("apps/glxgears.app");
    anura.registerApp("apps/eruda.app");
    anura.registerApp("apps/vnc.app");
    anura.registerApp("apps/sshy.app"); // ssh will be reworked later
    anura.registerApp("apps/fsapp.app");
    anura.registerApp("apps/chideNew.app");
    anura.registerApp("apps/python.app");
    anura.registerApp("apps/workstore.app");

    // Load all persistent sideloaded apps
    try {
        anura.fs.readdir("/userApps", (err: Error, files: string[]) => {
            // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
            if (files == undefined) return;
            files.forEach(file => {
                try {
                    anura.registerApp("/fs/userApps/" + file)
                } catch (e) {
                    anura.logger.error("Anura failed to load an app " + e)
                }
                
            })
        })
    } catch (e) {
        anura.logger.error(e)
    }

    // anura.registerApp("games.app");
    // if you want to use the games app, uncomment this, clone the repo in /apps 
    // and rename it to games.app
    // the games app is too large and unneccesary for ordinary developers

    if ((await (await (fetch('/fs/')))).status === 404) {

        let notif = new anura.notification({ title: "Anura Error", description: "Anura has encountered an error with the Filesystem HTTP bridge, click this notification to restart", timeout: 50000 })
        notif.callback = function() {
            window.location.reload()
            return null;
        }
        notif.show()
    }




    // v86 stable. can enable it by default now
    let mgr = await anura.registerApp("apps/x86mgr.app");
    await mgr?.launch();


    let finp: HTMLInputElement = React.createElement("input", { type: "file", id: "input" }) as unknown as HTMLInputElement;
    document.body.appendChild(finp);

    anura.x86 = await InitV86Backend();

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(launcher.clickoffChecker);
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

    // This feels wrong but it works and makes TSC happy
    launcher.clickoffChecker?.addEventListener('click', () => {
        launcher.toggleVisible();
    });

});
function catBufs(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}
function dbg(ref: object) {
    let name = Object.keys(ref)[0]!;
    dg[name] = name;
}
