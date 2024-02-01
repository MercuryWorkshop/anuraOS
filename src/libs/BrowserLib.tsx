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
    }

    async getImport(version?: string): Promise<any> {
        return this.versions[version || this.latestVersion];
    }
}
