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
    name = "Registry Editor";
    package = "anura.regedit";
    icon = "/assets/icons/regedit.svg";

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
            overflow: scroll;
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
            width: 100%;
            background-color: var(--theme-bg);
            outline: none;
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

    constructor() {
        super();
    }

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
                                <tr>
                                    <td class="name">{item[0]}</td>
                                    <td class="type">{typeof item[1]}</td>
                                    <input
                                        class="value matter-textfield-outlined"
                                        on:blur={function (event: any) {
                                            const elements =
                                                event.srcElement.parentElement
                                                    .children;
                                            try {
                                                anura.settings.cache[
                                                    elements[0].innerText
                                                ] = JSON.parse(
                                                    elements[2].value,
                                                );
                                                anura.settings.save();
                                            } catch (e) {
                                                elements[2].value =
                                                    anura.settings.cache[
                                                        elements[0].innerText
                                                    ];
                                                anura.notifications.add({
                                                    title: "RegEdit Error",
                                                    description: `Failed to set value for ${elements[0].innerText}, invalid input`,
                                                    timeout: 50000,
                                                });
                                            }

                                            // console.log(JSON.parse(event.srcElement.value));
                                            console.log("blur", event);
                                        }}
                                        value={JSON.stringify(item[1])}
                                    ></input>
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
