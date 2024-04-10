# The Anura Internal API

This document has a brief explanation of all the Anura JS APIs and how to use them

## anura.settings

This API is used to define system settings in Anura, it is a key value store of JS objects.

### anura.settings.get

This api allows you to get settings and change already defined settings values.

**Usage:**

```js
anura.settings.get("applist"); // Get pinned apps in anura's taskbar
```

### anura.settings.set

This allows you to set a settings value.

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

**Usage:**

```js
anura.x86.emulator; // Get v86 emulator object
```

### anura.x86.openpty

This allows you to open a PTY and run commands inside of it. It returns the number of the PTY and is used in other interactions.

**Usage:**

```js
const pty = await anura.x86.openpty(
    "TERM=xterm DISPLAY=:0 bash",
    screenSize.width,
    screenSize.height,
    (data) => {
        // callback gets called every time the PTY returns data
    },
);
```

### anura.x86.writepty

This allows you to send data to a PTY. This data should be a string or converted to one.

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
anura.x86.writepty(pty, "Hello World!");
```

### anura.x86.resizepty

This allows you to send resize a PTY.

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

### anura.x86hdd.size

This returns the size of the v86 hard disk in bytes.

**Usage:**

```js
console.log("v86 hard disk size: " + anura.x86hdd.size);
```

### anura.x86hdd.loadfile

This allows you to load a image into the x86 hard disk.

**Usage:**

```js
// single file
const rootfs = await fetch(anura.config.x86[x86image].rootfs);
const blob = await rootfs.blob();
await anura.x86hdd.loadfile(blob);

// split into multiple files
const files = [];
let file_1 = await fetch(anura.config.x86[x86image].rootfs["1"]);
files["1"] = await file_1.blob();
let file_2 = await fetch(anura.config.x86[x86image].rootfs["2"]);
files["2"] = await file_2.blob();
await anura.x86hdd.loadfile(new Blob(files));
```

### anura.x86hdd.delete

Deletes the x86 hard disk and refreshes the page. This is a destructive action!

**Usage:**

```js
console.log("deleting hard disk");
await anura.x86hdd.delete();
```

### anura.x86hdd.resize

Resizes the x86 hard disk by adding empty bytes to the image.

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
            url: "/images/resizefs.img",
        },

        bzimage: {
            url: "/images/bzResize",
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

### anura.x86hdd.save

This allows you to save the v86 hard disk and sends a notification to the user.

**Usage:**

```js
console.log("saving hard disk");
await anura.x86hdd.save();
```

## anura.wm

### anura.wm.create

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

### anura.wm.createGeneric

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

## anura.net

This API provides access to Anura's networking backend, for routing your requests through a [Wisp](https://github.com/MercuryWorkshop/wisp-protocol) compatible backend using [libcurl.js](https://github.com/ading2210/libcurl.js).

**Usage:**

```js
anura.net.fetch; // Same functionality as built in fetch function

anura.net.WebSocket; // Same functionality as built in WebSocket constructor
```

## anura.fs

This API provides access the Anura's internal filesystem, loosely following the node filesystem spec(slightly out of date).

The best documentation on the usage of this API can probably be found [Here](https://github.com/filerjs/filer).

The FS API also allows for the registration of virtual filesystems. These must extend the AFSProvider class and implement all of the filesystem methods. Here is an example for registering an instance of the built in LocalFS provider.

**Usage:**

```js
await anura.fs.promises.mkdir("/local-mnt");

const dirHandle = await window.showDirectoryPicker();
dirHandle.requestPermission({ mode: "readwrite" });

anura.fs.installProvider(new LocalFS(dirHandle, anuraPath));
```

## anura.files

This API provides access to Anura's file service, it is useful for handling the opening of files and setting file handlers.

### anura.files.open

This method takes a file path and then opens this file using the file handler for the file, falling back to the default if it doesnt have a handler for it.

**Usage:**

```js
anura.files.open("/config_cached.json"); // uses file handler to open json
```

### anura.files.getIcon

This method takes a path and returns an icon based on the file extension using a file handler.

**Usage:**

```js
anura.files.getIcon("/config_cached.json"); // returns icon for json
```

### anura.files.getFileType

This method takes a path and returns a human readable file type based on the file extension using a file handler.

**Usage:**

```js
anura.files.getFileType("/config_cached.json"); // returns icon for json
```

### anura.files.setModule

This method takes an anura library that has an `openFile` function that takes a `path`.

**Usage:**

```js
anura.files.setModule("anura.fileviewer", "png"); // set anura.fileviewer library as default handler for png
```

## anura.uri

This API provides access to Anura's URI handler. It is useful for handling the opening of URIs and setting URI handlers.

### anura.uri.handle

This method takes a URI and then opens this URI using the handlers that have been registered for it.

**Usage:**

```js
anura.uri.handle("https://google.com"); // opens google.com in the default browser
```

### anura.uri.set

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

### anura.uri.remove

This method takes a protocol and removes the handler for the protocol.

**Usage:**

```js
anura.uri.remove("https");
```

### anura.uri.has

This method takes a protocol and returns a boolean indicating if the protocol has a handler.

**Usage:**

```js
anura.uri.has("https"); // Should always return true because the browser registers itself as the handler for https automatically
```

## anura.notifications

This API provides access to Anura's notification service, useful if you need to display an alert to the user.

### anura.notifications.add

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

### anura.ContextMenu.addItem

This adds an item to the context menu item with a callback thats executed on selection of that menu item.

```js
const contextmenu = new anura.ContextMenu();
contextmenu.addItem("Log to console", function () {
    console.log("hello world!");
});
```

### anura.ContextMenu.show

This makes the context menu visible to the user, it also takes arguments on where to place it on the page.

```js
const contextmenu = new anura.ContextMenu();
contextmenu.addItem("Log to console", function () {
    console.log("hello world!");
});
contextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y); // place context menu where the mouse is
```

### anura.ContextMenu.hide

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

### anura.dialog.alert

This creates a alert dialog window.

**Usage:**

```js
anura.dialog.alert("Hello World!");
```

### anura.dialog.confirm

This creates a dialog window that gives the user a prompt to confirm an action. This function returns a `boolean` you can use.

**Usage:**

```js
let confirm = await anura.dialog.confirm("Are you sure?");
if (confirm) {
    console.log("They were sure.");
}
```

### anura.dialog.prompt

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
