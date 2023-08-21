// Depends on Settings.ts, must be loaded AFTER

class FilesAPI {
    open = async function (path: string) {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            eval(
                (await (await fetch(handler)).text()) +
                    `openFile(${JSON.stringify(path)})`,
            ); // here, JSON.stringify is used to properly escape the string
        }
    };

    set(path: string, extension: string) {
        const extHandlers = anura.settings.get("FileExts") || {};
        extHandlers[extension] = path;
        anura.settings.set("FileExts", extHandlers);
    }
}
