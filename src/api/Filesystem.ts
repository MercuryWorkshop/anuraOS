const numberSymbol = Symbol.for("number");

type AnuraFD = {
	fd: number;
	[numberSymbol]: string;
};

abstract class AnuraFSOperations<TStats> {
	/*
	 * Synchronous FS operations
	 */

	/*
	 * Asynchronous FS operations
	 */

	abstract promises: {
		appendFile(
			path: string,
			data: Uint8Array,
			options: { encoding: string; mode: number; flag: string },
		): Promise<void>;
		access(path: string, mode?: number): Promise<void>;
		chown(path: string, uid: number, gid: number): Promise<void>;
		chmod(path: string, mode: number): Promise<void>;
		link(srcPath: string, dstPath: string): Promise<void>;
		lstat(path: string): Promise<TStats>;
		mkdir(path: string, mode?: number): Promise<void>;
		mkdtemp(prefix: string, options?: { encoding: string }): Promise<string>;
		readdir(
			path: string,
			options?: string | { encoding: string; withFileTypes: boolean },
		): Promise<string[]>;
		readFile(path: string): Promise<Uint8Array>;
		readlink(path: string): Promise<string>;
		rename(oldPath: string, newPath: string): Promise<void>;
		rmdir(path: string): Promise<void>;
		stat(path: string): Promise<TStats>;
		symlink(srcPath: string, dstPath: string, type?: string): Promise<void>;
		truncate(path: string, len: number): Promise<void>;
		unlink(path: string): Promise<void>;
		utimes(
			path: string,
			atime: number | Date,
			mtime: number | Date,
		): Promise<void>;
		writeFile(
			path: string,
			data: Uint8Array | string,
			options?: { encoding: string; mode: number; flag: string },
		): Promise<void>;
	};
}

/**
 * Generic class for a filesystem provider
 * This should be extended by the various filesystem providers
 */
abstract class AFSProvider<TStats> extends AnuraFSOperations<TStats> {
	/**
	 * This is the domain that the filesystem provider is responsible
	 * for. The provider with the most specific domain
	 * will be used to handle a given path.
	 *
	 * @example "/" If you want to handle the root filesystem
	 *
	 * @example "/tmp" If you want to handle everything under /tmp.
	 * This will take precedence over the root filesystem.
	 */
	abstract domain: string;

	/**
	 * The name of the filesystem provider
	 */
	abstract name: string;

	/**
	 * The filesystem provider's version
	 */
	abstract version: string;
}

class AFSShell {
	env = new Proxy({} as { [key: string]: string }, {
		get: (target: { [key: string]: string }, prop: string) => {
			if (prop === "set") {
				return (key: string, value: string) => {
					target[key] = value;
				};
			}
			if (prop === "get") {
				return (key: string) => target[key];
			}
			if (prop in target) {
				return target[prop];
			}
			return undefined;
		},
		set: (target: any, prop: string, value: string) => {
			if (prop === "set" || prop === "get") {
				return false;
			}
			target[prop] = value;
			return true;
		},
	});

	#relativeToAbsolute(path: string) {
		if (path.startsWith("/")) {
			return path;
		}
		return (this.env.PWD + "/" + path).replace(/\/+/g, "/");
	}

	cat(
		files: string[],
		callback: (err: Error | null, contents: string) => void,
	) {
		let contents = "";
		let remaining = files.length;
		files.forEach((file) => {
			anura.fs.readFile(this.#relativeToAbsolute(file), (err, data) => {
				if (err) {
					callback(err, contents);
					return;
				}
				contents += data!.toString() + "\n";
				remaining--;
				if (remaining === 0) {
					callback(null, contents.replace(/\n$/, ""));
				}
			});
		});
	}
	// This differs from the Filer version, because here we can use the anura.files API to open the file
	// instead of evaluating the contents as js. The behaviour of the Filer version can be replicated by
	// registering a file provider that evaluates the contents as js.
	exec(path: string) {
		anura.files.open(this.#relativeToAbsolute(path));
	}
	find(
		path: string,
		options?: {
			/**
			 * Regex to match file paths against
			 */
			regex?: RegExp;
			/**
			 * Base name to search for (match patern)
			 */
			name?: string;
			/**
			 * Folder to search in (match pattern)
			 */
			path?: string;
			/**
			 * Callback to execute on each file.
			 */
			exec?: (path: string) => void;
		},
		callback?: (err: Error | null, files: string[]) => void,
	): void;
	find(
		path: string,
		callback?: (err: Error | null, files: string[]) => void,
	): void;
	find(
		path: string,
		options?: any,
		callback?: (err: Error | null, files: string[]) => void,
	) {
		if (typeof options === "function") {
			callback = options;
			options = {};
		}

		callback ||= () => {};
		options ||= {};

		function walk(
			dir: string,
			done: (err: Error | null, files: string[]) => void,
		) {
			const results: string[] = [];
			anura.fs.readdir(dir, (err: Error | null, list: string[]) => {
				if (err) {
					done(err, results);
					return;
				}
				let pending = list.length;
				if (!pending) {
					done(null, results);
					return;
				}
				list.forEach((file) => {
					file = dir + "/" + file;
					anura.fs.stat(file, (err, stat) => {
						if (err) {
							done(err, results);
							return;
						}
						if (stat.isDirectory()) {
							walk(file, (err, res) => {
								results.push(...res);
								pending--;
								if (!pending) {
									done(null, results);
								}
							});
						} else {
							results.push(file);
							pending--;
							if (!pending) {
								done(null, results);
							}
						}
					});
				});
			});
		}

		walk(this.#relativeToAbsolute(path), (err, results) => {
			if (err) {
				callback!(err, []);
				return;
			}
			if (options.regex) {
				results = results.filter((file) => options.regex!.test(file));
			}
			if (options.name) {
				results = results.filter((file) => file.includes(options.name!));
			}
			if (options.path) {
				results = results.filter((file) => file.includes(options.path!));
			}
			if (options.exec) {
				results.forEach((file) => options.exec!(file));
			} else {
				callback!(null, results);
			}
		});
	}
	ls(
		dir: string,
		options?: {
			recursive?: boolean;
		},
		callback?: (err: Error | null, entries: any[]) => void,
	): void;
	ls(dir: string, callback?: (err: Error | null, entries: any[]) => void): void;
	ls(
		dir: string,
		options?: any,
		callback?: (err: Error | null, entries: any[]) => void,
	) {
		if (typeof options === "function") {
			callback = options;
			options = {};
		}
		callback ||= () => {};
		options ||= {};

		const entries: any[] = [];

		if (options.recursive) {
			this.find(dir, (err, files) => {
				if (err) {
					callback!(err, []);
					return;
				}
				callback!(null, files);
			});
		} else {
			anura.fs.readdir(
				this.#relativeToAbsolute(dir),
				(err: Error | null, files: string[]) => {
					if (err) {
						callback!(err, []);
						return;
					}
					if (files.length === 0) {
						callback!(null, []);
						return;
					}
					let pending = files.length;
					files.forEach((file) => {
						anura.fs.stat(
							this.#relativeToAbsolute(dir) + "/" + file,
							(err, stats: { isDirectory: () => boolean }) => {
								if (err) {
									callback!(err, []);
									return;
								}
								entries.push(stats);
								pending--;
								if (!pending) {
									callback!(null, entries);
								}
							},
						);
					});
				},
			);
		}
	}
	mkdirp(path: string, callback: (err: Error | null) => void) {
		this.promises
			.mkdirp(path)
			.then(() => callback!(null))
			.catch((err) => {
				callback(err);
			});
	}
	rm(
		path: string,
		options?: { recursive?: boolean },
		callback?: (err: Error | null) => void,
	): void;
	rm(path: string, callback?: (err: Error | null) => void): void;
	rm(path: string, options?: any, callback?: (err: Error | null) => void) {
		path = this.#relativeToAbsolute(path);
		if (typeof options === "function") {
			callback = options;
			options = {};
		}
		callback ||= () => {};
		options ||= {};

		function walk(dir: string, done: (err: Error | null) => void) {
			anura.fs.readdir(dir, (err: Error | null, list: string[]) => {
				if (err) {
					done(err);
					return;
				}
				let pending = list.length;
				if (!pending) {
					anura.fs.rmdir(dir, done);
					return;
				}
				list.forEach((file: string) => {
					file = dir + "/" + file;
					anura.fs.stat(
						file,
						(
							err,
							stats: {
								isDirectory: () => boolean;
							},
						) => {
							if (err) {
								done(err);
								return;
							}
							if (stats.isDirectory()) {
								walk(file, (err) => {
									if (err) {
										done(err);
										return;
									}
									pending--;
									if (!pending) {
										anura.fs.rmdir(dir, done);
									}
								});
							} else {
								anura.fs.unlink(file, (err) => {
									if (err) {
										done(err);
										return;
									}
									pending--;
									if (!pending) {
										anura.fs.rmdir(dir, done);
									}
								});
							}
						},
					);
				});
			});
		}

		anura.fs.stat(
			path,
			(err: Error | null, stats: { isDirectory: () => boolean }) => {
				if (err) {
					callback!(err);
					return;
				}
				if (!stats.isDirectory()) {
					anura.fs.unlink(path, callback);
					return;
				}

				if (options.recursive) {
					walk(path, callback!);
				} else {
					anura.fs.readdir(path, (err: Error | null, files: string[]) => {
						if (err) {
							callback!(err);
							return;
						}
						if (files.length > 0) {
							callback!(
								new Error(
									"Directory not empty! Pass { recursive: true } instead to remove it and all its contents.",
								),
							);
							return;
						}
					});
				}
			},
		);
	}
	tempDir(callback?: (err: Error | null, path: string) => void) {
		callback ||= () => {};
		const tmp = this.env.TMP;
		anura.fs.mkdir(tmp, () => {
			callback!(null, tmp);
		});
	}
	touch(
		path: string,
		options?: { updateOnly?: boolean; date?: Date },
		callback?: (err: Error | null) => void,
	): void;
	touch(path: string, callback?: (err: Error | null) => void): void;
	touch(path: string, options?: any, callback?: (err: Error | null) => void) {
		path = this.#relativeToAbsolute(path);
		if (typeof options === "function") {
			callback = options;
			options = {
				updateOnly: false,
				date: Date.now(),
			};
		}
		callback ||= () => {};
		options ||= {
			updateOnly: false,
			date: Date.now(),
		};

		function createFile() {
			anura.fs.writeFile(path, "", callback);
		}

		function updateTimes() {
			anura.fs.utimes(path, options.date, options.date, callback);
		}

		anura.fs.stat(path, (err: Error | null) => {
			if (err) {
				if (options.updateOnly) {
					callback!(new Error("File does not exist and updateOnly is true"));
					return;
				} else {
					createFile();
				}
			} else {
				updateTimes();
			}
		});
	}

	cd(dir: string) {
		this.env.PWD = this.#relativeToAbsolute(dir);
	}

	pwd() {
		return this.env.PWD;
	}

	promises = {
		cat: async (files: string[]) => {
			let contents = "";
			for (const file of files) {
				contents += (
					await anura.fs.promises.readFile(this.#relativeToAbsolute(file))
				).toString();
			}
			return contents;
		},
		exec: async (path: string) => {
			anura.files.open(this.#relativeToAbsolute(path));
		},
		find: (
			path: string,
			options?: {
				regex?: RegExp;
				name?: string;
				path?: string;
				exec?: (path: string) => void;
			},
		) => {
			return new Promise<string[]>((resolve, reject) => {
				this.find(path, options, (err, files) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(files);
				});
			});
		},
		ls: (
			dir: string,
			options?: {
				recursive?: boolean;
			},
		) => {
			return new Promise<string[]>((resolve, reject) => {
				this.ls(dir, options, (err, entries) => {
					if (err) {
						reject(err);
						return;
					}
					resolve(entries);
				});
			});
		},
		cpr: async (src: string, dest: string, options?: any) => {
			try {
				const stat = await anura.fs.promises.stat(src);
				if (options?.createInnerFolder === true) {
					try {
						const destStat = await anura.fs.promises.stat(dest);
						if (destStat.type === "DIRECTORY") {
							dest = Filer.Path.join(dest, Filer.Path.basename(src));
						}
					} catch {
						// Destination does not exist; continue as-is
					}
				}

				if (stat.type === "FILE") {
					// Make sure destination directory exists
					const destDir = Filer.Path.dirname(dest);

					await this.promises.mkdirp(destDir);
					await anura.fs.promises.writeFile(
						dest,
						await anura.fs.promises.readFile(src),
					);
				} else if (stat.type === "DIRECTORY") {
					await this.promises.mkdirp(dest);

					const items = await anura.fs.promises.readdir(src);
					for (const item of items) {
						const srcPath = Filer.Path.join(src, item);
						const destPath = Filer.Path.join(dest, item);
						await this.promises.cpr(srcPath, destPath);
					}
				} else {
					throw new Error(`Unsupported file type at path: ${src}`);
				}
			} catch (err) {
				console.error(`Error copying from ${src} to ${dest}:`, err);
				throw err;
			}
		},
		mkdirp: async (path: string) => {
			const parts = this.#relativeToAbsolute(path).split("/");
			let builder = "";
			for (const part of parts) {
				if (part === "") continue;
				builder += "/" + part;
				try {
					await anura.fs.promises.mkdir(builder);
				} catch (e) {
					if (e.code !== "EEXIST") throw e;
				}
			}
		},
		rm: (
			path: string,
			options?: {
				recursive?: boolean;
			},
		) => {
			return new Promise<void>((resolve, reject) => {
				this.rm(path, options, (err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		},
		touch: (
			path: string,
			options?: {
				updateOnly?: boolean;
				date?: Date;
			},
		) => {
			return new Promise<void>((resolve, reject) => {
				this.touch(path, options, (err) => {
					if (err) {
						reject(err);
						return;
					}
					resolve();
				});
			});
		},
	};

	constructor(options?: { env?: { [key: string]: string } }) {
		options ||= {
			env: {
				PWD: "/",
				TMP: "/tmp",
			},
		};
		if (options?.env) {
			Object.entries(options.env).forEach(([key, value]) => {
				this.env.set(key, value);
			});
		}
	}
}

/**
 * Anura File System API
 *
 * This is fully compatible with Filer's filesystem API and,
 * by extension, most of the Node.js filesystem API. This is
 * a drop-in replacement for the legacy Filer API and should
 * be used in place of the Filer API in all new code.
 *
 * This API has the added benefit of type safety and a the ability
 * to register multiple filesystem providers. This allows for the
 * creation of virtual filesystems and the ability to mount filesystems
 * at arbitrary paths.
 */
class AnuraFilesystem implements AnuraFSOperations<any> {
	providers: Map<string, AFSProvider<any>> = new Map();
	fds: any = {};
	lastFd: 3;
	providerCache: { [path: string]: AFSProvider<any> } = {};
	whatwgfs = {
		fs: undefined,
		getFolder: async () => {
			// @ts-ignore
			return await this.whatwgfs.fs.getOriginPrivateDirectory(
				// @ts-ignore
				import("/libs/nfsadapter/adapters/anuraadapter.js"),
			);
		},
		fileOrDirectoryFromPath: async (path: string) => {
			try {
				return await this.whatwgfs.directoryHandleFromPath(path);
			} catch (e1) {
				try {
					return await this.whatwgfs.fileHandleFromPath(path);
				} catch (e2) {
					throw e1 + e2;
				}
			}
		},
		directoryHandleFromPath: async (path: string) => {
			const pathParts = path.split("/");
			// prettier-ignore
			let workingPath = (await anura.fs.whatwgfs.getFolder());
			for (const dir of pathParts) {
				if (dir !== "") workingPath = await workingPath.getDirectoryHandle(dir);
			}
			return workingPath;
		},
		fileHandleFromPath: async (givenPath: string) => {
			let path: string | string[] = givenPath.split("/");
			const file = path.pop();
			path = path.join("/");

			// prettier-ignore
			const workingPath = (await anura.fs.whatwgfs.directoryHandleFromPath(path));
			return await workingPath.getFileHandle(file);
		},
		showDirectoryPicker: async (options: object) => {
			const picker = await anura.import("anura.filepicker");
			const path = await picker.selectFolder();
			return await this.whatwgfs.directoryHandleFromPath(path);
		},
		showOpenFilePicker: async (options: object) => {
			const picker = await anura.import("anura.filepicker");
			const path = await picker.selectFile();
			return await this.whatwgfs.fileHandleFromPath(path);
		},
	};

	// Note: Intentionally aliasing the property to a class instead of an instance
	static Shell = AFSShell;
	Shell = AFSShell;

	constructor(providers: AFSProvider<any>[]) {
		providers.forEach((provider) => {
			this.providers.set(provider.domain, provider);
		});
		// These paths must be TS ignore'd since they are in build/

		(async () => {
			// @ts-ignore
			const fs = await import("/libs/nfsadapter/nfsadapter.js");
			// @ts-ignore
			this.whatwgfs.FileSystemDirectoryHandle = fs.FileSystemDirectoryHandle;
			// @ts-ignore
			this.whatwgfs.FileSystemFileHandle = fs.FileSystemFileHandle;
			// @ts-ignore
			this.whatwgfs.FileSystemHandle = fs.FileSystemHandle;
			this.whatwgfs.fs = fs;
		})();
	}

	clearCache() {
		this.providerCache = {};
	}

	installProvider(provider: AFSProvider<any>) {
		this.providers.set(provider.domain, provider);
		this.clearCache();
	}

	processPath(path: string): AFSProvider<any> {
		if (!path.startsWith("/")) {
			throw new Error("Path must be absolute");
		}
		path = path.replace(/^\/+/, "/");

		let provider = this.providerCache[path];
		if (provider) {
			return provider;
		}
		if (this.providers.has(path)) {
			path += "/";
		}
		const parts = path.split("/");
		parts.shift();
		parts.pop();
		while (!provider && parts.length > 0) {
			const checkPath = "/" + parts.join("/");
			provider = this.providers.get(checkPath);
			parts.pop();
		}
		if (!provider) {
			provider = this.providers.get("/");
		}
		this.providerCache[path] = provider!;
		return provider!;
	}

	rename(
		oldPath: string,
		newPath: string,
		callback?: (err: Error | null) => void,
	) {
		this.promises
			.rename(oldPath, newPath)
			.then(() => callback!(null))
			.catch(callback);
	}

	ftruncate(fd: number, len: number, callback?: (err: Error | null) => void) {
		anura.fs.truncate(this.fds[fd].path, len, callback);
	}

	truncate(path: string, len: number, callback?: (err: Error | null) => void) {
		this.promises
			.truncate(path, len)
			.then(() => callback!(null))
			.catch(callback);
	}

	stat(path: string, callback?: (err: Error | null, stats: any) => void) {
		this.promises
			.stat(path)
			.then((res) => {
				callback!(null, res);
			})
			.catch((err) => {
				callback!(err, null);
			});
	}

	fstat(
		fd: number,
		callback?: ((err: Error | null, stats: any) => void) | undefined,
	): void {
		anura.fs.stat(this.fds[fd].path, callback);
	}

	lstat(path: string, callback?: (err: Error | null, stats: any) => void) {
		this.promises
			.lstat(path)
			.then((res) => {
				callback!(null, res);
			})
			.catch((err) => {
				callback!(err, null);
			});
	}

	/** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
	async exists(path: string, callback?: (exists: boolean) => void) {
		try {
			await anura.fs.promises.access(path);
			callback!(true);
		} catch (e) {
			callback!(false);
		}
	}

	link(
		srcPath: string,
		dstPath: string,
		callback?: (err: Error | null) => void,
	) {
		this.promises
			.link(srcPath, dstPath)
			.then((res) => {
				callback!(null);
			})
			.catch((err) => {
				callback!(err);
			});
	}

	symlink(path: string, ...rest: any[]) {
		// @ts-ignore - Overloaded methods are scary
		this.processPath(rest[0]).symlink(path, ...rest);
	}

	readlink(
		path: string,
		callback?: (err: Error | null, linkContents: string | undefined) => void,
	) {
		this.promises
			.readlink(path)
			.then((res) => {
				callback!(null, res);
			})
			.catch((err) => {
				callback!(err, undefined);
			});
	}

	unlink(path: string, callback?: (err: Error | null) => void) {
		this.promises
			.unlink(path)
			.then((res) => {
				callback!(null);
			})
			.catch((err) => {
				callback!(err);
			});
	}

	rmdir(path: string, callback?: (err: Error | null) => void) {
		this.promises
			.rmdir(path)
			.then((res) => {
				callback!(null);
			})
			.catch((err) => {
				callback!(err);
			});
	}

	mkdir(path: string, ...rest: any[]) {
		this.promises
			.mkdir(path)
			.then((res) => {
				rest[rest.length - 1]!(null);
			})
			.catch((err) => {
				rest[rest.length - 1]!(err);
			});
	}

	access(path: string, ...rest: any[]) {
		this.promises
			.access(path)
			.then((res) => {
				rest[rest.length - 1]!(null);
			})
			.catch((err) => {
				rest[rest.length - 1]!(err);
			});
	}

	mkdtemp(...args: any[]) {
		// Temp directories should remain in the root filesystem for now
		// @ts-ignore - Overloaded methods are scary
		this.processPath(path).mkdtemp(...args);
	}

	readdir(path: string, ...rest: any[]) {
		this.promises
			.readdir(path, typeof rest[0] !== "function" ? rest[0] : undefined)
			.then((res) => {
				rest[rest.length - 1]!(null, res);
			})
			.catch((err) => {
				rest[rest.length - 1]!(err);
			});
	}

	close(
		fd: number,
		callback?: ((err: Error | null) => void) | undefined,
	): void {
		try {
			delete this.fds[fd];
			if (callback) callback(null);
		} catch (e) {
			if (callback) callback(e);
		}
		// this.processFD(fd).close(fd, callback);
	}

	open(
		path: string,
		flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
		mode: number,
		callback?: ((err: Error | null, fd: number) => void) | undefined,
	): void;
	open(
		path: string,
		flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
		callback?: ((err: Error | null, fd: number) => void) | undefined,
	): void;
	open(
		path: string,
		flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
		mode?: unknown,
		callback?: unknown,
	): void {
		let definedMode: number = 0o644;
		let definedCallback: any;
		let definedFlags: string = "w+";
		if (typeof flags !== "number" && typeof flags !== "string") {
			definedCallback = flags;
		} else {
			if (typeof mode === "number") {
				definedFlags = flags;
				definedCallback = callback;
				definedMode = mode;
			} else {
				definedCallback = mode;
				definedFlags = flags;
			}
		}
		// @ts-ignore
		this.promises
			.open(path, definedFlags as any, definedMode)
			.then((res) => definedCallback(null, res))
			.catch((e) => definedCallback(e, null));
	}

	utimes(
		path: string,
		atime: number | Date,
		mtime: number | Date,
		callback?: (err: Error | null) => void,
	) {
		this.promises
			.utimes(path, atime, mtime)
			.then((res) => {
				callback!(null);
			})
			.catch((err) => {
				callback!(err);
			});
	}

	futimes(fd: number, ...rest: any[]) {
		// @ts-ignore - Overloaded methods are scary
		anura.fs.utimes(this.fds[fd].path, ...rest);
	}

	chown(
		path: string,
		uid: number,
		gid: number,
		callback?: (err: Error | null) => void,
	) {
		this.promises
			.chown(path, uid, gid)
			.then((res) => {
				callback!(null);
			})
			.catch((err) => {
				callback!(err);
			});
	}

	fchown(fd: number, ...rest: any[]) {
		// @ts-ignore - Overloaded methods are scary
		anura.fs.chown(this.fds[fd].path, ...rest);
	}

	chmod(path: string, mode: number, callback?: (err: Error | null) => void) {
		this.promises
			.chmod(path, mode)
			.then(() => callback!(null))
			.catch(callback);
	}

	fchmod(fd: number, ...rest: any[]) {
		// @ts-ignore - Overloaded methods are scary
		anura.fs.chmod(this.fds[fd].path, ...rest);
	}

	fsync(fd: number, ...rest: any[]) {
		// @ts-ignore - Overloaded methods are scary
		rest[0]();
	}

	async write(fd: number, ...rest: any[]) {
		const callback = rest[rest.length - 1];
		try {
			// @ts-ignore
			const realPath = this.fds[fd].path;
			const buffer = rest[0];
			const callback = rest[rest.length - 1];
			let length = buffer.length;
			let offset = 0;
			let position = null;

			// VarArgs handler
			if (rest.length === 5) {
				offset = rest[1];
				length = rest[2];
				position = rest[3];
			} else if (rest.length === 4) {
				offset = rest[1];
				length = rest[2];
			} else if (rest.length === 3) {
				offset = rest[1];
			}

			let fileBuf = Filer.Buffer.from(new Uint8Array(0));
			try {
				fileBuf = Filer.Buffer.from(
					(await anura.fs.promises.readFile(
						realPath,
					)) as Uint8Array<ArrayBuffer>,
				);
			} catch {
				// File just didn't exist, not a huge deal, it will exist by the end of this
			}
			const slice = buffer.slice(offset, offset + length);
			let outBuf;
			if (position === null) {
				outBuf = Filer.Buffer.concat([fileBuf, slice]);
			} else {
				const endPos = position + slice.length;
				if (endPos > fileBuf.length) {
					outBuf = Filer.Buffer.alloc(endPos);
					fileBuf.copy(outBuf, 0, 0, fileBuf.length);
				} else {
					outBuf = Filer.Buffer.from(fileBuf);
				}
				slice.copy(outBuf, position);
			}
			await anura.fs.promises.writeFile(realPath, outBuf);
			callback(null, length, buffer);
		} catch (e) {
			callback(e);
		}
	}

	async read(fd: number, ...rest: any[]) {
		const callback = rest[rest.length - 1];
		try {
			// @ts-ignore
			const realPath = this.fds[fd].path;
			const buffer = rest[0];

			let length = buffer.length;
			let offset = 0;
			let position = 0;
			// VarArgs handler
			if (rest.length === 5) {
				offset = rest[1];
				length = rest[2];
				position = rest[3];
			} else if (rest.length === 4) {
				offset = rest[1];
				length = rest[2];
			} else if (rest.length === 3) {
				offset = rest[1];
			}

			const fileBuf = await anura.fs.promises.readFile(realPath);
			const slice = Filer.Buffer.from(
				fileBuf.slice(position, position + length),
			);
			slice.copy(buffer, offset);
			callback(null, slice.length, buffer);
		} catch (e) {
			callback(e);
		}
	}

	readFile(
		path: string,
		callback?: (err: Error | null, data?: Uint8Array) => void,
	) {
		this.promises
			.readFile(path)
			.then((res) => {
				callback!(null, res);
			})
			.catch((err) => {
				callback!(err);
			});
	}

	writeFile(path: string, data: Uint8Array | string, ...rest: any[]) {
		if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
			data = Filer.Buffer.from(data);
		}
		this.promises
			.writeFile(
				path,
				data,
				typeof rest[0] !== "function" ? rest[0] : undefined,
			)
			.then((res) => {
				if (typeof rest[rest.length - 1] === "function")
					rest[rest.length - 1]!(null, res);
			})
			.catch((err) => {
				if (typeof rest[rest.length - 1] === "function")
					rest[rest.length - 1]!(err);
			});
	}

	appendFile(path: string, data: Uint8Array, ...rest: any[]) {
		if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
			data = Filer.Buffer.from(data);
		}
		this.promises
			.appendFile(
				path,
				data,
				typeof rest[0] !== "function" ? rest[0] : undefined,
			)
			.then((res) => {
				if (typeof rest[rest.length - 1] === "function")
					rest[rest.length - 1]!(null, res);
			})
			.catch((err) => {
				if (typeof rest[rest.length - 1] === "function")
					rest[rest.length - 1]!(err);
			});
	}

	// @ts-ignore - This is still being implemented.
	promises = {
		appendFile: (
			path: string,
			data: Uint8Array,
			options: { encoding: string; mode: number; flag: string },
		) => {
			if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
				data = Filer.Buffer.from(data);
			}

			return this.processPath(path).promises.appendFile(path, data, options);
		},
		access: (path: string, mode?: number) =>
			this.processPath(path).promises.access(path, mode),
		chown: (path: string, uid: number, gid: number) =>
			this.processPath(path).promises.chown(path, uid, gid),
		chmod: (path: string, mode: number) =>
			this.processPath(path).promises.chmod(path, mode),
		link: (srcPath: string, dstPath: string) =>
			this.processPath(srcPath).promises.link(srcPath, dstPath),
		lstat: (path: string) => this.processPath(path).promises.lstat(path),
		mkdir: (path: string, mode?: number) =>
			this.processPath(path).promises.mkdir(path, mode),
		mkdtemp: (prefix: string, options?: { encoding: string }) =>
			this.processPath(prefix).promises.mkdtemp(prefix, options),
		open: async (
			path: string,
			flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
			mode?: number,
		) => {
			let definedMode;
			if (typeof mode === "number") {
				definedMode = mode;
			} else {
				definedMode = 0o644;
			}

			if (["a", "a+", "w", "w+"].includes(flags)) {
				anura.fs.promises.writeFile(path, "");
			}

			const assignedFd = this.lastFd++;
			this.fds[assignedFd] = { path: path.replace(/^\/+/, "/") };
			return assignedFd;
		},
		readdir: (
			path: string,
			options?: string | { encoding: string; withFileTypes: boolean },
		) => this.processPath(path).promises.readdir(path, options),
		readFile: (path: string) => this.processPath(path).promises.readFile(path),
		readlink: (path: string) => this.processPath(path).promises.readlink(path),
		rename: (oldPath: string, newPath: string) =>
			this.processPath(oldPath).promises.rename(oldPath, newPath),
		rmdir: (path: string) => this.processPath(path).promises.rmdir(path),
		stat: (path: string) => this.processPath(path).promises.stat(path),
		symlink: (srcPath: string, dstPath: string, type?: string) =>
			this.processPath(dstPath).promises.symlink(srcPath, dstPath, type),
		truncate: (path: string, len: number) =>
			this.processPath(path).promises.truncate(path, len),
		unlink: (path: string) => this.processPath(path).promises.unlink(path),
		utimes: (path: string, atime: number | Date, mtime: number | Date) =>
			this.processPath(path).promises.utimes(path, atime, mtime),
		writeFile: (
			path: string,
			data: Uint8Array | string,
			options?: { encoding: string; mode: number; flag: string },
		) => {
			if (data instanceof Uint8Array && !(data instanceof Filer.Buffer)) {
				data = Filer.Buffer.from(data);
			}

			return this.processPath(path).promises.writeFile(path, data, options);
		},
	};
}
