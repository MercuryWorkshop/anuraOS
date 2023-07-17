
function loadingScript(currentpath, app) {

  if (!app.windows[0] || app.windows[0].parentElement === null) { //  checks if there is an existing minimized window 
    let win = AliceWM.create({ "title": "", "width": "700px", "height": "500px" })
    app.windows[0] = win;

    let screen_container = document.createElement("div");
    screen_container.style.position = "relative";
    screen_container.style.width = "100%";
    screen_container.style.height = "100%";
    screen_container.style.backgroundColor = "#000000";
    screen_container.id = 'v86VGA'
    win.content.appendChild(screen_container);
    screen_container.appendChild(document.createElement("canvas"));
    screen_container.appendChild(document.createElement("div"));

    const buttons = win.content.parentElement.querySelectorAll('.windowButton')

    let closeButton = buttons[2];
    closeButton.replaceWith(closeButton.cloneNode(true)); // Dirty Hack to remove event listeners

    closeButton = win.content.parentElement.querySelectorAll('.windowButton')[2] // The reference was destroyed, get it back
    closeButton.onclick = function() {
      buttons[0].click()
    }

  } else {
    app.windowinstance[0].style.display = ''
  }


}
