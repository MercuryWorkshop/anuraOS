# The Anura Internal API

This document has a brief explanation of all the Anura JS APIs and how to use them.

## anura.settings

This API is used to define system settings in Anura, it is a key value store of JS objects.

### Functions

#### anura.settings.get: `string | undefined`

This api allows you to get a value in the key value store.

**Usage:**

```js
anura.settings.get("applist"); // Get pinned apps in anura's taskbar
```

#### anura.settings.set: `void`

This allows you to set a value in the key value store.

**Usage:**

```js
anura.settings.set("launcher-keybind", false); // Disables the launcher keybind.
```

## anura.import

This API is used to import libraries. These libraries are similar to apps and can be installed from the Marketplace or sideloaded through the File Manager.

**Usage:**

```js
const browser = await anura.import("anura.libbrowser");

browser.openTab("https://google.com/");
```

AnuraOS provides some preinstalled libraries to help streamline the development experience. This includes the browser library as shown above, along with the anura persistence library and the file picker.

You can find the documentation for the preinstalled libraries [here](./appdevt.md#system-libraries).

## anura.x86

This API provides access to Anura's x86 backend; Which is used to create PTYs, write directly to serial terminals (not recommended) or access v86 itself.

### Properties

#### anura.x86.emulator: `V86Emulator`

This is the v86 emulator object, you can find more documentation on it [here](https://github.com/copy/v86).

#### anura.x86.screen_container: `HTMLDivElement`

This is a element containing a canvas with the emulated v86 screen.

### Functions

#### anura.x86.openpty: `number`

This allows you to open a PTY and run commands inside of it. It returns the number of the PTY and is used in other interactions.

**Usage:**

```js
const pty = await anura.x86.openpty(
	"/bin/bash",
	screenSize.width,
	screenSize.height,
	(data) => {
		// callback gets called every time the PTY returns data
	},
);
```

#### anura.x86.writepty: `void`

This allows you to send data to a PTY. This data should be a string or converted to one.

**Usage:**

```js
const pty = await anura.x86.openpty(
	"/bin/bash",
	screenSize.width,
	screenSize.height,
	(data) => {
		console.log(data);
	},
);
anura.x86.writepty(pty, "Hello World!");
```

#### anura.x86.resizepty: `void`

This allows you to resize a PTY.

**Usage:**

```js
const pty = await anura.x86.openpty(
	"TERM=xterm DISPLAY=:0 bash",
	screenSize.width,
	screenSize.height,
	(data) => {
		console.log(data);
	},
);
anura.x86.resizepty(pty, screenSize.height, screenSize.width);
```

## anura.x86hdd

This api allows you to interact with the v86 virtual hard disk.

### Properties

#### anura.x86hdd.size: `number`

This is the size of the v86 hard disk in bytes.

### Functions

#### anura.x86hdd.loadfile: `void`

This allows you to load a image into the x86 hard disk.

**Usage:**

```js
// single file
const rootfs = await fetch(anura.config.x86[x86image].rootfs);
const blob = await rootfs.blob();
await anura.x86hdd.loadfile(blob);

// split into multiple files
const files = [];
let file_1 = await fetch(anura.config.x86[x86image].rootfs[0]);
files[0] = await file_1.blob();
let file_2 = await fetch(anura.config.x86[x86image].rootfs[1]);
files[1] = await file_2.blob();
await anura.x86hdd.loadfile(new Blob(files));
```

#### anura.x86hdd.delete: `void`

Deletes the x86 hard disk and refreshes the page. This is a destructive action!

**Usage:**

```js
console.log("deleting hard disk");
await anura.x86hdd.delete();
```

#### anura.x86hdd.resize: `void`

Resizes the x86 hard disk by adding empty bytes to the image. The

**Usage:**

```js
console.log("rezising hard disk")
anura.x86?.emulator.stop();
clearInterval(
    anura.x86?.saveinterval,
);
await anura.x86.resize(4294967296) // 4 GB
// make the os able to see the empty bytes
const emulator = new V86Starter(
    {
        wasm_path:
            "/lib/v86.wasm",
        memory_size:
            512 * 1024 * 1024,
        vga_memory_size:
            8 * 1024 * 1024,
        screen_container:
            anura.x86!
                .screen_container,

        initrd: {
            url: "/x86images/resizefs.img",
        },

        bzimage: {
            url: "/x86images/bzResize",
            async: false,
        },
        hda: {
            buffer: anura.x86hdd,
            async: true,
        },

        cmdline:
            "random.trust_cpu=on 8250.nr_uarts=10 spectre_v2=off pti=off",

        bios: {
            url: "/bios/seabios.bin",
        },
        vga_bios: {
            url: "/bios/vgabios.bin",
        },
        autostart: true,
        uart1: true,
        uart2: true,
    },
);
let s0data = "";
emulator.add_listener(
    "serial0-output-byte",
    async (byte: number) => {
        const char =
            String.fromCharCode(
                byte,
            );
        if (char === "\r") {
            anura.logger.debug(
                s0data,
            );

            if (
                s0data.includes(
                    "Finished Disk",
                )
            ) {
                await anura.x86hdd.save(
                    emulator,
                );
                this.state.resizing =
                    false;
                if (
                    document.getElementById(
                        "resize-disk-btn",
                    )
                ) {
                    document.getElementById(
                        "resize-disk-btn",
                    )!.innerText =
                        "Resize Disk";
                }
                confirm(
                    "Resized disk! Would you like to reload the page?",
                )
                    ? window.location.reload()
                    : null;
            }

            s0data = "";
            return;
        }
        s0data += char;
    },
);
```

#### anura.x86hdd.save: `void`

This allows you to save the v86 hard disk and sends a notification to the user.

**Usage:**

```js
console.log("saving hard disk");
await anura.x86hdd.save();
```

## anura.wm

### Properties

#### anura.wm.windows: `Array<WeakRef<WMWindow>>`

This is an array of WeakRefs that contain WMWindows that are in the anura wm.

### Functions

#### anura.wm.create: `WMWindow`

This api allows you to create a window that will be displayed in the DE.

**Usage:**

```js
let win = anura.wm.create(instance, {
	title: "Example Window",
	width: "1280px",
	height: "720px",
});

// do things with the window that gets returned
```

#### anura.wm.createGeneric: `WMWindow`

This is is the same as the `anura.wm.create` api but creates a window under the Generic App instance.

**Usage:**

```js
let win = anura.wm.createGeneric({
	title: "Example Window",
	width: "1280px",
	height: "720px",
});

// another use case
let win = anura.wm.createGeneric("Example Window");

// do stuff with the window that gets returned
```

## anura.logger

This API provides a logger for Anura, which just wraps the console object.

### Functions

#### Wrapper Functions

| Function             | Description           |
| -------------------- | --------------------- |
| `anura.logger.log`   | Wraps `console.log`   |
| `anura.logger.debug` | Wraps `console.debug` |
| `anura.logger.info`  | Wraps `console.info`  |
| `anura.logger.warn`  | Wraps `console.warn`  |
| `anura.logger.error` | Wraps `console.error` |

#### anura.logger.createStreams(prefix?: string): `{stdout: WritableStream, stderr: WritableStream}`

This function creates a pair of writable streams that processes can be piped to
for console output. The prefix argument is optional and will be prepended to all
log messages.

**Usage:**

```js
const { stdout, stderr } = anura.logger.createStreams("my-process: ");

const proc = await anura.processes.execute("/path/to/script.ajs");

proc.stdout.pipeTo(stdout);
proc.stderr.pipeTo(stderr);
```

## anura.net

This API provides access to Anura's networking backend, for routing your requests through a [Wisp](https://github.com/MercuryWorkshop/wisp-protocol) compatible backend using [libcurl.js](https://github.com/ading2210/libcurl.js).\

### Properties

#### anura.net.libcurl

This part of the api gives you full access to the libcurl.js APIs directly. You can learn more on how to use them [here](https://github.com/ading2210/libcurl.js?tab=readme-ov-file#javascript-api).

### Functions

#### anura.net.fetch: `Response`

This has the same functionality as the DOM fetch function. It returns a `Response` and takes in a URL with options or a Request object.

**Usage:**

```js
let response = await anura.net.fetch("https://anura.pro/MILESTONE");
console.log(await response.text());
```

### Constructors

#### anura.net.WebSocket: `WebSocket`

This has the same functionality as the built in DOM function and works identically as the regular `WebSocket` constructor.

**Usage:**

```js
let ws = new anura.net.WebSocket("wss://echo.websocket.in/");
ws.addEventListener("open", () => {
	console.log("ws connected!");
	ws.send("hello".repeat(128));
});
ws.addEventListener("message", (event) => {
	console.log(event.data);
});
```

## anura.fs

This API provides access the Anura's internal filesystem, loosely following the node filesystem spec(slightly out of date).

The best documentation on the usage of this API can probably be found [Here](https://github.com/filerjs/filer).

### Functions

#### anura.fs.installProvider: `void`

This function allows for the registration of virtual filesystems. These must extend the AFSProvider class and implement all of the filesystem methods. Here is an example for registering an instance of the built in LocalFS provider.

**Usage:**

```js
await anura.fs.promises.mkdir("/local-mnt");

const dirHandle = await window.showDirectoryPicker();
dirHandle.requestPermission({ mode: "readwrite" });

anura.fs.installProvider(new LocalFS(dirHandle, anuraPath));
```

## anura.files

This API provides access to Anura's file service, it is useful for handling the opening of files and setting file handlers.

### Functions

#### anura.files.open `void`

This method takes a file path and then opens this file using the file handler for the file, falling back to the default if it doesnt have a handler for it.

**Usage:**

```js
anura.files.open("/config_cached.json"); // uses file handler to open json
```

#### anura.files.getIcon: `string`

This method takes a path and returns an icon based on the file extension using a file handler.

**Usage:**

```js
anura.files.getIcon("/config_cached.json"); // returns icon for json
```

#### anura.files.getFileType: `string`

This method takes a path and returns a human readable file type based on the file extension using a file handler.

**Usage:**

```js
anura.files.getFileType("/config_cached.json"); // returns icon for json
```

#### anura.files.setModule: `void`

This method takes an anura library that has an `openFile` function that takes a `path`.

**Usage:**

```js
anura.files.setModule("anura.fileviewer", "png"); // set anura.fileviewer library as default handler for png
```

## anura.uri

This API provides access to Anura's URI handler. It is useful for handling the opening of URIs and setting URI handlers.

### Functions

#### anura.uri.handle: `void`

This method takes a URI and then opens this URI using the handlers that have been registered for it.

**Usage:**

```js
anura.uri.handle("https://google.com"); // opens google.com in the default browser
```

#### anura.uri.set: `void`

This method takes a protocol and a URIHandlerOptions interface and sets the handler for the protocol.

The URIHandlerOptions interface is defined in [URIHandler.ts](/src/api/URIHandler.ts)

**Usage:**

```js
anura.uri.set("https", {
    handler: {
        // Specifies that the handler is a library
        tag: "lib",
        // The package name of the library
        pkg: "anura.browser,
        // The (optional) version of the library
        version: "1.0.0",
        // The function to call in the library
        import: "openTab",
    },
    // The (optional) prefix to be prepended to the URI
    prefix: "https:",
});
```

#### anura.uri.remove: `void`

This method takes a protocol and removes the handler for the protocol.

**Usage:**

```js
anura.uri.remove("https");
```

#### anura.uri.has: `boolean`

This method takes a protocol and returns a boolean indicating if the protocol has a handler.

**Usage:**

```js
anura.uri.has("https"); // Should always return true because the browser registers itself as the handler for https automatically
```

## anura.notifications

This API provides access to Anura's notification service, useful if you need to display an alert to the user.

### Functions

#### anura.notifications.add: `void`

This api allows you to add a notification to the notification service and have a callback that executes along with it.

**Usage:**

```js
anura.notifications.add({
	title: "Test Notification",
	description: `This is a test notification`,
	callback: function () {
		console.log("hi");
	},
	timeout: 2000,
}); // Show a notification to the user, on click, it says hi in console, it lasts for 2 seconds.
```

<!--🫃🏿-->

## anura.processes

This API allows you to manage processes running in anura.

### Properties

#### anura.processes.procs

Returns a list of all the processes running in anura, as a dreamland stateful
array of WeakRefs to the processes.

Note: You should never directly mutate this array, use the provided APIs instead.

### Functions

#### anura.processes.remove: `void`

This API allows you to remove a process from the process list. This is usually ran as
the last function of a processes kill function.

**Usage:**

```js
function kill() {
	anura.processes.remove(this.pid);
}
```

#### anura.processes.register: `void`

This API allows you to register a process with the process list. This is usually ran
by the constructor of a process.

**Usage:**

```js
// SpecialProcess extends Process
const process = new SpecialProcess();

anura.processes.register(process);
```

#### anura.processes.create: `IframeProcess`

This API allows you to create a process from the given script and type.

**Usage:**

```js
anura.processes.create("print('Hello, ' + await readln())", "module");
```

#### anura.processes.execute: `IframeProcess`

This API allows you to execute a process from the given script file path

**Usage:**

```js
await anura.processes.execute("/path/to/script.ajs");
```

## anura.sw

This API provides a special process that wraps the anura service worker. This
process claims PID 0 and when it is killed, it will unregister the service worker
and reload the page.

## anura.anurad

This API provides a special process that wraps the anura daemon. This process claims PID 1 and manages all anura init scripts.

An example of an init script can be found in [this document](./templates/template.init.ajs)

Note: All anurad init scripts must have the `.init.ajs` extension, and contain a
shebang-like header like so:

```
#! {"lang":"module"}
```

### Properties

#### anura.anurad.initScripts: `IframeProcess[]`

This is an array of running init scripts, which are a special process type.
This array is not stateful and direct mutations are allowed.

### Functions

#### anura.anurad.addInitScript: `void`

This API allows you to add an init script to the anura daemon.

**Usage:**

```js
const script = `
export name = "example";
export description = "This is an example init script";

export start = async () => {
    console.log("Hello, World!");
};
`;

await anura.anurad.addInitScript(script);
```

### anura.anurad.kill: `void`

This function kills the anura daemon and all running init scripts.

**Usage:**

```js
anura.anurad.kill();
```

## anura.wsproxyURL

This API returns a usable wsproxy url for any TCP application.

**Usage:**

```js
let webSocket = new WebSocket(anura.wsproxyURL + "alicesworld.tech:80", [
	"binary",
]);

webSocket.onmessage = async (event) => {
	const text = await (await event.data).text();

	console.log(text);
};

webSocket.onopen = (event) => {
	webSocket.send("GET / HTTP/1.1\r\nHost: alicesworld.tech\r\n\r\n");
};

// Sends HTTP 1.1 request to alicesworld.tech using wsproxy
```

## anura.ContextMenu

This API creates a anura style context menu you can use in your apps.

**Usage:**

```js
const contextmenu = new anura.ContextMenu();
contextmenu.addItem("Log to console", function () {
	console.log("hello world!");
});
element.addEventListener("contextmenu", (e) => {
	e.preventDefault();
	const boundingRect = window.frameElement.getBoundingClientRect();
	contextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y);
	document.onclick = (e) => {
		document.onclick = null;
		contextmenu.hide();
		e.preventDefault();
	};
});
```

### Functions

#### anura.ContextMenu.addItem: `void`

This adds an item to the context menu item with a callback thats executed on selection of that menu item.

```js
const contextmenu = new anura.ContextMenu();
contextmenu.addItem("Log to console", function () {
	console.log("hello world!");
});
```

#### anura.ContextMenu.show: `void`

This makes the context menu visible to the user, it also takes arguments on where to place it on the page.

```js
const contextmenu = new anura.ContextMenu();
contextmenu.addItem("Log to console", function () {
	console.log("hello world!");
});
contextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y); // place context menu where the mouse is
```

#### anura.ContextMenu.hide: `void`

This hides the context menu from the user.

```js
const contextmenu = new anura.ContextMenu();
contextmenu.addItem("Log to console", function () {
	console.log("hello world!");
});
contextmenu.hide();
```

## anura.dialog

This API provides dialogs for Anura. For app developers, these should be used instead of using native browser dialogs to keep the user inside of the desktop environment and to make your app integrate better with Anura.

### Functions

#### anura.dialog.alert

This creates a alert dialog window.

**Usage:**

```js
anura.dialog.alert("Hello World!");
```

#### anura.dialog.confirm: `boolean`

This creates a dialog window that gives the user a prompt to confirm an action. This function returns a `boolean` you can use.

**Usage:**

```js
let confirm = await anura.dialog.confirm("Are you sure?");
if (confirm) {
	console.log("They were sure.");
}
```

#### anura.dialog.prompt: `string | null`

This gives a user a dialog prompt where the user can enter text. If the user decides to not input text and a default value exists, it returns that instead or returns null if none of those are met.

**Usage:**

```js
let input = await anura.dialog.prompt("What is your favorite number?");
if (input) {
	console.log(input);
}

// default value mode
let input = await anura.dialog.prompt("What is your favorite number?", "3");
if (input) {
	console.log(input);
}
```

#### anura.dialog.progress: `object`

This gives the user a dialog box showing the progress of a current applications activity. The message shown and the progress is returned to give the developer the option on what to show. When the progress on this dialog is greater than or equal to 1, the window will automatically close.

**Usage:**

```js
const dialog = anura.dialog.progress("Initializing...");
await sleep(100);
dialog.detail = "Stage One";
dialog.progress = 0.2;
await sleep(100);
dialog.detail = "Stage Two";
dialog.progress = 0.4;
await sleep(100);
dialog.detail = "Stage Three";
dialog.progress = 0.8;
await sleep(100);
dialog.detail = "Stage Four";
dialog.progress = 1;
```

## anura.systray

### Properties

#### anura.systray.element: `HTMLSpanElement`

This property contains the element that contains all of the

#### anura.systray.icons: `SystrayIcon[]`

This property contains alll of the icons in the systray in an array.

### Functions

#### anura.systray.create: `SystrayIcon`

This function allows you to create an object in the systray, you can pass in an icon and a tooltip to be rendered.

**Usage:**

```js
const sysicon = anura.systray.create({
	icon: "data:image/svg+xml;base64,BASE64ICON",
	tooltip: "Anura AdBlock Active",
});
sysicon.onclick = (event) => {
	console.log("got left click event");
};
sysicon.onrightclick = (event) => {
	console.log("got right click event");
};
```

## anura.platform

This API provides information about the platform that Anura is running on.

### Properties

#### anura.platform.type: `string`

This property returns the type of platform that Anura is running on. This can be one of the following values:

- `desktop` - Anura is running on a desktop.
- `mobile` - Anura is running on a mobile phone.
- `tablet` - Anura is running on a tablet.

#### anura.platform.touchInput: `boolean`

This property returns a boolean indicating whether the platform supports touch input.

## anura.ui.theme

### Functions

#### anura.ui.theme.css: `string`

Returns a CSS style you can append to your document's `head` to provide styles for your application:

**Example:**

```js
// Append theme css element (with dreamland)
document.head.appendChild(
	html`<><style data-id="anura-theme">${anura.ui.theme.css()}</style></>`,
);

// Append theme css element (without dreamland)
const style = document.createElement("style");
dataset.example.id = "anura-theme";
dataset.innerHTML = anura.ui.theme.css();
document.head.appendChild(style);

document.addEventListener("anura-theme-change", () => {
	document.head.querySelector('style[data-id="anura-theme"]').innerHTML =
		anura.ui.theme.css();
});
```

You now have the following CSS variables to use, corresponding to the properties listed below.

- `--theme-fg`
- `--theme-secondary-fg`
- `--theme-border`
- `--theme-dark-border`
- `--theme-bg`
- `--theme-secondary-bg`
- `--theme-dark-bg`
- `--theme-accent`

### Properties

#### anura.ui.theme.accent: `string`

The accent of the theme in hex.

#### anura.ui.theme.background: `string`

The background color of the theme in hex.

#### anura.ui.theme.darkBackground: `string`

The dark background color of the theme in hex.

#### anura.ui.theme.secondaryBackground: `string`

The secondary background color of the theme in hex.

#### anura.ui.theme.border: `string`

The border color of the theme in hex.

#### anura.ui.theme.darkBorder: `string`

The dark border color of the theme in hex.

#### anura.ui.theme.foreground: `string`

The foreground/text color of the theme in hex.

#### anura.ui.theme.secondaryForeground: `string`

The secondary foreground color of the theme in hex.
