// Depends on Settings.ts, must be loaded AFTER

class FilesAPI {
    open = async function (path: string) {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            console.log(`Opening ${path} with ${handler}`);
            if (handler.handler_type === "module") {
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
                return;
            }
            if (handler.handler_type === "cjs") {
                // Legacy handler, eval it
                eval(
                    (await (await fetch(handler.path)).text()) +
                        `openFile(${JSON.stringify(path)})`,
                ); // here, JSON.stringify is used to properly escape the string
                return;
            }
        }
    };
    set(path: string, extension: string) {
        const extHandlers = anura.settings.get("FileExts") || {};
        extHandlers[extension] = {
            handler_type: "cjs",
            path,
        };
        anura.settings.set("FileExts", extHandlers);
    }
    setModule(id: string, extension: string) {
        const extHandlers = anura.settings.get("FileExts") || {};
        extHandlers[extension] = {
            handler_type: "module",
            id,
        };
        anura.settings.set("FileExts", extHandlers);
    }
}
