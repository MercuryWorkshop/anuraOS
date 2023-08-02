class XFrogApp extends App {
    manifest: AppManifest;

    constructor() {
        super();
        this.name = "XFROG";
        this.package = "anura.xfrog";
    }
    async open() {
        const win = anura.wm.create(
            this,
            {
                title: "",
                width: "700px",
                height: "500px",
            },
            () => sfocus(),
        );

        const apppty = await anura.x86!.openpty(
            "DISPLAY=:0 xterm",
            1,
            1,
            (data) => {
                console.log("XF86: " + data);
            },
        );

        function sfocus() {
            win.content.appendChild(anura.x86?.screen_container);
        }
    }
}
