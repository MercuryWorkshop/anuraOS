class XFrogApp extends App {
    manifest: AppManifest;

    activeWin: WMWindow;

    hidden = true;

    xwindows: { [wid: string]: WMWindow } = {};

    constructor() {
        super();
        this.name = "XFrog86";
        this.package = "anura.xfrog";
        this.icon = "/assets/icons/xfrog.png";
    }

    async startup() {
        console.debug("Starting Xfrog Client");
    }

    async open() {
        this.startup();
    }
}
