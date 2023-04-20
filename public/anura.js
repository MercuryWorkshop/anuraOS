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
    const htmlString = `<!DOCTYPE html> <html lang="en">
  <head>
    <script>// Add styles to the body element to allow dragging
document.body.style.position = 'absolute';
document.body.style.left = '0';
document.body.style.top = '0';

// Add event listeners for drag interactions
let offsetX, offsetY;

document.body.addEventListener('dragstart', function(event) {
  offsetX = event.offsetX;
  offsetY = event.offsetY;
});

document.body.addEventListener('drag', function(event) {
  event.preventDefault();
  document.body.style.left = (event.clientX - offsetX) + 'px';
  document.body.style.top = (event.clientY - offsetY) + 'px';
});

// Set the draggable attribute to true on the body element
document.body.setAttribute('draggable', 'true');
</script
    <title>wallpaper editor</title>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <meta name="color-scheme" content="light only" />
    <meta name="description" content="stuff" />
    <meta property="og:site_name" content="anurathingyidksoyeah" />
    <meta property="og:title" content="anurathingyidksoyeah" />
    <meta property="og:type" content="website" />
    <meta property="og:description" content="stuff" />
    <meta property="og:image:type" content="image/jpeg" />
    <meta property="og:image:width" content="1280" />
    <meta property="og:image:height" content="800" />
    <link
      href="https://fonts.googleapis.com/css?display=swap&family=Source+Sans+Pro:400,400italic"
      rel="stylesheet"
      type="text/css"
    />
    <style>
      html,
      body,
      div,
      span,
      applet,
      object,
      iframe,
      h1,
      h2,
      h3,
      h4,
      h5,
      h6,
      p,
      blockquote,
      pre,
      a,
      abbr,
      acronym,
      address,
      big,
      cite,
      code,
      del,
      dfn,
      em,
      img,
      ins,
      kbd,
      q,
      s,
      samp,
      small,
      strike,
      strong,
      sub,
      sup,
      tt,
      var,
      b,
      u,
      i,
      center,
      dl,
      dt,
      dd,
      ol,
      ul,
      li,
      fieldset,
      form,
      label,
      legend,
      table,
      caption,
      tbody,
      tfoot,
      thead,
      tr,
      th,
      td,
      article,
      aside,
      canvas,
      details,
      embed,
      figure,
      figcaption,
      footer,
      header,
      hgroup,
      menu,
      nav,
      output,
      ruby,
      section,
      summary,
      time,
      mark,
      audio,
      video {
        margin: 0;
        padding: 0;
        border: 0;
        font-size: 100%;
        font: inherit;
        vertical-align: baseline;
      }
      article,
      aside,
      details,
      figcaption,
      figure,
      footer,
      header,
      hgroup,
      menu,
      nav,
      section {
        display: block;
      }
      body {
        line-height: 1;
      }
      ol,
      ul {
        list-style: none;
      }
      blockquote,
      q {
        quotes: none;
      }
      blockquote:before,
      blockquote:after,
      q:before,
      q:after {
        content: "";
        content: none;
      }
      table {
        border-collapse: collapse;
        border-spacing: 0;
      }
      body {
        -webkit-text-size-adjust: none;
      }
      mark {
        background-color: transparent;
        color: inherit;
      }
      input::-moz-focus-inner {
        border: 0;
        padding: 0;
      }
      input[type="text"],
      input[type="email"],
      select,
      textarea {
        -moz-appearance: none;
        -webkit-appearance: none;
        -ms-appearance: none;
        appearance: none;
      }
      *,
      *:before,
      *:after {
        box-sizing: border-box;
      }
      body {
        line-height: 1;
        min-height: var(--viewport-height);
        min-width: 320px;
        overflow-x: hidden;
        word-wrap: break-word;
        background-color: #ffffff;
      }
      :root {
        --background-height: 100vh;
        --site-language-alignment: left;
        --site-language-direction: ltr;
        --site-language-flex-alignment: flex-start;
        --site-language-indent-left: 1;
        --site-language-indent-right: 0;
        --viewport-height: 100vh;
      }
      html {
        font-size: 18pt;
      }
      u {
        text-decoration: underline;
      }
      strong {
        color: inherit;
        font-weight: bolder;
      }
      em {
        font-style: italic;
      }
      code {
        background-color: rgba(144, 144, 144, 0.25);
        border-radius: 0.25em;
        font-family: "Lucida Console", "Courier New", monospace;
        font-size: 0.9em;
        font-weight: normal;
        letter-spacing: 0;
        margin: 0 0.25em;
        padding: 0.25em 0.5em;
        text-indent: 0;
      }
      mark {
        background-color: rgba(144, 144, 144, 0.25);
      }
      s {
        text-decoration: line-through;
      }
      sub {
        font-size: smaller;
        vertical-align: sub;
      }
      sup {
        font-size: smaller;
        vertical-align: super;
      }
      a {
        color: inherit;
        text-decoration: underline;
        transition: color 0.25s ease;
      }
      #wrapper {
        -webkit-overflow-scrolling: touch;
        align-items: center;
        display: flex;
        flex-direction: column;
        justify-content: center;
        min-height: var(--viewport-height);
        overflow: hidden;
        position: relative;
        z-index: 2;
        padding: 1.25rem 1.25rem 1.25rem 1.25rem;
      }
      #main {
        --alignment: center;
        --flex-alignment: center;
        --indent-left: 1;
        --indent-right: 1;
        --border-radius-tl: 0;
        --border-radius-tr: 0;
        --border-radius-br: 0;
        --border-radius-bl: 0;
        align-items: center;
        display: flex;
        flex-grow: 0;
        flex-shrink: 0;
        justify-content: center;
        max-width: 100%;
        position: relative;
        text-align: var(--alignment);
        z-index: 1;
        background-image: url("data:image/svg+xml;charset=utf8,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20viewBox%3D%220%200%20512%20512%22%20width%3D%22512%22%20height%3D%22512%22%20preserveAspectRatio%3D%22none%22%3E%20%3Cstyle%3E%20rect%20%7B%20fill%3A%20rgba(255,255,255,0.051)%3B%20%7D%20%3C%2Fstyle%3E%20%3Crect%20x%3D%220%22%20y%3D%220%22%20width%3D%2250%25%22%20height%3D%2250%25%22%20%2F%3E%20%3Crect%20x%3D%2250%25%22%20y%3D%2250%25%22%20width%3D%2250%25%22%20height%3D%2250%25%22%20%2F%3E%3C%2Fsvg%3E"),
          linear-gradient(45deg, #d9b2b2 0%, #96a9eb 60%);
        background-size: 256px, cover;
        background-position: center, 0% 0%;
        background-repeat: repeat, repeat;
      }
      #main > .inner {
        --padding-horizontal: 2.5rem;
        --padding-vertical: 1.125rem;
        --spacing: 0.75rem;
        --width: 42rem;
        border-radius: var(--border-radius-tl) var(--border-radius-tr)
          var(--border-radius-br) var(--border-radius-bl);
        max-width: 100%;
        position: relative;
        width: var(--width);
        z-index: 1;
        padding: var(--padding-vertical) var(--padding-horizontal);
      }
      #main > .inner > * {
        margin-top: var(--spacing);
        margin-bottom: var(--spacing);
      }
      #main > .inner > :first-child {
        margin-top: 0 !important;
      }
      #main > .inner > :last-child {
        margin-bottom: 0 !important;
      }
      #main > .inner > .full {
        margin-left: calc(var(--padding-horizontal) * -1);
        max-width: calc(100% + calc(var(--padding-horizontal) * 2) + 0.4725px);
        width: calc(100% + calc(var(--padding-horizontal) * 2) + 0.4725px);
      }
      #main > .inner > .full:first-child {
        border-top-left-radius: inherit;
        border-top-right-radius: inherit;
        margin-top: calc(var(--padding-vertical) * -1) !important;
      }
      #main > .inner > .full:last-child {
        border-bottom-left-radius: inherit;
        border-bottom-right-radius: inherit;
        margin-bottom: calc(var(--padding-vertical) * -1) !important;
      }
      #main > .inner > .full.screen {
        border-radius: 0 !important;
        max-width: 100vw;
        position: relative;
        width: 100vw;
        left: 50%;
        margin-left: -50vw;
        right: auto;
      }
      body.is-instant #main,
      body.is-instant #main > .inner > *,
      body.is-instant #main > .inner > section > * {
        transition: none !important;
      }
      body.is-instant:after {
        display: none !important;
        transition: none !important;
      }
      h1,
      h2,
      h3,
      p {
        direction: var(--site-language-direction);
        position: relative;
      }
      h1 span.p,
      h2 span.p,
      h3 span.p,
      p span.p {
        display: block;
        position: relative;
      }
      h1 span[style],
      h2 span[style],
      h3 span[style],
      p span[style],
      h1 strong,
      h2 strong,
      h3 strong,
      p strong,
      h1 a,
      h2 a,
      h3 a,
      p a,
      h1 code,
      h2 code,
      h3 code,
      p code,
      h1 mark,
      h2 mark,
      h3 mark,
      p mark {
        -webkit-text-fill-color: currentcolor;
      }
      #text01 {
        text-align: center;
        color: #fcfcfc;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        line-height: 1.5;
        font-weight: 400;
      }
      #text01 a {
        text-decoration: underline;
      }
      #text01 a:hover {
        text-decoration: none;
      }
      #text01 span.p:nth-child(n + 2) {
        margin-top: 1rem;
      }
      #text02 {
        text-align: left;
        color: #ffffff;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        line-height: 1.5;
        font-weight: 400;
      }
      #text02 a {
        text-decoration: underline;
      }
      #text02 a:hover {
        text-decoration: none;
      }
      #text02 span.p:nth-child(n + 2) {
        margin-top: 1rem;
      }
      #text03 {
        text-align: left;
        color: #ffffff;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        line-height: 1.5;
        font-weight: 400;
      }
      #text03 a {
        text-decoration: underline;
      }
      #text03 a:hover {
        text-decoration: none;
      }
      #text03 span.p:nth-child(n + 2) {
        margin-top: 1rem;
      }
      hr {
        border: 0;
        padding: 0;
        position: relative;
        width: 100%;
      }
      hr:before {
        content: "";
        display: inline-block;
        max-width: 100%;
        vertical-align: middle;
      }
      #divider02:before {
        width: 100%;
        border-top: solid 1px #ffffff;
        height: 1px;
        margin-top: -0.5px;
      }
      #divider01:before {
        width: 100%;
        border-top: solid 1px #ffffff;
        height: 1px;
        margin-top: -0.5px;
      }
      #divider03:before {
        width: 100%;
        border-top: solid 1px #ffffff;
        height: 1px;
        margin-top: -0.5px;
      }
      .buttons {
        cursor: default;
        display: flex;
        justify-content: var(--flex-alignment);
        letter-spacing: 0;
        padding: 0;
      }
      .buttons li {
        max-width: 100%;
      }
      .buttons li a {
        align-items: center;
        justify-content: center;
        max-width: 100%;
        text-align: center;
        text-decoration: none;
        vertical-align: middle;
        white-space: nowrap;
      }
      #buttons01 {
        justify-content: flex-start;
        gap: 0.75rem;
        flex-direction: column;
        flex-wrap: nowrap;
      }
      #buttons01 li a {
        display: inline-block;
        width: auto;
        height: 2.5rem;
        line-height: calc(2.5rem - 2px);
        padding: 0 1.25rem;
        vertical-align: middle;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        font-weight: 400;
        border-radius: 0.625rem;
        direction: var(--site-language-direction);
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.25s ease, background-color 0.25s ease,
          border-color 0.25s ease;
      }
      #buttons01 .button {
        color: #ffffff;
        border: solid 1px #ffffff;
      }
      #buttons02 {
        justify-content: flex-start;
        gap: 0.75rem;
        flex-direction: column;
        flex-wrap: nowrap;
      }
      #buttons02 li a {
        display: inline-block;
        width: auto;
        height: 2.5rem;
        line-height: calc(2.5rem - 2px);
        padding: 0 1.25rem;
        vertical-align: middle;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        font-weight: 400;
        border-radius: 0.625rem;
        direction: var(--site-language-direction);
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.25s ease, background-color 0.25s ease,
          border-color 0.25s ease;
      }
      #buttons02 .button {
        color: #ffffff;
        border: solid 1px #ffffff;
      }
      #buttons03 {
        justify-content: flex-start;
        gap: 0.75rem;
        flex-direction: column;
        flex-wrap: nowrap;
      }
      #buttons03 li a {
        display: inline-block;
        width: auto;
        height: 2.5rem;
        line-height: calc(2.5rem - 2px);
        padding: 0 1.25rem;
        vertical-align: middle;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        font-weight: 400;
        border-radius: 0.625rem;
        direction: var(--site-language-direction);
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.25s ease, background-color 0.25s ease,
          border-color 0.25s ease;
      }
      #buttons03 .button {
        color: #ffffff;
        border: solid 1px #ffffff;
      }
      #buttons04 {
        justify-content: flex-start;
        gap: 0.75rem;
        flex-direction: column;
        flex-wrap: nowrap;
      }
      #buttons04 li a {
        display: inline-block;
        width: auto;
        height: 2.5rem;
        line-height: calc(2.5rem - 2px);
        padding: 0 1.25rem;
        vertical-align: middle;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        font-weight: 400;
        border-radius: 0.625rem;
        direction: var(--site-language-direction);
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.25s ease, background-color 0.25s ease,
          border-color 0.25s ease;
      }
      #buttons04 .button {
        color: #ffffff;
        border: solid 1px #ffffff;
      }
      #buttons05 {
        justify-content: flex-start;
        gap: 0.75rem;
        flex-direction: column;
        flex-wrap: nowrap;
      }
      #buttons05 li a {
        display: inline-block;
        width: auto;
        height: 2.5rem;
        line-height: calc(2.5rem - 2px);
        padding: 0 1.25rem;
        vertical-align: middle;
        font-family: "Source Sans Pro", sans-serif;
        font-size: 1em;
        font-weight: 400;
        border-radius: 0.625rem;
        direction: var(--site-language-direction);
        overflow: hidden;
        text-overflow: ellipsis;
        transition: color 0.25s ease, background-color 0.25s ease,
          border-color 0.25s ease;
      }
      #buttons05 .button {
        color: #ffffff;
        border: solid 1px #ffffff;
      }
    
      @media (max-width: 1920px) {
      }
      @media (max-width: 1680px) {
        html {
          font-size: 13pt;
        }
      }
      @media (max-width: 1280px) {
        html {
          font-size: 13pt;
        }
      }
      @media (max-width: 1024px) {
      }
      @media (max-width: 980px) {
        html {
          font-size: 11pt;
        }
      }
      @media (max-width: 736px) {
        html {
          font-size: 11pt;
        }
        #main > .inner {
          --padding-horizontal: 2rem;
          --padding-vertical: 1.125rem;
          --spacing: 0.75rem;
        }
        #text01 {
          letter-spacing: 0rem;
          width: 100%;
          font-size: 1em;
          line-height: 1.5;
        }
        #text02 {
          letter-spacing: 0rem;
          width: 100%;
          font-size: 1em;
          line-height: 1.5;
        }
        #text03 {
          letter-spacing: 0rem;
          width: 100%;
          font-size: 1em;
          line-height: 1.5;
        }
        #divider02:before {
          width: 100rem;
        }
        #divider01:before {
          width: 100rem;
        }
        #divider03:before {
          width: 100rem;
        }
        #buttons01 {
          gap: 0.75rem;
        }
        #buttons01 li a {
          letter-spacing: 0rem;
          font-size: 1em;
        }
        #buttons02 {
          gap: 0.75rem;
        }
        #buttons02 li a {
          letter-spacing: 0rem;
          font-size: 1em;
        }
        #buttons03 {
          gap: 0.75rem;
        }
        #buttons03 li a {
          letter-spacing: 0rem;
          font-size: 1em;
        }
        #buttons04 {
          gap: 0.75rem;
        }
        #buttons04 li a {
          letter-spacing: 0rem;
          font-size: 1em;
        }
        #buttons05 {
          gap: 0.75rem;
        }
        #buttons05 li a {
          letter-spacing: 0rem;
          font-size: 1em;
        }
      }
      @media (max-width: 480px) {
        #main > .inner {
          --spacing: 0.65625rem;
        }
        #buttons01 li a {
          max-width: 32rem;
          width: 100%;
        }
        #buttons02 li a {
          max-width: 32rem;
          width: 100%;
        }
        #buttons03 li a {
          max-width: 32rem;
          width: 100%;
        }
        #buttons04 li a {
          max-width: 32rem;
          width: 100%;
        }
        #buttons05 li a {
          max-width: 32rem;
          width: 100%;
        }
      }
      @media (max-width: 360px) {
        #main > .inner {
          --padding-horizontal: 1.5rem;
          --padding-vertical: 0.84375rem;
          --spacing: 0.5625rem;
        }
        #text01 {
          font-size: 1em;
        }
        #text02 {
          font-size: 1em;
        }
        #text03 {
          font-size: 1em;
        }
        #buttons01 {
          gap: 0.5625rem;
        }
        #buttons02 {
          gap: 0.5625rem;
        }
        #buttons03 {
          gap: 0.5625rem;
        }
        #buttons04 {
          gap: 0.5625rem;
        }
        #buttons05 {
          gap: 0.5625rem;
        }
      }
    </style>
  </head>
  <body>
    <div id="wrapper">
      <div id="main">
        <div class="inner">
          <p id="text01">anura wallpaper editor</p>
          <hr id="divider02" />
          <p id="text02">solid colors</p>
          <ul id="buttons01" class="buttons">
            <li>
              <a href="https://domain.ext/path" class="button n01">crimson</a>
            </li>
          </ul>
          <ul id="buttons02" class="buttons">
            <li>
              <a href="https://domain.ext/path" class="button n01">sky azure</a>
            </li>
          </ul>
          <ul id="buttons03" class="buttons">
            <li>
              <a href="https://domain.ext/path" class="button n01">foliage</a>
            </li>
          </ul>
          <hr id="divider01" />
          <p id="text03">themes</p>
          <ul id="buttons04" class="buttons">
            <li>
              <a href="https://domain.ext/path" class="button n01"
                >Windows XP</a
              >
            </li>
          </ul>
          <ul id="buttons05" class="buttons">
            <li>
              <a href="https://domain.ext/path" class="button n01">MacOS</a>
            </li>
          </ul>
          <hr id="divider03" />
         
          </div>
        </div>
      </div>
    <script>
      
      (function () {
        var on = addEventListener,
          $ = function (q) {
            return document.querySelector(q);
          },
          $$ = function (q) {
            return document.querySelectorAll(q);
          },
          $body = document.body,
          $inner = $(".inner"),
          client = (function () {
            var o = {
                browser: "other",
                browserVersion: 0,
                os: "other",
                osVersion: 0,
                mobile: false,
                canUse: null,
                flags: { lsdUnits: false },
              },
              ua = navigator.userAgent,
              a,
              i;
            a = [
              ["firefox", /Firefox\/([0-9\.]+)/],
              ["edge", /Edge\/([0-9\.]+)/],
              ["safari", /Version\/([0-9\.]+).+Safari/],
              ["chrome", /Chrome\/([0-9\.]+)/],
              ["chrome", /CriOS\/([0-9\.]+)/],
              ["ie", /Trident\/.+rv:([0-9]+)/],
            ];
            for (i = 0; i < a.length; i++) {
              if (ua.match(a[i][1])) {
                o.browser = a[i][0];
                o.browserVersion = parseFloat(RegExp.$1);
                break;
              }
            }
            a = [
              [
                "ios",
                /([0-9_]+) like Mac OS X/,
                function (v) {
                  return v.replace("_", ".").replace("_", "");
                },
              ],
              [
                "ios",
                /CPU like Mac OS X/,
                function (v) {
                  return 0;
                },
              ],
              [
                "ios",
                /iPad; CPU/,
                function (v) {
                  return 0;
                },
              ],
              ["android", /Android ([0-9\.]+)/, null],
              [
                "mac",
                /Macintosh.+Mac OS X ([0-9_]+)/,
                function (v) {
                  return v.replace("_", ".").replace("_", "");
                },
              ],
              ["windows", /Windows NT ([0-9\.]+)/, null],
              ["undefined", /Undefined/, null],
            ];
            for (i = 0; i < a.length; i++) {
              if (ua.match(a[i][1])) {
                o.os = a[i][0];
                o.osVersion = parseFloat(
                  a[i][2] ? a[i][2](RegExp.$1) : RegExp.$1
                );
              }
            }
            if (
              o.os == "mac" &&
              "ontouchstart" in window &&
              ((screen.width == 1024 && screen.height == 1366) ||
                (screen.width == 834 && screen.height == 1112) ||
                (screen.width == 810 && screen.height == 1080) ||
                (screen.width == 768 && screen.height == 1024))
            )
              o.os = "ios";
            o.mobile = o.os == "android" || o.os == "ios";
            var _canUse = document.createElement("div");
            o.canUse = function (property, value) {
              var style;
              style = _canUse.style;
              if (!(property in style)) return false;
              if (typeof value !== "undefined") {
                style[property] = value;
                if (style[property] == "") return false;
              }
              return true;
            };
            o.flags.lsdUnits = o.canUse("width", "100dvw");
            return o;
          })(),
          trigger = function (t) {
            dispatchEvent(new Event(t));
          },
          cssRules = function (selectorText) {
            var ss = document.styleSheets,
              a = [],
              f = function (s) {
                var r = s.cssRules,
                  i;
                for (i = 0; i < r.length; i++) {
                  if (
                    r[i] instanceof CSSMediaRule &&
                    matchMedia(r[i].conditionText).matches
                  )
                    f(r[i]);
                  else if (
                    r[i] instanceof CSSStyleRule &&
                    r[i].selectorText == selectorText
                  )
                    a.push(r[i]);
                }
              },
              x,
              i;
            for (i = 0; i < ss.length; i++) f(ss[i]);
            return a;
          },
          thisHash = function () {
            var h = location.hash ? location.hash.substring(1) : null,
              a;
            if (!h) return null;
            if (h.match(/\?/)) {
              a = h.split("?");
              h = a[0];
              history.replaceState(undefined, undefined, "#" + h);
              window.location.search = a[1];
            }
            if (h.length > 0 && !h.match(/^[a-zA-Z]/)) h = "x" + h;
            if (typeof h == "string") h = h.toLowerCase();
            return h;
          },
          scrollToElement = function (e, style, duration) {
            var y, cy, dy, start, easing, offset, f;
            if (!e) y = 0;
            else {
              offset =
                (e.dataset.scrollOffset
                  ? parseInt(e.dataset.scrollOffset)
                  : 0) *
                parseFloat(getComputedStyle(document.documentElement).fontSize);
              switch (
                e.dataset.scrollBehavior ? e.dataset.scrollBehavior : "default"
              ) {
                case "default":
                default:
                  y = e.offsetTop + offset;
                  break;
                case "center":
                  if (e.offsetHeight < window.innerHeight)
                    y =
                      e.offsetTop -
                      (window.innerHeight - e.offsetHeight) / 2 +
                      offset;
                  else y = e.offsetTop - offset;
                  break;
                case "previous":
                  if (e.previousElementSibling)
                    y =
                      e.previousElementSibling.offsetTop +
                      e.previousElementSibling.offsetHeight +
                      offset;
                  else y = e.offsetTop + offset;
                  break;
              }
            }
            if (!style) style = "smooth";
            if (!duration) duration = 750;
            if (style == "instant") {
              window.scrollTo(0, y);
              return;
            }
            start = Date.now();
            cy = window.scrollY;
            dy = y - cy;
            switch (style) {
              case "linear":
                easing = function (t) {
                  return t;
                };
                break;
              case "smooth":
                easing = function (t) {
                  return t < 0.5
                    ? 4 * t * t * t
                    : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
                };
                break;
            }
            f = function () {
              var t = Date.now() - start;
              if (t >= duration) window.scroll(0, y);
              else {
                window.scroll(0, cy + dy * easing(t / duration));
                requestAnimationFrame(f);
              }
            };
            f();
          },
          scrollToTop = function () {
            scrollToElement(null);
          },
          loadElements = function (parent) {
            var a, e, x, i;
            a = parent.querySelectorAll('iframe[data-src]:not([data-src=""])');
            for (i = 0; i < a.length; i++) {
              a[i].contentWindow.location.replace(a[i].dataset.src);
              a[i].dataset.initialSrc = a[i].dataset.src;
              a[i].dataset.src = "";
            }
            a = parent.querySelectorAll("video[autoplay]");
            for (i = 0; i < a.length; i++) {
              if (a[i].paused) a[i].play();
            }
            e = parent.querySelector('[data-autofocus="1"]');
            x = e ? e.tagName : null;
            switch (x) {
              case "FORM":
                e = e.querySelector(
                  ".field input, .field select, .field textarea"
                );
                if (e) e.focus();
                break;
              default:
                break;
            }
          },
          unloadElements = function (parent) {
            var a, e, x, i;
            a = parent.querySelectorAll('iframe[data-src=""]');
            for (i = 0; i < a.length; i++) {
              if (a[i].dataset.srcUnload === "0") continue;
              if ("initialSrc" in a[i].dataset)
                a[i].dataset.src = a[i].dataset.initialSrc;
              else a[i].dataset.src = a[i].src;
              a[i].contentWindow.location.replace("about:blank");
            }
            a = parent.querySelectorAll("video");
            for (i = 0; i < a.length; i++) {
              if (!a[i].paused) a[i].pause();
            }
            e = $(":focus");
            if (e) e.blur();
          };
        window._scrollToTop = scrollToTop;
        var thisURL = function () {
          return window.location.href
            .replace(window.location.search, "")
            .replace(/#$/, "");
        };
        var getVar = function (name) {
          var a = window.location.search.substring(1).split("&"),
            b,
            k;
          for (k in a) {
            b = a[k].split("=");
            if (b[0] == name) return b[1];
          }
          return null;
        };
        var errors = {
          handle: function (handler) {
            window.onerror = function (message, url, line, column, error) {
              handler(error.message);
              return true;
            };
          },
          unhandle: function () {
            window.onerror = null;
          },
        };
        loadElements(document.body);
        var style, sheet, rule;
        style = document.createElement("style");
        style.appendChild(document.createTextNode(""));
        document.head.appendChild(style);
        sheet = style.sheet;
        if (client.mobile) {
          (function () {
            if (client.flags.lsdUnits) {
              document.documentElement.style.setProperty(
                "--viewport-height",
                "100svh"
              );
              document.documentElement.style.setProperty(
                "--background-height",
                "100dvh"
              );
            } else {
              var f = function () {
                document.documentElement.style.setProperty(
                  "--viewport-height",
                  window.innerHeight + "px"
                );
                document.documentElement.style.setProperty(
                  "--background-height",
                  window.innerHeight + 250 + "px"
                );
              };
              on("load", f);
              on("orientationchange", function () {
                setTimeout(function () {
                  f();
                }, 100);
              });
            }
          })();
        }
        if (client.os == "android") {
          (function () {
            sheet.insertRule("body::after { }", 0);
            rule = sheet.cssRules[0];
            var f = function () {
              rule.style.cssText =
                "height: " + Math.max(screen.width, screen.height) + "px";
            };
            on("load", f);
            on("orientationchange", f);
            on("touchmove", f);
          })();
          $body.classList.add("is-touch");
        } else if (client.os == "ios") {
          if (client.osVersion <= 11)
            (function () {
              sheet.insertRule("body::after { }", 0);
              rule = sheet.cssRules[0];
              rule.style.cssText = "-webkit-transform: scale(1.0)";
            })();
          if (client.osVersion <= 11)
            (function () {
              sheet.insertRule("body.ios-focus-fix::before { }", 0);
              rule = sheet.cssRules[0];
              rule.style.cssText = "height: calc(100% + 60px)";
              on(
                "focus",
                function (event) {
                  $body.classList.add("ios-focus-fix");
                },
                true
              );
              on(
                "blur",
                function (event) {
                  $body.classList.remove("ios-focus-fix");
                },
                true
              );
            })();
          $body.classList.add("is-touch");
        }
      })();
    </script>
  </body>
</html>
`;
      
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
