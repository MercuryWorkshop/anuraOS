const hterm = (await anura.import("anura.hterm")).default;
const root = document.getElementById("terminal");

const t = new hterm.Terminal();
t.decorate(root);
t.onTerminalReady = async () => {
	let e = document
		.querySelector("iframe")
		.contentDocument.querySelector("x-screen");
	e.style.overflow = "hidden";
	let io = t.io.push();

	t.setBackgroundColor("#141516");
	t.setCursorColor("#bbb");

	if (anura.x86 === undefined) {
		io.print(
			"\u001b[33mThe Anura x86 subsystem is not enabled. Please enable it in Settings.\u001b[0m",
		);
		return;
	}

	if (!anura.x86.ready) {
		io.print(
			"\u001b[33mThe Anura x86 subsystem has not yet booted. Please wait for the notification that it has booted and try again.\u001b[0m",
		);
		return;
	}

	await io.print(
		"Welcome to the Anura x86 subsystem.\r\nTo access your Anura files within Linux, use the /root directory.\r\n",
	);

	const pty = await anura.x86.openpty(
		"/bin/bash --login",
		t.screenSize.width,
		t.screenSize.height,
		(data) => {
			io.print(data);
		},
	);

	function writeData(str) {
		anura.x86.writepty(pty, str);
	}

	io.onVTKeystroke = writeData;
	io.sendString = writeData;

	io.onTerminalResize = (cols, rows) => {
		anura.x86.resizepty(pty, cols, rows);
	};

	instanceWindow.onclose = () => {
		anura.x86.closepty(pty);
	};

	t.installKeyboard();

	root.querySelector("iframe").style.position = "relative";
};
