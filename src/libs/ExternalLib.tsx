interface LibManifest {
    name: string;
    icon: string;
    package: string;
    versions: {
        [key: string]: string;
    };
    installHook?: string;
    currentVersion: string;
}

class ExternalLib extends Lib {
    source: string;
    manifest: LibManifest;

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
            console.log(this.versions[version]);
        });

        if (manifest.installHook) {
            import(source + "/" + manifest.installHook).then((module) => {
                module.default(anura);
            });
        }
    }
    async getImport(version?: string): Promise<any> {
        if (!version) {
            version = this.latestVersion;
        }
        if (this.versions[version]) {
            return await import(this.versions[version]);
        } else {
            throw new Error(
                `Library ${this.name} does not supply version ${version}`,
            );
        }
    }
}
