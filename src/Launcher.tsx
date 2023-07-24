class Launcher {
    css = styled.new`
self {
    position: absolute;
    width: min(70%, 35em);
    height: min(60%, 30em);
    background-color: rgba(22, 22, 22, 0.8);

    border: 2px solid rgba(22, 22, 22, 0.6);
    border-radius: 1em;
    bottom: 5.25em;
    backdrop-filter: blur(5px);
    display: flex;
    flex-direction: column;
    display: block;
    transition: all 0.1s ease-out;
    opacity: 0;
    z-index: -1;
    visibility: hidden;
}

self.active {
    display: block;
    opacity: 1;
    height: min(80%, 40em);
    z-index: 9999;
    transition: all 0.1s ease-in;
    visibility: visible;
}

.clickoffChecker {
    display: none;
}

.clickoffChecker.active {
    position: absolute;
    width: 100%;
    /* TODO: make this not be a magic number later with css variables */
    height: calc(100% - 51px);
    z-index: 9998;
    opacity: 0;
    top: 0;
    left: 0;
    bottom: 49px;
    display: block;
}

.topSearchBar {
    display: flex;
    flex-direction: row;
    padding: 1em;
    align-items: center;
}

.topSearchBar img {
    width: 1em;
    height: 1em;
    margin-right: 1em;
}

.topSearchBar input {
    flex-grow: 1;
    background: transparent;
    border: none;
}

.recentItemsWrapper {
    padding: 1em;
    font-size: 12px;
    border-top: 1px solid rgb(22 22 22 / 50%);
}

.recentItemsWrapper .recentItemsText {
    margin-left: 4em;
    margin-right: 4em;
    color: #fff;
    border-bottom: 1px solid rgb(22 22 22 / 50%);
    padding: 1em 0em;
}

.appsView {
    padding: 1em;
    font-size: 12px;
    flex-grow: 1;
    display: grid;
    grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
    grid-auto-rows: 8em;
}

.appsView .app {
    display: flex;
    flex-direction: column;
    align-items: center;
    color: #fff;
}

.appsView .app input[type="image"] {
    margin-bottom: 0.5em;
}

.appsView .app div {
    height: 1em;
}

.custom-menu {
    position: absolute;
    border: 1px solid #000000;
    background-color: rgba(0, 0, 0, 0.7);
    border-radius: 20px;
    padding: 10px 0;
    width: 300px;
    box-shadow: 2px 2px 6px rgba(0, 0, 0, 0.5);

    z-index: 10000;
    overflow: hidden;
}
.custom-menu-item {
    padding: 8px 12px;
    color: #ffffff;
    cursor: pointer;
    user-select: none;
}
.custom-menu-item:hover {
    background-color: rgba(255, 255, 255, 0.1);
}

.material-symbols-outlined {
    font-family: "Material Symbols Outlined", sans-serif;
}
.custom-menu-item {
    display: flex;
    align-items: center;
    padding: 8px 12px;
    color: #ffffff;
    cursor: pointer;
    user-select: none;
}

.custom-menu-item .material-symbols-outlined {
    margin-top: 0.05px;
    margin-right: 5px;
    padding-left: 1px;
}

.custom-menu .extra-menu-wrapper {
    position: fixed;
}

.custom-menu .extra-menu {
    position: relative;
    left: 303px;
    bottom: 0.75em;
}

`;
    element = (
        <div class={this.css}>
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

    constructor() { }

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
