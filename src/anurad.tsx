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

    constructor(public pid: number) {
        super();
        AnuradHelpers.setStage("anurad");
    }

    async addInitScript(script: string) {
        const initScript = new AnuradInitScript(
            script,
            anura.processes.procs.length,
        );
        anura.processes.procs.push(new WeakRef(initScript));
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

class AnuradInitScript extends Process {
    script: string;
    frame: InitScriptFrame;
    window: InitScriptFrame["contentWindow"];
    info?: InitScriptExports;

    constructor(
        script: string,
        public pid: number,
    ) {
        super();
        this.script = script;
        this.frame = (
            <iframe
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
        document.body.appendChild(this.frame);
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

                await this.info.depend();
                await this.info.start();
                AnuradHelpers.setStage(this.info.name);
            }
        });
    }

    get alive(): boolean {
        return this.frame.isConnected;
    }

    kill(): void {
        super.kill();
        this.info!.stop();
        this.frame.remove();
    }
}
