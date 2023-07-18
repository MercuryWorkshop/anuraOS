class x86MgrApp implements App {
    name = "x86 Manager";
    package = "anura.x86mgr";
    icon = "/assets/xorg.svg";
    windows: WMWindow[];
    source: string;

    screen_container = (
        <div id="screen_container">
            <div style="white-space: pre; font: 14px monospace; line-height: 14px"></div>
            <canvas></canvas>
        </div>
    );

    constructor() {
        this.windows = [];
    }
    async open(): Promise<WMWindow | undefined> {
        const win = AliceWM.create({
            title: "x86",
            width: "700px",
            height: "500px",
        } as unknown as any);
        this.windows[0] = win;

        win.content.appendChild(this.screen_container);

        taskbar.updateTaskbar();

        return win;
    }
}
