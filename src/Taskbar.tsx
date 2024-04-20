class Taskbar {
    timeformat = new Intl.DateTimeFormat(navigator.language, {
        hour: "numeric",
        minute: "numeric",
        hour12: true,
    });

    dateformat = new Intl.DateTimeFormat(navigator.language, {
        month: "short",
        day: "numeric",
    });

    state: {
        pinnedApps: App[];
        activeApps: App[];
        showBar: boolean;
        rounded: boolean;
        time: string;
        date: string;
        bat_icon: string;
        net_icon: string;
    } = stateful({
        pinnedApps: [],
        activeApps: [],
        showBar: false,
        rounded: true,
        time: "",
        date: "",
        bat_icon: "battery_0_bar",
        net_icon: "signal_wifi_4_bar",
    });

    rounded = css`
        border-top-left-radius: 25px;
        border-top-right-radius: 25px;
        width: calc(100% - 2px);
        border-left: 1px solid rgba(0, 0, 0, 0.3);
        border-right: 1px solid rgba(0, 0, 0, 0.3);
    `;

    maximizedWins: WMWindow[] = [];
    dragged = null;
    insidedrag = false;

    element = (<div>Not Initialized</div>);

    shortcut(app: App) {
        if (!app) return;
        return ((this as any).tmp = (
            <li class="taskbar-button">
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
                            app.windows[0]!.unminimize();
                            app.windows[0]!.focus();
                        } else {
                            this.showcontext(app, e);
                        }
                    }}
                    on:contextmenu={(e: MouseEvent) => {
                        this.showcontext(app, e);
                    }}
                />
                {
                    ((this as any).lightbar = (
                        <div
                            class="lightbar"
                            style={
                                "position: relative; bottom: 0px; background-color:#FFF; width:30%; left:50%; transform:translateX(-50%)" +
                                (app.windows?.length == 0
                                    ? ";visibility:hidden"
                                    : "")
                            }
                        ></div>
                    ))
                }
            </li>
        ));
    }
    #contextMenu = new ContextMenuAPI(); // This is going to be before anura is initialized, so we can't use anura.ContextMenu
    showcontext(app: App, e: MouseEvent) {
        if (app.windows.length > 0) {
            this.#contextMenu.removeAllItems();
            this.#contextMenu.addItem("New Window", () => {
                const potentialFuture = app.open();
                console.log(potentialFuture);
                if (
                    typeof potentialFuture != "undefined" &&
                    //@ts-ignore - In App.tsx, open() returns a void, but in nearly every other case it returns a Promise<WMWindow> | undefined
                    // Typescript doesn't like this, so we have to ignore it.
                    typeof potentialFuture.then == "function"
                ) {
                    // @ts-ignore - Same as above
                    potentialFuture.then((win) => {
                        if (typeof win == "undefined") return;
                        this.updateRadius();
                    });
                }
            });

            let winEnumerator = 1;
            for (const win of app.windows) {
                const displayTitle =
                    win.state.title || "Window " + winEnumerator;
                this.#contextMenu.addItem(displayTitle, () => {
                    win.focus();
                    win.unminimize();
                });
                winEnumerator++;
            }
            const pinned = anura.settings.get("applist").includes(app.package);
            this.#contextMenu.addItem(pinned ? "Unpin" : "Pin", () => {
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

            const c = this.#contextMenu.show(e.x, 0);
            // HACK HACK DUMB HACK
            c.style.top = "";
            c.style.bottom = "69px";

            console.log(c);
        } else {
            const potentialFuture = app.open();
            console.log(potentialFuture);
            if (
                typeof potentialFuture != "undefined" &&
                //@ts-ignore - In App.tsx, open() returns a void, but in nearly every other case it returns a Promise<WMWindow> | undefined
                // Typescript doesn't like this, so we have to ignore it.
                typeof potentialFuture.then == "function"
            ) {
                // @ts-ignore - Same as above
                potentialFuture.then((win) => {
                    if (typeof win == "undefined") return;
                    this.updateRadius();
                });
            }
        }
    }

    // shortcuts: { [key: string]: Shortcut } = {};
    constructor() {
        setInterval(() => {
            const date = new Date();
            this.state.date = this.dateformat.format(date);
            this.state.time = this.timeformat.format(date).slice(0, -3);
        }, 1000);

        addEventListener("online", () => {
            this.state.net_icon = "signal_wifi_4_bar";
        });

        addEventListener("offline", () => {
            this.state.net_icon = "signal_wifi_off";
        });

        // Battery Status API is deprecated, so Microsoft refuses to create type definitions. :(

        // @ts-ignore
        if (navigator.getBattery) {
            // @ts-ignore
            navigator.getBattery().then((battery) => {
                // Gonna comment this out for now to see if you guys actually want this as a feature.
                // if (battery.dischargingTime == Infinity) {
                //     this.state.bat_icon = "";
                //     return;
                // }
                if (battery.charging) {
                    this.state.bat_icon = "battery_charging_full";
                    return;
                }
                // I have almost no clue if this will work but im praying.
                battery.onchargingchange = () => {
                    if (battery.charging) {
                        this.state.bat_icon = "battery_charging_full";
                        return;
                    } else {
                        const bat_bars = Math.round(battery.level * 7) - 1;
                        this.state.bat_icon = `battery_${bat_bars}_bar`;
                        return;
                    }
                };
                const bat_bars = Math.round(battery.level * 7) - 1;
                this.state.bat_icon = `battery_${bat_bars}_bar`;
            });
        }
    }
    async init() {
        this.element = (
            <footer
                style={{
                    backgroundColor: use(
                        anura.ui.theme.state.darkBackground,
                        (color) => color + "e6",
                    ),
                }}
                class={[
                    use(
                        this.state.rounded,
                        (rounded) => rounded && this.rounded,
                    ),
                ]}
            >
                <div id="launcher-button-container">
                    <div
                        id="launcher-button"
                        on:click={() => {
                            quickSettings.close();
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
                    <ul>
                        {use(this.state.pinnedApps, (apps: App[]) =>
                            apps.map(this.shortcut.bind(this)),
                        )}
                    </ul>

                    {$if(use(this.state.showBar), <div class="splitBar"></div>)}

                    <ul>
                        {use(this.state.activeApps, (apps: App[]) =>
                            apps.map(this.shortcut.bind(this)),
                        )}
                    </ul>
                </nav>
                <div id="taskbar-right">
                    {/* TODO: Calendar */}
                    <span
                        id="date-container"
                        on:click={() => {
                            launcher.hide();
                            quickSettings.close();
                            calendar.toggle();
                        }}
                    >
                        <span>{use(this.state.date)}</span>
                    </span>
                    <span
                        id="taskinfo-container"
                        on:click={() => {
                            launcher.hide();
                            calendar.close();
                            quickSettings.toggle();
                        }}
                    >
                        <div
                            class="flex flexcenter"
                            style={{
                                gap: "4px",
                            }}
                        >
                            <span>{use(this.state.time)}</span>
                            <span class="material-symbols-outlined">
                                {use(this.state.net_icon)}
                                {use(this.state.bat_icon)}
                            </span>
                        </div>
                    </span>
                </div>
            </footer>
        );
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

        this.state.showBar =
            this.state.pinnedApps.length > 0 &&
            this.state.activeApps.length > 0;

        console.log(this.state.activeApps);
    }

    updateRadius() {
        console.log(snappedWindows);
        if (this.maximizedWins.length > 0 || snappedWindows.length > 0) {
            this.state.rounded = false;
        } else {
            this.state.rounded = true;
        }
        console.log("max:", this.maximizedWins.length);
    }
    // removeShortcuts() {
    //     for (const name in this.shortcuts) {
    //         this.shortcuts[name]!.element.remove();
    //         delete this.shortcuts[name];
    //     }
    // }
}
