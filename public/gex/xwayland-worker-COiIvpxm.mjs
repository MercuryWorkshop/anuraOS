var e = Object.create,
	t = Object.defineProperty,
	n = Object.getOwnPropertyDescriptor,
	r = Object.getOwnPropertyNames,
	i = Object.getPrototypeOf,
	a = Object.prototype.hasOwnProperty,
	o = (e, t, n) => () => {
		if (n) throw n[0];
		try {
			return (e && (t = e((e = 0))), t);
		} catch (e) {
			throw ((n = [e]), e);
		}
	},
	s = (e, t) => () => (
		t || (e((t = { exports: {} }).exports, t), (e = null)),
		t.exports
	),
	c = (e, n) => {
		let r = {};
		for (var i in e) t(r, i, { get: e[i], enumerable: !0 });
		return (n || t(r, Symbol.toStringTag, { value: `Module` }), r);
	},
	l = (e, i, o, s) => {
		if ((i && typeof i == `object`) || typeof i == `function`)
			for (var c = r(i), l = 0, u = c.length, d; l < u; l++)
				((d = c[l]),
					!a.call(e, d) &&
						d !== o &&
						t(e, d, {
							get: ((e) => i[e]).bind(null, d),
							enumerable: !(s = n(i, d)) || s.enumerable,
						}));
		return e;
	},
	u = (n, r, o) => (
		(o = n == null ? {} : e(i(n))),
		l(
			r || !n || !n.__esModule || !a.call(n, `default`)
				? t(o, `default`, { value: n, enumerable: !0 })
				: o,
			n,
		)
	);
const d = { on: !1 };
WebAssembly.Suspending;
const f =
	typeof process == `object` &&
	!!process.versions?.node &&
	typeof setImmediate == `function`;
var p = class {
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
const m = new (class {
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
				if (((this.#a = !0), f)) {
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
					let a = new p(i, e, n);
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
	h = (e, t) => (e[t + 8] >>> 0) + (e[t + 37] >>> 0) * 4294967296,
	g = 1 << 20;
function _(e) {
	for (; Atomics.compareExchange(e, 110921, 0, 1) !== 0; )
		typeof Atomics.wait == `function` &&
			!globalThis.document &&
			Atomics.wait(e, 110921, 1, 1);
}
function v(e) {
	(Atomics.store(e, 110921, 0), Atomics.notify(e, 110921));
}
function y(e, t, n) {
	let r = Math.min(t.length, g);
	(_(e),
		new Uint8Array(e.buffer, 443700, r).set(t.subarray(0, r)),
		Atomics.store(e, 110924, r),
		Atomics.store(e, 110923, n));
	let i = (Atomics.add(e, 110922, 1) + 1) >>> 0;
	return (v(e), i);
}
const b = (e) => 8 + e * 2440,
	x = (e) => 78088 + e * 514,
	S = 2048,
	C = 64 << 20,
	w = 1 << 20;
function T(e) {
	let t = new Int32Array(e.arena);
	return {
		w: Atomics.load(t, 0) || 640,
		h: Atomics.load(t, 1) || 480,
		scale: Atomics.load(t, 3) || 1,
	};
}
new TextDecoder();
var ee = class {
		#e;
		#t = -1;
		#n = 0;
		#r = 0;
		#i;
		#a = new Int32Array(384);
		#o = 0;
		#s = new Int32Array(64);
		#c = new Uint32Array(64);
		#l = new Int32Array(256);
		#u = null;
		constructor(e, t, n) {
			((this.#e = new Int32Array(e.arena)),
				(this.#d = !!e.pixels),
				(this.#C = n),
				(this.#T = t));
		}
		#d;
		#f = null;
		#p = 0;
		#m = !1;
		onPixels = null;
		#h(e) {
			let t = Math.ceil(e / w) * w;
			if (t > C) return !1;
			let n = this.#p;
			this.#f = new SharedArrayBuffer(t);
			let r = (Atomics.add(this.#e, 7, 1) + 1) >>> 0;
			return (
				(r ||= (Atomics.add(this.#e, 7, 1) + 1) >>> 0),
				(this.#p = r),
				this.onPixels?.({
					token: this.#i,
					id: this.#p,
					buffer: this.#f,
					replaces: n,
				}),
				!0
			);
		}
		firstForKernel() {
			return Atomics.compareExchange(this.#e, 4, 0, 1) === 0;
		}
		#g(e, t) {
			if (!this.#d) return;
			let n = this.#e;
			{
				let e = this.#f && this.#b(),
					r = 0,
					i = 0;
				for (let a = 0; a < t; a++) {
					let t = this.#s[a],
						o = (n[t + 6] * n[t + 7] * 4 + 255) & -256;
					if (((i += o), !e)) continue;
					let s = -1;
					for (let r = 0; r < 64 && s < 0; r++) {
						let i = 4 + r * 5;
						e[i + 2] && e[i] === n[t + 0] && e[i + 1] === n[t + 1] && (s = i);
					}
					(s < 0 || e[s + 3] < o) && (r += o);
				}
				let a = e ? Math.max(e[1], S) : S;
				if (!e || (a + r > this.#f.byteLength && S + i > this.#f.byteLength)) {
					let e = S + i,
						r = Math.max(e + (e >> 2), this.#f ? this.#f.byteLength * 2 : 0);
					if (!this.#h(Math.min(r, C)) && !this.#f) {
						for (let e = 0; e < t; e++) {
							let t = this.#s[e];
							((n[t + 8] = 0), (n[t + 37] = 0));
						}
						return;
					}
				}
			}
			let r = this.#f,
				i = this.#b(),
				a = (e, t) => {
					for (let n = 0; n < 64; n++) {
						let r = 4 + n * 5;
						if (i[r + 2] && i[r] === e && i[r + 1] === t) return r;
					}
					return -1;
				};
			for (; Atomics.compareExchange(i, 0, 0, 1) !== 0; );
			try {
				i[1] < S && (i[1] = S);
				let o = 0;
				for (let e = 0; e < t; e++) {
					let t = this.#s[e],
						r = a(n[t + 0], n[t + 1]),
						s = n[t + 6] * n[t + 7] * 4;
					(r < 0 || i[r + 3] < s) && (o += (s + 255) & -256);
				}
				if (i[1] + o > r.byteLength) {
					for (let e = 0; e < 320; e++) i[4 + e] = 0;
					i[1] = S;
				}
				let s = this.#S(e);
				for (let o = 0; o < t; o++) {
					let t = this.#s[o],
						c = this.#c[o] === this.#p,
						l = this.#l[o * 4],
						u = this.#l[o * 4 + 1],
						d = this.#l[o * 4 + 2],
						f = this.#l[o * 4 + 3],
						p = n[t + 6],
						m = n[t + 7],
						g = p * m * 4,
						_ = h(n, t),
						v = n[t + 9],
						y = a(n[t + 0], n[t + 1]),
						b = !c;
					if (y < 0 || i[y + 3] < g) {
						if (y < 0) {
							for (let e = 0; e < 64 && y < 0; e++)
								i[4 + e * 5 + 2] || (y = 4 + e * 5);
							y < 0 && (y = 4);
						}
						let e = i[1];
						if (e + g > r.byteLength) {
							(this.#m ||
								console.warn(
									`[wl] a ${p}x${m} surface does not fit its block's ${r.byteLength >> 20} MiB of pixels`,
								),
								(this.#m = !0),
								(n[t + 8] = 0),
								(n[t + 37] = 0));
							continue;
						}
						((i[y] = n[t + 0]),
							(i[y + 1] = n[t + 1]),
							(i[y + 2] = e),
							(i[y + 3] = g),
							(i[1] = e + ((g + 255) & -256)),
							(b = !0));
					}
					let x = i[y + 2],
						S = n[t + 11];
					if (b || i[y + 4] !== S) {
						let t = 0,
							n = 0,
							r = p,
							a = m;
						!b &&
							d > 0 &&
							f > 0 &&
							((t = Math.max(0, Math.min(l, p))),
							(n = Math.max(0, Math.min(u, m))),
							(r = Math.max(0, Math.min(d, p - t))),
							(a = Math.max(0, Math.min(f, m - n))));
						let o = this.#v;
						if (_ + (n + a - 1) * v + (t + r) * 4 <= s.length || a === 0) {
							if (r === p && v === p * 4) {
								let e = _ + n * v;
								o.set(s.subarray(e, e + a * v), x + n * p * 4);
							} else {
								let i = !((_ | v) & 3),
									c = i ? this.#O(e) : null,
									l = this.#y;
								for (let e = 0; e < a; e++) {
									let a = _ + (n + e) * v + t * 4,
										u = x + (n + e) * p * 4 + t * 4;
									if (r >= 64 || !i) o.set(s.subarray(a, a + r * 4), u);
									else
										for (let e = 0, t = a >> 2, n = u >> 2; e < r; e++)
											l[n + e] = c[t + e];
								}
							}
						}
						i[y + 4] = S;
					}
					((n[t + 8] = x), (n[t + 37] = this.#p), (n[t + 9] = p * 4));
				}
			} finally {
				Atomics.store(i, 0, 0);
			}
		}
		#_ = null;
		#v = null;
		#y = null;
		#b() {
			return (
				this.#_?.buffer !== this.#f &&
					((this.#_ = new Int32Array(this.#f, 0, 512)),
					(this.#v = new Uint8Array(this.#f)),
					(this.#y = new Int32Array(this.#f))),
				this.#_
			);
		}
		#x = null;
		#S(e) {
			let t = this.#x;
			return t && t.buffer === e.buffer
				? t
				: (this.#x = new Uint8Array(e.buffer));
		}
		#C;
		onToken = null;
		wakeAddr = null;
		#w() {
			if (this.#t >= 0) return !0;
			let e = this.#C?.() | 0;
			return e
				? ((this.#i = e),
					this.#E(),
					this.#t >= 0 && this.onToken?.(e),
					this.#t >= 0)
				: !1;
		}
		#T;
		#E() {
			let e = Date.now();
			for (let e = 0; e < 32; e++) {
				let t = b(e);
				if (Atomics.load(this.#e, t + 0) === this.#i) {
					((this.#t = e), (this.#n = t), (this.#r = x(e)), this.#D());
					return;
				}
			}
			for (let t = 0; t < 2; t++)
				for (let n = 0; n < 32; n++) {
					let r = b(n),
						i = Atomics.load(this.#e, r + 0),
						a = t === 1 && i && e - Atomics.load(this.#e, r + 1) > 5e3;
					if (
						!(i && !a) &&
						Atomics.compareExchange(this.#e, r + 0, i, this.#i) === i
					) {
						((this.#t = n),
							(this.#n = r),
							(this.#r = x(n)),
							Atomics.store(this.#e, r + 2, 0),
							Atomics.store(this.#e, r + 3, 0),
							Atomics.store(this.#e, r + 4, 0),
							Atomics.store(this.#e, r + 7, 0),
							Atomics.store(this.#e, r + 1, e),
							this.#f && new Int32Array(this.#f, 0, 512).fill(0),
							this.#D());
						return;
					}
				}
		}
		#D() {
			let e = this.wakeAddr?.();
			e?.addr &&
				e?.slots &&
				(Atomics.store(this.#e, this.#n + 6, e.slots | 0),
				Atomics.store(this.#e, this.#n + 5, e.addr | 0));
		}
		get token() {
			return this.#i;
		}
		get ok() {
			return this.#t >= 0;
		}
		get generation() {
			return Atomics.load(this.#e, this.#n + 3);
		}
		get drawnGeneration() {
			return Atomics.load(this.#e, this.#n + 4);
		}
		publish(e, t, n, r = e) {
			if (
				(this.#t >= 0 &&
					Atomics.load(this.#e, this.#n + 0) !== this.#i &&
					((this.#t = -1), (this.#o = 0)),
				!this.#w())
			)
				return;
			let i = this.#e,
				a = Math.min(n, 64),
				o = this.#O(e),
				s = Atomics.load(i, this.#n + 3);
			Atomics.load(i, this.#n + 4) === s && (this.#o = 0);
			let c = this.#a,
				l = 0;
			for (let e = 0; e < a; e++) {
				let n = (t >>> 2) + e * 38,
					r = this.#n + 8 + e * 38,
					a = o[n + 0],
					s = o[n + 1],
					u = i[r + 0] === a && i[r + 1] === s && this.#d ? i[r + 37] >>> 0 : 0;
				for (let e = 0; e < 38; e++) i[r + e] = o[n + e];
				let d = o[n + 12],
					f = o[n + 13],
					p = o[n + 14],
					m = o[n + 15];
				this.#d &&
					h(i, r) &&
					o[n + 6] > 0 &&
					o[n + 7] > 0 &&
					((this.#s[l] = r),
					(this.#c[l] = u),
					(this.#l[l * 4] = d),
					(this.#l[l * 4 + 1] = f),
					(this.#l[l * 4 + 2] = p),
					(this.#l[l * 4 + 3] = m),
					l++);
				let g = 0;
				for (; g < this.#o && (c[g * 6] !== a || c[g * 6 + 1] !== s); ) g++;
				if (g < this.#o) {
					let e = g * 6;
					if (c[e + 4] <= 0 || c[e + 5] <= 0 || p <= 0 || m <= 0)
						((d = 0), (f = 0), (p = 0), (m = 0));
					else {
						let t = Math.max(c[e + 2] + c[e + 4], d + p),
							n = Math.max(c[e + 3] + c[e + 5], f + m);
						((d = Math.min(c[e + 2], d)),
							(f = Math.min(c[e + 3], f)),
							(p = t - d),
							(m = n - f));
					}
				} else
					g < 64 ? this.#o++ : ((g = -1), (d = 0), (f = 0), (p = 0), (m = 0));
				if (g >= 0) {
					let e = g * 6;
					((c[e] = a),
						(c[e + 1] = s),
						(c[e + 2] = d),
						(c[e + 3] = f),
						(c[e + 4] = p),
						(c[e + 5] = m));
				}
				((i[r + 12] = d), (i[r + 13] = f), (i[r + 14] = p), (i[r + 15] = m));
			}
			(l && this.#g(r, l),
				Atomics.store(this.#e, this.#n + 2, a),
				Atomics.store(this.#e, this.#n + 1, Date.now()),
				Atomics.add(this.#e, this.#n + 3, 1),
				Atomics.add(this.#e, 2, 1),
				Atomics.notify(this.#e, 2),
				this.#T?.());
		}
		pollInput(e, t, n) {
			if (!this.#w()) return 0;
			let r = this.#e,
				i = this.#r,
				a = Atomics.load(r, i + 0),
				o = Atomics.load(r, i + 1);
			if ((a - o > 64 && (o = a - 64), o === a)) return 0;
			let s = this.#O(e),
				c = t >>> 2,
				l = 0;
			for (; o < a && l < n; ) {
				let e = i + 2 + (o % 64) * 8;
				for (let t = 0; t < 8; t++) s[c + l * 8 + t] = r[e + t];
				(o++, l++);
			}
			return (Atomics.store(r, i + 1, o), l);
		}
		#O(e) {
			let t = this.#u;
			return t && t.buffer === e.buffer
				? t
				: (this.#u = new Int32Array(e.buffer));
		}
		#k = 0;
		clipSerial() {
			return (this.#k = Atomics.load(this.#e, 110922) >>> 0);
		}
		clipGet(e, t, n) {
			let r = this.#e;
			_(r);
			let i = Math.min(Atomics.load(r, 110924) >>> 0, g),
				a = Math.min(i, n);
			return (
				new Uint8Array(e.buffer, t, a).set(new Uint8Array(r.buffer, 443700, a)),
				v(r),
				i
			);
		}
		clipSet(e, t, n) {
			return (this.#k = y(this.#e, new Uint8Array(e.buffer, t, n), 1));
		}
		dragData(e, t, n) {
			let r = this.#e,
				i = Math.min(Atomics.load(r, 94536) >>> 0, 65536);
			return (
				new Uint8Array(e.buffer, t, Math.min(i, n)).set(
					new Uint8Array(r.buffer, 378148, Math.min(i, n)),
				),
				i
			);
		}
		dragStatus(e, t) {
			if (this.#t < 0) return;
			let n = this.#n + 7;
			(Atomics.store(this.#e, n, (e << 4) | (t & 15) | 0),
				Atomics.notify(this.#e, n));
		}
		inputPending() {
			if (
				this.#A !== this.#j() ||
				this.#k !== Atomics.load(this.#e, 110922) >>> 0
			)
				return !0;
			if (this.#t < 0) return !1;
			let e = this.#e;
			return Atomics.load(e, this.#r + 0) !== Atomics.load(e, this.#r + 1);
		}
		outputSize() {
			return ((this.#A = this.#j()), this.#A);
		}
		#A = 0;
		#j() {
			let e = this.#e;
			return (
				(((Atomics.load(e, 0) & 65535) << 16) |
					(Atomics.load(e, 1) & 65535)) >>>
				0
			);
		}
		release() {
			this.#t < 0 ||
				(Atomics.store(this.#e, this.#n + 2, 0),
				Atomics.store(this.#e, this.#n + 0, 0),
				(this.#t = -1));
		}
	},
	E = s((e, t) => {
		t.exports = {};
	}),
	D = c({ ZSTDDecoder: () => N }),
	O,
	k,
	A,
	j,
	M,
	N,
	P = o(() => {
		((M = {
			env: {
				emscripten_notify_memory_growth: (e) => {
					((A = new Uint8Array(k.exports.memory.buffer)),
						(j = new DataView(A.buffer)));
				},
			},
		}),
			(N = class {
				init() {
					if (O) return O;
					let e = new URL("./zstddec-x1VHh1jj.wasm?no-inline", import.meta.url);
					return (
						(O =
							typeof process < `u` && e.protocol === `file:`
								? Promise.resolve()
										.then(() => u(E(), 1))
										.then((t) => t.readFile(e))
										.then((e) => WebAssembly.instantiate(e, M))
										.then(this._init)
								: fetch(e)
										.then((t) => {
											if (!t.ok) throw Error(`${e}: ${t.status}`);
											return t.arrayBuffer();
										})
										.then((e) => WebAssembly.instantiate(e, M))
										.then(this._init)),
						O
					);
				}
				dispose() {
					k = A = j = O = void 0;
				}
				_init(e) {
					((k = e.instance), M.env.emscripten_notify_memory_growth(0));
				}
				decode(e, t = 0) {
					if (!k) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
					let n = e.byteLength,
						r = k.exports.malloc(n);
					if (
						(A.set(e, r),
						t === 0 && (t = Number(k.exports.ZSTD_findDecompressedSize(r, n))),
						t === -1)
					) {
						k.exports.free(r);
						let t = [];
						for (let n of this.decodeStreaming([e])) t.push(n);
						if (t.length === 1) return t[0];
						let n = t.reduce((e, t) => e + t.byteLength, 0),
							i = new Uint8Array(n),
							a = 0;
						for (let e of t) (i.set(e, a), (a += e.byteLength));
						return i;
					}
					let i = k.exports.malloc(t),
						a = k.exports.ZSTD_decompress(i, t, r, n),
						o = A.slice(i, i + a);
					return (k.exports.free(r), k.exports.free(i), o);
				}
				stream() {
					if (!k) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
					let e = k.exports.ZSTD_DStreamOutSize(),
						t = k.exports.malloc(e),
						n = k.exports.ZSTD_createDCtx(),
						r = k.exports.malloc(12),
						i = k.exports.malloc(12),
						a = 0,
						o = 0,
						s = 0;
					return {
						push(c, l) {
							for (
								c.byteLength > o &&
									(s && k.exports.free(s),
									(o = c.byteLength),
									(s = k.exports.malloc(o))),
									A.set(c, s),
									j.setInt32(r, s, !0),
									j.setInt32(r + 4, c.byteLength, !0),
									j.setInt32(r + 8, 0, !0);
								j.getUint32(r + 8, !0) < j.getUint32(r + 4, !0);
							) {
								if (
									(j.setInt32(i, t, !0),
									j.setInt32(i + 4, e, !0),
									j.setInt32(i + 8, 0, !0),
									(a = k.exports.ZSTD_decompressStream(n, i, r)),
									a > 4294967040)
								)
									throw Error(`ZSTD_decompressStream: error ${a}`);
								let o = j.getUint32(i + 8, !0);
								o && l(A.subarray(t, t + o));
							}
						},
						end() {
							if (
								(s && k.exports.free(s),
								k.exports.ZSTD_freeDCtx(n),
								k.exports.free(t),
								k.exports.free(r),
								k.exports.free(i),
								a !== 0)
							)
								throw Error(`Incomplete stream, more data expected.`);
						},
					};
				}
				*decodeStreaming(e) {
					if (!k) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
					let t = k.exports.ZSTD_DStreamInSize(),
						n = k.exports.malloc(t),
						r = k.exports.ZSTD_DStreamOutSize(),
						i = k.exports.malloc(r),
						a = k.exports.ZSTD_createDCtx(),
						o = k.exports.malloc(12),
						s = k.exports.malloc(12),
						c = 0;
					for (let t of e) {
						let e = k.exports.malloc(t.byteLength);
						for (
							A.set(t, e),
								j.setInt32(o, e, !0),
								j.setInt32(o + 4, t.byteLength, !0),
								j.setInt32(o + 4 + 4, 0, !0);
							j.getUint32(o + 4 + 4, !0) < j.getUint32(o + 4, !0);
						) {
							(j.setInt32(s, i, !0),
								j.setInt32(s + 4, r, !0),
								j.setInt32(s + 4 + 4, 0, !0),
								(c = k.exports.ZSTD_decompressStream(a, s, o)));
							let e = j.getUint32(s + 4 + 4, !0);
							yield A.slice(i, i + e);
						}
						k.exports.free(e);
					}
					if (
						(k.exports.ZSTD_freeDCtx(a),
						k.exports.free(n),
						k.exports.free(i),
						k.exports.free(o),
						k.exports.free(s),
						c !== 0)
					)
						throw Error(`Incomplete stream, more data expected.`);
				}
			}));
	});
let F = null;
async function I() {
	return (
		(F ||= (async () => {
			let { ZSTDDecoder: e } = await Promise.resolve().then(() => (P(), D)),
				t = new e();
			return (await t.init(), t);
		})()),
		F
	);
}
function L(e) {
	return (
		e.length > 4 && e[0] === 40 && e[1] === 181 && e[2] === 47 && e[3] === 253
	);
}
async function R(e) {
	return (await I()).decode(e);
}
let z,
	B = 0;
function V(e) {
	(z === void 0 &&
		((z =
			typeof BroadcastChannel == `function`
				? new BroadcastChannel(`gex-fetch`)
				: null),
		z?.unref?.()),
		z?.postMessage(e));
}
function te(e, t = 0, n = ``) {
	if (typeof BroadcastChannel != `function`) return () => {};
	let r = `${globalThis.name ?? ``}:${B++}:${Math.random().toString(36).slice(2, 8)}`;
	try {
		V({ id: r, what: e, bytes: t, owner: n, phase: `start` });
	} catch {}
	let i = !1;
	return (t = 0) => {
		if (!i) {
			i = !0;
			try {
				V({ id: r, what: e, bytes: t, phase: `end` });
			} catch {}
		}
	};
}
function ne() {
	return !1;
}
function H(e, t, n, r) {
	return -1;
}
Object.freeze([250, 1e3, 4e3]);
var U = class {
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
let W = null;
function G(e, t, n, r, i) {
	let a = {}.GEX_NODE_LAZY && globalThis.process.getBuiltinModule?.(`node:fs`);
	if (!a) return -1;
	let o = Number({}.GEX_LAZY_DELAY_MS || 0);
	o > 0 &&
		Atomics.wait((W ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, o);
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
new U();
const K = new U();
function q(e, t) {
	K.held(e) || (K.failed(e), console.error(t));
}
function J(e, t, n, r, i) {
	let a = Y(e),
		o = a.lastIndexOf(`#`);
	if (o < 0 || typeof XMLHttpRequest != `function`) return -1;
	let s = a.slice(0, o);
	return (
		Number(a.slice(o + 1)) + t,
		ne() || q(s, `[lazy] ${s}: the zstd decoder is not loaded (lazyReady)`),
		-1
	);
}
const Y = (e) => {
		try {
			return new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.GEX_BASE ?? globalThis.location?.href,
			).href;
		} catch {
			return e;
		}
	},
	X = new Map();
function re(e, t = !1, n = null) {
	let r =
			typeof SharedArrayBuffer < `u` && e.buffer instanceof SharedArrayBuffer,
		i = t ? n?.m32 : n?.m64;
	i &&
		(typeof SharedArrayBuffer < `u` &&
			i.buffer instanceof SharedArrayBuffer) !== r &&
		(i = null);
	let a = `${t ? 32 : 64}:${r}`;
	return (
		(i ??= X.get(a)),
		i ||
			((i = t
				? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: r })
				: new WebAssembly.Memory({
						address: `i64`,
						initial: 0n,
						maximum: 0n,
						shared: r,
					})),
			X.set(a, i)),
		t ? { process: i, process64: e } : { process: e, process64: i }
	);
}
const ie = Object.freeze({ tty: 0, hostx: 1, persist: 2, fsOpened: 3 });
function ae(e, t) {
	let n = e.k_stack_area() >>> 0,
		r = e.k_stack_size() >>> 0;
	return n + ((e.k_stack_count() >>> 0) - ie[t]) * r;
}
function oe(e, t) {
	let n = t >>> 0,
		r = e.__tls_size ? e.__tls_size.value >>> 0 : 0;
	if (r && typeof e.__wasm_init_tls == `function`) {
		let t = Math.max(16, e.__tls_align ? e.__tls_align.value >>> 0 : 16),
			i = (n - r) & -t;
		(e.__wasm_init_tls(i), (n = i));
	}
	return ((e.__stack_pointer.value = n | 0), n);
}
function se(e) {
	return (t, n, r, i, a) => {
		((t >>>= 0), (n >>>= 0), (i >>>= 0), (a >>>= 0));
		let o = Number(r),
			s = new TextDecoder().decode(new Uint8Array(e.buffer, t, n).slice()),
			c = te(s, a);
		if (s.includes(`#`)) {
			if (H(Y(s), o, i, a) === a) return (c(a), a);
			let t = J(s, o, e, i, a);
			return (
				c(t > 0 ? t : 0),
				t < 0 && q(s, `[lazy] ${s}: a read failed (rest bundle)`),
				t
			);
		}
		if (H(Y(s), o, i, a) === a) return (c(a), a);
		if (typeof XMLHttpRequest != `function`) {
			let t = G(s, o, e, i, a);
			return (c(t > 0 ? t : 0), t);
		}
		let l = `no response`;
		try {
			for (let t = 0; t < 3; t++)
				try {
					let t = new XMLHttpRequest();
					(t.open(`GET`, Y(s), !1),
						(t.responseType = `arraybuffer`),
						t.setRequestHeader(`Range`, `bytes=${o}-${o + a - 1}`),
						t.setRequestHeader(`Cache-Control`, `no-store`),
						t.send());
					let n = new Uint8Array(t.response ?? new ArrayBuffer(0));
					l = `status ${t.status}, ${n.length} bytes`;
					let r = t.status === 206 ? 0 : t.status === 200 ? o : -1;
					if (r < 0 || n.length < r + a) continue;
					return (
						new Uint8Array(e.buffer, i, a).set(n.subarray(r, r + a)),
						c(a),
						a
					);
				} catch (e) {
					l = String(e);
				}
		} finally {
			c(0);
		}
		return (console.error(`[lazy] ${s} @${o}+${a}: failed (${l})`), -1);
	};
}
function ce(e) {
	return (e, t, n, r) => ((e >>>= 0), (t >>>= 0), (n >>>= 0), (r >>>= 0), -5);
}
const Z = 262144;
async function le(e) {
	return (await import(/* @vite-ignore */ /* webpackIgnore: true */ e)).default;
}
function ue() {
	return typeof location < `u`
		? location.href
		: new URL(`file://${process.cwd()}/`).href;
}
async function Q(e) {
	if (/^https?:/.test(e)) {
		if (
			/\.wasm$/.test(
				new URL(/* @vite-ignore */ /* webpackIgnore: true */ e).pathname,
			)
		)
			try {
				let t = await fetch(`${e}.zst`);
				if (t.ok) {
					let e = new Uint8Array(await t.arrayBuffer());
					if (L(e)) return R(e);
				}
			} catch {}
		return (await fetch(e)).arrayBuffer();
	}
	let { readFile: t } = await Promise.resolve().then(() => u(E(), 1)),
		{ fileURLToPath: n } = await Promise.resolve().then(() => u(E(), 1));
	return (await t(e.startsWith(`file:`) ? n(e) : e)).buffer;
}
var de = class {
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
		let t = T(e.wlChannel);
		this.#_ = { w: t.w, h: t.h };
		let n = await le(e.xwaylandUrl);
		if (
			((this.#e = await n({
				locateFile: (t) =>
					e.xwaylandFiles?.[t] ??
					new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ t,
						new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ e.xwaylandUrl,
							ue(),
						),
					).href,
				print: (e) => this.log(e),
				printErr: (e) => this.log(e),
				noInitialRun: !0,
			})),
			e.keymapUrl)
		) {
			let t = new Uint8Array(await Q(e.keymapUrl));
			try {
				this.#e.FS.mkdir(`/xkb`);
			} catch {}
			(this.#e.FS.writeFile(`/xkb/gex.xkm`, t),
				this.log(`[hostx] keymap: ${t.length} bytes at /xkb/gex.xkm`));
		}
		let r = await Q(e.hostwlUrl),
			i = await WebAssembly.instantiate(await WebAssembly.compile(r), {
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
			((this.#t = i.exports),
			(this.#n = i.exports.memory),
			e.wlTrace && this.#t.hw_set_trace?.(1),
			this.#t.hw_init(this.#_.w, this.#_.h),
			e.wlTrace && this.#t.hw_set_trace?.(1),
			e.kernel)
		) {
			let t =
					e.kernel.module instanceof WebAssembly.Module
						? e.kernel.module
						: await WebAssembly.compile(e.kernel.module),
				n = await WebAssembly.instantiate(t, {
					env: {
						memory: e.kernel.memory,
						...re(this.#e.wasmMemory, !1, e.kernel.spare),
						lazy_fetch: se(e.kernel.memory),
						page_fs: ce(e.kernel.memory),
					},
				}),
				r =
					e.kernel.stackTop ??
					(n.exports.k_stack_area ? ae(n.exports, `hostx`) : 0);
			(r && oe(n.exports, r),
				(this.#a = n.exports),
				(this.#o = e.kernel.memory));
		}
		if (!this.#a) throw Error(`the host X server needs the global kernel`);
		(this.#M(),
			(this.#h = new ee(
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
		let a = this.#E(e);
		(this.log(`[hostx] Xwayland ${a.join(` `)}`), this.emit({ kind: `ready` }));
		let o = this.#e.callMain(a);
		if (o instanceof Promise) {
			o.then(
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
						r = e.#k,
						i = e.#j,
						a = BigInt(Math.max(1, t)) * 1000000n,
						o = () => ((e.#j = n.k_ws_seq(r)), 0);
					if (d.on) {
						let t = m.parkSlot(
							() => new Int32Array(e.#o.buffer),
							(n.k_ws_addr(r) >>> 0) >>> 2,
							i,
							a,
						);
						return t === 1 ? o() : t.then(o);
					}
					return (n.k_ws_park(r, i, a), o());
				},
			};
		if (d.on)
			for (let e of [`connect`, `accept`, `close`, `send`, `recv`]) {
				let n = t[e];
				t[e] = (...e) => {
					let t = n(...e);
					return (m.checkSlots(), t);
				};
			}
		if (!this.#b) return t;
		let n = {},
			r = this.#b;
		for (let [e, i] of Object.entries(t)) {
			if (
				e === `tick` ||
				e === `wait` ||
				e === `readable` ||
				e === `writable`
			) {
				n[e] = i;
				continue;
			}
			n[e] = (...t) => {
				let n = i(...t);
				return (r-- > 0 && this.log(`[hostx] ${e}(${t.join(`, `)}) = ${n}`), n);
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
		let n = e.hw_scratch(Z),
			r = e.hw_clip_take(n, Z);
		r >= 0 && (this.#K = t.clipSet(this.#n, n, r));
		let i = t.clipSerial();
		if (i && i !== this.#K) {
			((this.#K = i), (n = e.hw_scratch(Z)));
			let r = t.clipGet(this.#n, n, Z);
			e.hw_clip_set(n, Math.min(r, Z));
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
		let t = T(this.#g);
		if (
			((t.w !== this.#_.w || t.h !== this.#_.h) &&
				((this.#_ = { w: t.w, h: t.h }), e.hw_set_output(t.w, t.h)),
			this.#q(),
			e.hw_wants_input())
		) {
			let t = e.hw_scratch(2048),
				n = this.#h.pollInput(this.#n, t, 64);
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
let $ = null;
onmessage = async (e) => {
	let t = e.data;
	if (!(t?.kind !== `start` || $)) {
		$ = new de((e, t) => (t ? postMessage(e, t) : postMessage(e)));
		try {
			await $.start(t);
		} catch (e) {
			($.log(`[hostx] ${e?.stack || e}`),
				postMessage({ kind: `failed`, why: String(e?.message || e) }));
		}
	}
};
