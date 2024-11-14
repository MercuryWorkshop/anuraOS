// BRAINROT WARNING: this file sucks to work on, it's written terribly, should be refactored, most likely wont be

class QuickSettings {
    dateformat = new Intl.DateTimeFormat(navigator.language, {
        weekday: "short",
        month: "short",
        day: "numeric",
    });

    state: Stateful<{
        showQuickSettings?: boolean;
        pinnedSettings: Array<{
            registry: string;
            icon?: string;
            type: string;
            name: string;
            description: string;
            value: any;
            onChange?: string;
        }>;
        date: string;
    }> = $state({
        showQuickSettings: false,
        pinnedSettings: [],
        date: new Date().toLocaleString(),
    });

    transition = css`
        transition: opacity 0.08s cubic-bezier(0.445, 0.05, 0.55, 0.95);
    `;

    show = css`
        opacity: 1;
        z-index: 9998;
    `;

    hide = css`
        opacity: 0;
        z-index: -1;
    `;

    quickSettingsCss = css`
        bottom: 60px;
        right: 10px;

        .quickSettingsContent {
            display: flex;
            flex-direction: column;
            gap: 1em;
            padding: 1em;
            height: 100%;
            overflow-y: scroll;

            &::-webkit-scrollbar {
                display: none;
            }

            .topButtons {
                display: flex;
                flex-direction: row;
                gap: 1em;

                .symbolButton {
                    border-radius: 28px;
                    background-color: color-mix(
                        in srgb,
                        var(--theme-secondary-bg) 55%,
                        transparent
                    );
                    box-shadow: none;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                    width: 28px;
                    height: 28px;
                    min-height: 0;
                    min-width: 0;
                    padding: 0;

                    span {
                        font-size: 18px;
                    }
                }
            }

            .quickSettingsPinned {
                display: grid;
                grid-template-columns: 1fr 1fr 1fr;
                grid-template-rows: 1fr 1fr;

                .pinnedSetting {
                    display: flex;
                    flex-direction: column;
                    align-items: center;
                    gap: 1em;
                    padding: 0.5em;

                    .settingsIcon {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        width: 34px;
                        height: 34px;
                        min-height: 0;
                        min-width: 0;
                        border-radius: 50%;
                        background-color: color-mix(
                            in srgb,
                            var(--theme-secondary-bg) 55%,
                            transparent
                        );
                        transition: background-color 0.15s;
                        box-shadow: none;

                        span {
                            color: var(--theme-fg);
                            transition: color 0.15s;
                            font-size: 24px;
                        }

                        &.enabled {
                            background-color: color-mix(
                                in srgb,
                                var(--theme-accent) 65%,
                                var(--theme-fg)
                            );
                            transition: background-color 0.15s;

                            span {
                                color: var(--theme-bg);
                                transition: color 0.15s;
                            }
                        }
                    }

                    .settingTitle {
                        display: flex;
                        justify-content: center;
                        align-items: center;
                        font-size: 12px;
                        color: var(--theme-fg);
                        text-align: center;
                    }
                }
            }
            .sliderContainer {
                display: flex;
                flex-direction: row;
                gap: 1em;
                align-items: center;
                flex-grow: 1;
                /* Currently empty */
            }
            .dateContainer {
                height: 1em;
                display: flex;
                flex-direction: row;

                span {
                    color: var(--theme-fg);
                    font-size: 12px;
                }
            }
        }
    `;

    quickSettingsElement: HTMLElement = (<div>Not Initialized</div>);

    notificationCenterCss = css`
        max-height: calc(60% - 80px);
        min-height: 20px;
        bottom: calc(70px + 46%);
        right: 10px;
        overflow: hidden;

        .notificationContainer {
            display: flex;
            gap: 2px;
            padding: 6px;
            flex-direction: column-reverse;
            overflow-y: scroll;

            &::-webkit-scrollbar {
                display: none;
            }

            .notification {
                border-radius: 0;

                /*
                    Flipped because of flex-direction: column-reverse
                */

                &:first-child {
                    border-bottom-left-radius: 1em;
                    border-bottom-right-radius: 1em;
                }

                &:last-child {
                    border-top-left-radius: 1em;
                    border-top-right-radius: 1em;
                }
            }
        }

        .clearButtonContainer {
            display: flex;
            justify-content: end;

            .clearButton {
                margin: 6px;
                margin-top: 0;
                color: color-mix(
                    in srgb,
                    var(--theme-accent) 65%,
                    var(--theme-fg)
                ) !important;
            }
        }
    `;

    notificationCenterElement = (<div>Not Initialized</div>);

    clickoffChecker: HTMLDivElement;
    updateClickoffChecker: (show: boolean) => void;

    open() {
        // reason for this is otherwise dreamland doesn't run the use() dunno why
        const pinnedSettings = this.state.pinnedSettings;
        for (let i = 0; i < pinnedSettings.length; i++) {
            pinnedSettings[i]!.value = anura.settings.get(
                pinnedSettings[i]!.registry,
            );
        }

        this.state.pinnedSettings = pinnedSettings;
        this.state.showQuickSettings = true;
    }

    close() {
        this.state.showQuickSettings = false;
    }

    toggle() {
        if (this.state.showQuickSettings) {
            this.close();
        } else {
            this.open();
        }
    }

    constructor(
        clickoffChecker: HTMLDivElement,
        updateClickoffChecker: (show: boolean) => void,
    ) {
        clickoffChecker.addEventListener("click", () => {
            this.state.showQuickSettings = false;
        });

        setInterval(() => {
            this.state.date = this.dateformat.format(Date.now());
        }, 1000);

        this.clickoffChecker = clickoffChecker;
        this.updateClickoffChecker = updateClickoffChecker;
    }

    async init() {
        const Panel: Component<
            {
                width?: string;
                height?: string;
                margin?: string;
                grow?: boolean;
                style?: any;
                class?: string | (string | DLPointer<any>)[];
                id?: string;
            },
            { children: HTMLElement[] }
        > = await anura.ui.get("Panel");

        this.quickSettingsElement = (
            <Panel
                class={[
                    this.transition,
                    use(this.state.showQuickSettings, (open) =>
                        open ? this.show : this.hide,
                    ),
                    this.quickSettingsCss,
                ]}
                width="360px"
                height="46%"
                grow
                id="quickSettings"
            >
                <div class={["quickSettingsContent"]}>
                    <div class={["topButtons"]}>
                        <button
                            class={["matter-button-contained", "symbolButton"]}
                            title="Exit anuraOS"
                            on:click={() => {
                                window.location.replace(
                                    anura.settings.get("exitUrl") ||
                                        "https://google.com/",
                                );
                            }}
                        >
                            <span class="material-symbols-outlined">
                                power_settings_new
                            </span>
                        </button>
                        <button
                            class={["matter-button-contained", "symbolButton"]}
                            on:click={() => {
                                anura.apps["anura.settings"].open();
                                this.close();
                            }}
                        >
                            <span class={["material-symbols-outlined"]}>
                                settings
                            </span>
                        </button>
                        <button
                            class={["matter-button-contained", "symbolButton"]}
                            on:click={() => {
                                try {
                                    if (anura.platform.state.fullscreen) {
                                        document.exitFullscreen();
                                    } else {
                                        document.documentElement.requestFullscreen();
                                    }
                                } catch {
                                    // Prevent throwing here
                                }
                            }}
                        >
                            <span class={["material-symbols-outlined"]}>
                                {use(
                                    anura.platform.state.fullscreen,
                                    (fullscreen) =>
                                        fullscreen
                                            ? "fullscreen_exit"
                                            : "fullscreen",
                                )}
                            </span>
                        </button>
                    </div>
                    <div class={["quickSettingsPinned"]}>
                        {use(this.state.pinnedSettings, (pinnedSettings) => {
                            const settingsElements = [];
                            for (let i = 0; i < pinnedSettings.length; i++) {
                                settingsElements.push(
                                    <div
                                        class="pinnedSetting"
                                        title={
                                            this.state.pinnedSettings[i]!
                                                .description
                                        }
                                        on:click={() => {
                                            anura.settings.set(
                                                this.state.pinnedSettings[i]!
                                                    .registry,
                                                !anura.settings.get(
                                                    this.state.pinnedSettings[
                                                        i
                                                    ]!.registry,
                                                ),
                                            );
                                            this.state.pinnedSettings[
                                                i
                                            ]!.value = anura.settings.get(
                                                this.state.pinnedSettings[i]!
                                                    .registry,
                                            );
                                            this.state.pinnedSettings =
                                                pinnedSettings;
                                            if (
                                                this.state.pinnedSettings[i]!
                                                    .onChange
                                            ) {
                                                new Function(
                                                    "value",
                                                    this.state.pinnedSettings[
                                                        i
                                                    ]!.onChange!,
                                                )(
                                                    this.state.pinnedSettings[
                                                        i
                                                    ]!.value,
                                                );
                                            }
                                        }}
                                    >
                                        <button
                                            class={[
                                                "matter-button-contained",
                                                "settingsIcon",
                                                use(
                                                    this.state.pinnedSettings[
                                                        i
                                                    ]!.value,
                                                    (value) => {
                                                        if (value)
                                                            return "enabled";
                                                        else return "disabled";
                                                    },
                                                ),
                                            ]}
                                        >
                                            <span class="material-symbols-outlined">
                                                {this.state.pinnedSettings[i]!
                                                    .icon || "settings"}
                                            </span>
                                        </button>
                                        <div class="settingTitle">
                                            <span>
                                                {
                                                    this.state.pinnedSettings[
                                                        i
                                                    ]!.name
                                                }
                                            </span>
                                        </div>
                                    </div>,
                                );
                            }
                            return settingsElements;
                        })}
                    </div>
                    <div class={["sliderContainer"]}></div>
                    <div class={["dateContainer"]}>
                        <span>{use(this.state.date)}</span>
                    </div>
                </div>
            </Panel>
        );

        this.notificationCenterElement = (
            <Panel
                class={[
                    this.transition,
                    use(this.state.showQuickSettings, (open) =>
                        open ? this.show : this.hide,
                    ),
                    this.notificationCenterCss,
                ]}
                width="360px"
                // height="calc(60% - 80px);"
                id="notificationCenter"
            >
                <div class={["notificationContainer"]}>
                    {use(
                        anura.notifications.state.notifications,
                        (notifications) =>
                            notifications.map((notif) => {
                                const notification =
                                    new QuickSettingsNotification(notif);
                                return notification.element;
                            }),
                    )}
                </div>
                <div class={["clearButtonContainer"]}>
                    <button
                        class={["matter-button-text", "clearButton"]}
                        on:click={() => {
                            anura.notifications.state.notifications.forEach(
                                (n) => {
                                    n.close();
                                },
                            );
                            anura.notifications.state.notifications = [];
                        }}
                    >
                        Clear all
                    </button>
                </div>
            </Panel>
        );

        (this.state.pinnedSettings = anura.settings.get("pinnedSettings") || [
            {
                registry: "disable-animation",
                type: "boolean",
                name: "Accessibility",
                icon: "accessibility",
                description: "Reduced motion",
                value: false,
            },
            {
                registry: "blur-disable",
                type: "boolean",
                name: "Performance Mode",
                icon: "speed",
                description: "Remove background blur",
                value: false,
                onChange: `
                    if (value === true) {
                        document.body.classList.add("blur-disable");
                    } else {
                        document.body.classList.remove("blur-disable");
                    }`,
            },
            {
                registry: "launcher-keybind",
                type: "boolean",
                name: "Launcher Keybind",
                icon: "keyboard_command_key",
                description: "Enable the launcher keybind",
                value: true,
            },
        ]),
            useChange(
                use(
                    anura.notifications.state.notifications,
                    (notifications) => notifications.length > 0,
                ),
                (show) => {
                    this.notificationCenterElement.style.display = show
                        ? "flex"
                        : "none";
                },
            );
        // useChange(use(this.state.pinnedSettings), (pinnedSettings) => {
        //     anura.settings.set("pinnedSettings", pinnedSettings);
        //     pinnedSettings.forEach((setting) => {
        //         anura.settings.set(setting.registry, setting.value);
        //     });
        // });

        useChange(use(this.state.showQuickSettings), (show: boolean) => {
            this.updateClickoffChecker(show);
            anura.notifications.setRender(!show);
        });
    }
}

class QuickSettingsNotification {
    state: Stateful<{
        title: string;
        description: string;
        timeout: number | "never" | undefined;
        closeIndicator?: boolean | undefined;
        buttons: Array<{
            text: string;
            style?: "contained" | "outlined" | "text";
            callback: (notif: AnuraNotification) => void;
            close?: boolean;
        }>;
    }> = $state({
        title: "",
        description: "",
        timeout: 2000,
        closeIndicator: false,
        buttons: [],
    });
    css = css`
        background-color: color-mix(
            in srgb,
            var(--theme-secondary-bg) 40%,
            transparent
        );
        border-radius: 1em;
        color: var(--theme-fg);
        cursor: pointer;
        transition: all 0.15s cubic-bezier(0.445, 0.05, 0.55, 0.95);
        opacity: 1;

        &:hover .nbody .ntitle-container .close-indicator {
            opacity: 1;
        }

        .nbody {
            display: flex;
            flex-direction: column;
            padding: 1em;
            gap: 0.5em;

            .ntitle-container {
                display: flex;
                flex-direction: row;

                .ntitle {
                    color: var(--theme-fg);
                    font-size: 14px;
                    font-weight: 700;
                    flex-grow: 1;
                }

                .close-indicator {
                    width: 16px;
                    height: 16px;
                    opacity: 0;

                    span {
                        font-size: 16px;
                    }
                }
            }

            .ndesc {
                font-size: 12px;
                color: var(--theme-secondary-fg);
            }

            .nbutton-container {
                display: flex;
                gap: 6px;

                .nbutton {
                    flex-grow: 1;
                }
            }
        }
    `;

    originalNotification: AnuraNotification;

    constructor(notif: AnuraNotification) {
        this.state.title = notif.title || "Anura Notification";
        this.state.description = notif.description || "Missing Description";
        this.state.timeout = notif.timeout || 2000;
        this.state.closeIndicator = notif.closeIndicator || false;
        this.state.buttons = notif.buttons || [];
        this.originalNotification = notif;
    }

    element = (
        <div class={[this.css, "notification"]}>
            <div
                class="nbody"
                on:click={(e: PointerEvent) => {
                    if (
                        e.target instanceof HTMLElement &&
                        e.target.tagName.toLowerCase() === "button"
                    ) {
                        return;
                    }
                    this.originalNotification.callback(
                        this.originalNotification,
                    );
                    this.close();
                }}
            >
                <div class="ntitle-container">
                    <div class="ntitle">{use(this.state.title)}</div>
                    <div
                        class="close-indicator"
                        on:click={(e: PointerEvent) => {
                            e.stopPropagation();
                            this.close();
                        }}
                    >
                        <span class="material-symbols-outlined">close</span>
                    </div>
                </div>
                <div class="ndesc">{use(this.state.description)}</div>
                {$if(
                    use(this.state.buttons, (buttons) => buttons.length > 0),
                    <div class={["nbutton-container"]}>
                        {use(this.state.buttons, (buttons) =>
                            buttons.map((button) => (
                                <button
                                    class={[
                                        button.style === "contained"
                                            ? "matter-button-contained"
                                            : button.style === "outlined"
                                              ? "matter-button-outlined"
                                              : "matter-button-text",
                                        "nbutton",
                                    ]}
                                    on:click={() => {
                                        button.callback(
                                            this.originalNotification,
                                        );
                                        if (
                                            typeof button.close ===
                                                "undefined" ||
                                            button.close
                                        )
                                            this.close();
                                    }}
                                >
                                    {button.text}
                                </button>
                            )),
                        )}
                    </div>,
                )}
            </div>
        </div>
    );

    close() {
        this.element.remove();
        anura.notifications.remove(this.originalNotification);
    }
}
