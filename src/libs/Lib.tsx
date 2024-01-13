class Lib {
    icon: string;
    package: string;
    name: string;

    versions: { [key: string]: any } = {};
    latestVersion: string;

    async getImport(version: string): Promise<any> {}
}
