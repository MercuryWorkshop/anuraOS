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
function d() {
	return C && typeof WebAssembly.promising == `function`;
}
function f(e, t) {
	let n = 0,
		r = 0,
		i;
	do ((i = e[t++]), (n += (i & 127) * 2 ** r), (r += 7));
	while (i & 128);
	return [n, t];
}
function p(e, t) {
	let n = e[t++],
		r;
	return (
		([r, t] = f(e, t)),
		n & 1 && ([r, t] = f(e, t)),
		n & 8 && ([r, t] = f(e, t)),
		t
	);
}
function m(e, t) {
	let n = e[t++];
	return ((n === 99 || n === 100) && ([, t] = f(e, t)), p(e, t));
}
function h(e, t) {
	let n = e[t++];
	return ((n === 99 || n === 100) && ([, t] = f(e, t)), t + 1);
}
function g(e) {
	if (e.length < 8 || e[0] !== 0 || e[1] !== 97 || e[2] !== 115 || e[3] !== 109)
		return null;
	let t = [],
		n = 8;
	for (; n < e.length; ) {
		let r = e[n++],
			i;
		[i, n] = f(e, n);
		let a = n + i;
		if (r === 2) {
			let r,
				i = n;
			[r, i] = f(e, i);
			for (let n = 0; n < r; n++) {
				let n;
				(([n, i] = f(e, i)), (i += n), ([n, i] = f(e, i)), (i += n));
				let r = e[i++];
				if (r === 0) [, i] = f(e, i);
				else if (r === 1) i = m(e, i);
				else if (r === 2) (t.push(i), (i = p(e, i)));
				else if (r === 3) i = h(e, i);
				else if (r === 4) (i++, ([, i] = f(e, i)));
				else return null;
			}
		} else if (r === 5) {
			let r,
				i = n;
			[r, i] = f(e, i);
			for (let n = 0; n < r; n++) (t.push(i), (i = p(e, i)));
		}
		if (r === 10 || r === 11) break;
		n = a;
	}
	return t;
}
function _(e) {
	let t;
	if (e instanceof Uint8Array) t = e;
	else if (ArrayBuffer.isView(e))
		t = new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	else if (e instanceof ArrayBuffer) t = new Uint8Array(e);
	else return e;
	let n = g(t);
	if (!n || !n.some((e) => t[e] & 2)) return e;
	let r = t.slice();
	for (let e of n) r[e] &= -3;
	return r;
}
function v() {
	if (S.on) return;
	if (!d())
		throw Error(`the single-thread build needs JSPI (WebAssembly.Suspending)`);
	S.on = !0;
	let e = WebAssembly,
		{ compile: t, instantiate: n, validate: r } = e,
		i = e.Module,
		a = e.Memory;
	((e.compile = (n, ...r) => t.call(e, _(n), ...r)),
		(e.validate = (t, ...n) => r.call(e, _(t), ...n)),
		(e.instantiate = (t, ...r) => n.call(e, t instanceof i ? t : _(t), ...r)),
		e.compileStreaming &&
			((e.compileStreaming = async (n, ...r) =>
				t.call(e, _(new Uint8Array(await (await n).arrayBuffer())), ...r)),
			(e.instantiateStreaming = async (t, ...r) =>
				n.call(e, _(new Uint8Array(await (await t).arrayBuffer())), ...r))));
	class o extends i {
		constructor(e, ...t) {
			super(_(e), ...t);
		}
		static [Symbol.hasInstance](e) {
			return e instanceof i;
		}
	}
	e.Module = o;
	class s extends a {
		constructor(e) {
			super(e?.shared ? { ...e, shared: !1 } : e);
		}
		static [Symbol.hasInstance](e) {
			return e instanceof a;
		}
	}
	e.Memory = s;
}
function y(e) {
	(te.push(e), !ne && ((ne = !0), queueMicrotask(b)));
}
function b() {
	let e = performance.now();
	for (; te.length; ) {
		let t = te.shift();
		try {
			t();
		} catch (e) {
			console.error(`[gex] a fiber message handler threw:`, e);
		}
		if (performance.now() - e > w && te.length) {
			setTimeout(b, 0);
			return;
		}
	}
	ne = !1;
}
function x(e) {
	re = e;
}
var S,
	C,
	w,
	T,
	ee,
	E,
	D,
	te,
	ne,
	re,
	ie,
	ae = o(() => {
		((S = { on: !1 }),
			(C = typeof WebAssembly.Suspending == `function`),
			(w = 8),
			(T =
				typeof process == `object` &&
				!!process.versions?.node &&
				typeof setImmediate == `function`),
			(ee = class {
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
			}),
			(E = class {
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
						if (((this.#a = !0), T)) {
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
					return performance.now() - this.#s >= w;
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
							let a = new ee(i, e, n);
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
							t.fiber === e &&
								((t.done = !0), clearTimeout(t.timer), n.delete(t));
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
			}),
			(D = new E()),
			(te = []),
			(ne = !1),
			(re = null),
			(ie = class e {
				#e = [];
				#t = [];
				#n = null;
				#r = [];
				dead = !1;
				static count = 0;
				constructor() {
					e.count++;
					let t = {
						post: (e) =>
							y(() => {
								if (!this.dead) for (let t of this.#e) t({ data: e });
							}),
						on: (e) => {
							this.#n = e;
							let t = this.#r;
							this.#r = [];
							for (let n of t) y(() => e(n));
						},
						fiber: this,
					};
					if (!re)
						throw Error(`fiber.mjs: process.mjs has not registered workerMain`);
					Promise.resolve()
						.then(() => re(t))
						.catch((e) => {
							for (let t of this.#t) t(e);
						});
				}
				postMessage(e) {
					if (this.dead) return;
					if (!this.#n) {
						this.#r.push(e);
						return;
					}
					let t = this.#n;
					y(() => t(e));
				}
				addEventListener(e, t) {
					e === `message` ? this.#e.push(t) : e === `error` && this.#t.push(t);
				}
				removeEventListener(e, t) {
					let n = e === `message` ? this.#e : this.#t,
						r = n.indexOf(t);
					r >= 0 && n.splice(r, 1);
				}
				terminate() {
					this.dead || ((this.dead = !0), D.drop(this));
				}
			}));
	}),
	oe = c({
		assetFiles: () => ce,
		assetUrl: () => k,
		pageParams: () => O,
		pageSearch: () => se,
	});
function se() {
	return globalThis.GEX_PAGE_SEARCH ?? globalThis.location?.search ?? ``;
}
function O() {
	return new URLSearchParams(se());
}
function k(e) {
	let t = e.replace(/^\//, ``),
		n = globalThis.GEX_ASSET_FILES?.[t];
	if (n) return n;
	let r = globalThis.GEX_ASSET_BASE;
	return r
		? new URL(/* @vite-ignore */ /* webpackIgnore: true */ t, r).href
		: e;
}
function ce(e) {
	let t = globalThis.GEX_ASSET_FILES;
	if (!t) return null;
	let n = e.replace(/^\//, ``),
		r = {};
	for (let [e, i] of Object.entries(t))
		e.startsWith(n) && (r[e.slice(n.length)] = i);
	return r;
}
var le = o(() => {});
function ue(e) {
	he = e;
}
function de(e) {
	if (he) return he(e);
	(me === void 0 &&
		((me =
			typeof BroadcastChannel == `function`
				? new BroadcastChannel(`gex-fetch`)
				: null),
		me?.unref?.()),
		me?.postMessage(e));
}
function fe(e, t = 0, n = ``) {
	if (!he && typeof BroadcastChannel != `function`) return () => {};
	let r = `${globalThis.name ?? ``}:${ge++}:${Math.random().toString(36).slice(2, 8)}`;
	try {
		de({ id: r, what: e, bytes: t, owner: n, phase: `start` });
	} catch {}
	let i = !1;
	return (t = 0) => {
		if (!i) {
			i = !0;
			try {
				de({ id: r, what: e, bytes: t, phase: `end` });
			} catch {}
		}
	};
}
function pe(e) {
	if (!(!he && typeof BroadcastChannel != `function`))
		try {
			de({ status: e, t: performance.now() + performance.timeOrigin });
		} catch {}
}
var me,
	he,
	ge,
	_e = o(() => {
		((he = null), (ge = 0));
	});
function ve() {
	return j !== null;
}
function ye(e) {
	e?.ctl && ((j = new Int32Array(e.ctl)), (Se = new Uint8Array(e.ctl)));
}
function be(e, t, n, r) {
	if (!j) return -1;
	let i = new TextEncoder().encode(e);
	if (i.length > 1024) return -1;
	let a = -1;
	for (let e = 0; e < 32; e++)
		if (Atomics.compareExchange(j, (64 + e * 1056) / 4, 0, 101) === 0) {
			a = e;
			break;
		}
	if (a < 0) return -1;
	let o = (64 + a * xe) / 4;
	((j[o + 1] = -1),
		(j[o + 2] = n),
		(j[o + 3] = r),
		(j[o + 4] = i.length),
		(new Float64Array(j.buffer, 64 + a * xe + 24, 1)[0] = t),
		Se.set(i, 64 + a * xe + 32),
		Atomics.store(j, o, 1),
		Atomics.add(j, 0, 1),
		Atomics.notify(j, 0));
	let s = Date.now();
	for (;;) {
		let e = Atomics.load(j, o);
		if (e === 3) break;
		if (e === 1 && Date.now() - s > Ce) {
			if (Atomics.compareExchange(j, o, 1, 4) === 1) return -1;
			continue;
		}
		Atomics.wait(j, o, e, e === 1 ? 5e3 : 1e3);
	}
	let c = j[o + 1];
	return (Atomics.store(j, o, 0), c);
}
function A(e, t = M) {
	for (let n = 0; ; n++) {
		let r = null;
		try {
			r = e();
		} catch {
			r = null;
		}
		if (r) return r;
		if (n >= t.length) return null;
		Atomics.wait((Ee ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, t[n]);
	}
}
var xe,
	j,
	Se,
	Ce,
	M,
	we,
	Te,
	Ee,
	De = o(() => {
		((xe = 1056),
			(j = null),
			(Se = null),
			(Ce = 6e4),
			(M = Object.freeze([250, 1e3, 4e3])),
			(we = 3e4),
			(Te = class {
				#e = new Map();
				held(e, t = Date.now()) {
					let n = this.#e.get(e);
					return n === void 0 ? !1 : t < n || (this.#e.delete(e), !1);
				}
				failed(e, t = Date.now()) {
					this.#e.set(e, t + we);
				}
				ok(e) {
					this.#e.delete(e);
				}
			}),
			(Ee = null));
	}),
	N = s((e, t) => {
		t.exports = {};
	}),
	Oe = c({ ZSTDDecoder: () => Me }),
	ke,
	P,
	Ae,
	F,
	je,
	Me,
	Ne = o(() => {
		((je = {
			env: {
				emscripten_notify_memory_growth: (e) => {
					((Ae = new Uint8Array(P.exports.memory.buffer)),
						(F = new DataView(Ae.buffer)));
				},
			},
		}),
			(Me = class {
				init() {
					if (ke) return ke;
					let e = new URL("./zstddec-x1VHh1jj.wasm?no-inline", import.meta.url);
					return (
						(ke =
							typeof process < `u` && e.protocol === `file:`
								? Promise.resolve()
										.then(() => u(N(), 1))
										.then((t) => t.readFile(e))
										.then((e) => WebAssembly.instantiate(e, je))
										.then(this._init)
								: fetch(e)
										.then((t) => {
											if (!t.ok) throw Error(`${e}: ${t.status}`);
											return t.arrayBuffer();
										})
										.then((e) => WebAssembly.instantiate(e, je))
										.then(this._init)),
						ke
					);
				}
				dispose() {
					P = Ae = F = ke = void 0;
				}
				_init(e) {
					((P = e.instance), je.env.emscripten_notify_memory_growth(0));
				}
				decode(e, t = 0) {
					if (!P) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
					let n = e.byteLength,
						r = P.exports.malloc(n);
					if (
						(Ae.set(e, r),
						t === 0 && (t = Number(P.exports.ZSTD_findDecompressedSize(r, n))),
						t === -1)
					) {
						P.exports.free(r);
						let t = [];
						for (let n of this.decodeStreaming([e])) t.push(n);
						if (t.length === 1) return t[0];
						let n = t.reduce((e, t) => e + t.byteLength, 0),
							i = new Uint8Array(n),
							a = 0;
						for (let e of t) (i.set(e, a), (a += e.byteLength));
						return i;
					}
					let i = P.exports.malloc(t),
						a = P.exports.ZSTD_decompress(i, t, r, n),
						o = Ae.slice(i, i + a);
					return (P.exports.free(r), P.exports.free(i), o);
				}
				stream() {
					if (!P) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
					let e = P.exports.ZSTD_DStreamOutSize(),
						t = P.exports.malloc(e),
						n = P.exports.ZSTD_createDCtx(),
						r = P.exports.malloc(12),
						i = P.exports.malloc(12),
						a = 0,
						o = 0,
						s = 0;
					return {
						push(c, l) {
							for (
								c.byteLength > o &&
									(s && P.exports.free(s),
									(o = c.byteLength),
									(s = P.exports.malloc(o))),
									Ae.set(c, s),
									F.setInt32(r, s, !0),
									F.setInt32(r + 4, c.byteLength, !0),
									F.setInt32(r + 8, 0, !0);
								F.getUint32(r + 8, !0) < F.getUint32(r + 4, !0);
							) {
								if (
									(F.setInt32(i, t, !0),
									F.setInt32(i + 4, e, !0),
									F.setInt32(i + 8, 0, !0),
									(a = P.exports.ZSTD_decompressStream(n, i, r)),
									a > 4294967040)
								)
									throw Error(`ZSTD_decompressStream: error ${a}`);
								let o = F.getUint32(i + 8, !0);
								o && l(Ae.subarray(t, t + o));
							}
						},
						end() {
							if (
								(s && P.exports.free(s),
								P.exports.ZSTD_freeDCtx(n),
								P.exports.free(t),
								P.exports.free(r),
								P.exports.free(i),
								a !== 0)
							)
								throw Error(`Incomplete stream, more data expected.`);
						},
					};
				}
				*decodeStreaming(e) {
					if (!P) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
					let t = P.exports.ZSTD_DStreamInSize(),
						n = P.exports.malloc(t),
						r = P.exports.ZSTD_DStreamOutSize(),
						i = P.exports.malloc(r),
						a = P.exports.ZSTD_createDCtx(),
						o = P.exports.malloc(12),
						s = P.exports.malloc(12),
						c = 0;
					for (let t of e) {
						let e = P.exports.malloc(t.byteLength);
						for (
							Ae.set(t, e),
								F.setInt32(o, e, !0),
								F.setInt32(o + 4, t.byteLength, !0),
								F.setInt32(o + 4 + 4, 0, !0);
							F.getUint32(o + 4 + 4, !0) < F.getUint32(o + 4, !0);
						) {
							(F.setInt32(s, i, !0),
								F.setInt32(s + 4, r, !0),
								F.setInt32(s + 4 + 4, 0, !0),
								(c = P.exports.ZSTD_decompressStream(a, s, o)));
							let e = F.getUint32(s + 4 + 4, !0);
							yield Ae.slice(i, i + e);
						}
						P.exports.free(e);
					}
					if (
						(P.exports.ZSTD_freeDCtx(a),
						P.exports.free(n),
						P.exports.free(i),
						P.exports.free(o),
						P.exports.free(s),
						c !== 0)
					)
						throw Error(`Incomplete stream, more data expected.`);
				}
			}));
	});
function Pe(e) {
	!e?.buf ||
		!e?.at ||
		!e?.files ||
		(Ye = {
			buf: new Uint8Array(e.buf),
			at: e.at,
			files: new Map(e.files.map(([e, t, n]) => [e, [t, n]])),
		});
}
function Fe(e) {
	for (;;) {
		let t = Atomics.load(Ye.at, 0);
		if (t < 0) return !1;
		if (t >= e) return !0;
		if (
			Atomics.wait(Ye.at, 0, t, 1e4) === `timed-out` &&
			Atomics.load(Ye.at, 0) === t
		)
			return !1;
	}
}
function Ie(e) {
	let t = Ye?.files.get(e);
	return !t || !Fe(t[0] + t[1]) ? null : Ye.buf.slice(t[0], t[0] + t[1]);
}
function Le(e, t, n, r, i) {
	if (!Ye) return -1;
	let a;
	try {
		a = decodeURIComponent(
			new URL(/* @vite-ignore */ /* webpackIgnore: true */ e, `http://x`)
				.pathname,
		);
	} catch {
		return -1;
	}
	let o = Ye.files.get(a);
	if (!o || t + i > o[1]) return -1;
	let s = o[0] + t + i;
	return Fe(s)
		? (new Uint8Array(n.buffer, r, i).set(Ye.buf.subarray(o[0] + t, s)), i)
		: -1;
}
function Re(e, t, n, r, i) {
	let a = {}.GEX_NODE_LAZY && globalThis.process.getBuiltinModule?.(`node:fs`);
	if (!a) return -1;
	let o = Number({}.GEX_LAZY_DELAY_MS || 0);
	o > 0 &&
		Atomics.wait((Xe ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, o);
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
function ze() {
	return ve() || !globalThis.GEX_REST_BUNDLE
		? Promise.resolve()
		: (($e ??= Promise.resolve()
				.then(() => (Ne(), Oe))
				.then(async ({ ZSTDDecoder: e }) => {
					let t = new e();
					(await t.init(), (Qe = t));
				})
				.catch((e) => {
					console.error(`[lazy] no zstd decoder: ${e?.message ?? e}`);
				})),
			$e);
}
function Be(e, t) {
	nt.held(e) || (nt.failed(e), console.error(t));
}
function Ve(e, t) {
	let n = new XMLHttpRequest();
	(n.open(`GET`, e, !1),
		(n.responseType = `arraybuffer`),
		t && n.setRequestHeader(`Range`, `bytes=${t[0]}-${t[1] - 1}`),
		n.setRequestHeader(`Cache-Control`, `no-store`),
		n.send());
	let r = new Uint8Array(n.response ?? new ArrayBuffer(0));
	return t
		? n.status === 206 && r.length === t[1] - t[0]
			? r
			: n.status === 200 && r.length >= t[1]
				? r.subarray(t[0], t[1])
				: null
		: n.status === 200
			? r
			: null;
}
function He(e) {
	let t = et.get(e);
	if (t) return t;
	let n = `${e}.json`;
	if (tt.held(n)) return null;
	let r = A(() => {
		let e = JSON.parse(new TextDecoder().decode(Ve(n)));
		return Array.isArray(e.frames) ? e : null;
	});
	if (!r) return (tt.failed(n), console.error(`[lazy] ${n}: no answer`), null);
	let i = { frame: r.frame, frames: r.frames, kept: new Map() };
	return (et.set(e, i), i);
}
function Ue(e, t, n, r, i) {
	let a = rt(e),
		o = a.lastIndexOf(`#`);
	if (o < 0 || typeof XMLHttpRequest != `function`) return -1;
	let s = a.slice(0, o),
		c = Number(a.slice(o + 1)) + t;
	if (!Qe)
		return (
			ve() || Be(s, `[lazy] ${s}: the zstd decoder is not loaded (lazyReady)`),
			-1
		);
	let l = He(s);
	if (!l) return -1;
	let u = Math.floor(c / l.frame),
		d = Math.floor((c + i - 1) / l.frame),
		f = [];
	for (let e = u; e <= d; e++) l.kept.has(e) || f.push(e);
	if (f.length) {
		if (f.some((e) => tt.held(`${s}#${e}`))) return -1;
		let e = l.frames[f[0]][0],
			t = l.frames[f.at(-1)][0] + l.frames[f.at(-1)][1],
			n = A(() => Ve(s, [e, t]));
		if (!n) {
			for (let e of f) tt.failed(`${s}#${e}`);
			return -1;
		}
		for (let t of f) {
			let [r, i] = l.frames[t],
				a = t === l.frames.length - 1 ? 0 : l.frame;
			for (
				l.kept.set(t, Qe.decode(n.subarray(r - e, r - e + i), a));
				l.kept.size > Math.max(Ze, d - u + 1);
			)
				l.kept.delete(l.kept.keys().next().value);
		}
	}
	let p = new Uint8Array(n.buffer, r, i);
	for (let e = u, t = c; e <= d; e++) {
		let n = l.kept.get(e);
		(l.kept.delete(e), l.kept.set(e, n));
		let r = t - e * l.frame,
			a = Math.min(n.length - r, c + i - t);
		if (a <= 0) return -1;
		(p.set(n.subarray(r, r + a), t - c), (t += a));
	}
	return i;
}
function We(e = !0) {
	return {
		m32: new WebAssembly.Memory({ initial: 0, maximum: 0, shared: e }),
		m64: new WebAssembly.Memory({
			address: `i64`,
			initial: 0n,
			maximum: 0n,
			shared: e,
		}),
	};
}
function Ge(e, t = !1, n = null) {
	let r =
			typeof SharedArrayBuffer < `u` && e.buffer instanceof SharedArrayBuffer,
		i = t ? n?.m32 : n?.m64;
	i &&
		(typeof SharedArrayBuffer < `u` &&
			i.buffer instanceof SharedArrayBuffer) !== r &&
		(i = null);
	let a = `${t ? 32 : 64}:${r}`;
	return (
		(i ??= it.get(a)),
		i ||
			((i = t
				? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: r })
				: new WebAssembly.Memory({
						address: `i64`,
						initial: 0n,
						maximum: 0n,
						shared: r,
					})),
			it.set(a, i)),
		t ? { process: i, process64: e } : { process: e, process64: i }
	);
}
function Ke(e, t) {
	let n = e.k_stack_area() >>> 0,
		r = e.k_stack_size() >>> 0;
	return n + ((e.k_stack_count() >>> 0) - at[t]) * r;
}
function qe(e, t) {
	let n = t >>> 0,
		r = e.__tls_size ? e.__tls_size.value >>> 0 : 0;
	if (r && typeof e.__wasm_init_tls == `function`) {
		let t = Math.max(16, e.__tls_align ? e.__tls_align.value >>> 0 : 16),
			i = (n - r) & -t;
		(e.__wasm_init_tls(i), (n = i));
	}
	return ((e.__stack_pointer.value = n | 0), n);
}
function Je(e) {
	return (t, n, r, i, a) => {
		((t >>>= 0), (n >>>= 0), (i >>>= 0), (a >>>= 0));
		let o = Number(r),
			s = new TextDecoder().decode(new Uint8Array(e.buffer, t, n).slice());
		if (Ye) {
			let t = Le(s, o, e, i, a);
			if (t >= 0) return t;
		}
		let c = fe(s, a);
		if (s.includes(`#`)) {
			if (be(rt(s), o, i, a) === a) return (c(a), a);
			let t = Ue(s, o, e, i, a);
			return (
				c(t > 0 ? t : 0),
				t < 0 && Be(s, `[lazy] ${s}: a read failed (rest bundle)`),
				t
			);
		}
		if (be(rt(s), o, i, a) === a) return (c(a), a);
		if (typeof XMLHttpRequest != `function`) {
			let t = Re(s, o, e, i, a);
			return (c(t > 0 ? t : 0), t);
		}
		let l = `no response`;
		try {
			for (let t = 0; t < 3; t++)
				try {
					let t = new XMLHttpRequest();
					(t.open(`GET`, rt(s), !1),
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
var Ye,
	Xe,
	Ze,
	Qe,
	$e,
	et,
	tt,
	nt,
	rt,
	it,
	at,
	ot = o(() => {
		(_e(),
			De(),
			(Ye = null),
			(Xe = null),
			(Ze = 3),
			(Qe = null),
			($e = null),
			(et = new Map()),
			(tt = new Te()),
			(nt = new Te()),
			(rt = (e) => {
				try {
					return new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ e,
						globalThis.GEX_BASE ?? globalThis.location?.href,
					).href;
				} catch {
					return e;
				}
			}),
			(it = new Map()),
			(at = Object.freeze({ tty: 0, hostx: 1, persist: 2, fsOpened: 3 })));
	});
function st(e) {
	let t = [],
		n = (e) => {
			if (!ArrayBuffer.isView(e)) return;
			let n = e.buffer;
			!(n instanceof ArrayBuffer) || t.includes(n) || t.push(n);
		};
	for (let t of e?.image ?? []) n(t?.bytes);
	return (n(e?.vmaBlob), n(e?.fds), n(e?.pages), n(e?.shared), t);
}
var ct = o(() => {});
function lt() {
	return new SharedArrayBuffer(1179840);
}
function ut(e) {
	!e?.ctl || I || ((I = new Int32Array(e.ctl)), (mt = new Uint8Array(e.ctl)));
}
function dt() {
	for (;;) {
		let e = Atomics.load(I, 1);
		for (let e = 0; e < 8; e++)
			if (Atomics.compareExchange(I, (64 + e * 147472) / 4, 0, 1) === 0)
				return e;
		Atomics.wait(I, 1, e, 1e3);
	}
}
function ft(e) {
	return (t, n, r, i) => {
		if (
			((t >>>= 0),
			(n >>>= 0),
			(r >>>= 0),
			(i >>>= 0),
			!I || globalThis.document || n > 147456)
		)
			return -5;
		let a;
		try {
			a = dt();
		} catch {
			return -5;
		}
		let o = (64 + a * pt) / 4,
			s = 64 + a * pt + 16;
		for (
			mt.set(new Uint8Array(e.buffer, t, n), s),
				I[o + 1] = -5,
				I[o + 2] = n,
				I[o + 3] = 0,
				Atomics.store(I, o, 2),
				Atomics.add(I, 0, 1),
				Atomics.notify(I, 0);
			;
		) {
			let e = Atomics.load(I, o);
			if (e === 4) break;
			Atomics.wait(I, o, e, 5e3);
		}
		let c = I[o + 1],
			l = Math.min(I[o + 3] >>> 0, i);
		return (
			l > 0 && new Uint8Array(e.buffer, r, l).set(mt.subarray(s, s + l)),
			Atomics.store(I, o, 0),
			Atomics.add(I, 1, 1),
			Atomics.notify(I, 1),
			c
		);
	};
}
var pt,
	I,
	mt,
	ht = o(() => {
		((pt = 147472), (I = null), (mt = null));
	});
function gt(e, t) {
	if (t != null)
		switch (e) {
			case `flag`:
				return t === `` ? void 0 : 1;
			case `one`:
				return t === `1` ? 1 : void 0;
			case `num`:
			case `num0`:
				return Number(t);
			case `numor1`:
				return Number(t) || 1;
			default:
				return t === `` ? void 0 : String(t);
		}
}
function _t(e, t) {
	return e === `num0`
		? typeof t == `number`
			? t
			: void 0
		: e === `flag` || e === `one`
			? t
				? 1
				: void 0
			: t || void 0;
}
function vt(e) {
	for (let [, t, n, , r] of xt) {
		let i = gt(r, e(n));
		i !== void 0 && (globalThis[t] = i);
	}
}
function yt(e) {
	let t = {};
	for (let [n, r, , , i, a] of xt) {
		if (a !== e) continue;
		let o = _t(i, globalThis[r]);
		o !== void 0 && (t[n] = o);
	}
	return t;
}
function bt(e) {
	for (let [t, n, , , r, , i] of xt) {
		if (!i) continue;
		let a = _t(r, e?.[t]);
		a !== void 0 && (globalThis[n] = a);
	}
}
var xt,
	St = o(() => {
		xt = [
			[
				`trapStack`,
				`GEX_TRAP_STACK`,
				`trapstack`,
				`GEX_TRAP_STACK`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`doorStats`,
				`GEX_DOOR_STATS`,
				`doorstats`,
				`GEX_DOOR_STATS`,
				`numor1`,
				`extra`,
				!0,
			],
			[
				`fcacheStats`,
				`GEX_FCACHE_STATS`,
				`fcachestats`,
				`GEX_FCACHE_STATS`,
				`flag`,
				`extra`,
				!1,
			],
			[`exitTrace`, `GEX_EXIT_TRACE`, `exittrace`, null, `flag`, `extra`, !1],
			[
				`calloutTrace`,
				`GEX_CALLOUT_TRACE`,
				`callouttrace`,
				`GEX_CALLOUT_TRACE`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`strayTrap`,
				`GEX_STRAY_TRAP`,
				`straytrap`,
				`GEX_STRAY_TRAP`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`wine32Split`,
				`GEX_WINE32_SPLIT`,
				`winesplit`,
				`GEX_WINE32_SPLIT`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`nullGuard`,
				`GEX_NULL_GUARD`,
				`nullguard`,
				`GEX_NULL_GUARD`,
				`one`,
				`extra`,
				!0,
			],
			[`mxcsr`, `GEX_MXCSR`, `mxcsr`, `GEX_MXCSR`, `one`, `extra`, !0],
			[
				`pinRegion`,
				`GEX_PIN_REGION`,
				`pinregion`,
				`GEX_PIN_REGION`,
				`num`,
				`extra`,
				!0,
			],
			[
				`sehReport`,
				`GEX_SEH_REPORT`,
				`sehreport`,
				`GEX_SEH_REPORT`,
				`one`,
				`extra`,
				!0,
			],
			[`timeScale`, `GEX_TIME_SCALE`, `timescale`, null, `num`, `extra`, !0],
			[`fixedTime`, `GEX_FIXED_TIME`, `fixedtime`, null, `num`, `extra`, !0],
			[`forkSkip`, `GEX_FORK_SKIP_MIB`, `forkskip`, null, `num0`, `extra`, !0],
			[
				`adoptAfter`,
				`GEX_ADOPT_AFTER`,
				`adopt`,
				`GEX_ADOPT_AFTER`,
				`num0`,
				`extra`,
				!0,
			],
			[
				`adoptTrace`,
				`GEX_ADOPT_TRACE`,
				`adopttrace`,
				`GEX_ADOPT_TRACE`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`attachTrace`,
				`GEX_ATTACH_TRACE`,
				`attachtrace`,
				`GEX_ATTACH_TRACE`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`denseDebug`,
				`GEX_DENSE_DEBUG`,
				`densedebug`,
				`GEX_DENSE_DEBUG`,
				`flag`,
				`extra`,
				!0,
			],
			[
				`traceMisses`,
				`GEX_TRACE_MISSES`,
				`tracemisses`,
				`GEX_TRACE_MISSES`,
				`flag`,
				`extra`,
				!1,
			],
			[
				`liftMax`,
				`GEX_LIFT_MAX`,
				`liftmax`,
				`GEX_LIFT_MAX`,
				`num`,
				`extra`,
				!1,
			],
			[
				`inlineDispatch`,
				`GEX_INLINE_DISPATCH`,
				`inlinedispatch`,
				`GEX_INLINE_DISPATCH`,
				`num`,
				`extra`,
				!1,
			],
			[
				`xlateReport`,
				`GEX_XLATE_REPORT`,
				`xlatereport`,
				`GEX_XLATE_REPORT`,
				`num`,
				`extra`,
				!1,
			],
			[`t1Fold`, `GEX_T1_FOLD`, `t1fold`, `GEX_T1_FOLD`, `num`, `extra`, !1],
			[
				`wasmDlls`,
				`GEX_WASM_DLLS`,
				`wasmdlls`,
				`GEX_WASM_DLLS`,
				`str`,
				`extra`,
				!1,
			],
			[
				`providerSkip`,
				`GEX_PROVIDER_SKIP`,
				`provskip`,
				`GEX_PROVIDER_SKIP`,
				`str`,
				`extra`,
				!1,
			],
			[`fjitLibs`, `GEX_FJIT_LIBS`, `fjitlibs`, null, `str`, `extra`, !1],
			[`strace`, `GEX_STRACE`, `strace`, null, `flag`, `opts`, !1],
			[
				`stracePid`,
				`GEX_STRACE_PID`,
				`stracepid`,
				`GEX_STRACE_PID`,
				`num`,
				`opts`,
				!1,
			],
			[`straceExe`, `GEX_STRACE_EXE`, `straceexe`, null, `str`, `opts`, !1],
		];
	});
async function Ct(e) {
	try {
		if (At()) {
			let t = await (await navigator.storage.getDirectory()).getFileHandle(e);
			return new Uint8Array(await (await t.getFile()).arrayBuffer());
		}
		let t = jt();
		if (t) {
			let n = await Promise.resolve().then(() => u(N(), 1));
			return new Uint8Array(await n.readFile(`${t}/${e}`));
		}
	} catch {}
	return null;
}
async function wt(e, t) {
	if (At()) {
		let n = await (
			await navigator.storage.getDirectory()
		).getFileHandle(e, { create: !0 });
		if (n.createSyncAccessHandle) {
			let e = await n.createSyncAccessHandle();
			try {
				(e.truncate(0), e.write(t, { at: 0 }), e.flush());
			} finally {
				e.close();
			}
		} else {
			let e = await n.createWritable();
			(await e.write(t), await e.close());
		}
		return !0;
	}
	let n = jt();
	if (n) {
		let r = await Promise.resolve().then(() => u(N(), 1));
		await r.mkdir(n, { recursive: !0 });
		let i = `${n}/${e}.${process.pid}.${Date.now()}`;
		return (await r.writeFile(i, t), await r.rename(i, `${n}/${e}`), !0);
	}
	return !1;
}
function Tt(...e) {
	let t = 2166136261,
		n = 1523705862;
	for (let r of e) {
		let e = r instanceof Uint8Array ? r : new TextEncoder().encode(String(r)),
			i = e.byteOffset % 4 ? 0 : e.length >>> 2,
			a = new Uint32Array(e.buffer, e.byteOffset, i);
		for (let e = 0; e < i; e++)
			((t = Math.imul(t ^ a[e], 16777619)),
				(n = Math.imul(n ^ a[e] ^ (n >>> 15), 739982445)));
		for (let r = i * 4; r < e.length; r++)
			((t = Math.imul(t ^ e[r], 16777619)),
				(n = Math.imul(n ^ e[r], 739982445)));
		t = Math.imul(t ^ e.length, 16777619);
	}
	return (
		(t >>> 0).toString(16).padStart(8, `0`) +
		(n >>> 0).toString(16).padStart(8, `0`)
	);
}
function Et() {
	try {
		return new Int32Array(new SharedArrayBuffer(8));
	} catch {
		return;
	}
}
function Dt(e) {
	for (;;) {
		let t = Atomics.load(e, 0);
		if (t & 1073741824) return !1;
		if (Atomics.compareExchange(e, 0, t, t + 1) === t) return !0;
	}
}
function Ot(e) {
	Atomics.sub(e, 0, 1);
}
function kt(e) {
	return e ? Atomics.load(e, 0) & -1073741825 : 0;
}
var At,
	jt,
	Mt,
	Nt,
	Pt = o(() => {
		((At = () => !!globalThis.navigator?.storage?.getDirectory),
			(jt = () => (typeof process < `u` ? {}.GEX_XCACHE_DIR : void 0)),
			(Mt = 1 << 30),
			(Nt = (e) => new Promise((t) => setTimeout(t, e))));
	});
function Ft() {
	if (Bt === void 0) {
		Bt = null;
		try {
			typeof window < `u` &&
				window.location?.search &&
				(Bt = new URLSearchParams(window.location.search).get(`log`));
		} catch {}
	}
	return Bt;
}
function It() {
	let e = globalThis.GEX_LOG ?? {}.GEX_LOG ?? Ft();
	return e == null || e === `` || e === `0` ? null : String(e);
}
function Lt() {
	let e = It();
	return e === `off` || e === `none`;
}
function Rt() {
	let e = It();
	return e !== `quiet` && e !== `off` && e !== `none`;
}
function L(e) {
	let t = It();
	if (t === null || t === `off` || t === `none` || t === `quiet`) return !1;
	if (t === `1` || t === `all`) return !0;
	let n = t.split(`,`);
	return e === void 0 ? n.length > 0 : n.includes(e);
}
function R(e) {
	let t = It();
	return t !== null && t.split(`,`).includes(e);
}
function zt(e) {
	e != null &&
		globalThis.GEX_LOG === void 0 &&
		(globalThis.GEX_LOG = String(e));
}
var Bt,
	Vt = o(() => {});
function Ht(e, t, n) {
	let r = 8,
		i = () => {
			let t = 0,
				n = 0,
				i;
			do ((i = e[r++]), (t += (i & 127) * 2 ** n), (n += 7));
			while (i & 128);
			return t;
		},
		a = () => {
			let t;
			do t = e[r++];
			while (t & 128);
		},
		o = () => {
			let t = i(),
				n = r + t,
				a = ``;
			for (let t = r; t < n; t++) {
				if (e[t] >= 128) {
					a = Pn.decode(e.slice(r, n));
					break;
				}
				a += String.fromCharCode(e[t]);
			}
			return ((r = n), a);
		},
		s = new Set([127, 126, 125, 124, 123, 112, 111]),
		c = 0,
		l = 0,
		u = -1,
		d = [],
		f = null,
		p = null,
		m = -1,
		h = [];
	for (; r < e.length; ) {
		let t = r,
			n = e[r++],
			g = i(),
			_ = r,
			v = r + g;
		if ((h.push([n, t, v]), n === 2)) {
			let t = i();
			for (let n = 0; n < t; n++) {
				let t = o(),
					n = o(),
					a = e[r++];
				if (a === 0) i();
				else if (a === 1) {
					r++;
					let e = i();
					(i(), e & 1 && i(), l++);
				} else if (a === 2) {
					let e = i();
					(i(), e & 1 && i());
				} else if (a === 3) {
					let i = e[r++];
					if ((r++, t === `env` && n === `__table_base`)) {
						if (i !== 127) return null;
						u = c;
					}
					if (!s.has(i)) return null;
					c++;
				} else if (a === 4) (r++, i());
				else return null;
			}
		} else if (n === 4) l += i();
		else if (n === 6) {
			let t = i();
			for (let n = 0; n < t; n++) {
				if (!s.has(e[r++])) return null;
				let t = e[r++],
					n = r,
					o = 0,
					c = e[r] === 65;
				for (;;) {
					let t = e[r++];
					if (t === 11) break;
					if ((o++, t === 65 || t === 66)) a();
					else if (t === 35 || t === 210) i();
					else if (t === 67) r += 4;
					else if (t === 68) r += 8;
					else if (t === 208) r++;
					else if (t === 253 && e[r] === 12) r += 17;
					else if (!(t >= 106 && t <= 108) && !(t >= 124 && t <= 126))
						return null;
				}
				d.push(!t && c && o === 1 && r > n);
			}
		} else if (n === 7) {
			f = [];
			let t = i();
			for (let n = 0; n < t; n++) {
				let t = r,
					n = o(),
					a = e[r++],
					s = i();
				f.push({ name: n, kind: a, idx: s, a: t, b: r });
			}
		} else n === 9 && (p = [_, v]);
		((n === 7 || n === 8) && (m = h.length), (r = v));
	}
	if (
		l !== 1 ||
		u < 0 ||
		!f ||
		m < 0 ||
		f.some((e) => e.name.startsWith(`__fpcast$`))
	)
		return null;
	let g = new Map(f.filter((e) => e.kind === 0).map((e) => [e.name, e.idx])),
		_ = (e) =>
			e.kind === 0
				? e.name.startsWith(`__`) ||
					e.name.startsWith(`asyncify_`) ||
					e.name === `_start` ||
					e.name === `main`
				: e.kind !== 3 || e.name.startsWith(`__`) || e.idx < c || !d[e.idx - c],
		v = [];
	for (let [e, r] of [...t].sort((e, t) => e[0] - t[0])) {
		let t = g.get(r),
			i = e - n;
		if (t === void 0 || i < 0) return null;
		let a = v.at(-1);
		a && a.rel + a.fs.length === i ? a.fs.push(t) : v.push({ rel: i, fs: [t] });
	}
	let y = [],
		b = (e) => {
			do {
				let t = e % 128;
				((e = Math.floor(e / 128)), e && (t |= 128), y.push(t));
			} while (e);
		},
		x = (e) => {
			for (;;) {
				let t = e & 127;
				if (((e >>= 7), (e === 0 && !(t & 64)) || (e === -1 && t & 64))) {
					y.push(t);
					return;
				}
				y.push(t | 128);
			}
		},
		S = [e.subarray(0, 8)],
		C = () => {
			y.length &&= (S.push(Uint8Array.from(y)), 0);
		},
		w = () => {
			for (let e of v) {
				(y.push(0, 35),
					b(u),
					e.rel && (y.push(65), x(e.rel), y.push(106)),
					y.push(11),
					b(e.fs.length));
				for (let t of e.fs) b(t);
			}
		},
		T = () => {
			let e = y.length;
			return (w(), y.splice(e));
		};
	(h.forEach(([t, n, a], o) => {
		if (t === 7) {
			let t = f.filter(_),
				n = Mn(t.length) + t.reduce((e, t) => e + t.b - t.a, 0);
			(y.push(7), b(n), b(t.length), C());
			for (let n of t) S.push(e.subarray(n.a, n.b));
		} else if (t === 9 && v.length) {
			r = p[0];
			let t = i(),
				n = e.subarray(r, p[1]),
				a = T();
			(y.push(9),
				b(Mn(t + v.length) + n.length + a.length),
				b(t + v.length),
				C(),
				S.push(n, Uint8Array.from(a)));
		} else S.push(e.subarray(n, a));
		if (o + 1 === m && !p && v.length) {
			let e = T();
			(y.push(9),
				b(Mn(v.length) + e.length),
				b(v.length),
				C(),
				S.push(Uint8Array.from(e)));
		}
	}),
		C());
	let ee = S.reduce((e, t) => e + t.length, 0),
		E = new Uint8Array(ee),
		D = 0;
	for (let e of S) (E.set(e, D), (D += e.length));
	return E;
}
function Ut(e) {
	return {
		u8: new Uint8Array(e),
		i32: new Int32Array(e, 0, Math.floor(e.byteLength / 4)),
		dv: new DataView(e),
	};
}
function z(e) {
	return Pn.decode(Wt(e.buffer) ? e.slice() : e);
}
function Wt(e) {
	return typeof Fn == `function` && e instanceof Fn;
}
function Gt() {
	if (
		typeof SharedArrayBuffer > `u` ||
		typeof SharedArrayBuffer.prototype.grow != `function`
	)
		return null;
	for (let e of In)
		try {
			let t = new SharedArrayBuffer(1 << 20, { maxByteLength: e });
			return (
				Atomics.store(new BigInt64Array(t, 0, 1), 0, 8n),
				(globalThis.GEX_REGISTRY_TRACE || {}.GEX_REGISTRY_TRACE) &&
					globalThis.process
						?.getBuiltinModule?.(`fs`)
						?.writeSync(2, `[gex] module store max ${e / 2 ** 30} GiB\n`),
				t
			);
		} catch {}
	return null;
}
function Kt(e, t) {
	let n = t.length,
		r = Number(
			Atomics.add(new BigInt64Array(e, 0, 1), 0, BigInt((n + 7) & -8)),
		),
		i = r + n;
	if (i > e.maxByteLength)
		return (
			Vn ||
				((Vn = !0),
				console.error(
					`[gex] module store full at ${(e.maxByteLength / 2 ** 30).toFixed(0)} GiB: the translated-module registry keeps its bytes in the shim heap from here`,
				)),
			-1
		);
	for (let t = 0; e.byteLength < i; t++) {
		let n =
			t === 0 ? Math.min(e.maxByteLength, Math.max(i, e.byteLength * 2)) : i;
		try {
			e.grow(n);
		} catch (n) {
			if (e.byteLength >= i) break;
			if (t >= 1)
				return (
					Vn ||
						((Vn = !0),
						console.error(
							`[gex] module store would not grow to ${(i / 1048576).toFixed(0)} MiB (${n?.message ?? n}): the translated-module registry keeps its bytes in the shim heap from here`,
						)),
					-1
				);
		}
	}
	return (new Uint8Array(e, r, n).set(t), r);
}
function qt(e) {
	if (!(e instanceof Uint8Array)) return null;
	let t = 2166136261,
		n = 2654435769,
		r = e.length >>> 2,
		i = e.byteOffset & 3 ? null : new Uint32Array(e.buffer, e.byteOffset, r);
	for (let a = 0; a < r; a++) {
		let r = i
			? i[a]
			: (e[4 * a] |
					(e[4 * a + 1] << 8) |
					(e[4 * a + 2] << 16) |
					(e[4 * a + 3] << 24)) >>>
				0;
		((t = Math.imul(t ^ r, 16777619)),
			(n = Math.imul(n ^ ((r + a) | 0), 2246822507)),
			(n ^= n >>> 13));
	}
	for (let i = 4 * r; i < e.length; i++) {
		let a = e[i];
		((t = Math.imul(t ^ a, 16777619)),
			(n = Math.imul(n ^ (a + (r + i - 4 * r)), 2246822507)),
			(n ^= n >>> 13));
	}
	return `${e.length}:${t >>> 0}:${n >>> 0}`;
}
function Jt(e, t) {
	console.error(`[${e}] starting a thread: ${t?.message ?? t}`);
}
function Yt(e, t) {
	return t ? (e?.dense === 2 ? 2 : 1) : 0;
}
function Xt() {
	try {
		return Reflect.apply(or, null, ar);
	} catch (e) {
		if (e instanceof RangeError) return 0;
		throw e;
	}
}
function Zt(e, t) {
	let n = (e ? 2 : 0) | !!t,
		r = cr.get(n);
	if (r) return r;
	let i = t ? 126 : 127,
		a = [
			1,
			1,
			i,
			35,
			0,
			33,
			3,
			...(t
				? [
						32, 3, 32, 2, 32, 3, 80, 69, 32, 3, 32, 2, 84, 113, 27, 66, 128, 32,
						125, 66, 112, 131,
					]
				: [
						32, 3, 32, 2, 167, 32, 3, 32, 2, 167, 73, 27, 65, 128, 32, 107, 65,
						112, 113,
					]),
			36,
			0,
			6,
			64,
			32,
			1,
			32,
			0,
			...(e ? [173] : []),
			17,
			0,
			0,
			25,
			32,
			3,
			36,
			0,
			9,
			0,
			11,
			32,
			3,
			36,
			0,
			65,
			1,
			11,
		],
		o = (e, t) => [e, t.length, ...t],
		s = new Uint8Array([
			0,
			97,
			115,
			109,
			1,
			0,
			0,
			0,
			...o(1, [2, 96, 1, 127, 0, 96, 3, 127, 127, 126, 1, 127]),
			...o(2, [
				2,
				1,
				101,
				1,
				116,
				1,
				112,
				e ? 4 : 0,
				0,
				1,
				101,
				2,
				115,
				112,
				3,
				i,
				1,
			]),
			...o(3, [1, 1]),
			...o(7, [1, 5, 101, 110, 116, 114, 121, 0, 0]),
			...o(10, [1, a.length, ...a]),
		]);
	return ((r = new WebAssembly.Module(s)), cr.set(n, r), r);
}
function Qt(e, t) {
	let n = (e ? 2 : 0) | !!t,
		r = lr.get(n);
	if (r) return r;
	let i = t ? 126 : 127,
		a = t
			? [
					32, 3, 32, 2, 32, 3, 80, 69, 32, 3, 32, 2, 84, 113, 27, 66, 128, 32,
					125, 66, 112, 131,
				]
			: [
					32, 3, 32, 2, 167, 32, 3, 32, 2, 167, 73, 27, 65, 128, 32, 107, 65,
					112, 113,
				],
		o = [35, 1, 65, 1, 107, 36, 1],
		s = [
			1,
			1,
			i,
			35,
			0,
			33,
			3,
			...a,
			36,
			0,
			35,
			1,
			65,
			1,
			106,
			36,
			1,
			3,
			64,
			6,
			64,
			32,
			1,
			32,
			0,
			...(e ? [173] : []),
			17,
			0,
			0,
			25,
			...o,
			32,
			3,
			36,
			0,
			9,
			0,
			11,
			16,
			0,
			65,
			1,
			70,
			4,
			64,
			32,
			0,
			32,
			1,
			32,
			2,
			16,
			1,
			12,
			1,
			11,
			11,
			...o,
			32,
			3,
			36,
			0,
			65,
			1,
			11,
		],
		c = (e, t) => [e, t.length, ...t],
		l = [
			5,
			1,
			101,
			1,
			116,
			1,
			112,
			e ? 4 : 0,
			0,
			1,
			101,
			2,
			115,
			112,
			3,
			i,
			1,
			1,
			101,
			1,
			100,
			3,
			127,
			1,
			1,
			101,
			2,
			115,
			116,
			0,
			2,
			1,
			101,
			2,
			97,
			102,
			0,
			3,
		],
		u = new Uint8Array([
			0,
			97,
			115,
			109,
			1,
			0,
			0,
			0,
			...c(
				1,
				[
					4, 96, 1, 127, 0, 96, 3, 127, 127, 126, 1, 127, 96, 0, 1, 127, 96, 3,
					127, 127, 126, 0,
				],
			),
			...c(2, l),
			...c(3, [1, 1]),
			...c(7, [1, 5, 101, 110, 116, 114, 121, 0, 2]),
			...c(10, [1, s.length, ...s]),
		]);
	return ((r = new WebAssembly.Module(u)), lr.set(n, r), r);
}
function $t(e, t, n, r) {
	let i = e.length + t;
	(i > 1 << 20 &&
		console.warn(`[gex] dispatch table ${r} grows ${e.length} -> ${i} entries`),
		e.grow(t, n));
}
function en() {
	return Number(globalThis.GEX_ADOPT_AFTER ?? 1);
}
function tn(e, t = !1) {
	if (!(!t && !L(`debug`))) {
		if (typeof process < `u` && {}.GEX_MEMSTATS && e.startsWith(`[beat]`))
			try {
				let t = process.memoryUsage(),
					n = (e) => (e / 1048576) | 0;
				if (
					((e += ` | isolate heap=${n(t.heapUsed)}MiB arrayBuffers=${n(t.arrayBuffers)}MiB external=${n(t.external)}MiB`),
					{}.GEX_MEMSTATS === `spaces`)
				) {
					let t = process.getBuiltinModule?.(`v8`) ?? null;
					t &&
						(e +=
							` | ` +
							t
								.getHeapSpaceStatistics()
								.filter((e) => e.space_used_size > 8 << 20)
								.map((e) => `${e.space_name}=${n(e.space_used_size)}`)
								.join(` `));
				}
			} catch {}
		rn(e);
	}
}
function nn(e) {
	L(`debug`) && rn(e);
}
function rn(e) {
	let t = typeof process < `u` ? process.getBuiltinModule?.(`fs`) : null;
	if (t?.writeSync)
		try {
			t.writeSync(2, `${e}\n`);
			return;
		} catch {}
	let n = typeof process < `u` ? process.stderr : null;
	n?.write ? n.write(`${e}\n`) : console.debug(e);
}
function an(e) {
	let t = e?.gex_inst_align_shift?.();
	typeof t == `number` && t >= 0 && t <= 2 && ((Sr = t), (Cr = 4096 >> t));
}
function on(e, t, n) {
	let r = 4096,
		i =
			t.byteOffset % 4 == 0 && t.byteLength % 4 == 0
				? new Uint32Array(t.buffer, t.byteOffset, t.byteLength / 4)
				: null,
		a = (e, n) => {
			if (i) {
				for (let t = e / 4; t < n / 4; t++) if (i[t] !== 0) return !1;
				return !0;
			}
			for (let r = e; r < n; r++) if (t[r] !== 0) return !1;
			return !0;
		},
		o = 0,
		s = 0,
		c = 0;
	for (; c < t.length; ) {
		let i = Math.min(c + r, t.length);
		if (a(c, i)) {
			((s += i - c), (c = i));
			continue;
		}
		let l = i;
		for (; l < t.length; ) {
			let e = Math.min(l + r, t.length);
			if (a(l, e)) break;
			l = e;
		}
		(e.set(t.subarray(c, l), n + c), (o += l - c), (c = l));
	}
	return [o, s];
}
function sn() {
	let e = globalThis.GEX_MEM_MAX_MIB ?? {}.GEX_MEM_MAX_MIB;
	if (e) return Math.max(Mr, Math.min(jr, Math.floor(Number(e) * 16)));
}
function cn(e) {
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = [],
		r = 4;
	for (let i = t.getUint32(0, !0); i > 0 && r + 24 <= e.length; i--) {
		let e = Number(t.getBigUint64(r, !0)),
			i = Number(t.getBigUint64(r + 8, !0)),
			a = t.getUint32(r + 16, !0);
		((r += 20), (r += 4 + t.getUint32(r, !0)));
		let o = t.getUint32(r, !0);
		((r += 4 + o + 8), n.push({ start: e, end: i, prot: a }));
	}
	return n;
}
function ln(e) {
	return e.len ?? e.bytes?.byteLength ?? 0;
}
function un(e) {
	let t = new Uint32Array(
			e.buffer ?? e,
			e.byteOffset ?? 0,
			Math.floor(e.byteLength / 4),
		),
		n = 2166136261;
	for (let e = 0; e < t.length; e++) n = Math.imul(n ^ t[e], 16777619);
	return n >>> 0;
}
function dn(e) {
	if (!e || e.length < 32) return 0;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength);
	return Number(t.getBigUint64(24, !0));
}
function fn(e) {
	return (mn(e) ?? 0) & 3;
}
function pn(e) {
	if (mn(e) === null) return null;
	let t = e[4] === 2,
		n = new DataView(e.buffer, e.byteOffset, e.byteLength),
		r = (e) => (t ? Number(n.getBigUint64(e, !0)) : n.getUint32(e, !0)),
		i = r(t ? 32 : 28),
		a = n.getUint16(t ? 54 : 42, !0),
		o = n.getUint16(t ? 56 : 44, !0),
		s = 1 / 0,
		c = 0;
	for (let l = 0; l < o; l++) {
		let o = i + l * a;
		if (o + (t ? 56 : 32) > e.length || n.getUint32(o, !0) !== 1) continue;
		let u = r(o + (t ? 16 : 8)),
			d = r(o + (t ? 40 : 20));
		((s = Math.min(s, u)), (c = Math.max(c, u + d)));
	}
	return c > 0 ? [s, c] : null;
}
function mn(e) {
	if (
		!(e instanceof Uint8Array) ||
		e.length < 64 ||
		e[0] !== 127 ||
		(e[4] !== 1 && e[4] !== 2)
	)
		return null;
	let t = e[4] === 2,
		n = new DataView(e.buffer, e.byteOffset, e.byteLength),
		r = (e) => (t ? Number(n.getBigUint64(e, !0)) : n.getUint32(e, !0)),
		i = r(24) - 64,
		a = r(t ? 32 : 28),
		o = n.getUint16(t ? 54 : 42, !0),
		s = n.getUint16(t ? 56 : 44, !0);
	for (let c = 0; c < s; c++) {
		let s = a + c * o;
		if (s + (t ? 56 : 32) > e.length || n.getUint32(s, !0) !== 1) continue;
		let l = r(s + (t ? 8 : 4)),
			u = r(s + (t ? 16 : 8)),
			d = r(s + (t ? 32 : 16));
		if (i < u || i + 40 > u + d) continue;
		let f = l + (i - u);
		return String.fromCharCode(...e.subarray(f, f + 7)) === `GEXWASM`
			? n.getUint32(f + 36, !0)
			: null;
	}
	return null;
}
function hn() {
	return Pr + BigInt(Math.round(performance.now() * 1e6));
}
function gn(e) {
	if (!e || e.byteLength < 48) return [];
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = Number(t.getBigUint64(40, !0)),
		r = [],
		i = 48;
	for (let a = 0; a < n && i + 12 <= e.byteLength; a++, i += 12) {
		let e = t.getUint32(i + 8, !0),
			n = e >>> 24,
			a = (e & 16777215) + Cr;
		r[n] >= a || (r[n] = a);
	}
	return r;
}
function _n(e) {
	if (!(e instanceof Uint8Array) || e.length < 8) return [];
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = 8,
		r = () => {
			let e = 0,
				r = 0,
				i;
			do ((i = t.getUint8(n++)), (e |= (i & 127) << r), (r += 7));
			while (i & 128);
			return e >>> 0;
		},
		i = [];
	try {
		for (; n < e.length; ) {
			let e = t.getUint8(n++),
				a = r(),
				o = n + a;
			if (e !== 9) {
				n = o;
				continue;
			}
			let s = r();
			for (let e = 0; e < s; e++) {
				let e = r(),
					a = 0;
				(e === 2 || e === 6) && (a = r());
				let o = -1;
				if (!(e & 3) || e === 2 || e === 6) {
					for (t.getUint8(n) === 65 && (n++, (o = r())); t.getUint8(n) !== 11; )
						n++;
					n++;
				}
				(e === 1 || e === 2 || e === 3 || e >= 5) && r();
				let s = r();
				for (let i = 0; i < s; i++)
					if (e & 4) {
						for (; t.getUint8(n) !== 11; ) n++;
						n++;
					} else r();
				(e === 0 || e === 2 || e === 4 || e === 6) &&
					o >= 0 &&
					!(i[a] >= o + s) &&
					(i[a] = o + s);
			}
			n = o;
		}
	} catch {
		return i;
	}
	return i;
}
function vn(e) {
	let t = 8,
		n = () => {
			let n = 0,
				r = 0,
				i;
			do ((i = e[t++]), (n |= (i & 127) << r), (r += 7));
			while (i & 128);
			return n >>> 0;
		};
	for (; t < e.length; ) {
		let r = e[t++],
			i = n(),
			a = t + i;
		if (r === 0) {
			let r = n();
			if (r === 9 && z(e.subarray(t, t + r)) === `gex.dense`) return t + r;
		}
		t = a;
	}
	return -1;
}
function yn(e) {
	if (e instanceof WebAssembly.Module) {
		let t = WebAssembly.Module.customSections(e, `gex.dense`);
		return t.length ? new Uint8Array(t[0]) : null;
	}
	if (!(e instanceof Uint8Array)) return null;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = 8,
		r = () => {
			let e = 0,
				r = 0,
				i;
			do ((i = t.getUint8(n++)), (e |= (i & 127) << r), (r += 7));
			while (i & 128);
			return e >>> 0;
		};
	for (; n < e.length; ) {
		let i = t.getUint8(n++),
			a = r(),
			o = n + a;
		if (i === 0) {
			let t = r();
			if (z(e.subarray(n, n + t)) === `gex.dense`) return e.slice(n + t, o);
		}
		n = o;
	}
	return null;
}
function bn(e) {
	if (e instanceof WebAssembly.Module) {
		let t = WebAssembly.Module.customSections(e, `gex.meta`);
		return t.length ? new Uint8Array(t[0]) : null;
	}
	if (
		((e instanceof ArrayBuffer ||
			(typeof SharedArrayBuffer < `u` && e instanceof SharedArrayBuffer)) &&
			(e = new Uint8Array(e)),
		!(e instanceof Uint8Array))
	)
		return null;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = 8,
		r = () => {
			let e = 0,
				r = 0,
				i;
			do ((i = t.getUint8(n++)), (e |= (i & 127) << r), (r += 7));
			while (i & 128);
			return e >>> 0;
		};
	for (; n < e.length; ) {
		let i = t.getUint8(n++),
			a = r(),
			o = n + a;
		if (i === 0) {
			let t = r();
			if (z(e.subarray(n, n + t)) === `gex.meta`) return e.slice(n + t, o);
		}
		n = o;
	}
	return null;
}
function xn(e) {
	let t = globalThis.GEX_VFORK_TRACE || {}.GEX_VFORK_TRACE;
	t &&
		(typeof t == `string` &&
		t.includes(`/`) &&
		globalThis.process?.getBuiltinModule
			? globalThis.process.getBuiltinModule(`fs`).appendFileSync(t, `${e}\n`)
			: console.error(e));
}
function Sn(e) {
	let t = WebAssembly.Module.customSections(e, `dylink.0`)[0];
	if (!t) throw Error(`door: the server program has no dylink.0 section`);
	let n = new Uint8Array(t),
		r = 0,
		i = () => {
			let e = 0,
				t = 0,
				i;
			do ((i = n[r++]), (e += (i & 127) * 2 ** t), (t += 7));
			while (i & 128);
			return e;
		};
	for (; r < n.length; ) {
		let e = n[r++],
			t = i(),
			a = r + t;
		if (e === 1) return (i(), i(), i());
		r = a;
	}
	throw Error(`door: no WASM_DYLINK_MEM_INFO in the server program`);
}
var Cn,
	B,
	wn,
	Tn,
	En,
	Dn,
	On,
	kn,
	An,
	V,
	jn,
	Mn,
	Nn,
	Pn,
	Fn,
	In,
	Ln,
	Rn,
	zn,
	Bn,
	Vn,
	Hn,
	Un,
	Wn,
	Gn,
	Kn,
	qn,
	Jn,
	Yn,
	Xn,
	Zn,
	Qn,
	$n,
	er,
	tr,
	nr,
	rr,
	ir,
	ar,
	or,
	sr,
	cr,
	lr,
	ur,
	dr,
	fr,
	pr,
	mr,
	hr,
	gr,
	_r,
	vr,
	yr,
	br,
	xr,
	Sr,
	Cr,
	wr,
	Tr,
	Er,
	Dr,
	Or,
	kr,
	Ar,
	jr,
	Mr,
	Nr,
	Pr,
	Fr,
	Ir,
	Lr,
	Rr,
	zr = o(() => {
		(ot(),
			ht(),
			Pt(),
			ae(),
			Vt(),
			(Cn = 4294901760),
			(B = () => !!globalThis.GEX_MEM64),
			(wn = 4096),
			(Tn = 8192),
			(En = !!{}.GEX_TEST_KEEP_PROBE),
			(Dn = () =>
				Number(globalThis.GEX_TEST_FTAB_SPARE ?? {}.GEX_TEST_FTAB_SPARE ?? 0)),
			(On = 16 * 2 ** 30),
			(kn = 262144),
			(An = (e) => (B() ? BigInt(e >>> 0) : e | 0)),
			(V = (e) => (typeof e == `bigint` ? Number(e) : e >>> 0)),
			(jn = (e) => (typeof e == `bigint` ? e : BigInt(e >>> 0))),
			(Mn = (e) => {
				let t = 1;
				for (; e >= 128; ) ((e = Math.floor(e / 128)), t++);
				return t;
			}),
			(Nn = (e) => (B() ? BigInt(e) : e)),
			(Pn = new TextDecoder()),
			(Fn = globalThis.SharedArrayBuffer),
			(In = [32, 16, 8, 4].map((e) => e * 1024 * 1024 * 1024)),
			(Ln = 20),
			(Rn = 20),
			(zn = 1e3),
			(Bn = () =>
				Number(
					globalThis.GEX_TEST_SPARE_MODULES ?? {}.GEX_TEST_SPARE_MODULES ?? 0,
				) || Ln),
			(Vn = !1),
			(Hn = 117440512),
			(Un = 100663296),
			(Wn = 4),
			(Gn = 1 << 20),
			(Kn = 352),
			(qn = 256),
			(Jn = 32),
			(Yn = 64n << 10n),
			(Xn = 4194289n),
			(Zn = 512n),
			(Qn = 4194290n),
			($n = new Uint8Array([
				0, 97, 115, 109, 1, 0, 0, 0, 1, 10, 2, 96, 1, 127, 0, 96, 2, 127, 127,
				0, 2, 7, 1, 1, 119, 1, 102, 0, 0, 3, 2, 1, 1, 7, 5, 1, 1, 101, 0, 1, 10,
				8, 1, 6, 0, 32, 0, 18, 0, 11,
			])),
			(er = new Uint8Array([
				0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 20, 2, 1, 119,
				5, 99, 111, 117, 110, 116, 0, 0, 1, 119, 4, 114, 101, 97, 108, 0, 0, 3,
				2, 1, 0, 7, 5, 1, 1, 99, 0, 2, 10, 12, 1, 10, 0, 32, 0, 16, 0, 32, 0,
				18, 1, 11,
			])),
			(tr = new Uint8Array([
				0, 97, 115, 109, 1, 0, 0, 0, 1, 11, 2, 96, 2, 127, 127, 0, 96, 1, 127,
				1, 127, 2, 26, 3, 1, 119, 3, 111, 108, 100, 0, 0, 1, 119, 3, 104, 105,
				116, 0, 1, 1, 119, 3, 97, 114, 109, 3, 127, 0, 3, 2, 1, 0, 7, 5, 1, 1,
				99, 0, 2, 10, 27, 1, 25, 0, 32, 1, 35, 0, 70, 4, 64, 32, 0, 16, 1, 4,
				64, 15, 11, 0, 11, 32, 0, 32, 1, 18, 0, 11,
			])),
			(nr = null),
			(rr = null),
			(ir = new Uint8Array([
				0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 1, 96, 3, 127, 127, 126, 1, 127, 2,
				21, 2, 1, 101, 4, 104, 111, 111, 107, 1, 112, 0, 1, 1, 101, 4, 115, 108,
				111, 119, 0, 0, 3, 3, 2, 0, 0, 7, 21, 2, 4, 115, 108, 111, 119, 0, 1,
				10, 101, 110, 116, 114, 121, 95, 99, 97, 108, 108, 0, 2, 9, 7, 1, 0, 65,
				0, 11, 1, 1, 10, 26, 2, 10, 0, 32, 0, 32, 1, 32, 2, 18, 0, 11, 13, 0,
				32, 0, 32, 1, 32, 2, 65, 0, 19, 0, 0, 11,
			])),
			(ar = Array(32768).fill(0)),
			(or = function () {
				return 1;
			}),
			(sr = null),
			(cr = new Map()),
			(lr = new Map()),
			(ur = !!{}.GEX_SNAP_TRACE),
			(dr = 24),
			(fr = 32),
			(pr = 40),
			(mr = 16),
			(hr = 131072),
			(gr = 128),
			(_r = 2048),
			(vr = 245760),
			(yr = Object.freeze({ snapNest: !0 })),
			(br = `gexfill`),
			(xr = `gexfillat`),
			(Sr = 2),
			(Cr = 4096 >> Sr),
			(wr = `gexfillall`),
			(Tr = 1048576),
			(Er = 3145728),
			(Dr = 2 ** 32),
			(Or = Dr + 17 * 2 ** 20),
			(kr = () => (B() ? Dr : Tr)),
			(Ar = () => (B() ? On / 4096 : 524288)),
			(jr = Cn / 65536),
			(Mr = Hn / 65536),
			(Nr = [`main`, `__main_argc_argv`, `__original_main`]),
			(Pr = BigInt(Math.round(performance.timeOrigin * 1e3)) * 1000n),
			(Fr = class {
				write(e, t) {
					let n = z(t);
					e === 2 ? console.error(n) : console.log(n);
				}
				now() {
					return hn();
				}
				drainOutput() {}
				async readStdin() {
					return !1;
				}
				async spawnProcess(e) {
					throw Error(
						`this environment cannot start guest process ${e.pid}: no spawnProcess`,
					);
				}
			}),
			(Ir = [
				`dispatch`,
				`dispatch1`,
				`dispatch2`,
				`dispatch3`,
				`dispatch4`,
				`dispatch5`,
				`dispatch6`,
				`dispatch7`,
			]),
			(Lr = class extends Error {
				constructor(e) {
					(super(
						`gex.provider_throw(${e}) with no gex.provider_try to catch it`,
					),
						(this.code = e));
				}
			}),
			(Rr = class e {
				#e;
				#t;
				#n;
				#r;
				#i;
				#a;
				#o = null;
				#s = !1;
				#c = null;
				#l = !1;
				#u = null;
				#d = null;
				#f = 0;
				#p = !1;
				#m = 0;
				#h = 0;
				#g = 0;
				#_ = !1;
				#v = 0;
				#y = 0;
				#b = 0;
				#x = 0;
				#S = 0;
				#C = [];
				#w = [];
				#T(e) {
					let t = this.#t?.exports;
					if (!t?.gex_table_need || this.#w.length > 24) return;
					let n = t.gex_table_need(0) >>> 0,
						r = this.#w[this.#w.length - 1];
					(!r || !r.endsWith(`:${n}`)) && this.#w.push(`${e}:${n}`);
				}
				#E = 0;
				#D = 0;
				#O = 0;
				#k = 0;
				#A = 0;
				#j = 0;
				#M = 0;
				#N = 0;
				#P = 0;
				#F = 0;
				#I = 0;
				#L = 0;
				#R = 0;
				#z = new Map();
				#B = !1;
				#V = !1;
				#H = new WeakMap();
				#U = new Map();
				#W = [];
				#G = 0;
				#K = [];
				#q = [];
				#J = 0;
				#Y = 0;
				#X = 0;
				#Z = 0;
				#Q = 0;
				#$ = 0;
				#ee = 0;
				#te = 0;
				#ne = 0;
				#re = 0;
				#ie = 0;
				#ae = 0;
				#oe = 0;
				#se = 0;
				#ce = 0;
				#le = 0;
				#ue = 0;
				#de = 0;
				#fe = !1;
				#pe = null;
				get forkCopiedBytes() {
					return this.#ce;
				}
				get forkSkippedBytes() {
					return this.#le;
				}
				get forkZeroBytes() {
					return this.#ue;
				}
				#me = [];
				#he = 0;
				#ge = 0;
				#_e = {};
				#ve = [];
				#ye = null;
				#be = null;
				#xe = null;
				#Se = ``;
				#Ce = null;
				#we = null;
				#Te = !1;
				#Ee = !1;
				#De = !1;
				#Oe = !1;
				#ke = [];
				#Ae() {
					return (
						this.#d ||
							((this.#d = new MessageChannel()), this.#d.port1.start()),
						new Promise((e) => {
							((this.#d.port1.onmessage = () => e()),
								this.#d.port2.postMessage(0));
						})
					);
				}
				#je = 0;
				waits = { park: 0, turn: 0, nap: 0, net: 0 };
				traps = {
					loop: 0,
					loopFull: 0,
					callout: 0,
					calloutFull: 0,
					native: 0,
					nativeFull: 0,
				};
				#Me() {
					let e = this.#t.exports.gex_after_trap;
					return !e || this.#me.length || this.#kt.length
						? 0n
						: e(this.#f, this.#Nn, this.#Ht & 3 ? 1 : 0);
				}
				#Ne = 0;
				#Pe() {
					return (
						(this.#Ne ||= this.#t.exports.gex_after_trap_ctx() >>> 0),
						this.#qe().getUint32(this.#Ne, !0)
					);
				}
				#Fe = null;
				#Ie = null;
				#Le() {
					return { n: this.#o?.activitySeq?.() ?? null };
				}
				#Re(e, t) {
					this.#no();
					let n = e.gex_wait_bound_ms ? e.gex_wait_bound_ms(50) : 1,
						r = [
							new Promise((e) => {
								this.#Fe = e;
							}),
						],
						i = e.gex_wait_word?.() >>> 0;
					if (i) {
						this.#Ie ??= new Int32Array(this.#ye.memory.buffer);
						let t = Atomics.waitAsync(this.#Ie, i >>> 2, e.gex_wait_seq(), n);
						if (!t.async) return Promise.resolve();
						r.push(t.value);
					} else r.push(new Promise((e) => setTimeout(e, Math.min(n, 4))));
					return (
						t.n !== null && r.push(this.#o.activityWait(t.n, n)),
						Promise.race(r).finally(() => {
							this.#Fe = null;
						})
					);
				}
				#ze() {
					return (
						this.#d ||
							((this.#d = new MessageChannel()), this.#d.port1.start()),
						new Promise((e) => {
							((this.#d.port1.onmessage = () => setTimeout(e, 1)),
								this.#d.port2.postMessage(0));
						})
					);
				}
				constructor(
					e = new Fr(),
					{
						shared: t = !1,
						memory: n = null,
						kernel: r = null,
						moduleStore: i = null,
						modules: a = null,
						fiber: o = null,
					} = {},
				) {
					((this.#be = o),
						(this.#r = e),
						a && (this.#z = a),
						(this.#fa = i),
						(this.#e =
							n ??
							(B()
								? new WebAssembly.Memory({
										address: `i64`,
										initial: BigInt(Mr),
										maximum: BigInt(On / 65536),
										shared: t,
									})
								: new WebAssembly.Memory({
										initial: Mr,
										maximum: sn() ?? jr,
										shared: t,
									}))),
						(this.#ye = r));
				}
				#Be() {
					if (this.#we === null) {
						if (
							typeof this.#t.exports.gex_worker_init?.call == `function` &&
							(Wt(this.#e.buffer) || S.on)
						) {
							let e =
								Atomics.add(new Int32Array(this.#e.buffer), 262096, 1) & 31;
							this.#t.exports.__stack_pointer.value = An(Un - e * 262144);
						}
						if (
							((globalThis.GEX_WINE32_SPLIT || this.#fe) &&
								this.#t.exports.gex_set_wine_split?.(1),
							globalThis.GEX_NULL_GUARD &&
								this.#t.exports.gex_set_null_guard?.(1),
							globalThis.GEX_MXCSR && this.#t.exports.gex_set_mxcsr_exact?.(1),
							globalThis.GEX_PIN_REGION &&
								this.#t.exports.gex_set_pin_region?.(
									BigInt(globalThis.GEX_PIN_REGION),
								),
							this.#pe &&
								this.#t.exports.gex_set_no_place_window?.(
									BigInt(this.#pe[0]),
									BigInt(this.#pe[1]),
								),
							globalThis.GEX_SEH_REPORT &&
								this.#t.exports.gex_set_seh_report?.(1),
							globalThis.GEX_PAGE_FLAVOURS !== void 0 &&
								this.#t.exports.gex_set_page_flavours?.(
									globalThis.GEX_PAGE_FLAVOURS | 0,
								),
							this.#de > 0
								? this.#t.exports.gex_adopt_windows_space?.(this.#de)
								: this.#de < 0 && this.#t.exports.gex_split_windows_space?.(),
							this.#Oe)
						) {
							((this.#Oe = !1), this.#t.exports.gex_worker_slots_reset?.());
							let e = this.#t.exports;
							for (let [t, n] of this.#ke)
								e.gex_note_inherited_range
									? e.gex_note_inherited_range(BigInt(t), BigInt(n))
									: e.gex_note_inherited?.(BigInt(n));
							this.#ke = [];
						}
						let e = this.#t.exports.gex_worker_init?.();
						if ((this.keepPromise(), e === 0 && (Wt(this.#e.buffer) || S.on)))
							throw (
								(this.#De = !0),
								Error(
									`gex: no shim stack slot left for this Worker (every slot of this process is held)`,
								)
							);
						((this.#we = e ? e | 0 : 100663296),
							globalThis.GEX_TEST_BREAK_STACK_GUARD &&
								this.#t.exports.gex_test_break_stack_guard?.());
					}
					return this.#we;
				}
				#Ve(e) {
					let t = this.#e.buffer.byteLength;
					if (e <= t) return;
					let n = Math.ceil((e - t) / 65536);
					try {
						this.#e.grow(B() ? BigInt(n) : n);
					} catch (n) {
						throw Error(
							`gex: out of memory: this process's memory would not grow from ${(t / 1048576) | 0} to ${Math.ceil(e / 1048576)} MiB (${n?.message ?? n})`,
						);
					}
					this.#i = null;
				}
				#He = [];
				#Ue = null;
				static watchPages = new Set();
				static wholePage = !1;
				static #We = 0;
				static #Ge = 0;
				static watchSlot = !1;
				static debugFill = !1;
				static askState = new Map();
				static watchDir = -1;
				static wasmDlls = ``;
				static elfUnits = ``;
				static providerSkip = ``;
				static providerSources = ``;
				static stateful = ``;
				static fjitLibs = ``;
				static identities = ``;
				static #Ke = 0;
				#qe() {
					let e = this.#e.buffer;
					return (
						(!this.#Je ||
							this.#Je.buffer !== e ||
							this.#Je.byteLength !== e.byteLength) &&
							(this.#Je = new DataView(e)),
						this.#Je
					);
				}
				#Je = null;
				#Ye() {
					let e = this.#e.buffer;
					return (
						(!this.#i ||
							this.#i.buffer !== e ||
							this.#i.byteLength !== e.byteLength) &&
							(this.#i = new Uint8Array(e)),
						this.#i
					);
				}
				get memory() {
					return this.#e;
				}
				audioRing() {
					let e = this.#t?.exports;
					if (!this.#Ce || !e?.gex_audio_ring_addr || !this.#ye?.memory)
						return null;
					let t = e.gex_audio_ring_addr() >>> 0;
					return t ? { memory: this.#ye.memory, at: t } : null;
				}
				kernelWake() {
					let e = this.#t?.exports;
					return !this.#Ce || !e?.gex_proc_queue_addr || !this.#ye?.memory
						? null
						: {
								memory: this.#ye.memory,
								addr: e.gex_proc_queue_addr() >>> 0,
								slots: e.gex_slots_addr() >>> 0,
							};
				}
				coverage() {
					let e = this.#t?.exports;
					if (!e?.gex_coverage_snapshot) return null;
					let t = e.gex_coverage_snapshot() >>> 0,
						n = e.gex_coverage_ptr() >>> 0;
					return new BigUint64Array(this.#e.buffer.slice(n, n + t * 8));
				}
				close() {
					((this.#xe &&= (clearInterval(this.#xe), null)),
						(this.#d &&= (this.#d.port1.close(), this.#d.port2.close(), null)));
				}
				get shim() {
					return this.#t;
				}
				get released() {
					return this.#Te;
				}
				get noSlot() {
					return this.#De;
				}
				keepPromise() {
					if (this.#Ee) {
						this.#Ee = !1;
						try {
							this.#t?.exports?.gex_worker_promise_done?.();
						} catch {}
					}
				}
				recycleMemory() {
					let e = this.#t?.exports,
						t = this.#Ce;
					if (
						!e?.gex_image_runs ||
						!t?.k_proc_zero ||
						B() ||
						S.on ||
						!Wt(this.#e.buffer)
					)
						return null;
					let n = this.#e.buffer.byteLength,
						r = 4096,
						i = e.gex_alloc(r * 8) >>> 0,
						a = [];
					for (let t = 0; t < n; ) {
						let o = Math.min(n, t + 67108864),
							s = e.gex_image_runs(t, o, i, r);
						if (s < 0) {
							(e.gex_free?.(i, r * 8),
								(r *= 4),
								(i = e.gex_alloc(r * 8) >>> 0));
							continue;
						}
						let c = new Uint32Array(this.#e.buffer, i, s * 2);
						for (let e = 0; e < s; e++) a.push(c[e * 2], c[e * 2 + 1]);
						t = o;
					}
					for (let e = 0; e < a.length; e += 2)
						if (t.k_proc_zero(BigInt(a[e]), a[e + 1]) !== 0) return null;
					return this.#e;
				}
				releaseWorker() {
					if (this.#we !== null) {
						((this.#xe &&= (clearInterval(this.#xe), null)), (this.#Te = !0));
						try {
							this.#t?.exports?.gex_worker_release?.();
						} catch {}
						this.#we = null;
					}
				}
				get installedModules() {
					return this.#f;
				}
				get installMillis() {
					return Math.round(this.#m);
				}
				get compileMillis() {
					return Math.round(this.#A);
				}
				get instantiateMillis() {
					return Math.round(this.#N);
				}
				get growMillis() {
					return Math.round(this.#P);
				}
				get loader() {
					let e = this.#t?.exports;
					return e?.gex_loader_calls
						? {
								calls: Number(e.gex_loader_calls()),
								doneMs: Number(e.gex_loader_done_ms()),
								link: [
									`off`,
									`no-kernel`,
									`armed`,
									`kept`,
									`restored`,
									`asked`,
								][Number(e.gex_link_state?.() ?? 0)],
								cost: e.gex_link_cost
									? (() => {
											let t = e.gex_alloc(40) >>> 0;
											e.gex_link_cost(t);
											let n = new BigUint64Array(this.#Ye().buffer, t, 5);
											return [
												Number(n[0]),
												Number(n[1]),
												Number(n[2]),
												Number(n[3]),
												Number(n[4]),
											];
										})()
									: null,
							}
						: null;
				}
				get cmdline() {
					let e = this.#t?.exports;
					if (!e?.gex_cmdline) return ``;
					let t = e.gex_alloc(160) >>> 0,
						n = e.gex_cmdline(t, 160) >>> 0,
						r = z(this.#Ye().subarray(t, t + n));
					return (e.gex_free?.(t, 160), r);
				}
				get who() {
					return {
						pid: this.#t?.exports?.gex_my_pid?.() ?? null,
						tid: this.#Ka,
						cmdline: this.cmdline,
					};
				}
				get blocksByObject() {
					let e = this.#t?.exports;
					if (!e?.gex_jit_by_object) return ``;
					let t = e.gex_alloc(512) >>> 0,
						n = e.gex_jit_by_object(t, 512) >>> 0,
						r = z(this.#Ye().subarray(t, t + n));
					return (e.gex_free?.(t, 512), r);
				}
				get shimCompileMillis() {
					return Math.round(this.#F);
				}
				get shimInstantiateMillis() {
					return Math.round(this.#I);
				}
				get guestInstantiateMillis() {
					return Math.round(this.#L);
				}
				get installCount() {
					return this.#R;
				}
				get fillStats() {
					return {
						filled: this.#J,
						unanswered: this.#Y,
						now: this.#x,
						denseLeft: this.#Ya,
						denseWanted: this.#Ha,
						denseAsks: this.#Ua,
						denseFillMs: this.#Wa,
						denseFillWorst: this.#Ga,
						blocksLen: this.#n?.exports?.blocks?.length ?? 0,
						ftabLen: Number(this.#Gt?.ftab?.length ?? 0),
						nowMs: Math.round(this.#S),
						sysMs: Math.round(
							Number(this.#t.exports.gex_sys_us?.() ?? 0n) / 1e3,
						),
						sysN: Number(this.#t.exports.gex_sys_calls?.() ?? 0n),
						faBase: Math.round(this.#h),
						faInit: Math.round(this.#g),
						slow: this.#X,
						slowMs: Math.round(this.#Z),
						pub: this.#$,
						pubMs: Math.round(this.#Q),
						growMs: Math.round(this.#ee),
						grew: this.#te,
						wants: this.#re,
						wantMs: Math.round(this.#ne),
						instMs: Math.round(this.#ie),
						iGrow: Math.round(this.#P),
						iComp: Math.round(this.#A),
						iInst: Math.round(this.#N),
						iGrows: this.#E,
						iAdded: this.#D,
						iCopied: this.#k,
						bigGrows: this.#C.slice(0, 6).join(` | `),
						tn: this.#w.join(` `),
						tlen: this.#t
							? this.#po()
									.map((e) => e.length)
									.join(`/`)
							: ``,
						blen: this.#n?.exports?.blocks?.length ?? -1,
						tailMs: Math.round(this.#ae),
						strictGrows: this.#oe,
						strictSlots: this.#se,
					};
				}
				readFile(e) {
					let t = new TextEncoder().encode(e),
						n = this.#t.exports.gex_alloc(t.length) >>> 0;
					this.#Ye().set(t, n);
					let r = this.#t.exports.gex_get_file(n, t.length) >>> 0;
					if (r === 0) return null;
					let i = this.#t.exports.gex_file_data() >>> 0;
					return this.#Ye().slice(i, i + r);
				}
				#Xe() {
					return {
						write: (e, t, n) => {
							let r = typeof t == `bigint` ? Number(t) : t >>> 0;
							this.#r.write(e, this.#Ye().subarray(r, r + (n >>> 0)));
						},
						debug: (e, t) =>
							(this.#p || L(`debug`)) &&
							tn(
								z(this.#Ye().subarray(e >>> 0, (e >>> 0) + (t >>> 0))).replace(
									/\n$/,
									``,
								),
								this.#p,
							),
						warn: (e, t) => {
							let n = z(
								this.#Ye().subarray(e >>> 0, (e >>> 0) + (t >>> 0)),
							).replace(/\n$/, ``);
							if (n.startsWith(`[gex-note] `)) {
								console.warn(n.slice(11));
								return;
							}
							if (n.startsWith(`[gex-info] `)) {
								Rt() && console.info(`[gex] ${n.slice(11)}`);
								let e =
									this.#_e?.straceExe &&
									/^pid \d+: exec (\S+)/.exec(n.slice(11));
								e &&
									e[1].split(`/`).pop() === this.#_e.straceExe &&
									(this.#t.exports.gex_set_trace(1), (this.#p = !0));
								return;
							}
							let r = /^gex-pe: native wasm32 module for (\S+): /.exec(n);
							if (
								!(
									r &&
									(this.#r.noteStatus?.({ kind: `module`, path: r[1] }),
									!L(`debug`))
								)
							) {
								if (n.startsWith(`[gex-stack]`)) {
									let e = Error.stackTraceLimit;
									Error.stackTraceLimit = 40;
									let t = Error().stack;
									((Error.stackTraceLimit = e), console.error(`${n}\n${t}`));
								} else console.error(n);
							}
						},
						now: () => this.#r.now(),
						perf_now: () => performance.now(),
						clock_origin: () => Pr,
						call_out: S.on
							? new WebAssembly.Suspending((e, t, n, r) =>
									this.#ra()
										? this.#Zi(e >>> 0, t, n, r)
										: this.#Qi(e >>> 0, t, n, r),
								)
							: (e, t, n, r) => this.#Zi(e >>> 0, t, n, r),
						ftab_call: S.on
							? new WebAssembly.Suspending((e, t, n, r, i) => {
									this.#tn.length && this.#rn(e >>> 0);
									let a = this.#Gt.ftab.get(Nn(e >>> 0));
									return this.#ra() ? a(t, n, r, i) : this.#na(a)(t, n, r, i);
								})
							: (e, t, n, r, i) => (
									this.#tn.length && this.#rn(e >>> 0),
									this.#Gt.ftab.get(Nn(e >>> 0))(t, n, r, i)
								),
						ftab_call_vi: (e, t) => {
							(this.#tn.length && this.#rn(e >>> 0),
								this.#Gt.ftab.get(Nn(e >>> 0))(t));
						},
						entry_call: S.on ? (e, t, n) => 0 : this.#zn(),
						snap_ok: () => this.#yr(),
						cgen_serve: () => this.#mi(),
						thread_start: () => this.#Tt(),
						fault_call: (e, t, n, r, i, a) => {
							if (S.on) return 0;
							let o = this.#Gt.ftab.get(Nn(e >>> 0)),
								s = this.#In ?? this.#Gn(),
								c = s.value;
							if (typeof c == `bigint`) {
								let e = BigInt.asUintN(64, a);
								s.value = ((c !== 0n && c < e ? c : e) - 4096n) & -16n;
							} else {
								let e = Number(a & 4294967295n),
									t = Number(c) >>> 0;
								s.value = (((t !== 0 && t < e ? t : e) - 4096) & -16) | 0;
							}
							try {
								let s =
									this.#t.exports.gex_guest_x86_64?.() === 1
										? BigInt.asUintN(64, r)
										: Number(BigInt.asUintN(32, r)) | 0;
								this.#vr
									? this.#cr(o, e >>> 0, t, n, s, i, BigInt.asUintN(64, a))
									: o(t, n, s, i);
							} finally {
								s.value = c;
							}
							return 1;
						},
						stack_room: () => Xt(),
						jit_install: (e) => this.#da(),
						ftab_grow: () => this.#Xt(),
						serve_in_place: () => {
							(this.#mi(), this.#Tt());
						},
						drain_output: () => this.#r.drainOutput?.(),
						syscall_after: (e) => this.#fi(e),
						native_syscall_marked: (e, t) => this.#pi(e, t),
						net_open: () => (this.#o ? this.#o.open() : 0),
						net_connect: (e, t, n, r) => {
							let i = z(this.#Ye().subarray(t >>> 0, (t >>> 0) + (n >>> 0)));
							this.#o?.connect(e, i, r);
						},
						net_status: (e) => (this.#o ? this.#o.status(e) : 2),
						net_send: (e, t, n) =>
							this.#o
								? this.#o.send(e, this.#Ye().subarray(V(t), V(t) + (n >>> 0)))
								: -1,
						net_recv: (e, t, n) =>
							this.#o
								? this.#o.recv(e, this.#Ye().subarray(V(t), V(t) + (n >>> 0)))
								: 0,
						net_peek: (e, t, n) =>
							this.#o?.peek
								? this.#o.peek(e, this.#Ye().subarray(V(t), V(t) + (n >>> 0)))
								: this.#o
									? -2
									: 0,
						net_avail: (e) => (this.#o ? +!!this.#o.available(e) : 1),
						net_close: (e) => this.#o?.close(e),
						net_dup: (e) => (this.#s && this.#o?.dup ? this.#o.dup(e) : 0),
						gl_submit: S.on
							? new WebAssembly.Suspending((e) =>
									this.#c
										? this.#c.submit(this.#e, e, this.wlToken(), !1, this.#Vt)
										: -1,
								)
							: (e) =>
									this.#c
										? this.#c.submit(this.#e, e, this.wlToken(), !1, this.#Vt)
										: -1,
						gl_submit_async: S.on
							? new WebAssembly.Suspending((e) =>
									this.#c
										? this.#c.submit(this.#e, e, this.wlToken(), !0, this.#Vt)
										: -1,
								)
							: (e) =>
									this.#c
										? this.#c.submit(this.#e, e, this.wlToken(), !0, this.#Vt)
										: -1,
						wl_publish: (e, t) => this.#u?.publish(this.#e, e >>> 0, t >>> 0),
						wl_poll_input: (e, t) =>
							this.#u?.pollInput(this.#e, e >>> 0, t >>> 0) ?? 0,
						wl_input_pending: () => +!!this.#u?.inputPending(),
						wl_output_size: () => this.#u?.outputSize?.() ?? 0,
						wl_drag_data: (e, t) =>
							this.#u?.dragData(this.#e, e >>> 0, t >>> 0) ?? 0,
						wl_drag_status: (e, t) => this.#u?.dragStatus(e >>> 0, t >>> 0),
						wl_clip_serial: () => this.#u?.clipSerial?.() ?? 0,
						wl_clip_get: (e, t) =>
							this.#u?.clipGet?.(this.#e, e >>> 0, t >>> 0) ?? 0,
						wl_clip_set: (e, t) =>
							this.#u?.clipSet?.(this.#e, e >>> 0, t >>> 0) ?? 0,
					};
				}
				async load(t, n, r, i = {}, a = [], o = {}) {
					let s = fn(r);
					(s && (this.#de = -1),
						(this.#pe = mn(r) & 3 ? null : pn(r)),
						(this.#fe = !!(s & 2)));
					let c =
						t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t);
					(await this.#st(),
						(this.#t = await WebAssembly.instantiate(c, {
							env: { memory: this.#e },
							gex_env: this.#Xe(),
							gex_k: this.#gt(c),
						})),
						(this.#i = null),
						(this.#t.exports.__stack_pointer.value = An(this.#Be())));
					let l = [
						`gex_alloc`,
						`gex_load`,
						`gex_add_file`,
						`gex_push_stdin`,
						`gex_wake`,
						`gex_chmod`,
						`gex_add_dir`,
						`gex_add_env`,
						`gex_add_symlink`,
						`gex_paused_for_input`,
						`gex_paused_for_net`,
						`gex_paused_for_host`,
						`gex_park`,
						`gex_resume_pc`,
						`gex_resume_ctx`,
						`gex_exit_code`,
						`gex_jit_pending_len`,
					].filter((e) => typeof this.#t.exports[e] != `function`);
					if (l.length)
						throw Error(
							`the gex runtime is out of date: it has no ${l.join(`, `)}. Rebuild it with web/build-assets.sh and reload.`,
						);
					if (
						(this.#t.exports.gex_set_gl?.(+!!this.#c),
						this.#t.exports.gex_set_d3d?.(+!!this.#l),
						this.#Ht && this.#t.exports.gex_cgen_set_mode?.(this.#Ht),
						L(`serveall`) && this.#t.exports.gex_cgen_serve_always?.(1),
						L(`record`) && this.#t.exports.gex_cgen_set_record?.(1),
						this.#Wt && this.#t.exports.gex_elfprov_off?.(),
						this.#Ut(),
						this.#t.exports.gex_set_wl?.(+!!this.#u),
						this.#xi && this.#t.exports.gex_set_wl_output?.(...this.#xi),
						this.#xi && this.#t.exports.gex_set_wl_scale?.(this.#Si),
						this.#t.exports.gex_set_network?.(+!!this.#o),
						this.#t.exports.gex_set_cpus?.(
							o.cpus || globalThis.navigator?.hardwareConcurrency || 1,
						),
						e.watchDir >= 0 &&
							this.#t.exports.gex_watch_dir?.(BigInt(e.watchDir)),
						(this.#t.exports.__stack_pointer.value = An(this.#Be())),
						(this.#_e = {
							strace: o.strace,
							stracePid: o.stracePid,
							straceExe: o.straceExe,
							tty: o.tty,
							uid: o.uid,
							gid: o.gid,
							traceBlocks: o.traceBlocks,
							traceMisses: o.traceMisses,
							checkSp: o.checkSp,
							dlChecked: o.dlChecked,
							jitDiag: o.jitDiag,
							watchMem: o.watchMem,
							noIntrinsics: o.noIntrinsics,
							intrinsicMask: o.intrinsicMask,
							liftMax: o.liftMax,
							inlineDispatch: o.inlineDispatch,
							xlateReport: o.xlateReport,
							discoverSkip: o.discoverSkip,
							t1Fold: o.t1Fold,
						}),
						an(this.#t.exports),
						o.strace && (this.#t.exports.gex_set_trace(1), (this.#p = !0)),
						o.jit === !1)
					) {
						if (!this.#t.exports.gex_set_jit)
							throw Error(`this gex runtime cannot turn translation off`);
						this.#t.exports.gex_set_jit(0);
					}
					if (
						(o.liftMax && this.#t.exports.gex_set_lift_max?.(o.liftMax),
						o.inlineDispatch && this.#t.exports.gex_set_inline_dispatch?.(1),
						o.xlateReport &&
							this.#t.exports.gex_set_xlate_report?.(o.xlateReport),
						o.discoverSkip &&
							this.#t.exports.gex_set_discover_skip?.(o.discoverSkip),
						o.t1Fold && this.#t.exports.gex_set_t1_fold?.(1),
						o.link && this.#t.exports.gex_set_snapshot?.(Number(o.link)),
						o.tty && this.#t.exports.gex_set_tty(1),
						o.uid !== void 0 &&
							this.#t.exports.gex_set_identity(o.uid, o.gid ?? o.uid),
						this.#_t(n),
						o.cwd)
					) {
						let e = new TextEncoder().encode(o.cwd),
							t = this.#t.exports.gex_alloc(e.length) >>> 0;
						(this.#Ye().set(e, t), this.#t.exports.gex_set_cwd(t, e.length));
					}
					if (o.stdin && o.stdin.length) {
						let e = this.#t.exports.gex_alloc(o.stdin.length) >>> 0;
						(this.#Ye().set(o.stdin, e),
							this.#t.exports.gex_set_stdin(e, o.stdin.length));
					}
					let u = new TextEncoder(),
						d = this.#t.exports.gex_free;
					for (let e of o.dirs ?? []) {
						let t = u.encode(e),
							n = this.#t.exports.gex_alloc(t.length) >>> 0;
						(this.#Ye().set(t, n),
							this.#t.exports.gex_add_dir?.(n, t.length),
							d?.(n, t.length));
					}
					let f = o.modes ?? {};
					for (let e of o.env ?? []) {
						let t = u.encode(e),
							n = this.#t.exports.gex_alloc(t.length) >>> 0;
						(this.#Ye().set(t, n),
							this.#t.exports.gex_add_env?.(n, t.length),
							d?.(n, t.length));
					}
					let p = 16 << 20,
						m = 0;
					for (let [e, t] of Object.entries(i)) {
						let n = u.encode(e),
							r = t instanceof Uint8Array ? t : u.encode(t);
						if (r.length > p && this.#t.exports.gex_add_file_part) {
							let t = this.#t.exports.gex_alloc(n.length) >>> 0;
							(this.#Ye().set(n, t),
								(m ||= this.#t.exports.gex_alloc(p) >>> 0));
							for (let e = 0; e < r.length; e += p) {
								let i = r.subarray(e, Math.min(e + p, r.length));
								(this.#Ye().set(i, m),
									this.#t.exports.gex_add_file_part(
										t,
										n.length,
										BigInt(e),
										m,
										i.length,
									));
							}
							(f[e] !== void 0 &&
								this.#t.exports.gex_chmod?.(t, n.length, f[e]),
								d?.(t, n.length));
							continue;
						}
						let i = this.#t.exports.gex_alloc(n.length) >>> 0,
							a = this.#t.exports.gex_alloc(r.length) >>> 0;
						(this.#Ye().set(n, i),
							this.#Ye().set(r, a),
							this.#t.exports.gex_add_file(i, n.length, a, r.length),
							f[e] !== void 0 && this.#t.exports.gex_chmod?.(i, n.length, f[e]),
							d?.(i, n.length),
							d?.(a, r.length));
					}
					m && d?.(m, p);
					for (let e of o.dirs ?? []) {
						if (f[e] === void 0) continue;
						let t = u.encode(e),
							n = this.#t.exports.gex_alloc(t.length) >>> 0;
						(this.#Ye().set(t, n),
							this.#t.exports.gex_chmod?.(n, t.length, f[e]),
							d?.(n, t.length));
					}
					for (let [e, t, n, r] of o.lazy ?? []) {
						if (!this.#t.exports.gex_add_lazy) break;
						if (i[e] !== void 0 && !(r && i[e].length === r)) continue;
						let a = u.encode(e),
							o = u.encode(n),
							s = this.#t.exports.gex_alloc(a.length) >>> 0,
							c = this.#t.exports.gex_alloc(o.length) >>> 0;
						(this.#Ye().set(a, s),
							this.#Ye().set(o, c),
							this.#t.exports.gex_add_lazy(s, a.length, c, o.length, BigInt(t)),
							f[e] !== void 0 && this.#t.exports.gex_chmod?.(s, a.length, f[e]),
							d?.(s, a.length),
							d?.(c, o.length));
					}
					for (let [e, t] of Object.entries(o.hard ?? {})) {
						let n = u.encode(e),
							r = u.encode(t),
							a = this.#t.exports.gex_alloc(n.length) >>> 0,
							o = this.#t.exports.gex_alloc(r.length) >>> 0;
						(this.#Ye().set(n, a), this.#Ye().set(r, o));
						let s =
								this.#t.exports.gex_add_hardlink?.(o, r.length, a, n.length) ??
								0,
							c = i[t];
						if (!s && c) {
							let e = this.#t.exports.gex_alloc(c.length) >>> 0;
							(this.#Ye().set(c, e),
								this.#t.exports.gex_add_file(a, n.length, e, c.length),
								d?.(e, c.length));
						}
						(f[t] !== void 0 && this.#t.exports.gex_chmod?.(a, n.length, f[t]),
							d?.(a, n.length),
							d?.(o, r.length));
					}
					for (let [e, t] of Object.entries(o.symlinks ?? {})) {
						let n = u.encode(e),
							r = u.encode(t),
							i = this.#t.exports.gex_alloc(n.length) >>> 0,
							a = this.#t.exports.gex_alloc(r.length) >>> 0;
						(this.#Ye().set(n, i),
							this.#Ye().set(r, a),
							this.#t.exports.gex_add_symlink(a, r.length, i, n.length) ||
								console.warn(
									`gex: symlink ${e} -> ${t} not made (no global kernel)`,
								),
							d?.(i, n.length),
							d?.(a, r.length));
					}
					for (let [e, t] of Object.entries(o.mtimes ?? {})) {
						if (!this.#t.exports.gex_set_mtime) break;
						let n = u.encode(e),
							r = this.#t.exports.gex_alloc(n.length) >>> 0;
						(this.#Ye().set(n, r),
							this.#t.exports.gex_set_mtime(r, n.length, BigInt(Math.trunc(t))),
							d?.(r, n.length));
					}
					for (let [e, t] of Object.entries(o.xattrs ?? {})) {
						if (!this.#t.exports.gex_set_xattr) break;
						for (let [n, r] of Object.entries(t)) {
							let t = u.encode(e),
								i = u.encode(n),
								a = r instanceof Uint8Array ? r : u.encode(String(r)),
								o =
									this.#t.exports.gex_alloc(t.length + i.length + a.length) >>>
									0;
							(this.#Ye().set(t, o),
								this.#Ye().set(i, o + t.length),
								this.#Ye().set(a, o + t.length + i.length),
								this.#t.exports.gex_set_xattr(
									o,
									t.length,
									o + t.length,
									i.length,
									o + t.length + i.length,
									a.length,
								),
								d?.(o, t.length + i.length + a.length));
						}
					}
					if (o.program && this.#t.exports.gex_set_image_program) {
						let e = u.encode(o.program),
							t = this.#t.exports.gex_alloc(e.length) >>> 0;
						(this.#Ye().set(e, t),
							this.#t.exports.gex_set_image_program(t, e.length),
							d?.(t, e.length));
					}
					if (o.exe) {
						if (!this.#t.exports.gex_set_exe)
							throw Error(`this gex runtime cannot be told the program path`);
						let e = u.encode(o.exe),
							t = this.#t.exports.gex_alloc(e.length) >>> 0;
						(this.#Ye().set(e, t),
							this.#t.exports.gex_set_exe(t, e.length),
							d?.(t, e.length));
					}
					let h = this.#t.exports.gex_pin_object;
					for (let [e, t] of Object.entries(o.pins ?? {})) {
						if (!h) break;
						let n = u.encode(e),
							r = this.#t.exports.gex_alloc(n.length) >>> 0;
						(this.#Ye().set(n, r),
							h(r, n.length, BigInt(t.base ?? t), BigInt(t.span ?? 0)),
							d?.(r, n.length));
					}
					let g = this.#t.exports.gex_alloc(r.length) >>> 0;
					this.#Ye().set(r, g);
					let _ = new TextEncoder().encode(a.join(`\0`)),
						v = 0;
					(_.length &&
						((v = this.#t.exports.gex_alloc(_.length) >>> 0),
						this.#Ye().set(_, v)),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[gex] load: ${Object.keys(o.pins ?? {}).length} pins, ${Object.keys(i).length} files staged, loading the program`,
							));
					let y = this.#t.exports.gex_load(g, r.length, v, _.length);
					if (y === 0n) throw Error(`gex: could not load the program`);
					(o.xcache && (await this.#mt(String(o.xcache))),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[gex] load: program at ${y}, ${(o.closure ?? []).length} closure modules to install`,
							),
						(this.#He = o.closure ?? []),
						(this.#Ue = o.wantLibrary ?? this.#Ue));
					let b = this.#t.exports;
					this.#a = {
						memory: this.#e,
						syscall: o.syscallGuard
							? (e, t) => (
									o.syscallGuard(e >>> 0, t, this.#e),
									b.gex_syscall(e, t)
								)
							: this.#si(b),
						dispatch_miss: b.gex_dispatch_miss,
						illegal: b.gex_illegal,
						breakpoint: b.gex_breakpoint,
						sysreg_read: b.gex_sysreg_read,
						sysreg_write: o.replace
							? (e, t, n, r) =>
									n === -200
										? o.replace(e >>> 0, t, Number(r), this.#e, this.#a)
										: b.gex_sysreg_write(e, t, n, r)
							: b.gex_sysreg_write,
						cache_op: b.gex_cache_op,
						safepoint: S.on ? this.#Ri(b) : b.gex_safepoint,
						fma: b.gex_fma,
						x87: b.gex_x87,
						mx: b.gex_mx,
						icall_note: b.gex_icall_note,
					};
					let x = performance.now();
					((this.#n = await WebAssembly.instantiate(
						n instanceof WebAssembly.Module ? n : await WebAssembly.compile(n),
						{ gex: this.#a },
					)),
						(this.#L = performance.now() - x),
						this.#T(`boot`));
					let C =
						o.dense !== !1 && !!this.#n.exports.blocks && !!b.gex_set_dense;
					return (
						(this.#B = C),
						(this.#_e.dense = C ? (o.dense === 2 ? 2 : 1) : !1),
						b.gex_set_dense?.(Yt(this.#_e, this.#B)),
						En && b.gex_test_keep_probe?.(1),
						this.#io(),
						(globalThis.GEX_TEST_UNPUBLISHED_RETIRE ||
							{}.GEX_TEST_UNPUBLISHED_RETIRE) &&
							b.gex_test_unpublished_retire?.(1),
						(globalThis.GEX_TEST_FORK_REBASE || {}.GEX_TEST_FORK_REBASE) &&
							b.gex_test_fork_rebase?.(1),
						{}.GEX_TEST_DENSE_HOLES && b.gex_test_dense_holes?.(1),
						(globalThis.GEX_TEST_SERVE_UNMERGED ||
							{}.GEX_TEST_SERVE_UNMERGED) &&
							b.gex_test_serve_unmerged?.(1),
						Object.assign(this.#_e, {
							fjit: o.fjit,
							fjitMax: o.fjitMax,
							fjitOnly: o.fjitOnly,
						}),
						this.#St(b, o),
						this.#Ma(this.#n),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(`[gex] load: instantiated, installing`),
						await this.#Qe(),
						globalThis.GEX_DEBUG_EXIT && console.error(`[gex] load: done`),
						y
					);
				}
				async #Ze(e) {
					let t = this.#t.exports,
						n = this.#B ? (e.dense ?? yn(e.mod)) : null;
					if (globalThis.GEX_DENSE_DEBUG && n && e.dense) {
						let t = yn(e.mod);
						t &&
							new DataView(t.buffer, t.byteOffset).getUint32(0, !0) !==
								new DataView(n.buffer, n.byteOffset).getUint32(0, !0) &&
							console.error(
								`[dense] adopt: a module compiled elsewhere (base ${new DataView(t.buffer, t.byteOffset).getUint32(0, !0)}) at this process's base ${new DataView(n.buffer, n.byteOffset).getUint32(0, !0)}`,
							);
					}
					if (n && t.gex_dense_adopt) {
						let e = t.gex_alloc(n.length) >>> 0;
						(this.#Ye().set(n, e),
							t.gex_dense_adopt(e, n.length),
							t.gex_free?.(e, n.length));
					}
					let r = Math.max(e.need >>> 0, dn(e.meta));
					if (!e.meta || !e.meta.length || !t.gex_add_lazy_module) {
						await this.#ka(
							e.mod,
							r,
							64,
							e.meta,
							`adopt-nometa`,
							null,
							!1,
							e.dense,
						);
						return;
					}
					let i = t.gex_alloc(e.meta.length) >>> 0;
					this.#Ye().set(e.meta, i);
					let a = t.gex_add_lazy_module(i, e.meta.length) >>> 0;
					if ((t.gex_free?.(i, e.meta.length), !a)) {
						await this.#ka(
							e.mod,
							r,
							64,
							e.meta,
							`adopt-noneed`,
							null,
							!1,
							e.dense,
						);
						return;
					}
					(this.#wi(Math.max(a, r), `adopt`),
						this.#q.push({
							mod: e.mod,
							need: r,
							inst: null,
							meta: e.meta,
							dense: e.dense,
						}));
				}
				async installClosureModule(e) {
					if (!this.#t || !e) return !1;
					let t = e instanceof Uint8Array ? bn(e) : e.meta;
					if (!t || !t.length) return !1;
					let n = this.#t.exports.gex_add_closure_module;
					if (!n) return !1;
					let r = this.#t.exports.gex_alloc(t.length) >>> 0;
					this.#Ye().set(t, r);
					let i = n(r, t.length) >>> 0;
					if ((this.#t.exports.gex_free?.(r, t.length), !i)) return !1;
					let a = e instanceof Uint8Array ? e : e.mod;
					return (
						this.#wi(i, `closure`),
						this.#K.push({ mod: a, need: i, inst: null }),
						this.#G++,
						!0
					);
				}
				async #Qe() {
					let e = this.#t.exports.gex_add_closure_module;
					if (!e) return;
					let t = 0;
					for (let [n, r] of this.#He.entries()) {
						let i = !(r instanceof Uint8Array),
							a = i ? null : r,
							o = i ? r.meta : bn(r),
							s = 0;
						if (o && o.length) {
							let t = performance.now(),
								a = this.#t.exports.gex_alloc(o.length) >>> 0;
							this.#Ye().set(o, a);
							let c = performance.now(),
								l = new TextEncoder().encode(i ? (r.program ?? ``) : ``),
								u = 0;
							(l.length &&
								((u = this.#t.exports.gex_alloc(l.length) >>> 0),
								this.#Ye().set(l, u)),
								(s = e(a, o.length, u, l.length) >>> 0),
								u && this.#t.exports.gex_free?.(u, l.length));
							let d = performance.now();
							(this.#t.exports.gex_free?.(a, o.length),
								globalThis.GEX_DEBUG_EXIT &&
									console.error(
										`[closure] library ${n}: ${(o.length / 1024) | 0} KiB of metadata, ${Math.round(c - t)}ms copying, ${Math.round(d - c)}ms registering, ${s} slots`,
									));
						}
						((t = Math.max(t, s)),
							this.#K.push({
								mod: i ? r.mod : a,
								need: Math.max(s, dn(o)),
								inst: null,
								meta: o,
								published: !1,
							}));
					}
					this.#He = [];
				}
				async #$e(e, t, n = () => {}, { stack: r = !0 } = {}) {
					(await this.#st(), n(`kernel started`));
					let i = performance.now(),
						a =
							e instanceof WebAssembly.Module
								? e
								: await WebAssembly.compile(e);
					this.#F = performance.now() - i;
					let o = performance.now();
					((this.#t = await WebAssembly.instantiate(a, {
						env: { memory: this.#e },
						gex_env: this.#Xe(),
						gex_k: this.#gt(a),
					})),
						(this.#I = performance.now() - o),
						n(`shim instantiated`),
						(this.#i = null),
						r && (this.#t.exports.__stack_pointer.value = An(this.#Be())));
					let s = this.#t.exports;
					this.#a = {
						memory: this.#e,
						syscall: this.#si(s),
						dispatch_miss: s.gex_dispatch_miss,
						illegal: s.gex_illegal,
						breakpoint: s.gex_breakpoint,
						sysreg_read: s.gex_sysreg_read,
						sysreg_write: s.gex_sysreg_write,
						cache_op: s.gex_cache_op,
						safepoint: S.on ? this.#Ri(s) : s.gex_safepoint,
						fma: s.gex_fma,
						x87: s.gex_x87,
						mx: s.gex_mx,
						icall_note: s.gex_icall_note,
					};
					let c = performance.now();
					((this.#n = await WebAssembly.instantiate(
						t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t),
						{ gex: this.#a },
					)),
						(this.#L = performance.now() - c),
						n(`guest instantiated`));
				}
				async preattach(e, t) {
					(await this.#$e(e, t, void 0, { stack: !1 }), (this.#et = !0));
				}
				get preattached() {
					return this.#et;
				}
				#et = !1;
				setEnv(e) {
					this.#r = e;
				}
				async attach(t, n, { devices: r = !0 } = {}) {
					let i = (e) => {
						globalThis.GEX_ATTACH_TRACE && console.error(`[attach] ${e}`);
					};
					(i(`start`),
						this.#et
							? ((this.#et = !1),
								(this.#t.exports.__stack_pointer.value = An(this.#Be())))
							: await this.#$e(t, n, i),
						r &&
							(this.#t.exports.gex_set_gl?.(+!!this.#c),
							this.#t.exports.gex_set_d3d?.(+!!this.#l),
							this.#t.exports.gex_set_wl?.(+!!this.#u),
							this.#xi && this.#t.exports.gex_set_wl_output?.(...this.#xi),
							this.#xi && this.#t.exports.gex_set_wl_scale?.(this.#Si),
							this.#t.exports.gex_set_network?.(+!!this.#o),
							this.#Ht && this.#t.exports.gex_cgen_set_mode?.(this.#Ht),
							L(`serveall`) && this.#t.exports.gex_cgen_serve_always?.(1),
							L(`record`) && this.#t.exports.gex_cgen_set_record?.(1),
							this.#Wt && this.#t.exports.gex_elfprov_off?.(),
							this.#Ut(),
							e.watchDir >= 0 &&
								this.#t.exports.gex_watch_dir?.(BigInt(e.watchDir))));
					let a = this.#t.exports;
					((this.#B = !!a.gex_dense_on?.() && !!this.#n.exports.blocks),
						this.#io(),
						this.#Ma(this.#n),
						i(`offerToFill done, catchUp`),
						await this.#Rt(),
						i(`attach catchUp done`));
				}
				#tt(e) {
					let t = this.#Ce,
						n = e.filter((e) => e.len !== void 0),
						r = n.reduce((e, t) => e + t.len, 0),
						i = r ? t.k_stage_take(r) : 0,
						a = 0;
					for (let e of i > 0 ? n : []) {
						if (t.k_stage_pull(i, a, BigInt(e.at), e.len) !== 0) {
							(t.k_stage_drop(i), (i = 0));
							break;
						}
						((e.stage = a), (a += e.len));
					}
					if (i > 0) {
						this.#nt = i;
						return;
					}
					let o = this.#Ye();
					for (let e of n)
						((e.bytes = o.slice(e.at, e.at + e.len)),
							delete e.len,
							delete e.stage);
				}
				#nt = 0;
				#rt() {
					let e = performance.now(),
						t = this.#t.exports,
						n = this.#Ye(),
						r = new Int32Array(this.#e.buffer, 0, Math.floor(n.length / 4)),
						i = (e, t) => {
							let i = t - (t % 4);
							for (let t = Math.floor(e / 4); t < i / 4; t++)
								if (r[t] !== 0) return !1;
							for (let e = i; e < t; e++) if (n[e] !== 0) return !1;
							return !0;
						},
						a = [],
						o = this.#Ce,
						s =
							!globalThis.GEX_DEBUG_EXIT &&
							!B() &&
							!!o?.k_stage_take &&
							Wt(this.#e.buffer) &&
							Wt(this.#ye?.memory?.buffer);
					this.#nt = 0;
					let c = 0,
						l = 0,
						u =
							(t.gex_image_runs && !B()
								? (e, n) => {
										for (;;) {
											c || ((c = 1024), (l = t.gex_alloc(c * 8) >>> 0));
											let r = t.gex_image_runs(e, n, l, c);
											if (r >= 0) {
												let t = new Uint32Array(this.#e.buffer, l, r * 2),
													i = this.#Ye(),
													o = 0;
												for (let e = 0; e < r; e++) {
													let n = t[e * 2],
														r = t[e * 2 + 1];
													(a.push(
														s
															? { at: n, len: r, dense: !0 }
															: { at: n, bytes: i.slice(n, n + r), dense: !0 },
													),
														(o += r));
												}
												return n - e - o;
											}
											(t.gex_free?.(l, c * 8),
												(c *= 4),
												(l = t.gex_alloc(c * 8) >>> 0));
										}
									}
								: null) ??
							((e, t) => {
								let r = 4096,
									o = 0,
									s = e;
								for (; s < t; ) {
									let e = Math.min(s + r, t);
									if (i(s, e)) {
										((o += e - s), (s = e));
										continue;
									}
									let c = e;
									for (; c < t; ) {
										let e = Math.min(c + r, t);
										if (i(c, e)) break;
										c = e;
									}
									(a.push({ at: s, bytes: n.slice(s, c), dense: !0 }), (s = c));
								}
								return o;
							});
					(a.push({ at: 0, bytes: new Uint8Array(), zeros: u(0, Er) }),
						B() &&
							a.push({ at: Dr, bytes: new Uint8Array(), zeros: u(Dr, Or) }));
					let d = this.#ot();
					this.#it = d;
					let f = d ? cn(d) : this.#at();
					for (let { start: e, end: t, prot: n } of f)
						if (t > e) {
							let r = {
								at: e,
								end: t,
								prot: n,
								bytes: new Uint8Array(),
								zeros: 0,
							};
							(a.push(r), (r.zeros = u(e, t)));
						}
					if (
						(c && t.gex_free?.(l, c * 8),
						s && this.#tt(a),
						globalThis.GEX_DEBUG_EXIT)
					)
						for (let e of a) e.sum = un(e.bytes);
					if (globalThis.GEX_DEBUG_EXIT) {
						let n = a.reduce((e, t) => e + t.bytes.byteLength, 0),
							r = 0;
						if (t.gex_vma_reloadable) {
							let e = t.gex_vma_count(),
								n = t.gex_alloc(24) >>> 0,
								i = new DataView(this.#e.buffer);
							for (let a = 0; a < e; a++) {
								if (t.gex_vma_at(a, n) !== 0 || !t.gex_vma_reloadable(a))
									continue;
								let e = Number(i.getBigUint64(n, !0)),
									o = Number(i.getBigUint64(n + 8, !0));
								o > e && (r += o - e);
							}
							t.gex_free?.(n, 24);
						}
						console.error(
							`[gex] fork image: ${a.length} regions, ${(n / 1048576).toFixed(1)} MiB, ${(r / 1048576).toFixed(1)} MiB of it re-readable, ${Math.round(performance.now() - e)}ms to copy`,
						);
					}
					return a;
				}
				#it = null;
				#at() {
					let e = this.#t.exports,
						t = e.gex_alloc(24) >>> 0,
						n = [],
						r = e.gex_vma_count();
					for (let i = 0; i < r; i++) {
						if (e.gex_vma_at(i, t) !== 0) continue;
						let r = new DataView(this.#e.buffer);
						n.push({
							start: Number(r.getBigUint64(t, !0)),
							end: Number(r.getBigUint64(t + 8, !0)),
							prot: Number(r.getBigUint64(t + 16, !0)),
						});
					}
					return (e.gex_free?.(t, 24), n);
				}
				#ot() {
					let e = this.#t.exports;
					if (!e.gex_vma_blob_len || !e.gex_vma_blob_read) return null;
					let t = (e.gex_vma_blob_len() >>> 0) * 2 + 4096,
						n = null;
					for (let r = 0; r < 8 && !n; r++, t *= 2) {
						let r = e.gex_alloc(t) >>> 0,
							i = e.gex_vma_blob_read(r, t) >>> 0;
						(i && (n = new Uint8Array(this.#e.buffer, r, i).slice()),
							e.gex_free?.(r, t));
					}
					return n;
				}
				async #st() {
					let e = (e) => {
						globalThis.GEX_ATTACH_TRACE && console.error(`[kernel] ${e}`);
					};
					if (!this.#ye || this.#Ce) {
						e(`skip (spec=${!!this.#ye} kernel=${!!this.#Ce})`);
						return;
					}
					let { module: t, memory: n, stackTop: r, spare: i } = this.#ye;
					e(
						`compile (isModule=${t instanceof WebAssembly.Module} stackTop=0x${(r >>> 0).toString(16)})`,
					);
					let a =
						t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t);
					(e(`instantiate`), await ze());
					let o = await WebAssembly.instantiate(a, {
						env: {
							memory: n,
							...Ge(this.#e, B(), i),
							lazy_fetch: Je(n),
							page_fs: ft(n),
						},
					});
					(e(`instantiated`), r && qe(o.exports, r), (this.#Ce = o.exports));
					let s = Number(globalThis.GEX_TIME_SCALE) || 0,
						c = Number(globalThis.GEX_FIXED_TIME) || 0;
					if ((s > 0 && s !== 1) || c) {
						let e = c ? Math.floor(Number(this.#r.now() / 1000000000n)) - c : 0;
						o.exports.k_guest_clock?.(Math.round((s || 1) * 1e3), e | 0);
					}
					this.#ct();
				}
				#ct() {
					if (this.#lt) return this.#lt;
					let e = BigInt.asUintN(
						64,
						BigInt(this.#Ce?.k_guest_clock?.(0, 0) ?? 0),
					);
					return (
						(this.#lt = {
							scale: Number(e >> 32n) / 1e3 || 1,
							shift: BigInt(BigInt.asIntN(32, e & 4294967295n)),
						}),
						this.#lt
					);
				}
				#lt = null;
				#ut() {
					return (this.#dt ??= BigInt(this.#Ce?.k_mono_held?.(0n) ?? 0n));
				}
				#dt = null;
				#ft(e) {
					let t = this.#ct(),
						n =
							e -
							BigInt(this.#Ce?.k_boot_secs?.(0) ?? 0) * 1000000000n -
							this.#ut();
					return t.scale === 1 ? n : BigInt(Math.floor(Number(n) * t.scale));
				}
				kernelStacks() {
					let e = this.#Ce;
					return e?.k_stack_area
						? {
								area: e.k_stack_area() >>> 0,
								size: e.k_stack_size() >>> 0,
								count: e.k_stack_count() >>> 0,
								...(e.k_snap_word
									? {
											snapWord: e.k_snap_word() >>> 0,
											wsAddr: e.k_ws_addr(0) >>> 0,
											wsCount: e.k_ws_count() >>> 0,
										}
									: {}),
								...(e.k_mono_held_at
									? { monoHeld: e.k_mono_held_at() >>> 0 }
									: {}),
								...(e.k_snap_extents_at
									? { extents: e.k_snap_extents_at() >>> 0 }
									: {}),
							}
						: null;
				}
				#pt() {
					if (this.#xe || !L(`debug`)) return;
					let e = this.#t?.exports;
					if (!e?.gex_wait_census) return;
					let t = ``;
					((this.#xe = setInterval(() => {
						if (this.#Te) return;
						let n = e.gex_alloc(512) >>> 0,
							r = e.gex_wait_census(n, 512) >>> 0;
						if (r) {
							let i = z(this.#Ye().slice(n, n + r));
							(i === t &&
								nn(
									`[gex] quiet: ${i}${S.on ? ` js=${this.#Se}/installs=${this.#R}/pending=${e.gex_jit_pending_len() >>> 0}` : ``}`,
								),
								(t = i));
						}
						e.gex_free?.(n, 512);
					}, 3e3)),
						this.#xe.unref?.());
				}
				get kernel() {
					return this.#Ce;
				}
				async #mt(e) {
					let t = this.#t.exports,
						n = this.#Ce;
					if (!n?.k_store_restore_buf || !t.gex_xcache_restore) return;
					n.k_xcache_enable();
					let r = performance.now(),
						i = await Ct(e);
					if (!i) {
						console.log(`[gex] xcache ${e}: nothing saved`);
						return;
					}
					let a = performance.now(),
						o = n.k_store_restore_buf(i.length) >>> 0;
					new Uint8Array(this.#ye.memory.buffer).set(i, o);
					let s = t.gex_xcache_restore(),
						c = performance.now();
					console.log(
						`[gex] xcache ${e}: ${(i.length / 1048576).toFixed(1)} MiB read in ${Math.round(a - r)} ms, restored ${s} modules in ${Math.round(c - a)} ms`,
					);
				}
				async xcacheSave(e, t = 1 << 20, n = void 0, r = 0, i = void 0) {
					let a = this.#Ce;
					if (!(!e || !a?.k_store_save) && !(n && !Dt(n)))
						try {
							for (let o = !1; ; o = !0) {
								let s = performance.now();
								n && Atomics.add(n, 1, 1);
								let c = 0;
								try {
									((c = a.k_store_save(t) >>> 0),
										c && (await this.#ht(e, c, s, r, i)));
								} finally {
									n && Atomics.sub(n, 1, 1);
								}
								if (c || o || !n || !Atomics.load(n, 1)) return;
								for (; Atomics.load(n, 1); ) await Nt(5);
							}
						} finally {
							n && Ot(n);
						}
				}
				async #ht(e, t, n, r, i) {
					let a = this.#Ce;
					try {
						let o = a.k_store_save_ptr() >>> 0,
							s = new Uint8Array(this.#ye.memory.buffer, o, t).slice();
						(a.k_store_save_done(),
							r && (await Nt(r)),
							await wt(String(e), s),
							console.log(
								`[gex] xcache ${e}: saved ${(t / 1048576).toFixed(1)} MiB in ${Math.round(performance.now() - n)} ms${i ? `, pid ${i}` : ``}`,
							));
					} catch (t) {
						(a.k_store_save_done(),
							console.log(`[gex] xcache ${e}: not saved: ${t?.message ?? t}`));
					}
				}
				#gt(e) {
					let t = this.#Ce,
						n = () => 0,
						r = WebAssembly.Module.imports(e)
							.filter((e) => e.module === `gex_k` && e.kind === `function`)
							.map((e) => e.name),
						i = new Set([
							`k_inet_op`,
							`k_wait`,
							`k_take_signals`,
							`k_take_kill_signals`,
							`k_take_thread_signal`,
							`k_tty_winsize`,
						]),
						a = { k_present: () => +!!t };
					for (let e of r)
						if (!(e in a)) {
							if (t) {
								if (typeof t[e] != `function`)
									throw Error(
										`the global kernel has no ${e}: it is older than this glue. Rebuild it with shims/kernel/build.sh.`,
									);
								a[e] = t[e];
							} else a[e] = i.has(e) ? () => 0n : n;
						}
					if ((t || (a.k_halt_code = () => -1), t && S.on)) {
						let e = () => {
								throw Error(
									`gex (single-thread build): a blocking call inside a nested guest call (${this.#ki.join(` > `)}) cannot suspend`,
								);
							},
							n = () => new Int32Array(this.#ye.memory.buffer);
						((a.k_ws_park = new WebAssembly.Suspending((r, i, a) =>
							t.k_ws_seq(r) === i
								? (this.#ra() && e(),
									(this.#Se = `park(${a})`),
									D.parkSlot(n, (t.k_ws_addr(r) >>> 0) >>> 2, i, a, this.#be))
								: 1,
						)),
							(a.k_wq_notify = (e) => {
								(t.k_wq_notify(e), D.checkSlots());
							}),
							(a.k_futex_wake = (e) => {
								(t.k_futex_wake(e), D.checkSlots());
							}),
							(a.k_wq_release = () => {
								(t.k_wq_release(), D.checkSlots());
							}));
					}
					return a;
				}
				#_t(e) {
					let t = bn(e);
					if (!t || !t.length) return;
					let n = this.#t.exports.gex_alloc(t.length) >>> 0;
					(this.#Ye().set(t, n), this.#t.exports.gex_set_metadata(n, t.length));
				}
				#vt() {
					let e = this.#t.exports;
					if (!e.gex_page_count) return [];
					let t = e.gex_page_count() >>> 0;
					if (!t) return [];
					let n = e.gex_alloc(t * 12) >>> 0,
						r = e.gex_page_dump(n, t * 12),
						i = r > 0 ? this.#Ye().slice(n, n + r * 12) : new Uint8Array();
					return (e.gex_free?.(n, t * 12), i);
				}
				#yt() {
					let e = this.#t.exports;
					if (!e.gex_shared_count) return [];
					let t = e.gex_shared_count() >>> 0;
					if (!t) return [];
					let n = e.gex_alloc(t * 20) >>> 0,
						r = e.gex_shared_dump(n, t * 20),
						i = r > 0 ? this.#Ye().slice(n, n + r * 20) : new Uint8Array();
					return (e.gex_free?.(n, t * 20), i);
				}
				#bt(e, t) {
					let n = this.#t.exports,
						r = Math.max(1, e.length),
						i = n.gex_alloc(r) >>> 0;
					this.#Ye().set(e, i);
					try {
						return t(i, e.length);
					} finally {
						n.gex_free?.(i, r);
					}
				}
				async #xt(e, t, n, r) {
					((this.#de = 0), (this.#pe = n.wasmImage ?? null));
					let i = this.#et;
					(await this.attach(e, t),
						xn(`[pool] pid ${n.pid}: ${i ? `pooled runtime` : `new runtime`}`));
					let a = this.#t.exports;
					this.#_t(t);
					let o = n.opts ?? {},
						s = o.uid ?? n.uid;
					(s !== void 0 && a.gex_set_identity(s, o.gid ?? n.gid ?? s),
						n.cwd && this.#bt(new TextEncoder().encode(n.cwd), a.gex_set_cwd),
						n.state?.length && this.#bt(n.state, a.gex_set_child_state),
						a.gex_adopt_child(n.pid, n.ctx, 0n, 0n, 0n, 0n));
					let c =
						o.dense !== !1 && !!this.#n.exports.blocks && !!a.gex_set_dense;
					return (
						(this.#B = c),
						(o.dense = c ? (o.dense === 2 ? 2 : 1) : !1),
						a.gex_set_dense?.(Yt(o, this.#B)),
						En && a.gex_test_keep_probe?.(1),
						this.#io(),
						(this.#_e = o),
						an(a),
						this.#Ct(a, o, n.pid),
						n.fds?.length && this.#bt(n.fds, a.gex_adopt_fds),
						(this.#He = r?.closure ?? this.#He),
						(this.#Ue = r?.wantLibrary ?? this.#Ue),
						await this.#Qe(),
						this.#bt(n.exec, a.gex_adopted_exec)
					);
				}
				#St(e, t) {
					!t.fjit ||
						!e.gex_set_fjit ||
						(e.gex_set_fjit(t.fjit === 2 ? 2 : 1),
						(t.fjitMax != null || t.fjitOnly) &&
							e.gex_fjit_limit?.(
								t.fjitMax ?? 4294967295,
								BigInt(t.fjitOnly ?? 0),
							),
						this.#Ht & 3 || this.useCgen(this.#Ht | 1));
				}
				#Ct(e, t, n) {
					(this.#St(e, t),
						(t.strace || (t.stracePid && t.stracePid === n)) &&
							(e.gex_set_trace(1), (this.#p = !0)),
						t.traceBlocks && e.gex_set_trace_blocks?.(1),
						t.watchMem && e.gex_set_watch_mem?.(BigInt(t.watchMem)),
						t.traceMisses && e.gex_set_trace_misses?.(1),
						t.dlChecked && e.gex_set_dl_checked?.(1),
						t.jitDiag && e.gex_set_jit_diag?.(1),
						t.checkSp && e.gex_set_check_sp?.(1),
						t.noIntrinsics && e.gex_set_intrinsics?.(0),
						t.intrinsicMask !== void 0 &&
							e.gex_set_intrinsic_mask?.(t.intrinsicMask),
						t.liftMax && e.gex_set_lift_max?.(t.liftMax),
						t.inlineDispatch && e.gex_set_inline_dispatch?.(1),
						t.xlateReport && e.gex_set_xlate_report?.(t.xlateReport),
						t.discoverSkip && e.gex_set_discover_skip?.(t.discoverSkip),
						t.t1Fold && e.gex_set_t1_fold?.(1),
						t.tty && e.gex_set_tty(1));
				}
				async adoptProcess(e, t, n, r = {}) {
					if (n.exec) return this.#xt(e, t, n, r);
					let i = performance.now(),
						a = i,
						o =
							globalThis.GEX_DEBUG_EXIT || globalThis.GEX_ADOPT_TRACE
								? (e) => {
										let t = performance.now();
										(console.error(
											`[gex] adopt ${n.pid}: ${e} (+${Math.round(t - a)}ms, ${Math.round(t - i)}ms in)`,
										),
											(a = t));
									}
								: () => {};
					(o(`copying the image`),
						this.#Ve(
							n.image.reduce(
								(e, t) => Math.max(e, t.end ?? 0, t.at + ln(t)),
								0,
							),
						));
					let s = n.imageStage > 0 ? n.imageStage : 0;
					s && (await this.#st());
					let c = this.#Ye(),
						l =
							typeof globalThis.GEX_FORK_SKIP_MIB == `number`
								? globalThis.GEX_FORK_SKIP_MIB * (1 << 20)
								: 1 / 0,
						u = 0,
						d = 0,
						f = 0;
					for (let e of n.image) {
						let t = ln(e);
						if (t > l) {
							d += t;
							continue;
						}
						if (((f += e.zeros ?? 0), e.stage !== void 0)) {
							if (this.#Ce.k_stage_push(s, e.stage, BigInt(e.at), t) !== 0)
								throw Error(
									`fork image: staged run at 0x${e.at.toString(16)} (${t} bytes) did not copy`,
								);
							u += t;
							continue;
						}
						if (e.dense) {
							(c.set(new Uint8Array(e.bytes), e.at), (u += t));
							continue;
						}
						let [n, r] = on(c, new Uint8Array(e.bytes), e.at);
						((u += n), (f += r));
					}
					if (
						(s && this.#Ce.k_stage_drop(s),
						(this.#ce = u),
						(this.#le = d),
						(this.#ue = f),
						globalThis.GEX_DEBUG_EXIT && n.image?.[0]?.sum !== void 0)
					) {
						let e = 0;
						for (let t of n.image) {
							let n = t.at + t.bytes.byteLength;
							un(c.subarray(t.at, n)) !== t.sum &&
								(e++,
								console.error(
									`[adopt] on arrival, region ${t.at.toString(16)}..${n.toString(16)} (${t.prot ?? `-`}) is not what the parent sent`,
								));
						}
						o(e ? `${e} regions arrived wrong` : `image arrived intact`);
					}
					let p = () => {
						let e = 0,
							t = Number(n.ctx);
						for (let n = t; n < t + 512; n++) c[n] && e++;
						return e;
					};
					(o(`image copied, ${p()} non-zero bytes in the context`),
						(this.#de = n.windowsSpace ?? 0),
						(this.#pe = n.placeWindow === 0 ? [0, 0] : null),
						(this.#Oe = !0),
						(this.#ke = n.image.map((e) => [
							e.at,
							Math.max(e.end ?? 0, e.at + ln(e)),
						])),
						await this.attach(e, t),
						o(`instantiated, ${p()} non-zero bytes in the context`));
					let m = this.#t.exports;
					((globalThis.GEX_TEST_FORK_REBASE || {}.GEX_TEST_FORK_REBASE) &&
						m.gex_test_fork_rebase?.(1),
						this.#_t(t),
						en() > 0 &&
							m.gex_reset_directory &&
							o(
								`directory rebuilt: ${m.gex_reset_directory() >>> 0} entries kept`,
							));
					{
						let e = n.opts ?? {},
							t = e.uid ?? n.uid;
						t !== void 0 && m.gex_set_identity(t, e.gid ?? n.gid ?? t);
					}
					if (n.exe && m.gex_set_child_exe) {
						let e = new TextEncoder().encode(n.exe),
							t = m.gex_alloc(Math.max(1, e.length)) >>> 0;
						(this.#Ye().set(e, t),
							m.gex_set_child_exe(t, e.length),
							m.gex_free?.(t, Math.max(1, e.length)));
					}
					if (n.cwd && m.gex_set_cwd) {
						let e = new TextEncoder().encode(n.cwd),
							t = m.gex_alloc(e.length) >>> 0;
						(this.#Ye().set(e, t),
							m.gex_set_cwd(t, e.length),
							m.gex_free?.(t, e.length));
					}
					n.state?.length &&
						m.gex_set_child_state &&
						this.#bt(n.state, m.gex_set_child_state);
					let h = m.gex_adopt_child(
						n.pid,
						n.ctx,
						n.pc,
						n.sp,
						n.tls,
						n.brk ?? 0n,
					);
					if (
						(n.compat && m.gex_set_compat?.(1),
						(this.#ai = m.gex_exec_gen?.() ?? 0),
						n.wasm32)
					) {
						if (n.wasm32Link && m.gex_wasmprog_adopt_link) {
							n.dlTls?.length && (this.#Qn = new Map(n.dlTls));
							let e = new TextEncoder().encode(n.wasm32Link),
								t = m.gex_alloc(e.length) >>> 0;
							(this.#Ye().set(e, t),
								m.gex_wasmprog_adopt_link(t, e.length),
								m.gex_free?.(t, e.length));
						}
						n.wasm32Base && m.gex_wasmprog_adopt_at
							? m.gex_wasmprog_adopt_at(BigInt(n.wasm32), n.wasm32Base)
							: m.gex_wasmprog_adopt?.(BigInt(n.wasm32));
					}
					((this.#B =
						!!(n.opts ?? {}).dense &&
						!!this.#n.exports.blocks &&
						!!m.gex_set_dense),
						m.gex_set_dense?.(Yt(n.opts, this.#B)),
						En && m.gex_test_keep_probe?.(1),
						this.#io(),
						o(
							`kernel built, entry 0x${h.toString(16)}, ${p()} non-zero bytes in the context`,
						));
					let g = n.opts ?? {};
					((this.#_e = g), an(m), this.#Ct(m, g, n.pid));
					let _ = n.vmaBlob;
					if (_ && m.gex_adopt_vma_blob) {
						let e = m.gex_alloc(_.length) >>> 0;
						(new Uint8Array(this.#e.buffer, e, _.length).set(_),
							m.gex_adopt_vma_blob(e, _.length),
							m.gex_free?.(e, _.length));
					} else
						for (let e of n.image)
							e.end !== void 0 &&
								m.gex_adopt_vma(BigInt(e.at), BigInt(e.end), e.prot);
					if (
						(o(`${n.image.length} regions mapped`),
						n.pages?.length && m.gex_adopt_page)
					) {
						let e = new DataView(
							n.pages.buffer,
							n.pages.byteOffset,
							n.pages.byteLength,
						);
						for (let t = 0; t + 12 <= n.pages.byteLength; t += 12)
							m.gex_adopt_page(e.getBigUint64(t, !0), e.getUint32(t + 8, !0));
					}
					if (n.shared?.length && m.gex_shared_seed) {
						let e = (n.shared.byteLength / 20) | 0,
							t = m.gex_alloc(e * 20) >>> 0;
						(this.#Ye().set(n.shared.subarray(0, e * 20), t),
							m.gex_shared_seed(t, e),
							m.gex_free?.(t, e * 20));
					}
					if (
						(o(`pages adopted`),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[heap] debug=${!!globalThis.GEX_DEBUG_EXIT} api=${typeof performance.measureUserAgentSpecificMemory} isolated=${globalThis.crossOriginIsolated} used=${performance.memory?.usedJSHeapSize ?? `n/a`} limit=${performance.memory?.jsHeapSizeLimit ?? `n/a`} image=${(n.image ?? []).reduce((e, t) => e + ln(t), 0)} modules=${(n.modules ?? []).length}`,
							),
						globalThis.GEX_DEBUG_EXIT &&
							performance.measureUserAgentSpecificMemory)
					) {
						let e = (n.image ?? []).reduce(
							(e, t) => e + (t.bytes?.byteLength ?? 0),
							0,
						);
						performance
							.measureUserAgentSpecificMemory()
							.then((t) => {
								let r = {};
								for (let e of t.breakdown ?? []) {
									if (!e.bytes) continue;
									let t = (e.types ?? []).join(`+`) || `other`;
									r[t] = (r[t] ?? 0) + e.bytes;
								}
								let i = Object.entries(r)
									.sort((e, t) => t[1] - e[1])
									.slice(0, 6)
									.map(([e, t]) => `${e}=${t}`)
									.join(` `);
								console.error(
									`[heap] pid ${this.#r.pid ?? `?`}: total ${t.bytes} image ${e} modules ${(n.modules ?? []).length} | ${i}`,
								);
							})
							.catch((e) =>
								console.error(`[heap] measure failed: ${e.message}`),
							);
					}
					if (n.fds?.length && m.gex_adopt_fds) {
						let e = m.gex_alloc(n.fds.length) >>> 0;
						(this.#Ye().set(n.fds, e),
							m.gex_adopt_fds(e, n.fds.length),
							m.gex_free?.(e, n.fds.length));
					}
					((this.#He = r?.closure ?? this.#He),
						(this.#Ue = r?.wantLibrary ?? this.#Ue),
						await this.#Qe());
					let v = 0;
					if (en() <= 0) {
						for (let e of n.modules ?? []) v = Math.max(v, e.need);
						v = Math.max(v, (n.slots ?? 0) >>> 0);
					}
					if (
						(v && this.#wi(v, `a1806`), (this.#me = n.modules ?? []), en() <= 0)
					) {
						o(`installing ${this.#me.length} modules`);
						let e = this.#me;
						this.#me = [];
						for (let t of e) await this.#Ze(t);
					} else o(`${this.#me.length} modules reachable, ${v} slots`);
					if (globalThis.GEX_DEBUG_EXIT && n.image?.[0]?.sum !== void 0) {
						let e = this.#Ye(),
							t = 0;
						for (let r of n.image) {
							let n = r.at + r.bytes.byteLength;
							un(e.subarray(r.at, n)) !== r.sum &&
								t++ < 8 &&
								console.error(
									`[adopt] region ${r.at.toString(16)}..${n.toString(16)} (${r.prot ?? `-`}) is not what the parent sent`,
								);
						}
						o(
							t ? `${t} of ${n.image.length} regions differ` : `image verified`,
						);
					}
					return (o(`running`), h);
				}
				async #wt() {
					let e = this.#Et();
					e && (await this.#Dt(e));
				}
				#Tt(e = `gex`) {
					let t,
						n = (t) => {
							Jt(e, t);
							try {
								this.#t?.exports?.gex_worker_promise_done?.();
							} catch {}
						};
					try {
						t = this.#Et();
					} catch (e) {
						n(e);
						return;
					}
					t && this.#Dt(t).catch(n);
				}
				#Et() {
					let e = this.#t.exports;
					if (!e.gex_thread_pending) return null;
					let t = e.gex_thread_pending();
					if (!t) return null;
					this.#fa ??= Gt();
					let n = {
						tid: t,
						ctx: e.gex_thread_ctx(),
						pc: e.gex_thread_pc(),
						memory: this.#e,
						moduleStore: this.#fa ?? void 0,
						compat: e.gex_compat?.() ?? 0,
						procOpts: this.#_e,
						execGen: e.gex_exec_gen?.() ?? 0,
					};
					if (
						(globalThis.GEX_ATTACH_TRACE &&
							console.error(
								`[spawn] #drainThread posting tid ${t} (t=${Date.now()})`,
							),
						e.gex_thread_taken(),
						!Wt(this.#e?.buffer) && !S.on)
					)
						throw Error(
							`the guest started thread ${t} on a memory that is not shared. A guest thread is a Worker and a Worker needs a SharedArrayBuffer: serve the page with COOP/COEP and load the shared build.`,
						);
					if (
						(globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[gex] thread -> tid ${n.tid} pc=0x${n.pc.toString(16)} ctx=0x${n.ctx.toString(16)}`,
							),
						typeof this.#r.spawnThread != `function`)
					)
						throw Error(
							`the guest started thread ${t} and this environment cannot run one. Give the Env a \`spawnThread\`, or the thread will never run.`,
						);
					return n;
				}
				async #Dt(e) {
					(this.#Qt(), await this.#r.spawnThread(e));
				}
				async adoptThread(e, t, n) {
					if (
						(this.#Qt(),
						(this.#Ee = !n.spare),
						await this.attach(e, t, { devices: !1 }),
						n.spare)
					) {
						let e = this.#t.exports.gex_exec_gen?.() ?? 0;
						((this.#ii = !0), await this.#Rt(), this.#Mn());
						let t = R(`spare`);
						t &&
							console.warn(
								`[spare] pid ${this.#t.exports.gex_my_pid?.() ?? `?`}: caught up with ${this.#Gt?.dyl.size ?? 0} modules, waiting`,
							);
						let r,
							i = n.spareGo().then((e) => {
								r = e ?? !1;
							});
						for (
							let n = Rn;
							r === void 0 &&
							(await Promise.race([i, new Promise((e) => setTimeout(e, n))]),
							r === void 0);
						) {
							let r = this.#Gt?.have ?? 0;
							(this.#t.exports.gex_exec_gen?.() ?? 0) === e &&
								!this.#t.exports.gex_exited?.() &&
								this.#t.exports.gex_ftab_log_len?.() >>> 0 > r &&
								this.#Mn();
							let i = this.#Gt?.have ?? 0;
							(i !== r &&
								t &&
								console.warn(
									`[spare] pid ${this.#t.exports.gex_my_pid?.() ?? `?`}: caught up with ${this.#Gt?.dyl.size ?? 0} modules while waiting`,
								),
								(n = i === r ? Math.min(2 * n, zn) : Rn));
						}
						if (((this.#ii = !1), !r?.tid))
							return (
								(this.#t.exports.gex_exec_gen?.() ?? 0) === e &&
									!this.#t.exports.gex_exited?.() &&
									this.freeThreadTls(),
								{ entry: 0n, ctx: 0, gone: !0 }
							);
						(Object.assign(n, r), (this.#Ee = !0), this.keepPromise());
						let a = this.#Gt?.dyl.size ?? 0;
						if (t) {
							let e = performance.now();
							n.spareSaid = () =>
								console.warn(
									`[spare] tid ${n.tid}: adopted, ${(this.#Gt?.dyl.size ?? 0) - a} modules more, in ${(performance.now() - e).toFixed(1)} ms`,
								);
						}
					}
					this.#Ka = n.tid;
					let r = (e) => {
						globalThis.GEX_ATTACH_TRACE && console.error(`[thr ${n.tid}] ${e}`);
					};
					r(`attached, adopting`);
					let i = this.#t.exports.gex_adopt_thread(n.tid);
					return (
						(this.adoptGen = this.#t.exports.gex_exec_gen?.() ?? 0),
						i
							? (n.procOpts && (this.#_e = n.procOpts),
								r(
									`adopted, catchUp (${this.#t.exports.gex_module_count?.() >>> 0} modules)`,
								),
								await this.#Rt(),
								this.#Mn(),
								n.spareSaid?.(),
								{ entry: i, ctx: Number(n.ctx) })
							: { entry: 0n, ctx: Number(n.ctx), gone: !0 }
					);
				}
				async snapThread(e, t, n) {
					(this.#Qt(),
						(this.#Ka = n.tid),
						(this.#Ee = !1),
						n.snapReset && (this.#Oe = !0),
						await this.attach(e, t, { devices: !1 }));
					let r = this.#t.exports,
						i = r.gex_snap_thread(n.tid, BigInt(n.snap.pc), BigInt(n.snap.sp));
					if (!i) throw Error(`snapshot: process has no thread ${n.tid}`);
					return (
						n.procOpts && (this.#_e = n.procOpts),
						await this.#Rt(),
						this.#Mn(),
						n.snap.door !== void 0 && this.#Fr(n.snap.door >>> 0),
						{ entry: i, ctx: Number(r.gex_snap_ctx()) }
					);
				}
				snapRelease() {
					let e = this.#ye?.memory,
						t = this.#Ce;
					if (e && t?.k_snap_word) {
						let n = new Int32Array(e.buffer),
							r = (t.k_snap_word() >>> 0) >>> 2;
						for (; Atomics.load(n, r) !== 0; )
							Atomics.wait(n, r, Atomics.load(n, r), 1e3);
					}
					((this.#dt = null), this.#t.exports.gex_snap_clock?.());
				}
				#Ot() {
					let e = this.#t.exports,
						t = {
							shimSp: e.__stack_pointer.value,
							progSp: this.#In?.value,
							async: this.#qn?.map((e) => e.value),
							muts: this.#Jn.map((e) => e.value),
						},
						n = performance.now(),
						r = e.gex_vfork_begin();
					if (!r) return !1;
					let i = e.gex_vfork_pid(),
						a = Number(e.gex_fork_ctx()),
						o = `exit`,
						s = null;
					(this.#Er++, e.gex_snap_enable?.(0));
					try {
						this.#n.exports.enter(a, r);
					} catch (t) {
						if (!e.gex_handoff?.()) ((o = `crash`), (s = t));
						else {
							let t = e.gex_vfork_why();
							o = t === 2 ? `exec` : t === 3 ? `crash` : `exit`;
						}
					}
					(--this.#Er === 0 && this.#wr && e.gex_snap_enable?.(1),
						(e.__stack_pointer.value = t.shimSp),
						o === `exit` &&
							!e.gex_exited?.() &&
							((o = `crash`), (s = Error(`its frames ended without an exit`))));
					let c = null;
					if (o === `exec`)
						((c = this.#Mt(i, a, performance.now() - n)),
							e.gex_vfork_exec_done());
					else if (o === `crash`) {
						s &&
							console.error(
								`[gex] pid ${i} (posix_spawn's child) crashed: ${s?.message ?? s}`,
							);
						try {
							e.gex_process_gone?.(137);
						} catch {}
					}
					return (
						e.gex_vfork_end(),
						this.#In && t.progSp !== void 0 && (this.#In.value = t.progSp),
						t.async?.forEach((e, t) => {
							this.#qn[t].value = e;
						}),
						t.muts.forEach((e, t) => {
							this.#Jn[t].value = e;
						}),
						c &&
							this.#r
								.spawnProcess(c)
								.catch((e) =>
									console.error(
										`[gex] starting pid ${i} after its exec: ${e.message ?? e}`,
									),
								),
						this.#Ft++,
						xn(
							`[vfork] pid ${i}: ${o} after ${(performance.now() - n).toFixed(1)}ms`,
						),
						!0
					);
				}
				#kt = [];
				#At() {
					let e = this.#t.exports,
						t = performance.now(),
						n = e.gex_vfork_begin();
					if (!n) return null;
					let r = Number(e.gex_fork_ctx());
					return (
						this.#kt.push({ t0: t, pid: e.gex_vfork_pid(), ctx: r }),
						{ pc: n, ctx: r }
					);
				}
				#jt(e) {
					let t = this.#t.exports,
						{ t0: n, pid: r, ctx: i } = this.#kt.at(-1),
						a = t.gex_vfork_why(),
						o = e ? `crash` : a === 2 ? `exec` : a === 3 ? `crash` : `exit`,
						s = null;
					if (o === `exec`)
						((s = this.#Mt(r, i, performance.now() - n)),
							t.gex_vfork_exec_done());
					else if (o === `crash`) {
						e &&
							console.error(
								`[gex] pid ${r} (posix_spawn's child) crashed: ${e?.message ?? e}`,
							);
						try {
							t.gex_process_gone?.(137);
						} catch {}
					}
					let c = t.gex_vfork_end();
					return (
						this.#kt.pop(),
						s &&
							this.#r
								.spawnProcess(s)
								.catch((e) =>
									console.error(
										`[gex] starting pid ${r} after its exec: ${e.message ?? e}`,
									),
								),
						this.#Ft++,
						xn(
							`[vfork] pid ${r}: ${o} after ${(performance.now() - n).toFixed(1)}ms`,
						),
						{ pc: c, ctx: i }
					);
				}
				execAwayRecord() {
					let e = this.#t.exports;
					if (!e.gex_exec_away?.()) return null;
					let t = this.#Mt(e.gex_exec_away_of(0), e.gex_exec_away_of(1), 0);
					return ((t.vforkMs = void 0), e.gex_vfork_exec_done(), t);
				}
				#Mt(e, t, n) {
					let r = this.#t.exports,
						i = (e) => {
							let t = r.gex_vfork_exec_ptr(e) >>> 0;
							return this.#Ye().slice(t, t + (r.gex_vfork_exec_len(e) >>> 0));
						};
					return {
						pid: e,
						ctx: BigInt(t),
						pc: 0n,
						sp: 0n,
						tls: 0n,
						compat: 0,
						wasm32: 0n,
						brk: 0n,
						windowsSpace: 0,
						image: [],
						vmaBlob: null,
						slots: 0,
						pages: null,
						shared: null,
						modules: [],
						opts: this.#_e,
						exec: i(0),
						wasmImage: (() => {
							let e = Number(r.gex_vfork_exec_wasm?.(1) ?? 0n);
							return e ? [Number(r.gex_vfork_exec_wasm(0)), e] : null;
						})(),
						fds: i(1),
						cwd: new TextDecoder().decode(i(2)),
						state: i(3),
						exe: null,
						mem64: (() => {
							let e = r.gex_vfork_exec_mem64?.() ?? -1;
							return e < 0 ? void 0 : e === 1;
						})(),
						vforkMs: n,
					};
				}
				#Nt = !1;
				#Pt(e) {
					if ((xn(`[vfork] not here: ${e}`), this.#Nt)) return;
					this.#Nt = !0;
					let t =
						{
							[-1]: `vfork children nest too deep here`,
							[-4]: `inside a provider's call`,
							[-5]: `a Windows process`,
							[-6]: `no global kernel`,
							[-7]: `no fork staged on this Worker`,
						}[e] ?? `code ${e}`;
					console.error(
						`[gex] pid ${this.wlToken()}: a CLONE_VM|CLONE_VFORK child is copied, not run in place (${t}); said once per Worker`,
					);
				}
				#Ft = 0;
				get vforks() {
					return this.#Ft;
				}
				#It() {
					let e = this.#t.exports.gex_fork_pending?.();
					return e ? this.#Lt(e) : null;
				}
				async #Lt(e) {
					let t = this.#t.exports,
						n = {
							pid: e,
							pc: t.gex_fork_pc(),
							ctx: t.gex_fork_ctx(),
							sp: t.gex_fork_sp(),
							tls: t.gex_fork_tls(),
							compat: t.gex_compat?.() ?? 0,
							wasm32: t.gex_wasmprog_entry?.() ?? 0n,
							wasm32Base: t.gex_wasmprog_base?.() ?? 0,
							wasm32Link: this.#Fn(),
							dlTls: this.#ir(),
							brk: t.gex_fork_brk?.() ?? 0n,
							windowsSpace: t.gex_windows_space?.() ?? 0,
							placeWindow: t.gex_place_window?.() ?? 1,
							image: (() => {
								let e = performance.now();
								S.on || t.gex_fork_hold?.();
								let n;
								try {
									n = this.#rt();
								} finally {
									t.gex_fork_release?.();
								}
								return (
									(this.#v = performance.now() - e),
									(this.#y = n.reduce((e, t) => e + ln(t), 0)),
									(this.#b = n.length),
									n
								);
							})(),
							imageStage: this.#nt,
							vmaBlob: this.#it,
							slots: t.gex_jit_slots_total?.() ?? 0,
							pages: this.#vt(),
							shared: this.#yt(),
							modules: [
								...this.#me,
								...this.#q.filter((e) => !e.inst),
								...this.#ve,
							],
							opts: this.#_e,
							fds: t.gex_fork_fds_len
								? this.#Ye().slice(
										t.gex_fork_fds_ptr() >>> 0,
										(t.gex_fork_fds_ptr() >>> 0) + (t.gex_fork_fds_len() >>> 0),
									)
								: null,
							state: t.gex_fork_state_len?.()
								? this.#Ye().slice(
										t.gex_fork_state_ptr() >>> 0,
										(t.gex_fork_state_ptr() >>> 0) +
											(t.gex_fork_state_len() >>> 0),
									)
								: null,
							exe:
								t.gex_fork_exe_len && t.gex_fork_exe_len() > 0
									? new TextDecoder().decode(
											this.#Ye().slice(
												t.gex_fork_exe_ptr() >>> 0,
												(t.gex_fork_exe_ptr() >>> 0) +
													(t.gex_fork_exe_len() >>> 0),
											),
										)
									: null,
							cwd:
								t.gex_fork_cwd_len && t.gex_fork_cwd_len() > 0
									? new TextDecoder().decode(
											this.#Ye().slice(
												t.gex_fork_cwd_ptr() >>> 0,
												(t.gex_fork_cwd_ptr() >>> 0) +
													(t.gex_fork_cwd_len() >>> 0),
											),
										)
									: null,
						};
					if (
						((n.forkCost = {
							buildMs: Math.round(this.#v),
							bytes: this.#y,
							regions: this.#b,
							sentAt: performance.timeOrigin + performance.now(),
						}),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[fork] pid ${n.pid} image ${n.forkCost.bytes} bytes in ${n.forkCost.regions} regions, built in ${n.forkCost.buildMs}ms, ${n.modules.length} modules (${this.#me.length} inherited + ${this.#ve.length} own)`,
							),
						t.gex_fork_taken(),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[gex] fork -> pid ${n.pid} pc=0x${n.pc.toString(16)} ctx=0x${n.ctx.toString(16)} sp=0x${n.sp.toString(16)} ${n.image.length} regions, ${n.modules.length} modules`,
							),
						!this.#r.spawnProcess)
					)
						throw Error(
							`the guest forked pid ${e} and this environment cannot start a process. Give the Env a \`spawnProcess\`, or the child will never run.`,
						);
					await this.#r.spawnProcess(n);
				}
				async #Rt() {
					let e = this.#t.exports;
					if (!e.gex_module_count || (e.gex_has_host && !e.gex_has_host()))
						return;
					let t = e.gex_module_count() >>> 0,
						n = (e.gex_jit_slots_total?.() ?? 0) >>> 0,
						r = globalThis.GEX_ATTACH_TRACE ? performance.now() : 0,
						i = this.#A,
						a = 0,
						o = 0;
					for (; this.#f < t; this.#f++) {
						let e = this.#f;
						if (this.#$a(e)) continue;
						let t = this.#ga(e);
						if (!t) continue;
						let r = this.#ma(e).ptr,
							i = t.length,
							s = this.#pa(e, t),
							c =
								(s ? this.#z.get(s) : void 0) ??
								this.#Ca(this.#ba(t)) ??
								void 0,
							l = `jit2049`;
						(globalThis.GEX_DUMP_WHERE ?? !0) &&
							(l = `jit2049-${e}-at-${r.toString(16)}`);
						try {
							await this.#ka(t, n, 64, null, l, c);
						} catch (n) {
							if (n instanceof WebAssembly.CompileError) {
								let n = this.#Ye().slice(r, r + i),
									a = 0;
								for (let e = 0; e < i; e++) n[e] !== t[e] && a++;
								console.error(
									`[gex] module ${e} at 0x${r.toString(16)}+0x${i.toString(16)}: ${a} bytes differ from the copy compiled`,
								);
							}
							throw n;
						}
						if (c) {
							o++;
							continue;
						}
						let u = this.#ve[this.#ve.length - 1]?.mod;
						(u &&
							s &&
							(this.#z.set(s, u), this.#to.delete(s), this.#Xa(e, s, u)),
							a++);
					}
					if (
						(globalThis.GEX_ATTACH_TRACE &&
							(a || o) &&
							console.error(
								`[catchup] installed ${a + o} modules in ${Math.round(performance.now() - r)}ms (${Math.round(this.#A - i)}ms compile, ${o} reused from siblings)`,
							),
						globalThis.GEX_FILL_TIME)
					) {
						let e =
							this.#Bt < 0 ? (this.#Bt = performance.now() - this.#zt) : -1;
						console.warn(
							`[gex] ${this.#qa()}: caught up, ${this.#Ja()}${e >= 0 ? `, started in ${e.toFixed(1)} ms` : ``}`,
						);
					}
				}
				#zt = performance.now();
				#Bt = -1;
				dropSharedModules(e) {
					for (let t of e ?? [])
						typeof t == `string` && (this.#z.delete(t), this.#to.add(t));
				}
				addSharedModule(e, t) {
					typeof e == `string` &&
						t instanceof WebAssembly.Module &&
						!this.#z.has(e) &&
						!this.#to.has(e) &&
						this.#z.set(e, t);
				}
				pushStdin(e) {
					let t = this.#t.exports.gex_alloc(e.length) >>> 0;
					(this.#Ye().set(e, t),
						this.#t.exports.gex_push_stdin(t, e.length),
						this.#t.exports.gex_free(t, e.length));
				}
				endStdin() {
					this.#t.exports.gex_stdin_eof();
				}
				useNetwork(e, { shared: t = !1 } = {}) {
					if (((this.#o = e), (this.#s = !!(e && t)), e && `onActivity` in e)) {
						let t = e.onActivity;
						e.onActivity = (...n) => {
							t?.apply(e, n);
							let r = this.#Fe;
							((this.#Fe = null), r?.());
						};
					}
					this.#t?.exports?.gex_set_network?.(+!!e);
				}
				#Vt = (e) => this.#t?.exports?.gex_gl_note_wait_ns?.(e * 1e6);
				useCgen(e) {
					((this.#Ht = e >>> 0),
						this.#t && this.#t.exports.gex_cgen_set_mode?.(this.#Ht));
				}
				#Ht = 0;
				#Ut() {
					let t = this.#t.exports;
					if (
						(globalThis.GEX_STRAY_TRAP && t.gex_set_stray_trap?.(1),
						e.identities && t.gex_cgen_identities)
					) {
						let n = new TextEncoder().encode(e.identities),
							r = t.gex_alloc(Math.max(8, n.length)) >>> 0;
						(this.#Ye().set(n, r),
							t.gex_cgen_identities(r, n.length),
							t.gex_free?.(r, Math.max(8, n.length)));
					}
					if (e.fjitLibs && t.gex_fjit_libs) {
						let n = new TextEncoder().encode(e.fjitLibs),
							r = t.gex_alloc(Math.max(8, n.length)) >>> 0;
						(this.#Ye().set(n, r),
							t.gex_fjit_libs(r, n.length),
							t.gex_free?.(r, Math.max(8, n.length)));
					}
					for (let [n, r] of [
						[e.providerSources, t.gex_provider_sources],
						[e.stateful, t.gex_cgen_stateful],
					]) {
						if (!n || !r) continue;
						let e = new TextEncoder().encode(n),
							i = t.gex_alloc(Math.max(8, e.length)) >>> 0;
						(this.#Ye().set(e, i),
							r(i, e.length),
							t.gex_free?.(i, Math.max(8, e.length)));
					}
					if (e.providerSkip && t.gex_provider_skip) {
						let n = new TextEncoder().encode(e.providerSkip),
							r = t.gex_alloc(Math.max(8, n.length)) >>> 0;
						(this.#Ye().set(n, r),
							t.gex_provider_skip(r, n.length),
							t.gex_free?.(r, Math.max(8, n.length)));
					}
					if (e.elfUnits && t.gex_cgen_elf_units) {
						let n = new TextEncoder().encode(e.elfUnits),
							r = t.gex_alloc(Math.max(8, n.length)) >>> 0;
						(this.#Ye().set(n, r),
							t.gex_cgen_elf_units(r, n.length),
							t.gex_free?.(r, Math.max(8, n.length)));
					}
					if (!e.wasmDlls || !t.gex_libprov_config) return;
					let n = new TextEncoder().encode(e.wasmDlls),
						r = t.gex_alloc(Math.max(8, n.length)) >>> 0;
					(this.#Ye().set(n, r),
						t.gex_libprov_config(r, n.length),
						t.gex_free?.(r, Math.max(8, n.length)));
				}
				noElfProviders() {
					((this.#Wt = !0), this.#t?.exports.gex_elfprov_off?.());
				}
				#Wt = !1;
				#Gt = null;
				#Kt(e, t) {
					let n = this.#t.exports,
						r = 1024,
						i = n.gex_alloc(r) >>> 0;
					try {
						let n = Math.min(e(t, i, r) >>> 0, r);
						return new TextDecoder().decode(this.#Ye().slice(i, i + n));
					} finally {
						n.gex_free?.(i, r);
					}
				}
				#qt(e, t = null) {
					let n = `cgen:${e}`,
						r = this.#z.get(n);
					if (r) return (this.#gi.delete(e), r);
					let i = performance.now();
					if (
						((t ??= this.#gi.get(e) ?? {
							wasm: this.#r.loadFile?.(`${e}/c.wasm`) ?? null,
						}),
						this.#gi.delete(e),
						!t?.wasm)
					)
						throw Error(
							`gex-cgen: unit ${e} was published but cannot be loaded here`,
						);
					let a = performance.now();
					return (
						(r =
							t.wasm instanceof WebAssembly.Module
								? t.wasm
								: new WebAssembly.Module(t.wasm)),
						(this.#A += performance.now() - a),
						L(`unit`) &&
							console.warn(
								`[unit] ${e.slice(0, 16)} ${((t.wasm.byteLength ?? 0) / 1048576).toFixed(1)} MiB: load ${Math.round(a - i)} ms, compile ${Math.round(performance.now() - a)} ms, at ${Math.round(performance.timeOrigin + performance.now()) % 1e7}`,
							),
						this.#z.set(n, r),
						this.#Za(n, r, t.wasm.byteLength ?? 1 / 0),
						r
					);
				}
				#Jt() {
					if (this.#Gt) return this.#Gt;
					let e = this.#t.exports,
						t = this.#po(),
						n = e.gex_ftab_runtime_ptr() >>> 0,
						r = this.#Ye().slice(n, n + (e.gex_ftab_runtime_len() >>> 0)),
						i = `ftab-runtime:${qt(r)}`,
						a = this.#z.get(i);
					a || ((a = new WebAssembly.Module(r)), this.#z.set(i, a));
					let o = new WebAssembly.Table(
							B()
								? { element: `anyfunc`, address: `i64`, initial: 0n }
								: { element: `anyfunc`, initial: 0 },
						),
						s = (t, n) => {
							e.gex_ftab_behind() && this.#Mn();
							let r = e.gex_ftab_lookup(t, n);
							return (
								e.gex_ftab_behind() && this.#Mn(),
								this.#tn.length && this.#rn(Number(r)),
								r
							);
						},
						c = {
							memory: this.#e,
							ftab: o,
							lookup: s,
							safepoint: this.#a.safepoint,
							cache_op: this.#a.cache_op,
							dispatch_miss: this.#a.dispatch_miss,
						};
					for (let e = 0; e < Ir.length; e++)
						c[Ir[e]] =
							t[e] ?? new WebAssembly.Table({ element: `anyfunc`, initial: 0 });
					this.#B && (c.blocks = this.#n.exports.blocks);
					let l = new WebAssembly.Instance(a, { gex: c }),
						u = R(`bridges`) ? this.#oo(l.exports.bridge) : l.exports.bridge;
					return (
						(this.#Gt = {
							ftab: o,
							resolve: l.exports.resolve,
							bridge: u,
							lookup: s,
							have: 0,
							instances: [l],
							dyl: new Map(),
							dlTls: new Map(),
						}),
						this.#Hn(),
						this.#Yt(),
						o.set(Nn(1), e.gex_ftab_fallback),
						this.#Gt
					);
				}
				#Yt() {
					let e = this.#Gt,
						t = this.#t.exports,
						n = t.gex_ftab_size() >>> 0;
					for (;;) {
						let r = n + this.#Zt,
							i = Number(e.ftab.length);
						if (
							(i < r &&
								(e.ftab.grow(Nn(r - i), e.resolve), this.#fo(`ftab grew`)),
							!t.gex_ftab_enter ||
								((n = t.gex_ftab_enter(Number(e.ftab.length)) >>> 0),
								n <= Number(e.ftab.length)))
						)
							return;
					}
				}
				#Xt() {
					let e = this.#Gt,
						t = this.#t.exports;
					!e ||
						!t.gex_ftab_enter ||
						(t.gex_ftab_enter(Number(e.ftab.length)) >>> 0 >
							Number(e.ftab.length) &&
							this.#Yt());
				}
				#Zt = Dn() || wn;
				#Qt() {
					let e = Dn() || Tn;
					this.#Zt !== e && ((this.#Zt = e), this.#Gt && this.#Yt());
				}
				#$t(e, t, n = !1) {
					let r = this.#t.exports,
						i = this.#Jt(),
						a = e >= 2147483648 ? e - 2147483648 : -1,
						o = a < 0 && e >= 1073741824 ? e - 1073741824 : -1,
						s = a >= 0 && r.gex_cgen_pmod_wasm_len?.(a) >>> 0 > 0,
						c = s && !!r.gex_cgen_pmod_wasmprog?.(a),
						l = s && !!r.gex_cgen_pmod_libprov?.(a),
						u = c && !!r.gex_cgen_pmod_lowered?.(a),
						d = s && !c && !l && this.#Kn && !B(),
						f = (l || u || d) && !B(),
						p = B() || f;
					c &&
						((this.#Kn = B() || u),
						this.#In &&
							(typeof this.#In.value == `bigint`) !== this.#Kn &&
							((this.#In = null), this.#Hn()));
					let m = s ? r.gex_cgen_pmod_wasm_len(a) >>> 0 : 0,
						h = () => {
							let e =
								c && r.gex_wasmprog_owned ? r.gex_wasmprog_owned(a) >>> 0 : 0;
							if (c && r.gex_wasmprog_owned && !e)
								throw Error(`wasm32 module ${a}: its bytes are gone`);
							let t = e || r.gex_cgen_pmod_wasm_ptr(a) >>> 0,
								n = new Uint8Array(this.#e.buffer, t, m).slice();
							return (e && r.gex_free(e, m), n);
						},
						g = null,
						_ = null,
						v = c ? this.#Xn(a) : ``,
						y = [];
					for (let e of v.split(`
`))
						if (e.startsWith(`X	`)) {
							let t = e.split(`	`);
							y.push([Number(t[1]), t[2]]);
						}
					let b = !1;
					if ((c || (s && !l)) && r.gex_cgen_pmod_wasm_key) {
						let e = (e) =>
							BigInt.asUintN(64, BigInt(r.gex_cgen_pmod_wasm_key(a, e)));
						if (
							((_ = `wasm:${m}:${e(0)}:${e(1)}`), c && !p && !R(`nodlpack`))
						) {
							if (this.#z.has(`${_}:p`)) ((_ = `${_}:p`), (b = !0));
							else if (!this.#z.has(_)) {
								let e = h(),
									n = performance.now();
								((g = Ht(e, y, t)),
									R(`dlpack`) &&
										console.warn(
											`[dlpack] ${this.#Kt(r.gex_cgen_pmod_file, a)}: ${g ? `${e.length} -> ${g.length} bytes, ${y.length} slots` : `not packed`} in ${(performance.now() - n).toFixed(1)} ms`,
										),
									g ? ((_ = `${_}:p`), (b = !0)) : (g = e));
							}
						}
						!b && !this.#z.has(_) && (g ??= h());
					} else s && ((g = h()), (_ = `wasm:${qt(g)}`));
					if (s) {
						let e = this.#Kt(r.gex_cgen_pmod_file, a);
						L(`record`) &&
							console.warn(`[gex-record] module ${e} ${_.slice(5)}`);
						let t = e.replace(/^wasm(dll|prog):/, ``);
						this.#r.noteStatus?.({
							kind: `module`,
							path: t,
							program: c ? void 0 : /\.exe$/i.test(t) ? this.cmdline : void 0,
						});
					}
					let x = s
							? this.#On(this.#Kt(r.gex_cgen_pmod_file, a), g, _)
							: a >= 0
								? this.#On(this.#Kt(r.gex_cgen_pmod_file, a))
								: o >= 0
									? this.#jn(o)
									: this.#qt(this.#Kt(r.gex_cgen_key, e)),
						C =
							a >= 0
								? (r.gex_cgen_pmod_memory_base?.(a) >>> 0) +
									(r.gex_cgen_pmod_memory_base_hi?.(a) >>> 0) * 2 ** 32
								: 0,
						w =
							a >= 0
								? (e, t) => r.gex_cgen_pmod_regs(a, e, t)
								: o >= 0
									? (e, t) => r.gex_fjit_regs(o, e, t)
									: (t, n) => r.gex_cgen_regs(e, t, n),
						T = this.#wi(
							(a >= 0
								? r.gex_cgen_pmod_slots(a)
								: o >= 0
									? r.gex_fjit_slots(o)
									: r.gex_cgen_slots(e)) >>> 0,
							`cgen`,
						),
						ee = performance.now(),
						E,
						D = {
							env: {
								memory: this.#e,
								__indirect_function_table: i.ftab,
								__table_base: new WebAssembly.Global(
									{ value: p ? `i64` : `i32`, mutable: !1 },
									p ? BigInt(t >>> 0) : t | 0,
								),
								__table_base32: new WebAssembly.Global(
									{ value: `i32`, mutable: !1 },
									t | 0,
								),
								__memory_base: new WebAssembly.Global(
									{ value: p ? `i64` : `i32`, mutable: !1 },
									p ? BigInt(C) : C,
								),
								__stack_pointer:
									C && !c
										? l || d || (s && B())
											? this.#xn()
											: this.#vn()
										: c
											? this.#Gn()
											: new WebAssembly.Global(
													B()
														? { value: `i64`, mutable: !0 }
														: { value: `i32`, mutable: !0 },
													B() ? 0n : 0,
												),
								...(s
									? Object.fromEntries(
											Nr.map((e) => [
												e,
												() => {
													throw Error(
														`${e}: a main the program does not define was called`,
													);
												},
											]),
										)
									: {}),
							},
							...(s
								? {
										"GOT.func": Object.fromEntries(
											Nr.map((e) => [
												e,
												B()
													? new WebAssembly.Global(
															{ value: `i64`, mutable: !0 },
															0n,
														)
													: new WebAssembly.Global(
															{ value: `i32`, mutable: !0 },
															0,
														),
											]),
										),
									}
								: {}),
							gex: {
								...this.#a,
								lookup: i.lookup,
								ftab: i.ftab,
								...(a >= 0
									? {
											nt_qpc: r.gex_nt_qpc,
											clock_ns: r.gex_clock_ns,
											ftab_twin: r.gex_ftab_twin,
											provider_alloc_top: r.gex_provider_alloc_top,
											unix_dispatcher: (e, t) =>
												globalThis.GEX_TEST_UD2_ENTRY && (e === 0 || e === 4)
													? 0
													: (r.gex_unix_dispatcher?.(e, V(t)) ?? 0),
											fault_hook: (e) => r.gex_fault_hook_set?.(V(e)),
											signal_hook: (e) => r.gex_signal_hook_set?.(V(e)),
											code_changed: (e, t) => r.gex_code_changed?.(jn(e), t),
											wine_pe_slot: (e, t) =>
												r.gex_wine_pe_slot?.(V(e), t) ?? 0,
											...(c && B()
												? {
														sysreg_write: (e, t, n, r) =>
															this.#a.sysreg_write(V(e), t, n, r),
													}
												: {}),
											call_out: S.on
												? new WebAssembly.Suspending((e, t, n, r) =>
														this.#ra()
															? this.#Zi(e >>> 0, t, n, r)
															: this.#Qi(e >>> 0, t, n, r),
													)
												: (e, t, n, r) => this.#Zi(e >>> 0, t, n, r),
											image_mapped: (e, t) => {
												let n = r.gex_image_mapped?.(jn(e), t) ?? -1;
												if (n !== -1) {
													if (n === -3) {
														this.#mi();
														return;
													}
													(this.#Mn(),
														n >= 0 &&
															(r.gex_cgen_pmod_installed(n),
															r.gex_wasmdll_installed()),
														this.#Pn());
												}
											},
											dlopen: () => 0,
											dlsym: () => 0,
										}
									: {}),
								...(C && !c ? (l ? this.#Tn() : this.#En()) : {}),
								...(f
									? { provider_alloc: (e) => r.gex_provider_alloc(e) }
									: {}),
								...(c
									? this.#Dr(() => E, x)
									: l
										? { syscall: this.#di }
										: s
											? {
													syscall: S.on
														? this.#pi
														: (r.gex_native_syscall ?? this.#pi),
													kuser_address: () =>
														(r.gex_kuser_address
															? r.gex_kuser_address()
															: 2147352576) | 0,
												}
											: {}),
							},
						};
					a < 0 && o < 0 && this.#on(x, this.#Kt(r.gex_cgen_key, e), D);
					let te =
						d &&
						!S.on &&
						WebAssembly.Module.exports(x).some(
							(e) => e.name === `__gexw_snap_globals`,
						);
					if (te) {
						let e = D.gex,
							t = e.unix_dispatcher;
						((e.unix_dispatcher = (e, n) => (e === 1 || e === 5 ? 0 : t(e, n))),
							(e.snap_pe_stop = (e, t, n, r, i) => this.#dr(e, t, n, r, i)),
							this.#vr &&
								(e.call_out = (e, t, n, r) => this.#fr(e >>> 0, t, n, r)),
							(this.#Cr ??= new WebAssembly.Global(
								{ value: `i32`, mutable: !0 },
								0,
							)),
							Object.assign(D.env, {
								__asyncify_state: new WebAssembly.Global(
									{ value: `i32`, mutable: !0 },
									0,
								),
								__asyncify_data: new WebAssembly.Global(
									{ value: `i32`, mutable: !0 },
									0,
								),
								__gexw_snap_depth: this.#Cr,
							}));
					}
					let ne = c ? this.#Yn(a, D, i, v) : [];
					if (
						(c &&
							(this.#Or = {
								module: x,
								base: t,
								memBase: C,
								binds: this.#kr,
								packed: b,
							}),
						(E = new WebAssembly.Instance(x, D)),
						te &&
							((this.#gr = { inst: E, state: D.env.__asyncify_state }),
							this.#hr()),
						!this.#ii && c)
					) {
						if (r.gex_wasmprog_relocate(a))
							try {
								E.exports.__wasm_apply_data_relocs?.();
							} finally {
								r.gex_wasmprog_relocated?.(a);
							}
					} else
						!this.#ii &&
							C &&
							r.gex_provider_relocate(C) &&
							E.exports.__wasm_apply_data_relocs?.();
					if (c) {
						if (!b)
							for (let [e, t] of ne) {
								let n = E.exports[t];
								if (!n) throw Error(`wasm32 module ${a}: ${t} is not exported`);
								i.ftab.set(Nn(e), n);
							}
						(i.dyl.set(a, E),
							r.gex_wasmprog_release?.(a),
							this.#Zn && this.#rr(a, E, i, this.#Zn));
					}
					let re = n ? 0 : this.#en(w, T);
					(i.instances.push(E), o >= 0 && r.gex_fjit_installed(o));
					let ie = performance.now() - ee;
					if (s && R(`wasmlib`)) {
						let e = this.#Dn;
						console.warn(
							`[wasmlib] pid ${r.gex_my_pid?.() ?? `?`} w${Math.round(performance.timeOrigin) % 1e6}: ${this.#Kt(r.gex_cgen_pmod_file, a).split(`/`).pop()} ${e < 0 ? `had` : `compiled ${e.toFixed(1)} ms`}, instantiated ${ie.toFixed(1)} ms, at ${Math.round(performance.timeOrigin + performance.now()) % 1e7}`,
						);
					}
					return (
						a < 0 &&
							o < 0 &&
							ie >= 20 &&
							console.error(
								`[unit] installed at ${t} in ${Math.round(ie)} ms (${re} bridges)`,
							),
						re
					);
				}
				#en(e, t) {
					let n = this.#t.exports,
						r = this.#Gt,
						i = e(0, 0) >>> 0,
						a = n.gex_alloc(4 * Math.max(1, i)) >>> 0,
						o;
					try {
						(e(a, i),
							(o = new Uint32Array(this.#e.buffer.slice(a, a + 4 * i))));
					} finally {
						n.gex_free?.(a, 4 * Math.max(1, i));
					}
					let s = this.#n.exports.blocks;
					return (
						s && this.#do(),
						this.#lo(t, s, o, r.bridge),
						this.#ao && (this.#ao.bridged += o.length >>> 1),
						o.length >>> 1
					);
				}
				#tn = [];
				#nn(e, t, n) {
					let r = this.#t.exports,
						i = this.#wi(r.gex_cgen_slots(e) >>> 0, `cgen`);
					this.#en((t, n) => r.gex_cgen_regs(e, t, n), i);
					let a = t + n,
						o = this.#tn.filter((e) => e.end <= t || e.base >= a),
						s = o.length;
					for (; s > 0 && o[s - 1].base > t; ) s--;
					(o.splice(s, 0, { u: e, base: t, end: a, retired: null }),
						(this.#tn = o));
				}
				#rn(e) {
					let t = this.#tn,
						n = 0,
						r = t.length;
					for (; n < r; ) {
						let i = (n + r) >>> 1;
						t[i].end <= e ? (n = i + 1) : (r = i);
					}
					let i = t[n];
					if (!i || e < i.base) return;
					(t.splice(n, 1),
						L(`unit`) &&
							console.error(
								`[unit] ${this.#qa()}: unit at ${i.base} instantiated at its first call (${t.length} still deferred)`,
							));
					let a = R(`unitstall`),
						o = a ? performance.now() : 0,
						s =
							a &&
							this.#z.has(
								`cgen:${this.#Kt(this.#t.exports.gex_cgen_key, i.u)}`,
							);
					if (
						(this.#$t(i.u, i.base, !0),
						a &&
							console.warn(
								`[unitstall] ${this.#qa()}: ${(performance.now() - o).toFixed(1)} ms ${s ? `had` : `compiled`}`,
							),
						i.retired)
					)
						for (let e of i.retired) this.#Gt.ftab.set(Nn(e), this.#Gt.resolve);
				}
				#in(e) {
					for (let t of this.#tn)
						e >= t.base && e < t.end && (t.retired ??= new Set()).add(e);
				}
				#an = new WeakMap();
				#on(e, t, n) {
					let r = this.#an.get(e);
					if (
						(r ||
							((r = new Set(
								WebAssembly.Module.imports(e).map(
									(e) => `${e.module}.${e.name}`,
								),
							)),
							this.#an.set(e, r)),
						r.has(`gex.cold`))
					) {
						let e = new Set();
						n.gex = {
							...n.gex,
							cold: (r) => {
								if (((r >>>= 0), e.has(r)))
									throw Error(
										`gex-cgen: ${t}: cold cluster ${r} is in, yet its stub ran`,
									);
								e.add(r);
								let i = performance.now(),
									a = this.#ln(t, r);
								(new WebAssembly.Instance(a, { env: n.env, gex: n.gex }),
									(this.#sn += performance.now() - i));
							},
						};
					}
					if (r.has(`gex.pruned`)) {
						let r = WebAssembly.Module.customSections(e, `gex.funcs`)[0],
							i = r ? new DataView(r) : null;
						n.gex = {
							...n.gex,
							pruned: (e) => {
								e >>>= 0;
								let n =
										i && 12 + 8 * e <= i.byteLength
											? i.getBigUint64(4 + 8 * e, !0)
											: null,
									r = `gex-cgen: ${t}: pruned function ${n === null ? `?` : `0x` + n.toString(16)} (slot ${e}) ran`;
								throw (console.error(`[pruned] ${r}`), Error(r));
							},
						};
					}
					if (r.has(`gexcov.hit`)) {
						let r = WebAssembly.Module.customSections(e, `gex.funcs`)[0],
							i = r ? new DataView(r).getUint32(0, !0) : 65536;
						n.gexcov = { hit: this.#fn(t, i) };
					}
				}
				#sn = 0;
				#cn = new Map();
				#ln(e, t) {
					let n = `cold:${e}:${t}`,
						r = this.#z.get(n);
					if (r) return r;
					let i = this.#cn.get(e);
					if (!i) {
						let t = this.#r.loadFile?.(`${e}/cold.idx`) ?? null,
							n = this.#r.zstd;
						if (!t)
							throw Error(`gex-cgen: ${e}: a split unit with no cold.idx`);
						if (!n)
							throw Error(
								`gex-cgen: ${e}: a split unit, and this Worker has no zstd decoder`,
							);
						let r = n
								.decode(
									t.subarray(4),
									new DataView(t.buffer, t.byteOffset, 4).getUint32(0, !0),
								)
								.slice(),
							a = new Uint32Array(r.buffer, 0, r.byteLength >> 2),
							o = a[0],
							s = new Float64Array(o + 1);
						for (let e = 0; e < o; e++) s[e + 1] = s[e] + a[1 + e];
						((i = { n: o, w: a, offs: s }), this.#cn.set(e, i));
					}
					if (!(t >= 0 && t < i.n))
						throw Error(`gex-cgen: ${e}: no cold cluster ${t}`);
					let a = i.offs[t],
						o = i.w[1 + t],
						s = i.w[1 + i.n + t],
						c = performance.now(),
						l = this.#r.loadRange?.(`${e}/cold.bin`, a, o) ?? null;
					if (!l)
						throw Error(
							`gex-cgen: ${e}: cold cluster ${t} (${o} bytes at ${a}) could not be read`,
						);
					let u = performance.now();
					l = this.#r.zstd.decode(l, s);
					let d = performance.now();
					r = new WebAssembly.Module(l);
					let f = performance.now();
					return (
						L(`unit`) &&
							console.warn(
								`[cold] ${e.slice(0, 16)} ${t}: ${o} bytes (${s} unpacked), fetch ${(u - c).toFixed(1)} ms, decode ${(d - u).toFixed(1)} ms, compile ${(f - d).toFixed(1)} ms, at ${Math.round(performance.timeOrigin + performance.now()) % 1e7}`,
							),
						this.#z.set(n, r),
						this.#Za(n, r, l.byteLength),
						r
					);
				}
				#un = new Map();
				#dn = null;
				#fn(e, t) {
					let n = this.#un.get(e);
					if (!n) {
						let r = new Uint8Array([
							0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 21, 3, 1,
							109, 1, 109, 2, 0, 1, 1, 109, 1, 111, 3, 127, 0, 1, 109, 1, 102,
							0, 0, 3, 2, 1, 0, 7, 7, 1, 3, 104, 105, 116, 0, 1, 10, 47, 1, 45,
							1, 2, 127, 32, 0, 35, 0, 106, 65, 2, 116, 34, 1, 40, 2, 0, 34, 2,
							69, 4, 64, 32, 0, 16, 0, 11, 32, 1, 32, 2, 65, 1, 106, 65, 127,
							32, 2, 65, 127, 71, 27, 54, 2, 0, 11,
						]);
						((this.#pn ??= new WebAssembly.Module(r)),
							(this.#hn ??= new WebAssembly.Memory({ initial: 1 })));
						let i = this.#gn;
						this.#gn += t;
						let a =
							Math.ceil((4 * this.#gn) / 65536) -
							this.#hn.buffer.byteLength / 65536;
						a > 0 && this.#hn.grow(a);
						let o = new Map();
						((n = {
							off: i,
							n: t,
							hit: new WebAssembly.Instance(this.#pn, {
								m: {
									m: this.#hn,
									o: new WebAssembly.Global({ value: `i32` }, i),
									f: (e) => {
										o.set(
											e,
											Math.round(performance.timeOrigin + performance.now()),
										);
									},
								},
							}).exports.hit,
							said: new Uint8Array(t),
							sent: new Uint32Array(t),
							first: o,
						}),
							this.#un.set(e, n),
							(this.#dn ??= setInterval(() => this.covFlush(), 2e3)));
					}
					return n.hit;
				}
				#pn = null;
				#mn = 0;
				#hn = null;
				#gn = 0;
				covFlush() {
					for (let [e, t] of this.#un) {
						let n = new Uint32Array(this.#hn.buffer, 4 * t.off, t.n),
							r = [],
							i = [],
							a = -1;
						for (let e = 0; e <= t.n; e++) {
							let o = e < t.n && n[e] && !t.said[e];
							if (
								(o && a < 0 && (a = e),
								!o &&
									a >= 0 &&
									(r.push(a === e - 1 ? `${a}` : `${a}-${e - 1}`),
									t.said.fill(1, a, e),
									(a = -1)),
								e < t.n && n[e] !== t.sent[e])
							) {
								let r = t.first.get(e);
								(r !== void 0 && t.first.delete(e),
									i.push(`${e}:${r ?? ``}:${(n[e] - t.sent[e]) >>> 0}`),
									(t.sent[e] = n[e]));
							}
						}
						(r.length && console.warn(`[gex-cov] ${e} ${r.join(`,`)}`),
							i.length && console.warn(`[gex-prof] ${e} ${i.join(`,`)}`));
					}
				}
				#_n = null;
				#vn() {
					if (!this.#_n) {
						let e = 1 << 20,
							t = this.#t.exports,
							n =
								(t.gex_provider_stack
									? t.gex_provider_stack(e)
									: t.gex_provider_alloc(e)) >>> 0;
						if (!n) {
							let e = t.gex_arena_spent_mib
								? ` (arena taken: maps ${t.gex_arena_spent_mib(0)}, heap ${t.gex_arena_spent_mib(1)}, stacks ${t.gex_arena_spent_mib(2)} MiB, memory ${Math.round(this.#e.buffer.byteLength / 1048576)} MiB)`
								: ``;
							throw Error(`gex-pe: no memory for a provider stack${e}`);
						}
						this.#_n = new WebAssembly.Global(
							{ value: `i32`, mutable: !0 },
							n + e - 16,
						);
					}
					return this.#_n;
				}
				#yn = null;
				#bn = 0n;
				#xn() {
					if (!this.#yn) {
						let e = 1 << 20,
							t = this.#t.exports.gex_provider_stack(e) >>> 0;
						if (!t) throw Error(`gex: no memory for a provider stack`);
						((this.#bn = BigInt(t)),
							(this.#yn = new WebAssembly.Global(
								{ value: `i64`, mutable: !0 },
								BigInt(t + e - 16),
							)));
					}
					return this.#yn;
				}
				#Sn(e, t) {
					let n = this.#t.exports;
					if (
						!n.gex_handler_lost ||
						typeof WebAssembly.Exception != `function` ||
						!(e instanceof WebAssembly.Exception)
					)
						return !1;
					for (let r of [this.#n, ...(this.#Gt?.instances ?? [])]) {
						let i = r?.exports?.__c_longjmp;
						if (!(i instanceof WebAssembly.Tag) || !e.is(i)) continue;
						let a = Number(e.getArg(i, 0)) >>> 0,
							o = new DataView(this.#e.buffer).getUint32(a, !0);
						return n.gex_handler_lost(t, o) === 1;
					}
					return !1;
				}
				#Cn(e) {
					if (e instanceof Error) return e.message;
					if (
						typeof WebAssembly.Exception == `function` &&
						e instanceof WebAssembly.Exception
					) {
						let t = [
							[`shim`, this.#t],
							[`guest`, this.#n],
							...(this.#Gt?.instances ?? []).map((e, t) => [`unit ${t}`, e]),
						];
						for (let [n, r] of t)
							for (let [t, i] of Object.entries(r?.exports ?? {}))
								if (i instanceof WebAssembly.Tag && e.is(i)) {
									let r = ``;
									if (t === `__c_longjmp` && globalThis.GEX_SEH_REPORT)
										try {
											let t = Number(e.getArg(i, 0)) >>> 0,
												n = new DataView(this.#e.buffer);
											r = ` (jmp_buf 0x${n.getUint32(t, !0).toString(16)}, value ${n.getInt32(t + 4, !0)})`;
										} catch {}
									return `a wasm exception, tag ${t} of the ${n} module${r}`;
								}
						return `a wasm exception whose tag no module of this Worker exports`;
					}
					return `a thrown ${typeof e}: ${String(e)}`;
				}
				#wn = 0;
				#Tn() {
					let e = this.#t.exports;
					return {
						provider_guest_call: e.gex_libprov_guest_call,
						provider_missing: (t) => e.gex_libprov_missing(t),
						provider_thread_entry: () => e.gex_libprov_thread_entry(),
						provider_code_page: () => e.gex_libprov_thread_entry(),
						provider_stack: () => this.#bn,
						provider_abi: (t) => e.gex_libprov_abi(t),
						provider_table_size: (t) => e.gex_libprov_table_size(t),
					};
				}
				#En() {
					let e = this.#t.exports,
						t = this.#Gt.ftab;
					return {
						provider_try: (n, r) => {
							try {
								return (
									t.get(B() ? BigInt(n) : n >>> 0)(r),
									e.gex_provider_note(0),
									0
								);
							} catch (t) {
								if (t instanceof Lr) return (e.gex_provider_note(1), t.code);
								throw t;
							}
						},
						provider_throw: (e) => {
							throw new Lr(e);
						},
						provider_ctx: () => e.gex_provider_ctx(),
						ftab_twin: (t) => e.gex_ftab_twin(t),
						provider_time: (e) =>
							e === 0 ? Date.now() / 1e3 : performance.now() / 1e3,
						provider_missing: (t) => e.gex_provider_missing(t),
						provider_alloc: (t) => e.gex_provider_alloc(t),
						provider_alloc_top: (t) => e.gex_provider_alloc_top(t),
						provider_log: (e, t) => {
							console.error(
								new TextDecoder().decode(
									this.#Ye().slice(e >>> 0, (e >>> 0) + (t >>> 0)),
								),
							);
						},
					};
				}
				#Dn = -1;
				#On(e, t = null, n = null) {
					let r = n ?? `cgenfile:${e}`,
						i = this.#z.get(r);
					if (((this.#Dn = -1), i)) return i;
					if (((t ??= this.#r.loadFile?.(e) ?? null), !t))
						throw Error(
							`gex-cgen: ${e} was published but cannot be loaded here`,
						);
					let a = performance.now();
					return (
						(i = new WebAssembly.Module(t)),
						(this.#Dn = performance.now() - a),
						this.#z.set(r, i),
						this.#Za(r, i, t.byteLength),
						i
					);
				}
				#kn(e) {
					let t = this.#t.exports,
						n = t.gex_cgen_provider_count?.(e) >>> 0;
					for (let r = 0; r < n; r++) {
						if (t.gex_cgen_provider_libprov?.(e, r)) {
							let n = t.gex_libprov_publish(e, r);
							(this.#Mn(),
								n >= 0 &&
									(t.gex_cgen_pmod_installed(n),
									t.gex_libprov_installed?.(n),
									this.#Pn()));
							continue;
						}
						if (t.gex_cgen_provider_wasmdll?.(e, r)) {
							let n = t.gex_wasmdll_publish(e, r);
							(this.#Mn(),
								n >= 0 &&
									(t.gex_cgen_pmod_installed(n), t.gex_wasmdll_installed()),
								this.#Pn());
							continue;
						}
						let n = this.#Kt(
								(e, n, i) => t.gex_cgen_provider_file(e, r, n, i),
								e,
							),
							i = this.#r.loadFile?.(n) ?? null;
						if (!i) {
							console.error(
								`gex-pe: missing unit: no provider module ${n} in the unit cache, so ${this.#Kt(t.gex_cgen_path, e)} runs without its providers; build them with GEX_CGEN_CACHE=<the unit cache> gexc cgen-image --providers (or natively: a run of the program)`,
							);
							continue;
						}
						let a = i instanceof Uint8Array ? i : new Uint8Array(i);
						this.#On(n, a);
						let o = t.gex_alloc(Math.max(8, a.byteLength)) >>> 0;
						this.#Ye().set(a, o);
						let s = t.gex_cgen_provider_publish(e, r, o, a.byteLength);
						(t.gex_free?.(o, Math.max(8, a.byteLength)),
							!(s < 0) && (this.#Mn(), t.gex_cgen_pmod_installed(s)));
					}
				}
				#An(e, t) {
					let n = this.#t.exports;
					if (!n.gex_cgen_region) return;
					let r = n.gex_cgen_region(e);
					if (r < 0) return;
					let i = this.#Kt(n.gex_cgen_key, r),
						a = this.#r.loadUnit?.(i) ?? null;
					if (!a) return;
					this.#qt(i, a);
					let o =
							a.entries instanceof Uint8Array
								? a.entries
								: new Uint8Array(a.entries),
						s = n.gex_alloc(Math.max(8, o.byteLength)) >>> 0;
					this.#Ye().set(o, s);
					let c = n.gex_cgen_publish(r, s, o.byteLength / 8);
					if ((n.gex_free?.(s, Math.max(8, o.byteLength)), c < 0))
						throw Error(`gex-cgen: publishing ${t}'s region entries failed`);
					(this.#Mn(), n.gex_cgen_installed(r));
					let l = 0;
					for (let e = 0; e + 8 <= o.byteLength; e += 8)
						o[e] |
							o[e + 1] |
							o[e + 2] |
							o[e + 3] |
							o[e + 4] |
							o[e + 5] |
							o[e + 6] |
							o[e + 7] && l++;
					console.error(`gex-pe: region entries for ${t}: ${l}`);
				}
				#jn(e) {
					let t = this.#t.exports,
						n = t.gex_fjit_ptr(e) >>> 0,
						r = this.#Ye().slice(n, n + (t.gex_fjit_len(e) >>> 0)),
						i = `fjit:${qt(r)}`,
						a = this.#z.get(i);
					if (a) return a;
					let o = {}.GEX_FJIT_DUMP;
					o &&
						globalThis.process
							.getBuiltinModule(`fs`)
							.writeFileSync(`${o}/fjit-${e}.wasm`, r);
					let s = performance.now();
					a = new WebAssembly.Module(r);
					let c = performance.now() - s;
					return (
						(this.#A += c),
						(this.#j += c),
						s >= this.#M &&
							t.gex_fjit_translate_ms &&
							(this.#M &&
								console.error(
									`[gex] fjit so far: ${t.gex_fjit_modules()} modules, ${t.gex_fjit_wasm_kib()} KiB of wasm, ${t.gex_fjit_translate_ms()} ms translating (the process), ${this.#j.toFixed(0)} ms compiling (this Worker)`,
								),
							(this.#M = s + 6e4)),
						this.#z.set(i, a),
						this.#Za(i, a, r.byteLength),
						a
					);
				}
				#Mn() {
					let e = this.#t.exports;
					if (!e.gex_ftab_log_len) return;
					let t = e.gex_ftab_size() >>> 0,
						n = e.gex_ftab_log_len() >>> 0;
					if (!n && !this.#Gt) return;
					let r = this.#Jt();
					if (r.have >= n) {
						(e.gex_ftab_behind() && e.gex_cgen_have(r.have), this.#Pn());
						return;
					}
					this.#Yt();
					let i = R(`unitstall`),
						a = i ? performance.now() : 0,
						o = r.have;
					for (; r.have < n; ) {
						let t = BigInt.asUintN(64, BigInt(e.gex_ftab_event(r.have))),
							n = Number(t >> 32n),
							i = Number(t & 4294967295n);
						if (n === 1) {
							let t = e.gex_ftab_install_unit(i) >>> 0;
							if (
								t >= 2147483648 &&
								t !== 4294967295 &&
								e.gex_cgen_pmod_ready &&
								!e.gex_cgen_pmod_ready(t - 2147483648)
							)
								break;
							if (t !== 4294967295) {
								if (t < 1073741824 && !S.on && e.gex_ftab_install_len)
									this.#nn(
										t,
										e.gex_ftab_install_base(i) >>> 0,
										e.gex_ftab_install_len(i) >>> 0,
									);
								else if (t >= 2147483648)
									try {
										this.#$t(t, e.gex_ftab_install_base(i) >>> 0);
									} catch (t) {
										if (e.gex_ftab_install_unit(i) >>> 0 != 4294967295) throw t;
									}
								else this.#$t(t, e.gex_ftab_install_base(i) >>> 0);
							}
						} else
							n === 2 &&
								(r.ftab.set(Nn(i), r.resolve), this.#tn.length && this.#in(i));
						(r.have++, e.gex_cgen_have(r.have));
					}
					((this.#tr.value = t),
						i &&
							r.have - o > 16 &&
							console.warn(
								`[unitcatch] ${this.#qa()}${this.#Oe ? ` (fork child)` : ``}: ${r.have - o} events in ${(performance.now() - a).toFixed(1)} ms`,
							),
						this.#Pn());
				}
				#Nn = 0;
				#Pn() {
					let e = this.#t.exports,
						t = (e.gex_wasmdll_binds_len?.() ?? 0) >>> 0;
					if (this.#Nn >= t) return;
					let n = this.#n.exports.blocks;
					for (; this.#Nn < t; ) {
						let t = this.#Nn,
							r = this.#wi(e.gex_wasmdll_bind_slots(t) >>> 0, `cgen`);
						n && this.#do();
						let i = e.gex_wasmdll_bind_regs(t, 0, 0) >>> 0,
							a = e.gex_alloc(4 * Math.max(1, i)) >>> 0,
							o;
						try {
							(e.gex_wasmdll_bind_regs(t, a, i),
								(o = new Uint32Array(this.#e.buffer.slice(a, a + 4 * i))));
						} finally {
							e.gex_free?.(a, 4 * Math.max(1, i));
						}
						let s = this.#Jt();
						(this.#lo(r, n, o, s.bridge),
							this.#ao && (this.#ao.bridged += o.length >>> 1),
							e.gex_wasmdll_bind_done(t),
							this.#Nn++);
					}
				}
				#Fn() {
					let e = this.#t.exports,
						t = (e.gex_wasmprog_link?.(0, 0) ?? 0) >>> 0;
					if (!t) return null;
					let n = e.gex_alloc(t) >>> 0;
					try {
						return (
							e.gex_wasmprog_link(n, t),
							new TextDecoder().decode(this.#Ye().slice(n, n + t))
						);
					} finally {
						e.gex_free?.(n, t);
					}
				}
				#In = null;
				#Ln = null;
				#Rn = null;
				#zn() {
					sr ??= new WebAssembly.Module(ir);
					let e = new WebAssembly.Table({ element: `anyfunc`, initial: 1 }),
						t = new WebAssembly.Instance(sr, {
							e: { hook: e, slow: (e, t, n) => this.#Vn(e, t, n) },
						});
					return (
						(this.#Ln = e),
						(this.#Rn = t.exports.slow),
						(this.#Bn = t.exports.entry_call),
						t.exports.entry_call
					);
				}
				#Bn = null;
				#Vn(e, t, n) {
					let r = this.#In ?? this.#Gn(),
						i = this.#xr?.()?.exports,
						a = i?.__gex_snap_resume64
							? new WebAssembly.Instance(Qt(B(), typeof r.value == `bigint`), {
									e: {
										t: this.#Gt.ftab,
										sp: r,
										d: (this.#Cr ??= new WebAssembly.Global(
											{ value: `i32`, mutable: !0 },
											0,
										)),
										st: i.asyncify_get_state,
										af: (e, t, n) => this.#sr(0, e, t, n),
									},
								}).exports.entry
							: new WebAssembly.Instance(Zt(B(), typeof r.value == `bigint`), {
									e: { t: this.#Gt.ftab, sp: r },
								}).exports.entry;
					return (this.#Ln.set(0, a), a(e, t, n));
				}
				#Hn() {
					this.#Ln && this.#Ln.set(0, this.#Rn);
				}
				#Un() {
					return S.on ? void 0 : this.#In?.value || void 0;
				}
				#Wn(e) {
					let t = this.#In;
					t && e !== void 0 && typeof t.value == typeof e && (t.value = e);
				}
				#Gn() {
					let e = B() || this.#Kn;
					return (
						this.#In &&
							(typeof this.#In.value == `bigint`) !== e &&
							(this.#In = null),
						this.#In || this.#Hn(),
						(this.#In ??= new WebAssembly.Global(
							e ? { value: `i64`, mutable: !0 } : { value: `i32`, mutable: !0 },
							e ? 0n : 0,
						))
					);
				}
				#Kn = !1;
				#qn = null;
				#Jn = [];
				#Yn(e, t, n, r = this.#Xn(e)) {
					if (((this.#kr = r), !r)) return [];
					let i = [];
					this.#Zn = null;
					let a = (e, n, r) => {
						(t[e] ??= {})[n] = r;
					};
					for (let t of r.split(`
`)) {
						if (!t) continue;
						let r = t.split(`	`);
						switch (r[0]) {
							case `S`:
								r[1] === `env` &&
									(r[2] === `__asyncify_state` || r[2] === `__asyncify_data`) &&
									((this.#qn ??= [0, 1].map(
										() =>
											new WebAssembly.Global({ value: `i32`, mutable: !0 }, 0),
									)),
									a(
										`env`,
										r[2],
										this.#qn[r[2] === `__asyncify_state` ? 0 : 1],
									));
								break;
							case `G`: {
								let e =
									r[5] === `64`
										? new WebAssembly.Global(
												{ value: `i64`, mutable: r[4] === `1` },
												BigInt(r[3]),
											)
										: new WebAssembly.Global(
												{ value: `i32`, mutable: r[4] === `1` },
												Number(r[3]) | 0,
											);
								(r[4] === `1` && this.#Jn.push(e), a(r[1], r[2], e));
								break;
							}
							case `E`: {
								let t = n.dyl.get(Number(r[3])),
									i = t?.exports[r[4]];
								if (
									(i === void 0 &&
										t &&
										r[5] &&
										r[5] !== `-` &&
										(i =
											r[5][0] === `g`
												? new WebAssembly.Global(
														{ value: `i32`, mutable: !1 },
														Number(r[5].slice(1)) | 0,
													)
												: n.ftab.get(Nn(Number(r[5])))),
									i === void 0)
								)
									throw Error(
										`wasm32 module ${e}: ${r[1]}.${r[2]}: ${r[4]} of module ${r[3]} is not instantiated in this Worker`,
									);
								a(r[1], r[2], i);
								break;
							}
							case `L`: {
								let e = Nn(Number(r[3])),
									t = n.ftab;
								a(r[1], r[2], (...n) => t.get(e)(...n));
								break;
							}
							case `M`: {
								let e = r.slice(3).join(`	`);
								a(r[1], r[2], () => {
									throw Error(e);
								});
								break;
							}
							case `X`:
								i.push([Number(r[1]), r[2]]);
								break;
							case `T`:
								this.#Zn = [Number(r[1]), Number(r[2])];
						}
					}
					return i;
				}
				#Xn(e) {
					let t = this.#t.exports,
						n = t.gex_wasmprog_binds ? t.gex_wasmprog_binds(e, 0, 0) >>> 0 : 0;
					if (!n) return ``;
					let r = t.gex_alloc(n) >>> 0;
					try {
						return (
							t.gex_wasmprog_binds(e, r, n),
							new TextDecoder().decode(this.#Ye().slice(r, r + n))
						);
					} finally {
						t.gex_free?.(r, n);
					}
				}
				#Zn = null;
				#Qn = null;
				#$n = [];
				#er = 0;
				#tr = new WebAssembly.Global({ value: `i32`, mutable: !0 }, 0);
				#nr = 0;
				#rr(e, t, n, [r, i]) {
					let a = this.#t.exports,
						o = this.#Qn ? a.gex_wasmprog_link_index(e) : -1,
						s = o >= 0 ? this.#Qn.get(o) : void 0;
					if (s !== void 0) {
						(this.#Qn.delete(o),
							t.exports.__gex_set_tls_base(s),
							n.dlTls.set(e, s));
						return;
					}
					i = Math.max(i, 8);
					let c = this.#$n.at(-1),
						l = (this.#nr + i - 1) & -i;
					if (!c || l + r > c[0] + c[1]) {
						let t = Math.max(16384, r + i),
							n = a.gex_wasmprog_tls_chunk(t) >>> 0;
						if (!n)
							throw Error(
								`wasm32 module ${e}: no memory for its thread-local block`,
							);
						(this.#$n.push([n, t]), (l = (n + i - 1) & -i));
					}
					((this.#nr = l + r), t.exports.__wasm_init_tls(l), n.dlTls.set(e, l));
				}
				#ir() {
					let e = this.#t.exports,
						t = this.#Gt?.dlTls;
					return !t?.size || !e.gex_wasmprog_link_index
						? []
						: [...t]
								.map(([t, n]) => [e.gex_wasmprog_link_index(t), n])
								.filter(([e]) => e >= 0);
				}
				freeThreadTls() {
					let e = this.#t?.exports;
					for (let [t, n] of this.#$n) e?.gex_wasmprog_tls_free?.(t, n);
					this.#$n = [];
				}
				#ar(e, t, n, r = null) {
					this.#xr = n;
					let i = r ? WebAssembly.Module.exports(r).map((e) => e.name) : [],
						a = !S.on && i.includes(`__gex_snap_resume64`);
					((this.#vr = a),
						a &&
							(this.#Cr ??= new WebAssembly.Global(
								{ value: `i32`, mutable: !0 },
								0,
							)));
					let o = i.includes(`__gex_snap_blocks`),
						s = this.#t.exports,
						c = () => this.#Ce,
						l = () => new DataView(this.#e.buffer),
						u = () => {
							let t = this.#wr,
								n = this.#In;
							(n && l().setUint32(t + 16, Number(n.value) >>> 0, !0),
								(this.#Tr = !0),
								e(1, t));
						},
						d = i.includes(`__gex_snap_resume64`),
						f = (e) => {
							let t = l().getBigUint64(Number(e) >>> 0, !0);
							return !!n().exports.__gex_snap_blocks(
								d ? t : Number(BigInt.asIntN(32, t)),
							);
						},
						p = (e) => {
							let t = n().exports;
							if (!f(e)) return !1;
							if (!this.#wr && t.__gex_snap_ready) {
								let n = Number(e) >>> 0,
									r = new Uint8Array(this.#e.buffer, n, 264).slice();
								(t.__gex_snap_ready(),
									new Uint8Array(this.#e.buffer, n, 264).set(r));
							}
							return !!this.#wr && this.#yr();
						};
					return {
						...(o
							? {
									syscall: (n, r) => {
										let i = e(0, 0);
										if (i === 2) {
											e(4, 0);
											let t = this.#In;
											if (t) {
												let e = l().getUint32(this.#wr + 16, !0);
												t.value =
													typeof t.value == `bigint` ? BigInt(e) : e | 0;
											}
										} else if (i !== 0)
											throw Error(`gex.syscall in asyncify state ${i}`);
										else if (!this.#Er && c()?.k_snap_pending?.() && p(n)) {
											u();
											return;
										}
										let a = this.#wr && f(n);
										(t(n, r), a && s.gex_snap_stopped?.() && u());
									},
								}
							: {}),
						snap_wanted: () => +!this.#Er,
						snap_register: (e, t) => {
							((this.#wr = Number(e) >>> 0),
								(this.#Sr = this.#wr ? t : 0),
								this.#hr(),
								s.gex_snap_enable?.(this.#wr && !this.#Er ? 1 : 0));
						},
						snap_entry_rewind: (e) => {
							this.#lr(Number(e) >>> 0, 0, Number(s.gex_snap_ctx()));
						},
						...(a
							? { call_out: (e, t, n, r) => this.#ur(e >>> 0, t, n, r) }
							: {}),
						snap_unwinding: () => {
							let e = this.#Tr;
							return ((this.#Tr = !1), e ? this.#wr : 0);
						},
						snap_park: (e) => this.#or(e),
					};
				}
				#or(e) {
					let t = this.#t.exports,
						n = () => this.#Ce,
						r = () => new DataView(this.#e.buffer),
						i = this.#ye?.memory;
					if (!i || !n()) throw Error(`gex.snap_park: no global kernel`);
					let a = new Int32Array(i.buffer),
						o = (n().k_snap_word() >>> 0) >>> 2,
						s = Number(e) >>> 0,
						c = r();
					if (n().k_snap_extents_at) {
						let e = (n().k_snap_extents_at() >>> 0) >>> 2;
						Atomics.compareExchange(a, e, 0, 1) === 0 && n().k_snap_extents();
					}
					for (
						this.#r.snapParked?.({
							pid: t.gex_my_pid?.() ?? 0,
							tid: t.gex_snap_tid?.() ?? this.#Ka,
							rec: s,
							entry: c.getUint32(s + 8, !0),
							start: c.getUint32(s + 12, !0),
							maxPages: sn() ?? jr,
							moduleStore: this.#fa ?? void 0,
						});
						Atomics.load(a, o) !== 0;
					)
						Atomics.wait(a, o, Atomics.load(a, o), 1e3);
				}
				#sr(e, t, n, r, i = 0, a = 0n, o = 0) {
					let s = this.#xr().exports,
						c = this.#wr;
					if (!this.#Tr || !c)
						throw Error(
							`snapshot: an unwind not the snapshot's reached the entry`,
						);
					((this.#Tr = !1), s.asyncify_stop_unwind());
					let l = this.#Cr.value - 1,
						u = new DataView(this.#e.buffer),
						d = c + fr + l * pr;
					if (
						(u.getUint32(c + dr, !0) === 0 && u.setUint32(c + dr, l + 1, !0),
						u.setUint32(d, e, !0),
						u.setUint32(d + 4, t >>> 0, !0),
						u.setUint32(d + 8, i >>> 0, !0),
						u.setUint32(d + 12, o >>> 0, !0),
						u.setBigUint64(d + 24, BigInt.asUintN(64, BigInt(a)), !0),
						u.setBigUint64(d + 32, BigInt.asUintN(64, BigInt(r)), !0),
						s.__gex_snap_fill(BigInt(c)),
						l > 0)
					)
						throw (e === 0 && this.#Cr.value--, yr);
					(u.setUint32(c + 20, t >>> 0, !0),
						ur && this.#pr(c),
						this.#or(c),
						new DataView(this.#e.buffer).setUint32(c + dr, 0, !0),
						s.asyncify_start_rewind(c));
				}
				#cr(e, t, n, r, i, a, o) {
					if (!this.#vr) return e(n, r, i, a);
					let s = this.#xr().exports,
						c = this.#Cr;
					c.value++;
					try {
						for (;;) {
							if ((e(n, r, i, a), s.asyncify_get_state() !== 1)) return;
							this.#sr(1, t, n, o, r, i, a);
						}
					} finally {
						c.value--;
					}
				}
				#lr(e, t, n) {
					let r = this.#t.exports,
						i = new DataView(this.#e.buffer),
						a = e + fr + t * pr,
						o = i.getUint32(a, !0),
						s = i.getUint32(a + 4, !0),
						c = i.getBigUint64(a + 32, !0),
						l = this.#xr().exports;
					if (o === 2) {
						if ((this.#gr || this.#Mn(), !this.#gr))
							throw Error(
								`snapshot: a level in Wine's PE module, which this thread has not installed`,
							);
						let r = this.#gr.inst.exports,
							a = e + hr + t * gr;
						return (
							r.asyncify_start_rewind(this.#mr(e)),
							r.__gexw_entry(
								i.getInt32(a, !0),
								i.getInt32(a + 4, !0),
								i.getInt32(a + 8, !0),
								i.getBigUint64(a + 16, !0),
								i.getBigUint64(a + 24, !0),
							),
							this.#ca(n)
						);
					}
					if (o === 0) (l.asyncify_start_rewind(e), this.#Bn(s, n, c));
					else {
						let t = this.#Jt().ftab.get(Nn(s)),
							o = r.gex_guest_x86_64?.() === 1,
							u = i.getBigUint64(a + 24, !0),
							d = this.#Gn(),
							f = d.value;
						if (typeof f == `bigint`)
							d.value = ((f !== 0n && f < c ? f : c) - 4096n) & -16n;
						else {
							let e = Number(c & 4294967295n),
								t = Number(f) >>> 0;
							d.value = (((t !== 0 && t < e ? t : e) - 4096) & -16) | 0;
						}
						try {
							(l.asyncify_start_rewind(e),
								this.#cr(
									t,
									s,
									n,
									i.getUint32(a + 8, !0) | 0,
									o ? u : Number(BigInt.asUintN(32, u)) | 0,
									i.getUint32(a + 12, !0) | 0,
									c,
								));
						} finally {
							d.value = f;
						}
					}
					if (!r.gex_snap_entry_tail(n))
						throw Error(
							`snapshot: a restored thread's call left another context to resume`,
						);
					return this.#ca(n);
				}
				#ur(e, t, n, r) {
					let i = this.#xr().exports,
						a = this.#wr;
					if (i.asyncify_get_state() === 2) {
						i.asyncify_stop_rewind();
						let o = this.#Cr.value,
							s = new DataView(this.#e.buffer).getUint32(
								a + fr + o * pr + 16,
								!0,
							),
							c = this.#Gn();
						return (
							(c.value = typeof c.value == `bigint` ? BigInt(s) : s | 0),
							this.#$i(this.#ia(e, t, n, r, !1, () => this.#lr(a, o, e)))
						);
					}
					try {
						return this.#Zi(e, t, n, r);
					} catch (e) {
						if (e !== yr) throw e;
						let t = this.#Cr.value;
						return (
							new DataView(this.#e.buffer).setUint32(
								a + fr + t * pr + 16,
								Number(this.#Gn().value) >>> 0,
								!0,
							),
							(this.#Tr = !0),
							i.asyncify_start_unwind(a),
							0
						);
					}
				}
				#dr(e, t, n, r, i) {
					let a = this.#gr.inst.exports,
						o = this.#wr;
					if (!this.#_r || !o)
						throw Error(
							`snapshot: an unwind not the snapshot's reached an entry of Wine's PE module`,
						);
					((this.#_r = !1), a.asyncify_stop_unwind());
					let s = this.#Cr.value - 1,
						c = new DataView(this.#e.buffer),
						l = o + fr + s * pr,
						u = o + hr + s * gr;
					if (
						(c.getUint32(o + dr, !0) === 0 && c.setUint32(o + dr, s + 1, !0),
						c.setUint32(l, 2, !0),
						c.setUint32(l + 4, 0, !0),
						c.setInt32(u, e, !0),
						c.setInt32(u + 4, t, !0),
						c.setInt32(u + 8, n, !0),
						c.setBigUint64(u + 16, BigInt.asUintN(64, r), !0),
						c.setBigUint64(u + 24, BigInt.asUintN(64, i), !0),
						s > 0)
					)
						throw yr;
					(this.#xr().exports.__gex_snap_fill(BigInt(o)),
						c.setUint32(o + 20, 0, !0),
						ur && this.#pr(o),
						this.#or(o),
						new DataView(this.#e.buffer).setUint32(o + dr, 0, !0),
						a.asyncify_start_rewind(this.#mr(o)));
				}
				#fr(e, t, n, r) {
					let i = this.#gr,
						a = i.inst.exports,
						o = this.#wr,
						s = this.#Cr.value,
						c = this.#xn(),
						l = o + hr + s * gr;
					if (i.state.value === 2)
						return (
							a.asyncify_stop_rewind(),
							a.__gexw_snap_globals(1, BigInt(l + 40)),
							(c.value = new DataView(this.#e.buffer).getBigUint64(l + 80, !0)),
							this.#$i(this.#ia(e, t, n, r, !1, () => this.#lr(o, s, e)))
						);
					o &&
						s < mr &&
						(a.__gexw_snap_globals(0, BigInt(l + 40)),
						new DataView(this.#e.buffer).setBigUint64(l + 80, c.value, !0));
					try {
						return this.#Zi(e, t, n, r);
					} catch (e) {
						if (e !== yr || !o || s >= mr) throw e;
						return ((this.#_r = !0), a.asyncify_start_unwind(this.#mr(o)), 0);
					}
				}
				#pr(e) {
					let t = new DataView(this.#e.buffer),
						n = t.getUint32(e + dr, !0),
						r = Array.from({ length: n }, (n, r) =>
							t.getUint32(e + fr + r * pr, !0),
						);
					console.error(
						`[gex-snap] tid ${this.#Ka}: stopped, levels by route [${r.join(` `)}]`,
					);
				}
				#mr(e) {
					let t = new DataView(this.#e.buffer),
						n = e + hr + _r;
					return (
						t.getUint32(n + 4, !0) === 0 &&
							(t.setUint32(n, n + 8, !0), t.setUint32(n + 4, e + vr, !0)),
						n
					);
				}
				#hr() {
					let e = this.#wr;
					if (!this.#gr || !e) return;
					let t = new DataView(this.#e.buffer);
					t.getUint32(e + 4, !0) > e + hr &&
						t.getUint32(e, !0) < e + hr &&
						t.setUint32(e + 4, e + hr, !0);
				}
				#gr = null;
				#_r = !1;
				#vr = !1;
				#yr() {
					if (!this.#wr || this.#Er) return 0;
					let e = this.#Cr?.value ?? 0;
					if (
						this.#Sr & 1 &&
						e === 0 &&
						this.#Di.length === 0 &&
						this.#ki.length === 0
					)
						return 1;
					let t = this.#Di.length;
					if (
						this.#Sr & 2 &&
						e >= 1 &&
						e === t &&
						t <= mr &&
						this.#ki.length === t &&
						(t === 1 || this.#vr) &&
						this.#Di.every((e) => e.ri === -1)
					)
						return 1;
					if (ur && !this.#br) {
						this.#br = !0;
						let n = `?`;
						try {
							let e = new DataView(this.#e.buffer),
								t = Number(this.#t.exports.gex_snap_ctx()),
								r = e.getBigUint64(t + 32, !0);
							n = `0x${e.getBigUint64(t + 256, !0).toString(16)} rax 0x${e.getBigUint64(t, !0).toString(16)} ret 0x${e.getBigUint64(Number(r), !0).toString(16)}`;
						} catch {}
						console.error(
							`[gex-snap] tid ${this.#Ka}: not at a root (rec ${this.#wr}, root ${this.#Sr}, vfork ${this.#Er}, entry depth ${e}, call-outs ${t}${t > mr ? `, past the record's ${mr} levels` : ``} [${this.#Di.map((e) => e.ri).join(` `)}], nest ${this.#ki.length}, pc ${n})`,
						);
					}
					return 0;
				}
				#br = !1;
				#xr = null;
				#Sr = 0;
				#Cr = null;
				#wr = 0;
				#Tr = !1;
				#Er = 0;
				#Dr(e, t = null) {
					let n = this.#t.exports,
						r = [
							`asyncify_get_state`,
							`asyncify_start_unwind`,
							`asyncify_stop_unwind`,
							`asyncify_start_rewind`,
							`asyncify_stop_rewind`,
						],
						i = (t, n) => {
							let i = e().exports[r[t]];
							if (!i) {
								if (t === 0) return 0;
								throw Error(
									`gex.asyncify: the program has no ${r[t]} (fork needs wcc's asyncify)`,
								);
							}
							return t === 0 ? i() : (t === 1 || t === 3 ? i(n) : i(), 0);
						},
						a = () => {
							if (n.gex_wasmprog_staged()) {
								if (!S.on) {
									let e = n.gex_vfork_ok?.() ?? 0;
									e > 0 ? this.#Ot() : e !== -2 && this.#Pt(e);
								}
								(this.#It()?.catch((e) =>
									console.error(`[gex] starting a process: ${e.message ?? e}`),
								),
									this.#Tt());
							}
						},
						o = (e, t) => {
							(n.gex_syscall(e, t), a());
							let r = n.gex_wasmprog_dl_gen?.();
							r !== void 0 && r !== this.#er && ((this.#er = r), this.#Mn());
						};
					return {
						syscall: S.on ? this.#Ii(o, a) : (n.gex_wasmprog_syscall ?? o),
						dl_size: this.#tr,
						dl_stale: () => {
							((this.#er = n.gex_wasmprog_dl_gen?.() ?? this.#er),
								n.gex_wasmprog_dl_seen?.(),
								this.#Mn());
						},
						asyncify: i,
						...this.#ar(i, S.on ? this.#Ii(o, a) : o, e, t),
						i386_bind: (e, t) => n.gex_libprov_i386_bind(jn(e), t >>> 0),
						fork_point: (e) => {
							let t = i(0, 0);
							if (t === 0) i(1, e);
							else if (t === 2) i(4, 0);
							else throw Error(`gex.fork_point in asyncify state ${t}`);
						},
						dlopen: (e, t, r) => {
							let i = n.gex_wasmprog_dlopen(jn(e), jn(t), r) >>> 0;
							if (!i) return 0;
							this.#Mn();
							let a = this.#Jt(),
								o = [];
							for (let e = 0, t; (t = n.gex_wasmprog_dl_new(e)) >= 0; e++)
								o.push(t);
							for (let e of o) a.dyl.get(e)?.exports.__wasm_call_ctors?.();
							return i | 0;
						},
						dlsym: (e, t) => n.gex_wasmprog_dlsym(e, jn(t)) | 0,
						door_publish: (e) => this.#Fr(e >>> 0),
						door_call: (e, t, n) => this.#Yr(V(e), t, n, !1),
						door_call_lp64: (e, t, n) => this.#Yr(V(e), t, n, !0),
						door_missing: () =>
							(this.#Ar && this.#Hr(this.#Ar)) || S.on ? 0 : 1,
						exec_fresh: () => {
							n.gex_exec_fresh?.();
						},
						space_top: () => (n.gex_space_top?.() ?? 0) | 0,
						session_copy: (e, t, n) => this.#Br(V(e), t >>> 0, n >>> 0),
						session_seq: (e) => this.#Vr(e >>> 0),
						usd_copy: (e, t) => this.#Ir(V(e), t >>> 0, !1),
						usd_publish: (e, t) => this.#Ir(V(e), t >>> 0, !0),
						kuser_address: () =>
							(n.gex_kuser_address ? n.gex_kuser_address() : 2147352576) | 0,
						wake_pipe: (e) => this.#t.exports.gex_fd_pipe_id?.(e) ?? -1,
						wake_write: (e, t, n) =>
							this.#Ce?.k_pipe_write?.(e, jn(t), n >>> 0) ?? -38,
						wake_close: () => {},
					};
				}
				#Or = null;
				#kr = ``;
				#Ar = null;
				#jr = null;
				#Mr = null;
				#Nr = null;
				#Pr = {
					calls: 0,
					fallbacks: 0,
					proxies: 0,
					t0: 0,
					nodoor: 0,
					hi: 0,
					tPre: 0,
					tDisp: 0,
					tPost: 0,
					T2: 0,
					tSys: 0,
					sys: 0,
					tProxy: 0,
					byNr: {},
				};
				#Fr(e) {
					let t = this.#Or;
					if (!t || S.on) return;
					let n = this.#t.exports,
						r = new DataView(this.#e.buffer),
						i = r.getInt32(e + 68, !0),
						a = n.gex_fd_pipe_id?.(i) ?? -1;
					if (a < 0) {
						console.error(
							`[gex-door] the server's kick fd ${i} is not a global pipe: no doors`,
						);
						return;
					}
					let o = r.getUint32(e + 136, !0);
					if (o < 1120) {
						console.error(
							`[gex-door] the server's door context is ${o} bytes, under gex's 1120: no doors`,
						);
						return;
					}
					let s = {
						memory: this.#e,
						module: t.module,
						base: t.base,
						memBase: t.memBase,
						binds: t.binds ?? ``,
						packed: !!t.packed,
						area: e,
						kickId: a,
						pid: r.getInt32(e + 112, !0),
						id: `${Date.now()}:${e}`,
					};
					(globalThis.GEX_DOOR_TRACE &&
						console.error(
							`[gex-door] wineserver pid ${s.pid} published its door (area ${e})`,
						),
						this.#jr && Atomics.store(this.#jr, 0, s.pid),
						this.#r.publishDoor?.(s));
				}
				#Ir(e, t, n) {
					let r = this.#Ar;
					if (!r || S.on || !this.#Hr(r)) return -1;
					let { u8: i, dv: a } = this.#Ur(),
						o = a.getUint32(r.area + 140, !0);
					if (!o) return -1;
					let s = Math.min(t, 4096);
					return (
						n
							? i.set(this.#Ye().subarray(e, e + s), o)
							: this.#Ye().set(i.subarray(o, o + s), e),
						s
					);
				}
				#Lr = 0;
				#Rr = null;
				#zr() {
					let e = this.#Ar;
					if (!e || !this.#Hr(e)) return null;
					let t = this.#Rr;
					if (t && t.door === e && t.u8.length >= t.end) return t;
					let n = this.#Ur(),
						r = n.dv.getUint32(e.area + 128, !0),
						i = n.dv.getUint32(e.area + 132, !0);
					return !r ||
						!i ||
						((t = {
							door: e,
							base: r,
							len: i,
							end: r + i,
							u8: n.u8,
							i64: n.i64,
						}),
						n.u8.length < t.end)
						? null
						: (this.#Rr = t);
				}
				#Br(e, t, n) {
					globalThis.GEX_SESSION_TRACE &&
						!(++this.#Lr % 2e4) &&
						console.error(`[session] copy ${this.#Lr} off ${t} size ${n}`);
					let r = this.#zr();
					if (!r) return -1;
					if (!n) return r.len;
					if (t >= r.len) return -1;
					let i = Math.min(n, r.len - t);
					return (
						this.#Qr(e + i).u8.set(
							r.u8.subarray(r.base + t, r.base + t + i),
							e,
						),
						i
					);
				}
				#Vr(e) {
					globalThis.GEX_SESSION_TRACE &&
						!(++this.#Lr % 2e4) &&
						console.error(`[session] seq ${this.#Lr} off ${e}`);
					let t = this.#zr();
					if (!t) return 0n;
					let n = t.base + e;
					return n & 7
						? new DataView(t.u8.buffer).getBigInt64(n, !0)
						: Atomics.load(t.i64, n / 8);
				}
				setDoorWord(e) {
					this.#jr = e ?? null;
				}
				#Hr(e) {
					let t = this.#jr;
					return !t || Atomics.load(t, 0) === e.pid;
				}
				setDoor(e) {
					this.#Ar?.id !== e?.id &&
						((this.#Ar = e), (this.#Mr = null), (this.#Nr = null));
				}
				#Ur() {
					let e = this.#Ar.memory.buffer,
						t = this.#Nr;
					return (
						(!t || t.buf !== e || t.len !== e.byteLength) &&
							(t = this.#Nr =
								{
									buf: e,
									len: e.byteLength,
									u8: new Uint8Array(e),
									i32: new Int32Array(e),
									i64: new BigInt64Array(e, 0, Math.floor(e.byteLength / 8)),
									dv: new DataView(e),
								}),
						t
					);
				}
				#Wr(e) {
					let t = this.#Ur(),
						n = e.area,
						r = t.dv.getUint32(n + 52, !0),
						i = new WebAssembly.Global({ value: `i32`, mutable: !0 }, r),
						a = [],
						o = [],
						s = e.base + Sn(e.module);
					for (let t of e.binds.split(`
`)) {
						if (!t) continue;
						let e = t.split(`	`);
						if (e[0] === `X`)
							(a.push([Number(e[1]), e[2]]),
								(s = Math.max(s, Number(e[1]) + 1)));
						else if (e[0] === `G`) o.push(e);
						else if (e[0] === `S`)
							e[1] === `env` &&
								e[2].startsWith(`__asyncify_`) &&
								o.push([`G`, `env`, e[2], `0`, `1`]);
						else
							throw Error(
								`door: the server program's binding ${e[0]} ${e[1]}.${e[2]} is not supported`,
							);
					}
					let c = new WebAssembly.Table({ element: `anyfunc`, initial: s });
					class l extends Error {}
					let u = this.#Pr,
						d = globalThis.GEX_DOOR_STATS
							? (e) => {
									let t = performance.now();
									try {
										this.#Gr(e >>> 0, l);
									} finally {
										(u.sys++, (u.tSys += performance.now() - t));
									}
								}
							: (e) => this.#Gr(e >>> 0, l),
						f = {
							env: {
								memory: e.memory,
								__indirect_function_table: c,
								__stack_pointer: i,
								__memory_base: new WebAssembly.Global(
									{ value: `i32`, mutable: !1 },
									e.memBase | 0,
								),
								__table_base: new WebAssembly.Global(
									{ value: `i32`, mutable: !1 },
									e.base | 0,
								),
							},
							gex: {
								syscall: d,
								asyncify: (e) => {
									if (e === 0) return 0;
									throw Error(`gex.asyncify: no fork inside a door call`);
								},
								snap_wanted: () => 0,
								snap_register: () => {},
								snap_unwinding: () => 0,
								wake_pipe: () => -1,
								wake_write: (e, t, n) => this.#qr(e, t >>> 0, n >>> 0),
								wake_close: () => {},
								clock_ns: this.#t.exports.gex_clock_ns,
							},
						};
					for (let e of o)
						(f[e[1]] ??= {})[e[2]] = new WebAssembly.Global(
							{ value: `i32`, mutable: e[4] === `1` },
							Number(e[3]) | 0,
						);
					for (let t of WebAssembly.Module.imports(e.module))
						t.kind === `function` &&
							!f[t.module]?.[t.name] &&
							((f[t.module] ??= {})[t.name] = () => {
								throw Error(
									`${t.module}.${t.name}: not available inside a door call`,
								);
							});
					let p = new WebAssembly.Instance(e.module, f);
					if (!e.packed) for (let [e, t] of a) c.set(e, p.exports[t]);
					let m = t.dv.getUint32(n + 72, !0),
						h = t.dv.getUint32(n + 76, !0);
					(t.dv.setUint32(m + 32, h, !0), t.dv.setUint32(m + 36, 0, !0));
					try {
						throw (
							c.get(t.dv.getUint32(n + 108, !0))(m, 0, 0, 0n),
							Error(`door: __gex_thread_start returned`)
						);
					} catch (e) {
						if (!(e instanceof l)) throw e;
					}
					return {
						door: e,
						dispatch: c.get(t.dv.getUint32(n + 60, !0)),
						sp: i,
						stackTop: r,
						lazyTime: t.dv.getInt32(n + 40, !0) >= 2,
						bootNs:
							BigInt(this.#Ce?.k_boot_secs?.(0) ?? 0) * 1000000000n +
							this.#ut(),
					};
				}
				#Gr(e, t) {
					let n = this.#Ar,
						{ dv: r, i32: i } = this.#Ur(),
						a = r.getUint32(e, !0),
						o = (t) => r.getUint32(e + t * 8, !0),
						s = (t) => {
							(r.setUint32(e, t >>> 0, !0), r.setUint32(e + 4, 0, !0));
						};
					switch (a) {
						case 1:
						case 252:
							throw new t();
						case 20:
						case 224:
							s(n.pid);
							return;
						case 265:
						case 403:
						case 78: {
							let e = o(3),
								t = o(a === 78 ? 3 : 1);
							if (
								a === 78 ||
								e === 0 ||
								e === 5 ||
								e === 8 ||
								[1, 4, 6, 7, 9].includes(e)
							) {
								if (!t) {
									s(a === 78 ? 0 : -14);
									return;
								}
								let n = this.#r.now(),
									i =
										a !== 78 && [1, 4, 6, 7, 9].includes(e)
											? this.#ft(n)
											: n - this.#ct().shift * 1000000000n,
									o = Number(i / 1000000000n),
									c = Number(i % 1000000000n);
								(a === 403
									? (r.setBigUint64(t, BigInt(o), !0),
										r.setBigUint64(t + 8, BigInt(c), !0))
									: (r.setUint32(t, o >>> 0, !0),
										r.setUint32(t + 4, a === 78 ? Math.floor(c / 1e3) : c, !0)),
									s(0));
								return;
							}
							break;
						}
					}
					let c = n.area;
					i[(c + 8) >> 2] = a;
					let l = [3, 1, 2, 6, 7, 5];
					for (let e = 0; e < 6; e++) i[(c + 12 + 4 * e) >> 2] = o(l[e]);
					let u = r.getUint32(c + 96, !0);
					(u && a < 512 && Atomics.add(i, (u >> 2) + a, 1),
						Atomics.add(i, (c + 100) >> 2, 1));
					let d = this.#Pr;
					d.proxies++;
					let f = globalThis.GEX_DOOR_STATS ? performance.now() : 0;
					for (
						Atomics.store(i, (c + 4) >> 2, 1),
							Atomics.notify(i, c >> 2),
							this.#Jr();
						Atomics.load(i, (c + 4) >> 2) !== 2;
					)
						Atomics.wait(i, (c + 4) >> 2, 1, 5);
					let p = i[(c + 36) >> 2];
					(Atomics.store(i, (c + 4) >> 2, 0),
						f &&
							((d.tProxy += performance.now() - f),
							(d.byNr[a] = (d.byNr[a] ?? 0) + 1)),
						s(p));
				}
				#Kr = 0;
				#qr(e, t, n) {
					if (n > 64 || !this.#Kr) return -22;
					let { u8: r } = this.#Ur();
					return (
						this.#Ye().set(r.subarray(t, t + n), this.#Kr),
						this.#Ce?.k_pipe_write?.(e, BigInt(this.#Kr), n) ?? -38
					);
				}
				#Jr() {
					this.#Ce?.k_pipe_write?.(this.#Ar.kickId, 0n, 1);
				}
				#Yr(e, t, n, r) {
					if (this.#Xr) return this.#ni(e, t, n, r);
					let i = this.#Ar;
					return !i || S.on ? 1 : this.#ei(i, e, t, n, null, r);
				}
				#Xr = !!globalThis.GEX_DOOR_STATS;
				#Zr = null;
				#Qr(e) {
					let t = this.#Zr;
					if (!t || e > t.u8.length) {
						let e = this.#e.buffer;
						t = this.#Zr = Ut(e);
					}
					return t;
				}
				#$r(e) {
					let t = this.#Nr;
					return t && e <= t.len ? t : this.#Ur();
				}
				#ei(e, t, n, r, i, a) {
					let o = B(),
						s = i ? performance.now() : 0;
					this.#Kr = t;
					let c = this.#Qr(t + (a ? 160 : 136)),
						l = c.dv,
						u = l.getUint32(t + 4, !0),
						d = l.getUint32(t + 8, !0),
						f = Math.min(l.getUint32(t + 64, !0), 16),
						p = d
							? o
								? Number(l.getBigUint64(t + 72, !0))
								: l.getUint32(t + (a ? 72 : 68), !0)
							: 0;
					i && p + d > i.hi && (i.hi = p + d);
					let m = a ? 80 : 72,
						h = a ? 16 : 8,
						g = e.area,
						_ = e.kBuf,
						v = e.kBufSize;
					if (_ === void 0) {
						let t = this.#$r(g + 144);
						((_ = e.kBuf = t.dv.getUint32(g + 44, !0)),
							(v = e.kBufSize = t.dv.getUint32(g + 48, !0)));
					}
					let { u8: y, i32: b, dv: x } = this.#$r(_ + v);
					if (((64 + u + 7) & -8) + 64 + d > v) return (i && i.fallbacks++, 1);
					let S = g >> 2;
					if (
						b[(g + 124) >> 2] !== 0 ||
						!this.#Hr(e) ||
						(Atomics.compareExchange(b, S, 0, 1) !== 0 &&
							!this.#ti(b, g, S, n, r))
					)
						return 1;
					((b[(g + 116) >> 2] = r), (b[(g + 120) >> 2] = n));
					let C;
					try {
						let a = this.#Mr;
						if (
							((!a || a.door !== e) && (a = this.#Mr = this.#Wr(e)),
							!o && !((t | _) & 3))
						) {
							let e = c.i32,
								n = t >>> 2,
								r = _ >>> 2;
							for (let t = 0; t < 16; t++) b[r + t] = e[n + t];
						} else y.set(c.u8.subarray(t, t + 64), _);
						let l = _ + 64;
						for (let e = 0; e < f; e++) {
							let n = t + m + h * e;
							n + h > c.u8.length && (c = this.#Qr(n + h));
							let r = o
									? Number(c.dv.getBigUint64(n, !0))
									: c.dv.getUint32(n, !0),
								a = c.dv.getUint32(n + h / 2, !0);
							(i && r + a > i.hi && (i.hi = r + a),
								r + a > c.u8.length && (c = this.#Qr(r + a)),
								y.set(c.u8.subarray(r, r + a), l),
								(l += a));
						}
						a.sp.value = a.stackTop;
						let u = i ? performance.now() : 0;
						if (a.lazyTime) C = a.dispatch(n, r, 0n, 1n) >>> 0;
						else {
							let e = this.#r.now(),
								t = this.#ct(),
								i = e - t.shift * 1000000000n,
								o = t.scale === 1 ? e - a.bootNs : this.#ft(e);
							C =
								a.dispatch(n, r, i / 100n + 116444736000000000n, o / 100n) >>>
								0;
						}
						if (i) {
							let e = performance.now();
							((i.tPre += u - s), (i.tDisp += e - u), (i.T2 = e));
						}
						if (C === 4294967295) (i && i.fallbacks++, (C = 1));
						else if (C === 4294967294) C = 2;
						else {
							let e = _ + C;
							if (
								((c = this.#Qr(Math.max(t + 64, p + d))), !o && !((t | e) & 3))
							) {
								let n = c.i32,
									r = e >>> 2,
									i = t >>> 2;
								for (let e = 0; e < 16; e++) n[i + e] = b[r + e];
							} else c.u8.set(y.subarray(e, e + 64), t);
							let n = Math.min(x.getUint32(e + 4, !0), d);
							(n && p && c.u8.set(y.subarray(e + 64, e + 64 + n), p),
								i && i.calls++,
								(C = 0));
						}
					} catch (e) {
						((this.#Mr = null),
							Atomics.store(b, (g + 124) >> 2, r || -1),
							console.error(
								`[gex-door] the wineserver trapped in a door call (pid ${n} tid ${r}); the server is poisoned: ${e?.stack ?? e}`,
							),
							(C = 1));
					}
					let w = (g + 80) >> 2,
						T = b[w] !== 0;
					return (
						T && (b[w] = 0),
						Atomics.exchange(b, S, 0) === 2 && Atomics.notify(b, S),
						T && this.#Jr(),
						C
					);
				}
				#ti(e, t, n, r, i) {
					let a = 0;
					for (let o = 0; ; o++) {
						let s = Atomics.compareExchange(e, n, 0, 1);
						if (s === 0) return !0;
						if (!(o < 200)) {
							if (
								Atomics.load(e, (t + 124) >> 2) !== 0 ||
								!this.#Hr(this.#Ar ?? {}) ||
								(this.#wr && this.#Ce?.k_snap_pending?.())
							)
								return !1;
							(s !== 1 || Atomics.compareExchange(e, n, 1, 2) === 1) &&
								(Atomics.wait(e, n, 2, 1),
								++a % 5e3 == 0 &&
									console.error(
										`[gex-door] pid ${r} tid ${i}: ${a / 1e3} s waiting for the door lock, held by tid ${e[(t + 116) >> 2]} (proxy state ${e[(t + 4) >> 2]})`,
									));
						}
					}
				}
				#ni(e, t, n, r) {
					let i = this.#Ar,
						a = this.#Pr;
					if (!i || S.on)
						return (
							a.nodoor++ & 16383 ||
								console.error(
									`[gex-door] pid ${t} tid ${n}: no door here (${a.nodoor} calls)`,
								),
							1
						);
					a.hi = Math.max(a.hi, e);
					let o = this.#ei(i, e, t, n, a, r),
						{ i32: s, dv: c } = this.#Ur(),
						l = i.area,
						u = performance.now();
					if (((a.T2 &&= ((a.tPost += u - a.T2), 0)), !a.t0)) a.t0 = u;
					else if (
						u - a.t0 >=
							(globalThis.GEX_DOOR_STATS > 1
								? globalThis.GEX_DOOR_STATS
								: 1e4) ||
						a.calls + a.fallbacks >= 5e4
					) {
						let e = c.getUint32(l + 96, !0) >> 2,
							r = [];
						if (e)
							for (let t = 0; t < 512; t++) s[e + t] && r.push([s[e + t], t]);
						(r.sort((e, t) => t[0] - e[0]),
							console.error(
								`[gex-door] pid ${t} tid ${n}: ${a.calls} door calls, ${a.fallbacks} fallbacks, ${a.proxies} proxies in ${Math.round(u - a.t0)} ms; server: ${s[(l + 104) >> 2]} calls, ${s[(l + 100) >> 2]} proxies (${r
									.slice(0, 16)
									.map(([e, t]) => `${t}:${e}`)
									.join(
										` `,
									)}); per call us: in ${((a.tPre / a.calls) * 1e3).toFixed(2)} dispatch ${((a.tDisp / a.calls) * 1e3).toFixed(2)} out ${((a.tPost / a.calls) * 1e3).toFixed(2)}; in-door syscalls ${a.sys} (${((a.tSys / Math.max(1, a.sys)) * 1e3).toFixed(2)} us each); proxied ${a.proxies} waited ${a.tProxy.toFixed(1)} ms [${Object.entries(
									a.byNr,
								)
									.sort((e, t) => t[1] - e[1])
									.slice(0, 6)
									.map(([e, t]) => `${e}:${t}`)
									.join(
										` `,
									)}]; in doors ${(a.tPre + a.tDisp + a.tPost).toFixed(1)} ms; highest client address 0x${a.hi.toString(16)}`,
							),
							(a.tPre = a.tDisp = a.tPost = a.tSys = a.sys = a.tProxy = 0),
							(a.byNr = {}),
							(a.t0 = u),
							(a.calls = a.fallbacks = a.proxies = 0));
					}
					return o;
				}
				#ri() {
					let e = this.#t.exports,
						t = e.gex_wasmprog_serve?.() ?? -1;
					t < 0 ||
						(this.#oi((e.gex_ftab_log_len?.() >>> 0) - (this.#Gt?.have ?? 0)),
						this.#Mn(),
						e.gex_cgen_pmod_installed(t),
						e.gex_wasmprog_ready?.());
				}
				#ii = !1;
				#ai = -1;
				#oi(e) {
					let t = this.#t.exports,
						n = t.gex_exec_gen?.() ?? 0,
						r =
							n === this.#ai
								? `its parent's program`
								: S.on
									? `single-thread build`
									: typeof this.#r.offerSpare == `function`
										? e < Bn()
											? `few modules`
											: Wt(this.#e?.buffer)
												? ``
												: `memory not shared`
										: `no offerSpare`;
					(R(`spare`) &&
						console.warn(
							`[spare] pid ${t.gex_my_pid?.() ?? `?`}: program ${n} with ${e} modules, ${r ? `no spare (${r})` : `offered`}`,
						),
						(this.#ai = n),
						!r &&
							((this.#fa ??= Gt()),
							this.#r.offerSpare({
								memory: this.#e,
								moduleStore: this.#fa,
								compat: t.gex_compat?.() ?? 0,
								procOpts: this.#_e,
								execGen: n,
							})));
				}
				#si(t) {
					if (!e.wasmDlls) return t.gex_syscall;
					let n = () => {
							t.gex_wasmprog_staged() &&
								(this.#It()?.catch((e) =>
									console.error(`[gex] starting a process: ${e.message ?? e}`),
								),
								this.#Tt());
						},
						r = (e, r) => {
							(t.gex_syscall(e, r), n());
						};
					return S.on ? this.#Ii(r, n) : (t.gex_staged_syscall ?? r);
				}
				#ci = (e, t) => {
					(this.#t.exports.gex_syscall(
						e,
						BigInt.asIntN(64, BigInt(t) | (1n << 61n)),
					),
						this.#li());
				};
				#li = () => {
					this.#t.exports.gex_wasmprog_staged() &&
						(this.#It()?.catch((e) =>
							console.error(`[gex] starting a process: ${e.message ?? e}`),
						),
						this.#Tt());
				};
				#ui = null;
				get #di() {
					return S.on
						? (this.#ui ??= this.#Ii(this.#ci, this.#li, 1n << 61n))
						: (this.#t.exports.gex_provider_syscall ?? this.#ci);
				}
				#fi(e) {
					if (e & 1) {
						if (e & 2) {
							let e = this.#t.exports.gex_vfork_ok?.() ?? 0;
							e > 0 ? this.#Ot() : e !== -2 && this.#Pt(e);
						}
						(this.#It()?.catch((e) =>
							console.error(`[gex] starting a process: ${e.message ?? e}`),
						),
							this.#Tt());
					}
					e & 4 && this.#Mn();
				}
				#pi = (e, t) => {
					let n = this.#t.exports,
						r = BigInt.asUintN(64, BigInt(t));
					if (!(r & (1n << 61n))) return n.gex_syscall(e, t);
					let i = n.__stack_pointer.value,
						a = this.#Un();
					try {
						return n.gex_syscall(e, t);
					} catch (t) {
						if (
							t?.gexHandoff ||
							!n.gex_handoff() ||
							((t.gexHandoff = !0), n.gex_exited?.())
						)
							throw t;
						if (n.gex_native_left?.()) {
							let r = this.#Di.at(-1),
								o = new DataView(this.#e.buffer).getBigUint64(
									Number(e) + this.#sa(),
									!0,
								);
							if (
								r &&
								this.#ki.at(-1)?.startsWith(`callout`) &&
								r.ret === Xn &&
								o > r.spWant + r.unwound
							)
								throw ((t.gexNativeLeft = !0), t);
							((n.__stack_pointer.value = i),
								this.#Wn(a),
								n.gex_resume_pc(),
								n.gex_resume_ctx());
							return;
						}
						let o = r & ~(1n << 61n),
							s = this.#Me(),
							c = BigInt.asUintN(64, s === 0n ? BigInt(n.gex_resume_pc()) : s),
							l = s === 0n ? n.gex_resume_ctx() >>> 0 : this.#Pe();
						if (c !== o || (l && l !== e >>> 0)) throw t;
						if ((this.#Wn(a), s !== 0n)) {
							this.traps.native++;
							return;
						}
						if ((this.traps.nativeFull++, n.gex_jit_pending_len() >>> 0)) {
							let e = (n.gex_jit_pending_slots?.() ?? 0) >>> 0;
							e && this.#wi(e, `call-out`);
						}
						for (; n.gex_jit_pending_len() >>> 0; ) this.#ya();
						(this.#Da(), this.#mi(), this.#Tt());
					}
				};
				#mi() {
					let e = this.#t.exports;
					if (!e.gex_thread_gone?.()) {
						if ((this.#ri(), e.gex_elfprov_wanted)) {
							let t = !1;
							for (
								let n = e.gex_elfprov_wanted();
								n >= 0;
								n = e.gex_elfprov_wanted()
							)
								(this.#kn(n), (t = !0));
							t && this.#Mn();
							let n = e.gex_elfprov_rebridge_len() >>> 0;
							if (n) {
								this.#Mn();
								let t = this.#Jt(),
									r = e.gex_alloc(4 * n) >>> 0,
									i;
								try {
									let t = e.gex_elfprov_rebridge(r, n) >>> 0;
									i = new Uint32Array(this.#e.buffer.slice(r, r + 4 * t));
								} finally {
									e.gex_free?.(r, 4 * n);
								}
								let a = this.#wi(
										e.gex_elfprov_rebridge_need() >>> 0,
										`elfprov`,
									),
									o = this.#n.exports.blocks;
								(o && this.#do(),
									this.#lo(a, o, i, t.bridge),
									this.#ao && (this.#ao.bridged += i.length >>> 1));
							}
						}
						if (!(this.#Ht & 3) && e.gex_fjit_on?.()) {
							this.#Mn();
							return;
						}
						if (!(this.#Ht & 3) || !e.gex_cgen_wanted) {
							e.gex_ftab_behind?.() && this.#Mn();
							return;
						}
						for (let t = e.gex_cgen_wanted(); t >= 0; t = e.gex_cgen_wanted()) {
							let n = performance.now();
							if (e.gex_cgen_icall_path) {
								let n =
										this.#r.loadFile?.(this.#Kt(e.gex_cgen_icall_path, t)) ??
										null,
									r = n
										? n instanceof Uint8Array
											? n
											: new Uint8Array(n)
										: null,
									i = r ? e.gex_alloc(Math.max(8, r.byteLength)) >>> 0 : 0;
								(r && this.#Ye().set(r, i),
									e.gex_cgen_set_icall(t, i, r ? r.byteLength : 0),
									r && e.gex_free?.(i, Math.max(8, r.byteLength)));
							}
							let r = this.#Kt(e.gex_cgen_key, t),
								i = this.#Kt(e.gex_cgen_path, t),
								a = e.gex_cgen_group ? this.#yi(r) : null;
							if (a) {
								(e.gex_cgen_hold(t),
									a.held.set(r, { u: t, path: i }),
									L(`unit`) &&
										console.warn(`gex-pe: ${i}: held for its link group`),
									a.held.size === a.members.length && this.#bi(a, n));
								continue;
							}
							this.#hi(t, r, i, n);
						}
						this.#Mn();
					}
				}
				#hi(e, t, n, r) {
					let i = this.#t.exports,
						a = L(`placelat`)
							? [
									Number(i.gex_cgen_mapped_age_us?.(e, 0) ?? -1n),
									Number(i.gex_cgen_mapped_age_us?.(e, 1) ?? -1n),
									performance.now(),
								]
							: null,
						o = R(`unitstall`) ? performance.now() : -1,
						s = this.#r.loadUnit?.(t) ?? null,
						c = o >= 0 ? performance.now() : -1;
					(a &&
						a[0] >= 0 &&
						console.warn(
							`[placelat] ${n} ${(a[0] / 1e3).toFixed(1)} ms mapped, ${(a[1] / 1e3).toFixed(1)} ms wanted, load ${(performance.now() - a[2]).toFixed(1)} ms`,
						),
						L(`record`) &&
							console.warn(`[gex-record] unit ${t} ${s ? `hit` : `miss`} ${n}`),
						L(`record`) &&
							i.gex_cgen_base &&
							console.warn(
								`[gex-record] base ${t} 0x${BigInt.asUintN(64, BigInt(i.gex_cgen_base(e))).toString(16)}`,
							));
					let l = /\.exe$/i.test(n) ? this.cmdline : void 0;
					if (
						(l !== void 0 &&
							L(`record`) &&
							console.warn(`[gex-record] process ${n} :: ${l}`),
						this.#r.noteStatus?.({
							kind: `unit`,
							key: t,
							path: n,
							hit: !!s,
							program: l,
						}),
						!s)
					) {
						if (i.gex_cgen_missing(e))
							throw Error(
								`gex-cgen: --cgen: ${n} has no function-tier unit (${t})`,
							);
						this.#kn(e);
						return;
					}
					if (this.#_i(e, t, n, s) === 1) {
						L(`unit`) &&
							console.error(
								`gex-pe: function tier for ${n}: placed by another thread`,
							);
						return;
					}
					(this.#kn(e),
						L(`unit`) &&
							console.error(
								`gex-pe: pid ${i.gex_my_pid?.() ?? `?`}: function tier for ${n}: ${s.entries.byteLength / 8} entries, placed in ${((performance.now() - r) / 1e3).toFixed(1)}s`,
							),
						this.#An(e, n),
						o >= 0 &&
							console.warn(
								`[unitpub] ${this.#qa()}${this.#Oe ? ` (fork child)` : ``}: ${n.split(`/`).pop()} ${(performance.now() - o).toFixed(1)} ms (load ${(c - o).toFixed(1)})`,
							));
				}
				#gi = new Map();
				#_i(e, t, n, r) {
					let i = this.#t.exports;
					e < 1073741824 && !S.on && i.gex_ftab_install_len
						? this.#z.has(`cgen:${t}`) ||
							(this.#gi.set(t, r), this.#r.prefetchUnit?.(t))
						: this.#qt(t, r);
					let a =
							r.entries instanceof Uint8Array
								? r.entries
								: new Uint8Array(r.entries),
						o = i.gex_alloc(Math.max(8, a.byteLength)) >>> 0;
					this.#Ye().set(a, o);
					let s = i.gex_cgen_publish(e, o, a.byteLength / 8);
					if ((i.gex_free?.(o, Math.max(8, a.byteLength)), s < 0))
						throw Error(`gex-cgen: publishing ${n}'s unit failed`);
					return (this.#Mn(), i.gex_cgen_installed(e), s);
				}
				#vi = null;
				#yi(e) {
					if (!this.#vi) {
						this.#vi = new Map();
						let e = this.#r.loadFile?.(`groups/index.txt`) ?? null,
							t = e ? new TextDecoder().decode(e) : ``;
						for (let e of t.split(`
`)) {
							let [t, ...n] = e.trim().split(/\s+/);
							if (!t || !n.length) continue;
							let r = { key: t, members: n, held: new Map(), done: !1 };
							for (let e of n) this.#vi.set(e, r);
						}
					}
					let t = this.#vi.get(e);
					return t && !t.done ? t : null;
				}
				#bi(e, t) {
					let n = this.#t.exports;
					e.done = !0;
					let r = e.members.map((t) => ({ key: t, ...e.held.get(t) })),
						i = this.#r.loadUnit?.(`groups/${e.key}`) ?? null;
					if (!i) {
						console.error(
							`gex-pe: link group ${e.key} is not in the unit cache; its members' own units`,
						);
						for (let e of r) this.#hi(e.u, e.key, e.path, t);
						return;
					}
					for (let e of r)
						this.#r.noteStatus?.({
							kind: `unit`,
							key: e.key,
							path: e.path,
							hit: !0,
							program: /\.exe$/i.test(e.path) ? this.cmdline : void 0,
						});
					let a = new Uint32Array(r.map((e) => e.u)),
						o = new TextEncoder().encode(e.key),
						s = n.gex_alloc(Math.max(8, a.byteLength)) >>> 0,
						c = n.gex_alloc(Math.max(8, o.byteLength)) >>> 0;
					(this.#Ye().set(new Uint8Array(a.buffer), s), this.#Ye().set(o, c));
					let l = n.gex_cgen_group(s, a.length, c, o.byteLength);
					if (
						(n.gex_free?.(s, Math.max(8, a.byteLength)),
						n.gex_free?.(c, Math.max(8, o.byteLength)),
						l < 0)
					)
						throw Error(`gex-cgen: link group ${e.key}: no unit`);
					let u = this.#Kt(n.gex_cgen_path, l);
					(this.#_i(l, `groups/${e.key}`, u, i),
						console.error(
							`gex-pe: ${u} (${e.key}): ${i.entries.byteLength / 8} entries, placed in ${((performance.now() - t) / 1e3).toFixed(1)}s`,
						));
					for (let e of r) (this.#kn(e.u), this.#An(e.u, e.path));
				}
				useGl(e) {
					((this.#c = e), this.#t?.exports?.gex_set_gl?.(+!!e));
				}
				useD3d(e) {
					((this.#l = !!e), this.#t?.exports?.gex_set_d3d?.(+!!e));
				}
				useWl(e) {
					((this.#u = e), this.#t?.exports?.gex_set_wl?.(+!!e));
				}
				wlOutput(e, t, n = 1) {
					((this.#xi = [e | 0, t | 0]),
						(this.#Si = Math.max(1, n | 0)),
						this.#t?.exports?.gex_set_wl_output?.(e | 0, t | 0),
						this.#t?.exports?.gex_set_wl_scale?.(this.#Si));
				}
				#xi = null;
				#Si = 1;
				wlToken() {
					return this.#t?.exports?.gex_wl_token?.() ?? 0;
				}
				async run(e, t = 4096) {
					let n = Error.stackTraceLimit;
					!globalThis.__gexKeepTrace &&
						!globalThis.GEX_TRAP_STACK &&
						(Error.stackTraceLimit = 0);
					try {
						return await this.#Ci(e, t);
					} finally {
						(this.#un.size && this.covFlush(), (Error.stackTraceLimit = n));
					}
				}
				async #Ci(e, t = 4096) {
					let n = e,
						r = t,
						i = null;
					if ((this.#mi(), this.#t.exports.gex_exited?.()))
						return this.#t.exports.gex_exit_code();
					let a;
					for (;;) {
						this.#un.size &&
							performance.now() - this.#mn > 250 &&
							((this.#mn = performance.now()), this.covFlush());
						try {
							if (!n && this.#t.exports.gex_exited?.())
								return this.#t.exports.gex_exit_code();
							if (!n)
								throw Error(
									`gex: nothing said where to resume (ctx=0x${r.toString(16)}). A trap gave the stack back without setting a resume address.`,
								);
							if (
								(this.#t.exports.gex_callout_leave_ok?.(0), (a = this.#Un()), i)
							) {
								let e = i;
								i = null;
								try {
									S.on
										? await this.#na(e.f)(r, e.code, e.addr, e.kind)
										: e.f(r, e.code, e.addr, e.kind);
								} finally {
									e.spG.value = e.cur;
								}
								n = this.#ca(r);
							}
							return (
								this.#Xt(),
								S.on
									? ((this.#Se = `enter`),
										await this.#Mi(r, n),
										(this.#Se = `trap`))
									: this.#n.exports.enter(r, n),
								globalThis.GEX_DEBUG_EXIT &&
									console.error(
										`[gex] run ended: enter returned, code ${this.#t.exports.gex_exit_code()}`,
									),
								this.#t.exports.gex_exit_code()
							);
						} catch (e) {
							this.#Se = `trap`;
							let t =
									!e?.gexHandoff &&
									this.#t.exports.gex_handoff &&
									!this.#t.exports.gex_handoff(),
								o =
									t &&
									((/memory access out of bounds/.test(e?.message ?? ``) &&
										(this.#t.exports.gex_guest_oob?.(r) ?? 0) === 1) ||
										this.#Sn(e, r));
							if (
								t &&
								!o &&
								this.#kt.length &&
								!/table index is out of bounds/.test(e?.message ?? ``)
							) {
								((this.#t.exports.__stack_pointer.value = An(this.#Be())),
									this.#Wn(a),
									({ pc: n, ctx: r } = this.#jt(e)));
								continue;
							}
							if (t && !o) {
								let t = this.#t.exports;
								if (
									/table index is out of bounds/.test(e.message) &&
									t.gex_last_target
								) {
									let e = 0n;
									try {
										e = new DataView(this.#e.buffer).getBigUint64(r + Kn, !0);
									} catch {
										e = 0n;
									}
									let t = this.#Ti();
									if (
										(t &&
											(globalThis.GEX_TABLE_DEBUG ||
												(typeof process < `u` && {}.GEX_TABLE_DEBUG)) &&
											console.error(
												`[tblrec] caught up tables for a sibling-numbered page (retry ${this.#O})`,
											),
										e && this.#O < 1e5 && t)
									) {
										(this.#O++, (n = e < 0n ? e + (1n << 64n) : e));
										continue;
									}
								}
								let i = (e, t) => {
										try {
											return e ? t(e()) : ``;
										} catch {
											return ``;
										}
									},
									a = this.#t.exports,
									o = i(
										a.gex_current_pc,
										(e) =>
											`, guest pc=0x${(e < 0n ? e + (1n << 64n) : e).toString(16)}`,
									),
									s = i(
										a.gex_current_lr,
										(e) =>
											`, lr=0x${(e < 0n ? e + (1n << 64n) : e).toString(16)}`,
									),
									c = i(a.gex_exit_code, (e) => (e ? `, exit code ${e}` : ``)),
									l =
										i(a.gex_heap_used_kib, (e) =>
											e >= 0
												? `, ${(e / 1024) | 0} MiB of shim heap in use`
												: ``,
										) +
										i(
											a.gex_arena_spent_mib,
											() =>
												`, arena taken: maps ${a.gex_arena_spent_mib(0)}, heap ${a.gex_arena_spent_mib(1)}, stacks ${a.gex_arena_spent_mib(2)} MiB, memory ${Math.round(this.#e.buffer.byteLength / 1048576)} MiB`,
										),
									u = i(a.gex_in_syscall, (e) => e) === 1,
									d = i(a.gex_last_syscall, (e) =>
										e === -1 || e === 4294967295
											? ``
											: `, ${u ? `inside` : `after`} syscall ${e}`,
									);
								globalThis.GEX_TRAP_STACK && console.error(e.stack ?? e);
								try {
									console.error(
										`[trap] linear memory grown to ${(this.#e.buffer.byteLength / 1048576) | 0} MiB (0x${this.#e.buffer.byteLength.toString(16)})`,
									);
								} catch {}
								i(a.gex_dump_threads, () => ``);
								let f = i(a.gex_last_target, (e) => e) || 0n,
									p = i(
										() => f || n,
										(t) => {
											if (!/table index/.test(e.message)) return ``;
											let n = BigInt(t),
												r = n < 0n ? n + (1n << 64n) : n,
												i = Number(r >> 12n),
												a = new DataView(this.#e.buffer).getUint32(
													kr() + i * 4,
													!0,
												),
												o = this.#po(),
												s = a >>> 0,
												c = s >>> 24,
												l = s & 16777215,
												u = l + ((Number(r) & 4095) >> Sr),
												d = o[c]?.length ?? 0,
												p;
											try {
												p = o[c].get(u) ? `holds a function` : `is empty`;
											} catch (e) {
												p = `cannot be read: ${e.message}`;
											}
											let m = 0,
												h = 0,
												g = [],
												_ = new DataView(this.#e.buffer);
											for (let e = 0, t = Ar(); e < t; e++) {
												let t = _.getUint32(kr() + e * 4, !0) >>> 0;
												if (t === 0) continue;
												let n = t >>> 24,
													r = t & 16777215,
													i = o[n]?.length ?? 0;
												(n < o.length && r + Cr <= i) ||
													(m++,
													n >= 2 && h++,
													g.length < 6 &&
														g.push(`page ${e} -> ${n}[${r}] (table is ${i})`));
											}
											let v = m
												? `. ${m} directory entries name a slot this process cannot reach, ${h} of them in a table above 1: ${g.join(`; `)}`
												: `. every other directory entry is reachable`;
											return (
												`. the last indirect branch was to 0x${r.toString(16)}${f ? `` : ` (no target recorded, so this is where enter was called)`}, page ${i} of the directory says table ${c} slot ${l}, so this branch wants ${c}[${u}] and that table is ${d} long (${u < d ? `in range` : `past the end`}, and reading it says it ${p})` +
												v +
												`, and this process has ${o.length} tables of [${o.map((e) => e.length).join(`, `)}], ${this.#R} modules installed`
											);
										},
									);
								throw Error(
									`the gex runtime trapped inside the shim (${this.#Cn(e)}${o}${s}${d}${c}${l}${p}${this.#t.exports.gex_panic_reporting?.() ? `; it panicked again inside the panic report, whose message is lost (the first is above)` : ``}). That is a crash in the runtime, not a guest exit; anything printed above is all the guest managed to do first.` +
										(globalThis.GEX_TRAP_STACK ? `\n${e.stack ?? ``}` : ``),
								);
							}
							((this.#t.exports.__stack_pointer.value = An(this.#Be())),
								this.#Wn(a));
							let s = this.#t.exports;
							(s.gex_libprov_guest_calls?.() ?? 0) > 0 &&
								(++this.#wn <= 16 &&
									console.error(
										`[gex] a trap reached the run loop with ${s.gex_libprov_guest_calls()} provider guest call(s) open: ${e?.message ?? e}; resume ${BigInt.asUintN(64, BigInt(s.gex_resume_pc())).toString(16)}\n${e?.stack ?? ``}`,
									),
								s.gex_libprov_guest_calls_set(0));
							let c = this.#Me();
							if (c !== 0n) {
								(this.traps.loop++, (n = c));
								let e = this.#Pe();
								(e !== 0 && (r = e), this.#pt());
								continue;
							}
							this.traps.loopFull++;
							let l = s.gex_fill_wanted ? Number(s.gex_fill_wanted()) : -1;
							if (l >= 0) {
								let e = performance.now(),
									t = this.fillSlotNow(l >>> 0);
								(this.#x++, (this.#S += performance.now() - e));
								let n = t;
								if (n == null) {
									let e = performance.now();
									((this.#Se = `fillSlot(${l >>> 0})`),
										(n = await this.fillSlot(l >>> 0)),
										(this.#Se = `trap`),
										this.#X++,
										(this.#Z += performance.now() - e));
								}
								s.gex_fill_done(+!!n);
							}
							if ((this.#za(), s.gex_jit_pending_len() >>> 0)) {
								let e = (s.gex_jit_pending_slots?.() ?? 0) >>> 0;
								e && this.#wi(e, `a2358`);
							}
							for (this.#Se = `install`; s.gex_jit_pending_len() >>> 0; )
								await this.#Oa();
							if (
								((this.#Se = `adopt`),
								await this.#Ei(),
								this.#pt(),
								(this.#Se = `catchUp`),
								await this.#Rt(),
								this.#mi(),
								this.#kt.length && s.gex_vfork_over())
							) {
								({ pc: n, ctx: r } = this.#jt(null));
								continue;
							}
							let u = s.gex_vfork_ok?.() ?? 0;
							if (u > 0) {
								let e = this.#At();
								if (e) {
									({ pc: n, ctx: r } = e);
									continue;
								}
							} else u !== -2 && this.#Pt(u);
							((this.#Se = `drainFork`),
								await this.#It(),
								(this.#Se = `drainThread`),
								await this.#wt(),
								(this.#Se = `resume`));
							let d = this.#la(r),
								f = s.gex_exited?.() ? 0n : s.gex_resume_pc();
							if (f !== 0n) {
								n = f;
								let e = s.gex_resume_ctx() >>> 0;
								(e !== 0 && (r = e), (i = d));
								continue;
							}
							if ((d && (d.spG.value = d.cur), s.gex_exited?.()))
								return s.gex_exit_code();
							if (s.gex_paused_for_net() || s.gex_paused_for_input()) {
								let e = 0,
									t = this.#Le();
								for (; s.gex_paused_for_net() || s.gex_paused_for_input(); ) {
									if (s.gex_exited?.()) return s.gex_exit_code();
									if (s.gex_paused_for_input()) {
										let e = this.#r.readStdin();
										(s.gex_paused_for_net()
											? await Promise.race([
													e,
													new Promise((e) => setTimeout(() => e(!0), 5)),
												])
											: await e) === !1 &&
											(this.endStdin(),
											await new Promise((e) => setTimeout(e, 1)));
									} else if (
										S.on
											? (await this.#Pi(20)) < 0
											: s.gex_paused_for_host() || s.gex_park(20) < 0
									) {
										let e = !!s.gex_paused_for_host();
										((this.#je = e ? this.#je + 1 : 0),
											e && s.gex_wait_bound_ms && s.gex_wait_word?.()
												? (this.waits.net++, await this.#Re(s, t))
												: e && this.#je & 1023
													? (this.waits.turn++, await this.#Ae())
													: (this.waits.nap++, await this.#ze()));
									} else (this.waits.park++, await this.#Ae());
									if (s.gex_exited?.()) return s.gex_exit_code();
									if (((t = this.#Le()), (e = s.gex_wake()), e === 1)) break;
								}
								if (s.gex_exited?.()) return s.gex_exit_code();
								if (e !== 1) {
									let t =
										(s.gex_exited ? !s.gex_exited() : !1) &&
										!(s.gex_ctx_exited?.(r) > 0);
									if (t) {
										try {
											s.gex_dump_threads?.();
										} catch {}
										let n = `[gex] the run stopped and nothing could wake it (wake=${e}, exited=${!t})`;
										return (
											this.#r.write(2, new TextEncoder().encode(`${n}\n`)),
											console.error(n),
											125
										);
									}
									return s.gex_exit_code();
								}
								n = s.gex_resume_pc();
								let i = s.gex_resume_ctx() >>> 0;
								i !== 0 && (r = i);
								continue;
							}
							if (s.gex_current_pc && !String(e).includes(`unreachable`)) {
								let t = s.gex_current_pc(),
									n = ``;
								if (s.gex_object_at) {
									let e = s.gex_alloc(160) >>> 0,
										r = s.gex_object_at(t, e, 160) >>> 0;
									r && (n = ` in ` + z(this.#Ye().subarray(e, e + r)));
								}
								let r = s.gex_current_ctx ? s.gex_current_ctx() : 0n,
									i = s.gex_heap_used_kib?.() ?? -1,
									a = s.gex_heap_total_kib?.() ?? -1,
									o =
										i >= 0 && a > 0
											? `, heap ${(i / 1024).toFixed(0)}/${(a / 1024).toFixed(0)} MiB`
											: ``,
									c = ``;
								if (s.gex_dispatch_slot) {
									let e = s.gex_dispatch_slot(t),
										n = this.#po()
											.map((e) => e.length)
											.join(`,`);
									c =
										e < 0
											? `, no slots for this page, tables ${n}`
											: `, table ${e >>> 24} slot ${e & 16777215}, tables ${n}`;
								}
								e.message += ` (guest pc=0x${(t < 0n ? t + (1n << 64n) : t).toString(16)}${n}, ctx=0x${r.toString(16)}${o}${c})`;
							}
							if (String(e).includes(`unreachable`)) {
								if (!s.gex_exited?.() && s.gex_wake && s.gex_resume_pc) {
									let e = s.gex_wake(),
										t = s.gex_resume_pc();
									if (e === 1 && t !== 0n) {
										n = t < 0n ? t + (1n << 64n) : t;
										let e = s.gex_resume_ctx?.() >>> 0;
										e && (r = e);
										continue;
									}
									globalThis.GEX_REPORT_ABANDONED &&
										console.error(
											`[gex] final handoff recovery found scheduler=${e}, resume=0x${(t < 0n ? t + (1n << 64n) : t).toString(16)}`,
										);
								}
								if (
									(!s.gex_exited?.() && globalThis.GEX_REPORT_ABANDONED) ||
									globalThis.GEX_DEBUG_EXIT
								) {
									let t = (e, t) => {
											try {
												return e ? t(e()) : ``;
											} catch {
												return ``;
											}
										},
										n =
											t(
												s.gex_current_pc,
												(e) =>
													`, pc=0x${(e < 0n ? e + (1n << 64n) : e).toString(16)}`,
											) +
											t(s.gex_last_syscall, (e) =>
												e === 4294967295 ? `` : `, in syscall ${e}`,
											),
										r = t(s.gex_heap_used_kib, (e) =>
											e >= 0 ? `, shim heap ${(e / 1024).toFixed(1)} MiB` : ``,
										);
									if (
										(console.error(
											`[gex] run ended: ${s.gex_exited?.() ? `exited` : `ABANDONED`}, code ${s.gex_exit_code()}${n}${r}`,
										),
										!s.gex_exited?.())
									)
										try {
											let e = this.#Ce,
												t = e?.k_panic_len?.() >>> 0;
											if (t) {
												let n = e.k_panic_ptr() >>> 0,
													r = this.#ye.memory;
												console.error(
													`[gex] the global kernel panicked: ` +
														z(new Uint8Array(r.buffer, n, t)),
												);
											}
										} catch {}
									if (!s.gex_exited?.() && s.gex_last_open && s.gex_alloc)
										try {
											let e = s.gex_alloc(256) >>> 0,
												t = s.gex_last_open(e, 256) >>> 0,
												n = z(this.#Ye().subarray(e, e + t));
											(s.gex_free?.(e, 256),
												n &&
													console.error(`[gex] the last path it opened: ${n}`));
										} catch {}
									if (!s.gex_exited?.()) {
										try {
											s.gex_dump_threads?.();
										} catch {}
										try {
											s.gex_dump_state?.();
										} catch {}
										console.error(
											`[gex] the stack under it:\n${e.stack ?? String(e)}`,
										);
									}
								}
								return s.gex_exit_code();
							}
							throw e;
						}
					}
				}
				#wi(e, t = `?`) {
					this.#T(`grow-${t}`);
					let n = this.#t.exports,
						r = this.#po(),
						i = (n.gex_slots_per_table?.() ?? 0) >>> 0 || 2 ** 53 - 1,
						a = e > 0 ? e - 1 : -1,
						o = a >= 0 ? Math.floor(a / i) : -1,
						s = a >= 0 ? (a % i) + 1 : 0,
						c = n.gex_table_need
							? (e) => Math.max(n.gex_table_need(e) >>> 0, e === o ? s : 0)
							: (t) => Math.min(Math.max(e - t * i, 0), i),
						l = r[0].get(0);
					for (let a = 0; a < r.length; a++) {
						if (this.#ro(a)) continue;
						let o = c(a);
						if (r[a].length >= o) continue;
						let s = r[a].length,
							u = Math.min(Math.max(o, Math.min(s * 2, s + Gn)), i);
						(this.#E++,
							(this.#D += u - r[a].length),
							(this.#k += u),
							u - r[a].length > 1e5 &&
								this.#C.push(
									`${t}:t${a}:${r[a].length}->${u}:need${e}:ni${o}:tn${n.gex_table_need ? n.gex_table_need(a) >>> 0 : -1}`,
								));
						try {
							$t(r[a], u - r[a].length, l, a);
						} catch (e) {
							throw Error(
								`dispatch table ${a} would not grow from ${r[a].length} to ${u}: ${e.message}`,
							);
						}
						this.#fo(`dispatch${a} grew`);
					}
					return r;
				}
				#Ti() {
					let e = this.#t.exports;
					if (!e.gex_claimed_slots) return !1;
					let t = this.#po(),
						n = t[0].get(0),
						r = this.#do();
					for (let i = 0; i < t.length; i++) {
						if (this.#ro(i)) continue;
						let a = e.gex_claimed_slots(i) >>> 0;
						if (!(a <= t[i].length))
							try {
								($t(t[i], a - t[i].length, n, i),
									(r = !0),
									this.#fo(`dispatch${i} grew to the claimed`));
							} catch {}
					}
					return r;
				}
				async #Ei() {
					if (!this.#me.length) return;
					let e = this.#t.exports.gex_exec_gen?.() ?? 0;
					if (e !== this.#he) {
						((this.#he = e), (this.#me = []));
						return;
					}
					if (++this.#ge < en()) return;
					let t = this.#me;
					this.#me = [];
					for (let e of t) await this.#Ze(e);
				}
				#Di = [];
				#Oi = null;
				#ki = [];
				#Ai = null;
				#ji = null;
				#Mi(e, t) {
					return (
						this.#ji !== this.#n &&
							((this.#Ai = WebAssembly.promising(this.#n.exports.enter)),
							(this.#ji = this.#n)),
						this.#Ai(e, t)
					);
				}
				#Ni = null;
				#Pi(e) {
					return (
						(this.#Ni ??= WebAssembly.promising(this.#t.exports.gex_park)),
						this.#Ni(e)
					);
				}
				#Fi = null;
				#Ii(e, t, n = 0n) {
					let r = this.#t.exports;
					return new WebAssembly.Suspending((i, a) =>
						this.#ra()
							? e(i, a)
							: ((this.#Fi ??= WebAssembly.promising(r.gex_syscall)),
								(this.#Se = `syscall`),
								this.#Fi(i, n ? BigInt.asIntN(64, BigInt(a) | n) : a).then(
									() => (
										(this.#Se = `syscall-done`),
										t?.(),
										r.gex_last_syscall() ===
										(globalThis.GEX_ARCH === `x86` ? 24 : 124)
											? D.yieldNow(this.#be)
											: D.maybeYield(this.#be)
									),
								)),
					);
				}
				#Li = null;
				#Ri(e) {
					return (this.#Li ??= new WebAssembly.Suspending(
						(t, n) => (
							e.gex_safepoint(t, n),
							(this.#Se = `safepoint`),
							this.#ra() ? 0 : D.maybeYield(this.#be)
						),
					));
				}
				#zi = null;
				#Bi() {
					if (this.#zi) return this.#zi;
					let e = new Uint8Array([
							0, 97, 115, 109, 1, 0, 0, 0, 1, 10, 2, 96, 1, 127, 0, 96, 1, 127,
							1, 127, 2, 9, 1, 1, 119, 3, 104, 105, 116, 0, 1, 3, 2, 1, 0, 7, 5,
							1, 1, 99, 0, 1, 10, 13, 1, 11, 0, 32, 0, 16, 0, 4, 64, 15, 11, 0,
							11,
						]),
						t = new WebAssembly.Instance(new WebAssembly.Module(e), {
							w: { hit: (e) => this.#Vi(e >>> 0) },
						});
					return ((this.#zi = t.exports.c), this.#zi);
				}
				#Vi(e) {
					let t = new DataView(this.#e.buffer),
						n = t.getBigUint64(e + Kn, !0),
						r = t.getBigUint64(e + this.#sa(), !0),
						i = -1;
					for (let e = this.#Di.length - 1; e >= 0; e--) {
						let t = this.#Di[e];
						if (t.ret === n && r >= t.spWant && r <= t.spWant + t.span) {
							i = e;
							break;
						}
					}
					if ((t.setBigUint64(e + qn, n, !0), i >= 0))
						return (
							(this.#Oi = { kind: `return`, i }),
							i === this.#Di.length - 1 &&
							this.#t.exports.gex_callout_may_return?.(this.#Di[i].ri + 1)
								? 1
								: 0
						);
					let a = this.#t.exports.gex_dispatch_ref(n),
						o = Number(BigInt.asIntN(64, a) >> 32n),
						s = Number(BigInt.asUintN(64, a) & 4294967295n),
						c = this.#Di.find(
							(e) => e.w && e.w.table === o && e.w.index === s,
						)?.w;
					return ((this.#Oi = { kind: `bypass`, f: c?.old ?? null }), 0);
				}
				#Hi(e) {
					return e === Ir.length ? this.#n.exports.blocks : this.#po()[e];
				}
				#Ui = new WeakMap();
				#Wi(e, t) {
					let n = this.#Ui.get(e);
					n || this.#Ui.set(e, (n = new Map()));
					let r = n.get(t);
					return (
						r ||
							((rr ??= new WebAssembly.Module(tr)),
							(this.#Gi ??= (e) => this.#Vi(e >>> 0)),
							(r = new WebAssembly.Instance(rr, {
								w: {
									old: e,
									hit: this.#Gi,
									arm: new WebAssembly.Global({ value: `i32` }, t),
								},
							}).exports.c),
							n.set(t, r)),
						r
					);
				}
				#Gi = null;
				#Ki(e, t) {
					let n = this.#Hi(e);
					return n ? (this.#V && e === Ir.length ? t >>> 8 : t) < n.length : !1;
				}
				#qi(e, t) {
					let n = this.#Hi(e);
					if (!this.#V || e !== Ir.length) return n.get(t);
					let r = t >>> 8,
						i = t & 255,
						a = n.get(r),
						o = this.#U.get(r);
					return o && o.fn === a
						? o.arms.has(i)
							? this.#Bi()
							: (e) => o.orig(e, i)
						: (e) => a(e, i);
				}
				#Ji(e, t, n) {
					let r = this.#Hi(e);
					if (!this.#V || e !== Ir.length) {
						r.set(t, n);
						return;
					}
					let i = t >>> 8,
						a = t & 255,
						o = r.get(i),
						s = this.#U.get(i);
					((!s || s.fn !== o) && (s = { orig: o, arms: new Set(), fn: o }),
						n === this.#Bi() ? s.arms.add(a) : s.arms.delete(a));
					let c = s.orig;
					for (let e of s.arms) c = this.#Wi(c, e);
					((s.fn = c),
						r.set(i, c),
						s.arms.size ? this.#U.set(i, s) : this.#U.delete(i));
				}
				#Yi() {
					let e = this.#t.exports,
						t = this.#Bi();
					for (let n of this.#Di) {
						let r = e.gex_dispatch_ref(n.ret),
							i = r < 0n ? -1 : Number(r >> 32n),
							a = r < 0n ? -1 : Number(r & 4294967295n);
						if (
							(n.w && (n.w.table !== i || n.w.index !== a) && this.#Xi(n),
							i < 0 || !this.#Ki(i, a))
						)
							continue;
						if (n.w) {
							let e = this.#qi(i, a);
							(e !== t && (n.w.old = e), e !== t && this.#Ji(i, a, t));
							continue;
						}
						let o = this.#Di.find(
							(e) => e !== n && e.w && e.w.table === i && e.w.index === a,
						);
						((n.w = { table: i, index: a, old: o ? o.w.old : this.#qi(i, a) }),
							this.#Ji(i, a, t));
					}
				}
				#Xi(e) {
					let t = e.w;
					((e.w = null),
						!(
							!t ||
							this.#Di.some(
								(n) =>
									n !== e &&
									n.w &&
									n.w.table === t.table &&
									n.w.index === t.index,
							)
						) &&
							this.#Ki(t.table, t.index) &&
							this.#qi(t.table, t.index) === this.#zi &&
							this.#Ji(t.table, t.index, t.old));
				}
				#Zi(e, t, n, r) {
					return this.#$i(this.#ia(e, t, n, r, !1));
				}
				#Qi(e, t, n, r) {
					return this.#ea(this.#ia(e, t, n, r, !0));
				}
				#$i(e) {
					let t = e.next();
					for (; !t.done; ) {
						let n;
						try {
							let [e, r, i, a, o, s] = t.value;
							n = e === `enter` ? this.#n.exports.enter(r, i) : r(i, a, o, s);
						} catch (n) {
							(this.#un.size &&
								performance.now() - this.#mn > 250 &&
								((this.#mn = performance.now()), this.covFlush()),
								(t = e.throw(n)));
							continue;
						}
						t = e.next(n);
					}
					return t.value;
				}
				async #ea(e) {
					let t = e.next();
					for (; !t.done; ) {
						let n;
						try {
							let [e, r, i, a, o, s] = t.value;
							n =
								e === `enter`
									? await this.#Mi(r, i)
									: await this.#na(r)(i, a, o, s);
						} catch (n) {
							t = e.throw(n);
							continue;
						}
						t = e.next(n);
					}
					return t.value;
				}
				#ta = new WeakMap();
				#na(e) {
					let t = this.#ta.get(e);
					return (t || this.#ta.set(e, (t = WebAssembly.promising(e))), t);
				}
				#ra() {
					for (let e of this.#ki) if (!e.endsWith(`~`)) return !0;
					return !1;
				}
				*#ia(e, t, n, r, i, a = null) {
					let o = this.#t.exports,
						s = o.__stack_pointer.value,
						c = this.#Un(),
						l = this.#Di.length,
						u = this.#Cr?.value ?? 0,
						d = o.gex_callout_opened?.() ?? l,
						f = {
							ret: BigInt.asUintN(64, n),
							spWant: BigInt.asUintN(64, r),
							w: null,
							ri: d,
						},
						p = o.gex_callout_span?.() ?? -1n;
					((f.span = p >= 0n ? p : Yn),
						(f.unwound = p >= 0n ? p : f.ret === Xn ? Zn : Yn),
						this.#Di.push(f),
						this.#ki.push(i ? `callout~` : `callout`),
						this.#aa++,
						(globalThis.GEX_CALLOUT_TRACE ||
							(globalThis.GEX_DENSE_DEBUG &&
								(!(this.#aa & (this.#aa - 1)) || this.#aa % 4096 == 0))) &&
							console.error(
								`[callout] #${this.#aa} depth ${l}: ${BigInt.asUintN(64, t).toString(16)} returning to ${f.ret.toString(16)}`,
							));
					let m = BigInt.asUintN(64, t),
						h = null;
					try {
						for (a && (m = a()), this.#Yi(); ; )
							try {
								if (h) {
									let t = h;
									((h = null),
										o.gex_callout_leave_ok?.(d + 1),
										yield [`call`, t, e]);
								} else (o.gex_callout_leave_ok?.(d + 1), yield [`enter`, e, m]);
								let t = this.#Oi;
								if (t?.kind === `return`)
									return (
										(this.#Oi = null),
										globalThis.GEX_CALLOUT_TRACE &&
											console.error(
												`[callout] depth ${l} leaves: watched return ${t.i} (no trap)`,
											),
										+(t.i === l)
									);
								let n = o.gex_callout_hit?.() ?? -1;
								return n >= 0
									? (globalThis.GEX_CALLOUT_TRACE &&
											console.error(
												`[callout] depth ${l} leaves: hit ${n} (no trap)`,
											),
										+(n === d))
									: (console.error(
											`[gex] guest code returned out of a call-out`,
										),
										0);
							} catch (t) {
								if (
									((o.__stack_pointer.value = s),
									this.#Wn(c),
									this.#Cr && (this.#Cr.value = u),
									t === yr)
								)
									throw t;
								let n = this.#Oi;
								this.#Oi = null;
								let r = (e) => (
									e === 1 && (o.gex_resume_pc(), o.gex_resume_ctx()),
									e
								);
								if (n?.kind === `return`) return r(+(n.i === l));
								if (n?.kind === `bypass`) {
									if (!n.f)
										throw Error(
											`gex: a watched dispatch entry with nothing to run`,
										);
									h = n.f;
									continue;
								}
								if (!t?.gexHandoff && !o.gex_handoff()) {
									if (/table index is out of bounds/.test(t.message)) {
										let t = new DataView(this.#e.buffer).getBigUint64(
											Number(e) + Kn,
											!0,
										);
										if (t && this.#Ti() && this.#O++ < 1e5) {
											m = BigInt.asUintN(64, t);
											continue;
										}
									}
									if (
										!(
											/memory access out of bounds/.test(t?.message ?? ``) &&
											(o.gex_guest_oob?.(e) ?? 0) === 1
										)
									)
										throw t;
								}
								let i = o.gex_callout_hit();
								if (i >= 0)
									return (
										globalThis.GEX_CALLOUT_TRACE &&
											console.error(`[callout] depth ${l} leaves: hit ${i}`),
										r(+(i === d))
									);
								if (
									t?.gexNativeLeft &&
									f.ret === Xn &&
									new DataView(this.#e.buffer).getBigUint64(
										e + this.#sa(),
										!0,
									) >
										f.spWant + f.unwound
								)
									return (
										globalThis.GEX_CALLOUT_TRACE &&
											console.error(`[callout] depth ${l} leaves: native left`),
										0
									);
								if (o.gex_exited?.()) throw ((t.gexHandoff = !0), t);
								let a = this.#Me(),
									p = null,
									g = a;
								if (a !== 0n) this.traps.callout++;
								else {
									this.traps.calloutFull++;
									let n = o.gex_fill_wanted ? Number(o.gex_fill_wanted()) : -1;
									if (
										(n >= 0 && o.gex_fill_done(+!!this.fillSlotNow(n >>> 0)),
										this.#za(),
										o.gex_jit_pending_len() >>> 0)
									) {
										let e = (o.gex_jit_pending_slots?.() ?? 0) >>> 0;
										e && this.#wi(e, `call-out`);
									}
									for (; o.gex_jit_pending_len() >>> 0; ) this.#ya();
									(this.#Da(),
										this.#mi(),
										this.#It()?.catch((e) =>
											console.error(
												`[gex] starting a process: ${e.message ?? e}`,
											),
										),
										this.#Tt());
									let r = this.#la(e);
									if (r && o.gex_fault_nesting?.() > 0 && !Xt())
										throw (
											(r.spG.value = r.cur),
											o.gex_fault_overflow(r.code),
											(t.gexHandoff = !0),
											t
										);
									if (r) {
										try {
											this.#vr
												? yield [
														`call`,
														(e, t, n, i) =>
															this.#cr(r.f, r.idx, e, t, n, i, r.rsp),
														e,
														r.code,
														r.addr,
														r.kind,
													]
												: yield [`call`, r.f, e, r.code, r.addr, r.kind];
										} finally {
											r.spG.value = r.cur;
										}
										p = this.#ca(e);
									}
									g = o.gex_resume_pc();
								}
								let _ = p ?? g;
								if (_ === 0n) throw ((t.gexHandoff = !0), t);
								m = BigInt.asUintN(64, _);
								let v = a === 0n ? o.gex_resume_ctx() >>> 0 : this.#Pe();
								if (v && v !== e)
									return (
										globalThis.GEX_CALLOUT_TRACE &&
											console.error(
												`[callout] depth ${l} leaves: resume on ctx ${v.toString(16)} not ${e.toString(16)}`,
											),
										0
									);
								let y = new DataView(this.#e.buffer).getBigUint64(
									e + this.#sa(),
									!0,
								);
								if ((m === Xn || m === Qn) && o.gex_callout_stray?.(0)) {
									let t =
										m === Xn &&
										f.ret === Xn &&
										y >= f.spWant &&
										y <= f.spWant + f.unwound;
									return (
										t && o.gex_callout_stray(1),
										new DataView(this.#e.buffer).setBigUint64(
											e + qn,
											t ? m : Qn,
											!0,
										),
										globalThis.GEX_CALLOUT_TRACE &&
											console.error(
												`[callout] depth ${l} leaves: native return pad reached (sp ${y.toString(16)}${t ? `, its own` : ``}; waited for ${f.ret.toString(16)}, dispatch ${o.gex_dispatch_ref(f.ret).toString(16)}, watching ${f.w ? `${f.w.table}:${f.w.index}` : `nothing`})`,
											),
										+!!t
									);
								}
								if (f.spWant !== 0n && y > f.spWant + f.unwound)
									return (
										globalThis.GEX_CALLOUT_TRACE &&
											console.error(
												`[callout] depth ${l} leaves: unwound (sp ${y.toString(16)}, resume ${m.toString(16)})`,
											),
										new DataView(this.#e.buffer).setBigUint64(e + qn, m, !0),
										0
									);
								this.#Yi();
							}
					} finally {
						if (
							(o.gex_callout_leave_ok?.(0),
							this.#Xi(f),
							this.#Di.pop(),
							this.#ki.pop(),
							o.gex_callout_unwind?.(l),
							globalThis.GEX_CALLOUT_TRACE)
						) {
							let t = new DataView(this.#e.buffer);
							console.error(
								`[callout] end depth ${l}: pc ${t.getBigUint64(e + qn, !0).toString(16)} sp ${t.getBigUint64(e + this.#sa(), !0).toString(16)} want ${f.spWant.toString(16)}`,
							);
						}
					}
				}
				#aa = 0;
				#oa = -1;
				#sa() {
					return (
						this.#oa < 0 && (this.#oa = this.#t.exports.gex_ctx_sp?.() ?? Jn),
						this.#oa
					);
				}
				#ca(e) {
					return BigInt.asUintN(
						64,
						new DataView(this.#e.buffer).getBigUint64(e + qn, !0),
					);
				}
				#la(e) {
					let t = this.#t.exports;
					if (!t.gex_fault_take) return null;
					let n = t.gex_alloc(16) >>> 0,
						r,
						i,
						a,
						o;
					try {
						if (((r = t.gex_fault_take(n) >>> 0), !r)) return null;
						let e = new DataView(this.#e.buffer);
						((i = e.getUint32(n, !0)),
							(a = e.getBigUint64(n + 4, !0)),
							(o = e.getUint32(n + 12, !0)));
					} finally {
						t.gex_free?.(n, 16);
					}
					let s = this.#Jt().ftab.get(Nn(r));
					if (!s)
						throw Error(
							`gex: the guest fault hook (function ${r}) is not in this Worker's table`,
						);
					let c = this.#vr ? this.#qe().getBigUint64(e + this.#sa(), !0) : 0n,
						{ spG: l, cur: u } = this.#ua(e),
						d = t.gex_guest_x86_64?.() === 1;
					return {
						f: s,
						idx: r,
						rsp: c,
						code: i | 0,
						addr: d ? BigInt.asUintN(64, a) : Number(BigInt.asUintN(32, a)) | 0,
						kind: o | 0,
						spG: l,
						cur: u,
					};
				}
				#ua(e) {
					let t = this.#Gn(),
						n = t.value;
					if (typeof n == `bigint`) {
						let r = this.#qe().getBigUint64(e + this.#sa(), !0);
						t.value = ((n !== 0n && n < r ? n : r) - 4096n) & -16n;
					} else {
						let r = this.#qe().getUint32(e + this.#sa(), !0),
							i = Number(n) >>> 0;
						t.value = (((i !== 0 && i < r ? i : r) - 4096) & -16) | 0;
					}
					return { spG: t, cur: n };
				}
				#da() {
					if (typeof window < `u`) return 0;
					let e = this.#t.exports;
					try {
						if ((this.#za(), e.gex_jit_pending_len() >>> 0)) {
							let t = (e.gex_jit_pending_slots?.() ?? 0) >>> 0;
							t && this.#wi(t, `in-place`);
						}
						for (; e.gex_jit_pending_len() >>> 0; ) this.#ya();
						return (this.#Da(), this.#Yi(), 1);
					} catch (e) {
						return (
							console.error(
								`[gex] an in-place install failed, trapping instead: ${e.message ?? e}`,
							),
							0
						);
					}
				}
				#fa = null;
				#pa(e, t) {
					let n = this.#ma(e);
					return n.ext || n.keyHi || n.keyLo
						? `${t.length}:${n.keyHi}:${n.keyLo}`
						: qt(t);
				}
				#ma(e) {
					if (this.#ha?.i === e) return this.#ha;
					let t = this.#t.exports,
						n,
						r = t.gex_module_row ? t.gex_module_row(e) >>> 0 : -1;
					if (r > 0) {
						let t = new DataView(this.#Ye().buffer, r, 24);
						n = {
							i: e,
							ptr: t.getUint32(0, !0),
							len: t.getUint32(4, !0),
							ext: Number(t.getBigUint64(8, !0)),
							keyHi: t.getUint32(20, !0),
							keyLo: t.getUint32(16, !0),
						};
					} else if (r === 0)
						return { i: e, ptr: 0, len: 0, ext: 0, keyHi: 0, keyLo: 0 };
					else {
						let r = t.gex_module_ext ? Number(t.gex_module_ext(e)) : 0;
						n = {
							i: e,
							ptr: t.gex_module_ptr(e) >>> 0,
							len: t.gex_module_len(e) >>> 0,
							ext: r,
							keyHi: t.gex_module_key ? t.gex_module_key(e, 0) >>> 0 : 0,
							keyLo: t.gex_module_key ? t.gex_module_key(e, 1) >>> 0 : 0,
						};
					}
					return ((this.#ha = n), n);
				}
				#ha = null;
				#ga(e, t = !1) {
					let { ptr: n, len: r, ext: i } = this.#ma(e);
					if (!r) return null;
					let a;
					if (i) {
						if (!this.#fa)
							throw Error(
								`gex: registry module ${e} is in the module store, and this Worker has none`,
							);
						a = new Uint8Array(this.#fa, i - 1, r);
					} else a = this.#Ye().subarray(n, n + r);
					if (!t) return a.slice();
					(!this.#_a || this.#_a.byteLength < r) &&
						(this.#_a = new ArrayBuffer(
							Math.max(1 << 20, 2 ** Math.ceil(Math.log2(r))),
						));
					let o = new Uint8Array(this.#_a, 0, r);
					return (o.set(a), o);
				}
				#_a = null;
				#va(e, t) {
					let n = this.#t.exports;
					if (
						!this.#fa ||
						!t ||
						!n.gex_jit_note_external ||
						!n.gex_jit_keeps?.()
					)
						return;
					let r = Kt(this.#fa, e);
					if (r < 0) return;
					let i = globalThis.GEX_REGISTRY_TRACE || {}.GEX_REGISTRY_TRACE,
						a = i ? 20 : 26;
					if (Math.floor((r + e.length) / 2 ** a) !== Math.floor(r / 2 ** a)) {
						let t = `[gex] module store at ${((r + e.length) / 1048576).toFixed(0)} MiB; registry bytes in the shim heap: ${n.gex_registry_mib?.(0) ?? `?`} MiB`,
							a = i ? globalThis.process?.getBuiltinModule?.(`fs`) : null;
						a ? a.writeSync(2, `${t}\n`) : nn(t);
					}
					let [, o, s] = t.split(`:`);
					n.gex_jit_note_external(
						BigInt(r),
						e.length,
						Number(o) | 0,
						Number(s) | 0,
					);
				}
				#ya() {
					let e = this.#t.exports;
					e.gex_jit_pending_refresh?.();
					let t = e.gex_jit_pending_ptr() >>> 0,
						n = e.gex_jit_pending_len() >>> 0;
					if (n === 0) return;
					let r = this.#Ye().slice(t, t + n),
						[i, a] = this.#xa(r);
					(this.#ka(
						r,
						e.gex_jit_slots() >>> 0,
						64,
						null,
						`nt-callback`,
						this.#Ca(a),
						!0,
					),
						this.#Ea(a),
						this.#va(r, i),
						e.gex_jit_installed());
					let o = e.gex_module_count ? e.gex_module_count() >>> 0 : this.#f;
					if (((this.#f = o), o)) {
						let e = this.#ve[this.#ve.length - 1]?.mod;
						e &&
							i &&
							!this.#z.has(i) &&
							(this.#z.set(i, e), this.#to.delete(i), this.#Xa(o - 1, i, e));
					}
				}
				#ba(e, t = !1) {
					if (!(t || globalThis.GEX_UNIT_CACHE) || !(e instanceof Uint8Array))
						return null;
					let n = vn(e);
					if (n < 0) return `u:${qt(e)}`;
					let r = e.slice(n, n + 4);
					e.fill(0, n, n + 4);
					let i = qt(e);
					return (e.set(r, n), `u:${i}`);
				}
				#xa(e) {
					let t = this.#t.exports.gex_jit_pending_key,
						n = e.length,
						r = `${n}:${t(0) >>> 0}:${t(1) >>> 0}`,
						i = `u:${n}:${t(2) >>> 0}:${t(3) >>> 0}`;
					if (globalThis.GEX_CHECK_INSTALL || {}.GEX_CHECK_INSTALL) {
						let t = qt(e),
							n = this.#ba(e, !0),
							a = this.#t.exports.gex_my_pid?.() ?? `?`;
						r !== t || i !== n
							? console.error(
									`[install-check] pid ${a}: pending keys ${r} ${i}, the bytes' ${t} ${n}`,
								)
							: this.#Sa++ ||
								console.error(
									`[install-check] pid ${a}: the pending keys match the bytes' (${i === `u:${r}` ? `no dense section` : `dense base word zeroed`})`,
								);
					}
					return [r, globalThis.GEX_UNIT_CACHE ? i : null];
				}
				#Sa = 0;
				#Ca(e) {
					let t = (e && this.#z.get(e)) || null;
					return (t && this.#wa++, t);
				}
				#wa = 0;
				get unitHits() {
					return this.#wa;
				}
				#Ta = 0;
				get compileCount() {
					return this.#Ta;
				}
				#Ea(e) {
					if (!e || this.#z.has(e)) return;
					let t = this.#ve[this.#ve.length - 1]?.mod;
					t &&
						(this.#z.set(e, t),
						this.#to.delete(e),
						this.#Za(e, t, Number(e.split(`:`)[1]) || 0));
				}
				#Da() {
					let e = this.#t.exports;
					if (!e.gex_module_count) return;
					let t = e.gex_module_count() >>> 0,
						n = (e.gex_jit_slots_total?.() ?? 0) >>> 0;
					for (; this.#f < t; this.#f++) {
						let e = this.#f;
						if (this.#$a(e)) continue;
						let t = this.#ga(e, !0);
						if (!t) continue;
						let r = this.#pa(e, t),
							i = r ? this.#z.get(r) : void 0;
						if ((this.#ka(t, n, 64, null, `nt-catchup`, i, !0), i)) continue;
						let a = this.#ve[this.#ve.length - 1]?.mod;
						a &&
							r &&
							(this.#z.set(r, a), this.#to.delete(r), this.#Xa(e, r, a));
					}
				}
				async #Oa() {
					let e = this.#t.exports;
					e.gex_jit_pending_refresh?.();
					let t = e.gex_jit_pending_ptr() >>> 0,
						n = e.gex_jit_pending_len() >>> 0;
					if (n === 0) {
						globalThis.GEX_JIT_TRACE &&
							console.error(
								`[jit] empty pending view (sibling drained the queue), skipping compile`,
							);
						return;
					}
					let r =
							globalThis.GEX_CHECK_INSTALL ||
							(typeof process < `u` && {}.GEX_CHECK_INSTALL),
						i = this.#Ye().slice(t, t + n),
						[a, o] = this.#xa(i);
					if (
						(await this.#ka(
							i,
							e.gex_jit_slots() >>> 0,
							64,
							null,
							`jit2878`,
							this.#Ca(o),
						),
						this.#Ea(o),
						this.#va(i, a),
						e.gex_jit_installed(),
						r &&
							e.gex_miss_pc &&
							e.gex_dispatch_slot &&
							!(e.gex_jit_pending_len() >>> 0))
					)
						try {
							let t = e.gex_miss_pc(),
								n = t < 0n ? t + (1n << 64n) : t,
								r = e.gex_dispatch_slot(n),
								i = this.#po(),
								a = i[0].get(0),
								o;
							if (r < 0) o = `no page-table entry`;
							else {
								let e = r >>> 24,
									t = r & 16777215,
									n = t < (i[e]?.length ?? 0) ? i[e].get(t) : `past-end`;
								o =
									n === a
										? `STUB at table ${e} slot ${t} (len ${i[e]?.length})`
										: n === `past-end`
											? `PAST END table ${e} slot ${t} len ${i[e]?.length}`
											: null;
							}
							let s =
								new DataView(this.#e.buffer).getUint32(
									kr() + Number(n >> 12n) * 4,
									!0,
								) >>> 0;
							o &&
								console.error(
									`[install-check] pid ${e.gex_my_pid?.() ?? `?`} miss pc 0x${n.toString(16)}: ${o}; dir entry t${s >>> 24} s${s & 16777215}, pt ${r >= 0 ? `t${r >>> 24} s${(r & 16777215) - Number(n & 4095n)}` : `-`}`,
								);
						} catch (e) {
							console.error(`[install-check] failed: ${e}`);
						}
					let s = e.gex_module_count ? e.gex_module_count() >>> 0 : this.#f;
					if (((this.#f = s), s)) {
						let e = this.#ve[this.#ve.length - 1]?.mod;
						e &&
							a &&
							!this.#z.has(a) &&
							(this.#z.set(a, e), this.#to.delete(a), this.#Xa(s - 1, a, e));
					}
				}
				#ka(e, t, n = 64, r = null, i = `?`, a = null, o = !1, s = null) {
					if (!o) return this.#Aa(e, t, n, r, i, a, s);
					let c = performance.now();
					this.#R++;
					let l = this.#ja(e, t, n, r, i, a, o, s);
					return ((this.#m += performance.now() - c), l);
				}
				async #Aa(e, t, n, r, i, a, o) {
					let s = performance.now();
					this.#R++;
					try {
						return await this.#ja(e, t, n, r, i, a, !1, o);
					} finally {
						this.#m += performance.now() - s;
					}
				}
				async #ja(e, t, n = 64, r = null, i = `?`, a = null, o = !1, s = null) {
					performance.now();
					let c = this.#t.exports,
						l = [performance.now()];
					(this.#no(), l.push(performance.now()));
					let u = performance.now(),
						d = this.#wi(t, `install`);
					((this.#P += performance.now() - u), this.#T(`pre-inst`));
					let f = performance.now();
					if (
						!(a instanceof WebAssembly.Module) &&
						!(e instanceof WebAssembly.Module) &&
						(e?.byteLength ?? 0) === 0
					)
						return (
							globalThis.GEX_JIT_TRACE &&
								console.error(
									`[jit] empty module bytes, skipping install (who=${i})`,
								),
							null
						);
					let p;
					try {
						p =
							a instanceof WebAssembly.Module
								? a
								: e instanceof WebAssembly.Module
									? e
									: o
										? new WebAssembly.Module(e)
										: await WebAssembly.compile(e);
					} catch (t) {
						if (
							e instanceof Uint8Array &&
							t instanceof WebAssembly.CompileError
						) {
							let t = {}.GEX_DUMP_BAD_WASM;
							if (t)
								try {
									globalThis.process
										.getBuiltinModule(`fs`)
										.writeFileSync(`${t}/bad-${i}-${Date.now()}.wasm`, e);
								} catch {}
							try {
								let t = new XMLHttpRequest();
								(t.open(
									`POST`,
									new URL(
										`/__gex_dump?name=${encodeURIComponent(i)}`,
										globalThis.GEX_BASE ?? globalThis.location?.href,
									).href,
									!1,
								),
									t.send(e.slice()));
							} catch {}
						}
						throw t;
					}
					if (
						((this.#A += performance.now() - f),
						p !== a &&
							p !== e &&
							(this.#Ta++,
							globalThis.GEX_FILL_TIME &&
								e?.byteLength >= 1 << 20 &&
								console.warn(
									`[gex] ${this.#qa()}: compiled ${(e.byteLength / 1048576).toFixed(1)} MiB here in ${(performance.now() - f).toFixed(1)} ms`,
								)),
						e instanceof Uint8Array && {}.GEX_DUMP_WASM)
					)
						try {
							globalThis.process
								.getBuiltinModule(`fs`)
								.writeFileSync(
									`${{}.GEX_DUMP_WASM}/u-${this.#t.exports.gex_my_pid?.() ?? 0}-${qt(e).replaceAll(`:`, `-`)}.wasm`,
									e,
								);
						} catch {}
					let m = s ?? yn(e instanceof Uint8Array ? e : p);
					this.#ve.push({
						mod: p,
						need: t,
						meta: e instanceof Uint8Array ? bn(e) : void 0,
						dense: m ?? void 0,
					});
					let h = { ...this.#a };
					for (let e = 0; e < d.length; e++) h[Ir[e]] = d[e];
					if (
						((h.dense_base = 0),
						this.#n?.exports?.blocks &&
							((h.blocks = this.#n.exports.blocks), this.#do(), m))
					) {
						let t = new DataView(m.buffer, m.byteOffset, m.byteLength),
							n = t.getUint32(0, !0);
						if (globalThis.GEX_DENSE_DEBUG) {
							let r = e instanceof Uint8Array ? yn(p) : null,
								a = r
									? new DataView(r.buffer, r.byteOffset).getUint32(0, !0)
									: n;
							console.error(
								`[dense] pid ${c.gex_my_pid?.() ?? `?`} ${i} base=${n} n=${t.getUint32(4, !0) & 2147483647} blocks=${h.blocks.length} size=${c.gex_dense_size()}` +
									(a === n
										? ``
										: ` (a module compiled elsewhere, at base ${a})`),
							);
						}
						if (n === 0)
							throw Error(
								`gex: a translation with unnumbered dense blocks reached the install (${i})`,
							);
						h.dense_base = n;
					}
					l.push(performance.now());
					let g = r ?? (e instanceof Uint8Array ? bn(e) : null);
					l.push(performance.now());
					let _ = _n(e);
					l.push(performance.now());
					let v = _.length ? _ : g ? gn(g) : [];
					for (let e = 0; e < v.length; e++) v[e] && this.#Fa(e, v[e]);
					let y,
						b = performance.now();
					try {
						((y = new WebAssembly.Instance(p, { gex: h })),
							(this.#N += performance.now() - b));
					} catch (e) {
						let n = (c.gex_slots_per_table?.() ?? 0) >>> 0 || 2 ** 53 - 1,
							r = d[0].get(0),
							a = 0;
						for (let e = 0; e < d.length; e++) {
							if (this.#ro(e)) continue;
							let i = Math.min(Math.max(t - e * n, 0), n);
							d[e].length < i &&
								((a += i - d[e].length), $t(d[e], i - d[e].length, r, e));
						}
						try {
							((y = new WebAssembly.Instance(p, { gex: h })),
								(this.#N += performance.now() - b),
								this.#oe++,
								(this.#se += a),
								this.#C.push(
									`RETRY:${i}:need${t}:own${g ? g.length : -1}:needs[${v.join(`,`)}]:+${a}`,
								));
						} catch (n) {
							throw Error(
								`installing a module of ${t} slots failed: ${n.message}. tables are [${d.map((e) => e.length).join(`, `)}], ${(c.gex_slots_per_table?.() ?? 0) >>> 0} slots per table, ${this.#R} modules in so far, ${a} slots grown on retry after: ${e.message}`,
							);
						}
					}
					if (
						(globalThis.GEX_DEBUG_EXIT &&
							this.#R <= 2 &&
							console.error(
								`[fill] module ${this.#R}: gexfill ${typeof y.exports[br]}, exports ${Object.keys(y.exports).slice(0, 4).join(`,`)}`,
							),
						typeof y.exports[xr] == `function`)
					)
						(this.#W.unshift(y), c.gex_fill_possible?.(1));
					else if (typeof y.exports[wr] == `function`) y.exports[wr]();
					else if (typeof y.exports[br] == `function`)
						for (let e = 0; y.exports[br](e); e++);
					return (l.push(performance.now()), (this.#Ba = l), y);
				}
				#Ma(e) {
					typeof e?.exports?.[xr] == `function` &&
						(this.#W.unshift(e), this.#t.exports.gex_fill_possible?.(1));
				}
				#Na(e, t) {
					this.#T(`pre-pub`);
					let n = this.#t.exports;
					if (!e.meta || !e.meta.length || !n.gex_publish_closure_module)
						return;
					let r = performance.now(),
						i = n.gex_alloc(e.meta.length) >>> 0;
					(this.#Ye().set(e.meta, i),
						n.gex_publish_closure_module(i, e.meta.length, t),
						n.gex_free?.(i, e.meta.length),
						this.#$++,
						(this.#Q += performance.now() - r),
						globalThis.GEX_DEBUG_EXIT &&
							console.error(
								`[closure] library ${t} published in ${Math.round(performance.now() - r)}ms`,
							));
				}
				#Pa(e) {
					let t = this.#t.exports;
					if (!t.gex_claim_page || !t.gex_page_table) return -1;
					let n = t.gex_page_table(BigInt(e >>> 0));
					if (n < 0) return 0;
					let r = t.gex_claim_page(BigInt(e >>> 0)) >>> 0;
					return r === 0 ? 0 : (this.#Fa(n, r + Cr), r >>> 0);
				}
				#Fa(e, t) {
					let n = this.#t.exports,
						r = this.#po();
					if (e < 0 || e >= r.length || r[e].length >= t || this.#ro(e)) return;
					let i = (n.gex_slots_per_table?.() ?? 0) >>> 0 || 2 ** 53 - 1,
						a = Cr * 16,
						o = Math.min(Math.ceil(t / a) * a, i),
						s = r[0].get(0),
						c = o - r[e].length;
					if (c <= 0) return;
					let l = performance.now();
					($t(r[e], c, s, e),
						this.#fo(`dispatch${e} grew`),
						(this.#te += c),
						(this.#ee += performance.now() - l));
				}
				#Ia() {
					return this.#t.exports.gex_fill_from
						? this.#t.exports.gex_fill_from() >>> 0
						: 0;
				}
				liftSlots() {
					let t = this.#t.exports;
					if (!t.gex_lift_pc || !t.gex_page_base) return;
					let n = [],
						r = this.#po();
					if (!r.length) return;
					let i = r[0].get(0),
						a = new Set();
					for (let o = 0; o < 16; o++) {
						let s = Number(t.gex_lift_pc(o));
						if (!s) break;
						let c = Math.floor(s / 4096),
							l =
								(t.gex_lift_base ? t.gex_lift_base(o) >>> 0 : 0) ||
								t.gex_page_base(c >>> 0) >>> 0,
							u = t.gex_page_table ? t.gex_page_table(BigInt(c >>> 0)) : -1,
							d;
						if (!l)
							((d = `no base`),
								a.size < 3 &&
									!a.has(c) &&
									(a.add(c), t.gex_explain_page?.(BigInt(c))));
						else if (u < 0 || u >= r.length) d = `no table`;
						else {
							let n = l + ((s & 4095) >>> Sr);
							if (
								((d =
									n >= r[u].length
										? `past end ${r[u].length}`
										: r[u].get(n) === i
											? `stub`
											: `written`),
								d === `stub`)
							) {
								let a = t.gex_closure_owner
										? t.gex_closure_owner(BigInt(c >>> 0))
										: -1,
									o = a >= 0 ? this.#K[a]?.instObj : null,
									f = o?.exports?.[xr];
								if (typeof f == `function`) {
									let t = ((s & 4095) >>> Sr) & -32,
										a = f(c, l, t),
										p = e.askState.get(`${c}:${t}`),
										m = `at=${l} len=${r[u].length}`,
										h = p
											? `at=${p.at} len=${p.len} pub=${+!!p.published}${p.inst === o ? `` : ` DIFFERENT-INSTANCE`}`
											: `never asked for this span`,
										g = ``;
									if (a && r[u].get(n) === i) {
										for (let e = 0; e < r.length; e++)
											e !== u &&
												n < r[e].length &&
												r[e].get(n) !== i &&
												(g += ` WROTE-TABLE-${e}`);
										g ||= ` WROTE-NOWHERE`;
									}
									d =
										r[u].get(n) === i
											? `stub->stub(was[${h}] now[${m}] said=${+!!a}${g} tn=${u} slot=${n})`
											: `stub->written(was[${h}] now[${m}] said=${+!!a})`;
								} else d = `stub, owner=${a} no fill`;
							}
						}
						n.push(`${s.toString(16)}:${d}`);
					}
					return n.length ? n.join(` `) : void 0;
				}
				#La(e, t) {
					let n = Number(this.#t.exports.gex_fill_pc?.() ?? 0n);
					if (!n || t <= 0) return !0;
					let r = this.#t.exports.gex_page_table
							? this.#t.exports.gex_page_table(BigInt(e >>> 0))
							: -1,
						i = this.#po();
					if (r < 0 || r >= i.length) return !0;
					let a = t + ((n & 4095) >>> Sr);
					return a < i[r].length && i[r].get(a) !== i[0].get(0);
				}
				fillSlotNow(t) {
					let n = this.#t.exports,
						r = !1,
						i = !1;
					for (let a = 0; ; a++) {
						let o = n.gex_closure_owner_at
							? n.gex_closure_owner_at(BigInt(t), a)
							: a === 0 && n.gex_closure_owner
								? n.gex_closure_owner(BigInt(t))
								: -1;
						if (o < 0) break;
						r = !0;
						{
							let r = this.#K[o];
							if (e.watchPages.has(t) && e.#We < 24) {
								e.#We++;
								let n = r
									? r.instObj
										? typeof r.instObj.exports[xr] == `function`
											? `reached the fill`
											: `no fill export`
										: `module not instantiated`
									: `no lazy entry`;
								console.error(`[closure] fill page ${t} owner ${o}: ${n}`);
							}
							if (
								!r ||
								(r.published || ((r.published = !0), this.#Na(r, o)),
								!r.instObj)
							)
								continue;
							if (typeof r.instObj.exports[xr] != `function`) {
								i = !0;
								continue;
							}
							this.#_ ||
								((this.#_ = !0),
								r.instObj.exports[xr].length < 3 &&
									this.#t.exports.gex_set_fill_width?.(Cr));
							let a = performance.now(),
								s = this.#Pa(t),
								c = performance.now();
							this.#h += c - a;
							let l = this.#Ia();
							if (e.askState.size < 4096) {
								let i = n.gex_page_table
										? n.gex_page_table(BigInt(t >>> 0))
										: -1,
									a = this.#po();
								e.askState.set(`${t}:${l}`, {
									at: s,
									len: i >= 0 && i < a.length ? a[i].length : -1,
									published: !!r.published,
									inst: r.instObj,
								});
							}
							let u = s > 0 && r.instObj.exports[xr](t, s, l);
							if (((this.#g += performance.now() - c), e.watchSlot && s > 0)) {
								let n = Number(this.#t.exports.gex_fill_pc?.() ?? 0n);
								if (n && e.#Ke < 12) {
									e.#Ke++;
									let r = s + ((n & 4095) >>> Sr),
										i = this.#t.exports.gex_page_table
											? this.#t.exports.gex_page_table(BigInt(t >>> 0))
											: -1,
										a = this.#po(),
										o = `no table`;
									(i >= 0 &&
										i < a.length &&
										(o =
											r < a[i].length
												? a[i].get(r) === a[0].get(0)
													? `still stub`
													: `WRITTEN`
												: `past end (${a[i].length})`),
										console.error(
											`[closure] pc ${n.toString(16)} page ${t} slot ${r} (base ${s} + ${(n & 4095) >>> Sr}) t=${i}: ${o}`,
										));
								}
							}
							if (e.watchPages.has(t) && e.#Ge < 24) {
								e.#Ge++;
								let n = this.#Ia(),
									r = this.#t.exports.gex_page_table
										? this.#t.exports.gex_page_table(BigInt(t >>> 0))
										: -1,
									i = this.#po(),
									a = -1,
									c = -1;
								if (r >= 0 && r < i.length) {
									let e = i[0].get(0);
									((c = i[r].length), (a = 0));
									for (let t = n; t < n + 128 && s + t < c; t++)
										i[r].get(s + t) !== e && a++;
								}
								console.error(
									`[closure] fill page ${t} owner ${o}: at=${s} did=${u} t=${r} from=${n} wrote=${a}/128 tlen=${c}`,
								);
							}
							u && this.#La(t, s) && (this.#J++, (i = !0));
						}
					}
					if (i) return !0;
					if (r || t * 4096 < 77594624) return null;
					let a = this.#Pa(t);
					if (a <= 0) return null;
					for (let e of this.#W)
						if (e.exports[xr](t, a, this.#Ia()) && this.#La(t, a))
							return (this.#J++, !0);
					return null;
				}
				async fillSlot(e) {
					let t = this.#t.exports.gex_closure_owner
						? this.#t.exports.gex_closure_owner(BigInt(e))
						: -1;
					if (t >= 0) {
						let e = this.#K[t];
						if (
							(e && !e.published && ((e.published = !0), this.#Na(e, t)),
							e && !e.inst)
						) {
							e.inst = !0;
							let n = performance.now(),
								r = e.mod ?? (this.#Ue ? await this.#Ue(t) : null);
							if ((this.#re++, (this.#ne += performance.now() - n), r)) {
								e.mod = r;
								let n = this.#t.exports.gex_lib_lazy?.(t >>> 0),
									i = performance.now();
								((e.instObj = await this.#ka(
									r,
									n ? 0 : e.need,
									64,
									n ? null : e.meta,
									`closure`,
								)),
									(this.#ie += performance.now() - i));
							} else e.inst = !1;
						}
					}
					let n = performance.now();
					try {
						return await this.#Ra(e, t);
					} finally {
						this.#ae += performance.now() - n;
					}
				}
				async #Ra(t, n) {
					let r = this.#t.exports.gex_lazy_owner
						? this.#t.exports.gex_lazy_owner(BigInt(t))
						: -1;
					if (r >= 0) {
						let e = this.#q[r];
						if (e && !e.inst)
							return (
								(e.inst = !0),
								await this.#ka(
									e.mod,
									e.need,
									64,
									e.meta,
									`inherit`,
									null,
									!1,
									e.dense,
								),
								!0
							);
					}
					let i = n >= 0 ? this.#K[n]?.instObj : null;
					if (i && typeof i.exports[xr] != `function`) return !0;
					let a = this.#Pa(t);
					if (i && a > 0 && i.exports[xr](t, a, this.#Ia()) && this.#La(t, a))
						return (this.#J++, !0);
					if (t * 4096 >= 77594624) {
						for (let e of this.#W)
							if (a > 0 && e.exports[xr](t, a, this.#Ia()) && this.#La(t, a))
								return (this.#J++, !0);
					}
					return (
						e.debugFill &&
							this.#Y++ < 24 &&
							console.error(
								`[fill] nothing holds entry ${t >>> 0}: ${this.#W.length} deferred modules, ${this.#J} filled`,
							),
						!1
					);
				}
				#za() {
					let e = this.#t.exports,
						t = e.gex_dense_want ? e.gex_dense_want() >>> 0 : 0;
					if (!t) return;
					this.#Ua++;
					let n = e.gex_dense_owner(t);
					if (n < 0) return;
					let r = this.#ga(n, !0);
					if (!r) return;
					let i = performance.now(),
						a = this.#A,
						o = this.#N,
						s = this.#P,
						c = this.#pa(n, r),
						l = c ? this.#z.get(c) : void 0;
					if ((this.#ka(r, 0, 64, null, `dense-${n}`, l, !0), this.#Ha++, !l)) {
						let e = this.#ve[this.#ve.length - 1]?.mod;
						e &&
							c &&
							(this.#z.set(c, e), this.#to.delete(c), this.#Xa(n, c, e));
					}
					let u = performance.now() - i;
					((this.#Wa += u),
						u > this.#Ga &&
							((this.#Ga = u),
							globalThis.GEX_FILL_TIME &&
								u >= 1 &&
								console.warn(
									`[gex] ${this.#qa()}: dense module ${n} (${r.length} bytes${l ? `, compiled elsewhere` : ``}) took ${u.toFixed(2)} ms, ${(this.#A - a).toFixed(1)} compiling, ${(this.#N - o).toFixed(1)} instantiating, ${(this.#P - s).toFixed(1)} growing (${this.#Va()}), the longest here; ${this.#Ja()}, ${this.#Wa.toFixed(1)} ms filling`,
								)));
				}
				#Ba = null;
				#Va() {
					let e = this.#Ba;
					if (!e || e.length < 6) return ``;
					let t = (t) => (e[t] - e[t - 1]).toFixed(1);
					return `reap ${t(1)}, grow+compile ${t(2)}, meta ${t(3)}, segments ${t(4)}, instantiate+fill ${t(5)}`;
				}
				#Ha = 0;
				#Ua = 0;
				#Wa = 0;
				#Ga = 0;
				#Ka = 0;
				adoptGen = void 0;
				#qa() {
					return `pid ${this.#t.exports.gex_my_pid?.() ?? `?`} ${this.#Ka ? `tid ${this.#Ka}` : `main thread`}`;
				}
				#Ja() {
					return `${this.#R} modules installed (${this.#Ta} compiled here), dense ${this.#Ha} filled of ${this.#Ya} left (${this.#Ua} asks), blocks ${this.#n?.exports?.blocks?.length ?? 0}, ${this.#z.size} modules held, ${this.#Qa} not relayed`;
				}
				#Ya = 0;
				#Xa(e, t, n) {
					let r = this.#t.exports;
					(this.#B &&
						r.gex_registry_dense_n &&
						r.gex_registry_dense_n(e) >>> 0) ||
						this.#Za(t, n, this.#ma(e).len);
				}
				#Za(e, t, n) {
					if (!(n >= kn) && !/^(wasm|cgen|cold):/.test(String(e))) {
						this.#Qa++;
						return;
					}
					this.#r.shareModule?.(e, t);
				}
				#Qa = 0;
				#$a(e) {
					let t = this.#t.exports;
					return !this.#B ||
						!t.gex_registry_dense_n ||
						!(t.gex_registry_dense_n(e) >>> 0)
						? !1
						: (this.#Ya++, this.#do(), !0);
				}
				#eo = 0;
				#to = new Set();
				#no() {
					let e = this.#t.exports;
					if (!this.#B || !e.gex_dense_dead_len) return;
					let t = e.gex_dense_dead_len() >>> 0;
					if ((t < this.#eo && (this.#eo = 0), t <= this.#eo)) return;
					let n = this.#n?.exports?.blocks,
						r = n?.get(0),
						i = new Set();
					for (; this.#eo < t; this.#eo++) {
						let t = e.gex_dense_dead_at(this.#eo, 0) >>> 0,
							a = e.gex_dense_dead_at(this.#eo, 1) >>> 0;
						if ((i.add(t), n))
							for (let e = t, i = Math.min(t + a, n.length); e < i; e++)
								n.set(e, r);
					}
					let a = new Set();
					if (
						((this.#ve = this.#ve.filter((e) => {
							let t = e.dense;
							if (!t || t.byteLength < 4) return !0;
							let n = new DataView(
								t.buffer,
								t.byteOffset,
								t.byteLength,
							).getUint32(0, !0);
							return !i.has(n) || (a.add(e.mod), !1);
						})),
						!a.size)
					)
						return;
					let o = [];
					for (let [e, t] of this.#z)
						a.has(t) &&
							(this.#z.delete(e),
							typeof e == `string` && (o.push(e), this.#to.add(e)));
					o.length && this.#r.dropModules?.(o);
				}
				#ro(e) {
					return this.#B && e >= Wn;
				}
				#io() {
					(this.#t.exports, (this.#V = this.#B));
					let e = this.#n?.exports?.blocks;
					if (!this.#V || !e) return;
					let t = e.get(0);
					if (this.#so.has(t)) return;
					let n = this.#co(t);
					for (let r = 0; r < e.length; r++) e.get(r) === t && e.set(r, n);
				}
				#ao = null;
				#oo(e) {
					let t = new Set(),
						n = [],
						r = 0,
						i = { bridged: 0 };
					this.#ao = i;
					let a = () => {
						(console.error(
							`[bridges] ${this.#qa()}: entered ${t.size} addresses, ${i.bridged} bridge entries written; new ${n.map((e) => e.toString(16)).join(`,`)}`,
						),
							(n = []),
							(r = performance.now()));
					};
					return new WebAssembly.Instance(new WebAssembly.Module(er), {
						w: {
							count: (e) => {
								let i = new DataView(this.#e.buffer).getBigUint64(
									(e >>> 0) + Kn,
									!0,
								);
								t.has(i) ||
									(t.add(i),
									n.push(i),
									(t.size <= 8 ||
										n.length >= 64 ||
										performance.now() - r >= 1e3) &&
										a());
							},
							real: e,
						},
					}).exports.c;
				}
				#so = new WeakSet();
				#co(e) {
					if (!this.#V || !e) return e;
					let t = this.#H.get(e);
					return (
						t ||
							((nr ??= new WebAssembly.Module($n)),
							(t = new WebAssembly.Instance(nr, { w: { f: e } }).exports.e),
							this.#H.set(e, t),
							this.#so.add(t)),
						t
					);
				}
				#lo(e, t, n, r) {
					for (let i = 0; i + 1 < n.length; i += 2)
						n[i] === Ir.length
							? this.#uo(t, n[i + 1], r)
							: e[n[i]].set(n[i + 1], r);
				}
				#uo(e, t, n) {
					let r = this.#co(n),
						i = e.get(t);
					if (i === r) return;
					let a = this.#U.get(t);
					if (a && a.fn === i) {
						if (a.orig === r) return;
						a.orig = r;
						let n = r;
						for (let e of a.arms) n = this.#Wi(n, e);
						((a.fn = n), e.set(t, n));
						return;
					}
					e.set(t, r);
				}
				static {
					({}).GEX_TEST_BRIDGE_WATCH &&
						(e.testBridgeWatch = () => {
							let t = new e(),
								n = new WebAssembly.Table({ element: `anyfunc`, initial: 4 });
							((t.#V = !0), (t.#n = { exports: { blocks: n } }));
							let r = [],
								i = new WebAssembly.Module(
									new Uint8Array([
										0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 7,
										1, 1, 119, 1, 102, 0, 0, 3, 2, 1, 0, 7, 5, 1, 1, 98, 0, 1,
										10, 8, 1, 6, 0, 32, 0, 16, 0, 11,
									]),
								),
								a = (e) =>
									new WebAssembly.Instance(i, {
										w: { f: (t) => r.push(`${e}:${t}`) },
									}).exports.b,
								o = a(`one`),
								s = a(`two`),
								c = Ir.length,
								l = [],
								u = (e, t) => {
									t || l.push(e);
								},
								d = (e) => {
									((r.length = 0),
										n.get(2)(7, 2),
										u(
											`a sibling arm runs ${e} (ran ${r.join(`,`) || `nothing`})`,
											r.join() === `${e}:7`,
										));
								};
							return (
								t.#lo([], n, [c, 2], o),
								t.#Ji(c, 513, t.#Bi()),
								u(`the arm is watched`, t.#qi(c, 513) === t.#Bi()),
								t.#lo([], n, [c, 2, c, 2], o),
								u(
									`the watch outlives a publish of the same bridge`,
									t.#qi(c, 513) === t.#Bi(),
								),
								d(`one`),
								t.#lo([], n, [c, 2], s),
								u(
									`the watch outlives a publish of a new bridge`,
									t.#qi(c, 513) === t.#Bi(),
								),
								d(`two`),
								t.#Ji(c, 513, t.#co(s)),
								u(`the watch comes off`, !t.#U.has(2) && n.get(2) === t.#co(s)),
								l
							);
						});
				}
				#do() {
					let e = this.#n?.exports?.blocks;
					if (!this.#B || !e) return !1;
					let t = this.#t.exports.gex_dense_size() >>> 0,
						n = e.length;
					return n >= t
						? !1
						: ($t(e, t + Math.max(t >>> 3, 4096) - n, e.get(0), `blocks`),
							this.#fo(`blocks grew`),
							!0);
				}
				#fo(e) {
					if (!L(`tables`)) return;
					let t = (e, t) => {
							let n = 0,
								r = Number(e.length);
							for (let i = 0; i < r; i++)
								e.get(typeof e.length == `bigint` ? BigInt(i) : i) !== t && n++;
							return `${r}/${n}`;
						},
						n = new Set(),
						r = [],
						i = (e, i, a, o) => {
							!i ||
								n.has(i) ||
								(n.add(i),
								r.push(`${e}=${t(i, a)}${o === void 0 ? `` : `/${o >>> 0}`}`));
						};
					try {
						let e = this.#n ? this.#po() : [],
							t = e[0]?.get(0);
						e.forEach((e, n) => i(`dispatch${n}`, e, t));
						let n = this.#n?.exports?.blocks,
							r = this.#t.exports;
						(n && i(`blocks`, n, n.get(0), r.gex_dense_size?.()),
							this.#Gt &&
								i(
									`ftab`,
									this.#Gt.ftab,
									this.#Gt.resolve,
									r.gex_ftab_size?.(),
								));
						for (let [e, t] of [
							[`guest`, this.#n?.exports],
							[`shim`, this.#t?.exports],
						])
							for (let [n, r] of Object.entries(t ?? {}))
								r instanceof WebAssembly.Table && i(`${e}.${n}`, r, null);
					} catch (e) {
						r.push(`(tally failed: ${e?.message ?? e})`);
					}
					console.error(`[tables] ${this.#qa()} ${e}: ${r.join(` `)}`);
				}
				#po() {
					let e = [];
					for (let t of Ir) {
						let n = this.#n.exports[t];
						if (!n) break;
						e.push(n);
					}
					return e;
				}
			}));
	}),
	Br = c({
		GL_RING_BYTES: () => di,
		GlProxy: () => hi,
		failGlChannel: () => Gr,
		makeGlChannel: () => Ur,
		serveGl: () => Wr,
		shownInReply: () => Hr,
	});
function Vr(e) {
	return ii + ai * ((e >>> 0) % oi);
}
function Hr(e, t) {
	let n = new Uint32Array(e.buffer, e.byteOffset + t, ui / 4),
		r = n[mi];
	if (r < 4) return 0;
	let i = t + ui + n[fi] + r;
	return new DataView(e.buffer, e.byteOffset).getUint32(i - 4, !0);
}
function Ur() {
	return {
		control: new SharedArrayBuffer(1600),
		data: new SharedArrayBuffer(di),
	};
}
function Wr(e, t) {
	let n = new Int32Array(t.control);
	Atomics.store(n, Xr, 1);
	let r = { buffer: t.data },
		i = new Uint8Array(t.data),
		a = !0,
		o = null,
		s = function () {
			if (o) return o;
			if (Atomics.load(n, H) !== ci) return;
			if (e.statsOn) {
				n[Qr] = 1;
				let r = new Float64Array(t.control, ei, 1)[0];
				e.noteBridge(
					r ? performance.timeOrigin + performance.now() - r : 0,
					Atomics.exchange(n, $r, 0),
					Atomics.exchange(n, ti, 0),
					Atomics.exchange(n, ni, 0),
					Atomics.exchange(n, ri, 0),
				);
			}
			let a = Atomics.load(n, Yr) === 1,
				s = Atomics.load(n, qr) >>> 0,
				c = (e) => {
					if (!a) {
						((n[Kr] = e), Atomics.store(n, H, li), Atomics.notify(n, H));
						return;
					}
					let t = Vr(s);
					((n[t] = s + 1),
						(n[t + 1] = e < 0 ? 0 : Hr(i, 0)),
						(n[t + 2] = +(e < 0)),
						(n[Yr] = 0),
						Atomics.store(n, H, si),
						Atomics.notify(n, H),
						Atomics.store(n, Jr, 0),
						Atomics.notify(n, Jr));
				},
				l;
			try {
				l = e.submit(r, 0, s);
			} catch (e) {
				(console.error(`[gl] the device threw`, e), c(-1));
				return;
			}
			if (l instanceof Promise)
				return (
					(o = l
						.then(c, (e) => {
							(console.error(`[gl] the async device threw`, e), c(-1));
						})
						.finally(() => {
							o = null;
						})),
					o
				);
			c(l);
		};
	return (
		(s.stop = () => {
			((a = !1), Atomics.notify(n, H));
		}),
		typeof Atomics.waitAsync == `function` &&
			((t.direct = !0),
			(async () => {
				for (; a; ) {
					let e = Atomics.load(n, H);
					if (e === ci) {
						await s();
						continue;
					}
					let t = Atomics.waitAsync(n, H, e, 1e3);
					t.async && (await t.value);
				}
			})()),
		s
	);
}
function Gr(e) {
	if (!e?.control) return;
	let t = new Int32Array(e.control);
	(Atomics.store(t, Xr, -1), Atomics.notify(t, H), Atomics.notify(t, Jr));
}
var H,
	Kr,
	qr,
	Jr,
	Yr,
	Xr,
	Zr,
	Qr,
	$r,
	ei,
	ti,
	ni,
	ri,
	ii,
	ai,
	oi,
	si,
	ci,
	li,
	ui,
	di,
	fi,
	pi,
	mi,
	hi,
	gi = o(() => {
		((H = 0),
			(Kr = 1),
			(qr = 2),
			(Jr = 3),
			(Yr = 4),
			(Xr = 5),
			(Zr = 6e5),
			(Qr = 6),
			($r = 7),
			(ei = 32),
			(ti = 10),
			(ni = 11),
			(ri = 12),
			(ii = 16),
			(ai = 3),
			(oi = 128),
			(si = 0),
			(ci = 1),
			(li = 2),
			(ui = 32),
			(di = 67108896),
			(fi = 1),
			(pi = 2),
			(mi = 4),
			(hi = class {
				#e;
				#t;
				#n;
				#r;
				constructor(e, t) {
					((this.#e = new Int32Array(e.control)),
						(this.#t = new Uint8Array(e.data)),
						(this.#n = new Uint32Array(e.data)),
						(this.#r = t));
				}
				submit(e, t, n = 0, r = !1, i = null) {
					if (this.#e[Qr] !== 1) return this.#s(e, t, n, r, i);
					let a = performance.now();
					((this.#i = 0), (this.#a = 0));
					try {
						return this.#s(e, t, n, r, i);
					} finally {
						let e = this.#e;
						(Atomics.add(e, $r, Math.round(this.#i * 1e3)),
							Atomics.add(e, ti, Math.round(this.#a * 1e3)),
							Atomics.add(e, ni, Math.round((performance.now() - a) * 1e3)),
							Atomics.add(e, ri, 1));
					}
				}
				#i = 0;
				#a = 0;
				#o(e, t, n) {
					if (this.#e[Qr] !== 1) {
						this.#t.set(e.subarray(t, t + ui + n), 0);
						return;
					}
					let r = performance.now();
					(this.#t.set(e.subarray(t, t + ui + n), 0),
						(this.#a += performance.now() - r),
						(new Float64Array(this.#e.buffer, ei, 1)[0] =
							performance.timeOrigin + performance.now()));
				}
				#s(e, t, n, r, i) {
					let a = new Uint8Array(e.buffer),
						o = new Uint32Array(e.buffer, t, ui / 4),
						s = o[fi],
						c = o[pi];
					if (ui + c > this.#t.length) return -1;
					let l = this.#e,
						u = n || 1,
						d = Date.now() + 3e4,
						f = 0;
					for (;;) {
						let e = Atomics.compareExchange(l, Jr, 0, u);
						if (e === 0) break;
						if (
							((f ||= performance.now()),
							Atomics.wait(l, Jr, e, 50),
							Atomics.load(l, Xr) === 0 && (d = Date.now() + 3e4),
							Date.now() > d)
						) {
							(console.warn(`[gl] taking the ring from client ${e}`),
								Atomics.store(l, Jr, u));
							break;
						}
					}
					f && (i?.(performance.now() - f), (this.#i += performance.now() - f));
					let p = Vr(n),
						m = 0;
					if (l[p] === (((n >>> 0) + 1) | 0)) {
						if (l[p + 2])
							return (
								(l[p] = 0),
								Atomics.store(l, Jr, 0),
								Atomics.notify(l, Jr),
								-1
							);
						m = l[p + 1] >>> 0;
					}
					if (r)
						return (
							this.#o(a, t, c),
							Atomics.store(l, qr, n >>> 0),
							Atomics.store(l, Yr, 1),
							Atomics.store(l, H, ci),
							Atomics.notify(l, H),
							this.#r(),
							(o[pi] = 0),
							m & 2147483647
						);
					try {
						return this.#c(a, t, s, c, n);
					} finally {
						(Atomics.store(l, Jr, 0), Atomics.notify(l, Jr));
					}
				}
				#c(e, t, n, r, i) {
					this.#o(e, t, r);
					let a = this.#e;
					(Atomics.store(a, qr, i >>> 0),
						Atomics.store(a, H, ci),
						Atomics.notify(a, H),
						this.#r());
					let o = Date.now();
					for (; Atomics.load(a, H) === ci; ) {
						if (Atomics.load(a, Xr) < 0) return (Atomics.store(a, H, si), -1);
						if (Atomics.wait(a, H, ci, 3e4) === `timed-out`) {
							if (Atomics.load(a, Xr) !== 0)
								throw Error(`the GL device did not answer in thirty seconds`);
							if (Date.now() - o > Zr)
								throw Error(`the GL device did not start in ten minutes`);
						}
					}
					(Atomics.store(a, H, si),
						Atomics.notify(a, H),
						e.set(this.#t.subarray(0, ui), t));
					let s = this.#n[mi];
					if (s > 0) {
						let r = ui + n;
						e.set(this.#t.subarray(r, r + s), t + r);
					}
					return a[Kr];
				}
			}));
	}),
	_i = c({
		DRAG_ACCEPTS: () => 1,
		DRAG_ANSWERED: () => 2,
		DRAG_FINISHED: () => 8,
		DRAG_TAKEN: () => 4,
		EV: () => 8,
		EV_AXIS: () => 2,
		EV_BUTTON: () => 1,
		EV_CLOSE: () => 8,
		EV_CONFIGURE: () => 7,
		EV_DISMISS_POPUP: () => 9,
		EV_DRAG_ENTER: () => 11,
		EV_DRAG_LEAVE: () => 14,
		EV_DRAG_MOTION: () => 12,
		EV_DROP: () => 13,
		EV_KEY: () => 3,
		EV_KEYBOARD_FOCUS: () => 6,
		EV_MODS: () => 4,
		EV_MOTION: () => 0,
		EV_MOVED: () => 10,
		EV_POINTER_CLEAR: () => 5,
		EV_POINTER_LOCK: () => 15,
		EV_RELATIVE: () => 16,
		F_CONFIGURE_PENDING: () => 4,
		F_EXTERNAL: () => 2,
		F_FULLSCREEN: () => 1,
		F_INPUT_REGION: () => 128,
		F_POINTER_LOCK: () => qi,
		P_PLACED: () => 1,
		P_UNMANAGED: () => 2,
		REC: () => 38,
		ROLE_CURSOR: () => 4,
		ROLE_POPUP: () => 2,
		ROLE_SUBSURFACE: () => 3,
		ROLE_TOPLEVEL: () => 1,
		R_ACTIVATE: () => 32,
		R_ADDR: () => 8,
		R_ADDR_HI: () => 37,
		R_CLIENT: () => 0,
		R_DAMAGE_H: () => 15,
		R_DAMAGE_W: () => 14,
		R_DAMAGE_X: () => 12,
		R_DAMAGE_Y: () => 13,
		R_FLAGS: () => 16,
		R_FORMAT: () => 10,
		R_GL_ORIGIN: () => 26,
		R_GL_SIZE: () => 27,
		R_HEIGHT: () => 7,
		R_INPUT_H: () => 36,
		R_INPUT_W: () => 35,
		R_INPUT_X: () => 33,
		R_INPUT_Y: () => 34,
		R_PARENT: () => 3,
		R_PLACE: () => 28,
		R_REL_X: () => 4,
		R_REL_Y: () => 5,
		R_RESTACK: () => 31,
		R_ROLE: () => 2,
		R_SERIAL: () => 11,
		R_STACK_BELOW: () => 30,
		R_STACK_ID: () => 29,
		R_STRIDE: () => 9,
		R_SURFACE: () => 1,
		R_TITLE: () => 18,
		R_TITLE_WORDS: () => 8,
		R_WIDTH: () => 6,
		R_XID: () => 17,
		SLOTS: () => 64,
		WlProxy: () => Pa,
		ackBlock: () => Fi,
		clipboardSerial: () => Si,
		dragState: () => Ri,
		getClipboard: () => xi,
		makeWlChannel: () => wi,
		mergeDamage: () => Ui,
		notifyQueue: () => Hi,
		outputSize: () => Di,
		readScene: () => Oi,
		recordAddr: () => Ki,
		releaseToken: () => Ai,
		sceneMark: () => Ni,
		sceneMarks: () => ji,
		sceneStill: () => Pi,
		sendEvent: () => U,
		setClipboard: () => Ci,
		setDragData: () => Li,
		setKernelMemory: () => Ii,
		setOutputSize: () => Ti,
		startWakeRelay: () => Vi,
		takesPointer: () => ki,
		waitDrag: () => zi,
		waitPublish: () => Ei,
	});
function vi(e) {
	for (; Atomics.compareExchange(e, 110921, 0, 1) !== 0; )
		typeof Atomics.wait == `function` &&
			!globalThis.document &&
			Atomics.wait(e, 110921, 1, 1);
}
function yi(e) {
	(Atomics.store(e, 110921, 0), Atomics.notify(e, 110921));
}
function bi(e, t, n) {
	let r = Math.min(t.length, va);
	(vi(e),
		new Uint8Array(e.buffer, 443700, r).set(t.subarray(0, r)),
		Atomics.store(e, 110924, r),
		Atomics.store(e, 110923, n));
	let i = (Atomics.add(e, 110922, 1) + 1) >>> 0;
	return (yi(e), i);
}
function xi(e) {
	let t = new Int32Array(e.arena);
	vi(t);
	let n = Atomics.load(t, 110922) >>> 0,
		r = Atomics.load(t, 110923) ? `guest` : `page`,
		i = Math.min(Atomics.load(t, 110924) >>> 0, va),
		a = new Uint8Array(i);
	return (
		a.set(new Uint8Array(t.buffer, 443700, i)),
		yi(t),
		{ serial: n, from: r, text: new TextDecoder().decode(a) }
	);
}
function Si(e) {
	return Atomics.load(new Int32Array(e.arena), 110922) >>> 0;
}
function Ci(e, t) {
	let n = new Int32Array(e.arena),
		r = bi(n, new TextEncoder().encode(String(t)), 0);
	for (let t = 0; t < Wi; t++) Atomics.load(n, xa(t) + ra) && Bi(e, n, t);
	return r;
}
function wi() {
	return typeof SharedArrayBuffer == `function`
		? { arena: new SharedArrayBuffer(ya * 4), pixels: !0 }
		: { arena: new ArrayBuffer(ya * 4) };
}
function Ti(e, t, n, r) {
	let i = new Int32Array(e.arena),
		a = [Atomics.load(i, Ji), Atomics.load(i, Yi)];
	if (
		(Atomics.store(i, Ji, t | 0),
		Atomics.store(i, Yi, n | 0),
		r && Atomics.store(i, Zi, Math.max(1, r | 0)),
		!(!a[0] || (a[0] === (t | 0) && a[1] === (n | 0))))
	)
		for (let t = 0; t < Wi; t++) Atomics.load(i, xa(t) + ra) && Bi(e, i, t);
}
async function Ei(e, t) {
	if (
		typeof Atomics.waitAsync != `function` ||
		!(e.arena instanceof SharedArrayBuffer)
	)
		return null;
	let n = new Int32Array(e.arena),
		r = t ?? Atomics.load(n, Xi),
		i = Atomics.waitAsync(n, Xi, r);
	return (i.async && (await i.value), Atomics.load(n, Xi));
}
function Di(e) {
	let t = new Int32Array(e.arena);
	return {
		w: Atomics.load(t, Ji) || 640,
		h: Atomics.load(t, Yi) || 480,
		scale: Atomics.load(t, Zi) || 1,
	};
}
function Oi(e, { onlyChanged: t = !1 } = {}) {
	let n = new Int32Array(e.arena),
		r = !!e.pixels,
		i = [],
		a = [],
		o = Date.now();
	for (let e = 0; e < Wi; e++) {
		let s = xa(e),
			c = Atomics.load(n, s + ra);
		if (!c) continue;
		let l = Atomics.load(n, s + oa),
			u = Atomics.load(n, s + sa),
			d = Atomics.load(n, s + ia);
		if (
			(a.push({
				block: e,
				token: c,
				gen: l,
				ack: u,
				beat: d,
				stale: o - d > 5e3,
			}),
			t && l === u)
		)
			continue;
		let f = Math.min(Atomics.load(n, s + aa), 64);
		for (let t = 0; t < f; t++) {
			let a = s + da + t * 38,
				o = ja;
			for (let e = 0; e < 8; e++) {
				let t = n[a + 18 + e];
				((o[e * 4] = t & 255),
					(o[e * 4 + 1] = (t >>> 8) & 255),
					(o[e * 4 + 2] = (t >>> 16) & 255),
					(o[e * 4 + 3] = (t >>> 24) & 255));
			}
			let l = o.indexOf(0);
			(l < 0 && (l = o.length),
				i.push({
					token: c,
					block: e,
					client: n[a + 0],
					surface: n[a + 1],
					role: n[a + 2],
					parent: n[a + 3],
					relX: n[a + 4],
					relY: n[a + 5],
					width: n[a + 6],
					height: n[a + 7],
					addr: r ? n[a + 8] >>> 0 : Ki(n, a),
					pix: r ? n[a + 37] >>> 0 : 0,
					stride: n[a + 9],
					format: n[a + 10],
					serial: n[a + 11] >>> 0,
					damage: { x: n[a + 12], y: n[a + 13], w: n[a + 14], h: n[a + 15] },
					flags: n[a + 16],
					xid: n[a + 17] >>> 0,
					external: !!(n[a + 16] & 2),
					glRect:
						n[a + 16] & 2 && n[a + 27]
							? {
									x: (n[a + 26] << 16) >> 16,
									y: n[a + 26] >> 16,
									w: n[a + 27] & 65535,
									h: n[a + 27] >>> 16,
								}
							: null,
					title: l ? Aa.decode(o.subarray(0, l)) : ``,
					placed: !!(n[a + 28] & 1),
					unmanaged: !!(n[a + 28] & 2),
					layer: (n[a + 28] >> 8) & 255,
					stackId: n[a + 29] >>> 0,
					below: n[a + 30] >>> 0,
					restack: n[a + 31] >>> 0,
					activate: n[a + 32] >>> 0,
					input:
						n[a + 16] & 128
							? { x: n[a + 33], y: n[a + 34], w: n[a + 35], h: n[a + 36] }
							: null,
				}));
		}
	}
	return { surfaces: i, blocks: a };
}
function ki(e) {
	let t = e.input;
	return !t || (t.w > 0 && t.h > 0);
}
function Ai(e, t) {
	let n = new Int32Array(e.arena),
		r = 0;
	for (let e = 0; e < Wi; e++) {
		let i = xa(e);
		!t ||
			Atomics.load(n, i + ra) !== t ||
			(Atomics.store(n, i + aa, 0),
			Atomics.compareExchange(n, i + ra, t, 0) === t && r++);
	}
	return r;
}
function ji() {
	return new Int32Array(64);
}
function Mi(e) {
	let t = Ma.get(e.arena);
	return (t || Ma.set(e.arena, (t = new Int32Array(e.arena))), t);
}
function Ni(e, t) {
	e.fill(0);
	for (let n of t) ((e[2 * n.block] = n.token), (e[2 * n.block + 1] = n.gen));
}
function Pi(e, t) {
	let n = Mi(e);
	for (let e = 0; e < Wi; e++) {
		let r = xa(e),
			i = Atomics.load(n, r + ra);
		if (i !== t[2 * e]) return !1;
		if (!i) continue;
		let a = Atomics.load(n, r + oa);
		if (a !== t[2 * e + 1] || a !== Atomics.load(n, r + sa)) return !1;
	}
	return !0;
}
function Fi(e, t, n) {
	let r = new Int32Array(e.arena);
	Atomics.store(r, xa(t) + sa, n);
}
function Ii(e, t) {
	t && !e.kernelMemory && (e.kernelMemory = t);
}
function Li(e, t) {
	let n = new TextEncoder().encode(t);
	if (n.length > _a) return !1;
	let r = new Int32Array(e.arena);
	return (
		new Uint8Array(e.arena, 378148, _a).set(n),
		Atomics.store(r, ba, n.length),
		!0
	);
}
function Ri(e, t) {
	let n = Atomics.load(new Int32Array(e.arena), xa(t) + ua) >>> 0;
	return { serial: n >>> 4, flags: n & 15 };
}
async function zi(e, t, n, r, i) {
	let a = new Int32Array(e.arena),
		o = xa(t) + ua,
		s = performance.now() + i;
	for (;;) {
		let t = Atomics.load(a, o);
		if (t >>> 4 == n >>> 0 && r(t & 15)) return t & 15;
		let i = s - performance.now();
		if (i <= 0) return null;
		if (
			typeof Atomics.waitAsync == `function` &&
			e.arena instanceof SharedArrayBuffer
		) {
			let e = Atomics.waitAsync(a, o, t, Math.min(i, 100));
			e.async && (await e.value);
		} else await new Promise((e) => setTimeout(e, Math.min(i, 20)));
	}
}
function U(e, t, n, r = 0, i = 0, a = 0, o = 0, s = 0, c = 0) {
	let l = new Int32Array(e.arena),
		u = Sa(t),
		d = Atomics.load(l, u + pa),
		f = u + ha + (d % Gi) * 8;
	((l[f] = n | 0),
		(l[f + 1] = r | 0),
		(l[f + 2] = i | 0),
		(l[f + 3] = a | 0),
		(l[f + 4] = o | 0),
		(l[f + 5] = s | 0),
		(l[f + 6] = c | 0),
		(l[f + 7] = 0),
		Atomics.store(l, u + pa, d + 1),
		globalThis.__gexEvLog?.push([n, r, i, performance.now()]),
		console.timeStamp(`gex:ev ${n} b${t}`),
		Bi(e, l, t));
}
function Bi(e, t, n) {
	let r = Atomics.load(t, xa(n) + ca),
		i = Atomics.load(t, xa(n) + la),
		a = e.kernelMemory;
	r && i && a
		? (Hi(new Int32Array(a.buffer), r >>> 0, i >>> 0), S.on && D.checkSlots())
		: r &&
			i &&
			e.arena instanceof SharedArrayBuffer &&
			(Atomics.or(t, ea, 1 << n), Atomics.add(t, $i, 1), Atomics.notify(t, $i));
}
function Vi(e, t) {
	if (
		!t ||
		e.relay ||
		typeof Atomics.waitAsync != `function` ||
		!(e.arena instanceof SharedArrayBuffer)
	)
		return;
	e.relay = t;
	let n = new Int32Array(e.arena);
	(async () => {
		for (;;) {
			let e = Atomics.load(n, $i),
				r = Atomics.exchange(n, ea, 0) >>> 0;
			if (r) {
				let e = new Int32Array(t.buffer);
				for (; r; ) {
					let t = 31 - Math.clz32(r & -r);
					r &= r - 1;
					let i = Atomics.load(n, xa(t) + ca),
						a = Atomics.load(n, xa(t) + la);
					i && a && Hi(e, i >>> 0, a >>> 0);
				}
			}
			let i = Atomics.waitAsync(n, $i, e);
			i.async && (await i.value);
		}
	})();
}
function Hi(e, t, n) {
	for (let r = 0; r < Na; r++) {
		let i = Atomics.load(e, (t >>> 2) + r) >>> 0;
		for (; i; ) {
			let t = 31 - Math.clz32(i & -i);
			i &= i - 1;
			let a = (n >>> 2) + r * 32 + t;
			(Atomics.add(e, a, 1),
				e.buffer instanceof SharedArrayBuffer && Atomics.notify(e, a));
		}
	}
}
function Ui(e, t) {
	if (e.w <= 0 || e.h <= 0 || t.w <= 0 || t.h <= 0)
		return { x: 0, y: 0, w: 0, h: 0 };
	let n = Math.min(e.x, t.x),
		r = Math.min(e.y, t.y),
		i = Math.max(e.x + e.w, t.x + t.w),
		a = Math.max(e.y + e.h, t.y + t.h);
	return { x: n, y: r, w: i - n, h: a - r };
}
var Wi,
	Gi,
	Ki,
	qi,
	Ji,
	Yi,
	Xi,
	Zi,
	Qi,
	$i,
	ea,
	ta,
	na,
	ra,
	ia,
	aa,
	oa,
	sa,
	ca,
	la,
	ua,
	da,
	fa,
	pa,
	ma,
	ha,
	ga,
	_a,
	va,
	ya,
	ba,
	xa,
	Sa,
	Ca,
	wa,
	Ta,
	Ea,
	Da,
	Oa,
	ka,
	Aa,
	ja,
	Ma,
	Na,
	Pa,
	Fa = o(() => {
		(ae(),
			(Wi = 32),
			(Gi = 64),
			(Ki = (e, t) => (e[t + 8] >>> 0) + (e[t + 37] >>> 0) * 4294967296),
			(qi = 1 << 31),
			(Ji = 0),
			(Yi = 1),
			(Xi = 2),
			(Zi = 3),
			(Qi = 4),
			($i = 5),
			(ea = 6),
			(ta = 7),
			(na = 8),
			(ra = 0),
			(ia = 1),
			(aa = 2),
			(oa = 3),
			(sa = 4),
			(ca = 5),
			(la = 6),
			(ua = 7),
			(da = 8),
			(fa = 2440),
			(pa = 0),
			(ma = 1),
			(ha = 2),
			(ga = 514),
			(_a = 65536),
			(va = 1 << 20),
			(ya = 373069),
			(ba = 94536),
			(xa = (e) => na + e * fa),
			(Sa = (e) => 78088 + e * ga),
			(Ca = 0),
			(wa = 1),
			(Ta = 4),
			(Ea = 5),
			(Da = 2048),
			(Oa = 64 << 20),
			(ka = 1 << 20),
			(Aa = new TextDecoder()),
			(ja = new Uint8Array(32)),
			(Ma = new WeakMap()),
			(Na = 64),
			(Pa = class {
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
					let t = Math.ceil(e / ka) * ka;
					if (t > Oa) return !1;
					let n = this.#p;
					this.#f = new SharedArrayBuffer(t);
					let r = (Atomics.add(this.#e, ta, 1) + 1) >>> 0;
					return (
						(r ||= (Atomics.add(this.#e, ta, 1) + 1) >>> 0),
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
					return Atomics.compareExchange(this.#e, Qi, 0, 1) === 0;
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
								let i = Ta + r * Ea;
								e[i + 2] &&
									e[i] === n[t + 0] &&
									e[i + 1] === n[t + 1] &&
									(s = i);
							}
							(s < 0 || e[s + 3] < o) && (r += o);
						}
						let a = e ? Math.max(e[wa], Da) : Da;
						if (
							!e ||
							(a + r > this.#f.byteLength && Da + i > this.#f.byteLength)
						) {
							let e = Da + i,
								r = Math.max(
									e + (e >> 2),
									this.#f ? this.#f.byteLength * 2 : 0,
								);
							if (!this.#h(Math.min(r, Oa)) && !this.#f) {
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
								let r = Ta + n * Ea;
								if (i[r + 2] && i[r] === e && i[r + 1] === t) return r;
							}
							return -1;
						};
					for (; Atomics.compareExchange(i, Ca, 0, 1) !== 0; );
					try {
						i[wa] < Da && (i[wa] = Da);
						let o = 0;
						for (let e = 0; e < t; e++) {
							let t = this.#s[e],
								r = a(n[t + 0], n[t + 1]),
								s = n[t + 6] * n[t + 7] * 4;
							(r < 0 || i[r + 3] < s) && (o += (s + 255) & -256);
						}
						if (i[wa] + o > r.byteLength) {
							for (let e = 0; e < 320; e++) i[Ta + e] = 0;
							i[wa] = Da;
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
								h = p * m * 4,
								g = Ki(n, t),
								_ = n[t + 9],
								v = a(n[t + 0], n[t + 1]),
								y = !c;
							if (v < 0 || i[v + 3] < h) {
								if (v < 0) {
									for (let e = 0; e < 64 && v < 0; e++)
										i[Ta + e * Ea + 2] || (v = Ta + e * Ea);
									v < 0 && (v = Ta);
								}
								let e = i[wa];
								if (e + h > r.byteLength) {
									(this.#m ||
										console.warn(
											`[wl] a ${p}x${m} surface does not fit its block's ${r.byteLength >> 20} MiB of pixels`,
										),
										(this.#m = !0),
										(n[t + 8] = 0),
										(n[t + 37] = 0));
									continue;
								}
								((i[v] = n[t + 0]),
									(i[v + 1] = n[t + 1]),
									(i[v + 2] = e),
									(i[v + 3] = h),
									(i[wa] = e + ((h + 255) & -256)),
									(y = !0));
							}
							let b = i[v + 2],
								x = n[t + 11];
							if (y || i[v + 4] !== x) {
								let t = 0,
									n = 0,
									r = p,
									a = m;
								!y &&
									d > 0 &&
									f > 0 &&
									((t = Math.max(0, Math.min(l, p))),
									(n = Math.max(0, Math.min(u, m))),
									(r = Math.max(0, Math.min(d, p - t))),
									(a = Math.max(0, Math.min(f, m - n))));
								let o = this.#v;
								if (g + (n + a - 1) * _ + (t + r) * 4 <= s.length || a === 0) {
									if (r === p && _ === p * 4) {
										let e = g + n * _;
										o.set(s.subarray(e, e + a * _), b + n * p * 4);
									} else {
										let i = !((g | _) & 3),
											c = i ? this.#O(e) : null,
											l = this.#y;
										for (let e = 0; e < a; e++) {
											let a = g + (n + e) * _ + t * 4,
												u = b + (n + e) * p * 4 + t * 4;
											if (r >= 64 || !i) o.set(s.subarray(a, a + r * 4), u);
											else
												for (let e = 0, t = a >> 2, n = u >> 2; e < r; e++)
													l[n + e] = c[t + e];
										}
									}
								}
								i[v + 4] = x;
							}
							((n[t + 8] = b), (n[t + 37] = this.#p), (n[t + 9] = p * 4));
						}
					} finally {
						Atomics.store(i, Ca, 0);
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
					for (let e = 0; e < Wi; e++) {
						let t = xa(e);
						if (Atomics.load(this.#e, t + ra) === this.#i) {
							((this.#t = e), (this.#n = t), (this.#r = Sa(e)), this.#D());
							return;
						}
					}
					for (let t = 0; t < 2; t++)
						for (let n = 0; n < Wi; n++) {
							let r = xa(n),
								i = Atomics.load(this.#e, r + ra),
								a = t === 1 && i && e - Atomics.load(this.#e, r + ia) > 5e3;
							if (
								!(i && !a) &&
								Atomics.compareExchange(this.#e, r + ra, i, this.#i) === i
							) {
								((this.#t = n),
									(this.#n = r),
									(this.#r = Sa(n)),
									Atomics.store(this.#e, r + aa, 0),
									Atomics.store(this.#e, r + oa, 0),
									Atomics.store(this.#e, r + sa, 0),
									Atomics.store(this.#e, r + ua, 0),
									Atomics.store(this.#e, r + ia, e),
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
						(Atomics.store(this.#e, this.#n + la, e.slots | 0),
						Atomics.store(this.#e, this.#n + ca, e.addr | 0));
				}
				get token() {
					return this.#i;
				}
				get ok() {
					return this.#t >= 0;
				}
				get generation() {
					return Atomics.load(this.#e, this.#n + oa);
				}
				get drawnGeneration() {
					return Atomics.load(this.#e, this.#n + sa);
				}
				publish(e, t, n, r = e) {
					if (
						(this.#t >= 0 &&
							Atomics.load(this.#e, this.#n + ra) !== this.#i &&
							((this.#t = -1), (this.#o = 0)),
						!this.#w())
					)
						return;
					let i = this.#e,
						a = Math.min(n, 64),
						o = this.#O(e),
						s = Atomics.load(i, this.#n + oa);
					Atomics.load(i, this.#n + sa) === s && (this.#o = 0);
					let c = this.#a,
						l = 0;
					for (let e = 0; e < a; e++) {
						let n = (t >>> 2) + e * 38,
							r = this.#n + da + e * 38,
							a = o[n + 0],
							s = o[n + 1],
							u =
								i[r + 0] === a && i[r + 1] === s && this.#d
									? i[r + 37] >>> 0
									: 0;
						for (let e = 0; e < 38; e++) i[r + e] = o[n + e];
						let d = o[n + 12],
							f = o[n + 13],
							p = o[n + 14],
							m = o[n + 15];
						this.#d &&
							Ki(i, r) &&
							o[n + 6] > 0 &&
							o[n + 7] > 0 &&
							((this.#s[l] = r),
							(this.#c[l] = u),
							(this.#l[l * 4] = d),
							(this.#l[l * 4 + 1] = f),
							(this.#l[l * 4 + 2] = p),
							(this.#l[l * 4 + 3] = m),
							l++);
						let h = 0;
						for (; h < this.#o && (c[h * 6] !== a || c[h * 6 + 1] !== s); ) h++;
						if (h < this.#o) {
							let e = h * 6;
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
							h < 64
								? this.#o++
								: ((h = -1), (d = 0), (f = 0), (p = 0), (m = 0));
						if (h >= 0) {
							let e = h * 6;
							((c[e] = a),
								(c[e + 1] = s),
								(c[e + 2] = d),
								(c[e + 3] = f),
								(c[e + 4] = p),
								(c[e + 5] = m));
						}
						((i[r + 12] = d),
							(i[r + 13] = f),
							(i[r + 14] = p),
							(i[r + 15] = m));
					}
					(l && this.#g(r, l),
						Atomics.store(this.#e, this.#n + aa, a),
						Atomics.store(this.#e, this.#n + ia, Date.now()),
						Atomics.add(this.#e, this.#n + oa, 1),
						Atomics.add(this.#e, Xi, 1),
						Atomics.notify(this.#e, Xi),
						this.#T?.());
				}
				pollInput(e, t, n) {
					if (!this.#w()) return 0;
					let r = this.#e,
						i = this.#r,
						a = Atomics.load(r, i + pa),
						o = Atomics.load(r, i + ma);
					if ((a - o > Gi && (o = a - Gi), o === a)) return 0;
					let s = this.#O(e),
						c = t >>> 2,
						l = 0;
					for (; o < a && l < n; ) {
						let e = i + ha + (o % Gi) * 8;
						for (let t = 0; t < 8; t++) s[c + l * 8 + t] = r[e + t];
						(o++, l++);
					}
					return (Atomics.store(r, i + ma, o), l);
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
					vi(r);
					let i = Math.min(Atomics.load(r, 110924) >>> 0, va),
						a = Math.min(i, n);
					return (
						new Uint8Array(e.buffer, t, a).set(
							new Uint8Array(r.buffer, 443700, a),
						),
						yi(r),
						i
					);
				}
				clipSet(e, t, n) {
					return (this.#k = bi(this.#e, new Uint8Array(e.buffer, t, n), 1));
				}
				dragData(e, t, n) {
					let r = this.#e,
						i = Math.min(Atomics.load(r, ba) >>> 0, _a);
					return (
						new Uint8Array(e.buffer, t, Math.min(i, n)).set(
							new Uint8Array(r.buffer, 378148, Math.min(i, n)),
						),
						i
					);
				}
				dragStatus(e, t) {
					if (this.#t < 0) return;
					let n = this.#n + ua;
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
					return (
						Atomics.load(e, this.#r + pa) !== Atomics.load(e, this.#r + ma)
					);
				}
				outputSize() {
					return ((this.#A = this.#j()), this.#A);
				}
				#A = 0;
				#j() {
					let e = this.#e;
					return (
						(((Atomics.load(e, Ji) & 65535) << 16) |
							(Atomics.load(e, Yi) & 65535)) >>>
						0
					);
				}
				release() {
					this.#t < 0 ||
						(Atomics.store(this.#e, this.#n + aa, 0),
						Atomics.store(this.#e, this.#n + ra, 0),
						(this.#t = -1));
				}
			}));
	}),
	Ia = c({
		NetProxy: () => Co,
		Rings: () => So,
		makeNetChannel: () => La,
		serveNet: () => Ra,
	});
function La() {
	if (
		typeof Atomics.waitAsync != `function` ||
		typeof SharedArrayBuffer != `function`
	)
		return null;
	let e = null;
	try {
		((e = new SharedArrayBuffer(0, { maxByteLength: so * go })),
			(typeof e.grow != `function` || !e.growable) && (e = null));
	} catch {
		e = null;
	}
	return {
		control: new SharedArrayBuffer(64),
		data: new SharedArrayBuffer(oo),
		rx: e ? new SharedArrayBuffer(256 * co) : void 0,
		rxData: e ?? void 0,
	};
}
function Ra(e, t) {
	let n = new Int32Array(t.control),
		r = new Uint8Array(t.data),
		i = new TextDecoder(),
		a = !0;
	t.rx && `rings` in e && (e.rings = new So(t, !0));
	let o = e.onActivity;
	e.onActivity = (...t) => {
		(o?.apply(e, t), Atomics.add(n, Ka, 1), Atomics.notify(n, Ka));
	};
	let s = () => {
		let t = n[Ba],
			a = n[Va],
			o = 0;
		try {
			switch (t) {
				case Xa:
					o = e.open();
					break;
				case Za:
					e.connect(a, i.decode(r.slice(0, n[Ha])), n[Ua]);
					break;
				case Qa:
					o = e.status(a);
					break;
				case $a:
					o = e.send(a, r.subarray(0, n[Ha]));
					break;
				case eo:
					o = e.recv(a, r.subarray(0, Math.min(n[Ha], oo)));
					break;
				case to:
					o = +!!e.available(a);
					break;
				case no:
					e.close(a);
					break;
				case ro:
					o = e.dup ? e.dup(a) : 0;
					break;
				case io:
					o = e.peek ? e.peek(a, r.subarray(0, Math.min(n[Ha], oo))) : -2;
					break;
				case ao:
					o = e.refill?.(a) ?? 0;
					break;
				default:
					o = -1;
			}
		} catch (e) {
			(console.error(`[net] the network threw`, e), (o = -2));
		}
		((n[Wa] = o), Atomics.store(n, za, Ya), Atomics.notify(n, za));
	};
	return (
		(async () => {
			for (; a; ) {
				let e = Atomics.load(n, za);
				if (e === Ja) {
					s();
					continue;
				}
				let t = Atomics.waitAsync(n, za, e, 1e3);
				t.async && (await t.value);
			}
		})(),
		() => {
			((a = !1),
				(e.onActivity = o),
				t.rx && `rings` in e && (e.rings = null),
				Atomics.notify(n, za));
		}
	);
}
var za,
	Ba,
	Va,
	Ha,
	Ua,
	Wa,
	Ga,
	Ka,
	qa,
	Ja,
	Ya,
	Xa,
	Za,
	Qa,
	$a,
	eo,
	to,
	no,
	ro,
	io,
	ao,
	oo,
	so,
	co,
	lo,
	uo,
	fo,
	po,
	mo,
	ho,
	go,
	_o,
	vo,
	yo,
	bo,
	xo,
	So,
	Co,
	wo = o(() => {
		((za = 0),
			(Ba = 1),
			(Va = 2),
			(Ha = 3),
			(Ua = 4),
			(Wa = 5),
			(Ga = 6),
			(Ka = 8),
			(qa = 0),
			(Ja = 1),
			(Ya = 2),
			(Xa = 1),
			(Za = 2),
			(Qa = 3),
			($a = 4),
			(eo = 5),
			(to = 6),
			(no = 7),
			(ro = 8),
			(io = 9),
			(ao = 10),
			(oo = 1 << 20),
			(so = 64),
			(co = 8),
			(lo = 0),
			(uo = 1),
			(fo = 2),
			(po = 3),
			(mo = 4),
			(ho = 5),
			(go = 262144),
			(_o = 4),
			(vo = 0),
			(yo = 1),
			(bo = 2),
			(xo = 3),
			(So = class {
				#e;
				#t;
				#n;
				#r = new Map();
				#i;
				constructor(e, t = !1) {
					((this.#e = new Int32Array(e.rx)),
						(this.#t = new Uint8Array(e.rxData)),
						(this.#i = e.rxData),
						(this.#n = t));
				}
				claim(e) {
					let t = this.#e;
					for (let n = 0; n < so; n++) {
						let r = n * co;
						if (Atomics.load(t, r + lo) !== 0) continue;
						let i = Math.min(so, Math.ceil((n + 1) / _o) * _o) * go;
						return (
							this.#i.byteLength < i && this.#i.grow(i),
							this.#a(r, () => {
								((t[r + uo] = vo),
									(t[r + fo] = 0),
									(t[r + po] = 0),
									(t[r + mo] = 0),
									Atomics.store(t, r + lo, e));
							}),
							n
						);
					}
					return -1;
				}
				release(e) {
					let t = e * co;
					this.#a(t, () => Atomics.store(this.#e, t + lo, 0));
				}
				#a(e, t) {
					let n = this.#e,
						r = this.#n ? -1 : 1;
					for (;;) {
						let t = Atomics.compareExchange(n, e + ho, 0, r);
						if (t === 0) break;
						this.#n || Atomics.wait(n, e + ho, t, 1);
					}
					try {
						return t();
					} finally {
						(Atomics.store(n, e + ho, 0), this.#n || Atomics.notify(n, e + ho));
					}
				}
				setState(e, t) {
					Atomics.store(this.#e, e * co + uo, t);
				}
				setSpill(e, t) {
					Atomics.store(this.#e, e * co + mo, +!!t);
				}
				write(e, t) {
					let n = this.#e,
						r = e * co,
						i = Atomics.load(n, r + fo) >>> 0,
						a = go - ((i - (Atomics.load(n, r + po) >>> 0)) >>> 0),
						o = Math.min(a, t.length);
					if (o <= 0) return 0;
					let s = i & 262143,
						c = e * go,
						l = Math.min(o, go - s);
					return (
						this.#t.set(t.subarray(0, l), c + s),
						o > l && this.#t.set(t.subarray(l, o), c),
						Atomics.store(n, r + fo, (i + o) | 0),
						o
					);
				}
				find(e) {
					let t = this.#e,
						n = this.#r.get(e);
					if (n === -1) return -1;
					if (n !== void 0 && Atomics.load(t, n * co + lo) === e) return n * co;
					for (let n = 0; n < so; n++)
						if (Atomics.load(t, n * co + lo) === e)
							return (this.#r.set(e, n), n * co);
					return (this.#r.set(e, -1), -1);
				}
				queued(e) {
					return (
						((Atomics.load(this.#e, e + fo) >>> 0) -
							(Atomics.load(this.#e, e + po) >>> 0)) >>>
						0
					);
				}
				spill(e) {
					return Atomics.load(this.#e, e + mo) !== 0;
				}
				status(e) {
					let t = Atomics.load(this.#e, e + uo);
					return t === vo && (this.queued(e) || this.spill(e)) ? yo : t;
				}
				ended(e) {
					let t = Atomics.load(this.#e, e + uo);
					return t === bo || t === xo;
				}
				recv(e, t, n, r) {
					let i = this.find(e);
					if (i < 0) return;
					if (!t.length) return 0;
					!this.queued(i) && this.spill(i) && r();
					let a = this.copy(i, e, t, n);
					return a < 0
						? 0
						: (a && !n && this.spill(i) && r(),
							a || (this.ended(i) && !this.spill(i) ? 0 : -1));
				}
				available(e) {
					let t = this.find(e);
					if (!(t < 0))
						return this.queued(t) > 0 || this.spill(t) || this.ended(t);
				}
				statusOf(e) {
					let t = this.find(e);
					return t < 0 ? void 0 : this.status(t);
				}
				copy(e, t, n, r) {
					let i = this.#e;
					return this.#a(e, () => {
						if (Atomics.load(i, e + lo) !== t) return -1;
						let a = Atomics.load(i, e + po) >>> 0,
							o = Math.min(
								n.length,
								((Atomics.load(i, e + fo) >>> 0) - a) >>> 0,
							),
							s = a & 262143,
							c = (e / co) * go,
							l = Math.min(o, go - s);
						return (
							n.set(this.#t.subarray(c + s, c + s + l), 0),
							o > l && n.set(this.#t.subarray(c, c + o - l), l),
							r || Atomics.store(i, e + po, (a + o) | 0),
							o
						);
					});
				}
			}),
			(Co = class {
				#e;
				#t;
				#n = new TextEncoder();
				#r;
				#i = null;
				constructor(e, t = 1) {
					((this.#e = new Int32Array(e.control)),
						(this.#t = new Uint8Array(e.data)),
						(this.#r = t || 1),
						e.rx && (this.#i = new So(e)));
				}
				activitySeq() {
					return Atomics.load(this.#e, Ka);
				}
				activityWait(e, t) {
					let n = Atomics.waitAsync(this.#e, Ka, e, t);
					return n.async ? n.value : Promise.resolve(n.value);
				}
				#a(e, t = 0, n = 0, r = 0) {
					let i = this.#e,
						a = Date.now() + 5e3;
					for (;;) {
						let e = Atomics.compareExchange(i, Ga, 0, this.#r);
						if (e === 0) break;
						if ((Atomics.wait(i, Ga, e, 50), Date.now() > a)) {
							(console.warn(`[net] taking the channel from ${e}`),
								Atomics.store(i, Ga, this.#r));
							break;
						}
					}
					return { a0: t, a1: n, a2: r, op: e };
				}
				#o({ op: e, a0: t, a1: n, a2: r }, i) {
					let a = this.#e;
					try {
						for (
							a[Ba] = e,
								a[Va] = t,
								a[Ha] = n,
								a[Ua] = r,
								Atomics.store(a, za, Ja),
								Atomics.notify(a, za);
							Atomics.load(a, za) === Ja;
						)
							if (Atomics.wait(a, za, Ja, 3e4) === `timed-out`)
								throw Error(
									`the page did not answer a network call in thirty seconds`,
								);
						let o = a[Wa];
						return (i?.(o), Atomics.store(a, za, qa), o);
					} finally {
						(Atomics.store(a, Ga, 0), Atomics.notify(a, Ga));
					}
				}
				open() {
					return this.#o(this.#a(Xa));
				}
				connect(e, t, n) {
					let r = this.#a(Za, e, 0, n),
						i = this.#n.encode(t);
					(this.#t.set(i.subarray(0, oo), 0),
						(r.a1 = Math.min(i.length, oo)),
						this.#o(r));
				}
				status(e) {
					return this.#i?.statusOf(e) ?? this.#o(this.#a(Qa, e));
				}
				send(e, t) {
					let n = Math.min(t.length, oo),
						r = this.#a($a, e, n);
					return (this.#t.set(t.subarray(0, n), 0), this.#o(r));
				}
				recv(e, t) {
					let n = this.#i?.recv(e, t, !1, () => this.#s(e));
					return n === void 0
						? this.#o(this.#a(eo, e, Math.min(t.length, oo)), (e) => {
								e > 0 && t.set(this.#t.subarray(0, e), 0);
							})
						: n;
				}
				peek(e, t) {
					let n = this.#i?.recv(e, t, !0, () => this.#s(e));
					return n === void 0
						? this.#o(this.#a(io, e, Math.min(t.length, oo)), (e) => {
								e > 0 && t.set(this.#t.subarray(0, e), 0);
							})
						: n;
				}
				#s(e) {
					this.#o(this.#a(ao, e));
				}
				available(e) {
					return this.#i?.available(e) ?? this.#o(this.#a(to, e)) === 1;
				}
				close(e) {
					this.#o(this.#a(no, e));
				}
				dup(e) {
					return this.#o(this.#a(ro, e));
				}
			}));
	});
function To(e) {
	for (let t = 0; t + 3 < e.length; t++)
		if (e[t] === 13 && e[t + 1] === 10 && e[t + 2] === 13 && e[t + 3] === 10)
			return t;
	return -1;
}
function Eo(e) {
	let [t, ...n] = e.split(`\r
`),
		[r, i, a] = t.split(` `),
		o = new Map();
	for (let e of n) {
		let t = e.indexOf(`:`);
		t > 0 && o.set(e.slice(0, t).trim().toLowerCase(), e.slice(t + 1).trim());
	}
	let s =
		Number(o.get(`content-length`) ?? 0) > 0 || o.has(`transfer-encoding`);
	return {
		method: r,
		target: i ?? ``,
		version: a ?? ``,
		headers: o,
		body: s,
		bad: !r || !i || !/^HTTP\/1\.[01]$/.test(a ?? ``),
	};
}
var Do,
	Oo,
	ko,
	Ao,
	jo,
	Mo = o(() => {
		((Do = {
			200: `OK`,
			206: `Partial Content`,
			304: `Not Modified`,
			400: `Bad Request`,
			404: `Not Found`,
			405: `Method Not Allowed`,
			416: `Range Not Satisfiable`,
			502: `Bad Gateway`,
		}),
			(Oo = [
				`range`,
				`if-range`,
				`if-modified-since`,
				`if-none-match`,
				`accept`,
			]),
			(ko = [
				`content-type`,
				`last-modified`,
				`etag`,
				`content-range`,
				`accept-ranges`,
				`cache-control`,
			]),
			(Ao = new TextEncoder()),
			(jo = class {
				open = !0;
				onopen = null;
				onmessage = null;
				onclose = null;
				onerror = null;
				#e;
				#t;
				#n = new Uint8Array();
				#r = Promise.resolve();
				#i = !1;
				#a = !1;
				#o = null;
				constructor(e, t = null) {
					((this.#e = e),
						(this.#t = t ?? ((e, t) => globalThis.fetch(e, t))),
						queueMicrotask(() => this.onopen?.()));
				}
				send(e) {
					if (this.#i || this.#a) return;
					let t = new Uint8Array(this.#n.length + e.length);
					for (t.set(this.#n), t.set(e, this.#n.length), this.#n = t; ; ) {
						let e = To(this.#n);
						if (e < 0) break;
						let t = new TextDecoder().decode(this.#n.subarray(0, e));
						this.#n = this.#n.subarray(e + 4);
						let n = Eo(t);
						if (
							((this.#r = this.#r
								.then(() => this.#u(n))
								.catch(() => this.#c())),
							n.body || n.bad)
						) {
							this.#a = !0;
							break;
						}
					}
				}
				close() {
					((this.#i = !0), this.#o?.cancel().catch(() => {}));
				}
				#s(e) {
					!this.#i && e.length && this.onmessage?.(e);
				}
				#c() {
					this.#i || ((this.#i = !0), this.onclose?.());
				}
				#l(e, t) {
					let n = [`HTTP/1.1 ${e} ${Do[e] ?? ``}`.trimEnd()];
					for (let [e, r] of t) n.push(`${e}: ${r}`);
					this.#s(
						Ao.encode(
							`${n.join(`\r
`)}\r\n\r\n`,
						),
					);
				}
				async #u(e) {
					if (this.#i) return;
					if (
						!(
							(e.method === `GET` || e.method === `HEAD`) &&
							!e.body &&
							!e.bad &&
							!e.headers.get(`upgrade`)
						)
					) {
						let t = e.bad ? 400 : 405;
						(this.#l(t, [
							[`Allow`, `GET, HEAD`],
							[`Content-Length`, `0`],
							[`Connection`, `close`],
						]),
							this.#c());
						return;
					}
					let t =
							e.version === `HTTP/1.1` &&
							!/\bclose\b/i.test(e.headers.get(`connection`) ?? ``),
						n = t ? [] : [[`Connection`, `close`]],
						r = e.target.replace(/^[a-z]+:\/\/[^/]*/i, ``).replace(/^\/+/, ``),
						i = new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ r,
							this.#e,
						);
					if (!i.href.startsWith(this.#e)) {
						(this.#l(404, [[`Content-Length`, `0`], ...n]), t || this.#c());
						return;
					}
					let a = {};
					for (let t of Oo) e.headers.has(t) && (a[t] = e.headers.get(t));
					let o;
					try {
						o = await this.#t(i.href, { method: e.method, headers: a });
					} catch {
						(this.#l(502, [[`Content-Length`, `0`], ...n]), t || this.#c());
						return;
					}
					let s = [];
					for (let e of ko)
						o.headers.get(e) != null &&
							s.push([
								e.replace(/(^|-)./g, (e) => e.toUpperCase()),
								o.headers.get(e),
							]);
					let c = o.headers.get(`content-encoding`)
							? null
							: o.headers.get(`content-length`),
						l = c == null && e.method === `GET` && o.status !== 304;
					if (
						(c == null
							? l
								? s.push([`Transfer-Encoding`, `chunked`])
								: e.method !== `HEAD` && s.push([`Content-Length`, `0`])
							: s.push([`Content-Length`, c]),
						this.#l(o.status, [...s, ...n]),
						e.method === `GET` && o.body && o.status !== 304)
					) {
						for (this.#o = o.body.getReader(); ; ) {
							let { done: e, value: t } = await this.#o.read();
							if (e || this.#i) break;
							t?.length &&
								(l && this.#s(Ao.encode(`${t.length.toString(16)}\r\n`)),
								this.#s(t),
								l &&
									this.#s(
										Ao.encode(`\r
`),
									));
						}
						((this.#o = null),
							l &&
								this.#s(
									Ao.encode(`0\r
\r
`),
								));
					} else await o.body?.cancel().catch(() => {});
					t || this.#c();
				}
			}));
	}),
	No = c({ NodeNetwork: () => Wo });
async function Po(e, t) {
	if (!e.startsWith(`file:`)) return fetch(e, t);
	let n = (0, zo.fileURLToPath)(e),
		r;
	try {
		if (((r = await (0, Lo.stat)(n)), !r.isFile())) throw Error(`not a file`);
	} catch {
		return new Response(null, {
			status: 404,
			headers: { "content-length": `0` },
		});
	}
	let i = { "last-modified": r.mtime.toUTCString(), "accept-ranges": `bytes` },
		[a, o, s] = [0, r.size - 1, 200],
		c = /^bytes=(\d*)-(\d*)$/.exec(t?.headers?.range ?? ``);
	if (c && (c[1] || c[2])) {
		if (
			(c[1]
				? ([a, o] = [
						Number(c[1]),
						c[2] ? Math.min(Number(c[2]), r.size - 1) : r.size - 1,
					])
				: ([a, o] = [Math.max(0, r.size - Number(c[2])), r.size - 1]),
			a > o || a >= r.size)
		)
			return new Response(null, {
				status: 416,
				headers: {
					"content-range": `bytes */${r.size}`,
					"content-length": `0`,
				},
			});
		((s = 206), (i[`content-range`] = `bytes ${a}-${o}/${r.size}`));
	}
	i[`content-length`] = String(o - a + 1);
	let l =
		t?.method === `HEAD` || o < a
			? null
			: Ro.Readable.toWeb((0, Io.createReadStream)(n, { start: a, end: o }));
	return new Response(l, { status: s, headers: i });
}
var Fo,
	Io,
	Lo,
	Ro,
	zo,
	Bo,
	Vo,
	Ho,
	Uo,
	Wo,
	Go = o(() => {
		((Fo = N()),
			(Io = N()),
			(Lo = N()),
			(Ro = N()),
			(zo = N()),
			Mo(),
			(Bo = 0),
			(Vo = 1),
			(Ho = 2),
			(Uo = 3),
			(Wo = class {
				#e = new Map();
				#t = 1;
				#n = null;
				#r;
				constructor({ pageHosts: e = null, tcp: t = !0 } = {}) {
					((this.#n = e?.size ? e : null), (this.#r = t));
				}
				onActivity = () => {};
				open() {
					let e = this.#t++;
					return (
						this.#e.set(e, {
							sock: null,
							status: Bo,
							rx: [],
							eof: !1,
							refs: 1,
						}),
						e
					);
				}
				connect(e, t, n) {
					let r = this.#e.get(e);
					if (!r) return;
					let i = this.#n?.get(String(t).toLowerCase());
					if (i) {
						let e = new jo(i, Po);
						((e.onmessage = (e) => {
							(r.rx.push(e), this.onActivity());
						}),
							(e.onclose = () => {
								((r.eof = !0), this.onActivity());
							}),
							(r.sock = {
								write: (t) => e.send(new Uint8Array(t)),
								destroy: () => e.close(),
							}),
							(r.status = Vo));
						return;
					}
					if (!this.#r) {
						((r.status = Ho), (r.eof = !0));
						return;
					}
					let a = (0, Fo.createConnection)({ host: t, port: n }, () => {
						((r.status = Vo), this.onActivity());
					});
					(a.on(`data`, (e) => {
						(r.rx.push(e), this.onActivity());
					}),
						a.on(`end`, () => {
							((r.eof = !0), this.onActivity());
						}),
						a.on(`error`, () => {
							((r.status = r.status === Bo ? Ho : Uo),
								(r.eof = !0),
								this.onActivity());
						}),
						a.on(`close`, () => {
							(r.status === Bo && (r.status = Ho),
								(r.eof = !0),
								this.onActivity());
						}),
						(r.sock = a));
				}
				status(e) {
					return this.#e.get(e)?.status ?? Uo;
				}
				send(e, t) {
					let n = this.#e.get(e);
					return !n?.sock || n.status !== Vo
						? -1
						: (n.sock.write(Buffer.from(t)), t.length);
				}
				recv(e, t) {
					let n = this.#e.get(e);
					if (!n) return 0;
					if (!n.rx.length) return n.eof || n.status === Ho ? 0 : -1;
					let r = 0;
					for (; r < t.length && n.rx.length; ) {
						let e = n.rx[0],
							i = Math.min(e.length, t.length - r);
						(t.set(e.subarray(0, i), r),
							(r += i),
							i === e.length ? n.rx.shift() : (n.rx[0] = e.subarray(i)));
					}
					return r;
				}
				peek(e, t) {
					let n = this.#e.get(e);
					if (!n) return 0;
					if (!n.rx.length) return n.eof || n.status === Ho ? 0 : -1;
					let r = 0;
					for (let e of n.rx) {
						if (r >= t.length) break;
						let n = Math.min(e.length, t.length - r);
						(t.set(e.subarray(0, n), r), (r += n));
					}
					return r;
				}
				available(e) {
					let t = this.#e.get(e);
					return !!t && (t.rx.length > 0 || t.eof || t.status === Ho);
				}
				dup(e) {
					let t = this.#e.get(e);
					return t ? (t.refs++, 1) : 0;
				}
				close(e) {
					let t = this.#e.get(e);
					(t && --t.refs > 0) || (t?.sock?.destroy(), this.#e.delete(e));
				}
			}));
	}),
	Ko,
	qo,
	Jo = o(() => {
		((Ko = typeof globalThis > `u` ? window : globalThis),
			(qo = Ko.WebSocket),
			Ko.crypto);
	}),
	Yo,
	Xo,
	Zo,
	Qo,
	$o,
	es,
	ts,
	ns,
	rs,
	is,
	as,
	os,
	ss,
	cs,
	ls = o(() => {
		((Yo = new TextEncoder()),
			(Xo = Yo.encode.bind(Yo)),
			(Zo = new TextDecoder()),
			(Qo = Zo.decode.bind(Zo)),
			($o = class e {
				constructor(e) {
					if (e instanceof Uint8Array) this.from_array(e);
					else if (typeof e == `number`) this.from_array(new Uint8Array(e));
					else if (typeof e == `string`) this.from_array(Xo(e));
					else
						throw (
							console.trace(),
							`invalid data type passed to wisp buffer constructor`
						);
				}
				from_array(e) {
					((this.size = e.length),
						(this.bytes = e),
						(this.view = new DataView(e.buffer)));
				}
				concat(t) {
					let n = new e(this.size + t.size);
					return (
						n.bytes.set(this.bytes, 0),
						n.bytes.set(t.bytes, this.size),
						n
					);
				}
				slice(t, n) {
					let r = this.bytes.slice(t, n);
					return new e(r);
				}
				get_string() {
					return Zo.decode(this.bytes);
				}
			}),
			(es = class e {
				static min_size = 5;
				constructor({ type: e, stream_id: t, payload: n, payload_bytes: r }) {
					((this.type = e),
						(this.stream_id = t),
						(this.payload_bytes = r),
						(this.payload = n));
				}
				static parse(t) {
					return new e({
						type: t.view.getUint8(0),
						stream_id: t.view.getUint32(1, !0),
						payload_bytes: t.slice(5),
					});
				}
				static parse_all(t) {
					if (t.size < e.min_size) throw TypeError(`packet too small`);
					let n = e.parse(t),
						r = os[n.type];
					if (r === void 0) throw TypeError(`invalid packet type`);
					if (n.payload_bytes.size < r.size)
						throw TypeError(`payload too small`);
					return ((n.payload = r.parse(n.payload_bytes)), n);
				}
				serialize() {
					let e = new $o(5);
					return (
						e.view.setUint8(0, this.type),
						e.view.setUint32(1, this.stream_id, !0),
						(e = e.concat(this.payload.serialize())),
						e
					);
				}
			}),
			(ts = class e {
				static min_size = 3;
				static type = 1;
				static name = `CONNECT`;
				constructor({ stream_type: e, port: t, hostname: n }) {
					((this.stream_type = e), (this.port = t), (this.hostname = n));
				}
				static parse(t) {
					return new e({
						stream_type: t.view.getUint8(0),
						port: t.view.getUint16(1, !0),
						hostname: Qo(t.slice(3).bytes),
					});
				}
				serialize() {
					let e = new $o(3);
					return (
						e.view.setUint8(0, this.stream_type),
						e.view.setUint16(1, this.port, !0),
						(e = e.concat(new $o(this.hostname))),
						e
					);
				}
			}),
			(ns = class e {
				static min_size = 0;
				static type = 2;
				static name = `DATA`;
				constructor({ data: e }) {
					this.data = e;
				}
				static parse(t) {
					return new e({ data: t });
				}
				serialize() {
					return this.data;
				}
			}),
			(rs = class e {
				static type = 3;
				static name = `CONTINUE`;
				constructor({ buffer_remaining: e }) {
					this.buffer_remaining = e;
				}
				static parse(t) {
					return new e({ buffer_remaining: t.view.getUint32(0, !0) });
				}
				serialize() {
					let e = new $o(4);
					return (e.view.setUint32(0, this.buffer_remaining, !0), e);
				}
			}),
			(is = class e {
				static min_size = 1;
				static type = 4;
				static name = `CLOSE`;
				constructor({ reason: e }) {
					this.reason = e;
				}
				static parse(t) {
					return new e({ reason: t.view.getUint8(0) });
				}
				serialize() {
					let e = new $o(1);
					return (e.view.setUint8(0, this.reason), e);
				}
			}),
			(as = class e {
				static min_size = 2;
				static type = 5;
				static name = `INFO`;
				constructor({ major_ver: e, minor_ver: t, extensions: n }) {
					((this.major_ver = e), (this.minor_ver = t), (this.extensions = n));
				}
				static parse(t) {
					return new e({
						major_ver: t.view.getUint8(0),
						minor_ver: t.view.getUint8(1),
						extensions: t.slice(2),
					});
				}
				serialize() {
					let e = new $o(2);
					return (
						e.view.setUint8(0, this.major_ver),
						e.view.setUint8(1, this.minor_ver),
						e.concat(this.extensions)
					);
				}
			}),
			(os = { 1: ts, 2: ns, 3: rs, 4: is, 5: as }),
			(ss = { CONNECT: 1, DATA: 2, CONTINUE: 3, CLOSE: 4, INFO: 5 }),
			(cs = { TCP: 1, UDP: 2 }));
	});
function us(e, t, n) {
	let r = [];
	for (; e.size; ) {
		let i = e.view.getUint8(0),
			a = e.view.getUint32(1, !0),
			o = e.slice(0, 5 + a),
			s;
		for (let e of t)
			if (e.id === i) {
				s = e.constructor;
				break;
			}
		if (s) {
			let e = ps.parse(s, o, n);
			r.push(e);
		}
		e = e.slice(5 + a);
	}
	return r;
}
function ds(e) {
	{
		let t = new $o(0);
		for (let n of e) t = t.concat(n.serialize());
		return t;
	}
}
var fs,
	ps,
	ms,
	hs,
	gs = o(() => {
		(ls(),
			(fs = class e {
				constructor() {}
				static parse() {
					return new e();
				}
				serialize() {
					return new $o(0);
				}
			}),
			(ps = class {
				static id = 0;
				static name = ``;
				static Server = fs;
				static Client = fs;
				constructor({ server_config: e, client_config: t } = {}) {
					((this.id = this.constructor.id),
						(this.name = this.constructor.name),
						e
							? (this.payload = new this.constructor.Server(e))
							: t && (this.payload = new this.constructor.Client(t)));
				}
				static parse(e, t, n) {
					let r = new e({});
					if (n === `client`) r.payload = e.Client.parse(t.slice(5));
					else if (n === `server`) r.payload = e.Server.parse(t.slice(5));
					else throw TypeError(`invalid role`);
					return r;
				}
				serialize() {
					let e = new $o(5),
						t = this.payload.serialize();
					return (
						e.view.setInt8(0, this.constructor.id),
						e.view.setUint32(1, t.size, !0),
						e.concat(t)
					);
				}
			}),
			(ms = class extends ps {
				static id = 1;
				static name = `UDP`;
			}),
			(hs = class e extends ps {
				static id = 4;
				static name = `Server MOTD`;
				static Server = class {
					constructor({ message: e }) {
						this.message = e;
					}
					static parse(t) {
						return new e.Server({ message: t.get_string() });
					}
					serialize() {
						return new $o(this.message);
					}
				};
				static Client = fs;
			}));
	}),
	_s,
	vs,
	ys = o(() => {
		(Jo(),
			ls(),
			gs(),
			(_s = class {
				constructor(e, t, n, r, i, a, o) {
					((this.hostname = e),
						(this.port = t),
						(this.ws = n),
						(this.buffer_size = r),
						(this.stream_id = i),
						(this.connection = a),
						(this.stream_type = o),
						(this.send_buffer = []),
						(this.open = !0),
						(this.onopen = () => {}),
						(this.onclose = () => {}),
						(this.onmessage = () => {}));
				}
				send(e) {
					if (
						this.buffer_size > 0 ||
						!this.open ||
						this.stream_type === cs.UDP
					) {
						let t = new es({
							type: ss.DATA,
							stream_id: this.stream_id,
							payload: new ns({ data: new $o(e) }),
						});
						(this.ws.send(t.serialize().bytes), this.buffer_size--);
					} else this.send_buffer.push(e);
				}
				continue_received(e) {
					for (
						this.buffer_size = e;
						this.buffer_size > 0 && this.send_buffer.length > 0;
					)
						this.send(this.send_buffer.shift());
				}
				close(e = 1) {
					if (!this.open) return;
					let t = new es({
						type: ss.CLOSE,
						stream_id: this.stream_id,
						payload: new is({ reason: e }),
					});
					(this.ws.send(t.serialize().bytes),
						(this.open = !1),
						delete this.connection.active_streams[this.stream_id]);
				}
			}),
			(vs = class {
				constructor(e, { wisp_version: t, wisp_extensions: n } = {}) {
					if (!e.endsWith(`/`))
						throw TypeError(
							`wisp endpoints must end with a trailing forward slash`,
						);
					((this.wisp_url = e),
						(this.wisp_version = t || 2),
						(this.wisp_extensions = n || null),
						(this.max_buffer_size = null),
						(this.active_streams = {}),
						(this.connected = !1),
						(this.connecting = !1),
						(this.next_stream_id = 1),
						(this.server_exts = {}),
						(this.client_exts = {}),
						(this.info_received = !1),
						(this.server_motd = null),
						(this.udp_enabled = !0),
						(this.onopen = () => {}),
						(this.onclose = () => {}),
						(this.onerror = () => {}),
						(this.onmessage = () => {}),
						this.wisp_version === 2 &&
							this.wisp_extensions === null &&
							this.add_extensions(),
						this.connect_ws());
				}
				add_extensions() {
					((this.wisp_extensions = []),
						this.wisp_extensions.push(new ms({ client_config: {} })),
						this.wisp_extensions.push(new hs({ client_config: {} })));
				}
				connect_ws() {
					let e = this.wisp_version === 2 ? `wisp-v2` : void 0;
					((this.ws = new qo(this.wisp_url, e)),
						(this.ws.binaryType = `arraybuffer`),
						(this.connecting = !0),
						(this.ws.onerror = () => {
							if (this.wisp_version === 2) {
								((this.ws.onclose = null),
									this.cleanup(),
									(this.wisp_version = 1),
									this.connect_ws());
								return;
							}
							(this.cleanup(), this.onerror());
						}),
						(this.ws.onclose = () => {
							(this.cleanup(), this.onclose());
						}),
						(this.ws.onmessage = (e) => {
							(this.on_ws_msg(e),
								this.connected &&
									this.connecting &&
									((this.connecting = !1), this.onopen()));
						}));
				}
				close() {
					this.ws.close();
				}
				create_stream(e, t, n = 1) {
					let r = n;
					if (
						(typeof r == `string` && (r = n === `udp` ? cs.UDP : cs.TCP),
						r == cs.UDP && !this.udp_enabled)
					)
						throw Error(`udp is not enabled for this wisp connection`);
					let i = this.next_stream_id++,
						a = new _s(e, t, this.ws, this.max_buffer_size, i, this, r);
					((this.active_streams[i] = a), (a.open = this.connected));
					let o = new es({
						type: ss.CONNECT,
						stream_id: i,
						payload: new ts({ stream_type: r, port: t, hostname: e }),
					});
					return (this.ws.send(o.serialize().bytes), a);
				}
				close_stream(e, t) {
					(e.onclose(t), delete this.active_streams[e.stream_id]);
				}
				on_ws_msg(e) {
					let t = new $o(new Uint8Array(e.data));
					if (t.size < es.min_size) {
						console.warn(
							`wisp client warning: received a packet which is too short`,
						);
						return;
					}
					let n = es.parse_all(t),
						r = this.active_streams[n.stream_id];
					if (n.stream_id === 0 && this.connecting) {
						if (
							(n.type === ss.CONTINUE &&
								((this.max_buffer_size = n.payload.buffer_remaining),
								(this.connected = !0),
								this.info_received || (this.wisp_version = 1)),
							n.type === ss.INFO && this.wisp_version === 2)
						) {
							let e = us(n.payload.extensions, this.wisp_extensions, `server`);
							for (let t of e)
								for (let e of this.wisp_extensions)
									t.id === e.id &&
										((this.server_exts[t.id] = t),
										(this.client_exts[e.id] = e));
							((this.info_received = !0),
								(this.server_motd = this.server_exts[hs.id]?.payload?.message),
								(this.udp_enabled = !!this.server_exts[ms.id]));
							let t = ds(this.wisp_extensions),
								r = new es({
									type: as.type,
									stream_id: 0,
									payload: new as({
										major_ver: this.wisp_version,
										minor_ver: 0,
										extensions: t,
									}),
								});
							this.ws.send(r.serialize().bytes);
						}
						return;
					}
					if (r === void 0) {
						console.warn(
							`wisp client warning: received a ${os[n.type].name} packet for a stream which doesn't exist`,
						);
						return;
					}
					n.type === ss.DATA
						? r.onmessage(n.payload_bytes.bytes)
						: n.type === ss.CONTINUE
							? r.continue_received(n.payload.buffer_remaining)
							: n.type === ss.CLOSE
								? this.close_stream(r, n.payload.reason)
								: console.warn(
										`wisp client warning: received an invalid packet of type ${n.type}`,
									);
				}
				cleanup() {
					((this.connected = !1), (this.connecting = !1));
					for (let e of Object.keys(this.active_streams))
						this.close_stream(this.active_streams[e], 3);
				}
			}));
	}),
	bs = o(() => {
		(Jo(), ys(), Ko.CloseEvent);
	}),
	xs = o(() => {
		(ys(), bs());
	}),
	Ss = o(() => {
		(xs(), ls(), gs());
	}),
	Cs = c({ WispNetwork: () => js }),
	ws,
	Ts,
	Es,
	Ds,
	Os,
	ks,
	As,
	js,
	Ms = o(() => {
		(Ss(),
			Vt(),
			Mo(),
			(ws = 0),
			(Ts = 1),
			(Es = 2),
			(Ds = 3),
			(Os = 16 << 20),
			(ks = class {
				constructor(e) {
					((this.id = e),
						(this.state = ws),
						(this.chunks = []),
						(this.buffered = 0),
						(this.wisp = null),
						(this.refs = 1),
						(this.slot = -1));
				}
				take(e) {
					let t = 0;
					for (; t < e.length && this.chunks.length; ) {
						let n = this.chunks[0],
							r = Math.min(e.length - t, n.length);
						(e.set(n.subarray(0, r), t),
							(t += r),
							r === n.length
								? this.chunks.shift()
								: (this.chunks[0] = n.subarray(r)),
							(this.buffered -= r));
					}
					return t;
				}
				peek(e) {
					let t = 0;
					for (let n of this.chunks) {
						if (t >= e.length) break;
						let r = Math.min(e.length - t, n.length);
						(e.set(n.subarray(0, r), t), (t += r));
					}
					return t;
				}
			}),
			(As = { n: 0, bytes: 0, last: 0 }),
			(js = class {
				#e = null;
				#t = new Map();
				#n = 1;
				#r;
				#i;
				#a = !1;
				#o = 0;
				#s = [];
				#c = null;
				#l = null;
				rings = null;
				onActivity = () => {};
				constructor(
					e,
					t = () => {},
					{ pageHosts: n = null, dial: r = null } = {},
				) {
					((this.#r = e == null ? null : e.endsWith(`/`) ? e : `${e}/`),
						(this.#i = t),
						(this.#c = n?.size ? n : null),
						(this.#l = r));
				}
				get pageHosts() {
					return this.#c ?? void 0;
				}
				get url() {
					return this.#r;
				}
				async start() {
					this.#e ||
						this.#r == null ||
						(await new Promise((e, t) => {
							let n = new vs(this.#r);
							((n.onopen = () => {
								((this.#e = n), (this.#o = 0), e());
								let t = this.#s;
								this.#s = [];
								for (let [e, n, r] of t) this.connect(e, n, r);
							}),
								(n.onerror = (e) =>
									t(Error(`wisp: ${e?.message || `could not connect`}`))),
								(n.onclose = () => {
									for (let e of this.#t.values()) e.waiting || this.#d(e, Es);
									this.#e === n &&
										((this.#e = null), this.#i(`closed`), this.#u());
								}),
								setTimeout(
									() => t(Error(`wisp: the proxy did not answer`)),
									1e4,
								));
						}),
						this.#i(`open`));
				}
				#u() {
					if (this.#a) return;
					this.#a = !0;
					let e = Math.min(250 * 2 ** this.#o, 8e3);
					((this.#o += 1),
						console.info(
							`[wisp] connection dropped; dialling again in ${e} ms`,
						),
						setTimeout(() => {
							this.start()
								.catch((e) => console.warn(`[wisp] ${e.message}`))
								.finally(() => {
									((this.#a = !1), this.#e || this.#u());
								});
						}, e));
				}
				open() {
					if (!this.#e && !this.#a && !this.#c && !this.#l) return 0;
					let e = this.#n++,
						t = new ks(e);
					return (
						this.rings && (t.slot = this.rings.claim(e)),
						this.#t.set(e, t),
						e
					);
				}
				#d(e, t) {
					((e.state = t), e.slot >= 0 && this.rings?.setState(e.slot, t));
				}
				connect(e, t, n) {
					let r = this.#t.get(e);
					if (!r) return;
					let i = this.#c?.get(String(t).toLowerCase());
					if (i) {
						this.#f(r, e, new jo(i), t, n);
						return;
					}
					if (this.#l) {
						let i;
						try {
							i = this.#l(t, n);
						} catch {
							this.#d(r, Ds);
							return;
						}
						this.#f(r, e, i, t, n);
						return;
					}
					if (!this.#e) {
						if (!this.#a) return;
						((r.waiting = !0), this.#s.push([e, t, n]));
						return;
					}
					r.waiting = !1;
					let a;
					try {
						a = this.#e.create_stream(t, n, `tcp`);
					} catch {
						this.#d(r, Ds);
						return;
					}
					this.#f(r, e, a, t, n);
				}
				#f(e, t, n, r, i) {
					((e.wisp = n),
						(n.onopen = () => {
							(this.#d(e, Ts), this.onActivity());
						}),
						(n.onmessage = (n) => {
							let r = n instanceof Uint8Array ? n : new Uint8Array(n),
								i = performance.now();
							if (!e.firstRecv) {
								e.firstRecv = i;
								let n = e.firstSend ? (i - e.firstSend) / 1e3 : -1;
								L(`debug`) &&
									console.info(
										`[wisp] stream ${t}: first reply at ${(i / 1e3).toFixed(1)}s, ${n.toFixed(1)}s after the request`,
									);
							}
							(As.last &&
								i - As.last > 1e3 &&
								L(`debug`) &&
								console.info(
									`[wisp] nothing for ${((i - As.last) / 1e3).toFixed(1)}s after ${As.n} messages and ${(As.bytes / 1048576).toFixed(1)} MiB`,
								),
								(As.last = i),
								(As.n += 1),
								(As.bytes += r.length),
								e.buffered > Os &&
									!e.warned &&
									((e.warned = !0),
									console.warn(
										`[wisp] stream ${t}: ${e.buffered >> 20} MiB unread`,
									)),
								this.#p(e, r),
								this.onActivity());
						}),
						(n.onclose = () => {
							(this.#d(e, e.state === ws ? Ds : Es), this.onActivity());
						}),
						(n.onerror = () => {
							(this.#d(e, e.state === ws ? Ds : Es), this.onActivity());
						}),
						(n.open === !0 || e.wisp?.open === !0) && this.#d(e, Ts),
						this.#i(`connect ${r}:${i}`));
				}
				#p(e, t) {
					(e.slot >= 0 &&
						!e.chunks.length &&
						(t = t.subarray(this.rings.write(e.slot, t))),
						t.length &&
							(e.chunks.push(t),
							(e.buffered += t.length),
							e.slot >= 0 && this.rings.setSpill(e.slot, !0)));
				}
				refill(e) {
					let t = this.#t.get(e);
					if (!t || t.slot < 0) return 0;
					for (; t.chunks.length; ) {
						let e = t.chunks[0],
							n = this.rings.write(t.slot, e);
						if (((t.buffered -= n), n < e.length)) {
							t.chunks[0] = e.subarray(n);
							break;
						}
						t.chunks.shift();
					}
					return (this.rings.setSpill(t.slot, t.chunks.length > 0), 1);
				}
				status(e) {
					let t = this.rings?.statusOf(e);
					if (t !== void 0) return t;
					let n = this.#t.get(e);
					return n
						? (n.state === ws && n.chunks.length && (n.state = Ts), n.state)
						: Es;
				}
				send(e, t) {
					let n = this.#t.get(e);
					return !n || !n.wisp || n.state === Es || n.state === Ds
						? -1
						: ((n.sends = (n.sends ?? 0) + 1),
							(n.firstSend ||= performance.now()),
							L(`debug`) &&
								console.info(
									`[wisp] stream ${e}: send ${n.sends}, ${t.length} bytes at ${(performance.now() / 1e3).toFixed(1)}s`,
								),
							n.wisp.send(t.slice()),
							t.length);
				}
				recv(e, t) {
					let n = this.rings?.recv(e, t, !1, () => this.refill(e));
					if (n !== void 0) return n;
					let r = this.#t.get(e);
					return r
						? r.chunks.length
							? r.take(t)
							: r.state === Es || r.state === Ds
								? 0
								: -1
						: 0;
				}
				peek(e, t) {
					let n = this.rings?.recv(e, t, !0, () => this.refill(e));
					if (n !== void 0) return n;
					let r = this.#t.get(e);
					return r
						? r.chunks.length
							? r.peek(t)
							: r.state === Es || r.state === Ds
								? 0
								: -1
						: 0;
				}
				available(e) {
					let t = this.rings?.available(e);
					if (t !== void 0) return t;
					let n = this.#t.get(e);
					return !n || n.chunks.length > 0 || n.state === Es || n.state === Ds;
				}
				dup(e) {
					let t = this.#t.get(e);
					return t ? (t.refs++, 1) : 0;
				}
				close(e) {
					let t = this.#t.get(e);
					if (t && !(--t.refs > 0)) {
						try {
							t.wisp?.close();
						} catch {}
						(this.#t.delete(e), t.slot >= 0 && this.rings?.release(t.slot));
					}
				}
			}));
	}),
	Ns = c({});
async function Ps() {
	if (typeof self < `u` && typeof self.postMessage == `function`)
		return {
			post: (e, t) =>
				t && t.length ? self.postMessage(e, t) : self.postMessage(e),
			on: (e) => {
				self.onmessage = (t) => e(t.data);
			},
		};
	let { parentPort: e } = await Promise.resolve().then(() => u(N(), 1)),
		t = null;
	return {
		post: (t, n) => (n && n.length ? e.postMessage(t, n) : e.postMessage(t)),
		on: (n) => {
			(t || e.on(`message`, (e) => t(e)), (t = n));
		},
	};
}
function Fs(e) {
	let t = 0;
	for (let n of e?.image ?? [])
		t = Math.max(t, n.end ?? 0, n.at + (n.len ?? n.bytes?.byteLength ?? 0));
	return t;
}
async function Is(e) {
	let t = e?.bulk;
	if (!t) return;
	delete e.bulk;
	let n = await new Promise((e) => {
		t.onmessage = (t) => e(t.data);
	});
	(t.close(), Object.assign(e, n));
}
function Ls() {
	for (let e of Vs) (clearTimeout(e), clearInterval(e));
	Vs.clear();
	for (let e of Object.getOwnPropertyNames(globalThis))
		if (!(Hs.has(e) || e === `__gexMarkedConsole`))
			try {
				delete globalThis[e];
			} catch {}
}
async function Rs(e, t = null) {
	let n = { on: !0 },
		r = {
			post: (t, r) => {
				n.on && e.post(t, r);
			},
			on: e.on,
		};
	S.on || ue((e) => r.post({ kind: `note`, note: e }));
	let i = null,
		a = new Map();
	globalThis.__gexWho = () => i?.who ?? null;
	let o = t?.pooled ?? new Map(),
		s = (t?.runs ?? 0) + 1,
		c = {
			gl: () => Promise.resolve().then(() => (gi(), Br)),
			wl: () => Promise.resolve().then(() => (Fa(), _i)),
			net: () => Promise.resolve().then(() => (wo(), Ia)),
		},
		l = {},
		d = (e) => l[e] ?? c[e]().then((t) => (l[e] = t)),
		f = null,
		p = !0,
		m = null,
		h = null,
		g = null,
		_ = !1,
		v = () => 0,
		y = 0,
		b = () => {};
	r.on((t) => {
		if (t?.kind === `spareGo`) {
			(h ? h(t.thread ?? null) : (m = t), (h = null));
			return;
		}
		if (t?.kind === `reset`) {
			((n.on = !1),
				Ls(),
				Rs(e, { pooled: o, runs: s }).catch((t) => {
					(console.error(
						`gex: a given-back worker could not start again:`,
						t?.stack ?? t,
					),
						e.post({ kind: `threw`, message: String(t?.message ?? t) }));
				}));
			return;
		}
		ie(t).catch((e) => {
			let t = e?.stack ?? e?.message ?? String(e);
			(typeof console < `u` && console.error(`gex: worker failed:`, t),
				r.post({ kind: `threw`, message: t }));
		});
	});
	function x(e) {
		let t = e.shim.exports;
		if (!t.gex_hot_blocks) return [];
		let n = t.gex_alloc(4096) >>> 0,
			r = t.gex_hot_blocks(n, 4096) >>> 0,
			i = z(new Uint8Array(e.memory.buffer, n, r)).trim();
		return i
			? i
					.split(
						`
`,
					)
					.map((n) => {
						let [r, i] = n.split(` `),
							a = t.gex_alloc(160) >>> 0,
							o = t.gex_object_at
								? t.gex_object_at(BigInt(r), a, 160) >>> 0
								: 0,
							s = o ? z(new Uint8Array(e.memory.buffer, a, o)) : r;
						return `${String(i).padStart(10)}  ${s}`;
					})
			: [];
	}
	let C = [],
		w = 0,
		T = null,
		ee = null;
	function E(e) {
		(C.push(e), ee && C.length >= w && ee());
	}
	let te = new Map();
	function ne(e) {
		let t = te.get(e);
		if (!t) {
			let n;
			((t = {
				p: new Promise((e) => {
					n = e;
				}),
				settle: n,
			}),
				te.set(e, t),
				r.post({ kind: `wantLibrary`, i: e }));
		}
		return t.p;
	}
	function re(e) {
		return (
			(w = e),
			!e || C.length >= e
				? Promise.resolve(C)
				: ((T ??= new Promise((e) => {
						ee = e;
					})),
					C.length >= w && ee(),
					T.then(() => C))
		);
	}
	async function ie(t) {
		if ((zt(t?.log), t?.unitFiles?.buf)) {
			let { buf: e, index: n } = t.unitFiles;
			for (let [t, r, i] of n)
				a.has(t) || a.set(t, i < 0 ? null : new Uint8Array(e, r, i));
		}
		if (t?.kind === `closureMeta`) {
			((t.metas ?? []).forEach((e, n) =>
				E({ meta: e, mod: null, program: (t.programs ?? [])[n] ?? `` }),
			),
				(w = C.length),
				ee?.());
			return;
		}
		if (t?.kind === `closureModule`) {
			if (typeof t.i == `number`) {
				let e = te.get(t.i);
				(C[t.i] && (C[t.i].mod = t.mod), e?.settle(t.mod));
				return;
			}
			E(t.entry);
			return;
		}
		if (t?.kind === `stdin`) {
			(g?.(t.bytes), (g = null));
			return;
		}
		if (t?.kind === `winsize`) {
			b(t.rows, t.cols);
			return;
		}
		if (t?.kind === `eof`) {
			((_ = !0), g?.(null), (g = null));
			return;
		}
		if (t?.kind === `sharedModule`) {
			i?.addSharedModule(t.key, t.mod);
			return;
		}
		if (t?.kind === `droppedModules`) {
			i?.dropSharedModules(t.keys);
			for (let e of t.keys ?? []) o.delete(e);
			return;
		}
		if (t?.kind === `pooledModules`) {
			for (let [e, n] of t.entries ?? []) o.set(e, n);
			return;
		}
		if (t?.kind === `preattach`) {
			let n = !!t.shared,
				r = t.kernelStack,
				i = !!t.mem64;
			(i ? (globalThis.GEX_MEM64 = 1) : delete globalThis.GEX_MEM64,
				t.pageFlavours !== void 0 &&
					(globalThis.GEX_PAGE_FLAVOURS = t.pageFlavours),
				(f = (async () => {
					let a = new Rr(new Fr(), {
						kernel: { ...t.kernel, stackTop: r },
						shared: n,
						modules: o,
						fiber: e.fiber ?? null,
					});
					return (
						await a.preattach(t.shim, t.guest),
						{ gex: a, shared: n, stack: r, mem64: i }
					);
				})().catch(
					(e) => (
						console.error(
							`[gex] a pooled Worker could not prepare a runtime: ${e?.message ?? e}`,
						),
						null
					),
				)));
			return;
		}
		if (t?.kind === `door`) {
			i?.setDoor(t.door);
			return;
		}
		if (t?.kind !== `run` && t?.kind !== `adopt` && t?.kind !== `thread`)
			return;
		if (
			(t.kind === `adopt` && (await Is(t.child)),
			t.kind === `thread` && (await Is(t)),
			bt(t),
			!globalThis.__gexMarkedConsole)
		) {
			globalThis.__gexMarkedConsole = !0;
			let e = globalThis.process?.getBuiltinModule?.(`fs`),
				t = e
					? (...t) => {
							let n =
								t
									.map((e) =>
										typeof e == `string` ? e : e?.stack || String(e),
									)
									.join(` `) +
								`
`;
							try {
								e.writeSync(2, n);
							} catch {
								console.error(...t);
							}
						}
					: console.error.bind(console);
			console.error = (...e) => {
				let n = e
					.map((e) => (typeof e == `string` ? e : e?.stack || String(e)))
					.join(` `);
				if (
					n.includes(`
`)
				)
					for (let e of n.split(`
`))
						t(`[gex-console-error]`, e);
				else t(`[gex-console-error]`, ...e);
			};
		}
		let n = 0,
			c = t.outputAck ? new Int32Array(t.outputAck) : null,
			l = new Map(
				(t.preModules ?? [])
					.filter(([e]) => e.startsWith(`file:`))
					.map(([e, t]) => [e.slice(5), t]),
			),
			T = (t.preModules ?? []).some(([e]) => e === `closed`),
			ie = null;
		if (t.cgen?.zstd && typeof XMLHttpRequest == `function`)
			try {
				let e = R(`unitstall`) ? performance.now() : -1,
					{ ZSTDDecoder: n } = await import(
						/* @vite-ignore */ /* webpackIgnore: true */ t.cgen.zstd
					);
				((ie = new n()),
					await ie.init(),
					e >= 0 &&
						console.warn(
							`[unitzstd] decoder ready in ${(performance.now() - e).toFixed(1)} ms`,
						));
			} catch (e) {
				(console.error(
					`[gex] no zstd decoder for units (${t.cgen.zstd}): ${e?.message ?? e}`,
				),
					(ie = null));
			}
		class ae extends Fr {
			drainOutput() {
				if (!c) return;
				let e = Date.now() + 1e4;
				for (;;) {
					let t = Atomics.load(c, 0);
					if (t >= n) return;
					let r = e - Date.now();
					if (r <= 0) {
						console.error(
							`[gex] exit: the host delivered ${t} of ${n} output messages in 10s; exiting anyway`,
						);
						return;
					}
					Atomics.wait(c, 0, t, Math.min(r, 100));
				}
			}
			write(e, i) {
				(t.debugExit && console.error(z(i.slice())),
					n++,
					r.post(
						t.rawOutput
							? { kind: `output`, fd: e, bytes: i.slice(), lflag: y }
							: { kind: `output`, fd: e, text: z(i.slice()), lflag: y },
					));
			}
			now() {
				return hn();
			}
			async readStdin() {
				if (_) return !1;
				let e = await new Promise((e) => {
					((g = e), (y = v()), r.post({ kind: `stdin`, lflag: y }));
				});
				return e === !0
					? !0
					: e
						? (O.pushStdin(e instanceof Uint8Array ? e : new Uint8Array(e)), !0)
						: !1;
			}
			async spawnProcess(e) {
				if (Bs()) {
					let t = new MessageChannel(),
						n = {};
					for (let t of zs) n[t] = e[t];
					let i = { ...e, extent: Fs(e), bulk: t.port2 };
					for (let e of zs) delete i[e];
					(t.port1.postMessage(n, st(n)),
						r.post({ kind: `fork`, child: i }, [t.port2]));
					return;
				}
				r.post({ kind: `fork`, child: e }, st(e));
			}
			snapParked(e) {
				r.post({ kind: `snap-parked`, ...e, memory: O.memory });
			}
			async spawnThread(e) {
				if (((p = !1), Bs() && !t.memories && e.memory)) {
					let t = new MessageChannel();
					(t.port1.postMessage({ memory: e.memory }),
						r.post(
							{
								kind: `thread`,
								thread: { ...e, memory: void 0, bulk: t.port2 },
							},
							[t.port2],
						));
					return;
				}
				r.post({ kind: `thread`, thread: e });
			}
			offerSpare(e) {
				((p = !1), r.post({ kind: `threadSpare`, spare: e }));
			}
			shareModule(e, t) {
				r.post({ kind: `compiledModule`, key: e, mod: t });
			}
			dropModules(e) {
				r.post({ kind: `droppedModules`, keys: e });
			}
			publishDoor(e) {
				((p = !1), r.post({ kind: `doorPublish`, door: e }));
			}
			noteStatus(e) {
				(e?.program !== void 0 &&
					(this.owner = String(e.path ?? ``)
						.split(/[\\/]/)
						.pop()),
					pe(e));
			}
			owner = ``;
			prefetchUnit(e) {
				let n = t.cgen;
				if (!n?.url || T || l.has(`${e}/c.wasm`)) return;
				let i;
				try {
					i = new URL(
						`${n.url}/${e}/c.wasm${n.zst ? `.zst` : ``}`,
						globalThis.location?.href,
					).href;
				} catch {
					return;
				}
				r.post({ kind: `prefetchUnit`, key: e, url: i });
			}
			loadUnit(e) {
				let t = this.loadFile(`${e}/c.entries`);
				if (!t) return null;
				let n = this,
					r;
				return {
					entries: t,
					get wasm() {
						return ((r ??= n.loadFile(`${e}/c.wasm`)), r);
					},
				};
			}
			loadRange(e, n, r) {
				let i = t.cgen;
				if (!i) return null;
				try {
					if (i.root) {
						let t = globalThis.process?.getBuiltinModule?.(`node:fs`);
						if (!t) return null;
						let a = t.openSync(`${i.root}/${e}`, `r`);
						try {
							let e = new Uint8Array(r);
							return t.readSync(a, e, 0, r, n) === r ? e : null;
						} finally {
							t.closeSync(a);
						}
					}
					let t = new XMLHttpRequest();
					(t.open(`GET`, `${i.url}/${e}`, !1),
						(t.responseType = `arraybuffer`),
						t.setRequestHeader(`Range`, `bytes=${n}-${n + r - 1}`));
					let a = fe(`unit:${e}`, r, this.owner);
					try {
						t.send();
					} finally {
						a(t.response?.byteLength ?? 0);
					}
					let o = new Uint8Array(t.response ?? new ArrayBuffer(0)),
						s = t.status === 206 ? 0 : t.status === 200 ? n : -1;
					return s >= 0 && o.length >= s + r ? o.slice(s, s + r) : null;
				} catch {
					return null;
				}
			}
			get zstd() {
				return ie;
			}
			loadFile(e) {
				let n = t.cgen;
				if (!n) return null;
				let o = l.get(e);
				if (o) return o.slice();
				let s = Ie(`unit:${e}`);
				if (s) return s;
				if (T) return null;
				if (a.has(e)) {
					let t = a.get(e);
					return t ? t.slice() : null;
				}
				try {
					if (n.root) {
						let t = globalThis.process?.getBuiltinModule?.(`node:fs`);
						return t ? new Uint8Array(t.readFileSync(`${n.root}/${e}`)) : null;
					}
					if (n.files && !n.files[e]) return null;
					let t = n.zst && ie && e.endsWith(`/c.wasm`),
						o = new XMLHttpRequest();
					(o.open(
						`GET`,
						n.files ? n.files[e] : `${n.url}/${e}${t ? `.zst` : ``}`,
						!1,
					),
						(o.responseType = `arraybuffer`));
					let s = fe(`unit:${e}`, 0, this.owner),
						c = R(`unitstall`) ? performance.now() : -1;
					try {
						o.send();
					} finally {
						s(o.response?.byteLength ?? 0);
					}
					(c >= 0 &&
						console.warn(
							`[unitxhr] ${i?.who?.pid ?? `?`}: ${e} ${o.status} ${(performance.now() - c).toFixed(1)} ms`,
						),
						t &&
							o.status === 404 &&
							(o.open(`GET`, `${n.url}/${e}`, !1), o.send()));
					let l = t && o.responseURL?.endsWith(`.zst`),
						u =
							o.status === 200
								? l
									? ie.decode(new Uint8Array(o.response))
									: new Uint8Array(o.response)
								: null;
					if (
						(u === null ? o.status === 404 : u.byteLength <= 4194304) &&
						!e.endsWith(`/c.wasm`) &&
						typeof SharedArrayBuffer == `function`
					) {
						let t = null;
						(u &&
							((t = new Uint8Array(new SharedArrayBuffer(u.byteLength))),
							t.set(u)),
							a.set(e, t),
							r.post({ kind: `unitFile`, rel: e, bytes: t }));
					}
					return u;
				} catch {
					return null;
				}
			}
		}
		(t.debugExit &&
			((globalThis.GEX_DEBUG_EXIT = 1), (globalThis.GEX_TRAP_STACK = 1)),
			t.mem64 ? (globalThis.GEX_MEM64 = 1) : delete globalThis.GEX_MEM64,
			t.pageFlavours !== void 0 &&
				(globalThis.GEX_PAGE_FLAVOURS = t.pageFlavours),
			t.wasmDlls && (Rr.wasmDlls = t.wasmDlls),
			t.elfUnits && (Rr.elfUnits = t.elfUnits),
			t.providerSkip && (Rr.providerSkip = t.providerSkip),
			t.providerSources && (Rr.providerSources = t.providerSources),
			t.stateful && (Rr.stateful = t.stateful),
			t.fjitLibs && (Rr.fjitLibs = t.fjitLibs),
			t.identities && (Rr.identities = t.identities),
			t.testBreakStackGuard && (globalThis.GEX_TEST_BREAK_STACK_GUARD = 1),
			t.testUd2Entry && (globalThis.GEX_TEST_UD2_ENTRY = 1),
			t.fillTime && (globalThis.GEX_FILL_TIME = 1),
			t.unitCache && (globalThis.GEX_UNIT_CACHE = 1),
			t.fill && Pe(t.fill),
			t.lazyCache && ye(t.lazyCache),
			t.pageFs && ut(t.pageFs),
			t.restBundle && (globalThis.GEX_REST_BUNDLE = 1));
		let oe =
			f &&
			t.kind === `adopt` &&
			t.child?.exec &&
			!t.memory &&
			!t.recycledMemory &&
			!t.moduleStore
				? await f
				: null;
		(f &&
			!oe &&
			xn(
				`[pool] pid ${t.child?.pid ?? t.pid ?? `?`}: a runtime made ahead was left unused (${t.kind})`,
			),
			(f = null));
		let se =
			oe &&
			oe.shared === !!t.shared &&
			oe.stack === t.kernelStack &&
			oe.mem64 === !!t.mem64;
		(oe &&
			!se &&
			console.error(
				`[gex] pid ${t.child?.pid}: the pooled runtime does not fit its process (shared ${oe.shared}/${!!t.shared}, stack ${oe.stack}/${t.kernelStack}, mem64 ${oe.mem64}/${!!t.mem64}); a new one is made`,
			),
			oe && oe.mem64 && !t.mem64 && delete globalThis.GEX_MEM64);
		let O = se
			? oe.gex
			: new Rr(new ae(), {
					kernel: t.kernel ? { ...t.kernel, stackTop: t.kernelStack } : null,
					memory: t.memory ?? t.recycledMemory ?? null,
					moduleStore: t.moduleStore ?? null,
					shared: !!t.shared,
					modules: o,
					fiber: e.fiber ?? null,
				});
		(O === oe?.gex && O.setEnv(new ae()),
			(i = O),
			O.setDoorWord(t.doorWord),
			t.door && O.setDoor(t.door),
			t.cgen?.mode && O.useCgen(t.cgen.mode),
			(t.providers ?? t.opts?.providers) === 0 && O.noElfProviders());
		for (let [e, n] of t.sharedModules ?? []) O.addSharedModule(e, n);
		for (let [e, n] of t.preModules ?? [])
			(e.startsWith(`cgen:`) || e.startsWith(`cgenfile:`)) &&
				O.addSharedModule(e, n);
		if (
			((globalThis.GEX_SHARE_TRACE || {}.GEX_SHARE_TRACE || t.shareTrace) &&
				console.warn(
					`[share] ${t.kind} start with ${(t.sharedModules ?? []).length} shared modules (${(t.sharedModules ?? []).filter(([e]) => String(e).startsWith(`cgen:`)).length} units, ${(t.sharedModules ?? []).filter(([e]) => String(e).startsWith(`wasm:`)).length} programs)`,
				),
			t.glChannel?.inRealm)
		) {
			let { shownInReply: e } = await d(`gl`);
			O.useGl({
				submit: (t, n, r, i) => {
					if (!globalThis.__gexGlInRealm) return -1;
					let a = globalThis.__gexGlInRealm.submit(t, n, r);
					return i
						? Promise.resolve(a).then((r) =>
								r < 0 ? r : e(new Uint8Array(t.buffer), n),
							)
						: a;
				},
			});
		} else if (t.glChannel) {
			let { GlProxy: e } = await d(`gl`);
			O.useGl(
				new e(t.glChannel, () => {
					t.glChannel.direct || r.post({ kind: `gl` });
				}),
			);
		}
		if ((t.glChannel?.d3d && O.useD3d(!0), t.wlChannel)) {
			let { WlProxy: e, outputSize: n } = await d(`wl`),
				i = new e(
					t.wlChannel,
					() => r.post({ kind: `wl` }),
					() => O.wlToken(),
				);
			O.useWl(i);
			let a = n(t.wlChannel);
			(O.wlOutput(a.w, a.h, a.scale),
				(O.onWlToken = (e) => {
					p = !1;
					let n = i.firstForKernel() ? O.kernelWake()?.memory : void 0,
						a = !!t.wlChannel.pixels;
					(a && !n) ||
						r.post({
							kind: `wl-memory`,
							token: e,
							memory: a ? void 0 : O.memory,
							kernel: n,
						});
				}),
				(i.onToken = O.onWlToken),
				(i.onPixels = (e) => r.post({ kind: `wl-pixels`, ...e })),
				(i.wakeAddr = () => O.kernelWake()));
		} else if (t.wlStub) {
			let e = {}.GEX_WL_DUMP,
				t = {}.GEX_COVERAGE_OUT,
				n = e || t ? await Promise.resolve().then(() => u(N(), 1)) : null,
				r = await d(`wl`),
				i = () => {
					if (!(!n || !t))
						try {
							let e = O.coverage();
							if (!e) return;
							let r = ``;
							for (let t = 0; t < e.length; t++)
								r +=
									`0x` +
									e[t].toString(16) +
									`
`;
							(n.writeFileSync(t, r),
								console.error(`[cov] wrote ${e.length} block PCs to ${t}`));
						} catch (e) {
							console.error(`[cov] dump failed: ${e.message}`);
						}
				},
				a = 0,
				o = ({}.GEX_WL_STUB_OUTPUT ?? ``)
					.split(`,`)
					.filter(Boolean)
					.map((e) => {
						let [, t, n, r] = /^(\d+)x(\d+)(?:@(\d+))?$/.exec(e.trim()) ?? [];
						return {
							size: (((t & 65535) << 16) | (n & 65535)) >>> 0,
							at: +(r ?? 0),
						};
					}),
				s = null,
				c = 0,
				l = () => {
					if (!o.length) return 0;
					s ??= performance.now();
					let e = performance.now() - s,
						t = 0;
					for (let n of o) n.at <= e && (t = n.size);
					return t;
				},
				f = !!{}.GEX_WL_STUB_LOG,
				p = !!{}.GEX_WL_STUB_SUM;
			O.useWl({
				publish(t, o, s) {
					(a++, (a === 1 || a % 30 == 0) && i());
					let c = [],
						l = new Int32Array(t.buffer, o >>> 0, s * r.REC);
					for (let e = 0; e < s; e++) {
						let t = e * r.REC;
						c.push({
							surface: l[t + r.R_SURFACE],
							role: l[t + r.R_ROLE],
							x: l[t + r.R_REL_X],
							y: l[t + r.R_REL_Y],
							w: l[t + r.R_WIDTH],
							h: l[t + r.R_HEIGHT],
							addr: r.recordAddr(l, t),
							stride: l[t + r.R_STRIDE],
						});
					}
					let u = c.filter((e) => e.role === r.ROLE_TOPLEVEL && e.w > 0);
					if (
						(f
							? console.error(
									`[wlstub] publish t=${(performance.timeOrigin + performance.now()).toFixed(1)} surfaces=${c.length} windows=${u.length}`,
								)
							: (a === 1 || a % 60 == 0) &&
								console.error(
									`[wlstub] publish #${a}: ${c.length} surfaces, ${u.length} windows` +
										u.map((e) => ` ${e.w}x${e.h}`).join(``),
								),
						p)
					) {
						let e = new Uint8Array(t.buffer);
						for (let t of u) {
							let n = 0;
							for (let r = 0; r < t.h; r++)
								for (let i = 0; i < t.w; i++) {
									let a = t.addr + r * t.stride + i * 4;
									n =
										(n +
											(e[a] |
												(e[a + 1] << 8) |
												(e[a + 2] << 16) |
												(e[a + 3] << 24))) >>>
										0;
								}
							console.error(
								`[wlstub] window ${t.w}x${t.h} at 0x${t.addr.toString(16)} sum=${n}`,
							);
						}
					}
					if (!n || !e || !u.length) return;
					let d = Math.max(...u.map((e) => e.x + e.w)),
						m = Math.max(...u.map((e) => e.y + e.h)),
						h = Buffer.alloc(d * m * 3),
						g = new Uint8Array(t.buffer);
					for (let e of c)
						if (!(e.role === r.ROLE_CURSOR || e.w <= 0 || e.h <= 0))
							for (let t = 0; t < e.h; t++) {
								let n = e.y + t;
								if (!(n < 0 || n >= m))
									for (let r = 0; r < e.w; r++) {
										let i = e.x + r;
										if (i < 0 || i >= d) continue;
										let a = e.addr + t * e.stride + r * 4,
											o = (n * d + i) * 3;
										((h[o] = g[a + 2]),
											(h[o + 1] = g[a + 1]),
											(h[o + 2] = g[a]));
									}
							}
					(n.writeFileSync(e, `P6\n${d} ${m}\n255\n`),
						n.appendFileSync(e, h),
						a === 1 && console.error(`[wlstub] wrote ${d}x${m} scene to ${e}`));
				},
				pollInput() {
					return 0;
				},
				inputPending() {
					return l() !== c;
				},
				outputSize() {
					return ((c = l()), c);
				},
			});
		}
		if (t.network) {
			let { NodeNetwork: e } = await Promise.resolve().then(() => (Go(), No)),
				n = new e({ pageHosts: t.pageHosts ?? null, tcp: !!t.tcp });
			(S.on && (n.onActivity = () => D.wake()), O.useNetwork(n));
		}
		if (t.wispNet)
			((t.wispNet.onActivity = () => D.wake()),
				O.useNetwork(t.wispNet, { shared: !0 }));
		else if (t.netChannel) {
			let { NetProxy: e } = await d(`net`);
			O.useNetwork(new e(t.netChannel, t.child?.pid ?? t.pid ?? 1), {
				shared: !0,
			});
		} else if (t.wispUrl || (t.pageHosts && !t.network)) {
			let { WispNetwork: e } = await Promise.resolve().then(() => (Ms(), Cs)),
				n = new e(t.wispUrl ?? null, (e) => r.post({ kind: `net`, event: e }), {
					pageHosts: t.pageHosts ?? null,
				});
			try {
				await n.start();
			} catch (e) {
				r.post({ kind: `net`, event: `error ${e?.message ?? e}` });
			}
			O.useNetwork(n);
		}
		s > 1 &&
			t.kind !== `thread` &&
			xn(
				`[pool] pid ${t.child?.pid ?? t.pid ?? `?`}: given-back worker, its process ${s}`,
			);
		try {
			let e,
				n,
				i = !1,
				a = 0;
			if (t.kind === `thread`) {
				let o = (e) => {
					globalThis.GEX_ATTACH_TRACE && console.error(`[thr ${t.tid}] ${e}`);
				};
				(o(
					`adopt start pc=0x${(t.pc ?? 0n).toString(16)} ctx=0x${(t.ctx ?? 0n).toString(16)}`,
				),
					t.spare &&
						(t.spareGo = () =>
							m
								? Promise.resolve(m.thread ?? null)
								: new Promise((e) => {
										h = e;
									})),
					({
						entry: e,
						ctx: n,
						gone: i,
					} = await (t.snap
						? O.snapThread(t.shim, t.guest, t)
						: O.adoptThread(t.shim, t.guest, t))),
					t.snap && (r.post({ kind: `snap-attached` }), O.snapRelease()),
					(a = O.adoptGen ?? O.shim.exports.gex_exec_gen?.() ?? 0),
					o(`adopt done entry=0x${(e ?? 0n).toString(16)}, entering run`));
			} else if (t.kind === `adopt`)
				(nn(`[worker] pid ${t.child?.pid}: adopt arrived`),
					t.child &&
						((t.child.uid = t.uid ?? t.opts?.uid),
						(t.child.gid = t.gid ?? t.opts?.gid)),
					(e = await O.adoptProcess(t.shim, t.guest, t.child, {
						...t,
						closure: t.closure ?? (await re(t.closureCount ?? 0)),
						wantLibrary: ne,
					})),
					t.child?.ctx && (n = Number(t.child.ctx)));
			else {
				if (
					((e = await O.load(
						t.shim,
						t.guest,
						t.elf,
						t.files ?? {},
						t.args ?? [],
						{
							...(t.opts ?? {}),
							closure:
								t.closure ?? t.opts?.closure ?? (await re(t.closureCount ?? 0)),
							link: t.link ?? t.opts?.link,
							dense: t.dense ?? t.opts?.dense,
							fjit: t.fjit ?? t.opts?.fjit,
							fjitMax: t.fjitMax ?? t.opts?.fjitMax,
							fjitOnly: t.fjitOnly ?? t.opts?.fjitOnly,
							liftMax: t.liftMax ?? t.opts?.liftMax,
							inlineDispatch: t.inlineDispatch ?? t.opts?.inlineDispatch,
							xlateReport: t.xlateReport ?? t.opts?.xlateReport,
							discoverSkip: t.discoverSkip ?? t.opts?.discoverSkip,
							t1Fold: t.t1Fold ?? t.opts?.t1Fold,
							providers: t.providers ?? t.opts?.providers,
							xcache: t.xcache ?? t.opts?.xcache,
							wantLibrary: ne,
						},
					)),
					!e)
				)
					throw Error(`the program could not be loaded`);
				let n = O.audioRing?.();
				if (
					(n && r.post({ kind: `audio`, memory: n.memory, at: n.at }), t.files)
				) {
					((t.files = null), (t.elf = null));
					let e = (t.transfer ?? []).filter(
						(e) => e instanceof ArrayBuffer && !e.detached,
					);
					if (e.length && typeof MessageChannel == `function`) {
						let t = new MessageChannel();
						(t.port2.close(), t.port1.postMessage(null, e), t.port1.close());
					}
					for (let t of e) t.detached || t.transfer?.(0);
					((t.transfer = null), r.post({ kind: `files-loaded` }));
				}
			}
			let o = t.opts?.recompileObjects ?? t.recompileObjects;
			o && O.shim.exports.gex_set_recompile_objects?.(o);
			let c = t.heartbeat || t.opts?.heartbeat;
			if (
				(c && O.shim.exports.gex_set_heartbeat?.(BigInt(c)),
				(t.phases || t.opts?.phases) &&
					O.shim.exports.gex_set_phases?.(t.phases || t.opts.phases),
				t.inPlace === 0 && O.shim.exports.gex_set_in_place?.(0),
				t.excTrace && O.shim.exports.gex_set_exc_trace?.(1),
				t.fcacheStats && O.shim.exports.gex_set_fcache_stats?.(1),
				t.winsize &&
					O.shim.exports.gex_set_winsize?.(t.winsize.rows, t.winsize.cols),
				!t.kernelStack)
			) {
				let e = O.kernelStacks?.();
				e && r.post({ kind: `kernelStacks`, ...e });
			}
			((b = (e, t) => {
				O.released || O.shim.exports.gex_set_winsize?.(e, t);
			}),
				(v = () => O.shim.exports.gex_tty_lflag?.() ?? 0));
			let l = O.shim.exports;
			if (
				((t.jit ?? t.opts?.jit) === !1 && l.gex_set_jit(0),
				(t.aot ?? t.opts?.aot) && l.gex_set_aot?.(1),
				t.hot && l.gex_set_hot?.(1),
				t.noIntrinsics && l.gex_set_intrinsics?.(0),
				t.intrinsicMask !== void 0 &&
					l.gex_set_intrinsic_mask?.(t.intrinsicMask),
				t.trace && l.gex_set_trace?.(1),
				(t.wholePage ?? t.opts?.wholePage) && (Rr.wholePage = !0),
				(t.vforkTrace ?? t.opts?.vforkTrace) &&
					(globalThis.GEX_VFORK_TRACE = 1),
				t.traceMisses && l.gex_set_trace_misses?.(1),
				(t.dlChecked ?? t.opts?.dlChecked) && l.gex_set_dl_checked?.(1),
				t.jitDiag && l.gex_set_jit_diag?.(1),
				t.traceBlocks && l.gex_set_trace_blocks?.(1),
				t.watchMem && l.gex_set_watch_mem?.(BigInt(t.watchMem)),
				t.checkSp && l.gex_set_check_sp?.(1),
				t.claimPages !== void 0 && l.gex_set_claim_pages?.(t.claimPages),
				t.copyLoop && l.gex_set_copy_loop?.(1),
				t.coherentLoads && l.gex_set_coherent_loads?.(1),
				t.debugPanic)
			)
				try {
					l.gex_debug_panic?.(t.debugPanic);
				} catch (e) {
					let t = l.gex_panic_reporting?.()
						? `; it panicked again inside the panic report, whose message is lost (the first is above)`
						: ``;
					throw (
						console.error(
							`gex: the shim trapped in gex_debug_panic (${e.message})${t}`,
						),
						e
					);
				}
			(t.spGuard && l.gex_set_sp_guard?.(1),
				t.trapPc && l.gex_set_trap_pc?.(BigInt(t.trapPc)),
				t.pregrow && l.gex_set_pregrow?.(1),
				t.wlTrace && l.gex_set_wl_trace?.(1));
			let u = t.link ?? t.opts?.link;
			(u && l.gex_set_snapshot?.(Number(u)),
				t.debugExit &&
					r.post({
						kind: `loaded`,
						memoryMib: O.memory.buffer.byteLength / (1 << 20),
					}));
			let d = t.kind === `thread` && !t.snapMain;
			globalThis.GEX_REPORT_ABANDONED = !d;
			let f = performance.now(),
				g = i ? 0 : await O.run(e, n),
				_ = !i && !d ? O.execAwayRecord?.() : null;
			if (_) {
				(O.close?.(),
					O.releaseWorker?.(),
					r.post({ kind: `execAway`, child: _ }));
				return;
			}
			let y =
					d && !i && !l.gex_thread_gone?.() && (l.gex_exec_gen?.() ?? 0) !== a,
				C = (d && !y) || !!l.gex_thread_gone?.();
			d &&
				!i &&
				!y &&
				!l.gex_thread_gone?.() &&
				!l.gex_exited?.() &&
				(l.gex_exec_gen?.() ?? 0) === a &&
				O.freeThreadTls?.();
			let w = Math.round(performance.now() - f);
			if (t.exitTrace && g !== 0) {
				try {
					let e = O.kernel,
						n = BigInt.asUintN(64, BigInt(e?.k_last_kill?.() ?? 0));
					console.warn(
						`[gex] pid ${t.pid ?? `?`} ended with ${g}; last signal sent: ${Number(n & 255n)} from pid ${Number(BigInt.asIntN(24, n >> 40n))} to ${Number(BigInt.asIntN(32, (n >> 8n) & 4294967295n))} (#${e?.k_last_kill_seq?.() ?? `?`})`,
					);
				} catch {}
				(l.gex_set_trace?.(1), l.gex_dump_state?.(), l.gex_set_trace?.(0));
			}
			(t.opts?.pins && l.gex_pin_report?.(),
				C || l.gex_fjit_report?.(),
				C || l.gex_process_gone?.(134));
			let T = t.xcache ?? t.opts?.xcache ?? t.child?.opts?.xcache,
				ee = t.xcacheMin ?? t.opts?.xcacheMin ?? t.child?.opts?.xcacheMin;
			(!C &&
				T &&
				(await O.xcacheSave?.(
					T,
					ee ?? 1 << 20,
					t.saveGate,
					t.xcacheDelay,
					t.child?.pid ?? t.pid ?? 1,
				)),
				O.close?.());
			let E =
				d && !y && (i || (l.gex_exec_gen?.() ?? 0) !== a)
					? { kind: `exit`, status: g, guestMillis: w }
					: {
							kind: `exit`,
							status: g,
							threadGone: C && !d ? !0 : void 0,
							carries: y || void 0,
							guestMillis: w,
							exitPc: t.exitTrace ? Number(l.gex_current_pc?.() ?? 0n) : void 0,
							hot: t.hot ? x(O) : void 0,
							fmaCalls: t.fmaCount ? Number(l.gex_fma_calls?.() ?? -1) : void 0,
							extracted: (t.extract ?? []).map((e) => [e, O.readFile(e)]),
							blocks: Number(O.shim.exports.gex_jit_blocks?.() ?? 0),
							liftInClosure: Number(
								O.shim.exports.gex_lift_in_closure?.() ?? 0,
							),
							liftWhy: O.shim.exports.gex_lift_why
								? [0, 1, 2, 3].map((e) =>
										Number(O.shim.exports.gex_lift_why(e)),
									)
								: void 0,
							liftSlots: O.liftSlots?.(),
							millis: Number(O.shim.exports.gex_jit_millis?.() ?? 0),
							dl: (() => {
								let e = O.shim.exports,
									t = e.gex_dl_text?.(0, 0) >>> 0;
								if (!t) return;
								let n = e.gex_alloc(t) >>> 0;
								e.gex_dl_text(n, t);
								let r = new TextDecoder().decode(
									new Uint8Array(O.memory.buffer, n, t).slice(),
								);
								return (e.gex_free?.(n, t), r);
							})(),
							xlate: O.shim.exports.gex_xlate_stat
								? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((e) =>
										Number(O.shim.exports.gex_xlate_stat(e)),
									)
								: void 0,
							installMs: O.installMillis,
							compileMs: O.compileMillis,
							unitHits: O.unitHits,
							compiles: O.compileCount,
							instantiateMs: O.instantiateMillis,
							growMs: O.growMillis,
							byObject: O.blocksByObject,
							cmdline: O.cmdline,
							waits: O.waits,
							traps: O.traps,
							loader: O.loader,
							shimCompileMs: O.shimCompileMillis,
							shimInstMs: O.shimInstantiateMillis,
							guestInstMs: O.guestInstantiateMillis,
							installs: O.installCount,
							fill: O.fillStats,
							reuse: O.shim.exports.gex_reuse_stat
								? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) =>
										Number(O.shim.exports.gex_reuse_stat(e)),
									)
								: null,
							heapKib: Number(O.shim.exports.gex_heap_used_kib?.() ?? -1),
							memoryMib: Math.round(O.memory.buffer.byteLength / (1 << 20)),
							slotsLeftK: Number(O.shim.exports.gex_slots_left_k?.() ?? -1),
							forkCopied: O.forkCopiedBytes,
							forkSkipped: O.forkSkippedBytes,
							forkZeros: O.forkZeroBytes,
							vforkMs: t.child?.vforkMs,
							arena: O.shim.exports.gex_arena_spent_mib
								? [0, 1, 2].map((e) =>
										Number(O.shim.exports.gex_arena_spent_mib(e)),
									)
								: null,
						};
			(O.releaseWorker?.(),
				p &&
					!C &&
					!t.child?.exec &&
					(E.recycle = O.recycleMemory?.() ?? void 0),
				(E.workerRuns = s),
				(E.giveBack =
					!S.on &&
					!C &&
					!y &&
					!i &&
					p &&
					(t.kind === `adopt` || t.kind === `run`) &&
					g >= 0 &&
					g < 128 &&
					!t.network &&
					!t.wispUrl &&
					!t.pageHosts),
				r.post(E));
		} catch (e) {
			O?.keepPromise?.();
			let n = !!O?.noSlot,
				i = ``;
			try {
				let e = n ? null : O.shim?.exports;
				if (e?.gex_current_pc && e.gex_has_host?.()) {
					let t = e.gex_current_pc();
					if (
						((i = ` at guest pc=0x${(t < 0n ? t + (1n << 64n) : t).toString(16)}`),
						e.gex_object_at)
					) {
						let n = e.gex_alloc(160) >>> 0,
							r = e.gex_object_at(t, n, 160) >>> 0;
						r && (i += ` in ${z(new Uint8Array(O.memory.buffer, n, r))}`);
					}
				}
			} catch {}
			try {
				let e = O.kernel;
				if (e?.k_panic_len?.()) {
					let n = e.k_panic_len() >>> 0,
						r = e.k_panic_ptr() >>> 0;
					i += ` -- the global kernel panicked: ${z(new Uint8Array(t.kernel.memory.buffer, r, n))}`;
				}
			} catch {}
			console.error(
				`gex: worker threw: ${e?.message ?? e}${i}\n${e?.stack ?? ``}`,
			);
			try {
				n ||
					(O?.shim?.exports?.gex_dump_state?.(),
					O?.shim?.exports?.gex_abandon?.(-9));
			} catch {}
			(S.on && O?.close?.(),
				r.post({
					kind: `threw`,
					message: (e?.message ?? String(e)) + i,
					stack: e?.stack ?? ``,
				}),
				O?.releaseWorker?.());
		}
	}
	let ae = await (async () => {
		if (typeof self < `u`) return null;
		try {
			let { workerData: e } = await Promise.resolve().then(() => u(N(), 1));
			return e?.gexStart ?? null;
		} catch {
			return null;
		}
	})();
	if ((r.post({ kind: `ready` }), typeof self < `u`))
		for (let e of Object.keys(c)) d(e).catch(() => {});
	ae && !t && ie(ae);
}
var zs,
	Bs,
	Vs,
	Hs,
	Us = o(() => {
		if (
			(ot(),
			ct(),
			De(),
			ht(),
			_e(),
			St(),
			zr(),
			ae(),
			Vt(),
			(zs = [`modules`, `image`, `vmaBlob`, `pages`, `shared`]),
			(Bs = () =>
				!S.on &&
				typeof MessageChannel == `function` &&
				typeof WorkerGlobalScope < `u`),
			typeof process < `u` &&
				{}.GEX_WATCH_DIR &&
				(Rr.watchDir = Number({}.GEX_WATCH_DIR)),
			typeof process < `u` && ({}.GEX_TRACE_BLOCKS || {}.GEX_SYNC_CONSOLE))
		) {
			let e = process.getBuiltinModule(`node:fs`),
				t = (...t) => {
					try {
						e.writeSync(
							2,
							t.map((e) => (typeof e == `string` ? e : String(e))).join(` `) +
								`
`,
						);
					} catch {}
				};
			((console.error = t), (console.debug = t));
		}
		if (
			((Vs = new Set()),
			(Hs = new Set(Object.getOwnPropertyNames(globalThis))),
			!S.on)
		)
			for (let [e, t, n] of [
				[`setTimeout`, `clearTimeout`, !0],
				[`setInterval`, `clearInterval`, !1],
			]) {
				let r = globalThis[e],
					i = globalThis[t];
				typeof r == `function` &&
					typeof i == `function` &&
					((globalThis[e] = function (e, ...t) {
						let i,
							a =
								n && typeof e == `function`
									? function (...t) {
											return (Vs.delete(i), e.apply(this, t));
										}
									: e;
						return ((i = r.call(globalThis, a, ...t)), Vs.add(i), i);
					}),
					(globalThis[t] = function (e) {
						return (Vs.delete(e), i.call(globalThis, e));
					}));
			}
		S.on
			? x(Rs)
			: Ps()
					.then(Rs)
					.catch((e) =>
						setTimeout(() => {
							throw e;
						}),
					);
	});
function Ws(e) {
	if (!L(`debug`)) return;
	let t = typeof process < `u` ? process.stderr : null;
	t?.write ? t.write(`${e}\n`) : console.debug(e);
}
function Gs(e) {
	if (Lt()) return;
	let t = typeof process < `u` ? process.getBuiltinModule?.(`fs`) : null;
	if (t?.writeSync)
		try {
			t.writeSync(2, `${e}\n`);
			return;
		} catch {}
	console.info(e);
}
function Ks(e) {
	ac && globalThis.__gexMemories?.delete(Number(String(e).split(`:`)[0]));
}
function qs(e) {
	if (!e || (e.kind !== `module` && e.kind !== `unit`) || !e.path) return;
	let t = String(e.path).replace(/^wasm(dll|prog):/, ``);
	oc.has(t) ||
		(oc.add(t),
		Rt() &&
			Gs(
				`[gex] loaded ${t}${e.kind === `unit` ? (e.hit ? ` (with its unit)` : ` (no unit)`) : ``}`,
			));
}
function Js() {
	sc ||
		typeof BroadcastChannel != `function` ||
		((sc = new BroadcastChannel(`gex-fetch`)),
		sc.unref?.(),
		(sc.onmessage = (e) => qs(e.data?.status)));
}
function Ys(e) {
	(qs(e?.status), Js());
	try {
		sc?.postMessage(e);
	} catch {}
}
function Xs(e) {
	try {
		globalThis.GEX_ON_CRASH?.(e);
	} catch {}
}
function Zs(e, t) {
	let n = e?.gexName;
	if (!n) return;
	let r = (globalThis.__gexWorkers ??= new Map()),
		i = r.get(n);
	i ? i.push(String(t)) : r.set(n, [String(t)]);
}
function Qs(e) {
	if (e?.extent !== void 0) return e.extent;
	let t = 0;
	for (let n of e?.image ?? [])
		t = Math.max(t, n.end ?? 0, n.at + (n.len ?? n.bytes?.byteLength ?? 0));
	return t;
}
function $s(e) {
	return e.length;
}
function ec(e, t = null) {
	let n = 65536,
		r = e.byteLength,
		i = new Int32Array(e, 0, r >>> 2),
		a = [];
	for (let e = 0; e < r; e += n) {
		if (t?.has(e)) continue;
		let r = !0;
		for (let t = e >>> 2, a = (e + n) >>> 2; t < a; t++)
			if (i[t] !== 0) {
				r = !1;
				break;
			}
		if (r) continue;
		let o = a.at(-1);
		o && o[0] + o[1] === e ? (o[1] += n) : a.push([e, n]);
	}
	return {
		length: r,
		runs: a.map(([t, n]) => [t, new Uint8Array(e, t, n).slice()]),
	};
}
function tc() {
	return String(
		BigInt(Math.round(performance.timeOrigin * 1e3)) * 1000n +
			BigInt(Math.round(performance.now() * 1e6)),
	);
}
function nc(e, t, n = null) {
	let r = new Uint8Array(e.buffer);
	if (!t.runs) r.set(t);
	else for (let [e, n] of t.runs) r.set(n, e);
	for (let [e, i, a, o] of t.refs ?? []) {
		let [s, c] = t.sources[a],
			l = n?.read(s, c, o, i);
		if (!l || l.length !== i)
			throw Error(
				`restore: ${c} has no ${i} bytes at ${o} (the snapshot's source)`,
			);
		r.set(l, e);
	}
}
function rc(e, t) {
	if (!t) return [];
	let n = new Int32Array(e),
		r = t >>> 2;
	if (Atomics.load(n, r + 1) !== 1) return [];
	let i = n[r + 2] >>> 0,
		a = n[r + 3] >>> 0;
	return new TextDecoder()
		.decode(new Uint8Array(e, i, a).slice())
		.split(
			`
`,
		)
		.filter(Boolean)
		.map((e) => {
			let [t, n, r, i, ...a] = e.split(` `);
			return [Number(t), Number(n), Number(r), Number(i), a.join(` `)];
		});
}
function ic(e, t, n) {
	let r = 65536,
		i = new Set(),
		a = [],
		o = new Map(),
		s = [],
		c = new Set();
	if (!n) return { skip: i, refs: [], sources: a };
	for (let [l, u, d, f, p] of t) {
		if (c.has(u)) continue;
		let t = Math.ceil(u / r) * r,
			m = Math.floor((u + d) / r) * r;
		if (t >= m) continue;
		let h = null;
		try {
			h = n.read(l, p, f + (t - u), m - t);
		} catch {
			h = null;
		}
		if (!h || h.length !== m - t) continue;
		c.add(u);
		let g = o.get(`${l} ${p}`);
		for (let n = t; n < m; n += r)
			i.has(n) ||
				!Nc(new Uint8Array(e, n, r), h.subarray(n - t, n - t + r)) ||
				(g === void 0 &&
					((g = a.length), a.push([l, p]), o.set(`${l} ${p}`, g)),
				i.add(n),
				s.push([n, g, f + (n - u)]));
	}
	s.sort((e, t) => e[0] - t[0]);
	let l = [];
	for (let [e, t, n] of s) {
		let i = l.at(-1);
		i && i[0] + i[1] === e && i[2] === t && i[3] + i[1] === n
			? (i[1] += r)
			: l.push([e, r, t, n]);
	}
	return { skip: i, refs: l, sources: a };
}
var ac,
	oc,
	sc,
	cc,
	lc,
	uc,
	dc,
	fc,
	pc,
	mc,
	hc,
	gc,
	_c,
	vc,
	yc,
	bc,
	xc,
	Sc,
	Cc,
	wc,
	Tc,
	Ec,
	Dc,
	Oc,
	kc,
	Ac,
	jc,
	Mc,
	Nc,
	Pc,
	Fc = o(() => {
		(ae(),
			ct(),
			ot(),
			Vt(),
			Pt(),
			(ac = !!(
				globalThis.GEX_MEMORIES ||
				{}.GEX_MEMORIES ||
				(typeof location < `u` &&
					new URLSearchParams(location.search).get(`memories`) === `1`)
			)),
			(oc = new Set()),
			(sc = null),
			(cc = Symbol(`gex.early`)),
			(lc = Symbol(`gex.pooled`)),
			(uc = Symbol(`gex.stackKey`)),
			(dc = Symbol(`gex.ready`)),
			(fc = Symbol(`gex.listening`)),
			(pc = Symbol(`gex.reuses`)),
			(mc = 256),
			(hc = 2),
			(gc = 6e4),
			(_c = 4),
			(vc = 8),
			(yc = 5e3),
			(bc = !!{}.GEX_TEST_FORK_RECORDS),
			(xc = 768 << 20),
			(Sc = 15e3),
			(Cc = 1024),
			(wc = 1024 << 20),
			(Tc = 4096),
			(Ec = 16384),
			(Dc = 256 << 20),
			(Oc = 256 << 20),
			(kc = 512),
			(Ac = (e) => Number(String(e).replace(/^u:/, ``).split(`:`)[0]) || 0),
			(jc = (e) => Number(String(e).split(`:`)[1]) || 0),
			(Mc = `a restored session takes no snapshot: a new one comes from a fresh boot that records`),
			(Nc = globalThis.Buffer
				? (e, t) =>
						globalThis.Buffer.from(e.buffer, e.byteOffset, e.length).equals(
							globalThis.Buffer.from(t.buffer, t.byteOffset, t.length),
						)
				: (e, t) => {
						if (e.length !== t.length) return !1;
						let n = e.length >>> 2;
						if ((e.byteOffset | t.byteOffset) & 3) {
							for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
							return !0;
						}
						let r = new Int32Array(e.buffer, e.byteOffset, n),
							i = new Int32Array(t.buffer, t.byteOffset, n);
						for (let e = 0; e < n; e++) if (r[e] !== i[e]) return !1;
						for (let r = n << 2; r < e.length; r++)
							if (e[r] !== t[r]) return !1;
						return !0;
					}),
			(Pc = class {
				#e;
				#t;
				#n;
				#r;
				#i;
				#a;
				#o = null;
				#s = null;
				#c = new Map();
				#l = new WeakMap();
				#u(e) {
					if (S.on || typeof SharedArrayBuffer > `u`) return;
					let t = new Int32Array(new SharedArrayBuffer(4));
					return (this.#l.set(e, t), t.buffer);
				}
				#d;
				#f;
				#p;
				#m;
				#h;
				#g = new Map();
				#_ = null;
				#v =
					typeof SharedArrayBuffer == `function`
						? new Int32Array(new SharedArrayBuffer(4))
						: null;
				#y = new Map();
				#b = null;
				#x = 0;
				#S = new Map();
				#C = new Map();
				#w = new Map();
				#T = 0;
				#E = new Map();
				#D = new Map();
				#O = null;
				#k = new Map();
				#A = null;
				#j() {
					if (!this.#k.size || typeof SharedArrayBuffer != `function`) return;
					if (this.#A?.n === this.#k.size) return this.#A.pack;
					let e = 0;
					for (let t of this.#k.values()) e += t?.byteLength ?? 0;
					let t = new SharedArrayBuffer(Math.max(1, e)),
						n = new Uint8Array(t),
						r = [],
						i = 0;
					for (let [e, t] of this.#k) {
						if (!t) {
							r.push([e, 0, -1]);
							continue;
						}
						(n.set(t, i), r.push([e, i, t.byteLength]), (i += t.byteLength));
					}
					return (
						(this.#A = { n: this.#k.size, pack: { buf: t, index: r } }),
						this.#A.pack
					);
				}
				#M() {
					this.#N++;
					let e = performance.now();
					if (e < this.#P) return;
					this.#P = e + 6e4;
					let t = 0,
						n = 0;
					for (let e of this.#S.values()) ((t += e.size), (n += e.bytes ?? 0));
					console.warn(
						`[host] relay holds ${t} process modules (${(n / 1048576).toFixed(0)} MiB), ${this.#C.size} programs, ${this.#w.size} units (${(this.#T / 1048576).toFixed(0)} MiB); ${this.#N} handed to it so far`,
					);
				}
				#N = 0;
				#P = 0;
				#F(e, t, n = null) {
					let r = t
							? [...(this.#S.get(String(e).split(`:`)[0])?.entries() ?? [])]
							: [],
						i = [
							...this.#C.entries(),
							...this.#w.entries(),
							...this.#E.entries(),
						],
						a = n?.[lc];
					return [...r, ...(a ? i.filter(([e]) => !a.has(e)) : i)];
				}
				#I(e) {
					let t = [
						...this.#C.entries(),
						...this.#w.entries(),
						...this.#E.entries(),
					];
					((e[lc] = new Set(t.map(([e]) => e))),
						t.length && e.postMessage({ kind: `pooledModules`, entries: t }));
				}
				#L(e) {
					if (!this.#r || !this.#Z || !this.#i?.shared || e[uc]) return;
					let t = `pool:${++this.#R}`,
						n;
					try {
						n = this.#Oe(t);
					} catch {
						return;
					}
					((e[uc] = t),
						this.#ue().then((t) =>
							e.postMessage({
								kind: `preattach`,
								shim: t,
								guest: this.#n,
								kernel: this.#r,
								kernelStack: n,
								shared: !0,
								mem64: !!this.#i?.mem64,
								pageFlavours: this.#fe(),
							}),
						));
				}
				#R = 0;
				#z() {
					if (this.#te.some((e) => e[uc] !== void 0)) return;
					let e = this.#te.find((e) => e[dc]);
					e && this.#L(e);
				}
				#B(e, t) {
					let n = e[uc];
					if (n === void 0) return this.#Oe(t);
					delete e[uc];
					let r = this.#le.get(n);
					return (
						this.#le.delete(n),
						this.#le.set(t, r),
						this.#Z.area + r * this.#Z.size
					);
				}
				#V(e, t, n, r) {
					if (!this.#E.has(e))
						for (
							this.#E.set(e, t), this.#H(e, t, r, n), this.#U(e, t);
							this.#E.size > Tc;
						)
							this.#E.delete(this.#E.keys().next().value);
				}
				#H(e, t, n, r = null) {
					for (let [i, a] of this.#g)
						a !== r &&
							String(i).split(`:`)[0] === n &&
							a.postMessage({ kind: `sharedModule`, key: e, mod: t });
				}
				#U(e, t) {
					for (let n of this.#te)
						!n[lc] ||
							n[lc].has(e) ||
							(n[lc].add(e),
							n.postMessage({ kind: `pooledModules`, entries: [[e, t]] }));
				}
				#W = new Map();
				#G = new Map();
				#K = 0;
				#q = [];
				#J = 0;
				#Y = new Map();
				#X = new Map();
				#Z = null;
				#Q = 0;
				#$ = [];
				#ee = null;
				#te = [];
				#ne = 3;
				#re = [];
				#ie = null;
				#ae = new Map();
				#oe(e) {
					let t = this.#ae.get(e);
					t &&
						(this.#ae.delete(e),
						setTimeout(() => {
							(globalThis.gc?.(),
								console.error(
									`[test] pid ${e}: fork record ${t.deref() ? `kept` : `released`} while it runs`,
								));
						}, 500));
				}
				#se = 0;
				#ce = 0;
				#le = new Map();
				constructor({
					makeWorker: e,
					shim: t,
					guest: n,
					kernel: r = null,
					extra: i = {},
					onOutput: a = () => {},
					onFork: o = () => {},
					onExit: s = () => {},
					readStdin: c = null,
					onMessage: l = () => {},
					other: u = null,
					unitModule: d = null,
				}) {
					((this.#a = u),
						(this.#O = d),
						(this.#e = e),
						(this.#t = t),
						(this.#n = n),
						(this.#r = r),
						(this.#ve = r ? Et() : void 0),
						(this.#d = a),
						(this.#f = o),
						(this.#p = s),
						(this.#m = c),
						(this.#i = i),
						(this.#h = l));
				}
				#ue() {
					return this.#t instanceof WebAssembly.Module
						? Promise.resolve(this.#t)
						: ((this.#ee ??= WebAssembly.compile(this.#t).then(
								(e) => (this.#t = e),
							)),
							this.#ee);
				}
				#de(e) {
					return (
						this.#c.get(Number(String(e).split(`:`)[0])) ?? !!this.#i?.mem64
					);
				}
				#fe() {
					return !!this.#i?.mem64 | (this.#a && this.#r ? 2 : 0);
				}
				#pe(e) {
					return this.#de(e) !== !!this.#i?.mem64;
				}
				async #me(e) {
					let t = this.#de(e);
					if (!this.#pe(e))
						return {
							shim: await this.#ue(),
							guest: this.#n,
							kernel: this.#r ?? void 0,
							mem64: t,
						};
					let n =
						typeof this.#a == `function`
							? await (this.#s ??= this.#a())
							: this.#a;
					if (!n)
						throw Error(
							`process ${e} needs a ${t ? `64` : `32`}-bit memory, which this page does not run`,
						);
					return (
						(this.#o ??=
							n.shim instanceof WebAssembly.Module
								? Promise.resolve(n.shim)
								: WebAssembly.compile(n.shim)),
						{
							shim: await this.#o,
							guest: n.guest,
							kernel: this.#r ? { ...this.#r, module: n.kernel } : void 0,
							mem64: t,
						}
					);
				}
				get forked() {
					return this.#x;
				}
				get threads() {
					return this.#K;
				}
				get pids() {
					return [...this.#g.keys()];
				}
				useKernelStacks(e) {
					this.#Z || ((this.#Z = e), this.#z());
				}
				spawnExec({
					pid: e,
					exec: t,
					fds: n,
					cwd: r = `/`,
					wasmImage: i = null,
					opts: a = {},
				}) {
					this.#c.delete(e);
					let o = {
						pid: e,
						ctx: 4096n,
						pc: 0n,
						sp: 0n,
						tls: 0n,
						compat: 0,
						wasm32: 0n,
						brk: 0n,
						windowsSpace: 0,
						image: [],
						vmaBlob: null,
						slots: 0,
						pages: null,
						shared: null,
						modules: [],
						opts: a,
						exec: t,
						wasmImage: i,
						fds: n,
						cwd: r,
						state: new Uint8Array(),
						exe: null,
					};
					return this.#be(e, { kind: `adopt`, child: o });
				}
				async start({
					elf: e,
					files: t = {},
					args: n = [],
					opts: r = {},
					transfer: i = [],
				}) {
					Js();
					let a = [r.argv0, ...n]
						.filter((e) => typeof e == `string` && e)
						.join(` `);
					Rt() &&
						Gs(
							`[gex] pid 1: start ${a.length > 200 ? `${a.slice(0, 200)}...` : a || `(program)`}`,
						);
					let o = await this.#be(1, {
						kind: `run`,
						elf: e,
						files: t,
						args: n,
						opts: r,
						transfer: i,
					});
					return (await this.stop(), o);
				}
				pushStdin(e) {
					this.#b?.postMessage({ kind: `stdin`, bytes: e });
				}
				endStdin() {
					this.#b?.postMessage({ kind: `eof` });
				}
				resize(e, t) {
					for (let n of this.#g.values())
						n.postMessage({ kind: `winsize`, rows: e, cols: t });
				}
				async snapshot({
					timeout: e = 1e4,
					resume: t = !0,
					sources: n = null,
				} = {}) {
					if (this.#ge) return { refused: Mc, stopMs: 0 };
					let r = this.#Z;
					if (!this.#r?.memory || !r?.snapWord)
						throw Error(`snapshot: no global kernel with a snapshot word`);
					if (this.#y.size)
						return {
							refused: `still starting: ${[...this.#y.keys()].join(` `)}`,
							stopMs: 0,
						};
					let i = [...this.#g.keys()].map(String),
						a = new Map(),
						o = new Int32Array(this.#r.memory.buffer),
						s = () => {
							let e = r.wsAddr >>> 2;
							for (let t = 0; t < r.wsCount; t++)
								(Atomics.add(o, e + t, 1), Atomics.notify(o, e + t));
						},
						c = performance.now(),
						l,
						u = new Promise((t) => {
							((this.#he = {
								parked: a,
								check: () => {
									i.every((e) => a.has(e)) && t(!0);
								},
							}),
								(l = setTimeout(() => t(!1), e)));
						});
					(Atomics.store(o, r.snapWord >>> 2, 1), s(), this.#he.check());
					let d = await u,
						f = tc();
					(clearTimeout(l), (this.#he = null));
					let p = performance.now() - c,
						m = () => {
							if (r.extents)
								for (let e = 0; e < 4; e++)
									Atomics.store(o, (r.extents >>> 2) + e, 0);
							(Atomics.store(o, r.snapWord >>> 2, 0),
								Atomics.notify(o, r.snapWord >>> 2),
								s());
						};
					if (!d)
						return (
							m(),
							{
								refused: `not stopped: ${i.filter((e) => !a.has(e)).join(` `)}`,
								stopMs: p,
							}
						);
					let h = this.#r.memory.buffer,
						g = ic(h, rc(h, r.extents), n),
						_ = ec(h, g.skip);
					((_.refs = g.refs), (_.sources = g.sources));
					for (let [e, t] of _.runs) {
						let n = new DataView(t.buffer);
						if (
							(r.snapWord >= e &&
								r.snapWord < e + t.length &&
								n.setInt32(r.snapWord - e, 0, !0),
							r.extents)
						)
							for (let i = 0; i < 16; i += 4)
								r.extents + i >= e &&
									r.extents + i < e + t.length &&
									n.setInt32(r.extents + i - e, 0, !0);
					}
					let v = new Map(),
						y = new Map(),
						b = {},
						x = [];
					for (let e of i) {
						let t = a.get(e),
							n = Number(e.split(`:`)[0]);
						if (
							!v.has(n) &&
							(v.set(n, ec(t.memory.buffer)),
							(b[n] = t.maxPages),
							t.moduleStore)
						) {
							let e = Number(
								Atomics.load(new BigInt64Array(t.moduleStore, 0, 1), 0),
							);
							y.set(n, new Uint8Array(t.moduleStore, 0, e).slice());
						}
						x.push({
							key: e,
							pid: n,
							tid: t.tid,
							pc: t.entry,
							sp: t.start,
							main: !e.includes(`:`),
						});
					}
					let S = {
							version: 1,
							stacks: { ...r },
							threads: x,
							maxPages: b,
							flavourOf: [...this.#c],
							at: f,
							bundle: _.refs.length ? (n.id ?? null) : null,
							door: this.#_
								? { ...this.#_, memory: void 0, module: void 0 }
								: null,
						},
						C = performance.now() - c - p;
					return (
						t ? m() : this.stop(),
						{ kernel: _, memories: v, stores: y, meta: S, stopMs: p, copyMs: C }
					);
				}
				#he = null;
				get snapshotAllowed() {
					return !this.#ge;
				}
				#ge = !1;
				async restore(
					{ kernel: e, memories: t, stores: n = new Map(), meta: r },
					{ onRunning: i, sources: a = null } = {},
				) {
					let o = performance.now();
					if (((this.#ge = !0), Js(), !this.#r?.memory))
						throw Error(`restore: no global kernel`);
					if (e.refs?.length && (!a || (a.id ?? null) !== r.bundle))
						throw Error(
							`restore: the snapshot's pages are by reference to bundle ${r.bundle}, and this session's is ${a?.id ?? `none`}`,
						);
					let s = this.#r.memory,
						c = Math.ceil(($s(e) - s.buffer.byteLength) / 65536);
					(c > 0 && s.grow(c), nc(s, e, a));
					let l = new Int32Array(s.buffer),
						u = r.stacks.snapWord >>> 2;
					(Atomics.store(l, u, 1), (this.#Z = r.stacks));
					for (let [e, t] of r.flavourOf ?? []) this.#c.set(e, t);
					Gs(
						`[gex] restore: ${r.threads.length} threads of ${t.size} processes`,
					);
					let d = new Map();
					for (let e of r.threads)
						(d.has(e.pid) || d.set(e.pid, []), d.get(e.pid).push(e));
					let f = null,
						p = [],
						m = [...d].sort(
							([e], [t]) => (t === r.door?.pid) - (e === r.door?.pid),
						);
					for (let [e, i] of m) {
						let a = t.get(e),
							o = new WebAssembly.Memory({
								initial: $s(a) / 65536,
								maximum: r.maxPages[e],
								shared: !0,
							});
						nc(o, a);
						let s,
							c = n.get(e);
						(c &&
							((s = new SharedArrayBuffer(Math.max(1 << 20, c.length), {
								maxByteLength: 4294967296,
							})),
							new Uint8Array(s).set(c)),
							ac && (globalThis.__gexMemories ??= new Map()).set(e, o));
						let l = i.find((e) => e.main);
						if (!l) throw Error(`restore: pid ${e} has no first thread`);
						let u = (t, n, r) => {
								let i,
									a = new Promise((e) => {
										i = e;
									});
								return (
									this.#_e.set(t.key, i),
									{
										attached: a,
										done: this.#be(t.main ? e : t.key, {
											kind: `thread`,
											tid: t.tid,
											memory: o,
											moduleStore: s,
											ctx: 0n,
											pc: BigInt(t.pc),
											snap: { pc: t.pc, sp: t.sp, door: r },
											snapMain: t.main || void 0,
											snapReset: n || void 0,
										}),
									}
								);
							},
							d = u(l, !0, e === r.door?.pid ? r.door.area : void 0);
						(e === 1
							? (f = d.done)
							: d.done.catch((t) =>
									console.error(`[gex] restore: pid ${e}: ${t?.message ?? t}`),
								),
							await d.attached);
						for (let e of i) e !== l && p.push(u(e, !1).attached);
					}
					if (!f) throw Error(`restore: no pid 1`);
					Promise.all(p).then(() => {
						let e = r.at ? BigInt(tc()) - BigInt(r.at) : 0n;
						(e > 0n &&
							r.stacks.monoHeld &&
							Atomics.add(
								new BigUint64Array(s.buffer),
								r.stacks.monoHeld >>> 3,
								e,
							),
							Atomics.store(l, u, 0),
							Atomics.notify(l, u),
							i?.(performance.now() - o));
					});
					let h = await f;
					return (this.stop(), h);
				}
				#_e = new Map();
				stop() {
					let e = this.#ve;
					return (
						e && Atomics.or(e, 0, Mt),
						kt(e)
							? (async () => {
									let t = performance.now();
									for (; kt(e) && performance.now() - t < gc; ) await Nt(5);
									(kt(e) &&
										console.log(
											`[gex] xcache: a save still under way after ${gc / 1e3} s; stopping anyway`,
										),
										this.#ye());
								})()
							: (this.#ye(), Promise.resolve())
					);
				}
				#ve;
				#ye() {
					(clearTimeout(this.#ie), (this.#re.length = 0));
					for (let e of this.#g.values()) e.terminate();
					this.#g.clear();
					for (let e of this.#te) e.terminate();
					((this.#te = []), this.#ve && this.#ve.fill(0));
				}
				#be(e, t) {
					return (
						this.#W.set(e, performance.now()),
						new Promise((n, r) => {
							let i = this.#pe(e)
								? this.#e()
								: this.#xe(t.kind === `adopt` && !!t.child?.exec);
							(this.#g.set(e, i), Zs(i, e), e === 1 && (this.#b = i));
							let a = (t) => this.#ze(e, i, t.data, n, r),
								o = (t) => this.#ze(e, i, t, n, r);
							(i.addEventListener?.(`message`, a), i.on?.(`message`, o));
							let s = (t) => {
								(this.#g.delete(e),
									r(t instanceof Error ? t : Error(t?.message ?? String(t))));
							};
							(i.addEventListener?.(`error`, s),
								i.on?.(`error`, s),
								(i[fc] = { onEvent: a, onMsg: o, fail: s }),
								this.#y.set(e, { ...t, pid: e }));
							let c = t.kind;
							if (((t = null), this.#i?.debugExit)) {
								let e = 0;
								for (let t of this.#y.values())
									for (let n of t.image ?? []) e += n.bytes?.byteLength ?? 0;
								console.error(
									`[pending] ${this.#y.size} records holding ${e} bytes`,
								);
							}
							Ws(`[host] pid ${e}: worker taken, ${c} held for ready`);
							let l = i[cc];
							if (l) {
								(delete i[cc],
									i.removeEventListener?.(`message`, l.buf),
									i.off?.(`message`, l.buf));
								for (let t of l.early) this.#ze(e, i, t, n, r);
							}
						})
					);
				}
				#xe(e = !1) {
					let t = this.#te.findIndex((t) => (t[uc] !== void 0) === e);
					t < 0 && this.#te.length && (t = 0);
					let n = t < 0 ? null : this.#te.splice(t, 1)[0];
					n && this.#ce++;
					let r = n ?? this.#e();
					return (this.#Se(), this.#z(), r);
				}
				#Se() {
					if (!(this.#te.length >= this.#ne))
						try {
							let e = this.#e();
							(this.#Ce(e, !1), this.#se++);
						} catch {}
				}
				#Ce(e, t) {
					let n = [],
						r = !t;
					e[dc] = !1;
					let i = (i) => {
						let a = i && i.data !== void 0 ? i.data : i;
						(a?.kind === `ready` && (r = !0),
							r &&
								(n.push(a),
								a?.kind === `ready` &&
									((e[dc] = !0),
									e[lc] || this.#I(e),
									this.#te.includes(e) && this.#z()),
								a?.kind === `ready` &&
									!t &&
									this.#te.includes(e) &&
									this.#Se()));
					};
					(e.addEventListener?.(`message`, i),
						e.on?.(`message`, i),
						(e[cc] = { early: n, buf: i }),
						t ? this.#te.unshift(e) : this.#te.push(e));
				}
				#we(e) {
					let t = (e[pc] ?? 0) + 1,
						n = e[fc];
					return !n || t > mc || this.#te.length >= this.#ne + hc
						? !1
						: (delete e[fc],
							e.removeEventListener?.(`message`, n.onEvent),
							e.off?.(`message`, n.onMsg),
							e.removeEventListener?.(`error`, n.fail),
							e.off?.(`error`, n.fail),
							(e[pc] = t),
							this.#Te++,
							this.#Ce(e, !0),
							e.postMessage({ kind: `reset` }),
							!0);
				}
				#Te = 0;
				get warmStats() {
					return {
						made: this.#se,
						used: this.#ce,
						idle: this.#te.length,
						reused: this.#Te,
					};
				}
				#Ee(e, t) {
					let n = (t ?? []).map((e) => (e instanceof Uint8Array ? e : e.meta)),
						r = (t ?? []).map((e) =>
							e instanceof Uint8Array ? `` : (e.program ?? ``),
						);
					try {
						e.postMessage({ kind: `closureMeta`, metas: n, programs: r });
					} catch (e) {
						this.#d(
							2,
							`gex: the closure metadata did not reach a worker: ${e.message}\n`,
							0,
						);
					}
				}
				async #De(e, t) {
					let n = (this.#i?.closure ?? [])[t];
					if (n)
						try {
							(!(n instanceof Uint8Array) &&
								!n.mod &&
								n.url &&
								((n.fetching ??= (async () => {
									let e = performance.now(),
										r = await fetch(n.url);
									if (!r.ok)
										throw Error(`${n.url}: ${r.status} ${r.statusText}`);
									let i = new Uint8Array(await r.arrayBuffer()),
										a = await WebAssembly.compile(i);
									return (
										Ws(
											`[gex] closure library ${t}: ${(i.length / 1048576).toFixed(1)} MiB fetched and compiled in ${Math.round(performance.now() - e)}ms`,
										),
										a
									);
								})()),
								(n.mod = await n.fetching)),
								e.postMessage({
									kind: `closureModule`,
									i: t,
									mod: n instanceof Uint8Array ? n : n.mod,
								}));
						} catch (e) {
							(console.error(
								`[gex] closure library ${t} did not reach a worker:`,
								e,
							),
								this.#d(
									2,
									`gex: closure library ${t} did not reach a worker: ${e.message}\n`,
									0,
								));
						}
				}
				#Oe(e) {
					if (!this.#Z) return;
					let t = this.#$.pop();
					if (t !== void 0)
						return (this.#le.set(e, t), this.#Z.area + t * this.#Z.size);
					let n = ++this.#Q;
					if ((this.#le.set(e, n), n > this.#Z.count - 4))
						throw Error(
							`the global kernel has ${this.#Z.count} stacks and this is Worker ${n + 1}. Raise STACK_COUNT in shims/kernel.`,
						);
					return this.#Z.area + n * this.#Z.size;
				}
				takeKernelStack(e) {
					return this.#Oe(`ext:${e}`);
				}
				releaseKernelStack(e) {
					let t = this.#le.get(`ext:${e}`);
					t !== void 0 && (this.#le.delete(`ext:${e}`), this.#$.push(t));
				}
				#ke(e) {
					let t = this.#_;
					if (!t) return !1;
					let n = new Int32Array(t.memory.buffer),
						r = t.area >> 2,
						i = String(e).split(`:`);
					return (
						Atomics.load(n, r) !== 0 &&
						n[r + 30] === Number(i[0]) &&
						n[r + 29] === Number(i[i.length - 1])
					);
				}
				#Ae(e, t, n = !1) {
					if (this.#ke(e)) {
						let n = Date.now();
						(globalThis.GEX_DOOR_STATS || {}.GEX_DOOR_STATS) &&
							console.error(
								`[host] ${e}: ended inside a wineserver door call; stopped when it leaves`,
							);
						let r = () => {
							if (this.#ke(e) && Date.now() - n < 1e4) {
								setTimeout(r, 1);
								return;
							}
							if (this.#ke(e)) {
								let t = new Int32Array(this.#_.memory.buffer),
									n = this.#_.area >> 2;
								(console.error(
									`[host] ${e}: still inside a wineserver door call after 10 s; stopped, and the server is poisoned`,
								),
									Atomics.store(t, n + 31, t[n + 29] || -1),
									Atomics.store(t, n, 0),
									Atomics.notify(t, n));
							}
							this.#Ie(e, t);
						};
						setTimeout(r, 1);
						return;
					}
					this.#Ie(e, t, n);
				}
				#je(e, t, n) {
					let r = this.#pe(e) ? this.#e() : this.#xe();
					(this.#g.set(t, r), Zs(r, t));
					let i = { key: t },
						a = (e) =>
							this.#ze(
								i.key,
								r,
								e,
								() => {},
								() => {},
							);
					(r.addEventListener?.(`message`, (e) => a(e.data)),
						r.on?.(`message`, a));
					let o = (t) => {
						(this.#d(
							2,
							`gex: thread ${i.key} failed: ${t?.message ?? String(t)}\n`,
							e,
						),
							Xs(`thread ${i.key}: ${t?.message ?? String(t)}`));
					};
					(r.addEventListener?.(`error`, o),
						r.on?.(`error`, o),
						this.#y.set(t, n));
					let s = r[cc];
					if (s) {
						(delete r[cc],
							r.removeEventListener?.(`message`, s.buf),
							r.off?.(`message`, s.buf));
						for (let e of s.early) a(e);
					}
					return { w: r, ref: i };
				}
				#Me(e) {
					let t = this.#Y.get(e);
					if (!t) return;
					let n = `${e}:spare${++this.#J}`,
						{ w: r, ref: i } = this.#je(e, n, {
							kind: `thread`,
							spare: !0,
							memory: t.memory,
							moduleStore: t.moduleStore,
							compat: t.compat,
							procOpts: t.procOpts,
						}),
						a = { proc: e, key: n, w: r, ref: i, gen: t.execGen };
					for (
						this.#q.push(a),
							setTimeout(() => {
								let e = this.#q.indexOf(a);
								e < 0 ||
									(this.#q.splice(e, 1),
									R(`spare`) &&
										console.warn(
											`[spare] ${n}: let go, no thread in ${yc / 1e3} s`,
										),
									this.#Pe(a));
							}, yc).unref?.(),
							R(`spare`) &&
								console.warn(
									`[spare] ${n}: started (${this.#q.length} waiting on the page)`,
								);
						this.#q.length > vc;
					)
						this.#Pe(this.#q.shift());
				}
				#Ne(e, t) {
					let n = this.#q.findIndex((t) => t.proc === e);
					if (n < 0) return null;
					let [r] = this.#q.splice(n, 1);
					return t === r.gen ? r : (this.#Pe(r), this.#Fe(e), null);
				}
				#Pe(e) {
					if (this.#y.has(e.ref.key)) {
						(this.#y.delete(e.ref.key), this.#Ie(e.ref.key, e.w));
						return;
					}
					e.w.postMessage({ kind: `spareGo`, thread: null });
				}
				#Fe(e) {
					(this.#Y.delete(e), this.#X.delete(e));
					let t = this.#q.filter((t) => t.proc === e);
					if (t.length) {
						this.#q = this.#q.filter((t) => t.proc !== e);
						for (let e of t) this.#Pe(e);
					}
				}
				#Ie(e, t, n = !1) {
					this.#g.delete(e);
					let r = this.#q.findIndex((e) => e.w === t);
					r >= 0 && this.#q.splice(r, 1);
					let i = String(e).split(`:`)[0],
						a = [...this.#g.keys()].filter(
							(e) => String(e).split(`:`)[0] === i,
						);
					if (
						a.length &&
						a.every((e) => this.#q.some((t) => t.ref.key === e))
					) {
						(this.#Y.delete(i), this.#X.delete(i));
						for (let e of this.#q.filter((e) => e.proc === i)) {
							(this.#g.delete(e.ref.key), this.#y.delete(e.ref.key));
							let t = this.#le.get(e.ref.key);
							(t !== void 0 && (this.#le.delete(e.ref.key), this.#$.push(t)),
								e.w.terminate());
						}
						((this.#q = this.#q.filter((e) => e.proc !== i)), (a.length = 0));
					}
					a.length || this.#S.delete(i);
					let o = this.#le.get(e);
					(o !== void 0 && (this.#le.delete(e), this.#$.push(o)),
						!(n && !this.#pe(e) && this.#we(t)) && t.terminate());
				}
				#Le(e) {
					(this.#re.push(e),
						clearTimeout(this.#ie),
						(this.#ie = setTimeout(() => {
							(Ws(
								`[host] ${this.#re.length} kept memories let go: no exit in ${Sc / 1e3} s`,
							),
								(this.#re.length = 0),
								(this.#ie = null));
						}, Sc)),
						this.#ie.unref?.());
					let t = this.#re.reduce((e, t) => e + t.buffer.byteLength, 0);
					for (; this.#re.length > _c || (this.#re.length > 1 && t > xc); )
						t -= this.#re.shift().buffer.byteLength;
					t > xc && (this.#re.length = 0);
				}
				#Re(e) {
					let t = -1,
						n = 0;
					for (let r = 0; r < this.#re.length; r++) {
						let i = this.#re[r].buffer.byteLength,
							a = i >= e && i <= 2 * e;
						(a || i < e) &&
							(t < 0 ||
								(a && (n < e || i < n)) ||
								(!a && i < e && n < e && i > n)) &&
							((t = r), (n = i));
					}
					return t < 0 ? void 0 : this.#re.splice(t, 1)[0];
				}
				#ze(e, t, n, r, i) {
					switch (n?.kind) {
						case `ready`: {
							if (this.#i?.debugExit && this.#W.has(e)) {
								let t = performance.now() - this.#W.get(e);
								this.#d(
									2,
									`[gex] pid ${e}: worker ready after ${Math.round(t)}ms\n`,
									e,
								);
							}
							let n = this.#y.get(e);
							(this.#y.delete(e),
								Ws(
									`[host] pid ${e}: ready, ${n ? `sending ${n.kind}` : `NOTHING HELD`}`,
								),
								n &&
									this.#me(e).then((r) => {
										let { closure: i, ...a } = this.#i,
											o = R(`unitstall`) ? performance.now() : -1;
										(t.postMessage(
											{
												...a,
												closureCount: (i ?? []).length,
												...n,
												outputAck: this.#u(t),
												kernelStack: this.#B(t, e),
												shim: r.shim,
												guest: r.guest,
												kernel: r.kernel,
												mem64: r.mem64,
												pageFlavours: this.#fe(),
												saveGate: this.#ve,
												sharedModules: this.#F(e, n.kind === `thread`, t),
												unitFiles: this.#j(),
												door: this.#_ ?? void 0,
												doorWord: this.#v ?? void 0,
												memories: ac || void 0,
												recycledMemory:
													n.kind === `adopt` &&
													n.child &&
													!n.child.exec &&
													!this.#pe(e)
														? this.#Re(Qs(n.child))
														: void 0,
											},
											[
												...st(n.child),
												...(n.child?.bulk ? [n.child.bulk] : []),
												...(n.bulk ? [n.bulk] : []),
												...(n.transfer ?? []),
											],
										),
											o >= 0 &&
												console.warn(
													`[host-post] ${e} ${n.kind}: ${(performance.now() - o).toFixed(1)} ms`,
												));
										let s = performance.now();
										(bc && this.#oe(e),
											this.#Ee(t, i),
											this.#i?.debugExit &&
												this.#d(
													2,
													`[gex] pid ${e}: sent ${(i ?? []).length} closure modules in ${Math.round(performance.now() - s)}ms\n`,
													e,
												));
									}));
							break;
						}
						case `note`:
							Ys(n.note);
							break;
						case `doorPublish`:
							((this.#_ = n.door),
								Ws(`[host] wineserver pid ${n.door?.pid} published its door`));
							for (let [, e] of this.#g)
								e.postMessage({ kind: `door`, door: n.door });
							break;
						case `wantLibrary`:
							this.#De(t, n.i);
							break;
						case `snap-parked`:
							(this.#he?.parked.set(String(e), n), this.#he?.check());
							break;
						case `snap-attached`: {
							let t = this.#_e.get(String(e));
							(this.#_e.delete(String(e)), t?.());
							break;
						}
						case `kernelStacks`:
							((this.#Z = n), this.#z());
							break;
						case `output`: {
							this.#d(n.fd, n.text, e, n);
							let r = this.#l.get(t);
							r && (Atomics.add(r, 0, 1), Atomics.notify(r, 0));
							break;
						}
						case `droppedModules`: {
							let r = String(e).split(`:`)[0],
								i = n.keys ?? [],
								a = this.#S.get(r),
								o = [];
							for (let e of i)
								(a?.has(e) && (a.delete(e), (a.bytes = (a.bytes ?? 0) - Ac(e))),
									this.#w.delete(e) &&
										((this.#T -= Number(e.split(`:`)[1])), o.push(e)));
							for (let [e, n] of this.#g)
								n !== t &&
									String(e).split(`:`)[0] === r &&
									n.postMessage({ kind: `droppedModules`, keys: i });
							if (o.length) {
								for (let e of this.#te)
									if (e[lc]) {
										for (let t of o) e[lc].delete(t);
										e.postMessage({ kind: `droppedModules`, keys: o });
									}
							}
							break;
						}
						case `unitFile`:
							typeof n.rel == `string` &&
								!this.#k.has(n.rel) &&
								this.#k.size < Ec &&
								this.#k.set(n.rel, n.bytes ?? null);
							break;
						case `prefetchUnit`: {
							let t = `cgen:${n.key}`,
								r = String(e).split(`:`)[0];
							if (typeof n.key != `string` || typeof n.url != `string`) break;
							let i = this.#E.get(t);
							if (i) {
								this.#H(t, i, r);
								break;
							}
							let a = this.#D.get(n.key);
							if (a) {
								a.add(r);
								break;
							}
							this.#D.set(n.key, new Set([r]));
							let o = performance.now(),
								s = R(`unitstall`);
							(this.#O
								? this.#O(n.url)
								: fetch(n.url)
										.then((e) => {
											if (!e.ok) throw Error(`${e.status}`);
											return e.arrayBuffer();
										})
										.then((e) => WebAssembly.compile(e))
							)
								.then((e) => {
									s &&
										console.warn(
											`[unit-pf] ${n.key.slice(0, 16)}: compiled ahead in ${Math.round(performance.now() - o)} ms`,
										);
									let i = this.#E.get(t);
									i || this.#V(t, e, null, r);
									for (let a of this.#D.get(n.key) ?? [])
										(i || a !== r) && this.#H(t, i ?? e, a);
								})
								.catch((e) => {
									s &&
										console.warn(
											`[unit-pf] ${n.key.slice(0, 16)}: ${e?.message ?? e}`,
										);
								})
								.finally(() => this.#D.delete(n.key));
							break;
						}
						case `compiledModule`: {
							let r = String(e).split(`:`)[0],
								i = this.#S.get(r);
							if (
								(i || this.#S.set(r, (i = new Map())),
								this.#i?.fillTime && this.#M(),
								typeof n.key == `string` &&
									(n.key.startsWith(`cgen:`) || n.key.startsWith(`cold:`)))
							) {
								this.#V(n.key, n.mod, t, String(e).split(`:`)[0]);
								break;
							}
							if (typeof n.key == `string` && n.key.startsWith(`wasm:`)) {
								(this.#C.delete(n.key),
									this.#C.set(n.key, n.mod),
									this.#U(n.key, n.mod));
								let e = 0;
								for (let t of this.#C.keys()) e += jc(t);
								for (; this.#C.size > 1 && (this.#C.size > Cc || e > wc); ) {
									let t = this.#C.keys().next().value;
									((e -= jc(t)), this.#C.delete(t));
								}
							}
							if (typeof n.key == `string` && n.key.startsWith(`u:`)) {
								if (this.#i?.unitCache && !this.#w.has(n.key))
									for (
										this.#w.set(n.key, n.mod),
											this.#U(n.key, n.mod),
											this.#T += Number(n.key.split(`:`)[1]);
										(this.#T > Dc || this.#w.size > kc) && this.#w.size > 1;
									) {
										let e = this.#w.keys().next().value;
										((this.#T -= Number(e.split(`:`)[1])), this.#w.delete(e));
									}
								break;
							}
							if (typeof n.key == `string` && !i.has(n.key)) {
								for (
									i.set(n.key, n.mod), i.bytes = (i.bytes ?? 0) + Ac(n.key);
									(i.bytes > Oc || i.size > kc) && i.size > 1;
								) {
									let e = i.keys().next().value;
									((i.bytes -= Ac(e)),
										i.delete(e),
										i.capped ||
											((i.capped = !0),
											console.error(
												`[host] process ${r}'s compiled-module relay passed 256 MiB: dropping the oldest (a pc translated over and over? see the "LIVELOCK?" line)`,
											)));
								}
								this.#i?.shareTrace &&
									console.warn(
										`[share] host cached ${n.key.slice(0, 30)} from ${e} (${i.size} for process ${r})`,
									);
								for (let [e, i] of this.#g)
									i !== t &&
										String(e).split(`:`)[0] === r &&
										i.postMessage({
											kind: `sharedModule`,
											key: n.key,
											mod: n.mod,
										});
							}
							break;
						}
						case `fork`: {
							let t = n.child?.forkCost;
							if (t) {
								let e = Math.round(
									performance.timeOrigin + performance.now() - t.sentAt,
								);
								(Ws(
									`[gex] fork -> pid ${n.child.pid}: image ${(t.bytes / 1048576).toFixed(1)} MiB in ${t.regions} regions, built ${t.buildMs}ms, ${e}ms to reach the host`,
								),
									(t.atHost = performance.now()));
							}
							this.#x++;
							{
								let t = n.child.mem64 ?? this.#de(e);
								t === !!this.#i?.mem64
									? this.#c.delete(n.child.pid)
									: this.#c.set(n.child.pid, t);
							}
							(this.#f(n.child, e),
								bc && this.#ae.set(n.child.pid, new WeakRef(n.child)));
							let r = n.child.pid;
							(this.#be(r, { kind: `adopt`, child: n.child }).catch((t) => {
								(this.#d(2, `gex: process ${r} failed: ${t.message}\n`, e),
									Xs(`pid ${r}: ${t.message}`));
							}),
								(n = null));
							break;
						}
						case `execAway`: {
							let a = n.child;
							(a.mem64 !== void 0 && a.mem64 !== !!this.#i?.mem64
								? this.#c.set(Number(e), a.mem64)
								: this.#c.delete(Number(e)),
								this.#Ie(e, t),
								this.#be(e, { kind: `adopt`, child: a }).then(r, i));
							break;
						}
						case `thread`: {
							this.#K++;
							let t = `${e}:${n.thread.tid}`,
								r = String(e).split(`:`)[0];
							(ac &&
								n.thread.memory &&
								(globalThis.__gexMemories ??= new Map()).set(
									Number(r),
									n.thread.memory,
								),
								globalThis.GEX_ATTACH_TRACE &&
									console.error(
										`[spawn] host got 'thread' for ${t}, taking a Worker (t=${Date.now()})`,
									));
							let i = this.#X.get(r);
							i !== void 0 && this.#X.set(r, i + 1);
							let a = this.#Ne(r, n.thread.execGen);
							if (a) {
								(n.thread.bulk?.close?.(),
									this.#g.delete(a.key),
									this.#g.set(t, a.w),
									Zs(a.w, t));
								let e = this.#le.get(a.key);
								e !== void 0 && (this.#le.delete(a.key), this.#le.set(t, e));
								let r = this.#y.get(a.key);
								(r && (this.#y.delete(a.key), this.#y.set(t, r)),
									(a.ref.key = t),
									R(`spare`) &&
										console.warn(
											`[spare] ${t}: on ${a.key}, ${r ? `still starting` : `ready`}`,
										));
								let { tid: i, ctx: o, pc: s, procOpts: c } = n.thread;
								a.w.postMessage({
									kind: `spareGo`,
									thread: { tid: i, ctx: o, pc: s, procOpts: c },
								});
							} else this.#je(e, t, { kind: `thread`, ...n.thread });
							i >= 1 && !this.#q.some((e) => e.proc === r) && this.#Me(r);
							break;
						}
						case `threadSpare`: {
							let t = String(e).split(`:`)[0];
							if ((this.#Fe(t), this.#pe(t) || !this.#i?.shared || S.on)) break;
							(this.#Y.set(t, n.spare), this.#X.set(t, 0), this.#Me(t));
							break;
						}
						case `stdin`:
							if (!this.#m) {
								t.postMessage({ kind: `eof` });
								break;
							}
							Promise.resolve(this.#m(n.lflag)).then((e) => {
								e === !0
									? t.postMessage({ kind: `stdin`, bytes: !0 })
									: e && e.length
										? t.postMessage({ kind: `stdin`, bytes: e })
										: t.postMessage({ kind: `eof` });
							});
							break;
						case `exit`:
							if (n.threadGone) {
								let n = this.#G.get(e);
								(this.#Ae(e, t),
									n && `status` in n
										? (this.#G.delete(e), r(n.status))
										: this.#G.set(e, { resolve: r }));
								break;
							}
							if (n.carries) {
								let r = Number(String(e).split(`:`)[0]),
									i = this.#G.get(r);
								(this.#p(n, r),
									Ks(r),
									this.#Ae(e, t),
									i?.resolve
										? (this.#G.delete(r), i.resolve(n.status))
										: this.#G.set(r, { status: n.status }));
								break;
							}
							if (this.#_ && e === this.#_.pid) {
								let e = new Int32Array(this.#_.memory.buffer),
									t = this.#_.area >> 2;
								(Atomics.load(e, t + 31) || Atomics.store(e, t + 31, -1),
									this.#v &&
										Atomics.compareExchange(this.#v, 0, this.#_.pid, 0),
									Atomics.notify(e, t),
									(this.#_ = null));
								for (let [, e] of this.#g)
									e.postMessage({ kind: `door`, door: null });
							}
							if (
								(n.recycle instanceof WebAssembly.Memory &&
									!this.#pe(e) &&
									this.#Le(n.recycle),
								this.#i?.exitTrace &&
									this.#d(
										2,
										`[gex] worker ${e} ended with status ${n.status}${n.exitPc ? ` at pc 0x${n.exitPc.toString(16)}` : ``} (guest ${n.guestMillis ?? -1}ms)\n`,
										typeof e == `number` ? e : 0,
									),
								n.traps && R(`traps`))
							) {
								let t = n.traps;
								console.error(
									`[gex] pid ${e}: traps straight on/through each step: run loop ${t.loop}/${t.loopFull}, call-outs ${t.callout}/${t.calloutFull}, native calls ${t.native}/${t.nativeFull}`,
								);
							}
							if (!this.#i?.ownExitLines && n.millis !== void 0 && L(`debug`)) {
								let t = this.#W.has(e)
									? Math.round(performance.now() - this.#W.get(e))
									: 0;
								(this.#W.delete(e),
									console.log(
										`[gex] pid ${e}: lived ${t}ms (guest ${n.guestMillis ?? -1}ms)` +
											(n.cmdline ? ` {${n.cmdline}}` : ``) +
											(n.heapKib >= 0
												? `, runtime holds ${Math.round(n.heapKib / 1024)} MiB`
												: ``) +
											(n.slotsLeftK >= 0
												? `, ${n.slotsLeftK}k dispatch slots left`
												: ``) +
											(n.memoryMib === void 0
												? ``
												: `, memory ${n.memoryMib} MiB`) +
											(n.arena
												? ` (maps ${n.arena[0]}, heap ${n.arena[1]}, stacks ${n.arena[2]})`
												: ``) +
											(n.fill?.denseLeft
												? `, dense modules ${n.fill.denseWanted} wanted of ${n.fill.denseLeft} left (${n.fill.denseAsks} asks, ${n.fill.denseFillMs.toFixed(1)} ms, worst ${n.fill.denseFillWorst.toFixed(2)} ms)`
												: ``) +
											(n.fill
												? `, tables blocks ${n.fill.blocksLen} ftab ${n.fill.ftabLen}`
												: ``) +
											(this.#r?.memory
												? `, kernel ${Math.round(this.#r.memory.buffer.byteLength / 1048576)} MiB`
												: ``) +
											(n.vforkMs === void 0
												? ``
												: `, forked in place (${n.vforkMs.toFixed(1)}ms to exec, nothing copied)`) +
											(n.workerRuns > 1
												? `, on a given-back worker (its process ${n.workerRuns})`
												: ``) +
											(n.forkCopied
												? `, fork copied ${Math.round(n.forkCopied / 1048576)} MiB` +
													(n.forkZeros
														? `, left ${Math.round(n.forkZeros / 1048576)} MiB of zeros alone`
														: ``) +
													(n.forkSkipped
														? ` and skipped ${Math.round(n.forkSkipped / 1048576)}`
														: ``)
												: ``) +
											`, ${n.millis}ms translating ${n.blocks} blocks` +
											(n.liftInClosure
												? ` (${n.liftInClosure} on closure pages)`
												: ``) +
											(n.liftWhy && n.liftWhy.some((e) => e)
												? ` why[nofill=${n.liftWhy[0]} unowned=${n.liftWhy[1]} asked=${n.liftWhy[2]} fresh=${n.liftWhy[3]}]`
												: ``) +
											(n.liftSlots ? ` slots[${n.liftSlots}]` : ``) +
											(n.waits &&
											(n.waits.park ||
												n.waits.turn ||
												n.waits.nap ||
												n.waits.net)
												? `, waited park=${n.waits.park} turn=${n.waits.turn} nap=${n.waits.nap} net=${n.waits.net ?? 0}`
												: ``) +
											(n.byObject ? ` [${n.byObject}]` : ``) +
											(n.xlate
												? ` xlate[insns=${n.xlate[0]} wasmKiB=${Math.round(n.xlate[1] / 1024)} units=${n.xlate[2]} smc=${n.xlate[3]} retiredPages=${n.xlate[4]} retires=${n.xlate[5]} relift=${n.xlate[6]}blk/${Math.round((n.xlate[8] ?? 0) / 1024)}KiB anon=${n.xlate[7]}blk/${Math.round((n.xlate[9] ?? 0) / 1024)}KiB]`
												: ``) +
											(n.installs
												? `, ${n.installMs}ms installing ${n.installs} modules (${n.compileMs}ms compile${n.compiles === void 0 ? `` : ` of ${n.compiles}`}${n.unitHits ? `, ${n.unitHits} from the unit cache` : ``}, ${n.instantiateMs}ms instantiate, ${n.growMs}ms grow)`
												: ``) +
											`, worker start ${(n.shimCompileMs ?? 0) + (n.shimInstMs ?? 0) + (n.guestInstMs ?? 0)}ms (shim ${n.shimCompileMs}c/${n.shimInstMs}i, guest ${n.guestInstMs}i)` +
											(n.loader && n.loader.calls
												? `, ld.so ${n.loader.calls} syscalls, last at ${n.loader.doneMs}ms`
												: ``) +
											(n.loader && n.loader.link && n.loader.link !== `off`
												? `, link ${n.loader.link}` +
													(n.loader.cost && n.loader.cost[0]
														? ` (${n.loader.cost[0]} regions, ${Math.round(n.loader.cost[1] / 1024)} KiB reread in ${n.loader.cost[3]}ms, ${Math.round(n.loader.cost[2] / 1024)} KiB copied in ${n.loader.cost[4]}ms)`
														: ``)
												: ``) +
											(n.fill && (n.fill.filled || n.fill.unanswered)
												? `, fill ${n.fill.filled} answered ${n.fill.unanswered} not` +
													(n.fill.sysN
														? `, sys ${n.fill.sysN}x ${n.fill.sysMs}ms`
														: ``) +
													` (${n.fill.now ?? 0} fast, ${n.fill.nowMs ?? 0}ms[base ${n.fill.faBase ?? 0} init ${n.fill.faInit ?? 0}]; ${n.fill.slow ?? 0} slow, ${n.fill.slowMs ?? 0}ms; ${n.fill.pub ?? 0} published, ${n.fill.pubMs ?? 0}ms, grew ${n.fill.grew ?? 0} slots in ${n.fill.growMs ?? 0}ms, want ${n.fill.wantMs ?? 0}ms inst ${n.fill.instMs ?? 0}ms (grow ${n.fill.iGrow ?? 0} comp ${n.fill.iComp ?? 0} inst ${n.fill.iInst ?? 0}; ${n.fill.iGrows ?? 0} grows +${n.fill.iAdded ?? 0} copying ${n.fill.iCopied ?? 0}, tables ${n.fill.tlen ?? ``})` +
													(n.fill.bigGrows
														? `, big [${n.fill.bigGrows}]`
														: ``) +
													(n.fill.tn ? `, tn [${n.fill.tn}]` : ``) +
													` tail ${n.fill.tailMs ?? 0}ms` +
													(n.fill.strictGrows
														? ` retry ${n.fill.strictGrows}x/${n.fill.strictSlots}`
														: ``) +
													`)`
												: ``) +
											(n.reuse
												? `, reuse have=${n.reuse[0]} hit=${n.reuse[1]} miss=${n.reuse[2]} noident=${n.reuse[3]} served=${n.reuse[4]} stored=${n.reuse[5]} writable=${n.reuse[9]} nocode=${n.reuse[10]}`
												: ``),
									));
							}
							for (let t of n.hot ?? [])
								this.#d(2, `[hot] pid ${e}: ${t}\n`, e);
							(this.#p(n, e), Ks(e), this.#Ae(e, t, !!n.giveBack), r(n.status));
							break;
						case `threw`:
							(String(e).includes(`:`) || Ks(e),
								this.#Ae(e, t),
								console.error(
									`[gex] pid ${e} threw: ${n.message}\n${n.stack ?? ``}`,
								),
								Xs(`pid ${e} threw: ${n.message}`),
								i(
									Object.assign(Error(`pid ${e}: ${n.message}`), {
										guestStack: n.stack,
									}),
								));
							break;
						default:
							this.#h(n, e, t);
					}
				}
			}));
	}),
	Ic,
	Lc,
	Rc,
	zc,
	Bc,
	Vc = o(() => {
		(ot(),
			ht(),
			ae(),
			(Ic = () => {
				S.on && D.checkSlots();
			}),
			(Lc = 256),
			(Rc = 4096),
			(zc = class e {
				#e;
				#t;
				#n;
				static async open(t) {
					return !t?.module || !t?.memory
						? null
						: !S.on &&
							  typeof Worker == `function` &&
							  typeof SharedArrayBuffer < `u` &&
							  t.memory.buffer instanceof SharedArrayBuffer
							? Bc.open(t)
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
										...Ge(i),
										lazy_fetch: Je(t.memory),
										page_fs: ft(t.memory),
									},
								})));
						} catch {
							((i = new WebAssembly.Memory({ initial: 1, maximum: 65535 })),
								(r = await WebAssembly.instantiate(n, {
									env: {
										memory: t.memory,
										...Ge(i),
										lazy_fetch: Je(t.memory),
										page_fs: ft(t.memory),
									},
								})));
						}
					} catch (e) {
						return (
							console.warn(`[gex] no shared terminal: ${e.message}`),
							null
						);
					}
					let a = r.exports;
					return typeof a.k_tty_input == `function`
						? (a.k_stack_area &&
								r.exports.__stack_pointer &&
								qe(r.exports, Ke(a, `tty`)),
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
						let r = t.subarray(e, e + Rc - Lc);
						(this.#r().set(r, Lc),
							(n = this.#e.k_tty_input(BigInt(Lc), r.length)));
					}
					return (Ic(), n);
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
						let t = this.#e.k_tty_echo(BigInt(Lc), 3840);
						if (t <= 0 || (e.push(this.#r().slice(Lc, Lc + t)), t < 3840))
							break;
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
					(this.#e.k_stdin_eof(), Ic());
				}
				lflag() {
					if (this.#e.k_tty_get_termios(BigInt(Lc), 60) < 16) return 0;
					let e = this.#r();
					return (
						(e[268] | (e[269] << 8) | (e[270] << 16) | (e[271] << 24)) >>> 0
					);
				}
				winsize() {
					let e = this.#e.k_tty_winsize();
					return [Number(e >> 48n) & 65535, Number((e >> 32n) & 65535n)];
				}
				resize(e, t) {
					let n = (BigInt(e & 65535) << 48n) | (BigInt(t & 65535) << 32n),
						r = this.#e.k_tty_resize(n) !== 0;
					return (Ic(), r);
				}
				fg() {
					return this.#e.k_tty_fg();
				}
				signal(e) {
					let t = this.#e.k_tty_signal(e >>> 0);
					return (Ic(), t);
				}
			}),
			(Bc = class e {
				#e;
				#t = 0;
				#n = new Map();
				static async open(t) {
					let n = new Worker(
							new URL("./tty-worker-ClfPKrfW.mjs", import.meta.url),
							{ type: "module", name: "tty" },
						),
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
			}));
	});
function Hc(e) {
	let t = globalThis.Worker,
		n = null;
	globalThis.Worker = function (e) {
		n = String(e);
	};
	try {
		e();
	} catch {
		n = null;
	} finally {
		globalThis.Worker = t;
	}
	return n;
}
async function Uc(e, t = () => {}) {
	let n = null;
	try {
		n = typeof caches == `object` && caches ? await caches.open(Wc) : null;
	} catch {
		n = null;
	}
	let r = async (e) => {
			if (n && qc(e))
				try {
					let r = await n.match(e);
					if (r?.ok) {
						let e = await r.text();
						return (t(0, e.length), e);
					}
				} catch {}
			let r = await fetch(e);
			if (!r.ok) throw Error(`${e}: ${r.status}`);
			let i = await r.text();
			return (
				t(i.length, 0),
				n &&
					qc(e) &&
					n
						.put(
							e,
							new Response(i, {
								headers: { "Content-Type": `text/javascript` },
							}),
						)
						.catch(() => {}),
				i
			);
		},
		i = new Map(),
		a = new Set(),
		o = [],
		s = async (e) => {
			if (i.has(e)) return i.get(e);
			if (a.has(e)) throw Error(`an import cycle at ${e}`);
			a.add(e);
			let t = await r(e);
			if (
				(/\bimport\.meta\.url\b/.test(t) &&
					(t = `const __gexModuleUrl = ${JSON.stringify(e)};\n${t.replace(/\bimport\.meta\.url\b/g, `__gexModuleUrl`)}`),
				/\bimport\.meta\b/.test(t))
			)
				throw Error(`${e} reads import.meta`);
			let n = [...t.matchAll(Kc)]
				.map((e) => e[2])
				.find((e) => !e.startsWith(`./`));
			if (n) throw Error(`${e} imports ${n}`);
			let c = [
				...new Set(
					[...t.matchAll(Gc)].map(
						(t) =>
							new URL(/* @vite-ignore */ /* webpackIgnore: true */ t[2], e)
								.href,
					),
				),
			];
			for (let e of c) await s(e);
			t = t.replace(
				Gc,
				(t, n, r) =>
					`${n}${i.get(new URL(/* @vite-ignore */ /* webpackIgnore: true */ r, e).href)}${n}`,
			);
			let l = URL.createObjectURL(new Blob([t], { type: `text/javascript` }));
			return (o.push(l), i.set(e, l), a.delete(e), l);
		};
	try {
		let t = URL.createObjectURL(
			new Blob([`globalThis.GEX_BASE = ${JSON.stringify(e)};\n`], {
				type: `text/javascript`,
			}),
		);
		o.push(t);
		let r = await s(e),
			a = URL.createObjectURL(
				new Blob(
					[`import ${JSON.stringify(t)};\nimport ${JSON.stringify(r)};\n`],
					{ type: `text/javascript` },
				),
			);
		if ((o.push(a), n)) {
			let e = new Set(i.keys());
			n.keys()
				.then((t) =>
					Promise.all(t.filter((t) => !e.has(t.url)).map((e) => n.delete(e))),
				)
				.catch(() => {});
		}
		return a;
	} catch (e) {
		for (let e of o) URL.revokeObjectURL(e);
		return (
			console.warn(`[gex] Workers load by URL: ${e?.message ?? e}`),
			null
		);
	}
}
var Wc,
	Gc,
	Kc,
	qc,
	Jc = o(() => {
		((Wc = `gex-modules-v1`),
			(Gc = /(["'`])(\.\/[A-Za-z0-9_.-]+\.m?js)\1/g),
			(Kc = /(?:\bfrom\s*|\bimport\s*\(?\s*)(["'`])([^"'`\s]+)\1/g),
			(qc = (e) =>
				/-[A-Za-z0-9_-]{8}\.m?js$/.test(
					new URL(/* @vite-ignore */ /* webpackIgnore: true */ e).pathname,
				)));
	});
function Yc(e) {
	$c || (Zc(e) && ($c = !0));
}
function Xc(e) {
	return (
		typeof AudioContext == `function` &&
		typeof AudioWorkletNode == `function` &&
		typeof SharedArrayBuffer == `function` &&
		e?.buffer instanceof SharedArrayBuffer
	);
}
function Zc({
	memory: e,
	at: t,
	clock: n = !0,
	latency: r = `interactive`,
	loop: i = !1,
	context: a = null,
}) {
	if (!t || !Xc(e)) return null;
	let o = a;
	if (!o)
		try {
			o = new AudioContext({ latencyHint: r });
		} catch {
			o = new AudioContext({ latencyHint: `interactive` });
		}
	let s = { ctx: o, last: null, history: [] };
	globalThis.__gexAudio = s;
	let c = () => {
			o.state !== `running` && o.resume().catch(() => {});
		},
		l = [`pointerdown`, `mousedown`, `keydown`, `touchend`];
	for (let e of l) addEventListener(e, c, { capture: !0, passive: !0 });
	c();
	let u = URL.createObjectURL(new Blob([Qc], { type: `text/javascript` }));
	return (
		(s.close = () => {
			for (let e of l) removeEventListener(e, c, { capture: !0 });
			return (
				s.node?.disconnect(),
				globalThis.__gexAudio === s && (globalThis.__gexAudio = null),
				o.close().catch(() => {})
			);
		}),
		(s.ready = o.audioWorklet.addModule(u).then(
			() => {
				URL.revokeObjectURL(u);
				let r = new AudioWorkletNode(o, `gex-dsp`, {
					numberOfInputs: 0,
					numberOfOutputs: 1,
					outputChannelCount: [2],
				});
				((r.port.onmessage = (e) => {
					((e.data.base = +(1e3 * (o.baseLatency ?? 0)).toFixed(1)),
						(e.data.output = +(1e3 * (o.outputLatency ?? 0)).toFixed(1)),
						r.port.postMessage({
							latencyUs: Math.round(1e3 * (e.data.base + e.data.output)),
						}),
						(s.last = e.data),
						s.history.push(e.data),
						s.history.length > 64 && s.history.shift());
				}),
					r.port.postMessage({ buffer: e.buffer, at: t, clock: n, loop: i }),
					r.port.postMessage({
						latencyUs: Math.round(
							1e6 * ((o.baseLatency ?? 0) + (o.outputLatency ?? 0)),
						),
					}),
					r.connect(o.destination),
					(s.node = r));
			},
			(e) => {
				throw (
					console.warn(
						`[gex] audio: the player did not start:`,
						e?.message ?? e,
					),
					e
				);
			},
		)),
		s.ready.catch(() => {}),
		s
	);
}
var Qc,
	$c,
	el = o(() => {
		((Qc = `
// Layout: shims/kernel/src/audio.rs (version 2).
const HDR = 32, SW = 16, OFF = (HDR + 8 * SW) * 4;
const HIGH = 0.3, BACK = 0.08;
class GexDsp extends AudioWorkletProcessor {
  constructor() {
    super();
    this.words = null;
    this.port.onmessage = (e) => {
      const { buffer, at, clock, loop } = e.data;
      if (e.data.latencyUs !== undefined) { if (this.words) Atomics.store(this.words, 6, e.data.latencyUs); return; }
      // ?audioclock=0: not the device's clock (it keeps the wall clock), and
      // the larger start the drift needs: as before, for measuring.
      this.clock = clock !== false;
      this.low = this.clock ? 0.006 : 0.04;
      this.loop = !!loop;
      this.words = new Uint32Array(buffer, at, HDR + 8 * SW);
      this.nslots = this.words[2]; this.cap = this.words[3]; this.ccap = this.words[8];
      this.slots = [];
      for (let s = 0; s < this.nslots; s++) {
        this.slots.push({ base: HDR + s * SW, f: new Float32Array(buffer, at + OFF + s * this.cap * 8, this.cap * 2), ri: null, fr: 0, gen: -1, waiting: true, lastW: 0, still: 0 });
      }
      this.capture = new Float32Array(buffer, at + OFF + this.nslots * this.cap * 8, this.ccap * 2);
      Atomics.store(this.words, 5, sampleRate);
      Atomics.store(this.words, 9, 128);
    };
    this.played = 0; this.under = 0; this.sumsq = 0; this.n = 0; this.cross = 0; this.last = 0; this.tick = 0;
    // The rings' backlog when a quantum starts (frames written and not yet
    // played, the most of any slot playing): the software part of the
    // output latency, measured.
    this.bsum = 0; this.bmin = Infinity; this.bmax = 0; this.bn = 0; this.active = 0;
  }
  // Add slot \`sl\`'s next \`n\` frames, resampled, into L/R. Whether it played.
  mix(sl, L, R, n) {
    const W = this.words, b = sl.base;
    const w = Atomics.load(W, b + 3);
    const rate = W[b + 1] || sampleRate;
    const gen = Atomics.load(W, b + 2);
    if (sl.ri === null || gen !== sl.gen) { sl.gen = gen; sl.ri = w; sl.fr = 0; sl.waiting = true; sl.lastW = w; sl.still = 0; }
    let avail = (w - sl.ri) >>> 0;
    // Lapped (or wrapped past), or far behind the writer: the newest frames, a short latency.
    if (avail > this.cap || avail > HIGH * rate) { sl.ri = (w - Math.floor(BACK * rate)) >>> 0; avail = (w - sl.ri) >>> 0; sl.fr = 0; }
    // Frames of the context's time since the writer last added any.
    sl.still = w === sl.lastW ? sl.still + n : 0;
    sl.lastW = w;
    // Waiting for the start's worth, unless the writer has added nothing
    // for as long: a device buffer shorter than the start holds all it can
    // (the writer waits for room), and only playing frees it.
    if (sl.waiting && avail < this.low * rate && !(avail >= 2 && sl.still >= this.low * sampleRate)) { Atomics.store(W, b + 4, sl.ri); return false; }
    sl.waiting = false;
    const ms = avail * 1000 / rate;
    if (ms > this.qmax) this.qmax = ms;
    const step = rate / sampleRate, f = sl.f, cap = this.cap;
    for (let i = 0; i < n; i++) {
      if (((w - sl.ri) >>> 0) < 2) {
        // Ran dry: an underrun only while its stream still has the slot.
        if (W[b] !== 0) { this.under++; Atomics.add(W, b + 6, 1); }
        sl.waiting = true; break;
      }
      const a = (sl.ri % cap) * 2, c = ((sl.ri + 1) % cap) * 2, t = sl.fr;
      L[i] += f[a] * (1 - t) + f[c] * t; R[i] += f[a + 1] * (1 - t) + f[c + 1] * t;
      sl.fr += step;
      while (sl.fr >= 1) { sl.fr -= 1; sl.ri = (sl.ri + 1) >>> 0; }
    }
    Atomics.store(W, b + 4, sl.ri);
    return true;
  }
  process(_inputs, outputs) {
    const L = outputs[0][0], R = outputs[0][1] ?? L, n = L.length;
    if (!this.words) return true;
    const W = this.words;
    if (this.clock) Atomics.add(W, 4, 1);
    L.fill(0); if (R !== L) R.fill(0);
    this.qmax = -1;
    let any = 0;
    for (const sl of this.slots) if (this.mix(sl, L, R, n)) any++;
    if (any) {
      this.bsum += this.qmax; this.bn++; if (this.qmax < this.bmin) this.bmin = this.qmax; if (this.qmax > this.bmax) this.bmax = this.qmax;
      for (let i = 0; i < n; i++) {
        const l = L[i];
        this.sumsq += l * l; this.n++;
        if ((l >= 0) !== (this.last >= 0)) this.cross++;
        this.last = l;
      }
      this.played += n;
      this.active = any;
    }
    // ?audioloop=1: what is played goes back in as capture (a digital
    // loopback, for the round trip).
    if (this.loop) {
      let cw = W[7];
      const C = this.capture, cc = this.ccap;
      for (let i = 0; i < n; i++) { const k = (cw % cc) * 2; C[k] = L[i]; C[k + 1] = R[i]; cw = (cw + 1) >>> 0; }
      Atomics.store(W, 7, cw);
    }
    // About twice a second: what was played, for the page's checks.
    if (++this.tick % 200 === 0 && this.n) {
      const backlog = this.bn ? { avg: +(this.bsum / this.bn).toFixed(1), min: +this.bmin.toFixed(1), max: +this.bmax.toFixed(1) } : null;
      this.port.postMessage({ rms: Math.sqrt(this.sumsq / this.n), hz: this.cross / 2 / (this.n / sampleRate), frames: this.n, underruns: this.under, rate: sampleRate, played: this.played, streams: this.active, backlog });
      this.sumsq = 0; this.n = 0; this.cross = 0;
      this.bsum = 0; this.bmin = Infinity; this.bmax = 0; this.bn = 0;
    }
    return true;
  }
}
registerProcessor('gex-dsp', GexDsp);
`),
			($c = !1));
	}),
	tl,
	nl,
	rl,
	il,
	al = o(() => {
		((tl = {
			Escape: 1,
			Digit1: 2,
			Digit2: 3,
			Digit3: 4,
			Digit4: 5,
			Digit5: 6,
			Digit6: 7,
			Digit7: 8,
			Digit8: 9,
			Digit9: 10,
			Digit0: 11,
			Minus: 12,
			Equal: 13,
			Backspace: 14,
			Tab: 15,
			KeyQ: 16,
			KeyW: 17,
			KeyE: 18,
			KeyR: 19,
			KeyT: 20,
			KeyY: 21,
			KeyU: 22,
			KeyI: 23,
			KeyO: 24,
			KeyP: 25,
			BracketLeft: 26,
			BracketRight: 27,
			Enter: 28,
			ControlLeft: 29,
			KeyA: 30,
			KeyS: 31,
			KeyD: 32,
			KeyF: 33,
			KeyG: 34,
			KeyH: 35,
			KeyJ: 36,
			KeyK: 37,
			KeyL: 38,
			Semicolon: 39,
			Quote: 40,
			Backquote: 41,
			ShiftLeft: 42,
			Backslash: 43,
			KeyZ: 44,
			KeyX: 45,
			KeyC: 46,
			KeyV: 47,
			KeyB: 48,
			KeyN: 49,
			KeyM: 50,
			Comma: 51,
			Period: 52,
			Slash: 53,
			ShiftRight: 54,
			NumpadMultiply: 55,
			AltLeft: 56,
			Space: 57,
			CapsLock: 58,
			F1: 59,
			F2: 60,
			F3: 61,
			F4: 62,
			F5: 63,
			F6: 64,
			F7: 65,
			F8: 66,
			F9: 67,
			F10: 68,
			F11: 87,
			F12: 88,
			ControlRight: 97,
			AltRight: 100,
			Home: 102,
			ArrowUp: 103,
			PageUp: 104,
			ArrowLeft: 105,
			ArrowRight: 106,
			End: 107,
			ArrowDown: 108,
			PageDown: 109,
			Insert: 110,
			Delete: 111,
			MetaLeft: 125,
			MetaRight: 126,
		}),
			(nl = (e) =>
				!!e.shiftKey |
				(e.ctrlKey ? 4 : 0) |
				(e.altKey ? 8 : 0) |
				(e.metaKey ? 64 : 0) |
				(e.getModifierState?.(`CapsLock`) ? 2 : 0)),
			(rl = { 0: 272, 1: 274, 2: 273, 3: 275, 4: 276 }),
			(il = { 0: 1, 1: 4, 2: 2, 3: 8, 4: 16 }));
	}),
	ol = c({ Compositor: () => cl });
function sl(e) {
	let t = document.createElement(`canvas`);
	return (
		(t.width = e.width),
		(t.height = e.height),
		(t.id = e.id),
		(t.className = e.className),
		e.hasAttribute(`style`) && t.setAttribute(`style`, e.getAttribute(`style`)),
		e.hasAttribute(`tabindex`) &&
			t.setAttribute(`tabindex`, e.getAttribute(`tabindex`)),
		e.parentNode && e.replaceWith(t),
		t
	);
}
var cl,
	ll = o(() => {
		(le(),
			Fa(),
			al(),
			(cl = class e {
				#e;
				#t;
				#n;
				#r = [];
				#i = new Map();
				#a = 1;
				#o;
				static async create(
					t,
					n,
					r = t,
					{ makeWorker: i = null, scale: a = 1 } = {},
				) {
					let o = new e();
					return (await o.#s(t, n, r, i, { scale: a }), o);
				}
				async hostGl(e, t = {}) {
					let { source: n, ...r } = t,
						i = null;
					if (typeof n == `function`) {
						let e = [
								`gex-wgpu-replay.js`,
								`gex-wgpu-replay.wasm`,
								`gex-wgpu-replay.deferred.wasm`,
							],
							t = await Promise.all(
								e.map((e) =>
									Promise.resolve()
										.then(() => n(e))
										.catch(() => null),
								),
							);
						t.every(Boolean) &&
							(i = Object.fromEntries(e.map((e, n) => [e, t[n]])));
					}
					return (
						(t = i ? { ...r, sources: i } : r),
						new Promise((n, r) => {
							let i = ({ data: e }) => {
								(e.kind === `gl-ready` || e.kind === `gl-failed`) &&
									(this.#e.removeEventListener(`message`, i),
									e.kind === `gl-ready` ? n(e.describe) : r(Error(e.error)));
							};
							this.#e.addEventListener(`message`, i);
							let a = O(),
								o = a?.get(`mesaenv`),
								s = a?.get(`glcapture`),
								c = a?.get(`wgslcache`),
								l = a?.get(`wgpustats`) === `1`,
								u = a?.get(`gltrace`) === `1`;
							this.#e.postMessage({
								kind: `gl`,
								channel: e,
								url: k(`/gex/gex-wgpu-replay.js`),
								files: ce(`/gex/`),
								...t,
								...(o ? { mesaEnv: o } : {}),
								...(s ? { glCapture: s } : {}),
								...(c ? { wgslCache: c } : {}),
								...(l ? { wgpuStats: l } : {}),
								...(u ? { glTrace: u } : {}),
							});
						})
					);
				}
				async #s(e, t, n, r, { scale: i = 1 } = {}) {
					this.#t = t;
					let a = n === e,
						o;
					try {
						o = e.transferControlToOffscreen();
					} catch {
						((e = sl(e)), a && (n = e), (o = e.transferControlToOffscreen()));
					}
					((this.#n = e),
						(this.#o =
							typeof SharedArrayBuffer == `function`
								? new SharedArrayBuffer(16)
								: new ArrayBuffer(16)));
					let s = r
						? r()
						: new Worker(
								new URL("./compositor-worker-UHKEcK7F.mjs", import.meta.url),
								{ type: "module", name: "compositor" },
							);
					this.#e = s;
					let c = new Promise((e, t) => {
						let n = ({ data: r }) => {
							r.kind === `ready`
								? (s.removeEventListener(`message`, n), e())
								: r.kind === `error` &&
									(s.removeEventListener(`message`, n), t(Error(r.error)));
						};
						s.addEventListener(`message`, n);
					});
					s.addEventListener(`message`, ({ data: e }) => {
						if (e.kind === `direct`) this.#m(e.w ? { w: e.w, h: e.h } : null);
						else if (e.kind === `lock-wanted`) {
							if (
								e.late &&
								navigator.userActivation &&
								!navigator.userActivation.isActive
							)
								return;
							this.pointerLock &&
								document.pointerLockElement !== this.#n &&
								this.#n.requestPointerLock?.()?.catch?.(() => {});
						} else
							e.kind === `lock-release`
								? this.#p && document.exitPointerLock?.()
								: e.kind === `cursor`
									? ((this.#n.style.cursor = e.css), (this.#u = e.css))
									: e.kind === `describe` ||
										  e.kind === `wgsl-cache` ||
										  e.kind === `readout` ||
										  e.kind === `window-at`
										? (this.#i.get(e.id)?.(
												e.kind === `wgsl-cache`
													? { blob: e.blob, stats: e.stats }
													: e.state,
											),
											this.#i.delete(e.id))
										: e.kind === `error` &&
											console.error(`[compositor]`, e.error);
					});
					let l = O(),
						u = l?.get(`present`) ?? null,
						d = l?.get(`direct`) === `1`;
					this.#d = l?.get(`pointerlock`) === `1`;
					let f = l?.has(`gllimits`) ? Number(l.get(`gllimits`)) || 0 : null;
					(s.postMessage(
						{
							kind: `init`,
							canvas: o,
							width: e.width,
							height: e.height,
							scale: i,
							channel: t,
							stats: this.#o,
							present: u,
							direct: d,
							glLimits: f,
						},
						[o],
					),
						await c,
						this.#g(n));
				}
				#c = null;
				#l = null;
				#u = `none`;
				#d = !1;
				#f = null;
				pointerLock = !1;
				onpointerlock = null;
				#p = !1;
				#m(e) {
					let t = this.#n;
					(e && !this.#c
						? ((this.#l = t.getAttribute(`style`)),
							Object.assign(t.style, {
								width: `100vw`,
								height: `100vh`,
								objectFit: `contain`,
								background: `#000`,
								position: `fixed`,
								left: `0`,
								top: `0`,
								cursor: this.#u,
							}))
						: !e &&
							this.#c &&
							(this.#l === null
								? t.removeAttribute(`style`)
								: t.setAttribute(`style`, this.#l),
							document.pointerLockElement === t &&
								document.exitPointerLock?.()),
						(this.#c = e));
				}
				#h(e) {
					if (this.#c) {
						let t = this.#c;
						if (this.#f && document.pointerLockElement === this.#n)
							return (
								(this.#f.x = Math.max(
									0,
									Math.min(t.w - 1, this.#f.x + (e.movementX || 0)),
								)),
								(this.#f.y = Math.max(
									0,
									Math.min(t.h - 1, this.#f.y + (e.movementY || 0)),
								)),
								{ x: Math.round(this.#f.x), y: Math.round(this.#f.y) }
							);
						let n = this.#n.getBoundingClientRect(),
							r = Math.min(n.width / t.w, n.height / t.h) || 1,
							i = n.left + (n.width - t.w * r) / 2,
							a = n.top + (n.height - t.h * r) / 2,
							o = {
								x: Math.round((e.clientX - i) / r),
								y: Math.round((e.clientY - a) / r),
							};
						return ((this.#f = o), o);
					}
					let t = this.#n.getBoundingClientRect(),
						n = this.#n.width / Math.max(1, t.width),
						r = this.#n.height / Math.max(1, t.height);
					return {
						x: Math.round((e.clientX - t.left) * n),
						y: Math.round((e.clientY - t.top) * r),
					};
				}
				#g(e) {
					let t = (e) => this.#e.postMessage(e),
						n = () => performance.now() | 0,
						r = new Set(),
						i = () => {
							let e =
								this.pointerLock && document.pointerLockElement === this.#n;
							e !== this.#p &&
								((this.#p = e),
								t({ kind: `pointer-lock`, on: e, time: n() }),
								this.onpointerlock?.(e));
						};
					(document.addEventListener(`pointerlockchange`, i),
						this.#r.push(() =>
							document.removeEventListener(`pointerlockchange`, i),
						));
					let a = (e) => {
							if (this.#p) {
								let r = this.#n.getBoundingClientRect(),
									i = this.#n.width / Math.max(1, r.width),
									a = Math.round(e.movementX * i * 256),
									o = Math.round(e.movementY * i * 256);
								(a || o) &&
									t({ kind: `pointer-relative`, dx: a, dy: o, time: n() });
								return;
							}
							let { x: r, y: i } = this.#h(e);
							t({ kind: `pointer-move`, x: r, y: i, time: n() });
						},
						o = (i) => {
							(e.focus?.({ preventScroll: !0 }),
								this.#c &&
									this.#d &&
									document.pointerLockElement !== e &&
									e.requestPointerLock?.());
							let a = rl[i.button];
							if (a !== void 0) {
								if ((i.button >= 3 && r.add(i.button), !this.#p)) {
									let { x: e, y: r } = this.#h(i);
									t({ kind: `pointer-move`, x: e, y: r, time: n() });
								}
								(t({
									kind: `pointer-button`,
									button: a,
									pressed: !0,
									time: n(),
								}),
									i.preventDefault());
							}
						},
						s = (e) => {
							let i = rl[e.button];
							i !== void 0 &&
								(r.delete(e.button) && e.preventDefault(),
								t({
									kind: `pointer-button`,
									button: i,
									pressed: !1,
									time: n(),
								}));
						},
						c = (r) => {
							let i =
									256 *
									(r.deltaMode === 1
										? 100 / 3
										: r.deltaMode === 2
											? e.clientHeight || 600
											: 1),
								a = Math.round(r.deltaY * i),
								o = Math.round(r.deltaX * i);
							(a && t({ kind: `pointer-axis`, axis: 0, value: a, time: n() }),
								o && t({ kind: `pointer-axis`, axis: 1, value: o, time: n() }),
								r.preventDefault());
						},
						l = (r) => (i) => {
							if (r && this.#c && i.altKey && i.code === `Enter`) {
								(document.fullscreenElement
									? document.exitFullscreen?.()
									: e.requestFullscreen?.(),
									i.preventDefault());
								return;
							}
							let a = tl[i.code];
							a !== void 0 &&
								(t({
									kind: `key`,
									code: a,
									pressed: r,
									mods: nl(i),
									time: n(),
								}),
								i.preventDefault());
						},
						u = (e) => e.preventDefault(),
						d = l(!0),
						f = l(!1);
					(e.hasAttribute?.(`tabindex`) || e.setAttribute?.(`tabindex`, `0`),
						e.addEventListener(`mousemove`, a),
						e.addEventListener(`mousedown`, o),
						window.addEventListener(`mouseup`, s),
						e.addEventListener(`wheel`, c, { passive: !1 }),
						e.addEventListener(`contextmenu`, u),
						e.addEventListener(`keydown`, d),
						e.addEventListener(`keyup`, f),
						this.#r.push(() => {
							(e.removeEventListener(`mousemove`, a),
								e.removeEventListener(`mousedown`, o),
								window.removeEventListener(`mouseup`, s),
								e.removeEventListener(`wheel`, c),
								e.removeEventListener(`contextmenu`, u),
								e.removeEventListener(`keydown`, d),
								e.removeEventListener(`keyup`, f));
						}));
				}
				addMemory(e, t, n) {
					(n && this.#t?.pixels && (Vi(this.#t, n), (n = void 0)),
						(t || n) &&
							this.#e.postMessage({
								kind: `memory`,
								token: e,
								memory: t,
								kernel: n,
							}));
				}
				addPixels(e, t, n, r) {
					this.#e.postMessage({
						kind: `pixels`,
						token: e,
						id: t,
						buffer: n,
						replaces: r,
					});
				}
				dropMemory(e) {
					this.#e.postMessage({ kind: `drop-memory`, token: e });
				}
				resize(e, t) {
					this.#e.postMessage({ kind: `resize`, width: e, height: t });
				}
				counters() {
					let e = new Int32Array(this.#o);
					return { frames: Atomics.load(e, 0), windows: Atomics.load(e, 1) };
				}
				wgslCache() {
					let e = this.#a++;
					return new Promise((t) => {
						(this.#i.set(e, t),
							this.#e.postMessage({ kind: `wgsl-cache`, id: e }));
					});
				}
				readout() {
					let e = this.#a++;
					return new Promise((t) => {
						(this.#i.set(e, t),
							this.#e.postMessage({ kind: `readout`, id: e }),
							setTimeout(() => {
								this.#i.delete(e) && t(null);
							}, 5e3));
					});
				}
				async readoutBase64() {
					let e = await this.readout();
					if (!e) return null;
					let t = ``,
						n = e.px;
					for (let e = 0; e < n.length; e += 32768)
						t += String.fromCharCode.apply(null, n.subarray(e, e + 32768));
					return { w: e.w, h: e.h, b64: btoa(t) };
				}
				windowAt(e, t) {
					let n = this.#n.getBoundingClientRect(),
						r = Math.round(
							(e - n.left) * (this.#n.width / Math.max(1, n.width)),
						),
						i = Math.round(
							(t - n.top) * (this.#n.height / Math.max(1, n.height)),
						),
						a = this.#a++;
					return new Promise((e) => {
						(this.#i.set(a, e),
							this.#e.postMessage({ kind: `window-at`, id: a, x: r, y: i }),
							setTimeout(() => {
								this.#i.delete(a) && e(null);
							}, 2e3));
					});
				}
				describe({ pixels: e = !0 } = {}) {
					let t = this.#a++;
					return new Promise((n) => {
						(this.#i.set(t, n),
							this.#e.postMessage({ kind: `describe`, id: t, pixels: e }),
							setTimeout(() => {
								this.#i.delete(t) && n(null);
							}, 2e3));
					});
				}
				stop() {
					for (let e of this.#r) e();
					this.#r = [];
					try {
						(this.#e.postMessage({ kind: `stop` }), this.#e.terminate());
					} catch {}
					globalThis.__gexCompositor === this &&
						delete globalThis.__gexCompositor;
				}
			}));
	});
function ul(e, t) {
	let n = e?.[W];
	if (!n) throw TypeError(`${t} takes a System as its first argument`);
	return n;
}
function dl(e) {
	if (typeof e == `number` && Number.isInteger(e) && e >= 0 && e < 65) return e;
	let t =
		hl[
			String(e)
				.toUpperCase()
				.replace(/^(?!SIG)/, `SIG`)
		];
	if (t === void 0) throw TypeError(`no signal ${e}`);
	return t;
}
function fl(e) {
	return Object.keys(hl).find((t) => hl[t] === e) ?? `SIG${e}`;
}
function pl(e) {
	return e
		? Array.isArray(e)
			? e.map(String)
			: Object.entries(e).map(([e, t]) => `${e}=${t}`)
		: [];
}
async function ml(e, t = `source`) {
	if (e instanceof Uint8Array) return e;
	if (
		e instanceof ArrayBuffer ||
		(typeof SharedArrayBuffer == `function` && e instanceof SharedArrayBuffer)
	)
		return new Uint8Array(e);
	if (ArrayBuffer.isView(e))
		return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	if (
		(typeof Blob == `function` && e instanceof Blob) ||
		(typeof Response == `function` && e instanceof Response)
	)
		return new Uint8Array(await e.arrayBuffer());
	if (typeof ReadableStream == `function` && e instanceof ReadableStream)
		return new Uint8Array(await new Response(e).arrayBuffer());
	if (e instanceof URL || typeof e == `string`) {
		if (String(e).startsWith(`file:`) && globalThis.process?.versions?.node) {
			let { readFile: t } = await Promise.resolve().then(() => u(N(), 1));
			return new Uint8Array(
				await t(new URL(/* @vite-ignore */ /* webpackIgnore: true */ e)),
			);
		}
		let n = await fetch(e);
		if (!n.ok) throw Error(`${t} ${e}: ${n.status} ${n.statusText}`);
		return new Uint8Array(await n.arrayBuffer());
	}
	throw TypeError(`${t}: not bytes, a Blob, a stream or a URL`);
}
var W,
	hl,
	gl = o(() => {
		((W = Symbol.for(`gex.runtime.internal`)),
			(hl = Object.freeze({
				SIGHUP: 1,
				SIGINT: 2,
				SIGQUIT: 3,
				SIGILL: 4,
				SIGTRAP: 5,
				SIGABRT: 6,
				SIGBUS: 7,
				SIGFPE: 8,
				SIGKILL: 9,
				SIGUSR1: 10,
				SIGSEGV: 11,
				SIGUSR2: 12,
				SIGPIPE: 13,
				SIGALRM: 14,
				SIGTERM: 15,
				SIGCHLD: 17,
				SIGCONT: 18,
				SIGSTOP: 19,
				SIGTSTP: 20,
				SIGTTIN: 21,
				SIGTTOU: 22,
				SIGWINCH: 28,
			})));
	});
function _l(e) {
	if (typeof e == `string`) return vl.encode(e);
	if (e instanceof ArrayBuffer) return new Uint8Array(e.slice(0));
	if (ArrayBuffer.isView(e))
		return new Uint8Array(e.buffer, e.byteOffset, e.byteLength).slice();
	throw TypeError(`write: a string or bytes`);
}
var vl,
	yl,
	bl,
	xl,
	Sl = o(() => {
		(gl(),
			(vl = new TextEncoder()),
			(yl = class extends Event {
				constructor(e) {
					(super(`data`), (this.data = e));
				}
			}),
			(bl = class extends EventTarget {
				#e;
				constructor(e) {
					(super(), (this.#e = e));
				}
				write(e) {
					this.#e.write(_l(e));
				}
				resize(e, t) {
					this.#e.resize(e | 0, t | 0);
				}
			}),
			(xl = class extends EventTarget {
				#e;
				#t = null;
				#n = null;
				#r = 0;
				#i = null;
				#a = null;
				#o;
				#s;
				#c;
				#l;
				#u = [];
				#d = null;
				constructor({
					argv: e,
					stdio: t,
					encoding: n,
					untilExit: r = !1,
					read: i,
					unread: a,
					write: o,
					closeStdin: s,
					resize: c,
					kill: l,
					kick: u,
					release: d,
					windows: f,
				}) {
					if (
						(super(),
						(this.argv = [...e]),
						(this.#e = {
							write: o,
							closeStdin: s,
							resize: c,
							kill: l,
							kick: u,
							release: d,
							windows: f,
						}),
						(this.started = new Promise((e, t) => {
							((this.#o = e), (this.#s = t));
						})),
						(this.exited = new Promise((e, t) => {
							((this.#c = e), (this.#l = t));
						})),
						this.started.catch(() => {}),
						this.exited.catch(() => {}),
						(this.pty = null),
						(this.stdin = this.stdout = this.stderr = null),
						t === `pty`)
					)
						(n && (this.#i = new TextDecoder(n)),
							(this.pty = new bl({ write: o, resize: c })),
							(this.#r = 1));
					else if (t === `pipe`) {
						this.stdin = new WritableStream({
							write: (e) => o(_l(e)),
							close: () => s(),
							abort: () => s(),
						});
						let e = r ? () => this.#n !== null : null,
							t = async (e) => {
								for (; await i(e); );
								(this.#r--, this.#f());
							},
							n = (n) =>
								new ReadableStream(
									{
										pull: async (r) => {
											let a = this.#a ? null : await i(n, e);
											if (a) return r.enqueue(a);
											if (this.#a) return r.error(this.#a);
											if ((r.close(), a === void 0)) return void t(n);
											(this.#r--, this.#f());
										},
										cancel: () => {
											(a(n), this.#r--, this.#f());
										},
									},
									{ highWaterMark: 0 },
								);
						((this.stdout = n(1)), (this.stderr = n(2)), (this.#r = 2));
					}
					let p = this.#e;
					this[W] = {
						started: (e) => {
							((this.#t = e), this.#o(e));
							for (let t of this.#u.splice(0)) p.kill(e, t);
						},
						failed: (e) => {
							let t =
								typeof e == `number`
									? Object.assign(
											Error(
												`${this.argv[0]}: ${e === 2 ? `no such program` : e === 13 ? `permission denied` : e === 8 ? `not a program gex can run` : `could not start (errno ${e})`}`,
											),
											{ errno: e },
										)
									: e;
							((this.#a = t),
								this.#s(t),
								this.#l(t),
								this.dispatchEvent(
									Object.assign(new Event(`error`), { error: t }),
								));
						},
						data: (e) => {
							e
								? this.pty?.dispatchEvent(
										new yl(this.#i ? this.#i.decode(e, { stream: !0 }) : e),
									)
								: (this.#r--, this.#f());
						},
						drained: () =>
							this.#m
								? Promise.resolve()
								: new Promise((e) => {
										let t = this.#d;
										this.#d = () => {
											(t?.(), e());
										};
									}),
						exit: ({ code: e, signal: t, shutdown: n }) => {
							this.#n ||
								((this.#n = { code: e, signal: t ? fl(t) : null }),
								n ? (this.#r = 0) : r && p.kick?.(),
								this.#f());
						},
					};
				}
				#f() {
					this.#n &&
						(this.#p ||
							((this.#p = !0),
							this.#c(this.#n),
							this.dispatchEvent(Object.assign(new Event(`exit`), this.#n))),
						this.#r <= 0 &&
							!this.#m &&
							((this.#m = !0), this.#d?.(), this.#e.release()));
				}
				#p = !1;
				#m = !1;
				get pid() {
					return this.#t;
				}
				kill(e = `SIGTERM`) {
					this.#n ||
						(this.#t === null ? this.#u.push(e) : this.#e.kill(this.#t, e));
				}
				windows() {
					return this.#t === null ? [] : (this.#e.windows?.(this.#t) ?? []);
				}
			}));
	}),
	Cl,
	wl,
	Tl = o(() => {
		((Cl = 2),
			(wl = class {
				#e = null;
				#t = null;
				onActivity = () => {};
				set(e) {
					((this.#e = e),
						`rings` in e && (e.rings = this.#t),
						(e.onActivity = (...e) => this.onActivity(...e)));
				}
				get rings() {
					return this.#t;
				}
				set rings(e) {
					((this.#t = e), this.#e && `rings` in this.#e && (this.#e.rings = e));
				}
				get url() {
					return this.#e?.url ?? null;
				}
				get pageHosts() {
					return this.#e?.pageHosts;
				}
				open() {
					return this.#e ? this.#e.open() : 0;
				}
				connect(e, t, n) {
					this.#e?.connect(e, t, n);
				}
				status(e) {
					return this.#e ? this.#e.status(e) : Cl;
				}
				send(e, t) {
					return this.#e ? this.#e.send(e, t) : -1;
				}
				recv(e, t) {
					return this.#e ? this.#e.recv(e, t) : 0;
				}
				peek(e, t) {
					return this.#e ? this.#e.peek(e, t) : 0;
				}
				available(e) {
					return !this.#e || this.#e.available(e);
				}
				dup(e) {
					return this.#e ? this.#e.dup(e) : 0;
				}
				close(e) {
					this.#e?.close(e);
				}
				refill(e) {
					return this.#e?.refill?.(e) ?? 0;
				}
			}));
	}),
	El,
	Dl = o(() => {
		(gl(),
			(El = class extends EventTarget {
				#e;
				#t = null;
				#n = !1;
				constructor({ read: e, write: t, closeStdin: n, release: r }) {
					(super(),
						(this.#e = { write: t, closeStdin: n, release: r }),
						(this.readable = new ReadableStream(
							{
								start: (e) => {
									this.#t = e;
								},
								pull: async (t) => {
									let n = this.#n ? null : await e();
									if (n) return t.enqueue(n);
									try {
										t.close();
									} catch {}
									this.#r();
								},
								cancel: () => this.close(),
							},
							{ highWaterMark: 0 },
						)),
						(this.writable = new WritableStream({
							write: (e) => {
								t(
									e instanceof Uint8Array
										? e.slice()
										: typeof e == `string`
											? new TextEncoder().encode(e)
											: new Uint8Array(e),
								);
							},
							close: () => n(),
							abort: () => this.close(),
						})),
						(this[W] = {
							exit: () => {
								try {
									this.#t?.close();
								} catch {}
								this.#r();
							},
						}));
				}
				#r() {
					this.#n ||
						((this.#n = !0),
						this.#e.release(),
						this.dispatchEvent(new Event(`close`)));
				}
				close() {
					if (!this.#n) {
						try {
							this.#t?.close();
						} catch {}
						this.#r();
					}
				}
			}));
	});
function Ol(e) {
	if (Number.isInteger(e?.errno) && e.errno !== 0) return -Math.abs(e.errno);
	let t = typeof e?.code == `string` ? e.code : null;
	return t && Ml[t]
		? -Ml[t]
		: e?.name === `NotFoundError`
			? -Ml.ENOENT
			: e?.name === `TypeMismatchError`
				? -Ml.ENOTDIR
				: e?.name === `NoModificationAllowedError` ||
					  e?.name === `NotAllowedError`
					? -Ml.EACCES
					: e?.name === `QuotaExceededError`
						? -Ml.ENOSPC
						: e?.name === `InvalidModificationError`
							? -Ml.ENOTEMPTY
							: -Ml.EIO;
}
function kl(e) {
	let t =
		typeof e?.type == `string`
			? e.type
			: e?.isDirectory?.()
				? `directory`
				: e?.isSymbolicLink?.()
					? `symlink`
					: `file`;
	return Nl[t === `dir` ? `directory` : t] ?? 1;
}
function Al(e, t, n) {
	let r = kl(n),
		i = Number.isInteger(n?.mode) ? n.mode & 4095 : r === 2 ? 493 : 420,
		a =
			n?.mtime instanceof Date
				? n.mtime.getTime()
				: Number(n?.mtimeMs ?? n?.mtime ?? 0);
	(e.setUint32(t, r, !0),
		e.setUint32(t + 4, i, !0),
		e.setBigUint64(
			t + 8,
			BigInt(Math.max(0, Math.floor(Number(n?.size ?? 0)))),
			!0,
		),
		e.setBigInt64(t + 16, BigInt(Math.floor(a / 1e3)), !0));
	let o = Number(n?.ino ?? 0);
	e.setBigUint64(
		t + 24,
		BigInt(Number.isFinite(o) && o > 0 ? Math.floor(o) : 0),
		!0,
	);
}
var G,
	jl,
	Ml,
	Nl,
	Pl,
	Fl,
	Il,
	Ll = o(() => {
		(ht(),
			(G = {
				STAT: 1,
				LSTAT: 2,
				READDIR: 3,
				OPEN: 4,
				READ: 5,
				WRITE: 6,
				CLOSE: 7,
				MKDIR: 8,
				UNLINK: 9,
				RMDIR: 10,
				RENAME: 11,
				TRUNCATE: 12,
				CHMOD: 13,
				UTIMES: 14,
				READLINK: 15,
				SYMLINK: 16,
				HOSTCALL: 17,
				HOSTREAD: 18,
				HOSTDONE: 19,
			}),
			(jl = {
				ACCMODE: 3,
				WRONLY: 1,
				RDWR: 2,
				CREAT: 64,
				EXCL: 128,
				TRUNC: 512,
				APPEND: 1024,
			}),
			(Ml = {
				EPERM: 1,
				ENOENT: 2,
				EIO: 5,
				EBADF: 9,
				EAGAIN: 11,
				ENOMEM: 12,
				EACCES: 13,
				EBUSY: 16,
				EEXIST: 17,
				EXDEV: 18,
				ENODEV: 19,
				ENOTDIR: 20,
				EISDIR: 21,
				EINVAL: 22,
				EFBIG: 27,
				ENOSPC: 28,
				EROFS: 30,
				ENAMETOOLONG: 36,
				ENOSYS: 38,
				ENOTEMPTY: 39,
				ELOOP: 40,
				ENOTSUP: 95,
				EOPNOTSUPP: 95,
				ETIMEDOUT: 110,
			}),
			(Nl = { file: 1, directory: 2, symlink: 3 }),
			(Pl = 32),
			(Fl = (e) => Object.assign(Error(e), { code: e })),
			(Il = class {
				#e;
				#t;
				#n;
				#r = new Map();
				#i = new Map();
				#a = 1;
				#o = 1;
				#s = 0;
				#c = new Map();
				#l = !1;
				#u;
				#d = new Map();
				#f = 1;
				constructor(e) {
					((this.#e = lt()),
						(this.#t = new Int32Array(this.#e)),
						(this.#n = new Uint8Array(this.#e)),
						(this.#u = e),
						this.#p());
				}
				get control() {
					return { ctl: this.#e };
				}
				add(e) {
					let t = this.#o++;
					return (this.#r.set(t, e), this.#p(), t);
				}
				remove(e) {
					this.#r.delete(e);
					for (let [t, n] of this.#i) n.id === e && this.#i.delete(t);
				}
				#p() {
					if (this.#l) return;
					this.#l = !0;
					let e = () => {
						this.#m();
						let t = Atomics.waitAsync(this.#t, 0, this.#s);
						t.async ? t.value.then(e) : queueMicrotask(e);
					};
					e();
				}
				#m() {
					this.#s = Atomics.load(this.#t, 0);
					for (let e = 0; e < 8; e++) {
						let t = (64 + e * pt) / 4;
						Atomics.compareExchange(this.#t, t, 2, 3) === 2 &&
							this.#h(e).catch(() => {});
					}
				}
				async #h(e) {
					let t = (64 + e * pt) / 4,
						n = 64 + e * pt + 16,
						r = this.#t[t + 2],
						i = this.#n.slice(n, n + r),
						a,
						o = null;
					try {
						[a, o] = await this.#g(i);
					} catch (e) {
						((a = Ol(e)), (o = null));
					}
					let s = o ? Math.min(o.length, pt - 16) : 0;
					(s && this.#n.set(o.subarray(0, s), n),
						(this.#t[t + 1] = a),
						(this.#t[t + 3] = s),
						Atomics.store(this.#t, t, 4),
						Atomics.notify(this.#t, t));
				}
				async #g(e) {
					let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
						n = t.getUint32(0, !0),
						r = t.getUint32(4, !0),
						i = t.getUint32(8, !0),
						a = t.getUint32(12, !0),
						o = t.getUint32(16, !0),
						s = t.getUint32(20, !0),
						c = Number(t.getBigUint64(24, !0)),
						l = 32,
						u = () => {
							let n = t.getUint32(l, !0),
								r = new TextDecoder().decode(e.subarray(l + 4, l + 4 + n));
							return ((l += 4 + n), r);
						},
						d = e.length > l ? u() : ``,
						f = e.length > l ? u() : ``,
						p = e.subarray(l);
					if (n === G.HOSTCALL) return this.#v(p);
					if (n === G.HOSTREAD) {
						let e = this.#d.get(i);
						if (!e) throw Fl(`EBADF`);
						let t = e.subarray(c, c + s);
						return [t.length, t];
					}
					if (n === G.HOSTDONE) return (this.#d.delete(i), [0, null]);
					let m =
						n === G.READ || n === G.WRITE || n === G.CLOSE
							? this.#r.get(this.#i.get(i)?.id)
							: this.#r.get(r);
					if (!m) throw Fl(`ENODEV`);
					let h = (e) => {
						let t = new Uint8Array(Pl);
						return (Al(new DataView(t.buffer), 0, e), t);
					};
					switch (n) {
						case G.STAT:
							return [0, h(await m.stat(d))];
						case G.LSTAT:
							return [0, h(await (m.lstat ?? m.stat).call(m, d))];
						case G.READDIR:
							return this.#b(m, r, d, c);
						case G.OPEN:
							return this.#y(m, r, d, a, o);
						case G.READ: {
							let e = this.#i.get(i),
								t = await m.read(e.h, c, s),
								n = t instanceof Uint8Array ? t : new Uint8Array(t ?? []);
							return [Math.min(n.length, s), n];
						}
						case G.WRITE: {
							let e = this.#i.get(i),
								t = await m.write(e.h, c, p.slice());
							return [Number.isInteger(t) ? t : p.length, null];
						}
						case G.CLOSE: {
							let e = this.#i.get(i);
							return (this.#i.delete(i), await m.close?.(e.h), [0, null]);
						}
						case G.MKDIR:
							return (await m.mkdir(d, o & 4095), [0, null]);
						case G.UNLINK:
							return (await m.unlink(d), [0, null]);
						case G.RMDIR:
							return (await (m.rmdir ?? m.unlink).call(m, d), [0, null]);
						case G.RENAME:
							return (await m.rename(d, f), [0, null]);
						case G.TRUNCATE: {
							if (!m.truncate) throw Fl(`EPERM`);
							let e = i === 4294967295 ? void 0 : this.#i.get(i)?.h;
							return (await m.truncate(d, c, e), [0, null]);
						}
						case G.CHMOD:
							return (await m.chmod?.(d, o & 4095), [0, null]);
						case G.UTIMES:
							return (await m.utimes?.(d, new Date(c * 1e3)), [0, null]);
						case G.READLINK:
							if (!m.readlink) throw Fl(`EINVAL`);
							return this.#_(new TextEncoder().encode(await m.readlink(d)));
						case G.SYMLINK:
							if (!m.symlink) throw Fl(`EPERM`);
							return (await m.symlink(d, f), [0, null]);
						default:
							throw Fl(`ENOSYS`);
					}
				}
				#_(e) {
					return [e.length, e];
				}
				async #v(e) {
					let t = e.indexOf(0),
						n = new TextDecoder().decode(e.subarray(0, t < 0 ? e.length : t)),
						r = t < 0 ? `` : new TextDecoder().decode(e.subarray(t + 1)),
						{ ok: i, text: a } = await this.#u(n, r),
						o = new TextEncoder().encode(a),
						s = new Uint8Array(1 + o.length);
					((s[0] = +!i), s.set(o, 1));
					let c = this.#f++,
						l = s.subarray(0, 131072);
					l.length < s.length && this.#d.set(c, s);
					let u = new Uint8Array(4 + l.length);
					return (
						new DataView(u.buffer).setUint32(0, c, !0),
						u.set(l, 4),
						[s.length, u]
					);
				}
				async #y(e, t, n, r, i) {
					let a = null;
					try {
						a = await e.stat(n);
					} catch (e) {
						if (Ol(e) !== -Ml.ENOENT || !(r & jl.CREAT)) throw e;
					}
					if (a && r & jl.CREAT && r & jl.EXCL) throw Fl(`EEXIST`);
					let o = new Uint8Array(36),
						s = new DataView(o.buffer);
					if (a && kl(a) === Nl.directory)
						return (Al(s, 0, a), s.setInt32(Pl, -1, !0), [0, o]);
					let c = r & jl.ACCMODE,
						l = await e.open(n, {
							read: c !== jl.WRONLY,
							write: c === jl.WRONLY || c === jl.RDWR,
							create: !!(r & jl.CREAT),
							truncate: !!(r & jl.TRUNC),
							exclusive: !!(r & jl.EXCL),
							append: !!(r & jl.APPEND),
							mode: i & 4095,
						});
					if (!a || r & jl.TRUNC)
						try {
							a = await e.stat(n);
						} catch {
							a = { type: `file`, size: 0, mode: i & 4095, mtime: Date.now() };
						}
					let u = this.#a++;
					return (
						this.#i.set(u, { id: t, h: l }),
						Al(s, 0, a),
						s.setInt32(Pl, u, !0),
						[0, o]
					);
				}
				async #b(e, t, n, r) {
					let i = `${t}:${n}`,
						a = r > 0 ? this.#c.get(i) : null;
					if (!a) {
						let t = await e.readdir(n);
						a = [];
						for (let r of t)
							if (typeof r == `string`) {
								let t = Nl.file;
								try {
									t = kl(
										(await e.lstat?.(`${n.replace(/\/$/, ``)}/${r}`)) ??
											(await e.stat(`${n.replace(/\/$/, ``)}/${r}`)),
									);
								} catch {}
								a.push([r, t]);
							} else a.push([r.name, kl(r)]);
						((a = a.filter(([e]) => e && e !== `.` && e !== `..`)),
							this.#c.set(i, a));
					}
					let o = new Uint8Array(pt - 16),
						s = 0,
						c = 0,
						l = new TextEncoder();
					for (let e = r; e < a.length; e++) {
						let t = l.encode(a[e][0]);
						if (s + 3 + t.length > o.length) break;
						((o[s] = a[e][1]),
							(o[s + 1] = t.length & 255),
							(o[s + 2] = t.length >> 8),
							o.set(t, s + 3),
							(s += 3 + t.length),
							c++);
					}
					return (c === 0 && this.#c.delete(i), [c, o.subarray(0, s)]);
				}
			}));
	});
function K(e, t) {
	let n = zl[-e] ?? `errno ${-e}`;
	return Object.assign(Error(`${n}: ${t}`), { code: n, errno: -e });
}
async function Rl() {
	if (typeof Worker == `function`)
		return new Worker(
			new URL("./kernel-worker-Bwb1m5if.mjs", import.meta.url),
			{ type: "module", name: "gex-kernel" },
		);
	let { Worker: e } = await Promise.resolve().then(() => u(N(), 1));
	return new e(
		new URL(
			/* @vite-ignore */ /* webpackIgnore: true */ import.meta.url.replace(
				/[^/]*$/,
				`kernel-worker.js`,
			),
		),
	);
}
var zl,
	Bl,
	Vl = o(() => {
		((zl = {
			1: `EPERM`,
			2: `ENOENT`,
			9: `EBADF`,
			11: `EAGAIN`,
			13: `EACCES`,
			17: `EEXIST`,
			18: `EXDEV`,
			20: `ENOTDIR`,
			21: `EISDIR`,
			22: `EINVAL`,
			28: `ENOSPC`,
			36: `ENAMETOOLONG`,
			39: `ENOTEMPTY`,
			40: `ELOOP`,
			111: `ECONNREFUSED`,
		}),
			(Bl = class e {
				#e;
				#t = 1;
				#n = new Map();
				#r;
				#i = new Set();
				#a = null;
				#o = !1;
				#s = -1;
				#c = 0;
				#l = new Set();
				#u = [];
				#d = !1;
				static async start(t) {
					let n = new e(await Rl(), t.memory);
					return ((n.#i = new Set(await n.#p(`start`, { spec: t }))), n);
				}
				has(e) {
					return this.#i.has(e);
				}
				constructor(e, t) {
					((this.#e = e), (this.#r = t));
					let n = (e) => {
							let t = this.#n.get(e?.call);
							t &&
								(this.#n.delete(e.call),
								e.error
									? t.reject(
											Object.assign(Error(e.error.message), {
												workerStack: e.error.stack,
											}),
										)
									: t.resolve(e.value));
						},
						r = (e) =>
							this.#f(Error(`the kernel Worker failed: ${e?.message ?? e}`));
					e.addEventListener
						? (e.addEventListener(`message`, (e) => n(e.data)),
							e.addEventListener(`error`, r))
						: (e.on(`message`, n), e.on(`error`, r));
				}
				#f(e) {
					for (let t of this.#n.values()) t.reject(e);
					this.#n.clear();
				}
				#p(e, t) {
					if (this.#o) return Promise.reject(Error(`the kernel is stopped`));
					let n = this.#t++;
					return new Promise((r, i) => {
						(this.#n.set(n, { resolve: r, reject: i }),
							this.#e.postMessage({ call: n, op: e, ...t }));
					});
				}
				calls(e) {
					for (let t of e)
						for (let e of t.a ?? []) {
							let t = e?.in ?? e?.ptr;
							t instanceof Uint8Array &&
								t.byteLength !== t.buffer.byteLength &&
								!(t.buffer instanceof SharedArrayBuffer) &&
								(e.in === void 0 ? (e.ptr = t.slice()) : (e.in = t.slice()));
						}
					if (!this.#a) {
						let e = (this.#a = { groups: [], done: [] });
						queueMicrotask(() => {
							((this.#a = null),
								this.#p(`calls`, { groups: e.groups }).then(
									(t) => e.done.forEach(([e], n) => e(t[n])),
									(t) => e.done.forEach(([, e]) => e(t)),
								));
						});
					}
					let t = this.#a;
					return (t.groups.push(e), new Promise((e, n) => t.done.push([e, n])));
				}
				async call(e, ...t) {
					return (await this.calls([{ f: e, a: t }]))[0];
				}
				async r(e, ...t) {
					return (await this.call(e, ...t)).r;
				}
				words() {
					return new Int32Array(this.#r.buffer);
				}
				async watch(e) {
					if (!(!e || this.#l.has(e))) {
						if ((this.#l.add(e), this.#s < 0)) {
							let [{ r: e }, { r: t }] = await this.calls([
								{ f: `k_ws_alloc` },
								{ f: `k_ws_addr`, a: [{ ref: 0 }] },
							]);
							if (e < 0)
								throw Error(
									`the runtime found no free wait slot in the kernel`,
								);
							((this.#s = e), (this.#c = (t >>> 0) >>> 2));
						}
						await this.r(`k_wq_add`, e, this.#s);
					}
				}
				async unwatch(e) {
					!this.#l.delete(e) ||
						this.#o ||
						(await this.r(`k_wq_del`, e, this.#s).catch(() => {}));
				}
				seq() {
					return this.#s < 0 ? 0 : Atomics.load(this.words(), this.#c);
				}
				changed(e) {
					return this.#o || this.seq() !== e
						? Promise.resolve()
						: new Promise((t) => {
								(this.#u.push([e, t]), this.#m());
							});
				}
				async #m() {
					if (!this.#d) {
						for (this.#d = !0; this.#u.length && !this.#o; ) {
							let e = this.seq(),
								t = this.#u.filter(([t, n]) => t === e || void n());
							if (((this.#u = t), !t.length)) break;
							let n = Atomics.waitAsync(this.words(), this.#c, e, 3e4);
							n.async &&
								(await n.value) === `timed-out` &&
								this.#u.splice(0).forEach(([, e]) => e());
						}
						this.#d = !1;
					}
				}
				kick() {
					this.#u.splice(0).forEach(([, e]) => e());
				}
				terminate() {
					((this.#o = !0),
						this.#e.terminate(),
						this.#f(Error(`the kernel is stopped`)),
						this.#u.splice(0).forEach(([, e]) => e()));
				}
			}));
	});
async function Hl(e, t, n) {
	let r = [],
		i = 0,
		a = async () => {
			if (!r.length) return;
			let t = await e.calls(r);
			(n && t.forEach((e, t) => n(e.r, r[t])), (r = []), (i = 0));
		};
	for (let e of t) {
		let t = (e.a ?? []).reduce((e, t) => e + (t?.in?.length ?? 0), 0);
		(i + t > iu && (await a()), r.push(e), (i += t));
	}
	await a();
}
function Ul(e, t) {
	if (e.length === 1 && e[0].length === t) return e[0];
	let n = new Uint8Array(t),
		r = 0;
	for (let i of e)
		(n.set(i.subarray(0, Math.min(i.length, t - r)), r), (r += i.length));
	return n;
}
function Wl(e) {
	let t = new DataView(e.buffer, e.byteOffset, tu),
		n = t.getUint32(4, !0);
	return {
		type: ru[t.getUint32(0, !0)] ?? `file`,
		mode: n & 4095,
		size: Number(t.getBigUint64(8, !0)),
		ino: Number(t.getBigUint64(16, !0)),
		mtime:
			Number(t.getBigInt64(24, !0)) * 1e3 +
			Math.floor(t.getUint32(36, !0) / 1e6),
		nlink: t.getUint32(32, !0),
	};
}
var Gl,
	Kl,
	ql,
	Jl,
	Yl,
	Xl,
	Zl,
	Ql,
	$l,
	eu,
	tu,
	nu,
	ru,
	iu,
	au,
	ou = o(() => {
		(Vl(),
			(Gl = new TextEncoder()),
			(Kl = new TextDecoder()),
			(ql = -34),
			(Jl = 128),
			(Yl = 512),
			(Xl = 1024),
			(Zl = 65536),
			(Ql = 131072),
			($l = 4 << 20),
			(eu = 16 << 20),
			(tu = 72),
			(nu = 1),
			(ru = [`file`, `directory`, `symlink`, `chardev`, `fifo`, `socket`]),
			(iu = 32 << 20),
			(au = class {
				#e;
				constructor(e) {
					this.#e = e;
				}
				async real(e, t = !0) {
					let {
						r: n,
						out: [r],
					} = await this.#e.call(`k_fs_walk`, { in: e }, { in: `` }, +!!t, {
						out: 4096,
					});
					if (n < 0) return e;
					let i = Kl.decode(r.subarray(0, n & ((1 << 30) - 1)));
					return i.startsWith(`/`) ? i : `/${i}`;
				}
				async open(e, t = 0, n = 0) {
					let r = await this.#e.r(
						`k_fs_open`,
						{ in: await this.real(e, !(t & Ql)) },
						BigInt(t),
						n,
					);
					if (r < 0) throw K(r, e);
					return r;
				}
				async stat(e, t = !0) {
					let {
						r: n,
						out: [r],
					} = await this.#e.call(
						`k_fs_path_meta`,
						{ in: await this.real(e, t) },
						{ outPtr: tu },
					);
					if (n < 0) throw K(n, e);
					return Wl(r);
				}
				async readFile(e) {
					let t = await this.open(e, 0);
					try {
						let n = [],
							r = 0;
						for (;;) {
							let {
								r: i,
								out: [a],
							} = await this.#e.call(`k_fs_read`, t, BigInt(r), { out: $l });
							if (i < 0) throw K(i, e);
							if (i === 0) break;
							(n.push(a), (r += i));
						}
						return Ul(n, r);
					} finally {
						await this.#e.r(`k_fs_close`, t);
					}
				}
				async writeFile(
					e,
					t,
					{ mode: n = 420, append: r = !1, exclusive: i = !1 } = {},
				) {
					let a = typeof t == `string` ? Gl.encode(t) : new Uint8Array(t),
						o = 65 | (r ? Xl : Yl) | (i ? Jl : 0),
						s = await this.open(e, o, n);
					try {
						let t = r ? (await this.stat(e)).size : 0,
							n = [];
						for (let e = 0; e < a.length; e += $l) {
							let r = a.subarray(e, e + $l);
							n.push({ f: `k_fs_write`, a: [s, BigInt(t + e), { in: r }] });
						}
						(n.push({
							f: `k_fs_touch`,
							a: [s, BigInt(Math.floor(Date.now() / 1e3))],
						}),
							await Hl(this.#e, n, (t, n) => {
								if (n.f === `k_fs_write` && t < 0) throw K(t, e);
							}));
					} finally {
						await this.#e.r(`k_fs_close`, s);
					}
				}
				async readdir(e) {
					let t = await this.open(e, Zl);
					try {
						for (let n = 65536; ; n *= 4) {
							let {
								r,
								out: [i],
							} = await this.#e.call(`k_fs_read_dir`, t, { out: n });
							if (r === ql) continue;
							if (r < 0) throw K(r, e);
							let a = new DataView(i.buffer, i.byteOffset, i.length),
								o = [];
							for (let e = 0; e + 16 <= r; ) {
								let t = a.getUint32(e, !0),
									n = Kl.decode(i.subarray(e + 16, e + 16 + t));
								(n !== `.` &&
									n !== `..` &&
									o.push({
										name: n,
										type: ru[a.getUint32(e + 4, !0)] ?? `file`,
									}),
									(e += 16 + t));
							}
							return o;
						}
					} finally {
						await this.#e.r(`k_fs_close`, t);
					}
				}
				async mkdir(e, { recursive: t = !1, mode: n = 493 } = {}) {
					if (!t) {
						let t = await this.#e.r(`k_fs_mkdir`, { in: e }, n);
						if (t < 0) throw K(t, e);
						return;
					}
					let r = [],
						i = ``;
					for (let t of e.split(`/`).filter(Boolean))
						((i += `/${t}`), r.push({ f: `k_fs_mkdir`, a: [{ in: i }, n] }));
					(await this.#e.calls(r)).forEach(({ r: e }, t) => {
						if (e < 0 && e !== -17) throw K(e, r[t].a[0].in);
					});
				}
				async rm(e, { recursive: t = !1, force: n = !1 } = {}) {
					let r;
					try {
						r = await this.stat(e, !1);
					} catch (e) {
						if (n && e.errno === 2) return;
						throw e;
					}
					if (r.type === `directory`) {
						if (t)
							for (let { name: r } of await this.readdir(e))
								await this.rm(`${e.replace(/\/+$/, ``)}/${r}`, {
									recursive: t,
									force: n,
								});
						let r = await this.#e.r(`k_fs_rmdir`, { in: e });
						if (r < 0) throw K(r, e);
						return;
					}
					let i = await this.#e.r(`k_fs_unlink`, { in: e });
					if (i < 0 && !(n && i === -2)) throw K(i, e);
				}
				async rename(e, t) {
					let n = await this.#e.r(`k_fs_rename`, { in: e }, { in: t }, 0);
					if (n < 0) throw K(n, `${e} -> ${t}`);
				}
				async symlink(e, t) {
					let n = await this.#e.r(`k_fs_symlink`, { in: e }, { in: t });
					if (n < 0) throw K(n, t);
				}
				async readlink(e) {
					let {
						r: t,
						out: [n],
					} = await this.#e.call(`k_fs_read_link`, { in: e }, { out: 4096 });
					if (t < 0) throw K(t, e);
					return Kl.decode(n);
				}
				async chmod(e, t) {
					let n = await this.#e.r(`k_fs_chmod`, { in: await this.real(e) }, t);
					if (n < 0) throw K(n, e);
				}
				async lay({
					tar: e,
					at: t = `/`,
					files: n = {},
					modes: r = {},
					lazy: i = [],
				}) {
					let a = this.#e,
						o = 0;
					if (e) {
						let n = await a.r(`k_fs_tar_open`, { in: t }),
							r = [];
						for (let t = 0; t < e.length; t += eu)
							r.push({
								f: `k_fs_tar_feed`,
								a: [n, { in: e.subarray(t, t + eu) }],
							});
						(await Hl(a, r), (o += await a.r(`k_fs_tar_close`, n)));
					}
					let s = [];
					for (let [e, t] of Object.entries(n)) {
						let n = typeof t == `string` ? Gl.encode(t) : t;
						s.push({
							f: `k_fs_add`,
							a: [{ in: e }, { in: n.subarray(0, eu) }],
						});
						for (let t = eu; t < n.length; t += eu)
							s.push({
								f: `k_fs_add_part`,
								a: [{ in: e }, BigInt(t), { in: n.subarray(t, t + eu) }],
							});
						(r[e] !== void 0 &&
							s.push({ f: `k_fs_chmod`, a: [{ in: e }, r[e]] }),
							o++);
					}
					for (let [e, t, n, r] of i)
						(s.push(
							{ f: `k_fs_unlink`, a: [{ in: e }] },
							{ f: `k_fs_add_lazy`, a: [{ in: e }, { in: n }, BigInt(t)] },
						),
							r !== void 0 && s.push({ f: `k_fs_chmod`, a: [{ in: e }, r] }),
							o++);
					return (
						await Hl(a, s, (e, t) => {
							if ((t.f === `k_fs_add` || t.f === `k_fs_add_lazy`) && e < 0)
								throw K(e, t.a[0].in);
						}),
						o
					);
				}
				async layImage({
					files: e = {},
					modes: t = {},
					dirs: n = [],
					lazy: r = [],
					hard: i = {},
					symlinks: a = {},
					mtimes: o,
					xattrs: s,
				}) {
					let c = this.#e,
						l = [];
					for (let e of n) l.push({ f: `k_fs_add_dir`, a: [{ in: e }, 493] });
					let u = 0;
					for (let [n, r] of Object.entries(e)) {
						let e = typeof r == `string` ? Gl.encode(r) : r;
						l.push({
							f: `k_fs_add`,
							a: [{ in: n }, { in: e.subarray(0, eu) }],
						});
						for (let t = eu; t < e.length; t += eu)
							l.push({
								f: `k_fs_add_part`,
								a: [{ in: n }, BigInt(t), { in: e.subarray(t, t + eu) }],
							});
						(t[n] !== void 0 &&
							l.push({ f: `k_fs_chmod`, a: [{ in: n }, t[n]] }),
							u++);
					}
					for (let e of n)
						t[e] !== void 0 &&
							l.push({ f: `k_fs_chmod`, a: [{ in: e }, t[e]] });
					for (let [n, i, a, o] of r)
						(e[n] !== void 0 && !(o && e[n].length === o)) ||
							(l.push({
								f: `k_fs_add_lazy`,
								a: [{ in: n }, { in: a }, BigInt(i)],
							}),
							t[n] !== void 0 &&
								l.push({ f: `k_fs_chmod`, a: [{ in: n }, t[n]] }),
							u++);
					await Hl(c, l.splice(0), (e, t) => {
						if ((t.f === `k_fs_add` || t.f === `k_fs_add_lazy`) && e < 0)
							throw K(e, t.a[0].in);
					});
					let d = [];
					await Hl(
						c,
						Object.entries(i).map(([e, t]) => ({
							f: `k_fs_link`,
							a: [{ in: t }, { in: e }],
							p: e,
							target: t,
						})),
						(t, n) => {
							t < 0 && e[n.target] !== void 0 && d.push(n);
						},
					);
					for (let { p: t, target: n } of d) {
						let r = e[n];
						l.push({
							f: `k_fs_add`,
							a: [{ in: t }, { in: r.subarray(0, eu) }],
						});
						for (let e = eu; e < r.length; e += eu)
							l.push({
								f: `k_fs_add_part`,
								a: [{ in: t }, BigInt(e), { in: r.subarray(e, e + eu) }],
							});
					}
					for (let [e, n] of Object.entries(i))
						t[n] !== void 0 &&
							l.push({ f: `k_fs_chmod`, a: [{ in: e }, t[n]] });
					for (let [e, t] of Object.entries(a))
						l.push({ f: `k_fs_symlink`, a: [{ in: t }, { in: e }] });
					for (let [e, t] of Object.entries(o ?? {}))
						l.push({
							f: `k_fs_set_mtime`,
							a: [{ in: e }, BigInt(Math.trunc(t))],
						});
					for (let [e, t] of Object.entries(s ?? {}))
						for (let [n, r] of Object.entries(t)) {
							let t = r instanceof Uint8Array ? r : Gl.encode(String(r));
							l.push({
								f: `k_fs_xattr`,
								a: [-1, { in: e }, nu, { in: n }, { in: t }, 0],
							});
						}
					return (
						await Hl(c, l, (e, t) => {
							if (t.f === `k_fs_add` && e < 0) throw K(e, t.a[0].in);
						}),
						u
					);
				}
				async restore(e) {
					for (let t of e)
						t.kind === `gone` &&
							(await this.rm(t.path, { recursive: !0, force: !0 }));
					let t = [];
					for (let n of e
						.filter((e) => e.kind !== `gone`)
						.sort((e, t) => e.path.length - t.path.length)) {
						let e = { in: n.path };
						n.kind === `file`
							? (t.push(
									{
										f: `k_fs_add`,
										a: [
											e,
											{
												in:
													n.data instanceof Uint8Array
														? n.data
														: new Uint8Array(n.data ?? []),
											},
										],
									},
									{ f: `k_fs_chmod`, a: [e, n.mode ?? 420] },
								),
								n.mtime &&
									t.push({
										f: `k_fs_set_mtime`,
										a: [e, BigInt(Math.trunc(n.mtime))],
									}))
							: n.kind === `dir`
								? t.push(
										{ f: `k_fs_add_dir`, a: [e, n.mode ?? 493] },
										{ f: `k_fs_chmod`, a: [e, n.mode ?? 493] },
									)
								: n.kind === `symlink`
									? t.push(
											{ f: `k_fs_unlink`, a: [e] },
											{ f: `k_fs_symlink`, a: [{ in: n.target }, e] },
										)
									: n.kind === `mode` &&
										t.push({ f: `k_fs_chmod`, a: [e, n.mode] });
					}
					await Hl(this.#e, t);
				}
				async readRaw(e, t) {
					let n = await this.#e.r(`k_fs_open`, { in: e }, 0n, 0);
					if (n < 0) return null;
					try {
						let e = [];
						for (let r = 0; r < t; r += $l)
							e.push({
								f: `k_fs_read`,
								a: [n, BigInt(r), { out: Math.min($l, t - r) }],
								stop: !0,
							});
						let r = [],
							i = 0;
						for (let t = 0; t < e.length; t += 8)
							for (let {
								r: n,
								out: [a],
							} of await this.#e.calls(e.slice(t, t + 8))) {
								if (n <= 0) return Ul(r, i);
								(r.push(a), (i += n));
							}
						return Ul(r, i);
					} finally {
						await this.#e.r(`k_fs_close`, n);
					}
				}
				async mount(e, t) {
					let n = await this.#e.r(`k_pagefs_mount`, { in: e }, t);
					if (n < 0) throw K(n, `mounting ${e}`);
				}
				async unmount(e) {
					let t = await this.#e.r(`k_pagefs_unmount`, { in: e });
					if (t < 0) throw K(t, `unmounting ${e}`);
				}
			}));
	}),
	su,
	cu,
	lu,
	uu,
	du,
	fu,
	q,
	pu,
	mu,
	hu,
	gu = o(() => {
		(Vl(),
			(su = new TextEncoder()),
			(cu = new TextDecoder()),
			(lu = -11),
			(uu = 1),
			(du = 0),
			(fu = 1 << 18),
			(q = {
				MODIFY: 2,
				ATTRIB: 4,
				CLOSE_WRITE: 8,
				MOVED_FROM: 64,
				MOVED_TO: 128,
				CREATE: 256,
				DELETE: 512,
				DELETE_SELF: 1024,
				MOVE_SELF: 2048,
				IGNORED: 32768,
			}),
			(pu =
				q.ATTRIB |
				q.CLOSE_WRITE |
				q.MOVED_FROM |
				q.MOVED_TO |
				q.CREATE |
				q.DELETE |
				q.DELETE_SELF |
				q.MOVE_SELF),
			(mu = (e, t) => (BigInt(t & 65535) << 48n) | (BigInt(e & 65535) << 32n)),
			(hu = class {
				#e;
				#t;
				#n;
				#r = new Map();
				#i = new Map();
				#a = new Map();
				#o = 1;
				constructor(e, t, n) {
					((this.#e = e), (this.#t = t), (this.#n = n));
				}
				async start({ init: e }) {
					let t = [];
					(e ||
						t.push(
							{ f: `k_init_virtual`, a: [1] },
							{
								f: `k_proc_set_info`,
								a: [
									uu,
									{
										in: `init
init\0`,
									},
								],
							},
						),
						t.push({ f: `k_proc_queue`, a: [uu] }));
					let n = await this.#e.calls(t),
						r = n[n.length - 1].r;
					(await this.#e.watch(r),
						this.#s(
							e
								? { f: `k_wait`, a: [0, uu, 0] }
								: { f: `k_wait`, a: [uu, -1, 0] },
						));
				}
				async #s(e) {
					let t = this.#e;
					for (;;) {
						let n = t.seq(),
							r;
						try {
							r = await t.calls([e, e, e, e]);
						} catch {
							return;
						}
						let i = r.filter(({ r: e }) => e);
						for (let { r: e } of i)
							await this.#c(Number(e >> 32n), Number(e & 4294967295n));
						i.length || (await t.changed(n));
					}
				}
				async #c(e, t) {
					let n = this.#i.get(e);
					this.#i.delete(e);
					let r = n === void 0 ? null : await this.#r.get(n);
					if (r?.reading) {
						let e = new Promise((e) => {
							r.flushed = e;
						});
						(this.#e.kick(), await e);
					}
					let i = t & 127;
					this.#n.exit({
						pid: e,
						code: i ? 128 + i : (t >> 8) & 255,
						signal: i,
					});
				}
				spawn(e) {
					let t = this.#l(e);
					return (
						this.#r.set(
							e.h,
							t.then(
								(e) => e.ends ?? null,
								() => null,
							),
						),
						t.then(({ ends: e, ...t }) => t)
					);
				}
				async #l({
					h: e,
					argv: t,
					env: n = [],
					cwd: r = ``,
					stdio: i = `pipe`,
					cols: a = 80,
					rows: o = 24,
					init: s = !1,
				}) {
					let c = this.#e,
						l = su.encode(
							[i, a, o, +!!s, r, t.length, ...t, n.length, ...n]
								.map((e) => `${e}\0`)
								.join(``),
						),
						{
							r: u,
							out: [d],
						} = await c.call(
							`k_page_spawn`,
							{ in: l },
							{ out: l.length + 16384 },
						);
					if (u < 0) return { error: -u };
					let f = new DataView(d.buffer, d.byteOffset, d.length),
						p = (e) => f.getInt32(e * 4, !0),
						m = {
							h: e,
							pid: p(0),
							pty: p(1),
							stdin: p(2),
							stdout: p(3),
							stderr: p(4),
							sock: -1,
						};
					m.queues =
						m.pty >= 0 ? [p(5)] : m.stdin >= 0 ? [p(5), p(6), p(7)] : [];
					for (let e of m.queues) await c.watch(e);
					(this.#i.set(m.pid, e), m.pty >= 0 && this.#u(m));
					let h = p(8)
							? [Number(f.getBigUint64(48, !0)), Number(f.getBigUint64(56, !0))]
							: null,
						g = d.slice(64, 64 + p(9)),
						_ = d.slice(64 + p(9), 64 + p(9) + p(10));
					return {
						pid: m.pid,
						exec: g,
						fds: _,
						cwd: r || `/`,
						wasmImage: h,
						ends: m,
					};
				}
				async abandon(e) {
					await this.#e.calls([
						{ f: `k_pipe_forget`, a: [e] },
						{ f: `k_pty_forget`, a: [e] },
						{ f: `k_exit`, a: [e, 127] },
					]);
				}
				async connectGuest(e, t) {
					let n = (async () => {
						let n = await this.#e.r(`k_sock_connect`, { in: `\0gex-tcp:${t}` });
						if (n < 0) throw K(n === -2 ? -111 : n, `127.0.0.1:${t}`);
						let r = await this.#e.r(`k_sock_queue`, n);
						return (
							await this.#e.watch(r),
							{
								h: e,
								pid: 0,
								pty: -1,
								stdin: -1,
								stdout: -1,
								stderr: -1,
								sock: n,
								queues: [r],
							}
						);
					})();
					(this.#r.set(
						e,
						n.catch(() => null),
					),
						await n);
				}
				async read(e, t = 1, n = null) {
					let r = await this.#r.get(e),
						i = r ? (r.sock >= 0 ? r.sock : t === 2 ? r.stderr : r.stdout) : -1;
					if (i < 0) return null;
					let a = r.sock >= 0 ? `k_sock_read` : `k_pipe_read`;
					for (let e = this.#e; ; ) {
						let o = e.seq(),
							{ r: s, out: c } = await e
								.call(a, i, { out: fu })
								.catch(() => ({ r: -9 }));
						if (s > 0) return c[0];
						if (s === lu) {
							if (n?.()) return;
							await e.changed(o);
							continue;
						}
						return (
							r.sock < 0 && (await this.#d(r, t === 2 ? `stderr` : `stdout`)),
							null
						);
					}
				}
				kick() {
					this.#e.kick();
				}
				async unread(e, t) {
					let n = await this.#r.get(e);
					n?.sock < 0 && (await this.#d(n, t === 2 ? `stderr` : `stdout`));
				}
				async write(e, t) {
					let n = await this.#r.get(e);
					if (!n) return;
					let r = this.#e;
					if (n.pty >= 0) {
						await r.r(`k_pty_write`, n.pty, 1, { in: t }).catch(() => {});
						return;
					}
					let i = n.sock >= 0 ? n.sock : n.stdin,
						a = n.sock >= 0 ? `k_sock_write` : `k_pipe_write`;
					for (let e = t; e.length && i >= 0; ) {
						let t = r.seq(),
							n = await r.r(a, i, { in: e.subarray(0, fu) }).catch(() => -9);
						if (n === lu || n === 0) await r.changed(t);
						else if (n < 0) return;
						else e = e.subarray(n);
					}
				}
				async closeStdin(e) {
					let t = await this.#r.get(e);
					t?.sock >= 0
						? await this.#e.r(`k_sock_shutdown`, t.sock, 1).catch(() => {})
						: t && (await this.#d(t, `stdin`));
				}
				async #u(e) {
					let t = this.#e;
					for (e.reading = !0; ; ) {
						let n = t.seq(),
							r = e.flushed,
							{ r: i, out: a } = await t
								.call(`k_pty_read`, e.pty, 1, { out: fu })
								.catch(() => ({ r: -9 }));
						if (i > 0) {
							this.#n.data(e.h, a[0]);
							continue;
						}
						if ((r && ((e.flushed = null), r()), i === lu)) {
							await t.changed(n);
							continue;
						}
						((e.reading = !1),
							e.flushed?.(),
							await t.unwatch(e.queues[0]),
							this.#n.end(e.h));
						return;
					}
				}
				async resize(e, t, n) {
					let r = await this.#r.get(e);
					r?.pty >= 0 &&
						(await this.#e.r(`k_pty_set_winsize`, r.pty, mu(t, n)));
				}
				async kill(e, t) {
					let n = await this.#e.r(`k_kill`, uu, e, t);
					if (n < 0 && n !== -3) throw K(n, `kill ${e}`);
				}
				async release(e) {
					let t = await this.#r.get(e);
					if ((this.#r.delete(e), t)) {
						(t.sock >= 0 &&
							(await this.#e.unwatch(t.queues[0]),
							await this.#e.r(`k_sock_close`, t.sock),
							(t.sock = -1)),
							t.pty >= 0 &&
								(t.reading && (await this.#e.unwatch(t.queues[0])),
								await this.#e.r(`k_pty_close_end`, t.pty, 1, du),
								(t.pty = -1)));
						for (let e of [`stdin`, `stdout`, `stderr`]) await this.#d(t, e);
					}
				}
				async #d(e, t) {
					let n = e[t];
					if (n < 0) return;
					e[t] = -1;
					let r = [`stdin`, `stdout`, `stderr`].indexOf(t);
					(await this.#e.unwatch(e.queues[r]),
						await this.#e
							.r(`k_pipe_close_end`, n, +(t === `stdin`), du)
							.catch(() => {}));
				}
				async addWatch(e) {
					let t = this.#e,
						n = await t.r(`k_inotify_create`);
					if (n < 0) throw K(n, `inotify`);
					let [{ r }, { r: i }] = await t.calls([
						{
							f: `k_inotify_add_watch`,
							a: [n, { in: await this.#t.real(e) }, pu],
						},
						{ f: `k_inotify_queue`, a: [n] },
					]);
					if (r < 0) throw (await t.r(`k_inotify_close`, n), K(r, e));
					await t.watch(i);
					let a = this.#o++,
						o = { id: n, queue: i, open: !0 };
					return (
						this.#a.set(a, o),
						(async () => {
							for (; o.open; ) {
								let e = t.seq(),
									{ r, out: i } = await t
										.call(`k_inotify_read`, n, { out: 65536 })
										.catch(() => ({ r: -9 }));
								if (r > 0) this.#f(a, i[0]) && (await this.rmWatch(a));
								else if (r === lu || r === 0) await t.changed(e);
								else return;
							}
						})(),
						a
					);
				}
				async rmWatch(e) {
					let t = this.#a.get(e);
					t &&
						(this.#a.delete(e),
						(t.open = !1),
						await this.#e.unwatch(t.queue),
						await this.#e.r(`k_inotify_close`, t.id).catch(() => {}));
				}
				#f(e, t) {
					let n = new DataView(t.buffer, t.byteOffset, t.length),
						r = !1;
					for (let i = 0; i + 16 <= t.length; ) {
						let a = n.getUint32(i + 4, !0),
							o = n.getUint32(i + 8, !0),
							s = n.getUint32(i + 12, !0),
							c = t.subarray(i + 16, i + 16 + s),
							l = c.indexOf(0),
							u = cu.decode(l < 0 ? c : c.subarray(0, l));
						i += 16 + s;
						let d =
							a & q.CREATE
								? `create`
								: a & q.CLOSE_WRITE
									? `change`
									: a & q.ATTRIB
										? `attrib`
										: a & q.DELETE
											? `delete`
											: a & q.MOVED_FROM
												? `move-out`
												: a & q.MOVED_TO
													? `move-in`
													: a & (q.DELETE_SELF | q.MOVE_SELF | q.IGNORED)
														? `gone`
														: null;
						!d ||
							r ||
							(this.#n.watch({ h: e, type: d, name: u, cookie: o }),
							(r = d === `gone`));
					}
					return r;
				}
				async holdX() {
					let e = this.#e,
						t = [`\0/tmp/.X11-unix/X0`, `/tmp/.X11-unix/X0`].map((e) => ({
							f: `k_sock_bind`,
							a: [{ in: e }],
						})),
						n = (await e.calls(t)).map(({ r: e }, n) => {
							if (e < 0)
								throw K(e, `X display :0 (${JSON.stringify(t[n].a[0].in)})`);
							return e;
						}),
						r = (
							await e.calls(n.map((e) => ({ f: `k_sock_queue`, a: [e] })))
						).map((e) => e.r);
					for (let t of r) await e.watch(t);
					return (
						(async () => {
							for (;;) {
								let t = e.seq(),
									r = await e
										.calls(n.map((e) => ({ f: `k_sock_pending`, a: [e] })))
										.catch(() => null);
								if (!r) return;
								if (r.some(({ r: e }) => e > 0)) break;
								await e.changed(t);
							}
							for (let t of r) await e.unwatch(t);
							this.#n.xWanted();
						})(),
						n
					);
				}
			}));
	});
function _u(e) {
	let t = 2166136261,
		n = new Uint32Array(
			e.buffer,
			e.byteOffset,
			e.byteOffset % 4 ? 0 : e.length >>> 2,
		);
	for (let e = 0; e < n.length; e++) t = Math.imul(t ^ n[e], 16777619);
	for (let r = n.length * 4; r < e.length; r++)
		t = Math.imul(t ^ e[r], 16777619);
	return (t >>> 0).toString(16);
}
var vu,
	yu,
	bu,
	xu,
	Su,
	Cu,
	wu,
	Tu = o(() => {
		(Vl(),
			(vu = new TextDecoder()),
			(yu = -34),
			(bu = 40),
			(xu = [`file`, `dir`, `symlink`, `socket`]),
			(Su = (e, t) => e === t || e.startsWith(t === `/` ? `/` : `${t}/`)),
			(Cu = (e) => e.replace(/\/[^/]*$/, ``) || `/`),
			(wu = class {
				#e;
				#t;
				#n = null;
				#r = new Map();
				#i = new Map();
				#a = [];
				#o = 0;
				constructor(e, t) {
					((this.#e = e), (this.#t = t));
				}
				async #s() {
					for (let e = 1 << 20; ; ) {
						let {
							r: t,
							out: [n],
						} = await this.#e.call(`k_fs_tree`, { out: e });
						if (t === yu) {
							e = new DataView(n.buffer, n.byteOffset).getUint32(0, !0) + 65536;
							continue;
						}
						if (t < 0) throw K(t, `the tree`);
						let r = new DataView(n.buffer, n.byteOffset, n.length),
							i = new Map();
						for (let e = 0; e + bu <= t; ) {
							let t = r.getUint32(e + 32, !0),
								a = r.getUint32(e + 36, !0),
								o = `/${vu.decode(n.subarray(e + bu, e + bu + t))}`;
							(i.set(o, {
								kind: xu[n[e]] ?? `file`,
								written: n[e + 1] === 1,
								mode: r.getUint32(e + 4, !0) & 4095,
								size: Number(r.getBigUint64(e + 8, !0)),
								changes: r.getBigUint64(e + 16, !0),
								mtime: Number(r.getBigInt64(e + 24, !0)),
								target: a
									? vu.decode(n.subarray(e + bu + t, e + bu + t + a))
									: ``,
							}),
								(e += bu + t + a));
						}
						return i;
					}
				}
				async start({ known: e = [], exclude: t = [] }) {
					((this.#n = await this.#s()), (this.#r = new Map(e)), (this.#a = t));
					let [, { r: n }] = await this.#e.calls([
						{ f: `k_fs_watch`, a: [{ in: `/` }] },
						{ f: `k_fs_saves` },
					]);
					this.#o = n;
				}
				async changed() {
					let e = await this.#e.r(`k_fs_saves`),
						t = e !== this.#o;
					return ((this.#o = e), t);
				}
				async diff(e) {
					if (!this.#n) throw Error(`persistence is not started`);
					e && (this.#a = e);
					let t = (e) => e === `/` || this.#a.some((t) => Su(e, t)),
						n = await this.#s(),
						r = this.#n,
						i = this.#r,
						a = [],
						o = new Set(),
						s = (e, t) => i.get(e) === t && o.add(e);
					for (let [e, c] of n) {
						if (t(e) || c.kind === `socket`) continue;
						let n = r.get(e);
						if (c.kind === `file`) {
							let t = i.get(e),
								r =
									t?.startsWith(`f:`) &&
									!t.startsWith(`f:${c.mode.toString(8)}:`);
							if (c.written || r) {
								if (!r && i.has(e) && this.#i.get(e) === c.changes) {
									o.add(e);
									continue;
								}
								let t = await this.#t.readRaw(e, c.size);
								if (!t) continue;
								let n = `f:${c.mode.toString(8)}:${t.length}:${_u(t)}`;
								if ((this.#i.set(e, c.changes), s(e, n))) continue;
								a.push({
									path: e,
									kind: `file`,
									stamp: n,
									mode: c.mode,
									mtime: c.mtime,
									data: t,
								});
							} else if (t?.startsWith(`f:`)) o.add(e);
							else {
								let t = `m:${c.mode.toString(8)}`;
								if (s(e, t)) continue;
								n?.kind === `file` &&
									n.mode !== c.mode &&
									a.push({ path: e, kind: `mode`, stamp: t, mode: c.mode });
							}
						} else if (c.kind === `dir`) {
							let t = `d:${c.mode.toString(8)}`;
							if (s(e, t) || (n?.kind === `dir` && n.mode === c.mode)) continue;
							a.push({
								path: e,
								kind: `dir`,
								stamp: t,
								mode: c.mode,
								mtime: c.mtime,
							});
						} else if (c.kind === `symlink`) {
							let t = `l:${c.target}`;
							if (s(e, t) || (n?.kind === `symlink` && n.target === c.target))
								continue;
							a.push({ path: e, kind: `symlink`, stamp: t, target: c.target });
						}
					}
					for (let e of r.keys()) {
						if (n.has(e) || t(e)) continue;
						let i = Cu(e);
						(i !== `/` && !n.has(i) && r.has(i)) ||
							s(e, `gone`) ||
							a.push({ path: e, kind: `gone`, stamp: `gone` });
					}
					for (let [e, t] of i) t === `gone` && !n.has(e) && o.add(e);
					let c = new Set(a.map((e) => e.path));
					return {
						put: a,
						drop: [...i.keys()].filter((e) => !o.has(e) && !c.has(e)),
					};
				}
				stored({ put: e = [], drop: t = [] }) {
					for (let e of t) (this.#r.delete(e), this.#i.delete(e));
					for (let [t, n] of e) this.#r.set(t, n);
				}
			}));
	}),
	Eu = o(() => {}),
	Du = c({ tarEntries: () => Au, untar: () => ju });
function Ou(e, t, n) {
	let r = t,
		i = t + n;
	for (; r < i && e[r] !== 0; ) r++;
	return new TextDecoder().decode(e.slice(t, r));
}
function ku(e, t, n) {
	let r = Ou(e, t, n).trim();
	if (!r) return 0;
	if (e[t] & 128) {
		let r = 0n;
		for (let i = t + 1; i < t + n; i++) r = (r << 8n) | BigInt(e[i]);
		return Number(r);
	}
	return parseInt(r, 8) || 0;
}
function Au(e, t) {
	let n = e instanceof Uint8Array ? e : new Uint8Array(e),
		r = 0,
		i = null,
		a = null,
		o = null;
	for (; r + Nu <= n.length; ) {
		if (n[r] === 0) {
			r += Nu;
			continue;
		}
		let e = ku(n, r + 124, 12),
			s = String.fromCharCode(n[r + 156] || 48),
			c = r + Nu,
			l = c + Math.ceil(e / Nu) * Nu;
		if (s === `x`) o = Mu(n.subarray(c, c + e));
		else if (s === `K`) a = Ou(n, c, e);
		else if (s === `L`) i = Ou(n, c, e);
		else if (s !== `g`) {
			let l = Ou(n, r, 100),
				u = Ou(n, r + 345, 155);
			(u && (l = `${u}/${l}`), i !== null && (l = i));
			let d = a ?? Ou(n, r + 157, 100);
			i = a = null;
			let f = o;
			if (
				((o = null),
				f?.path !== void 0 && (l = f.path),
				f?.linkpath !== void 0 && (d = f.linkpath),
				t({ name: l, type: s, size: e, body: c, off: r, link: d, ext: f }))
			)
				return;
		}
		r = l;
	}
}
function ju(e, t = ``) {
	let n = new Uint8Array(e),
		r = Object.create(null),
		i = [],
		a = Object.create(null),
		o = Object.create(null),
		s = Object.create(null),
		c = Object.create(null),
		l = Object.create(null),
		u = (e) => {
			let n = e.replace(/^\.\//, ``).replace(/\/+$/, ``);
			return n ? `${t}/${n}`.replace(/\/{2,}/g, `/`) : null;
		};
	return (
		Au(n, ({ name: e, type: d, size: f, body: p, off: m, link: h, ext: g }) => {
			let _ = (e) => {
				e && g && g.xattrs && (l[e] = g.xattrs);
			};
			if (d === `5`) {
				let r = u(e);
				(r
					? i.push(r)
					: /^(\.\/?)?$/.test(e) && (c[t || `/`] = ku(n, m + 136, 12)),
					r && (c[r] = ku(n, m + 136, 12)),
					_(r));
				let a = ku(n, m + 100, 8) & 4095;
				r && a && a !== 493 && (o[r] = a);
			} else if (d === `2`) {
				let t = u(e);
				t && (a[t] = h);
			} else if (d === `1`) {
				let t = u(e);
				t && h && (s[t] = `/${h.replace(/^\.\//, ``)}`);
			} else if (d === `0` || d === `\0` || d === `7`) {
				let t = u(e);
				if (t) {
					r[t] = n.subarray(p, p + f);
					let e = ku(n, m + 100, 8) & 4095;
					(e & 73 && (o[t] = e), (c[t] = ku(n, m + 136, 12)), _(t));
				}
			}
		}),
		{ files: r, dirs: i, links: a, hard: s, modes: o, mtimes: c, xattrs: l }
	);
}
function Mu(e) {
	let t = {},
		n = 0;
	for (; n < e.length; ) {
		let r = n;
		for (; r < e.length && e[r] !== 32; ) r++;
		let i = parseInt(new TextDecoder().decode(e.slice(n, r)), 10);
		if (!(i > 0) || n + i > e.length) break;
		let a = n + i - 1,
			o = r + 1;
		for (; o < a && e[o] !== 61; ) o++;
		let s = new TextDecoder().decode(e.slice(r + 1, o)),
			c = e.slice(o + 1, a);
		if (s === `path`) t.path = new TextDecoder().decode(c);
		else if (s === `linkpath`) t.linkpath = new TextDecoder().decode(c);
		else if (s.startsWith(`SCHILY.xattr.user.`))
			(t.xattrs ??= {})[s.slice(13)] = c;
		else if (s.startsWith(`LIBARCHIVE.xattr.user.`)) {
			let e = atob(new TextDecoder().decode(c));
			(t.xattrs ??= {})[decodeURIComponent(s.slice(17))] = Uint8Array.from(
				e,
				(e) => e.charCodeAt(0),
			);
		}
		n += i;
	}
	return t;
}
var Nu,
	Pu = o(() => {
		Nu = 512;
	}),
	Fu = c({ setGlobals: () => Iu });
function Iu(e, t = {}) {
	(vt(e),
		(globalThis.GEX_ARCH = t.arch === `aarch64` ? `aarch64` : `x86`),
		e(`heartbeat`) && (globalThis.GEX_HEARTBEAT = Number(e(`heartbeat`))),
		(e(`mem64`) === `1` || t.mem64) && (globalThis.GEX_MEM64 = 1));
	let n = e(`fjit`);
	(n !== null && n !== `0` && (globalThis.GEX_FJIT = Number(n) || 1),
		e(`elfunits`) &&
			e(`cgen`) !== `0` &&
			(globalThis.GEX_ELF_UNITS = e(`elfunits`)),
		e(`pins`) && (globalThis.GEX_PINS = e(`pins`)),
		e(`dense`) === `0` && (globalThis.GEX_DENSE = 0),
		e(`dense`) === `2` && (globalThis.GEX_DENSE = 2));
	let r = e(`cgen`);
	(r &&
		r !== `0` &&
		(globalThis.GEX_CGEN =
			Number(r) |
			(e(`unguarded`) === `0` ? 0 : 4) |
			(e(`icallcount`) === `1` ? 16 : 0)),
		e(`cgenurl`) && (globalThis.GEX_CGEN_URL = e(`cgenurl`)),
		e(`cgenzst`) === `1` && (globalThis.GEX_CGEN_ZST = 1),
		e(`aot`) === `1` && (globalThis.GEX_NO_JIT = 1),
		e(`aot`) && (globalThis.GEX_AOT = 1),
		(globalThis.GEX_UNIT_CACHE =
			e(`unitcache`) === null ? 1 : Number(e(`unitcache`))));
}
var Lu = o(() => {
	St();
});
function Ru(e, t = 0) {
	return e &&
		e.length >= t + 20 &&
		e[t] === 127 &&
		e[t + 1] === 69 &&
		e[t + 2] === 76 &&
		e[t + 3] === 70 &&
		e[t + 4] === 2
		? (Gu[e[t + 18] | (e[t + 19] << 8)] ?? null)
		: null;
}
function zu(e, t) {
	let n = null;
	return (
		e(
			t,
			({ type: e, body: r }) => (
				(e === `0` || e === `\0` || e === `7`) && (n = Ru(t, r)),
				!!n
			),
		),
		n
	);
}
function Bu(e = {}) {
	for (let t of Object.values(e)) if (Ru(t)) return Ru(t);
	return null;
}
async function Vu(e) {
	let { tarEntries: t } = await Promise.resolve().then(() => (Pu(), Du));
	for (let n of [...e].reverse()) {
		if (n.at && n.at !== `/`) continue;
		let e = n.tar ? zu(t, n.tar) : Bu(n.files);
		if (e) return e;
	}
	return null;
}
function Hu(e, t, n = {}) {
	if (!Array.isArray(t) || !t.length || t.some((e) => typeof e != `string`))
		throw TypeError(`${e}: argv is a non-empty array of strings`);
	if (typeof n != `object` || !n) throw TypeError(`${e}: options is an object`);
	for (let t of Object.keys(n))
		if (![`pty`, `env`, `cwd`, `uid`, `gid`, `detached`].includes(t))
			throw TypeError(`${e}: no option ${t}`);
	return [t, n];
}
var Uu,
	Wu,
	Gu,
	Ku,
	qu = o(() => {
		(gl(),
			Sl(),
			Tl(),
			Dl(),
			Ll(),
			Vl(),
			ou(),
			gu(),
			Tu(),
			Eu(),
			(Uu = () => new URL(`/`, globalThis.location?.href).href),
			(Wu = !1),
			(Gu = { 62: `x86`, 183: `aarch64` }),
			(Ku = class extends EventTarget {
				#e;
				#t = { phase: `new`, error: null, progress: null, console: `` };
				#n = new Map();
				#r = [];
				#i = [];
				#a = null;
				#o = null;
				#s = null;
				#c = null;
				#l = null;
				#u = [];
				#d = new Map();
				#f = new Map();
				#p = new Map();
				#m = 1;
				#h = null;
				#g = null;
				#_ = new wl();
				#v = new Map();
				#y = null;
				#b = null;
				#x = null;
				#S = { host: {}, exec: {}, onMessage: [], loud: !1 };
				constructor({
					baseUrl: e,
					units: t,
					xcache: n = !1,
					debug: r = {},
				} = {}) {
					super();
					for (let e of Object.keys(arguments[0] ?? {}))
						if (![`baseUrl`, `units`, `xcache`, `debug`].includes(e))
							throw TypeError(`System: no option ${e}`);
					if (Wu)
						throw Error(
							`System: a page runs one system; this page already made one`,
						);
					Wu = !0;
					let i =
						typeof t == `object` && t && !(t instanceof URL)
							? t
							: t
								? { url: t }
								: null;
					((this.#e = {
						baseUrl: String(e ?? Uu()),
						files: null,
						units: i && {
							url: new URL(
								/* @vite-ignore */ /* webpackIgnore: true */ String(
									i.url,
								).replace(/\/*$/, ``),
								globalThis.location?.href,
							).href,
							require: !!i.require,
						},
						xcache: !!n,
						debug: { ...r },
					}),
						(this.#y = new Il((e, t) => this.#A(e, t))));
					let a = this;
					this[W] = {
						system: this,
						attach: (e, t, { once: n = !0, beforeBoot: r = !1 } = {}) => {
							if (r && this.#t.phase !== `new`)
								throw Error(`${e} must be made before the system boots`);
							if (n && this.#n.has(e))
								throw Error(`this system already has its ${e}`);
							n
								? this.#n.set(e, t)
								: (this.#n.get(e) ?? this.#n.set(e, []).get(e)).push(t);
						},
						part: (e) => this.#n.get(e) ?? null,
						beforeBoot: (e) => this.#r.push(e),
						devices: (e, t = 0) => this.#u.push({ fn: e, stage: t }),
						afterBoot: (e) => {
							if (this.#t.phase === `running`) return e(this.#l);
							this.#i.push(e);
						},
						on: (e, t) => (this.#k.get(e) ?? this.#k.set(e, []).get(e)).push(t),
						kernel: () => this.#a,
						files: () => this.#o,
						programs: () => this.#s,
						changes: () => this.#c,
						network: (e) => this.#_.set(e),
						sys: () => this.#l,
						get phase() {
							return a.#t.phase;
						},
						opts: this.#e,
						say: (e) => this.#C(e),
						pageFs: () => this.#y,
						preset: this.#S,
					};
				}
				get state() {
					return { ...this.#t };
				}
				#C(e) {
					((this.#t.console += e),
						this.#t.console.length > 65536 &&
							(this.#t.console = this.#t.console.slice(-49152)),
						this.dispatchEvent(
							Object.assign(new Event(`console`), { text: e }),
						),
						this.#e.debug.console &&
							console.log(`[gex] ${e.replace(/\n$/, ``)}`));
				}
				boot(...e) {
					let t = e.length ? Hu(`boot`, ...e) : null;
					return this.#h
						? this.#h
						: ((this.#b = t),
							(this.#h = this.#w().catch((e) => {
								throw (
									(this.#t.phase = `failed`),
									(this.#t.error = String(e?.stack ?? e)),
									e
								);
							})),
							this.#h);
				}
				async #w() {
					if (this.#t.phase !== `new`)
						throw Error(`this system has already booted`);
					if (
						((this.#t.phase = `booting`),
						typeof SharedArrayBuffer != `function`)
					)
						throw Error(
							`the gex runtime needs a cross-origin isolated page (Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Embedder-Policy: require-corp)`,
						);
					let { arch: e, ...t } = this.#e.debug,
						n = new URLSearchParams();
					for (let [e, r] of Object.entries(t))
						r !== void 0 &&
							r !== !1 &&
							e !== `console` &&
							n.set(e, r === !0 ? `1` : String(r));
					(this.#S.loud ||
						n.has(`log`) ||
						globalThis.GEX_LOG !== void 0 ||
						{}.GEX_LOG ||
						n.set(`log`, `quiet`),
						this.#e.units &&
							(n.set(`cgen`, this.#e.units.require ? `2` : `1`),
							n.set(`cgenurl`, this.#e.units.url)),
						this.#e.xcache && n.set(`xcache`, `1`),
						(globalThis.GEX_PAGE_SEARCH = `?${n}`),
						(globalThis.GEX_ASSET_BASE = new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ this.#e.baseUrl,
							globalThis.location?.href,
						).href),
						this.#e.files && (globalThis.GEX_ASSET_FILES = this.#e.files),
						await Promise.resolve().then(() => (le(), oe)));
					let r = { layers: [], records: [] };
					for (let e of this.#r) await e(r);
					let i = e ?? (await Vu(r.layers)) ?? `aarch64`,
						{ setGlobals: a } = await Promise.resolve().then(() => (Lu(), Fu));
					a((e) => n.get(e), { arch: i });
					let o = await Promise.resolve().then(() => (Ip(), Af));
					if (globalThis.process?.versions?.node && !globalThis.document) {
						let e = o.runtimeUrls(),
							t = (e) =>
								ml(
									new URL(
										/* @vite-ignore */ /* webpackIgnore: true */ e,
										globalThis.GEX_ASSET_BASE,
									).href,
								);
						o.primeRuntime({
							shimBytes: await t(e.shimBytes),
							seedBytes: await t(e.seedBytes),
							kernelBytes: await t(e.kernelBytes),
							fetchOther: t,
						});
					}
					((this.#g = i), (globalThis.__gexTso = await o.detectTso()));
					let s = await o.loadKernel();
					if (!s) throw Error(`the kernel would not load`);
					let c = {
							write: (e) => this.#C(String(e)),
							writeln: (e) => this.#C(`${e}\n`),
						},
						l = {
							rt: o,
							kernel: s,
							term: c,
							say: (e) => this.#C(e),
							wlChannel: null,
							compositor: null,
							dom: !1,
							glChannel: null,
						};
					for (let { fn: e } of this.#u.sort((e, t) => e.stage - t.stage))
						await e(l);
					let { compositor: u } = l,
						d = await o.openNet(this.#_),
						f = [],
						p = await o.makeProcessHost(
							{
								uid: 0,
								...this.#S.host,
								kernel: s,
								pageFs: this.#y.control,
								glChannel: l.glChannel,
								wlChannel: l.wlChannel,
								netChannel: d,
								network: this.#_,
							},
							{
								onOutput: (e, t) => this.#C(t),
								onExit: (e, t) => {
									typeof t == `number` && u?.dropMemory?.(t);
								},
								readStdin: () => new Promise(() => {}),
								onMessage: (e) => {
									e.kind === `wl-memory`
										? u?.addMemory(e.token, e.memory, e.kernel)
										: e.kind === `wl-pixels` &&
											u?.addPixels?.(e.token, e.id, e.buffer, e.replaces);
									for (let t of this.#S.onMessage) t(e);
								},
							},
						);
					this.#l = {
						host: p,
						kernel: s,
						term: c,
						rt: o,
						compositor: u,
						wlChannel: l.wlChannel,
						spawnExec: ({ uid: e = 0, gid: t = e, ...n }) =>
							p.spawnExec({
								...n,
								opts: { ...o.execOptions({ uid: e, gid: t }), ...this.#S.exec },
							}),
						onStop: (e) => f.push(e),
						stop: () => {
							for (let e of f.splice(0))
								try {
									e();
								} catch {}
							p.stop();
						},
					};
					let m = this.#n.get(`filesystem`)?.[W],
						{ layers: h, records: g } = r;
					r.layers = r.records = null;
					try {
						await this.#T(this.#l, h, g, m);
					} catch (e) {
						throw (this.#l.stop(), e);
					}
					if (((this.#t.phase = `running`), this.#b)) {
						let [e, t] = this.#b,
							n = (this.#x = this.#N(
								e,
								{ env: [`HOME=/`, `TERM=linux`], ...t },
								!0,
							));
						n.exited.then(
							async (e) => {
								this.#t.phase === `running` &&
									((this.#t.init = e),
									await Promise.race([
										n[W].drained(),
										new Promise((e) => setTimeout(e, 1e3)),
									]),
									this.shutdown());
							},
							(e) => {
								this.#t.phase === `running` &&
									((this.#t.init = { error: String(e?.message ?? e) }),
									this.shutdown());
							},
						);
					}
					for (let e of this.#i.splice(0)) await e(this.#l);
					return (this.dispatchEvent(new Event(`running`)), this);
				}
				async #T(e, t, n, r) {
					let i = await Bl.start({
						module: e.kernel.module,
						memory: e.kernel.memory,
						pageFs: this.#y.control,
					});
					((this.#a = i),
						(this.#o = new au(i)),
						(this.#c = new wu(i, this.#o)),
						(this.#s = new hu(i, this.#o, {
							data: (e, t) => this.#d.get(e)?.[W].data(t),
							end: (e) => this.#d.get(e)?.[W].data(null),
							exit: (e) => this.#D(e),
							watch: (e) => this.#O(`watch`, e),
							xWanted: () => this.#O(`x-wanted`, {}),
						})));
					for (let e of t)
						await (e.image ? this.#o.layImage(e) : this.#o.lay(e));
					(n.length && (await this.#o.restore(n)),
						await i.r(`k_fs_populate_done`),
						this.#e.xcache && (await this.#E(e, i)));
					for (let [e, t] of r?.mounts?.() ?? []) await this.#o.mount(e, t);
					await i.r(`k_host_calls_serve`);
					let a = r?.persistArgs?.();
					(a && (await this.#c.start(a)),
						await this.#s.start({ init: !!this.#b }));
					let o = (e, ...t) => (i.has(e) ? [{ f: e, a: t }] : []),
						s = [
							{ f: `k_stack_area` },
							{ f: `k_stack_size` },
							{ f: `k_stack_count` },
							...o(`k_snap_word`),
							...o(`k_ws_addr`, 0),
							...o(`k_ws_count`),
							...o(`k_mono_held_at`),
							...o(`k_snap_extents_at`),
						],
						c = Object.fromEntries(
							(await i.calls(s)).map((e, t) => [s[t].f, e.r >>> 0]),
						);
					e.host.useKernelStacks({
						area: c.k_stack_area,
						size: c.k_stack_size,
						count: c.k_stack_count,
						...(i.has(`k_snap_word`)
							? {
									snapWord: c.k_snap_word,
									wsAddr: c.k_ws_addr,
									wsCount: c.k_ws_count,
								}
							: {}),
						...(i.has(`k_mono_held_at`) ? { monoHeld: c.k_mono_held_at } : {}),
						...(i.has(`k_snap_extents_at`)
							? { extents: c.k_snap_extents_at }
							: {}),
					});
				}
				async #E(e, t) {
					let n = e.rt.xcacheName();
					if (!n || !t.has(`k_store_restore`)) return;
					await t.r(`k_xcache_enable`);
					let r = await e.rt.xcRead(n);
					if (!r) return void this.#C(`xcache ${n}: nothing saved\n`);
					let i = (await t.r(`k_store_restore_buf`, r.length)) >>> 0;
					new Uint8Array(e.kernel.memory.buffer).set(r, i);
					let a = await t.r(`k_store_restore`);
					this.#C(
						`xcache ${n}: ${(r.length / 1048576).toFixed(1)} MiB, restored ${a} modules\n`,
					);
				}
				#D(e) {
					let t = this.#f.get(e.pid);
					t
						? (this.#f.delete(e.pid), t[W].exit(e))
						: (this.#p.set(e.pid, e),
							this.#p.size > 4096 &&
								this.#p.delete(this.#p.keys().next().value));
				}
				#O(e, t) {
					for (let n of this.#k.get(e) ?? []) n(t);
				}
				#k = new Map();
				async #A(e, t) {
					try {
						let n = this.#v.get(e);
						if (!n) throw Error(`no host call ${e}`);
						let r;
						try {
							r = t.trim() ? JSON.parse(t) : null;
						} catch {
							throw Error(`${e}: not JSON: ${t.slice(0, 200)}`);
						}
						let i = await n(r);
						return { ok: !0, text: i === void 0 ? `null` : JSON.stringify(i) };
					} catch (e) {
						return { ok: !1, text: String(e?.message ?? e) };
					}
				}
				get hostCalls() {
					let e = this.#v;
					return {
						register(t, n) {
							if (typeof t != `string` || !t || /[\0\s]/.test(t))
								throw TypeError(`hostCalls.register: a name without spaces`);
							if (typeof n != `function`)
								throw TypeError(`hostCalls.register: a function`);
							return (
								e.set(t, n),
								() => {
									e.get(t) === n && e.delete(t);
								}
							);
						},
						unregister(t) {
							e.delete(t);
						},
						names: () => [...e.keys()],
					};
				}
				get net() {
					return {
						connectGuest: (e, { host: t = `127.0.0.1` } = {}) => this.#j(e, t),
					};
				}
				async #j(e, t) {
					if (
						(this.#M(`connectGuest`),
						![`127.0.0.1`, `localhost`, `0.0.0.0`].includes(t))
					)
						throw Error(
							`connectGuest: only the guest's own 127.0.0.1, not ${t}`,
						);
					if (!Number.isInteger(e) || e <= 0 || e > 65535)
						throw TypeError(`connectGuest: no port ${e}`);
					let n = this.#m++,
						r = this.#s,
						i = new El({
							read: () => r.read(n),
							write: (e) => r.write(n, e),
							closeStdin: () => r.closeStdin(n),
							release: () => {
								(r.release(n).catch(() => {}), this.#d.delete(n));
							},
						});
					this.#d.set(n, i);
					try {
						await r.connectGuest(n, e);
					} catch (e) {
						throw (this.#d.delete(n), e);
					}
					return i;
				}
				#M(e) {
					if (this.#t.phase !== `running`)
						throw Error(`${e}: the system is ${this.#t.phase}, not running`);
				}
				spawn(e, t = {}) {
					if ((this.#M(`spawn`), this.#b))
						throw Error(
							`spawn: this system has an init (${this.#b[0][0]}), which owns the processes; the page reaches programs through what it starts`,
						);
					return this.#N(e, t, !1, !1);
				}
				get init() {
					return this.#x;
				}
				#N(e, t, n, r) {
					[e, t] = Hu(n ? `boot` : `spawn`, e, t);
					let i = this.#m++,
						a = t.pty ? `pty` : t.detached ? `null` : `pipe`,
						o = this.#s,
						s = (e) => e.catch((e) => this.#C(`gex: ${e?.message ?? e}\n`)),
						c = new xl({
							argv: e,
							stdio: a,
							encoding: t.pty?.encoding,
							untilExit: r,
							read: (e, t) => o.read(i, e, t),
							unread: (e) => s(o.unread(i, e)),
							kick: () => o.kick(),
							write: (e) => o.write(i, e),
							closeStdin: () => o.closeStdin(i),
							resize: (e, t) => s(o.resize(i, e, t)),
							kill: (e, t) => s(o.kill(e, dl(t))),
							release: () => {
								(this.#d.delete(i), s(o.release(i)));
							},
							windows: (e) => this.#n.get(`windows`)?.[W]?.of?.(e) ?? [],
						});
					return (
						this.#d.set(i, c),
						o
							.spawn({
								h: i,
								argv: e,
								env: pl(t.env),
								cwd: t.cwd ?? ``,
								stdio: a,
								cols: t.pty?.cols ?? 80,
								rows: t.pty?.rows ?? 24,
								init: n,
							})
							.then(
								(n) => {
									if (n.error) {
										(this.#d.delete(i), c[W].failed(n.error));
										return;
									}
									(this.#f.set(n.pid, c), c[W].started(n.pid));
									let r = this.#p.get(n.pid);
									r &&
										(this.#p.delete(n.pid),
										this.#f.delete(n.pid),
										c[W].exit(r));
									let a = t.uid ?? 0;
									this.#l
										.spawnExec({
											pid: n.pid,
											exec: n.exec,
											fds: n.fds,
											cwd: n.cwd,
											wasmImage: n.wasmImage,
											uid: a,
											gid: t.gid ?? t.uid ?? 0,
										})
										.catch((t) => {
											(this.#C(
												`gex: ${e[0]} (pid ${n.pid}) did not start: ${t?.message ?? t}\n`,
											),
												s(o.abandon(n.pid)));
										});
								},
								(e) => {
									(this.#d.delete(i), c[W].failed(e));
								},
							),
						c
					);
				}
				async run(e, { input: t, encoding: n = `utf-8`, ...r } = {}) {
					if ((this.#M(`spawn`), this.#b))
						throw Error(
							`run: this system has an init (${this.#b[0][0]}), which owns the processes; the page reaches programs through what it starts`,
						);
					let i = this.#N(e, { ...r, detached: !1, pty: void 0 }, !1, !0),
						a = async (e) => {
							let t = [];
							for (let n = e.getReader(); ; ) {
								let { value: e, done: r } = await n.read();
								if (r) break;
								t.push(e);
							}
							let r = t.reduce((e, t) => e + t.length, 0),
								i = new Uint8Array(r),
								a = 0;
							for (let e of t) (i.set(e, a), (a += e.length));
							return n ? new TextDecoder(n).decode(i) : i;
						},
						o = a(i.stdout),
						s = a(i.stderr),
						c = i.stdin.getWriter();
					(t !== void 0 &&
						(await c.write(
							typeof t == `string`
								? new TextEncoder().encode(t)
								: await ml(t, `input`),
						)),
						await c.close());
					let { code: l, signal: u } = await i.exited;
					return { code: l, signal: u, stdout: await o, stderr: await s };
				}
				async shutdown() {
					if (this.#t.phase !== `stopped`) {
						this.#t.phase = `stopped`;
						for (let e of this.#d.values())
							e[W].exit({ code: 137, signal: 9, shutdown: !0 });
						(this.#d.clear(), this.#f.clear());
						for (let e of this.#n.values())
							for (let t of [e].flat()) await t?.[W]?.shutdown?.();
						(this.#l?.stop(),
							this.#a?.terminate(),
							this.dispatchEvent(new Event(`stopped`)));
					}
				}
				describe() {
					let e = this.#l?.host;
					return {
						phase: this.#t.phase,
						arch: this.#g,
						processes: [...this.#d.values()].map((e) => ({
							pid: e.pid,
							argv: e.argv,
						})),
						pids: e?.pids ?? [],
						threads: e?.threads ?? 0,
						memory: {
							kernel: this.#l?.kernel?.memory?.buffer?.byteLength ?? 0,
						},
					};
				}
			}));
	}),
	Ju = c({ isZstd: () => Xu, unzstd: () => Zu });
async function Yu() {
	return (
		(Qu ||= (async () => {
			let { ZSTDDecoder: e } = await Promise.resolve().then(() => (Ne(), Oe)),
				t = new e();
			return (await t.init(), t);
		})()),
		Qu
	);
}
function Xu(e) {
	return (
		e.length > 4 && e[0] === 40 && e[1] === 181 && e[2] === 47 && e[3] === 253
	);
}
async function Zu(e) {
	return (await Yu()).decode(e);
}
var Qu,
	$u = o(() => {
		Qu = null;
	});
async function ed(e) {
	let t = await ml(e, `tar`);
	if (!id(t)) return t;
	let { unzstd: n } = await Promise.resolve().then(() => ($u(), Ju));
	return n(t);
}
async function td(e) {
	let t = e,
		n = globalThis.location?.href;
	if (
		((typeof e == `string` || e instanceof URL) &&
			((n = new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.location?.href,
			).href),
			(t = JSON.parse(new TextDecoder().decode(await ml(n, `lazy list`))))),
		!Array.isArray(t))
	) {
		if (t?.files) {
			let e = new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ t.base ?? `./`,
				n,
			);
			return t.files.map(([t, n, r, i]) => [
				t,
				n,
				new URL(/* @vite-ignore */ /* webpackIgnore: true */ r, e).href,
				i,
			]);
		}
		throw TypeError(`lazy: a list of [path, size, url] or its URL`);
	}
	return t.map(([e, t, r, i]) => [
		e,
		t,
		new URL(/* @vite-ignore */ /* webpackIgnore: true */ r, n).href,
		i,
	]);
}
function nd(e) {
	let t = new URL(
		/* @vite-ignore */ /* webpackIgnore: true */ e,
		globalThis.location?.href,
	);
	if (t.protocol === `file:`) return decodeURIComponent(t.pathname);
	if (globalThis.location && t.origin !== globalThis.location.origin)
		throw Error(
			`lazy file ${e}: only the page's own origin can be read lazily`,
		);
	return t.pathname + t.search + t.hash;
}
var J,
	rd,
	id,
	ad,
	od,
	sd = o(() => {
		(gl(),
			(J = (e) => {
				if (typeof e != `string` || !e.startsWith(`/`))
					throw TypeError(`not an absolute guest path: ${e}`);
				let t = [];
				for (let n of e.split(`/`))
					!n || n === `.` || (n === `..` ? t.pop() : t.push(n));
				return `/${t.join(`/`)}`;
			}),
			(rd = (e, t) => J(`${e}/${t}`)),
			(id = (e) =>
				e.length > 4 &&
				e[0] === 40 &&
				e[1] === 181 &&
				e[2] === 47 &&
				e[3] === 253),
			(ad = class extends EventTarget {
				#e;
				constructor(e, t, n) {
					(super(), (this.#e = e), (this.path = t), (this.provider = n));
				}
				unmount() {
					return this.#e.unmount(this.path);
				}
			}),
			(od = class extends EventTarget {
				#e;
				#t = [];
				#n = new Map();
				#r = null;
				constructor(e) {
					super();
					let t = ul(e, `Filesystem`);
					(t.attach(`filesystem`, this, { beforeBoot: !0 }),
						(this.#e = t),
						t.beforeBoot((e) => this.#o(e)),
						(this[W] = {
							sources: () => this.#t,
							mounts: () => [...this.#n].map(([e, t]) => [e, t.id]),
							persist: (e, n) => {
								(t.attach(`persistence`, e, { beforeBoot: !0 }),
									(this.#r = n),
									t.afterBoot(() => n.running(t)));
							},
							persistArgs: () => this.#r?.startArgs() ?? null,
							addImage: (e) => this.#a(Promise.resolve({ image: !0, ...e })),
						}));
				}
				#i(e) {
					if (this.#e.phase !== `running`)
						throw Error(`${e}: the system is ${this.#e.phase}, not running`);
					return this.#e.files();
				}
				addTar(e, { at: t = `/`, lazy: n } = {}) {
					let r = (async () => {
						let r = n ? await td(n) : [];
						return {
							tar: e == null ? null : await ed(e),
							at: J(t),
							lazy: r.map(([e, n, r, i]) => [rd(t, e), n, nd(r), i]),
						};
					})();
					return this.#a(r);
				}
				addFiles(e, { mode: t } = {}) {
					let n = (async () => {
						let n = {},
							r = {};
						for (let [i, a] of Object.entries(e))
							((n[J(i)] =
								typeof a == `string`
									? new TextEncoder().encode(a)
									: await ml(a, i)),
								t !== void 0 && (r[J(i)] = t));
						return { files: n, modes: r };
					})();
					return this.#a(n);
				}
				#a(e) {
					return this.#e.phase === `new` || this.#e.phase === `booting`
						? (this.#t.push(e), e.catch(() => {}), e.then(() => {}))
						: e
								.then((e) =>
									e.image
										? this.#i(`addTar`).layImage(e)
										: this.#i(`addTar`).lay(e),
								)
								.then(() => {});
				}
				async #o(e) {
					((e.layers = await Promise.all(this.#t)),
						(e.records = this.#r ? await this.#r.load() : []),
						(this.#t.length = 0));
				}
				#s() {
					return this.#e.pageFs();
				}
				mount(e, t) {
					let n = J(e);
					if (n === `/`) throw Error(`mount: the root is the system's own`);
					for (let e of [`stat`, `readdir`, `open`, `read`, `close`])
						if (typeof t?.[e] != `function`)
							throw TypeError(`mount: the provider has no ${e}()`);
					if (this.#n.has(n)) throw Error(`mount: ${n} is mounted already`);
					if (![`new`, `booting`, `running`].includes(this.#e.phase))
						throw Error(`mount: the system is ${this.#e.phase}`);
					let r = this.#s().add(t),
						i = new ad(this, n, t);
					return (
						this.#n.set(n, { mount: i, id: r }),
						(i.ready =
							this.#e.phase === `running`
								? this.#e
										.files()
										.mount(n, r)
										.then(() => i)
								: Promise.resolve(i)),
						i
					);
				}
				async unmount(e) {
					let t = J(e),
						n = this.#n.get(t);
					if (!n)
						throw Object.assign(Error(`unmount: nothing mounted at ${t}`), {
							code: `EINVAL`,
						});
					(this.#n.delete(t),
						this.#e.phase === `running` && (await this.#e.files().unmount(t)),
						this.#s().remove(n.id),
						n.mount.dispatchEvent(new Event(`unmounted`)));
				}
				mounts() {
					return [...this.#n.values()].map((e) => e.mount);
				}
				async readFile(e, { encoding: t } = {}) {
					let n = await this.#i(`readFile`).readFile(J(e));
					return t ? new TextDecoder(t).decode(n) : n;
				}
				async writeFile(e, t, { mode: n, append: r, exclusive: i } = {}) {
					let a =
						typeof t == `string` ? new TextEncoder().encode(t) : await ml(t, e);
					return this.#i(`writeFile`).writeFile(J(e), a, {
						mode: n,
						append: r,
						exclusive: i,
					});
				}
				stat(e, { follow: t = !0 } = {}) {
					return this.#i(`stat`).stat(J(e), t);
				}
				readdir(e) {
					return this.#i(`readdir`).readdir(J(e));
				}
				mkdir(e, { recursive: t = !1, mode: n = 493 } = {}) {
					return this.#i(`mkdir`).mkdir(J(e), { recursive: t, mode: n });
				}
				rm(e, { recursive: t = !1, force: n = !1 } = {}) {
					return this.#i(`rm`).rm(J(e), { recursive: t, force: n });
				}
				rename(e, t) {
					return this.#i(`rename`).rename(J(e), J(t));
				}
				symlink(e, t) {
					return this.#i(`symlink`).symlink(e, J(t));
				}
				readlink(e) {
					return this.#i(`readlink`).readlink(J(e));
				}
				chmod(e, t) {
					return this.#i(`chmod`).chmod(J(e), t);
				}
				watch(e, t) {
					let n = J(e),
						r = this.#e;
					this.#c ||
						((this.#c = new Map()),
						r.on(`watch`, (e) => {
							let t = this.#c.get(e.h);
							t &&
								(e.type === `gone` && this.#c.delete(e.h),
								t({
									type: e.type,
									path: e.name ? J(`${t.at}/${e.name}`) : t.at,
									...(e.cookie ? { cookie: e.cookie } : {}),
								}));
						}));
					let i = null,
						a = !1,
						o = Object.assign((e) => t(e), { at: n });
					return (
						this.#i(`watch`),
						r
							.programs()
							.addWatch(n)
							.then(
								(e) => {
									if (((i = e), a))
										return r
											.programs()
											.rmWatch(i)
											.catch(() => {});
									this.#c.set(i, o);
								},
								(e) => t({ type: `error`, path: n, error: e }),
							),
						() => {
							a ||
								((a = !0),
								i !== null &&
									this.#c.delete(i) &&
									r
										.programs()
										?.rmWatch(i)
										.catch(() => {}));
						}
					);
				}
				#c = null;
			}));
	});
function cd(e, t = {}) {
	e.afterBoot(async (n) => {
		if (!n.wlChannel) return;
		let r = await e.programs().holdX(),
			i = null;
		(e.on(`x-wanted`, () => {
			((i ??= n.rt.startXServer({
				kernel: n.kernel,
				wlChannel: n.wlChannel,
				compositor: () => n.compositor,
				term: n.term,
				listen: r,
				rootful: !!t.rootful,
			})),
				i.catch((t) =>
					e.say(`gex: the X server would not start: ${t?.message ?? t}\n`),
				));
		}),
			n.onStop(() =>
				i?.then(
					(e) => e.terminate(),
					() => {},
				),
			));
	});
}
var ld = o(() => {}),
	ud,
	dd = o(() => {
		(gl(),
			ld(),
			(ud = class extends EventTarget {
				#e = null;
				constructor(e, { canvas: t, scale: n } = {}) {
					if ((super(), typeof t?.getContext != `function`))
						throw TypeError(`CompositorWindows: a canvas`);
					let r = ul(e, `CompositorWindows`);
					(r.attach(`windows`, this, { beforeBoot: !0 }),
						r.devices(async (e) => {
							let r = Math.max(
								1,
								Math.round(n ?? globalThis.devicePixelRatio ?? 1),
							);
							(Object.assign(
								e,
								await e.rt.openWayland({
									wl: t,
									wlScale: r,
									say: (t) => e.say(`${t}\n`),
								}),
							),
								(this.#e = e.compositor));
						}));
					let i = {};
					(cd(r, i),
						(this[W] = {
							x: i,
							of: () => [],
							shutdown: () => this.#e?.stop(),
						}));
				}
				get env() {
					return {
						XDG_RUNTIME_DIR: `/tmp`,
						WAYLAND_DISPLAY: `wayland-0`,
						DISPLAY: `:0`,
					};
				}
				resize(e, t) {
					this.#e?.resize(e, t);
				}
				describe() {
					return this.#e?.describe() ?? Promise.resolve(null);
				}
			}));
	});
function fd() {
	if (yd || typeof GPUDevice > `u`) return;
	yd = !0;
	let e = (e, t, n) => {
			let r = vd.get(t);
			(r || vd.set(t, (r = { n: 0, bytes: 0, made: 0, destroyed: 0, each: n })),
				r.n++,
				r.made++,
				(r.bytes += n),
				_d.set(e, t));
		},
		t = (e) => {
			let t = _d.get(e);
			if (t === void 0) return;
			_d.delete(e);
			let n = vd.get(t);
			(n.n--, n.destroyed++, (n.bytes -= n.each));
		},
		n = GPUDevice.prototype.createTexture;
	GPUDevice.prototype.createTexture = function (t) {
		let r = n.call(this, t),
			[i, a = 1, o = 1] = Array.isArray(t.size)
				? t.size
				: [t.size.width, t.size.height ?? 1, t.size.depthOrArrayLayers ?? 1],
			s =
				i *
				a *
				o *
				(xd[t.format] ?? 4) *
				(t.sampleCount ?? 1) *
				((t.mipLevelCount ?? 1) > 1 ? 1.34 : 1);
		return (
			e(
				r,
				`texture ${i}x${a}x${o} ${t.format} usage 0x${t.usage.toString(16)}${(t.sampleCount ?? 1) > 1 ? ` x${t.sampleCount}` : ``}`,
				Math.round(s),
			),
			r
		);
	};
	let r = GPUDevice.prototype.createBuffer;
	GPUDevice.prototype.createBuffer = function (t) {
		let n = r.call(this, t);
		return (
			e(n, `buffer ${t.size} usage 0x${t.usage.toString(16)}`, t.size),
			n
		);
	};
	let i = (e, t, n) => {
			let r = e?.[t];
			typeof r != `function` ||
				!globalThis.GEX_GPU_CALLS ||
				(e[t] = function (...e) {
					let i = bd.get(t);
					if ((i || bd.set(t, (i = [0, 0])), i[0]++, n))
						try {
							i[1] += n(e) || 0;
						} catch {}
					return r.apply(this, e);
				});
		},
		a = (e) => {
			let t = e[2] ?? e[3];
			return Array.isArray(t)
				? t[0] * (t[1] ?? 1) * 4
				: (t?.width ?? 0) * (t?.height ?? 1) * 4;
		};
	(i(GPUQueue.prototype, `writeBuffer`, (e) =>
		e[4] === void 0
			? (e[2]?.byteLength ?? 0)
			: e[4] * (e[2]?.BYTES_PER_ELEMENT ?? 1),
	),
		i(GPUQueue.prototype, `writeTexture`, (e) => e[1]?.byteLength ?? 0),
		i(GPUQueue.prototype, `copyExternalImageToTexture`, a),
		i(GPUQueue.prototype, `submit`),
		i(globalThis.GPUCanvasContext?.prototype, `getCurrentTexture`),
		i(GPUTexture.prototype, `createView`),
		i(GPUBuffer.prototype, `mapAsync`),
		i(GPUBuffer.prototype, `getMappedRange`),
		i(GPUCommandEncoder.prototype, `copyTextureToTexture`, a),
		i(GPUCommandEncoder.prototype, `copyTextureToBuffer`, a),
		i(GPUCommandEncoder.prototype, `copyBufferToTexture`, a),
		i(GPUCommandEncoder.prototype, `beginRenderPass`),
		i(GPUCommandEncoder.prototype, `beginComputePass`));
	for (let e of [
		`createBindGroup`,
		`createCommandEncoder`,
		`createQuerySet`,
		`createSampler`,
		`createShaderModule`,
		`createRenderPipeline`,
		`createComputePipeline`,
		`importExternalTexture`,
		`createBindGroupLayout`,
		`createPipelineLayout`,
	])
		i(GPUDevice.prototype, e);
	for (let e of [GPUTexture.prototype, GPUBuffer.prototype]) {
		let n = e.destroy;
		e.destroy = function () {
			return (t(this), n.call(this));
		};
	}
}
function pd(e = 8) {
	let t = 0,
		n = 0;
	for (let e of vd.values()) ((t += e.n), (n += e.bytes));
	let r = [...vd.entries()]
			.filter(([, e]) => e.n > 0)
			.sort((e, t) => t[1].bytes - e[1].bytes)
			.slice(0, e)
			.map(
				([e, t]) =>
					`${e}: ${t.n} live (${(t.bytes / 1048576).toFixed(1)} MiB), ${t.made} made, ${t.destroyed} destroyed`,
			),
		i = Object.fromEntries(
			[...bd.entries()].map(([e, [t, n]]) => [
				e,
				n ? [t, +(n / 1048576).toFixed(1)] : t,
			]),
		);
	return {
		tracking: yd,
		objects: t,
		mib: +(n / 1048576).toFixed(1),
		calls: i,
		rows: r,
	};
}
function md() {
	return (
		(gd ??= (async () => {
			if (!navigator.gpu) throw Error(`navigator.gpu unavailable`);
			fd();
			let e = null;
			for (let t = 0; t < 20 && !e; t++)
				((e = await navigator.gpu.requestAdapter({
					powerPreference: `high-performance`,
				})),
					e || (await new Promise((e) => setTimeout(e, 250))));
			if (!e) throw Error(`WebGPU adapter unavailable`);
			let t = [
					`texture-compression-bc`,
					`depth32float-stencil8`,
					`rg11b10ufloat-renderable`,
					`depth-clip-control`,
					`float32-filterable`,
					`float32-blendable`,
					`clip-distances`,
					`dual-source-blending`,
					`timestamp-query`,
				].filter((t) => e.features.has(t)),
				n = {
					maxUniformBuffersPerShaderStage: 16,
					maxStorageBuffersPerShaderStage: 16,
					maxStorageBuffersInVertexStage: 16,
					maxStorageBuffersInFragmentStage: 16,
					maxColorAttachmentBytesPerSample: 64,
				},
				r = globalThis.GEX_GL_LIMITS,
				i = r === void 0 ? 43 : Number(r) || 0;
			if (
				(i >= 41 &&
					Object.assign(n, {
						maxTextureDimension1D: 16384,
						maxTextureDimension2D: 16384,
						maxTextureDimension3D: 2048,
						maxTextureArrayLayers: 2048,
					}),
				i >= 43)
			)
				for (let e of [
					`maxComputeInvocationsPerWorkgroup`,
					`maxComputeWorkgroupSizeX`,
					`maxComputeWorkgroupSizeY`,
					`maxComputeWorkgroupSizeZ`,
					`maxComputeWorkgroupStorageSize`,
					`maxComputeWorkgroupsPerDimension`,
				])
					n[e] = 1 / 0;
			let a = {};
			for (let [t, r] of Object.entries(n)) {
				let n = e.limits[t];
				typeof n == `number` && n > 0 && (a[t] = Math.min(n, r));
			}
			let o = await e.requestDevice({ requiredFeatures: t, requiredLimits: a });
			return (
				(globalThis.__gexWebGPU ||= []).push({
					adapter: e,
					device: o,
					queue: o.queue,
				}),
				{ adapter: e, device: o }
			);
		})()),
		gd.catch(() => {
			gd = null;
		}),
		gd
	);
}
function hd() {
	let e = new OffscreenCanvas(16, 16),
		t = null,
		n = null,
		r = 0,
		i = {
			canvas: e,
			configure(e) {
				t = e;
			},
			unconfigure() {
				t = null;
			},
			getConfiguration() {
				return t;
			},
			getCurrentTexture() {
				if (!t) throw Error(`the GL canvas is not configured`);
				return (
					(!n ||
						n.width !== e.width ||
						n.height !== e.height ||
						n.format !== t.format) &&
						(n?.destroy(),
						(n = t.device.createTexture({
							size: [e.width, e.height],
							format: t.format,
							usage:
								(t.usage ?? GPUTextureUsage.RENDER_ATTACHMENT) |
								GPUTextureUsage.TEXTURE_BINDING |
								GPUTextureUsage.COPY_DST |
								GPUTextureUsage.COPY_SRC,
							viewFormats: t.viewFormats ?? [],
						}))),
					r++,
					n
				);
			},
		},
		a = e.getContext.bind(e);
	return (
		(e.getContext = (e, t) => (e === `webgpu` ? i : a(e, t))),
		{ canvas: e, texture: () => n, serial: () => r }
	);
}
var gd,
	_d,
	vd,
	yd,
	bd,
	xd,
	Sd = o(() => {
		((gd = null),
			(_d = new Map()),
			(vd = new Map()),
			(yd = !1),
			(bd = new Map()),
			(xd = {
				rgba8unorm: 4,
				bgra8unorm: 4,
				"rgba8unorm-srgb": 4,
				"bgra8unorm-srgb": 4,
				depth24plus: 4,
				"depth24plus-stencil8": 4,
				depth32float: 4,
				"depth32float-stencil8": 8,
				rgba16float: 8,
				rgba32float: 16,
				r8unorm: 1,
				rg8unorm: 2,
				r32float: 4,
				depth16unorm: 2,
			}));
	}),
	Cd,
	wd = o(() => {
		Cd = {
			NONE: 0,
			TRUNCATED: 1,
			BAD_OPCODE: 2,
			BAD_ARGUMENT: 3,
			NO_CONTEXT: 4,
			VERSION_MISMATCH: 5,
		};
	});
function Td(e) {
	return (4 - (e & 3)) & 3;
}
function Ed(e, t, n, r = null) {
	let i = se(),
		a =
			r ??
			(i
				? new URLSearchParams(i).get(`glcapture`)
				: ({}.GEX_GLCAPTURE ?? null));
	if (!a || a === `0`) return null;
	let o = Number(a),
		s = new jd(e, t, n, Number.isFinite(o) && o > 1 ? o : Ad);
	return ((globalThis.__gexGlCapture = s), s);
}
var Dd,
	Od,
	kd,
	Ad,
	jd,
	Md = o(() => {
		(le(),
			(Dd = `GEXGLTR\0`),
			(Od = 1),
			(kd = 24),
			(Ad = 67108864),
			(jd = class {
				constructor(e, t, n, r = Ad) {
					let i = new Uint8Array(kd),
						a = new DataView(i.buffer);
					for (let e = 0; e < 8; e++) i[e] = Dd.charCodeAt(e);
					(a.setUint32(8, Od, !0),
						a.setUint32(12, e, !0),
						a.setUint32(16, t, !0),
						a.setUint32(20, n, !0),
						(this.parts = [i]),
						(this.bytes = kd),
						(this.batches = 0),
						(this.maxBytes = r),
						(this.truncated = !1));
				}
				record(e, t) {
					let n = 8 + e.length + Td(e.length);
					if (this.bytes + n > this.maxBytes)
						return ((this.truncated = !0), !1);
					let r = new Uint8Array(n),
						i = new DataView(r.buffer);
					return (
						i.setUint32(0, e.length, !0),
						i.setUint32(4, t, !0),
						r.set(e, 8),
						this.parts.push(r),
						(this.bytes += n),
						this.batches++,
						!0
					);
				}
				toBytes() {
					let e = new Uint8Array(this.bytes),
						t = 0;
					for (let n of this.parts) (e.set(n, t), (t += n.length));
					return e;
				}
				toBase64() {
					let e = this.toBytes(),
						t = ``;
					for (let n = 0; n < e.length; n += 32768)
						t += String.fromCharCode.apply(null, e.subarray(n, n + 32768));
					return btoa(t);
				}
			}));
	}),
	Nd,
	Pd = o(() => {
		Nd = class {
			constructor({
				first: e = 5,
				every: t = 1e4,
				now: n = () => performance.now(),
				log: r = console.error,
			} = {}) {
				((this.count = 0),
					(this.first = null),
					(this.last = null),
					(this.#e = e),
					(this.#t = t),
					(this.#n = n),
					(this.#r = r));
			}
			#e;
			#t;
			#n;
			#r;
			#i = -1 / 0;
			#a = 0;
			note(e) {
				if (
					(this.count++,
					(this.first ??= e),
					(this.last = e),
					this.count <= this.#e)
				)
					return (
						this.#r(`[mesa-gl] WebGPU validation:`, e),
						this.count === this.#e && (this.#i = this.#n()),
						!0
					);
				this.#a++;
				let t = this.#n();
				return t - this.#i < this.#t
					? !1
					: (this.#r(
							`[mesa-gl] WebGPU validation: ${this.#a} more (${this.count} in all), the last:`,
							e,
						),
						(this.#a = 0),
						(this.#i = t),
						!0);
			}
			summary() {
				return this.count
					? `validation=${this.count} (first: ${this.first}) `
					: ``;
			}
		};
	});
function Fd(e, t) {
	return e > t ? { len: t, cut: e - t } : { len: e, cut: 0 };
}
var Id = o(() => {}),
	Ld = c({
		D3D_MAGIC: () => Qd,
		D3D_PROTOCOL_VERSION: () => 1,
		MesaGlDevice: () => ef,
	});
async function Rd(e) {
	try {
		return (await import(/* @vite-ignore */ /* webpackIgnore: true */ e))
			.default;
	} catch {}
	let t = await fetch(e, { cache: `no-store` });
	if (!t.ok) throw Error(`${e}: ${t.status} ${t.statusText}`);
	let n = URL.createObjectURL(
		new Blob([await t.text()], { type: `text/javascript` }),
	);
	try {
		return (await import(/* @vite-ignore */ /* webpackIgnore: true */ n))
			.default;
	} finally {
		URL.revokeObjectURL(n);
	}
}
async function zd(e, t) {
	let n = new URL(/* @vite-ignore */ /* webpackIgnore: true */ e, location.href)
			.href,
		r = n.split(`/`).pop().replace(/\.js$/, ``),
		[i, a, o] = await Promise.all(
			[`${r}.js`, `${r}.wasm`, `${r}.deferred.wasm`].map((e) =>
				Promise.resolve()
					.then(() => t(e))
					.catch(
						(t) => (
							console.warn(
								`[mesa-gl] ${e}: ${t?.message ?? t}; fetched as a file`,
							),
							null
						),
					),
			),
		);
	if (!i) return null;
	let s = new TextDecoder()
			.decode(i)
			.replaceAll(`import.meta.url`, JSON.stringify(n)),
		c = new Blob([s], { type: `text/javascript` }),
		l = URL.createObjectURL(c),
		u;
	try {
		u = (await import(/* @vite-ignore */ /* webpackIgnore: true */ l)).default;
	} finally {
		URL.revokeObjectURL(l);
	}
	let d = { mainScriptUrlOrBlob: c },
		f,
		p = new Promise((e, t) => {
			f = t;
		});
	if (a) {
		let e = await WebAssembly.compile(a),
			t = WebAssembly.Module.imports(e).some((e) => e.module === `gexcold`);
		if (!t || o) {
			let n = t ? await WebAssembly.compile(o) : null;
			((d.gexNoColdPrefetch = !0),
				(d.instantiateWasm = (t, r) => {
					let i = () => {
							throw Error(
								`Mesa's cold part was not instantiated with the module`,
							);
						},
						a = new Proxy(t, {
							get: (e, t) => (t === `gexcold` ? { load: i } : e[t]),
						});
					return (
						(async () => {
							let t = await WebAssembly.instantiate(e, a);
							(n && (await WebAssembly.instantiate(n, { primary: t.exports })),
								r(t, e));
						})().catch((e) =>
							f(Error(`instantiating Mesa failed: ${e?.message ?? e}`)),
						),
						{}
					);
				}));
		}
	}
	return { factory: u, extra: d, failed: p };
}
function Bd() {
	if (Bd.done || typeof GPUQueue > `u`) return;
	Bd.done = !0;
	let e = (e) => {
			let t = $d.get(e);
			return (t || $d.set(e, (t = [0, 0, 0, 0])), t);
		},
		t = (t, n, r) => {
			let i = t?.[n];
			typeof i == `function` &&
				(t[n] = function (...t) {
					let a = performance.now(),
						o = i.apply(this, t),
						s = e(n);
					if ((s[0]++, (s[1] += performance.now() - a), r))
						try {
							s[2] += r(t) || 0;
						} catch {}
					return (
						o &&
							typeof o.then == `function` &&
							o.then(
								() => {
									s[3] += performance.now() - a;
								},
								() => {},
							),
						o
					);
				});
		},
		n = (e, t, n) => {
			let r = e?.BYTES_PER_ELEMENT ?? 1;
			return n === void 0 ? (e?.byteLength ?? 0) - (t ?? 0) * r : n * r;
		};
	(t(GPUQueue.prototype, `writeBuffer`, (e) => n(e[2], e[3], e[4])),
		t(GPUQueue.prototype, `writeTexture`, (e) => e[1]?.byteLength ?? 0),
		t(GPUQueue.prototype, `submit`),
		t(GPUQueue.prototype, `onSubmittedWorkDone`),
		t(GPUCommandEncoder.prototype, `finish`),
		t(GPUCommandEncoder.prototype, `beginRenderPass`),
		t(GPUCommandEncoder.prototype, `copyBufferToBuffer`),
		t(GPUCommandEncoder.prototype, `copyBufferToTexture`),
		t(GPUCommandEncoder.prototype, `copyTextureToTexture`),
		t(GPUDevice.prototype, `createCommandEncoder`),
		t(GPUDevice.prototype, `createBindGroup`),
		t(GPUDevice.prototype, `createBuffer`, (e) => e[0]?.size ?? 0),
		t(GPUDevice.prototype, `createTexture`),
		t(GPUDevice.prototype, `createRenderPipeline`),
		t(GPUBuffer.prototype, `mapAsync`),
		t(GPURenderPassEncoder.prototype, `draw`),
		t(GPURenderPassEncoder.prototype, `drawIndexed`),
		t(GPURenderPassEncoder.prototype, `setBindGroup`),
		t(GPURenderPassEncoder.prototype, `setPipeline`));
}
function Vd(e) {
	try {
		return globalThis.document !== void 0 && O().get(e) === `1`;
	} catch {
		return !1;
	}
}
function Hd(e, t) {
	if (t) return e;
	let n = new Map();
	return (t) => {
		let r = /^gex-wgpu: ([a-z -]{4,40}?)(?: --|:| [0-9])/.exec(String(t));
		if (r) {
			let e = performance.now(),
				t = n.get(r[1]);
			if (t !== void 0 && e - t < 6e4) return;
			n.set(r[1], e);
		}
		e(t);
	};
}
function Ud(e, t, n) {
	return new Promise((r, i) => {
		let a = indexedDB.open(`gex-wgsl-cache`, 1);
		((a.onupgradeneeded = () => a.result.createObjectStore(`blobs`)),
			(a.onerror = () => i(a.error)),
			(a.onsuccess = () => {
				let o = a.result,
					s = o.transaction(`blobs`, e === `get` ? `readonly` : `readwrite`),
					c =
						e === `get`
							? s.objectStore(`blobs`).get(t)
							: s.objectStore(`blobs`).put(n, t);
				((c.onsuccess = () => r(c.result)),
					(c.onerror = () => i(c.error)),
					(s.oncomplete = () => o.close()));
			}));
	});
}
var Wd,
	Gd,
	Kd,
	qd,
	Jd,
	Yd,
	Xd,
	Zd,
	Qd,
	$d,
	ef,
	tf = o(() => {
		(Sd(),
			wd(),
			Md(),
			le(),
			Vt(),
			Pd(),
			Id(),
			(Wd = 0),
			(Gd = 1),
			(Kd = 2),
			(qd = 3),
			(Jd = 4),
			(Yd = 5),
			(Xd = 6),
			(Zd = 7),
			(Qd = 1144210503),
			($d = new Map()),
			(ef = class e {
				#e = null;
				#t = null;
				#n = null;
				#r = null;
				#i = null;
				#a = null;
				#o = new Nd();
				#s = 0;
				#c = 0;
				#l = ``;
				#u = ``;
				#d = 0;
				#f = 0;
				#p = 0;
				#m = 0;
				#h = 0;
				#g = 0;
				#_ = !1;
				#v = [];
				#y = [];
				#b = !1;
				#x = 0;
				#S = 0;
				static #C = !1;
				static async create(t, n = {}) {
					let {
							api: r = `es`,
							major: i = 0,
							minor: a = 0,
							url: o = k(`/gex/gex-wgpu-replay.js`),
						} = n,
						s = new e();
					t.id = `gex-gl`;
					try {
						let { adapter: e, device: c } = n.gpu ?? (await md());
						((s.#e = e), (s.#t = c), (n.wgpuStats ?? Vd(`wgpustats`)) && Bd());
						{
							let e = c.destroy.bind(c);
							c.destroy = () => {
								(console.error(
									`[mesa-gl] the WebGPU device is being destroyed`,
									Error(`destroy`).stack,
								),
									e());
							};
						}
						(c.lost.then((e) => {
							let t = `${e.reason}: ${e.message}`;
							(console.error(`[mesa-gl] WebGPU device lost:`, t),
								(s.#a ||= `WebGPU device lost: ${t}`));
						}),
							c.addEventListener(`uncapturederror`, (e) => {
								s.#o.note(e.error?.message || String(e.error));
							}));
						let l = performance.now(),
							u = n.source ? await zd(o, n.source) : null,
							d = (u?.factory ?? (await Rd(o)))({
								preinitializedWebGPUDevice: c,
								mainScriptUrlOrBlob: new URL(
									/* @vite-ignore */ /* webpackIgnore: true */ o,
									location.href,
								).href,
								locateFile: (e) =>
									(n.files ?? ce(`/gex/`))?.[e] ??
									new URL(
										/* @vite-ignore */ /* webpackIgnore: true */ e,
										new URL(
											/* @vite-ignore */ /* webpackIgnore: true */ o,
											location.href,
										),
									).href,
								print: (e) => L(`debug`) && console.log(`[mesa-gl]`, e),
								printErr: Hd(
									(e) => console.warn(`[mesa-gl]`, e),
									n.glTrace ?? Vd(`gltrace`),
								),
								...u?.extra,
							});
						((s.#n = await (u ? Promise.race([d, u.failed]) : d)),
							L(`debug`) &&
								console.warn(
									`[mesa-gl] Mesa loaded${u ? ` from the page's files` : ``} in ${Math.round(performance.now() - l)} ms`,
								),
							(s.#r = WebAssembly.promising(s.#n.gexGlSubmitRaw)),
							s.#n.gexD3dSubmitRaw &&
								(s.#i = WebAssembly.promising(s.#n.gexD3dSubmitRaw)),
							s.#n._gex_gl_set_api &&
								s.#n._gex_gl_set_api(+(r === `core`), i, a));
						for (let e of (n.env || ``).split(`,`).filter(Boolean)) {
							if (!s.#n._gex_gl_setenv) break;
							let t = new TextEncoder().encode(`${e}\0`),
								n = s.#n._malloc(t.length);
							(s.#n.HEAPU8.set(t, n), s.#n._gex_gl_setenv(n), s.#n._free(n));
						}
						await s.#E(o, n.wgslCache ?? `all`);
						let f = s.#n._gex_gl_init(t.width, t.height);
						(f !== 0 && (s.#a = `Mesa/WebGPU initialization failed (${f})`),
							(s.#u = `Mesa st/mesa + gex_wgpu on WebGPU (${r})`),
							(s.capture = Ed(13, t.width, t.height, n.capture)));
					} catch (e) {
						s.#a = e?.message || String(e);
					}
					return s;
				}
				#w = null;
				#T = 0;
				async #E(e, t) {
					let n = this.#n;
					if (!n._gex_wgsl_cache_load || t === `0`) return;
					let r = new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ e,
						location.href,
					);
					this.#w = r.href;
					let i = (e, t) => {
						if (!e?.byteLength) return;
						let r = n._malloc(e.byteLength);
						n.HEAPU8.set(new Uint8Array(e), r);
						let i = n._gex_wgsl_cache_load(r, e.byteLength);
						(n._free(r),
							L(`debug`) &&
								console.log(
									`[mesa-gl] shader cache: ${i < 0 ? `refused (another build)` : `${i} translations`} from ${t}`,
								));
					};
					try {
						let e = await fetch(new URL(`gex-wgsl-cache.bin`, r));
						e.ok && i(await e.arrayBuffer(), `the site`);
					} catch {}
					if (t === `site`) {
						this.#w = null;
						return;
					}
					try {
						i(await Ud(`get`, this.#w), `this browser`);
					} catch {}
					let a = setInterval(() => this.#D(), 5e3);
					(globalThis.__gexWgslTimers ||= []).push(a);
				}
				wgslCache(e = !1) {
					let t = this.#n;
					if (!t?._gex_wgsl_cache_dump) return null;
					let n = t._malloc(4),
						r = t._gex_wgsl_cache_dump(+!!e, n),
						i = new Uint32Array(t.HEAPU8.buffer, n, 1)[0];
					if ((t._free(n), !r)) return null;
					let a = t.HEAPU8.slice(r, r + i).buffer;
					return (t._free(r), a);
				}
				wgslStats() {
					let e = this.#n;
					if (!e?._gex_wgsl_cache_stats) return null;
					let t = e._malloc(16);
					e._gex_wgsl_cache_stats(t);
					let [n, r, i, a] = new Uint32Array(e.HEAPU8.buffer, t, 4);
					return (e._free(t), { hits: n, misses: r, loaded: i, held: a });
				}
				async #D() {
					let e = this.wgslStats();
					if (!(!this.#w || !e || e.misses === this.#T)) {
						this.#T = e.misses;
						try {
							await Ud(`put`, this.#w, this.wgslCache());
						} catch {}
					}
				}
				get ok() {
					return this.#n !== null && this.#a === null;
				}
				get error() {
					return this.#a;
				}
				get validationError() {
					return this.#o.first;
				}
				get validationCount() {
					return this.#o.count;
				}
				describe() {
					return this.#a ? `unavailable: ${this.#a}` : this.#u;
				}
				stats() {
					return `${this.#d} submits, ${(this.#f / 1024) | 0} KiB`;
				}
				submit(t, n, r = 0) {
					if (!this.#n) return -1;
					let i = new Uint32Array(t.buffer, n, 8),
						a = i[Wd] === Qd;
					if ((!a && i[Wd] !== 1196967239) || (a && !this.#i)) return -1;
					if (i[Zd] !== (a ? 1 : 13))
						return ((i[Yd] = Cd.VERSION_MISMATCH), -1);
					let o = i[Gd],
						s = i[Kd],
						c = i[qd];
					if (s > o) return -1;
					let l = performance.now();
					(this.#d++, (this.#f += s));
					let u = new Uint8Array(t.buffer, n + 32, s);
					if (
						!a &&
						this.capture &&
						!this.capture.record(u, c) &&
						!this.capture.posted
					) {
						this.capture.posted = !0;
						let e = this.capture.toBytes();
						((this.capture = null),
							fetch(`/__gex_capture`, { method: `POST`, body: e }).catch(
								() => {},
							));
					}
					let d = a && this.statsOn,
						f = d ? performance.now() : 0,
						p = this.#n._malloc(s || 1);
					s && this.#n.HEAPU8.set(u, p);
					let m = d ? performance.now() : 0,
						h = (e) => {
							d &&
								this.#n._gex_d3d_note_js(
									m - f,
									performance.now() - m,
									+!!this.#n._gex_d3d_reply_len(),
								);
							let i = new Uint32Array(t.buffer, n, 8),
								s = performance.now() - l;
							this.#p += s;
							let u = this.#n,
								h = a ? u._gex_d3d_reply_len : u._gex_gl_reply_len,
								g = a ? u._gex_d3d_reply_data : u._gex_gl_reply_data;
							if (
								((h?.() ?? 0) >= 262144 && (this.#m++, (this.#h += s)),
								s > this.#g && (this.#g = s),
								this.#n._free(p),
								e !== 0)
							) {
								if ((this.#s++, a))
									return (
										(this.#l = `client ${r} D3D stream refused (${e})`),
										console.error(`[mesa-gl] ${this.#l}`),
										(i[Yd] = Cd.BAD_OPCODE),
										(i[Jd] = 0),
										(i[Kd] = 0),
										(i[Xd] = 0),
										e
									);
								let t =
									[
										``,
										`short read`,
										`trailing data`,
										`unknown opcode`,
										`no context`,
									][u._gex_gl_reject_why?.() ?? 0] || `refused`;
								return (
									(this.#l = `client ${r} batch rejected (${e}): opcode ${u._gex_gl_reject_op?.() ?? `?`} ${t}, payload ${u._gex_gl_reject_payload?.() ?? `?`}`),
									console.error(`[mesa-gl] ${this.#l}`),
									(i[Yd] = Cd.BAD_OPCODE),
									(i[Jd] = 0),
									(i[Kd] = 0),
									(i[Xd] = 0),
									e
								);
							}
							let _ = Fd(h(), c),
								v = _.len;
							if (
								(_.cut &&
									(this.#c++ ||
										console.error(
											`[mesa-gl] client ${r}: a reply ${_.cut} bytes over the ring's ${c}; cut, as natively`,
										)),
								v)
							) {
								let e = g();
								new Uint8Array(t.buffer, n + 32 + o, v).set(
									this.#n.HEAPU8.subarray(e, e + v),
								);
							}
							return (
								(i[Kd] = 0),
								(i[Jd] = v),
								(i[Yd] = Cd.NONE),
								(i[Xd] = 0),
								0
							);
						};
					this.#_ = !0;
					let g = (e) => {
							this.#k();
							let t = h(e);
							return (
								this.#b &&
									((this.#b = !1),
									this.display(),
									this.presentedCount(),
									this.producedCount()),
								t
							);
						},
						_ = (t) => {
							throw (
								this.#k(),
								e.#C ||
									((e.#C = !0),
									String(t?.stack || ``)
										.split(
											`
`,
										)
										.slice(0, 8)
										.forEach((e, t) => {
											let n = e.match(/wasm\.([A-Za-z_][A-Za-z0-9_]*)/);
											console.error(
												`[mesa-gl] frame` +
													t +
													` ` +
													(n ? n[1] : e.trim().slice(0, 52)),
											);
										})),
								t
							);
						},
						v;
					try {
						v = (a ? this.#i : this.#r)(p, s, r >>> 0);
					} catch (e) {
						return _(e);
					}
					return v instanceof Promise ? v.then(g, _) : g(v);
				}
				attachment() {
					let e = this.#n;
					return e?._gex_gl_attached_id
						? {
								kind: e._gex_gl_attached_kind(),
								id: e._gex_gl_attached_id(),
								token: e._gex_gl_attached_token(),
								generation: e._gex_gl_attached_generation(),
							}
						: null;
				}
				surfaces() {
					let e = this.#n;
					if (!e?._gex_gl_surface_count) {
						let e = this.attachment();
						return e && e.id ? [{ ...e, frame: 0, client: e.token }] : [];
					}
					let t = [],
						n = e._gex_gl_surface_count();
					for (let r = 0; r < n; r++)
						t.push({
							kind: e._gex_gl_surface_kind(r),
							id: e._gex_gl_surface_id(r),
							token: e._gex_gl_surface_token(r),
							client: e._gex_gl_surface_client(r),
							frame: e._gex_gl_surface_frame(r),
							width: e._gex_gl_surface_width(r),
							height: e._gex_gl_surface_height(r),
						});
					return t;
				}
				surfaceCanvas(e, t) {
					let n = this.#n;
					if (!(!n?._gex_gl_surface_canvas || !e)) {
						if (this.#_) {
							this.#y.push([e >>> 0, +!!t]);
							return;
						}
						n._gex_gl_surface_canvas(e >>> 0, +!!t);
					}
				}
				forgetClient(e) {
					let t = this.#n;
					if (!(!t?._gex_gl_forget_client || !e)) {
						if (this.#_) {
							(console.log(
								`[mesa-gl] client ${e} exited mid-submit: forgotten after it`,
							),
								this.#v.push(e >>> 0));
							return;
						}
						(t._gex_d3d_forget_client?.(e >>> 0),
							t._gex_gl_forget_client(e >>> 0));
					}
				}
				get statsOn() {
					return (
						this.#O === void 0 && (this.#O = !!this.#n?._gex_d3d_stats_on?.()),
						this.#O
					);
				}
				#O = void 0;
				noteBridge(e, t, n, r, i) {
					this.#_ || this.#n?._gex_d3d_note_bridge?.(e, t, n, r, i);
				}
				get hasD3d() {
					return !!this.#i;
				}
				#k() {
					this.#_ = !1;
					let e = this.#v.splice(0);
					for (let t of e) this.forgetClient(t);
					for (let [e, t] of this.#y.splice(0)) this.surfaceCanvas(e, t);
				}
				display() {
					return this.#_
						? ((this.#b = !0), 0)
						: (this.#n?._gex_gl_display?.() ?? 0);
				}
				presentedCount() {
					return (
						this.#_ || (this.#x = this.#n?._gex_gl_presented?.() ?? 0),
						this.#x
					);
				}
				producedCount() {
					return (
						this.#_ || (this.#S = this.#n?._gex_gl_produced?.() ?? 0),
						this.#S
					);
				}
				attachChannel() {
					return null;
				}
				refresh() {
					return Promise.resolve();
				}
				traceCommands() {}
				glState() {
					return this.ok
						? (this.#s ? `rejects=${this.#s} (${this.#l}) ` : ``) +
								(this.#c ? `reply-cuts=${this.#c} ` : ``) +
								this.#o.summary() +
								`presented=${this.presentedCount()} produced=${this.producedCount()} mesa=1 submits=${this.#d} bytes=${this.#f} submit_ms=${this.#p.toFixed(1)} avg_ms=${(this.#p / Math.max(1, this.#d)).toFixed(3)} max_ms=${this.#g.toFixed(1)} readbacks=${this.#m} readback_ms=${this.#h.toFixed(1)}` +
								this.#j()
						: (this.#a ?? ``);
				}
				#A = { frames: 0, calls: new Map() };
				#j() {
					if (!$d.size) return ``;
					let e = this.producedCount(),
						t = Math.max(1, e - this.#A.frames),
						n = [];
					for (let [e, r] of [...$d].sort((e, t) => t[1][1] - e[1][1])) {
						let i = this.#A.calls.get(e) ?? [0, 0, 0, 0],
							a = r.map((e, t) => e - i[t]);
						if (!a[0]) continue;
						let o = `${e} ${(a[0] / t).toFixed(1)}/${(a[1] / t).toFixed(2)}ms`;
						(a[2] && (o += `/${(a[2] / t / 1024).toFixed(0)}KiB`),
							a[3] && (o += `/wait ${(a[3] / t).toFixed(2)}ms`),
							n.push(o));
					}
					return (
						(this.#A = {
							frames: e,
							calls: new Map([...$d].map(([e, t]) => [e, [...t]])),
						}),
						` wgpu per frame over ${t}: ${n.join(`, `)}`
					);
				}
				commands() {
					return null;
				}
				dispose() {
					((this.#n = null), (this.#r = null));
				}
			}));
	}),
	nf = c({
		DomDesktop: () => cf,
		ROLE_CURSOR: () => 4,
		ROLE_POPUP: () => 2,
		ROLE_SUBSURFACE: () => 3,
		ROLE_TOPLEVEL: () => 1,
	});
function rf(e, t) {
	e.role === 1 &&
		R(`win`) &&
		console.log(
			`[win] ${t} ${e.key} ${e.width}x${e.height} "${e.title ?? ``}"`,
		);
}
function af(e, t, n, r = !1) {
	let {
		x: i,
		y: a,
		w: o,
		h: s,
	} = !r && e.damage && e.damage.w > 0 && e.damage.h > 0
		? e.damage
		: { x: 0, y: 0, w: e.width, h: e.height };
	return o <= 0 || s <= 0
		? { x: 0, y: 0, w: 0, h: 0 }
		: ((i = Math.max(0, Math.min(i, t))),
			(a = Math.max(0, Math.min(a, n))),
			(o = Math.min(o, t - i)),
			(s = Math.min(s, n - a)),
			{ x: i, y: a, w: o, h: s });
}
var of,
	sf,
	cf,
	lf = o(() => {
		(Fa(),
			le(),
			al(),
			Vt(),
			(of = (e) => `${e.token}:${e.client}:${e.surface}`),
			(sf = class {
				constructor(e, t, n) {
					((this.key = t),
						(this.token = n.token),
						(this.block = n.block),
						(this.client = n.client),
						(this.surface = n.surface),
						(this.role = n.role),
						(this.parent = n.parent),
						(this.width = n.width),
						(this.height = n.height),
						(this.title = n.title),
						(this.decorations =
							n.role === 1 && !(n.placed && n.unmanaged) ? `server` : `none`),
						(this.placed = !!n.placed),
						(this.layer = n.layer || 0),
						(this.stackId = n.stackId || 0),
						(this.restack = 0),
						(this.activate = 0),
						(this.onrestack = null),
						(this.external = !!n.external),
						(this.xid = n.xid || 0),
						(this.glCanvas = null),
						(this.glFrame = 0),
						(this.canvas = document.createElement(`canvas`)),
						(this.canvas.width = Math.max(1, n.width)),
						(this.canvas.height = Math.max(1, n.height)),
						(this.canvas.style.display = `block`),
						(this.canvas.style.touchAction = `none`),
						(this.x = 0),
						(this.y = 0),
						(this.relX = n.relX),
						(this.relY = n.relY),
						(this.serial = -1),
						(this.paints = 0),
						(this.onretitle = null),
						(this.onresized = null),
						(this.onplace = null),
						(this.onclosed = null),
						(this.onrequest = null),
						(this.requestSeq = void 0),
						(this.onfullscreen = null),
						(this.fullscreen = !1),
						(this.states = 0),
						(this.bufferScale = 1),
						(this.#e = e));
				}
				#e;
				#t = null;
				#n = null;
				#r = !1;
				place(e, t) {
					((this.x = Math.round(e)),
						(this.y = Math.round(t)),
						this.#e.moved(this));
				}
				resize(e, t) {
					this.#e.configure(
						this,
						Math.max(1, Math.round(e)),
						Math.max(1, Math.round(t)),
					);
				}
				setStates(e, t = this.width, n = this.height) {
					((this.states = e & -2),
						this.#e.configure(
							this,
							Math.max(1, Math.round(t)),
							Math.max(1, Math.round(n)),
						));
				}
				close() {
					this.#e.close(this);
				}
				focus() {
					this.#e.focus(this);
				}
				showGlCanvas(e) {
					if (!this.canvas.isConnected) return !1;
					let t = this.glCanvas;
					return (
						t ||
							((t = document.createElement(`canvas`)),
							(t.style.position = `absolute`),
							(t.style.pointerEvents = `none`),
							(t.style.touchAction = `none`),
							(this.glCanvas = t)),
						(t.id = `gex-gl-${e}`),
						(this.glFrame = e),
						this.placeGl(),
						!0
					);
				}
				placeGl() {
					let e = this.glCanvas;
					if (!e) return;
					let t = this.canvas;
					e.previousSibling !== t && t.isConnected && t.after(e);
					let n =
						!t.isConnected ||
						t.style.display === `none` ||
						t.style.visibility === `hidden`;
					if (((e.style.display = n ? `none` : `block`), n)) return;
					let r = t.style.zIndex || getComputedStyle(t).zIndex,
						i = r === `auto` ? `` : r;
					e.style.zIndex !== i && (e.style.zIndex = i);
					let a = `${t.offsetLeft}px`,
						o = `${t.offsetTop}px`,
						s = `${t.offsetWidth}px`,
						c = `${t.offsetHeight}px`;
					(e.style.left !== a && (e.style.left = a),
						e.style.top !== o && (e.style.top = o),
						e.style.width !== s && (e.style.width = s),
						e.style.height !== c && (e.style.height = c));
				}
				dropGl() {
					(this.glCanvas?.remove(), (this.glCanvas = null), (this.glFrame = 0));
				}
				#i() {
					return (
						(this.#t ||= this.canvas.getContext(`2d`, { alpha: !0 })),
						this.#t
					);
				}
				paint(e, t, n = !1) {
					this.paints++ === 0 && rf(this, `painted`);
					let {
						x: r,
						y: i,
						w: a,
						h: o,
					} = af(t, this.canvas.width, this.canvas.height, n);
					if (a <= 0 || o <= 0) return;
					let s = t.addr + (i + o - 1) * t.stride + (r + a) * 4;
					if (s > e.length) {
						this.#r ||
							((this.#r = !0),
							console.warn(
								`[dom-desktop] ${this.title}: buffer ends at ${s}, memory is ${e.length}`,
							));
						return;
					}
					let c = this.#i();
					(!this.#n || this.#n.width !== a || this.#n.height !== o) &&
						(this.#n = c.createImageData(a, o));
					let l = this.#n.data,
						u = t.stride,
						d = 0;
					for (let n = 0; n < o; n++) {
						let o = t.addr + (i + n) * u + r * 4;
						for (let n = 0; n < a; n++, o += 4, d += 4)
							((l[d] = e[o + 2]),
								(l[d + 1] = e[o + 1]),
								(l[d + 2] = e[o]),
								(l[d + 3] = t.format === 1 ? 255 : e[o + 3]));
					}
					c.putImageData(this.#n, r, i);
				}
			}),
			(cf = class e {
				static STATE_MAXIMIZED = 2;
				static STATE_RESIZING = 4;
				static STATE_FULLSCREEN = 8;
				#e;
				#t;
				#n = new Map();
				#r = new Map();
				#i = null;
				#a = [];
				#o = null;
				#s = 0;
				#c = !1;
				#l = null;
				#u = [];
				#d = new Set();
				#f = -1;
				onwindow = null;
				#p = null;
				#m = null;
				#h = !1;
				#g = null;
				#_ = [];
				#v = !1;
				onwindowgone = null;
				pointerLock = !1;
				onpointerlock = null;
				#y = null;
				#b = null;
				#x = () => {
					let e = document.pointerLockElement,
						t = e
							? ([...this.#n.values()].find((t) => t.canvas === e) ?? null)
							: null;
					if (t === this.#y) return;
					let n = Math.round(performance.now());
					(this.#y &&
						U(
							this.#e,
							this.#y.block,
							15,
							0,
							0,
							n,
							0,
							this.#y.client,
							this.#y.surface,
						),
						(this.#y = t),
						t && U(this.#e, t.block, 15, 1, 0, n, 0, t.client, t.surface),
						this.onpointerlock?.(t));
				};
				static create(t, n, { width: r, height: i } = {}) {
					let a = new e();
					return (
						(a.#t = t),
						(a.#e = n),
						Ti(n, r || t.clientWidth || 1280, i || t.clientHeight || 760),
						a.#L(),
						document.addEventListener(`pointerlockchange`, a.#x),
						(a.#c = !0),
						(a.#s = requestAnimationFrame(() => a.#T())),
						a
					);
				}
				resizeOutput(e, t, n) {
					(this.#D++,
						Ti(
							this.#e,
							Math.max(1, Math.round(e)),
							Math.max(1, Math.round(t)),
							n,
						));
				}
				async hostGl(e, t = {}) {
					let n = document.createElement(`canvas`);
					((n.style.position = `absolute`),
						(n.style.top = `0`),
						(n.style.left = `-99999px`),
						(n.style.pointerEvents = `none`),
						(n.width = Math.max(640, this.#t.clientWidth || 1280)),
						(n.height = Math.max(480, this.#t.clientHeight || 760)),
						(n.style.touchAction = `none`),
						this.#t.append(n),
						(this.#m = n));
					let { MesaGlDevice: r } = await Promise.resolve().then(
							() => (tf(), Ld),
						),
						i = await r.create(n, {
							url: t.url,
							source: t.source,
							api: t.api || `core`,
							env: O().get(`mesaenv`) ?? void 0,
							wgslCache: O().get(`wgslcache`) ?? void 0,
							preserve: !0,
						});
					if (!i.ok)
						throw (
							this.onglfailed?.(i.error),
							Error(i.error || `the GL device would not start`)
						);
					this.#p = i;
					let { serveGl: a } = await Promise.resolve().then(() => (gi(), Br));
					return (
						(this.#g = a(i, e)),
						(this.#h = !0),
						this.ongl?.(i.describe()),
						i.describe()
					);
				}
				ongl = null;
				onglfailed = null;
				get gl() {
					return this.#p;
				}
				addMemory(e, t, n) {
					(this.#D++,
						Ii(this.#e, n),
						t &&
							!this.#e.pixels &&
							this.#r.set(e, { memory: t, view: new Uint8Array(t.buffer) }));
				}
				addPixels(e, t, n, r) {
					(this.#D++,
						r && this.#C.delete(r),
						t && n && this.#C.set(t, { token: e, view: new Uint8Array(n) }));
				}
				#S(e) {
					return this.#e.pixels
						? (this.#C.get(e.pix)?.view ?? null)
						: this.#w(e.token);
				}
				#C = new Map();
				#w(e) {
					let t = this.#r.get(e);
					if (!t) return null;
					let n = t.memory.buffer;
					return (
						(t.view.buffer !== n || t.view.length !== n.byteLength) &&
							(t.view = new Uint8Array(n)),
						t.view
					);
				}
				dropMemory(e) {
					(this.#D++, this.#r.delete(e));
					for (let [t, n] of this.#C) n.token === e && this.#C.delete(t);
					(Ai(this.#e, e), this.#p?.forgetClient?.(e));
				}
				stop() {
					((this.#c = !1),
						document.removeEventListener(`pointerlockchange`, this.#x),
						this.#y && document.exitPointerLock?.(),
						this.#s && cancelAnimationFrame(this.#s),
						(this.#s = 0));
					for (let e of this.#n.values()) e.onclosed?.();
					(this.#n.clear(),
						this.#g?.stop?.(),
						(this.#g = null),
						(this.#h = !1));
					let e = this.#p;
					this.#p = null;
					for (let e of this.#n.values()) e.dropGl();
					((this.#_ = []), e?.dispose?.());
					let t = this.#m;
					((this.#m = null), t?.remove());
				}
				records() {
					return this.#u;
				}
				windows() {
					return [...this.#n.values()];
				}
				windowAt(e, t) {
					let n = [...this.#n.values()];
					for (let r of document.elementsFromPoint(e, t)) {
						let i = n.find((e) => e.canvas === r || e.glCanvas === r);
						if (!i) continue;
						let a = i;
						for (let e = 0; a.parent && e < 16; e++) {
							let e = n.find(
								(e) =>
									e.token === a.token &&
									e.client === a.client &&
									e.surface === a.parent,
							);
							if (!e) break;
							a = e;
						}
						let o = r.getBoundingClientRect();
						return {
							key: i.key,
							client: i.client,
							block: i.block,
							surface: i.surface,
							title: a.title || ``,
							x: Math.round(e - o.left),
							y: Math.round(t - o.top),
						};
					}
					return null;
				}
				focused() {
					return this.#i;
				}
				#T() {
					if (this.#c) {
						try {
							(this.#h && (this.#F(), this.#p?.display?.()),
								this.#A() || this.#j());
						} catch (e) {
							console.error(`[dom-desktop]`, e);
						}
						this.#s = requestAnimationFrame(() => this.#T());
					}
				}
				#E = ji();
				#D = 1;
				#O = 0;
				#k = !1;
				#A() {
					return this.#D === this.#O && !this.#k && Pi(this.#e, this.#E);
				}
				#j() {
					this.#k = !1;
					let e = this.#D,
						{ surfaces: t, blocks: n } = Oi(this.#e),
						r = new Set();
					this.#u = t;
					for (let e of t) {
						let t = of(e);
						r.add(t);
						let n = this.#n.get(t);
						(n ||
							((n = new sf(this, t, e)),
							this.#n.set(t, n),
							this.#I(n),
							e.role === 4 ? (this.#l = n) : this.onwindow?.(n),
							rf(n, `new`),
							e.role === 1 && !e.placed && this.focus(n)),
							this.#M(n, e));
					}
					for (let [e, t] of [...this.#n])
						if (!r.has(e)) {
							if (
								(this.#n.delete(e),
								(this.#a = this.#a.filter((e) => e !== t)),
								this.#b === t && (this.#b = null),
								this.#i === t)
							) {
								this.#i = null;
								let e = [...this.#a]
									.reverse()
									.find((e) => this.#n.get(e.key) === e);
								e && this.focus(e);
							}
							(this.#l === t &&
								((this.#l = null), (this.#f = -1), this.#P(`default`)),
								t.glFrame && this.#p?.surfaceCanvas?.(t.glFrame, !1),
								t.dropGl(),
								t.onclosed?.(),
								this.onwindowgone?.(t));
						}
					for (let e of n) Fi(this.#e, e.block, e.gen);
					(Ni(this.#E, n), (this.#O = e));
				}
				#M(e, t) {
					(t.title !== e.title &&
						((e.title = t.title), e.onretitle?.(t.title), rf(e, `title`)),
						(t.width !== e.width || t.height !== e.height) &&
							((e.width = t.width),
							(e.height = t.height),
							(e.canvas.width = Math.max(1, t.width)),
							(e.canvas.height = Math.max(1, t.height)),
							e.onresized?.(t.width, t.height)),
						(e.bufferScale = (t.flags >> 8) & 255 || 1));
					let n = (t.flags >> 3) & 15;
					if (e.requestSeq === void 0) e.requestSeq = n;
					else if (n !== e.requestSeq && t.role === 1 && !t.placed) {
						e.requestSeq = n;
						let r = (t.flags >>> 24) & 127,
							i = [`none`, `move`, `resize`, `maximize`, `unmaximize`][r & 7];
						i && i !== `none` && e.onrequest?.(i, (r >> 3) & 15);
					}
					let r = !!(t.flags & 1) && t.role === 1 && !t.placed;
					r !== e.fullscreen && ((e.fullscreen = r), e.onfullscreen?.(r));
					let i = !!e.wantsLock;
					((e.wantsLock = (t.flags & qi) !== 0),
						!e.wantsLock && this.#y === e && document.exitPointerLock?.(),
						e.wantsLock &&
							!i &&
							this.pointerLock &&
							this.#b === e &&
							!this.#y &&
							navigator.userActivation?.isActive &&
							document.pointerLockElement !== e.canvas &&
							e.canvas.requestPointerLock?.()?.catch?.(() => {}));
					let a = !ki(t);
					if (
						(a !== e.noInput &&
							((e.noInput = a),
							(e.canvas.style.pointerEvents = a ? `none` : ``)),
						(e.placed = !!t.placed),
						(e.layer = t.layer || 0),
						(e.stackId = t.stackId || 0),
						(t.role !== 1 || t.placed) &&
							(t.relX !== e.relX || t.relY !== e.relY) &&
							((e.relX = t.relX),
							(e.relY = t.relY),
							globalThis.__gexEvLog?.push([
								`place`,
								t.relX,
								t.relY,
								performance.now(),
							]),
							e.onplace?.(t.relX, t.relY, e.parent)),
						t.placed &&
							t.restack !== e.restack &&
							((e.restack = t.restack), e.onrestack?.(t.below)),
						t.placed &&
							t.activate !== e.activate &&
							((e.activate = t.activate), this.focus(e)),
						!t.addr || t.serial === e.serial)
					)
						return;
					let o = e.serial,
						s = this.#S(t);
					(s ? (e.serial = t.serial) : (this.#k = !0),
						s
							? e.paint(s, t, o < 0 || t.serial !== o + 1)
							: !this.#e.pixels &&
								!this.#d.has(t.token) &&
								(this.#d.add(t.token),
								console.warn(
									`[dom-desktop] no memory for token ${t.token}: ${e.title} cannot be painted`,
								)),
						e === this.#l && this.#N(e));
				}
				#N(e) {
					if (e.serial !== this.#f) {
						this.#f = e.serial;
						try {
							let t = e.canvas.toDataURL(`image/png`),
								n = Math.max(0, Math.round(e.relX)),
								r = Math.max(0, Math.round(e.relY));
							this.#P(`url(${t}) ${n} ${r}, default`);
						} catch {
							this.#P(`default`);
						}
					}
				}
				#P(e) {
					this.oncursor ? this.oncursor(e) : (this.#t.style.cursor = e);
				}
				oncursor = null;
				moved(e) {
					U(this.#e, e.block, 10, e.x, e.y, 0, 0, e.client, e.surface);
				}
				configure(e, t, n) {
					U(
						this.#e,
						e.block,
						7,
						t,
						n,
						e.states | 0,
						+(this.#i === e),
						e.client,
						e.surface,
					);
				}
				close(e) {
					if (e.role === 2) {
						U(this.#e, e.block, 9, 0, 0, 0, 0, e.client, e.surface);
						return;
					}
					U(this.#e, e.block, 8, 0, 0, 0, 0, e.client, e.surface);
				}
				focus(e) {
					if (this.#i === e) return;
					let t = this.#i;
					((this.#i = e),
						(this.#a = this.#a.filter((n) => n !== e && n !== t)),
						t && this.#a.push(t),
						this.#a.length > 16 && this.#a.shift(),
						t &&
							(U(this.#e, t.block, 6, 0, 0, 0, 0, t.client, 0),
							this.configure(t, t.width, t.height)),
						U(this.#e, e.block, 6, 0, 0, 0, 0, e.client, e.surface),
						this.configure(e, e.width, e.height));
				}
				#F() {
					let e = this.#p;
					if (!e?.ok) {
						if (e && !this.#v) {
							this.#v = !0;
							let t = e.error || `no reason given`;
							(console.error(`[dom-desktop] the GL device is gone: ${t}`),
								this.onglfailed?.(t));
						}
						return;
					}
					this.#_ = e.surfaces();
					for (let t of this.#n.values()) {
						let n = this.#_.find(
							(e) =>
								e.id &&
								(e.kind === 0
									? t.token === e.token && t.surface === e.id
									: t.xid === e.id),
						);
						if (!n) {
							t.glFrame && (e.surfaceCanvas?.(t.glFrame, !1), t.dropGl());
							continue;
						}
						if (((t.external = !0), t.glFrame !== n.frame)) {
							if (
								(t.glFrame && e.surfaceCanvas?.(t.glFrame, !1),
								!t.showGlCanvas(n.frame))
							)
								continue;
							(e.surfaceCanvas?.(n.frame, !0),
								t.glShown || ((t.glShown = !0), rf(t, `gl`)));
						}
						t.placeGl();
					}
				}
				#I(e) {
					let t = e.canvas,
						n = (n) => {
							let r = Math.round(n.offsetX),
								i = Math.round(n.offsetY);
							return e.placed && t.hasPointerCapture?.(n.pointerId)
								? { x: r, y: i, t: Math.round(n.timeStamp) }
								: {
										x: Math.max(0, Math.min(e.width - 1, r)),
										y: Math.max(0, Math.min(e.height - 1, i)),
										t: Math.round(n.timeStamp),
									};
						};
					(t.addEventListener(`pointerenter`, (t) => {
						this.#o = e;
						let r = n(t);
						U(this.#e, e.block, 0, r.x, r.y, r.t, 0, e.client, e.surface);
					}),
						t.addEventListener(`pointerleave`, () => {
							this.#o === e &&
								((this.#o = null),
								U(this.#e, e.block, 5, 0, 0, 0, 0, e.client, 0));
						}));
					let r = new Set(),
						i = (t, n, i) => {
							let a = rl[t.button];
							a !== void 0 &&
								r.has(a) !== n &&
								(n ? r.add(a) : r.delete(a),
								U(this.#e, e.block, 1, a, +!!n, i.t, 0, e.client, e.surface));
						};
					(t.addEventListener(`pointermove`, (t) => {
						if (this.#y === e) {
							((t.movementX || t.movementY) &&
								U(
									this.#e,
									e.block,
									16,
									Math.round(t.movementX * 256),
									Math.round(t.movementY * 256),
									Math.round(t.timeStamp),
									0,
									e.client,
									e.surface,
								),
								t.button >= 0 &&
									i(t, (t.buttons & (il[t.button] ?? 0)) !== 0, {
										t: Math.round(t.timeStamp),
									}));
							return;
						}
						let r = n(t);
						(U(this.#e, e.block, 0, r.x, r.y, r.t, 0, e.client, e.surface),
							t.button >= 0 &&
								i(t, (t.buttons & (il[t.button] ?? 0)) !== 0, r));
					}),
						t.addEventListener(`pointerdown`, (r) => {
							if (((this.#b = e), this.#y === e)) {
								i(r, !0, { t: Math.round(r.timeStamp) });
								return;
							}
							this.pointerLock &&
								e.wantsLock &&
								document.pointerLockElement !== t &&
								t.requestPointerLock?.()?.catch?.(() => {});
							let a = n(r);
							this.focus(e);
							try {
								t.setPointerCapture?.(r.pointerId);
							} catch {}
							(U(this.#e, e.block, 0, a.x, a.y, a.t, 0, e.client, e.surface),
								i(r, !0, a));
						}),
						t.addEventListener(`pointerup`, (e) => {
							let r = n(e);
							try {
								t.releasePointerCapture?.(e.pointerId);
							} catch {}
							i(e, !1, r);
						}),
						t.addEventListener(`pointercancel`, (t) => {
							let n = Math.round(t.timeStamp);
							for (let t of r)
								U(this.#e, e.block, 1, t, 0, n, 0, e.client, e.surface);
							r.clear();
						}),
						t.addEventListener(
							`wheel`,
							(t) => {
								t.preventDefault();
								let n =
										t.deltaMode === 1
											? 100 / 3
											: t.deltaMode === 2
												? e.height || 600
												: 1,
									r = (r, i) => {
										i &&
											U(
												this.#e,
												e.block,
												2,
												r,
												Math.round(i * n * 256),
												Math.round(t.timeStamp),
												0,
												e.client,
												e.surface,
											);
									};
								(r(0, t.deltaY), r(1, t.deltaX));
							},
							{ passive: !1 },
						));
				}
				#L() {
					let e = (e) => this.keyEvent(e, !0),
						t = (e) => this.keyEvent(e, !1),
						n = (e) => e.preventDefault(),
						r = (e) => {
							(e.button === 1 || e.button === 3 || e.button === 4) &&
								e.preventDefault();
						};
					(this.#t.addEventListener(`keydown`, e),
						this.#t.addEventListener(`keyup`, t),
						this.#t.addEventListener(`contextmenu`, n),
						this.#t.addEventListener(`mousedown`, r),
						this.#t.addEventListener(`mouseup`, r),
						this.#t.addEventListener(`auxclick`, r),
						this.#t.hasAttribute(`tabindex`) || (this.#t.tabIndex = 0),
						(this.#R = () => {
							(this.#t.removeEventListener(`keydown`, e),
								this.#t.removeEventListener(`keyup`, t),
								this.#t.removeEventListener(`contextmenu`, n),
								this.#t.removeEventListener(`mousedown`, r),
								this.#t.removeEventListener(`mouseup`, r),
								this.#t.removeEventListener(`auxclick`, r));
						}));
				}
				#R = null;
				keyEvent(e, t) {
					let n = this.#i;
					if (!n) return;
					let r = tl[e.code];
					r !== void 0 &&
						(e.preventDefault(),
						U(this.#e, n.block, 4, nl(e), 0, 0, 0, n.client, 0),
						U(
							this.#e,
							n.block,
							3,
							r,
							+!!t,
							Math.round(e.timeStamp),
							0,
							n.client,
							n.surface,
						));
				}
				cursor() {
					return this.#l;
				}
			}));
	}),
	uf = c({ bareDesktop: () => df });
function df(e, t) {
	let n = new Map(),
		r = 1,
		i = 0,
		a = (e) => `${e.token}:${e.client}:${e.parent}`,
		o = (e) => {
			if (e.placed) return { x: e.relX | 0, y: e.relY | 0 };
			if (e.role === 1 || !e.parent) return n.get(e.key) ?? { x: 0, y: 0 };
			let t = n.get(a(e)) ?? { x: 0, y: 0 };
			return { x: t.x + (e.relX | 0), y: t.y + (e.relY | 0) };
		},
		s = (t) => {
			let r = t.role === 1 && !t.placed ? n.get(t.key) : o(t);
			(n.set(t.key, r),
				(t.canvas.style.left = `${r.x}px`),
				(t.canvas.style.top = `${r.y}px`),
				t.placed && t.place(r.x, r.y));
			for (let n of e.windows())
				n.role !== 1 && n.parent && !n.placed && a(n) === t.key && s(n);
		},
		c = (e) => {
			((e.canvas.style.width = `${e.canvas.width}px`),
				(e.canvas.style.height = `${e.canvas.height}px`));
		},
		l = [[], [], []],
		u = (t) => {
			for (let n of e.windows())
				n.role === 3 &&
					a(n) === t.key &&
					((n.canvas.style.zIndex = t.canvas.style.zIndex), u(n));
		},
		d = () => {
			l.forEach((e, t) =>
				e.forEach((e, n) => {
					((e.canvas.style.zIndex = String(2e6 + t * 1e5 + n)), u(e));
				}),
			);
		},
		f = (e) => {
			for (let t of l) {
				let n = t.indexOf(e);
				n >= 0 && t.splice(n, 1);
			}
		},
		p = (e, t) => {
			f(e);
			let n = l[Math.min(2, Math.max(0, e.layer | 0))];
			if (t === 4294967295) n.unshift(e);
			else {
				let r = t ? n.findIndex((e) => e.stackId === t) : -1;
				r >= 0 ? n.splice(r, 0, e) : n.push(e);
			}
			d();
		};
	return (
		(e.onwindow = (o) => {
			if (o.role === 4) return;
			let l = o.canvas;
			if (((l.style.position = `absolute`), c(o), o.placed))
				(p(o, 0), (o.onrestack = (e) => p(o, e)));
			else if (o.role === 1) {
				let e = i++,
					a = Math.max(1, t.clientWidth - o.width),
					s = Math.max(1, t.clientHeight - o.height);
				(n.set(o.key, { x: (e * 28) % a, y: (e * 28) % s }),
					(l.style.zIndex = String(r++)),
					l.addEventListener(`pointerdown`, () => {
						o.placed || ((l.style.zIndex = String(r++)), u(o));
					}),
					o.place(n.get(o.key).x, n.get(o.key).y));
			} else if (o.role === 3 && o.parent) {
				let t = e.windows().find((e) => e.key === a(o));
				l.style.zIndex = t?.canvas.style.zIndex || String(1e6 + r++);
			} else l.style.zIndex = String(1e6 + r++);
			((o.onplace = () => s(o)),
				(o.onresized = () => c(o)),
				(o.onclosed = () => {
					(l.remove(), n.delete(o.key), f(o));
				}),
				t.append(l),
				s(o));
		}),
		(e.describe = async () => {
			let n = e.windows().filter((e) => e.role !== 4),
				r = n.filter((e) => e.role === 1),
				i = 2166136261,
				a = 0;
			for (let e of [...n].sort(
				(e, t) => Number(e.canvas.style.zIndex) - Number(t.canvas.style.zIndex),
			)) {
				if (e.canvas.width < 2 || e.canvas.height < 2 || e.external) continue;
				let t;
				try {
					t = e.canvas
						.getContext(`2d`)
						.getImageData(0, 0, e.canvas.width, e.canvas.height).data;
				} catch {
					continue;
				}
				for (let e = 0; e < t.length; e += 16) {
					let n = Math.max(t[e], t[e + 1], t[e + 2]);
					(n > 12 && a++, (i = ((i ^ n) * 16777619) >>> 0));
				}
			}
			return {
				frames: r.reduce((e, t) => e + t.paints, 0),
				windows: r.length,
				surfaces: n.length,
				list: n.map((e) => {
					let t = o(e);
					return `${e.key} role=${e.role} ${e.width}x${e.height}@${t.x},${t.y} serial=${e.serial} "${e.title ?? ``}"`;
				}),
				titles: r.map((e) => e.title || `(untitled)`),
				focus: e.focused?.()?.key ?? null,
				popups: n.filter((e) => e.role === 2).length,
				lit: a,
				hash: i,
				output: `${t.clientWidth}x${t.clientHeight}`,
				compositor: `none`,
			};
		}),
		(e.presented = () =>
			e
				.windows()
				.some(
					(e) =>
						e.role !== 4 &&
						e.paints > 0 &&
						e.canvas.isConnected &&
						e.canvas.width > 1 &&
						e.canvas.height > 1,
				)),
		e
	);
}
var ff = o(() => {
		lf();
	}),
	pf,
	mf = o(() => {
		(gl(),
			ld(),
			(pf = class extends EventTarget {
				#e = null;
				#t;
				constructor(e, { container: t } = {}) {
					if ((super(), !t || t.nodeType !== 1))
						throw TypeError(`SingleCanvas: a container element`);
					let n = ul(e, `SingleCanvas`);
					((this.#t = t), n.attach(`windows`, this, { beforeBoot: !0 }));
					let r = {};
					(n.devices(async (e) => {
						let { bareDesktop: n } = await Promise.resolve().then(
							() => (ff(), uf),
						);
						Object.assign(
							e,
							await e.rt.openWayland({
								wl: t,
								onDesktop: (e) => {
									((this.#e = n(e, t)),
										r.onDesktop?.(e, this.#e),
										(e.onwindowgone = () =>
											this.dispatchEvent(new Event(`change`))));
									let i = e.onwindow;
									e.onwindow = (e) => {
										(i(e), this.dispatchEvent(new Event(`change`)));
									};
								},
								say: (t) => e.say(`${t}\n`),
							}),
						);
					}),
						cd(n, r),
						(this[W] = {
							x: r,
							of: () => [],
							shutdown: () => this.#e?.stop(),
						}));
				}
				get env() {
					return {
						XDG_RUNTIME_DIR: `/tmp`,
						WAYLAND_DISPLAY: `wayland-0`,
						DISPLAY: `:0`,
					};
				}
				resized() {
					this.#e?.resizeOutput(this.#t.clientWidth, this.#t.clientHeight);
				}
				describe() {
					return this.#e?.describe?.() ?? null;
				}
			}));
	}),
	hf,
	gf = o(() => {
		(gl(),
			(hf = class extends EventTarget {
				#e = null;
				#t = null;
				constructor(e, { eager: t = !1, d3d: n = !1, source: r = null } = {}) {
					super();
					let i = ul(e, `MesaGl`);
					(i.attach(`gl`, this, { beforeBoot: !0 }),
						i.devices(async (e) => {
							if (!e.compositor)
								throw Error(
									`MesaGl draws into the windows: make HostWindows, CompositorWindows or SingleCanvas too`,
								);
							((e.glChannel = await e.rt.openGlChannel(n)),
								(this.#e = e.rt.glStarter(
									e.compositor,
									e.glChannel,
									{
										dom: e.dom,
										source: r,
										...(i.preset.glBackend
											? { backend: i.preset.glBackend }
											: {}),
									},
									e.term,
								)),
								t || e.rt.glOnFirstRequest(e.glChannel, this.#e));
						}, 1),
						i.afterBoot(() => {
							t && this.start();
						}));
				}
				start() {
					return this.#e
						? ((this.#t ??= Promise.resolve(this.#e()).then(
								(e) => {
									if (e == null)
										throw Error(
											globalThis.__gexGlError ?? `Mesa did not start`,
										);
									return (
										this.dispatchEvent(
											Object.assign(new Event(`started`), { description: e }),
										),
										e
									);
								},
								(e) => {
									throw e;
								},
							)),
							this.#t.catch((e) =>
								this.dispatchEvent(
									Object.assign(new Event(`failed`), { error: e }),
								),
							),
							this.#t)
						: Promise.reject(Error(`MesaGl: the system is not running`));
				}
			}));
	}),
	_f = c({ runPreset: () => vf });
async function vf(
	e,
	{
		elf: t,
		args: n,
		files: r = {},
		dirs: i = [],
		modes: a = {},
		hard: o = {},
		symlinks: s = {},
		lazy: c = [],
		mtimes: l,
		xattrs: u,
		env: d = [],
		cwd: f = `/`,
		uid: p,
		tty: m = !0,
		wl: h = null,
		wlScale: g = 1,
		onDesktop: _ = null,
		hostX: v = !1,
		gl: y = null,
		glLazy: b = !1,
		glSource: x = null,
		glBackend: S,
		d3d: C = !1,
		network: w = null,
		onNetEvent: T = null,
		playAudio: ee = !0,
		onFilesLoaded: E = null,
		onSystem: D = null,
		closure: te = null,
		closureBuildNumbered: ne,
		fill: re,
		lazyCache: ie,
		restBundle: ae,
		identities: oe,
		stateful: se,
		providerSources: k,
		preModules: ce,
		lateUnits: le,
		heartbeat: ue,
		recompileObjects: de,
		link: fe,
		pageFs: pe,
		transfer: me,
		wlInput: he,
		...ge
	},
) {
	let _e = Object.keys(ge);
	if (_e.length) throw TypeError(`runProgram: no option ${_e.join(`, `)}`);
	if (!Array.isArray(n) || !n.length)
		throw TypeError(`runProgram: args, the program's argv`);
	if (y && y !== `compositor`)
		throw TypeError(
			`runProgram: gl is 'compositor' (the windows' Mesa) or nothing`,
		);
	let ve = n[0],
		ye =
			r[ve] !== void 0 ||
			o[ve] !== void 0 ||
			((e) => {
				let t = ``;
				for (let n of e.split(`/`).filter(Boolean))
					if (((t += `/${n}`), s[t] !== void 0)) return !0;
				return !1;
			})(ve);
	if (!t && !ye) throw Error(`runProgram: no ${ve} in the files`);
	let be = O(),
		A = new Ku({
			baseUrl:
				globalThis.GEX_ASSET_BASE ??
				(globalThis.location
					? new URL(`/`, globalThis.location.href).href
					: void 0),
			xcache: !!be.get(`xcache`) && be.get(`xcache`) !== `0`,
			debug: { ...Object.fromEntries(be), arch: jf() },
		}),
		xe = A[W];
	((xe.preset.loud = !0),
		Object.assign(
			xe.preset.host,
			bf({
				closure: te,
				closureBuildNumbered: ne,
				fill: re,
				lazyCache: ie,
				restBundle: ae,
				identities: oe,
				stateful: se,
				providerSources: k,
				preModules: ce,
				lateUnits: le,
				heartbeat: ue,
				recompileObjects: de,
				link: fe,
				uid: p,
			}),
		),
		Object.assign(
			xe.preset.exec,
			bf({ recompileObjects: de, heartbeat: ue, link: fe, pins: te?.pins }),
		),
		S && (xe.preset.glBackend = S),
		ee &&
			xe.preset.onMessage.push((e) => {
				e.kind === `audio` && np(e);
			}),
		T &&
			xe.preset.onMessage.push((e) => {
				e.kind === `net` && T(e.event);
			}));
	let j = new od(A),
		Se = { ...r },
		Ce = { ...a };
	(ye || ((Se[ve] = t), (Ce[ve] ??= 493)),
		j[W].addImage({
			files: Se,
			modes: Ce,
			dirs: i,
			lazy: c,
			hard: o,
			symlinks: s,
			mtimes: l,
			xattrs: u,
		}));
	let M = null;
	(h && typeof h.getContext == `function`
		? (M = new ud(A, { canvas: h, scale: g }))
		: h &&
			((M = new pf(A, { container: h })),
			(M[W].x.onDesktop = (e, t) => {
				((globalThis.__gexCompositor = t), _?.(e));
			})),
		M && (M[W].x.rootful = v === `rootful`));
	let we = y && M ? new hf(A, { eager: !b, d3d: C, source: x }) : null;
	(w && xe.network(w), await A.boot());
	for (let e of Object.keys(Se)) delete Se[e];
	E?.();
	let Te = xe.sys();
	D?.({
		system: A,
		host: Te.host,
		kernel: Te.kernel,
		compositor: Te.compositor,
		wlChannel: Te.wlChannel,
		startGl: we ? () => we.start() : null,
	});
	let Ee = m ? { cols: e.cols ?? 80, rows: e.rows ?? 24 } : void 0,
		De = A.spawn(
			n,
			bf({ env: d.length ? d : yf, cwd: f, uid: p, gid: p, pty: Ee }),
		),
		N = [];
	if (De.pty)
		(De.pty.addEventListener(`data`, (t) => e.write(t.data)),
			N.push(e.onData((e) => De.pty.write(e))),
			N.push(e.onResize?.(({ rows: e, cols: t }) => De.pty.resize(t, e))));
	else {
		let t = async (t) => {
			for (let n = t.getReader(); ; ) {
				let { value: t, done: r } = await n.read();
				if (r) return;
				e.write(t);
			}
		};
		(t(De.stdout).catch(() => {}), t(De.stderr).catch(() => {}));
		let n = De.stdin.getWriter(),
			r = new TextEncoder();
		N.push(
			e.onData((e) => {
				n.write(typeof e == `string` ? r.encode(e) : e).catch(() => {});
			}),
		);
	}
	e.focus?.();
	try {
		let { code: e } = await De.exited;
		return (
			await Promise.race([
				De[W].drained(),
				new Promise((e) => setTimeout(e, 1e3)),
			]),
			{ status: e, host: Te.host, system: A }
		);
	} finally {
		for (let e of N) e?.dispose?.();
		await A.shutdown();
	}
}
var yf,
	bf,
	xf = o(() => {
		(qu(),
			sd(),
			dd(),
			mf(),
			gf(),
			gl(),
			Ip(),
			le(),
			(yf = [
				`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
				`HOME=/root`,
			]),
			(bf = (e) =>
				Object.fromEntries(Object.entries(e).filter(([, e]) => e != null))));
	}),
	Sf = c({ HostX: () => Of, moduleBytes: () => Tf });
async function Cf(e) {
	return (await import(/* @vite-ignore */ /* webpackIgnore: true */ e)).default;
}
function wf() {
	return typeof location < `u`
		? location.href
		: new URL(`file://${process.cwd()}/`).href;
}
async function Tf(e) {
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
					if (Xu(e)) return Zu(e);
				}
			} catch {}
		return (await fetch(e)).arrayBuffer();
	}
	let { readFile: t } = await Promise.resolve().then(() => u(N(), 1)),
		{ fileURLToPath: n } = await Promise.resolve().then(() => u(N(), 1));
	return (await t(e.startsWith(`file:`) ? n(e) : e)).buffer;
}
var Ef,
	Df,
	Of,
	kf = o(() => {
		(Fa(),
			$u(),
			ot(),
			ht(),
			ae(),
			(Ef = 64),
			(Df = 262144),
			(Of = class {
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
					let t = Di(e.wlChannel);
					this.#_ = { w: t.w, h: t.h };
					let n = await Cf(e.xwaylandUrl);
					if (
						((this.#e = await n({
							locateFile: (t) =>
								e.xwaylandFiles?.[t] ??
								new URL(
									/* @vite-ignore */ /* webpackIgnore: true */ t,
									new URL(
										/* @vite-ignore */ /* webpackIgnore: true */ e.xwaylandUrl,
										wf(),
									),
								).href,
							print: (e) => this.log(e),
							printErr: (e) => this.log(e),
							noInitialRun: !0,
						})),
						e.keymapUrl)
					) {
						let t = new Uint8Array(await Tf(e.keymapUrl));
						try {
							this.#e.FS.mkdir(`/xkb`);
						} catch {}
						(this.#e.FS.writeFile(`/xkb/gex.xkm`, t),
							this.log(`[hostx] keymap: ${t.length} bytes at /xkb/gex.xkm`));
					}
					let r = await Tf(e.hostwlUrl),
						i = await WebAssembly.instantiate(await WebAssembly.compile(r), {
							gex_host: {
								host_locate: (e, t) => this.#z(e, t),
								host_release: (e) => {
									let t = this.#f.get(e);
									t && (this.#f.delete(e), this.#B(t));
								},
								host_trace: (e, t) =>
									this.log(this.#R(e, t).replace(/\n$/, ``)),
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
									...Ge(this.#e.wasmMemory, !1, e.kernel.spare),
									lazy_fetch: Je(e.kernel.memory),
									page_fs: ft(e.kernel.memory),
								},
							}),
							r =
								e.kernel.stackTop ??
								(n.exports.k_stack_area ? Ke(n.exports, `hostx`) : 0);
						(r && qe(n.exports, r),
							(this.#a = n.exports),
							(this.#o = e.kernel.memory));
					}
					if (!this.#a)
						throw Error(`the host X server needs the global kernel`);
					(this.#M(),
						(this.#h = new Pa(
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
					(this.log(`[hostx] Xwayland ${a.join(` `)}`),
						this.emit({ kind: `ready` }));
					let o = this.#e.callMain(a);
					if (o instanceof Promise) {
						o.then(
							() =>
								this.log(`[hostx] the X server returned, which it should not`),
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
							? e.listen.map(
									(e) => (this.#P(e), this.#D({ kind: `listen`, id: e })),
								)
							: [`\0/tmp/.X11-unix/X0`, `/tmp/.X11-unix/X0`].map((e) =>
									this.#O(e),
								)
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
						? (this.log(
								`[hostx] cannot bind ${JSON.stringify(e)}: errno ${-t}`,
							),
							-1)
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
						this.#u.push({
							pool: e,
							gen: this.#h?.ok ? this.#h.generation : -1,
						}));
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
								let i = new TextDecoder().decode(
										e.#e.HEAPU8.subarray(n, n + r),
									),
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
								if (
									(e.#S && e.#G(o.kind, r), o.kind === `wl` || o.kind === `wm`)
								) {
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
										for (let r = 0; r < a; r++)
											n.push(e.#i[((s + t) >> 2) + r]);
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
								return n
									? (n.refs++, n.maps++, e.#l.set(n.addr, n), n.addr)
									: 0;
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
								if (S.on) {
									let t = D.parkSlot(
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
					if (S.on)
						for (let e of [`connect`, `accept`, `close`, `send`, `recv`]) {
							let n = t[e];
							t[e] = (...e) => {
								let t = n(...e);
								return (D.checkSlots(), t);
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
							return (
								r-- > 0 && this.log(`[hostx] ${e}(${t.join(`, `)}) = ${n}`),
								n
							);
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
					let n = e.hw_scratch(Df),
						r = e.hw_clip_take(n, Df);
					r >= 0 && (this.#K = t.clipSet(this.#n, n, r));
					let i = t.clipSerial();
					if (i && i !== this.#K) {
						((this.#K = i), (n = e.hw_scratch(Df)));
						let r = t.clipGet(this.#n, n, Df);
						e.hw_clip_set(n, Math.min(r, Df));
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
					let t = Di(this.#g);
					if (
						((t.w !== this.#_.w || t.h !== this.#_.h) &&
							((this.#_ = { w: t.w, h: t.h }), e.hw_set_output(t.w, t.h)),
						this.#q(),
						e.hw_wants_input())
					) {
						let t = e.hw_scratch(Ef * 8 * 4),
							n = this.#h.pollInput(this.#n, t, Ef);
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
			}));
	}),
	Af = c({
		TerminalEnv: () => jp,
		archAsset: () => Nf,
		audioFrom: () => np,
		detectTso: () => qf,
		elfMachine: () => Ff,
		execOptions: () => ip,
		fetchBytes: () => zf,
		glOnFirstRequest: () => lp,
		glStarter: () => ap,
		globalKernel: () => Xf,
		guestArch: () => jf,
		heldBytes: () => Vf,
		loadKernel: () => Xf,
		loadRuntime: () => Wf,
		makeProcessHost: () => op,
		multiarch: () => Pf,
		openGlChannel: () => cp,
		openNet: () => sp,
		openWayland: () => up,
		primeRuntime: () => Uf,
		runProgram: () => tp,
		runtimeUrls: () => Gf,
		singleMode: () => Qf,
		startHostGl: () => Yf,
		startXServer: () => rp,
		workerGraphBytes: () => pp,
		xcRead: () => Ct,
		xcacheName: () => Hf,
	});
function jf() {
	return globalThis.GEX_ARCH === `x86` ? `x86` : `aarch64`;
}
function Mf() {
	return jf() === `x86` ? `.x86` : ``;
}
function Nf(e) {
	return jf() === `x86` ? e.replace(/^\/(rootfs|closure|fs)\//, `/$1/x86/`) : e;
}
function Pf() {
	return jf() === `x86` ? `x86_64-linux-gnu` : `aarch64-linux-gnu`;
}
function Ff() {
	return jf() === `x86` ? 62 : 183;
}
function If(e, t, n) {
	if (!e.endsWith(`.wasm`)) return n;
	let r = n.subarray(0, 4);
	if (r[0] === 0 && r[1] === 97 && r[2] === 115 && r[3] === 109) return n;
	let i = [...r].map((e) => e.toString(16).padStart(2, `0`)).join(` `);
	throw Error(
		`${e} is not a wasm module: ${n.length} bytes of ${t.headers.get(`content-type`) || `unknown type`} beginning ${i}` +
			(i === `3c 21 64 6f`
				? ` -- that is an HTML page, so the server did not find it`
				: ``),
	);
}
function Lf(e) {
	let t = null,
		n = 0,
		r = new Map(),
		i = (e) => {
			for (let t of r.values()) t.reject(Error(e));
			r.clear();
		};
	return (a) => {
		t ||
			((t = new Worker(new URL("./unit-worker-CgoxdAME.mjs", import.meta.url), {
				type: "module",
				name: "units",
			})),
			(t.onmessage = ({ data: { id: e, mod: t, error: n } }) => {
				let i = r.get(e);
				(r.delete(e), t ? i?.resolve(t) : i?.reject(Error(n)));
			}),
			(t.onerror = (e) =>
				i(`the units' Worker: ${e?.message ?? `did not start`}`)));
		let o = ++n;
		return new Promise((n, i) => {
			(r.set(o, { resolve: n, reject: i }),
				t.postMessage({ id: o, url: a, zstd: e }));
		});
	};
}
function Rf(e, t) {
	return e?.size ? (n) => e.get(n.split(`/`).at(-2)) ?? t(n) : t;
}
async function zf(e, t) {
	let n = await fetch(e, { cache: `no-cache` });
	if (!n.ok) throw Error(`${e}: ${n.status} ${n.statusText}`);
	let r = Number(n.headers.get(`content-length`)) || 0;
	if (!t || !n.body) return If(e, n, new Uint8Array(await n.arrayBuffer()));
	let i = n.body.getReader(),
		a = [],
		o = 0;
	for (;;) {
		let { done: e, value: n } = await i.read();
		if (e) break;
		(a.push(n), (o += n.length), t(o, r));
	}
	let s = new Uint8Array(o),
		c = 0;
	for (let e of a) (s.set(e, c), (c += e.length));
	return If(e, n, s);
}
function Bf(e, t) {
	(Dp() && t && (Ep[e] ??= Tt(t)), e === `shim` ? (Cp = null) : (Tp = null));
}
function Vf() {
	return { shim: !!Cp, kernel: !!Tp };
}
function Hf() {
	if (!Dp()) return;
	let e = Ep.shim ?? (Cp && Tt(Cp)),
		t = Ep.kernel ?? (Tp && Tt(Tp));
	return !e || !t
		? void 0
		: `xc-${Tt(e, t, [`tso`, `coherentloads`, `arch`, `mem64`, `fjit`, `fjitlibs`, `dense`, `dual`, `cgen`, `providers`, `elfunits`, `provskip`, `pins`, `sp`, `inlinedispatch`, `t1fold`, `liftmax`, `unitcache`].map((e) => `${e}=${Y(e) ?? ``}`).join(`&`) + (Y(`tso`) === `arm` && Kf() ? `&tsohost=1` : ``) + (globalThis.GEX_NULL_GUARD ? `&nullguard=1` : ``) + (globalThis.GEX_MXCSR ? `&mxcsr=1` : ``), globalThis.GEX_FLAVOUR ?? (typeof __GEX_FLAVOUR__ < `u` ? __GEX_FLAVOUR__ : ``), globalThis.location?.pathname ?? ``)}`;
}
function Uf(e) {
	(e?.fetchOther && (Op = e.fetchOther),
		e?.shimBytes && !Cp && (Cp = e.shimBytes),
		e?.seedBytes && !wp && (wp = e.seedBytes),
		e?.kernelBytes && !Tp && (Tp = e.kernelBytes));
}
async function Wf(e) {
	return (
		(Cp ||= await zf(bp(), e)),
		(wp ||= await zf(xp())),
		{ shimBytes: Cp, seedBytes: wp }
	);
}
function Gf() {
	return { shimBytes: bp(), seedBytes: xp(), kernelBytes: Sp() };
}
function Kf() {
	let e = Y(`tso`) ?? Y(`coherentloads`);
	return e === `arm` ? Ap : !!e && e !== `0`;
}
async function qf() {
	if (Y(`tso`) === `arm`)
		try {
			let e = globalThis.navigator?.userAgentData;
			Ap =
				(e?.getHighEntropyValues
					? await e.getHighEntropyValues([`architecture`])
					: null
				)?.architecture === `arm`;
		} catch {
			Ap = !1;
		}
	return Kf();
}
function Jf() {
	let e = Y(`audiolatency`);
	return e !== null && e !== `` && Number.isFinite(+e) ? +e : `interactive`;
}
function Y(e) {
	let t = se();
	return t
		? new URLSearchParams(t).get(e)
		: ({}[`GEX_${e.toUpperCase()}`] ?? null);
}
async function Yf(e, t, n, r) {
	try {
		return await e.hostGl(t, n);
	} catch (e) {
		let i = e?.message || String(e);
		return (
			console.error(
				`[gex] the guest's OpenGL did not start (${n.backend || `wgpu`}): ${i}`,
			),
			r?.writeln?.(
				`gex: the guest's OpenGL did not start (${n.backend || `wgpu`}): ${i}`,
			),
			r?.writeln?.(`gex: GL windows will be blank; everything else still runs`),
			(globalThis.__gexGlError = i),
			t?.control &&
				(await Promise.resolve().then(() => (gi(), Br))).failGlChannel(t),
			null
		);
	}
}
async function Xf() {
	if (Mp !== null) return Mp || null;
	if (typeof SharedArrayBuffer != `function` && !S.on) return ((Mp = !1), null);
	try {
		let e = Tp ?? (await zf(Sp()));
		Tp = e;
		let t = await WebAssembly.compile(e);
		(Bf(`kernel`, e),
			(Mp = {
				module: t,
				memory: new WebAssembly.Memory({
					initial: 2048,
					maximum: 65536,
					shared: !0,
				}),
				spare: We(!S.on),
			}));
	} catch {
		return ((Mp = !1), null);
	}
	return Mp;
}
async function Zf() {
	if (S.on) return () => new ie();
	if (typeof Worker == `function`) {
		let e = 0,
			t = (e, t) => ((e.gexName = t), e),
			n = () => {
				let n = `gex-w${++e}`;
				return t(
					new Worker(new URL("./worker-B8Rv3-rx.mjs", import.meta.url), {
						type: "module",
						name: n,
					}),
					n,
				);
			},
			r = O().get(`workergraph`) === `0` ? null : Hc(n),
			i = r
				? await Uc(mp(r), (e, t) => {
						((pp.net += e), (pp.cached += t));
					})
				: null;
		return i
			? () => {
					let n = `gex-w${++e}`;
					return t(new Worker(i, { type: `module`, name: n }), n);
				}
			: n;
	}
	let { Worker: e } = await Promise.resolve().then(() => u(N(), 1)),
		t = [`..`, `..`, `shims`, `browser`, `js`, `worker.mjs`].join(`/`);
	return () =>
		new e(
			new URL(/* @vite-ignore */ /* webpackIgnore: true */ t, import.meta.url),
		);
}
function Qf() {
	if (S.on) return !0;
	let e = Y(`single`);
	return e === `0` || !d()
		? !1
		: e === `1` || typeof SharedArrayBuffer != `function`;
}
function $f() {
	let e = { GEX_PAGE_SEARCH: se() };
	for (let t of Object.keys(globalThis)) {
		if (!t.startsWith(`GEX_`)) continue;
		let n = globalThis[t];
		(n === null ||
			[`string`, `number`, `boolean`, `undefined`].includes(typeof n)) &&
			(e[t] = n);
	}
	return (
		globalThis.GEX_ASSET_FILES &&
			(e.GEX_ASSET_FILES = globalThis.GEX_ASSET_FILES),
		e
	);
}
async function ep(e, t) {
	let {
		network: n,
		onNetEvent: r,
		onFilesLoaded: i,
		onDesktop: a,
		onSystem: o,
		transfer: s,
		wl: c,
		wlInput: l,
		gl: u,
		hostX: d,
		preModules: f,
		closure: p,
		glSource: m,
		...h
	} = t;
	e.writeln?.(
		`gex: single-thread build (no SharedArrayBuffer): every guest thread in one Worker`,
	);
	let g =
			typeof c?.getContext == `function` &&
			typeof c.transferControlToOffscreen == `function`
				? c
				: null,
		_ = u === `compositor` && !!g,
		v = !!d && !!g;
	((c && !g) || (u && !_) || (d && !v)) &&
		e.writeln?.(
			`gex: the single-thread build has no ${[c && !g && `DOM desktop`, u && !_ && `GL`, d && !v && `X server`].filter(Boolean).join(`, `)} yet${g ? `` : `; running without the screen`}`,
		);
	let y = new Worker(self.location.href, { type: `module`, name: `system` });
	((globalThis.__gexSystemWorker = y),
		await new Promise((e, t) => {
			(y.addEventListener(`message`, (t) => {
				t.data?.kind === `ready` && e();
			}),
				y.addEventListener(`error`, (e) =>
					t(Error(e.message || `the system Worker failed to start`)),
				));
		}));
	let b = new Set(),
		x = null,
		S = {
			postMessage(e, t = []) {
				(e?.kind === `init` && e.stats && (x = new Int32Array(e.stats)),
					y.postMessage({ kind: `comp`, m: e }, t));
			},
			addEventListener(e, t) {
				e === `message` && b.add(t);
			},
			removeEventListener(e, t) {
				b.delete(t);
			},
			terminate() {},
		};
	y.addEventListener(`message`, (e) => {
		let t = e.data;
		if (t?.kind === `comp-out`) for (let e of [...b]) e({ data: t.m });
		else t?.kind === `comp-stats` && x && x.set(t.stats.subarray(0, x.length));
	});
	let C = null;
	if (g && vp) {
		let { Compositor: e } = await Promise.resolve().then(() => (ll(), ol));
		(y.postMessage({ kind: `comp-open`, width: g.width, height: g.height }),
			(C = await e.create(g, null, l || g, { makeWorker: () => S })),
			(globalThis.__gexCompositor = C));
	}
	let w = e.onData((e) => y.postMessage({ kind: `key`, data: e })),
		T = e.onResize(({ rows: e, cols: t }) =>
			y.postMessage({ kind: `resize`, rows: e, cols: t }),
		);
	e.focus?.();
	try {
		return await new Promise((t, i) => {
			(y.addEventListener(`message`, (n) => {
				let a = n.data;
				a.kind === `write`
					? e.write(a.data)
					: a.kind === `net`
						? r?.(a.event)
						: a.kind === `done`
							? t({ status: a.status, host: null, tenv: null })
							: a.kind === `failed` &&
								i(Object.assign(Error(a.message), { workerStack: a.stack }));
			}),
				y.postMessage({
					kind: `run`,
					globals: $f(),
					runtime: Cp ? { shimBytes: Cp, seedBytes: wp } : void 0,
					rows: e.rows,
					cols: e.cols,
					opts: {
						...h,
						networkUrl: n?.url ?? null,
						pageHosts: n?.pageHosts,
						wl: g ? { inRealm: !0 } : void 0,
						gl: _ ? `compositor` : void 0,
						hostX: v ? d : void 0,
					},
				}));
		});
	} finally {
		(w.dispose(), T.dispose(), C?.stop(), y.terminate());
	}
}
async function tp(e, t) {
	if (S.on) return dp(e, t);
	if (Qf()) return ep(e, t);
	let { runPreset: n } = await Promise.resolve().then(() => (xf(), _f));
	return n(e, t);
}
function np(e) {
	Yc({
		...e,
		clock: Y(`audioclock`) !== `0`,
		latency: Jf(),
		loop: Y(`audioloop`) === `1`,
	});
}
async function rp({
	kernel: e,
	wlChannel: t,
	compositor: n,
	term: r,
	rootful: i = !1,
	listen: a,
}) {
	let o,
		s = S.on ? `/gex/xwayland-st/` : `/gex/xwayland/`,
		c = k(s),
		l = (e) =>
			new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ ce(s)?.[e] ?? `${c}${e}`,
				location.href,
			).href;
	if (S.on) {
		let { HostX: e } = await Promise.resolve().then(() => (kf(), Sf)),
			t = null,
			n = new e((e) => t?.({ data: e }));
		o = {
			set onmessage(e) {
				t = e;
			},
			postMessage: (e) =>
				n.start(e).catch((e) => {
					(n.log(`[hostx] ${e?.stack || e}`),
						t?.({ data: { kind: `failed`, why: String(e?.message || e) } }));
				}),
			terminate() {},
		};
	} else
		o = new Worker(new URL("./xwayland-worker-COiIvpxm.mjs", import.meta.url), {
			type: "module",
			name: "xwayland",
		});
	let u = null,
		d = new Promise((e) => (u = e)),
		f = !!Y(`hostxcount`);
	return (
		(o.onmessage = (e) => {
			let t = e.data;
			t.kind === `log`
				? (r.writeln(t.text),
					f && console.log(`${(performance.now() / 1e3).toFixed(2)} ${t.text}`))
				: t.kind === `win`
					? console.log(`[win] ${t.text}`)
					: t.kind === `wl-memory`
						? n()?.addMemory(t.token, t.memory, t.kernel)
						: t.kind === `wl-pixels`
							? n()?.addPixels?.(t.token, t.id, t.buffer, t.replaces)
							: t.kind === `ready`
								? u(!0)
								: t.kind === `failed` &&
									(r.writeln(`gex: the X server failed: ${t.why}`), u(!1));
		}),
		o.postMessage({
			kind: `start`,
			xwaylandUrl: l(`Xwayland.mjs`),
			hostwlUrl: l(`gexhostwl.wasm`),
			keymapUrl: l(`gex.xkm`),
			xwaylandFiles: { "Xwayland.wasm": l(`Xwayland.wasm`) },
			kernel: { module: e.module, memory: e.memory, spare: e.spare },
			wlChannel: t,
			token: 2021092401,
			display: `:0`,
			listen: a,
			rootful: i || void 0,
			verbose:
				globalThis.GEX_HOSTX_VERBOSE || Number(O().get(`xverbose`)) || void 0,
			trace: globalThis.GEX_HOSTX_TRACE || void 0,
			wlTrace: Y(`wltrace`) ? 1 : void 0,
			count: Y(`hostxcount`) ? 1 : void 0,
			win: R(`win`) ? 1 : void 0,
		}),
		(await Promise.race([
			d,
			new Promise((e) => setTimeout(() => e(`timeout`), 6e4)),
		])) === `timeout` && r.writeln(`gex: the X server did not come up in 60s`),
		o
	);
}
function ip({ uid: e = 0, gid: t = e } = {}) {
	return {
		...yt(`opts`),
		recompileObjects: Np(),
		heartbeat: Pp(),
		link: Fp(),
		uid: e,
		gid: t,
	};
}
function ap(e, t, { dom: n, backend: r = `wgpu`, source: i = null }, a) {
	let o = n
			? { api: `core`, backend: r, source: i }
			: {
					api: `core`,
					backend: r,
					canvasBlit: O().get(`glcanvas`) === `1`,
					source: i,
				},
		s = null;
	return () => (s ??= Yf(e, t, o, a));
}
async function op(
	{
		kernel: e,
		closure: t = null,
		lateUnits: n = null,
		heartbeat: r = Pp(),
		fill: i = null,
		lazyCache: a = null,
		pageFs: o = null,
		restBundle: s = !1,
		identities: c = null,
		providerSources: l = null,
		stateful: u = null,
		recompileObjects: d = Np(),
		closureBuildNumbered: f = !1,
		link: p = Fp(),
		uid: m,
		preModules: h = null,
		glChannel: g = null,
		wlChannel: _ = null,
		netChannel: v = null,
		network: y = null,
		winsize: b,
	},
	x,
) {
	let { shimBytes: C, seedBytes: w } = await Wf(),
		T = await Zf(),
		ee = new Pc({
			makeWorker: T,
			unitModule:
				globalThis.GEX_CGEN &&
				globalThis.GEX_CGEN_ZST &&
				globalThis.GEX_CGEN_ZSTD
					? Rf(n, Lf(mp(globalThis.GEX_CGEN_ZSTD)))
					: null,
			shim: C,
			guest: t?.image ?? w,
			kernel: e,
			other: yp()
				? async () => ({
						shim: await kp(k(`/gex/gex_browser${Mf()}.shared.wasm`)),
						guest: await kp(k(`/gex/seed${Mf()}.shared.wasm`)),
						kernel: e.module,
					})
				: e && jf() === `x86`
					? async () => ({
							shim: await kp(k(`/gex/gex_browser${Mf()}.m64.shared.wasm`)),
							guest: await kp(k(`/gex/seed${Mf()}.m64.shared.wasm`)),
							kernel: e.module,
						})
					: null,
			extra: {
				...yt(`extra`),
				heartbeat: r || void 0,
				fill: i || void 0,
				lazyCache: a || void 0,
				pageFs: o || void 0,
				restBundle: s || void 0,
				identities: c || void 0,
				closure: t?.libs,
				trace: Y(`trace`) ? 1 : void 0,
				hot: Y(`hot`) ? 1 : void 0,
				wholePage: Y(`wholepage`) ? 1 : void 0,
				vforkTrace: Y(`vforktrace`) ? 1 : void 0,
				trapPc: Y(`trappc`) ? Number.parseInt(Y(`trappc`), 16) : void 0,
				shared: !0,
				glChannel: g ?? void 0,
				wlChannel: _ ?? void 0,
				netChannel: v ?? void 0,
				wispNet: S.on ? (y ?? void 0) : void 0,
				wispUrl: v || S.on ? void 0 : (y?.url ?? void 0),
				pageHosts: v || S.on ? void 0 : y?.pageHosts,
				winsize: b,
				debugExit:
					!!globalThis.GEX_DEBUG_EXIT ||
					(typeof process < `u` && !!{}.GEX_DEBUG_EXIT),
				dense:
					globalThis.GEX_DENSE === 0
						? !1
						: globalThis.GEX_DENSE === 2
							? 2
							: void 0,
				cgen:
					globalThis.GEX_CGEN && !Kf()
						? hp({
								mode: globalThis.GEX_CGEN,
								url: mp(globalThis.GEX_CGEN_URL ?? `/gex-cgen`),
								zstd: globalThis.GEX_CGEN_ZSTD && mp(globalThis.GEX_CGEN_ZSTD),
								zst: globalThis.GEX_CGEN_ZST ? !0 : void 0,
							})
						: Y(`providers`) === `0`
							? void 0
							: { mode: 8, url: k(`/gex/cgen`), files: ce(`/gex/cgen/`) },
				jit: !globalThis.GEX_NO_JIT && void 0,
				aot: globalThis.GEX_AOT ? !0 : void 0,
				mem64: globalThis.GEX_MEM64 ? 1 : void 0,
				fjit: globalThis.GEX_FJIT || void 0,
				xcache: Hf(),
				unitCache: globalThis.GEX_UNIT_CACHE || void 0,
				elfUnits: globalThis.GEX_ELF_UNITS || void 0,
				providerSources: l || globalThis.GEX_PROVIDER_SOURCES || void 0,
				stateful: u || globalThis.GEX_STATEFUL || void 0,
				dlChecked: Y(`dlchecked`) ? 1 : void 0,
				jitDiag: Y(`jitdiag`) ? 1 : void 0,
				shareTrace: Y(`sharetrace`) ? 1 : void 0,
				log: (globalThis.GEX_LOG ??= Y(`log`) || void 0) || void 0,
				preModules: h ?? void 0,
				adoptTrace:
					!!globalThis.GEX_ADOPT_TRACE ||
					(typeof process < `u` && !!{}.GEX_ADOPT_TRACE),
				attachTrace:
					!!globalThis.GEX_ATTACH_TRACE ||
					(typeof process < `u` && !!{}.GEX_ATTACH_TRACE),
				recompileObjects: d,
				noIntrinsics: Y(`nointrinsics`) ? 1 : void 0,
				pregrow: Y(`pregrow`) ? 1 : void 0,
				checkSp: Y(`checksp`) ? 1 : void 0,
				fillTime: Y(`filltime`) ? 1 : void 0,
				claimPages:
					Y(`claimpages`) == null
						? f
							? 0
							: void 0
						: Y(`claimpages`) === `0`
							? 0
							: 1,
				intrinsicMask:
					Y(`intrinsicmask`) == null
						? void 0
						: parseInt(Y(`intrinsicmask`), 10) >>> 0,
				copyLoop: Y(`copyloop`) ? 1 : void 0,
				coherentLoads: Kf() ? 1 : void 0,
				wlTrace: Y(`wltrace`) ? 1 : void 0,
				link: p || void 0,
				uid: m,
				gid: m,
			},
			...x,
		});
	return (Bf(`shim`, C), ee);
}
async function sp(e) {
	if (!e || !globalThis.crossOriginIsolated) return null;
	let { makeNetChannel: t, serveNet: n } = await Promise.resolve().then(
			() => (wo(), Ia),
		),
		r = t();
	return (r && n(e, r), r);
}
async function cp(e = !1) {
	if (!globalThis.crossOriginIsolated)
		throw Error(
			`the guest GL needs a cross-origin isolated page (SharedArrayBuffer bridge).`,
		);
	let { makeGlChannel: t } = await Promise.resolve().then(() => (gi(), Br)),
		n = t();
	return ((n.d3d = !!e), n);
}
function lp(e, t) {
	if (!e?.control || typeof Atomics.waitAsync != `function`) return;
	let n = new Int32Array(e.control),
		r = !1;
	(async () => {
		for (; !r; ) {
			let e = Atomics.load(n, 0);
			if (e === 1) {
				(console.warn(`[gex] the guest opened its GL: starting Mesa`),
					(r = !0),
					t());
				break;
			}
			let i = Atomics.waitAsync(n, 0, e, 5e3);
			i.async && (await i.value);
		}
	})();
}
async function up({
	wl: e,
	wlInput: t = null,
	wlScale: n = 1,
	onDesktop: r = null,
	say: i = () => {},
}) {
	if (!globalThis.crossOriginIsolated)
		throw Error(
			`the Wayland compositor needs a cross-origin isolated page (SharedArrayBuffer bridge).`,
		);
	let { makeWlChannel: a, setOutputSize: o } = await Promise.resolve().then(
			() => (Fa(), _i),
		),
		s = a(),
		c = typeof e.getContext != `function` && e.nodeType === 1 ? e : null;
	if (c) {
		let { DomDesktop: e } = await Promise.resolve().then(() => (lf(), nf)),
			t = e.create(c, s, { width: c.clientWidth, height: c.clientHeight });
		return (
			(globalThis.__gexDesktop = t),
			r?.(t),
			(t.onglfailed = (e) => {
				(i(`gex: the guest's OpenGL is gone: ${e}`),
					i(`gex: GL windows will be blank; everything else still runs`));
			}),
			{ wlChannel: s, compositor: t, dom: !0 }
		);
	}
	if (typeof e.getContext != `function`)
		return { wlChannel: s, compositor: null, dom: !1 };
	o(s, e.width, e.height, Math.max(1, Math.round(n)));
	let { Compositor: l } = await Promise.resolve().then(() => (ll(), ol)),
		u = await l.create(e, s, t || e, { scale: n });
	return (
		(globalThis.__gexCompositor = u),
		{ wlChannel: s, compositor: u, dom: !1 }
	);
}
async function dp(
	e,
	{
		elf: t,
		files: n = {},
		dirs: r = [],
		modes: i = {},
		hard: a = {},
		symlinks: o = {},
		lazy: s = [],
		mtimes: c = void 0,
		xattrs: l = void 0,
		env: u = [],
		args: d,
		cwd: f = `/`,
		tty: p = !0,
		network: m = null,
		onNetEvent: h = null,
		onFilesLoaded: g = null,
		transfer: _ = [],
		onDesktop: v = null,
		gl: y = null,
		glBackend: b = `wgpu`,
		d3d: x = !1,
		wl: C = null,
		wlInput: w = null,
		wlScale: T = 1,
		hostX: ee = !1,
		uid: E,
		heartbeat: D = Pp(),
		fill: te = null,
		lazyCache: ne = null,
		pageFs: re = null,
		playAudio: ie = !0,
		restBundle: ae = !1,
		identities: oe = null,
		stateful: se = null,
		providerSources: O = null,
		recompileObjects: k = Np(),
		closure: ce = null,
		closureBuildNumbered: le = !1,
		link: ue = Fp(),
		preModules: de = null,
		lateUnits: fe = null,
		onSystem: pe = null,
		glLazy: me = !1,
		glSource: he = null,
	},
) {
	((globalThis.__gexTso = await qf()),
		Kf() &&
			ce &&
			(console.warn(
				`[gex] tso: the closure is translated with plain accesses; translating instead`,
			),
			(ce = null)));
	let { shimBytes: ge, seedBytes: _e } = await Wf(),
		ve = await Xf();
	await Zf();
	let ye = p ? await zc.open(ve) : null,
		be = new jp(e, ye);
	((globalThis.gexTty = ye),
		ye?.resize(e.rows, e.cols),
		L(`debug`) && console.warn(`[gex] runtime rings: gl=${!!y} wl=${!!C}`));
	let A = null,
		xe = null,
		j = null;
	if (y && S.on) A = { inRealm: !0, d3d: !!x };
	else if (y) {
		A = await cp(x);
		let { serveGl: e } = await Promise.resolve().then(() => (gi(), Br));
		y !== `compositor` && (xe = y.attachChannel?.(A) || e(y, A));
	}
	let Se = await sp(m),
		Ce = null,
		M = null;
	if (C?.inRealm) ({ channel: Ce, compositor: M } = C.inRealm);
	else if (C) {
		let t;
		(({
			wlChannel: Ce,
			compositor: M,
			dom: t,
		} = await up({
			wl: C,
			wlInput: w,
			wlScale: T,
			onDesktop: v,
			say: (t) => e.writeln(t),
		})),
			y === `compositor` &&
				A &&
				M &&
				((j = ap(M, A, { dom: t, backend: b, source: he }, e)),
				me ? lp(A, j) : await j()));
	}
	let we = null;
	if (ee && Ce) {
		if (!ve) throw Error(`the host X server needs the global kernel`);
		we = await rp({
			kernel: ve,
			wlChannel: Ce,
			compositor: () => M,
			term: e,
			rootful: ee === `rootful`,
		});
	}
	let Te = await op(
			{
				kernel: ve,
				closure: ce,
				lateUnits: fe,
				heartbeat: D,
				fill: te,
				lazyCache: ne,
				pageFs: re,
				restBundle: ae,
				identities: oe,
				providerSources: O,
				stateful: se,
				recompileObjects: k,
				closureBuildNumbered: le,
				link: ue,
				uid: E,
				preModules: de,
				glChannel: A,
				wlChannel: Ce,
				netChannel: Se,
				network: m,
				winsize: ye ? void 0 : { rows: e.rows, cols: e.cols },
			},
			{
				onOutput: (t, n, r, i) => {
					(i?.lflag !== void 0 && (be.lflag = i.lflag), e.write(n));
				},
				onExit: (e, t) => {
					typeof t == `number` && M?.dropMemory?.(t);
				},
				readStdin: (e) => (e !== void 0 && (be.lflag = e), be.readStdin()),
				onMessage: (e) => {
					e.kind === `gl`
						? xe?.()
						: e.kind === `wl-memory`
							? M?.addMemory(e.token, e.memory, e.kernel)
							: e.kind === `wl-pixels`
								? M?.addPixels?.(e.token, e.id, e.buffer, e.replaces)
								: e.kind === `wl` ||
									(e.kind === `net`
										? h?.(e.event)
										: e.kind === `files-loaded`
											? g?.()
											: e.kind === `audio` &&
												ie &&
												Yc({
													...e,
													clock: Y(`audioclock`) !== `0`,
													latency: Jf(),
													loop: Y(`audioloop`) === `1`,
												}));
				},
			},
		),
		Ee = e.onData((e) => be.onKey(e));
	e.focus?.();
	let De = e.onResize(({ rows: e, cols: t }) => {
			ye ? Promise.resolve(ye.resize(e, t)).catch(() => {}) : Te.resize(e, t);
		}),
		N =
			Ce && ve && !we
				? (t) =>
						(Oe ??= rp({
							kernel: ve,
							wlChannel: Ce,
							compositor: () => M,
							term: e,
							listen: t,
						}).then((e) => ((we = e), e)))
				: null,
		Oe = null,
		ke = null,
		P = t
			? null
			: new Promise((e) => {
					ke = e;
				});
	pe?.({
		host: Te,
		kernel: ve,
		tty: ye,
		compositor: M,
		startGl: j,
		wlChannel: Ce,
		startX: N,
		spawnExec: t
			? null
			: ({ uid: e = E, gid: t = e, ...n }) =>
					Te.spawnExec({
						...n,
						opts: {
							...yt(`opts`),
							recompileObjects: k,
							heartbeat: D,
							link: ue,
							uid: e,
							gid: t,
						},
					}),
		halt: (e = 0) => ke?.(e),
	});
	try {
		return {
			status: P
				? await P
				: await Te.start({
						elf: t,
						files: n,
						transfer: _,
						dirs: r,
						modes: i,
						env: u,
						args: d,
						opts: {
							cwd: f,
							tty: p,
							uid: E,
							recompileObjects: k,
							heartbeat: D,
							link: ue,
							dirs: r,
							modes: i,
							hard: a,
							symlinks: o,
							lazy: s,
							mtimes: c,
							xattrs: l,
							env: u,
							pins: fp(ce?.pins, globalThis.GEX_PINS),
							...yt(`opts`),
							program: ce?.program ?? d?.[0],
						},
					}),
			host: Te,
			tenv: be,
		};
	} finally {
		(Ee.dispose(),
			De.dispose(),
			Te.stop(),
			M?.stop(),
			we?.terminate(),
			xe?.stop?.());
	}
}
function fp(e, t) {
	if (!t) return e;
	let n = { ...(e ?? {}) };
	for (let e of t
		.split(`,`)
		.map((e) => e.trim())
		.filter(Boolean)) {
		let t = /^(.+)@(?:0x)?([0-9a-f]+)(?:\+(?:0x)?([0-9a-f]+))?$/i.exec(e);
		if (!t) {
			console.error(`[gex] ?pins: cannot read ${e}`);
			continue;
		}
		n[t[1]] = {
			base: Number.parseInt(t[2], 16),
			span: t[3] ? Number.parseInt(t[3], 16) : 0,
		};
	}
	return n;
}
var pp,
	mp,
	hp,
	gp,
	_p,
	vp,
	yp,
	bp,
	xp,
	Sp,
	Cp,
	wp,
	Tp,
	Ep,
	Dp,
	Op,
	kp,
	Ap,
	jp,
	Mp,
	Np,
	Pp,
	Fp,
	Ip = o(() => {
		(zr(),
			Fc(),
			Vc(),
			Pt(),
			ae(),
			ot(),
			Vt(),
			St(),
			le(),
			Jc(),
			el(),
			(pp = { net: 0, cached: 0 }),
			(mp = (e) => {
				try {
					return new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ e,
						globalThis.location?.href,
					).href;
				} catch {
					return e;
				}
			}),
			(hp = (e) =>
				e.url.startsWith(`file:`)
					? {
							...e,
							root: decodeURIComponent(
								new URL(/* @vite-ignore */ /* webpackIgnore: true */ e.url)
									.pathname,
							),
						}
					: e),
			(gp = 2),
			(_p = 8),
			(vp = !0),
			(yp = () => (globalThis.GEX_MEM64 && jf() === `x86` ? `.m64` : ``)),
			(bp = () => k(`/gex/gex_browser${Mf()}${yp()}.shared.wasm`)),
			(xp = () => k(`/gex/seed${Mf()}${yp()}.shared.wasm`)),
			(Sp = () => k(`/gex/gex_kernel${Mf()}${yp()}.wasm`)),
			(Cp = null),
			(wp = null),
			(Tp = null),
			(Ep = { shim: null, kernel: null }),
			(Dp = () => !!Y(`xcache`) && Y(`xcache`) !== `0`),
			(Op = null),
			(kp = (e) => (Op ?? zf)(e)),
			(Ap = !1),
			(jp = class extends Fr {
				constructor(e, t = null) {
					(super(),
						(this.term = e),
						(this.tty = t),
						(this.pending = []),
						(this.line = []),
						(this.waiter = null),
						(this.closed = !1),
						(this.lflag = 10));
				}
				write(e, t) {
					this.term.write(t.slice());
				}
				now() {
					return BigInt(Math.round(performance.now() * 1e6));
				}
				#e() {
					return (this.lflag & gp) === 0;
				}
				#t() {
					return (this.lflag & _p) !== 0;
				}
				onKey(e) {
					if (!this.closed) {
						if (this.tty) {
							this.keys = (this.keys ?? Promise.resolve())
								.then(async () => {
									let { echo: t, ready: n } = await this.tty.key(e);
									if ((t && this.term.write(t), n !== 0 && this.waiter)) {
										let e = this.waiter;
										((this.waiter = null), e(!(n < 0)));
									}
								})
								.catch((e) =>
									console.warn(`[gex] terminal: ${e?.message ?? e}`),
								);
							return;
						}
						if (this.#e()) {
							this.#n(e);
							return;
						}
						for (let t of e)
							t === `\r` ||
							t ===
								`
`
								? (this.#t() &&
										this.term.write(`\r
`),
									this.line.push(`
`),
									this.#n(this.line.join(``)),
									(this.line = []))
								: t === `` || t === `\b`
									? this.line.length &&
										(this.line.pop(), this.#t() && this.term.write(`\b \b`))
									: t === ``
										? ((this.line = []),
											this.term.write(`^C\r
`),
											this.#n(`
`))
										: t === ``
											? this.line.length || ((this.closed = !0), this.#n(null))
											: t >= ` ` &&
												(this.line.push(t), this.#t() && this.term.write(t));
					}
				}
				#n(e) {
					if (e === null) {
						if (this.waiter) {
							let e = this.waiter;
							((this.waiter = null), e(!1));
						}
						return;
					}
					let t = new TextEncoder().encode(e);
					if (this.waiter) {
						let e = this.waiter;
						((this.waiter = null), e(t));
					} else this.pending.push(t);
				}
				async readStdin() {
					if (this.tty) {
						let e = await this.tty.ready();
						return e < 0
							? !1
							: e > 0 ||
									new Promise((e) => {
										this.waiter = e;
									});
					}
					if (this.closed) return !1;
					if (this.pending.length) {
						let e = this.pending.reduce((e, t) => e + t.length, 0),
							t = new Uint8Array(e),
							n = 0;
						for (let e of this.pending) (t.set(e, n), (n += e.length));
						return ((this.pending = []), t);
					}
					return new Promise((e) => {
						this.waiter = e;
					});
				}
			}),
			(Mp = null),
			(Np = () =>
				typeof globalThis.GEX_RECOMPILE_OBJECTS == `number`
					? globalThis.GEX_RECOMPILE_OBJECTS
					: 0),
			(Pp = () => globalThis.GEX_HEARTBEAT ?? 0),
			(Fp = () => Number(globalThis.GEX_LINK ?? 0)));
	}),
	Lp = c({ glInRealm: () => Nm, inRealm: () => Zp });
function Rp(e) {
	((X = e > 0 && Number.isFinite(e) ? e : 1),
		(Qp = Math.round(26 * X)),
		($p = Math.max(1, Math.round(X))),
		(em = Math.round(6 * X)),
		(um = Math.round(18 * X)),
		(dm = Math.round(6 * X)));
}
function zp(e, t, n) {
	return e.createTexture({
		size: [Math.max(1, t), Math.max(1, n)],
		format: `rgba8unorm`,
		usage:
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.RENDER_ATTACHMENT,
	});
}
function Bp(e) {
	if (gm === `canvas` || gm === `readback`) return gm;
	let t = e?.info ?? {};
	return t.isFallbackAdapter || t.architecture === `swiftshader`
		? `readback`
		: `canvas`;
}
function Vp(e, t) {
	if (e.length !== t.length) return !1;
	if (!(e.byteOffset & 3) && !(t.byteOffset & 3) && !(e.length & 3)) {
		let n = new Uint32Array(e.buffer, e.byteOffset, e.length >> 2),
			r = new Uint32Array(t.buffer, t.byteOffset, t.length >> 2);
		for (let e = 0; e < n.length; e++) if (n[e] !== r[e]) return !1;
		return !0;
	}
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
function Hp(e, t) {
	let n = zp(e, t.width, t.height);
	return (
		e.queue.copyExternalImageToTexture(
			{ source: t },
			{ texture: n, premultipliedAlpha: !1 },
			[t.width, t.height],
		),
		n
	);
}
function Up() {
	if (!(!Q || !Cm)) {
		((Tm = !1), wm++);
		try {
			(Mm++, $?.display?.(), Q.frame());
		} catch (e) {
			(Z({ kind: `error`, error: e?.stack || String(e) }), (Cm = !1));
			return;
		}
		requestAnimationFrame(Up);
	}
}
async function Wp(e) {
	let t;
	for (;;) {
		if (((t = await Ei(e, t)), t === null || !Cm)) return;
		if (!(!Q || Tm)) {
			Tm = !0;
			try {
				Q.frame();
			} catch (e) {
				(Z({ kind: `error`, error: e?.stack || String(e) }), (Cm = !1));
				return;
			}
		}
	}
}
function Gp() {
	return $?.ok ? $.attachment() : null;
}
function Kp() {
	return $?.ok ? (jm === Mm ? Am : ((jm = Mm), (Am = $.surfaces()), Am)) : [];
}
function qp(e) {
	for (let t of Kp())
		if (
			t.id &&
			(t.kind === 0
				? e.token === t.token && e.surface === t.id
				: e.info?.xid === t.id)
		)
			return Jp();
	return null;
}
function Jp() {
	let e = km?.texture();
	return !e || e.width < 2 || e.height < 2
		? null
		: { tex: e, w: e.width, h: e.height, serial: $?.presentedCount?.() ?? 0 };
}
async function Yp(e, t) {
	((km = hd()),
		(Om = km.canvas),
		globalThis.document ||
			(globalThis.document = {
				querySelector: () => Om,
				querySelectorAll: () => [],
			}));
	let { MesaGlDevice: n } = await Promise.resolve().then(() => (tf(), Ld));
	if (
		(($ = await n.create(Om, {
			url: e.url,
			files: e.files,
			api: e.api || `core`,
			env: e.mesaEnv,
			capture: e.glCapture,
			wgslCache: e.wgslCache,
			wgpuStats: e.wgpuStats,
			glTrace: e.glTrace,
			...(e.sources ? { source: (t) => e.sources[t] ?? null } : {}),
			gpu: await md(),
		})),
		!$.ok)
	)
		throw Error($.error || `the GL device would not start`);
	if (
		((Em = e.channel), Z({ kind: `gl-ready`, describe: $.describe() }), !Em)
	) {
		Nm.resolve?.(Nm);
		return;
	}
	Xp();
}
async function Xp() {
	if (Dm) return;
	Dm = !0;
	let { serveGl: e } = await Promise.resolve().then(() => (gi(), Br));
	e($, Em);
}
function Zp(e) {
	return ((Z = e), (e) => Pm({ data: e }));
}
var X,
	Qp,
	$p,
	em,
	tm,
	nm,
	rm,
	im,
	am,
	om,
	sm,
	cm,
	lm,
	um,
	dm,
	fm,
	pm,
	mm,
	hm,
	gm,
	_m,
	vm,
	ym,
	bm,
	xm,
	Z,
	Q,
	Sm,
	Cm,
	wm,
	Tm,
	$,
	Em,
	Dm,
	Om,
	km,
	Am,
	jm,
	Mm,
	Nm,
	Pm,
	Fm = o(() => {
		(Sd(),
			Fa(),
			(X = 1),
			(Qp = 26),
			($p = 1),
			(em = 6),
			(tm = 1),
			(nm = 2),
			(rm = 4),
			(im = 8),
			(am = {
				[tm]: `ns-resize`,
				[nm]: `ns-resize`,
				[rm]: `ew-resize`,
				[im]: `ew-resize`,
				5: `nwse-resize`,
				10: `nwse-resize`,
				9: `nesw-resize`,
				6: `nesw-resize`,
			}),
			(om = 1),
			(sm = 2),
			(cm = 4),
			(lm = 8),
			(um = 18),
			(dm = 6),
			(fm = {
				desktop: [0.07, 0.09, 0.12, 1],
				titleActive: [0.16, 0.42, 0.72, 1],
				titleIdle: [0.18, 0.2, 0.24, 1],
				border: [0.05, 0.06, 0.08, 1],
				close: [0.78, 0.28, 0.28, 1],
				closeIdle: [0.35, 0.3, 0.32, 1],
				shadow: [0, 0, 0, 0.35],
			}),
			(pm = `
struct U {
  rect: vec4f,      // x, y, w, h in output pixels
  texRect: vec4f,   // sub-rectangle of the texture to sample (0..1)
  color: vec4f,
  output: vec2f,    // output size in pixels
  mode: u32,        // 0 = texture, 1 = solid colour
  swizzle: u32,     // 1 = the texture holds BGRA bytes (wl_shm)
  opaque: u32,      // 1 = force alpha to 1 (XRGB has no alpha)
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;
struct V { @builtin(position) pos: vec4f, @location(0) uv: vec2f };
// One unit quad, placed by a pixel rectangle: the corner comes from the
// vertex index, so a draw is a uniform slice and a call.
@vertex fn vs(@builtin(vertex_index) i: u32) -> V {
  let corner = vec2f(f32(i & 1u), f32((i >> 1u) & 1u));
  let px = u.rect.xy + corner * u.rect.zw;
  var o: V;
  o.pos = vec4f(px.x / u.output.x * 2.0 - 1.0, 1.0 - px.y / u.output.y * 2.0, 0.0, 1.0);
  o.uv = u.texRect.xy + corner * u.texRect.zw;
  return o;
}
@fragment fn fs(v: V) -> @location(0) vec4f {
  var c = textureSample(tex, samp, v.uv);
  if (u.mode == 1u) { return u.color; }
  if (u.swizzle == 1u) { c = c.bgra; }
  if (u.opaque == 1u) { c.a = 1.0; }
  return c;
}`),
			(mm = 256),
			(hm = 1024),
			(gm = null),
			(_m = 262144),
			(vm = class {
				constructor(e, t, n) {
					((this.device = e), (this.context = t), (this.format = n));
					let r = e.createShaderModule({ code: pm });
					this.layout = e.createBindGroupLayout({
						entries: [
							{
								binding: 0,
								visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
								buffer: { type: `uniform`, hasDynamicOffset: !0 },
							},
							{ binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
							{ binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} },
						],
					});
					let i = {
						srcFactor: `src-alpha`,
						dstFactor: `one-minus-src-alpha`,
						operation: `add`,
					};
					((this.pipeline = e.createRenderPipeline({
						layout: e.createPipelineLayout({ bindGroupLayouts: [this.layout] }),
						vertex: { module: r, entryPoint: `vs` },
						fragment: {
							module: r,
							entryPoint: `fs`,
							targets: [{ format: n, blend: { color: i, alpha: i } }],
						},
						primitive: { topology: `triangle-strip` },
					})),
						(this.sampler = e.createSampler({
							minFilter: `linear`,
							magFilter: `linear`,
						})),
						(this.nearest = e.createSampler({
							minFilter: `nearest`,
							magFilter: `nearest`,
						})),
						(this.groupsNearest = new WeakMap()),
						(this.uniforms = e.createBuffer({
							size: mm * hm,
							usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
						})),
						(this.data = new ArrayBuffer(mm * hm)),
						(this.f32 = new Float32Array(this.data)),
						(this.u32 = new Uint32Array(this.data)),
						(this.white = zp(e, 1, 1)),
						e.queue.writeTexture(
							{ texture: this.white },
							new Uint8Array([255, 255, 255, 255]),
							{ bytesPerRow: 4 },
							[1, 1],
						),
						(this.groups = new WeakMap()),
						(this.scene = null),
						(this.keep = !1));
				}
				#e(e, t) {
					let n = t ? this.groupsNearest : this.groups,
						r = n.get(e);
					return (
						r ||
							((r = this.device.createBindGroup({
								layout: this.layout,
								entries: [
									{ binding: 0, resource: { buffer: this.uniforms, size: 80 } },
									{ binding: 1, resource: t ? this.nearest : this.sampler },
									{ binding: 2, resource: e.createView() },
								],
							})),
							n.set(e, r)),
						r
					);
				}
				begin(e, t) {
					let n;
					return (
						this.context && !this.keep
							? (n = this.context.getCurrentTexture())
							: ((!this.scene ||
									this.scene.width !== e ||
									this.scene.height !== t) &&
									(this.scene?.destroy(),
									(this.scene = this.device.createTexture({
										size: [e, t],
										format: this.format,
										usage:
											GPUTextureUsage.RENDER_ATTACHMENT |
											GPUTextureUsage.COPY_SRC,
									}))),
								(n = this.scene)),
						(this.w = e),
						(this.h = t),
						(this.n = 0),
						(this.encoder = this.device.createCommandEncoder()),
						(this.pass = this.encoder.beginRenderPass({
							colorAttachments: [
								{
									view: n.createView(),
									loadOp: `clear`,
									storeOp: `store`,
									clearValue: {
										r: fm.desktop[0],
										g: fm.desktop[1],
										b: fm.desktop[2],
										a: 1,
									},
								},
							],
						})),
						this.pass.setPipeline(this.pipeline),
						!0
					);
				}
				#t(e, t, n, r, i, a, o, s, c, l) {
					if (this.n >= hm) return;
					let u = (this.n * mm) / 4,
						d = this.f32;
					((d[u] = e),
						(d[u + 1] = t),
						(d[u + 2] = n),
						(d[u + 3] = r),
						(d[u + 4] = l[0]),
						(d[u + 5] = l[1]),
						(d[u + 6] = l[2]),
						(d[u + 7] = l[3]),
						(d[u + 8] = o[0]),
						(d[u + 9] = o[1]),
						(d[u + 10] = o[2]),
						(d[u + 11] = o[3]),
						(d[u + 12] = this.w),
						(d[u + 13] = this.h),
						(this.u32[u + 14] = a),
						(this.u32[u + 15] = s),
						(this.u32[u + 16] = c));
					let f =
						a === 1 ||
						(n === Math.round(n) &&
							r === Math.round(r) &&
							e === Math.round(e) &&
							t === Math.round(t) &&
							Math.round(n / Math.max(1e-9, l[2])) === i.width &&
							Math.round(r / Math.max(1e-9, l[3])) === i.height);
					(this.pass.setBindGroup(0, this.#e(i, f), [this.n * mm]),
						this.pass.draw(4),
						this.n++);
				}
				solid(e, t, n, r, i) {
					this.#t(e, t, n, r, this.white, 1, i, 0, 0, [0, 0, 1, 1]);
				}
				textured(
					e,
					t,
					n,
					r,
					i,
					{ swizzle: a = 0, opaque: o = 0, uv: s = [0, 0, 1, 1] } = {},
				) {
					i && this.#t(e, t, n, r, i, 0, [0, 0, 0, 0], a, o, s);
				}
				end() {
					if (
						(this.pass.end(),
						this.n &&
							this.device.queue.writeBuffer(
								this.uniforms,
								0,
								this.data,
								0,
								this.n * mm,
							),
						this.context && this.keep)
					) {
						let e = this.context.getCurrentTexture();
						this.encoder.copyTextureToTexture(
							{ texture: this.scene },
							{ texture: e },
							[this.w, this.h],
						);
					}
					(this.device.queue.submit([this.encoder.finish()]),
						(this.pass = null),
						(this.encoder = null),
						this.ctx2d && this.#a());
					let e = this.#n;
					this.#n = [];
					for (let t of e) t();
				}
				#n = [];
				sceneFor() {
					return !this.context || this.keep ? !0 : ((this.keep = !0), !1);
				}
				drawn(e) {
					return new Promise((t) => {
						let n = setTimeout(t, e);
						this.#n.push(() => {
							(clearTimeout(n), t());
						});
					});
				}
				directFrame(e, t, n) {
					((this.w = t),
						(this.h = n),
						(this.n = 0),
						(this.encoder = this.device.createCommandEncoder()));
					let r;
					(this.context
						? (r = this.context.getCurrentTexture())
						: ((!this.scene ||
								this.scene.width !== t ||
								this.scene.height !== n) &&
								(this.scene?.destroy(),
								(this.scene = this.device.createTexture({
									size: [t, n],
									format: this.format,
									usage:
										GPUTextureUsage.RENDER_ATTACHMENT |
										GPUTextureUsage.COPY_SRC,
								}))),
							(r = this.scene)),
						(this.pass = this.encoder.beginRenderPass({
							colorAttachments: [
								{
									view: r.createView(),
									loadOp: `clear`,
									storeOp: `store`,
									clearValue: { r: 0, g: 0, b: 0, a: 1 },
								},
							],
						})),
						this.pass.setPipeline(this.pipeline),
						this.textured(0, 0, t, n, e, { opaque: 1 }),
						this.pass.end(),
						this.device.queue.writeBuffer(
							this.uniforms,
							0,
							this.data,
							0,
							this.n * mm,
						),
						this.device.queue.submit([this.encoder.finish()]),
						(this.pass = null),
						(this.encoder = null),
						this.ctx2d && this.#a());
				}
				#r = !1;
				#i = !1;
				#a() {
					if (this.#r) {
						this.#i = !0;
						return;
					}
					((this.#r = !0),
						(this.#i = !1),
						this.read()
							.then((e) => {
								e &&
									e.w === this.ctx2d.canvas.width &&
									e.h === this.ctx2d.canvas.height &&
									this.ctx2d.putImageData(
										new ImageData(
											new Uint8ClampedArray(e.px.buffer, 0, e.w * e.h * 4),
											e.w,
											e.h,
										),
										0,
										0,
									);
							})
							.catch(() => {})
							.finally(() => {
								((this.#r = !1), this.#i && this.#a());
							}));
				}
				async read() {
					if (!this.scene) return null;
					let e = this.scene.width,
						t = this.scene.height,
						n = Math.ceil((e * 4) / 256) * 256,
						r = this.device.createBuffer({
							size: n * t,
							usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
						}),
						i = this.device.createCommandEncoder();
					(i.copyTextureToBuffer(
						{ texture: this.scene },
						{ buffer: r, bytesPerRow: n },
						[e, t],
					),
						this.device.queue.submit([i.finish()]),
						await r.mapAsync(GPUMapMode.READ));
					let a = new Uint8Array(r.getMappedRange()),
						o = new Uint8Array(e * t * 4);
					for (let r = 0; r < t; r++)
						o.set(a.subarray(r * n, r * n + e * 4), r * e * 4);
					return (r.unmap(), r.destroy(), { w: e, h: t, px: o });
				}
			}),
			(ym = class {
				#e;
				#t = new Map();
				constructor(e) {
					this.#e = e;
				}
				get(e) {
					let t = this.#t.get(e);
					if (t) return t;
					let n = new OffscreenCanvas(1, 1),
						r = n.getContext(`2d`),
						i = Math.round(13 * X);
					if (
						((r.font = `${i}px system-ui, sans-serif`),
						(n.width = Math.max(1, Math.ceil(r.measureText(e).width))),
						(n.height = Math.round(18 * X)),
						(r = n.getContext(`2d`)),
						(r.font = `${i}px system-ui, sans-serif`),
						(r.textBaseline = `middle`),
						(r.fillStyle = `white`),
						r.fillText(e, 0, n.height / 2),
						(t = { tex: Hp(this.#e, n), w: n.width, h: n.height }),
						this.#t.size > 64)
					) {
						for (let [e, t] of this.#t)
							if ((t.tex.destroy(), this.#t.delete(e), this.#t.size <= 32))
								break;
					}
					return (this.#t.set(e, t), t);
				}
			}),
			(bm = (e) => `${e.token}:${e.client}:${e.surface}`),
			(xm = class {
				#e;
				#t;
				#n;
				#r;
				#i = new Map();
				#a = new Map();
				#o = new Map();
				#s = [];
				#c = ``;
				#l = 0;
				#u = 0;
				#d = null;
				#f = null;
				#p = { x: 0, y: 0, over: null, buttons: 0 };
				#m = null;
				#h = null;
				#g = null;
				pointerLock(e, t) {
					let n = this.#g ? this.#o.get(this.#g) : null;
					(n && U(this.#r, n.block, 15, 0, 0, t, 0, n.client, n.surface),
						(this.#g = e ? this.#m : null));
					let r = this.#g ? this.#o.get(this.#g) : null;
					r && U(this.#r, r.block, 15, 1, 0, t, 0, r.client, r.surface);
				}
				pointerRelative(e, t, n) {
					let r = this.#g ? this.#o.get(this.#g) : null;
					if (!r) return;
					let i = r.cs || 1;
					U(
						this.#r,
						r.block,
						16,
						Math.round(e / i),
						Math.round(t / i),
						n,
						0,
						r.client,
						r.surface,
					);
				}
				#_ = null;
				#v = null;
				#y = null;
				#b = 0;
				#x = 0;
				#S = 0;
				#C = 0;
				#w = null;
				#T = null;
				#E = new Uint8Array();
				#D = { n: 0, bytes: 0, same: 0, full: 0, fullBytes: 0 };
				#O = [];
				#k = new Map();
				constructor(e, t, n, r) {
					((this.#r = t), (this.#w = n));
					let i = r.device;
					if (((this.#e = i), (this.#A = e), Bp(r.adapter) === `canvas`)) {
						let t = e.getContext(`webgpu`);
						if (!t) throw Error(`no webgpu context for the compositor`);
						let n = navigator.gpu.getPreferredCanvasFormat();
						(t.configure({
							device: i,
							format: n,
							alphaMode: `opaque`,
							usage:
								GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
						}),
							(this.#t = new vm(i, t, n)));
					} else
						((this.#t = new vm(i, null, `rgba8unorm`)),
							(this.#t.ctx2d = e.getContext(`2d`, { alpha: !1 })));
					((this.#n = new ym(i)), this.resize(e.width, e.height));
				}
				#A;
				resize(e, t) {
					((this.#b = Math.max(1, e | 0)),
						(this.#x = Math.max(1, t | 0)),
						!this.#de && this.#A.width !== this.#b && (this.#A.width = this.#b),
						!this.#de &&
							this.#A.height !== this.#x &&
							(this.#A.height = this.#x),
						Ti(this.#r, this.#b, this.#x));
					for (let [e, t] of this.#o)
						t.role === 1 && this.#we(t, this.#d === e);
				}
				addMemory(e, t, n) {
					(Ii(this.#r, n),
						t &&
							!this.#r.pixels &&
							this.#i.set(e, { memory: t, view: new Uint8Array(t.buffer) }));
				}
				addPixels(e, t, n, r) {
					(r && this.#M.delete(r),
						t && n && this.#M.set(t, { token: e, view: new Uint8Array(n) }));
				}
				#j(e) {
					return this.#r.pixels
						? (this.#M.get(e.pix)?.view ?? null)
						: this.#N(e.token);
				}
				#M = new Map();
				#N(e) {
					let t = this.#i.get(e);
					if (!t) return null;
					let n = t.memory.buffer;
					return (
						(t.view.buffer !== n || t.view.length !== n.byteLength) &&
							(t.view = new Uint8Array(n)),
						t.view
					);
				}
				dropMemory(e) {
					this.#i.delete(e);
					for (let [t, n] of this.#M) n.token === e && this.#M.delete(t);
					let t = Ai(this.#r, e);
					t && this.#H(`released ${t} block(s) of exited process ${e}`);
				}
				#P(e) {
					let t = Math.max(160, this.#b - 2 * $p),
						n = Math.max(120, this.#x - Qp - 2 * $p);
					return e.fullscreen
						? { w: this.#b, h: this.#x }
						: e.want
							? { w: Math.min(e.want.w, t), h: Math.min(e.want.h, n) }
							: { w: 0, h: 0 };
				}
				#F(e, t, n) {
					let r = n & 7,
						i = !!(this.#p.buttons & 1);
					(this.#H(
						`request ${e} ${[`none`, `move`, `resize`, `maximize`, `unmaximize`][r] ?? r}`,
					),
						!t.fullscreen &&
							(r === 1 && i && !t.maximized
								? (this.#_ = {
										key: e,
										dx: this.#p.x - t.x,
										dy: this.#p.y - t.y,
									})
								: r === 2 && i && !t.maximized
									? this.#I(e, t, n >> 3)
									: r === 3
										? this.#z(e, !0)
										: r === 4 && this.#z(e, !1)));
				}
				#I(e, t, n) {
					n &&
						((this.#v = {
							key: e,
							edges: n,
							px: this.#p.x,
							py: this.#p.y,
							x0: t.x,
							y0: t.y,
							w0: t.want?.w ?? t.width,
							h0: t.want?.h ?? t.height,
							sentAt: 0,
						}),
						this.#H(`resize ${e} edges ${n}`));
				}
				#L(e, t, n) {
					let r = this.#v,
						i = this.#o.get(r.key);
					if (!i) return;
					let a = Math.round(e - r.px),
						o = Math.round(t - r.py),
						s = Math.max(160, this.#b - 2 * $p),
						c = Math.max(120, this.#x - Qp - 2 * $p),
						l = Math.round(96 * X),
						u = Math.round(48 * X),
						d = r.w0,
						f = r.h0;
					(r.edges & im && (d = r.w0 + a),
						r.edges & rm && (d = r.w0 - a),
						r.edges & nm && (f = r.h0 + o),
						r.edges & tm && (f = r.h0 - o),
						(d = Math.max(l, Math.min(s, d))),
						(f = Math.max(u, Math.min(c, f))),
						r.edges & rm && (i.x = r.x0 + (r.w0 - d)),
						r.edges & tm && (i.y = r.y0 + (r.h0 - f)),
						r.edges & 5 && this.#V(i),
						(i.want = { w: d, h: f }));
					let p = performance.now();
					(!n && i.configurePending && p - r.sentAt < 250) ||
						((r.sentAt = p), this.#we(i, this.#d === r.key, n ? 0 : cm));
				}
				#R(e, t, n) {
					if (n)
						((t.restoreFs = { x: t.x, y: t.y }),
							(t.x = 0),
							(t.y = 0),
							(t.fullscreen = !0),
							this.#Ee(e),
							this.#Te(e));
					else {
						let e = t.restoreFs ?? { x: $p, y: Qp };
						((t.x = e.x), (t.y = e.y), (t.fullscreen = !1));
					}
					(this.#H(`${n ? `fullscreen` : `unfullscreen`} ${e}`),
						this.#V(t),
						this.#we(t, this.#d === e));
				}
				#z(e, t) {
					let n = this.#o.get(e);
					if (!(!n || n.role !== 1 || !!n.maximized === t)) {
						if (t) {
							n.restore = {
								x: n.x,
								y: n.y,
								want: n.want,
								w: n.width,
								h: n.height,
							};
							let e = Math.max(160, this.#b - 2 * $p),
								t = Math.max(120, this.#x - Qp - 2 * $p);
							((n.x = $p),
								(n.y = Qp),
								(n.want = { w: e, h: t }),
								(n.maximized = !0));
						} else {
							let e = n.restore ?? {
								x: n.x,
								y: n.y,
								want: void 0,
								w: n.width,
								h: n.height,
							};
							((n.x = e.x),
								(n.y = e.y),
								(n.want = e.want ?? { w: e.w, h: e.h }),
								(n.maximized = !1));
						}
						(this.#H(`${t ? `maximize` : `unmaximize`} ${e}`),
							this.#V(n),
							this.#Ee(e),
							this.#we(n, this.#d === e));
					}
				}
				#B() {
					let { surfaces: e, blocks: t } = Oi(this.#r),
						n = new Set(),
						r = new Map(),
						i = [],
						a = [];
					for (let t of e) {
						let e = bm(t);
						(n.add(e), r.set(e, t));
						let o = this.#o.get(e);
						if (!o) {
							((o = {
								key: e,
								token: t.token,
								block: t.block,
								client: t.client,
								surface: t.surface,
								role: t.role,
								x: 0,
								y: 0,
								width: t.width,
								height: t.height,
								title: t.title,
								serial: 0,
							}),
								this.#H(`+ ${e} role=${t.role} ${t.width}x${t.height}`),
								this.#o.set(e, o));
							let n = this.#k.get(e);
							if (t.placed) this.#s.push(e);
							else if (t.role === 1 && n)
								((o.x = n.x),
									(o.y = n.y),
									this.#s.push(e),
									this.#Te(e),
									this.#V(o));
							else if (t.role === 1) {
								let n = Math.round(28 * X),
									r = this.#C++,
									i = Math.max(1, this.#b - t.width - $p),
									a = Math.max(1, this.#x - t.height - Qp - $p);
								((o.x = $p + ((r * n) % i)),
									(o.y = Qp + $p + ((r * n) % a)),
									this.#s.push(e),
									this.#Te(e),
									this.#V(o));
							}
						}
						let s = (t.flags >> 8) & 255 || 1,
							c = (t.flags >> 16) & 255 || 1;
						((o.role = t.role),
							(o.bs = s),
							(o.cs = c),
							(o.width = Math.round((t.width * c) / s)),
							(o.height = Math.round((t.height * c) / s)),
							(o.title = t.title),
							(o.parent = t.parent),
							(o.relX = t.relX * c),
							(o.relY = t.relY * c),
							(o.hotX = t.relX),
							(o.hotY = t.relY),
							(o.info = t),
							(o.configurePending = !!(t.flags & 4)));
						let l = (t.flags >> 3) & 15;
						o.requestSeq === void 0
							? (o.requestSeq = l)
							: l !== o.requestSeq &&
								t.role === 1 &&
								!t.placed &&
								((o.requestSeq = l), this.#F(e, o, (t.flags >>> 24) & 127));
						let u = !!(t.flags & 1) && t.role === 1 && !t.placed;
						u !== !!o.fullscreen && this.#R(e, o, u);
						let d = !!o.wantsLock;
						((o.wantsLock = (t.flags & qi) !== 0),
							!o.wantsLock && this.#g === e && Z({ kind: `lock-release` }),
							o.wantsLock &&
								!d &&
								this.#h === e &&
								!this.#g &&
								((this.#m = e), Z({ kind: `lock-wanted`, late: !0 })),
							(o.placed = t.placed),
							(o.unmanaged = t.unmanaged),
							(o.layer = t.layer),
							(o.stackId = t.stackId),
							t.placed &&
								((o.x = o.relX),
								(o.y = o.relY),
								(o.originX !== t.relX || o.originY !== t.relY) &&
									((o.originX = t.relX),
									(o.originY = t.relY),
									U(
										this.#r,
										o.block,
										10,
										t.relX,
										t.relY,
										0,
										0,
										o.client,
										o.surface,
									)),
								this.#s.includes(e) || this.#s.push(e),
								o.restack !== t.restack &&
									((o.restack = t.restack), t.restack && i.push([e, t.below])),
								o.activate !== t.activate &&
									((o.activate = t.activate), t.activate && a.push(e))));
					}
					for (let [e, t] of i) this.#U(e, t);
					for (let e of a) this.#Te(e);
					for (let e of [...this.#o.keys()]) {
						if (n.has(e)) continue;
						let t = this.#a.get(e);
						(t && (t.tex.destroy(), this.#a.delete(e)), this.#H(`- ${e}`));
						let r = this.#o.get(e);
						if (
							r?.role === 1 &&
							!r.placed &&
							(this.#k.set(e, { x: r.x, y: r.y }), this.#k.size > 128)
						) {
							for (let e of this.#k.keys())
								if ((this.#k.delete(e), this.#k.size <= 64)) break;
						}
						if (
							(this.#o.delete(e),
							(this.#s = this.#s.filter((t) => t !== e)),
							this.#g === e && Z({ kind: `lock-release` }),
							this.#d === e)
						) {
							this.#d = null;
							let e =
								[...this.#s].reverse().find((e) => !this.#o.get(e)?.placed) ??
								null;
							e && this.#Te(e);
						}
						(this.#p.over === e && (this.#p.over = null),
							this.#f === e && (this.#f = null));
					}
					return { byKey: r, blocks: t };
				}
				#V(e) {
					U(this.#r, e.block, 10, e.x, e.y, 0, 0, e.client, e.surface);
				}
				note(e) {
					this.#H(e);
				}
				#H(e) {
					(this.#O.push(`${this.#S} ${e}`),
						this.#O.length > 64 && this.#O.splice(0, 32));
				}
				#U(e, t) {
					let n = this.#s.filter((t) => t !== e),
						r = n.length;
					if (t === 4294967295) r = 0;
					else if (t) {
						let e = n.findIndex((e) => {
							let n = this.#o.get(e);
							return n?.placed && n.stackId === t;
						});
						e >= 0 && (r = e);
					}
					(n.splice(r, 0, e), (this.#s = n));
				}
				#W() {
					let e = (e) => {
						let t = this.#o.get(e);
						return t?.placed ? t.layer : 0;
					};
					return [...this.#s].sort((t, n) => e(t) - e(n));
				}
				#G(e) {
					return e.role === 1 && !(e.placed && e.unmanaged) && !e.fullscreen;
				}
				#K(e) {
					if (e.placed || e.role === 1) return { x: e.x, y: e.y };
					let t = `${e.token}:${e.client}:${e.parent}`,
						n = e.parent ? this.#o.get(t) : null;
					if (!n) return { x: e.relX, y: e.relY };
					let r = this.#K(n);
					return { x: r.x + e.relX, y: r.y + e.relY };
				}
				#q(e, t, n) {
					let r = this.#a.get(e);
					return (
						r && (r.w !== t || r.h !== n) && (r.tex.destroy(), (r = null)),
						r ||
							((r = {
								tex: zp(this.#e, t, n),
								w: t,
								h: n,
								serial: 0,
								version: 0,
								last: null,
							}),
							this.#a.set(e, r)),
						r
					);
				}
				#J(e, t) {
					if (!t.addr) return !0;
					let n = this.#j(t);
					if (!n) return !1;
					let r = this.#q(e, t.width, t.height),
						i =
							t.damage.w <= 0 ||
							t.damage.h <= 0 ||
							r.serial === 0 ||
							t.serial !== r.serial + 1,
						a = 0,
						o = 0,
						s = t.width,
						c = t.height;
					if (
						(i ||
							((a = Math.max(0, Math.min(t.damage.x, t.width))),
							(o = Math.max(0, Math.min(t.damage.y, t.height))),
							(s = Math.max(0, Math.min(t.damage.w, t.width - a))),
							(c = Math.max(0, Math.min(t.damage.h, t.height - o)))),
						s <= 0 || c <= 0)
					)
						return ((r.serial = t.serial), !0);
					let l = t.addr + o * t.stride + a * 4,
						u = (c - 1) * t.stride + s * 4;
					if (l + u > n.length)
						return (this.#H(`! ${e} buffer at ${l}+${u} past ${n.length}`), !1);
					let d = s * 4,
						f = d * c,
						p = u > 2 * f,
						m = f <= _m,
						h,
						g = t.stride;
					if (p || m || this.#T === !1) {
						if (p || m) {
							this.#E.length < f && (this.#E = new Uint8Array(f));
							for (let e = 0; e < c; e++) {
								let r = l + e * t.stride;
								this.#E.set(n.subarray(r, r + d), e * d);
							}
							((h = this.#E.subarray(0, f)), (g = d));
						} else
							(this.#E.length < u && (this.#E = new Uint8Array(u)),
								this.#E.set(n.subarray(l, l + u)),
								(h = this.#E.subarray(0, u)));
					} else h = n.subarray(l, l + u);
					if (m) {
						let e = r.last;
						if (
							e &&
							e.x === a &&
							e.y === o &&
							e.w === s &&
							e.h === c &&
							Vp(e.px, h)
						)
							return (this.#D.same++, (r.serial = t.serial), !0);
						(e && e.px.length === f
							? e.px.set(h)
							: (r.last = { x: a, y: o, w: s, h: c, px: h.slice() }),
							Object.assign(r.last, { x: a, y: o, w: s, h: c }));
					} else r.last = null;
					try {
						(this.#e.queue.writeTexture(
							{ texture: r.tex, origin: { x: a, y: o } },
							h,
							{ offset: 0, bytesPerRow: g, rowsPerImage: c },
							{ width: s, height: c },
						),
							this.#T === null && (this.#T = !0));
					} catch (n) {
						if (this.#T === null)
							return ((this.#T = !1), (r.last = null), this.#J(e, t));
						throw n;
					}
					return (
						this.#D.n++,
						(this.#D.bytes += h.length),
						i && (this.#D.full++, (this.#D.fullBytes += h.length)),
						r.version++,
						(r.serial = t.serial),
						!0
					);
				}
				#Y(e) {
					let t = this.#K(e);
					return {
						x: t.x,
						y: t.y,
						w: e.width,
						h: e.height,
						frameX: t.x - $p,
						frameY: t.y - Qp,
						frameW: e.width + 2 * $p,
						frameH: e.height + Qp + $p,
					};
				}
				#X(e) {
					let t = this.#Y(e);
					return {
						x: t.frameX + t.frameW - um - dm,
						y: t.frameY + Math.floor((Qp - um) / 2),
						w: um,
						h: um,
					};
				}
				#Z(e, t) {
					let n = this.#t,
						r = this.#Y(e);
					(n.solid(
						r.frameX + Math.round(3 * X),
						r.frameY + Math.round(4 * X),
						r.frameW,
						r.frameH,
						fm.shadow,
					),
						n.solid(r.frameX, r.frameY, r.frameW, r.frameH, fm.border),
						n.solid(
							r.frameX,
							r.frameY,
							r.frameW,
							Qp,
							t ? fm.titleActive : fm.titleIdle,
						));
					let i = e.title || `window`,
						a = this.#n.get(i),
						o = r.frameW - um - 2 * dm - Math.round(10 * X),
						s = Math.min(a.w, Math.max(0, o));
					s > 4 &&
						n.textured(
							r.frameX + Math.round(8 * X),
							r.frameY + Math.floor((Qp - a.h) / 2),
							s,
							a.h,
							a.tex,
							{ uv: [0, 0, s / a.w, 1] },
						);
					let c = this.#X(e);
					n.solid(c.x, c.y, c.w, c.h, t ? fm.close : fm.closeIdle);
					let l = this.#n.get(`✕`),
						u = Math.min(c.w, c.h) - Math.round(6 * X);
					n.textured(
						c.x + Math.floor((c.w - u) / 2),
						c.y + Math.floor((c.h - u) / 2),
						u,
						u,
						l.tex,
					);
				}
				#Q(e, t) {
					let n = this.#Y(t),
						r = this.#$(t),
						i = this.#a.get(e),
						a = r && t.info?.glRect;
					if (r) {
						(this.#u++,
							a
								? (i &&
										this.#t.textured(n.x, n.y, t.width, t.height, i.tex, {
											swizzle: 1,
											opaque: +(t.info?.format === 1),
										}),
									this.#t.textured(n.x + a.x, n.y + a.y, a.w, a.h, r.tex, {
										opaque: 1,
									}))
								: this.#t.textured(n.x, n.y, t.width, t.height, r.tex, {
										opaque: 1,
									}));
						return;
					}
					i &&
						this.#t.textured(n.x, n.y, t.width, t.height, i.tex, {
							swizzle: 1,
							opaque: +(t.info?.format === 1),
						});
				}
				#$(e) {
					Gp();
					let t = Jp(),
						n = performance.now(),
						r = Kp(),
						i =
							n - this.#l > 2e3
								? `${r.length} surface(s) ` +
									r
										.map((e) => `${e.kind}:${e.id}@${e.token}/${e.frame}`)
										.join(` `) +
									` f${t?.serial ?? 0}`
								: this.#c;
					if ((i !== this.#c && (this.#l = n), i !== this.#c)) {
						this.#c = i;
						let t = Jp();
						this.#H(
							`gl attachment ${i}, frame ${t ? `${t.w}x${t.h} #${t.serial}` : `none`}, window ${e.token}:${e.surface} xid ${e.info?.xid ?? 0}, drawn ${this.#u}, device ${$?.glState?.() ?? `?`}`,
						);
					}
					let a = qp(e);
					return a?.tex ? a : null;
				}
				#ee(e) {
					if (!this.#o.get(e)) return [];
					let t = [];
					for (let [n, r] of this.#o)
						n !== e &&
							(r.role === 2 || r.role === 3) &&
							`${r.token}:${r.client}:${r.parent}` === e &&
							t.push(n);
					return t;
				}
				#te = null;
				#ne = 0;
				#re = ji();
				#ie = 1;
				#ae = 0;
				#oe = -1;
				touch() {
					this.#ie++;
				}
				#se() {
					return this.#ie !== this.#ae ||
						($?.presentedCount?.() ?? 0) !== this.#oe
						? !1
						: Pi(this.#r, this.#re);
				}
				#ce(e) {
					(Ni(this.#re, e),
						(this.#ae = this.#ie),
						(this.#oe = $?.presentedCount?.() ?? 0));
				}
				#le() {
					let e = [this.#b, this.#x, this.#d, this.#s.join(`,`)];
					for (let [t, n] of this.#o) {
						let r = n.role === 1 ? this.#Y(n) : null;
						e.push(
							t,
							n.role,
							n.width,
							n.height,
							n.relX,
							n.relY,
							n.title,
							n.parent,
							n.placed ? `p${n.layer}${n.unmanaged ? `u` : ``}` : ``,
							r ? `${r.x},${r.y},${r.frameW}` : ``,
							this.#a.get(t)?.version ?? `-`,
							JSON.stringify(n.info?.glRect ?? null),
							qp(n)?.serial ?? ``,
						);
					}
					return e.join(`|`);
				}
				#ue = !1;
				#de = null;
				#fe = -1;
				setDirect(e) {
					this.#ue = !!e;
				}
				#pe() {
					if (!this.#ue) return null;
					let e = null;
					for (let [t, n] of this.#o)
						if (n.role !== 4) {
							if (n.role !== 1 || e) return null;
							e = [t, n];
						}
					if (!e) return null;
					let [t, n] = e,
						r = this.#$(n);
					if (!r) return null;
					let i = this.#Y(n),
						a = n.info?.glRect;
					return {
						k: t,
						win: n,
						gl: r,
						w: r.w,
						h: r.h,
						ox: i.x + (a ? a.x : 0),
						oy: i.y + (a ? a.y : 0),
					};
				}
				#me(e, t, n) {
					((!this.#de || this.#de.w !== e.w || this.#de.h !== e.h) &&
						((this.#A.width = e.w),
						(this.#A.height = e.h),
						(this.#fe = -1),
						Z({ kind: `direct`, w: e.w, h: e.h }),
						this.#H(`direct present ${e.w}x${e.h} (${e.k})`)),
						(this.#de = { k: e.k, w: e.w, h: e.h, ox: e.ox, oy: e.oy }));
					for (let e of n) Fi(this.#r, e.block, e.gen);
					if ((this.#ce(n), e.gl.serial === this.#fe)) {
						this.#ne++;
						return;
					}
					((this.#fe = e.gl.serial),
						this.#t.directFrame(e.gl.tex, e.w, e.h),
						this.#S++,
						this.#w &&
							(Atomics.store(this.#w, 0, this.#S),
							Atomics.store(this.#w, 1, this.#o.size)));
				}
				#he() {
					((this.#de = null),
						(this.#A.width = this.#b),
						(this.#A.height = this.#x),
						(this.#te = null),
						Z({ kind: `direct`, w: 0, h: 0 }),
						this.#H(`direct present off: compositing`));
				}
				#ge = ``;
				#_e = new Map();
				#ve = null;
				#ye = null;
				#be(e) {
					let t = `default`,
						n = this.#v ? am[this.#v.edges] : null;
					if (n || this.#ve) {
						((t = n ?? this.#ve),
							t !== this.#ge &&
								((this.#ge = t), Z({ kind: `cursor`, css: t })));
						return;
					}
					let r = this.#de ? this.#de.k : this.#_ ? null : this.#p.over,
						i = r ? this.#o.get(r) : null;
					if (i) {
						let n = null;
						for (let [e, t] of this.#o)
							if (
								t.role === 4 &&
								t.token === i.token &&
								t.client === i.client
							) {
								n = [e, t];
								break;
							}
						if (!n) t = `none`;
						else {
							let r = this.#xe(e.get(n[0]), n[1]);
							if (r === null) return;
							t = r;
						}
					}
					t !== this.#ge && ((this.#ge = t), Z({ kind: `cursor`, css: t }));
				}
				#xe(e, t) {
					if (
						!e ||
						!e.addr ||
						e.width <= 0 ||
						e.height <= 0 ||
						e.width > 256 ||
						e.height > 256
					)
						return `none`;
					if (
						t.cursorSerial === e.serial &&
						t.cursorAddr === e.addr &&
						t.cursorCss
					)
						return t.cursorCss;
					let n = this.#j(e);
					if (!n || e.addr + (e.height - 1) * e.stride + e.width * 4 > n.length)
						return `none`;
					let r = new Uint8ClampedArray(e.width * e.height * 4),
						i = e.format === 1,
						a =
							2166136261 ^
							e.width ^
							(e.height << 12) ^
							(t.hotX << 20) ^
							(t.hotY << 26) ^
							(t.bs << 8);
					for (let t = 0; t < e.height; t++)
						for (let o = 0; o < e.width; o++) {
							let s = e.addr + t * e.stride + o * 4,
								c = (t * e.width + o) * 4;
							((r[c] = n[s + 2]),
								(r[c + 1] = n[s + 1]),
								(r[c + 2] = n[s]),
								(r[c + 3] = i ? 255 : n[s + 3]),
								(a = Math.imul(
									a ^
										(r[c] |
											(r[c + 1] << 8) |
											(r[c + 2] << 16) |
											(r[c + 3] << 24)),
									16777619,
								)));
						}
					let o = `${a >>> 0}`,
						s = this.#_e.get(o);
					if (typeof s == `string`)
						return (
							(t.cursorSerial = e.serial),
							(t.cursorAddr = e.addr),
							(t.cursorCss = s),
							s
						);
					if (!s) {
						let n = new OffscreenCanvas(e.width, e.height);
						n.getContext(`2d`).putImageData(
							new ImageData(r, e.width, e.height),
							0,
							0,
						);
						let i = Math.max(0, t.hotX | 0),
							a = Math.max(0, t.hotY | 0),
							s = t.bs || 1;
						this.#_e.set(
							o,
							n
								.convertToBlob()
								.then((e) => {
									let t = URL.createObjectURL(e),
										n =
											s > 1
												? `-webkit-image-set(url(${t}) ${s}x)`
												: `url(${t})`;
									if (
										(this.#_e.set(o, `${n} ${i} ${a}, default`),
										this.#_e.size > 64)
									) {
										for (let [e, t] of this.#_e)
											if (
												e !== o &&
												(typeof t == `string` &&
													URL.revokeObjectURL(
														t.slice(t.indexOf(`url(`) + 4, t.indexOf(`)`)),
													),
												this.#_e.delete(e),
												this.#_e.size <= 32)
											)
												break;
									}
								})
								.catch(() => this.#_e.delete(o)),
						);
					}
					return null;
				}
				frame() {
					if (this.#se()) {
						this.#ne++;
						return;
					}
					let { byKey: e, blocks: t } = this.#B();
					this.#be(e);
					let n = this.#pe();
					if (n) {
						this.#me(n, e, t);
						return;
					}
					this.#de && this.#he();
					let r = !1;
					for (let [t, n] of e) {
						if (n.role === 4) continue;
						let e = this.#a.get(t);
						(e && e.serial === n.serial) || this.#J(t, n) || (r = !0);
					}
					let i = this.#le();
					if (i !== null && i === this.#te) {
						for (let e of t) Fi(this.#r, e.block, e.gen);
						(r || this.#ce(t), this.#ne++);
						return;
					}
					if (
						((this.#te = i),
						console.timeStamp(`gex:draw`),
						this.#t.begin(this.#b, this.#x) === !1)
					) {
						this.#te = null;
						return;
					}
					for (let e of this.#W()) {
						let t = this.#o.get(e);
						if (!(!t || (t.role !== 1 && !t.placed))) {
							(this.#G(t) && this.#Z(t, this.#d === e), this.#Q(e, t));
							for (let t of this.#ee(e)) {
								let e = this.#o.get(t);
								e && this.#Q(t, e);
							}
						}
					}
					(this.#t.end(), console.timeStamp(`gex:drawn`));
					for (let e of t) Fi(this.#r, e.block, e.gen);
					(r || this.#ce(t),
						this.#S++,
						this.#w &&
							(Atomics.store(this.#w, 0, this.#S),
							Atomics.store(this.#w, 1, this.#o.size)));
				}
				#Se(e, t, n) {
					let r = e.info?.input;
					if (!r) return !0;
					let i = e.cs || 1,
						a = Math.floor(t / i),
						o = Math.floor(n / i);
					return a >= r.x && a < r.x + r.w && o >= r.y && o < r.y + r.h;
				}
				#Ce(e, t) {
					let n = this.#W();
					for (let r = n.length - 1; r >= 0; r--) {
						let i = n[r],
							a = this.#o.get(i);
						if (!a) continue;
						for (let n of this.#ee(i)) {
							let r = this.#o.get(n);
							if (!r) continue;
							let i = this.#K(r);
							if (
								e >= i.x &&
								e < i.x + r.width &&
								t >= i.y &&
								t < i.y + r.height &&
								this.#Se(r, e - i.x, t - i.y)
							)
								return {
									key: n,
									win: r,
									local: { x: e - i.x, y: t - i.y },
									part: `content`,
								};
						}
						let o = this.#Y(a);
						if (
							e >= o.x &&
							e < o.x + a.width &&
							t >= o.y &&
							t < o.y + a.height &&
							this.#Se(a, e - o.x, t - o.y)
						)
							return {
								key: i,
								win: a,
								local: { x: e - o.x, y: t - o.y },
								part: `content`,
							};
						if (
							this.#G(a) &&
							!a.maximized &&
							e >= o.frameX - em &&
							e < o.frameX + o.frameW + em &&
							t >= o.frameY - em &&
							t < o.frameY + o.frameH + em
						) {
							let n =
								(t < o.frameY + em / 2 ? tm : 0) |
								(t >= o.frameY + o.frameH - em ? nm : 0) |
								(e < o.frameX + em ? rm : 0) |
								(e >= o.frameX + o.frameW - em ? im : 0);
							if (n)
								return {
									key: i,
									win: a,
									local: { x: 0, y: 0 },
									part: `resize`,
									edges: n,
								};
						}
						if (
							this.#G(a) &&
							e >= o.frameX &&
							e < o.frameX + o.frameW &&
							t >= o.frameY &&
							t < o.frameY + o.frameH
						) {
							let n = this.#X(a);
							return {
								key: i,
								win: a,
								local: { x: 0, y: 0 },
								part:
									e >= n.x && e < n.x + n.w && t >= n.y && t < n.y + n.h
										? `close`
										: `title`,
							};
						}
					}
					return null;
				}
				#we(e, t, n = 0) {
					if (e.placed) return;
					let r = this.#P(e),
						i =
							(t ? om : 0) |
							(e.maximized ? sm : 0) |
							(e.fullscreen ? lm : 0) |
							n,
						a = `${r.w}x${r.h}:${i}`;
					if (e.configuredAs === a) return;
					((e.configuredAs = a), this.#H(`configure ${e.key} ${a}`));
					let o = e.cs || 1;
					U(
						this.#r,
						e.block,
						7,
						Math.floor(r.w / o),
						Math.floor(r.h / o),
						i,
						+!!t,
						e.client,
						e.surface,
					);
				}
				#Te(e) {
					if (this.#d === e) return;
					this.#H(`focus ${e}`);
					let t = this.#d ? this.#o.get(this.#d) : null;
					((this.#d = e),
						t &&
							(U(this.#r, t.block, 6, 0, 0, 0, 0, t.client, 0),
							this.#we(t, !1)));
					let n = e ? this.#o.get(e) : null;
					n &&
						(U(this.#r, n.block, 6, 0, 0, 0, 0, n.client, n.surface),
						this.#we(n, !0));
				}
				#Ee(e) {
					((this.#s = this.#s.filter((t) => t !== e)), this.#s.push(e));
				}
				#De(e) {
					let t = e ? this.#o.get(e) : null;
					t && U(this.#r, t.block, 5, 0, 0, 0, 0, t.client, 0);
				}
				pointerMove(e, t, n) {
					if (
						(this.#de &&
							((e = this.#de.ox + Math.max(0, Math.min(this.#de.w - 1, e))),
							(t = this.#de.oy + Math.max(0, Math.min(this.#de.h - 1, t)))),
						(this.#p.x = e),
						(this.#p.y = t),
						this.#v)
					) {
						this.#L(e, t, !1);
						return;
					}
					let r = this.#f ? this.#o.get(this.#f) : null;
					if (r) {
						let i = this.#K(r),
							a = r.cs || 1;
						U(
							this.#r,
							r.block,
							0,
							Math.floor((e - i.x) / a),
							Math.floor((t - i.y) / a),
							n,
							0,
							r.client,
							r.surface,
						);
						return;
					}
					if (this.#_) {
						let n = this.#o.get(this.#_.key);
						n &&
							((n.x = Math.round(e - this.#_.dx)),
							(n.y = Math.round(t - this.#_.dy)),
							this.#V(n));
						return;
					}
					let i = this.#Ce(e, t);
					((this.#ye = {
						x: e,
						y: t,
						key: i?.key ?? null,
						part: i?.part ?? null,
						edges: i?.edges ?? 0,
					}),
						(this.#ve =
							i?.part === `resize` ? (am[i.edges] ?? `default`) : null));
					let a = i && i.part === `content` ? i.key : null;
					if (this.#p.over && this.#p.over !== a) {
						let e = this.#o.get(this.#p.over),
							t = a ? this.#o.get(a) : null;
						e &&
							(!t || t.token !== e.token || t.client !== e.client) &&
							this.#De(this.#p.over);
					}
					if (((this.#p.over = a), !i || i.part !== `content`)) return;
					let o = i.win.cs || 1;
					U(
						this.#r,
						i.win.block,
						0,
						Math.floor(i.local.x / o),
						Math.floor(i.local.y / o),
						n,
						0,
						i.win.client,
						i.win.surface,
					);
				}
				pointerButton(e, t, n) {
					let r = this.#g ? this.#o.get(this.#g) : null;
					if (r) {
						U(this.#r, r.block, 1, e, +!!t, n, 0, r.client, r.surface);
						return;
					}
					if (t) {
						let e = this.#Ce(this.#p.x, this.#p.y);
						((this.#h = e?.part === `content` ? e.key : null),
							e?.part === `content` &&
								e.win.wantsLock &&
								((this.#m = e.key), Z({ kind: `lock-wanted` })));
					}
					if (
						((this.#p.buttons = t ? this.#p.buttons | 1 : this.#p.buttons & -2),
						!t && this.#v)
					) {
						(this.#L(this.#p.x, this.#p.y, !0), (this.#v = null));
						return;
					}
					if (!t && this.#_) {
						this.#_ = null;
						return;
					}
					let i = this.#f ? this.#o.get(this.#f) : null;
					if (i) {
						(U(this.#r, i.block, 1, e, +!!t, n, 0, i.client, i.surface),
							this.#p.buttons || (this.#f = null));
						return;
					}
					let a = this.#Ce(this.#p.x, this.#p.y);
					if (t)
						for (let [e, t] of this.#o)
							t.role === 2 &&
								((a && a.key === e) ||
									U(this.#r, t.block, 9, 0, 0, 0, 0, t.client, t.surface));
					if (a) {
						if (a.part === `close`) {
							t &&
								U(
									this.#r,
									a.win.block,
									8,
									0,
									0,
									0,
									0,
									a.win.client,
									a.win.surface,
								);
							return;
						}
						if (a.part === `resize`) {
							t &&
								(this.#Ee(a.key),
								this.#Te(a.key),
								this.#I(a.key, a.win, a.edges));
							return;
						}
						if (a.part === `title`) {
							if (t && !a.win.placed) {
								(this.#Ee(a.key), this.#Te(a.key));
								let e = performance.now(),
									t = this.#y && this.#y.key === a.key && e - this.#y.at < 400;
								if (((this.#y = t ? null : { key: a.key, at: e }), t)) {
									this.#z(a.key, !a.win.maximized);
									return;
								}
								if (a.win.maximized) return;
								this.#_ = {
									key: a.key,
									dx: this.#p.x - a.win.x,
									dy: this.#p.y - a.win.y,
								};
							}
							return;
						}
						if (t) {
							let e =
								a.win.role === 1 || a.win.placed
									? a.key
									: `${a.win.token}:${a.win.client}:${a.win.parent}`;
							(this.#o.has(e) &&
								!this.#o.get(e).placed &&
								(this.#Ee(e), this.#Te(e)),
								this.#o.get(e)?.placed && (this.#f = a.key));
							let t = a.win.cs || 1;
							U(
								this.#r,
								a.win.block,
								0,
								Math.floor(a.local.x / t),
								Math.floor(a.local.y / t),
								n,
								0,
								a.win.client,
								a.win.surface,
							);
						}
						U(
							this.#r,
							a.win.block,
							1,
							e,
							+!!t,
							n,
							0,
							a.win.client,
							a.win.surface,
						);
					}
				}
				pointerAxis(e, t, n) {
					let r = this.#Ce(this.#p.x, this.#p.y);
					!r ||
						r.part !== `content` ||
						U(this.#r, r.win.block, 2, e, t, n, 0, r.win.client, r.win.surface);
				}
				key(e, t, n, r) {
					if (!this.#d && t) {
						let e = (e) =>
								e?.role === 1 &&
								(e.info?.serial ?? 0) > 0 &&
								e.width > 0 &&
								e.height > 0 &&
								e.x < this.#b &&
								e.y < this.#x &&
								e.x + e.width > 0 &&
								e.y + e.height > 0,
							t = [...this.#s].reverse().find((t) => e(this.#o.get(t)));
						t &&
							(this.#H(
								`no window has the keyboard; it goes to the top one, ${t}`,
							),
							this.#Te(t));
					}
					let i = this.#d ? this.#o.get(this.#d) : null;
					i &&
						(U(this.#r, i.block, 4, n, 0, 0, 0, i.client, 0),
						U(this.#r, i.block, 3, e, +!!t, r, 0, i.client, i.surface));
				}
				async #Oe() {
					return (
						this.#t.sceneFor() || ((this.#te = null), await this.#t.drawn(1e3)),
						this.#t.read()
					);
				}
				async readout() {
					try {
						return await this.#Oe();
					} catch (e) {
						return (
							this.#H(`readout failed: ${e?.message ?? e}`),
							console.error(`[compositor] readout failed:`, e),
							null
						);
					}
				}
				windowAt(e, t) {
					let n = this.#Ce(e, t);
					if (!n || n.part !== `content`) return null;
					let r = n.win;
					for (let e = 0; r.parent && e < 16; e++) {
						let e = this.#o.get(`${r.token}:${r.client}:${r.parent}`);
						if (!e) break;
						r = e;
					}
					let i = n.win.cs || 1;
					return {
						key: n.key,
						client: n.win.client,
						block: n.win.block,
						surface: n.win.surface,
						title: r.title || ``,
						x: Math.floor(n.local.x / i),
						y: Math.floor(n.local.y / i),
					};
				}
				async describe({ pixels: e = !0 } = {}) {
					let t = [...this.#o.values()].filter((e) => e.role === 1),
						n = e ? 0 : null,
						r = e ? 0 : null,
						i = e ? 2166136261 : null;
					if (e)
						try {
							let e = (await this.#Oe())?.px ?? new Uint8Array(),
								t = Math.round(fm.desktop[2] * 255) + 12;
							for (let a = 0; a < e.length; a += 16) {
								let o = Math.max(e[a], e[a + 1], e[a + 2]);
								(o > t && n++,
									o > r && (r = o),
									(i = ((i ^ o) * 16777619) >>> 0));
							}
						} catch {}
					return {
						frames: this.#S,
						uploads: { ...this.#D },
						windows: t.length,
						surfaces: this.#o.size,
						list: [...this.#o.values()].map(
							(e) =>
								`${e.key} role=${e.role} ${e.width}x${e.height}@${e.x},${e.y} serial=${e.info?.serial ?? 0} scale=${e.bs ?? 1}/${e.cs ?? 1}${e.placed ? ` placed` : ``}${e.unmanaged ? ` unmanaged` : ``}${e.maximized ? ` maximized` : ``}` +
								(e.info?.input
									? ` input=${e.info.input.w}x${e.info.input.h}@${e.info.input.x},${e.info.input.y}`
									: ``) +
								(e.parent
									? ` parent=${e.parent} rel=${e.relX},${e.relY}`
									: ``) +
								` "${e.title}"`,
						),
						log: this.#O.slice(-24),
						staging: this.#T === !1,
						titles: t.map((e) => e.title || `(untitled)`),
						focus: this.#d,
						lit: n,
						brightest: r,
						hash: i,
						output: `${this.#b}x${this.#x}`,
						direct: this.#de ? `${this.#de.w}x${this.#de.h}` : null,
						gl: $?.glState?.() ?? null,
						glWindows: $
							? $.surfaces().map((e) => `${e.kind}:${e.id}@${e.token}`)
							: [],
						gpu: pd(),
						pointer: this.#ye,
						turns: wm,
					};
				}
			}),
			(Z = (e, t) => self.postMessage(e, t ?? [])),
			(Q = null),
			(Sm = null),
			(Cm = !1),
			(wm = 0),
			(Tm = !1),
			($ = null),
			(Em = null),
			(Dm = !1),
			(Om = null),
			(km = null),
			(Am = []),
			(jm = -1),
			(Mm = 0),
			(Nm = {
				resolve: null,
				ready: null,
				tail: Promise.resolve(),
				submit(e, t, n) {
					let r = Nm.tail.then(async () => {
						if ((await Nm.ready, !$?.ok)) return -1;
						try {
							return await $.submit(e, t, n);
						} catch (e) {
							return (console.error(`[gl] the device threw`, e), -1);
						}
					});
					return (
						(Nm.tail = r.then(
							() => {},
							() => {},
						)),
						r
					);
				},
			}),
			(Nm.ready = new Promise((e) => (Nm.resolve = e))),
			globalThis.GEX_COMPOSITOR_IN_REALM && (globalThis.__gexGlInRealm = Nm),
			(Pm = ({ data: e }) => {
				Q?.touch();
				try {
					if (e.kind === `init`)
						((gm = e.present ?? null),
							(Sm = e.canvas),
							Rp(e.scale || 1),
							e.glLimits != null && (globalThis.GEX_GL_LIMITS = e.glLimits),
							md()
								.then((t) => {
									((Q = new xm(
										Sm,
										e.channel,
										e.stats ? new Int32Array(e.stats) : null,
										t,
									)),
										Q.setDirect(e.direct),
										(Cm = !0),
										requestAnimationFrame(Up),
										e.drawOnPublish !== !1 &&
											!globalThis.GEX_NO_PUBDRAW &&
											Wp(e.channel),
										Z({ kind: `ready` }));
								})
								.catch((e) =>
									Z({ kind: `error`, error: e?.stack || String(e) }),
								));
					else if (e.kind === `gl`)
						Yp(e, Sm).catch((e) =>
							Z({ kind: `gl-failed`, error: e?.message || String(e) }),
						);
					else if (e.kind === `memory`)
						Q?.addMemory(e.token, e.memory, e.kernel);
					else if (e.kind === `pixels`)
						Q?.addPixels(e.token, e.id, e.buffer, e.replaces);
					else if (e.kind === `drop-memory`) {
						if ((Q?.dropMemory(e.token), $)) {
							let t = performance.now();
							(Q?.note?.(`forget client ${e.token}`),
								$.forgetClient(e.token),
								Q?.note?.(
									`forgot client ${e.token} in ${(performance.now() - t).toFixed(1)} ms`,
								));
						}
						jm = -1;
					} else if (e.kind === `resize`) Q?.resize(e.width, e.height);
					else if (e.kind === `pointer-move`) Q?.pointerMove(e.x, e.y, e.time);
					else if (e.kind === `pointer-lock`) Q?.pointerLock(e.on, e.time);
					else if (e.kind === `pointer-relative`)
						Q?.pointerRelative(e.dx, e.dy, e.time);
					else if (e.kind === `pointer-button`)
						Q?.pointerButton(e.button, e.pressed, e.time);
					else if (e.kind === `pointer-axis`)
						Q?.pointerAxis(e.axis, e.value, e.time);
					else if (e.kind === `key`) Q?.key(e.code, e.pressed, e.mods, e.time);
					else if (e.kind === `wgsl-cache`) {
						let t = $?.wgslCache?.() ?? null;
						Z(
							{
								kind: `wgsl-cache`,
								id: e.id,
								blob: t,
								stats: $?.wgslStats?.() ?? null,
							},
							t ? [t] : [],
						);
					} else
						e.kind === `readout`
							? Promise.resolve(Q?.readout?.() ?? null).then((t) =>
									Z(
										{ kind: `readout`, id: e.id, state: t },
										t ? [t.px.buffer] : [],
									),
								)
							: e.kind === `window-at`
								? Z({
										kind: `window-at`,
										id: e.id,
										state: Q?.windowAt(e.x, e.y) ?? null,
									})
								: e.kind === `describe`
									? Promise.resolve(
											Q?.describe({ pixels: e.pixels !== !1 }) ?? null,
										).then((t) => Z({ kind: `describe`, id: e.id, state: t }))
									: e.kind === `stop` && (Cm = !1);
				} catch (e) {
					Z({ kind: `error`, error: e?.stack || String(e) });
				}
			}),
			globalThis.GEX_COMPOSITOR_IN_REALM || (self.onmessage = Pm));
	});
(ae(), le(), v());
const Im = Promise.resolve()
		.then(() => (Us(), Ns))
		.then(() => Promise.resolve().then(() => (Ip(), Af))),
	Lm = new (class {
		rows = 24;
		cols = 80;
		#e = [];
		#t = [];
		write(e) {
			e instanceof Uint8Array
				? self.postMessage({ kind: `write`, data: e }, [e.buffer])
				: self.postMessage({ kind: `write`, data: String(e) });
		}
		writeln(e) {
			self.postMessage({ kind: `write`, data: `${e}\r\n` });
		}
		onData(e) {
			return (
				this.#e.push(e),
				{ dispose: () => this.#e.splice(this.#e.indexOf(e), 1) }
			);
		}
		onResize(e) {
			return (
				this.#t.push(e),
				{ dispose: () => this.#t.splice(this.#t.indexOf(e), 1) }
			);
		}
		focus() {}
		reset() {}
		key(e) {
			for (let t of this.#e) t(e);
		}
		resized(e, t) {
			((this.rows = e), (this.cols = t));
			for (let n of this.#t) n({ rows: e, cols: t });
		}
	})();
let Rm = null;
async function zm(e, t) {
	globalThis.GEX_COMPOSITOR_IN_REALM = !0;
	let [{ inRealm: n }, { makeWlChannel: r, setOutputSize: i }] =
			await Promise.all([
				Promise.resolve().then(() => (Fm(), Lp)),
				Promise.resolve().then(() => (Fa(), _i)),
			]),
		a = r();
	i(a, e, t);
	let o = new Int32Array(4),
		s = n((e, t) => self.postMessage({ kind: `comp-out`, m: e }, t ?? [])),
		c = setInterval(
			() => self.postMessage({ kind: `comp-stats`, stats: o.slice() }),
			500,
		);
	return {
		channel: a,
		stats: o,
		send: s,
		compositor: {
			addMemory: (e, t, n) =>
				s({ kind: `memory`, token: e, memory: t, kernel: n }),
			dropMemory: (e) => s({ kind: `drop-memory`, token: e }),
			stop: () => {
				(clearInterval(c), s({ kind: `stop` }));
			},
		},
	};
}
((self.onmessage = async (e) => {
	let { runProgram: t, primeRuntime: n } = await Im,
		r = e.data;
	if (r.kind === `comp-open`) Rm = zm(r.width, r.height);
	else if (r.kind === `comp`) {
		let e = await Rm;
		r.m.kind === `init`
			? e.send({ ...r.m, channel: e.channel, stats: e.stats.buffer })
			: e.send(r.m);
	} else if (r.kind === `key`) Lm.key(r.data);
	else if (r.kind === `resize`) Lm.resized(r.rows, r.cols);
	else if (r.kind === `run`) {
		(Object.assign(globalThis, r.globals ?? {}),
			n(r.runtime),
			(Lm.rows = r.rows ?? Lm.rows),
			(Lm.cols = r.cols ?? Lm.cols));
		try {
			let e = { ...r.opts };
			if (e.wl?.inRealm) {
				let t = await Rm;
				if (
					((e.wl = {
						inRealm: { channel: t.channel, compositor: t.compositor },
					}),
					e.gl === `compositor`)
				) {
					let e = new URLSearchParams(globalThis.GEX_PAGE_SEARCH ?? ``);
					t.send({
						kind: `gl`,
						channel: null,
						api: `core`,
						url: e.get(`glurl`) || k(`/gex/st/gex-wgpu-replay.js`),
						...(e.get(`mesaenv`) ? { mesaEnv: e.get(`mesaenv`) } : {}),
						...(e.get(`wgslcache`) ? { wgslCache: e.get(`wgslcache`) } : {}),
						...(e.get(`gltrace`) === `1` ? { glTrace: !0 } : {}),
					});
				}
			} else delete e.gl;
			if (e.networkUrl || e.pageHosts) {
				let { WispNetwork: t } = await Promise.resolve().then(() => (Ms(), Cs)),
					n = new t(
						e.networkUrl ?? null,
						(e) => self.postMessage({ kind: `net`, event: e }),
						{ pageHosts: e.pageHosts ?? null },
					);
				try {
					await n.start();
				} catch (e) {
					self.postMessage({ kind: `net`, event: `error ${e?.message ?? e}` });
				}
				e.network = n;
			}
			(delete e.networkUrl,
				delete e.pageHosts,
				(e.onNetEvent = (e) => self.postMessage({ kind: `net`, event: e })));
			let { status: n } = await t(Lm, e);
			self.postMessage({ kind: `done`, status: n });
		} catch (e) {
			self.postMessage({
				kind: `failed`,
				message: e?.message ?? String(e),
				stack: e?.stack ?? ``,
			});
		}
	}
}),
	console.info(
		`[gex] single-thread build: the system runs in this Worker, no SharedArrayBuffer (crossOriginIsolated=` +
			globalThis.crossOriginIsolated +
			`)`,
	),
	self.postMessage({ kind: `ready` }));
