interface notifParams {
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
    initComplete = false;
    x86: null | V86Backend;
    settings: Settings;
    fs: FilerFS;
    private constructor(fs: FilerFS, settings: Settings) {
        this.fs = fs;
        this.settings = settings;

        {
            let notif = document.createElement('div')
            notif.className = "notif-container"
            document.body.appendChild(notif)
        }
    }

    static async new(): Promise<Anura> {


        // File System Initialization //
        let fs = new Filer.FileSystem({
            name: "anura-mainContext",
            provider: new Filer.FileSystem.providers.IndexedDB()
        });

        // don't like this... but whatever 
        fs.readFileSync = async (path: string) => {
            return await new Promise((resolve, reject) => {
                return fs.readFile(path, function async(err: any, data: any) {
                    resolve(new TextDecoder('utf8').decode(data))
                })
            })
        }

        let settings = await Settings.new(fs);



        let anuraPartial = new Anura(fs, settings);
        return anuraPartial;
    }

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
                    if (this.windowinstance === null || this.windowinstance.parentElement === null || (this.manifest.wininfo && this.manifest.wininfo.allowMultipleInstance)) { //  checks if there is an existing minimized window 
                        // if (this.windowinstance) return;
                        let win = AliceWM.create(this.manifest.wininfo);

                        let iframe = document.createElement("iframe");
                        iframe.setAttribute("style", "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;")
                        iframe.setAttribute("src", `${location}/${manifest.index}`);
                        win.content.appendChild(iframe);
                        this.windowinstance = win.content.parentElement!;

                        (<any>iframe.contentWindow).anura = anura;
                        (<any>iframe.contentWindow).AliceWM = AliceWM;
                    } else {
                        this.windowinstance.style.display = ''
                    }

                }
            },
            icon: `${location}/${manifest.icon}`
        };

        launcher.addShortcut(manifest.name, manifest.icon ? `${location}/${manifest.icon}` : "", app.launch.bind(app), manifest.package);

        // taskbar.addShortcut(app.icon, app.launch.bind(app), manifest.package);

        this.apps[manifest.package] = app;

        if (this.initComplete)
            this.updateTaskbar()

        return app;
    }
    updateTaskbar() {
        taskbar.removeShortcuts();

        let orderedApps = anura.settings.get("applist");
        for (let appID in orderedApps) {
            const appName = orderedApps[appID]
            if (appName in this.apps) {
                let app = this.apps[appName]
                taskbar.addShortcut(app.icon, app.launch.bind(app), appName)
            }
        }
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
        return this.settings.get('wsproxy-url') || url // let user define a systemwide wsproxy url to their prefered instance, fallback to obvious choice
    }
}
