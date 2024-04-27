# Application development

See [This Document](./templates/template.app/README.md) for instructions on how to set up a basic iFrame app.

# AnuraOS Apps

AnuraOS apps are simple creatures. They live inside folders with the suffix `.app` and the resources specific to each app are contained within that folder.

## Manifest

Each app contains a `manifest.json`, which defines the functionality of the app. See [`manifest.json.example`](./manifest.json.example).

-   `name`: `String` - Program name. Required.
-   `type`: `String` - Program type. "auto" or "manual". Required.

*   "manual": Evaluates at top-window level. Highly discouraged.
*   "auto": Evaluates within a contained iframe.

-   `package`: `String` - Package name (structured class-like, `organization.programname`). Required.
-   `index`: `String` - Path (from app directory) to the index HTML file. Required if `type` is `"auto"` - the iframe source will be set to this.
-   `icon`: `String` - Path (from app directory) to the application's icon. Optional but highly recommended. Anura will display this icon throughout the DE.
-   `background`: Background color of iframe while it is loading. Optional.
-   `handler`: `String` - Path (from app directory) to a file containing JavaScript to execute at the top-level document. Required if `type` is `"manual"`, ignored otherwise - the top-level document will execute this file as JavaScript.
-   `wininfo`: `Object {title, width, height, resizable}` - Required if `type` is `"auto"`.

*   `wininfo.title`: `String` - The title of the program. Defaults to "". Optional.
*   `wininfo.width`: `String` - The default width, in pixels, of the program. Defaults to "1000px". Optional.
*   `wininfo.height`: `String` - The default height, in pixels, of the program. Defaults to "500px". Optional.
*   `wininfo.resizable`: `Boolean` - Allow users to resize the window for your application. Defaults to `true`. Optional.

## Including Dreamland

dreamland.js is a reactive JSX-inspired rendering library with no virtual dom and no build step. You can find the source code [here](https://github.com/MercuryWorkshop/dreamlandjs) and the documentation [here](https://dreamland.js.org/).

AnuraOS itself uses dreamland for the desktop environment, and you can use it in your apps as well. To include dreamland in your app, you can add the following to the `head` section of your `index.html` file:

```html
<script src="/libs/dreamland/all.js"></script>
```

While dreamland itself includes a `$store` function for preserving state between page reloads, this function is not available by default. Instead, you can use the [`anura.persistence`](#libpersist) library to build a `$store` function bound to your app instance.

```jsx
const { buildLoader } = await anura.import("anura.persistence");
const loader = buildLoader(anura);
await loader.locate();

const persistence = await loader.build(instance);
const $store = persistence.createStoreFn(stateful, instanceWindow);

let persistentState = await $store(
    {
        count: 0,
    },
    "state",
);

let externalState = $state({
    count: 0,
});

function App() {
    return (
        <div>
            <button
                on:click={() => {
                    persistentState.count++;
                    externalState.count++;
                }}
            >
                Increment
            </button>
            <div>Persistent: {use(persistentState.count)}</div>
            <div>Session: {use(externalState.count)}</div>
        </div>
    );
}

document.body.appendChild(<App />);
```

A demo app using dreamland can be found [here](/apps/dreamlanddemo.app/index.js). This app is the same as the `$store` example above, but using the `html` tag function instead of JSX to demonstrate that dreamland can be used without a build step.

# AnuraOS Libraries

AnuraOS libraries are just like apps but contain utilities or functionality that other apps could import and use. They live inside folders with the suffix `.lib` and the resources specific to each app are contained within that folder.

## Manifest

-   You write a library that consists of a `manifest.json` file and an ES module. An example of the manifest file is below.
    ```json
    {
        "name": "Example Library",
        "icon": "libtest.png",
        "package": "anura.examplelib",
        "versions": {
            "0.0.1": "deprecated/0.0.1/index.js",
            "1.0.0": "index.js"
        },
        "installHook": "install.js",
        "currentVersion": "1.0.0"
    }
    ```
    -   `name` is the name of the library.
    -   `icon` is the icon of the library (for use in Marketplace).
    -   `package` is the package name of the library.
    -   `versions` is a map of version numbers to entry points.
    -   `installHook` is a file that is run when the library is installed. It should have a default export that is a function that takes the anura instance as an argument.
    -   `currentVersion` is the current version of the library, which will be used as the default version when using the [`anura.import`](./Anura-API.md#anuraimport) api.

## Usage

-   Libraries can be imported using the [`anura.import`](./Anura-API.md#anuraimport) api. This api takes the package id of the library and an optional version number. The version number is specified by appending `@<version>` to the package id. If no version is specified, the current version of the library is used.

```js
anura.import("anura.examplelib@1.0.0").then((lib) => {
    // Do stuff with the library.
});
```

```js
let lib = await anura.import("anura.examplelib");
// Do stuff with the library.
```

# System Libraries

Anura has a assortment of preinstalled system libraries to streamline the developer experience. This part of the documentation outlines how to use them in your application using the [`anura.import`](./Anura-API.md#anuraimport) api.

## libbrowser

This library allows you to interact with Anura's browser. Instead of using `window.open` in your anura apps, using this API will ensure that the webpage will open up in the Anura Browser.

Usage:

```js
const browser = await anura.import("anura.libbrowser");

browser.openTab("https://google.com/");
```

## libfilepicker

This library allows you to select files from inside of anura's filesystem. It returns a path and supports both files and folders.

```js
let picker = await anura.import("anura.filepicker");
// select file of any type
let file = await picker.selectFile();
// regex supported
let fileWithFilter = await picker.selectFile(
    "(png|jpe?g|gif|bmp|webp|tiff|svg|ico)",
);
// select folder
let folder = await picker.selectFolder();
```

## libpersist

This library allows you to create and manage persistent data stores. It uses the anura filesystem to store data.

The default storage backend uses the same format as the [`anura.settings`](./Anura-API.md#anurasettings) api, except that it is stored in a file related to the app's data directory instead of in the root settings file. The persistence library also has the ability to be turned into a proxy object that will automatically save changes to the persistence store.

```js
let persist = await anura.import("anura.persistence");
let loader = persist.buildLoader(anura);
await loader.locate();
// instance is a global variable in external apps that contains the app's instance
let persistence = await loader.build(instance);

// set a value
await persistence.set("key", "value");

// get a value
let value = await persistence.get("key");

// Create a proxy that will automatically save changes to the persistence store
let proxy = persistence.toProxy();

// set a value
// Notice that setting a value on an object is not an async operation, but the value will be
// saved to the persistence store asynchronously. This can cause issues if you are trying to
// read the value immediately after setting it. If you need to read the value immediately
// after setting it, you should avoid using the proxy and use the `set` method instead.
proxy.key = "value";

// get a value
// Here the value returned is a promise, so you need to use `await` or `.then` to get the value.
let value = await proxy.key;
```
