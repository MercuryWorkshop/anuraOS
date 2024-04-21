// FIXME: This is not what God wanted (someone pls redo)

class Dialog extends App {
    name = "Anura Dialog";
    package = "anura.dialog";
    icon = "/assets/icons/generic.png";
    source: string;
    hidden = true;
    css = css`
        margin: 16px;
        h2 {
            font-size: 1.2rem;
        }
        .buttons {
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

    alert(message: string) {
        const dialog = this as object;
        (dialog as any).title = "";
        const win = anura.wm.create(this, dialog);

        // MARK: The DAMN CSS
        win.content.style.background = "var(--material-bg)";
        win.content.style.color = "white";

        win.content.appendChild(
            <div class={[this.css]}>
                <h2>{message}</h2>
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
    async confirm(message: string): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const dialog = this as object;
            (dialog as any).title = "";
            const win = anura.wm.create(this, dialog);

            const oldOnClose = win.onclose;
            win.onclose = () => {
                if (oldOnClose) {
                    oldOnClose();
                }
                resolve(false);
            };

            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            win.content.appendChild(
                <div class={[this.css]}>
                    <h2>{message}</h2>
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
            const win = anura.wm.create(this, dialog);

            const oldOnClose = win.onclose;
            win.onclose = () => {
                if (oldOnClose) {
                    oldOnClose();
                }
                resolve(null);
            };

            win.content.style.background = "var(--material-bg)";
            win.content.style.color = "white";

            let input: HTMLInputElement;

            win.content.appendChild(
                <div class={[this.css]}>
                    <h2>{message}</h2>
                    {/* FIXME: THIS TEXTFIELD SUCKS!!1
                        idrk if it still does, im just refactoring this code
                        so I am relaying the previous comment
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
