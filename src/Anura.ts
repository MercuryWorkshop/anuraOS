declare var Filer: any;

const $ = document.querySelector.bind(document);

let taskbar = new Taskbar();
let launcher = new Launcher();
let contextMenu = new ContextMenu();
let bootsplash = new Bootsplash();
let oobeview = new OobeView();
let oobewelcomestep = new OobeWelcomeStep();
let oobeassetsstep = new OobeAssetsStep();


class Anura {
    x86: null | V86Backend;
    constructor() {


        if (localStorage.getItem("use-expirimental-fs") === "true") {
            this.fs = new Filer.FileSystem({
                name: "anura-mainContext",
                provider: new Filer.FileSystem.providers.IndexedDB()
            });
            this.fs.readFileSync = async (path: string) => {
                return await new Promise((resolve, reject) => {
                    return anura.fs.readFile(path, function async(err: any, data: any) {
                        resolve(new TextDecoder('utf8').decode(data))
                    })
                })
            }


        }
    }
    fs: any = undefined
    syncRead = {}
    apps: any = {}
    Version = "0.2.0 alpha"
    logger = {
        log: Function = console.log.bind(console, "anuraOS:"),
        debug: Function = console.debug.bind(console, "anuraOS:"),
        warn: Function = console.warn.bind(console, "anuraOS:"),
        error: Function = console.error.bind(console, "anuraOS:")
    }
    x86fs = {
        async read(path: string) {
            // return await new Promise((resolve, reject) => {
            //     return cheerpOSGetFileBlob([], "/files/" + path, async (blob) => {
            //         resolve(await blob.text())
            //     })
            // })
        },
        write(path: string, data: string) {
            // cheerpjAddStringFile(`/str/${path}`, data);
            // Depressingly, we can't actually transfer the file to /home without it crashing the users shell //
            // The user must do it themselves //
        }
    }
    async registerApp(location: string) {
        let resp = await fetch(`${location}/manifest.json`);
        let manifest = await resp.json()

        let app = {
            name: manifest.name,
            location,
            manifest,
            windowinstance: null,
            async launch() {
                if (manifest.type == 'manual') { // This type of application is discouraged for sure but is the most powerful
                    let req = await fetch(`${location}/${manifest.handler}`)
                    let data = await req.text();
                    top!.window.eval(data);
                    // top!.window.eval(`loadingScript("${location}",)`)
                    // @ts-ignore
                    loadingScript(location, app);
                } else {
                    // if (this.windowinstance) return;
                    let win = AliceWM.create(this.manifest.wininfo, (_: any) => {
                    });
                    this.windowinstance = win;

                    let iframe: any = document.createElement("iframe")
                    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
                    iframe.setAttribute("src", `${location}/${manifest.index}`);

                    win.content.appendChild(iframe);
                }
            },
        };

        launcher.addShortcut(manifest.name, manifest.icon ? `${location}/${manifest.icon}` : "", app.launch.bind(app));

        taskbar.addShortcut(`${location}/${manifest.icon}`, app.launch.bind(app));

        this.apps[manifest.package] = app;
        return app;
    }
    async python(appname: string) {
        return await new Promise((resolve, reject) => {
            let iframe = document.createElement("iframe")
            iframe.setAttribute("style", "display: none")
            iframe.setAttribute("src", "/apps/python.app/lib.html")
            iframe.id = appname
            iframe.onload = async function() {
                console.log("Called from python")
                //@ts-ignore
                let pythonInterpreter = await document.getElementById(appname).contentWindow.loadPyodide({
                    stdin: () => {
                        let result = prompt();
                        //@ts-ignore
                        echo(result);
                        return result;
                    },
                });
                pythonInterpreter.globals.set('AliceWM', AliceWM)
                pythonInterpreter.globals.set('anura', anura)
                //@ts-ignore
                pythonInterpreter.window = document.getElementById(appname).contentWindow;
                resolve(pythonInterpreter)
            }
            document.body.appendChild(iframe)
        })
    }
}

function openAppManager() {
    fetch("applicationmanager/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            window.eval(data);
        })
}

let anura: Anura;
const sleep = (milliseconds: number) => new Promise(resolve => setTimeout(resolve, milliseconds))

window.addEventListener("load", async () => {
    document.body.appendChild(bootsplash.element);

    await sleep(2000);
    anura = new Anura();
    (window as any).anura = anura;

    bootsplash.element.remove();
    anura.logger.debug("boot completed");
    document.dispatchEvent(new Event("anura-boot-completed"));
});

document.addEventListener("anura-boot-completed", async () => {
    // document.body.appendChild(oobeview.element);
    // oobeview.content.appendChild(oobewelcomestep.element);
    // oobewelcomestep.nextButton.addEventListener("click", () => {
    //     oobewelcomestep.element.remove();
    //     oobeview.content.appendChild(oobeassetsstep.element);
    //     oobeassetsstep.nextButton.addEventListener("click", () => {
    //         oobeview.element.remove();
    document.dispatchEvent(new Event("anura-login-completed"));
    //     });
    // });
});

document.addEventListener("anura-login-completed", async () => {
    anura.registerApp("apps/browser.app");
    anura.registerApp("apps/term.app");
    anura.registerApp("apps/glxgears.app");
    anura.registerApp("apps/eruda.app");
    anura.registerApp("apps/vnc.app");
    anura.registerApp("apps/sshy.app"); // ssh will be reworked later
    anura.registerApp("apps/fsapp.app");
    anura.registerApp("apps/chideNew.app");
    anura.registerApp("apps/python.app");
    // anura.registerApp("games.app");
    // if you want to use the games app, uncomment this, clone the repo in /apps 
    // and rename it to games.app
    // the games app is too large and unneccesary for ordinary developers

    if (localStorage.getItem("x86-enabled") === "true") {
        let mgr = await anura.registerApp("apps/x86mgr.app");
        await mgr.launch();

        let slice_size = 2 ** 17 * 32; //this should be optimal

        let finp: HTMLInputElement = React.createElement("input", { type: "file", id: "input" }) as unknown as HTMLInputElement;
        document.body.appendChild(finp);



        const request = indexedDB.open("image", 2);
        request.onupgradeneeded = (event: any) => {
            const db: IDBDatabase = event.target.result;

            db.createObjectStore("parts");
        };
        let db: IDBDatabase = (await new Promise(r => request.onsuccess = r) as any).target.result;


        (window as any).file2 = async (f: File) => {
            let trn = db.transaction("parts", "readwrite").objectStore("parts");
            trn.put(f.size, "size");

            let i = 0;
            while (i * slice_size < f.size) {

                let buf = await f.slice(i * slice_size, (i + 1) * slice_size).arrayBuffer();
                await new Promise(r => db.transaction("parts", "readwrite").objectStore("parts").put(buf, i).onsuccess = r);
                i++;

                if (i % 10 == 0) {
                    console.log(i / (f.size / slice_size));
                }
            }
        }


        let size = (await new Promise(r => db.transaction("parts").objectStore("parts").get("size").onsuccess = r) as any).target.result;
        console.log(size);


        const fakefile = {
            size: size,
            slice: async (start: number, end: number) => {
                let starti = Math.floor(start / slice_size);
                let endi = Math.floor(end / slice_size);

                // console.log(`${start}-${end}`);





                let i = starti;


                let buf = null;

                while (i <= endi) {
                    let part: ArrayBuffer = (await new Promise(r => db.transaction("parts").objectStore("parts").get(i).onsuccess = r) as any).target.result;
                    let slice = part.slice(Math.max(0, start - (i * slice_size)), end - (i * slice_size));
                    if (buf == null) {
                        buf = slice;
                    } else {
                        buf = catBufs(buf, slice);
                    }

                    i++;
                }




                return new Blob([buf!]);

            },
            save: async () => {

                // this can be greatly optimized. first bunch together everything that shares a slice, do changes, then put() in once sweep
                const buf_size = 256;
                for (let [offset, buffer] of anura.x86?.emulator.disk_images.hda.block_cache) {
                    let start = offset * buf_size;


                    let starti = Math.floor(start / slice_size);
                    let endi = Math.floor((start + buf_size) / slice_size);
                    console.log(start);



                    let i = starti;


                    while (i <= endi) {
                        let slice = buffer.slice(0, Math.min(buf_size, slice_size - start));



                        let part: ArrayBuffer = (await new Promise(r => db.transaction("parts").objectStore("parts").get(i).onsuccess = r) as any).target.result;
                        let tmpb = new Uint8Array(part);

                        if ((start % slice_size) + 256 > slice_size) {
                            console.error("data corruption");
                        }


                        tmpb.set(slice, start % slice_size);

                        await new Promise(r => db.transaction("parts", "readwrite").objectStore("parts").put(tmpb.buffer, i).onsuccess = r);

                        i++;
                    }
                }
                console.log("x");
                return "h";

            }
        };
        (window as any).fakefile = fakefile;
        // @ts-ignore
        fakefile.__proto__ = File.prototype;

        // console.log(fakefile.size)

        // finp.addEventListener("change", e => {
        anura.x86 = new V86Backend(fakefile as any);


        // })

    }
    // anura.registerApp("apps/webretro.app"); nothing here

    document.body.appendChild(contextMenu.element);
    document.body.appendChild(launcher.element);
    document.body.appendChild(taskbar.element);

    (window as any).taskbar = taskbar;

    document.addEventListener("contextmenu", function(e) {
        if (e.shiftKey) return;
        e.preventDefault();
        const menu: any = document.querySelector(".custom-menu");
        menu.style.removeProperty("display");
        menu.style.top = `${e.clientY}px`;
        menu.style.left = `${e.clientX}px`;
    });

    document.addEventListener("click", (e) => {
        if (e.button != 0) return;
        (document.querySelector(".custom-menu")! as HTMLElement).style.setProperty("display", "none");
    });

});
function catBufs(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    var tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}
