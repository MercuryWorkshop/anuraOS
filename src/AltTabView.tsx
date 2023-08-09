interface AltTabViewState {
    windows: [App, WMWindow][];
    index: number;
}

class AltTabView {
    element: HTMLElement;
    state: AltTabViewState;

    viewWindow([app, win, index]: [App, WMWindow, number]) {
        console.log(win.element);
        return (
            <div>
                <div
                    class={React.use(
                        this.state.index,
                        (stateIndex) =>
                            "alttab-window " +
                            (index == stateIndex
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
                    <p>{app.name}</p>
                </div>
            </div>
        );
    }

    view() {
        return (
            <div
                class="alttab-container"
                if={React.use(this.state.windows, (w) => Boolean(w.length))}
                then={
                    <div
                        class="alttab-window-list"
                        for={React.use(
                            this.state.windows,
                            (windows: [App, WMWindow][]) =>
                                windows.map(([a, w], i) => [a, w, i]),
                        )}
                        do={this.viewWindow.bind(this)}
                    />
                }
                else={
                    <div class="alttab-nowindows">
                        <p>No windows</p>
                    </div>
                }
            />
        );
    }

    constructor() {
        this.state = stateful({ windows: [], index: 0 });
        this.element = this.view();
        this.hide();
    }

    update() {
        this.state.windows = Object.values(anura.apps).flatMap(
            (a: App): [App, WMWindow][] => a.windows.map((w) => [a, w]),
        );
        // ensure index doesn't underflow or overflow
        this.state.index = Math.max(
            0,
            Math.min(this.state.index, 0, this.state.windows.length - 1),
        );
    }

    hide() {
        this.element.style.visibility = "hidden";
    }

    show() {
        this.element.style.visibility = "visible";
    }
}
