const fflate = await anura.import("npm:fflate");
const mime = await anura.import("npm:mime");
const Buffer = Filer.Buffer;

export async function createAppView(dataPath, type) {
    let data = await anura.fs.promises.readFile(dataPath);

    const path = dataPath.split(".").slice(0, -1).join(".");

    const zip = await unzip(new Uint8Array(data));
    const manifest = JSON.parse(new TextDecoder().decode(zip["manifest.json"]));
    const icon = new Blob([zip[manifest.icon]], {
        type: mime.default.getType(manifest.icon),
    });

    const win = anura.wm.createGeneric({
        title: "",
        width: "450px",
        height: "525px",
    });

    win.onclose = () => {
        URL.revokeObjectURL(icon);
    };

    const iframe = document.createElement("iframe");

    iframe.setAttribute(
        "src",
        localPathToURL(
            "appview.html?manifest=" +
                ExternalApp.serializeArgs([
                    JSON.stringify(manifest),
                    URL.createObjectURL(icon),
                    type,
                ]),
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
            session: async () => {
                anura.notifications.add({
                    title: "Installing for Session",
                    description: `${path.replace(
                        "//",
                        "/",
                    )} is being installed, please wait`,
                    timeout: 50000,
                });
                await anura.fs.mkdir(`${path.replace("//", "/")}`);
                try {
                    for (const [relativePath, content] of Object.entries(zip)) {
                        if (relativePath.endsWith("/")) {
                            anura.fs.mkdir(`${path}/${relativePath}`);
                        } else {
                            anura.fs.writeFile(
                                `${path}/${relativePath}`,
                                await Buffer.from(content),
                            );
                        }
                    }
                    await anura.registerExternalApp(
                        `/fs${path}`.replace("//", "/"),
                    );
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
            },
            permanent: async () => {
                anura.notifications.add({
                    title: "Installing",
                    description: `${path.replace(
                        "//",
                        "/",
                    )} is being installed, please wait`,
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
            },
        },
    });

    iframe.contentWindow.addEventListener("load", () => {
        const matter = document.createElement("link");
        matter.setAttribute("rel", "stylesheet");
        matter.setAttribute("href", "/assets/matter.css");
        iframe.contentDocument.head.appendChild(matter);
    });
}

// will do later
export async function createAppViewFolder() {
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
        document.location.href.split("/").slice(0, -1).join("/") +
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
                        .replace("//", "/")} has been installed permanently`,
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
}

function localPathToURL(path) {
    return (
        import.meta.url.substring(0, import.meta.url.lastIndexOf("/")) +
        "/" +
        path
    );
}

function unzip(zip) {
    return new Promise((res, rej) => {
        fflate.unzip(zip, (err, unzipped) => {
            if (err) rej(err);
            else res(unzipped);
        });
    });
}
