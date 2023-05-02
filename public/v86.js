const decoder = new TextDecoder();
const encoder = new TextEncoder();



class V86Backend {
  sendQueue = [];
  openQueue = [];
  onDataCallbacks = {};

  emulator;
  constructor() {
    this.emulator = new V86Starter({
      wasm_path: "/build/v86.wasm",
      memory_size: 512 * 1024 * 1024,
      vga_memory_size: 8 * 1024 * 1024,
      screen_container: document.getElementById("screen_container"),
      // bzimage_initrd_from_filesystem: true,
      // bzimage: {
      //     url: "/images/bzimage",
      //     size: 6126336,
      //     async: false,
      // },
      cmdline: "rw init=/bin/systemd root=host9p 8250.nr_uarts=10 spectre_v2=off pti=off",
      filesystem: {
        basefs: {
          url: "/images/deb-fs.json",
        },
        baseurl: "/images/deb-root-flat/",
      },
      initial_state: { url: "../images/debian-state-base.bin" },
      bios: { url: "/bios/seabios.bin" },
      vga_bios: { url: "/bios/vgabios.bin" },
      network_relay_url: "ws://relay.widgetry.org/",
      autostart: true,
      // uart1: true,
      // uart2: true,
      // uart3: true,
    });

    let data = "";



    this.emulator.add_listener("serial0-output-char", (char) => {
      if (char === "\r") {
        console.log(data);
        this._proc_data(data);
        data = "";
        return;
      }
      data += char;

    });

  }

  closepty(TTYn) {
    this.emulator.serial0_send(`c\n${TTYn}`);
  }
  openpty(command, onData) {
    this.emulator.serial0_send(`n\n${command}\n`);

    return new Promise((resolve) => {
      this.openQueue.push((number) => {
        this.onDataCallbacks[number] = onData;
        resolve(number);
      })
    });
  }
  writepty(TTYn, data) {
    const bytes = encoder.encode(data);
    if (this.sendQueue.length > 0) {
      console.log("dropping character: " + data);
      return;
    }
    this.emulator.serial0_send(`w\n${TTYn}\n${bytes.length}\n`);
    this.sendQueue.push(bytes);
  }

  _proc_data(data) {
    const start = data.indexOf("\x05");
    if (start === -1) return; // \005 is our special control code
    data = data.substring(start + 1);
    const parts = data.split(" ");
    if (parts[0] === "r") {
      const nPty = parseInt(parts[1]);
      const nBytes = parseInt(parts[2]);
      const addr = parseInt(parts[3]);

      // console.log(`${n_bytes} from ${n_tty} at ${addr}`);
      const mem = this.emulator.read_memory(addr, nBytes);
      const text = decoder.decode(mem);
      // console.log(`text from pty#${n_tty} : ${text}`);
      this.onDataCallbacks[nPty](text);

      this.emulator.serial0_send("\x06\n"); // ack'd
    } else if (parts[0] === "w") {
      const addr = parseInt(parts[1]);
      const bytes = this.sendQueue.shift();
      this.emulator.write_memory(bytes, addr);

      this.emulator.serial0_send("\x06\n"); // ack'd
    } else if (parts[0] === "n") {
      this.openQueue.shift()(parseInt(parts[1]));
      this.emulator.serial0_send("\x06\n"); // ack'd
    }
  }


}
