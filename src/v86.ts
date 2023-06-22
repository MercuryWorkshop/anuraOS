const decoder = new TextDecoder();
const encoder = new TextEncoder();

V86Starter.prototype.serial1_send = function(a: string) {
  for (var b = 0; b < a.length; b++)
    this.bus.send("serial1-input", a.charCodeAt(b))
};



const SLICE_SIZE = 2 ** 17 * 32;
const BUF_SIZE = 256;

async function InitV86Backend(): Promise<V86Backend> {
  // all right! time to explain what goes on here



  const request = indexedDB.open("image", 2);
  request.onupgradeneeded = (event: any) => {
    const db: IDBDatabase = event.target.result;

    db.createObjectStore("parts");
  };
  let db: IDBDatabase = (await new Promise(r => request.onsuccess = r) as any).target.result;



  // loads a local file into indexedDB
  // can be optimized somewhat significantly with promise.all
  (window as any).loadfile = async (f: File) => {
    let trn = db.transaction("parts", "readwrite").objectStore("parts");
    trn.put(f.size, "size");

    let i = 0;
    while (i * SLICE_SIZE < f.size) {

      let buf = await f.slice(i * SLICE_SIZE, (i + 1) * SLICE_SIZE).arrayBuffer();
      await new Promise(r => db.transaction("parts", "readwrite").objectStore("parts").put(buf, i).onsuccess = r);
      i++;

      console.log(i / (f.size / SLICE_SIZE));
    }
  }

  // the rootfs is an EXT4 binary blob, stored with indexedDB, in parts of SLICE_SIZE


  let size = (await new Promise(r => db.transaction("parts").objectStore("parts").get("size").onsuccess = r) as any).target.result;


  // next, we create a fake "file". this exists to fool v86 into dynamically loading from indexedDB instead
  // this part is very simple, just grab the parts from indexedDB when v86 wants them
  //
  // can be optimized *very* slightly with promise.all

  // Yes, this causes a memory leak... Too bad!
  let ro_slice_cache: any = {};
  // extremely large files will crash the tab. don't load extremely lare files i guess

  const fakefile = {
    size: size,
    slice: async (start: number, end: number) => {
      let starti = Math.floor(start / SLICE_SIZE);
      let endi = Math.floor(end / SLICE_SIZE);
      let i = starti;

      let buf = null;
      while (i <= endi) {

        let part: ArrayBuffer = ro_slice_cache[i];

        if (!part) {
          part = (await new Promise(r => db.transaction("parts").objectStore("parts").get(i).onsuccess = r) as any).target.result;
          ro_slice_cache[i] = part;
        }
        if (!part) {
          i++;
          continue;
        }
        let slice = part.slice(Math.max(0, start - (i * SLICE_SIZE)), end - (i * SLICE_SIZE));
        if (buf == null) {
          buf = slice;
        } else {
          buf = catBufs(buf, slice);
        }

        i++;
      }
      return new Blob([buf!]);

    },

    // when a "file" is loaded with v86, it keeps around a "block_cache" so it can write on top of the drive in ram
    // normally changes don't persist, but this function will take the changes made in the cache and propagate them back to indexedDB
    save: async () => {


      let part_cache: any = {};
      for (let [offset, buffer] of anura.x86?.emulator.disk_images.hda.block_cache) {
        let start = offset * BUF_SIZE;
        let starti = Math.floor(start / SLICE_SIZE);
        let i = starti;



        let offset_rel_to_slice = (start % SLICE_SIZE);


        let end = SLICE_SIZE - offset_rel_to_slice;


        let slice = buffer.slice(0, Math.min(BUF_SIZE, end));
        let tmpb: Uint8Array = part_cache[i];
        if (!tmpb) {
          let part: ArrayBuffer = (await new Promise(r => db.transaction("parts").objectStore("parts").get(i).onsuccess = r) as any).target.result;
          tmpb = new Uint8Array(part);
          part_cache[i] = tmpb;
        }
        tmpb.set(slice, start % SLICE_SIZE);

        if (end < 256) {
          i += 1;

          let slice = buffer.slice(end, BUF_SIZE);
          let tmpb: Uint8Array = part_cache[i];
          if (!tmpb) {
            let part: ArrayBuffer = (await new Promise(r => db.transaction("parts").objectStore("parts").get(i).onsuccess = r) as any).target.result;
            tmpb = new Uint8Array(part);
            part_cache[i] = tmpb;
          }
          tmpb.set(slice, 0);
        }

      }


      let promises = [];

      for (let i in part_cache) {
        promises.push(new Promise(r => db.transaction("parts", "readwrite").objectStore("parts").put(part_cache[i].buffer, parseInt(i)).onsuccess = r));
      }
      await Promise.all(promises);

      let notif = new anura.notification({ title: "x86 Subsystem", description: "Saved root filesystem sucessfully", timeout: 5000 });
      notif.show();
    },

    set_state: () => { }
  };


  // @ts-ignore
  fakefile.__proto__ = File.prototype;


  return new V86Backend(fakefile);

}


class V86Backend {
  private sendQueue: [string, number][] = [];
  private nextWrite: Uint8Array | null = null;
  private openQueue: { (number: number): void; }[] = [];
  private onDataCallbacks: { [key: number]: (string: string) => void } = {};

  private read_intent_phys_addr: number;
  private write_intent_phys_addr: number;
  private new_intent_phys_addr: number;
  private read_nbytes_phys_addr: number;
  private write_nbytes_phys_addr: number;
  private s_rows_phys_addr: number;
  private s_cols_phys_addr: number;
  private resize_intent_phys_addr: number;

  ready: boolean = true;
  act: boolean = false;
  cmd_q: string | null = null;

  virt_hda: FakeFile;

  emulator;
  //


  constructor(virt_hda: FakeFile) {
    this.virt_hda = virt_hda;

    var fs = anura.fs;
    var Path = Filer.Path;
    var Buffer = Filer.Buffer;
    var sh = new fs.Shell();

    this.emulator = new V86Starter({
      wasm_path: "/lib/v86.wasm",
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: anura.apps["anura.x86mgr"].windowinstance.querySelector("#v86VGA"),
      
      // TODO: this should not be hardcoded.
      initrd: {
        url: "/images/debian-boot/initrd.img-6.1.0-9-686",
      },
      bzimage: {
        url: "/images/debian-boot/vmlinuz-6.1.0-9-686",
        async: false,
      },

      hda: {
        buffer: virt_hda,
        async: true,
      },

      cmdline: "rw init=/bin/systemd root=/dev/sda rootfstype=ext4 random.trust_cpu=on 8250.nr_uarts=10 spectre_v2=off pti=off",
      filesystem: { fs, sh, Path, Buffer },

      bios: { url: "/bios/seabios.bin" },
      vga_bios: { url: "/bios/vgabios.bin" },
      network_relay_url: "ws://localhost:8001/",
      // initial_state: { url: "/images/v86state.bin" },
      autostart: true,
      uart1: true,
      uart2: true,

    });

    let data = "";


    // temporary, needs to be fixed later
    setInterval(() => {
      this.virt_hda.save();
    }, 1000 * 90);

    window.addEventListener("beforeunload", async (event) => {
      event.preventDefault();
      await this.virt_hda.save();
    });

    this.emulator.add_listener("serial0-output-char", (char: string) => {
      if (char === "\r") {
        // console.log(data);

        this._proc_data(data);
        data = "";
        return;
      }
      data += char;

    });
    this.emulator.add_listener("serial1-output-char", (char: string) => {
      if (char === "\r") {
        // console.log(`111: ${data}`);


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
    this.write_uint(rows, this.s_rows_phys_addr);
    this.write_uint(cols, this.s_cols_phys_addr);
    this.write_uint(1, this.new_intent_phys_addr);

    if (this.ready) {
      this.ready = false;

      this.emulator.serial0_send("\x06\n")
      this.emulator.serial0_send(`${command}\n`);
    } else {
      this.cmd_q = command;
      this.act = true;
    }



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
    if (this.ready) {
      this.ready = false;
      this.emulator.serial0_send("\x06\n")
    } else {
      this.act = true;
    }
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
    if (this.ready) {
      this.ready = false;
      this.emulator.serial0_send("\x06\n")
    } else {
      this.act = true;
    }
  }

  async _proc_data(data: string) {
    const start = data.indexOf("\x05");
    if (start === -1) return; // \005 is our special control code
    data = data.substring(start + 1);
    const parts = data.split(" ");



    switch (parts.shift()) {
      case "i": {

        let arr: any[] = parts.map(p => parseInt(p));

        [this.read_intent_phys_addr,
        this.write_intent_phys_addr, this.new_intent_phys_addr, this.read_nbytes_phys_addr,
        this.write_nbytes_phys_addr, this.s_rows_phys_addr, this.s_cols_phys_addr, this.resize_intent_phys_addr] = arr;

        this.emulator.serial0_send("\x06\n")
        break;
      }
      case "r": {
        let addr = parseInt(parts[0]!);

        let n_bytes = this.read_uint(this.read_nbytes_phys_addr);
        let n_tty = this.read_uint(this.read_intent_phys_addr) - 1;

        let mem = this.emulator.read_memory(addr, n_bytes);
        let text = decoder.decode(mem);

        // console.log(n_tty)

        // console.log(text);
        let cb = this.onDataCallbacks[n_tty]
        if (cb) {
          cb(text);
        }

        this.emulator.serial1_send("\x06\n")
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
        this.emulator.serial0_send("\x06\n")
      }
      case "n": {
        let func = this.openQueue.shift();
        if (func) {
          func(parseInt(parts[0]!));
        }
        this.emulator.serial0_send("\x06\n")
      }
      case "v": {
        this.ready = true;
        if (this.act) {
          this.ready = false;
          this.act = false;
          this.emulator.serial0_send("\x06\n")
          if (this.cmd_q) {
            this.cmd_q = null;
            this.emulator.serial0_send(`${this.cmd_q}\n`);
          }
        }
      }
    }

    // this.emulator.serial0_send("\x06\n"); // ack'd

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
  (window as any).emulator = emulator;
  await new Promise(resolve => setTimeout(resolve, 300));
  let text = await navigator.clipboard.readText();
  for (let l of text.split("\n")) {
    emulator.serial0_send(`${l}\n`)

    await new Promise(resolve => setTimeout(resolve, 10));
  }
  emulator.serial0_send("\n\x04\n")
}


interface FakeFile {
  slice: (start: number, end: number) => Promise<Blob>;
  save: () => Promise<void>;
  size: number;
}
