var currentlySelected = [];
var clipboard = [];
var removeAfterPaste = false;

window.fs = parent.anura.fs;
window.anura = parent.anura;
window.Buffer = Filer.Buffer;
let sh = new fs.Shell();

function loadPath(path) {
    console.debug("loading path: ", path);
    fs.readdir(path, (err, files) => {
        if (err) throw err;
        setBreadcrumbs(path);
        let table = document.querySelector("tbody");
        table.innerHTML = "";
        files.forEach((file) => {
            let row = document.createElement("tr");
            let iconContainer = document.createElement("td");
            let icon = document.createElement("img");
            let name = document.createElement("td");
            let size = document.createElement("td");
            let description = document.createElement("td");
            let date = document.createElement("td");
            let type = document.createElement("td");
            
            iconContainer.className = "iconContainer";
            icon.className = "icon";
            fs.stat(`${path}/${file}`, function (err, stats) {
                if (err) throw err;
                if (stats.isDirectory()) {
                    name.innerText = `${file}/`;
                    description.innerText = "Folder";
                    date.innerText = new Date(stats.mtime).toLocaleString();

                    size.innerText = stats.size;

                    let folderExt = file.split(".").slice("-1")[0]
                    
                    if (folderExt == "app" | folderExt == "lib" && file !== "lib") {
                        let manifestPath = `${path}/${file}/manifest.json`;
                        fs.readFile(manifestPath, function (err, data) {
                            if (err) {
                                icon.src = anura.files.folderIcon;
                            }
                            let manifest = JSON.parse(data);
                            icon.src = `/fs${path}/${file}/${manifest.icon}`;
                            icon.onerror = () => {
                                icon.src = anura.files.folderIcon;
                            };
                            description.innerText = `Anura ${folderExt == "app" ? "Application" : "Library"}`;
                        });
                    } else {
                        icon.src = anura.files.folderIcon;
                    }
                    iconContainer.appendChild(icon);
                    row.appendChild(iconContainer);
                    row.appendChild(name);
                    row.appendChild(size);
                    row.appendChild(description);
                    row.appendChild(date);

                    row.setAttribute("data-type", "dir");
                    row.setAttribute("data-path", `${path}/${file}`);
                } else {
                    if (selectorType !== "dir") {
                        let ext = file.split("/").pop().split(".").pop();

                        if (fileRegex.test(ext)) {
                            name.innerText = `${file}`;
                            description.innerText = "Anura File";
                            anura.files.getFileType(`${path}/${file}`).then((type) => {
                                description.innerText = type;
                            });
                            date.innerText = new Date(stats.mtime).toLocaleString();
                            size.innerText = stats.size;
        
                            anura.files.getIcon(`${path}/${file}`).then((iconURL) => {
                                icon.src = iconURL;
                            }).catch((e) => {
                                icon.src = anura.files.fallbackIcon;
                                console.error(e);
                            });

                            iconContainer.appendChild(icon);
                            row.appendChild(iconContainer);
                            row.appendChild(name);
                            row.appendChild(size);
                            row.appendChild(description);
                            row.appendChild(date);

                            row.setAttribute("data-type", "file");
                            row.setAttribute("data-path", `${path}/${file}`);
                        }
                    }
                }
                console.debug("appending");
                table.appendChild(row);
                if (files[files.length - 1] === file) {
                    reloadListeners();
                }
            });
        });
    });
}

function reloadListeners() {
    console.debug("reloading listeners");
    console.debug(document.querySelectorAll("tr"));
    document.querySelectorAll("tr").forEach((row) => {
        if (row.parentNode.nodeName.toLowerCase() !== "thead") {
            console.debug("adding listeners to ", row);
            row.addEventListener("mouseenter", (e) => {
                e.currentTarget.classList.add("hover");
            });
            row.addEventListener("mouseleave", (e) => {
                e.currentTarget.classList.remove("hover");
            });
            row.addEventListener("contextmenu", (e) => {
                if (currentlySelected.length > 0) {
                    return;
                }
                e.currentTarget.classList.add("selected");
                currentlySelected = [e.currentTarget];
            });
            row.addEventListener("click", (e) => {
                if (currentlySelected.includes(e.currentTarget)) {
                    fileAction(currentlySelected);
                    currentlySelected.forEach((row) => {
                        row.classList.remove("selected");
                    });
                    currentlySelected = [];
                    return;
                }
                if (!e.shiftKey) {
                    if (!e.ctrlKey) {
                        currentlySelected.forEach((row) => {
                            row.classList.remove("selected");
                        });
                        currentlySelected = [];
                    }
                    e.currentTarget.classList.add("selected");
                    currentlySelected.push(e.currentTarget);
                } else {
                    if (currentlySelected.length == 0) {
                        e.currentTarget.classList.add("selected");
                        currentlySelected.push(e.currentTarget);
                    } else {
                        var arr = Array.from(
                            document.querySelectorAll("tr"),
                        ).filter(
                            (row) =>
                                row.parentNode.nodeName.toLowerCase() !==
                                "thead",
                        );
                        var firstI = arr.indexOf(
                            currentlySelected[currentlySelected.length - 1],
                        );
                        var lastI = arr.indexOf(e.currentTarget);
                        var first = Math.min(firstI, lastI);
                        var last = Math.max(firstI, lastI);
                        for (var i = first; i <= last; i++) {
                            if (!currentlySelected.includes(arr[i])) {
                                currentlySelected.push(arr[i]);
                                arr[i].classList.add("selected");
                            }
                        }
                    }
                }
            });
        }
    });
}
async function selectAction(selected) {
    currentlySelected.forEach((row) => {
        row.classList.remove("selected");
    });
    currentlySelected = [];
    if (selected.length == 1) {
        var fileSelected = selected[0];
        if (fileSelected.getAttribute("data-type") == selectorType) {
            let fileData = {
                message: 'FileSelected',
                filePath: fileSelected.getAttribute("data-path").replace(/(\/)\1+/g, "$1")
            };

            window.parent.postMessage(fileData, '*');
        }
    } else if (selected.length > 1) {
        let dataPaths = [];
        for (var i = 0; i < selected.length; i++) {
            var dataType = selected[i].getAttribute("data-type");
            var dataPath = selected[i].getAttribute("data-path");
            if (dataType !== selectorType ) {
                return;
            }
            if (dataPath !== null) {
              dataPaths.push(dataPath.replace(/(\/)\1+/g, "$1"));
            }
        }
        let fileData = {
            message: 'FileSelected',
            filePath: dataPaths
        };
    
        window.parent.postMessage(fileData, '*');
    } else if (selected.length == 0) {
        if (selectorType == "dir") {
            let fileData = {
                message: 'FileSelected',
                filePath: document.querySelector(".breadcrumbs").getAttribute("data-current-path")
              };
        
              window.parent.postMessage(fileData, '*');
        }
    }
}
async function fileAction(selected) {
    if (selected.length == 1) {
        var fileSelected = selected[0];

        if (fileSelected.getAttribute("data-type") == "file") {
            if (selectorType == "file") {
                let fileData = {
                    message: 'FileSelected',
                    filePath: fileSelected.getAttribute("data-path").replace(/(\/)\1+/g, "$1")
                  };
            
                  window.parent.postMessage(fileData, '*');
            }
        } else if (fileSelected.getAttribute("data-type") == "dir") {
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
    } else if (selected.length > 1) {
        let dataPaths = [];
        for (var i = 0; i < selected.length; i++) {
            var dataType = selected[i].getAttribute("data-type");
            var dataPath = selected[i].getAttribute("data-path");
            if (dataType !== selectorType ) {
                return;
            }
            if (dataPath !== null) {
              dataPaths.push(dataPath.replace(/(\/)\1+/g, "$1"));
            }
        }
        let fileData = {
            message: 'FileSelected',
            filePath: dataPaths
        };
    
        window.parent.postMessage(fileData, '*');
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
        pathSplit.length == 2 &&
        pathSplit[0] == "My files" &&
        pathSplit[1] == ""
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
        console.log(i);
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

document.querySelector("table").addEventListener("click", (e) => {
    if (e.currentTarget === e.target) {
        currentlySelected.forEach((row) => {
            row.classList.remove("selected");
        });
        currentlySelected = [];
    }
});
document.addEventListener("contextmenu", (e) => {
    if (e.shiftKey) {
        return;
    }
    e.preventDefault();
    const boundingRect = window.frameElement.getBoundingClientRect();

    // var contextmenu = document.querySelector("#contextMenu");

    // contextmenu.style.left = e.pageX + "px";
    // contextmenu.style.top = e.pageY + "px";
    // const hasSelection = currentlySelected.length > 0;
    // for (const elt of contextmenu.getElementsByClassName("needs-selection")) {
    //     elt.ariaDisabled = !hasSelection;
    //     elt.onclick = hasSelection ? elt.onclick : null;
    // }
    // contextmenu.style.removeProperty("display");
    const containsApps = currentlySelected.map((item) => item.getAttribute("data-path").split(".").slice("-1")[0]).filter((item) => item == "app" || item == "lib").length > 0;

    if (containsApps) {
        appcontextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y);
        newcontextmenu.hide();
        emptycontextmenu.hide();
    } else if (currentlySelected.length != 0) {
        newcontextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y);
        appcontextmenu.hide();
        emptycontextmenu.hide();
    } else {
        emptycontextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y);
        newcontextmenu.hide();
        appcontextmenu.hide();
    }
});

document.addEventListener("click", (e) => {
    if (
        !document.querySelector("#contextMenu").contains(e.target) ||
        !e.target.ariaDisabled
    ) {
        // document.querySelector("#contextMenu").style.setProperty("display", "none");
        newcontextmenu.hide();
        appcontextmenu.hide();
        emptycontextmenu.hide();
    }
});

function newFolder(path) {
    if (path === undefined) {
        path =
            document
                .querySelector(".breadcrumbs")
                .getAttribute("data-current-path") +
            "/" +
            prompt("Folder Name: ");
    }
    fs.mkdir(path);
    reload();
}

function newFile(path) {
    if (path === undefined) {
        path =
            document
                .querySelector(".breadcrumbs")
                .getAttribute("data-current-path") +
            "/" +
            prompt("File Name: ");
    }
    fs.writeFile(path, "");
    reload();
}

function reload() {
    loadPath(
        document
            .querySelector(".breadcrumbs")
            .getAttribute("data-current-path"),
    );
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
    if (currentlySelected.length == 0) {
        anura.notifications.add({
            title: "Filesystem app",
            description: "BUG: You have no files selected, right clicking does not select files",
            timeout: 5000,
        });
    }
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

function paste() {
    const path = document
        .querySelector(".breadcrumbs")
        .getAttribute("data-current-path");
    if (!removeAfterPaste) {
        // copy
        destination = path;
        clipboard.forEach((item) => {
            origin = item.getAttribute("data-path");
            fs.stat(origin, function (err, data) {
                if (data.isDirectory()) {
                    // Ok so you are about to be in for a ride
                    sh.ls(
                        origin,
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

                                const topLevelFolder = origin;
                                dirs.push(origin);
                                if (entry.type === "DIRECTORY") {
                                    recurse(entry, origin + "/" + entry.name);
                                    dirs.push(origin + "/" + entry.name);
                                } else {
                                    items.push(origin + "/" + entry.name);
                                }
                            });
                            destItems = [];
                            destDirs = [];
                            numberToSubBy =
                                origin.length - origin.split("/").pop().length;

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
                            console.log("initials");
                            console.log(items);
                            console.log("destinations");
                            console.log(destItems);
                            console.log("directories to mkdir -p ");
                            console.log(destDirs);
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
                                fs.readFile(items[item], function (err, data) {
                                    fs.writeFile(destItems[item], data);
                                });
                            }
                            reload();
                        },
                    );
                } else {
                    fs.readFile(origin, function (err, data) {
                        if (err) throw err;
                        fs.writeFile(
                            `${path}/${origin.split("/").slice("-1")[0]}`, data
                        );
                        reload();
                    });
                }
            });
        });
    }
    if (removeAfterPaste) {
        // cut
        clipboard.forEach((item) => {
            itemName = item.getAttribute("data-path");
            fs.rename(
                itemName,
                `${path}/${itemName.split("/").slice("-1")[0]}`,
                function (err) {
                    if (err) throw err;
                    reload();
                },
            );
        });
    }
}

function rename() {
    const path = document
        .querySelector(".breadcrumbs")
        .getAttribute("data-current-path");
    if (currentlySelected.length == 0) {
        anura.notifications.add({
            title: "Filesystem app",
            description: "BUG: You have no files selected, right clicking does not select files",
            timeout: 5000,
        });
        
        return;
    }
    if (currentlySelected.length > 1) {
        anura.notifications.add({
            title: "Filesystem app",
            description: "Renaming only works with one file",
            timeout: 5000,
        });
        return;
    }
    fs.rename(
        currentlySelected[0].getAttribute("data-path"),
        `${path}/${prompt("filename:")}`,
        function (err) {
            if (err) throw err;
            reload();
        },
    );
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

loadPath("/");
