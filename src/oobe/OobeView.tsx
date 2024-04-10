class OobeView {
    state = stateful({
        color: "var(--oobe-bg)",
        text: "#202124",
        step: 0,
    });

    css = css`
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

        #content {
            padding: 79.6px 40px 23.8px 40px;
            width: 1040px;
            height: 680px;
            box-sizing: border-box;
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
        }

        #welcome.screen #animation {
            grid-column: 2 / span 1;
            grid-row: 1 / span 2;
            margin-left: auto;
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
                <div class="screen">
                    <h1>Choose your experience</h1>
                    <div id="subtitle">What kind of Anura user are you?</div>

                    <button
                        on:click={() => {
                            anura.settings.set("x86-disabled", false);
                            anura.settings.set("use-sw-cache", true);
                            anura.settings.set("x86-image", "alpine");
                            anura.settings.set("applist", [
                                ...anura.settings.get("applist"),
                                "anura.term",
                            ]);
                            this.nextStep();
                        }}
                    >
                        Alpine Linux - 1GB download
                    </button>
                    <br />
                    <button
                        on:click={() => {
                            anura.settings.set("x86-disabled", false);
                            anura.settings.set("use-sw-cache", true);
                            anura.settings.set("x86-image", "debian");
                            anura.settings.set("applist", [
                                ...anura.settings.get("applist"),
                                "anura.term",
                            ]);
                            this.nextStep();
                        }}
                    >
                        Debian Linux - 2.1GB download
                    </button>
                    <br />
                    <button
                        on:click={() => {
                            anura.settings.set("x86-disabled", false);
                            anura.settings.set("use-sw-cache", true);
                            anura.settings.set("x86-image", "arch");
                            anura.settings.set("applist", [
                                ...anura.settings.get("applist"),
                                "anura.term",
                            ]);
                            this.nextStep();
                        }}
                    >
                        Arch Linux - 2.1GB download
                    </button>
                    <br />
                    <button
                        on:click={() => {
                            anura.settings.set("x86-disabled", true);
                            anura.settings.set("use-sw-cache", true);
                            anura.settings.set("applist", [
                                ...anura.settings.get("applist"),
                                "anura.ashell",
                            ]);
                            this.nextStep();
                        }}
                    >
                        Normal User (disable linux) - 23.3MB download
                    </button>
                    <br />
                    <button
                        on:click={() => {
                            anura.settings.set("x86-disabled", true);
                            anura.settings.set("use-sw-cache", false);
                            anura.settings.set("applist", [
                                ...anura.settings.get("applist"),
                                "anura.ashell",
                            ]);
                            this.nextStep();
                        }}
                    >
                        No Download (disable linux and offline functionality)
                    </button>
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
                    await installx86();
                }
                if (anura.settings.get("use-sw-cache")) await preloadFiles();
                console.log("Cached important files");

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

async function installx86() {
    const tracker = document.getElementById("tracker");
    console.log("installing x86");
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

        console.log("fetching");
        // const files = await Promise.all(
        //     anura.config.x86[x86image].rootfs.map((part: string) => fetch(part)),
        // );

        const files: Blob[] = [];
        let limit = 4;
        let i = 0;
        let done = false;
        let doneSoFar = 0;
        const doWhenAvail = function () {
            if (limit == 0) return;
            limit--;
            const assigned = i;
            i++;

            fetch(anura.config.x86[x86image].rootfs[assigned])
                .then(async (response) => {
                    if (response.status != 200) {
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
                    if (doneSoFar == anura.config.x86[x86image].rootfs.length) {
                        done = true;
                    }
                    console.log(
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

        console.log(files);
        console.log("constructing blobs...");
        tracker!.innerText = "Concatenating and installing x86 rootfs";
        //@ts-ignore
        await anura.x86hdd.loadfile(new Blob(files));
    }

    console.log("done");
}
async function preloadFiles() {
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
        const tracker = document.getElementById("tracker");
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
