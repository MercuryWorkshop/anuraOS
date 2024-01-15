// Depends on Settings.ts, must be loaded AFTER

class FilesAPI {
    // This is the fallback icon that will be used if no handler is found and no default handler is set.
    // This should almost never be used, as it is a fallback for the fallback. It is here just in case.
    fallbackIcon = "/missing_icon.svg";

    // Folder icon
    folderIcon = "/missing_icon.svg";

    open = async function (path: string): Promise<void> {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            console.log(`Opening ${path} with ${handler}`);
            if (handler.handler_type === "module") {
                const handlerModule = await anura.import(handler.id);
                if (!handlerModule) {
                    console.log(`Failed to load handler ${handler}`);
                    await this.defaultOpen(path);
                    return;
                }
                if (!handlerModule.openFile) {
                    console.log(
                        `Handler ${handler} does not have an openFile function`,
                    );
                    await this.defaultOpen(path);
                    return;
                }
                return handlerModule.openFile(path);
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
        // If no handler is found, try the default handler
        await this.defaultOpen(path);
        return;
    };

    async defaultOpen(path: string): Promise<void> {
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers["default"]) {
            const handler = extHandlers["default"];
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
    }

    getIcon = async function (path: string) {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            if (handler.handler_type === "module") {
                const handlerModule = await anura.import(handler.id);
                if (!handlerModule) {
                    console.log(`Failed to load handler ${handler}`);
                    return await this.defaultIcon(path);
                }
                if (!handlerModule.getIcon) {
                    console.log(
                        `Handler ${handler} does not have an getIcon function`,
                    );
                    return await this.defaultIcon(path);
                }
                return handlerModule.getIcon(path);
            }
            if (handler.handler_type === "cjs") {
                // Legacy handler, eval it
                return eval(
                    (await (await fetch(handler.path)).text()) +
                        `if (getIcon) {
                            getIcon(${JSON.stringify(path)})
                        } else {
                            ${JSON.stringify(await this.defaultIcon(path))}
                        }`,
                ); // here, JSON.stringify is used to properly escape the string
            }
        }
        // If no handler is found, try the default handler
        return await this.defaultIcon(path);
    };

    async defaultIcon(path: string) {
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers["default"]) {
            const handler = extHandlers["default"];
            if (handler.handler_type === "module") {
                const handlerModule = await anura.import(handler.id);
                if (!handlerModule) {
                    console.log(`Failed to load handler ${handler}`);
                    return this.fallbackIcon;
                }
                if (!handlerModule.getIcon) {
                    console.log(
                        `Handler ${handler} does not have an getIcon function`,
                    );
                    return this.fallbackIcon;
                }
                return handlerModule.getIcon(path);
            }
            if (handler.handler_type === "cjs") {
                // Legacy handler, eval it
                return eval(
                    (await (await fetch(handler.path)).text()) +
                        `if (getIcon) {
                            getIcon(${JSON.stringify(path)})
                        } else {
                            ${JSON.stringify(this.fallbackIcon)}
                        }`,
                ); // here, JSON.stringify is used to properly escape the string
            }
        }
        return this.fallbackIcon;
    }

    async getFileType(path: string) {
        const ext = path.split("/").pop()!.split(".").pop();
        const extHandlers = anura.settings.get("FileExts") || {};
        if (extHandlers[ext!]) {
            const handler = extHandlers[ext!];
            if (handler.handler_type === "module") {
                const handlerModule = await anura.import(handler.id);
                if (!handlerModule) {
                    console.log(`Failed to load handler ${handler}`);
                    return "Anura File";
                }
                if (!handlerModule.getFileType) {
                    console.log(
                        `Handler ${handler} does not have an getFileType function`,
                    );
                    return "Anura File";
                }
                return handlerModule.getFileType(path);
            }
            if (handler.handler_type === "cjs") {
                // Legacy handler, eval it
                return eval(
                    (await (await fetch(handler.path)).text()) +
                        `if (getFileType) {
                            getFileType(${JSON.stringify(path)})
                        } else {
                            "Anura File"
                        }`,
                ); // here, JSON.stringify is used to properly escape the string
            }
        }
        // If no handler is found, return "Anura File"
        return "Anura File";
    }

    setFolderIcon(path: string) {
        this.folderIcon = path;
    }

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
