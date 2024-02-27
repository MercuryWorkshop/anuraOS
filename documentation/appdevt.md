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
