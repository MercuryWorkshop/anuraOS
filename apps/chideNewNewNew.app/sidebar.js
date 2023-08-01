let anura = window.parent.anura;

require.config({ paths: { vs: 'node_modules/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {
    require.config({ paths: { vs: 'node_modules/monaco-editor/min/vs' } });0

    require(['vs/editor/editor.main'], function () {
        window.editor = monaco.editor.create(document.getElementById('monaco-container'), {
            value: ['Click a file to get started'].join('\n'),
                theme: "vs-dark",
                automaticLayout: true,
                language: 'javascript'
        });
        window.editor.getModel().onDidChangeContent((event) => {
            if (window.currentlyOpenFile)
                anura.fs.writeFile(window.currentlyOpenFile, editor.getValue())
        });
    });
});
/**
 * 
 * @param {string} name 
 */
function getFileType(name) {
    let language = "plaintext"
    switch (name.split('.').pop()) {
        case "js":
        case "jsx":
            language = "javascript"
            break;
        case "ts":
        case "tsx":
            language = "javascript"
            break;
        case "sh":
            language = "shell"
            break;
        case "htm":
        case "html":
            language = "html"
            break;
        case "c":
            language = "c"
            break;
        case "cpp":
            language = "cpp"
            break;
        case "css":
            language = "css"
            break;
    }
    return language;
}
function pageLoaded() {
    window.fs = parent.anura.fs
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
}
document.addEventListener('DOMContentLoaded', function () {
    const resizable = function (resizer) {
        const direction = resizer.getAttribute('data-direction') || 'horizontal';
        const prevSibling = resizer.previousElementSibling;
        const nextSibling = resizer.nextElementSibling;

        // The current position of mouse
        let x = 0;
        let y = 0;
        let prevSiblingHeight = 0;
        let prevSiblingWidth = 0;

        // Handle the mousedown event
        // that's triggered when user drags the resizer
        const mouseDownHandler = function (e) {
            // Get the current mouse position
            x = e.clientX;
            y = e.clientY;
            const rect = prevSibling.getBoundingClientRect();
            prevSiblingHeight = rect.height;
            prevSiblingWidth = rect.width;

            // Attach the listeners to `document`
            document.addEventListener('mousemove', mouseMoveHandler);
            document.addEventListener('mouseup', mouseUpHandler);
        };

        const mouseMoveHandler = function (e) {
            // How far the mouse has been moved
            const dx = e.clientX - x;
            const dy = e.clientY - y;

            switch (direction) {
                case 'vertical':
                    const h =
                        ((prevSiblingHeight + dy) * 100) /
                        resizer.parentNode.getBoundingClientRect().height;
                    prevSibling.style.height = `${h}%`;
                    break;
                case 'horizontal':
                default:
                    const w =
                        ((prevSiblingWidth + dx) * 100) / resizer.parentNode.getBoundingClientRect().width;
                    prevSibling.style.width = `${w}%`;
                    break;
            }

            const cursor = direction === 'horizontal' ? 'col-resize' : 'row-resize';
            resizer.style.cursor = cursor;
            document.body.style.cursor = cursor;

            prevSibling.style.userSelect = 'none';
            prevSibling.style.pointerEvents = 'none';

            nextSibling.style.userSelect = 'none';
            nextSibling.style.pointerEvents = 'none';
        };

        const mouseUpHandler = function () {
            resizer.style.removeProperty('cursor');
            document.body.style.removeProperty('cursor');

            prevSibling.style.removeProperty('user-select');
            prevSibling.style.removeProperty('pointer-events');

            nextSibling.style.removeProperty('user-select');
            nextSibling.style.removeProperty('pointer-events');

            // Remove the handlers of `mousemove` and `mouseup`
            document.removeEventListener('mousemove', mouseMoveHandler);
            document.removeEventListener('mouseup', mouseUpHandler);
        };

        // Attach the handler
        resizer.addEventListener('mousedown', mouseDownHandler);
    };

    // Query all resizers
    document.querySelectorAll('.resizer').forEach(function (ele) {
        resizable(ele);
    });
    pageLoaded()
});