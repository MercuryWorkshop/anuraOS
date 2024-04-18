const themeCSS = css`
    input {
        /*stuff*/
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
            style={`height:100%;width:100%;position:absolute;background: ${anura.theme.background};color: ${anura.theme.foreground}`}
            class={`background ${themeCSS}`}
            id="theme-editor"
        >
            {/* TODO: WTF IS THIS UI */}
            <h2>Theme Editor</h2>

            <div>
                <h3>Background</h3>
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
                <h3>Secondary Background</h3>
                <input
                    type="color"
                    value={anura.theme.secondaryBackground}
                    on:input={(e: InputEvent) => {
                        const val = (e.target! as HTMLInputElement).value;
                        anura.theme.background = val;

                        anura.theme.apply();
                        anura.settings.set("theme", val, "secondaryBackground");
                    }}
                />
                <h3>Accent</h3>
                <input
                    type="color"
                    value={anura.theme.accent}
                    on:input={(e: InputEvent) => {
                        const val = (e.target! as HTMLInputElement).value;
                        anura.theme.background = val;

                        anura.theme.apply();
                        anura.settings.set("theme", val, "accent");
                    }}
                />
                <h3>Foreground</h3>
                <input
                    type="color"
                    value={anura.theme.foreground}
                    on:input={(e: InputEvent) => {
                        const val = (e.target! as HTMLInputElement).value;
                        document.getElementById("theme-editor")!.style.color =
                            val;
                        anura.theme.border = val;

                        anura.theme.apply();
                        anura.settings.set("theme", val, "foreground");
                    }}
                />
                <h3>Secondary Foreground</h3>
                <input
                    type="color"
                    value={anura.theme.secondaryForeground}
                    on:input={(e: InputEvent) => {
                        const val = (e.target! as HTMLInputElement).value;
                        anura.theme.secondaryForeground = val;

                        anura.theme.apply();
                        anura.settings.set("theme", val, "secondaryForeground");
                    }}
                />
                <h3>Border</h3>
                <input
                    type="color"
                    value={anura.theme.border}
                    on:input={(e: InputEvent) => {
                        const val = (e.target! as HTMLInputElement).value;
                        anura.theme.border = val;

                        anura.theme.apply();
                        anura.settings.set("theme", val, "border");
                    }}
                />
                <button
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
