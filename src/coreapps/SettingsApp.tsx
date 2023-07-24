class SettingsApp implements App {
    name = "Settings";
    package = "anura.settings";
    icon = "/assets/icons/settings.png";
    windows: WMWindow[];

    state = stateful({
        show_x86: !anura.settings.get("disable-x86"),
    });

    page = (
        <div
            class="background"
            style="height:100%;width:100%;position:absolute"
        >
            <div css={this.state}>
                <h1>General</h1>
                {this.toggle("Allow offline use", "use-sw-cache")}
                {this.textbox("Custom WSproxy URL", "wsproxy-url", false)}
                {this.textbox("Custom Bare Server URL", "bare-url", false)}

                <h1>Anura x86 Subsystem</h1>
                <div
                    class="settings-section"
                    if={React.use(this.state.show_x86)}
                    then={(() => {
                        const disksize = <input type="number" />;
                        disksize.value = anura.x86hdd.size;
                        return (
                            <>
                                {this.textbox(
                                    "Custom x86 network relay URL",
                                    "relay-url",
                                    false,
                                )}
                                x86 disk size (bytes)
                                {disksize}
                                <button
                                    on:click={() => {
                                        anura.x86hdd.resize(disksize.value);
                                    }}
                                >
                                    Resize x86 webdisk (slow, risk of losing
                                    data)
                                </button>
                                <button
                                    on:click={() => {
                                        this.state.show_x86 = false;
                                        anura.settings.set("disable-x86", true);
                                        anura.x86hdd.delete();
                                    }}
                                >
                                    Disable x86 subsystem (will remove all data)
                                </button>
                            </>
                        );
                    })()}
                />
            </div>
        </div>
    );

    toggle(name: string, setting: string) {
        const val = anura.settings.get(setting);
        const checkbox = (
            <input
                type="checkbox"
                on:click={() => {
                    anura.settings.set(setting, checkbox.checked);
                }}
            />
        );
        if (val) {
            checkbox.checked = true;
        }

        return (
            <div>
                {name}

                <label class="switch">
                    {checkbox}
                    <span class="slider round"></span>
                </label>
            </div>
        );
    }
    textbox(name: string, setting: string, multiline: boolean) {
        const textbox = (
            <input
                type="text"
                on:change={() => {
                    anura.settings.set(setting, textbox.value);
                }}
            />
        );
        textbox.value = anura.settings.get(setting);
        return (
            <div>
                {name}
                <></>
                {textbox}
            </div>
        );
    }

    constructor() {
        this.windows = [];
    }
    async open(): Promise<WMWindow | undefined> {
        const win = AliceWM.create({
            title: "",
            width: "700px",
            height: "500px",
        } as unknown as any);

        win.content.appendChild(this.page);

        this.windows.push(win);

        taskbar.updateTaskbar();

        return win;
    }
    wsurl() {
        let url = "";
        if (location.protocol == "https:") {
            url += "wss://";
        } else {
            url += "ws://";
        }
        url += window.location.origin.split("://")[1];
        url += "/";
        return url;
    }
}
