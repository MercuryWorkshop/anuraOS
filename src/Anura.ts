class Anura {
    version = {
        semantic: {
            major: "2",
            minor: "0",
            patch: "0",
        },
        buildstate: "alpha",
        codename: "UNNAMED",
        get pretty() {
            const semantic = anura.version.semantic;
            return `${semantic.major}.${semantic.minor}.${semantic.patch} ${anura.version.buildstate}`;
        },
    };
    initComplete = false;
    x86: null | V86Backend;
    settings: Settings;
    fs: AnuraFilesystem;
    config: any;
    notifications: NotificationService;
    x86hdd: FakeFile;
    net: Networking;
    ui = new AnuraUI();
    dialog: Dialog;

    private constructor(
        fs: AnuraFilesystem,
        settings: Settings,
        config: any,
        hdd: FakeFile,
        net: Networking,
    ) {
        this.fs = fs;
        this.settings = settings;
        this.config = config;
        this.x86hdd = hdd;
        this.net = net;

        this.notifications = new NotificationService();
        document.body.appendChild(this.notifications.element);
    }

    static async new(config: any): Promise<Anura> {
        // File System Initialization //
        const filerProvider = new FilerAFSProvider(
            new Filer.FileSystem({
                name: "anura-mainContext",
                provider: new Filer.FileSystem.providers.IndexedDB(),
            }),
        );

        const fs = new AnuraFilesystem([filerProvider]);

        const settings = await Settings.new(fs, config.defaultsettings);

        const hdd = await InitV86Hdd();

        const net = new Networking(settings.get("wisp-url"));
        const anuraPartial = new Anura(fs, settings, config, hdd, net);
        return anuraPartial;
    }

    wm = new WMAPI();

    apps: any = {};
    libs: any = {};
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

        if (this.initComplete) {
            taskbar.updateTaskbar();
            alttab.update();
        }
        return app;
    }
    async registerExternalApp(source: string): Promise<ExternalApp> {
        const resp = await fetch(`${source}/manifest.json`);
        const manifest = (await resp.json()) as AppManifest;
        if (manifest.type === "auto" || manifest.type === "manual") {
            const app = new ExternalApp(manifest, source);
            await anura.registerApp(app); // This will let us capture error messages
            return app;
        }
        const handlers = anura.settings.get("ExternalAppHandlers");
        if (!handlers || !handlers[manifest.type]) {
            const error = `Could not register external app from source: "${source}" because no external handlers are registered for type "${manifest.type}"`;
            anura.notifications.add({
                title: "AnuraOS",
                description: error,
            });
            throw error;
        }
        const handler = handlers[manifest.type];
        const handlerModule = await anura.import(handler);
        if (!handlerModule) {
            const error = `Failed to load external app handler ${handler}`;
            anura.notifications.add({
                title: "AnuraOS",
                description: error,
            });
            throw error;
        }
        if (!handlerModule.createApp) {
            const error = `Handler ${handler} does not have a createApp function`;
            anura.notifications.add({
                title: "AnuraOS",
                description: error,
            });
            throw error;
        }
        const app = handlerModule.createApp(manifest, source);
        await anura.registerApp(app); // This will let us capture error messages
        return app;
    }
    registerExternalAppHandler(id: string, handler: string) {
        const handlers = anura.settings.get("ExternalAppHandlers") || {};
        handlers[handler] = id;
        anura.settings.set("ExternalAppHandlers", handlers);
    }
    async registerLib(lib: Lib) {
        if (lib.package in this.libs) {
            throw "Library already installed";
        }
        this.libs[lib.package] = lib;
        return lib;
    }
    async registerExternalLib(source: string): Promise<ExternalLib> {
        const resp = await fetch(`${source}/manifest.json`);
        const manifest = await resp.json();
        const lib = new ExternalLib(manifest, source);
        await anura.registerLib(lib); // This will let us capture error messages
        return lib;
    }
    ContextMenu = ContextMenuAPI;
    removeStaleApps() {
        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            app.windows.forEach((win: any) => {
                if (!win.element.parentElement) {
                    app.windows.splice(app.windows.indexOf(win), 1);
                }
            });
        }
        taskbar.updateTaskbar();
        alttab.update();
    }
    async import(packageName: string, searchPath?: string) {
        if (searchPath) {
            // Using node-style module resolution
            let scope: string | null;
            let name: string;
            let filename: string;
            if (packageName.startsWith("@")) {
                const [_scope, _name, ...rest] = packageName.split("/");
                scope = _scope!;
                name = _name!;
                filename = rest.join("/");
            } else {
                const [_name, ...rest] = packageName.split("/");
                scope = null;
                name = _name!;
                filename = rest.join("/");
            }

            if (!filename || filename === "") {
                const data: any = await anura.fs.promises.readFile(
                    `${searchPath}/${scope}/${name}/package.json`,
                );
                const pkg = JSON.parse(data);
                console.log("pkg", pkg);
                if (pkg.main) {
                    filename = pkg.main;
                } else {
                    filename = "index.js";
                }
            }

            const file = await anura.fs.promises.readFile(
                `${searchPath}/${scope}/${name}/${filename}`,
            );
            const blob = new Blob([file], { type: "application/javascript" });
            const url = URL.createObjectURL(blob);
            return await import(url);
        }
        const splitName = packageName.split("@");
        const pkg: string = splitName[0]!;
        const version = splitName[1] || null;
        return await this.libs[pkg].getImport(version);
    }
    uri = new URIHandlerAPI();
    files = new FilesAPI();
    get wsproxyURL() {
        return this.settings.get("wisp-url");
    }
}

interface AppManifest {
    /**
     * The name of the app.
     */
    name: string;
    /**
     * The type of the app. This can be "manual" or "auto". If it is "manual", the app will be handled by the
     * handler specified in the handler field. If it is "auto", the app will be handled by the index file
     * specified in the index field. If the type is not "manual" or "auto", it will be handled by the anura
     * library specified in the type field.
     */
    type: "manual" | "auto" | string;
    /**
     * The package name of the app. This should be unique to the app and should be in reverse domain notation.
     * For example, if the app is called "My App" and is made by "My Company", the package name should be
     */
    package: string;
    /**
     * The index file for the app. This is the file that will be loaded when the app is launched when the app
     * is in auto mode.
     */
    index?: string;
    /**
     * The icon for the app. This should be a URL to an image file.
     */
    icon: string;
    /**
     * The handler for the app. This is the file that will be loaded when the app is launched when the app
     * is in manual mode.
     */
    handler?: string;
    /**
     * Whether or not the app should be hidden from the app list. This is useful for apps that are
     * only meant to be launched by other apps.
     */
    hidden?: boolean;
    /**
     * The background color of the element directly behind the app's window. This is optional and defaults
     * to the system theme's background color.
     */
    background?: string;
    /**
     * This contains the properties for the default app window.
     */
    wininfo: string | WindowInformation;
}
