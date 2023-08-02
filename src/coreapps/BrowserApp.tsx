class BrowserApp extends App {
    name = "Anura Browser";
    package = "anura.browser";
    icon = "/assets/chrome.svg";
    source: string;

    constructor() {
        super();
    }
    async open(): Promise<WMWindow | undefined> {
        const browser = anura.wm.create(this, {
            title: "",
            width: "700px",
            height: "500px",
        });
        const iframe = document.createElement("iframe");
        //@ts-ignore
        iframe.style =
            "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
        iframe.setAttribute("src", "../../browser.html");
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
