const themeCSS = css`
    background: var(--theme-bg);
    color: var(--theme-fg);

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

class ThemeEditor extends App {
    state = stateful({
        resizing: false,
    });

    constructor() {
        super();
        this.name = "Theme Editor";
        this.icon = "/assets/icons/themeeditor.png";
        this.package = "anura.ui.themeeditor";
    }

    page = async () => (
        <div
            style={`padding: 2%;height:100%;width:100%;position:absolute;background: ${anura.ui.theme.background};color: ${anura.ui.theme.foreground}`}
            class={`background ${themeCSS}`}
            id="theme-editor"
        >
            {/* TODO: WTF IS THIS UI */}
            <h1>Theme Editor</h1>

            <div>
                <div>
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

                            anura.ui.theme.apply();
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

                            anura.ui.theme.apply();
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

                            anura.ui.theme.apply();
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

                            anura.ui.theme.apply();
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

                            anura.ui.theme.apply();
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

                            anura.ui.theme.apply();
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

                            anura.ui.theme.apply();
                            anura.settings.set("theme", val, "border");
                        }}
                    />
                </div>
                <div>
                    Border
                    <input
                        type="color"
                        value={use(anura.ui.theme.darkBorder)}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.ui.theme.darkBorder = val;

                            anura.ui.theme.apply();
                            anura.settings.set("theme", val, "darkBorder");
                        }}
                    />
                </div>
                <button
                    class="matter-button-contained"
                    on:click={() => {
                        anura.ui.theme = new Theme();
                        document.getElementById(
                            "theme-editor",
                        )!.style.background = anura.ui.theme.background;
                        document.getElementById("theme-editor")!.style.color =
                            anura.ui.theme.foreground;
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
