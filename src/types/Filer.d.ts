declare let Filer: FilerType;
declare let $el: any;
// [TODO]
type FilerFS = AnuraFSOperations<any> & {
    Shell: any;
};
type FilerType = {
    fs: FilerFS;
    Buffer: any;
    Path: any;
    FileSystem: FilerFS.constructor;
};
