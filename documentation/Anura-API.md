# The Anura Internal API

This document has a brief explanation of all the Anura JS APIs and how to use them

## anura.settings

This API is used to define system settings in Anura, it is a key value store of JS objects.

**Usage:**

```js
anura.settings.get("applist"); // Get pinned apps in anura's taskbar

anura.settings.get("applist", ["anura.x86mgr", "anura.browser"]); // Set pinned apps in anura's taskbar in this order
```

## anura.x86

This API provides access to Anura's x86 backend; Which is used to create PTYs, write directly to serial terminals (not recommended) or access v86 itself.

**Usage:**

```js
anura.x86.emulator; // Get v86 emulator object

anura.x86.openpty; // Open a PTY terminal (see usage in sourcecode for terminal.app)
```

## anura.fs

This API provides access the Anura's internal filesystem, loosely following the node filesystem spec(slightly out of date).

The best documentation on the usage of this API can probably be found [Here](https://github.com/filerjs/filer).

## anura.notifications

This API provides access to Anura's notification service, useful if you need to display an alert to the user.

**Usage:**

```js

anura.notifications.add({

title: "Test Notification",

description: `This is a test notification`,

callback: function() {console.log('hi')}

timeout: 2000

}) // Show a notification to the user, on click, it says hi in console, it lasts for 2 seconds.

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
