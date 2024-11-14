interface LibManifest {
    name: string;
    icon: string;
    package: string;
    versions: {
        [key: string]: string;
    };
    installHook?: string;
    cache?: boolean;
    currentVersion: string;
}

class ExternalLib extends Lib {
    source: string;
    manifest: LibManifest;
    // Import caching is optional
    cache: {
        [key: string]: any;
    } = {};
    // The installed libs at the time of the last cache
    // If more libs are installed, the cache is invalidated
    // This is to prevent a race condition where a lib is installed
    // before the dependency is installed
    installedLibs: string[] = [];

    constructor(manifest: LibManifest, source: string) {
        super();
        this.manifest = manifest;
        this.name = manifest.name;
        this.icon = source + "/" + manifest.icon;
        this.source = source;
        this.package = manifest.package;
        this.latestVersion = manifest.currentVersion;

        Object.keys(manifest.versions).forEach((version) => {
            this.versions[version] = source + "/" + manifest.versions[version];
        });

        if (manifest.installHook) {
            import(source + "/" + manifest.installHook).then((module) => {
                module.default(anura, this);
            });
        }
    }
    async getImport(version?: string): Promise<any> {
        if (!version) {
            version = this.latestVersion;
        }
        if (
            this.manifest.cache &&
            this.cache[version] &&
            this.installedLibs === Object.keys(anura.libs)
        ) {
            return this.cache[version];
        }
        if (this.versions[version]) {
            const mod = await import(this.versions[version]);
            if (this.manifest.cache) {
                this.cache[version] = mod;
                this.installedLibs = Object.keys(anura.libs);
            }
            return mod;
        } else {
            throw new Error(
                `Library ${this.name} does not supply version ${version}`,
            );
        }
    }
}
