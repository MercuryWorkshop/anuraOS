// FIXME: This is not what God wanted (someone pls redo)

class Dialog extends App {
    name = "Anura Dialog";
    package = "anura.dialog";
    icon = "/assets/icons/generic.png";
    source: string;
    hidden = true;
    styling = css`
        margin: 16px;
        h2 {
            font-size: 1.2rem;
        }
        .confirm {
            margin-left: 5px;
        }
    `;

    constructor() {
        super();
    }

    alert(message: string) {
        const dialog = this as object;
        (dialog as any).title = "";
        const win = anura.wm.create(this, dialog);

        // MARK: The DAMN CSS
        win.content.style.background = "var(--material-bg)";
        win.content.style.color = "white";

        const wrapper = <div class={[this.styling]}></div>;
        win.content.appendChild(wrapper);
        const messageElement = <h2>{message}</h2>;
        wrapper.appendChild(messageElement);
        const buttons = <div />;
        const closeButton = (
            <button class={["matter-button-contained"]}>OK</button>
        );
        closeButton.addEventListener("click", (event) => {
            win.close();
        });
        buttons.appendChild(closeButton);
        wrapper.appendChild(buttons);
    }
    async confirm(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            const win = anura.wm.create(this, dialog);

            // MARK: The DAMN CSS
            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            const wrapper = <div class={[this.styling]}></div>;
            win.content.appendChild(wrapper);
            const messageElement = <h2>{message}</h2>;
            wrapper.appendChild(messageElement);
            const buttons = <div />;
            const cancelButton = (
                <button class={["matter-button-outlined"]}>Cancel</button>
            );
            cancelButton.addEventListener("click", (event) => {
                resolve(false);
                win.close();
            });
            buttons.appendChild(cancelButton);
            const confirmButton = (
                <button class={["matter-button-contained", "confirm"]}>
                    OK
                </button>
            );
            confirmButton.addEventListener("click", (event) => {
                resolve(true);
                win.close();
            });
            buttons.appendChild(confirmButton);
            wrapper.appendChild(buttons);
        });
    }
    async prompt(message: string, defaultValue?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            const win = anura.wm.create(this, dialog);

            // MARK: The DAMN CSS
            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            const wrapper = <div class={[this.styling]}></div>;
            win.content.appendChild(wrapper);
            const messageElement = <h2>{message}</h2>;
            wrapper.appendChild(messageElement);

            // FIXME: THIS TEXTFIELD SUCKS!!1
            const textField = <label class={["matter-textfiled-filled"]} />;
            const inputElement = <input placeholder=" " />;
            textField.appendChild(inputElement);
            wrapper.appendChild(textField);

            const buttons = <div />;

            const cancelButton = (
                <button class={["matter-button-outlined"]}>Cancel</button>
            );
            cancelButton.addEventListener("click", (event) => {
                resolve(null);
                win.close();
            });
            buttons.appendChild(cancelButton);

            const confirmButton = (
                <button class={["matter-button-contained", "confirm"]}>
                    OK
                </button>
            );
            confirmButton.addEventListener("click", (event) => {
                //@ts-ignore
                const value = inputElement.value;
                if (value && value !== "") {
                    resolve(value);
                } else if (defaultValue) {
                    resolve(defaultValue);
                } else {
                    resolve(null);
                }
                win.close();
            });
            buttons.appendChild(confirmButton);
            wrapper.appendChild(buttons);
        });
    }
}
