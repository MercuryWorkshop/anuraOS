class Taskbar {
    state: {
        pinnedApps: App[];
        activeApps: App[];
        time: string;
        bat_icon: string;
    } = stateful({
        pinnedApps: [],
        activeApps: [],
        time: "",
        bat_icon: "battery_0_bar",
    });

    dragged = null;
    insidedrag = false;

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
            <nav
                id="taskbar-bar"
                on:dragover={(e: DragEvent) => {
                    e.preventDefault();
                }}
                on:drop={(e: DragEvent) => {
                    this.insidedrag = true;
                    e.preventDefault();
                }}
            >
                <ul
                    for={React.use(this.state.pinnedApps)}
                    do={this.shortcut.bind(this)}
                ></ul>
                <div
                    class={styled.new`
                        self {
                            border: 2px solid white;
                            height: 70%;
                            border-radius: 1px;
                            margin: 1em;
                        }
                    `}
                ></div>
                <ul
                    for={React.use(this.state.activeApps)}
                    do={this.shortcut.bind(this)}
                ></ul>
            </nav>
            <div
                id="taskinfo-container"
                on:click={() => {
                    anura.apps["anura.settings"].open();
                }}
            >
                <div class="flex flexcenter">
                    <p>{React.use(this.state.time)}</p>

                    <span class="material-symbols-outlined">
                        {React.use(this.state.bat_icon)}
                    </span>

                    <span class="material-symbols-outlined">settings</span>
                </div>
            </div>
        </footer>
    );

    shortcut(app: App) {
        if (!app) return;
        return (
            <li class="taskbar-button" bind:tmp={this}>
                <input
                    type="image"
                    draggable="true"
                    src={app?.icon || ""}
                    on:dragend={() => {
                        if (!this.insidedrag) {
                            for (const i of app.windows) {
                                i.close();
                            }
                            anura.settings.set(
                                "applist",
                                anura.settings
                                    .get("applist")
                                    .filter((p: string) => p != app.package),
                            );
                            this.updateTaskbar();
                        }
                        this.dragged = null;
                        this.insidedrag = false;
                    }}
                    on:dragstart={() => {
                        // @ts-ignore
                        this.dragged = $el;
                    }}
                    class="showDialog"
                    on:click={(e: MouseEvent) => {
                        if (app.windows.length == 1) {
                            app.windows[0]!.focus();
                        } else {
                            this.showcontext(app, e);
                        }
                    }}
                    on:contextmenu={(e: MouseEvent) => {
                        this.showcontext(app, e);
                    }}
                />
                <div
                    class="lightbar"
                    style={
                        "position: relative; bottom: 1px; background-color:#FFF; width:50%; left:50%; transform:translateX(-50%)" +
                        (app.windows?.length == 0 ? ";visibility:hidden" : "")
                    }
                    bind:lightbar={this}
                ></div>
            </li>
        );
    }

    showcontext(app: App, e: MouseEvent) {
        if (app.windows.length > 0) {
            const newcontextmenu = new anura.ContextMenu();
            newcontextmenu.addItem("New Window", () => {
                app.open();
            });

            let winEnumerator = 0;
            for (const win of app.windows) {
                let displayTitle = win.wininfo.title;
                if (win.wininfo.title === "")
                    displayTitle = "Window " + winEnumerator;
                newcontextmenu.addItem(displayTitle, () => {
                    win.focus();
                    win.unminimize();
                });
                winEnumerator++;
            }
            const pinned = anura.settings.get("applist").includes(app.package);
            newcontextmenu.addItem(pinned ? "Unpin" : "Pin", () => {
                if (pinned) {
                    anura.settings.set(
                        "applist",
                        anura.settings
                            .get("applist")
                            .filter((p: string) => p != app.package),
                    );
                } else {
                    anura.settings.set("applist", [
                        ...anura.settings.get("applist"),
                        app.package,
                    ]);
                }
                this.updateTaskbar();
            });

            newcontextmenu.addItem("Uninstall", () => {
                alert("todo");
            });
            const c = newcontextmenu.show(e.x, 0);
            // HACK HACK DUMB HACK
            c.style.top = "";
            c.style.bottom = "69px";

            console.log(c);
        } else {
            app.open();
        }
    }

    // shortcuts: { [key: string]: Shortcut } = {};
    constructor() {
        setInterval(() => {
            const date = new Date();
            this.state.time = date
                .toLocaleTimeString(navigator.language, {
                    hour: "numeric",
                    minute: "numeric",
                    hour12: true,
                })
                .slice(0, -3);
        }, 1000);

        // Battery Status API is deprecated, so Microsoft refuses to create type definitions. :(

        // @ts-ignore
        if (navigator.getBattery) {
            // @ts-ignore
            navigator.getBattery().then((battery) => {
                const bat_bars = Math.round(battery.level * 7) - 1;
                this.state.bat_icon = `battery_${bat_bars}_bar`;
            });
        }
    }
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
        const activewindows: App[] = Object.values(anura.apps).filter(
            (a: App) => a.windows && a.windows.length > 0,
        ) as App[];

        this.state.pinnedApps = pinned;
        this.state.activeApps = activewindows.filter(
            (app: App) => !pinned.includes(app),
        );
        console.log(this.state.activeApps);
    }
    // removeShortcuts() {
    //     for (const name in this.shortcuts) {
    //         this.shortcuts[name]!.element.remove();
    //         delete this.shortcuts[name];
    //     }
    // }
}
