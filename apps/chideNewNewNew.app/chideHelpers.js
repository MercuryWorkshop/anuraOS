// Initialization
require.config({ paths: { vs: 'node_modules/monaco-editor/min/vs' } });

require(['vs/editor/editor.main'], function () {
    require.config({ paths: { vs: 'node_modules/monaco-editor/min/vs' } });0

    require(['vs/editor/editor.main'], function () {
        window.editor = monaco.editor.create(document.getElementById('monaco-container'), {
            value: ['Click a file to get started'].join('\n'),
                theme: "vs-dark",
                automaticLayout: true,
                language: 'plaintext'
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