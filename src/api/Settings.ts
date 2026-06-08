/**
 * Defines system settings in Anura as a key-value store of JS objects.
 *
 * Available globally as `anura.settings`.
 *
 * Settings are persisted to `/anura_settings.json` in the Anura filesystem.
 */
class Settings {
	cache: { [key: string]: any } = {};
	fs: AnuraFilesystem;
	private constructor(fs: AnuraFilesystem, inital: { [key: string]: any }) {
		this.fs = fs;
		this.cache = inital;

		navigator.serviceWorker.ready.then((isReady) => {
			isReady.active!.postMessage({
				anura_target: "anura.cache",
				value: this.cache["use-sw-cache"],
			});
			console.debug(
				"ANURA-SW: For this boot, cache will be " +
					(this.cache["use-sw-cache"] ? "enabled" : "disabled"),
			);
		});
	}

	static async new(
		fs: AnuraFilesystem,
		defaultsettings: { [key: string]: any },
	) {
		const initial = defaultsettings;

		if (!initial["i-am-a-true-gangsta"]) {
			initial["i-am-a-true-gangsta"] = false;
		}

		if (!initial["wisp-url"]) {
			let url = "";
			if (location.protocol == "https:") {
				url += "wss://";
			} else {
				url += "ws://";
			}
			url += window.location.origin.split("://")[1];
			url += "/";
			initial["wisp-url"] = url;
		}

		if (!initial["x86-memory"]) {
			initial["x86-memory"] = 512;
		}

		if (!initial["wallpaper-fit"]) {
			initial["wallpaper-fit"] = "cover";
		}

		if (!initial["wallpaper-contain-color"]) {
			initial["wallpaper-contain-color"] = "#000000";
		}

		if (!initial["theme"]) {
			initial["theme"] = new Theme();
		}

		if (!initial["user-xapps"]) {
			initial["user-xapps"] = [];
		}

		if (!initial["disable-regedit-warning"]) {
			initial["disable-regedit-warning"] = false;
		}

		try {
			const raw = await fs.promises.readFile("/anura_settings.json");
			// This Uint8Array is actuallly a buffer, so JSON.parse can handle it
			Object.assign(initial, JSON.parse(raw as any));
		} catch (e) {
			fs.writeFile("/anura_settings.json", JSON.stringify(initial));
		}

		return new Settings(fs, initial);
	}

	/**
	 * Get a value from the settings key-value store.
	 *
	 * @param prop - The setting key to read.
	 * @returns The stored value, or `undefined` if the key is not set.
	 *
	 * @example
	 * ```js
	 * anura.settings.get("applist"); // Get pinned apps in anura's taskbar
	 * ```
	 */
	get(prop: string): any {
		return this.cache[prop];
	}

	/**
	 * Check whether a key exists in the settings store.
	 *
	 * @param prop - The setting key to test for.
	 * @returns `true` if the key has been set, otherwise `false`.
	 */
	has(prop: string): boolean {
		return prop in this.cache;
	}

	/**
	 * Set a value in the settings key-value store. The change is persisted to
	 * disk by automatically calling {@link Settings.save}.
	 *
	 * @param prop - The top-level setting key to write.
	 * @param val - The new value to assign.
	 * @param subprop - Optional. If provided, the value is assigned to
	 *   `cache[prop][subprop]` instead of `cache[prop]`.
	 *
	 * @example
	 * ```js
	 * anura.settings.set("launcher-keybind", false); // Disables the launcher keybind.
	 * ```
	 */
	async set(prop: string, val: any, subprop?: string) {
		console.debug("Setting " + prop + " to " + val);
		if (subprop) {
			this.cache[prop][subprop] = val;
		} else {
			this.cache[prop] = val;
		}
		this.save();
	}
	async save() {
		console.debug("Saving settings to fs", this.cache);
		await this.fs.promises.writeFile(
			"/anura_settings.json",
			JSON.stringify(this.cache),
		);
	}
	async remove(prop: string, subprop?: string) {
		console.warn(
			"anura.settings.remove() is a debug feature, and should not be used outside of development.",
		);
		if (subprop) {
			delete this.cache[prop][subprop];
		} else {
			delete this.cache[prop];
		}
		this.save();
	}
}
