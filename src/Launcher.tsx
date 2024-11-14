class Launcher {
    state: Stateful<{
        active: boolean;
        apps?: App[];
        appsView?: HTMLDivElement;
        search?: HTMLInputElement;
    }> = $state({
        active: false,
    });

    private popupTransition = anura.settings.get("disable-animation")
        ? "opacity 0.15s"
        : "all 0.15s cubic-bezier(0.445, 0.05, 0.55, 0.95)";

    private gridTransition = anura.settings.get("disable-animation")
        ? "all 0s"
        : "all 0.225s cubic-bezier(0.25, 0.46, 0.45, 0.94)";

    css = css`
        position: absolute;
        background: color-mix(in srgb, var(--theme-dark-bg) 77.5%, transparent);
        bottom: 60px;
        left: 10px;
        overflow-y: hidden;
        visibility: hidden;
        z-index: -1;
        opacity: 0;
        transition: ${this.popupTransition};

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
            font-family: inherit;
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
            color: var(--theme-fg);
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
            background-color: var(--theme-bg);
            border-radius: 20px;
            border: 6px solid transparent;
            background-clip: content-box;
        }

        ::-webkit-scrollbar-thumb:hover {
            background-color: var(--theme-secondary-bg);
        }

        *::-webkit-input-placeholder {
            color: var(--theme-secondary-fg);
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
            color: var(--theme-fg);
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
        z-index: 9999;
        visibility: visible;

        .appsView {
            opacity: 1;
            grid-row-gap: 0px;
        }
    `;

    element = (<div>Not Initialized</div>);

    clickoffChecker: HTMLDivElement;
    updateClickoffChecker: (show: boolean) => void;

    handleSearch(event: Event) {
        const searchQuery = (
            event.target as HTMLInputElement
        ).value.toLowerCase();
        if (!this.state.appsView) return;
        const apps = this.state.appsView?.querySelectorAll(".app");

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
        this.state.active = !this.state.active;
        this.clearSearch();
    }

    setActive(active: boolean) {
        this.state.active = active;
    }

    hide() {
        this.state.active = false;
        this.clearSearch();
    }

    clearSearch() {
        if (this.state.search) {
            this.state.search.value = "";
        }
        if (!this.state.appsView) return;
        const apps = this.state.appsView?.querySelectorAll(".app");
        apps.forEach((app: HTMLElement) => {
            app.style.display = "";
        });
    }

    addShortcut(app: App) {
        if (app.hidden) return;

        this.state.apps = [...(this.state.apps || []), app];
    }

    constructor(
        clickoffChecker: HTMLDivElement,
        updateClickoffChecker: (show: boolean) => void,
    ) {
        clickoffChecker.addEventListener("click", () => {
            this.state.active = false;
        });

        this.clickoffChecker = clickoffChecker;
        this.updateClickoffChecker = updateClickoffChecker;

        useChange(use(this.state.active), updateClickoffChecker);
    }

    async init() {
        const Panel: Component<
            {
                width?: string | DLPointer<any>;
                height?: string | DLPointer<any>;
                margin?: string | DLPointer<any>;
                grow?: boolean;
                style?: any;
                class?: string | (string | DLPointer<any>)[];
                id?: string;
            },
            { children: HTMLElement[] }
        > = await anura.ui.get("Panel");

        this.element = (
            <Panel
                id="launcher"
                width={
                    anura.platform.type === "mobile" ||
                    anura.platform.type === "tablet"
                        ? "100%"
                        : "min(70%, 35em)"
                }
                height={use(this.state.active, (active) =>
                    active
                        ? anura.platform.type === "mobile" ||
                          anura.platform.type === "tablet"
                            ? "calc(100% - 75px)"
                            : "min(80%, 40em)"
                        : anura.platform.type == "mobile" ||
                            anura.platform.type == "tablet"
                          ? "100%"
                          : "min(30%, 20em)",
                )}
                class={[
                    this.css,
                    use(
                        this.state.active,
                        (active) => active && this.activeCss,
                    ),
                ]}
            >
                <div class="topSearchBar">
                    <img src="/icon.png"></img>
                    <input
                        placeholder="Search your tabs, files, apps, and more..."
                        style="outline: none; color: var(--theme-fg);"
                        bind:this={use(this.state.search)}
                        on:input={this.handleSearch.bind(this)}
                    />
                </div>

                <div
                    id="appsView"
                    class="appsView"
                    bind:this={use(this.state.appsView)}
                >
                    {use(this.state.apps, (apps) =>
                        (apps || []).map((app: App) => (
                            <LauncherShortcut
                                app={app}
                                onclick={() => {
                                    this.hide();
                                    app.open();
                                }}
                            />
                        )),
                    )}
                </div>
            </Panel>
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
    const app = this.app;

    const contextmenu = new anura.ContextMenu(true);
    const action = this.onclick;

    contextmenu.addItem(
        "Open",
        function () {
            action();
        },
        "new_window",
    );

    // MARK: MAKE IT UPDATE
    if (anura.settings.get("applist").includes(app.package)) {
        contextmenu.addItem(
            "Unpin from taskbar",
            function () {
                anura.settings.set(
                    "applist",
                    anura.settings
                        .get("applist")
                        .filter((item: string) => item !== app.package),
                );
                document.dispatchEvent(new Event("anura-force-taskbar-update"));
            },
            "keep_off",
        );
    } else {
        contextmenu.addItem(
            "Pin to taskbar",
            function () {
                anura.settings.set("applist", [
                    ...anura.settings.get("applist"),
                    app.package,
                ]);
                document.dispatchEvent(new Event("anura-force-taskbar-update"));
            },
            "keep",
        );
    }
    contextmenu.addItem(
        "Delete",
        async () => {
            if (
                anura.apps[app.package].source &&
                anura.apps[app.package].source.includes("/fs")
            ) {
                try {
                    const sh = new anura.fs.Shell();
                    const path = (app as ExternalApp).source.replace(
                        /^\/fs\//,
                        "",
                    );
                    await sh.rm(
                        path,
                        {
                            recursive: true,
                        },
                        function (err) {
                            if (err) throw err;
                        },
                    );
                    delete anura.apps[app.package];
                    this.root.remove();
                } catch (e) {
                    console.error(e);
                    anura.dialog.alert(
                        "Could not delete app. Please try again later: " + e,
                    );
                }
            } else {
                console.error("App not found");
                anura.dialog.alert(
                    "App not found. Either it's a system app or something has gone terribly wrong.",
                );
            }
        },
        "delete",
    );

    return (
        <div
            class="app"
            on:click={this.onclick}
            on:contextmenu={(e: PointerEvent) => {
                e.preventDefault();

                const rect = document.body.getBoundingClientRect();
                contextmenu.show(e.pageX + rect.x, e.pageY + rect.y);

                document.onclick = (e) => {
                    document.onclick = null;
                    contextmenu.hide();
                    e.preventDefault();
                };
            }}
        >
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
