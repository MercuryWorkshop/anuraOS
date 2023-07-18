class Shortcut {
    element: HTMLElement;

    lightbar: HTMLElement;
    constructor(app: App) {
        this.element = (
            <li>
                <input
                    type="image"
                    src={app.icon}
                    class="showDialog"
                    on:click={(e: MouseEvent) => {
                        if (app.windows.length > 0) {
                            const newcontextmenu = new anura.ContextMenu();
                            newcontextmenu.addItem("New Window", () => {
                                app.open();
                            });

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
                    bind:lightbar={this}
                    style="position: relative; bottom: 1px; background-color:#FFF; width:50%; left:50%; transform:translateX(-50%); display:none"
                ></div>
                <div
                    class="hoverMenu custom-menu"
                    bind:windowList={this}
                    style=""
                ></div>
            </li>
        );
    }
}

class Taskbar {
    activeTray: HTMLElement;

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
                <ul bind:activeTray={this}>
                    <li style="height: 40px; width=40px"></li>
                </ul>
            </nav>
        </footer>
    );

    shortcuts: { [key: string]: Shortcut } = {};
    constructor() {}
    addShortcut(app: App) {
        const shortcut = new Shortcut(app);
        this.shortcuts[app.package] = shortcut;
        return shortcut;
    }
    killself() {
        this.element.remove();
    }
    updateTaskbar() {}
    removeShortcuts() {
        for (const name in this.shortcuts) {
            this.shortcuts[name]!.element.remove();
            delete this.shortcuts[name];
        }
    }
}
