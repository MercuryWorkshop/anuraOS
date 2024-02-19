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
