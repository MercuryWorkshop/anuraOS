let anura = window.parent.anura;
window.fs = anura.fs;

let activeElement;

/**
 *
 * @param {HTMLElement} parent
 * @param {string} path
 */
function loadPath(parent, path) {
    console.debug("loading path: ", path);
    fs.readdir(path, (err, files) => {
        if (err) throw err;
        // parent.innerHTML = ''
        files.forEach((file) => {
            let item = document.createElement("li");

            fs.stat(`${path}/${file}`, function (err, stats) {
                if (err) throw err;
                createRow(item, stats.isDirectory(), path, file);
                console.debug("appending");
                parent.appendChild(item);
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
    
        window.currentlyOpenFile = `${path}/${file}`;
        window.editor.setValue(new TextDecoder().decode(data))
        monaco.editor.setModelLanguage(window.editor.getModel(), getFileType(file))

    });
}

/**
 *
 * @param {HTMLElement} RowElement
 * @param {boolean} isFolder
 * @param {string} path
 * @param {string} file
 */
function createRow(RowElement, isFolder, path, file) {
    if (path === '/') // Fix that stops filepaths from being //file
        path = ''

    let name = document.createElement("span");
    name.addEventListener("contextmenu",e=>{
            e.preventDefault();
            const newcontextmenu = new parent.anura.ContextMenu();
            newcontextmenu.addItem("Delete", function () {
                anura.fs.unlink(`${path}/${file}`)
            });
            newcontextmenu.addItem("New", function () {
                anura.fs.writeFile(`${path}/${prompt("file name?")}`,"")
            });
            newcontextmenu.show(e.clientX,e.clientY)
        })
    if (isFolder) {
        name.innerText = `${file}/`;

        name.addEventListener("click", function () {
            if (RowElement.getAttribute("expanded") == "false") {
                console.debug("Expanding");
                let childContainer = document.createElement("ul");

                loadPath(childContainer, `${path}/${file}`);
                RowElement.appendChild(childContainer);
                RowElement.setAttribute("expanded", "true");
            } else {
                RowElement.removeChild(
                    RowElement.getElementsByTagName("ul")[0],
                );
                RowElement.setAttribute("expanded", "false");
            }
        });
        
        RowElement.setAttribute("expanded", "false");
        RowElement.setAttribute("data-type", "dir");
        RowElement.setAttribute("data-path", `${path}/${file}`);
    } else {
        name.innerText = `${file}`;
        name.addEventListener("click", function () {
            loadFile(path, file);
            setActiveElement(name);
        });
        RowElement.setAttribute("data-type", getFileType(file));
        RowElement.setAttribute("data-path", `${path}/${file}`);
    }
    RowElement.appendChild(name);
}


/**
 * 
 * @param {HTMLElement} element 
 */
function setActiveElement(element) {
    if (activeElement)
        activeElement.removeAttribute("active")
    element.setAttribute("active", "true")
    activeElement = element;
}

function loadRoot(){
    [...document.getElementById("root").children].forEach(a=>a.remove());
    loadPath(document.getElementById("root"), "/");
}
loadRoot();


let last;
setInterval(() => {
    fs.readdir("/", (err, files) => {
        if (err) throw err;
        // parent.innerHTML = ''
        if (last != files.toString()) {
            loadRoot();
        }
        last = files.toString();

    });
}, 1000);
