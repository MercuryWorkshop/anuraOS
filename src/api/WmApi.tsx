class WMAPI {
    windows: WeakRef<WMWindow>[] = [];
    create(
        ctx: App,
        info: object,
        onfocus: (() => void) | null = null,
        onresize: ((w: number, h: number) => void) | null = null,
        onclose: (() => void) | null = null,
    ): WMWindow {
        const win = AliceWM.create(info as unknown as any);

        win.focus();

        win.onfocus = () => {
            //@ts-ignore
            document.activeElement?.blur();
            alttab.update();

            taskbar.element.style.zIndex = getHighestZindex() + 3;
            if (onfocus) onfocus();
        };
        win.onresize = (width: number, height: number) => {
            if (onresize) onresize(width, height);
        };
        win.onclose = () => {
            if (onclose) onclose();
        };
        ctx.windows.push(win);
        this.windows.push(new WeakRef(win));

        taskbar.updateTaskbar();
        alttab.update();
        return win;
    }
}
