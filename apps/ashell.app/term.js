// const { create_shell } = await anura.import("anura.shell.phoenix");
const shell = anura.settings.get("shell") || "/usr/bin/chimerix.ajs";
anura.settings.set("shell", shell);

const config = anura.settings.get("anura-shell-config") || {};
anura.settings.set("anura-shell-config", config);

const term = (globalThis.term = new hterm.Terminal());
const $term = document.getElementById("terminal");

const encoder = new TextEncoder();

term.decorate($term);

term.onTerminalReady = async () => {
    $term
        .querySelector("iframe")
        .contentDocument.querySelector("x-screen").style.overflow = "hidden";
    term.setBackgroundColor(anura.ui.theme.darkBackground);
    term.setCursorColor(anura.ui.theme.foreground);

    if (anura.settings.get("transparent-ashell")) {
        frameElement.style.backgroundColor = "rgba(0, 0, 0, 0)";
        frameElement.parentNode.parentNode.style.backgroundColor =
            "rgba(0, 0, 0, 0)";
        frameElement.parentNode.parentNode.style.backdropFilter = "blur(5px)";
        document
            .querySelector("iframe")
            .contentDocument.querySelector("x-screen").style.backgroundColor =
            anura.ui.theme.background + "d9";
        Array.from(frameElement.parentNode.parentNode.children).filter((e) =>
            e.classList.contains("title"),
        )[0].style.backgroundColor = anura.ui.theme.background + "d9";
    }

    let io = term.io.push();

    const proc = await anura.processes.execute(shell);

    const stdinWriter = proc.stdin.getWriter();

    io.onVTKeystroke = (key) => {
        stdinWriter.write(key);
    };

    io.sendString = (str) => {
        stdinWriter.write(str);
    };

    io.onTerminalResize = (cols, rows) => {
        proc.window.postMessage({
            type: "ioctl.set",
            windowSize: {
                rows,
                cols,
            },
        });
    };

    proc.window.addEventListener("message", (event) => {
        if (event.data.type === "ready") {
            io.onTerminalResize(term.screenSize.width, term.screenSize.height);
        }
    });

    term.installKeyboard();

    proc.stdout.pipeTo(
        new WritableStream({
            write: (chunk) => {
                io.writeUTF8(LF_to_CRLF(chunk));
            },
        }),
    );

    proc.stderr.pipeTo(
        new WritableStream({
            write: (chunk) => {
                io.writeUTF8(LF_to_CRLF(chunk));
            },
        }),
    );
    const oldProcKill = proc.kill.bind(proc);

    proc.kill = () => {
        oldProcKill();
        instanceWindow.close();
    };

    instanceWindow.addEventListener("close", () => {
        proc.kill();
    });

    proc.exit = proc.kill.bind(proc);
};

function LF_to_CRLF(input) {
    let lfCount = 0;
    for (let i = 0; i < input.length; i++) {
        if (input[i] === 0x0a) {
            lfCount++;
        }
    }

    const output = new Uint8Array(input.length + lfCount);

    let outputIndex = 0;
    for (let i = 0; i < input.length; i++) {
        // If LF is encountered, insert CR (0x0D) before LF (0x0A)
        if (input[i] === 0x0a) {
            output[outputIndex++] = 0x0d;
        }
        output[outputIndex++] = input[i];
    }

    return output;
}
