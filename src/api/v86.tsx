const decoder = new TextDecoder();
const encoder = new TextEncoder();

V86.prototype.serial1_send = function (a: string) {
	for (let b = 0; b < a.length; b++)
		this.bus.send("serial1-input", a.charCodeAt(b));
};

const SLICE_SIZE = 2 ** 17 * 32;
const BUF_SIZE = 256;

/**
 * Represents the v86 virtual hard disk that backs the x86 subsystem.
 *
 * Available globally as `anura.x86hdd`. Returned by {@link InitV86Hdd}.
 *
 * The "file" is stored in IndexedDB as fixed-size slices and exposed to v86
 * through an API compatible with the parts of `File` it expects.
 */
interface FakeFile {
	slice: (start: number, end: number) => Promise<Blob>;
	/**
	 * Persist any cached writes from the v86 emulator's `block_cache` back to
	 * IndexedDB. Also displays a notification to the user when it finishes.
	 *
	 * @param emulator - The v86 emulator instance whose disk should be
	 *   flushed. Defaults to `anura.x86?.emulator`.
	 *
	 * @example
	 * ```js
	 * console.log("saving hard disk");
	 * await anura.x86hdd.save();
	 * ```
	 */
	save: (emulator?: any) => Promise<void>;
	/**
	 * Delete the entire x86 hard disk image from IndexedDB and reload the
	 * page. This is a destructive action!
	 *
	 * @example
	 * ```js
	 * console.log("deleting hard disk");
	 * await anura.x86hdd.delete();
	 * ```
	 */
	delete: () => Promise<void>;
	/**
	 * Grow the x86 hard disk to a new size by appending empty bytes to the
	 * stored image. The OS will need to be restarted (or otherwise made aware
	 * of the new geometry) before it can use the additional space — see the
	 * Anura API doc for an example using `resizefs.img`.
	 *
	 * @param size - The new total size of the disk in bytes.
	 */
	resize: (size: number) => Promise<void>;
	/** The size of the v86 hard disk in bytes. */
	size: number;
}

async function InitV86Hdd(): Promise<FakeFile> {
	// all right! time to explain what goes on here

	const request = indexedDB.open("image", 2);
	request.onupgradeneeded = (event: any) => {
		const db: IDBDatabase = event.target.result;

		db.createObjectStore("parts");
	};
	const db: IDBDatabase = (
		(await new Promise((r) => (request.onsuccess = r))) as any
	).target.result;

	// loads a local file into indexedDB
	// can be optimized somewhat significantly with promise.all

	// the rootfs is an EXT4 binary blob, stored with indexedDB, in parts of SLICE_SIZE

	const size = (
		(await new Promise(
			(r) =>
				(db.transaction("parts").objectStore("parts").get("size").onsuccess =
					r),
		)) as any
	).target.result;

	// next, we create a fake "file". this exists to fool v86 into dynamically loading from indexedDB instead
	// this part is very simple, just grab the parts from indexedDB when v86 wants them
	//
	// can be optimized *very* slightly with promise.all

	// Yes, this causes a memory leak... Too bad!
	const ro_slice_cache: any = {};
	// extremely large files will crash the tab. don't load extremely lare files i guess

	const fakefile = {
		size: size,
		slice: async (start: number, end: number) => {
			const starti = Math.floor(start / SLICE_SIZE);
			const endi = Math.floor(end / SLICE_SIZE);
			let i = starti;

			let buf = null;
			while (i <= endi) {
				let part: ArrayBuffer = ro_slice_cache[i];

				if (!part) {
					part = (
						(await new Promise(
							(r) =>
								(db.transaction("parts").objectStore("parts").get(i).onsuccess =
									r),
						)) as any
					).target.result;
					ro_slice_cache[i] = part;
				}
				if (!part) {
					i++;
					continue;
				}
				const slice = part.slice(
					Math.max(0, start - i * SLICE_SIZE),
					end - i * SLICE_SIZE,
				);
				if (buf === null) {
					buf = slice;
				} else {
					buf = catBufs(buf, slice);
				}

				i++;
			}
			return new Blob([buf!]);
		},
		/**
		 * Load a file (blob) into the x86 hard disk, replacing its current
		 * contents. The image is split into `SLICE_SIZE`-sized parts and
		 * stored in IndexedDB.
		 *
		 * @param f - The blob (or `File`) containing the disk image.
		 *
		 * @example
		 * ```js
		 * // single file
		 * const rootfs = await fetch(anura.config.x86[x86image].rootfs);
		 * const blob = await rootfs.blob();
		 * await anura.x86hdd.loadfile(blob);
		 *
		 * // split into multiple files
		 * const files = [];
		 * let file_1 = await fetch(anura.config.x86[x86image].rootfs[0]);
		 * files[0] = await file_1.blob();
		 * let file_2 = await fetch(anura.config.x86[x86image].rootfs[1]);
		 * files[1] = await file_2.blob();
		 * await anura.x86hdd.loadfile(new Blob(files));
		 * ```
		 */
		loadfile: async (f: File) => {
			const trn = db.transaction("parts", "readwrite").objectStore("parts");
			trn.put(f.size, "size");
			fakefile.size = f.size;

			let i = 0;
			while (i * SLICE_SIZE < f.size) {
				const buf = await f
					.slice(i * SLICE_SIZE, (i + 1) * SLICE_SIZE)
					.arrayBuffer();
				await new Promise(
					(r) =>
						(db
							.transaction("parts", "readwrite")
							.objectStore("parts")
							.put(buf, i).onsuccess = r),
				);
				i++;

				console.log(i / (f.size / SLICE_SIZE));
			}
		},
		delete: async () => {
			db.close();
			indexedDB.deleteDatabase("image");
			window.location.reload();
		},
		// when a "file" is loaded with v86, it keeps around a "block_cache" so it can write on top of the drive in ram
		// normally changes don't persist, but this function will take the changes made in the cache and propagate them back to indexedDB
		resize: async (size: number) => {
			fakefile.size = size;
			let i = 0;
			db.transaction("parts", "readwrite")
				.objectStore("parts")
				.put(size, "size");

			while (i * SLICE_SIZE < size) {
				const block: any = await new Promise(
					(r) =>
						(db
							.transaction("parts", "readwrite")
							.objectStore("parts")
							.get(i).onsuccess = r),
				);
				if (!block.target.result) {
					await new Promise(
						(r) =>
							(db
								.transaction("parts", "readwrite")
								.objectStore("parts")
								.put(new ArrayBuffer(SLICE_SIZE), i).onsuccess = r),
					);
					console.log("added block " + i);
				}
				i++;
			}
		},
		save: async (emulator = anura.x86?.emulator) => {
			const part_cache: any = {};
			for (const [offset, buffer] of emulator.disk_images.hda.block_cache) {
				const start = offset * BUF_SIZE;
				const starti = Math.floor(start / SLICE_SIZE);
				let i = starti;

				const offset_rel_to_slice = start % SLICE_SIZE;

				const end = SLICE_SIZE - offset_rel_to_slice;

				const slice = buffer.slice(0, Math.min(BUF_SIZE, end));
				let tmpb: Uint8Array = part_cache[i];
				if (!tmpb) {
					const part: ArrayBuffer = (
						(await new Promise(
							(r) =>
								(db.transaction("parts").objectStore("parts").get(i).onsuccess =
									r),
						)) as any
					).target.result;
					tmpb = new Uint8Array(part);
					part_cache[i] = tmpb;
				}
				tmpb.set(slice, start % SLICE_SIZE);

				if (end < 256) {
					i += 1;

					const slice = buffer.slice(end, BUF_SIZE);
					let tmpb: Uint8Array = part_cache[i];
					if (!tmpb) {
						const part: ArrayBuffer = (
							(await new Promise(
								(r) =>
									(db
										.transaction("parts")
										.objectStore("parts")
										.get(i).onsuccess = r),
							)) as any
						).target.result;
						tmpb = new Uint8Array(part);
						part_cache[i] = tmpb;
					}
					tmpb.set(slice, 0);
				}
			}

			const promises = [];

			for (const i in part_cache) {
				promises.push(
					new Promise(
						(r) =>
							(db
								.transaction("parts", "readwrite")
								.objectStore("parts")
								.put(part_cache[i].buffer, parseInt(i)).onsuccess = r),
					),
				);
			}
			await Promise.all(promises);

			anura.notifications.add({
				title: "x86 Subsystem",
				description: "Saved root filesystem sucessfully",
				timeout: 5000,
			});
		},

		set_state: () => {},
	};

	// @ts-ignore
	fakefile.__proto__ = File.prototype;

	return fakefile;
}

/**
 * Provides access to Anura's x86 backend, used to create PTYs, write directly
 * to serial terminals (not recommended), or access the v86 emulator itself.
 *
 * Available globally as `anura.x86` (or `null` if x86 has not been started).
 */
class V86Backend {
	ptyNum = 1;
	ready = false;

	vgacanvas: HTMLCanvasElement = null!;

	/**
	 * A `<div>` containing the canvas with the emulated v86 screen. Mount
	 * this element somewhere in the DOM to display the x86 desktop.
	 */
	screen_container = (
		<div
			id="screen_container"
			class={css`
				background-color: #000;

				canvas {
					background-color: #000;
				}
			`}
		>
			<div style="white-space: pre; font: 14px monospace; line-height: 14px"></div>
			{(this.vgacanvas = (<canvas></canvas>) as HTMLCanvasElement)}
		</div>
	);

	virt_hda: FakeFile;
	netpty: number;
	xpty: number;
	runpty: number;

	/**
	 * The underlying v86 emulator object.
	 *
	 * See the {@link https://github.com/copy/v86 v86 documentation} for
	 * details on its API.
	 */
	emulator;
	saveinterval;
	sendWispFrame: any;
	//

	constructor(virt_hda: FakeFile) {
		console.log(virt_hda);
		this.virt_hda = virt_hda;

		const fs = anura.fs;
		const Path = Filer.Path;
		const Buffer = Filer.Buffer;
		const sh = new fs.Shell();

		this.emulator = new V86({
			wasm_path: "/lib/v86.wasm",
			memory_size: anura.settings.get("x86-memory") * 1024 * 1024,
			vga_memory_size: 8 * 1024 * 1024,
			screen_container: this.screen_container,
			initrd: {
				url: "/fs/boot/initrd.img",
			},
			bzimage: {
				url: "/fs/boot/bzimage",
				async: false,
			},

			hda: {
				buffer: virt_hda,
				async: true,
			},

			cmdline:
				"rw init=/sbin/init root=/dev/sda rootfstype=ext4 random.trust_cpu=on 8250.nr_uarts=10 spectre_v2=off pti=off mitigations=off ipv6.disable=1",
			filesystem: { fs, sh, Path, Buffer },

			bios: { url: "/bios/seabios.bin" },
			vga_bios: { url: "/bios/vgabios.bin" },
			net_device: {
				relay_url: anura.wsproxyURL
					.replace("ws://", "wisp://")
					.replace("wss://", "wisps://"),
				type: "virtio",
			},

			// initial_state: { url: "/images/v86state.bin" },
			autostart: true,
			uart1: true,
			uart2: true,
			virtio_console: true,
		});

		// temporary, needs to be fixed later
		this.saveinterval = setInterval(() => {
			this.virt_hda.save();
		}, 1000 * 90);

		window.addEventListener("beforeunload", async (event) => {
			event.preventDefault();
			await this.virt_hda.save();
		});

		let data = "";
		this.emulator.add_listener("serial0-output-byte", function (byte: number) {
			const char = String.fromCharCode(byte);
			data += char;
			if (char === "\n") {
				console.log("SERIAL0: " + data);
				data = "";
			}
		});

		let evalBuffer = "";
		this.emulator.add_listener(
			"virtio-console1-output-bytes",
			async (data: Uint8Array) => {
				evalBuffer += decoder.decode(data);
				if (evalBuffer.endsWith("\0")) {
					const jsrun = evalBuffer.slice(0, -1);
					evalBuffer = "";
					window.eval(jsrun);
				}
			},
		);

		this.twispinit();
	}

	async onboot() {
		if (this.ready) return;
		this.ready = true;

		anura.notifications.add({
			title: "x86 Subsystem Ready",
			description: "x86 OS has booted and is ready for use",
			timeout: 5000,
		});

		this.xpty = await this.openpty(
			"/bin/ash -c 'startx /bin/xfrog'",
			1,
			1,
			async (data) => {
				console.debug("XFROG " + data);
				if (data.includes("XFROG-INIT")) {
					anura.apps["anura.xfrog"].startup();
					this.startMouseDriver();
					anura.notifications.add({
						title: "x86 Subsystem",
						description: "Started XFrog Window Manager",
						timeout: 5000,
					});
				}
			},
		);

		this.runpty = await this.openpty("/bin/bash --login", 1, 1, (data) => {
			console.debug("RUNPTY" + data);
		});
	}

	/**
	 * Open a PTY in the x86 subsystem and run a command inside it.
	 *
	 * @param command - The shell command to run inside the PTY.
	 * @param cols - Initial number of columns to size the PTY to.
	 * @param rows - Initial number of rows to size the PTY to.
	 * @param onData - Callback fired every time the PTY emits data. The
	 *   chunk is decoded as UTF-8 text.
	 * @returns A promise resolving to the PTY's id, which is needed for
	 *   subsequent {@link V86Backend.writepty} / {@link V86Backend.resizepty}
	 *   / {@link V86Backend.closepty} calls.
	 *
	 * @example
	 * ```js
	 * const pty = await anura.x86.openpty(
	 *     "/bin/bash",
	 *     screenSize.width,
	 *     screenSize.height,
	 *     (data) => {
	 *         // callback gets called every time the PTY returns data
	 *     },
	 * );
	 * ```
	 */
	openpty(
		command: string,
		cols: number,
		rows: number,
		onData: (string: string) => void,
	): Promise<number> {
		if (!anura.x86!.ready) {
			onData(
				"\u001b[33mThe anura x86 subsystem has not yet booted. Please wait for the notification that it has booted and try again.\u001b[0m",
			);
			return new Promise((resolve) => {
				resolve(-1);
			});
		}
		const streamDecoder = new TextDecoder(); // needs its own for stream: true option
		this.sendWispFrame({
			type: "CONNECT",
			streamID: this.ptyNum,
			command: command,
			dataCallback: (data: Uint8Array) => {
				const string = streamDecoder.decode(data, { stream: true });
				onData(string);
			},
			closeCallback: (data: number) => {
				console.log(data);
			},
		});
		const ptyNumberStatic = this.ptyNum; // this.ptyNum changes and to avoid a race condition this is needed;
		setTimeout(() => {
			console.log(`pty ${this} reizing to ${rows}x${cols}`);
			this.resizepty(ptyNumberStatic, cols, rows);
		}, 0);

		return new Promise((resolve) => {
			resolve(this.ptyNum);
			this.ptyNum++;
		});
	}
	openBinaryPty(
		command: string,
		cols: number,
		rows: number,
		onData: (data: Uint8Array) => void,
	): Promise<number> {
		if (!anura.x86!.ready) {
			throw new Error("PTY driver has not started");
		}

		this.sendWispFrame({
			type: "CONNECT",
			streamID: this.ptyNum,
			command: command,
			dataCallback: (data: Uint8Array) => {
				onData(data);
			},
			closeCallback: (data: number) => {
				console.log(data);
			},
		});
		const ptyNumberStatic = this.ptyNum; // this.ptyNum changes and to avoid a race condition this is needed;
		setTimeout(() => {
			console.log(`pty ${this} reizing to ${rows}x${cols}`);
			this.resizepty(ptyNumberStatic, cols, rows);
		}, 0);

		return new Promise((resolve) => {
			resolve(this.ptyNum);
			this.ptyNum++;
		});
	}
	writeBinaryPTY(TTYn: number, data: Uint8Array) {
		if (TTYn === -1) {
			return;
		}

		// Through much torture, trial, and error, I determined that if you send above 2071 bytes it crashes
		const sendChunks = (tty: number, typedArray: Uint8Array) => {
			let remaining = typedArray.byteLength;
			let offset = 0;
			while (remaining !== 0) {
				const frameLength = Math.min(remaining, 2071);
				const frame = new Uint8Array(
					typedArray.buffer,
					offset + typedArray.byteOffset,
					frameLength,
				);
				this.writeBinaryPTY(tty, frame);
				offset += frameLength;
				remaining -= frameLength;
			}
		};

		if (data.byteLength <= 2071) {
			this.sendWispFrame({
				type: "DATA",
				streamID: TTYn,
				data: data,
			});
		} else {
			sendChunks(TTYn, data);
		}
	}

	/**
	 * Send data to a PTY.
	 *
	 * @param TTYn - The id returned from {@link V86Backend.openpty}.
	 * @param data - Text to write to the PTY. Encoded as UTF-8 before being
	 *   sent.
	 *
	 * @example
	 * ```js
	 * const pty = await anura.x86.openpty(
	 *     "/bin/bash",
	 *     screenSize.width,
	 *     screenSize.height,
	 *     (data) => { console.log(data); },
	 * );
	 * anura.x86.writepty(pty, "Hello World!");
	 * ```
	 */
	writepty(TTYn: number, data: string) {
		if (TTYn === -1) {
			return;
		}

		this.sendWispFrame({
			type: "DATA",
			streamID: TTYn,
			data: encoder.encode(data),
		});
	}

	/**
	 * Resize a PTY.
	 *
	 * @param TTYn - The id returned from {@link V86Backend.openpty}.
	 * @param cols - New number of columns.
	 * @param rows - New number of rows.
	 *
	 * @example
	 * ```js
	 * const pty = await anura.x86.openpty(
	 *     "TERM=xterm DISPLAY=:0 bash",
	 *     screenSize.width,
	 *     screenSize.height,
	 *     (data) => { console.log(data); },
	 * );
	 * anura.x86.resizepty(pty, screenSize.height, screenSize.width);
	 * ```
	 */
	resizepty(TTYn: number, cols: number, rows: number) {
		if (TTYn === -1) {
			return;
		}

		this.sendWispFrame({
			type: "RESIZE",
			streamID: TTYn,
			cols: cols,
			rows: rows,
		});
	}

	closepty(TTYn: number) {
		if (TTYn === -1) {
			return;
		}

		this.sendWispFrame({
			type: "CLOSE",
			streamID: TTYn,
			reason: 0x02,
		});
	}

	runcmd(cmd: string) {
		this.writepty(this.runpty, `( ${cmd} ) & \n`);
	}
	v86InternalTCPSocket = class v86InternalTCPSocket extends EventTarget {
		pty = -1;
		readyState = "open";
		binaryType = "arraybuffer";
		constructor(hostname: string, port: string) {
			super();
			console.log("creating socket: " + hostname);

			(async () => {
				this.pty = anura.x86!.ptyNum++;
				await anura.x86!.sendWispFrame({
					type: "CONNECT",
					streamType: 0x01,
					streamID: this.pty,
					port: port,
					command: hostname,
					dataCallback: (data: Uint8Array) => {
						this.onmessage({ data: data.buffer });

						this.dispatchEvent(
							//@ts-expect-error idk why?
							new CustomEvent("message", { data: data.buffer }),
						);
					},
					closeCallback: (data: number) => {
						if (this.onclose) {
							this.onclose();
						}
						this.dispatchEvent(new CustomEvent("close"));
					},
				});
				this.dispatchEvent(new CustomEvent("open"));
				if (this.onopen) {
					this.onopen();
				}
			})();
		}

		protocol = "";

		close() {
			anura.x86!.closepty(this.pty);
		}

		send(data: any) {
			anura.x86!.writeBinaryPTY(this.pty, data);
		}

		onopen() {}

		onclose() {}

		onmessage(data: any) {}

		onerror() {}
	};

	async startMouseDriver() {
		let ready = false;
		function pack(value1: number, value2: number) {
			const result = (value1 << 16) + value2;
			return result;
		}
		let pointer = "";
		const pty = await this.openpty(
			"/bin/ash -c 'env DISPLAY=:0 /bin/anuramouse'",
			100,
			100,
			(data) => {
				pointer = data.slice(0, -2);
				ready = true;
			},
		);
		function write_uint(i: number, addr: number) {
			// I have to redefine this here because "this" breaks
			const bytes = [i, i >> 8, i >> 16, i >> 24].map((a) => a % 256);
			anura.x86!.emulator.write_memory(bytes, addr);
		}
		function movemouse(x: number, y: number) {
			if (!ready) return;
			write_uint(pack(x, y), Number(pointer));
		}

		const vgacanvas = this.vgacanvas;
		function mouseHandler(event: MouseEvent) {
			const rect = vgacanvas.getBoundingClientRect();
			const x = event.clientX - rect.x;
			const y = event.clientY - rect.y;
			movemouse(x, y);
		}
		this.vgacanvas.onmousemove = mouseHandler;
		// Move mouse to edge of X screen when mousing off
		// to prevent multiple cursors from displaying on screen
		this.vgacanvas.onmouseleave = function () {
			movemouse(0, 768);
		};
	}

	async twispinit() {
		let remaniningLength = 0;
		let recBuffer: Uint8Array;

		const connections: any = { 0: { congestion: 4294967294 } };

		const congestedBuffer: {
			data: Uint8Array;
			type: "CONNECT" | "DATA" | "RESIZE" | "CLOSE";
		}[] = [];
		function sendPacket(
			data: Uint8Array,
			type: "DATA" | "CONNECT" | "RESIZE" | "CLOSE",
			streamID: number,
		) {
			if (connections[streamID].congestion > 0) {
				if (type === "DATA") connections[streamID].congestion--;

				anura.x86!.emulator.bus.send("virtio-console0-input-bytes", data);
			} else {
				console.log("congested!");
				connections[streamID].congested = true;
				congestedBuffer.push({ data: data, type: type });
			}
		}

		this.emulator.add_listener(
			"virtio-console0-output-bytes",
			async (data: Uint8Array) => {
				if (!remaniningLength) {
					const payload = data.slice(4);
					const view = new DataView(data.buffer);
					const length = view.getUint32(0, true);

					if (length + 4 > data.length) {
						// Length does not match actual packet size

						console.log("Packet overloaded, more in next virtio frame");
						remaniningLength = length + 4 - data.length;
						recBuffer = payload;
					} else {
						// Perfect Length, ideal scenario
						processIncomingWispFrame(payload);
					}
				} else {
					if (data.length === remaniningLength) {
						// Length matches now, Merge and send off to wisp processer

						const merged = new Uint8Array(recBuffer.length + data.length);
						merged.set(recBuffer, 0);
						merged.set(data, recBuffer.length);
						remaniningLength = 0;
						processIncomingWispFrame(merged);
					} else {
						// Length STILL does not match actual packet size
						console.log("Packet overloaded^2, more in next virtio frame");
						const merged = new Uint8Array(recBuffer.length + data.length);
						merged.set(recBuffer, 0);
						merged.set(data, recBuffer.length);
						remaniningLength -= data.length;
						recBuffer = merged;
					}
				}
			},
		);

		function processIncomingWispFrame(frame: Uint8Array) {
			//console.log(frame);
			const view = new DataView(frame.buffer);
			const streamID = view.getUint32(1, true);
			switch (frame[0]) {
				case 1: // CONNECT
					// The server should never send this actually
					throw new Error("Server sent client only frame: CONNECT 0x01");
				case 2: // DATA
					if (connections[streamID])
						connections[streamID].dataCallback(frame.slice(5));
					else
						throw new Error(
							"Got a DATA packet but stream not registered. ID: " + streamID,
						);

					break;
				case 3: // CONTINUE
					if (connections[streamID]) {
						console.log(
							`setting congestion for ${streamID} to ${view.getUint32(5, true)}`,
						);
						connections[streamID].congestion = view.getUint32(5, true);
					}

					if (connections[streamID].congested) {
						for (const packet of congestedBuffer) {
							sendPacket(packet.data, packet.type, streamID);
						}
						connections[streamID].congested = false;
					}

					break;
				case 4: // CLOSE
					// Call some closer here

					if (connections[streamID])
						connections[streamID].closeCallback(view.getUint8(5));

					break;
				case 5: // PROTOCOL EXT
					// Reflect protocol ext packet
					// eslint-disable-next-line no-case-declarations
					const full = new Uint8Array(frame.length + 4);
					full.set(frame, 4);
					// eslint-disable-next-line no-case-declarations
					const fullView = new DataView(full.buffer);
					fullView.setUint32(0, full.length - 4, true);
					//console.log("Refection: ");
					//console.log(full);
					anura.x86!.emulator.bus.send("virtio-console0-input-bytes", full);
					anura.x86!.onboot();
					break;
			}
		}

		// FrameObj will be the following
		// FrameObj.streamID (number)
		//
		// FrameObj.type -- CONNECT
		//      FrameObj.command (string)
		//      FrameObj.dataCallback (function (Uint8Array))
		//      FrameObj.closeCallback (function (number)) OPTIONAL
		//
		// FrameObj.type -- DATA
		//      FrameObj.data (Uint8Array)
		//
		// FrameObj.type -- CLOSE
		//      FrameObj.reason (number)
		//
		// FrameObj.type -- RESIZE
		//      FrameObj.cols (number)
		//      FrameObj.rows (number)
		//
		//
		//

		this.sendWispFrame = async (frameObj: any) => {
			let fullPacket;
			let view;
			switch (frameObj.type) {
				case "CONNECT":
					// eslint-disable-next-line no-case-declarations
					const commandBuffer = new TextEncoder().encode(frameObj.command);
					fullPacket = new Uint8Array(4 + 5 + 1 + 2 + commandBuffer.length);
					view = new DataView(fullPacket.buffer);
					view.setUint32(0, fullPacket.length - 4, true); // Packet size
					view.setUint8(4, 0x01); // FRAME TYPE (CONNECT)
					view.setUint32(5, frameObj.streamID, true); // Stream ID
					view.setUint8(9, frameObj.streamType || 0x03); // TCP
					view.setUint16(10, frameObj.port || 10, true); // PORT (unused, hardcoded to 10)
					fullPacket.set(commandBuffer, 12); // command
					// Setting callbacks
					connections[frameObj.streamID] = {
						dataCallback: frameObj.dataCallback,
						closeCallback: frameObj.closeCallback,
						congestion: connections[0].congestion,
					};

					break;
				case "DATA":
					fullPacket = new Uint8Array(4 + 5 + frameObj.data.length);
					view = new DataView(fullPacket.buffer);
					view.setUint32(0, fullPacket.length - 4, true); // Packet size
					view.setUint8(4, 0x02); // TYPE
					view.setUint32(5, frameObj.streamID, true); // Stream ID
					fullPacket.set(frameObj.data, 9); // Actual data

					break;
				case "CLOSE":
					fullPacket = new Uint8Array(4 + 5 + 1);
					view = new DataView(fullPacket.buffer);
					view.setUint32(0, fullPacket.length - 4, true); // Packet size
					view.setUint8(4, 0x04); // TYPE
					view.setUint32(5, frameObj.streamID, true); // Stream ID
					view.setUint8(9, frameObj.reason); // Packet size

					break;
				case "RESIZE":
					fullPacket = new Uint8Array(4 + 5 + 2 + 2);
					view = new DataView(fullPacket.buffer);
					view.setUint32(0, fullPacket.length - 4, true); // Packet size
					view.setUint8(4, 0xf0); // TYPE
					view.setUint32(5, frameObj.streamID, true); // Stream ID
					view.setUint16(9, frameObj.rows, true); // Rows
					view.setUint16(11, frameObj.cols, true); // Cols
					break;
				default:
					throw new Error("Invalid Packet Type");
			}
			sendPacket(fullPacket, frameObj.type, frameObj.streamID);
		};
	}
}
