class ExternalApp extends App {
    manifest: AppManifest;
    source: string;

    constructor(manifest: AppManifest, source: string) {
        super();
        this.manifest = manifest;
        this.name = manifest.name;
        this.icon = source + "/" + manifest.icon;
        this.source = source;
        this.package = manifest.package;
    }
    async open(): Promise<WMWindow | undefined> {
        //  TODO: have a "allowmultiinstance" option in manifest? it might confuse users, some windows open a second, some focus
        // if (this.windowinstance) return;
        if (this.manifest.type === "auto") {
            const win = anura.wm.create(this, this.manifest.wininfo as object);

            const iframe = document.createElement("iframe");
            // CSS injection here but it's no big deal
            const bg = this.manifest.background || "#202124";
            iframe.setAttribute(
                "style",
                "top:0; left:0; bottom:0; right:0; width:100%; height:100%; " +
                    `border: none; margin: 0; padding: 0; background-color: ${bg};`,
            );
            console.log(this.source);
            iframe.setAttribute("src", `${this.source}/${this.manifest.index}`);
            win.content.appendChild(iframe);

            (iframe.contentWindow as any).anura = anura;
            (iframe.contentWindow as any).AliceWM = AliceWM;

            return win;
        } else {
            // This type of application is reserved only for scripts meant for hacking anura internals
            const req = await fetch(`${this.source}/${this.manifest.handler}`);
            const data = await req.text();
            top!.window.eval(data);
            // @ts-ignore
            loadingScript(this.source, this);

            taskbar.updateTaskbar();
            alttab.update();

            return;
        }
    }
}
