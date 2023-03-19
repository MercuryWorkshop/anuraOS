anura = {
    init() {
        if (localStorage.getItem("x86-enabled")) {
            const script = document.createElement('script');
            script.src = "https://cheerpxdemos.leaningtech.com/publicdeploy/20230116/cx.js"
            script.onload = () => {
                async function cxReady(cx)
                {
                    // Cool proprietary stuff, try not to touch it if you dont need to because its easy to break and hard to fix
                    x86 = AliceWM.create("x86 bash window")
                    console = document.createElement("pre")
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
                CheerpXApp.create({mounts:[{type:"cheerpOS",dev:"/app",path:"/"},{type:"cheerpOS",dev:"/app",path:"/app"},{type:"cheerpOS",dev:"/str",path:"/data"},{type:"cheerpOS", dev:"/files", path:"/home"},{type:"devs",dev:"",path:"/dev"}]}).then(cxReady, cxFailed);            console.log(script)

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