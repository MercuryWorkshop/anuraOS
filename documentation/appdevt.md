# The Hitchhiker's Guide to AnuraOS App Development

See [this document](./templates/template.app/README.md) for instructions on how to set up a basic iFrame app.

## AnuraOS Apps

AnuraOS apps are simple creatures. They live inside folders with the suffix `.app` and the resources specific to each app are contained within that folder.

### Manifest

Each app contains a `manifest.json`, which defines the functionality of the app. See [`manifest.json.example`](./manifest.json.example).

- `name`: `String` - Program name. Required.
- `type`: `String` - Program type. "auto" or "manual". Required.

* "manual": Evaluates at top-window level. Highly discouraged.
* "auto": Evaluates within a contained iframe.

- `package`: `String` - Package name (structured class-like, `organization.programname`). Required.
- `index`: `String` - Path (from app directory) to the index HTML file. Required if `type` is `"auto"` - the iframe source will be set to this.
- `icon`: `String` - Path (from app directory) to the application's icon. Optional but highly recommended. Anura will display this icon throughout the DE.
- `background`: Background color of iframe while it is loading. Optional.
- `handler`: `String` - Path (from app directory) to a file containing JavaScript to execute at the top-level document. Required if `type` is `"manual"`, ignored otherwise - the top-level document will execute this file as JavaScript.
- `useIdbWrapper`: `Boolean` - Use the IndexedDB wrapper, which prevents the app from making accidental modifications to other app's indexeddb stores or anura's own stores. Defaults to `false`. Optional.
- `wininfo`: `Object {title, width, height, resizable}` - Required if `type` is `"auto"`.
  - `wininfo.title`: `String` - The title of the program. Defaults to "". Optional.
  - `wininfo.width`: `String` - The default width, in pixels, of the program. Defaults to "1000px". Optional.
  - `wininfo.height`: `String` - The default height, in pixels, of the program. Defaults to "500px". Optional.
  - `wininfo.resizable`: `Boolean` - Allow users to resize the window for your application. Defaults to `true`. Optional.

### Tips and Tricks

- In iframed apps, Anura still gives you full access to the APIs through the `anura` object and also gives you access to your app instance and the Window in the Window Manager. You can access the WMWindow using `instanceWindow` and access your anura app instance using `instance` in your javascript. This could be used to manipulate the window or invoke actions on your app instance. An example is shown below where a back arrow is drawn on the window decorations in the marketplace app.

```js
const back = html`
	<button
		class=${["windowButton"]}
		style=${{
			width: "24px",
			height: "24px",
			display: use(state.showBackButton),
		}}
		on:mousedown=${(evt) => {
			evt.stopPropagation();
		}}
		on:click=${async () => {
			switch (state.currentScreen) {
				case "overview":
					state.currentScreen = "itemList";
					break;
				default:
					state.currentScreen = "repoList";
					break;
			}
		}}
	>
		<span
			class=${["material-symbols-outlined"]}
			style=${{
				fontSize: "16px",
				lineHeight: "24px",
			}}
		>
			arrow_back
		</span>
	</button>
`;

instanceWindow.content.style.position = "absolute";
instanceWindow.content.style.height = "100%";
const titlebar = Array.from(instanceWindow.element.children).filter((e) =>
	e.classList.contains("title"),
)[0];

titlebar.style.backgroundColor = "rgba(0, 0, 0, 0)";

titlebar.insertBefore(back, titlebar.children[1]);
```

- All Anura windows allow you to hook into their events. This can be achieved via a callback or a event listener. You can see this in action in the window managment api and in multiple system apps.

```js
let win = anura.wm.create(instance, {
    title: "Example Window",
    width: "1280px",
    height: "720px",
});
win.addEventListener("focus", (event) => {});

win.addEventListener("resize", (event) => {
    console.log(event.data.height);
    console.log(event.data.width);
});

win.addEventListener("close", (event) => {});

win.addEventListener("maximize", () => {});

win.addEventListener("unmaximize", () => {});

win.addEventListener("snap", (event) => {
    console.log(event.data.snappedDirection);
});

// Same things but callbacks instead
win.onfocus: () => void;
win.onresize: (width, height) => void;
win.onclose: () => void;
win.onmaximize: () => void;
win.onsnap: (snapDirection) => void;
win.onunmaximize: () => void;
```

- When an app is installed from the Marketplace or `libstore`, the current version and the repo that the app was downloaded from is injected into the manifest of your app. This could be used for update logic in your apps. An example is shown below of basic app updating logic, where it checks to see if libstore downloaded the app. If it did, then it checks if the version is the same on the repo it was downloaded from and updates if not.

```js
if (instance.manifest.marketplace) {
	let libstore = await anura.import("anura.libstore@2.0.0");

	marketplace = new libstore.Store(anura.net, {
		onError: (appName, error) => {
			anura.notifications.add({
				title: "Example Application",
				description: `Example Application encountered an error while updating.`,
				timeout: 5000,
			});
		},
		onDownloadStart: (appName) => {
			anura.notifications.add({
				title: "Example Application",
				description: `Example Application started downloading an update.`,
				timeout: 5000,
			});
		},
		onDepInstallStart: (appName, libName) => {
			anura.notifications.add({
				title: "Example Application",
				description: `Example Application started updating dependency ${libName}.`,
				timeout: 5000,
			});
		},
		onComplete: (appName) => {
			anura.notifications.add({
				title: "Example Application",
				description: `Example Application finished updating.`,
				timeout: 5000,
			});
		},
	});
	const marketplaceRepo = await marketplace.getRepo(
		"Update Repo",
		instance.manifest.marketplace.repo,
	);
	let repoApp;
	if (repo.version === "legacy") {
		repoApp = marketplaceRepo.getApp(instance.name);
	} else {
		repoApp = marketplaceRepo.getApp(instance.package);
	}
	if (instance.manifest.version !== repoApp.version) {
		repo.installApp(instance.package);
	}
}
```

## Including Dreamland

dreamland.js is a reactive JSX-inspired rendering library with no virtual dom and no build step. You can find the source code [here](https://github.com/MercuryWorkshop/dreamlandjs) and the documentation [here](https://dreamland.js.org/).

AnuraOS itself uses dreamland for the desktop environment and core system apps, and you can use it in your apps as well. To include dreamland in your app without a bundler, you can add the following to the `head` section of your `index.html` file:

```html
<script src="/libs/dreamland/all.js"></script>
```

While dreamland itself includes a `$store` function for preserving state between page reloads, this function is not available by default. Instead, you can use the [`anura.persistence`](#libpersist) library to build a `$store` function bound to your app instance.

```jsx
const { buildLoader } = await anura.import("anura.persistence");
const loader = buildLoader(anura);
await loader.locate();

const persistence = await loader.build(instance);
const $store = persistence.createStoreFn($state, instanceWindow);

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

## AnuraOS Libraries

AnuraOS libraries are just like apps but contain utilities or functionality that other apps could import and use. They live inside folders with the suffix `.lib` and the resources specific to each app are contained within that folder.

### Manifest

- You write a library that consists of a `manifest.json` file and an ES module. An example of the manifest file is below.

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

  - `name` is the name of the library.
  - `icon` is the icon of the library (for use in Marketplace).
  - `package` is the package name of the library.
  - `versions` is a map of version numbers to entry points.
  - `installHook` is a file that is run when the library is installed. It should have a default export that is a function that takes the anura instance as an argument.
  - `currentVersion` is the current version of the library, which will be used as the default version when using the [`anura.import`](./Anura-API.md#anuraimport) api.

### Usage

- Libraries can be imported using the [`anura.import`](./Anura-API.md#anuraimport) api. This api takes the package id of the library and an optional version number. The version number is specified by appending `@<version>` to the package id. If no version is specified, the current version of the library is used.

```js
anura.import("anura.examplelib@1.0.0").then((lib) => {
	// Do stuff with the library.
});
```

```js
let lib = await anura.import("anura.examplelib");
// Do stuff with the library.
```

## System Libraries

Anura has a assortment of preinstalled system libraries to streamline the developer experience. This part of the documentation outlines how to use them in your application using the [`anura.import`](./Anura-API.md#anuraimport) api.

### libbrowser

This library allows you to interact with Anura's browser. Instead of using `window.open` in your anura apps, using this API will ensure that the webpage will open up in the Anura Browser.

Usage:

```js
const browser = await anura.import("anura.libbrowser");

browser.openTab("https://google.com/");
```

### libfilepicker

This library allows you to select files from inside of anura's filesystem. It returns a path(s) and supports both files and folders.

```js
let picker = await anura.import("anura.filepicker");
// select file of any type
let file = await picker.selectFile();
// regex supported
let fileWithFilter = await picker.selectFile({
	regex: "(png|jpe?g|gif|bmp|webp|tiff|svg|ico)",
});
let multipleFiles = await picker.selectFile({
	multiple: true,
});
// select folder (all options except for regex apply here)
let folder = await picker.selectFolder();
```

### libpersist

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

### File Handlers

Libraries can also be setup to handle files. A file handler library at the least requires a `openFile` function inside of the file handler, but can be extended. An example is shown below for a simple text editor that is integrated by default in anura.

```js
export function openFile(path) {
	anura.fs.readFile(path, async function (err, data) {
		let fileView = anura.wm.createGeneric("Simple Text Editor");
		fileView.content.style.overflow = "auto";
		fileView.content.style.backgroundColor = "var(--material-bg)";
		fileView.content.style.color = "white";
		const text = document.createElement("textarea");
		text.style.fontFamily = '"Roboto Mono", monospace';
		text.style.top = 0;
		text.style.left = 0;
		text.style.width = "calc( 100% - 20px )";
		text.style.height = "calc( 100% - 24px )";
		text.style.backgroundColor = "var(--material-bg)";
		text.style.color = "white";
		text.style.border = "none";
		text.style.resize = "none";
		text.style.outline = "none";
		text.style.userSelect = "text";
		text.style.margin = "8px";
		text.value = data;
		text.onchange = () => {
			fs.writeFile(path, text.value);
		};
		fileView.content.appendChild(text);
	});
}

export function getIcon(path) {
	return (
		import.meta.url.substring(0, import.meta.url.lastIndexOf("/")) + "/icon.png"
	);
}

export function getFileType(path) {
	return "Text File";
}
```

After setting up a library like this you can make it the file handler for a file extension by just setting it using the `anura.files.setModule` function.

```js
anura.files.setModule("(package identifier)", "(file extension)");
```
