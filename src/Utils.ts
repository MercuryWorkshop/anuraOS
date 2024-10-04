const $ = document.querySelector.bind(document);
const sleep = (milliseconds: number) =>
    new Promise((resolve) => setTimeout(resolve, milliseconds));
const dg: { [key: string]: any } = {};

function catBufs(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
    const tmp = new Uint8Array(buffer1.byteLength + buffer2.byteLength);
    tmp.set(new Uint8Array(buffer1), 0);
    tmp.set(new Uint8Array(buffer2), buffer1.byteLength);
    return tmp.buffer;
}

function dbg(ref: object) {
    const name = Object.keys(ref)[0]!;
    dg[name] = name;
}
