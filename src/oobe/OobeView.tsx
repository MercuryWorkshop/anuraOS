class OobeView {
    content: HTMLElement;
    state = stateful({
        color: "var(--oobe-bg)",
        text: "black",
    });
    css = styled.new`
        * {
            color: ${React.use(this.state.text)};
            transition: all 1s;
        }

        self {
            background-color: ${React.use(this.state.color)};
            z-index: 999999999;
            position: absolute;
            width: 100%;
            height: 100%;
            top: 0;
            left: 0;
            display: flex;
            justify-content: center;
            align-content: center;
            flex-wrap: wrap;
        }

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
        }

        .screen button {
            background-color: var(--oobe-bg);
            border-radius: 16px;
            border: 1px solid gray;
            color: rgb(26, 115, 232);
            height: 2em;
            padding-left: 1em;
            padding-right: 1em;
        }

        #welcome.screen #animation {
            grid-column: 2 / span 1;
            grid-row: 1 / span 2;
            margin-left: auto;
        }
    `;
    element = (
        <div class={this.css}>
            <div bind:content={this} id="content"></div>
        </div>
    );

    nextButton: HTMLElement;
    steps = [
        {
            elm: (
                <div class="screen" id="welcome">
                    <h1>Welcome to your Chromebook</h1>
                    <div id="subtitle">Slow. Insecure. Effortful.</div>
                    <div id="gridContent">
                        <div id="topButtons">
                            <button>Random button</button>
                        </div>
                        <img id="animation" src="assets/oobe/welcome.gif" />
                        <div id="bottomButtons">
                            <button
                                on:click={() => this.nextStep()}
                                class="preferredButton"
                            >
                                Next
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
                            this.nextStep();
                        }}
                    >
                        Developer (enable v86)
                    </button>
                    <br />
                    <button
                        on:click={() => {
                            anura.settings.set("x86-disabled", true);
                            this.nextStep();
                        }}
                    >
                        watcher of porn on aboutbrowser (disable v86)
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
                    <div id="subtitle">
                        For the best experience, AnuraOS needs to download
                        required assets.
                    </div>
                    <img src="/assets/oobe/spinner.gif" />
                </div>
            ),
            on: async () => {
                this.state.color = "var(--material-bg)";
                this.state.text = "whitesmoke";

                if (!anura.settings.get("x86-disabled")) {
                    await installx86();
                }

                this.complete();
            },
        },
    ];
    i = 0;

    constructor() {
        this.nextStep();
    }

    nextStep() {
        const step = this.steps[this.i]!;
        this.content.children[0]?.remove();
        this.content.appendChild(step.elm);
        if (step.on) step.on();
        this.i++;
    }
    complete() {
        anura.settings.set("oobe-complete", true);

        document.dispatchEvent(new Event("anura-login-completed"));
        this.element.remove();
    }
}
async function installx86() {
    console.log("installing x86");
    const bzimage = await fetch(anura.config.bzimage);
    anura.fs.writeFile("/bzimage", Filer.Buffer(await bzimage.arrayBuffer()));
    const initrd = await fetch(anura.config.initrd);
    anura.fs.writeFile("/initrd.img", Filer.Buffer(await initrd.arrayBuffer()));

    if (typeof anura.config.rootfs === "string") {
        const rootfs = await fetch(anura.config.rootfs);
        const blob = await rootfs.blob();
        //@ts-ignore
        await anura.x86hdd.loadfile(blob);
    } else if (anura.config.rootfs) {
        // TODO: add batching, this will bottleneck and OOM if the rootfs is too large

        console.log("fetching");
        const files = await Promise.all(
            anura.config.rootfs.map((part: string) => fetch(part)),
        );
        console.log(files);
        console.log("constructing blobs...");
        const blobs = await Promise.all(files.map((file) => file.blob()));
        console.log(blobs);
        //@ts-ignore
        await anura.x86hdd.loadfile(new Blob(blobs));
    }

    alert("todo: x86 won't work until reload");
    console.log("done");
}
