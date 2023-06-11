/// <reference path="../../../src/Anura.ts" /> 

import * as monaco from "monaco-editor";
function start() {
    // const model = monaco.editor.createModel(value, language, path);

    let editor = monaco.editor.create(document.querySelector('#container')!, {
        value: ['function x() {', '\tconsole.log("Hello world!");', '}'].join('\n'),
        language: 'javascript'
    });
    //   editor.language


    let anura: Anura = (window.top as any).anura;
}

window.onload = start;
