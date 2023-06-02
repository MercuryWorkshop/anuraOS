
function loadingScript(currentpath, app) {
  let win = AliceWM.create({ "title": "", "width": "700px", "height": "500px" })
  app.windowinstance = win;

  let screen_container = document.createElement("div");
  screen_container.style.position = "fixed";
  screen_container.style.width = "900px";
  screen_container.style.height = "900px";
  win.content.appendChild(screen_container);
  screen_container.appendChild(document.createElement("canvas"));
  screen_container.appendChild(document.createElement("div"));

}
