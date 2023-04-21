chimera = {
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

                    chimera.x86 = cx


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
                chimera.fs = new Filer.FileSystem({
                    name: "chimera-mainContext",
                    provider: new Filer.FileSystem.providers.IndexedDB()
                });
                chimera.fs.readFileSync = async (path) => {
                    return await new Promise((resolve,reject)=>{
                        return chimera.fs.readFile(path, function async(err, data) {
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
                pythonInterpreter.globals.set('chimera', chimera)
                resolve(pythonInterpreter)
            }
            document.body.appendChild(iframe)
        })
    }

}

chimera.init()
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
document.addEventListener("contextmenu", function(e){
    e.preventDefault();
    if (document.querySelector(".custom-menu")) return;
  
    const menu = document.createElement("div");
    menu.classList.add("custom-menu");
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;

const options = [
  { name: `<span class="material-symbols-outlined"><span class="material-symbols-outlined">
shelf_auto_hide
</span></span> Always Show Shelf`, action: function () { } },
  { name: `<span class="material-symbols-outlined">shelf_position</span>Shelf Position`, action: function () { } },
  {
  name: `<span class="material-symbols-outlined">brush</span> Set Wallpaper and Style`,
  action: function () {
    const htmlString = ``;
      
     const parser = new DOMParser();
    const htmlDoc = parser.parseFromString(htmlString, 'text/html');

    const htmlElement = htmlDoc.documentElement;
    document.body.appendChild(htmlElement);
  }
},

];

options.forEach(function (option) {
  const item = document.createElement("div");
  item.classList.add("custom-menu-item");
  item.innerHTML = option.name;
  item.addEventListener("click", function () {
    menu.remove();
    option.action();
  });
  menu.appendChild(item);
});


    document.body.appendChild(menu);
});

document.addEventListener("click", function(){
    if (document.querySelector(".custom-menu")) {
        document.querySelector(".custom-menu").remove();
    }
});

const style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = `
.custom-menu {
    position: absolute;
    border: 1px solid #000000;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 20px;
    padding: 10px 0;
    width: 300px;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);
    z-index: 10000;
    overflow: hidden;
}
.custom-menu-item {
    padding: 8px 12px;
    color: #ffffff;
    cursor: pointer;
    user-select: none;
}
.custom-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.material-symbols-outlined {
    font-family: 'Material Symbols Outlined', sans-serif;
}
.custom-menu-item {
  display: flex;
  align-items: center;
  padding: 8px 12px;
  color: #ffffff;
  cursor: pointer;
  user-select: none;
}

.custom-menu-item .material-symbols-outlined {
  margin-top: 0.05px;
  margin-right: 5px;
  padding-left: 1px;
}


`;
document.head.appendChild(style);

// Link to Google Fonts API
const link = document.createElement('link');
link.rel = 'stylesheet';
link.href = 'https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200';
document.head.appendChild(link);
