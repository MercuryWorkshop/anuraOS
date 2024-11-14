class ExploreApp extends App {
    name = "Explore";
    package = "anura.explore";
    icon = "/assets/icons/explore.png";
    hidden = false;

    css = css`
        background-color: var(--theme-bg);
        color: var(--theme-fg);
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: row;

        #sidebar {
            width: 22rem;
            padding: 1rem;
            padding-left: 0;

            & div {
                padding-block: 0.7rem;
                font-size: 1.1rem;
                border-radius: 0 3rem 3rem 0;
                padding-left: 1.25em;
                display: flex;
                align-items: center;
                gap: 0.5rem;
                font-weight: 600;
                width: 100%;

                transition: 0.2s;
            }

            & div.selected {
                color: color-mix(
                    in srgb,
                    var(--theme-accent) 35%,
                    var(--theme-fg)
                );
                background-color: color-mix(
                    in srgb,
                    var(--theme-accent) 30%,
                    transparent
                );
                font-weight: 700;

                transition: 0.15s ease;
            }
        }

        h1 {
            font-size: 2em;
        }

        article {
            width: 100%;
            height: 100%;
            overflow-y: auto;
        }

        a,
        a:link {
            color: var(--theme-accent);
        }

        a:visited {
            color: var(--theme-accent);
        }

        #body {
            font-size: 1.05rem;
            padding: 1rem;
            padding-left: 2rem;

            & p {
                margin-block: 0.5rem;
            }

            & p img {
                width: 1.05rem;
                height: 1.05rem;
                margin-top: 0.5rem;
            }

            & span:has(img) {
                gap: 0.2rem;
                align-items: center;
                font-weight: 600;
            }

            & code {
                background-color: var(--theme-secondary-bg);
                padding: 0.1rem 0.3rem;
                border-radius: 0.2rem;
                font-family: "Roboto Mono", monospace;
            }

            & h2 {
                margin-block: 1.5rem 0;
            }

            & h2:first-of-type {
                margin-block-start: 0.25rem;
            }
        }

        .head {
            display: flex;
            flex-direction: row;

            gap: 1rem;
            align-items: center;

            & img {
                width: 2.5rem;
                height: 2.5rem;
            }
        }

        ::-webkit-scrollbar {
            width: 8px;
        }

        ::-webkit-scrollbar-thumb {
            background-color: var(--theme-secondary-bg);
            border-radius: 8px;
        }

        ::-webkit-scrollbar-button {
            display: none;
        }
    `;

    constructor() {
        super();
    }

    whatsnew = (
        <div id="body">
            <h1>What's new in AnuraOS {anura.version.pretty}?</h1>
            <h2>Themes</h2>
            <p>
                You can now completely customize how Anura looks! Just open the
                <span>
                    <a href="javascript:anura.apps['anura.ui.themeeditor'].open();">
                        <img
                            src="/assets/icons/theme.png"
                            alt="Theme Editor Icon"
                        />{" "}
                        Theme Editor
                    </a>
                </span>
            </p>
            <h2>Support for more platforms</h2>
            <p>
                Anura now supports tablets and phones through the new redesigned
                mobile shell to provide better support to those platforms.
            </p>
            <h2>Overhauled Marketplace</h2>
            <p>
                The Marketplace app has been completely redesigned from the
                ground up for a better experience.
            </p>
            <h2>Task Manager</h2>
            <p>
                A brand new Task Manager app has been added! You can manage
                running apps from there.
            </p>
            <h2>Other</h2>
            <ul>
                <li>A calendar was added to the system tray.</li>
                <li>A quick settings menu was added.</li>
                <li>
                    Various UI elements were reworked to create a more cohesive
                    user experience.
                </li>
                <li>Various bugs were squashed.</li>
                <li>Removed Herobrine.</li>
            </ul>
        </div>
    );

    v86 = (
        <div id="body">
            <h1>Using the x86 Subsystem</h1>
            <p>
                AnuraOS includes an x86 subsystem (based on{" "}
                <a
                    href="javascript:anura.apps['anura.browser'].open(['https://github.com/copy/v86']);" // using dreamland on:click or html onclick makes the link not blue
                >
                    v86
                </a>
                ), which lets you run real Linux within Anura.
                {$if(
                    anura.x86 === undefined,
                    <p>
                        {" "}
                        It seems like you dont have the subsystem enabled. You
                        can install it from{" "}
                        <span>
                            <img
                                src="/assets/icons/settings.png"
                                alt="Settings icon"
                            />{" "}
                            <a href="javascript:anura.apps['anura.settings'].open();">
                                Settings
                            </a>
                        </span>
                        .
                    </p>,
                )}
                {$if(
                    anura.x86 !== undefined,
                    <p>
                        You can open a terminal using the{" "}
                        <span>
                            <img
                                src="/assets/icons/terminal.png"
                                alt="v86 Terminal Icon"
                            />{" "}
                            <a href="javascript:anura.apps['anura.term'].open();">
                                v86 Terminal
                            </a>
                        </span>{" "}
                        app.
                    </p>,
                )}
            </p>
            <p>
                The x86 subsystem is based on an Alpine Linux, a lightweight
                distro commonly used in containers. To install packages, you can
                run <code>apk add &lt;package&gt;</code>.
            </p>
            <p>
                If you want to create a shortcut for an X11 app in the launcher,
                you can do so from{" "}
                <span>
                    <img src="/assets/icons/settings.png" alt="Settings icon" />{" "}
                    <a href="javascript:anura.apps['anura.settings'].open();">
                        Settings
                    </a>
                </span>
                .
            </p>
        </div>
    );

    welcome = (
        <div id="body">
            <div class="head">
                <img src="/icon.png" alt="AnuraOS Logo" />
                <h1>Welcome to AnuraOS!</h1>
            </div>
            <h2>What is AnuraOS?</h2>
            <p>
                AnuraOS is a desktop environment made for development that runs
                right in your browser. It features full Linux emulation and a
                robust app ecosystem.
            </p>
            <h2>Getting Started</h2>
            <p>
                AnuraOS functions just like your average desktop: you can launch
                apps from the launcher (accessible via the button in the
                bottom-left, or pressing the Meta key), drag windows around, and
                pin apps to the taskbar. AnuraOS is visually based off of
                Google's ChromeOS.
            </p>

            <h2>Get new apps</h2>
            <p>
                To install more native Anura apps, you can head to the{" "}
                <span>
                    <img
                        src="/apps/marketplace.app/playstore.webp"
                        alt="Marketplace Icon"
                    />{" "}
                    <a href="javascript:anura.apps['anura.store'].open();">
                        Marketplace
                    </a>
                    .
                </span>
            </p>
            <h2>Customize your experience</h2>
            <p>
                AnuraOS has robust customization features. You can change the
                wallpaper using{" "}
                <span>
                    <a href="javascript:anura.apps['anura.wallpaper'].open();">
                        <img
                            src="/assets/icons/wallpaper.png"
                            alt="Wallpaper Selector Icon"
                        />{" "}
                        Wallpaper Selector
                    </a>
                </span>
                , and change the system colors using{" "}
                <span>
                    <a href="javascript:anura.apps['anura.ui.themeeditor'].open();">
                        <img
                            src="/assets/icons/theme.png"
                            alt="Theme Editor Icon"
                        />{" "}
                        Theme Editor
                    </a>
                </span>
                .
            </p>
            <p>
                For advanced users, Anura will execute any files in the
                /usr/init folder as JavaScript code on boot.
            </p>
        </div>
    );
    state: Stateful<{
        screen?: HTMLElement;
    }> = $state({
        screen: this.welcome,
    });

    page = async () => (
        <div class={this.css}>
            <div id="sidebar">
                <div
                    on:click={() => {
                        this.state.screen = this.welcome;
                    }}
                    class:selected={use(
                        this.state.screen,
                        (sc) => sc === this.welcome,
                    )}
                >
                    <span class="material-symbols-outlined">kid_star</span>
                    Welcome
                </div>
                <div
                    on:click={() => {
                        this.state.screen = this.whatsnew;
                    }}
                    class:selected={use(
                        this.state.screen,
                        (sc) => sc === this.whatsnew,
                    )}
                >
                    <span class="material-symbols-outlined">history</span>
                    What's new
                </div>
                <div
                    on:click={() => {
                        this.state.screen = this.v86;
                    }}
                    class:selected={use(
                        this.state.screen,
                        (sc) => sc === this.v86,
                    )}
                >
                    <span class="material-symbols-outlined">memory</span>
                    x86 Subsystem
                </div>
            </div>
            <article>{use(this.state.screen)}</article>
        </div>
    );

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "Explore AnuraOS",
            width: `calc(${window.innerHeight * 0.6}px * 16 / 10)`, // manually calculating to prevent wonky behaviour on window resize
            height: `${window.innerHeight * 0.6}px`,
        });
        win.content.style.backgroundColor = "var(--theme-bg)";
        win.content.style.color = "var(--theme-fg)";
        win.content.style.height = "calc(100% - 24px)"; // very dirty hack
        win.content.appendChild(await this.page());

        return win;
    }
}
