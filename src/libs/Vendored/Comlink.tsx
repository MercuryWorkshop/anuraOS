// This provides the Comlink library through the anura libs system, rather than the
class Comlink extends Lib {
    icon = "/assets/icons/generic.svg";
    package = "npm:comlink";
    name = "Comlink";

    src = "/libs/comlink/comlink.min.mjs";

    versions: { [key: string]: any } = {};
    latestVersion = "0.0.0";

    async getImport(version?: string): Promise<any> {
        if (this.latestVersion === "0.0.0") {
            this.latestVersion = await (
                await fetch("/libs/comlink/version")
            ).json();
            this.versions[this.latestVersion] = await import(this.src);
        }
        if (!version) {
            version = this.latestVersion;
        }

        if (!this.versions[version]) {
            throw new Error("Version not found");
        }
        return this.versions[version];
    }
}
