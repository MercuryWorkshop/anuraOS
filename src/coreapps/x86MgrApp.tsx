class x86MgrApp extends App {
    name = "x86 Manager";
    package = "anura.x86mgr";
    icon = "/assets/xorg.svg";
    source: string;
    constructor() {
        super();
    }
    async open(): Promise<WMWindow | undefined> {
        const win = AliceWM.create({
            title: "x86",
            width: "700px",
            height: "500px",
        } as unknown as any);
        this.windows[0] = win;

        win.content.appendChild(anura.x86!.screen_container);

        taskbar.updateTaskbar();
        alttab.update();

        return win;
    }
}
