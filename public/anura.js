anura = {
    init() {
        if (localStorage.getItem("x86-enabled")) {
            const script = document.createElement('script');
            script.src = "https://cheerpxdemos.leaningtech.com/publicdeploy/20220131_700/cx.js"
            script.onload = () => {
                async function cxReady(cx)
                {
                    // Cool proprietary stuff, try not to touch it if you dont need to because its easy to break and hard to fix
                    x86 = AliceWM.create("x86 bash window")
                    let console = document.createElement("pre")
                    console.id = "console"
                    console.style = "width:100%;height:100%;margin:0"
                    x86.content.appendChild(console)
                    cx.setConsole(document.getElementById("console"));
                    anura.x86 = cx
                    cx.run("/bin/bash",  ["--login"], ["HOME=/home/user", "TERM=xterm", "USER=user", "SHELL=/bin/bash", "EDITOR=vim", "LANG=en_US.UTF-8", "LC_ALL=C"]);
                }
                function cxFailed(e)
                {
                    console.log("CheerpX could not start. Reason: "+e);
                }
                CheerpXApp.create({mounts:[{type:"cheerpOS",dev:"/app",path:"/"},{type:"cheerpOS",dev:"/app",path:"/app"},{type:"cheerpOS",dev:"/str",path:"/data"},{type:"cheerpOS", dev:"/files", path:"/home"},{type:"devs",dev:"",path:"/dev"}]}).then(cxReady, cxFailed);

        }
        document.head.appendChild(script)
        if (localStorage.getItem("")) {

        }
        }
    },
    Version: "0.1.0 alpha",
    x86fs: {
        read() {
            
        },
        write(path, data) {
            cheerpjAddStringFile("/files/" + path, data);
        }
    }

}

anura.init()
function openBrowser() {
    let dialog = AliceWM.create("AboutBrowser");

    let iframe = document.createElement("iframe")
    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
    iframe.setAttribute("src", "http://localhost:8080/browser.html")

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
