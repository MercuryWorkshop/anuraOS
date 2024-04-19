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
        this.name = "ThemeEditor";
        this.icon = "/assets/icons/generic.png";
        this.package = "anura.themeeditor";
    }

    page = async () => (
        <div
            style={`padding: 2%;height:100%;width:100%;position:absolute;background: ${anura.theme.background};color: ${anura.theme.foreground}`}
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
                        value={anura.theme.background}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            document.getElementById(
                                "theme-editor",
                            )!.style.background = val;
                            anura.theme.background = val;

                            anura.theme.apply();
                            anura.settings.set("theme", val, "background");
                        }}
                    />
                </div>
                <div>
                    Secondary Background
                    <input
                        type="color"
                        value={anura.theme.secondaryBackground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.theme.secondaryBackground = val;

                            anura.theme.apply();
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
                        value={anura.theme.secondaryBackground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.theme.darkBackground = val;

                            anura.theme.apply();
                            anura.settings.set("theme", val, "darkBackground");
                        }}
                    />
                </div>
                <div>
                    Accent
                    <input
                        type="color"
                        value={anura.theme.accent}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.theme.accent = val;

                            anura.theme.apply();
                            anura.settings.set("theme", val, "accent");
                        }}
                    />
                </div>
                <div>
                    Foreground
                    <input
                        type="color"
                        value={anura.theme.foreground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            document.getElementById(
                                "theme-editor",
                            )!.style.color = val;
                            anura.theme.border = val;

                            anura.theme.apply();
                            anura.settings.set("theme", val, "foreground");
                        }}
                    />
                </div>
                <div>
                    Secondary Foreground
                    <input
                        type="color"
                        value={anura.theme.secondaryForeground}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.theme.secondaryForeground = val;

                            anura.theme.apply();
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
                        value={use(anura.theme.border)}
                        on:input={(e: InputEvent) => {
                            const val = (e.target! as HTMLInputElement).value;
                            anura.theme.border = val;

                            anura.theme.apply();
                            anura.settings.set("theme", val, "border");
                        }}
                    />
                </div>
                <button
                    class="matter-button-contained"
                    on:click={() => {
                        anura.theme = new Theme();
                        document.getElementById(
                            "theme-editor",
                        )!.style.background = anura.theme.background;
                        document.getElementById("theme-editor")!.style.color =
                            anura.theme.foreground;
                        anura.settings.set("theme", anura.theme);
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
