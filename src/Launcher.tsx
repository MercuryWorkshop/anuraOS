class Launcher {
    private search: HTMLInputElement | null;

    private popupTransition = "all 0.15s cubic-bezier(0.445, 0.05, 0.55, 0.95)";

    private gridTransition = "all 0.225s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    css = css`
        position: absolute;
        width: min(70%, 35em);
        height: min(60%, 30em);
        background-color: rgba(22, 22, 22, 0.9);
        border: 1px solid rgba(0, 0, 0, 1);
        box-shadow: inset 0 0 0 1px #3e3e3e;

        border-radius: 1em;
        bottom: 60px;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        display: flex;
        flex-direction: column;
        display: block;
        transition: ${this.popupTransition};
        opacity: 0;
        z-index: -1;
        overflow-y: hidden;
        visibility: hidden;
        left: 10px;

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
        /* https://codepen.io/xtrp/pen/QWjREeo */
        ::-webkit-scrollbar {
            width: 20px;
        }

        ::-webkit-scrollbar-track {
            background-color: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background-color: #d6dee1;
            border-radius: 20px;
            border: 6px solid transparent;
            background-clip: content-box;
        }

        ::-webkit-scrollbar-thumb:hover {
            background-color: #a8bbbf;
        }

        .appsView {
            transition: ${this.gridTransition};
            transition-delay: 0.075s;
            padding: 1em;
            font-size: 12px;
            flex-grow: 1;
            display: grid;
            grid-template-columns: 1fr 1fr 1fr 1fr 1fr;
            grid-auto-rows: 8em;
            max-height: calc(5.9 * 8em);
            overflow-y: auto;
            opacity: 0;
            grid-row-gap: 30px;
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
    `;

    activeCss = css`
        display: block;
        opacity: 1;
        height: min(80%, 40em);
        z-index: 9999;
        transition: ${this.popupTransition};
        visibility: visible;

        .appsView {
            transition: ${this.gridTransition};
            transition-delay: 0.075s;
            opacity: 1;
            grid-row-gap: 0px;
        }
    `;

    clickoffCheckerCss = css`
        display: none;
    `;

    clickoffActiveCss = css`
        position: absolute;
        width: 100%;
        height: calc(100%);
        display: block;
    `;

    // self.active {
    //     position: absolute;
    //     width: 100%;
    //     /* TODO: make this not be a magic number later with css variables */
    //     height: calc(100% - 51px);
    //     z-index: 9998;
    //     opacity: 0;
    //     top: 0;
    //     left: 0;
    //     bottom: 49px;
    //     display: block;
    // }
    // `;

    element = (
        <div class={this.css}>
            <div class="topSearchBar">
                <img src="/assets/icons/googleg.png"></img>
                <input
                    placeholder="Search your tabs, files, apps, and more..."
                    style="outline: none; color: white"
                />
            </div>

            <div id="appsView" class="appsView"></div>
        </div>
    );

    clickoffChecker = (
        <div id="clickoffChecker" class={this.clickoffCheckerCss}></div>
    );

    constructor() {
        this.search = this.element.querySelector(
            ".topSearchBar input",
        ) as HTMLInputElement;
        this.search.addEventListener("input", this.handleSearch.bind(this));
    }

    handleSearch(event: Event) {
        const searchQuery = (
            event.target as HTMLInputElement
        ).value.toLowerCase();
        const appsView = this.element.querySelector("#appsView") as HTMLElement;
        const apps = appsView.querySelectorAll(".app");

        apps.forEach((app: HTMLElement) => {
            const appNameElement = app.querySelector(".app-shortcut-name");
            if (appNameElement) {
                const appName = appNameElement.textContent?.toLowerCase() || "";
                if (searchQuery === "") {
                    app.style.display = "";
                } else if (appName.includes(searchQuery)) {
                    app.style.display = "";
                } else {
                    app.style.display = "none";
                }
            }
        });
    }

    toggleVisible() {
        this.element.classList.toggle(this.activeCss);
        this.clickoffChecker.classList.toggle(this.clickoffActiveCss);
        this.clearSearch();
    }

    hide() {
        this.element.classList.remove(this.activeCss);
        this.clickoffChecker.classList.remove(this.clickoffActiveCss);
        this.clearSearch();
    }

    clearSearch() {
        if (this.search) {
            this.search.value = "";
        }
        const appsView = this.element.querySelector("#appsView") as HTMLElement;
        const apps = appsView.querySelectorAll(".app");
        apps.forEach((app: HTMLElement) => {
            app.style.display = "";
        });
    }

    addShortcut(app: App) {
        if (app.hidden) return;

        this.element.querySelector("#appsView")!.appendChild(
            <LauncherShortcut
                app={app}
                onclick={() => {
                    this.hide();
                    app.open();
                }}
            />,
        );
    }
}

const LauncherShortcut: Component<
    {
        app: App;
        onclick: () => void;
    },
    Record<string, never>
> = function () {
    return (
        <div class="app" on:click={this.onclick}>
            <input
                class="app-shortcut-image showDialog"
                style="width: 40px; height: 40px"
                type="image"
                src={this.app.icon}
            />
            <div class="app-shortcut-name">{this.app.name}</div>
        </div>
    );
};
