class NodeFS extends Lib {
    icon = "/assets/icons/generic.svg";
    package = "node:fs";
    name = "Node Filesystem";

    versions: { [key: string]: AnuraFilesystem } = {
        "1.0.0": anura.fs,
    };
    latestVersion = "1.0.0";

    async getImport(version: string): Promise<any> {
        return this.versions[version] || this.versions[this.latestVersion];
    }
}
