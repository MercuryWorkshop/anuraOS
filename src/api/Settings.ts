class Settings {
    private cache: { [key: string]: any } = {};
    fs: AnuraFilesystem;
    private constructor(fs: AnuraFilesystem, inital: { [key: string]: any }) {
        this.fs = fs;
        this.cache = inital;

        navigator.serviceWorker.ready.then((isReady) => {
            isReady.active!.postMessage({
                anura_target: "anura.cache",
                value: this.cache["use-sw-cache"],
            });
            console.log(
                "ANURA-SW: For this boot, cache will be " +
                    (this.cache["use-sw-cache"] ? "enabled" : "disabled"),
            );
        });
    }

    static async new(
        fs: AnuraFilesystem,
        defaultsettings: { [key: string]: any },
    ) {
        const initial = defaultsettings;

        if (!initial["wisp-url"]) {
            let url = "";
            if (location.protocol == "https:") {
                url += "wss://";
            } else {
                url += "ws://";
            }
            url += window.location.origin.split("://")[1];
            url += "/";
            initial["wisp-url"] = url;
        }

        if (!initial["bare-url"]) {
            initial["bare-url"] = location.origin + "/bare/";
        }

        if (!initial["relay-url"]) {
            alert("figure this out later");
        }

        if (!initial["theme"]) {
            initial["theme"] = new Theme();
        }

        try {
            const raw = await fs.promises.readFile("/anura_settings.json");
            // JSON.parse supports Uint8Array, but for some reason typescript doesn't know that???
            Object.assign(initial, JSON.parse(raw as any));
        } catch (e) {
            fs.writeFile("/anura_settings.json", JSON.stringify(initial));
        }

        return new Settings(fs, initial);
    }

    get(prop: string): any {
        return this.cache[prop];
    }
    has(prop: string): boolean {
        return prop in this.cache;
    }
    async set(prop: string, val: any, subprop?: string) {
        if (subprop) {
            this.cache[prop][subprop] = val;
        } else {
            this.cache[prop] = val;
        }
        await this.fs.promises.writeFile(
            "/anura_settings.json",
            JSON.stringify(this.cache),
        );
    }
    async remove(prop: string, subprop?: string) {
        if (subprop) {
            delete this.cache[prop][subprop];
        } else {
            delete this.cache[prop];
        }
        await this.fs.promises.writeFile(
            "/anura_settings.json",
            JSON.stringify(this.cache),
        );
    }
}
