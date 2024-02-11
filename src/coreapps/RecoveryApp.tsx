class RecoveryApp extends App {
    name = "Recovery";
    package = "anura.recovery";
    icon = "/assets/icons/verificationoff.png";

    css = styled.new`
        self {
            background-color: var(--material-bg);
            height: 100%;
            width: 100%;
            display: flex;
            padding: 0;
            flex-direction: column;
            align-items: center;
            justify-content: center;
        }

        .recovery-app-logo {
            height: 128px;
            width: 128px;
        }

        .recovery-logo-img {
            background-image: url("/assets/icons/verificationoff.png");
            background-size: contain;
            height: 128px;
            width: 128px;
        }

        .recovery-app-logo-divider {
            margin: 1rem 0;
            height: 1px;
            background-color: #9ca3af;
            flex-shrink: 0;
            width: calc(100% - 2rem);
        }

        .recovery-app-content {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            color: white;
            padding: 1rem;
            gap: 1rem;
        }

        .recovery-app-content p {
            margin: 0;
        }

        /* .recovery-app-content button {
            background: var(--material-bg);
            color: white;
            border: none;
            padding: 0.5rem 1rem;
            border-radius: 4px;
            cursor: pointer;
        } */
    `;

    page = async () => (
        <div class={`${this.css} self`}>
            <div class="recovery-app-logo">
                <div class="recovery-logo-img" title="Recovery"></div>
            </div>
            <div class="recovery-app-logo-divider" />
            <div class="recovery-app-content">
                {/* Powerwash Button */}
                <button
                    style="background: #B71C1C;"
                    class="matter-button-contained"
                    title="Reset your Anura install to factory settings. This will delete all of your data."
                    on:click={async () => {
                        if (
                            confirm(
                                "Are you sure you want to powerwash Anura? All of your data will be lost.",
                            )
                        ) {
                            const sh = new anura.fs.Shell();
                            try {
                                await sleep(2);
                                await sh.promises.rm("/", {
                                    recursive: true,
                                });
                                window.location.reload();
                            } catch (error) {
                                window.location.reload();
                            }
                        }
                    }}
                >
                    Powerwash
                </button>
                {/* Anura Shell Button */}
                <button
                    style="background: #2f2f2f;"
                    class="matter-button-contained"
                    title="Open a shell to help recover your system."
                    on:click={() => {
                        const term = anura.apps["anura.ashell"];
                        if (term) {
                            term.open();
                        } else {
                            anura.notifications.add({
                                title: "Error",
                                description: "The shell app is not installed.",
                                timeout: 2000,
                            });
                        }
                    }}
                >
                    Anura Shell
                </button>
                {/* Invalidate Cache Button */}
                <div
                    if={anura.settings.get("use-sw-cache")}
                    then={
                        <button
                            style="background: #1B5E20;"
                            class="matter-button-contained"
                            title="Clear the service worker cache. This requires an internet connection on your next boot."
                            on:click={() => {
                                const sh = new anura.fs.Shell();
                                sh.rm("/anura_files", { recursive: true });
                                anura.notifications.add({
                                    title: "Cache invalidated",
                                    description:
                                        "The cache has been invalidated. When you reload the page, the cache will be reinstalled. This requires an internet connection.",
                                    timeout: 2000,
                                });
                            }}
                        >
                            Invalidate Cache
                        </button>
                    }
                    else={
                        <button
                            style="background: #1B5E20; cursor: not-allowed;"
                            class="matter-button-contained"
                            title="The cache is disabled, so you cannot invalidate it."
                            disabled
                        >
                            Invalidate Cache
                        </button>
                    }
                ></div>

                <button
                    style="background: #1B5E20"
                    class="matter-button-contained"
                    title="Return to normal mode"
                    on:click={() => {
                        window.location.reload();
                    }}
                >
                    Return
                </button>
            </div>
        </div>
    );

    constructor() {
        super();
    }

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        if (args.length > 0) {
            alert(args.join(" "));
        }

        const win = anura.wm.create(this, {
            title: "",
            width: "400px",
            height: "450px",
        });

        win.content.appendChild(await this.page());

        // make borderless
        win.content.style.position = "absolute";
        win.content.style.height = "100%";
        win.content.style.display = "inline-block";

        (win.element.querySelector(".title") as any).style["background-color"] =
            "rgba(0, 0, 0, 0)";

        return win;
    }
}
