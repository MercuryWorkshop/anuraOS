class SettingsAppOld extends App {
    name = "Settings";
    package = "anura.settings";
    icon = "/assets/icons/settings.png";

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
        /* https://codepen.io/finnhvman/pen/MQyJxV */
        .pure-material-button-contained {
            position: relative;
            display: inline-block;
            box-sizing: border-box;
            border: none;
            border-radius: 4px;
            padding: 0 16px;
            min-width: 64px;
            height: 36px;
            vertical-align: middle;
            text-align: center;
            text-overflow: ellipsis;
            text-transform: uppercase;
            color: rgb(var(--pure-material-onprimary-rgb, 255, 255, 255));
            background-color: rgb(
                var(--pure-material-primary-rgb, 33, 150, 243)
            );
            box-shadow:
                0 3px 1px -2px rgba(0, 0, 0, 0.2),
                0 2px 2px 0 rgba(0, 0, 0, 0.14),
                0 1px 5px 0 rgba(0, 0, 0, 0.12);
            font-family: var(
                --pure-material-font,
                "Roboto",
                "Segoe UI",
                BlinkMacSystemFont,
                system-ui,
                -apple-system
            );
            font-size: 14px;
            font-weight: 500;
            line-height: 36px;
            overflow: hidden;
            outline: none;
            cursor: pointer;
            transition: box-shadow 0.2s;
        }

        .pure-material-button-contained::-moz-focus-inner {
            border: none;
        }

        /* Overlay */
        .pure-material-button-contained::before {
            content: "";
            position: absolute;
            top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            background-color: rgb(
                var(--pure-material-onprimary-rgb, 255, 255, 255)
            );
            opacity: 0;
            transition: opacity 0.2s;
        }

        /* Ripple */
        .pure-material-button-contained::after {
            content: "";
            position: absolute;
            left: 50%;
            top: 50%;
            border-radius: 50%;
            padding: 50%;
            width: 32px; /* Safari */
            height: 32px; /* Safari */
            background-color: rgb(
                var(--pure-material-onprimary-rgb, 255, 255, 255)
            );
            opacity: 0;
            transform: translate(-50%, -50%) scale(1);
            transition:
                opacity 1s,
                transform 0.5s;
        }

        /* Hover, Focus */
        .pure-material-button-contained:hover,
        .pure-material-button-contained:focus {
            box-shadow:
                0 2px 4px -1px rgba(0, 0, 0, 0.2),
                0 4px 5px 0 rgba(0, 0, 0, 0.14),
                0 1px 10px 0 rgba(0, 0, 0, 0.12);
        }

        .pure-material-button-contained:hover::before {
            opacity: 0.08;
        }

        .pure-material-button-contained:focus::before {
            opacity: 0.24;
        }

        .pure-material-button-contained:hover:focus::before {
            opacity: 0.3;
        }

        /* Active */
        .pure-material-button-contained:active {
            box-shadow:
                0 5px 5px -3px rgba(0, 0, 0, 0.2),
                0 8px 10px 1px rgba(0, 0, 0, 0.14),
                0 3px 14px 2px rgba(0, 0, 0, 0.12);
        }

        .pure-material-button-contained:active::after {
            opacity: 0.32;
            transform: translate(-50%, -50%) scale(0);
            transition: transform 0s;
        }

        /* Disabled */
        .pure-material-button-contained:disabled {
            color: rgba(var(--pure-material-onsurface-rgb, 0, 0, 0), 0.38);
            background-color: rgba(
                var(--pure-material-onsurface-rgb, 0, 0, 0),
                0.12
            );
            box-shadow: none;
            cursor: initial;
        }

        .pure-material-button-contained:disabled::before {
            opacity: 0;
        }

        .pure-material-button-contained:disabled::after {
            opacity: 0;
        }
        .form__group {
            position: relative;
            padding: 15px 0 0;
            margin-top: 10px;
        }

        .form__field {
            font-family: inherit;
            /*width: 100%;*/
            border: 0;
            border-bottom: 1px solid #d2d2d2;
            outline: 0;
            font-size: 16px;
            color: white;
            padding: 7px 0;
            background: transparent;
            transition: border-color 0.2s;
        }

        .form__field::placeholder {
            color: transparent;
        }

        .form__field:focus {
            padding-bottom: 6px;
            border-bottom: 2px solid #009788;
        }

        /* end plagarized code */
        .header {
            border-bottom-color: #555;
            border-bottom-width: 5px;
            width: 100%;
            margin-left: 20px;
        }
        .rows {
            display: flex;
            flex-direction: column;
            /* align-items: center;
        justify-content: center; */
            font-size: 16px;
            font-weight: 500;
            height: 58px;
            width: calc(100% - 40px);
            padding-left: 20px;
            padding-right: 20px;
        }

        .rowsbtn {
            background-color: #292a2d;
            color: white;
            border-radius: 0;
            height: 100%;
            width: 100%;
            border: none;
            text-align: left;
        }

        .rows:first-child .rowsbtn {
            border-top-left-radius: 10px;
            border-top-right-radius: 10px;
            border-bottom: 0.5px solid #3f4042;
        }

        .rows:last-child .rowsbtn {
            border-bottom-left-radius: 10px;
            border-bottom-right-radius: 10px;
            border-top: 0.5px solid #3f4042;
        }
        .rowswrapper {
            box-shadow: 0px 0px 5px rgba(0, 0, 0, 0.3);
        }

        .rows:not(:first-child):not(:last-child) .rowsbtn {
            border-bottom: 0.5px solid #3f4042;
            border-top: 0.5px solid #3f4042;
        }
        h4 {
            padding-left: 20px;
        }
    `;

    state = stateful({
        show_x86: !anura.settings.get("x86-disabled"),
        x86_installing: false,
        resizing: false,
    });

    page = () => (
        <div
            class={`background ${this.css}`}
            style="height:100%;width:100%;position:absolute"
        >
            <div class="header">
                <h2 color="white">Anura Settings</h2>
            </div>

            <div css={this.state}>
                <h4>General</h4>
                <div class="rowswrapper">
                    {this.row(this.toggle("Allow offline use", "use-sw-cache"))}
                    {this.row(
                        this.toggle(
                            "Borderless Aboutbrowser",
                            "borderless-aboutbrowser",
                        ),
                    )}

                    {this.row(
                        this.textbox(
                            "Custom WSproxy URL",
                            "wsproxy-url",
                            false,
                        ),
                    )}

                    {this.row(
                        this.textbox(
                            "Custom Bare Server URL",
                            "bare-url",
                            false,
                        ),
                    )}
                </div>

                <h4>Anura x86 Subsystem</h4>
                <div
                    class="settings-section"
                    if={React.use(this.state.show_x86)}
                    then={(() => {
                        const disksize = (
                            <input
                                style="float: right; margin-right: 5px"
                                class="form__field"
                                type="number"
                            />
                        );
                        const screencontainer = (
                            <div
                                class={styled.new`
                                    canvas {
                                        display: none;
                                    }
                                `}
                            >
                                <div style="white-space: pre; font: 14px monospace; line-height: 14px"></div>
                                <canvas />
                            </div>
                        );
                        disksize.value = anura.x86hdd.size;
                        return (
                            <>
                                {this.row(
                                    this.textbox(
                                        "Custom x86 network relay URL",
                                        "relay-url",
                                        false,
                                    ),
                                )}
                                {this.row(
                                    <div>
                                        x86 disk size (bytes)
                                        <button
                                            on:click={async () => {
                                                anura.x86?.emulator.stop();

                                                this.state.resizing = true;
                                                await anura.x86hdd.save();

                                                await anura.x86hdd.resize(
                                                    disksize.value,
                                                );

                                                const emulator = new V86Starter(
                                                    {
                                                        wasm_path:
                                                            "/lib/v86.wasm",
                                                        memory_size:
                                                            512 * 1024 * 1024,
                                                        vga_memory_size:
                                                            8 * 1024 * 1024,
                                                        screen_container:
                                                            screencontainer,

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
                                                    },
                                                );
                                                let s0data = "";
                                                emulator.add_listener(
                                                    "serial0-output-char",
                                                    async (char: string) => {
                                                        if (char === "\r") {
                                                            anura.logger.debug(
                                                                s0data,
                                                            );

                                                            if (
                                                                s0data.includes(
                                                                    "Finished Disk",
                                                                )
                                                            ) {
                                                                this.state.resizing =
                                                                    false;
                                                                await anura.x86hdd.save(
                                                                    emulator,
                                                                );
                                                                alert(
                                                                    "finished resizing disk",
                                                                );
                                                                // window.location.reload();
                                                            }

                                                            s0data = "";
                                                            return;
                                                        }
                                                        s0data += char;
                                                    },
                                                );
                                            }}
                                            style="float: right"
                                            class="pure-material-button-contained"
                                        >
                                            Resize/Repair x86 webdisk
                                        </button>
                                        {disksize}
                                    </div>,
                                )}
                                {this.row(
                                    <>
                                        <button
                                            on:click={() => {
                                                this.state.show_x86 = false;
                                                anura.settings.set(
                                                    "x86-disabled",
                                                    true,
                                                );
                                                anura.x86hdd.delete();
                                            }}
                                            class="pure-material-button-contained"
                                        >
                                            Disable x86 subsystem (will remove
                                            all data)
                                        </button>
                                        <button
                                            on:click={() => {
                                                //@ts-ignore
                                                const el = $el;
                                                if (
                                                    confirm(
                                                        "WARNING: CUSTOM ROOTFSES ARE NOT SUPPORTED!! You will likely break all integration and be left with an inferior experience. DO YOU KNOW WHAT YOU ARE DOING?",
                                                    )
                                                ) {
                                                    const inp = (
                                                        <input
                                                            type="file"
                                                            on:change={async () => {
                                                                if (
                                                                    inp.files[0]
                                                                ) {
                                                                    try {
                                                                        //@ts-ignore
                                                                        await anura.x86hdd.loadfile(
                                                                            inp
                                                                                .files[0],
                                                                        );
                                                                        el.replaceWith(
                                                                            <p>
                                                                                rootfs
                                                                                uploaded
                                                                                sucessfully
                                                                            </p>,
                                                                        );
                                                                    } catch (e) {
                                                                        el.replaceWith(
                                                                            <p>
                                                                                error
                                                                                uploading
                                                                                rootfs
                                                                            </p>,
                                                                        );
                                                                    }
                                                                }
                                                            }}
                                                        />
                                                    );
                                                    inp.click();
                                                }
                                            }}
                                            class="pure-material-button-contained"
                                        >
                                            Upload custom x86 rootfs
                                        </button>
                                        <div
                                            if={React.use(this.state.resizing)}
                                            then={screencontainer}
                                        />
                                    </>,
                                )}
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
                                    <br />
                                    <span id="tracker"></span>
                                </>
                            }
                            else={this.row(
                                <button
                                    on:click={async () => {
                                        this.state.x86_installing = true;
                                        anura.settings.set(
                                            "x86-image",
                                            prompt(
                                                'Please enter "arch" or "debian"',
                                            ),
                                        );
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
                                    style="width: 100%"
                                    class="pure-material-button-contained"
                                >
                                    Install x86 subsystem OS
                                </button>,
                            )}
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
                <div class="switch" style="top: -6px; float: right">
                    {checkbox}
                    <label class="switch__label"></label>
                </div>
            </div>
        );
        full.getElementsByTagName("label")[0]?.setAttribute("for", checkboxID); // AliceJS bug workaround
        return full;
    }
    row(item: HTMLElement) {
        return (
            <div class="rows">
                <button class="rowsbtn">{item}</button>
            </div>
        );
    }
    textbox(name: string, setting: string, multiline: boolean) {
        const textbox = (
            <input
                type="text"
                class="form__field"
                style="float: right"
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
        super();
    }
    async open(): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "",
            width: "900px",
            height: "600px",
        });

        win.content.appendChild(this.page());

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
