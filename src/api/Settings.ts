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
                (this.cache["use-sw-cache"] ? "enabled" : "disabled") +
                "bare-url will be set to " + this.cache["bare-url"],
            );
        });
    }

    static defaultSettings() {
        return {
            applist: [],
        };
    }
    static async new(fs: FilerFS) {
        const initial = this.defaultSettings();
        try {
            const text = await fs.readFileSync("/anura_settings.json");
            Object.assign(initial, JSON.parse(text));
        } catch (e) {
            console.error(e);
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
