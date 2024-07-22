class Processes {
    procs: WeakRef<Process>[] = [];

    create(
        script: string,
        type: "common" | "module" = "common",
    ): IframeProcess {
        const proc = new IframeProcess(script, type, this.procs.length);
        this.procs.push(new WeakRef(proc));
        return proc;
    }
}

abstract class Process {
    pid: number;

    stdout: ReadableStream<Uint8Array>;
    stderr: ReadableStream<Uint8Array>;
    stdin: WritableStream<Uint8Array>;

    kill() {
        delete anura.processes.procs[this.pid];
    }
    abstract get alive(): boolean;
}

class IframeProcess extends Process {
    script: string;
    frame: HTMLIFrameElement;

    constructor(
        script: string,
        type: "common" | "module" = "common",
        public pid: number,
    ) {
        super();
        this.frame = (
            <iframe
                style="display: none;"
                srcdoc={`
<!DOCTYPE html>
<html>
    <head>
        <script ${type === "module" ? 'type="module"' : ""}>
        ${script}
        </script>
    </head>
</html>
        `}
            ></iframe>
        ) as HTMLIFrameElement;

        document.body.appendChild(this.frame);

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
                    controller.enqueue(e.error);
                });

                this.window.addEventListener("message", (e) => {
                    if (e.data.type === "stderr") {
                        controller.enqueue(e.data.message);
                    }
                });
            },
        });

        this.stdout = new ReadableStream({
            start: (controller) => {
                this.window.addEventListener("message", (e) => {
                    if (e.data.type === "stdout") {
                        controller.enqueue(e.data.message);
                    }
                });
            },
        });
    }

    kill() {
        super.kill();
        this.frame.remove();
    }

    get alive() {
        return this.frame.isConnected;
    }

    get window() {
        return this.frame.contentWindow!;
    }

    get document() {
        return this.frame.contentDocument!;
    }
}
