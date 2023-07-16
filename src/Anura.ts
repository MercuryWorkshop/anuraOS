class Anura {
    initComplete = false;
    x86: null | V86Backend;
    settings: Settings;
    fs: FilerFS;
    notifications: NotificationService;

    private constructor(fs: FilerFS, settings: Settings) {
        this.fs = fs;
        this.settings = settings;

        this.notifications = new NotificationService();
        document.body.appendChild(this.notifications.element);
    }

    static async new(): Promise<Anura> {
        // File System Initialization //
        const fs = new Filer.FileSystem({
            name: "anura-mainContext",
            provider: new Filer.FileSystem.providers.IndexedDB(),
        });

        // don't like this... but whatever
        fs.readFileSync = async (path: string) => {
            return await new Promise((resolve, reject) => {
                return fs.readFile(path, function async(err: any, data: any) {
                    resolve(new TextDecoder("utf8").decode(data));
                });
            });
        };

        const settings = await Settings.new(fs);

        const anuraPartial = new Anura(fs, settings);
        return anuraPartial;
    }

    apps: any = {};
    Version = "0.2.0 alpha";
    logger = {
        log: console.log.bind(console, "anuraOS:"),
        debug: console.debug.bind(console, "anuraOS:"),
        warn: console.warn.bind(console, "anuraOS:"),
        error: console.error.bind(console, "anuraOS:"),
    };
    async registerApp(location: string) {
        const resp = await fetch(`${location}/manifest.json`);
        const manifest = await resp.json();

        if (manifest.package in anura.apps) {
            //  Application already registered
            throw "Application already installed";
        }

        const app = {
            name: manifest.name,
            location,
            manifest,
            windowinstance: [],
            async launch() {
                if (manifest.type == "manual") {
                    // This type of application is discouraged for sure but is the most powerful
                    const req = await fetch(`${location}/${manifest.handler}`);
                    const data = await req.text();
                    top!.window.eval(data);
                    // top!.window.eval(`loadingScript("${location}",)`)
                    // @ts-ignore
                    loadingScript(location, app);
                } else {
                    //  checks if there is an existing minimized window
                    // if (this.windowinstance) return;
                    const win = AliceWM.create(this.manifest.wininfo);

                    const iframe = document.createElement("iframe");
                    // CSS injection here but it's no big deal
                    const bg = manifest.background || "#202124";
                    iframe.setAttribute(
                        "style",
                        "top:0; left:0; bottom:0; right:0; width:100%; height:100%; " +
                            `border: none; margin: 0; padding: 0; background-color: ${bg};`,
                    );
                    iframe.setAttribute("src", `${location}/${manifest.index}`);
                    win.content.appendChild(iframe);

                    this.windowinstance.push(win.content.parentElement);

                    (<any>iframe.contentWindow).anura = anura;
                    (<any>iframe.contentWindow).AliceWM = AliceWM;
                }
                taskbar.updateTaskbarPartial();
            },
            icon: `${location}/${manifest.icon}`,
        };

        launcher.addShortcut(
            manifest.name,
            manifest.icon ? `${location}/${manifest.icon}` : "",
            app.launch.bind(app),
            manifest.package,
        );

        // taskbar.addShortcut(app.icon, app.launch.bind(app), manifest.package);

        this.apps[manifest.package] = app;

        if (this.initComplete) taskbar.updateTaskbar();

        return app;
    }
    removeStaleApps() {
        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            app.windowinstance.forEach((element: any) => {
                if (!element.parentElement) {
                    app.windowinstance.splice(
                        app.windowinstance.indexOf(element),
                    );
                }
            });
        }
        taskbar.updateTaskbarPartial();
    }
    async python(appname: string) {
        return await new Promise((resolve, reject) => {
            const iframe = document.createElement("iframe");
            iframe.setAttribute("style", "display: none");
            iframe.setAttribute("src", "/apps/python.app/lib.html");
            iframe.id = appname;
            iframe.onload = async function () {
                console.log("Called from python");
                //@ts-ignore
                const pythonInterpreter = await document
                    //@ts-ignore
                    .getElementById(appname)
                    //@ts-ignore
                    .contentWindow.loadPyodide({
                        stdin: () => {
                            const result = prompt();
                            //@ts-ignore
                            echo(result);
                            return result;
                        },
                    });
                pythonInterpreter.globals.set("AliceWM", AliceWM);
                pythonInterpreter.globals.set("anura", anura);
                //@ts-ignore
                pythonInterpreter.window = (<any>(
                    document.getElementById(appname)
                )).contentWindow;
                resolve(pythonInterpreter);
            };
            document.body.appendChild(iframe);
        });
    }
    get wsproxyURL() {
        let url = "";
        if (location.protocol == "https:") {
            url += "wss://";
        } else {
            url += "ws://";
        }
        url += window.location.origin.split("://")[1];
        url += "/";
        return this.settings.get("wsproxy-url") || url; // let user define a systemwide wsproxy url to their prefered instance, fallback to obvious choice
    }
}
