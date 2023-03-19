anura = {
    init() {
        if (localStorage.getItem("x86-enabled")) {
            const script = document.createElement('script');
            script.src = "https://cheerpxdemos.leaningtech.com/publicdeploy/cx.js"
            script.onload = () => { 
                async function cxReady(cx)
                {
                    // 
                    x86 = AliceWM.create("x86 bash window")
                    console = document.createElement("pre")
                    console.id = "console"
                    console.style = "width:100%;height:100%;margin:0"
                    x86.content.appendChild(console)
                    cx.setConsole(document.getElementById("console"));
                    
                    cx.run("/hello", []);
                }
                function cxFailed(e)
                {
                    console.log("CheerpX could not start. Reason: "+e);
                }
                CheerpXApp.create({mounts: [{type:"cheerpOS", dev:"/files",path:"/home"}, {type:"devs",dev:"",path:"/dev"}]})
                    .then(cxReady, cxFailed);
            }
            console.log(script)
            document.head.appendChild(script)

        }
        if (localStorage.getItem("")) {

        }
    },
    Version: "0.1.0 alpha"

}

anura.init()