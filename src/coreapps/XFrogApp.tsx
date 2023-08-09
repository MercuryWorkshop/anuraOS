class XFrogApp extends App {
    manifest: AppManifest;

    activeWin: WMWindow;

    xwindows: { [wid: string]: WMWindow } = {};

    constructor() {
        super();
        this.name = "XFrog86";
        this.package = "anura.xfrog";
    }

    async startup() {
        console.log("Starting Xfrog Client");
        let buf: string[] = [];
        await anura.x86!.openpty(
            'while true; do DISPLAY=:0 xdotool search --maxdepth 1 ".*" 2>/dev/null; echo EOF;sleep 2; done',
            0,
            0,
            (data) => {
                for (const wid of data.split("\n")) {
                    if (wid.includes("EOF")) {
                        // remove root window from array
                        buf.shift();

                        this.proc_xwids(buf);

                        buf = [];
                    } else {
                        const stripped = wid.replaceAll("\r", "");
                        if (stripped) buf.push(stripped);
                    }
                }
            },
        );
    }

    async proc_xwids(wids: string[]) {
        console.log("xwids: " + wids);

        for (const wid of wids) {
            if (!this.xwindows[wid]) {
                await this.spawn_xwindow(wid);
            }
        }
        for (const wid in this.xwindows) {
            if (!wids.includes(wid)) {
                // xorg window has since been closed. dispose
                this.xwindows[wid]?.close();
                delete this.xwindows[wid];
            }
        }
    }

    async spawn_xwindow(xwid: string) {
        let timeout: any;
        let win: WMWindow | null = null;

        const sfocus = async () => {
            if (this.activeWin && this.activeWin != win) {
                const newImg = document.createElement("img");

                const blob: any = await new Promise(
                    (resolve) => anura.x86?.vgacanvas.toBlob(resolve),
                )!;
                const url = URL.createObjectURL(blob);
                newImg.src = url;
                this.activeWin.content.appendChild(newImg);
            }

            this.activeWin = win!;

            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(() => {
                // DISPLAY=:0 xdotool windowmap $(xwininfo -children -id ${xwid} | grep -o '^ \\+0x[0-9a-f]\\+');
                anura.x86!.openpty(
                    `DISPLAY=:0 xdotool search --maxdepth 1 --onlyvisible ".*" 2>/dev/null | while read wid; do DISPLAY=:0 xdotool windowunmap $wid; done; DISPLAY=:0 xdotool windowmap ${xwid}; DISPLAY=:0 xdotool windowmove ${xwid} 0 0; DISPLAY=:0 xdotool windowsize ${xwid} ${
                        win!.width
                    } ${win!.height}`,
                    0,
                    0,
                    console.log,
                );

                setTimeout(() => {
                    if (win!.content.querySelector("img")) {
                        URL.revokeObjectURL(
                            win!.content.querySelector("img")!.src,
                        );
                        win!.content.querySelector("img")!.remove();
                    }
                    win!.content.appendChild(anura.x86?.screen_container);

                    anura.x86?.vgacanvas.requestPointerLock();
                    anura.x86?.vgacanvas.addEventListener("click", () => {
                        anura.x86?.vgacanvas.requestPointerLock();
                    });
                }, 100);
            }, 50);
        };

        this.xwindows[xwid] = "placeholder" as any;

        await anura.x86?.openpty(
            `DISPLAY=:0 xdotool getwindowgeometry ${xwid} 2>/dev/null | grep -o '[0-9]*x[0-9]*'; while true; do DISPLAY=:0 xdotool getwindowname ${xwid}; sleep 5; done`,
            0,
            0,
            (data) => {
                if (!win) {
                    const dimensions = data
                        .replaceAll("\r", "")
                        .replaceAll("\n", "")
                        .split("x");
                    win = anura.wm.create(
                        this,
                        {
                            title: "X window",
                            width: `${dimensions[0]}px`,
                            height: `${dimensions[1]}px`,
                        },
                        () => sfocus(),
                    );

                    this.xwindows[xwid] = win;
                    // sfocus();
                } else {
                    const name = data.replaceAll("\r", "").replaceAll("\n", "");
                    if (name.includes("of failed request")) {
                        // window has since been closed
                    } else if (name) {
                        win.state.title = "X window: " + name;
                    }
                }
            },
        );
    }

    async open() {
        this.startup();
    }
}
