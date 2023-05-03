const $ = document.querySelector.bind(document);
function openBrowser() {
    let dialog = AliceWM.create("AboutBrowser");

    let iframe = document.createElement("iframe")
    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
    iframe.setAttribute("src", "/browser.html")

    dialog.content.appendChild(iframe)
}
function openAppManager() {
    fetch("applicationmanager/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            window.eval(data);
        })
}

const sleep = (milliseconds) => new Promise(resolve => setTimeout(resolve, milliseconds))

document.addEventListener("DOMContentLoaded", async () => {
    await sleep(2000); // your boot times shall always be slow (instead probably add v86 boot here)
    document.querySelector(".bootsplash").style.setProperty("display", "none");
    console.debug("boot completed");
    document.dispatchEvent(new Event("anura-boot-completed"));
});

document.addEventListener("anura-boot-completed", () => {
    if(!localStorage['anura-oobe-completed']) {
        console.debug("starting fake oobe");
        document.querySelector(".oobe").style.removeProperty("display");
        document.querySelector(".oobe #bottomButtons .preferredButton").addEventListener("click", () => {
            document.dispatchEvent(new Event("anura-oobe-completed"));
            document.querySelector('.oobe').style.setProperty("display", "none");
            // this is a skip button since oobe isn't complete so
        })
        return;
    }
    document.dispatchEvent(new Event("anura-oobe-completed"));
});

document.addEventListener("anura-oobe-completed", () => {
    anura = {
        init() {
            if (localStorage.getItem("use-expirimental-fs") === "true") {
                const script = document.createElement('script');
                script.src = "/assets/libs/filer.min.js"
                script.onload = () => {
                    anura.fs = new Filer.FileSystem({
                        name: "anura-mainContext",
                        provider: new Filer.FileSystem.providers.IndexedDB()
                    });
                    anura.fs.readFileSync = async (path) => {
                        return await new Promise((resolve, reject) => {
                            return anura.fs.readFile(path, function async(err, data) {
                                resolve(new TextDecoder('utf8').decode(data))
                            })
                        })
                    }
                }
                document.head.appendChild(script)
            }
        },
        fs: undefined,
        syncRead: {

        },
        apps: {},
        Version: "0.1.0 alpha",
        async registerApp(location) {
            let resp = await fetch(`${location}/manifest.json`);
            let manifest = await resp.json()
            let app = {
                name: manifest.name,
                location,
                manifest,
                windowinstance: null,
                async launch() {
                    if (manifest.type == 'manual') { // This type of application is discouraged for sure but is the most powerful
                            fetch(`${location}/${manifest.handler}`)
                                .then(response => response.text())
                                .then((data) => {
                                    top.window.eval(data);
                                    top.window.eval(`loadingScript("${location}")`)
                                })
                    } else {
                        if (this.windowinstance) return;
                        let win = AliceWM.create(this.manifest.wininfo, () => {
                            this.windowinstance = null;
                        });

                        let iframe = document.createElement("iframe")
                        iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
                        iframe.setAttribute("src", `${location}/${manifest.index}`);

                        win.content.appendChild(iframe);


                        this.windowinstance = win;
                    }
                },
            };
            if (!manifest.hidden) {
                let appsContainer = $("#appsView");
                let shortcut = $("#appTemplate").content.cloneNode(true);
                shortcut.querySelector(".app-shortcut-name").innerText = manifest.name;
                if (manifest["icon"]) {
                    shortcut.querySelector(".app-shortcut-image").src = `${location}/${manifest["icon"]}`
                }
                shortcut.querySelector(".app-shortcut-image").addEventListener("click", () => {
                    app.launch();
                });
                appsContainer.appendChild(shortcut);
            }
            anura.apps[manifest.package] = app;
            return app;
        }
    }

    anura.init()

    anura.registerApp("browser.app");
    anura.registerApp("crostini.app");
    
    document.addEventListener("contextmenu", function(e) {
        if (e.shiftKey) return;
        e.preventDefault();

        const menu = document.querySelector(".custom-menu");
        menu.style.removeProperty("display");
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
    });

    document.addEventListener("click", (e) => {
        if (e.button != 0) return;
        document.querySelector(".custom-menu").style.setProperty("display", "none");
    });

    window.anura = anura;
});
