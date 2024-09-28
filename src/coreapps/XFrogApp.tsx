class XFrogApp extends App {
    name = "XFrog86";
    package = "anura.xfrog";
    icon = "/assets/icons/xfrog.png";
    hidden = true;
    activeWin: WMWindow;
    xwindows: { [wid: string]: WMWindow } = {};

    constructor() {
        super();
    }

    async startup() {
        console.debug("Starting Xfrog Client");
    }

    async open() {
        this.startup();
    }
}
