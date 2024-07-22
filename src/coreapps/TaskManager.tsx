class TaskManager extends App {
    constructor() {
        super();
        this.name = "Task Manager";
        this.icon = "/assets/icons/generic.png";
        this.package = "anura.taskmgr";
    }

    css = css`
        overflow: hidden;

        .row {
            padding-inline: 1em;
            // width: 100%;
            height: 1.75rem;
            display: flex;
            align-items: center;
        }

        .row.selected {
            background: var(--theme-accent);
            color: var(--theme-fg);
        }

        .list {
            overflow: scroll;
            height: calc(100% - 8rem);
            border: 1px var(--theme-border) solid;
            margin: 0.5rem;
            margin-bottom: 0;
        }

        .controls {
            height: 4rem;
            display: flex;
            align-items: center;
            justify-content: flex-end;
            padding: 0.5rem;
        }
    `;

    state = $state({
        procs: anura.processes,
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
            <div class="list">
                {use(this.state.procs, (procs) =>
                    procs.procs.map((proc) => (
                        <div
                            class="row"
                            class:selected={use(
                                this.state.selected,
                                (num) => num == proc.deref()?.pid,
                            )}
                            on:click={() => {
                                console.log("setting");
                                if (proc.deref()) {
                                    this.state.selected = proc.deref()!.pid;
                                }
                                console.log(this.state.selected);
                            }}
                        >
                            <span class="pid">Task {proc.deref()?.pid}</span>
                        </div>
                    )),
                )}
            </div>
            <div class="controls">
                <button
                    bind:disabled={use(this.state.selected, (num) => num == -1)}
                    class="matter-button-contained"
                    on:click={() => {
                        const proc = this.state.procs.procs.find(
                            (proc) => proc.deref()?.pid == this.state.selected,
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
        win.content.appendChild(await this.page());

        setInterval(() => {
            this.state.procs = anura.processes;
        }, 500);

        return win;
    }
}
