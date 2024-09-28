class App {
    name: string;
    package: string;
    icon: string;
    /**
     * This should be set to false by default because apps should
     * only be hidden if there is an explicit reason to do so
     */
    hidden = false;
    windows: WMWindow[] = [];
    open(args: string[] = []): void {}
}
