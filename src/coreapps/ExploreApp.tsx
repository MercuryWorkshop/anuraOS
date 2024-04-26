class ExploreApp extends App {
    hidden = false;
    constructor() {
        super();
        this.name = "Explore";
        this.icon = "/assets/icons/explore2.png";
        this.package = "anura.explore";
    }

    css = css`
        background-color: var(--theme-bg);
        color: var(--theme-fg);
        height: 100%;

        a,
        a:visited {
            color: var(--theme-accent);
        }

        #body {
            font-size: 1.05rem;
            padding: 1rem;

            p {
                margin-block: 0.5rem 0.8rem;
            }

            p img {
                width: 1.05rem;
                height: 1.05rem;
                margin-top: 0.5rem;
            }

            span:has(img) {
                /* display: flex; */
                gap: 0.2rem;
                align-items: center;
                font-weight: 600;
            }

            code {
                background-color: var(--theme-secondary-bg);
                padding: 0.1rem 0.3rem;
                border-radius: 0.2rem;
                font-family: "Roboto Mono", monospace;
            }

            h2 {
                margin-block: 1.25rem 0;
            }
        }

        .head {
            display: flex;
            flex-direction: row;

            gap: 1rem;
            align-items: center;

            img {
                width: 2.5rem;
                height: 2.5rem;
            }
        }
    `;

    page = async () => (
        <div class={this.css}>
            <div id="body">
                <div class="head">
                    <img src="/icon.png" alt="AnuraOS Logo" />
                    <h1>Welcome to AnuraOS!</h1>
                </div>
                <h2>Getting Started</h2>
                <p>
                    AnuraOS functions just like your average desktop: you can
                    launch apps from the launcher (accessible via the button in
                    the bottom-left, or pressing the Meta key), drag windows
                    around, and pin apps to the taskbar. AnuraOS is visually
                    based off of Google's ChromeOS.
                </p>
                <h2>Using the x86 Subsystem</h2>
                <p>
                    AnuraOS includes an x86 subsystem (based on{" "}
                    <a href="https://github.com/copy/v86">v86</a>), which lets
                    you run real Linux within Anura.
                    {$if(
                        use(anura.x86) == undefined,
                        <p>
                            {" "}
                            It seems like you dont have the subsystem enabled.
                            You can install it from{" "}
                            <span>
                                <img
                                    src="/assets/icons/settings.png"
                                    alt="Settings icon"
                                />{" "}
                                Settings
                            </span>
                            .
                        </p>,
                    )}
                </p>
                <p>
                    You can open a terminal using the{" "}
                    <span>
                        <img
                            src="/assets/icons/terminal.png"
                            alt="v86 Terminal Icon"
                        />{" "}
                        v86 Terminal
                    </span>{" "}
                    app.
                </p>
                <p>
                    The x86 subsystem is based on an Alpine Linux, a lightweight
                    distro commonly used in containers. To install packages, you
                    can run <code>apk add &lt;package&gt;</code>.
                </p>
                <h2>Get new apps</h2>
                <p>
                    To install more native Anura apps, you can head to the{" "}
                    <img
                        src="/apps/marketplace.app/playstore.webp"
                        alt="Marketplace Icon"
                    />{" "}
                    Marketplace.
                </p>
                <h2>Customize your experience</h2>
                <p>
                    AnuraOS has robust customization features. You can change
                    the wallpaper using{" "}
                    <span>
                        <img
                            src="/assets/icons/wallpaper.png"
                            alt="Wallpaper Selector Icon"
                        />{" "}
                        Wallpaper Selector
                    </span>
                    , and change the system colors using{" "}
                    <span>
                        <img
                            src="/assets/icons/themeeditor.png"
                            alt="Theme Editor Icon"
                        />{" "}
                        Theme Editor
                    </span>
                    .
                </p>
                <p>
                    For advanced users, Anura will execute any files in the
                    /init folder as JavaScript code on boot.
                </p>
            </div>
        </div>
    );

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "Explore AnuraOS",
            width: "910px",
            height: "720px",
        });
        win.content.style.overflowY = "auto";
        win.content.style.backgroundColor = "var(--theme-bg)";
        win.content.appendChild(await this.page());

        return win;
    }
}
