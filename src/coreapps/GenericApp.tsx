class GenericApp extends App {
    name = "Generic App";
    package = "anura.generic";
    icon = "/assets/icons/generic.svg";
    hidden = true;
    constructor() {
        super();
    }

    async open(args: string[] = []): Promise<WMWindow | undefined> {
        anura.dialog.alert(
            "This app is not supposed to be opened as it is a placeholder for other apps.",
        );
        return;
    }
}
