css = styled.new`
    self {
        width: 100%;
        height: 100%;
        background-color: #000;
    }
    canvas {
        width: 100%;
        height: 100%;
        background-color: #000;
    }
`;

class x86MgrApp extends App {
    name = "x86 Manager";
    package = "anura.x86mgr";
    icon = "/assets/xorg.svg";
    source: string;

    screen_container = (
        <div id="screen_container" class={css}>
            <div style="white-space: pre; font: 14px monospace; line-height: 14px"></div>
            <canvas on:click={() => $el.requestPointerLock()}></canvas>
        </div>
    );

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

        win.content.appendChild(this.screen_container);

        taskbar.updateTaskbar();

        return win;
    }
}
