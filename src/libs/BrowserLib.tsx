// This lib is used to communicate with the browser app. It is registered manually in the browser app.
class BrowserLib extends Lib {
    name = "Anura Browser Lib";
    package = "anura.libbrowser";
    icon = "/assets/chrome.svg";

    events: {
        openTab?: (path: string, callback?: () => void) => void;
    } = {};

    constructor(
        app: BrowserApp,
        openTabEvent: (path: string, callback?: () => void) => void,
    ) {
        super();
        this.events.openTab = openTabEvent;
        this.versions["1.0.0"] = this.events;
        this.latestVersion = "1.0.0";
        if (!anura.uri.has("http")) {
            anura.uri.set("http", {
                handler: {
                    tag: "lib",
                    pkg: this.package,
                    version: this.latestVersion,
                    import: "openTab",
                },
                prefix: "http:",
            });
        }
        if (!anura.uri.has("https")) {
            anura.uri.set("https", {
                handler: {
                    tag: "lib",
                    pkg: this.package,
                    version: this.latestVersion,
                    import: "openTab",
                },
                prefix: "https:",
            });
        }
    }

    async getImport(version?: string): Promise<any> {
        return this.versions[version || this.latestVersion];
    }
}
