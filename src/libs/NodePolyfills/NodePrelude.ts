// This polyfill provides the globals that are expected to be available
// in a Node.js environment, but are not available in a browser environment.
class NodePrelude extends Lib {
    icon = "/assets/icons/generic.svg";
    package = "node:prelude";
    name = "Node Prelude";

    versions: { [key: string]: any } = {
        "1.0.0": {
            Buffer: Filer.Buffer,
            process: {
                argv: [],
                env: {},
                cwd: () => "/",
                chdir: () => {},
            },
            require: (name: string) => {
                throw new Error(`Cannot find module '${name}'`);
            },
            _import: anura.import,
        },
    };
    latestVersion = "1.0.0";

    async getImport(version: string): Promise<any> {
        return this.versions[version] || this.versions[this.latestVersion];
    }
}
