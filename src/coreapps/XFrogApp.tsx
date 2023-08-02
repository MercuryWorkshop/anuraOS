class XFrogApp extends App {
    manifest: AppManifest;

    constructor() {
        super();
        this.name = "XFROG";
        this.package = "anura.xfrog";
    }
    async open() {
        const apppty = await anura.x86!.openpty(
            "DISPLAY=:0 glxgears",
            1,
            1,
            (data) => {
                console.log("XF86: " + data);
            },
        );
        await sleep(5000);
        const win = anura.wm.create(
            this,
            {
                title: "",
                width: "700px",
                height: "500px",
            },
            () => sfocus(),
        );

        const xwid = await new Promise((resolve) => {
            anura.x86!.openpty(
                'DISPLAY=:0 xdotool search --onlyvisible ".*" 2>/dev/null | tail -1',
                0,
                0,
                (num) => resolve(num.replaceAll("\r\n", "")),
            );
        });

        let timeout: any;

        async function sfocus() {
            win.content.appendChild(anura.x86?.screen_container);
            anura.x86?.vgacanvas.requestPointerLock();
            anura.x86?.vgacanvas.addEventListener("click", () => {
                anura.x86?.vgacanvas.requestPointerLock();
            });

            if (timeout) clearTimeout(timeout);
            timeout = setTimeout(
                () =>
                    anura.x86!.openpty(
                        `DISPLAY=:0 xdotool search --onlyvisible ".*" 2>/dev/null | while read wid; do DISPLAY=:0 xdotool windowunmap $wid; done; DISPLAY=:0 xdotool windowmap ${xwid}; DISPLAY=:0 xdotool windowmove ${xwid} 0 0; DISPLAY=:0 xdotool windowsize ${xwid} ${win.width} ${win.height}`,
                        0,
                        0,
                        console.log,
                    ),
                250,
            );
        }
    }
}
