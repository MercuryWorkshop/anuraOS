class Taskbar {
    activeTray: HTMLElement;

    state: {
        apps: App[];
    } = stateful({
        apps: [],
    });

    element = (
        <footer>
            <div id="launcher-button-container">
                <div
                    id="launcher-button"
                    on:click={() => {
                        launcher.toggleVisible();
                    }}
                >
                    <img
                        src="/assets/icons/launcher.svg"
                        style="height:100%;width:100%"
                    ></img>
                </div>
            </div>
            <nav id="taskbar-bar">
                <ul
                    bind:activeTray={this}
                    for={React.use(this.state.apps)}
                    do={(app: App) => {
                        return (
                            <li>
                                <input
                                    type="image"
                                    src={app.icon}
                                    class="showDialog"
                                    on:click={(e: MouseEvent) => {
                                        if (app.windows.length > 0) {
                                            const newcontextmenu =
                                                new anura.ContextMenu();
                                            newcontextmenu.addItem(
                                                "New Window",
                                                () => {
                                                    app.open();
                                                },
                                            );

                                            for (const win of app.windows) {
                                                newcontextmenu.addItem(
                                                    win.wininfo.title,
                                                    () => {
                                                        win.unminimize();
                                                    },
                                                );
                                            }
                                            newcontextmenu.show(e.x, e.y - 100);
                                        } else {
                                            app.open();
                                        }
                                    }}
                                />
                                <div
                                    class="lightbar"
                                    style="position: relative; bottom: 1px; background-color:#FFF; width:50%; left:50%; transform:translateX(-50%)"
                                    if={app.windows.length > 0}
                                    bind:lightbar={this}
                                ></div>
                            </li>
                        );
                    }}
                >
                    <li style="height: 40px; width=40px">
                        <div
                            class="lightbar"
                            bind:lightbar={this}
                            style="position: relative; bottom: 1px; background-color:rgba(0,0,0,0); width:50%; left:50%; transform:translateX(-50%);"
                        ></div>
                    </li>
                </ul>
            </nav>
        </footer>
    );

    // shortcuts: { [key: string]: Shortcut } = {};
    constructor() {}
    addShortcut(app: App) {
        // const shortcut = new Shortcut(app);
        // this.shortcuts[app.package] = shortcut;
        // return shortcut;
    }
    killself() {
        this.element.remove();
    }
    updateTaskbar() {
        const pinned = anura.settings
            .get("applist")
            .map((id: string) => anura.apps[id]);
        const activewindows = Object.values(anura.apps).filter(
            (a: App) => a.windows.length > 0,
        );

        this.state.apps = [...new Set([...pinned, ...activewindows])];
    }
    // removeShortcuts() {
    //     for (const name in this.shortcuts) {
    //         this.shortcuts[name]!.element.remove();
    //         delete this.shortcuts[name];
    //     }
    // }
}
