class GenericApp extends App {
    hidden = true;
    constructor() {
        super();
        this.name = "Generic App";
        this.icon = "/assets/icons/generic.png";
        this.package = "anura.generic";
    }

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        alert(
            "This app is not supposed to be opened as it is a placeholder for other apps.",
        );
        return;
    }
}
