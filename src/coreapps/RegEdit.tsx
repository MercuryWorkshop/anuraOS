function hasChildren(entry: any[]) {
    return (
        Object.entries(entry[1]).filter((setting) => {
            return (
                setting[1] instanceof Object && !(setting[1] instanceof Array)
            );
        }).length > 0
    );
}

const DisclosureGroup: Component<{
    entry: any[];
    sel: { [key: string]: any };
    level?: number;
}> = function () {
    if (!this.level) this.level = 1;

    this.css = `
    padding-left: ${0.8 * this.level!}em;
    `;

    return (
        <div
            class:selected={use(this.sel, (sel) => sel === this.entry[1])}
            class={this.css}
        >
            {hasChildren(this.entry) ? (
                <details>
                    <summary
                        class:selected={use(
                            this.sel,
                            (sel) => sel === this.entry[1],
                        )}
                    >
                        <span
                            on:click={(e: MouseEvent) => {
                                e.preventDefault();
                                this.sel = this.entry[1];
                            }}
                        >
                            {this.entry[0]}
                        </span>
                    </summary>
                    {Object.entries(this.entry[1])
                        .filter((setting) => {
                            return (
                                setting[1] instanceof Object &&
                                !(setting[1] instanceof Array)
                            );
                        })
                        .map((item: any) => (
                            <DisclosureGroup
                                entry={item}
                                bind:sel={use(this.sel)}
                                sel={this.sel}
                                level={this.level! + 1}
                            />
                        ))}
                </details>
            ) : (
                <span
                    on:click={() => {
                        this.sel = this.entry[1];
                    }}
                    class:selected={use(
                        this.sel,
                        (sel) => sel === this.entry[1],
                    )}
                >
                    {this.entry[0]}
                </span>
            )}
        </div>
    );
};

class RegEdit extends App {
    hidden = false;
    constructor() {
        super();
        this.name = "Registry Editor";
        this.icon = "/assets/icons/regedit.svg";
        this.package = "anura.regedit";
    }

    css = css`
        display: flex;
        border-top: 1px solid var(--theme-border);

        #pane-left {
            width: max(10%, 200px);
            border-right: 1px solid var(--theme-border);
            overflow: scroll;
            text-overflow: nowrap;
            white-space: nowrap;
            padding-left: 0.5em;
        }

        #pane-right {
            width: calc(100% - max(10%, 200px));
            min-width: 400px;
            padding-inline: 0.5em;
        }

        #detail {
            width: 100%;
            height: 100%;
        }

        table {
            width: 100%;
            margin: 0;
        }

        .value {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            max-width: 8em;
        }

        .name {
            max-width: 8em;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
        }

        .selected {
            background-color: var(--theme-secondary-bg);
        }

        .selected details {
            background-color: var(--theme-bg);
        }
    `;
    state = $state({
        selected: anura.settings.cache,
    });

    page = async () => (
        <div
            style={{
                height: "100%",
                width: "100%",
                position: "absolute",
                color: use(anura.ui.theme.state.foreground),
                background: use(anura.ui.theme.state.background),
            }}
            class={`background ${this.css}`}
        >
            <div id="pane-left">
                <div id="detail">
                    <details open>
                        <summary
                            class:selected={use(
                                this.state.selected,
                                (sel) => sel === anura.settings.cache,
                            )}
                        >
                            <span
                                on:click={(e: MouseEvent) => {
                                    e.preventDefault();
                                    this.state.selected = anura.settings.cache;
                                }}
                            >
                                System
                            </span>
                        </summary>
                        {Object.entries(anura.settings.cache)
                            .filter((setting) => {
                                return (
                                    setting[1] instanceof Object &&
                                    !(setting[1] instanceof Array)
                                );
                            })
                            .map((item: any) => (
                                <DisclosureGroup
                                    entry={item}
                                    bind:sel={use(this.state.selected)}
                                    sel={this.state.selected}
                                />
                            ))}
                    </details>
                </div>
            </div>

            <div id="pane-right">
                {/* someone else can make this resizable, i cba */}
                <table>
                    <tr>
                        <th>Name</th>
                        <th>Type</th>
                        <th>Value</th>
                    </tr>
                    {use(this.state.selected, (sel) =>
                        Object.entries(sel)
                            .filter((setting) => {
                                return (
                                    !(setting[1] instanceof Object) ||
                                    setting[1] instanceof Array
                                );
                            })
                            .map((item: any) => (
                                <tr
                                    on:dblclick={() => {
                                        switch (typeof item[1]) {
                                            case "boolean":
                                                anura.dialog
                                                    .confirm(
                                                        `The key will be set to ${!item[1]}`,
                                                        `Change value of ${item[0]}?`,
                                                    )
                                                    .then((value) => {
                                                        if (value) {
                                                            sel[item[0]] =
                                                                !item[1];
                                                            anura.settings.save();
                                                        }
                                                    });
                                                break;
                                            case "number":
                                                anura.dialog
                                                    .prompt(
                                                        `Enter new value for ${item[0]}`,
                                                        item[1],
                                                    )
                                                    .then((value) => {
                                                        if (value !== null) {
                                                            const val2 =
                                                                parseInt(
                                                                    value as string,
                                                                );
                                                            sel[item[0]] = val2;
                                                            anura.settings.save();
                                                        }
                                                    });
                                                break;
                                            case "object":
                                                // anura.dialog.prompt(`Enter new value for ${item[0]}`, item[1])
                                                // .then((value) => {
                                                //     if (value !== null) {
                                                //         let val2 = JSON.parse(value as string);
                                                //         sel[item[0]] = val2;
                                                //         anura.settings.save();
                                                //     }
                                                // });
                                                break;
                                            default:
                                                anura.dialog
                                                    .prompt(
                                                        `Enter new value for ${item[0]}`,
                                                        item[1],
                                                    )
                                                    .then((value) => {
                                                        if (value !== null) {
                                                            const val2 =
                                                                value as string;
                                                            sel[item[0]] = val2;
                                                            anura.settings.save();
                                                        }
                                                    });
                                                break;
                                        }
                                    }}
                                >
                                    <td class="name">{item[0]}</td>
                                    <td class="type">{typeof item[1]}</td>
                                    <td class="value">{item[1]}</td>
                                </tr>
                            )),
                    )}
                </table>
            </div>
        </div>
    );

    async open(): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "Registry Editor",
            width: "910px",
            height: `${(720 * window.innerHeight) / 1080}px`,
            resizable: true,
        });

        win.content.appendChild(await this.page());
        if (!anura.settings.get("disable-regedit-warning")) {
            anura.dialog
                .confirm(
                    "Are you sure you want to continue?",
                    "Editing the registry can cause irreparable damage to your system!",
                )
                .then((value) => {
                    if (value === false) {
                        win.close();
                    }
                });
        }

        return win;
    }
}
