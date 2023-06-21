
function loadingScript(currentpath, app) {

  if (app.windowinstance === null || app.windowinstance.parentElement === null)  { //  checks if there is an existing minimized window 
    let win = AliceWM.create({ "title": "", "width": "700px", "height": "500px" })
    app.windowinstance = win.content.parentElement;

    let screen_container = document.createElement("div");
    screen_container.style.position = "relative";
    screen_container.style.width = "100%";
    screen_container.style.height = "100%";
    screen_container.style.backgroundColor = "#000000";
    screen_container.id = 'v86VGA'
    win.content.appendChild(screen_container);
    screen_container.appendChild(document.createElement("canvas"));
    screen_container.appendChild(document.createElement("div"));

    const buttons = app.windowinstance.querySelectorAll('.windowButton')
    buttons[2].onclick  = buttons[0].onclick

  } else {
      app.windowinstance.style.display  = ''
  }


}