class XAppStub extends App {
    command: string;
    constructor(
        name: string,
        packageIdent: string,
        icon: string,
        command: string,
    ) {
        super();
        this.name = name;
        this.package = packageIdent;
        this.icon = icon || "/assets/icons/xfrog.png";
        this.command = command;
    }
    async open() {
        anura.x86?.runcmd(this.command);
        anura.x86?.screen_container.remove();
    }
}
