const $ = document.querySelector.bind(document);



window.addEventListener("load", async () => {

  let chimera = top.chimera;

  let cx = chimera.x86;

  const t = new hterm.Terminal();
  // Cool proprietary stuff, try not to touch it if you dont need to because its easy to break and hard to fix

  let htermNode = $("#terminal");

  let cxReadFunc = null;
  function readData(str) {
    if (cxReadFunc == null)
      return;
    for (var i = 0; i < str.length; i++)
      cxReadFunc(str.charCodeAt(i));
  }



  t.decorate(htermNode);


  const decoder = new TextDecoder("UTF-8");
  t.onTerminalReady = () => {
    let io = t.io.push();
    cxReadFunc = cx.setCustomConsole((dat) => {
      io.print(new TextDecoder().decode(dat).replaceAll("\n", "\r\n"))
    }, t.cols, t.rows)
    io.onVTKeystroke = (str) => {
      readData(str)
    };
    io.sendString = (str) => {
      console.log(str);
      readData(str)
    };
    io.onTerminalResize = (cols, rows) => {
      cxReadFunc = cx.setCustomConsole((dat) => {
        io.print(new TextDecoder().decode(dat).replaceAll("\n", "\r\n"))
      }, cols, rows)
    };
    cx.run("/bin/bash", ["--login"], ["HOME=/home/user", "TERM=xterm", "USER=user", "SHELL=/bin/bash", "EDITOR=vim", "LANG=en_US.UTF-8", "LC_ALL=C"]);

    t.installKeyboard();


    htermNode.querySelector("iframe").style.position = "relative";
  }
});
