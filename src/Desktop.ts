let env = anura.settings.get("env");

document.addEventListener(
    "keydown",
    (event) => {
        alert(event.code);
        if (event.code == "ControlRight") {
            if ((env = 1)) {
                alert("Switching Themes");
                document
                    .querySelectorAll("link[rel=stylesheet].alternate")
                    .forEach(enableStylesheet);
                document
                    .querySelectorAll("link[rel=stylesheet].main")
                    .forEach(disableStylesheet);

                anura.settings.set("env", 1);
            } else if ((env = 0)) {
                alert("Switching Themes");
                document
                    .querySelectorAll("link[rel=stylesheet].alternate")
                    .forEach(disableStylesheet);
                document
                    .querySelectorAll("link[rel=stylesheet].main")
                    .forEach(enableStylesheet);
                anura.settings.set("env", 0);
            }
        }
    },
    false,
);

function enableStylesheet(node) {
    node.disabled = false;
}

function disableStylesheet(node) {
    node.disabled = true;
}

function checkEnv() {
    if ((env = 1)) {
        document
            .querySelectorAll("link[rel=stylesheet].alternate")
            .forEach(disableStylesheet);
    } else if ((env = 0)) {
        document
            .querySelectorAll("link[rel=stylesheet].main")
            .forEach(disableStylesheet);
    }
}
