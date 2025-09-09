class LocalFSStats {
	name: string;
	size: number;
	atime: Date;
	mtime: Date;
	ctime: Date;
	atimeMs: number;
	mtimeMs: number;
	ctimeMs: number;
	node: string;
	nlinks: number;
	mode: number;
	type: "FILE" | "DIRECTORY";
	uid: number;
	gid: number;
	dev: string;

	isFile() {
		return this.type === "FILE";
	}

	isDirectory() {
		return this.type === "DIRECTORY";
	}

	isSymbolicLink() {
		return (this.mode & 0o170000) === 0o120000;
	}

	constructor(data: Partial<LocalFSStats>) {
		this.name = data.name!;
		this.size = data.size || 0;
		this.atimeMs = data.atimeMs || Date.now();
		this.mtimeMs = data.mtimeMs || Date.now();
		this.ctimeMs = data.ctimeMs || Date.now();
		this.atime = new Date(this.atimeMs);
		this.mtime = new Date(this.mtimeMs);
		this.ctime = new Date(this.ctimeMs);
		this.node = data.node || crypto.randomUUID();
		this.nlinks = data.nlinks || 1;
		this.mode = data.mode || 0o100777;
		this.type = data.type || "FILE";
		this.uid = data.uid || 0;
		this.gid = data.gid || 0;
		this.dev = data.dev || "localfs";
	}
}

class LocalFS extends AFSProvider<LocalFSStats> {
	dirHandle: FileSystemDirectoryHandle;
	domain: string;
	name = "LocalFS";
	version = "1.0.0";
	path: any = Filer.Path; // replace with another polyfill
	stats: Map<string, any> = new Map();
	fds: FileSystemHandle[] = [];
	cursors: number[] = [];

	constructor(dirHandle: FileSystemDirectoryHandle, domain: string) {
		super();
		this.dirHandle = dirHandle;
		this.domain = domain;
		this.name += ` (${domain})`;
	}

	relativizePath(path: string) {
		return path.replace(this.domain, "").replace(/^\/+/, "");
	}

	async getChildDirHandle(
		path: string,
		recurseCounter = 0,
	): Promise<[FileSystemDirectoryHandle, string]> {
		if (recurseCounter > 20) {
			throw {
				name: "ELOOP",
				code: "ELOOP",
				errno: -40,
				message: "no such file or directory",
				path: (this.domain + "/" + path).replace("//", "/"),
			};
		}

		if (path === "") {
			return [this.dirHandle, path];
		}
		if (path.endsWith("/")) {
			path = path.substring(0, path.length - 1);
		}
		let acc = this.dirHandle;
		let curr = "";
		for await (const part of path.split("/")) {
			if (part === "" || part === ".") continue;
			curr += "/" + part;
			if ((this.stats.get(curr)?.mode & 0o170000) === 0o120000) {
				// We ran into a path symlink, we're storing symlinks of all types as files who's content is the target.
				const newPart = await (
					await (await acc.getFileHandle(path)).getFile()
				).text();
				if (newPart.startsWith("/")) {
					// absolute
					return this.getChildDirHandle(newPart, recurseCounter + 1);
				} else {
					// relative
					return this.getChildDirHandle(
						this.path.resolve(curr, newPart),
						recurseCounter + 1,
					);
				}
			}
			acc = await acc.getDirectoryHandle(part);
		}
		return [acc, curr];
	}
	async getFileHandle(
		path: string,
		options?: FileSystemGetFileOptions,
		recurseCounter = 0,
	): Promise<[FileSystemFileHandle, string]> {
		if (!path.includes("/")) {
			path = "/" + path;
		}

		const parentFolder = this.path.dirname(path);

		// eslint-disable-next-line prefer-const
		let [parentHandle, realPath] = await this.getChildDirHandle(parentFolder);

		const fileName = this.path.basename(path);

		if (realPath[0] === "/") {
			realPath = realPath.slice(1);
		}
		if (
			this.stats.has(realPath + "/" + fileName) &&
			(this.stats.get(realPath + "/" + fileName).mode & 0o170000) === 0o120000
		) {
			// is symlink
			let realPath = await (
				await (await parentHandle.getFileHandle(fileName)).getFile()
			).text();
			if (realPath.startsWith("/")) {
				if (realPath.startsWith(this.domain)) {
					realPath = this.relativizePath(realPath);
					// absolute
					return this.getFileHandle(realPath, options, recurseCounter + 1);
				} else {
					// Okay so, this goes over the mount boundary, and is slightly problematic
					// for us since we need to handle this as an event OUTSIDE of LocalFS itself
					// so this is a bit of a cheat using the compatibility layer for FileSystemAccess API
					let handle = await anura.fs.whatwgfs.getFolder();
					for (const part in realPath.split("/").slice(1, -1)) {
						handle = await handle.getDirectoryHandle(part);
					}
					return [
						await handle.getFileHandle(this.path.basename(realPath)),
						"foreign:" + realPath,
					];
				}
			} else {
				// relative
				return this.getFileHandle(
					this.path.resolve(parentFolder, realPath),
					options,
					recurseCounter + 1,
				);
			}
		}
		return [await parentHandle.getFileHandle(fileName, options), path];
	}
	static async newOPFS(anuraPath: string) {
		const dirHandle = await navigator.storage.getDirectory();

		try {
			await anura.fs.promises.mkdir(anuraPath);
		} catch (e) {
			// Ignore, the directory already exists so we don't need to create it
		}
		const fs = new LocalFS(dirHandle, anuraPath);
		anura.fs.installProvider(fs);
		const textde = new TextDecoder();
		try {
			fs.stats = new Map(
				JSON.parse(
					textde.decode(
						await fs.promises.readFile(anuraPath + "/.anura_stats"),
					),
				),
			);
		} catch (e: any) {
			console.log("Error on mount, probably first mount ", e);
		}

		return fs;
	}
	static async newRootOPFS() {
		const anuraPath = "/";
		const dirHandle = await navigator.storage.getDirectory();

		const fs = new LocalFS(dirHandle, anuraPath);
		const textde = new TextDecoder();
		try {
			fs.stats = new Map(
				JSON.parse(
					textde.decode(
						await fs.promises.readFile(anuraPath + "/.anura_stats"),
					),
				),
			);
		} catch (e: any) {
			console.log("Error on mount, probably first mount ", e);
		}

		return fs;
	}
	static async new(anuraPath: string) {
		let dirHandle;
		try {
			dirHandle = await window.showDirectoryPicker({
				id: `anura-${anuraPath.replace(/\/|\s|\./g, "-")}`,
			});
		} catch (e) {
			if (e.name !== "TypeError") {
				throw e;
			}
			// The path may not be a valid id, fallback to less specific id
			dirHandle = await window.showDirectoryPicker({
				id: "anura-localfs",
			});
		}
		dirHandle.requestPermission({ mode: "readwrite" });
		try {
			await anura.fs.promises.mkdir(anuraPath);
		} catch (e) {
			// Ignore, the directory already exists so we don't need to create it
		}
		const fs = new LocalFS(dirHandle, anuraPath);
		anura.fs.installProvider(fs);
		return fs;
	}

	promises = {
		saveStats: async () => {
			const jsonStats = JSON.stringify(Array.from(this.stats.entries()));
			await this.promises.writeFile(this.domain + "/.anura_stats", jsonStats);
		},
		writeFile: async (
			path: string,
			data: Uint8Array | string,
			options?: any,
		) => {
			if (typeof data === "string") {
				data = new TextEncoder().encode(data);
			}
			path = this.relativizePath(path);

			// eslint-disable-next-line prefer-const
			let [handle, realPath] = await this.getFileHandle(path, {
				create: true,
			});

			const writer = await handle.createWritable();
			if (realPath.startsWith("/")) {
				realPath = realPath.slice(1);
			}
			const fileStats = this.stats.get(realPath) || {};

			if (fileStats && !realPath.startsWith("foreign:")) {
				fileStats.mtimeMs = Date.now();
				fileStats.ctimeMs = Date.now();
				this.stats.set(realPath, fileStats);
			}
			writer.write(data as any);
			writer.close();
		},
		readFile: async (path: string) => {
			path = this.relativizePath(path);

			const [handle, realPath] = await this.getFileHandle(path);
			const fileStats = this.stats.get(realPath) || {};

			if (fileStats && !realPath.startsWith("foreign:")) {
				fileStats.atimeMs = Date.now();
				this.stats.set(path, fileStats);
			}

			return new Filer.Buffer(await (await handle.getFile()).arrayBuffer());
		},
		readdir: async (path: string) => {
			let dirHandle, realPath;
			try {
				[dirHandle, realPath] = await this.getChildDirHandle(
					this.relativizePath(path),
				);
			} catch (e) {
				throw {
					name: "ENOENT",
					code: "ENOENT",
					errno: 34,
					message: "no such file or directory",
					path: (this.domain + "/" + path).replace("//", "/"),
					stack: e,
				};
			}

			const nodes: string[] = [];
			for await (const entry of dirHandle.values()) {
				if (entry.name !== ".anura_stats")
					// internal file shouldn't appear on fs methods
					nodes.push(entry.name);
			}
			return nodes;
		},
		appendFile: async (path: string, data: Uint8Array) => {
			const existingData = await this.promises.readFile(path);
			await this.promises.writeFile(
				path,
				new Uint8Array([...existingData, ...data]),
			);
		},
		unlink: async (path: string) => {
			let parentHandle = this.dirHandle;
			path = this.relativizePath(path);
			if (path.includes("/")) {
				const parts = path.split("/");
				const finalFile = parts.pop();
				parentHandle = (await this.getChildDirHandle(parts.join("/")))[0];
				path = finalFile!;
			}
			await parentHandle.removeEntry(path);
		},
		mkdir: async (path: string) => {
			if (path.endsWith("/")) path = path.slice(0, -1);
			let parentHandle = this.dirHandle;
			let realParentPath = "";
			path = this.relativizePath(path);
			if (path.includes("/")) {
				const parts = path.split("/");
				const finalDir = parts.pop();
				[parentHandle, realParentPath] = await this.getChildDirHandle(
					parts.join("/"),
				);
				path = finalDir!;
			}
			if (realParentPath.startsWith("/")) {
				realParentPath = realParentPath.slice(1);
			}
			const fullPath = realParentPath + "/" + path;
			const fileStats = this.stats.get(fullPath) || {};
			if (fileStats) {
				fileStats.ctimeMs = Date.now();
				this.stats.set(fullPath, fileStats);
			}

			await parentHandle.getDirectoryHandle(path, { create: true });
		},
		rmdir: async (path: string) => {
			let parentHandle = this.dirHandle;
			path = this.relativizePath(path);
			if (path.includes("/")) {
				const parts = path.split("/");
				const finalDir = parts.pop();
				parentHandle = (await this.getChildDirHandle(parts.join("/")))[0];
				path = finalDir!;
			}
			await parentHandle.removeEntry(path);
		},
		rename: async (oldPath: string, newPath: string) => {
			const data = await this.promises.readFile(oldPath);
			await this.promises.writeFile(newPath, data);
			await this.promises.unlink(oldPath);
		},
		stat: async (path: string) => {
			path = this.relativizePath(path);
			const requestPath = path;

			let statPath = path; // when accessing this.stats dont have a trailing slash
			if (statPath.endsWith("/")) statPath = statPath.slice(0, -1);
			const currStats = this.stats.get(statPath) || {};

			let handle;
			try {
				if (path === "") {
					handle = await this.dirHandle.getFileHandle(path);
				} else {
					[handle, path] = await this.getFileHandle(path);
				}
			} catch (e) {
				try {
					const handleAndPath = await this.getChildDirHandle(path);
					const handle = handleAndPath[0];
					path = handleAndPath[1];

					let rootName;
					if (!path) rootName = this.domain.split("/").pop();
					return new LocalFSStats({
						name: rootName || handle.name,
						mode: currStats.mode || 0o40777,
						type: "DIRECTORY",
						atimeMs: currStats.atimeMs || Date.now(),
						mtimeMs: currStats.mtimeMs || Date.now(),
						ctimeMs: currStats.ctimeMs || Date.now(),
						uid: currStats.uid || 0,
						gid: currStats.gid || 0,
					});
				} catch (e) {
					throw {
						name: "ENOENT",
						code: "ENOENT",
						errno: 34,
						message: "no such file or directory",
						path: (this.domain + "/" + path).replace("//", "/"),
						stack: e,
					};
				}
			}
			const file = await handle.getFile();
			return new LocalFSStats({
				name: this.path.basename(requestPath),
				size: file.size,
				type: "FILE",
				mode: currStats.mode || 0o100777,
				atimeMs: currStats.atimeMs || Date.now(),
				mtimeMs: currStats.mtimeMs || Date.now(),
				ctimeMs: currStats.ctimeMs || Date.now(),
				uid: currStats.uid || 0,
				gid: currStats.gid || 0,
			});
		},
		truncate: async (path: string, len: number) => {
			const data = await this.promises.readFile(path);
			await this.promises.writeFile(path, data.slice(0, len));
		},
		access(path: string, mode: number): Promise<void> {
			path = this.relativizePath(path);

			return new Promise((resolve, reject) => {
				this.promises
					.stat(path)
					.then(() => resolve()) // File exists
					.catch(() =>
						reject({
							name: "ENOENT",
							code: "ENOENT",
							errno: 34,
							message: `No such file or directory`,
							path,
							stack: "Error: No such file or directory",
						} as Error),
					); // File doesn't exist
			});
		},
		chown(path: string, uid: number, gid: number): Promise<void> {
			path = this.relativizePath(path);

			return new Promise(async (resolve, reject) => {
				const type = (await this.promises.lstat(path)).type;
				// Check if the file exists
				const stats = this.stats.get(path);
				if (!stats) {
					return reject({
						name: "ENOENT",
						code: "ENOENT",
						errno: 34,
						message: `No such file or directory`,
						path,
						stack: "Error: No such file or directory",
					} as Error);
				}
				if (path.endsWith("/")) path = path.slice(0, -1);
				if (type === "DIRECTORY") {
					path = (await this.getChildDirHandle(path))[1];
				} else {
					const pathDir = (
						await this.getChildDirHandle(this.path.dirname(path))
					)[1];
					path = pathDir + "/" + this.path.basename(path);
				}
				if (path.startsWith("/")) {
					path = path.slice(1);
				}

				// Update ownership in stats
				stats.uid = uid;
				stats.gid = gid;

				// Save updated stats
				this.stats.set(path, stats);
				this.promises
					.saveStats()
					.then(() => resolve())
					.catch(reject);
			});
		},
		chmod: async (fullPath: string, mode: number) => {
			const stats = await this.promises.lstat(fullPath);
			const type = stats.type;
			const sym = (stats.mode & 0o170000) === 0o120000;

			let path = this.relativizePath(fullPath);

			if (path.endsWith("/")) path = path.slice(0, -1);
			if (type === "DIRECTORY") {
				path = (await this.getChildDirHandle(path))[1];
			} else {
				const pathDir = (
					await this.getChildDirHandle(this.path.dirname(path))
				)[1];
				path = pathDir + "/" + this.path.basename(path);
			}
			if (path.startsWith("/")) {
				path = path.slice(1);
			}

			const currStats = this.stats.get(path) || {};
			if (mode > 0o777) {
				// Needed for v86

				mode -= mode & 0o170000;
			}
			if (!sym) {
				if (type === "FILE") {
					currStats.mode = 0o100000 + mode;
				}
				if (type === "DIRECTORY") {
					currStats.mode = 0o40000 + mode;
				}
			} else {
				currStats.mode = 0o120000 + mode;
			}

			this.stats.set(path, currStats);

			await this.promises.saveStats();
		},
		link: (existingPath: string, newPath: string): Promise<void> => {
			return this.promises.symlink(existingPath, newPath);
		},
		lstat: async (path: string) => {
			path = this.relativizePath(path);

			let statPath = path; // when accessing this.stats dont have a trailing slash
			if (statPath.endsWith("/")) statPath = statPath.slice(0, -1);
			const currStats = this.stats.get(statPath) || {};

			let handle;
			try {
				if (path === "") {
					handle = await this.dirHandle.getFileHandle(path);
				} else {
					const parent = await this.getChildDirHandle(this.path.dirname(path));
					handle = parent[0];
					const parentPath = parent[1];
					handle = await handle.getFileHandle(this.path.basename(path));
					path += path.lastIndexOf("/");
					path = parentPath + this.path.basename(path);
					// [handle, path] = await this.getFileHandle(path);
				}
			} catch (e) {
				try {
					const handleAndPath = await this.getChildDirHandle(path);
					const handle = handleAndPath[0];
					path = handleAndPath[1];

					let rootName;
					if (!path) rootName = this.domain.split("/").pop();
					return new LocalFSStats({
						name: rootName || handle.name,
						mode: currStats.mode || 0o40777,
						type: "DIRECTORY",
						atimeMs: currStats.atimeMs || Date.now(),
						mtimeMs: currStats.mtimeMs || Date.now(),
						ctimeMs: currStats.ctimeMs || Date.now(),
						uid: currStats.uid || 0,
						gid: currStats.gid || 0,
					});
				} catch (e) {
					throw {
						name: "ENOENT",
						code: "ENOENT",
						errno: 34,
						message: "no such file or directory",
						path: (this.domain + "/" + path).replace("//", "/"),
						stack: e,
					};
				}
			}
			const file = await handle.getFile();
			return new LocalFSStats({
				name: file.name,
				size: file.size,
				type: "FILE",
				mode: currStats.mode || 0o100777,
				atimeMs: currStats.atimeMs || Date.now(),
				mtimeMs: currStats.mtimeMs || Date.now(),
				ctimeMs: currStats.ctimeMs || Date.now(),
				uid: currStats.uid || 0,
				gid: currStats.gid || 0,
			});
		},
		mkdtemp: (template: string): Promise<string> => {
			return new Promise((resolve, reject) => {
				// Check if template has 'XXXXXX'
				if (!template.includes("XXXXXX")) {
					return reject({
						name: "EINVAL",
						code: "EINVAL",
						errno: 342,
						message: "Invalid template, must contain 'XXXXXX'.",
						stack: "Error: Invalid template",
					} as Error);
				}

				// Generate a random suffix
				const randomSuffix = Math.random().toString(36).slice(2, 8); // 6-character random string

				// Replace 'XXXXXX' in the template with the random suffix
				const newDir = template.replace("XXXXXX", randomSuffix);

				this.promises.mkdir(newDir);
				// Save the new stats
				this.promises
					.saveStats()
					.then(() => resolve(newDir)) // Return the new directory path
					.catch(reject);
			});
		},

		readlink: async (path: string) => {
			// Check if the path exists in stats
			path = this.relativizePath(path);
			const fileName = this.path.basename(path);
			// eslint-disable-next-line prefer-const
			let [parentHandle, realParent] = await this.getChildDirHandle(
				this.path.dirname(path),
			);
			if (realParent.startsWith("/")) {
				realParent = realParent.slice(1);
			}
			const stats = this.stats.get(realParent + "/" + fileName);
			if (!stats) {
				throw {
					name: "ENOENT",
					code: "ENOENT",
					errno: 34,
					message: `No such file or directory`,
					path,
					stack: "Error: No such file",
				} as Error;
			}
			if (!((stats.mode & 0o170000) === 0o120000)) {
				throw {
					// I think this is the wrong error type
					name: "EINVAL",
					code: "EINVAL",
					errno: 342,
					message: `Is not a symbolic link: ${path}`,
					stack: "Error: Is not a symbolic link",
				} as Error;
			}

			// Return the target path
			return await (
				await (await parentHandle.getFileHandle(fileName)).getFile()
			).text();
		},
		symlink: async (target: string, path: string) => {
			// await this.promises.stat(path);
			// Save stats and resolve the promise
			path = this.relativizePath(path);
			// if (target.startsWith("/")) {
			//     target = this.relativizePath(target);
			// }

			const fileName = this.path.basename(path);

			// eslint-disable-next-line prefer-const
			let [parentHandle, realParent] = await this.getChildDirHandle(
				this.path.dirname(path),
			);
			const fileHandleWritable = await (
				await parentHandle.getFileHandle(fileName, { create: true })
			).createWritable();
			fileHandleWritable.write(target);
			fileHandleWritable.close();

			if (realParent.startsWith("/")) realParent = realParent.slice(1);

			const fullPath = realParent + "/" + fileName;
			const fileStats = this.stats.get(fullPath) || {};
			if (fullPath) {
				fileStats.mode = 41380;
				fileStats.ctimeMs = Date.now();
				fileStats.mtimeMs = Date.now();
				this.stats.set(fullPath, fileStats);
			}

			await this.promises.saveStats();
			return;
		},
		utimes: async (
			path: string,
			atime: Date | number,
			mtime: Date | number,
		) => {
			const type = (await this.promises.lstat(path)).type;
			// Ensure path is relative
			path = this.relativizePath(path);

			// If the times are provided as numbers (timestamps), convert them to dates
			const accessTime = typeof atime === "number" ? new Date(atime) : atime;
			const modifiedTime = typeof mtime === "number" ? new Date(mtime) : mtime;

			if (type === "DIRECTORY") {
				path = (await this.getChildDirHandle(path))[1];
			} else {
				const pathDir = (
					await this.getChildDirHandle(this.path.dirname(path))
				)[1];
				path = pathDir + "/" + this.path.basename(path);
			}
			if (path.startsWith("/")) {
				path = path.slice(1);
			}
			// Fetch the current stats for the file, or initialize them if not present
			let fileStats = this.stats.get(path);
			if (!fileStats) {
				// Try to stat the file if not present in stats map
				fileStats = await this.promises.stat(path);
			}

			// Update the times in the file stats
			fileStats.atimeMs = accessTime.getTime();
			fileStats.mtimeMs = modifiedTime.getTime();

			// Save the updated stats back into the stats map
			this.stats.set(path, fileStats);
			await this.promises.saveStats();
		},
	};
}
