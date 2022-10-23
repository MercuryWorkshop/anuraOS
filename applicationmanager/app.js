function run() {
    const path = document.getElementById("path").value
    fetch(path + "/launchapp.js")
        .then(response => response.text())
        .then((data) => {
            console.log
            top.window.eval(data);
        })
}