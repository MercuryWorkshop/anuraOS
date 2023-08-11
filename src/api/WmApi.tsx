class WMAPI {
    windows: WeakRef<WMWindow>[] = [];
    create(
        ctx: App,
        info: object,
        onfocus: (() => void) | null = null,
        onresize: ((w: number, h: number) => void) | null = null,
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
        ctx.windows.push(win);
        this.windows.push(new WeakRef(win));

        taskbar.updateTaskbar();
        alttab.update();
        return win;
    }
}
