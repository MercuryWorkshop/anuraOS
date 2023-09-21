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
		const pty = await anura.x86.openpty("TERM=xterm DISPLAY=:0 bash", t.screenSize.width, t.screenSize.height, (data) => {
			io.print(data);
		});




		function writeData(str) {
			anura.x86.writepty(pty, str)
		}

		io.onVTKeystroke = writeData;
		io.sendString = writeData;

		io.onTerminalResize = (cols, rows) => {
			currentCol = cols;
            currentRow = rows;
		}

		t.installKeyboard();


		htermNode.querySelector("iframe").style.position = "relative";
		console.log("wtf")
		anura.apps['anura.term'].windows[anura.apps['anura.term'].windows.length - 1].onresize = () => {
			anura.x86.resizepty(pty, currentCol, currentRow);
		}

	}
});
