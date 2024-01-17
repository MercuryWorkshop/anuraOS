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
        // Reset out of bound fixes
        this.#element.style.bottom = "";
        this.#element.style.right = "";

        this.#element.style.top = y.toString() + "px";
        this.#element.style.left = x.toString() + "px";
        document.body.appendChild(this.#element);
        this.#isShown = true;
        this.#element.focus();

        // Check for bounding and fix if necessary
        console.log(this.#element.getBoundingClientRect());
        console.log(document.body.getBoundingClientRect());
        if (
            this.#element.getBoundingClientRect().bottom >=
            document.body.getBoundingClientRect().bottom
        ) {
            this.#element.style.top = "";
            this.#element.style.bottom = 0;
        }
        if (
            this.#element.getBoundingClientRect().right >=
            document.body.getBoundingClientRect().right
        ) {
            this.#element.style.left = "";
            this.#element.style.right = 0;
        }

        return this.#element;
    }
    hide() {
        if (this.#isShown) {
            document.body.removeChild(this.#element);
            this.#isShown = false;
        }
    }
}
