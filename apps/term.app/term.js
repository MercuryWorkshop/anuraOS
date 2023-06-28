const $ = document.querySelector.bind(document);



window.addEventListener("load", async () => {

  /** @type {Anura} */
  let anura = top.anura;

  const t = new hterm.Terminal();
  top.t = t;

  let htermNode = $("#terminal");





  t.decorate(htermNode);


  const decoder = new TextDecoder("UTF-8");
  t.onTerminalReady = async () => {
    let io = t.io.push();

    t.setBackgroundColor("#141516");
    t.setCursorColor("#bbb");
    const pty = await anura.x86.openpty("TERM=xterm bash", t.screenSize.width, t.screenSize.height, (data) => {
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
