// FIXME: This is not what God wanted (someone pls redo)

class Dialog extends App {
    name = "Anura Dialog";
    package = "anura.dialog";
    icon = "/assets/icons/generic.png";
    source: string;
    hidden = true;

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

        const wrapper = document.createElement("div");
        wrapper.style.margin = "16px";
        win.content.appendChild(wrapper);
        const messageElement = document.createElement("h2");
        messageElement.style.fontSize = "1.2rem";
        messageElement.textContent = message;
        wrapper.appendChild(messageElement);
        const closeButton = document.createElement("button");
        closeButton.addEventListener("click", (event) => {
            win.close();
        });
        closeButton.textContent = "OK";
        closeButton.classList.add("matter-button-contained");
        wrapper.appendChild(closeButton);
    }
    async confirm(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            const win = anura.wm.create(this, dialog);

            // MARK: The DAMN CSS
            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            const wrapper = document.createElement("div");
            wrapper.style.margin = "16px";
            win.content.appendChild(wrapper);
            const messageElement = document.createElement("h2");
            messageElement.style.fontSize = "1.2rem";
            messageElement.textContent = message;
            wrapper.appendChild(messageElement);
            const cancelButton = document.createElement("button");
            cancelButton.classList.add("matter-button-outlined");
            cancelButton.addEventListener("click", (event) => {
                resolve(false);
                win.close();
            });
            cancelButton.textContent = "Cancel";
            wrapper.appendChild(cancelButton);
            const confirmButton = document.createElement("button");
            confirmButton.style.marginLeft = "5px";
            confirmButton.classList.add("matter-button-contained");
            confirmButton.addEventListener("click", (event) => {
                resolve(true);
                win.close();
            });
            confirmButton.textContent = "OK";
            wrapper.appendChild(confirmButton);
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

            const wrapper = document.createElement("div");
            wrapper.style.margin = "16px";
            win.content.appendChild(wrapper);
            const messageElement = document.createElement("h2");
            messageElement.style.fontSize = "1.2rem";

            messageElement.textContent = message;
            wrapper.appendChild(messageElement);

            // FIXME: THIS TEXTFIELD SUCKS!!1
            const textField = document.createElement("label");
            textField.classList.add("matter-textfield-filled");
            const inputElement = document.createElement("input");
            inputElement.placeholder = " ";
            // const label = document.createElement("span");
            // label.innerText = "Enter text";
            // textField.appendChild(label);
            textField.appendChild(inputElement);
            wrapper.appendChild(textField);

            const buttons = document.createElement("div");

            const cancelButton = document.createElement("button");
            cancelButton.addEventListener("click", (event) => {
                resolve(null);
                win.close();
            });
            cancelButton.textContent = "Cancel";
            cancelButton.classList.add("matter-button-outlined");
            buttons.appendChild(cancelButton);

            const confirmButton = document.createElement("button");
            confirmButton.classList.add("matter-button-contained");
            confirmButton.style.marginLeft = "5px";
            confirmButton.addEventListener("click", (event) => {
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
            confirmButton.textContent = "OK";
            buttons.appendChild(confirmButton);

            wrapper.appendChild(buttons);
        });
    }
}
