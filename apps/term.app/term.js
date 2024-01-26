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
        let currentCol;
        let currentRow;
		let e = document.querySelector("iframe").contentDocument.querySelector("x-screen");
		console.log(e);
		e.style.overflow = "hidden"
		let io = t.io.push();

		t.setBackgroundColor("#141516");
		t.setCursorColor("#bbb");
        currentCol = t.screenSize.width;
        currentRow = t.screenSize.height;


		if (anura.x86 == undefined) {
			io.print("\u001b[33mThe anura x86 subsystem is not enabled. Please enable it in the settings.\u001b[0m")
			return;
		}

		io.print("Welcome to the Anura x86 subsystem.\nTo access your filesystem within linux use the /root directory.")
		const pty = await anura.x86.openpty("TERM=xterm DISPLAY=:0 bash", t.screenSize.width, t.screenSize.height, (data) => {
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
		console.log("wtf")

	}
});
