let e,
	t = 0;
function n(t) {
	(e === void 0 &&
		((e =
			typeof BroadcastChannel == `function`
				? new BroadcastChannel(`gex-fetch`)
				: null),
		e?.unref?.()),
		e?.postMessage(t));
}
function r(e, r = 0, i = ``) {
	if (typeof BroadcastChannel != `function`) return () => {};
	let a = `${globalThis.name ?? ``}:${t++}:${Math.random().toString(36).slice(2, 8)}`;
	try {
		n({ id: a, what: e, bytes: r, owner: i, phase: `start` });
	} catch {}
	let o = !1;
	return (t = 0) => {
		if (!o) {
			o = !0;
			try {
				n({ id: a, what: e, bytes: t, phase: `end` });
			} catch {}
		}
	};
}
function i() {
	return !1;
}
function a(e, t, n, r) {
	return -1;
}
Object.freeze([250, 1e3, 4e3]);
var o = class {
	#e = new Map();
	held(e, t = Date.now()) {
		let n = this.#e.get(e);
		return n === void 0 ? !1 : t < n || (this.#e.delete(e), !1);
	}
	failed(e, t = Date.now()) {
		this.#e.set(e, t + 3e4);
	}
	ok(e) {
		this.#e.delete(e);
	}
};
let s = null;
function c(e, t, n, r, i) {
	let a = {}.GEX_NODE_LAZY && globalThis.process.getBuiltinModule?.(`node:fs`);
	if (!a) return -1;
	let o = Number({}.GEX_LAZY_DELAY_MS || 0);
	o > 0 &&
		Atomics.wait((s ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, o);
	try {
		let o = a.openSync(e, `r`);
		try {
			let e = new Uint8Array(i);
			return a.readSync(o, e, 0, i, t) === i
				? (new Uint8Array(n.buffer, r, i).set(e), i)
				: -1;
		} finally {
			a.closeSync(o);
		}
	} catch {
		return -1;
	}
}
new o();
const l = new o();
function u(e, t) {
	l.held(e) || (l.failed(e), console.error(t));
}
function d(e, t, n, r, a) {
	let o = f(e),
		s = o.lastIndexOf(`#`);
	if (s < 0 || typeof XMLHttpRequest != `function`) return -1;
	let c = o.slice(0, s);
	return (
		Number(o.slice(s + 1)) + t,
		i() || u(c, `[lazy] ${c}: the zstd decoder is not loaded (lazyReady)`),
		-1
	);
}
const f = (e) => {
		try {
			return new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.GEX_BASE ?? globalThis.location?.href,
			).href;
		} catch {
			return e;
		}
	},
	p = new Map();
function m(e, t = !1, n = null) {
	let r =
			typeof SharedArrayBuffer < `u` && e.buffer instanceof SharedArrayBuffer,
		i = t ? n?.m32 : n?.m64;
	i &&
		(typeof SharedArrayBuffer < `u` &&
			i.buffer instanceof SharedArrayBuffer) !== r &&
		(i = null);
	let a = `${t ? 32 : 64}:${r}`;
	return (
		(i ??= p.get(a)),
		i ||
			((i = t
				? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: r })
				: new WebAssembly.Memory({
						address: `i64`,
						initial: 0n,
						maximum: 0n,
						shared: r,
					})),
			p.set(a, i)),
		t ? { process: i, process64: e } : { process: e, process64: i }
	);
}
const h = Object.freeze({ tty: 0, hostx: 1, persist: 2, fsOpened: 3 });
function g(e, t) {
	let n = e.k_stack_area() >>> 0,
		r = e.k_stack_size() >>> 0;
	return n + ((e.k_stack_count() >>> 0) - h[t]) * r;
}
function _(e, t) {
	let n = t >>> 0,
		r = e.__tls_size ? e.__tls_size.value >>> 0 : 0;
	if (r && typeof e.__wasm_init_tls == `function`) {
		let t = Math.max(16, e.__tls_align ? e.__tls_align.value >>> 0 : 16),
			i = (n - r) & -t;
		(e.__wasm_init_tls(i), (n = i));
	}
	return ((e.__stack_pointer.value = n | 0), n);
}
function v(e) {
	return (t, n, i, o, s) => {
		((t >>>= 0), (n >>>= 0), (o >>>= 0), (s >>>= 0));
		let l = Number(i),
			p = new TextDecoder().decode(new Uint8Array(e.buffer, t, n).slice()),
			m = r(p, s);
		if (p.includes(`#`)) {
			if (a(f(p), l, o, s) === s) return (m(s), s);
			let t = d(p, l, e, o, s);
			return (
				m(t > 0 ? t : 0),
				t < 0 && u(p, `[lazy] ${p}: a read failed (rest bundle)`),
				t
			);
		}
		if (a(f(p), l, o, s) === s) return (m(s), s);
		if (typeof XMLHttpRequest != `function`) {
			let t = c(p, l, e, o, s);
			return (m(t > 0 ? t : 0), t);
		}
		let h = `no response`;
		try {
			for (let t = 0; t < 3; t++)
				try {
					let t = new XMLHttpRequest();
					(t.open(`GET`, f(p), !1),
						(t.responseType = `arraybuffer`),
						t.setRequestHeader(`Range`, `bytes=${l}-${l + s - 1}`),
						t.setRequestHeader(`Cache-Control`, `no-store`),
						t.send());
					let n = new Uint8Array(t.response ?? new ArrayBuffer(0));
					h = `status ${t.status}, ${n.length} bytes`;
					let r = t.status === 206 ? 0 : t.status === 200 ? l : -1;
					if (r < 0 || n.length < r + s) continue;
					return (
						new Uint8Array(e.buffer, o, s).set(n.subarray(r, r + s)),
						m(s),
						s
					);
				} catch (e) {
					h = String(e);
				}
		} finally {
			m(0);
		}
		return (console.error(`[lazy] ${p} @${l}+${s}: failed (${h})`), -1);
	};
}
function y(e) {
	return (e, t, n, r) => ((e >>>= 0), (t >>>= 0), (n >>>= 0), (r >>>= 0), -5);
}
const b = { on: !1 };
WebAssembly.Suspending;
const x =
	typeof process == `object` &&
	!!process.versions?.node &&
	typeof setImmediate == `function`;
var S = class {
	constructor(e, t, n) {
		((this.resolve = e),
			(this.futex = t),
			(this.fiber = n),
			(this.timer = 0),
			(this.done = !1),
			(this.words = null),
			(this.at = 0),
			(this.seq = 0));
	}
};
const C = new (class {
		#e = new Set();
		#t = new Map();
		#n = new Set();
		#r = [];
		#i = [];
		#a = !1;
		#o = null;
		#s = performance.now();
		stats = {
			parks: 0,
			futexParks: 0,
			wakes: 0,
			yields: 0,
			macroTurns: 0,
			timeouts: 0,
			flushes: 0,
		};
		constructor() {
			typeof MessageChannel == `function` &&
				((this.#o = new MessageChannel()),
				(this.#o.port1.onmessage = () => this.#c()),
				this.#o.port1.start?.(),
				this.#o.port1.unref?.());
		}
		#c() {
			((this.#a = !1),
				this.#o?.port1.unref?.(),
				(this.#s = performance.now()),
				this.stats.macroTurns++);
			let e = this.#r,
				t = this.#i;
			((this.#r = []), (this.#i = []));
			for (let e of t) e();
			for (let t of e) t();
		}
		#l() {
			if (!this.#a) {
				if (((this.#a = !0), x)) {
					setImmediate(() => this.#c());
					return;
				}
				(this.#o?.port1.ref?.(),
					this.#o
						? this.#o.port2.postMessage(0)
						: setTimeout(() => this.#c(), 0));
			}
		}
		sliceOver() {
			return performance.now() - this.#s >= 8;
		}
		#u(e) {
			this.sliceOver() ? (this.#r.push(e), this.#l()) : e();
		}
		#d(e, t) {
			if (!e.done) {
				if (((e.done = !0), e.timer && clearTimeout(e.timer), e.words))
					this.#n.delete(e);
				else if (e.futex === null) this.#e.delete(e);
				else {
					let t = this.#t.get(e.futex);
					(t?.delete(e), t && !t.size && this.#t.delete(e.futex));
				}
				(this.#i.push(() => {
					e.fiber?.dead || e.resolve(t);
				}),
					this.#l());
			}
		}
		#f() {
			if (!this.#i.length) return;
			this.stats.flushes++;
			let e = this.#i;
			this.#i = [];
			for (let t of e) this.#u(t);
		}
		#p(e, t, n, r = null) {
			return (
				this.checkSlots(),
				new Promise((i) => {
					let a = new S(i, e, n);
					if (r)
						((a.words = r.words),
							(a.at = r.at),
							(a.seq = r.seq),
							this.#n.add(a));
					else if (e === null) this.#e.add(a);
					else {
						let t = this.#t.get(e);
						(t || this.#t.set(e, (t = new Set())), t.add(a));
					}
					let o = Number(t),
						s = Math.max(0, o / 1e6);
					(o >= 0 &&
						Number.isFinite(s) &&
						s < 2 ** 31 &&
						(a.timer = setTimeout(() => {
							(this.stats.timeouts++, this.#d(a, 2));
						}, s)),
						this.#f());
				})
			);
		}
		parkSlot(e, t, n, r, i = null) {
			return Atomics.load(e(), t) === n
				? ((this.stats.slotParks = (this.stats.slotParks ?? 0) + 1),
					this.#p(null, r, i, { words: e, at: t, seq: n }))
				: 1;
		}
		checkSlots() {
			if (this.#n.size)
				for (let e of [...this.#n])
					Atomics.load(e.words(), e.at) !== e.seq && this.#d(e, 0);
		}
		park(e, t = null) {
			return (this.stats.parks++, this.#p(null, e, t));
		}
		wake() {
			if (!(!this.#e.size && !this.#n.size)) {
				this.stats.wakes++;
				for (let e of [...this.#e]) this.#d(e, 0);
				for (let e of [...this.#n]) this.#d(e, 0);
			}
		}
		drop(e) {
			for (let t of [...this.#n])
				t.fiber === e &&
					((t.done = !0), clearTimeout(t.timer), this.#n.delete(t));
			for (let t of [...this.#e])
				t.fiber === e &&
					((t.done = !0), clearTimeout(t.timer), this.#e.delete(t));
			for (let [t, n] of this.#t) {
				for (let t of [...n])
					t.fiber === e && ((t.done = !0), clearTimeout(t.timer), n.delete(t));
				n.size || this.#t.delete(t);
			}
		}
		maybeYield(e = null) {
			return (
				this.checkSlots(),
				this.sliceOver()
					? (this.stats.yields++,
						new Promise((t) => {
							(this.#r.push(() => {
								e?.dead || t(0);
							}),
								this.#l());
						}))
					: 0
			);
		}
		yieldNow(e = null) {
			return (
				this.checkSlots(),
				this.#i.length
					? (this.stats.yields++, this.#f(), Promise.resolve(0))
					: this.maybeYield(e)
			);
		}
		get parked() {
			let e = this.#e.size + this.#n.size;
			for (let t of this.#t.values()) e += t.size;
			return e;
		}
	})(),
	w = () => {
		b.on && C.checkSlots();
	};
var T = class e {
		#e;
		#t;
		#n;
		static async open(t) {
			return !t?.module || !t?.memory
				? null
				: !b.on &&
					  typeof Worker == `function` &&
					  typeof SharedArrayBuffer < `u` &&
					  t.memory.buffer instanceof SharedArrayBuffer
					? E.open(t)
					: e.openHere(t);
		}
		static async openHere(t) {
			if (!t?.module || !t?.memory) return null;
			let n =
					t.module instanceof WebAssembly.Module
						? t.module
						: await WebAssembly.compile(t.module),
				r,
				i;
			try {
				try {
					((i = new WebAssembly.Memory({
						initial: 1,
						maximum: 65535,
						shared: !0,
					})),
						(r = await WebAssembly.instantiate(n, {
							env: {
								memory: t.memory,
								...m(i),
								lazy_fetch: v(t.memory),
								page_fs: y(t.memory),
							},
						})));
				} catch {
					((i = new WebAssembly.Memory({ initial: 1, maximum: 65535 })),
						(r = await WebAssembly.instantiate(n, {
							env: {
								memory: t.memory,
								...m(i),
								lazy_fetch: v(t.memory),
								page_fs: y(t.memory),
							},
						})));
				}
			} catch (e) {
				return (console.warn(`[gex] no shared terminal: ${e.message}`), null);
			}
			let a = r.exports;
			return typeof a.k_tty_input == `function`
				? (a.k_stack_area &&
						r.exports.__stack_pointer &&
						_(r.exports, g(a, `tty`)),
					new e(a, i))
				: (console.warn(
						`[gex] no shared terminal: the global kernel has no k_tty_input, so it is older than this glue. Rebuild it with shims/kernel/build.sh.`,
					),
					null);
		}
		constructor(e, t) {
			((this.#e = e), (this.#n = t), (this.#t = new Uint8Array(t.buffer)));
		}
		#r() {
			return (
				this.#t.buffer !== this.#n.buffer &&
					(this.#t = new Uint8Array(this.#n.buffer)),
				this.#t
			);
		}
		input(e) {
			let t = typeof e == `string` ? new TextEncoder().encode(e) : e,
				n = 0;
			for (let e = 0; e < t.length; e += 3840) {
				let r = t.subarray(e, e + 4096 - 256);
				(this.#r().set(r, 256),
					(n = this.#e.k_tty_input(BigInt(256), r.length)));
			}
			return (w(), n);
		}
		key(e) {
			return {
				echo: this.input(e) ? this.drainEcho() : null,
				ready: this.ready(),
			};
		}
		drainEcho() {
			let e = [];
			for (;;) {
				let t = this.#e.k_tty_echo(BigInt(256), 3840);
				if (t <= 0 || (e.push(this.#r().slice(256, 256 + t)), t < 3840)) break;
			}
			if (!e.length) return null;
			if (e.length === 1) return e[0];
			let t = e.reduce((e, t) => e + t.length, 0),
				n = new Uint8Array(t),
				r = 0;
			for (let t of e) (n.set(t, r), (r += t.length));
			return n;
		}
		ready() {
			return this.#e.k_stdin_ready();
		}
		eof() {
			(this.#e.k_stdin_eof(), w());
		}
		lflag() {
			if (this.#e.k_tty_get_termios(BigInt(256), 60) < 16) return 0;
			let e = this.#r();
			return (e[268] | (e[269] << 8) | (e[270] << 16) | (e[271] << 24)) >>> 0;
		}
		winsize() {
			let e = this.#e.k_tty_winsize();
			return [Number(e >> 48n) & 65535, Number((e >> 32n) & 65535n)];
		}
		resize(e, t) {
			let n = (BigInt(e & 65535) << 48n) | (BigInt(t & 65535) << 32n),
				r = this.#e.k_tty_resize(n) !== 0;
			return (w(), r);
		}
		fg() {
			return this.#e.k_tty_fg();
		}
		signal(e) {
			let t = this.#e.k_tty_signal(e >>> 0);
			return (w(), t);
		}
	},
	E = class e {
		#e;
		#t = 0;
		#n = new Map();
		static async open(t) {
			let n = new Worker(self.location.href, { type: `module`, name: `tty` }),
				r = new e(n);
			return (await r
				.#r(`open`, { module: t.module, memory: t.memory })
				.catch(
					(e) => (
						console.warn(`[gex] no shared terminal: ${e?.message ?? e}`),
						!1
					),
				))
				? r
				: (n.terminate(), null);
		}
		constructor(e) {
			((this.#e = e),
				(e.onmessage = (e) => {
					let { id: t, value: n, error: r } = e.data,
						i = this.#n.get(t);
					(this.#n.delete(t),
						r === void 0 ? i?.resolve(n) : i?.reject(Error(r)));
				}),
				(e.onerror = (e) => {
					for (let t of this.#n.values())
						t.reject(Error(e.message || `the terminal Worker failed`));
					this.#n.clear();
				}));
		}
		#r(e, ...t) {
			let n = ++this.#t;
			return new Promise((r, i) => {
				(this.#n.set(n, { resolve: r, reject: i }),
					this.#e.postMessage({ id: n, op: e, args: t }));
			});
		}
		key(e) {
			return this.#r(`key`, e);
		}
		input(e) {
			return this.#r(`input`, e);
		}
		drainEcho() {
			return this.#r(`drainEcho`);
		}
		ready() {
			return this.#r(`ready`);
		}
		eof() {
			return this.#r(`eof`);
		}
		lflag() {
			return this.#r(`lflag`);
		}
		winsize() {
			return this.#r(`winsize`);
		}
		resize(e, t) {
			return this.#r(`resize`, e, t);
		}
		fg() {
			return this.#r(`fg`);
		}
		signal(e) {
			return this.#r(`signal`, e);
		}
		close() {
			this.#e.terminate();
		}
	};
let D = null;
const O = new Set([
	`key`,
	`input`,
	`drainEcho`,
	`ready`,
	`eof`,
	`lflag`,
	`winsize`,
	`resize`,
	`fg`,
	`signal`,
]);
let k = Promise.resolve();
self.onmessage = (e) => {
	let { id: t, op: n, args: r } = e.data;
	k = k.then(async () => {
		try {
			n === `open`
				? ((D = await T.openHere(r[0])),
					self.postMessage({ id: t, value: !!D }))
				: D && O.has(n)
					? self.postMessage({ id: t, value: D[n](...r) })
					: self.postMessage({
							id: t,
							error: `the terminal Worker has no ${n}${D ? `` : ` (not open)`}`,
						});
		} catch (e) {
			self.postMessage({ id: t, error: String(e?.stack ?? e) });
		}
	});
};
