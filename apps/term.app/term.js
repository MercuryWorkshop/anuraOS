const $ = document.querySelector.bind(document);



window.addEventListener("load", async () => {

  /** @type {Anura} */
  let anura = top.anura;

  const t = new hterm.Terminal();
  // Cool proprietary stuff, try not to touch it if you dont need to because its easy to break and hard to fix

  let htermNode = $("#terminal");





  t.decorate(htermNode);


  const decoder = new TextDecoder("UTF-8");
  t.onTerminalReady = async () => {
    let io = t.io.push();

    const pty = await anura.x86.openpty("bash", (data) => {
      io.print(data);
    });


    function writeData(str) {
      anura.x86.writepty(pty, str)
    }

    io.onVTKeystroke = writeData;
    io.sendString = writeData;
    // io.onTerminalResize = (cols, rows) => {
    //   cxReadFunc = cx.setCustomConsole((dat) => {
    //     io.print(new TextDecoder().decode(dat).replaceAll("\n", "\r\n"))
    //   }, cols, rows)
    // };
    // cx.run("/bin/bash", ["--login"], ["HOME=/home/user", "TERM=xterm", "USER=user", "SHELL=/bin/bash", "EDITOR=vim", "LANG=en_US.UTF-8", "LC_ALL=C"]);

    t.installKeyboard();


    htermNode.querySelector("iframe").style.position = "relative";


  }
});
