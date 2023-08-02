let anura = window.parent.anura;
window.fs = anura.fs

/**
 * 
 * @param {HTMLElement} parent 
 * @param {string} path 
 */
function loadPath(parent, path) {
    console.debug("loading path: ", path);
    fs.readdir(path, (err, files) => {
        if(err) throw err;
        // parent.innerHTML = ''
        files.forEach(file => {
            let item = document.createElement('li')

            fs.stat(`${path}/${file}`, function(err, stats) {
                if (err) throw err;
                createRow(item, stats.isDirectory(), path, file)
                console.debug("appending");
                parent.appendChild(item)
            });
        });
    });
}

/**
 * 
 * @param {string} path 
 * @param {string} file
 */
function loadFile(path, file) {
    anura.fs.readFile(`${path}/${file}`, function (err, data) {
        if (err) throw err;
        window.currentlyOpenFile = `${path}/${file}`
        window.editor = monaco.editor.create(document.getElementById('monaco-container'), {
            value: new TextDecoder().decode(data),
                theme: "vs-dark",
                automaticLayout: true,
                language: getFileType(file)
        });
        window.editor.getModel().onDidChangeContent((event) => {
            if (window.currentlyOpenFile)
                anura.fs.writeFile(window.currentlyOpenFile, editor.getValue())
        });
        
    })
}

/**
 * 
 * @param {HTMLElement} RowElement 
 * @param {boolean} isFolder 
 * @param {string} path 
 * @param {string} file 
 */
function createRow(RowElement, isFolder, path, file) {
    if (isFolder) {

        let name = document.createElement("span")
        name.innerText = `${file}/`

        name.addEventListener("click", function() {
            if (RowElement.getAttribute("expanded") == "false"){
                console.debug("Expanding")
                let childContainer = document.createElement("ul")

                loadPath(childContainer, `/${path}/${file}/`)
                RowElement.appendChild(childContainer)
                RowElement.setAttribute("expanded", "true")
            } else {
                item.removeChild(item.getElementsByTagName("ul")[0])
                item.setAttribute("expanded", "false")
            }
        });
        RowElement.appendChild(name)
        RowElement.setAttribute("expanded", "false")
        RowElement.setAttribute("data-type", 'dir');
        RowElement.setAttribute("data-path", `${path}/${file}`);
    } else {
        RowElement.innerText = `${file}`
        RowElement.addEventListener("click", function() {
            loadFile(path, file);
        })
        RowElement.setAttribute("data-type", 'file');
        RowElement.setAttribute("data-path", `${path}/${file}`);
    }
}

loadPath(document.getElementById("root"), "/")
