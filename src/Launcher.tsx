class Launcher {
    element = (
        <div class="launcher">
            <div class="topSearchBar">
                <img src="/assets/icons/googleg.png"></img>
                <input
                    readonly
                    placeholder="Search your tabs, files, apps, and more..."
                    style="outline:none"
                />
            </div>

            <div id="appsView" class="appsView"></div>
        </div>
    );

    clickoffChecker = (
        <div id="clickoffChecker" class="clickoffChecker"></div>
    );

    constructor() {}

    toggleVisible() {
        this.element.classList.toggle("active");
        this.clickoffChecker.classList.toggle("active");
    }

    hide() {
        this.element.classList.remove("active");
        this.clickoffChecker.classList.remove("active");
    }

    addShortcut(app: App) {
        const shortcut = this.shortcutElement(app);
        shortcut.addEventListener("click", (...args) => {
            this.hide();
            app.open();
        });
        this.element.querySelector("#appsView").appendChild(shortcut);
    }

    shortcutElement(app: App): HTMLElement {
        return (
            <div class="app">
                <input
                    class="app-shortcut-image showDialog"
                    type="image"
                    src={app.icon}
                />
                <div class="app-shortcut-name">{app.name}</div>
            </div>
        );
    }
}
