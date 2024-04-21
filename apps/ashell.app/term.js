const { create_shell } = await anura.import("anura.shell.phoenix")

const config = anura.settings.get("anura-shell-config") || {}

const terminal = document.getElementById("terminal")

const process = {
    exit: () => {
        instanceWindow.close()
    },
}

const decorate = (ptt) => {
    ptt.hterm.setBackgroundColor(anura.ui.theme.darkBackground);
    ptt.hterm.setCursorColor(anura.ui.theme.foreground);
    if (anura.settings.get("transparent-ashell")) {
        frameElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
        frameElement.parentNode.parentNode.style.backgroundColor =
          "rgba(0, 0, 0, 0)";
        frameElement.parentNode.parentNode.style.backdropFilter = "blur(5px)";
        document
            .querySelector("iframe")
            .contentDocument.querySelector("x-screen").style.backgroundColor = anura.ui.theme.background + "d9";
        Array.from(frameElement.parentNode.parentNode.children).filter((e) =>
          e.classList.contains("title"),
        )[0].style.backgroundColor = anura.ui.theme.background + "d9";
    }    
}

const shell = create_shell(anura.settings.get("anura-shell-config") || {}, terminal, hterm, anura, process, decorate)

