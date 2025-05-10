interface ModuleProcessExports {
	main?: (args: string[]) => void;
}

type ModuleProcessFrame = HTMLIFrameElement & {
	contentWindow: Window & { moduleProcess: ModuleProcessExports };
};

class Processes {
	processesDiv = (<div id="processes"></div>);
	constructor() {
		document.body.appendChild(this.processesDiv);
	}

	get procs() {
		return this.state.procs;
	}

	set procs(value) {
		this.state.procs = value;
	}

	state = $state({
		procs: $state([] as WeakRef<Process>[]),
	});

	remove(pid: number) {
		delete this.state.procs[pid];
		// eslint-disable-next-line no-self-assign
		this.state.procs = this.state.procs;
	}

	register(proc: Process) {
		this.state.procs.push(new WeakRef(proc));
		// eslint-disable-next-line no-self-assign
		this.state.procs = this.state.procs;
	}

	create(
		script: string,
		type: "common" | "module" = "common",
		args: string[] = [],
	): IframeProcess {
		const proc = new IframeProcess(script, type, this.procs.length, args);
		this.register(proc);
		return proc;
	}

	async execute(path: string, args: string[] = [], useLogger: boolean = false) {
		const data = await anura.fs.promises.readFile(path);
		// Read the file until the first newline
		let i = 0;
		while (data[i] !== 10 && i < data.length) {
			i++;
		}
		const shebang = new TextDecoder().decode(data.slice(0, i));

		const options: { lang: "module" | "common"; version?: string } = {
			lang: "module",
		};

		if (shebang.startsWith("#!")) {
			const [_, opt] = shebang.split(" ");
			if (opt) {
				Object.assign(options, JSON.parse(opt));
			}
		}

		const payload = data.slice(i + 1);

		if (["common", "module"].includes(options.lang)) {
			const script = new TextDecoder().decode(payload);
			const proc = this.create(script, options.lang, args);

			// Whether to pipe to the built-in logger, useful if you are lazy and want
			// devtools to contain the std streams without any effort
			if (useLogger) {
				const { stdout, stderr } = anura.logger.createStreams(proc.title);
				proc.stdout.pipeTo(stdout);
				proc.stderr.pipeTo(stderr);
			}

			return proc;
		}

		throw new Error("Invalid shebang");
	}
}

abstract class Process {
	abstract pid: number;
	abstract title: string;

	stdout: ReadableStream<Uint8Array>;
	stderr: ReadableStream<Uint8Array>;
	stdin: WritableStream<Uint8Array>;

	kill(code?: number) {
		anura.processes.remove(this.pid);
	}

	get args(): string[] {
		return [];
	}
	abstract get alive(): boolean;
}

/**
 * Dumb hack to convert utf-8 to base64
 */
function utoa(data: string) {
	return btoa(unescape(encodeURIComponent(data)));
}

class IframeProcess extends Process {
	script: string;
	title = "Process";
	frame: HTMLIFrameElement;

	#args: string[] = [];

	constructor(
		script: string,
		type: "common" | "module" = "common",
		public pid: number,
		args: string[] = [],
	) {
		super();
		this.title = `Process ${pid}`;
		this.#args = args;

		this.frame = (
			<iframe
				id={`proc-${pid}`}
				style="display: none;"
				src={
					"/display?content=" +
					encodeURIComponent(`<!DOCTYPE html>
<html>
    <head>
        <script ${type === "module" ? 'type="module"' : ""}>
        ${type === "module" ? `globalThis.moduleProcess = await import("data:text/javascript;base64,${utoa(script)}"); if ( typeof moduleProcess?.main === "function" ) { await moduleProcess.main(${JSON.stringify(args)}); }` : script}
        </script>
    </head>
</html>`)
				}
			></iframe>
		) as ModuleProcessFrame;

		anura.processes.processesDiv.appendChild(this.frame);

		Object.assign(this.frame.contentWindow!, {
			anura,
			AliceWM,
			ExternalApp,
			LocalFS,
			print: (message: string) => {
				this.window.postMessage({
					type: "stdout",
					message,
				});
			},
			println: (message: string) => {
				this.window.postMessage({
					type: "stdout",
					message: message + "\n",
				});
			},
			printerr: (message: string) => {
				this.window.postMessage({
					type: "stderr",
					message,
				});
			},
			// Alias for printerr
			eprint: (message: string) => {
				this.window.postMessage({
					type: "stderr",
					message,
				});
			},
			printlnerr: (message: string) => {
				this.window.postMessage({
					type: "stderr",
					message: message + "\n",
				});
			},
			// Alias for printlnerr
			eprintln: (message: string) => {
				this.window.postMessage({
					type: "stderr",
					message: message + "\n",
				});
			},
			read: () => {
				return new Promise((resolve) => {
					this.window.addEventListener(
						"message",
						(e) => {
							if (e.data.type === "stdin") {
								resolve(e.data.message);
							}
						},
						{ once: true },
					);
				});
			},
			readln: () => {
				return new Promise((resolve) => {
					// Read until a newline
					let buffer = "";
					const listener = (e: MessageEvent<any>) => {
						if (e.data.type === "stdin") {
							buffer += e.data.message;
							if (buffer.includes("\n")) {
								resolve(buffer);
								this.window.removeEventListener("message", listener);
							}
						}
					};
					this.window.addEventListener("message", listener);
				});
			},
			// Exit codes are not implemented yet but it is good practice to include them anyways
			exit: (code?: number) => {
				this.kill(code);
			},
			env: {
				process: this,
			},
		});

		this.stdin = new WritableStream({
			write: (message) => {
				this.window.postMessage({
					type: "stdin",
					message,
				});
			},
		});

		this.stderr = new ReadableStream({
			start: (controller) => {
				this.window.addEventListener("error", (e) => {
					const en = new TextEncoder();
					controller.enqueue(en.encode(e.error.message + "\n"));
				});

				this.window.addEventListener("message", (e) => {
					if (e.data.type === "stderr") {
						if (typeof e.data.message === "string") {
							const en = new TextEncoder();
							e.data.message = en.encode(e.data.message);
						}

						controller.enqueue(e.data.message);
					}
				});
			},
		});

		this.stdout = new ReadableStream({
			start: (controller) => {
				this.window.addEventListener("message", (e) => {
					if (e.data.type === "stdout") {
						if (typeof e.data.message === "string") {
							const en = new TextEncoder();
							e.data.message = en.encode(e.data.message);
						}

						controller.enqueue(e.data.message);
					}
				});
			},
		});
	}

	#closing = false;

	kill(code?: number) {
		// Make sure all messages are received by sending a dummy message and waiting

		if (code) {
			console.warn("Exit codes are not implemented yet, ignoring");
		}

		this.#closing = true;

		this.window.addEventListener("message", (e) => {
			if (e.data.type === "kill") {
				this.frame.remove();
				super.kill();
			}
		});
		this.window.postMessage({ type: "kill" });
	}

	get args() {
		return this.#args;
	}

	get alive() {
		return !this.#closing || !this.frame.isConnected;
	}

	get window() {
		return this.frame.contentWindow!;
	}

	get document() {
		return this.frame.contentDocument!;
	}
}
