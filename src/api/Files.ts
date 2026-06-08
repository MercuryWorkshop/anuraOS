// Depends on Settings.ts, must be loaded AFTER

/**
 * Provides access to Anura's file service. Useful for handling the opening of
 * files and registering file handlers.
 *
 * Available globally as `anura.files`.
 */
class FilesAPI {
	// This is the fallback icon that will be used if no handler is found and no default handler is set.
	// This should almost never be used, as it is a fallback for the fallback. It is here just in case.
	fallbackIcon = "/assets/icons/missing_icon.svg";

	// Folder icon
	folderIcon = "/assets/icons/missing_icon.svg";

	/**
	 * Open a file using the registered handler for its extension, falling back
	 * to the default handler if none has been registered.
	 *
	 * @param path - Absolute path to the file to open.
	 *
	 * @example
	 * ```js
	 * anura.files.open("/config_cached.json"); // uses file handler to open json
	 * ```
	 */
	async open(path: string): Promise<void> {
		const ext = path.split("/").pop()!.split(".").pop();
		const extHandlers = anura.settings.get("FileExts") || {};
		if (extHandlers[ext!]) {
			const handler = extHandlers[ext!];
			if (handler.handler_type === "module") {
				const handlerModule = await anura.import(handler.id);
				if (!handlerModule) {
					await this.defaultOpen(path);
					return;
				}
				if (!handlerModule.openFile) {
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
	}

	async defaultOpen(path: string): Promise<void> {
		const extHandlers = anura.settings.get("FileExts") || {};
		if (extHandlers["default"]) {
			const handler = extHandlers["default"];
			if (handler.handler_type === "module") {
				const handlerModule = await anura.import(handler.id);
				if (!handlerModule) {
					return;
				}
				if (!handlerModule.openFile) {
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

	/**
	 * Returns an icon URL for the given path based on its file extension,
	 * resolved through the registered file handler (with a default fallback).
	 *
	 * @param path - The file path to resolve an icon for.
	 * @returns The icon URL/path string.
	 *
	 * @example
	 * ```js
	 * anura.files.getIcon("/config_cached.json"); // returns icon for json
	 * ```
	 */
	async getIcon(path: string): Promise<string> {
		const ext = path.split("/").pop()!.split(".").pop();
		const extHandlers = anura.settings.get("FileExts") || {};
		if (extHandlers[ext!]) {
			const handler = extHandlers[ext!];
			if (handler.handler_type === "module") {
				const handlerModule = await anura.import(handler.id);
				if (!handlerModule) {
					return await this.defaultIcon(path);
				}
				if (!handlerModule.getIcon) {
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
	}

	async defaultIcon(path: string): Promise<string> {
		const extHandlers = anura.settings.get("FileExts") || {};
		if (extHandlers["default"]) {
			const handler = extHandlers["default"];
			if (handler.handler_type === "module") {
				const handlerModule = await anura.import(handler.id);
				if (!handlerModule) {
					return this.fallbackIcon;
				}
				if (!handlerModule.getIcon) {
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

	/**
	 * Returns a human readable file type string for the given path, resolved
	 * through the registered file handler (with a default fallback).
	 *
	 * @param path - The file path to inspect.
	 * @returns The human readable file type string.
	 *
	 * @example
	 * ```js
	 * anura.files.getFileType("/config_cached.json"); // returns type for json
	 * ```
	 */
	async getFileType(path: string): Promise<string> {
		const ext = path.split("/").pop()!.split(".").pop();
		const extHandlers = anura.settings.get("FileExts") || {};
		if (extHandlers[ext!]) {
			const handler = extHandlers[ext!];
			if (handler.handler_type === "module") {
				const handlerModule = await anura.import(handler.id);
				if (!handlerModule) {
					return "Anura File";
				}
				if (!handlerModule.getFileType) {
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
		// If no handler is found, try the default handler
		return await this.defaultFileType(path);
	}

	async defaultFileType(path: string): Promise<string> {
		const extHandlers = anura.settings.get("FileExts") || {};
		if (extHandlers["default"]) {
			const handler = extHandlers["default"];
			if (handler.handler_type === "module") {
				const handlerModule = await anura.import(handler.id);
				if (!handlerModule) {
					return "Anura File";
				}
				if (!handlerModule.getFileType) {
					return "Anura File";
				}
				return handlerModule.getFileType(path);
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

	/**
	 * Register an Anura library as the handler for a file extension. The
	 * library should export an `openFile(path)` function (and optionally
	 * `getIcon` / `getFileType`).
	 *
	 * @param id - The package id of the library to use as a handler.
	 * @param extension - The file extension (without the leading dot) to bind
	 *   the handler to.
	 *
	 * @example
	 * ```js
	 * // Set anura.fileviewer library as default handler for png
	 * anura.files.setModule("anura.fileviewer", "png");
	 * ```
	 */
	setModule(id: string, extension: string) {
		const extHandlers = anura.settings.get("FileExts") || {};
		extHandlers[extension] = {
			handler_type: "module",
			id,
		};
		anura.settings.set("FileExts", extHandlers);
	}
}
