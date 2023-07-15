# Anura itself
This document has a brief explanation of all the anura APIs and how to use them

### anura.settings
used to set system settings in anura, its a key value store of JS objects.
Usage: \
```js
anura.settings.get("applist") // Get pinned apps in anura's taskbar
anura.settings.get("applist", ['anura.x86mgr', 'anura.browser']) // Set pinned apps in anura's taskbar in this order
```

### anura.x86 
Access to anura's x86 backend, used to create PTYs, write directly to serial terminals (not recommended) or access v86 itself
```js
anura.x86.emulator // Get v86 emulator object
anura.x86.openpty // Open a PTY terminal (see usage in sourcecode for terminal.app)
```

### anura.fs 
Access the anura's internal filesystem, loosely follows node filesystem spec, but is out of date from the spec, best you view usage at https://github.com/filerjs/filer

### anura.notifications 
Access the anura's notification service, useful if you need to display an alert to the usage 
```js
anura.notifications.add({
    title: "Test Notification", 
    description: `This is a test notification`, 
    callback: function() {console.log('hi')}
    timeout: 2000
}) // Show a notification to the user, on click, it says hi in console, it lasts for 2 seconds.
```

### anura.wsproxyURL
returns a usable wsproxy url for any TCP applications
```js
let webSocket = new WebSocket(anura.wsproxyURL + "alicesworld.tech:80", ['binary']); 
webSocket.onmessage = async (event) => {
    const text = await (await event.data).text()
    console.log(text)
}
webSocket.onopen = (event) => {
    webSocket.send('GET / HTTP/1.1\r\nHost: alicesworld.tech\r\n\r\n')
};
// Sends HTTP 1.1 request to alicesworld.tech using wsproxy
```

### anura.python
Creates a python interpreter to use for anura apps (based on Python 3.10.2)
```js
let interpreter = await anura.python()
interpreter.runPython("print('Hi')") // prints Hi in console 
```