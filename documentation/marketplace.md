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

### Repo manifest

This contains information about the repo.

- `name`: `String` – Repo name. Not strictly required but highly recommended.
- `maintainer` – Maintainer info.
  - `name`: `String` – Maintainer name
  - `email`: `String` – Maintainer email
  - `website`: `String` – Maintainer website
- `version`: `String` – Repo version.

```json
{
	"name": "Anura App Repository",
	"maintainer": {
		"name": "Mercury Workshop",
		"email": "support@mercurywork.shop",
		"website": "mercurywork.shop"
	},
	"version": "2.0.1"
}
```

### App list

This is a list with all the app manifests contained in a single json.

Example:

```json
{
  "apps": [
    {
      "name": "",
      "icon": "",
      "summary": "",
      "desc": "",
      "package": "",
      "data": "",
      "version": "",
      "category": ""
    },
    {
      "name": "",
      "icon": "",
      "summary": "",
      "desc": "",
      "package": "",
      "data": "",
      "version": "",
      "category": ""
    },
    <...>
  ]
}
```

### Manifest

Each app is supposed to have its own manifest that lists details about the app.

- `name`: `String` - Program name. Required.
- `icon`: `String` - Path (from app directory) to the application's icon. Optional but highly recommended. Marketplace will display this icon throughout the App.
- `summary`: `String` - Short program app description. Shown in the app preview. Required.
- `desc`: `String` - Long program app description. Shown in the app overview screen. Required.
- `package`: `String` - Package name (structured class-like, `organization.programname`). Required.
- `data`: `String` - Path (from app directory) to the archive containing the app data. Required.
- `installHook`: `String` - Path (from app directory) to the archive containing the app data. Only read if the program is an app. Optional.
- `screenshots`: `Array [{ path, desc }]` - Array of all the screenshots of an app. Optional.
- `screenshots.path`: `String` - Path (from app directory) to the screenshots. Required if object is present.
- `screenshots.desc`: `String` - Description of the screenshots. Optional.
- `version`: `String` - Version of the program. Optional.
- `dependencies`: `Array [ String ]` - Array of of all the dependencies of an app. Will be installed alongside your app. Optional.
- `category`: `String` - Program category. Required.

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

## Publishing

To make a repo accessible via the Store Library you can use the utility [create-anura-repo](https://github.com/MercuryWorkshop/create-anura-repo). It's as simple as running a command in your terminal.

```bash
$ npx create-anura-repo
```

After doing this you can add host the repo statically and be able to use it in libstore. Keep in mind you will have to rerun this command whenever a change is made to the repo as this takes all of your individual app manifests and packages it into `list.json` to make repos fast to resolve. Another thing to take note of is package identifiers. Your folder name for your apps and libraries should match the package identifier that is given to it as this is how the marketplace finds your

# libstore

## Initialization

To initialize the libstore library, call the `Store` constructor with a networking client. The client must have a `fetch` function that returns `Response` objects. You can also utilize libstore hooks that get initalized here.

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
	onDownloadStart: (appName, packageId) => {
		anura.notifications.add({
			title: "libstore",
			description: `libstore started downloading ${appName} (${packageId})`,
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

## Using your repo

After initializing your repo, there is somethings to keep in mind before using it.

### Repo Version

First, check if your repo is a legacy repo. you can do this by checking the `version` property of the StoreRepo that you get returned to you. If your repo returns `"legacy"`, this means that the repo does not have a manifest, which means that this repo is pre 2.0, which means that apps and libraries are identified by their names and not their package idenfitifers.

### Properties

#### repo.manifest: `Object | undefined`

This contains the manifest for the repo, this will only work on 2.0 repos and will be undefined for legacy repos.

### Functions

#### repo.refreshRepoCache

This method flushes the repo cache and refetches it. This does not return anything.

**Usage:**

```js
let button = document.createElement("button");
button.innerHTML = "Refresh";
button.addEventListener("click", () => {
	repo.refreshRepoCache();
});
```

#### repo.refreshThumbCache

This method flushes the the thumbnail cache. All new thumbnail fetches will add to the new cache.

**Usage:**

```js
let button = document.createElement("button");
button.innerHTML = "Refresh";
button.addEventListener("click", () => {
	repo.refreshRepoCache();
});
```

#### repo.getRepoManifest

This method fetches the repo manifest, and returns the repo version. The manifest is then set as repo.manifest. If the repo is legacy, this does method does not exist as legacy repos do not have a manifest. The repo manifest is already fetched at the start of a repo, which means this does not need to be rerun unless you need to fetch it again.

**Usage:**

```js
let version = await repo.getRepoManifest();
console.log(`Repo Version: ${version}`);
console.log("Repo Manifest: ", repo.manifest);
```

#### repo.getApps: `Object[]`

This method grabs all of the apps from the repo and returns all of them in an array.

```js
let apps = await repo.getApps();
apps.forEach((app) => {
	console.log("App Data: ", app);
});
```

#### repo.getApp: `Object`

This method grabs an app based on its package identifier if it is >=2.0 or takes in a package name if its legacy and then returns its app details in an object.

```js
let app = await repo.getApp("anura.ide");
console.log("App Data: ", app);
```

#### repo.installApp: `void`

This method installs an app based on its package identifier if it is >=2.0 or takes in a package name if its legacy.

```js
await repo.installApp("anura.ide");
```

#### repo.getAppThumb: `string | undefined`

This method grabs a app icon based on its package identifier if it is >=2.0 or takes in a package name if its legacy and then returns a blob url of the icon.

```js
let icon = await repo.getAppThumb("anura.ide");
let element = document.createElement("img");
element.src = icon;
document.body.appendChild(element);
```

#### repo.getLibs: `Object[]`

This method grabs all of the libraries from the repo and returns all of them in an array.

```js
let libs = await repo.getlibs();
libs.forEach((lib) => {
	console.log("Library Data: ", lib);
});
```

#### repo.getLib: `Object`

This method grabs an library based on its package identifier if it is >=2.0 or takes in a package name if its legacy and then returns its library details in an object.

```js
let lib = await repo.getlib("anura.flash.handler");
console.log("Library Data: ", lib);
```

#### repo.installLib: `void`

This method installs an library based on its package identifier if it is >=2.0 or takes in a package name if its legacy.

```js
await repo.installLib("anura.flash.handler");
```

#### repo.getLibThumb: `string | undefined`

This method grabs a library icon based on its package identifier if it is >=2.0 or takes in a package name if its legacy and then returns a blob url of the icon.

```js
let icon = await repo.getLibThumb("anura.flash.handler");
let element = document.createElement("img");
element.src = icon;
document.body.appendChild(element);
```
