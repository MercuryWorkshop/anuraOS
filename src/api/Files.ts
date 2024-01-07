// Depends on Settings.ts, must be loaded AFTER

class FilesAPI {
    open = async function (path: string) {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            console.log(`Opening ${path} with ${handler}`);
            const handlerModule = await anura.import(handler);
            if (!handlerModule) {
                console.log(`Failed to load handler ${handler}`);
                return;
            }
            if (!handlerModule.openFile) {
                console.log(
                    `Handler ${handler} does not have an openFile function`,
                );
                return;
            }
            handlerModule.openFile(path);
        }
    };

    set(pkg: string, extension: string) {
        const extHandlers = anura.settings.get("FileExts") || {};
        extHandlers[extension] = pkg;
        anura.settings.set("FileExts", extHandlers);
    }
}
