let anura = window.parent.anura;

window.fs = anura.fs
function loadPath(parent, path) {
    console.debug("loading path: ", path);
    fs.readdir(path, (err, files) => {
        if(err) throw err;
        // parent.innerHTML = ''
        files.forEach(file => {
            let item = document.createElement('li')

            fs.stat(`${path}/${file}`, function(err, stats) {
                if (err) throw err;
                if (stats.isDirectory()) {
                    let name = document.createElement("span")
                    name.innerText = `${file}/`

                    name.addEventListener("click", function() {

                        if (item.getAttribute("expanded") == "false"){
                            console.debug("Expanding")
                            let childContainer = document.createElement("ul")

                            loadPath(childContainer, `/${path}/${file}/`)
                            item.appendChild(childContainer)
                            item.setAttribute("expanded", "true")
                        } else {
                            item.removeChild(item.getElementsByTagName("ul")[0])
                            item.setAttribute("expanded", "false")
                        }
                    });
                    item.appendChild(name)
                    item.setAttribute("expanded", "false")
                    item.setAttribute("data-type", 'dir');
                    item.setAttribute("data-path", `${path}/${file}`);
                } else {
                    item.innerText = `${file}`
                    item.addEventListener("click", function() {
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
                    })
                    item.setAttribute("data-type", 'file');
                    item.setAttribute("data-path", `${path}/${file}`);
                }
                console.debug("appending");
                parent.appendChild(item)
            });
        });
    });
}
loadPath(document.getElementById("root"), "/")
