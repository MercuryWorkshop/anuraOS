/**
 * The main Anura runtime object. Every public Anura API hangs off an instance
 * of this class.
 *
 * The constructor is private — instances are created internally by
 * {@link Anura.new} and exposed to the rest of the system as the global
 * `anura` variable.
 */
class Anura {
	version = {
		semantic: {
			major: "2",
			minor: "2",
			patch: "0",
		},
		buildstate: "alpha",
		codename: "unknown",
		get pretty() {
			const semantic = anura.version.semantic;
			return `${semantic.major}.${semantic.minor}.${semantic.patch}${anura.version.buildstate == "stable" ? "" : `-${anura.version.buildstate}`}`;
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
	platform: Platform;
	ui = new AnuraUI();
	processes: Processes;
	dialog: Dialog;
	sw: SWProcess;
	anurad: Anurad;
	systray: Systray;
	uri = new URIHandlerAPI();
	files = new FilesAPI();
	wm = new WMAPI();
	ContextMenu = ContextMenu;

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
		this.processes = new Processes();
		this.platform = new Platform(this);
		document.body.appendChild(this.notifications.element);
	}

	static async new(config: any): Promise<Anura> {
		// File System Initialization //
		let fsProvider = new FilerAFSProvider(
			new Filer.FileSystem({
				name: "anura-mainContext",
				provider: new Filer.FileSystem.providers.IndexedDB(),
			}),
		);
		if (await (window as any).idbKeyval.get("bootFromOPFS")) {
			fsProvider = (await LocalFS.newRootOPFS()) as any;
		}
		const fs = new AnuraFilesystem([fsProvider]);

		const settings = await Settings.new(fs, config.defaultsettings);

		const hdd = await InitV86Hdd();

		const net = new Networking(settings.get("wisp-url"));
		const anuraPartial = new Anura(fs, settings, config, hdd, net);
		return anuraPartial;
	}

	apps: any = {};
	libs: any = {};
	/**
	 * Anura's logger. Wraps the console object and provides a way to create
	 * stdio streams that pipe to the dev console.
	 *
	 * Available globally as `anura.logger`.
	 *
	 * | Function             | Description           |
	 * | -------------------- | --------------------- |
	 * | `anura.logger.log`   | Wraps `console.log`   |
	 * | `anura.logger.debug` | Wraps `console.debug` |
	 * | `anura.logger.info`  | Wraps `console.info`  |
	 * | `anura.logger.warn`  | Wraps `console.warn`  |
	 * | `anura.logger.error` | Wraps `console.error` |
	 *
	 * @example
	 * ```js
	 * const { stdout, stderr } = anura.logger.createStreams("my-process: ");
	 *
	 * const proc = await anura.processes.execute("/path/to/script.ajs");
	 *
	 * proc.stdout.pipeTo(stdout);
	 * proc.stderr.pipeTo(stderr);
	 * ```
	 */
	logger = {
		log: console.log.bind(console, "anuraOS:"),
		debug: console.debug.bind(console, "anuraOS:"),
		info: console.info.bind(console, "anuraOS:"),
		warn: console.warn.bind(console, "anuraOS:"),
		error: console.error.bind(console, "anuraOS:"),

		// Create a set of streams for stdio to pipe to, useful for debugging
		createStreams: (prefix?: string) => {
			const de = new TextEncoder();

			return {
				stdout: new WritableStream({
					write: (message) => {
						if (typeof message !== "string") {
							message = new TextDecoder().decode(message);
						}
						console.log(`anuraOS: ${prefix ? `[${prefix}] ` : ""}${message}`);
					},
				}),

				stderr: new WritableStream({
					write: (message) => {
						if (typeof message !== "string") {
							message = new TextDecoder().decode(message);
						}
						console.error(`anuraOS: ${prefix ? `[${prefix}] ` : ""}${message}`);
					},
				}),
			};
		},
	};
	async registerApp(app: App) {
		if (app.package in this.apps) {
			throw "Application already installed";
		}

		launcher.addShortcut(app);

		this.apps[app.package] = app;

		if (this.initComplete) {
			taskbar.updateTaskbar();
			alttab.update();
		}
		return app;
	}
	async registerExternalApp(
		source: string,
	): Promise<ExternalApp | ShortcutApp> {
		try {
			const shortcut = await fetch(source);
			if (shortcut.status === 200) {
				const shortcutData = await shortcut.json();
				if (shortcutData instanceof Array) {
					throw null;
				}

				const app = new ShortcutApp(
					new URL(source, location.href).href,
					shortcutData,
				);

				await anura.registerApp(app); // This will let us capture error messages

				return app;
			}
		} catch (_) {
			// Ignore errors, its not a shortcut
		}

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
	/**
	 * Import a library into the current scope. Libraries are similar to apps
	 * and can be installed from the Marketplace, sideloaded through the File
	 * Manager, or registered programmatically.
	 *
	 * If `searchPath` is supplied, node-style module resolution is used to
	 * load the package from the Anura filesystem under that path.
	 * Otherwise the package is resolved from the registered Anura libs
	 * (`anura.libs`).
	 *
	 * @param packageName - The library's package name. May optionally include
	 *   a version suffix like `pkg@1.0.0`.
	 * @param searchPath - Optional. Filesystem path to use as the npm-style
	 *   `node_modules` root for resolving the package.
	 * @returns The library's exported module.
	 *
	 * @example
	 * ```js
	 * const browser = await anura.import("anura.libbrowser");
	 *
	 * browser.openTab("https://google.com/");
	 * ```
	 */
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
				if (pkg.main) {
					filename = pkg.main;
				} else {
					filename = "index.js";
				}
			}

			const file = await anura.fs.promises.readFile(
				`${searchPath}/${scope}/${name}/${filename}`,
			);
			const blob = new Blob([file as any], {
				type: "application/javascript",
			});
			const url = URL.createObjectURL(blob);
			return await import(url);
		}
		const splitName = packageName.split("@");
		const pkg: string = splitName[0]!;
		const version = splitName[1] || null;
		return await this.libs[pkg].getImport(version);
	}
	/**
	 * A usable wsproxy URL for any TCP application — this is the URL of the
	 * currently configured Wisp server.
	 *
	 * @example
	 * ```js
	 * let webSocket = new WebSocket(anura.wsproxyURL + "alicesworld.tech:80", [
	 *     "binary",
	 * ]);
	 *
	 * webSocket.onmessage = async (event) => {
	 *     const text = await (await event.data).text();
	 *     console.log(text);
	 * };
	 *
	 * webSocket.onopen = (event) => {
	 *     webSocket.send("GET / HTTP/1.1\r\nHost: alicesworld.tech\r\n\r\n");
	 * };
	 * ```
	 */
	get wsproxyURL() {
		return this.settings.get("wisp-url");
	}
}

/**
 * A special process that wraps the Anura service worker.
 *
 * Available globally as `anura.sw`. This process claims PID 0 — when it is
 * killed, it unregisters the service worker and reloads the page.
 */
class SWProcess extends Process {
	pid = 0;
	title = "Service Worker";

	constructor() {
		super();
		this.stdin = new WritableStream({
			write: (message) => {
				navigator.serviceWorker.controller!.postMessage(
					{
						type: "stdin",
						message,
					},
					[message],
				);
			},
		});
		this.stdout = new ReadableStream({
			start: (controller) => {
				navigator.serviceWorker.addEventListener("message", (event) => {
					if (event.data.type === "stdout") {
						controller.enqueue(event.data.message);
					}
				});
			},
		});
		this.stderr = new ReadableStream({
			start: (controller) => {
				navigator.serviceWorker.addEventListener("message", (event) => {
					if (event.data.type === "stderr") {
						controller.enqueue(event.data.message);
					}
				});
			},
		});
	}

	kill() {
		navigator.serviceWorker.getRegistrations().then((registrations) => {
			for (const registration of registrations) {
				registration.unregister();
			}
		});
		super.kill();
		location.reload();
	}

	get alive() {
		return navigator.serviceWorker.controller !== null;
	}
}
