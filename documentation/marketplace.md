# Marketplace

## Repos

Marketplace repos are designed to be fully static.
An example of the directory structure can be seen here.

```
|-- apps
|   |-- anura.example
|   |   |-- app.zip
|   |   |-- manifest.json
|-- libs
|   |-- anura.examplelib
|   |   |-- lib.zip
|   |   |-- manifest.json
list.json
manifest.json
```

### Manifest

Each app is supposed to have its own manifest that lists details about the app.

-   `name`: `String` - Program name. Required.
-   `icon`: `String` - Path (from app directory) to the application's icon. Optional but highly recommended. Marketplace will display this icon throughout the App.
-   `summary`: `String` - Short program app description. Shown in the app preview. Required.
-   `desc`: `String` - Long program app description. Shown in the app overview screen. Required.
-   `package`: `String` - Package name (structured class-like, `organization.programname`). Required.
-   `data`: `String` - Path (from app directory) to the archive containing the app data. Required.
-   `installHook`: `String` - Path (from app directory) to the archive containing the app data. Only read if the program is an app. Optional.
-   `screenshots`: `Array [{ path, desc }]` - Array of all the screenshots of an app. Optional.
-   `screenshots.path`: `String` - Path (from app directory) to the screenshots. Required if object is present.
-   `screenshots.desc`: `String` - Description of the screenshots. Optional.
-   `version`: `String` - Version of the program. Used in the future for the anura update api. Optional.
-   `dependencies`: `Array [ String ]` - Array of all the screenshots of all the dependencies of an app. Will be installed alongside your app. Optional.
-   `category`: `String` - Program category. Required.

Here is an example of a manifest.json

```json
{
    "name": "Example app",
    "icon": "example.png",
    "summary": "(tiny app description)",
    "desc": "(longer app description)",
    "package": "anura.example",
    "data": "app.zip",
    "installHook": "install.js",
    "screenshots": [
        {
            "path": "screenshots/something.png",
            "desc": "(screenshot desc)"
        },
        {
            "path": "screenshots/something2.png",
            "desc": "(screenshot desc)"
        }
    ],
    "version": "1.0.0",
    "dependencies": ["(package identifier)"],
    "category": "game"
}
```

This is mostly the same for libraries, minus the `dependencies` and `installHook` sections.

### Publishing

To make a repo accessible via the Store Library you should use the utility [create-anura-repo](https://github.com/MercuryWorkshop/create-anura-repo). It is as simple as running a command in your terminal.

```bash
$ npx create-anura-repo
```

After doing this you can add host the repo statically and be able to use it in libstore.

# libstore

## Initialization

To initialize the libstore library, call the `Store` constructor with a networking client. The client must have a fetch function that returns `Response` objects.

**Usage:**

```js
let libstore = await anura.import("anura.libstore@2.0.0");

marketplace = new libstore.Store(anura.net, {
    onError: (appName, error) => {
        anura.notifications.add({
            title: "libstore",
            description: `libstore encountered an error while installing ${appName}: ${error}`,
            timeout: 5000,
        });
    },
    onDownloadStart: (appName) => {
        anura.notifications.add({
            title: "libstore",
            description: `libstore started downloading ${appName}`,
            timeout: 5000,
        });
    },
    onDepInstallStart: (appName, libName) => {
        anura.notifications.add({
            title: "libstore",
            description: `libstore started installing dependency ${libName} for ${appName}`,
            timeout: 5000,
        });
    },
    onComplete: (appName) => {
        anura.notifications.add({
            title: "libstore",
            description: `libstore finished installing ${appName}`,
            timeout: 5000,
        });
    },
});
```

## Adding a repo

To fetch a repo and its contents use the `getRepo` method. This method will return a `StoreRepo` or a `StoreRepoLegacy` Object. The repo url must end with a trailing slash.

**Usage:**

```js
const marketplaceRepo = await marketplace.getRepo(
    "Anura App Repository",
    "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/",
);
```
