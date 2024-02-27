# The Anura Internal API

This document has a brief explanation of all the Anura JS APIs and how to use them

## anura.settings

This API is used to define system settings in Anura, it is a key value store of JS objects.

**Usage:**

```js
anura.settings.get("applist"); // Get pinned apps in anura's taskbar

anura.settings.get("applist", ["anura.x86mgr", "anura.browser"]); // Set pinned apps in anura's taskbar in this order
```

## anura.import

This API is used to import libraries. These libraries are similar to apps and can be installed from the Marketplace or sideloaded through the File Manager.

This can be used like so:

```js
const browser = await anura.import("anura.libbrowser");

browser.openTab("https://google.com/");
```

AnuraOS provides some preinstalled libraries to help streamline the development experience. This includes the browser library as shown above, along with the anura persistence library and the file picker.

<!-- TODO: Document some preinstalled libraries here -->

## anura.x86

This API provides access to Anura's x86 backend; Which is used to create PTYs, write directly to serial terminals (not recommended) or access v86 itself.

**Usage:**

```js
anura.x86.emulator; // Get v86 emulator object
```

### anura.x86.openpty

This allows you to open a PTY and run commands inside of it. It returns the number of the PTY and is used in other interactions.

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

## anura.wm

### anura.wm.create

This api allows you to create a window that will be displayed in the DE.

Usage

```js
let win = anura.wm.create(instance, {
    title: "Example Window",
    width: "1280px",
    height: "720px",
});

// do things with the window that gets returned
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

```js
await anura.fs.promises.mkdir("/local-mnt");

const dirHandle = await window.showDirectoryPicker();
dirHandle.requestPermission({ mode: "readwrite" });

anura.fs.installProvider(new LocalFS(dirHandle, anuraPath));
```

## anura.notifications

This API provides access to Anura's notification service, useful if you need to display an alert to the user.

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

## anura.python

This API creates a python interpreter for use in Anura apps (based on Python 3.10.2).

**Usage:**

```js
let interpreter = await anura.python();

interpreter.runPython("print('Hi')"); // prints Hi in console
```
