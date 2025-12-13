// note from perc:
// this app should be refactored again, (someday?) but im not doing it rn so

// Note from Rafflesia: What the fuck?
// If you're new here, this is the one file which you really don't want to touch, fsapp has been around since well, forever.
// The code is the definition of growth-rot and messy, this is a 1k+ line file with almost all of the code for this app.
// Frankly, it's terrible, don't touch it, and if it works, don't refactor anything unless you're willing to break it and rewrite the entire thing
// You've been warned

async function filePickerAction(selected) {
	for (const row of currentlySelected) {
		row.classList.remove("selected");
	}
	currentlySelected = [];
	if (selected.length === 1) {
		var fileSelected = selected[0];
		if (fileSelected.getAttribute("data-type") === filePicker.type) {
			let fileData = {
				message: "FileSelected",
				id: filePicker.id,
				filePath: fileSelected
					.getAttribute("data-path")
					.replace(/(\/)\1+/g, "$1"),
			};
			window.callback({ data: fileData });
		}
	} else if (selected.length > 1 && filePicker.multiple) {
		let dataPaths = [];
		for (var i = 0; i < selected.length; i++) {
			var dataType = selected[i].getAttribute("data-type");
			var dataPath = selected[i].getAttribute("data-path");
			if (dataType !== filePicker.type) {
				return;
			}
			if (dataPath !== null) {
				dataPaths.push(dataPath.replace(/(\/)\1+/g, "$1"));
			}
		}
		let fileData = {
			message: "FileSelected",
			id: filePicker.id,
			filePath: dataPaths,
		};
		window.callback({ data: fileData });
	} else if (selected.length === 0) {
		if (filePicker.type === "dir") {
			let fileData = {
				message: "FileSelected",
				id: filePicker.id,
				filePath: document
					.querySelector(".breadcrumbs")
					.getAttribute("data-current-path"),
			};

			window.callback({ data: fileData });
		}
	}
}

async function fileAction(selected) {
	if (selected.length === 1) {
		var fileSelected = selected[0];
		if (fileSelected.getAttribute("data-type") === "file") {
			console.debug("Clicked on file");
			if (fileSelected.getAttribute("data-path").endsWith(".zip")) {
				const data = await unzip(
					await anura.fs.promises.readFile(
						fileSelected.getAttribute("data-path"),
					),
				);
				const root =
					fileSelected
						.getAttribute("data-path")
						.split("/")
						.slice(0, -1)
						.join("/") +
					"/" +
					fileSelected
						.getAttribute("data-path")
						.split("/")
						.pop()
						.split(".")
						.slice(0, -1)
						.join(".") +
					"/";
				// const folders = [];
				const files = [];
				for (const item in data) {
					console.log(item);
					if (item.endsWith("/")) {
						// folders.push(item);
					} else {
						files.push([item, data[item]]);
					}
				}
				const sh = new fs.Shell();
				for (const file of files) {
					const container = file[0].split("/").slice(0, -1).join("/") + "/";
					await sh.promises.mkdirp(root + container);

					await fs.promises.writeFile(root + file[0], Buffer.from(file[1]));
				}
				reload();
				return;
			}

			anura.files.open(fileSelected.getAttribute("data-path"));
		} else if (fileSelected.getAttribute("data-type") === "dir") {
			if (
				fileSelected.getAttribute("data-path").endsWith(".app") ||
				fileSelected.getAttribute("data-path").endsWith(".lib")
			) {
				anura.files.open(fileSelected.getAttribute("data-path"));
				return;
			}
			console.debug(
				"Changing folder to ",
				fileSelected.getAttribute("data-path"),
			);
			loadPath(fileSelected.getAttribute("data-path"));
		} else {
			console.warn(
				"Unknown filetype ",
				fileSelected.getAttribute("data-type"),
				" doing nothing!",
			);
		}
	} else {
		// MULTIPLE FILE SELECTION //

		console.error("raff please implement");
	}
}

function setBreadcrumbs(path) {
	path = path.replace(/(\/)\1+/g, "$1");
	var pathSplit = path.split("/");
	pathSplit[0] = "/";
	var breadcrumbs = document.querySelector(".breadcrumbs");
	breadcrumbs.setAttribute("data-current-path", path);
	breadcrumbs.innerHTML = "";
	if (pathSplit.length === 2 && pathSplit[0] === "/" && pathSplit[1] === "") {
		var breadcrumb = document.createElement("button");
		breadcrumb.innerText = "My files";
		breadcrumb.addEventListener("click", () => {
			loadPath("/");
		});
		breadcrumbs.appendChild(breadcrumb);
		return;
	}
	for (var i = 0; i < pathSplit.length; i++) {
		var breadcrumb = document.createElement("button");
		breadcrumb.innerText = pathSplit[i];
		if (pathSplit[i] === "/") {
			breadcrumb.innerText = "My files";
		}
		let index = i;

		breadcrumb.addEventListener("click", function () {
			let path = pathSplit.slice(0, index + 1).join("/");
			loadPath(path);
		});
		breadcrumbs.appendChild(breadcrumb);
		if (pathSplit[i] !== pathSplit[pathSplit.length - 1]) {
			var breadcrumbSpan = document.createElement("span");
			breadcrumbSpan.innerText = ">";
			breadcrumbs.appendChild(breadcrumbSpan);
		}
	}
}

async function newFolder(path) {
	if (!path) {
		let folderName = await anura.dialog.prompt("Folder Name: ");
		if (folderName) {
			path =
				document
					.querySelector(".breadcrumbs")
					.getAttribute("data-current-path") +
				"/" +
				folderName;
		}
	}
	if (path) {
		await fs.promises.mkdir(path);
		reload();
	}
}

async function newFile(path) {
	if (!path) {
		let fileName = await anura.dialog.prompt("File Name: ");
		if (fileName) {
			path =
				document
					.querySelector(".breadcrumbs")
					.getAttribute("data-current-path") +
				"/" +
				fileName;
		}
	}
	if (path) {
		await fs.promises.writeFile(path, "");
		reload();
	}
}

function reload() {
	loadPath(
		document.querySelector(".breadcrumbs").getAttribute("data-current-path"),
	);
}

function upload() {
	// TODO: think of a better name for this variable
	const fauxput = document.createElement("input"); // fauxput - fake input that isn't shown or ever added to page
	fauxput.type = "file";
	fauxput.multiple = true;
	fauxput.onchange = async (e) => {
		const dialog = anura.dialog.progress("Uploading files...");
		const files = await e.target.files;
		let filesRemaining = files.length;
		for (const file of files) {
			dialog.detail = `Uploading file: ${file.name}`;
			dialog.progress = filesRemaining / files.length;
			const content = await file.arrayBuffer();
			await fs.promises.writeFile(
				`${document
					.querySelector(".breadcrumbs")
					.getAttribute("data-current-path")}/${file.name}`,
				Buffer.from(content),
			);
			filesRemaining--;
		}
		reload();
	};
	fauxput.click();
}

async function download() {
	for (const item of currentlySelected) {
		if (item.getAttribute("data-type") !== "file") {
			continue;
		}
		const filePath = item.getAttribute("data-path");
		const fileData = await fs.promises.readFile(filePath);
		const file = await fs.promises.stat(filePath);
		// keeping up the bad names
		// TODO: this name is horrible, fix it
		const fauxnchor = document.createElement("a");
		fauxnchor.style.display = "none";
		document.body.appendChild(fauxnchor);
		const blob = new Blob([fileData], { type: "application/octet-stream" });
		const url = window.URL.createObjectURL(blob);
		fauxnchor.href = url;
		fauxnchor.download = file.name;
		fauxnchor.click();

		window.URL.revokeObjectURL(url);
		fauxnchor.remove();
	}
}

async function deleteFile() {
	const dialog = anura.dialog.progress("Deleting files...");
	let filesRemaining = currentlySelected.length;
	for (item of currentlySelected) {
		dialog.detail = `Deleting file: ${item.getAttribute("data-path")}`;
		dialog.progress = filesRemaining / currentlySelected.length;
		await sh.rm(
			item.getAttribute("data-path"),
			{
				recursive: true,
			},
			function (err) {
				if (err) throw err;
			},
		);
	}
	currentlySelected = [];
	reload();
}

function copy() {
	clipboard = currentlySelected;
	removeAfterPaste = false;
}

function cut() {
	clipboard = currentlySelected;
	removeAfterPaste = true;
}

async function paste() {
	const path = document
		.querySelector(".breadcrumbs")
		.getAttribute("data-current-path");
	const dialog = anura.dialog.progress("Pasting files...");
	if (removeAfterPaste) {
		// cut
		let filesRemaining = clipboard.length;
		for (const item of clipboard) {
			itemName = item.getAttribute("data-path");
			dialog.detail = `Pasting file: ${itemName}`;
			dialog.progress = filesRemaining / clipboard.length;
			await fs.promises.rename(
				itemName,
				`${path}/${itemName.split("/").slice("-1")[0]}`,
			);
		}
		clipboard = [];
		reload();
		return;
	}

	for (item of clipboard) {
		let newPath = path;
		let oldPath = item.attributes["data-path"].value;
		dialog.progress = 50;
		await sh.promises.cpr(oldPath, newPath, { createInnerFolder: true });
		dialog.progress = 100;
	}
	clipboard = [];
	reload();
}

async function rename() {
	const path = document
		.querySelector(".breadcrumbs")
		.getAttribute("data-current-path");
	if (currentlySelected.length > 1) {
		anura.notifications.add({
			title: "Filesystem app",
			description: "Renaming only works with one file",
			timeout: 5000,
		});
		return;
	}
	const filename = await anura.dialog.prompt("Filename:");
	if (filename) {
		await fs.promises.rename(
			currentlySelected[0].getAttribute("data-path"),
			`${path}/${filename}`,
		);
		reload();
	}
}

// Context menu version of the loadPath function
// Used to enter app and lib folders, as double
// clicking on them will install them.
function navigate() {
	if (currentlySelected.length == 1) {
		loadPath(currentlySelected[0].getAttribute("data-path"));
	}
}

function unzip(zip) {
	return new Promise((res, rej) => {
		fflate.unzip(zip, (err, unzipped) => {
			if (err) rej(err);
			else res(unzipped);
		});
	});
}
