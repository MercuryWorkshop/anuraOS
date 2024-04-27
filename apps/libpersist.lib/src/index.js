/**
 * @typedef Anura
 * @type {any}
 */

/**
 * Base class for persisting data
 * This class is meant to be extended
 * by a specific implementation, such as
 * Anureg. It is not meant to be manually
 * used, however it can technically be
 * used as a memory-based cache. However,
 * this is mostly useless as the cache
 * is not actually persisted.
 */
export class PersistenceProvider {
    cache = {};

    constructor(anura) {
        this.anura = anura;
    }

    async init() {
        console.log("init");
    }

    async get(prop) {
        return this.cache[prop];
    }

    async has(prop) {
        return prop in this.cache;
    }

    async set(prop, val) {
        this.cache[prop] = val;
    }

    createStoreFn(_stateful, _win) {
        return function () {
            // Not implemented for generic provider
            throw new Error("Not implemented");
        };
    }

    toProxy() {
        return new Proxy(this, {
            get: (target, prop) => {
                return target.get(prop);
            },
            set: (target, prop, val) => {
                target.set(prop, val);
                return true;
            },
        });
    }
}

export class ProviderLoader {
    fs;
    anura;
    basepath;

    constructor(anura, fs, basepath) {
        this.fs = fs;
        this.anura = anura;
        this.basepath = basepath;

        this.providers = {};
    }

    async locate() {
        const providers = await this.fs.promises.readdir(this.basepath);
        for (const provider of providers) {
            const manifest = JSON.parse(
                await this.fs.promises.readFile(
                    this.basepath + "/" + provider + "/manifest.json",
                ),
            );
            let mod = await import(
                "/fs/" + this.basepath + "/" + provider + "/" + manifest.handler
            );
            this.providers[manifest.name] = {
                manifest,
                mod,
            };
        }
    }

    /**
     * Build a new persistenceProvider
     * @param {Anura} anura - The Anura instance
     * @param {Object} app - The app instance
     * @param {Object} config - The configuration object
     * @param {string} provider - The provider name
     * @returns {PersistenceProvider} The provider
     */
    async build(app, config = {}, provider = "anureg") {
        let args = [config, this.anura];
        let using = this.providers[provider].mod.using || [];
        let lifecycle = this.providers[provider].mod.lifecycle || [];
        for (let i = 0; i < using.length; i++) {
            switch (using[i]) {
                case "fs":
                    args.push(this.fs);
                    break;
                case "basepath":
                    args.push(
                        this.anura.settings.get("directories")["opt"] +
                            "/" +
                            app.package,
                    );
                    break;
                default:
                    throw new Error("Unknown dependency: " + using[i]);
            }
        }
        let providerInstance = new this.providers[provider].mod.default(
            ...args,
        );
        if (lifecycle.includes("init")) {
            await providerInstance.init();
        }
        return providerInstance;
    }
}

export function buildLoader(anura, basepath) {
    if (!basepath) {
        basepath =
            anura.settings.get("directories")["opt"] +
            "/anura.persistence/providers";
    }
    return new ProviderLoader(anura, anura.fs, basepath);
}
