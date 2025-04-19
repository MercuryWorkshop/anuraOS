class FilerAFSProvider extends AFSProvider<any> {
	domain = "/";
	name = "Filer";
	version = "1.0.0";

	fs: FilerFS;

	constructor(fs: FilerFS) {
		super();
		this.fs = fs;
	}

	promises = {
		appendFile: (
			path: string,
			data: Uint8Array,
			options: { encoding: string; mode: number; flag: string },
		) => this.fs.promises.appendFile(path, data, options),
		access: (path: string, mode?: number) =>
			this.fs.promises.access(path, mode),
		chown: (path: string, uid: number, gid: number) =>
			this.fs.promises.chown(path, uid, gid),
		chmod: (path: string, mode: number) => this.fs.promises.chmod(path, mode),
		link: (srcPath: string, dstPath: string) =>
			this.fs.promises.link(srcPath, dstPath),
		lstat: (path: string) => this.fs.promises.lstat(path),
		mkdir: (path: string, mode?: number) => this.fs.promises.mkdir(path, mode),
		mkdtemp: (prefix: string, options?: { encoding: string }) =>
			this.fs.promises.mkdtemp(prefix, options),
		mknod: (path: string, mode: number) => this.fs.promises.mknod(path, mode),
		readdir: (
			path: string,
			options?: { encoding: string; withFileTypes: boolean },
		) => this.fs.promises.readdir(path, options),
		readFile: (path: string) => this.fs.promises.readFile(path),
		readlink: (path: string) => this.fs.promises.readlink(path),
		removexattr: (path: string, name: string) =>
			this.fs.promises.removexattr(path, name),
		rename: (oldPath: string, newPath: string) =>
			this.fs.promises.rename(oldPath, newPath),
		rmdir: (path: string) => this.fs.promises.rmdir(path),
		stat: (path: string) => this.fs.promises.stat(path),
		symlink: (srcPath: string, dstPath: string, type?: string) =>
			this.fs.promises.symlink(srcPath, dstPath, type),
		truncate: (path: string, len: number) =>
			this.fs.promises.truncate(path, len),

		unlink: (path: string) => this.fs.promises.unlink(path),
		utimes: (path: string, atime: number | Date, mtime: number | Date) =>
			this.fs.promises.utimes(path, atime, mtime),
		writeFile: (
			path: string,
			data: Uint8Array | string,
			options: { encoding: string; mode: number; flag: string },
		) => this.fs.promises.writeFile(path, data, options),
	};
}
