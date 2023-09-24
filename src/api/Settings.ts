class Settings {
    private cache: { [key: string]: any } = {};
    fs: FilerFS;
    private constructor(fs: FilerFS, inital: { [key: string]: any }) {
        this.fs = fs;
        this.cache = inital;

        navigator.serviceWorker.ready.then((isReady) => {
            isReady.active!.postMessage({
                anura_target: "anura.cache",
                value: this.cache["use-sw-cache"],
            });
            isReady.active!.postMessage({
                anura_target: "anura.bareurl",
                value: this.cache["bare-url"],
            });
            console.log(
                "ANURA-SW: For this boot, cache will be " +
                    (this.cache["use-sw-cache"] ? "enabled" : "disabled"),
            );
        });
    }

    static async new(fs: FilerFS, defaultsettings: { [key: string]: any }) {
        const initial = defaultsettings;

        if (!initial["wsproxy-url"]) {
            let url = "";
            if (location.protocol == "https:") {
                url += "wss://";
            } else {
                url += "ws://";
            }
            url += window.location.origin.split("://")[1];
            url += "/";
            initial["wsproxy-url"] = url;
        }

        if (!initial["bare-url"]) {
            initial["bare-url"] = location.origin + "/bare/";
        }
        if (!initial["relay-url"]) {
            alert("figure this out later");
        }

        try {
            const text = await fs.promises.readFile("/anura_settings.json");
            Object.assign(initial, JSON.parse(text));
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
    async set(prop: string, val: any) {
        this.cache[prop] = val;
        return new Promise((r) =>
            this.fs.writeFile(
                "/anura_settings.json",
                JSON.stringify(this.cache),
                r,
            ),
        );
    }
}
