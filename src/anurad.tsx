interface InitScriptExports {
    name: string;
    provides: string[];
    description: string;
    depend: () => Promise<void>;
    start: () => Promise<void>;
    stop: () => Promise<void>;
}

type InitScriptFrame = HTMLIFrameElement & {
    contentWindow: Window & { initScript: InitScriptExports };
};

class Anurad extends Process {
    initScripts: AnuradInitScript[] = [];
    title = "anurad";

    constructor(public pid: number) {
        super();
        AnuradHelpers.setStage("anurad");
    }

    async addInitScript(script: string) {
        const initScript = new AnuradInitScript(
            script,
            anura.processes.state.procs.length,
        );
        anura.processes.register(initScript);
        this.initScripts.push(initScript);
    }

    get alive(): boolean {
        return this.initScripts[0]!.alive;
    }

    async kill() {
        for (const initScript of this.initScripts) {
            initScript.kill();
        }
        super.kill();
    }
}

class AnuradInitScript implements Process {
    script: string;
    frame: InitScriptFrame;
    window: InitScriptFrame["contentWindow"];
    info?: InitScriptExports;

    get title() {
        return this.info?.name as string;
    }

    set title(value: string) {
        this.info!.name = value;
    }

    constructor(
        script: string,
        public pid: number,
    ) {
        this.script = script;
        this.frame = (
            <iframe
                id={`proc-${pid}`}
                style="display: none"
                srcdoc={`
            <!DOCTYPE html>
            <html>
                <head>
                    <script type="module">
                        globalThis.initScript = await import("data:text/javascript;base64,${btoa(script)}");
                        window.postMessage({ type: "init" });
                    </script>
                </head>
            </html>
            
            `}
            />
        ) as InitScriptFrame;

        anura.processes.processesDiv.appendChild(this.frame);
        this.window = this.frame.contentWindow!;

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
            printlnerr: (message: string) => {
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
                                this.window.removeEventListener(
                                    "message",
                                    listener,
                                );
                            }
                        }
                    };
                    this.window.addEventListener("message", listener);
                });
            },
            env: {
                process: this,
            },
        });

        this.window.addEventListener("message", async (event) => {
            if (event.data.type === "init") {
                // this.info = this.frame.contentWindow!.initScript;
                // initScript is a module so it is not extensible.

                this.info = {} as InitScriptExports;
                Object.assign(this.info, this.frame.contentWindow!.initScript);

                this.info.depend ||= async () => {};
                this.info.start ||= async () => {};
                this.info.stop ||= async () => {};

                this.info.name ||= "Anurad Script " + this.pid;
                this.info.description ||= "Anurad script with PID " + this.pid;
                this.info.provides ||= [];

                await this.info.depend();
                await this.info.start();
                AnuradHelpers.setStage(this.info.name);
            }
        });

        this.stdout = new ReadableStream({
            start: (controller) => {
                this.window!.addEventListener("message", (e) => {
                    if (e.data.type === "stdout") {
                        controller.enqueue(e.data.message);
                    }
                });
            },
        });

        this.stderr = new ReadableStream({
            start: (controller) => {
                this.window!.addEventListener("error", (e) => {
                    controller.enqueue(e.error);
                });

                this.window!.addEventListener("message", (e) => {
                    if (e.data.type === "stderr") {
                        controller.enqueue(e.data.message);
                    }
                });
            },
        });
    }

    get alive(): boolean {
        return this.frame.isConnected;
    }

    kill(): void {
        this.info!.stop();
        this.frame.remove();
        anura.processes.remove(this.pid);
    }

    stdin: WritableStream<Uint8Array>;

    stderr: ReadableStream<Uint8Array>;

    stdout: ReadableStream<Uint8Array>;
}
