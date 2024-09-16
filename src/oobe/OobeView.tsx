class OobeView {
    state = $state({
        color: "white",
        text: "#202124",
        step: 0,
        offlineEnabled: true,
        v86Enabled: false,
        dlsize: "0MB",
    });

    constructor() {
        useChange([this.state.offlineEnabled, this.state.v86Enabled], () => {
            this.state.dlsize = "0MB";

            if (this.state.offlineEnabled) {
                this.state.dlsize = "~25MB";
            }

            if (this.state.v86Enabled) {
                this.state.dlsize = "1GB";

                if (this.state.offlineEnabled) {
                    this.state.dlsize = "~1GB";
                }
            }
        });
    }

    css = css`
        color-scheme: light;
        z-index: 9996;
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        left: 0;
        display: flex;
        justify-content: center;
        align-content: center;
        flex-wrap: wrap;

        --matter-onsurface-rgb: #121212 !important;
        * {
            --matter-helper-theme: 26, 115, 232 !important;
        }

        #content {
            padding: 79.6px 40px 23.8px 40px;
            width: ${anura.platform.type === "mobile" ? "100vw;" : "1040px;"};
            height: ${anura.platform.type === "mobile" ? "100vh;" : "680px;"};
            box-sizing: border-box;

            &:has(#features) {
                padding-top: 28px;
            }
        }

        #content .screen {
            width: 100%;
            height: 100%;
        }

        .screen h1 {
            margin: 48px 0 0 0;
        }

        .screen #subtitle {
            margin: 16px 0 64px 0;
            font-size: 24px;
            /* https://partnermarketinghub.withgoogle.com/brands/chromebook/visual-identity/visual-identity/color-palette/ */
            color: #5f6368;
        }

        .screen #gridContent {
            display: grid;
            grid-template-columns: auto minmax(0, 1fr);
            grid-template-rows: minmax(0, 1fr) minmax(0, 1fr);
        }

        .screen #gridContent #topButtons {
            grid-column: 1 / span 1;
            grid-row: 1 / span 1;
        }

        .screen #gridContent #bottomButtons {
            align-self: end;
            justify-self: start;
            grid-column: 1 / span 1;
            grid-row: 2 / span 1;
        }

        .screen .preferredButton {
            background-color: rgb(26, 115, 232);
            border-radius: 16px;
            border-style: none;
            color: white;
            height: 2em;
            padding-left: 1em;
            padding-right: 1em;
            transition: 0s;
        }

        .screen .preferredButton:hover {
            background-color: rgb(26, 115, 232);
            filter: brightness(1.1);
        }

        .screen button {
            background-color: var(--oobe-bg);
            border-radius: 16px;
            border: 1px solid gray;
            color: rgb(26, 115, 232);
            height: 2em;
            margin: 0.5em;
            padding-left: 1em;
            padding-right: 1em;
            cursor: pointer;
            font-family:
                "Roboto",
                RobotoDraft,
                "Droid Sans",
                Arial,
                Helvetica,
                -apple-system,
                BlinkMacSystemFont,
                system-ui,
                sans-serif;
        }

        .screen #animation {
            grid-column: 2 / span 1;
            grid-row: 1 / span 2;
            margin-left: auto;
            display: ${anura.platform.type === "mobile" ? "none;" : "unset;"};
        }

        .material-symbols-outlined {
            font-size: 1rem;
        }

        .sub {
            color: #96969f;
            font-size: 1.05rem;
            display: flex;
            align-items: center;
            & > .material-symbols-outlined {
                font-size: 1.1rem;
            }
        }

        #features #subtitle {
            margin-bottom: 2rem;
        }
    `;

    steps = [
        {
            elm: (
                <div class="screen" id="welcome">
                    <h1>Welcome to AnuraOS</h1>
                    <div id="subtitle">Effortless. Modern. Powerful.</div>
                    <div id="gridContent">
                        <img id="animation" src="assets/oobe/welcome.gif" />
                        <div id="bottomButtons">
                            <button
                                on:click={() => this.nextStep()}
                                class="preferredButton"
                            >
                                Get Started
                            </button>
                        </div>
                    </div>
                </div>
            ),
            on: () => {},
        },
        {
            elm: (
                <div class="screen" id="features">
                    <h1>Choose your experience</h1>
                    <div id="subtitle">What kind of Anura user are you?</div>
                    <label class="matter-checkbox">
                        <input
                            type="checkbox"
                            bind:checked={use(this.state.offlineEnabled)}
                        />
                        <span>Offline Functionality</span>
                    </label>
                    <div class="sub">
                        <span class="material-symbols-outlined">info</span>
                        &nbsp;This allows you to use AnuraOS without an internet
                        connection.
                    </div>
                    <br></br>
                    <label class="matter-checkbox">
                        <input
                            type="checkbox"
                            bind:checked={use(this.state.v86Enabled)}
                        />
                        <span>Linux Emulation</span>
                    </label>
                    <div class="sub">
                        <span class="material-symbols-outlined">info</span>
                        &nbsp;This allows you to run Linux applications on
                        AnuraOS.
                    </div>
                    <br></br>
                    <div id="size" class="sub">
                        <span class="material-symbols-outlined">download</span>
                        &nbsp;{use(this.state.dlsize)} download
                    </div>
                    <div class="sub">
                        <span class="material-symbols-outlined">info</span>
                        &nbsp;These features can always be enabled in Settings.
                    </div>
                    <div id="gridContent">
                        <img
                            id="animation"
                            src="assets/oobe/checking_for_update.gif"
                        />
                        <div id="bottomButtons">
                            <button
                                on:click={() => {
                                    anura.settings.set(
                                        "x86-disabled",
                                        !this.state.v86Enabled,
                                    );
                                    anura.settings.set(
                                        "use-sw-cache",
                                        this.state.offlineEnabled,
                                    );
                                    anura.settings.set("applist", [
                                        ...anura.settings.get("applist"),
                                        this.state.v86Enabled
                                            ? "anura.term"
                                            : "anura.ashell",
                                    ]);
                                    this.nextStep();
                                }}
                                class="preferredButton"
                            >
                                <div
                                    style={{
                                        display: "flex",
                                        alignItems: "center",
                                        fontSize: "0.7rem!important",
                                    }}
                                >
                                    <span>Next</span>
                                    <span class="material-symbols-outlined">
                                        chevron_right
                                    </span>
                                </div>
                            </button>
                        </div>
                    </div>
                </div>
            ),
            on: () => {},
        },
        {
            elm: (
                <div class="screen" id="downloadingFiles">
                    <div id="assetsDiv" style="display:none;"></div>
                    <h1>Downloading assets</h1>
                    <div id="subtitle" style="color: white;">
                        For the best experience, AnuraOS needs to download
                        required assets.
                    </div>
                    <img src="/assets/oobe/spinner.gif" />
                    <br />
                    <span id="tracker"></span>
                </div>
            ),
            on: async () => {
                await navigator.serviceWorker.controller!.postMessage({
                    anura_target: "anura.cache",
                    value: anura.settings.get("use-sw-cache"),
                });
                this.state.color = "var(--material-bg)";
                this.state.text = "whitesmoke";
                if (!anura.settings.get("x86-disabled")) {
                    await anura.settings.set("x86-image", "alpine");
                    await installx86();
                }
                if (anura.settings.get("use-sw-cache")) await preloadFiles();
                console.debug("Cached important files");

                this.complete();
            },
        },
    ];

    element = (
        <div
            class={this.css}
            style={{
                backgroundColor: use(this.state.color),
                color: use(this.state.text),
            }}
        >
            <div id="oobe-top">
                <div id="content">
                    {use(this.state.step, (step) => this.steps[step]!.elm)}
                </div>
            </div>
        </div>
    );

    nextStep() {
        this.state.step++;
        const step = this.steps[this.state.step]!;
        if (step.on) step.on();
    }
    complete() {
        anura.settings.set("oobe-complete", true);

        document.dispatchEvent(new Event("anura-login-completed"));
        this.element.remove();
    }
}

async function installx86(tracker = document.getElementById("tracker")) {
    console.debug("installing x86");
    const x86image = anura.settings.get("x86-image");
    tracker!.innerText = "Downloading x86 kernel";
    const bzimage = await fetch(anura.config.x86[x86image].bzimage);
    anura.fs.writeFile("/bzimage", Filer.Buffer(await bzimage.arrayBuffer()));
    tracker!.innerText = "Downloading x86 initrd";
    const initrd = await fetch(anura.config.x86[x86image].initrd);
    anura.fs.writeFile("/initrd.img", Filer.Buffer(await initrd.arrayBuffer()));

    if (typeof anura.config.x86[x86image].rootfs === "string") {
        const rootfs = await fetch(anura.config.x86[x86image].rootfs);
        const blob = await rootfs.blob();
        //@ts-ignore
        await anura.x86hdd.loadfile(blob);
    } else if (anura.config.x86[x86image].rootfs) {
        // TODO: add batching, this will bottleneck and OOM if the rootfs is too large

        console.debug("fetching");
        // const files = await Promise.all(
        //     anura.config.x86[x86image].rootfs.map((part: string) => fetch(part)),
        // );

        const files: Blob[] = [];
        let limit = 4;
        let i = 0;
        let done = false;
        let doneSoFar = 0;
        const doWhenAvail = function () {
            if (limit === 0) return;
            limit--;
            const assigned = i;
            i++;

            fetch(anura.config.x86[x86image].rootfs[assigned])
                .then(async (response) => {
                    if (response.status !== 200) {
                        console.error("Status code bad on chunk " + assigned);
                        console.error(
                            anura.config.x86[x86image].rootfs[assigned],
                        );
                        console.error(
                            "Finished " + doneSoFar + " chunks before error",
                        );
                        anura.notifications.add({
                            title: "bad chunk on x86 download",
                            description: `Chunk ${assigned} gave status code ${response.status}\nClick me to reload`,
                            timeout: 50000,
                            callback: () => {
                                location.reload();
                            },
                        });
                        return;
                    }
                    files[assigned] = await response.blob();
                    limit++;
                    doneSoFar++;
                    tracker!.innerHTML = `Downloading x86 rootfs. Chunk ${doneSoFar}/${anura.config.x86[x86image].rootfs.length} done`;
                    if (i < anura.config.x86[x86image].rootfs.length) {
                        doWhenAvail();
                    }
                    if (
                        doneSoFar === anura.config.x86[x86image].rootfs.length
                    ) {
                        done = true;
                    }
                    console.debug(
                        anura.config.x86[x86image].rootfs.length -
                            doneSoFar +
                            " chunks to go",
                    );
                })

                .catch((e) => {
                    console.error("Error on chunk " + assigned);
                    anura.notifications.add({
                        title: "bad chunk on x86 download",
                        description: `Chunk ${assigned} had a download error ${e}\nClick me to reload`,
                        timeout: 50000,
                        callback: () => {
                            location.reload();
                        },
                    });
                }); // Peak error handling right there
        };
        doWhenAvail();
        doWhenAvail();
        doWhenAvail();
        doWhenAvail();
        while (!done) {
            await sleep(200);
        }

        console.debug("constructing blobs...");
        tracker!.innerText = "Concatenating and installing x86 rootfs";
        //@ts-ignore
        await anura.x86hdd.loadfile(new Blob(files));
    }

    console.debug("done");
}

async function preloadFiles(tracker = document.getElementById("tracker")) {
    try {
        const list = await (await fetch("cache-load.json")).json();
        /*
         * The list has a few items that aren't exactly real
         * as a result of the developers schizophrenia.
         * Because of this, there will be a few errors on the fetch.
         * These can safely be ignored, just like the voices in
         * the developers head.
         */
        const chunkSize = 10;
        const promises = [];
        let i = 0;
        for (const item in list) {
            promises.push(fetch(list[item]));
            if (Number(item) % chunkSize === chunkSize - 1) {
                await Promise.all(promises);
            }
            tracker!.innerText = `Downloading anura system files, chunk ${i}/${list.length}`;
            i++;
        }
        await Promise.all(promises);
    } catch (e) {
        console.warn("error durring oobe preload", e);
    }
}
