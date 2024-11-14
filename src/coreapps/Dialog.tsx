// this has now been redone, nobody is getting sent to hell anymore

class Dialog extends App {
    name = "Anura Dialog";
    package = "anura.dialog";
    icon = "/assets/icons/generic.svg";
    source: string;
    hidden = true;

    css = css`
        margin: 16px;
        h2 {
            font-size: 1.2rem;
        }
        .buttons {
            display: flex;
            justify-content: flex-end;
            margin-top: 10px;

            .matter-button-contained {
                background-color: var(--theme-accent);
                color: var(--theme-fg);
            }
        }
        .confirm {
            margin-left: 5px;
        }
    `;

    constructor() {
        super();
    }

    alert(message: string, title = "Alert") {
        const dialog = this as object;
        (dialog as any).title = "";
        (dialog as any).width = "350px";
        (dialog as any).height = "170px";
        const win = anura.wm.create(this, dialog);

        // MARK: The DAMN CSS
        win.content.style.background = "var(--material-bg)";
        win.content.style.color = "white";

        // MARK: good idea?
        // (win.element as HTMLElement).querySelectorAll(".windowButton").forEach((el: HTMLElement) => {
        //     el.style.display = "none";
        // })

        win.content.appendChild(
            <div class={[this.css]}>
                <h2>{title}</h2>
                <p>{message}</p>
                <div class={["buttons"]}>
                    <button
                        class={["matter-button-contained"]}
                        on:click={() => {
                            win.close();
                        }}
                    >
                        OK
                    </button>
                </div>
            </div>,
        );
    }
    async confirm(message: string, title = "Confirmation"): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            (dialog as any).width = "350px";
            (dialog as any).height = "170px";
            const win = anura.wm.create(this, dialog);

            win.onclose = () => {
                resolve(false);
            };

            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            win.content.appendChild(
                <div class={[this.css]}>
                    <h2>{title}</h2>
                    <p>{message}</p>
                    <div class="buttons">
                        <button
                            class="matter-button-outlined"
                            on:click={() => {
                                resolve(false);
                                win.close();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            class={["matter-button-contained", "confirm"]}
                            on:click={() => {
                                resolve(true);
                                win.close();
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>,
            );
        });
    }
    async prompt(message: string, defaultValue?: any): Promise<any> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            (dialog as any).width = "350px";
            (dialog as any).height = "200px";
            const win = anura.wm.create(this, dialog);

            win.onclose = () => {
                resolve(null);
            };

            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            let input: HTMLInputElement;

            win.content.appendChild(
                <div class={[this.css]}>
                    <h2>{message}</h2>
                    {/* MARK: FIXME: UGLY
                     */}
                    <label class="matter-textfield-filled">
                        {
                            (input = (
                                <input placeholder=" " />
                            ) as HTMLInputElement)
                        }
                    </label>

                    <div class="buttons">
                        <button
                            class="matter-button-outlined"
                            on:click={() => {
                                resolve(null);
                                win.close();
                            }}
                        >
                            Cancel
                        </button>
                        <button
                            class={["matter-button-contained", "confirm"]}
                            on:click={() => {
                                const value = input.value;
                                if (value && value !== "") {
                                    resolve(value);
                                } else if (defaultValue) {
                                    resolve(defaultValue);
                                } else {
                                    resolve(null);
                                }
                                win.close();
                            }}
                        >
                            OK
                        </button>
                    </div>
                </div>,
            );
        });
    }
}
