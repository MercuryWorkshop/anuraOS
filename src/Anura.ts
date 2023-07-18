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
    async registerApp(app: App) {
        if (app.package in this.apps) {
            throw "Application already installed";
        }

        launcher.addShortcut(app);
        taskbar.addShortcut(app);

        this.apps[app.package] = app;

        if (this.initComplete) taskbar.updateTaskbar();
        return app;
    }
    async registerExternalApp(source: string): Promise<ExternalApp> {
        const resp = await fetch(`${source}/manifest.json`);
        const manifest = await resp.json();
        const app = new ExternalApp(manifest, source);
        anura.registerApp(app);
        return app;
    }
    ContextMenu = ContextMenuAPI;
    removeStaleApps() {
        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            app.windows.forEach((win: any) => {
                if (!win.element.parentElement) {
                    app.windows.splice(app.windows.indexOf(win));
                }
            });
        }
        taskbar.updateTaskbar();
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

interface App {
    open(): Promise<WMWindow | undefined>;
    icon: string;
    package: string;
    name: string;
    windows: WMWindow[];
}

interface AppManifest {
    name: string;
    type: "manual" | "auto";
    package: string;
    index?: string;
    icon: string;
    handler?: string;
    background?: string;
    wininfo: string | WindowInformation;
}
