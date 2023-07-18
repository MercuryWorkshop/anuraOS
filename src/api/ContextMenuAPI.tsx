class ContextMenuAPI {
    #element = (<div class="custom-menu" style=""></div>);
    item(text: string, callback: VoidFunction) {
        return (
            <div class="custom-menu-item" on:click={callback.bind(this)}>
                {text}
            </div>
        );
    }
    #isShown = false;
    constructor() {}
    addItem(text: string, callback: VoidFunction) {
        this.#element.appendChild(
            this.item(text, function () {
                this.hide();
                callback();
            }),
        );
    }
    show(x: number, y: number) {
        this.#element.style.top = y.toString() + "px";
        this.#element.style.left = x.toString() + "px";
        document.body.appendChild(this.#element);
        this.#isShown = true;
    }
    hide() {
        if (this.#isShown) {
            document.body.removeChild(this.#element);
            this.#isShown = false;
        }
    }
}
