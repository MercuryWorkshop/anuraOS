class Dialog extends App {
    name = "Anura Dialog";
    package = "anura.dialog";
    icon = "/assets/icons/generic.png";
    source: string;
    hidden = true;

    constructor() {
        super();
    }

    async dialog(
        title: string,
        description: string,
    ): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, this as object);

        const h2 = document.createElement("h2");
        h2.textContent = title;
        win.content.appendChild(h2);
        const p = document.createElement("p");
        p.textContent = description;
        win.content.appendChild(p);

        const matter = document.createElement("link");
        matter.setAttribute("rel", "stylesheet");
        matter.setAttribute("href", "/assets/matter.css");

        return win;
    }
}
