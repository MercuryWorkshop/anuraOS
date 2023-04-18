anura = {
    init() {
        if (localStorage.getItem("x86-enabled") === "true") {
            const script = document.createElement('script');
            script.src = "https://cheerpxdemos.leaningtech.com/publicdeploy/20230321/cx.js"
            script.onload = () => {
                async function cxReady(cx) {
                    // Cool proprietary stuff, try not to touch it if you dont need to because its easy to break and hard to fix
                    x86 = AliceWM.create("x86 bash window")
                    let htermNode = document.createElement("div")

                    console.id = "console"

                    const cxOut = document.createElement("pre");

                    const t = new Terminal({ fontFamily: "monospace", cursorBlink: true, convertEol: true, fontWeight: 400, fontWeightBold: 700 });
                    var fitAddon = new FitAddon.FitAddon();
                    t.loadAddon(fitAddon);
                    t.open(htermNode);
                    // fitAddon.fit();
                    let cxReadFunc = null;
                    function readData(str) {
                        if (cxReadFunc == null)
                            return;
                        for (var i = 0; i < str.length; i++)
                            cxReadFunc(str.charCodeAt(i));
                    }

                    t.onData(readData);

                    x86.content.appendChild(htermNode);

                    anura.x86 = cx


                    const decoder = new TextDecoder("UTF-8");
                    cxReadFunc = cx.setCustomConsole((dat) => {
                        t.write(new Uint8Array(dat))
                    }, t.cols, t.rows)
                    window.t = t;
                    cx.run("/bin/bash", ["--login"], ["HOME=/home/user", "TERM=xterm", "USER=user", "SHELL=/bin/bash", "EDITOR=vim", "LANG=en_US.UTF-8", "LC_ALL=C"]);

                }
                function cxFailed(e) {
                    console.log("CheerpX could not start. Reason: " + e);
                }
                CheerpXApp.create({ mounts: [{ type: "cheerpOS", dev: "/app", path: "/" }, { type: "cheerpOS", dev: "/app", path: "/app" }, { type: "cheerpOS", dev: "/str", path: "/data" }, { type: "cheerpOS", dev: "/files", path: "/home" }, { type: "devs", dev: "", path: "/dev" }] }).then(cxReady, cxFailed);

            }
            document.head.appendChild(script)
            
        }

        if (localStorage.getItem("use-expirimental-fs") === "true") {
            const script = document.createElement('script');
            script.src = "/assets/libs/filer.min.js"
            script.onload = () => {
                anura.fs = new Filer.FileSystem({
                    name: "anura-mainContext",
                    provider: new Filer.FileSystem.providers.IndexedDB()
                });
                anura.fs.readFileSync = async (path) => {
                    return await new Promise((resolve,reject)=>{
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
    Version: "0.1.0 alpha",
    x86fs: {
        async read(path) {
            return await new Promise((resolve,reject)=>{
                return cheerpOSGetFileBlob([], "/files/" + path, async (blob) => {
                    resolve(await blob.text())
                })
            })
        },
        write(path, data) {
            cheerpjAddStringFile(`/str/${path}`, data); 
            // Depressingly, we can't actually transfer the file to /home without it crashing the users shell //
            // The user must do it themselves //
        }
    },
    async python(appname) {
        return await new Promise((resolve, reject) => {
            let iframe = document.createElement("iframe")
            iframe.style = "display: none"
            iframe.setAttribute("src", "/python.app/lib.html")
            iframe.id = appname
            iframe.onload = async function () {
                console.log("Called from python")
                let pythonInterpreter = await document.getElementById(appname).contentWindow.loadPyodide({
                stdin: () => {
                        let result = prompt();
                        echo(result);
                        return result;
                    },
                });
                pythonInterpreter.globals.set('AliceWM', AliceWM)
                pythonInterpreter.globals.set('anura', anura)
                resolve(pythonInterpreter)
            }
            document.body.appendChild(iframe)
        })
    }

}

anura.init()
function openBrowser() {
    let dialog = AliceWM.create("AboutBrowser");

    let iframe = document.createElement("iframe")
    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
    iframe.setAttribute("src", "/browser.html")

    dialog.content.appendChild(iframe)
}
function openVMManager() {
    let dialog = AliceWM.create("Virtual Machine");

    let iframe = document.createElement("iframe")
    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
    iframe.setAttribute("src", "https://copy.sh/v86")

    dialog.content.appendChild(iframe)
}
function openAppManager() {
    fetch("applicationmanager/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            window.eval(data);
        })
}
