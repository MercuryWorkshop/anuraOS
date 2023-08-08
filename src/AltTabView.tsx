interface AltTabViewState {
    windows: [App, WMWindow][];
    index: number;
}

class AltTabView {
    element: HTMLElement;
    state: AltTabViewState;

    viewWindow([app, win]: [App, WMWindow]) {
        return (
            <div class="alttab-window">
                <div class="alttab-window-icon-container">
                    <img
                        class="alttab-window-icon"
                        src={app?.icon}
                        alt="App Icon"
                    />
                </div>
                <div>{app.name}</div>
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
                        for={React.use(this.state.windows)}
                        do={this.viewWindow.bind(this)}
                    />
                }
                else={<p>No windows</p>}
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
        // ensure index doesn't overflow
        this.state.index = Math.min(
            this.state.index,
            this.state.windows.length - 1,
        );
    }

    hide() {
        this.element.style.visibility = "hidden";
    }

    show() {
        this.element.style.visibility = "visible";
    }
}
