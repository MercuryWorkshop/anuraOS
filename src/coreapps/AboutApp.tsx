class AboutApp extends App {
    name = "About Anura";
    package = "anura.about";
    icon = "/assets/icons/about.png";

    page = async () => (
        <div class="aboutapp-container">
            <div class="aboutapp-logo">
                <img
                    src={this.icon}
                    title="Temporary logo until official AnuraOS logo is chosen"
                />
            </div>
            <div class="aboutapp-logo-divider"></div>
            <div class="aboutapp-content">
                <p>AnuraOS</p>
                <p>Version TODO (OS build {await this.getOSBuild()})</p>
                <p>© Mercury Workshop. All rights reserved.</p>
                <br />
                <p if={!anura.settings.get("x86-disabled")}>
                    Anura x86 subsystem enabled.
                </p>
                <p if={anura.settings.get("x86-disabled")}>
                    Anura x86 subsystem disabled.
                </p>
                <p if={anura.settings.get("x86-disabled")}>
                    Enable it in{" "}
                    <button
                        on:click={() => {
                            anura.apps["anura.settings"].open();
                        }}
                        class="aboutapp-link-button"
                    >
                        settings
                    </button>
                    .
                </p>
                <br />
                <br />

                <p>
                    This product is licensed under the{" "}
                    <a
                        target="_blank"
                        href="https://github.com/MercuryWorkshop/AliceWM/blob/master/LICENSE"
                    >
                        GNU AGPLv3
                    </a>
                </p>
            </div>
        </div>
    );

    constructor() {
        super();
    }

    async open(): Promise<WMWindow | undefined> {
        const aboutview = anura.wm.create(this, {
            title: "",
            width: "400px",
            height: "600px",
        });

        aboutview.content.appendChild(await this.page());

        // make borderless
        aboutview.content.style.position = "absolute";
        aboutview.content.style.height = "100%";
        aboutview.content.style.display = "inline-block";

        const container = aboutview.content.parentElement;

        (container!.querySelector(".title") as any).style["background-color"] =
            "rgba(0, 0, 0, 0)";

        return aboutview;
    }

    async getOSBuild(): Promise<string> {
        return (await (await fetch("/MILESTONE")).text()).slice(0, 7);
    }
}
