const { create_shell } = await anura.import("anura.shell.phoenix")

const config = anura.settings.get("anura-shell-config") || {}

const terminal = document.getElementById("terminal")

const process = {
    exit: () => {
        instanceWindow.close()
    },
}

const decorate = (ptt) => {
    ptt.hterm.setBackgroundColor("#141516");
    ptt.hterm.setCursorColor("#bbb");
    if (anura.settings.get("transparent-ashell")) {
        frameElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
        frameElement.parentNode.parentNode.style.backgroundColor =
          "rgba(0, 0, 0, 0)";
        frameElement.parentNode.parentNode.style.backdropFilter = "blur(5px)";
        document
            .querySelector("iframe")
            .contentDocument.querySelector("x-screen").style.backgroundColor = "rgba(20, 21, 22, 0.85)";
        Array.from(frameElement.parentNode.parentNode.children).filter((e) =>
          e.classList.contains("title"),
        )[0].style.backgroundColor = "rgba(20, 21, 22, 0.85)";
    }    
}

const shell = create_shell(anura.settings.get("anura-shell-config") || {}, terminal, hterm, anura, process, decorate)

