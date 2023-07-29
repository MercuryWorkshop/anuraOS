css = styled.new`
    .self {
        color: white;
    }
    /* https://codepen.io/sajran/pen/dMKvpb */
    .switch {
        display: inline-block;
        position: relative;
        margin: 0 0 10px;
        font-size: 16px;
        line-height: 24px;
    }
    .switch__input {
        position: absolute;
        top: 0;
        left: 0;
        width: 36px;
        height: 20px;
        opacity: 0;
        z-index: 0;
    }
    .switch__label {
        display: block;
        padding: 0 0 0 44px;
        cursor: pointer;
    }
    .switch__label:before {
        content: "";
        position: absolute;
        top: 5px;
        left: 0;
        width: 36px;
        height: 14px;
        background-color: rgba(255, 255, 255, 0.26);
        border-radius: 14px;
        z-index: 1;
        transition: background-color 0.28s cubic-bezier(0.4, 0, 0.2, 1);
    }
    .switch__label:after {
        content: "";
        position: absolute;
        top: 2px;
        left: 0;
        width: 20px;
        height: 20px;
        background-color: #fff;
        border-radius: 14px;
        box-shadow:
            0 2px 2px 0 rgba(0, 0, 0, 0.14),
            0 3px 1px -2px rgba(0, 0, 0, 0.2),
            0 1px 5px 0 rgba(0, 0, 0, 0.12);
        z-index: 2;
        transition: all 0.28s cubic-bezier(0.4, 0, 0.2, 1);
        transition-property: left, background-color;
    }
    .switch__input:checked + .switch__label:before {
        background-color: rgba(63, 81, 181, 0.5);
    }
    .switch__input:checked + .switch__label:after {
        left: 16px;
        background-color: #3f51b5;
    }
`;

class SettingsApp implements App {
    name = "Settings";
    package = "anura.settings";
    icon = "/assets/icons/settings.png";
    windows: WMWindow[];

    state = stateful({
        show_x86: !anura.settings.get("x86-disabled"),
        x86_installing: false,
    });

    page = (
        <div
            class={`background ${css}`}
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
                                        anura.settings.set(
                                            "x86-disabled",
                                            true,
                                        );
                                        anura.x86hdd.delete();
                                    }}
                                >
                                    Disable x86 subsystem (will remove all data)
                                </button>
                            </>
                        );
                    })()}
                    else={
                        <div
                            if={React.use(this.state.x86_installing)}
                            then={
                                <>
                                    <h3>
                                        Installing x86... this may take a while
                                    </h3>
                                    <img
                                        src="/assets/oobe/spinner.gif"
                                        class={styled.new`
                                            self {
                                                width: 10%;
                                                aspect-ratio: 1/1;
                                            }
                                        `}
                                    />
                                </>
                            }
                            else={
                                <button
                                    on:click={async () => {
                                        this.state.x86_installing = true;
                                        await installx86();
                                        anura.settings.set(
                                            "x86-disabled",
                                            false,
                                        );
                                        anura.notifications.add({
                                            title: "x86 Subsystem Installed",
                                            description:
                                                "x86 OS has sucessfully installed",
                                            timeout: 5000,
                                        });
                                        // BUG! IT WON'T FIX THE X86HDD, WILL FAIL TO BOOT FIRST TIME

                                        await bootx86();
                                        anura.apps["anura.x86mgr"].open();

                                        this.state.x86_installing = false;
                                        this.state.show_x86 = true;
                                    }}
                                >
                                    Install x86 subsystem OS
                                </button>
                            }
                        ></div>
                    }
                />
            </div>
        </div>
    );

    toggle(name: string, setting: string) {
        const val = anura.settings.get(setting);
        const checkboxID = crypto.randomUUID();
        const checkbox = (
            <input
                type="checkbox"
                class="switch__input"
                id={checkboxID}
                on:click={() => {
                    // if (checkbox.checked) {
                    //     checkbox.checked = false;
                    // } else {
                    //     checkbox.checked = true;
                    // }
                    console.log("thing");
                    anura.settings.set(setting, checkbox.checked);
                }}
            />
        );
        if (val) {
            checkbox.checked = true;
        }
        const full: HTMLElement = (
            <div>
                {name}
                <div class="switch" style="top: -6px;">
                    {checkbox}
                    <label class="switch__label"></label>
                </div>
            </div>
        );
        full.getElementsByTagName("label")[0]?.setAttribute("for", checkboxID); // AliceJS bug workaround
        return full;
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
