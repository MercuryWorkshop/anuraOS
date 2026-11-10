import { p as e, u as t } from "./internal-DhuCGrNL.mjs";
import { r as n } from "./page-fs-DR8goUYz.mjs";
import { n as r, r as i } from "./single-CjFw-sb8.mjs";
import { C as a, T as o } from "./wl-bridge-6Hq-j3j2.mjs";
import { isZstd as s, unzstd as c } from "./zfetch-KvlYIIp-.mjs";
import { a as l, i as u, n as d, r as f } from "./runtime-D-GJDdJD.mjs";
var p = 64,
	m = 262144;
async function h(e) {
	return (
		await t(
			async () => {
				let { default: t } = await import(
					/* @vite-ignore */ /* webpackIgnore: true */ e
				);
				return { default: t };
			},
			[],
			import.meta.url,
		)
	).default;
}
function g() {
	return typeof location < `u`
		? location.href
		: new URL(`file://${process.cwd()}/`).href;
}
async function _(n) {
	if (/^https?:/.test(n)) {
		if (
			/\.wasm$/.test(
				new URL(/* @vite-ignore */ /* webpackIgnore: true */ n).pathname,
			)
		)
			try {
				let e = await fetch(`${n}.zst`);
				if (e.ok) {
					let t = new Uint8Array(await e.arrayBuffer());
					if (s(t)) return c(t);
				}
			} catch {}
		return (await fetch(n)).arrayBuffer();
	}
	let { readFile: r } = await t(
			async () => {
				let { readFile: t } = await import(
					`./__vite-browser-external-6NL05v10.mjs`
				).then((t) => e(t.default, 1));
				return { readFile: t };
			},
			[],
			import.meta.url,
		),
		{ fileURLToPath: i } = await t(
			async () => {
				let { fileURLToPath: t } = await import(
					`./__vite-browser-external-6NL05v10.mjs`
				).then((t) => e(t.default, 1));
				return { fileURLToPath: t };
			},
			[],
			import.meta.url,
		);
	return (await r(n.startsWith(`file:`) ? i(n) : n)).buffer;
}
var v = class {
	constructor(e) {
		this.emit = e ?? (() => {});
	}
	log(e) {
		this.emit({ kind: `log`, text: e });
	}
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = null;
	#o = null;
	#s = new Map();
	#c = new Map();
	#l = new Map();
	#u = [];
	#d = 0;
	#f = new Map();
	#p = 1;
	#m = [];
	#h = null;
	#g = null;
	#_ = { w: 0, h: 0 };
	#v = 0;
	#y = new Set();
	#b = 0;
	#x = 0;
	#S = null;
	#C = null;
	async start(e) {
		((this.#g = e.wlChannel),
			(this.#b = e.trace | 0),
			e.win && (this.#C = new Map()),
			e.count && (this.#S = { at: Date.now(), n: new Map(), polls: 0 }),
			(this.#v = e.token));
		let t = o(e.wlChannel);
		this.#_ = { w: t.w, h: t.h };
		let r = await h(e.xwaylandUrl);
		if (
			((this.#e = await r({
				locateFile: (t) =>
					e.xwaylandFiles?.[t] ??
					new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ t,
						new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ e.xwaylandUrl,
							g(),
						),
					).href,
				print: (e) => this.log(e),
				printErr: (e) => this.log(e),
				noInitialRun: !0,
			})),
			e.keymapUrl)
		) {
			let t = new Uint8Array(await _(e.keymapUrl));
			try {
				this.#e.FS.mkdir(`/xkb`);
			} catch {}
			(this.#e.FS.writeFile(`/xkb/gex.xkm`, t),
				this.log(`[hostx] keymap: ${t.length} bytes at /xkb/gex.xkm`));
		}
		let i = await _(e.hostwlUrl),
			s = await WebAssembly.instantiate(await WebAssembly.compile(i), {
				gex_host: {
					host_locate: (e, t) => this.#z(e, t),
					host_release: (e) => {
						let t = this.#f.get(e);
						t && (this.#f.delete(e), this.#B(t));
					},
					host_trace: (e, t) => this.log(this.#R(e, t).replace(/\n$/, ``)),
				},
			});
		if (
			((this.#t = s.exports),
			(this.#n = s.exports.memory),
			e.wlTrace && this.#t.hw_set_trace?.(1),
			this.#t.hw_init(this.#_.w, this.#_.h),
			e.wlTrace && this.#t.hw_set_trace?.(1),
			e.kernel)
		) {
			let t =
					e.kernel.module instanceof WebAssembly.Module
						? e.kernel.module
						: await WebAssembly.compile(e.kernel.module),
				r = await WebAssembly.instantiate(t, {
					env: {
						memory: e.kernel.memory,
						...l(this.#e.wasmMemory, !1, e.kernel.spare),
						lazy_fetch: u(e.kernel.memory),
						page_fs: n(e.kernel.memory),
					},
				}),
				i =
					e.kernel.stackTop ??
					(r.exports.k_stack_area ? d(r.exports, `hostx`) : 0);
			(i && f(r.exports, i),
				(this.#a = r.exports),
				(this.#o = e.kernel.memory));
		}
		if (!this.#a) throw Error(`the host X server needs the global kernel`);
		(this.#M(),
			(this.#h = new a(
				e.wlChannel,
				() => this.emit({ kind: `wl` }),
				() => this.#v,
			)),
			(this.#h.onPixels = (e) => this.emit({ kind: `wl-pixels`, ...e })),
			(this.#h.wakeAddr = () => ({
				addr: this.#a.k_wq_addr(this.#A) >>> 0,
				slots: this.#a.k_ws_addr(0) >>> 0,
			})));
		{
			let t = this.#h.firstForKernel() ? e.kernel.memory : void 0,
				n = !!e.wlChannel.pixels;
			(!n || t) &&
				this.emit({
					kind: `wl-memory`,
					token: this.#v,
					memory: n ? void 0 : this.#e.wasmMemory,
					kernel: t,
				});
		}
		this.#e.gexos = this.#U();
		let c = this.#E(e);
		(this.log(`[hostx] Xwayland ${c.join(` `)}`), this.emit({ kind: `ready` }));
		let p = this.#e.callMain(c);
		if (p instanceof Promise) {
			p.then(
				() => this.log(`[hostx] the X server returned, which it should not`),
				(e) => this.log(`[hostx] the X server failed: ${e?.stack || e}`),
			);
			return;
		}
		this.log(`[hostx] the X server returned, which it should not`);
	}
	#w(e, t) {
		(this.#e.ccall(
			`setenv`,
			`number`,
			[`string`, `string`, `number`],
			[e, t, 1],
		),
			this.#e.ENV && (this.#e.ENV[e] = t));
	}
	#T(e) {
		return this.#e.ccall(`getenv`, `string`, [`string`], [e]);
	}
	#E(e) {
		let t = (
			e.listen
				? e.listen.map((e) => (this.#P(e), this.#D({ kind: `listen`, id: e })))
				: [`\0/tmp/.X11-unix/X0`, `/tmp/.X11-unix/X0`].map((e) => this.#O(e))
		).filter((e) => e >= 0);
		if (!t.length) throw Error(`the X display name is already taken`);
		let n = this.#D({ kind: `wl` }),
			r = e.rootful ? -1 : this.#D({ kind: `wm` });
		(this.#w(`WAYLAND_SOCKET`, String(n)),
			this.#w(`XDG_RUNTIME_DIR`, `/tmp`),
			this.#w(`DISPLAY`, e.display ?? `:0`),
			this.log(
				`[hostx] wayland fd ${n}, wm fd ${r}, listen ${t.join(`,`)}, WAYLAND_SOCKET=${this.#T(`WAYLAND_SOCKET`)}`,
			));
		let i = [
			e.display ?? `:0`,
			...(e.rootful
				? [
						`-fullscreen`,
						`-geometry`,
						`${Math.max(1, this.#_?.w | 0)}x${Math.max(1, this.#_?.h | 0)}`,
					]
				: [`-rootless`]),
			`-nolock`,
			`-noreset`,
			`-ac`,
			`-nokeymap`,
			`-shm`,
			...(e.rootful ? [] : [`-wm`, String(r)]),
		];
		for (let e of t) i.push(`-listenfd`, String(e));
		return (e.verbose && i.push(`-verbose`, String(e.verbose)), i);
	}
	#D(e) {
		let t = this.#e.FS.open(`/dev/null`, `r+`);
		return (this.#s.set(t.fd, e), t.fd);
	}
	#O(e) {
		let t = this.#I(e);
		return t < 0
			? (this.log(`[hostx] cannot bind ${JSON.stringify(e)}: errno ${-t}`), -1)
			: (this.#P(t), this.#D({ kind: `listen`, id: t }));
	}
	#k = -1;
	#A = 0;
	#j = 0;
	#M() {
		let e = this.#a;
		if (((this.#k = e.k_ws_alloc()), this.#k < 0))
			throw Error(`the host X server found no free wait slot`);
		((this.#A = e.k_wq_new()),
			e.k_wq_add(this.#A, this.#k),
			(this.#j = e.k_ws_seq(this.#k)));
	}
	#N(e, t) {
		let n = this.#C.get(e);
		if (!n) return;
		let r = new Uint8Array(n.buf.length + t.length);
		(r.set(n.buf), r.set(t, n.buf.length));
		let i = new DataView(r.buffer),
			a = 0;
		for (;;) {
			let e = r.length - a;
			if (n.setup) {
				if (e < 12) break;
				n.le = r[a] === 108;
				let t = i.getUint16(a + 6, n.le),
					o = i.getUint16(a + 8, n.le),
					s = 12 + ((t + 3) & -4) + ((o + 3) & -4);
				if (e < s) break;
				((a += s), (n.setup = !1));
				continue;
			}
			if (e < 4) break;
			let t = i.getUint16(a + 2, n.le),
				o = 4;
			if (t === 0) {
				if (e < 8) break;
				((t = i.getUint32(a + 4, n.le)), (o = 8));
			}
			let s = t * 4;
			if (s < o || e < s) break;
			let c = r[a];
			if (c === 18 && s >= o + 20) {
				let e = i.getUint32(a + o, n.le),
					t = i.getUint32(a + o + 4, n.le),
					c = i.getUint32(a + o + 16, n.le),
					l = r[a + o + 12];
				if (t === 67 && l === 8) {
					let t = r.subarray(a + o + 20, Math.min(a + s, a + o + 20 + c)),
						i = t.indexOf(0);
					n.named.set(
						e,
						new TextDecoder().decode(i < 0 ? t : t.subarray(0, i)),
					);
				}
			} else if (c === 8 && s >= o + 4) {
				let e = i.getUint32(a + o, n.le);
				n.named.has(e) &&
					!n.mapped.has(e) &&
					(n.mapped.add(e),
					this.emit({
						kind: `win`,
						text: `map 0x${e.toString(16)} "${n.named.get(e)}"`,
					}));
			}
			a += s;
		}
		n.buf = r.slice(a);
	}
	#P(e) {
		this.#a.k_wq_add(this.#a.k_sock_queue(e), this.#k);
	}
	#F(e) {
		this.#a.k_wq_del(this.#a.k_sock_queue(e), this.#k);
	}
	#I(e) {
		let t = new TextEncoder().encode(e),
			n = this.#e._malloc(t.length);
		this.#e.HEAPU8.set(t, n);
		let r = this.#a.k_sock_bind(BigInt(n), t.length);
		return (this.#e._free(n), r);
	}
	#L() {
		return (
			(!this.#r || this.#r.buffer !== this.#n.buffer) &&
				((this.#r = new Uint8Array(this.#n.buffer)),
				(this.#i = new Int32Array(this.#n.buffer))),
			this.#r
		);
	}
	#R(e, t) {
		return new TextDecoder().decode(this.#L().subarray(e, e + t));
	}
	#z(e, t) {
		let n = this.#f.get(e);
		this.#L();
		let r = this.#i;
		return n
			? ((r[t >> 2] = n.addr), (r[(t >> 2) + 1] = n.size), 1)
			: (this.#H(
					`pool:${e}`,
					`[hostx] descriptor ${e} is not a pool (held: ${this.#f.size})`,
				),
				(r[t >> 2] = 0),
				(r[(t >> 2) + 1] = 0),
				0);
	}
	#B(e) {
		--e.refs > 0 ||
			(this.#l.get(e.addr) === e && this.#l.delete(e.addr),
			this.#u.push({ pool: e, gen: this.#h?.ok ? this.#h.generation : -1 }));
	}
	#V() {
		if (!this.#u.length) return;
		let e = this.#h?.ok ? this.#h.drawnGeneration : 1 / 0,
			t = [];
		for (let n of this.#u)
			e > n.gen
				? (this.#e._free(n.pool.addr),
					this.#d--,
					this.#S && this.#G(`freed`, n.pool.size))
				: t.push(n);
		this.#u = t;
	}
	#H(e, t) {
		this.#y.has(e) || (this.#y.add(e), this.log(t));
	}
	#U() {
		let e = this,
			t = {
				socket: () => e.#D({ kind: `idle` }),
				bind(t, n, r) {
					let i = new TextDecoder().decode(e.#e.HEAPU8.subarray(n, n + r)),
						a = e.#I(i);
					return a < 0
						? a
						: (e.#P(a), e.#s.set(t, { kind: `listen`, id: a }), 0);
				},
				connect(t, n, r) {
					let i = e.#a.k_sock_connect(BigInt(n), r);
					return i < 0
						? i
						: (e.#P(i), e.#s.set(t, { kind: `kernel`, id: i }), 0);
				},
				accept(t) {
					let n = e.#s.get(t);
					if (!n || n.kind !== `listen`) return -9;
					let r = e.#a.k_sock_accept(n.id);
					if (r < 0) return r;
					e.#P(r);
					let i = e.#D({ kind: `kernel`, id: r });
					return (
						e.log(`[hostx] a guest connected to the X display (fd ${i})`),
						e.#C?.set(i, {
							setup: !0,
							big: !1,
							buf: new Uint8Array(),
							named: new Map(),
							mapped: new Set(),
						}),
						i
					);
				},
				close(t) {
					let n = e.#s.get(t);
					if (!n) return 0;
					((n.kind === `kernel` || n.kind === `listen`) &&
						(e.#F(n.id), e.#a.k_sock_close(n.id)),
						e.#s.delete(t),
						e.#C?.delete(t));
					let r = e.#c.get(t);
					r && (e.#c.delete(t), e.#B(r));
					try {
						e.#e.FS.close(e.#e.FS.getStream(t));
					} catch {}
					return 0;
				},
				readable(t) {
					let n = e.#s.get(t);
					if (
						(e.#b &&
							e.#H(
								`poll:${t}`,
								`[hostx] the server polls fd ${t} (${n?.kind ?? `unknown`})`,
							),
						!n)
					)
						return -1;
					switch (n.kind) {
						case `listen`:
							return +!!e.#a.k_sock_pending(n.id);
						case `kernel`:
							return +!!e.#a.k_sock_readable(n.id);
						case `wl`:
							return +(e.#t.hw_wayland_pending() > 0);
						case `wm`:
							return +(e.#t.hw_x_pending() > 0);
						default:
							return 0;
					}
				},
				writable(t) {
					let n = e.#s.get(t);
					return n
						? n.kind === `kernel`
							? +!!e.#a.k_sock_writable(n.id)
							: 1
						: -1;
				},
				send(t, n, r, i, a) {
					let o = e.#s.get(t);
					if (!o) return -9;
					if (o.kind === `kernel`) {
						let i = e.#a.k_sock_write(o.id, BigInt(n), r);
						return (e.#S && i > 0 && e.#G(`out${t}`, i), i);
					}
					if ((e.#S && e.#G(o.kind, r), o.kind === `wl` || o.kind === `wm`)) {
						let t = (r + 3) & -4,
							s = e.#t.hw_scratch(t + a * 4);
						e.#L().set(e.#e.HEAPU8.subarray(n, n + r), s);
						for (let n = 0; n < a; n++) {
							let r = e.#e.HEAP32[(i >> 2) + n],
								a = o.kind === `wl` ? e.#c.get(r) : null,
								c = r;
							(a && ((c = e.#p++), e.#f.set(c, a), a.refs++),
								(e.#i[((s + t) >> 2) + n] = c));
						}
						if (a && e.#b) {
							let n = [];
							for (let r = 0; r < a; r++) n.push(e.#i[((s + t) >> 2) + r]);
							e.#H(
								`fds:${n.join(`,`)}`,
								`[hostx] the server sent descriptor(s) ${n.join(`,`)} with ${r} bytes`,
							);
						}
						return (
							o.kind === `wl`
								? e.#t.hw_wayland_receive(s, r, s + t, a)
								: e.#t.hw_x_receive(s, r),
							r
						);
					}
					return (
						e.#H(
							`send:${o.kind}`,
							`[hostx] a write to a ${o.kind} descriptor went nowhere`,
						),
						r
					);
				},
				recv(t, n, r, i, a, o) {
					let s = e.#s.get(t);
					if (!s) return -9;
					if ((o && (e.#e.HEAP32[o >> 2] = 0), s.kind === `kernel`)) {
						let i = e.#a.k_sock_read(s.id, BigInt(n), r);
						return (
							e.#S && i > 0 && e.#G(`in${t}`, i),
							e.#C && i > 0 && e.#N(t, e.#e.HEAPU8.subarray(n, n + i)),
							i
						);
					}
					if (s.kind === `wl` || s.kind === `wm`) {
						let t = e.#t.hw_scratch(r),
							c =
								s.kind === `wl`
									? e.#t.hw_wayland_take(t, r)
									: e.#t.hw_x_take(t, r);
						if (!c) return -11;
						if (
							(e.#e.HEAPU8.set(e.#L().subarray(t, t + c), n),
							s.kind === `wl` && e.#m.length && o && a > 0)
						) {
							let t = e.#m.splice(0, a);
							for (let n = 0; n < t.length; n++)
								e.#e.HEAP32[(i >> 2) + n] = t[n];
							e.#e.HEAP32[o >> 2] = t.length;
						}
						return c;
					}
					return -11;
				},
				shm(t, n) {
					let r = e.#D({ kind: `pool` });
					return (
						e.#c.set(r, { addr: t, size: n, refs: 1, maps: 0 }),
						e.#d++,
						r
					);
				},
				shmAddr(t) {
					let n = e.#c.get(t);
					return n ? (n.refs++, n.maps++, e.#l.set(n.addr, n), n.addr) : 0;
				},
				shmUnmap(t) {
					let n = e.#l.get(t);
					return !n || !n.maps
						? 0
						: (--n.maps === 0 && e.#l.delete(t), e.#B(n), 0);
				},
				tick() {
					try {
						e.#J();
					} catch (t) {
						e.#H(
							`tick`,
							`[hostx] the compositor turn failed: ${t?.stack || t}`,
						);
					}
				},
				wait(t) {
					let n = e.#a,
						a = e.#k,
						o = e.#j,
						s = BigInt(Math.max(1, t)) * 1000000n,
						c = () => ((e.#j = n.k_ws_seq(a)), 0);
					if (i.on) {
						let t = r.parkSlot(
							() => new Int32Array(e.#o.buffer),
							(n.k_ws_addr(a) >>> 0) >>> 2,
							o,
							s,
						);
						return t === 1 ? c() : t.then(c);
					}
					return (n.k_ws_park(a, o, s), c());
				},
			};
		if (i.on)
			for (let e of [`connect`, `accept`, `close`, `send`, `recv`]) {
				let n = t[e];
				t[e] = (...e) => {
					let t = n(...e);
					return (r.checkSlots(), t);
				};
			}
		if (!this.#b) return t;
		let n = {},
			a = this.#b;
		for (let [e, r] of Object.entries(t)) {
			if (
				e === `tick` ||
				e === `wait` ||
				e === `readable` ||
				e === `writable`
			) {
				n[e] = r;
				continue;
			}
			n[e] = (...t) => {
				let n = r(...t);
				return (a-- > 0 && this.log(`[hostx] ${e}(${t.join(`, `)}) = ${n}`), n);
			};
		}
		return n;
	}
	#W() {
		let e = 65536,
			t = this.#t.hw_scratch(e),
			n = this.#t.hw_keymap_take(t, e);
		if (!n) return;
		let r = this.#e._malloc(n);
		this.#e.HEAPU8.set(this.#L().subarray(t, t + n), r);
		let i = this.#D({ kind: `pool` });
		(this.#c.set(i, { addr: r, size: n, refs: 1 / 0, maps: 0 }),
			this.#m.push(i),
			this.log(`[hostx] keymap event: ${n} bytes as fd ${i}`));
	}
	#G(e, t) {
		let n = this.#S.n;
		n.set(e, (n.get(e) ?? 0) + t);
	}
	#K = 0;
	#q() {
		let e = this.#t,
			t = this.#h;
		if (!e.hw_clip_take || !t) return;
		let n = e.hw_scratch(m),
			r = e.hw_clip_take(n, m);
		r >= 0 && (this.#K = t.clipSet(this.#n, n, r));
		let i = t.clipSerial();
		if (i && i !== this.#K) {
			((this.#K = i), (n = e.hw_scratch(m)));
			let r = t.clipGet(this.#n, n, m);
			e.hw_clip_set(n, Math.min(r, m));
		}
	}
	#J() {
		if (this.#S) {
			let e = this.#S;
			if ((e.polls++, Date.now() - e.at >= 1e3)) {
				let t = [...e.n].map(([e, t]) => `${e}=${t}`).join(` `);
				(this.log(
					`[hostx-count] turns=${e.polls} pub=${this.#x} pools=${this.#d} ${t}`,
				),
					e.n.clear(),
					(e.polls = 0),
					(e.at = Date.now()));
			}
		}
		globalThis.GEX_HOSTX_TICK?.();
		let e = this.#t;
		(this.#V(), e.hw_tick(), this.#W());
		let t = o(this.#g);
		if (
			((t.w !== this.#_.w || t.h !== this.#_.h) &&
				((this.#_ = { w: t.w, h: t.h }), e.hw_set_output(t.w, t.h)),
			this.#q(),
			e.hw_wants_input())
		) {
			let t = e.hw_scratch(p * 8 * 4),
				n = this.#h.pollInput(this.#n, t, p);
			n && e.hw_input(t, n);
		}
		if (e.hw_dirty()) {
			let t = e.hw_scratch(9728),
				n = e.hw_scene(t, 64);
			this.#h.publish(this.#n, t, n, this.#e.wasmMemory);
			let r = this.#x++;
			(r < 5 || (r >= 10 && /^10*$/.test(String(r)))) &&
				this.log(
					`[hostx] published ${n} surface(s) as token ${this.#h.token}${this.#h.ok ? `` : ` (no block in the arena!)`}`,
				);
		}
		let n = e.hw_failed(e.hw_scratch(256), 256);
		n &&
			this.#H(
				`failed`,
				`[hostx] the compositor dropped the X server: ${this.#R(e.hw_scratch(256), n)}`,
			);
	}
};
export { v as HostX };
