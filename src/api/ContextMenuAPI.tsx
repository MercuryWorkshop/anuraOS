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
    constructor() {
        setTimeout(
            () =>
                document.addEventListener("click", (event) => {
                    const withinBoundaries = event
                        .composedPath()
                        .includes(this.#element);

                    if (!withinBoundaries) {
                        this.#element.remove();
                    }
                }),
            100,
        );
    }
    removeAllItems() {
        this.#element.innerHTML = "";
    }
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
        this.#element.focus();

        return this.#element;
    }
    hide() {
        if (this.#isShown) {
            document.body.removeChild(this.#element);
            this.#isShown = false;
        }
    }
}
