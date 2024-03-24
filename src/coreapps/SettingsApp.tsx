const settingsCSS = css`
    color: white;

    .header {
        margin-left: 20px;
        font-family: Roboto, sans-serif;
    }
    .container {
        display: flex;
    }
    .settings-category {
        margin-left: 20px;
        margin-right: 10px;
        width: 100%;
    }
    .settings-body {
        display: flex;
        width: 100%;
        margin-right: 20px;
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
        color: #c1c1c1;
    }
    .sidebar-settings-item-name > a:hover {
        color: #b9b9b9;
    }
    .settings-category-name {
        color: rgb(225 225 225);
        margin-bottom: 15px;
    }

    .settings-group {
        background-color: rgb(26 26 28);
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
        border-bottom: 1px solid #444;
    }

    .settings-item-name,
    .matter-switch {
        margin-left: 10px;
    }
    .settings-button {
        background-color: #2f2f2f;
        border: none;
        border-radius: 5px;
        padding: 5px;
        color: #c1c1c1;
        cursor: pointer;
        margin-right: 10px;
    }
    .settings-item-text-input {
        background-color: #2f2f2f;
        margin-right: 10px;
        border: none;
        border-radius: 5px;
        padding: 5px;
        color: white;
    }
    .settings-item-text-input:focus {
        outline: none;
    }
    .sidebar-settings-item-name > a {
        color: #c1c1c1;
        margin-left: 20px;
        text-decoration: none;
        font-family: "Google Sans", Roboto, sans-serif;
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
`;

class SettingsApp extends App {
    name = "Settings";
    package = "anura.settings";
    icon = "/assets/icons/settings.png";

    state = stateful({
        show_x86_install: anura.settings.get("x86-disabled"),
        x86_installing: false,
        resizing: false,
    });

    page = async () => (
        <div
            style="height:100%;width:100%;position:absolute"
            class={`background ${settingsCSS}`}
        >
            <div class="header">
                <h2 color="white">Anura Settings</h2>
            </div>

            <div css={this.state} class="container">
                <div class="sidebar">
                    <div class="sidebar-settings-item">
                        <span class="sidebar-settings-item-name">
                            <span class="material-symbols-outlined">build</span>
                            <a href="#general">General</a>
                        </span>
                    </div>
                    <div class="sidebar-settings-item">
                        <span class="sidebar-settings-item-name">
                            <span class="material-symbols-outlined">
                                memory
                            </span>
                            <a href="#v86">x86</a>
                        </span>
                    </div>
                    <div class="sidebar-settings-item">
                        <span class="sidebar-settings-item-name">
                            <span class="material-symbols-outlined">
                                device_reset
                            </span>
                            <a href="#reset">Reset</a>
                        </span>
                    </div>
                </div>
                <div class="settings-body">
                    <div id="general" class="general settings-category">
                        <h3 class="settings-category-name">General</h3>
                        <div class="settings-group">
                            <div class="settings-item">
                                <label class="matter-switch">
                                    <input
                                        on:click={(event: any) => {
                                            if (event.target.checked) {
                                                anura.settings.set(
                                                    "use-sw-cache",
                                                    true,
                                                );
                                            } else {
                                                anura.settings.set(
                                                    "use-sw-cache",
                                                    false,
                                                );
                                            }
                                            anura.settings.set(
                                                "milestone",
                                                "INVALID",
                                            );
                                            window.location.reload();
                                        }}
                                        id="use-sw-cache"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <span>Allow offline use</span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <label class="matter-switch">
                                    <input
                                        on:click={(event: any) => {
                                            if (event.target.checked) {
                                                anura.settings.set(
                                                    "borderless-aboutbrowser",
                                                    true,
                                                );
                                            } else {
                                                anura.settings.set(
                                                    "borderless-aboutbrowser",
                                                    false,
                                                );
                                            }
                                        }}
                                        id="borderless-aboutbrowser"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <span>Borderless AboutBrowser</span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <label class="matter-switch">
                                    <input
                                        on:click={(event: any) => {
                                            if (event.target.checked) {
                                                anura.settings.set(
                                                    "disable-animation",
                                                    true,
                                                );
                                            } else {
                                                anura.settings.set(
                                                    "disable-animation",
                                                    false,
                                                );
                                            }
                                        }}
                                        id="disable-animation"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <span>Reduce animations</span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <label class="matter-switch">
                                    <input
                                        on:click={(event: any) => {
                                            if (event.target.checked) {
                                                anura.settings.set(
                                                    "clampWindows",
                                                    true,
                                                );
                                            } else {
                                                anura.settings.set(
                                                    "clampWindows",
                                                    false,
                                                );
                                            }
                                        }}
                                        id="clampWindows"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <span>Window Edge Clamping</span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <label class="matter-switch">
                                    <input
                                        on:click={(event: any) => {
                                            if (event.target.checked) {
                                                anura.settings.set(
                                                    "transparent-ashell",
                                                    true,
                                                );
                                            } else {
                                                anura.settings.set(
                                                    "transparent-ashell",
                                                    false,
                                                );
                                            }
                                        }}
                                        id="transparent-ashell"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <span>
                                        Transparent Anura Shell Background
                                    </span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <label class="matter-switch">
                                    <input
                                        on:click={(event: any) => {
                                            if (event.target.checked) {
                                                anura.settings.set(
                                                    "launcher-keybind",
                                                    true,
                                                );
                                            } else {
                                                anura.settings.set(
                                                    "launcher-keybind",
                                                    false,
                                                );
                                            }
                                        }}
                                        id="launcher-keybind"
                                        type="checkbox"
                                        role="switch"
                                    />
                                    <span>Enable Launcher Keybind</span>
                                </label>
                            </div>
                            <div class="settings-item">
                                <span class="settings-item-name">
                                    Custom Wisp URL
                                </span>
                                <input
                                    class="settings-item-text-input"
                                    on:change={(event: any) => {
                                        anura.settings.set(
                                            "wisp-url",
                                            event.target.value,
                                        );
                                    }}
                                    placeholder={anura.settings.get("wisp-url")}
                                    type="text"
                                />
                            </div>
                            <div class="settings-item">
                                <span class="settings-item-name">
                                    Custom Bare URL (deprecated)
                                </span>
                                <input
                                    class="settings-item-text-input"
                                    on:change={(event: any) => {
                                        anura.settings.set(
                                            "bare-url",
                                            event.target.value,
                                        );
                                    }}
                                    placeholder={anura.settings.get("bare-url")}
                                    type="text"
                                />
                            </div>
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
                                            const chosenRootFS =
                                                await anura.dialog.prompt(
                                                    'Enter the name of the rootfs you want to install ("alpine", "debian", "arch")',
                                                );
                                            console.log(chosenRootFS);
                                            if (
                                                chosenRootFS == "debian" ||
                                                chosenRootFS == "arch" ||
                                                chosenRootFS == "alpine"
                                            ) {
                                                anura.settings.set(
                                                    "x86-image",
                                                    chosenRootFS,
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

                                                this.state.x86_installing =
                                                    false;
                                                this.state.show_x86_install =
                                                    true;

                                                if (
                                                    document.getElementById(
                                                        "tracker",
                                                    )
                                                ) {
                                                    document.getElementById(
                                                        "tracker",
                                                    )!.innerText = "Installed!";
                                                }
                                            } else {
                                                anura.dialog.alert(
                                                    "Invalid rootfs name! Valid names are: alpine, debian, arch",
                                                );
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
                                        <span class="settings-item-name">
                                            Custom Bare URL
                                        </span>
                                        <input
                                            class="settings-item-text-input"
                                            on:change={(event: any) => {
                                                anura.settings.set(
                                                    "relay-url",
                                                    event.target.value,
                                                );
                                            }}
                                            placeholder={anura.settings.get(
                                                "relay-url",
                                            )}
                                            type="text"
                                        />
                                    </div>
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
                                                    const emulator =
                                                        new V86Starter({
                                                            wasm_path:
                                                                "/lib/v86.wasm",
                                                            memory_size:
                                                                512 *
                                                                1024 *
                                                                1024,
                                                            vga_memory_size:
                                                                8 * 1024 * 1024,
                                                            screen_container:
                                                                anura.x86!
                                                                    .screen_container,

                                                            initrd: {
                                                                url: "/images/resizefs.img",
                                                            },

                                                            bzimage: {
                                                                url: "/images/bzResize",
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
                                            const sh = new anura.fs.Shell();
                                            try {
                                                localStorage.clear();
                                                await sleep(2);
                                                await sh.promises.rm("/", {
                                                    recursive: true,
                                                });
                                                window.location.reload();
                                            } catch (error) {
                                                window.location.reload();
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

    constructor() {
        super();
    }

    async open(): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "",
            width: "910px",
            height: "720px",
            resizable: false,
        });

        win.content.appendChild(await this.page());
        if (document.getElementById("use-sw-cache")) {
            if (anura.settings.get("use-sw-cache")) {
                document
                    .getElementById("use-sw-cache")!
                    .setAttribute("checked", "");
            }
        }
        if (document.getElementById("borderless-aboutbrowser")) {
            if (anura.settings.get("borderless-aboutbrowser")) {
                document
                    .getElementById("borderless-aboutbrowser")!
                    .setAttribute("checked", "");
            }
        }
        if (document.getElementById("clampWindows")) {
            if (anura.settings.get("clampWindows")) {
                document
                    .getElementById("clampWindows")!
                    .setAttribute("checked", "");
            }
        }
        if (document.getElementById("transparent-ashell")) {
            if (anura.settings.get("transparent-ashell")) {
                document
                    .getElementById("transparent-ashell")!
                    .setAttribute("checked", "");
            }
        }
        if (document.getElementById("launcher-keybind")) {
            if (anura.settings.get("launcher-keybind")) {
                document
                    .getElementById("launcher-keybind")!
                    .setAttribute("checked", "");
            }
        }

        if (document.getElementById("disable-animation")) {
            if (anura.settings.get("disable-animation")) {
                document
                    .getElementById("disable-animation")!
                    .setAttribute("checked", "");
            }
        }
        return win;
    }
}
