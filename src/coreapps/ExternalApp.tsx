class ExternalApp extends App {
    manifest: AppManifest;
    source: string;
    icon = "/assets/icons/generic.png";

    constructor(manifest: AppManifest, source: string) {
        super();
        this.manifest = manifest;
        this.name = manifest.name;
        if (manifest.icon) {
            this.icon = source + "/" + manifest.icon;
        }
        this.source = source;
        this.package = manifest.package;
        this.hidden = manifest.hidden || false;
    }

    static serializeArgs(args: string[]): string {
        const encoder = new TextEncoder();
        const encodedValues = args.map((value) => {
            const bytes = encoder.encode(value);
            const binString = String.fromCodePoint(...bytes);
            return btoa(binString);
        });
        return encodeURIComponent(encodedValues.join(","));
    }

    static deserializeArgs(args: string): string[] {
        const decoder = new TextDecoder("utf-8");
        return decodeURIComponent(args)
            .split(",")
            .map((value) => {
                const binString = atob(value);
                return decoder.decode(
                    Uint8Array.from(binString, (c) => c.charCodeAt(0)),
                );
            });
    }

    async open(args: string[] = []): Promise<WMWindow | undefined> {
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
            iframe.setAttribute(
                "src",
                `${this.source}/${this.manifest.index}${this.manifest.index?.includes("?") ? "&" : "?"}args=${ExternalApp.serializeArgs(args)}`,
            );
            win.content.appendChild(iframe);

            Object.assign(iframe.contentWindow as any, {
                anura,
                AliceWM,
                ExternalApp,
                LocalFS,
                instance: this,
                instanceWindow: win,
            });

            const matter = document.createElement("link");
            matter.setAttribute("rel", "stylesheet");
            matter.setAttribute("href", "/assets/matter.css");
            const dreamlandjs = document.createElement("script");
            dreamlandjs.setAttribute("src", "/vendor/alice.js");
            iframe.contentDocument!.head.appendChild(dreamlandjs);

            iframe.contentWindow!.addEventListener("load", () => {
                iframe.contentDocument!.head.appendChild(matter);
            });

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
