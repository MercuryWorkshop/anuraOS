class BrowserApp extends App {
    name = "Anura Browser";
    package = "anura.browser";
    icon = "/assets/chrome.svg";
    source: string;
    lib: BrowserLib;
    lastWindow: WMWindow | undefined;

    constructor() {
        super();
        this.lib = new BrowserLib(
            this,
            (path: string, callback: () => void) => {
                const win =
                    this.lastWindow || this.windows[this.windows.length - 1];

                if (typeof win === "undefined") {
                    console.log("No active browser window. Launching new one.");
                    this.open().then((win) => {
                        const iframe = win?.content.querySelector("iframe");
                        iframe?.addEventListener("load", () => {
                            const browserWindow = iframe?.contentWindow;
                            const browserDocument =
                                iframe?.contentDocument ||
                                iframe?.contentWindow?.document;

                            console.log("New browser window", browserDocument);

                            const config = {
                                attributes: true,
                                subtree: true,
                            };

                            const observer = new MutationObserver(
                                (mutationList, observer) => {
                                    for (const mutation of mutationList) {
                                        if (mutation.type === "attributes") {
                                            const target =
                                                mutation.target as HTMLElement;
                                            if (
                                                target.classList.contains(
                                                    "browserContainer",
                                                )
                                            ) {
                                                // Browser Container attributes changed, so the browser has loaded
                                                win?.focus();
                                                //@ts-ignore - aboutbrowser is a global variable
                                                browserWindow.aboutbrowser.openTab(
                                                    path,
                                                );
                                                // Stop observing
                                                observer.disconnect();
                                                callback();
                                            }
                                        }
                                    }
                                },
                            );

                            observer.observe(browserDocument!.body!, config);
                        });
                    });

                    return;
                }
                console.log("Active browser window", win);
                const iframe = win.content.querySelector("iframe");
                const browserWindow = iframe?.contentWindow;
                win.focus();
                // @ts-ignore
                browserWindow.aboutbrowser.openTab(path);
                callback();
            },
        );
        anura.registerLib(this.lib);
    }
    async open(args: string[] = []): Promise<WMWindow | undefined> {
        if (args.length > 0) {
            const browser = await anura.import("anura.libbrowser");

            const openTab = (path: string) =>
                new Promise((resolve) => {
                    browser.openTab(path, resolve);
                });

            for (const arg of args) {
                await openTab(arg);
            }
            return;
        }

        const browser = anura.wm.create(
            this,
            {
                title: "",
                width: "700px",
                height: "500px",
            },
            null,
            null,
            () => {
                if (this.lastWindow == browser) {
                    this.lastWindow = undefined;
                }
            },
        );
        // Set the last active window to this one, as it was just opened
        this.lastWindow = browser;

        const iframe = document.createElement("iframe");
        //@ts-ignore
        iframe.style =
            "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
        iframe.setAttribute("src", "../../browser.html");

        iframe.addEventListener("load", () => {
            // On interaction with the iframe, set the last active window to this one
            const doc =
                iframe.contentDocument || iframe.contentWindow?.document;
            doc?.addEventListener("click", () => {
                console.log("Active browser window", this.lastWindow);
                this.lastWindow = browser;
                console.log("New active browser window", this.lastWindow);
            });
        });

        browser.content.appendChild(iframe);

        if (anura.settings.get("borderless-aboutbrowser")) {
            // make borderless
            browser.content.style.position = "absolute";
            browser.content.style.height = "100%";
            browser.content.style.display = "inline-block";

            const container = browser.content.parentElement;

            (container!.querySelector(".title") as any).style[
                "background-color"
            ] = "rgba(0, 0, 0, 0)";
        }

        return browser;
    }
}
