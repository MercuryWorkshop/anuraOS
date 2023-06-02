const $ = document.querySelector.bind(document);



window.addEventListener("load", async () => {

  /** @type {Anura} */
  let anura = top.anura;

  const t = new hterm.Terminal();
  top.t = t;
  // Cool proprietary stuff, try not to touch it if you dont need to because its easy to break and hard to fix

  let htermNode = $("#terminal");





  t.decorate(htermNode);


  const decoder = new TextDecoder("UTF-8");
  t.onTerminalReady = async () => {
    let io = t.io.push();

    t.setBackgroundColor("#141516");
    t.setCursorColor("#bbb");
    const pty = await anura.x86.openpty("TERM=xterm bash", t.screenSize.height, t.screenSize.width, (data) => {
      io.print(data);
    });


    function writeData(str) {
      anura.x86.writepty(pty, str)
    }

    io.onVTKeystroke = writeData;
    io.sendString = writeData;
    io.onTerminalResize = (cols, rows) => {
      anura.x86.resizepty(pty, cols, rows);
    }

    t.installKeyboard();


    htermNode.querySelector("iframe").style.position = "relative";


  }
});
