function run() {
    const path = document.getElementById("path").value
    fetch(path + "/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            top.window.eval(data);
            top.window.eval(`loadingScript("${path}")`)
        })
}