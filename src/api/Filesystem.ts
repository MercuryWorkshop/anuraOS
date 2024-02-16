// TODO: Implement File Descriptor support
// This should be simple enough to implement,
// but it is important to get the rest of the
// filesystem API working first.

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

/**
 * WIP Wrapper for the anura filesystem provided by Filer
 * This should maintain full compatibility with the Filer API
 * and, by extension, should try to be as close to the Node.js
 * filesystem API as possible. This is a WIP and is not yet
 * ready for use. Upon completion, this should be a drop-in
 * replacement for the Filer API, with added support for
 * additional filesystem providers.
 */
class AnuraFilesystem implements AnuraFSOperations<any> {
    providers: Map<string, AFSProvider<any>> = new Map();
    providerCache: { [path: string]: AFSProvider<any> } = {};

    constructor(providers: AFSProvider<any>[]) {
        providers.forEach((provider) => {
            this.providers.set(provider.domain, provider);
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
