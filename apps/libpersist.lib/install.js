export default function install(anura) {
    const directories = anura.settings.get("directories");

    anura.fs.exists(directories["opt"] + "/anura.persistence", (exists) => {
        if (exists) return;
        anura.fs.mkdir(directories["opt"] + "/anura.persistence");
        anura.fs.mkdir(directories["opt"] + "/anura.persistence/providers");
        anura.fs.mkdir(
            directories["opt"] + "/anura.persistence/providers/anureg",
        );

        anura.fs.writeFile(
            directories["opt"] +
                "/anura.persistence/providers/anureg/manifest.json",
            JSON.stringify({
                name: "anureg",
                vendor: "[[internal]]",
                description:
                    "Anura's default persistance provider, using a simple JSON file",
                handler: "index.js",
            }),
        );

        anura.fs.writeFile(
            directories["opt"] + "/anura.persistence/providers/anureg/index.js",
            `const { PersistenceProvider } = await anura.import("anura.persistence");
export default class Anureg extends PersistenceProvider {
    cache = {};
    fs;
    basepath;
    file;
    config;

    constructor(anura, config, fs, basepath) {
        super(anura);
        this.fs = fs;
        this.basepath = basepath;
        this.config = config;
        this.file = config.path || (this.basepath + (config.filename || "/settings.json"));
    }

    async init() {
        this.fs.exists(this.basepath, async (exists) => {
            if (!exists) {
                await this.fs.promises.mkdir(this.basepath);
            }
        });
        try {
            const text = await this.fs.promises.readFile(this.file);
            this.cache = JSON.parse(text);
        }
        catch (e) {
            this.fs.writeFile(this.file, JSON.stringify(this.cache));
        }
    }

    async get(prop) {
        return this.cache[prop];
    }

    async has(prop) {
        return prop in this.cache;
    }

    async set(prop, val) {
        this.cache[prop] = val;
        return new Promise((r) => this.fs.writeFile(this.file, JSON.stringify(this.cache), r));
    }

    createStoreFn(stateful, win) {
        return async (
            target,
            ident,
            _backing
        ) => {
            target = (await this.get("dreamland." + ident)) || target;

            win.addEventListener("close", () => {
                console.info("[dreamland.js]: saving " + ident);
                this.set("dreamland." + ident, target);
            });
            
            return stateful(target);
        }
    }
}
export const using = ["fs", "basepath"];
export const lifecycle = ["init"];`,
        );
    });
}
