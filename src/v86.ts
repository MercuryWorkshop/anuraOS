declare var V86Starter: any;
const decoder = new TextDecoder();
const encoder = new TextEncoder();



class V86Backend {
  sendQueue: Uint8Array[] = [];
  // nextWrite: Uint8Array | null = null;
  openQueue: { (number: number): void; }[] = [];
  onDataCallbacks: { [key: number]: (string: string) => void } = {};
  read_intent_phys_addr: number;
  write_intent_phys_addr: number;
  new_intent_phys_addr: number;
  read_nbytes_phys_addr: number;
  write_nbytes_phys_addr: number;

  emulator;
  //
  // writeLock = false;
  // writeLockQueue: [number, string][] = [];
  //
  constructor() {
    this.emulator = new V86Starter({
      wasm_path: "/lib/v86.wasm",
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: document.getElementById("screen_container"),
      bzimage_initrd_from_filesystem: true,
      // bzimage: {
      //   url: "/images/bzimage",
      //   size: 6126336,
      //   async: false,
      // },
      cmdline: "rw init=/bin/systemd root=host9p 8250.nr_uarts=10 spectre_v2=off pti=off",
      filesystem: {
        basefs: {
          url: "/images/deb-fs.json",
        },
        baseurl: "/images/deb-root-flat/",
      },
      // initial_state: { url: "/images/debian-state-base.bin" },
      bios: { url: "/bios/seabios.bin" },
      vga_bios: { url: "/bios/vgabios.bin" },
      network_relay_url: "ws://relay.widgetry.org/",
      autostart: true,
      // uart1: true,
      // uart2: true,
      // uart3: true,
    });

    // this is a temporary workaround to a bug where v86 inhibits mouse events, causing large swaths of AliceWM logic to break
    // this will mess up if you want to start an x server later
    // setTimeout(() => this.emulator.mouse_adapter.destroy(), 1000);

    let data = "";



    this.emulator.add_listener("serial0-output-char", (char: string) => {
      if (char === "\r") {
        console.log(data);

        this._proc_data(data);
        data = "";
        return;
      }
      data += char;

    });

  }

  closepty(TTYn: number) {
    this.emulator.serial0_send(`c\n${TTYn}`);
  }
  openpty(command: string, onData: (string: string) => void) {
    this.emulator.write_memory([1], this.new_intent_phys_addr);
    this.emulator.serial0_send(`${command}\n`);
    return new Promise((resolve) => {
      this.openQueue.push((number: number) => {
        this.onDataCallbacks[number] = onData;
        resolve(number);
      })
    });
  }
  writepty(TTYn: number, data: string) {
    const bytes = encoder.encode(data);
    // if (this.writeLock) {
    //   // console.log("Dropping Swq" + data);
    //   this.writeLockQueue.push([TTYn, data]);
    //   return;
    // }
    // if (this.nextWrite) {
    //   // console.log("dropping character: " + data);
    //   this.sendQueue.push([TTYn, data]);
    //   return;
    // }
    // console.log("WRITING");
    // this.emulator.serial0_send(`w\n${TTYn}\n${bytes.length}\n`);
    // this.nextWrite = bytes;
    this.emulator.write_memory([TTYn + 1], this.write_intent_phys_addr);
    // let bytes = encoder.encode(data);
    this.emulator.write_memory([bytes.length], this.write_nbytes_phys_addr);

    this.sendQueue.push(bytes);
  }

  _proc_data(data: string) {
    // if (data.includes("^F") && this.writeLock) {
    //   // console.log("removing write lock");
    //   this.writeLock = false;
    //   const queued = this.writeLockQueue.shift();
    //   if (queued) {
    //     this.writepty(queued[0], queued[1])
    //   }
    // }
    //


    const start = data.indexOf("\x05");
    if (start === -1) return; // \005 is our special control code
    data = data.substring(start + 1);
    const parts = data.split(" ");

    console.log("parts: " + parts);


    switch (parts.shift()) {
      case "i": {
        // @ts-ignore
        [this.read_intent_phys_addr,
        // @ts-ignore
        this.write_intent_phys_addr, this.new_intent_phys_addr, this.read_nbytes_phys_addr,
        // @ts-ignore
        this.write_nbytes_phys_addr] = parts.map(p => parseInt(p));
        break;
      }
      case "r": {
        let addr = parseInt(parts[0]!);

        let n_bytes = this.read_uint(this.read_nbytes_phys_addr);
        let n_tty = this.read_uint(this.read_intent_phys_addr) - 1;

        // console.log(`${n_bytes} from ${n_tty} at ${addr}`);
        let mem = this.emulator.read_memory(addr, n_bytes);
        let text = decoder.decode(mem);

        console.log(`text from pty#${n_tty} : ${text}`);
        this.onDataCallbacks[n_tty]!(text);
        break;
      }
      case "w": {
        let addr = parseInt(parts[0]!);
        let bytes = this.sendQueue.shift();
        this.emulator.write_memory(bytes, addr);
      }
      case "n": {
        let func = this.openQueue.shift();
        if (func) {
          func(parseInt(parts[0]!));
        }
      }
    }

    this.emulator.serial0_send("\x06\n"); // ack'd

    // if (parts[0] === "r" && parts.length >= 3) {
    //
    //   this.writeLock = true;
    //   const nPty = parseInt(parts[1]!);
    //   const nBytes = parseInt(parts[2]!);
    //   const addr = parseInt(parts[3]!);
    //
    //   // console.log(`${n_bytes} from ${n_tty} at ${addr}`);
    //   const mem = this.emulator.read_memory(addr, nBytes);
    //   const text = decoder.decode(mem);
    //   // console.log(`text from pty#${n_tty} : ${text}`);
    //   let callback = this.onDataCallbacks[nPty];
    //   if (!callback) return;
    //   callback(text);
    //
    //   this.emulator.serial0_send("\x06\n"); // ack'd
    //   // console.log("ACKING");
    //
    // } else if (parts[0] === "w") {
    //   const addr = parseInt(parts[1]!);
    //   const bytes = this.nextWrite;
    //   this.emulator.write_memory(bytes, addr);
    //
    //   this.emulator.serial0_send("\x06\n"); // ack'd
    //
    //   // console.log("ACKING (w)");
    //   setTimeout(() => this.nextWrite = null, 0);
    //   const queued = this.sendQueue.shift();
    //   if (queued) {
    //     this.writepty(queued[0], queued[1])
    //   }
    //
    // } else if (parts[0] === "n") {
    //   let callback = this.openQueue.shift();
    //   if (!callback) return;
    //   callback(parseInt(parts[1]!));
    //   this.emulator.serial0_send("\x06\n"); // ack'd
    // }
  }
  read_uint(addr: number) {
    let array = this.emulator.read_memory(addr, 4);
    let arrbuf = array.buffer.slice(array.byteOffset, array.byteLength + array.byteOffset);
    let view = new DataView(arrbuf);
    return view.getUint32(0, true);
  }


}
async function a() {
  let emulator = anura.x86!.emulator;
  emulator.serial0_send("\x03\n");
  emulator.serial0_send("rm /hook.c\n");
  emulator.serial0_send("rm /hook\n");
  await new Promise(resolve => setTimeout(resolve, 300));
  emulator.create_file("/hook.c", new TextEncoder().encode(atob(await navigator.clipboard.readText())));
  await new Promise(resolve => setTimeout(resolve, 300));
  anura.x86!.emulator.serial0_send("gcc /hook.c -o /hook -lutil\n");
  anura.x86!.emulator.serial0_send("/hook\n");
}
