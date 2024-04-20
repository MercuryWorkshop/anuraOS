class ThemeEditor extends App {
    state = stateful({
        resizing: false,
    });

    css = css`
        input[type="color"] {
            appearance: none;
            background: none;
            padding: 0;
            border: 0;
            border-radius: 100%;
            width: 20px;
            height: 20px;
        }

        input[type="color" i]::-webkit-color-swatch-wrapper {
            padding: 0;
            border: 0;
        }

        input[type="color" i]::-webkit-color-swatch {
            border-radius: 50%;
            padding: 0;
        }

        div > * {
            display: flex;
            align-items: center;

            margin: 10px 0;
        }

        div > input {
            margin: 0 10px;
        }
    `;

    colorEditors: {
        prop: keyof ThemeProps;
        name: string;
    }[] = [
        {
            prop: "background",
            name: "Background",
        },
        {
            prop: "secondaryBackground",
            name: "Secondary Background",
        },
        {
            prop: "darkBackground",
            name: "Dark Background",
        },
        {
            prop: "accent",
            name: "Accent",
        },
        {
            prop: "foreground",
            name: "Foreground",
        },
        {
            prop: "secondaryForeground",
            name: "Secondary Foreground",
        },
        {
            prop: "border",
            name: "Border",
        },
        {
            prop: "darkBorder",
            name: "Dark Border",
        },
    ];

    constructor() {
        super();
        this.name = "Theme Editor";
        this.icon = "/assets/icons/themeeditor.png";
        this.package = "anura.ui.themeeditor";
    }

    page = async () => (
        <div
            style={{
                padding: "2%",
                height: "100%",
                width: "100%",
                position: "absolute",
                color: use(anura.ui.theme.state.foreground),
                background: use(anura.ui.theme.state.background),
            }}
            class={`background ${this.css}`}
            id="theme-editor"
        >
            {/* TODO: WTF IS THIS UI */}
            <h1>Theme Editor</h1>

            <div>
                {this.colorEditors.map((color) => (
                    <div>
                        {color.name}
                        <input
                            type="color"
                            bind:value={use(anura.ui.theme.state[color.prop])}
                            on:input={(e: InputEvent) => {
                                const val = (e.target! as HTMLInputElement)
                                    .value;
                                anura.ui.theme[color.prop] = val;
                                anura.settings.set("theme", val, color.prop);
                            }}
                        />
                    </div>
                ))}
                {/* <div>
                    Background
                    <input
                        type="color"
                        value={anura.ui.theme.background}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            document.getElementById(
                                "theme-editor",
                            )!.style.background = val;
                            anura.ui.theme.background = val;
                            anura.settings.set("theme", val, "background");
                        }}
                    />
                </div>
                <div>
                    Secondary Background
                    <input
                        type="color"
                        value={anura.ui.theme.secondaryBackground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.ui.theme.secondaryBackground = val;
                            anura.settings.set(
                                "theme",
                                val,
                                "secondaryBackground",
                            );
                        }}
                    />
                </div>
                <div>
                    Dark Background
                    <input
                        type="color"
                        value={anura.ui.theme.darkBackground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.ui.theme.darkBackground = val;
                            anura.settings.set("theme", val, "darkBackground");
                        }}
                    />
                </div>
                <div>
                    Accent
                    <input
                        type="color"
                        value={anura.ui.theme.accent}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.ui.theme.accent = val;
                            anura.settings.set("theme", val, "accent");
                        }}
                    />
                </div>
                <div>
                    Foreground
                    <input
                        type="color"
                        value={anura.ui.theme.foreground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            document.getElementById(
                                "theme-editor",
                            )!.style.color = val;
                            anura.ui.theme.border = val;
                            anura.settings.set("theme", val, "foreground");
                        }}
                    />
                </div>
                <div>
                    Secondary Foreground
                    <input
                        type="color"
                        value={anura.ui.theme.secondaryForeground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.ui.theme.secondaryForeground = val;
                            anura.settings.set(
                                "theme",
                                val,
                                "secondaryForeground",
                            );
                        }}
                    />
                </div>
                <div>
                    Border
                    <input
                        type="color"
                        value={use(anura.ui.theme.border)}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.ui.theme.border = val;
                            anura.settings.set("theme", val, "border");
                        }}
                    />
                </div> */}
                <button
                    class="matter-button-contained"
                    on:click={() => {
                        // anura.ui.theme = new Theme();
                        // document.getElementById(
                        //     "theme-editor",
                        // )!.style.background = anura.ui.theme.background;
                        // document.getElementById("theme-editor")!.style.color =
                        //     anura.ui.theme.foreground;
                        anura.ui.theme.reset();
                        anura.settings.set("theme", anura.ui.theme);
                    }}
                >
                    Reset
                </button>
            </div>
        </div>
    );

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "",
            width: "910px",
            height: "720px",
        });
        win.content.appendChild(await this.page());

        return win;
    }
}
