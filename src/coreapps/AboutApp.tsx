class AboutApp extends App {
    name = "About Anura";
    package = "anura.about";
    icon = "/assets/icons/aboutapp.png";

    page = async () => (
        <div class="aboutapp-container">
            <div class="aboutapp-logo">
                <div
                    class="aboutapp-logo-img"
                    title="離れ離れ街を繋ぐ列車は行ってしまったね.."
                ></div>
            </div>
            <div class="aboutapp-logo-divider"></div>
            <div class="aboutapp-content">
                <p>AnuraOS</p>
                <p>
                    Version {anura.version.codename} ({anura.version.pretty})
                    (OS build {await this.getOSBuild()})
                </p>
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

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        let fullscreenEasterEgg = false;

        if (args.length > 0) {
            if (args.includes("fullscreen-easter-egg")) {
                fullscreenEasterEgg = true;
            }
            if (args.includes("fuller-screen-easter-egg")) {
                // You asked for it
                document.body.style.background =
                    "url(/assets/images/lagtrain.gif) no-repeat center center fixed";

                anura.wm.windows.forEach((win) => {
                    // No animation
                    win.deref()!.element.style.display = "none";
                    win.deref()!.close();
                });

                taskbar.element.remove();

                document.title = "Lagtrain";

                const icon = document.querySelector(
                    "link[rel~='icon']",
                )! as HTMLLinkElement;

                icon.type = "image/gif";
                icon.href = "/assets/images/lagtrain.gif";

                return;
            }
        }

        const aboutview = anura.wm.create(this, {
            title: "",
            width: "400px",
            height: fullscreenEasterEgg ? "400px" : "450px",
            resizable: false,
        });

        if (fullscreenEasterEgg) {
            aboutview.content.appendChild(
                <div style="background: url(/assets/images/lagtrain.gif); width: 100%; height: 100%; background-size: contain; background-repeat: no-repeat;"></div>,
            );
        } else {
            aboutview.content.appendChild(await this.page());
        }

        // make borderless
        aboutview.content.style.position = "absolute";
        aboutview.content.style.height = "100%";
        aboutview.content.style.display = "inline-block";

        const container = aboutview.content.parentElement;

        (container!.querySelector(".title") as any).style["background-color"] =
            "rgba(0, 0, 0, 0)";

        return aboutview;
    }

    getOSBuild(): string {
        return anura.settings.get("milestone").slice(0, 7);
    }
}
