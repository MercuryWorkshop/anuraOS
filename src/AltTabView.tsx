interface AltTabViewState {
    windows: [App, WMWindow][];
    index: number;
}

class AltTabView {
    element: HTMLElement;
    state: AltTabViewState;

    viewWindow([app, win]: [App, WMWindow]) {
        return <p>{app.name}</p>;
    }

    view() {
        return (
            <div
                class="alttab-container"
                if={React.use(this.state.windows, (w) => Boolean(w.length))}
                then={
                    <div
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

    hide() {
        this.element.style.display = "none";
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

    show() {
        this.element.style.display = "block";
    }
}
