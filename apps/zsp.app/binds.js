import init, { start, run, reset } from "./pkg/zsp_playground.js"
init().then(() => {
    start();
    window.run = run;
    window.reset = () => {
        reset();
        start();
    };
    console.log("window run set");
})