// probably some of the most clusterfucked code i've written - fish
class TaskManager extends App {
    name = "Task Manager";
    package = "anura.taskmgr";
    icon = "/assets/icons/system-monitor.svg";

    // incomprehensible css
    css = css`
        overflow: hidden;

        .row {
            padding-inline: 1em;
            height: 2rem;

            &,
            & td,
            & th {
                &:not(:first-of-type):not(last-of-type) {
                    border: 2px solid var(--theme-border);
                }

                height: 2rem;
                line-height: 2rem;
            }

            border-right: 0 !important;
            border-left: 0 !important;

            & > td {
                padding-inline: 0.5rem;
                padding-left: calc(0.5rem + 5px); /* account for spacer */

                & > span {
                    display: flex;
                    align-items: center;

                    &.pid {
                        justify-content: center;
                    }
                }
            }
        }

        .icon {
            height: 1.5rem;
            width: 1.5rem;
            margin-right: 0.5rem;
        }

        .row.selected {
            background: var(--theme-accent);
            color: var(--theme-fg);
        }

        .listwrapper {
            height: calc(100% - 8rem);
            border: 1px var(--theme-border) solid;
            margin: 0.5rem;
            width: calc(100% - 1rem);
            overflow-y: scroll;
        }

        .list {
            max-height: calc(100% - 8rem);
            margin-bottom: 0;
            border-collapse: collapse;
            width: 100%;

            & tbody {
                max-height: calc(100% - 1rem);
                overflow-y: scroll;
            }

            & thead {
                height: 1rem;
                position: sticky;
                top: 0;
                background: var(--theme-bg);
                border-bottom: 2px solid var(--theme-border);
            }

            & th {
                position: relative;
                font-weight: 400;
                padding-inline: 0.6rem;
                padding-block: 0.15rem;
                font-size: 0.9rem;
                text-align: right;
                &:first-of-type {
                    text-align: left;
                }

                height: 1.5rem;
            }
        }

        .controls {
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0.5rem;
        }

        .resizer {
            position: absolute;
            top: 0;
            right: 0;
            width: 5px;
            cursor: ew-resize;
            user-select: none;
            border-right: 2px solid var(--theme-border);
        }
        .resizer:hover {
            border-color: color-mix(
                in srgb,
                var(--theme-border) 80%,
                var(--theme-fg)
            );
        }

        .resizing {
            border-color: color-mix(
                in srgb,
                var(--theme-border) 60%,
                transparent
            );
        }

        .proc-title {
            white-space: nowrap;
            overflow: hidden;
            text-overflow: ellipsis;
        }
    `;

    constructor() {
        super();
    }

    state = $state({
        selected: -1, // TODO: Multiselect. Shouldn't be too hard
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
            <div class="listwrapper">
                <table class="list">
                    <thead>
                        <th>Name</th>
                        <th>Memory footprint</th>
                        <th>Process ID</th>
                    </thead>
                    <tbody>
                        {use(anura.processes.state.procs, (procs) =>
                            procs.map((proc) => (
                                <tr
                                    class="row"
                                    id={`taskmgr-proc-${proc.deref()?.pid}`}
                                    class:selected={use(
                                        this.state.selected,
                                        (num) => num === proc.deref()?.pid,
                                    )}
                                    on:click={() => {
                                        if (proc.deref()) {
                                            this.state.selected =
                                                proc.deref()!.pid;
                                        }
                                    }}
                                >
                                    <td>
                                        <span>
                                            <img
                                                alt="app"
                                                class="icon"
                                                src={(() => {
                                                    let icon =
                                                        anura.apps[
                                                            "anura.generic"
                                                        ].icon;
                                                    const process =
                                                        proc.deref();
                                                    if (
                                                        process instanceof
                                                            WMWindow &&
                                                        process.app
                                                    ) {
                                                        icon = process.app.icon;
                                                    }
                                                    return icon;
                                                })()}
                                            />
                                            <span class="proc-title">
                                                {proc.deref()?.title}
                                            </span>
                                        </span>
                                    </td>

                                    <td>
                                        <span>Measuring</span>
                                    </td>

                                    <td class="pid">
                                        <span class="pid">
                                            {proc.deref()?.pid}
                                        </span>
                                    </td>
                                </tr>
                            )),
                        )}
                    </tbody>
                </table>
            </div>
            <div class="controls">
                <button
                    bind:disabled={use(
                        this.state.selected,
                        (num) => num === -1,
                    )}
                    class="matter-button-contained"
                    on:click={() => {
                        const proc = anura.processes.state.procs.find(
                            (proc) =>
                                proc &&
                                proc.deref()?.pid === this.state.selected,
                        );
                        if (proc) {
                            proc.deref()?.kill();
                        }
                    }}
                >
                    End process
                </button>
            </div>
        </div>
    );

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "Task Manager",
            width: "520px",
            height: `${(360 * window.innerHeight) / 1080}px`,
        });
        const page = await this.page();
        win.content.appendChild(page);

        createResizableTable(page.querySelector("table.list")!);
        if ((performance as any).measureUserAgentSpecificMemory) {
            const measure = async () => {
                if (!(performance as any).measureUserAgentSpecificMemory)
                    return {}; // this API only works on chromium
                const start = performance.now();
                const perfTree = await (
                    performance as any
                ).measureUserAgentSpecificMemory();

                // type this maybe?
                const usage: any = {};
                for (const memUser of perfTree.breakdown) {
                    if (
                        !memUser.attribution[0] ||
                        memUser.attribution[0].scope !== "Window" ||
                        !memUser.attribution[0].container
                    )
                        continue;
                    if (
                        !memUser.attribution[0].container.id.startsWith("proc-")
                    )
                        continue;
                    const pid = Number(
                        memUser.attribution[0].container.id.slice(5),
                    );
                    usage[pid] = memUser.bytes;
                }
                return usage;
            };
            while (page.parentElement) {
                // hasn't been killed
                const perfList = await measure();
                // IDK why I have to any this but it doesn't like it otherewise
                const allRows = Array.from(
                    (
                        document.querySelectorAll("[id^=taskmgr-proc-]") as any
                    ).values(),
                );
                for (const app in perfList) {
                    const row = page.querySelector("#taskmgr-proc-" + app);
                    (row!.children[1]! as HTMLElement).innerText =
                        Math.ceil(perfList[app] / 1000) + "kB";
                    if (allRows.includes(row)) {
                        delete allRows[allRows.indexOf(row)];
                    }
                }
                for (const row of allRows) {
                    if (row) {
                        (
                            (row as HTMLElement).children[1]! as HTMLElement
                        ).innerText = "(System Process)";
                    }
                }
            }
        }

        return win;
    }
}

const createResizableTable = function (table: HTMLElement) {
    const cols = Array.from(table.querySelectorAll("th"))!;
    cols.pop(); // We don't need to resize the rightmost column
    cols.forEach.call(cols, function (col: HTMLElement) {
        // Add a resizer element to the column
        const resizer = document.createElement("div");
        resizer.classList.add("resizer");

        // Set the height
        resizer.style.height = table.offsetHeight + "px";

        col.appendChild(resizer);

        let x = 0;
        let w = 0;

        const mouseDownHandler = function (e: MouseEvent) {
            x = e.clientX;

            const styles = window.getComputedStyle(col);
            w = parseInt(styles.width, 10);

            document.addEventListener("mousemove", mouseMoveHandler);
            document.addEventListener("mouseup", mouseUpHandler);

            resizer.classList.add("resizing");
        };

        const mouseMoveHandler = function (e: MouseEvent) {
            const dx = e.clientX - x;
            col.style.width = w + dx + "px";
        };

        const mouseUpHandler = function () {
            resizer.classList.remove("resizing");
            document.removeEventListener("mousemove", mouseMoveHandler);
            document.removeEventListener("mouseup", mouseUpHandler);
        };

        resizer.addEventListener("mousedown", mouseDownHandler);
    });
};
