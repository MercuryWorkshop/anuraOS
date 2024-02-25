declare let Filer: FilerType;
declare let $el: any;
// TODO: Shell

// Note: this is different from the Anura Filesystem type because file descriptors are internally stored as numbers rather than the AnuraFD type.
// This should still be fully compatible as file descriptors are obtained from other methods and are not created directly. This will only be a
// problem if someone for some reason tries to create a file descriptor manually or did some external logic based on the file descriptor being a
// number.
type FilerFS = {
    Shell: any;

    rename(
        oldPath: string,
        newPath: string,
        callback?: (err: Error | null) => void,
    ): void;

    ftruncate(
        fd: number,
        len: number,
        callback?: (err: Error | null, fd: number) => void,
    ): void;

    truncate(
        path: string,
        len: number,
        callback?: (err: Error | null) => void,
    ): void;

    stat(
        path: string,
        callback?: (err: Error | null, stats: TStats) => void,
    ): void;

    fstat(
        fd: number,
        callback?: (err: Error | null, stats: TStats) => void,
    ): void;

    lstat(
        path: string,
        callback?: (err: Error | null, stats: TStats) => void,
    ): void;

    /** @deprecated fs.exists() is an anachronism and exists only for historical reasons. */
    exists(path: string, callback?: (exists: boolean) => void): void;

    link(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ): void;

    symlink(
        srcPath: string,
        dstPath: string,
        type: string,
        callback?: (err: Error | null) => void,
    ): void;

    symlink(
        srcPath: string,
        dstPath: string,
        callback?: (err: Error | null) => void,
    ): void;

    readlink(
        path: string,
        callback?: (err: Error | null, linkContents: string) => void,
    ): void;

    unlink(path: string, callback?: (err: Error | null) => void): void;

    mknod(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    rmdir(path: string, callback?: (err: Error | null) => void): void;

    mkdir(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    mkdir(path: string, callback?: (err: Error | null) => void): void;

    access(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    access(path: string, callback?: (err: Error | null) => void): void;

    mkdtemp(
        prefix: string,
        options: { encoding: string } | string,
        callback?: (err: Error | null, path: string) => void,
    ): void;

    mkdtemp(
        prefix: string,
        callback?: (err: Error | null, path: string) => void,
    ): void;

    readdir(
        path: string,
        options: { encoding: string; withFileTypes: boolean } | string,
        callback?: (err: Error | null, files: string[]) => void,
    ): void;

    readdir(
        path: string,
        callback?: (err: Error | null, files: string[]) => void,
    ): void;

    close(fd: number, callback?: (err: Error | null) => void): void;

    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        mode: number,
        callback?: (err: Error | null, fd: number) => void,
    ): void;

    open(
        path: string,
        flags: "r" | "r+" | "w" | "w+" | "a" | "a+",
        callback?: (err: Error | null, fd: number) => void,
    ): void;

    utimes(
        path: string,
        atime: number | Date,
        mtime: number | Date,
        callback?: (err: Error | null) => void,
    ): void;

    futimes(
        fd: number,
        atime: number | Date,
        mtime: number | Date,
        callback?: (err: Error | null) => void,
    ): void;

    chown(
        path: string,
        uid: number,
        gid: number,
        callback?: (err: Error | null) => void,
    ): void;

    fchown(
        fd: number,
        uid: number,
        gid: number,
        callback?: (err: Error | null) => void,
    ): void;

    chmod(
        path: string,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    fchmod(
        fd: number,
        mode: number,
        callback?: (err: Error | null) => void,
    ): void;

    fsync(fd: number, callback?: (err: Error | null) => void): void;

    write(
        fd: number,
        buffer: Uint8Array,
        offset: number,
        length: number,
        position: number | null,
        callback?: (err: Error | null, nbytes: number) => void,
    ): void;

    read(
        fd: number,
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

    readFile(
        path: string,
        callback?: (err: Error | null, data: Uint8Array) => void,
    ): void;

    writeFile(
        path: string,
        data: Uint8Array | string,
        options:
            | { encoding: string; flag: "r" | "r+" | "w" | "w+" | "a" | "a+" }
            | string,
        callback?: (err: Error | null) => void,
    ): void;

    writeFile(
        path: string,
        data: Uint8Array | string,
        callback?: (err: Error | null) => void,
    ): void;

    appendFile(
        path: string,
        data: Uint8Array,
        callback?: (err: Error | null) => void,
    ): void;

    setxattr(
        path: string,
        name: string,
        value: string | object,
        flag: "CREATE" | "REPLACE",
        callback?: (err: Error | null) => void,
    ): void;

    setxattr(
        path: string,
        name: string,
        value: string | object,
        callback?: (err: Error | null) => void,
    ): void;

    fsetxattr(
        fd: number,
        name: string,
        value: string | object,
        flag: "CREATE" | "REPLACE",
        callback?: (err: Error | null) => void,
    ): void;

    fsetxattr(
        fd: number,
        name: string,
        value: string | object,
        callback?: (err: Error | null) => void,
    ): void;

    getxattr(
        path: string,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ): void;

    fgetxattr(
        fd: number,
        name: string,
        callback?: (err: Error | null, value: string | object) => void,
    ): void;

    removexattr(
        path: string,
        name: string,
        callback?: (err: Error | null) => void,
    ): void;

    fremovexattr(
        fd: number,
        name: string,
        callback?: (err: Error | null) => void,
    ): void;

    /*
     * Asynchronous FS operations
     */

    promises: {
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
        ): Promise<number>;
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
};
type FilerType = {
    fs: FilerFS;
    Buffer: any;
    Path: any;
    FileSystem: FilerFS.constructor;
};
