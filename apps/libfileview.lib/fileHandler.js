import { createAppView, getAppIcon } from "./pages/appview/appview.js";

const { ShortcutApp } = await anura.import("anura.globalscope");

const icons = await (await fetch(localPathToURL("icons.json"))).json();

export function openFile(path) {
	const fs = anura.fs || Filer.fs;
	// let AliceWM = AliceWM || window.parent.AliceWM
	async function openImage(path, mimetype) {
		const data = await fs.promises.readFile(path);
		let fileView = anura.wm.createGeneric("Image File");
		fileView.content.style.overflow = "auto";
		fileView.content.style.background = "black";
		let bloburl = URL.createObjectURL(new Blob([data]));
		fileView.onclose = () => {
			URL.revokeObjectURL(bloburl);
		};
		if (mimetype === "image/svg+xml") {
			let doc = new DOMParser().parseFromString(data, "image/svg+xml");
			let elem = doc.documentElement;
			elem.style = "width: 100%; height: auto;";
			fileView.content.appendChild(elem);
			return;
		}
		let image = document.createElement("img");
		image.setAttribute("type", mimetype);
		image.src = bloburl;
		image.style = "width: auto; height: 100%; margin: auto; display: block;";
		fileView.content.appendChild(image);
	}

	async function openPDF(path) {
		const data = await fs.promises.readFile(path);
		let fileView = anura.wm.createGeneric("PDF File");
		fileView.content.style.overflow = "auto";
		let bloburl = URL.createObjectURL(
			new Blob([data], { type: "application/pdf" }),
		);
		fileView.onclose = () => {
			URL.revokeObjectURL(bloburl);
		};
		let doc = document.createElement("embed");
		doc.setAttribute("type", "application/pdf");
		doc.src = bloburl;
		doc.style = "width: 100%; height: 100%;";
		fileView.content.appendChild(doc);
	}

	async function openAudio(path, mimetype) {
		const data = await fs.promises.readFile(path);
		let fileView = anura.wm.createGeneric("Audio File");
		fileView.content.parentElement.style.width = "300px";
		fileView.content.parentElement.style.height = "83px";
		let bloburl = URL.createObjectURL(new Blob([data]));
		fileView.onclose = () => {
			URL.revokeObjectURL(bloburl);
		};
		let audio = document.createElement("audio");
		audio.src = bloburl;
		audio.setAttribute("controls", "");
		audio.setAttribute("type", mimetype);
		fileView.content.appendChild(audio);
	}

	async function openVideo(path, mimetype) {
		const data = await fs.promises.readFile(path);
		let fileView = anura.wm.createGeneric("Video File");
		fileView.content.style.overflow = "hidden";
		fileView.content.style.backgroundColor = "black";
		let bloburl = URL.createObjectURL(new Blob([data]));
		fileView.onclose = () => {
			URL.revokeObjectURL(bloburl);
		};
		let video = document.createElement("video");
		let source = document.createElement("source");
		source.src = bloburl;
		video.setAttribute("controls", "");
		video.setAttribute("autoplay", "");
		source.setAttribute("type", mimetype);
		video.style = "width: 100%; height: 100%;";
		video.appendChild(source);
		fileView.content.appendChild(video);
	}

	async function openText(path) {
		const data = await fs.promises.readFile(path);
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
	}

	async function openHTML(path) {
		const data = await fs.promises.readFile(path);
		let fileView = anura.wm.createGeneric("HTML Viewer");
		let iframe = document.createElement("iframe");
		iframe.setAttribute(
			"style",
			"top:0; left:0; bottom:0; right:0; width:100%; height:100%; border: none; margin: 0; padding: 0; background-color: transparent;",
		);
		iframe.srcdoc = data;
		fileView.content.appendChild(iframe);
	}

	async function openApp(path) {
		const stat = await fs.promises.stat(path);
		if (stat.isDirectory()) {
			console.error("TODO: Move special folder execution to libfileview");
			anura.dialog.alert(
				"Special folder execution is not yet implemented in libfileview. You should not be seeing this message unless you are a developer, if you are, please fix it. If you are not, please report this issue.",
			);
		} else {
			// Shortcut file
			const data = await fs.promises.readFile(path);
			const app = new ShortcutApp(path, JSON.parse(data));
			console.log(app);
			await app.open();
		}
	}

	switch (path.split(".").slice("-2").join(".")) {
		case "app.zip":
			createAppView(path, "app");
			return;
		case "lib.zip":
			createAppView(path, "lib");
			return;
		default:
			break;
	}
	let ext = path.split(".").slice("-1")[0];
	switch (ext) {
		case "txt":
		case "js":
		case "mjs":
		case "cjs":
		case "json":
		case "css":
			openText(path);
			break;
		case "ajs":
			// anura.processes.execute(path);
			const shell = anura.settings.get("shell") || "/usr/bin/chimerix.ajs";
			anura.settings.set("shell", shell);
			anura.processes.execute(shell, ["--cmd", path], true);
			break;
		case "mp3":
			openAudio(path, "audio/mpeg");
			break;
		case "flac":
			openAudio(path, "audio/flac");
			break;
		case "wav":
			openAudio(path, "audio/wav");
			break;
		case "ogg":
			openAudio(path, "audio/ogg");
			break;
		case "mp4":
			openVideo(path, "video/mp4");
			break;
		case "mov":
			openVideo(path, "video/mp4");
			break;
		case "webm":
			openVideo(path, "video/webm");
			break;
		case "gif":
			openImage(path, "image/gif");
			break;
		case "png":
			openImage(path, "image/png");
			break;
		case "svg":
			openImage(path, "image/svg+xml");
			break;
		case "jpg":
		case "jpeg":
			openImage(path, "image/jpeg");
			break;
		case "pdf":
			openPDF(path);
			break;
		case "html":
			openHTML(path);
			break;
		case "app":
			openApp(path);
			break;
		default:
			openText(path);
	}
}

export async function getIcon(path) {
	switch (path.split(".").slice("-2").join(".")) {
		case "app.zip":
			return getAppIcon(path);
		case "lib.zip":
			return getAppIcon(path);
		default:
			break;
	}
	let ext = path.split(".").slice("-1")[0];

	if (ext === "app") {
		const stat = await anura.fs.promises.stat(path);
		if (stat.isDirectory()) {
			console.error("TODO: Move special folder execution to libfileview");
			anura.dialog.alert(
				"Special folder execution is not yet implemented in libfileview. You should not be seeing this message unless you are a developer, if you are, please fix it. If you are not, please report this issue.",
			);
		} else {
			// Shortcut file
			const app = new ShortcutApp(
				path,
				JSON.parse(await anura.fs.promises.readFile(path)),
			);

			console.log(app);
			return new URL(app.icon, top.location.href).href;
		}
	}
	let iconObject = icons.files.find((icon) => icon.ext === ext);
	if (iconObject) {
		return localPathToURL(iconObject.icon);
	}

	return localPathToURL(icons.default);
}

export function getFileType(path) {
	switch (path.split(".").slice("-2").join(".")) {
		case "app.zip":
			return "Anura App Archive";
		case "lib.zip":
			return "Anura Library Archive";
		default:
			break;
	}

	const ext = path.split(".").slice("-1")[0];

	const iconObject = icons.files.find((icon) => icon.ext === ext);
	if (iconObject) {
		return iconObject.type;
	}
	return "Anura File";
}

function localPathToURL(path) {
	return (
		import.meta.url.substring(0, import.meta.url.lastIndexOf("/")) + "/" + path
	);
}
