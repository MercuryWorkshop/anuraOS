const input = document.querySelector("input");
input.addEventListener("change", updateImageDisplay);

function changeWallpaper(wallpaper) {
    var back = "url("+wallpaper+")";
    window.parent.document.body.style.background = back;
    window.parent.document.body.style.backgroundSize = "cover";
    window.parent.document.body.style.backgroundPositionY = "center";
}

function updateImageDisplay() {
    changeWallpaper(input.files[0])
    }

function enableStylesheet(node) {
    node.disabled = false;
}
      
function disableStylesheet(node) {
    node.disabled = true;
}

function enableNormal() {
    window.parent.document.querySelectorAll('link[rel=stylesheet].compact').forEach(disableStylesheet);
    window.parent.document.querySelectorAll('link[rel=stylesheet].main').forEach(enableStylesheet);
    localStorage.setItem("env", "n");
}

function enableCompact() {
    window.parent.document.querySelectorAll('link[rel=stylesheet].compact').forEach(enableStylesheet);
    window.parent.document.querySelectorAll('link[rel=stylesheet].main').forEach(disableStylesheet);
    localStorage.setItem("env", "c");
}
// background: url(/assets/wallpaper/touhou.jpg) no-repeat center center