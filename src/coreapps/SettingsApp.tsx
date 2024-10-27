const settingsCSS = css`
    color: var(--theme-fg);

    .header {
        margin-left: 20px;
        font-family:
            "Roboto",
            RobotoDraft,
            "Droid Sans",
            Arial,
            Helvetica,
            -apple-system,
            BlinkMacSystemFont,
            system-ui,
            sans-serif;
    }
    .container {
        display: flex;
        height: calc(100% - 97px);
    }
    .settings-category {
        margin-left: 20px;
        margin-right: 10px;
        width: 100%;
    }

    *::-webkit-scrollbar {
        width: 8px;
    }

    *::-webkit-scrollbar-thumb {
        background-color: var(--theme-secondary-fg);
        border-radius: 8px;
    }

    *::-webkit-scrollbar-button {
        display: none;
    }

    *::-webkit-input-placeholder {
        color: var(--theme-secondary-fg);
    }

    .settings-body {
        display: flex;
        width: 100%;
        padding-right: 20px;
        flex-direction: column;
        overflow-x: hidden;
        overflow-y: auto;
    }
    .sidebar {
        margin-left: 20px;
        margin-top: 15px;
    }
    .sidebar-settings-item {
        height: 40px;
        display: flex;
        align-items: center;
        margin: 5px;
        width: 150px;
        cursor: pointer;
        border-radius: 5px;
        transition: 250ms ease-in-out;
    }
    .sidebar-settings-item-name {
        display: flex;
        align-items: center;
        color: var(--theme-secondary-fg);
    }
    .sidebar-settings-item-name > a:hover {
        color: var(--theme-fg);
    }
    .settings-category-name {
        color: var(--theme-secondary-fg);
        margin-bottom: 15px;
    }

    .settings-group {
        background-color: var(--theme-dark-bg);
        padding: 10px;
        border-radius: 10px;
        width: calc(100% - 40px);
        margin-right: 10px;
    }

    .settings-item {
        margin-bottom: 10px;
        height: 40px;
        display: flex;
        justify-content: space-between;
        align-items: center;
        width: calc(100% - 20px);
    }

    .settings-group .settings-item:not(:last-of-type) {
        border-bottom: 1px solid var(--theme-border);
    }

    .settings-item-name,
    .matter-switch {
        margin-left: 10px;
        font-size: 1rem;
    }

    .settings-button {
        background-color: var(--theme-secondary-bg);
        border: none;
        border-radius: 5px;
        padding: 5px;
        color: var(--theme-fg);
        cursor: pointer;
        margin-right: 10px;
    }
    .settings-item-text-input {
        background-color: var(--theme-bg);
        margin-right: 10px;
        border: none;
        border-radius: 5px;
        padding: 5px;
        color: var(--theme-fg);
    }
    .settings-item-text-input:focus {
        outline: none;
    }
    .sidebar-settings-item-name > a {
        color: var(--theme-secondary-fg);
        margin-left: 20px;
        text-decoration: none;
        font-family:
            "Roboto",
            RobotoDraft,
            "Droid Sans",
            Arial,
            Helvetica,
            -apple-system,
            BlinkMacSystemFont,
            system-ui,
            sans-serif;
    }

    .disk-info {
        display: flex;
        align-items: center;
        flex-direction: row;
    }
    .disk-size-bytes {
        height: 15px;
        margin-left: 10px;
    }
    .settings-button-group {
        display: flex;
    }
    .grouped-btn {
        width: 100%;
    }

    .matter-switch {
        width: 100%;
    }

    .matter-button-contained {
        background-color: var(--theme-accent);
        color: var(--theme-fg);
    }
`;

const SettingSwitch: Component<{
    title: string;
    setting: string;
    callback?: any;
    on?: boolean;
}> = function () {
    this.mount = () => {
        this.on = anura.settings.get(this.setting);
    };
    return (
        <div class="settings-item">
            <label class="matter-switch">
                <input
                    id={this.setting}
                    type="checkbox"
                    role="switch"
                    on:click={() => {
                        anura.settings.set(this.setting, this.on);
                        if (this.callback) this.callback();
                    }}
                    bind:checked={use(this.on)}
                />
                <span>{use(this.title)}</span>
            </label>
        </div>
    );
};

const SettingText: Component<{
    title: string;
    setting: string;
    callback?: any;
    value?: string;
    type?: string;
}> = function () {
    return (
        <div class="settings-item">
            <span class="settings-item-name">{use(this.title)}</span>
            <input
                id={this.setting}
                class="settings-item-text-input"
                on:change={(event: any) => {
                    switch (this.type) {
                        case "number":
                            anura.settings.set(
                                this.setting,
                                parseInt(event.target.value),
                            );
                            break;
                        case "string":
                            anura.settings.set(
                                this.setting,
                                event.target.value,
                            );
                            break;
                        default:
                            anura.settings.set(
                                this.setting,
                                event.target.value,
                            );
                            break;
                    }
                    if (this.callback) this.callback();
                }}
                placeholder={anura.settings.get(this.setting)}
                type="text"
            />
        </div>
    );
};

class SettingsApp extends App {
    name = "Settings";
    package = "anura.settings";
    icon = "/assets/icons/settings.png";
    win: WMWindow;

    constructor() {
        super();
    }

    state = $state({
        show_x86_install: anura.settings.get("x86-disabled"),
        x86_installing: false,
        resizing: false,
        settingsBody: undefined as unknown as HTMLDivElement,
    });

    page = async () => (
        <div
            style="height:100%;width:100%;position:absolute"
            class={`background ${settingsCSS}`}
        >
            <div class="header">
                <h2>Anura Settings</h2>
            </div>

            <div css={this.state} class="container">
                <div class="sidebar">
                    <div
                        class="sidebar-settings-item"
                        on:click={() => {
                            this.state.settingsBody.scrollTo({
                                top: 0,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <span class="sidebar-settings-item-name">
                            <span class="material-symbols-outlined">build</span>
                            <a>General</a>
                        </span>
                    </div>
                    <div
                        class="sidebar-settings-item"
                        on:click={() => {
                            this.state.settingsBody.scrollTo({
                                top: 100000,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <span class="sidebar-settings-item-name">
                            <span class="material-symbols-outlined">
                                memory
                            </span>
                            <a>x86</a>
                        </span>
                    </div>
                    <div
                        class="sidebar-settings-item"
                        on:click={() => {
                            this.state.settingsBody.scrollTo({
                                top: 100000,
                                behavior: "smooth",
                            });
                        }}
                    >
                        <span class="sidebar-settings-item-name">
                            <span class="material-symbols-outlined">
                                device_reset
                            </span>
                            <a>Reset</a>
                        </span>
                    </div>
                </div>
                <div
                    bind:this={use(this.state.settingsBody)}
                    class="settings-body"
                >
                    <div id="general" class="general settings-category">
                        <h3 class="settings-category-name">General</h3>
                        <div class="settings-group">
                            <SettingSwitch
                                title="Allow offline use"
                                setting="use-sw-cache"
                                callback={() => {
                                    anura.settings.set("milestone", "INVALID");
                                    window.location.reload();
                                }}
                            />
                            <SettingSwitch
                                title="24-hour time"
                                setting="sir-yes-sir"
                            />
                            <SettingSwitch
                                title="Borderless AboutBrowser"
                                setting="borderless-aboutbrowser"
                            />
                            <SettingSwitch
                                title="Performance mode"
                                setting="blur-disable"
                            />
                            <SettingSwitch
                                title="Reduce motion"
                                setting="disable-animation"
                            />
                            <SettingSwitch
                                title="Window Edge Clamping"
                                setting="clampWindows"
                            />
                            <SettingSwitch
                                title="Transparent Anura Shell Background"
                                setting="transparent-ashell"
                            />
                            <SettingSwitch
                                title="Enable Launcher Keybind"
                                setting="launcher-keybind"
                            />
                            <SettingText
                                title="Custom Wisp URL"
                                setting="wisp-url"
                            />
                            <SettingText
                                title="Custom Power Off URL"
                                setting="exitUrl"
                            />
                        </div>
                    </div>
                    <div id="v86" class="v86 settings-category">
                        <h3 class="settings-category-name">Anura x86</h3>
                        <div class="settings-group">
                            {this.state.show_x86_install ? (
                                <div>
                                    <button
                                        on:click={async () => {
                                            this.state.x86_installing = true;
                                            anura.settings.set(
                                                "x86-image",
                                                "alpine",
                                            );
                                            await installx86();
                                            anura.settings.set(
                                                "x86-disabled",
                                                false,
                                            );
                                            anura.notifications.add({
                                                title: "x86 Subsystem Installed",
                                                description:
                                                    "x86 OS has sucessfully installed. Reload the page to use it!",
                                                timeout: 5000,
                                            });

                                            this.state.x86_installing = false;
                                            this.state.show_x86_install = true;

                                            if (
                                                document.getElementById(
                                                    "tracker",
                                                )
                                            ) {
                                                document.getElementById(
                                                    "tracker",
                                                )!.innerText = "Installed!";
                                            }
                                        }}
                                        class="matter-button-contained"
                                    >
                                        Install x86 Subsystem
                                    </button>
                                    <div id="tracker"></div>
                                </div>
                            ) : (
                                <div className="x86-container">
                                    <div class="settings-item">
                                        <div class="disk-info">
                                            <span class="settings-item-name">
                                                Disk Size (MB)
                                            </span>
                                            <input
                                                class="settings-item-text-input disk-size-bytes"
                                                id="disk-size-bytes"
                                                value={
                                                    Math.ceil(
                                                        anura.x86hdd.size /
                                                            1000000,
                                                    ) || 0
                                                }
                                                type="text"
                                            />
                                        </div>
                                        <button
                                            on:click={async () => {
                                                anura.x86?.emulator.stop();
                                                clearInterval(
                                                    anura.x86?.saveinterval,
                                                );

                                                this.state.resizing = true;
                                                if (
                                                    document.getElementById(
                                                        "resize-disk-btn",
                                                    )
                                                ) {
                                                    document.getElementById(
                                                        "resize-disk-btn",
                                                    )!.innerText =
                                                        "Resizing...";
                                                }
                                                if (
                                                    document.getElementById(
                                                        "disk-size-bytes",
                                                    )
                                                ) {
                                                    await anura.x86hdd.resize(
                                                        parseInt(
                                                            (
                                                                document.getElementById(
                                                                    "disk-size-bytes",
                                                                ) as HTMLInputElement
                                                            ).value,
                                                        ) * 1000000,
                                                    );
                                                    const emulator = new V86({
                                                        wasm_path:
                                                            "/lib/v86.wasm",
                                                        memory_size:
                                                            512 * 1024 * 1024,
                                                        vga_memory_size:
                                                            8 * 1024 * 1024,
                                                        screen_container:
                                                            anura.x86!
                                                                .screen_container,

                                                        initrd: {
                                                            url: "/x86images/resizefs.img",
                                                        },

                                                        bzimage: {
                                                            url: "/x86images/bzResize",
                                                            async: false,
                                                        },
                                                        hda: {
                                                            buffer: anura.x86hdd,
                                                            async: true,
                                                        },

                                                        cmdline:
                                                            "random.trust_cpu=on 8250.nr_uarts=10 spectre_v2=off pti=off",

                                                        bios: {
                                                            url: "/bios/seabios.bin",
                                                        },
                                                        vga_bios: {
                                                            url: "/bios/vgabios.bin",
                                                        },
                                                        autostart: true,
                                                        uart1: true,
                                                        uart2: true,
                                                    });
                                                    let s0data = "";
                                                    emulator.add_listener(
                                                        "serial0-output-byte",
                                                        async (
                                                            byte: number,
                                                        ) => {
                                                            const char =
                                                                String.fromCharCode(
                                                                    byte,
                                                                );
                                                            if (char === "\r") {
                                                                anura.logger.debug(
                                                                    s0data,
                                                                );

                                                                if (
                                                                    s0data.includes(
                                                                        "Finished Disk",
                                                                    )
                                                                ) {
                                                                    await anura.x86hdd.save(
                                                                        emulator,
                                                                    );
                                                                    this.state.resizing =
                                                                        false;
                                                                    if (
                                                                        document.getElementById(
                                                                            "resize-disk-btn",
                                                                        )
                                                                    ) {
                                                                        document.getElementById(
                                                                            "resize-disk-btn",
                                                                        )!.innerText =
                                                                            "Resize Disk";
                                                                    }
                                                                    (await anura.dialog.confirm(
                                                                        "Resized disk! Would you like to reload the page?",
                                                                    ))
                                                                        ? window.location.reload()
                                                                        : null;
                                                                }

                                                                s0data = "";
                                                                return;
                                                            }
                                                            s0data += char;
                                                        },
                                                    );
                                                }
                                            }}
                                            class="settings-button"
                                            id="resize-disk-btn"
                                        >
                                            Resize Disk
                                        </button>
                                    </div>
                                    <SettingText
                                        title="Memory Size (MB)"
                                        setting="x86-memory"
                                        type="number"
                                    />
                                    <div class="settings-item">
                                        <span>
                                            <span style="margin-left: 10px; margin-right: 10px;">
                                                Create launcher shortcut
                                            </span>
                                            <input
                                                type="text"
                                                name="xappstub-name"
                                                id="xappstub-name"
                                                class="settings-item-text-input"
                                                placeholder="Enter display name"
                                            />
                                            <input
                                                type="text"
                                                name="xappstub-name"
                                                id="xappstub-cmd"
                                                class="settings-item-text-input"
                                                placeholder="Enter command"
                                            />
                                        </span>
                                        <button
                                            class="settings-button"
                                            on:click={async () => {
                                                const name = (
                                                    document.getElementById(
                                                        "xappstub-name",
                                                    ) as HTMLInputElement
                                                ).value;
                                                const cmd = (
                                                    document.getElementById(
                                                        "xappstub-cmd",
                                                    ) as HTMLInputElement
                                                ).value;
                                                if (name && cmd) {
                                                    const stub = new XAppStub(
                                                        name,
                                                        `anura.user.${cmd}`,
                                                        "",
                                                        cmd,
                                                    );
                                                    await anura.registerApp(
                                                        stub,
                                                    );
                                                    anura.settings.set(
                                                        "user-xapps",
                                                        [
                                                            ...anura.settings.get(
                                                                "user-xapps",
                                                            ),
                                                            {
                                                                name: name,
                                                                cmd: cmd,
                                                                id: stub.package,
                                                            },
                                                        ],
                                                    );
                                                    anura.notifications.add({
                                                        title: "Shortcut Created",
                                                        description:
                                                            "You can now launch your app from the launcher!",
                                                        timeout: 5000,
                                                    });
                                                } else {
                                                    anura.dialog.alert(
                                                        "Please fill out both fields!",
                                                    );
                                                }
                                            }}
                                        >
                                            Register
                                        </button>
                                    </div>
                                    <div class="settings-button-group">
                                        <button
                                            on:click={() => {
                                                this.state.show_x86_install =
                                                    false;
                                                anura.settings.set(
                                                    "x86-disabled",
                                                    true,
                                                );
                                                setTimeout(() => {
                                                    anura.x86hdd.delete();
                                                }, 200);
                                            }}
                                            class="settings-button grouped-btn"
                                        >
                                            Disable x86 Subsystem
                                        </button>
                                        <button
                                            on:click={async () => {
                                                if (
                                                    await anura.dialog.confirm(
                                                        "Custom RootFSes are in beta and may not work properly. Continue?",
                                                    )
                                                ) {
                                                    const inp =
                                                        document.createElement(
                                                            "input",
                                                        );
                                                    inp.type = "file";
                                                    inp.addEventListener(
                                                        "change",
                                                        async () => {
                                                            if (inp.files) {
                                                                if (
                                                                    inp.files[0]
                                                                ) {
                                                                    try {
                                                                        // @ts-ignore
                                                                        await anura.x86hdd.loadfile(
                                                                            inp
                                                                                .files[0],
                                                                        );
                                                                        anura.notifications.add(
                                                                            {
                                                                                title: "Custom RootFS Loaded",
                                                                                description:
                                                                                    "Custom RootFS has sucessfully loaded!",
                                                                                timeout: 5000,
                                                                            },
                                                                        );
                                                                    } catch (e) {
                                                                        anura.dialog.alert(
                                                                            "Error loading file: " +
                                                                                e,
                                                                        );
                                                                    }
                                                                }
                                                            }
                                                        },
                                                    );
                                                    inp.click();
                                                }
                                            }}
                                            class="settings-button grouped-btn"
                                        >
                                            Upload Custom RootFS
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                    <div id="reset" class="settings-category">
                        <h3 class="settings-category-name">Reset Anura</h3>
                        <div class="settings-group">
                            <div class="settings-item">
                                <span class="settings-item-name">
                                    Reset your Anura install.
                                </span>
                                <button
                                    class="matter-button-outlined"
                                    on:click={async () => {
                                        const confirmation =
                                            await anura.dialog.confirm(
                                                "Are you sure you want to powerwash Anura? All of your data will be lost.",
                                            );
                                        if (confirmation) {
                                            try {
                                                navigator.serviceWorker
                                                    .getRegistrations()
                                                    .then(
                                                        function (
                                                            registrations,
                                                        ) {
                                                            for (const registration of registrations) {
                                                                registration.unregister();
                                                            }
                                                        },
                                                    );
                                                localStorage.clear();
                                                sessionStorage.clear();
                                                const databases =
                                                    await indexedDB.databases();
                                                for (const database of databases) {
                                                    try {
                                                        await indexedDB.deleteDatabase(
                                                            database.name!,
                                                        );
                                                    } catch {
                                                        console.log(
                                                            `Failed to delete database ${database.name}`,
                                                        );
                                                    }
                                                }
                                                window.location.reload();
                                            } catch (e) {
                                                console.error(
                                                    "failed powerwash: ",
                                                    e,
                                                );
                                            }
                                        }
                                    }}
                                >
                                    Powerwash
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );

    async open(): Promise<WMWindow | undefined> {
        if (this.win?.element?.parentElement) {
            return this.win;
        }
        this.win = anura.wm.create(this, {
            title: "",
            width: "910px",
            height: `${(720 * window.innerHeight) / 1080}px`,
            resizable: true,
        });

        this.win.content.appendChild(await this.page());
        return this.win;
    }
}
