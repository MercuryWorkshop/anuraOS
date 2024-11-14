class WMAPI {
    windows: WeakRef<WMWindow>[] = [];
    hasFullscreenWindow = false;
    create(ctx: App, info: object): WMWindow {
        const win = AliceWM.create(info as unknown as any, ctx);
        win.focus();

        win.addEventListener("focus", (event) => {
            //@ts-ignore
            document.activeElement?.blur();
            alttab.update();

            taskbar.element.style.zIndex = getHighestZindex() + 3 + "";
        });

        win.addEventListener("resize", (event: MessageEvent) => {});

        win.addEventListener("close", (event) => {
            this.windows = this.windows.filter(
                (w: WeakRef<WMWindow>) => w.deref() !== win,
            );
        });

        win.addEventListener("maximize", () => {
            taskbar.maximizedWins.push(win);
            taskbar.updateRadius();
        });

        win.addEventListener("unmaximize", () => {
            taskbar.maximizedWins = taskbar.maximizedWins.filter(
                (w) => w !== win,
            );
            taskbar.updateRadius();
        });

        win.addEventListener("snap", (event: MessageEvent) => {
            taskbar.updateRadius();
        });

        ctx.windows.push(win);
        this.windows.push(new WeakRef(win));

        taskbar.updateTaskbar();
        alttab.update();
        return win;
    }
    createGeneric(info: object): WMWindow {
        const win = AliceWM.create(info as unknown as any);
        const ctx = anura.apps["anura.generic"];
        win.focus();

        win.addEventListener("focus", (event) => {
            //@ts-ignore
            document.activeElement?.blur();
            alttab.update();

            taskbar.element.style.zIndex = getHighestZindex() + 3 + "";
        });

        win.addEventListener("resize", (event: MessageEvent) => {});

        win.addEventListener("close", (event) => {
            this.windows = this.windows.filter(
                (w: WeakRef<WMWindow>) => w.deref() !== win,
            );
        });

        win.addEventListener("maximize", () => {
            taskbar.maximizedWins.push(win);
            taskbar.updateRadius();
        });

        win.addEventListener("unmaximize", () => {
            taskbar.maximizedWins = taskbar.maximizedWins.filter(
                (w) => w !== win,
            );
            taskbar.updateRadius();
        });

        win.addEventListener("snap", (event: MessageEvent) => {
            taskbar.updateRadius();
        });

        ctx.windows.push(win);
        this.windows.push(new WeakRef(win));

        taskbar.updateTaskbar();
        alttab.update();
        return win;
    }
}
