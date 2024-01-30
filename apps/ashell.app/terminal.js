/**
 * @type {HTMLInputElement}
 */
const input = document.getElementById("input");

/**
 * @type {HTMLInputElement}
 */
const output = document.getElementById("terminal");
(()=>{
    const console_log = window.console.log;
    window.console.log = function(...args){
      console_log(...args);
      if(!output) return;
      args.forEach(arg=>output.value += `${arg}\n`);
    }
  })();

(()=>{
    const console_warn = window.console.warn;
    window.console.warn = function(...args){
      console_warn(...args);
      if(!output) return;
      args.forEach(arg=>output.value += `${JSON.stringify(arg)}\n`);
    }
})();
(()=>{
    const console_error = window.console.warn;
    window.console.error = function(...args){
        console_error(...args);
        if(!output) return;
        args.forEach(arg=>output.value += `${JSON.stringify(arg)}\n`);
}
})();

const shell = new Filer.fs.Shell()

input.addEventListener("keyup", function (event) {
    if (event.key == "Enter") {
        evalUserInput(input.value)
    }
})

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

    console.log(await eval(userInput))
    
}