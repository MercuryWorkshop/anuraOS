
function loadingScript(currentpath, app) {
  if (app.windowinstance) {
    app.windowinstance.focus();
    return;
  }


  let win = AliceWM.create({ "title": "", "width": "700px", "height": "500px" })
  app.windowinstance = win;

  let screen_container = document.createElement("div");
  screen_container.style.position = "relative";
  screen_container.style.width = "100%";
  screen_container.style.height = "100%";
  screen_container.style.backgroundColor = "#000000";
  win.content.appendChild(screen_container);
  screen_container.appendChild(document.createElement("canvas"));
  screen_container.appendChild(document.createElement("div"));

}
