class OobeView {
    content: HTMLElement;

    element = (
        <div class="oobe">
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
                if (!anura.settings.get("x86-disabled")) {
                    console.log("installing x86");
                    const bzimage = await fetch(anura.config.bzimage);
                    anura.fs.writeFile("/bzimage", await bzimage.arrayBuffer());
                    const initrd = await fetch(anura.config.initrd);
                    anura.fs.writeFile(
                        "/initrd.img",
                        await initrd.arrayBuffer(),
                    );

                    const rootfs = await fetch(anura.config.rootfs);

                    console.log("done");
                }
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
    }
}
