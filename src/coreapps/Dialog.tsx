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
        const matter = document.createElement("link");
        matter.setAttribute("rel", "stylesheet");
        matter.setAttribute("href", "/assets/matter.css");
        win.content.appendChild(matter);
        const messageElement = document.createElement("h2");
        messageElement.textContent = message;
        win.content.appendChild(messageElement);
        const closeButton = document.createElement("button");
        closeButton.addEventListener("click", (event) => {
            win.close();
        });
        closeButton.textContent = "OK";
        win.content.appendChild(closeButton);
    }
    async confirm(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            const win = anura.wm.create(this, dialog);
            const matter = document.createElement("link");
            matter.setAttribute("rel", "stylesheet");
            matter.setAttribute("href", "/assets/matter.css");
            win.content.appendChild(matter);
            const messageElement = document.createElement("h2");
            messageElement.textContent = message;
            win.content.appendChild(messageElement);
            const cancelButton = document.createElement("button");
            cancelButton.addEventListener("click", (event) => {
                resolve(false);
                win.close();
            });
            cancelButton.textContent = "Cancel";
            win.content.appendChild(cancelButton);
            const confirmButton = document.createElement("button");
            confirmButton.addEventListener("click", (event) => {
                resolve(true);
                win.close();
            });
            confirmButton.textContent = "OK";
            win.content.appendChild(confirmButton);
        });
    }
}
