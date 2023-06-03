declare var V86Starter: any;
const decoder = new TextDecoder();
const encoder = new TextEncoder();



class V86Backend {
  sendQueue: [string, number][] = [];
  nextWrite: Uint8Array | null = null;
  openQueue: { (number: number): void; }[] = [];
  onDataCallbacks: { [key: number]: (string: string) => void } = {};
  read_intent_phys_addr: number;
  write_intent_phys_addr: number;
  new_intent_phys_addr: number;
  read_nbytes_phys_addr: number;
  write_nbytes_phys_addr: number;
  s_rows_phys_addr: number;
  s_cols_phys_addr: number;
  resize_intent_phys_addr: number;

  emulator;
  //
  // writeLock = false;
  // writeLockQueue: [number, string][] = [];
  //

  constructor() {
    var fs = new Filer.FileSystem({
      name: "anura-mainContext",
      provider: new Filer.FileSystem.providers.IndexedDB()
    });
    var Path = Filer.Path;
    var Buffer = Filer.Buffer;
    var sh = new fs.Shell();
    //@ts-ignore
    window.fs = fs;
    //@ts-ignore
    window.path = Path;
    //@ts-ignore
    window.sh = sh;
    window.Buffer = Buffer;

    this.emulator = new V86Starter({
      wasm_path: "/lib/v86.wasm",
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: anura.apps["anura.x86mgr"].windowinstance.content.querySelector("div"),
      // bzimage_initrd_from_filesystem: true,
      // bzimage: {
      //   url: "/images/bzimage",
      //   size: 6126336,
      //   async: false,
      // },
      bzimage: {
        url: "/images/bzImage",
        // size: 11967680,
        async: false,
      },
      // hda: {
      //   // url: "images/deb.bin",
      //   buffer: ffs,
      // },
      cmdline: "tsc=reliable mitigations=off random.trust_cpu=on",
      // cmdline: "rw init=/bin/systemd root=host9p 8250.nr_uarts=10 spectre_v2=off pti=off",
      filesystem: { fs, sh, Path, Buffer },
      // initial_state: { url: "/images/debian-state-base.bin" },
      bios: { url: "/bios/seabios.bin" },
      vga_bios: { url: "/bios/vgabios.bin" },
      // network_relay_url: "ws://relay.widgetry.org/",
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
  openpty(command: string, cols: number, rows: number, onData: (string: string) => void) {
    this.write_uint(1, this.new_intent_phys_addr);
    this.write_uint(rows, this.s_rows_phys_addr);
    this.write_uint(cols, this.s_cols_phys_addr);


    this.emulator.serial0_send(`${command}\n`);
    return new Promise((resolve) => {
      this.openQueue.push((number: number) => {
        this.onDataCallbacks[number] = onData;
        resolve(number);
      })
    });
  }
  resizepty(TTYn: number, cols: number, rows: number) {
    this.write_uint(rows, this.s_rows_phys_addr);
    this.write_uint(cols, this.s_cols_phys_addr);
    this.write_uint(TTYn + 1, this.resize_intent_phys_addr);
  }
  writepty(TTYn: number, data: string) {
    const bytes = encoder.encode(data);

    if (this.nextWrite) {
      this.sendQueue.push([data, TTYn]);
      return;
    }

    this.write_uint(TTYn + 1, this.write_intent_phys_addr);

    this.write_uint(bytes.length, this.write_nbytes_phys_addr);

    this.nextWrite = bytes;
  }

  async _proc_data(data: string) {
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



    switch (parts.shift()) {
      case "i": {
        // @ts-ignore, temporary of course
        [this.read_intent_phys_addr,
        // @ts-ignore
        this.write_intent_phys_addr, this.new_intent_phys_addr, this.read_nbytes_phys_addr,
        // @ts-ignore
        this.write_nbytes_phys_addr, this.s_rows_phys_addr, this.s_cols_phys_addr, this.resize_intent_phys_addr] = parts.map(p => parseInt(p));
        break;
      }
      case "r": {
        let addr = parseInt(parts[0]!);

        let n_bytes = this.read_uint(this.read_nbytes_phys_addr);
        let n_tty = this.read_uint(this.read_intent_phys_addr) - 1;

        let mem = this.emulator.read_memory(addr, n_bytes);
        let text = decoder.decode(mem);

        this.onDataCallbacks[n_tty]!(text);
        break;
      }
      case "w": {
        let addr = parseInt(parts[0]!);

        this.emulator.write_memory(this.nextWrite, addr);
        this.nextWrite = null;

        this.write_uint(0, this.write_intent_phys_addr);

        let queued = this.sendQueue.shift();
        if (queued) {
          this.writepty(queued[1], queued[0]);
        }
      }
      case "n": {
        let func = this.openQueue.shift();
        if (func) {
          func(parseInt(parts[0]!));
        }
      }
    }

    this.emulator.serial0_send("\x06\n"); // ack'd

  }
  read_uint(addr: number) {
    let b = this.emulator.read_memory(addr, 4);
    return b[0] + (b[1] << 8) + (b[2] << 16) + (b[3] << 24);
    // it's as shrimple as that
  }
  write_uint(i: number, addr: number) {
    let bytes = [i, i >> 8, i >> 16, i >> 24].map(a => a % 256);
    this.emulator.write_memory(bytes, addr);
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

async function icopier() {
  let r = await fetch("/images/deb-fs.json");
  let resp = await r.json();
  function extractFolder(element: any, path: any) {
    let isFolder = false
    console.log(`${path}/${element[0]}`)
    if (typeof (element[6]) == 'object') {
      isFolder = true
    }
    // console.log("Folder: " + isFolder)
    // if (isFolder) {
    //   element[6].forEach((elementInFolder: any) => {
    //     extractFolder(elementInFolder, `${path}/${element[0]}`)
    //   });
    // }
    if (!isFolder) { // fetch and commit to FS
      fetch(`images/deb-root-flat/${path}/${element[6]}`)
        .then(response => response.arrayBuffer())
        .then(response => {
          anura.fs.writeFile(`${path}/${element[0]}`, Filer.Buffer.from(response), function(err: any) {
            console.log("comitted to fs")
          })
          Filer.Buffer.from(response)
        })
    }
  }
  resp.fsroot.forEach(async (element: any) => {
    let isFolder = false
    console.log(`/${element[0]}`)
    if (typeof (element[6]) == 'object') {
      isFolder = true
    }
    console.log("Folder: " + isFolder)
    if (isFolder) {
      element[6].forEach((elementInFolder: any) => {
        extractFolder(elementInFolder, `/${element[0]}`)
      });
    }
    if (!isFolder) { // fetch and commit to FS
      let r = await fetch(`images/deb-root-flat/${element[6]}`);
      if (!r.ok) {
        r = await fetch(`images/deb-root/${element[6]}`);
        if (!r.ok) {
          console.error("errore!");
        }
      }
      let buf = await r.arrayBuffer();

      anura.fs.writeFile(`/${element[0]}`, Filer.Buffer.from(buf), function(err: any) {
        console.log("comitted to fs")
      })
      // Filer.Buffer.from(res)
    }
  });

}
