async function selectAction(selected) {
    currentlySelected.forEach((row) => {
        row.classList.remove("selected");
    });
    currentlySelected = [];
    if (selected.length == 1) {
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
        // SINGLE FILE SELECTION //

        var fileSelected = selected[0];
        if (fileSelected.getAttribute("data-type") === "file") {
            console.debug("Clicked on file");
            if (
                fileSelected
                    .getAttribute("data-path")
                    .split(".")
                    .slice("-2")
                    .join(".") === "app.zip"
            ) {
                let data = await fs.promises.readFile(
                    fileSelected.getAttribute("data-path"),
                );

                const path = fileSelected
                    .getAttribute("data-path")
                    .split(".")
                    .slice(0, -1)
                    .join(".");

                const zip = await unzip(new Uint8Array(data));
                const manifest = JSON.parse(
                    new TextDecoder().decode(zip["manifest.json"]),
                );
                const icon = new Blob([zip[manifest.icon]], {
                    type: mime.default.getType(manifest.icon),
                });
                const win = anura.wm.create(instance, {
                    title: "",
                    width: "450px",
                    height: "525px",
                });

                const iframe = document.createElement("iframe");

                iframe.setAttribute(
                    "src",
                    document.location.href.split("/").slice(0, -1).join("/") +
                        "/appview.html?manifest=" +
                        ExternalApp.serializeArgs([
                            JSON.stringify(manifest),
                            URL.createObjectURL(icon),
                            "app",
                        ]),
                );

                iframe.style =
                    "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";

                win.content.appendChild(iframe);

                Object.assign(iframe.contentWindow, {
                    anura,
                    ExternalApp,
                    instance,
                    instanceWindow: win,
                    install: {
                        session: async () => {
                            anura.notifications.add({
                                title: "Application Installing for Session",
                                description: `Application ${path.replace(
                                    "//",
                                    "/",
                                )} is being installed, please wait`,
                                timeout: 50000,
                            });
                            await fs.mkdir(`${path.replace("//", "/")}`);
                            try {
                                for (const [
                                    relativePath,
                                    content,
                                ] of Object.entries(zip)) {
                                    if (relativePath.endsWith("/")) {
                                        fs.mkdir(`${path}/${relativePath}`);
                                    } else {
                                        fs.writeFile(
                                            `${path}/${relativePath}`,
                                            await Buffer.from(content),
                                        );
                                    }
                                }
                                await anura.registerExternalApp(
                                    `/fs${path}`.replace("//", "/"),
                                );
                                anura.notifications.add({
                                    title: "Application Installed for Session",
                                    description: `Application ${path.replace(
                                        "//",
                                        "/",
                                    )} has been installed temporarily, it will go away on refresh`,
                                    timeout: 50000,
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        },
                        permanent: async () => {
                            anura.notifications.add({
                                title: "Application Installing",
                                description: `Application ${path.replace(
                                    "//",
                                    "/",
                                )} is being installed, please wait`,
                                timeout: 50000,
                            });
                            await fs.promises.mkdir(
                                anura.settings.get("directories")["apps"] +
                                    "/" +
                                    path.split("/").slice("-1")[0],
                            );

                            try {
                                for (const [
                                    relativePath,
                                    content,
                                ] of Object.entries(zip)) {
                                    if (relativePath.endsWith("/")) {
                                        await fs.promises.mkdir(
                                            `${anura.settings.get("directories")["apps"]}/${path.split("/").slice("-1")[0]}/${relativePath}`,
                                        );
                                    } else {
                                        await fs.promises.writeFile(
                                            `${anura.settings.get("directories")["apps"]}/${path.split("/").slice("-1")[0]}/${relativePath}`,
                                            Buffer.from(content),
                                        );
                                    }
                                }
                                await anura.registerExternalApp(
                                    `/fs${anura.settings.get("directories")["apps"]}/${path.split("/").slice("-1")[0]}`.replace(
                                        "//",
                                        "/",
                                    ),
                                );
                                anura.notifications.add({
                                    title: "Application Installed",
                                    description: `Application ${path.replace(
                                        "//",
                                        "/",
                                    )} has been installed permanently`,
                                    timeout: 50000,
                                });
                            } catch (e) {
                                console.error(e);
                            }
                        },
                    },
                });

                iframe.contentWindow.addEventListener("load", () => {
                    const matter = document.createElement("link");
                    matter.setAttribute("rel", "stylesheet");
                    matter.setAttribute("href", "/assets/matter.css");
                    iframe.contentDocument.head.appendChild(matter);
                });
            } else if (
                fileSelected
                    .getAttribute("data-path")
                    .split(".")
                    .slice("-2")
                    .join(".") === "lib.zip"
            ) {
                const data = await fs.promises.readFile(
                    fileSelected.getAttribute("data-path"),
                );

                const path = fileSelected
                    .getAttribute("data-path")
                    .split(".")
                    .slice(0, -1)
                    .join(".");

                const zip = await unzip(new Uint8Array(data));
                const manifest = JSON.parse(
                    new TextDecoder().decode(zip["manifest.json"]),
                );
                const icon = new Blob([zip[manifest.icon]], {
                    type: mime.default.getType(manifest.icon),
                });

                const win = anura.wm.create(instance, {
                    title: "",
                    width: "450px",
                    height: "525px",
                });

                const iframe = document.createElement("iframe");

                iframe.setAttribute(
                    "src",
                    document.location.href.split("/").slice(0, -1).join("/") +
                        "/appview.html?manifest=" +
                        ExternalApp.serializeArgs([
                            JSON.stringify(manifest),
                            URL.createObjectURL(icon),
                            "lib",
                        ]),
                );

                iframe.style =
                    "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";

                win.content.appendChild(iframe);

                Object.assign(iframe.contentWindow, {
                    anura,
                    ExternalApp,
                    instance,
                    instanceWindow: win,
                    install: {
                        session: async () => {
                            anura.notifications.add({
                                title: "Library Installing for Session",
                                description: `Library ${path.replace(
                                    "//",
                                    "/",
                                )} is being installed, please wait`,
                                timeout: 50000,
                            });
                            await fs.promises.mkdir(`${path}`);

                            let filesRemaining = Object.keys(zip).length;

                            Object.entries(zip).forEach(
                                async ([relativePath, content]) => {
                                    if (relativePath.endsWith("/")) {
                                        await fs.promises.mkdir(
                                            `${path}/${relativePath}`,
                                        );
                                    } else {
                                        await fs.promises.writeFile(
                                            `${path}/${relativePath}`,
                                            Buffer.from(content),
                                        );
                                    }
                                    filesRemaining--;
                                    if (filesRemaining === 0) {
                                        await anura.registerExternalLib(
                                            `/fs/${path}`.replace("//", "/"),
                                        );
                                        anura.notifications.add({
                                            title: "Library Installed for Session",
                                            description: `Library ${path.replace(
                                                "//",
                                                "/",
                                            )} has been installed temporarily, it will go away on refresh`,
                                            timeout: 50000,
                                        });
                                    }
                                },
                                function (e) {
                                    console.error(e);
                                },
                            );
                        },
                        permanent: async () => {
                            anura.notifications.add({
                                title: "Library Installing",
                                description: `Library ${path.replace(
                                    "//",
                                    "/",
                                )} is being installed`,
                                timeout: 50000,
                            });
                            await fs.mkdir(
                                anura.settings.get("directories")["libs"] +
                                    "/" +
                                    path.split("/").slice("-1")[0],
                            );

                            let filesRemaining = Object.keys(zip).length;

                            Object.entries(zip).forEach(
                                async ([relativePath, content]) => {
                                    if (relativePath.endsWith("/")) {
                                        await fs.promises.mkdir(
                                            `${anura.settings.get("directories")["libs"]}/${path.split("/").slice("-1")[0]}/${relativePath}`,
                                        );
                                    } else {
                                        await fs.promises.writeFile(
                                            `${anura.settings.get("directories")["libs"]}/${path.split("/").slice("-1")[0]}/${relativePath}`,
                                            Buffer.from(content),
                                        );
                                    }
                                    filesRemaining--;
                                    if (filesRemaining === 0) {
                                        await anura.registerExternalLib(
                                            `/fs${anura.settings.get("directories")["libs"]}/${path.split("/").slice("-1")[0]}`.replace(
                                                "//",
                                                "/",
                                            ),
                                        );
                                        anura.notifications.add({
                                            title: "Library Installed",
                                            description: `Library ${path.replace(
                                                "//",
                                                "/",
                                            )} has been installed permanently`,
                                            timeout: 50000,
                                        });
                                    }
                                },
                                function (e) {
                                    console.error(e);
                                },
                            );
                        },
                    },
                });

                iframe.contentWindow.addEventListener("load", () => {
                    const matter = document.createElement("link");
                    matter.setAttribute("rel", "stylesheet");
                    matter.setAttribute("href", "/assets/matter.css");
                    iframe.contentDocument.head.appendChild(matter);
                });
            } else {
                anura.files.open(fileSelected.getAttribute("data-path"));
            }
        } else if (fileSelected.getAttribute("data-type") === "dir") {
            if (
                fileSelected
                    .getAttribute("data-path")
                    .split(".")
                    .slice("-1")[0] === "app"
            ) {
                try {
                    let data;
                    try {
                        data = await fs.promises.readFile(
                            `${fileSelected.getAttribute("data-path")}/manifest.json`,
                        );
                    } catch {
                        console.debug(
                            "Changing folder to ",
                            fileSelected.getAttribute("data-path"),
                        );
                        loadPath(fileSelected.getAttribute("data-path"));
                        return;
                    }
                    const manifest = JSON.parse(data);
                    if (anura.apps[manifest.package]) {
                        anura.apps[manifest.package].open();
                        return;
                    }

                    const iconData = await fs.promises.readFile(
                        `${fileSelected.getAttribute("data-path")}/${manifest.icon}`,
                    );

                    const icon = new Blob([iconData]);

                    const win = anura.wm.create(instance, {
                        title: "",
                        width: "450px",
                        height: "525px",
                    });

                    const iframe = document.createElement("iframe");
                    iframe.setAttribute(
                        "src",
                        document.location.href
                            .split("/")
                            .slice(0, -1)
                            .join("/") +
                            "/appview.html?manifest=" +
                            ExternalApp.serializeArgs([
                                data.toString(),
                                URL.createObjectURL(icon),
                                "app",
                            ]),
                    );
                    iframe.style =
                        "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";

                    win.content.appendChild(iframe);
                    Object.assign(iframe.contentWindow, {
                        anura,
                        ExternalApp,
                        instance,
                        instanceWindow: win,
                        install: {
                            session: async () => {
                                await anura.registerExternalApp(
                                    `/fs${fileSelected.getAttribute("data-path")}`.replace(
                                        "//",
                                        "/",
                                    ),
                                );
                                anura.notifications.add({
                                    title: "Application Installed for Session",
                                    description: `Application ${fileSelected
                                        .getAttribute("data-path")
                                        .replace(
                                            "//",
                                            "/",
                                        )} has been installed temporarily, it will go away on refresh`,
                                    timeout: 50000,
                                });
                                win.close();
                            },
                            permanent: async () => {
                                await fs.promises.rename(
                                    fileSelected.getAttribute("data-path"),
                                    anura.settings.get("directories")["apps"] +
                                        "/" +
                                        fileSelected
                                            .getAttribute("data-path")
                                            .split("/")
                                            .slice("-1")[0],
                                );
                                await anura.registerExternalApp(
                                    `/fs${anura.settings.get("directories")["apps"]}/${fileSelected.getAttribute("data-path").split("/").slice("-1")[0]}`.replace(
                                        "//",
                                        "/",
                                    ),
                                );
                                anura.notifications.add({
                                    title: "Application Installed",
                                    description: `Application ${fileSelected
                                        .getAttribute("data-path")
                                        .replace(
                                            "//",
                                            "/",
                                        )} has been installed permanently`,
                                    timeout: 50000,
                                });
                                win.close();
                            },
                        },
                    });

                    iframe.contentWindow.addEventListener("load", () => {
                        const matter = document.createElement("link");
                        matter.setAttribute("rel", "stylesheet");
                        matter.setAttribute("href", "/assets/matter.css");
                        iframe.contentDocument.head.appendChild(matter);
                    });
                } catch (e) {
                    anura.dialog.alert(
                        `There was an error: ${e}`,
                        "Error installing app",
                    );
                }
            } else if (
                fileSelected
                    .getAttribute("data-path")
                    .split(".")
                    .slice("-1")[0] === "lib"
            ) {
                try {
                    let data;
                    try {
                        data = await fs.promises.readFile(
                            `${fileSelected.getAttribute("data-path")}/manifest.json`,
                        );
                    } catch {
                        console.debug(
                            "Changing folder to ",
                            fileSelected.getAttribute("data-path"),
                        );
                        loadPath(fileSelected.getAttribute("data-path"));
                        return;
                    }

                    const manifest = JSON.parse(data);
                    if (anura.libs[manifest.package]) {
                        return;
                    }

                    const iconData = await fs.promises.readFile(
                        `${fileSelected.getAttribute("data-path")}/${manifest.icon}`,
                    );

                    const icon = new Blob([iconData]);

                    const win = anura.wm.create(instance, {
                        title: "",
                        width: "450px",
                        height: "525px",
                    });

                    const iframe = document.createElement("iframe");

                    iframe.setAttribute(
                        "src",
                        document.location.href
                            .split("/")
                            .slice(0, -1)
                            .join("/") +
                            "/appview.html?manifest=" +
                            ExternalApp.serializeArgs([
                                data.toString(),
                                URL.createObjectURL(icon),
                                "lib",
                            ]),
                    );

                    iframe.style =
                        "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";

                    win.content.appendChild(iframe);

                    Object.assign(iframe.contentWindow, {
                        anura,
                        ExternalApp,
                        instance,
                        instanceWindow: win,
                        install: {
                            session: async () => {
                                await anura.registerExternalLib(
                                    `/fs${fileSelected.getAttribute("data-path")}`.replace(
                                        "//",
                                        "/",
                                    ),
                                );
                                anura.notifications.add({
                                    title: "Library Installed for Session",
                                    description: `Library ${fileSelected
                                        .getAttribute("data-path")
                                        .replace(
                                            "//",
                                            "/",
                                        )} has been installed temporarily, it will go away on refresh`,
                                    timeout: 50000,
                                });
                                win.close();
                            },
                            permanent: async () => {
                                await fs.promises.rename(
                                    fileSelected.getAttribute("data-path"),
                                    anura.settings.get("directories")["libs"] +
                                        "/" +
                                        fileSelected
                                            .getAttribute("data-path")
                                            .split("/")
                                            .slice("-1")[0],
                                );
                                await anura.registerExternalLib(
                                    `/fs${anura.settings.get("directories")["libs"]}/${fileSelected.getAttribute("data-path").split("/").slice("-1")[0]}`.replace(
                                        "//",
                                        "/",
                                    ),
                                );
                                anura.notifications.add({
                                    title: "Library Installed",
                                    description: `Library ${fileSelected
                                        .getAttribute("data-path")
                                        .replace(
                                            "//",
                                            "/",
                                        )} has been installed permanently`,
                                    timeout: 50000,
                                });
                                win.close();
                            },
                        },
                    });
                    iframe.contentWindow.addEventListener("load", () => {
                        const matter = document.createElement("link");
                        matter.setAttribute("rel", "stylesheet");
                        matter.setAttribute("href", "/assets/matter.css");
                        iframe.contentDocument.head.appendChild(matter);
                    });
                } catch (e) {
                    anura.notifications.add({
                        title: "Library Install Error",
                        description: `Library had an error installing: ${e}`,
                        timeout: 50000,
                    });
                }
            } else {
                console.debug(
                    "Changing folder to ",
                    fileSelected.getAttribute("data-path"),
                );
                loadPath(fileSelected.getAttribute("data-path"));
            }
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
    pathSplit[0] = "My files";
    var breadcrumbs = document.querySelector(".breadcrumbs");
    breadcrumbs.setAttribute("data-current-path", path);
    breadcrumbs.innerHTML = "";
    if (
        pathSplit.length === 2 &&
        pathSplit[0] === "My files" &&
        pathSplit[1] === ""
    ) {
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
        var index = i;

        breadcrumb.addEventListener("click", () => {
            loadPath("/" + pathSplit.slice(1, index).join("/"));
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
        fs.mkdir(path);
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
        document
            .querySelector(".breadcrumbs")
            .getAttribute("data-current-path"),
    );
}

function upload() {
    let fauxput = document.createElement("input"); // fauxput - fake input that isn't shown or ever added to page TODO: think of a better name for this variable
    fauxput.type = "file";
    fauxput.onchange = async (e) => {
        const file = await e.target.files[0];
        const content = await file.arrayBuffer();
        fs.writeFile(
            `${document
                .querySelector(".breadcrumbs")
                .getAttribute("data-current-path")}/${file.name}`,
            Buffer.from(content),
            function (err) {
                reload();
            },
        );
    };
    fauxput.click();
}

function deleteFile() {
    currentlySelected.forEach(async (item) => {
        await sh.rm(
            item.getAttribute("data-path"),
            {
                recursive: true,
            },
            function (err) {
                if (err) throw err;
                reload();
            },
        );
    });
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
    if (!removeAfterPaste) {
        for (item of clipboard) {
            if (item.attributes["data-type"].value === "dir") {
                //INPUT
                let newPath = path;
                let oldPath = item.attributes["data-path"].value;

                // Normalize (remove trailing slash, replace // with /)
                if (oldPath.endsWith("/")) oldPath = oldPath.slice(0, -1);
                if (newPath.endsWith("/")) newPath = newPath.slice(0, -1);
                newPath = newPath.replace("//", "/");
                oldPath = oldPath.replace("//", "/");

                const oldFolderName = oldPath.split("/").pop();
                // Search
                const files = await sh.promises.ls(oldPath, {
                    recursive: true,
                });
                // Apply
                for (file of files) {
                    // Creating the relative path string
                    let path = file.split("/");
                    const filename = path.pop();
                    path = path.join("/");
                    path = path.substring(oldPath.length);

                    await sh.promises.mkdirp(
                        `${newPath}/${oldFolderName}${path}`,
                    );
                    const data = await fs.promises.readFile(
                        `${oldPath}${path}/${filename}`,
                    );
                    await fs.promises.writeFile(
                        `${newPath}/${oldFolderName}${path}/${filename}`,
                        data,
                    );
                }
            } else {
                let origin = item.attributes["data-path"].value;
                await fs.promises.writeFile(
                    `${path}/${origin.split("/").slice("-1")[0]}`,
                    await fs.promises.readFile(origin),
                );
            }
        }
        clipboard = [];
        reload();
    }
    if (removeAfterPaste) {
        // cut
        for (const item of clipboard) {
            itemName = item.getAttribute("data-path");
            await fs.promises.rename(
                itemName,
                `${path}/${itemName.split("/").slice("-1")[0]}`,
            );
            reload();
        }
        clipboard = [];
    }
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

function installSession() {
    currentlySelected.forEach(async (item) => {
        const path = item.getAttribute("data-path");
        const ext = path.split(".").slice("-1")[0];
        const stats = await fs.promises.stat(path);
        if (stats.isDirectory()) {
            if (ext === "app") {
                try {
                    await anura.registerExternalApp(
                        `/fs${path}`.replace("//", "/"),
                    );
                    anura.notifications.add({
                        title: "Application Installed for Session",
                        description: `Application ${path.replace(
                            "//",
                            "/",
                        )} has been installed temporarily, it will go away on refresh`,
                        timeout: 50000,
                    });
                } catch (e) {
                    anura.dialog.alert(
                        `There was an error: ${e}`,
                        "Error installing app",
                    );
                }
            }
            if (ext === "lib") {
                try {
                    await anura.registerExternalLib(
                        `/fs${path}`.replace("//", "/"),
                    );
                    anura.notifications.add({
                        title: "Library Installed for Session",
                        description: `Library ${path.replace(
                            "//",
                            "/",
                        )} has been installed temporarily, it will go away on refresh`,
                        timeout: 50000,
                    });
                } catch (e) {
                    anura.dialog.alert(
                        `There was an error: ${e}`,
                        "Error installing library",
                    );
                }
            }
        }
    });
}

function installPermanent() {
    currentlySelected.forEach(async (item) => {
        const path = item.getAttribute("data-path");
        const ext = path.split(".").slice("-1")[0];
        const stats = await fs.promises.stat(path);

        if (stats.isDirectory()) {
            if (ext === "app") {
                const destination = anura.settings.get("directories")["apps"];
                try {
                    await fs.promises.rename(
                        path,
                        destination + "/" + path.split("/").slice("-1")[0],
                    );
                    await anura.registerExternalApp(
                        `/fs${destination}/${path.split("/").slice("-1")[0]}`.replace(
                            "//",
                            "/",
                        ),
                    );
                } catch (e) {
                    anura.notifications.add({
                        title: "Application Install Error",
                        description: `Application had an error installing: ${e}`,
                        timeout: 50000,
                    });
                }
            }
            if (ext === "lib") {
                const destination = anura.settings.get("directories")["libs"];
                try {
                    sh.ls(
                        path,
                        {
                            recursive: true,
                        },
                        async function (err, entries) {
                            if (err) throw err;
                            let items = [];
                            let dirs = [];
                            entries.forEach((entry) => {
                                function recurse(dirnode, path) {
                                    dirnode.contents.forEach((entry) => {
                                        if (entry.type === "DIRECTORY") {
                                            recurse(
                                                entry,
                                                path + "/" + entry.name,
                                            );
                                            dirs.push(path + "/" + entry.name);
                                        } else {
                                            items.push(path + "/" + entry.name);
                                        }
                                    });
                                }

                                const topLevelFolder = path;
                                dirs.push(path);
                                if (entry.type === "DIRECTORY") {
                                    recurse(entry, path + "/" + entry.name);
                                    dirs.push(path + "/" + entry.name);
                                } else {
                                    items.push(path + "/" + entry.name);
                                }
                            });
                            destItems = [];
                            destDirs = [];
                            numberToSubBy =
                                path.length - path.split("/").pop().length;

                            for (item in items) {
                                destItems.push(
                                    destination +
                                        "/" +
                                        items[item].slice(numberToSubBy),
                                );
                            }
                            for (dir in dirs) {
                                destDirs.push(
                                    destination +
                                        "/" +
                                        dirs[dir].slice(numberToSubBy),
                                );
                            }
                            for (dir in destDirs) {
                                await new Promise((resolve, reject) => {
                                    sh.mkdirp(destDirs[dir], function (err) {
                                        if (err) {
                                            reject(err);
                                            console.error(err);
                                        }
                                        resolve();
                                    });
                                });
                            }

                            for (item in items) {
                                await new Promise((resolve, reject) => {
                                    fs.readFile(
                                        items[item],
                                        function (err, data) {
                                            fs.writeFile(
                                                destItems[item],
                                                data,
                                                function (err) {
                                                    if (err) {
                                                        reject(err);
                                                        console.error(err);
                                                    }
                                                    resolve();
                                                },
                                            );
                                        },
                                    );
                                });
                            }

                            await anura.registerExternalLib(
                                `/fs${destination}/${path.split("/").slice("-1")[0]}`.replace(
                                    "//",
                                    "/",
                                ),
                            );
                            anura.notifications.add({
                                title: "Library Installed",
                                description: `Library ${path.replaceAll(
                                    "/",
                                    "",
                                )} has been installed permanently.`,
                                timeout: 50000,
                            });

                            reload();
                        },
                    );
                } catch (e) {
                    anura.notifications.add({
                        title: "Library Install Error",
                        description: `Library had an error installing: ${e}`,
                        timeout: 50000,
                    });
                }
            }
        }
    });
}

// Context menu version of the loadPath function
// Used to enter app and lib folders, as double
// clicking on them will install them.
function navigate() {
    if (currentlySelected.length == 1) {
        loadPath(currentlySelected[0].getAttribute("data-path"));
    }
    // Can't navigate to multiple folders
}

function unzip(zip) {
    return new Promise((res, rej) => {
        fflate.unzip(zip, (err, unzipped) => {
            if (err) rej(err);
            else res(unzipped);
        });
    });
}
