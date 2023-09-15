function changeWallpaper(wallpaper) {
    var back = "url("+wallpaper+")";
    window.parent.document.body.style.background = back;
    window.parent.document.body.style.backgroundSize = "cover";
    window.parent.document.body.style.backgroundPositionY = "center";
}


// background: url(/assets/wallpaper/touhou.jpg) no-repeat center center