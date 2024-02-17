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

    constructor(dirHandle: FileSystemDirectoryHandle, domain: string) {
        super();
        this.dirHandle = dirHandle;
        this.domain = domain;
        this.name += ` (${domain})`;
    }

    relativizePath(path: string) {
        return path.replace(this.domain, "").replace(/^\/+/, "");
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
                const handle = await this.getChildDirHandle(path);
                return {
                    name: handle.name,
                    size: 0,
                    atime: Date.now(),
                    mtime: Date.now(),
                    ctime: Date.now(),
                    atimeMs: Date.now(),
                    mtimeMs: Date.now(),
                    ctimeMs: Date.now(),
                    type: "DIRECTORY",
                    uid: 0,
                    gid: 0,
                    isFile: () => false,
                    isDirectory: () => true,
                    isSymbolicLink: () => false,
                };
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
                type: "FILE",
                uid: 0,
                gid: 0,
                isFile: () => true,
                isDirectory: () => false,
                isSymbolicLink: () => false,
            };
        },
        truncate: async (path: string, len: number) => {
            const data = await this.promises.readFile(path);
            await this.promises.writeFile(path, data.slice(0, len));
        },
        access: () => {
            throw new Error("Not implemented");
        },
        chown: () => {
            throw new Error("Not implemented");
        },
        chmod: () => {
            throw new Error("Not implemented");
        },
        getxattr: () => {
            throw new Error("Not implemented");
        },
        link: () => {
            throw new Error("Not implemented");
        },
        lstat: () => {
            throw new Error("Not implemented");
        },
        mkdtemp: () => {
            throw new Error("Not implemented");
        },
        mknod: () => {
            throw new Error("Not implemented");
        },
        open: () => {
            throw new Error("Not implemented");
        },
        readlink: () => {
            throw new Error("Not implemented");
        },
        removexattr: () => {
            throw new Error("Not implemented");
        },
        setxattr: () => {
            throw new Error("Not implemented");
        },
        symlink: () => {
            throw new Error("Not implemented");
        },
        utimes: () => {
            throw new Error("Not implemented");
        },
    };

    ftruncate() {
        throw new Error("Method not implemented.");
    }

    fstat(): void {
        throw new Error("Method not implemented.");
    }

    lstat() {
        throw new Error("Method not implemented.");
    }

    link() {
        throw new Error("Method not implemented.");
    }

    symlink() {
        throw new Error("Method not implemented.");
    }

    readlink() {
        throw new Error("Method not implemented.");
    }

    mknod() {
        throw new Error("Method not implemented.");
    }

    access() {
        throw new Error("Method not implemented.");
    }

    mkdtemp() {
        throw new Error("Method not implemented.");
    }

    fchown() {
        throw new Error("Method not implemented.");
    }

    chmod() {
        throw new Error("Method not implemented.");
    }

    fchmod() {
        throw new Error("Method not implemented.");
    }

    fsync() {
        throw new Error("Method not implemented.");
    }

    write() {
        throw new Error("Method not implemented.");
    }

    read() {
        throw new Error("Method not implemented.");
    }

    setxattr() {
        throw new Error("Method not implemented.");
    }

    fsetxattr() {
        throw new Error("Method not implemented.");
    }

    getxattr() {
        throw new Error("Method not implemented.");
    }

    fgetxattr() {
        throw new Error("Method not implemented.");
    }

    removexattr() {
        throw new Error("Method not implemented.");
    }

    fremovexattr() {
        throw new Error("Method not implemented.");
    }

    utimes() {
        throw new Error("Method not implemented.");
    }

    futimes() {
        throw new Error("Method not implemented.");
    }

    chown() {
        throw new Error("Method not implemented.");
    }

    close() {
        throw new Error("Method not implemented.");
    }

    open() {
        throw new Error("Method not implemented.");
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

    Shell: any;

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
            console.log("Checking", checkPath, provider);
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
