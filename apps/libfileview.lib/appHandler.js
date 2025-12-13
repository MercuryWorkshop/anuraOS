const fflate = await anura.import("npm:fflate");
const mime = await anura.import("npm:mime");
const Buffer = Filer.Buffer;

const localPathToURL = (path) =>
	import.meta.url.substring(0, import.meta.url.lastIndexOf("/")) + "/" + path;

function unzip(zip) {
	return new Promise((res, rej) => {
		fflate.unzip(zip, (err, unzipped) => {
			if (err) rej(err);
			else res(unzipped);
		});
	});
}

async function handleAppView(
	type,
	manifest,
	iconData,
	sessionCallback,
	permanentCallback,
) {
	const icon = new Blob([iconData], {
		type: mime.default.getType(manifest.icon),
	});
	const iconUrl = URL.createObjectURL(icon);

	const win = anura.wm.createGeneric({
		title: "",
		width: "450px",
		height: "525px",
	});

	win.onclose = () => {
		URL.revokeObjectURL(iconUrl);
	};

	const iframe = document.createElement("iframe");

	iframe.setAttribute(
		"src",
		localPathToURL(
			"appview.html?manifest=" +
				ExternalApp.serializeArgs([JSON.stringify(manifest), iconUrl, type]),
		),
	);

	iframe.style =
		"top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";

	win.content.appendChild(iframe);

	Object.assign(iframe.contentWindow, {
		anura,
		ExternalApp,
		instanceWindow: win,
		install: {
			session: sessionCallback,
			permanent: permanentCallback,
		},
	});

	iframe.contentWindow.addEventListener("load", () => {
		const matter = document.createElement("link");
		matter.setAttribute("rel", "stylesheet");
		matter.setAttribute("href", "/assets/matter.css");
		iframe.contentDocument.head.appendChild(matter);
	});
}

async function createArchiveAppView(path, type) {
	let data = await anura.fs.promises.readFile(path);

	path = path.split(".").slice(0, -1).join(".");

	const zip = await unzip(new Uint8Array(data));
	const manifest = JSON.parse(new TextDecoder().decode(zip["manifest.json"]));
	const iconData = zip[manifest.icon];

	const sessionCallback = async () => {
		anura.notifications.add({
			title: "Installing for Session",
			description: `${path.replace("//", "/")} is being installed, please wait`,
			timeout: 50000,
		});
		await anura.fs.mkdir(`${path.replace("//", "/")}`);
		try {
			for (const [relativePath, content] of Object.entries(zip)) {
				if (relativePath.endsWith("/")) {
					await anura.fs.promises.mkdir(`${path}/${relativePath}`);
				} else {
					anura.fs.writeFile(
						`${path}/${relativePath}`,
						await Buffer.from(content),
					);
				}
			}
			await anura.registerExternalApp(`/fs${path}`.replace("//", "/"));
			anura.notifications.add({
				title: "Installed for Session",
				description: `${path.replace(
					"//",
					"/",
				)} has been installed temporarily, it will go away on refresh`,
				timeout: 50000,
			});
		} catch (e) {
			console.error(e);
		}
	};
	const permanentCallback = async () => {
		anura.notifications.add({
			title: "Installing",
			description: `${path.replace("//", "/")} is being installed, please wait`,
			timeout: 50000,
		});
		await anura.fs.promises.mkdir(
			// this is a dumb hack but i dont want to make 2 functions
			anura.settings.get("directories")[type + "s"] +
				"/" +
				path.split("/").slice("-1")[0],
		);

		try {
			for (const [relativePath, content] of Object.entries(zip)) {
				if (relativePath.endsWith("/")) {
					await anura.fs.promises.mkdir(
						`${anura.settings.get("directories")[type + "s"]}/${path.split("/").slice("-1")[0]}/${relativePath}`,
					);
				} else {
					await anura.fs.promises.writeFile(
						`${anura.settings.get("directories")[type + "s"]}/${path.split("/").slice("-1")[0]}/${relativePath}`,
						Buffer.from(content),
					);
				}
			}
			await anura.registerExternalApp(
				`/fs${anura.settings.get("directories")[type + "s"]}/${path.split("/").slice("-1")[0]}`.replace(
					"//",
					"/",
				),
			);
			anura.notifications.add({
				title: "Installed",
				description: `${path.replace(
					"//",
					"/",
				)} has been installed permanently`,
				timeout: 50000,
			});
		} catch (e) {
			console.error(e);
		}
	};
	handleAppView(type, manifest, iconData, sessionCallback, permanentCallback);
}

async function createFolderAppView(path, type) {
	let manifest;
	try {
		manifest = await anura.fs.promises.readFile(`${path}/manifest.json`);
		manifest = JSON.parse(manifest);
	} catch {
		return;
	}

	const iconData = await anura.fs.promises.readFile(`${path}/${manifest.icon}`);
	const sessionCallback = async () => {
		await anura.registerExternalApp(`/fs${path}`.replace("//", "/"));
		anura.notifications.add({
			title: "Application Installed for Session",
			description: `Application ${path.replace(
				"//",
				"/",
			)} has been installed temporarily, it will go away on refresh`,
			timeout: 50000,
		});
		win.close();
	};
	const permanentCallback = async () => {
		await anura.fs.promises.rename(
			path,
			anura.settings.get("directories")["apps"] +
				"/" +
				path.split("/").slice("-1")[0],
		);
		await anura.registerExternalApp(
			`/fs${anura.settings.get("directories")["apps"]}/${path.split("/").slice("-1")[0]}`.replace(
				"//",
				"/",
			),
		);
		anura.notifications.add({
			title: "Application Installed",
			description: `Application ${path.replace("//", "/")} has been installed permanently`,
			timeout: 50000,
		});
		win.close();
	};

	handleAppView(type, manifest, iconData, sessionCallback, permanentCallback);
}
async function getArchiveAppIcon(path) {
	let data = await anura.fs.promises.readFile(path);

	const zip = await unzip(new Uint8Array(data));
	const manifest = JSON.parse(new TextDecoder().decode(zip["manifest.json"]));
	const icon = new Blob([zip[manifest.icon]], {
		type: mime.default.getType(manifest.icon),
	});
	let iconUrl = URL.createObjectURL(icon);
	return iconUrl;
}

async function getFolderAppIcon(path) {
	let manifest;
	try {
		manifest = await anura.fs.promises.readFile(`${path}/manifest.json`);
		manifest = JSON.parse(manifest);
	} catch {
		return anura.files.fallbackIcon;
	}
	let iconData;
	try {
		iconData = await anura.fs.promises.readFile(`${path}/${manifest.icon}`);
	} catch {
		return anura.files.fallbackIcon;
	}
	const icon = new Blob([iconData], {
		type: mime.default.getType(manifest.icon),
	});
	const iconUrl = URL.createObjectURL(icon);
	return iconUrl;
}

export {
	createArchiveAppView,
	createFolderAppView,
	getArchiveAppIcon,
	getFolderAppIcon,
};
