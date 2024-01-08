// Depends on Settings.ts, must be loaded AFTER

class FilesAPI {
    open = async function (path: string) {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            console.log(`Opening ${path} with ${handler}`);
            if (typeof handler === "string") {
                // Legacy handler, eval it
                eval(
                    (await (await fetch(handler)).text()) +
                        `openFile(${JSON.stringify(path)})`,
                ); // here, JSON.stringify is used to properly escape the string
                return;
            }
            // New handler, use dynamic import
            const handlerModule = await anura.import(handler.id);
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
    // Handler is either a string (legacy) or an object with an id. This is to prevent a breaking change
    set(pkg: string | { id: string }, extension: string) {
        const extHandlers = anura.settings.get("FileExts") || {};
        extHandlers[extension] = pkg;
        anura.settings.set("FileExts", extHandlers);
    }
}
