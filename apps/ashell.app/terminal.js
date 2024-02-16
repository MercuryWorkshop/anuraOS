/**
 * @type {HTMLInputElement}
 */
const input = document.getElementById("input");

/**
 * @type {HTMLInputElement}
 */
const output = document.getElementById("terminal");

// Clear the terminal
output.textContent = "Welcome to Anura Shell\nThis is a JavaScript terminal.\nIf you need to use the Recovery app, type 'recovery()' or initiate a force refresh.\n";

(()=>{
    const console_log = window.console.log;
    window.console.log = function(...args){
      console_log(...args);
      if(!output) return;
      args.forEach(arg=>output.value += `${arg}\n`);
      output.scrollTop = output.scrollHeight;
    }
  })();

(()=>{
    const console_warn = window.console.warn;
    window.console.warn = function(...args){
      console_warn(...args);
      if(!output) return;
      args.forEach(arg=>output.value += `${JSON.stringify(arg)}\n`);
      output.scrollTop = output.scrollHeight;
    }
})();
(()=>{
    const console_error = window.console.warn;
    window.console.error = function(...args){
      console_error(...args);
      if(!output) return;
      args.forEach(arg=>output.value += `${JSON.stringify(arg)}\n`);
      output.scrollTop = output.scrollHeight;
    }
})();

if (anura.settings.get("transparent-ashell")) {
    input.classList.add("clear")
    output.classList.add("clear")
    frameElement.style.backgroundColor = "rgba(0, 0, 0, 0)"
    frameElement.parentNode.parentNode.style.backgroundColor = "rgba(0, 0, 0, 0)"
    frameElement.parentNode.parentNode.style.backdropFilter = "blur(5px)"
    Array.from(frameElement.parentNode.parentNode.children).filter(e => e.classList.contains("title"))[0].style.backgroundColor = "rgba(20, 21, 22, 0.75)"
}

const shell = new Filer.fs.Shell()

input.addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        evalUserInput(input.value)
    }
})

let appListCache = []

async function refresh() {
    for (let app in appListCache) {
        delete window[app]
    }
    appListCache = []
    for (let app in anura.apps) {
        let normalizedApp = app.replace(/\./g, "_")
        appListCache.push(normalizedApp)
        // Tag function
        window[normalizedApp] = (strings, ...values) => {
            let args = []
            
            if (strings && typeof strings == "string" ) {
                args = strings.split(" ")
            } else if (strings && strings.length > 0) {
                const input = strings.reduce((result, str, i) => {
                    result += str;
                    if (i < values.length) {
                        result += values[i];
                    }
                    return result;
                }, '');
                args = input.match(/(?:[^\s"']|"[^"]*"|'[^']*')+/g).map(arg => arg.replace(/^['"]|['"]$/g, '')) || [];
            }

            anura.apps[app].open(args)
            return "Opening " + app + " with args " + args.join(" ")
        }
        window[normalizedApp].toString = () => {
            return `\
function ${normalizedApp} () {
    /* 
     * Launch ${app} with args.
     * This can be used as a tag
     * function or a normal function.
     */ 
}`
        }
    }
}
refresh()

async function source(strings, ...values) {
    const input = strings.reduce((result, str, i) => {
        result += str;
        if (i < values.length) {
            result += values[i];
        }
        return result;
    }, '');

    let resp = "Imported\n"
    
    let libs = input.split(" ")

    for (let lib in libs) {
        const normalizedLib = libs[lib].replace(/\./g, "_")
        
        try {
            window[normalizedLib] = await anura.import(libs[lib])
        
            resp += libs[lib] + " as " + normalizedLib + "\n"
        } catch (e) {
            resp += "Failed to import " + libs[lib] + ": " + e + "\n"
        }
    }

    return resp.trimEnd("\n");
}

function recovery() {
    let recoveryApp = anura.apps["anura.recovery"];
    if (recoveryApp) {
        return recoveryApp.open()
    }

    const RecoveryApp = window.top.eval("RecoveryApp")
    if (RecoveryApp) {
        recoveryApp = new RecoveryApp()
        anura.registerApp(recoveryApp)
        return recoveryApp.open()
    } else {
        return "Recovery app not found."
    }

}

/**
 * 
 * @param {string} userInput 
 */
async function evalUserInput(userInput) {
    console.log("> " + userInput)
    async function cd(...path) {
        await shell.promises.cd(...path)
    }
    async function cat(...path) {
        return shell.promises.cat(...path)
    }
    async function touch(...path) {
        await shell.promises.touch(...path)
    }
    async function mkdirp(...path) {
        await shell.promises.mkdirp(...path)
    }
    async function rm(...path) {
        await shell.promises.rm(...path)
    }
    async function pwd() {
        return shell.pwd();
    }
    async function ls(path) {
        if (!path) {
            path = "."
        }
        let array = [];
        const lsOutput = await shell.promises.ls(path);
        
        for (let file in lsOutput) {
            if (lsOutput[file].type == "DIRECTORY") {
                array.push(lsOutput[file].name + "/")
            } else {
                array.push(lsOutput[file].name)
            }
            
        }
        return JSON.stringify(array)
    }
    refresh()

    console.log(JSON.stringify(await eval(userInput), null, 2))
    
}