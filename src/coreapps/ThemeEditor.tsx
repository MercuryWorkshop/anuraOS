class ThemeEditor extends App {
    name = "Theme Editor";
    package = "anura.ui.themeeditor";
    icon = "/assets/icons/theme.png";

    state = $state({
        resizing: false,
    });

    picker: any;

    css = css`
        width: 100%;
        height: 100%;
        position: absolute;
        overflow-y: auto;

        input[type="color"] {
            appearance: none;
            background: none;
            padding: 0;
            border: 0;
            border-radius: 1rem;
            width: 4rem;
            height: 3rem;
        }

        input[type="color" i]::-webkit-color-swatch-wrapper {
            padding: 0;
            border: 0;
        }

        input[type="color" i]::-webkit-color-swatch {
            border-radius: 1rem;
            padding: 0;
            border-color: var(--theme-border);
        }

        .editor {
            display: flex;
            justify-content: space-between;
            align-items: center;
            width: 100%;
            padding-block: 0.6rem;
        }

        .editor:not(:last-of-type) {
            border-bottom: 1px solid var(--theme-border);
        }

        .editor input {
            margin: 0 0.8rem;
        }

        #colors {
            display: flex;
            flex-direction: column;
            padding-inline: 2rem;
            padding-top: 0.6rem;
        }

        #head {
            padding: 0.5rem 1rem;
            display: flex;
            justify-content: space-between;
            align-items: center;
            position: sticky;
            top: 0;
            background: var(--theme-bg);

            & > h1 {
                margin-left: 0.5rem;
                margin-block: 0.9rem;
            }
        }

        #btns {
            display: flex;
            gap: 0.15rem;

            & button {
                padding: 0.5rem 0.75rem;
                border-radius: 10rem;
                background: transparent;
                color: var(--theme-fg);
                border: none;
                cursor: pointer;
                font-family: inherit;
                font-size: 1rem;

                display: flex;
                align-items: center;
                gap: 0.3rem;

                transition: 0.15s background;

                & .material-symbols-outlined {
                    font-size: 1.7rem;
                }

                &:hover,
                &:focus-visible {
                    background: var(--theme-secondary-bg);
                    transition: 0.15s background;
                    outline: none;
                }

                &:active {
                    background: color-mix(
                        in srgb,
                        var(--theme-secondary-bg) 90%,
                        var(--theme-fg)
                    );
                    transition: 0.05s background;
                }
            }
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
    }

    page = async () => (
        <div
            style={{
                color: use(anura.ui.theme.state.foreground),
                background: use(anura.ui.theme.state.darkBackground),
            }}
            class={`background ${this.css}`}
            id="theme-editor"
        >
            <div id="head">
                <h1>Theme Editor</h1>
                <div id="btns">
                    <button
                        style={{
                            color: use(anura.ui.theme.state.foreground),
                        }}
                        on:click={() => {
                            anura.ui.theme.reset();
                            anura.settings.set("theme", anura.ui.theme.state);
                        }}
                    >
                        <span class="material-symbols-outlined">restore</span>
                        Reset
                    </button>

                    <button
                        style={{
                            color: use(anura.ui.theme.state.foreground),
                        }}
                        on:click={() => {
                            this.exportTheme(
                                JSON.stringify(anura.ui.theme.state),
                            );
                        }}
                    >
                        <span class="material-symbols-outlined">save</span>Save
                    </button>

                    <button
                        style={{
                            color: use(anura.ui.theme.state.foreground),
                        }}
                        on:click={() => {
                            this.importTheme();
                        }}
                    >
                        <span class="material-symbols-outlined">folder</span>
                        Import
                    </button>
                </div>
            </div>

            <div id="colors">
                {this.colorEditors.map((color) => (
                    <div class="editor">
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
            </div>
        </div>
    );

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "",
            width: "910px",
            height: `${(720 * window.innerHeight) / 1080}px`,
        });
        this.picker = await anura.import("anura.filepicker");
        win.content.appendChild(await this.page());

        return win;
    }

    async importTheme() {
        // Here be dragons
        const file = await (
            await this.picker
        ).selectFile({ regex: "(json|txt)" });
        try {
            const data = await anura.fs.promises.readFile(file);
            Object.assign(anura.ui.theme.state, JSON.parse(data as any));
            anura.ui.theme.apply();
            await anura.settings.set("theme", anura.ui.theme.state);
        } catch (e) {
            anura.notifications.add({
                title: "Theme editor",
                description: `Theme could not be loaded: ${e}`,
                timeout: 5000,
            });
        }
    }

    exportTheme(theme: string) {
        const filePath = `/theme-${Math.floor(Math.random() * 1e10)}.json`;
        anura.fs.writeFile(filePath, theme);
        anura.notifications.add({
            title: "Theme editor",
            description: `Theme saved to ${filePath}`,
            timeout: 5000,
        });
    }
}
