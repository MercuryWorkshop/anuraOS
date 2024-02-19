const AnuraFDSymbol = Symbol.for("AnuraFD");

type AnuraFD = {
    fd: number;
    [AnuraFDSymbol]: string;
};

abstract class AnuraFSOperations<TStats> {
    /*
     * Synchronous FS operations
     */

    abstract rename(
        oldPath: string,
        newPath: string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract ftruncate(
        fd: AnuraFD,
        len: number,
        callback?: (err: Error | null, fd: AnuraFD) => void,
    ): void;

    abstract truncate(
        path: string,
        len: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract stat(
        path: string,
        callback?: (err: Error | null, stats: TStats) => void,
    ): void;

    abstract fstat(
        fd: AnuraFD,
        callback?: (err: Error | null, stats: TStats) => void,
    ): void;

    abstract lstat(
        path: string,
        callback?: (err: Error | null, stats: TStats) => void,
    ): void;

    /** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
    abstract exists(path: string, callback?: (exists: boolean) => void): void;

    abstract link(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract symlink(
        srcPath: string,
        dstPath: string,
        type: string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract symlink(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract readlink(
        path: string,
        callback?: (err: Error | null, linkContents: string) => void,
    ): void;

    abstract unlink(path: string, callback?: (err: Error | null) => void): void;

    abstract mknod(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract rmdir(path: string, callback?: (err: Error | null) => void): void;

    abstract mkdir(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract mkdir(path: string, callback?: (err: Error | null) => void): void;

    abstract access(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract access(path: string, callback?: (err: Error | null) => void): void;

    abstract mkdtemp(
        prefix: string,
        options: { encoding: string } | string,
        callback?: (err: Error | null, path: string) => void,
    ): void;

    abstract mkdtemp(
        prefix: string,
        callback?: (err: Error | null, path: string) => void,
    ): void;

    abstract readdir(
        path: string,
        options: { encoding: string; withFileTypes: boolean } | string,
        callback?: (err: Error | null, files: string[]) => void,
    ): void;

    abstract readdir(
        path: string,
        callback?: (err: Error | null, files: string[]) => void,
    ): void;

    abstract close(fd: AnuraFD, callback?: (err: Error | null) => void): void;

    abstract open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode: number,
        callback?: (err: Error | null, fd: AnuraFD) => void,
    ): void;

    abstract open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        callback?: (err: Error | null, fd: AnuraFD) => void,
    ): void;

    abstract utimes(
        path: string,
        atime: number | Date,
        mtime: number | Date,
        callback?: (err: Error | null) => void,
    ): void;

    abstract futimes(
        fd: AnuraFD,
        atime: number | Date,
        mtime: number | Date,
        callback?: (err: Error | null) => void,
    ): void;

    abstract chown(
        path: string,
        uid: number,
        gid: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract fchown(
        fd: AnuraFD,
        uid: number,
        gid: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract chmod(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract fchmod(
        fd: AnuraFD,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    abstract fsync(fd: AnuraFD, callback?: (err: Error | null) => void): void;

    abstract write(
        fd: AnuraFD,
        buffer: Uint8Array,
        offset: number,
        length: number,
        position: number | null,
        callback?: (err: Error | null, nbytes: number) => void,
    ): void;

    abstract read(
        fd: AnuraFD,
        buffer: Uint8Array,
        offset: number,
        length: number,
        position: number | null,
        callback?: (
            err: Error | null,
            nbytes: number,
            buffer: Uint8Array,
        ) => void,
    ): void;

    abstract readFile(
        path: string,
        callback?: (err: Error | null, data: Uint8Array) => void,
    ): void;

    abstract writeFile(
        path: string,
        data: Uint8Array | string,
        options:
            | { encoding: string; flag: "r" | "r+" | "w" | "w+" | "a" | "a+" }
            | string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract writeFile(
        path: string,
        data: Uint8Array | string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract appendFile(
        path: string,
        data: Uint8Array,
        callback?: (err: Error | null) => void,
    ): void;

    abstract setxattr(
        path: string,
        name: string,
        value: string | object,
        flag: "CREATE" | "REPLACE",
        callback?: (err: Error | null) => void,
    ): void;

    abstract setxattr(
        path: string,
        name: string,
        value: string | object,
        callback?: (err: Error | null) => void,
    ): void;

    abstract fsetxattr(
        fd: AnuraFD,
        name: string,
        value: string | object,
        flag: "CREATE" | "REPLACE",
        callback?: (err: Error | null) => void,
    ): void;

    abstract fsetxattr(
        fd: AnuraFD,
        name: string,
        value: string | object,
        callback?: (err: Error | null) => void,
    ): void;

    abstract getxattr(
        path: string,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ): void;

    abstract fgetxattr(
        fd: AnuraFD,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ): void;

    abstract removexattr(
        path: string,
        name: string,
        callback?: (err: Error | null) => void,
    ): void;

    abstract fremovexattr(
        fd: AnuraFD,
        name: string,
        callback?: (err: Error | null) => void,
    ): void;

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
        getxattr(path: string, name: string): Promise<string | object>;
        link(srcPath: string, dstPath: string): Promise<void>;
        lstat(path: string): Promise<TStats>;
        mkdir(path: string, mode?: number): Promise<void>;
        mkdtemp(
            prefix: string,
            options?: { encoding: string },
        ): Promise<string>;
        mknod(path: string, mode: number): Promise<void>;
        open(
            path: string,
            flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
            mode?: number,
        ): Promise<AnuraFD>;
        readdir(
            path: string,
            options?: string | { encoding: string; withFileTypes: boolean },
        ): Promise<string[]>;
        readFile(path: string): Promise<Uint8Array>;
        readlink(path: string): Promise<string>;
        removexattr(path: string, name: string): Promise<void>;
        rename(oldPath: string, newPath: string): Promise<void>;
        rmdir(path: string): Promise<void>;
        setxattr(
            path: string,
            name: string,
            value: string | object,
            flag?: "CREATE" | "REPLACE",
        ): Promise<void>;
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

class FilerAFSProvider extends AFSProvider<any> {
    domain = "/";
    name = "Filer";
    version = "1.0.0";

    fs: FilerFS;

    constructor(fs: FilerFS) {
        super();
        this.fs = fs;
    }

    rename(
        oldPath: string,
        newPath: string,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.rename(oldPath, newPath, callback);
    }

    ftruncate(
        fd: AnuraFD,
        len: number,
        callback?: (err: Error | null, fd: AnuraFD) => void,
    ) {
        this.fs.ftruncate(fd.fd, len, (err, fd) =>
            callback!(err, { fd, [AnuraFDSymbol]: this.domain }),
        );
    }

    truncate(
        path: string,
        len: number,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.truncate(path, len, callback);
    }

    stat(path: string, callback?: (err: Error | null, stats: any) => void) {
        this.fs.stat(path, callback);
    }

    fstat(
        fd: AnuraFD,
        callback?: ((err: Error | null, stats: any) => void) | undefined,
    ): void {
        this.fs.fstat(fd.fd, callback);
    }

    lstat(path: string, callback?: (err: Error | null, stats: any) => void) {
        this.fs.lstat(path, callback);
    }

    /** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
    exists(path: string, callback?: (exists: boolean) => void) {
        this.fs.exists(path, callback);
    }

    link(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.link(srcPath, dstPath, callback);
    }

    symlink(path: string, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.symlink(path, ...rest);
    }

    readlink(
        path: string,
        callback?: (err: Error | null, linkContents: string) => void,
    ) {
        this.fs.readlink(path, callback);
    }

    unlink(path: string, callback?: (err: Error | null) => void) {
        this.fs.unlink(path, callback);
    }

    mknod(path: string, mode: number, callback?: (err: Error | null) => void) {
        this.fs.mknod(path, mode, callback);
    }

    rmdir(path: string, callback?: (err: Error | null) => void) {
        this.fs.rmdir(path, callback);
    }

    mkdir(path: string, ...rest: any[]) {
        this.fs.mkdir(path, ...rest);
    }

    access(path: string, ...rest: any[]) {
        this.fs.access(path, ...rest);
    }

    mkdtemp(...args: any[]) {
        // Temp directories should remain in the root filesystem for now
        // @ts-ignore - Overloaded methods are scary
        this.fs.mkdtemp(...args);
    }

    readdir(path: string, ...rest: any[]) {
        this.fs.readdir(path, ...rest);
    }

    close(
        fd: AnuraFD,
        callback?: ((err: Error | null) => void) | undefined,
    ): void {
        callback ||= () => {};
        this.fs.close(fd.fd, callback);
    }

    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode: number,
        callback?: ((err: Error | null, fd: AnuraFD) => void) | undefined,
    ): void;
    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        callback?: ((err: Error | null, fd: AnuraFD) => void) | undefined,
    ): void;
    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode?: unknown,
        callback?: unknown,
    ): void {
        if (typeof mode === "number") {
            this.fs.open(path, flags, mode, (err, fd) =>
                (callback as (err: Error | null, fd: AnuraFD) => void)!(err, {
                    fd,
                    [AnuraFDSymbol]: this.domain,
                }),
            );
        } else {
            this.fs.open(path, flags, (err, fd) =>
                (mode as (err: Error | null, fd: AnuraFD) => void)!(err, {
                    fd,
                    [AnuraFDSymbol]: this.domain,
                }),
            );
        }
    }

    utimes(
        path: string,
        atime: number | Date,
        mtime: number | Date,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.utimes(path, atime, mtime, callback);
    }

    futimes(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.futimes(fd.fd, ...rest);
    }

    chown(
        path: string,
        uid: number,
        gid: number,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.chown(path, uid, gid, callback);
    }

    fchown(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.fchown(fd.fd, ...rest);
    }

    chmod(path: string, mode: number, callback?: (err: Error | null) => void) {
        this.fs.chmod(path, mode, callback);
    }

    fchmod(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.fchmod(fd.fd, ...rest);
    }

    fsync(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.fsync(fd.fd, ...rest);
    }

    write(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.write(fd.fd, ...rest);
    }

    read(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.read(fd.fd, ...rest);
    }

    readFile(
        path: string,
        callback?: (err: Error | null, data: Uint8Array) => void,
    ) {
        this.fs.readFile(path, callback);
    }

    writeFile(path: string, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.writeFile(path, ...rest);
    }

    appendFile(
        path: string,
        data: Uint8Array,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.appendFile(path, data, callback);
    }

    setxattr(path: string, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.setxattr(path, ...rest);
    }

    fsetxattr(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.fsetxattr(fd.fd, ...rest);
    }

    getxattr(
        path: string,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ) {
        this.fs.getxattr(path, name, callback);
    }

    fgetxattr(
        fd: AnuraFD,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ) {
        this.fs.fgetxattr(fd.fd, name, callback);
    }

    removexattr(
        path: string,
        name: string,
        callback?: (err: Error | null) => void,
    ) {
        this.fs.removexattr(path, name, callback);
    }

    fremovexattr(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.fs.fremovexattr(fd.fd, ...rest);
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
        chmod: (path: string, mode: number) =>
            this.fs.promises.chmod(path, mode),
        getxattr: (path: string, name: string) =>
            this.fs.promises.getxattr(path, name),
        link: (srcPath: string, dstPath: string) =>
            this.fs.promises.link(srcPath, dstPath),
        lstat: (path: string) => this.fs.promises.lstat(path),
        mkdir: (path: string, mode?: number) =>
            this.fs.promises.mkdir(path, mode),
        mkdtemp: (prefix: string, options?: { encoding: string }) =>
            this.fs.promises.mkdtemp(prefix, options),
        mknod: (path: string, mode: number) =>
            this.fs.promises.mknod(path, mode),
        open: async (
            path: string,
            flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
            mode?: number,
        ) => ({
            fd: await this.fs.promises.open(path, flags, mode),
            [AnuraFDSymbol]: this.domain,
        }),
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
        setxattr: (
            path: string,
            name: string,
            value: string | object,
            flag?: "CREATE" | "REPLACE",
        ) => this.fs.promises.setxattr(path, name, value, flag),
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

class LocalFS extends AFSProvider<any> {
    dirHandle: FileSystemDirectoryHandle;
    domain: string;
    name = "LocalFS";
    version = "1.0.0";

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

    randomId() {
        return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
            /[xy]/g,
            function (c) {
                const r = (Math.random() * 16) | 0,
                    v = c == "x" ? r : (r & 0x3) | 0x8;
                return v.toString(16).toUpperCase();
            },
        );
    }

    async getChildDirHandle(path: string) {
        if (path === "") {
            return this.dirHandle;
        }
        if (path.endsWith("/")) {
            path = path.substring(0, path.length - 1);
        }
        let acc = this.dirHandle;
        for await (const part of path.split("/")) {
            acc = await acc.getDirectoryHandle(part);
        }
        return acc;
    }

    static async new(anuraPath: string) {
        const dirHandle = await window.showDirectoryPicker({
            id: `anura-${anuraPath.replace(/\/|\s/g, "-")}`,
        });
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

    readdir(
        path: string,
        _options?: any,
        callback?: (err: Error | null, files: string[]) => void,
    ) {
        if (typeof _options === "function") {
            callback = _options;
        }
        callback ||= () => {};
        this.promises
            .readdir(path)
            .then((files) => callback!(null, files))
            .catch((e) => callback!(e, []));
    }
    stat(
        path: string,
        callback?: (err: Error | null, stats: any) => void,
    ): void {
        callback ||= () => {};
        this.promises
            .stat(path)
            .then((stats) => callback!(null, stats))
            .catch((e) => callback!(e, null));
    }
    readFile(
        path: string,
        callback?: (err: Error | null, data: typeof Filer.Buffer) => void,
    ) {
        callback ||= () => {};
        this.promises
            .readFile(path)
            .then((data) => callback!(null, data))
            .catch((e) => callback!(e, new Filer.Buffer(0)));
    }
    writeFile(
        path: string,
        data: Uint8Array | string,
        _options?: any,
        callback?: (err: Error | null) => void,
    ) {
        if (typeof data === "string") {
            data = new TextEncoder().encode(data);
        }
        if (typeof _options === "function") {
            callback = _options;
        }
        callback ||= () => {};

        this.promises
            .writeFile(path, data)
            .then(() => callback!(null))
            .catch(callback);
    }
    appendFile(
        path: string,
        data: Uint8Array,
        callback?: (err: Error | null) => void,
    ) {
        this.promises
            .appendFile(path, data)
            .then(() => callback!(null))
            .catch(callback);
    }
    unlink(path: string, callback?: (err: Error | null) => void) {
        callback ||= () => {};
        this.promises
            .unlink(path)
            .then(() => callback!(null))
            .catch(callback);
    }
    mkdir(path: string, _mode?: any, callback?: (err: Error | null) => void) {
        if (typeof _mode === "function") {
            callback = _mode;
        }
        callback ||= () => {};
        this.promises
            .mkdir(path)
            .then(() => callback!(null))
            .catch(callback);
    }
    rmdir(path: string, callback?: (err: Error | null) => void) {
        callback ||= () => {};
        this.promises
            .rmdir(path)
            .then(() => callback!(null))
            .catch(callback);
    }
    rename(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ) {
        callback ||= () => {};
        this.promises
            .rename(srcPath, dstPath)
            .then(() => callback!(null))
            .catch(callback);
    }

    truncate(
        path: string,
        len: number,
        callback?: (err: Error | null) => void,
    ) {
        this.promises
            .truncate(path, len)
            .then(() => callback!(null))
            .catch(callback);
    }
    /** @deprecated — fs.exists() is an anachronism and exists only for historical reasons. */
    exists(path: string, callback?: (exists: boolean) => void) {
        this.stat(path, (err, stats) => {
            if (err) {
                callback!(false);
                return;
            }
            callback!(true);
        });
    }

    promises = {
        writeFile: async (
            path: string,
            data: Uint8Array | string,
            options?: any,
        ) => {
            if (typeof data === "string") {
                data = new TextEncoder().encode(data);
            }
            let parentHandle = this.dirHandle;
            path = this.relativizePath(path);
            if (path.includes("/")) {
                const parts = path.split("/");
                const finalFile = parts.pop();
                parentHandle = await this.getChildDirHandle(parts.join("/"));
                path = finalFile!;
            }
            const handle = await parentHandle.getFileHandle(path, {
                create: true,
            });
            const writer = await handle.createWritable();
            writer.write(data);
            writer.close();
        },
        readFile: async (path: string) => {
            let parentHandle = this.dirHandle;
            path = this.relativizePath(path);
            if (path.includes("/")) {
                const parts = path.split("/");
                const finalFile = parts.pop();
                parentHandle = await this.getChildDirHandle(parts.join("/"));
                path = finalFile!;
            }
            const handle = await parentHandle.getFileHandle(path);
            return new Filer.Buffer(
                await (await handle.getFile()).arrayBuffer(),
            );
        },
        readdir: async (path: string) => {
            const dirHandle = await this.getChildDirHandle(
                this.relativizePath(path),
            );
            const nodes: string[] = [];
            for await (const entry of dirHandle.values()) {
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
                parentHandle = await this.getChildDirHandle(parts.join("/"));
                path = finalFile!;
            }
            await parentHandle.removeEntry(path);
        },
        mkdir: async (path: string) => {
            let parentHandle = this.dirHandle;
            path = this.relativizePath(path);
            if (path.includes("/")) {
                const parts = path.split("/");
                const finalDir = parts.pop();
                parentHandle = await this.getChildDirHandle(parts.join("/"));
                path = finalDir!;
            }
            await parentHandle.getDirectoryHandle(path, { create: true });
        },
        rmdir: async (path: string) => {
            let parentHandle = this.dirHandle;
            path = this.relativizePath(path);
            if (path.includes("/")) {
                const parts = path.split("/");
                const finalDir = parts.pop();
                parentHandle = await this.getChildDirHandle(parts.join("/"));
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
            let handle;
            try {
                if (path === "") {
                    handle = await this.dirHandle.getFileHandle(path);
                } else {
                    handle = await (
                        await this.getChildDirHandle(
                            path.substring(0, path.lastIndexOf("/")),
                        )
                    ).getFileHandle(path.substring(path.lastIndexOf("/") + 1));
                }
            } catch (e) {
                try {
                    const handle = await this.getChildDirHandle(path);
                    return {
                        name:
                            path === ""
                                ? this.domain.split("/").pop()
                                : handle.name,
                        size: 0,
                        atime: new Date(Date.now()),
                        mtime: new Date(Date.now()),
                        ctime: new Date(Date.now()),
                        atimeMs: Date.now(),
                        mtimeMs: Date.now(),
                        ctimeMs: Date.now(),
                        node: this.randomId(),
                        nlinks: 1,
                        mode: 16877,
                        type: "DIRECTORY",
                        uid: 0,
                        gid: 0,
                        isFile: () => false,
                        isDirectory: () => true,
                        isSymbolicLink: () => false,
                        dev: "localfs",
                    };
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
            return {
                name: file.name,
                size: file.size,
                // Best we can do for now is to use the last modified time for all times
                atime: new Date(file.lastModified),
                mtime: new Date(file.lastModified),
                ctime: new Date(file.lastModified),
                atimeMs: file.lastModified,
                mtimeMs: file.lastModified,
                ctimeMs: file.lastModified,
                node: this.randomId(),
                nlinks: 1,
                mode: 33188,
                type: "FILE",
                uid: 0,
                gid: 0,
                isFile: () => true,
                isDirectory: () => false,
                isSymbolicLink: () => false,
                dev: "localfs",
            };
        },
        truncate: async (path: string, len: number) => {
            const data = await this.promises.readFile(path);
            await this.promises.writeFile(path, data.slice(0, len));
        },
        access: () => {
            console.error("Not implemented: access");
            throw new Error("Not implemented");
        },
        chown: () => {
            console.error("Not implemented: chown");
            throw new Error("Not implemented");
        },
        chmod: () => {
            console.error("Not implemented: chmod");
            throw new Error("Not implemented");
        },
        getxattr: () => {
            console.error("Not implemented: getxattr");
            throw new Error("Not implemented");
        },
        link: () => {
            console.error("Not implemented: link");
            throw new Error("Not implemented");
        },
        lstat: (...args: any[]) => {
            // @ts-ignore - This is just here for compat with v86
            return this.promises.stat(...args);
        },
        mkdtemp: () => {
            console.error("Not implemented: mkdtemp");
            throw new Error("Not implemented");
        },
        mknod: () => {
            console.error("Not implemented: mknod");
            throw new Error("Not implemented");
        },
        open: async (
            path: string,
            _flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
            _mode?: any,
        ) => {
            let parentHandle = this.dirHandle;
            if (path.includes("/")) {
                const parts = path.split("/");
                const finalFile = parts.pop();
                parentHandle = await this.getChildDirHandle(parts.join("/"));
                path = finalFile!;
            }
            const handle = await parentHandle.getFileHandle(path, {
                create: true,
            });
            this.fds.push(handle);
            return {
                fd: this.fds.length - 1,
                [AnuraFDSymbol]: this.domain,
            };
        },
        readlink: () => {
            console.error("Not implemented: readlink");
            throw new Error("Not implemented");
        },
        removexattr: () => {
            console.error("Not implemented: removexattr");
            throw new Error("Not implemented");
        },
        setxattr: () => {
            console.error("Not implemented: setxattr");
            throw new Error("Not implemented");
        },
        symlink: () => {
            console.error("Not implemented: symlink");
            throw new Error("Not implemented");
        },
        utimes: () => {
            console.error("Not implemented: utimes");
            throw new Error("Not implemented");
        },
    };

    ftruncate() {
        console.error("Not implemented: ftruncate");
        throw new Error("Method not implemented.");
    }

    fstat(fd: AnuraFD, callback: (err: Error | null, stats: any) => void) {
        callback ||= () => {};
        const handle = this.fds[fd.fd];
        if (handle === undefined) {
            callback(
                {
                    name: "EBADF",
                    code: "EBADF",
                    errno: 9,
                    message: "bad file descriptor",
                    stack: "Error: bad file descriptor",
                } as Error,
                null,
            );
            return;
        }

        if (handle.kind === "file") {
            (handle as FileSystemFileHandle).getFile().then((file) => {
                callback(null, {
                    name: file.name,
                    size: file.size,
                    atime: new Date(file.lastModified),
                    mtime: new Date(file.lastModified),
                    ctime: new Date(file.lastModified),
                    atimeMs: file.lastModified,
                    mtimeMs: file.lastModified,
                    ctimeMs: file.lastModified,
                    node: this.randomId(),
                    nlinks: 1,
                    mode: 33188,
                    type: "FILE",
                    uid: 0,
                    gid: 0,
                    isFile: () => true,
                    isDirectory: () => false,
                    isSymbolicLink: () => false,
                    dev: "localfs",
                });
            });
        } else {
            callback(
                {
                    name: "EISDIR",
                    code: "EISDIR",
                    errno: 21,
                    message: "Is a directory",
                    stack: "Error: Is a directory",
                } as Error,
                null,
            );
        }
    }

    lstat(...args: any[]) {
        // @ts-ignore - This is just here for compat with v86
        return this.stat(...args);
    }

    link() {
        console.error("Not implemented: link");
        throw new Error("Method not implemented.");
    }

    symlink() {
        console.error("Not implemented: symlink");
        throw new Error("Method not implemented.");
    }

    readlink() {
        console.error("Not implemented: readlink");
        throw new Error("Method not implemented.");
    }

    mknod() {
        console.error("Not implemented: mknod");
        throw new Error("Method not implemented.");
    }

    access() {
        console.error("Not implemented: access");
        throw new Error("Method not implemented.");
    }

    mkdtemp() {
        console.error("Not implemented: mkdtemp");
        throw new Error("Method not implemented.");
    }

    fchown() {
        console.error("Not implemented: fchown");
        throw new Error("Method not implemented.");
    }

    chmod() {
        console.error("Not implemented: chmod");
        throw new Error("Method not implemented.");
    }

    fchmod() {
        console.error("Not implemented: fchmod");
        throw new Error("Method not implemented.");
    }

    fsync() {
        console.error("Not implemented: fsync");
        throw new Error("Method not implemented.");
    }

    write(
        fd: AnuraFD,
        buffer: Uint8Array,
        offset: number,
        length: number,
        position: number | null,
        callback?: (err: Error | null, nbytes: number) => void,
    ) {
        callback ||= () => {};
        const handle = this.fds[fd.fd];
        if (position !== null) {
            position += this.cursors[fd.fd] || 0;
        } else {
            position = this.cursors[fd.fd] || 0;
        }
        if (handle === undefined) {
            callback(
                {
                    name: "EBADF",
                    code: "EBADF",
                    errno: 9,
                    message: "bad file descriptor",
                    stack: "Error: bad file descriptor",
                } as Error,
                0,
            );
            return;
        }
        if (handle.kind === "directory") {
            callback(
                {
                    name: "EISDIR",
                    code: "EISDIR",
                    errno: 21,
                    message: "Is a directory",
                    stack: "Error: Is a directory",
                } as Error,
                0,
            );
            return;
        }
        const bufferSlice = buffer.slice(offset, offset + length);
        (handle as FileSystemFileHandle).createWritable().then((writer) => {
            writer.seek(position || 0);
            writer.write(bufferSlice);
            writer.close();
            this.cursors[fd.fd] = (position || 0) + bufferSlice.length;
            callback!(null, bufferSlice.length);
        });
    }

    read() {
        console.error("Not implemented: read");
        throw new Error("Method not implemented.");
    }

    setxattr() {
        console.error("Not implemented: setxattr");
        throw new Error("Method not implemented.");
    }

    fsetxattr() {
        console.error("Not implemented: fsetxattr");
        throw new Error("Method not implemented.");
    }

    getxattr() {
        console.error("Not implemented: getxattr");
        throw new Error("Method not implemented.");
    }

    fgetxattr() {
        console.error("Not implemented: fgetxattr");
        throw new Error("Method not implemented.");
    }

    removexattr() {
        console.error("Not implemented: removexattr");
        throw new Error("Method not implemented.");
    }

    fremovexattr() {
        console.error("Not implemented: fremovexattr");
        throw new Error("Method not implemented.");
    }

    utimes() {
        console.error("Not implemented: utimes");
        throw new Error("Method not implemented.");
    }

    futimes() {
        console.error("Not implemented: futimes");
        throw new Error("Method not implemented.");
    }

    chown() {
        console.error("Not implemented: chown");
        throw new Error("Method not implemented.");
    }

    close(fd: AnuraFD, callback: (err: Error | null) => void) {
        callback ||= () => {};
        const handle = this.fds[fd.fd];
        if (handle === undefined) {
            callback({
                name: "EBADF",
                code: "EBADF",
                errno: 9,
                message: "bad file descriptor",
                stack: "Error: bad file descriptor",
            } as Error);
            return;
        }
        delete this.fds[fd.fd];
        callback(null);
    }

    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode?: any,
        callback?: ((err: Error | null, fd: AnuraFD) => void) | undefined,
    ): void {
        path = this.relativizePath(path);
        if (typeof mode === "function") {
            callback = mode;
        }
        callback ||= () => {};
        this.promises
            .open(path, flags, mode)
            .then((fd) => {
                callback!(null, fd);
            })
            .catch((e) =>
                callback!(e, { fd: -1, [AnuraFDSymbol]: this.domain }),
            );
    }
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
                contents += data.toString() + "\n";
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
            exec?: (path: string, next: () => void) => void;
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
                results = results.filter((file) =>
                    file.includes(options.name!),
                );
            }
            if (options.path) {
                results = results.filter((file) =>
                    file.includes(options.path!),
                );
            }
            if (options.exec) {
                let remaining = results.length;
                results.forEach((file) => {
                    options.exec!(file, () => {
                        remaining--;
                        if (remaining === 0) {
                            callback!(null, results);
                        }
                    });
                });
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
    ls(
        dir: string,
        callback?: (err: Error | null, entries: any[]) => void,
    ): void;
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
            this.find(
                dir,
                {
                    exec: (path, next = () => {}) => {
                        entries.push(path);
                        next();
                    },
                },
                (err, _) => {
                    if (err) {
                        callback!(err, []);
                        return;
                    }
                    callback!(null, entries);
                },
            );
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
        const parts = this.#relativeToAbsolute(path).split("/");
        callback ||= () => {};
        parts.reduce((acc, part) => {
            acc += "/" + part;
            anura.fs.mkdir(acc, (err: Error | null) => {
                if (err) {
                    callback(err);
                    return;
                }
            });
            return acc;
        });
        callback(null);
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
                    anura.fs.readdir(
                        path,
                        (err: Error | null, files: string[]) => {
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
                        },
                    );
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
                    callback!(
                        new Error("File does not exist and updateOnly is true"),
                    );
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
                    await anura.fs.promises.readFile(
                        this.#relativeToAbsolute(file),
                    )
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
                exec?: (path: string, next: () => void) => void;
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
        mkdirp: (path: string) => {
            return new Promise<void>((resolve, reject) => {
                this.mkdirp(path, (err) => {
                    if (err) {
                        reject(err);
                        return;
                    }
                    resolve();
                });
            });
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
    providerCache: { [path: string]: AFSProvider<any> } = {};

    // Note: Intentionally aliasing the property to a class instead of an instance
    static Shell = AFSShell;
    Shell = AFSShell;

    constructor(providers: AFSProvider<any>[]) {
        providers.forEach((provider) => {
            this.providers.set(provider.domain, provider);
            if (provider.domain === "/") {
                // The Shell is defined by the root filesystem. This is a bit of a hack
                // and should potentially be manually reimplemented or outright removed
                // in the next major version. It will not yet be deprecated, but it does
                // have the potential to be removed in the future.
                this.Shell = (provider as FilerAFSProvider).fs.Shell;
            }
        });
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

    processFD(fd: AnuraFD): AFSProvider<any> {
        return this.processPath(fd[AnuraFDSymbol]);
    }

    rename(
        oldPath: string,
        newPath: string,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(oldPath).rename(oldPath, newPath, callback);
    }

    ftruncate(
        fd: AnuraFD,
        len: number,
        callback?: (err: Error | null, fd: AnuraFD) => void,
    ) {
        this.processFD(fd).ftruncate(fd, len, callback);
    }

    truncate(
        path: string,
        len: number,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(path).truncate(path, len, callback);
    }

    stat(path: string, callback?: (err: Error | null, stats: any) => void) {
        this.processPath(path).stat(path, callback);
    }

    fstat(
        fd: AnuraFD,
        callback?: ((err: Error | null, stats: any) => void) | undefined,
    ): void {
        this.processFD(fd).fstat(fd, callback);
    }

    lstat(path: string, callback?: (err: Error | null, stats: any) => void) {
        this.processPath(path).lstat(path, callback);
    }

    /** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
    exists(path: string, callback?: (exists: boolean) => void) {
        this.processPath(path).exists(path, callback);
    }

    link(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(srcPath).link(srcPath, dstPath, callback);
    }

    symlink(path: string, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processPath(path).symlink(path, ...rest);
    }

    readlink(
        path: string,
        callback?: (err: Error | null, linkContents: string) => void,
    ) {
        this.processPath(path).readlink(path, callback);
    }

    unlink(path: string, callback?: (err: Error | null) => void) {
        this.processPath(path).unlink(path, callback);
    }

    mknod(path: string, mode: number, callback?: (err: Error | null) => void) {
        this.processPath(path).mknod(path, mode, callback);
    }

    rmdir(path: string, callback?: (err: Error | null) => void) {
        this.processPath(path).rmdir(path, callback);
    }

    mkdir(path: string, ...rest: any[]) {
        this.processPath(path).mkdir(path, ...rest);
    }

    access(path: string, ...rest: any[]) {
        this.processPath(path).access(path, ...rest);
    }

    mkdtemp(...args: any[]) {
        // Temp directories should remain in the root filesystem for now
        // @ts-ignore - Overloaded methods are scary
        this.providers.get("/")!.mkdtemp(...args);
    }

    readdir(path: string, ...rest: any[]) {
        this.processPath(path).readdir(path, ...rest);
    }

    close(
        fd: AnuraFD,
        callback?: ((err: Error | null) => void) | undefined,
    ): void {
        this.processFD(fd).close(fd, callback);
    }

    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode: number,
        callback?: ((err: Error | null, fd: AnuraFD) => void) | undefined,
    ): void;
    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        callback?: ((err: Error | null, fd: AnuraFD) => void) | undefined,
    ): void;
    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode?: unknown,
        callback?: unknown,
    ): void {
        if (typeof mode === "number") {
            this.processPath(path as string).open(
                path,
                flags,
                mode as number,
                callback as (err: Error | null, fd: AnuraFD) => void,
            );
        } else {
            this.processPath(path as string).open(
                path,
                flags,
                mode as (err: Error | null, fd: AnuraFD) => void,
            );
        }
    }

    utimes(
        path: string,
        atime: number | Date,
        mtime: number | Date,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(path).utimes(path, atime, mtime, callback);
    }

    futimes(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).futimes(fd, ...rest);
    }

    chown(
        path: string,
        uid: number,
        gid: number,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(path).chown(path, uid, gid, callback);
    }

    fchown(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).fchown(fd, ...rest);
    }

    chmod(path: string, mode: number, callback?: (err: Error | null) => void) {
        this.processPath(path).chmod(path, mode, callback);
    }

    fchmod(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).fchmod(fd, ...rest);
    }

    fsync(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).fsync(fd, ...rest);
    }

    write(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).write(fd, ...rest);
    }

    read(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).read(fd, ...rest);
    }

    readFile(
        path: string,
        callback?: (err: Error | null, data: Uint8Array) => void,
    ) {
        this.processPath(path).readFile(path, callback);
    }

    writeFile(path: string, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processPath(path).writeFile(path, ...rest);
    }

    appendFile(
        path: string,
        data: Uint8Array,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(path).appendFile(path, data, callback);
    }

    setxattr(path: string, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processPath(path).setxattr(path, ...rest);
    }

    fsetxattr(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).fsetxattr(fd, ...rest);
    }

    getxattr(
        path: string,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ) {
        this.processPath(path).getxattr(path, name, callback);
    }

    fgetxattr(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).fgetxattr(fd, ...rest);
    }

    removexattr(
        path: string,
        name: string,
        callback?: (err: Error | null) => void,
    ) {
        this.processPath(path).removexattr(path, name, callback);
    }

    fremovexattr(fd: AnuraFD, ...rest: any[]) {
        // @ts-ignore - Overloaded methods are scary
        this.processFD(fd).fremovexattr(fd, ...rest);
    }
    // @ts-ignore - This is still being implemented.
    promises = {
        appendFile: (
            path: string,
            data: Uint8Array,
            options: { encoding: string; mode: number; flag: string },
        ) => this.processPath(path).promises.appendFile(path, data, options),
        access: (path: string, mode?: number) =>
            this.processPath(path).promises.access(path, mode),
        chown: (path: string, uid: number, gid: number) =>
            this.processPath(path).promises.chown(path, uid, gid),
        chmod: (path: string, mode: number) =>
            this.processPath(path).promises.chmod(path, mode),
        getxattr: (path: string, name: string) =>
            this.processPath(path).promises.getxattr(path, name),
        link: (srcPath: string, dstPath: string) =>
            this.processPath(srcPath).promises.link(srcPath, dstPath),
        lstat: (path: string) => this.processPath(path).promises.lstat(path),
        mkdir: (path: string, mode?: number) =>
            this.processPath(path).promises.mkdir(path, mode),
        mkdtemp: (prefix: string, options?: { encoding: string }) =>
            this.providers.get("/")!.promises.mkdtemp(prefix, options),
        mknod: (path: string, mode: number) =>
            this.processPath(path).promises.mknod(path, mode),
        open: async (
            path: string,
            flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
            mode?: number,
        ) => this.processPath(path).promises.open(path, flags, mode),
        readdir: (
            path: string,
            options?: string | { encoding: string; withFileTypes: boolean },
        ) => this.processPath(path).promises.readdir(path, options),
        readFile: (path: string) =>
            this.processPath(path).promises.readFile(path),
        readlink: (path: string) =>
            this.processPath(path).promises.readlink(path),
        removexattr: (path: string, name: string) =>
            this.processPath(path).promises.removexattr(path, name),
        rename: (oldPath: string, newPath: string) =>
            this.processPath(oldPath).promises.rename(oldPath, newPath),
        rmdir: (path: string) => this.processPath(path).promises.rmdir(path),
        setxattr: (
            path: string,
            name: string,
            value: string | object,
            flag?: "CREATE" | "REPLACE",
        ) => this.processPath(path).promises.setxattr(path, name, value, flag),
        stat: (path: string) => this.processPath(path).promises.stat(path),
        symlink: (srcPath: string, dstPath: string, type?: string) =>
            this.processPath(srcPath).promises.symlink(srcPath, dstPath, type),
        truncate: (path: string, len: number) =>
            this.processPath(path).promises.truncate(path, len),
        unlink: (path: string) => this.processPath(path).promises.unlink(path),
        utimes: (path: string, atime: number | Date, mtime: number | Date) =>
            this.processPath(path).promises.utimes(path, atime, mtime),
        writeFile: (
            path: string,
            data: Uint8Array | string,
            options?: { encoding: string; mode: number; flag: string },
        ) => this.processPath(path).promises.writeFile(path, data, options),
    };
}
