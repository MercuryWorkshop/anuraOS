type AltTabViewState = {
    windows: [App, WMWindow][];
    index: number;
    active: boolean;
};

class AltTabView {
    element: HTMLElement;
    state: Stateful<AltTabViewState>;

    viewWindow([app, win, index]: [App, WMWindow, number]) {
        return (
            <div>
                <div
                    class={use(
                        this.state.index,
                        (stateIndex) =>
                            "alttab-window " +
                            (index === stateIndex
                                ? "alttab-window-selected"
                                : ""),
                    )}
                >
                    <div class="alttab-window-icon-container">
                        <img
                            class="alttab-icon-large"
                            src={app?.icon}
                            alt="App Icon"
                        />
                    </div>
                </div>
                <div class="alttab-titlebar">
                    <img
                        class="alttab-icon-inline"
                        src={app?.icon}
                        alt="App Icon"
                    />
                    <span class="alttab-window-title-text">
                        {win.state.title || app.name}
                    </span>
                </div>
            </div>
        );
    }

    view() {
        return (
            <div
                class={use(
                    this.state.active,
                    (active) =>
                        "alttab-container " + (active ? "" : "alttab-hidden"),
                )}
            >
                {$if(
                    use(this.state.windows.length, Boolean),
                    <div class="alttab-window-list">
                        {use(this.state.windows, (windows: [App, WMWindow][]) =>
                            windows
                                .map(([a, w], i) => [a, w, i])
                                .map(this.viewWindow.bind(this)),
                        )}
                    </div>,
                    <div class="alttab-nowindows">
                        <span>No windows</span>
                    </div>,
                )}
            </div>
        );
    }

    constructor() {
        this.state = $state<AltTabViewState>({
            windows: [],
            index: 0,
            active: false,
        });
        this.element = this.view();
    }

    update() {
        const windows = Object.values(anura.apps).flatMap(
            (a: App): [App, WMWindow][] => a.windows.map((w) => [a, w]),
        );
        windows.sort(
            ([_appA, winA], [_appB, winB]) =>
                Number(winB.element.style.zIndex) -
                Number(winA.element.style.zIndex),
        );
        this.state.windows = windows;
        // ensure index doesn't underflow or overflow
        this.state.index = Math.max(
            0,
            Math.min(this.state.index, this.state.windows.length - 1),
        );

        this.element.style.setProperty(
            "z-index",
            (getHighestZindex() + 1).toString(),
        );
        normalizeZindex();
    }

    onComboPress() {
        if (!this.state.active) {
            this.state.index = 1 % this.state.windows.length;
            this.state.active = true;
            return;
        }
        this.state.index = (this.state.index + 1) % this.state.windows.length;
    }

    onModRelease() {
        if (this.state.active) {
            this.state.active = false;
            const appWin = this.state.windows[this.state.index]!;
            if (!appWin) return;
            const [_app, win] = appWin;
            win.unminimize();
            win.focus();
        }
    }
}
