interface AltTabViewState {
    windows: WMWindow[];
    index: number;
}

class AltTabView {
    element: HTMLElement;
    state: AltTabViewState;

    constructor() {
        this.state = stateful({ windows: [], index: 0 });
        this.element = this.view();
    }

    static create() {
        const inst = new AltTabView();
        inst.hide();
        document.body.appendChild(inst.element);
        return inst;
    }

    view() {
        const inner = (
            <p>{React.use(this.state.windows, (w) => w.length)} windows</p>
        );
        return (
            <div
                class="alttab-container"
                if={React.use(this.state.windows, (w) => Boolean(w.length))}
                then={inner}
                else={<p>No windows</p>}
            />
        );
    }

    hide() {
        this.element.style.display = "none";
    }

    update() {}

    show() {
        this.element.style.display = "block";
    }
}
