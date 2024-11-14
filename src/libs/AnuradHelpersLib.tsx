namespace AnuradHelpers {
    /**
     * This array will be updated at runtime as anura api's are registered
     */
    const apis: string[] = [];
    /**
     * This array will be updated at runtime as anura stages are completed
     * and init scripts are started
     */
    const stages: string[] = [];

    const apiListeners: { [key: string]: ((_?: void) => void)[] } = {};
    const stageListeners: { [key: string]: ((_?: void) => void)[] } = {};

    /**
     * Notify all init scripts that an api is ready
     */
    export function setReady(api: string) {
        if (!apis.includes(api)) {
            apis.push(api);
        }
        if (apiListeners[api]) {
            apiListeners[api]!.forEach((listener) => listener());
        }
    }

    /**
     * Notify all init scripts that a stage has been completed
     */
    export function setStage(stage: string) {
        if (!stages.includes(stage)) {
            stages.push(stage);
        }
        if (stageListeners[stage]) {
            stageListeners[stage]!.forEach((listener) => listener());
        }
    }

    /**
     * Wait for an api to be ready
     */
    export async function need(api: string) {
        if (apis.includes(api)) {
            return;
        }
        return new Promise((resolve) => {
            if (!apiListeners[api]) {
                apiListeners[api] = [];
            }
            apiListeners[api]!.push(resolve);
        });
    }

    /**
     * Wait for a stage to be completed
     */
    export async function after(stage: string) {
        if (stages.includes(stage)) {
            return;
        }
        return new Promise((resolve) => {
            if (!stageListeners[stage]) {
                stageListeners[stage] = [];
            }
            stageListeners[stage]!.push(resolve);
        });
    }
}

class AnuradHelpersLib extends Lib {
    icon = "/assets/icons/generic.svg";
    package = "anura.daemon.helpers";
    name = "Anurad Helpers";

    versions: { [key: string]: any } = {
        "0.1.0": AnuradHelpers,
    };
    latestVersion = "0.1.0";

    async getImport(version: string): Promise<any> {
        if (!version) version = this.latestVersion;
        if (!this.versions[version]) {
            throw new Error("Version not found");
        }
        return this.versions[version];
    }
}
