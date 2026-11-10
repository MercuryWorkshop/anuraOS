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
let d,
	f = null,
	p = 0;
function m(e) {
	f = e;
}
function h(e) {
	if (f) return f(e);
	(d === void 0 &&
		((d =
			typeof BroadcastChannel == `function`
				? new BroadcastChannel(`gex-fetch`)
				: null),
		d?.unref?.()),
		d?.postMessage(e));
}
function g(e, t = 0, n = ``) {
	if (!f && typeof BroadcastChannel != `function`) return () => {};
	let r = `${globalThis.name ?? ``}:${p++}:${Math.random().toString(36).slice(2, 8)}`;
	try {
		h({ id: r, what: e, bytes: t, owner: n, phase: `start` });
	} catch {}
	let i = !1;
	return (t = 0) => {
		if (!i) {
			i = !0;
			try {
				h({ id: r, what: e, bytes: t, phase: `end` });
			} catch {}
		}
	};
}
function _(e) {
	if (!(!f && typeof BroadcastChannel != `function`))
		try {
			h({ status: e, t: performance.now() + performance.timeOrigin });
		} catch {}
}
const v = 1056;
let y = null,
	b = null;
function x() {
	return y !== null;
}
function S(e) {
	e?.ctl && ((y = new Int32Array(e.ctl)), (b = new Uint8Array(e.ctl)));
}
function C(e, t, n, r) {
	if (!y) return -1;
	let i = new TextEncoder().encode(e);
	if (i.length > 1024) return -1;
	let a = -1;
	for (let e = 0; e < 32; e++)
		if (Atomics.compareExchange(y, (64 + e * 1056) / 4, 0, 101) === 0) {
			a = e;
			break;
		}
	if (a < 0) return -1;
	let o = (64 + a * v) / 4;
	((y[o + 1] = -1),
		(y[o + 2] = n),
		(y[o + 3] = r),
		(y[o + 4] = i.length),
		(new Float64Array(y.buffer, 64 + a * v + 24, 1)[0] = t),
		b.set(i, 64 + a * v + 32),
		Atomics.store(y, o, 1),
		Atomics.add(y, 0, 1),
		Atomics.notify(y, 0));
	let s = Date.now();
	for (;;) {
		let e = Atomics.load(y, o);
		if (e === 3) break;
		if (e === 1 && Date.now() - s > 6e4) {
			if (Atomics.compareExchange(y, o, 1, 4) === 1) return -1;
			continue;
		}
		Atomics.wait(y, o, e, e === 1 ? 5e3 : 1e3);
	}
	let c = y[o + 1];
	return (Atomics.store(y, o, 0), c);
}
const ee = Object.freeze([250, 1e3, 4e3]);
var te = class {
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
let w = null;
function T(e, t = ee) {
	for (let n = 0; ; n++) {
		let r = null;
		try {
			r = e();
		} catch {
			r = null;
		}
		if (r) return r;
		if (n >= t.length) return null;
		Atomics.wait((w ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, t[n]);
	}
}
var E = s((e, t) => {
		t.exports = {};
	}),
	D = c({ ZSTDDecoder: () => re }),
	O,
	k,
	A,
	j,
	ne,
	re,
	M = o(() => {
		((ne = {
			env: {
				emscripten_notify_memory_growth: (e) => {
					((A = new Uint8Array(k.exports.memory.buffer)),
						(j = new DataView(A.buffer)));
				},
			},
		}),
			(re = class {
				init() {
					if (O) return O;
					let e = new URL("./zstddec-x1VHh1jj.wasm?no-inline", import.meta.url);
					return (
						(O =
							typeof process < `u` && e.protocol === `file:`
								? Promise.resolve()
										.then(() => u(E(), 1))
										.then((t) => t.readFile(e))
										.then((e) => WebAssembly.instantiate(e, ne))
										.then(this._init)
								: fetch(e)
										.then((t) => {
											if (!t.ok) throw Error(`${e}: ${t.status}`);
											return t.arrayBuffer();
										})
										.then((e) => WebAssembly.instantiate(e, ne))
										.then(this._init)),
						O
					);
				}
				dispose() {
					k = A = j = O = void 0;
				}
				_init(e) {
					((k = e.instance), ne.env.emscripten_notify_memory_growth(0));
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
let N = null;
function ie(e) {
	!e?.buf ||
		!e?.at ||
		!e?.files ||
		(N = {
			buf: new Uint8Array(e.buf),
			at: e.at,
			files: new Map(e.files.map(([e, t, n]) => [e, [t, n]])),
		});
}
function P(e) {
	for (;;) {
		let t = Atomics.load(N.at, 0);
		if (t < 0) return !1;
		if (t >= e) return !0;
		if (
			Atomics.wait(N.at, 0, t, 1e4) === `timed-out` &&
			Atomics.load(N.at, 0) === t
		)
			return !1;
	}
}
function ae(e) {
	let t = N?.files.get(e);
	return !t || !P(t[0] + t[1]) ? null : N.buf.slice(t[0], t[0] + t[1]);
}
function oe(e, t, n, r, i) {
	if (!N) return -1;
	let a;
	try {
		a = decodeURIComponent(
			new URL(/* @vite-ignore */ /* webpackIgnore: true */ e, `http://x`)
				.pathname,
		);
	} catch {
		return -1;
	}
	let o = N.files.get(a);
	if (!o || t + i > o[1]) return -1;
	let s = o[0] + t + i;
	return P(s)
		? (new Uint8Array(n.buffer, r, i).set(N.buf.subarray(o[0] + t, s)), i)
		: -1;
}
let se = null;
function ce(e, t, n, r, i) {
	let a = {}.GEX_NODE_LAZY && globalThis.process.getBuiltinModule?.(`node:fs`);
	if (!a) return -1;
	let o = Number({}.GEX_LAZY_DELAY_MS || 0);
	o > 0 &&
		Atomics.wait((se ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, o);
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
let le = null,
	ue = null;
function de() {
	return x() || !globalThis.GEX_REST_BUNDLE
		? Promise.resolve()
		: ((ue ??= Promise.resolve()
				.then(() => (M(), D))
				.then(async ({ ZSTDDecoder: e }) => {
					let t = new e();
					(await t.init(), (le = t));
				})
				.catch((e) => {
					console.error(`[lazy] no zstd decoder: ${e?.message ?? e}`);
				})),
			ue);
}
const fe = new Map(),
	pe = new te(),
	me = new te();
function he(e, t) {
	me.held(e) || (me.failed(e), console.error(t));
}
function ge(e, t) {
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
function _e(e) {
	let t = fe.get(e);
	if (t) return t;
	let n = `${e}.json`;
	if (pe.held(n)) return null;
	let r = T(() => {
		let e = JSON.parse(new TextDecoder().decode(ge(n)));
		return Array.isArray(e.frames) ? e : null;
	});
	if (!r) return (pe.failed(n), console.error(`[lazy] ${n}: no answer`), null);
	let i = { frame: r.frame, frames: r.frames, kept: new Map() };
	return (fe.set(e, i), i);
}
function ve(e, t, n, r, i) {
	let a = ye(e),
		o = a.lastIndexOf(`#`);
	if (o < 0 || typeof XMLHttpRequest != `function`) return -1;
	let s = a.slice(0, o),
		c = Number(a.slice(o + 1)) + t;
	if (!le)
		return (
			x() || he(s, `[lazy] ${s}: the zstd decoder is not loaded (lazyReady)`),
			-1
		);
	let l = _e(s);
	if (!l) return -1;
	let u = Math.floor(c / l.frame),
		d = Math.floor((c + i - 1) / l.frame),
		f = [];
	for (let e = u; e <= d; e++) l.kept.has(e) || f.push(e);
	if (f.length) {
		if (f.some((e) => pe.held(`${s}#${e}`))) return -1;
		let e = l.frames[f[0]][0],
			t = l.frames[f.at(-1)][0] + l.frames[f.at(-1)][1],
			n = T(() => ge(s, [e, t]));
		if (!n) {
			for (let e of f) pe.failed(`${s}#${e}`);
			return -1;
		}
		for (let t of f) {
			let [r, i] = l.frames[t],
				a = t === l.frames.length - 1 ? 0 : l.frame;
			for (
				l.kept.set(t, le.decode(n.subarray(r - e, r - e + i), a));
				l.kept.size > Math.max(3, d - u + 1);
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
const ye = (e) => {
		try {
			return new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.GEX_BASE ?? globalThis.location?.href,
			).href;
		} catch {
			return e;
		}
	},
	be = new Map();
function xe(e, t = !1, n = null) {
	let r =
			typeof SharedArrayBuffer < `u` && e.buffer instanceof SharedArrayBuffer,
		i = t ? n?.m32 : n?.m64;
	i &&
		(typeof SharedArrayBuffer < `u` &&
			i.buffer instanceof SharedArrayBuffer) !== r &&
		(i = null);
	let a = `${t ? 32 : 64}:${r}`;
	return (
		(i ??= be.get(a)),
		i ||
			((i = t
				? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: r })
				: new WebAssembly.Memory({
						address: `i64`,
						initial: 0n,
						maximum: 0n,
						shared: r,
					})),
			be.set(a, i)),
		t ? { process: i, process64: e } : { process: e, process64: i }
	);
}
Object.freeze({ tty: 0, hostx: 1, persist: 2, fsOpened: 3 });
function Se(e, t) {
	let n = t >>> 0,
		r = e.__tls_size ? e.__tls_size.value >>> 0 : 0;
	if (r && typeof e.__wasm_init_tls == `function`) {
		let t = Math.max(16, e.__tls_align ? e.__tls_align.value >>> 0 : 16),
			i = (n - r) & -t;
		(e.__wasm_init_tls(i), (n = i));
	}
	return ((e.__stack_pointer.value = n | 0), n);
}
function Ce(e) {
	return (t, n, r, i, a) => {
		((t >>>= 0), (n >>>= 0), (i >>>= 0), (a >>>= 0));
		let o = Number(r),
			s = new TextDecoder().decode(new Uint8Array(e.buffer, t, n).slice());
		if (N) {
			let t = oe(s, o, e, i, a);
			if (t >= 0) return t;
		}
		let c = g(s, a);
		if (s.includes(`#`)) {
			if (C(ye(s), o, i, a) === a) return (c(a), a);
			let t = ve(s, o, e, i, a);
			return (
				c(t > 0 ? t : 0),
				t < 0 && he(s, `[lazy] ${s}: a read failed (rest bundle)`),
				t
			);
		}
		if (C(ye(s), o, i, a) === a) return (c(a), a);
		if (typeof XMLHttpRequest != `function`) {
			let t = ce(s, o, e, i, a);
			return (c(t > 0 ? t : 0), t);
		}
		let l = `no response`;
		try {
			for (let t = 0; t < 3; t++)
				try {
					let t = new XMLHttpRequest();
					(t.open(`GET`, ye(s), !1),
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
function we(e) {
	let t = [],
		n = (e) => {
			if (!ArrayBuffer.isView(e)) return;
			let n = e.buffer;
			!(n instanceof ArrayBuffer) || t.includes(n) || t.push(n);
		};
	for (let t of e?.image ?? []) n(t?.bytes);
	return (n(e?.vmaBlob), n(e?.fds), n(e?.pages), n(e?.shared), t);
}
const Te = 147472;
let F = null,
	Ee = null;
function De(e) {
	!e?.ctl || F || ((F = new Int32Array(e.ctl)), (Ee = new Uint8Array(e.ctl)));
}
function Oe() {
	for (;;) {
		let e = Atomics.load(F, 1);
		for (let e = 0; e < 8; e++)
			if (Atomics.compareExchange(F, (64 + e * 147472) / 4, 0, 1) === 0)
				return e;
		Atomics.wait(F, 1, e, 1e3);
	}
}
function ke(e) {
	return (t, n, r, i) => {
		if (
			((t >>>= 0),
			(n >>>= 0),
			(r >>>= 0),
			(i >>>= 0),
			!F || globalThis.document || n > 147456)
		)
			return -5;
		let a;
		try {
			a = Oe();
		} catch {
			return -5;
		}
		let o = (64 + a * Te) / 4,
			s = 64 + a * Te + 16;
		for (
			Ee.set(new Uint8Array(e.buffer, t, n), s),
				F[o + 1] = -5,
				F[o + 2] = n,
				F[o + 3] = 0,
				Atomics.store(F, o, 2),
				Atomics.add(F, 0, 1),
				Atomics.notify(F, 0);
			;
		) {
			let e = Atomics.load(F, o);
			if (e === 4) break;
			Atomics.wait(F, o, e, 5e3);
		}
		let c = F[o + 1],
			l = Math.min(F[o + 3] >>> 0, i);
		return (
			l > 0 && new Uint8Array(e.buffer, r, l).set(Ee.subarray(s, s + l)),
			Atomics.store(F, o, 0),
			Atomics.add(F, 1, 1),
			Atomics.notify(F, 1),
			c
		);
	};
}
const Ae = [
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
	[`liftMax`, `GEX_LIFT_MAX`, `liftmax`, `GEX_LIFT_MAX`, `num`, `extra`, !1],
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
function je(e, t) {
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
function Me(e) {
	for (let [t, n, , , r, , i] of Ae) {
		if (!i) continue;
		let a = je(r, e?.[t]);
		a !== void 0 && (globalThis[n] = a);
	}
}
const Ne = () => !!globalThis.navigator?.storage?.getDirectory,
	Pe = () => (typeof process < `u` ? {}.GEX_XCACHE_DIR : void 0);
async function Fe(e) {
	try {
		if (Ne()) {
			let t = await (await navigator.storage.getDirectory()).getFileHandle(e);
			return new Uint8Array(await (await t.getFile()).arrayBuffer());
		}
		let t = Pe();
		if (t) {
			let n = await Promise.resolve().then(() => u(E(), 1));
			return new Uint8Array(await n.readFile(`${t}/${e}`));
		}
	} catch {}
	return null;
}
async function Ie(e, t) {
	if (Ne()) {
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
	let n = Pe();
	if (n) {
		let r = await Promise.resolve().then(() => u(E(), 1));
		await r.mkdir(n, { recursive: !0 });
		let i = `${n}/${e}.${process.pid}.${Date.now()}`;
		return (await r.writeFile(i, t), await r.rename(i, `${n}/${e}`), !0);
	}
	return !1;
}
function Le(e) {
	for (;;) {
		let t = Atomics.load(e, 0);
		if (t & 1073741824) return !1;
		if (Atomics.compareExchange(e, 0, t, t + 1) === t) return !0;
	}
}
function Re(e) {
	Atomics.sub(e, 0, 1);
}
const ze = (e) => new Promise((t) => setTimeout(t, e));
function Be(e) {
	Ge = e;
}
var I,
	Ve,
	He,
	Ue,
	We,
	L,
	Ge,
	Ke = o(() => {
		((I = { on: !1 }),
			WebAssembly.Suspending,
			(Ve = 8),
			(He =
				typeof process == `object` &&
				!!process.versions?.node &&
				typeof setImmediate == `function`),
			(Ue = class {
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
			(We = class {
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
						if (((this.#a = !0), He)) {
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
					return performance.now() - this.#s >= Ve;
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
							let a = new Ue(i, e, n);
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
			(L = new We()));
	});
function qe() {
	if (Ze === void 0) {
		Ze = null;
		try {
			typeof window < `u` &&
				window.location?.search &&
				(Ze = new URLSearchParams(window.location.search).get(`log`));
		} catch {}
	}
	return Ze;
}
function Je() {
	let e = globalThis.GEX_LOG ?? {}.GEX_LOG ?? qe();
	return e == null || e === `` || e === `0` ? null : String(e);
}
function Ye() {
	let e = Je();
	return e !== `quiet` && e !== `off` && e !== `none`;
}
function R(e) {
	let t = Je();
	if (t === null || t === `off` || t === `none` || t === `quiet`) return !1;
	if (t === `1` || t === `all`) return !0;
	let n = t.split(`,`);
	return e === void 0 ? n.length > 0 : n.includes(e);
}
function z(e) {
	let t = Je();
	return t !== null && t.split(`,`).includes(e);
}
function Xe(e) {
	e != null &&
		globalThis.GEX_LOG === void 0 &&
		(globalThis.GEX_LOG = String(e));
}
var Ze,
	Qe = o(() => {});
(Ke(), Qe());
const B = () => !!globalThis.GEX_MEM64,
	$e = !!{}.GEX_TEST_KEEP_PROBE,
	et = () =>
		Number(globalThis.GEX_TEST_FTAB_SPARE ?? {}.GEX_TEST_FTAB_SPARE ?? 0),
	tt = 16 * 2 ** 30,
	nt = (e) => (B() ? BigInt(e >>> 0) : e | 0),
	V = (e) => (typeof e == `bigint` ? Number(e) : e >>> 0),
	rt = (e) => (typeof e == `bigint` ? e : BigInt(e >>> 0));
function it(e, t, n) {
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
					a = ot.decode(e.slice(r, n));
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
		ee = () => {
			for (let e of v) {
				(y.push(0, 35),
					b(u),
					e.rel && (y.push(65), x(e.rel), y.push(106)),
					y.push(11),
					b(e.fs.length));
				for (let t of e.fs) b(t);
			}
		},
		te = () => {
			let e = y.length;
			return (ee(), y.splice(e));
		};
	(h.forEach(([t, n, a], o) => {
		if (t === 7) {
			let t = f.filter(_),
				n = at(t.length) + t.reduce((e, t) => e + t.b - t.a, 0);
			(y.push(7), b(n), b(t.length), C());
			for (let n of t) S.push(e.subarray(n.a, n.b));
		} else if (t === 9 && v.length) {
			r = p[0];
			let t = i(),
				n = e.subarray(r, p[1]),
				a = te();
			(y.push(9),
				b(at(t + v.length) + n.length + a.length),
				b(t + v.length),
				C(),
				S.push(n, Uint8Array.from(a)));
		} else S.push(e.subarray(n, a));
		if (o + 1 === m && !p && v.length) {
			let e = te();
			(y.push(9),
				b(at(v.length) + e.length),
				b(v.length),
				C(),
				S.push(Uint8Array.from(e)));
		}
	}),
		C());
	let w = S.reduce((e, t) => e + t.length, 0),
		T = new Uint8Array(w),
		E = 0;
	for (let e of S) (T.set(e, E), (E += e.length));
	return T;
}
const at = (e) => {
		let t = 1;
		for (; e >= 128; ) ((e = Math.floor(e / 128)), t++);
		return t;
	},
	H = (e) => (B() ? BigInt(e) : e),
	ot = new TextDecoder();
function st(e) {
	return {
		u8: new Uint8Array(e),
		i32: new Int32Array(e, 0, Math.floor(e.byteLength / 4)),
		dv: new DataView(e),
	};
}
function U(e) {
	return ot.decode(lt(e.buffer) ? e.slice() : e);
}
const ct = globalThis.SharedArrayBuffer;
function lt(e) {
	return typeof ct == `function` && e instanceof ct;
}
const ut = [32, 16, 8, 4].map((e) => e * 1024 * 1024 * 1024),
	dt = () =>
		Number(
			globalThis.GEX_TEST_SPARE_MODULES ?? {}.GEX_TEST_SPARE_MODULES ?? 0,
		) || 20;
function ft() {
	if (
		typeof SharedArrayBuffer > `u` ||
		typeof SharedArrayBuffer.prototype.grow != `function`
	)
		return null;
	for (let e of ut)
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
let pt = !1;
function mt(e, t) {
	let n = t.length,
		r = Number(
			Atomics.add(new BigInt64Array(e, 0, 1), 0, BigInt((n + 7) & -8)),
		),
		i = r + n;
	if (i > e.maxByteLength)
		return (
			pt ||
				((pt = !0),
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
					pt ||
						((pt = !0),
						console.error(
							`[gex] module store would not grow to ${(i / 1048576).toFixed(0)} MiB (${n?.message ?? n}): the translated-module registry keeps its bytes in the shim heap from here`,
						)),
					-1
				);
		}
	}
	return (new Uint8Array(e, r, n).set(t), r);
}
function ht(e) {
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
const gt = 64n << 10n,
	_t = 4194289n,
	vt = 4194290n;
function yt(e, t) {
	console.error(`[${e}] starting a thread: ${t?.message ?? t}`);
}
function bt(e, t) {
	return t ? (e?.dense === 2 ? 2 : 1) : 0;
}
const xt = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 10, 2, 96, 1, 127, 0, 96, 2, 127, 127, 0, 2,
		7, 1, 1, 119, 1, 102, 0, 0, 3, 2, 1, 1, 7, 5, 1, 1, 101, 0, 1, 10, 8, 1, 6,
		0, 32, 0, 18, 0, 11,
	]),
	St = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 20, 2, 1, 119, 5,
		99, 111, 117, 110, 116, 0, 0, 1, 119, 4, 114, 101, 97, 108, 0, 0, 3, 2, 1,
		0, 7, 5, 1, 1, 99, 0, 2, 10, 12, 1, 10, 0, 32, 0, 16, 0, 32, 0, 18, 1, 11,
	]),
	Ct = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 11, 2, 96, 2, 127, 127, 0, 96, 1, 127, 1,
		127, 2, 26, 3, 1, 119, 3, 111, 108, 100, 0, 0, 1, 119, 3, 104, 105, 116, 0,
		1, 1, 119, 3, 97, 114, 109, 3, 127, 0, 3, 2, 1, 0, 7, 5, 1, 1, 99, 0, 2, 10,
		27, 1, 25, 0, 32, 1, 35, 0, 70, 4, 64, 32, 0, 16, 1, 4, 64, 15, 11, 0, 11,
		32, 0, 32, 1, 18, 0, 11,
	]);
let wt = null,
	Tt = null;
const Et = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 1, 96, 3, 127, 127, 126, 1, 127, 2, 21,
		2, 1, 101, 4, 104, 111, 111, 107, 1, 112, 0, 1, 1, 101, 4, 115, 108, 111,
		119, 0, 0, 3, 3, 2, 0, 0, 7, 21, 2, 4, 115, 108, 111, 119, 0, 1, 10, 101,
		110, 116, 114, 121, 95, 99, 97, 108, 108, 0, 2, 9, 7, 1, 0, 65, 0, 11, 1, 1,
		10, 26, 2, 10, 0, 32, 0, 32, 1, 32, 2, 18, 0, 11, 13, 0, 32, 0, 32, 1, 32,
		2, 65, 0, 19, 0, 0, 11,
	]),
	Dt = Array(32768).fill(0),
	Ot = function () {
		return 1;
	};
function kt() {
	try {
		return Reflect.apply(Ot, null, Dt);
	} catch (e) {
		if (e instanceof RangeError) return 0;
		throw e;
	}
}
let At = null;
const jt = new Map();
function Mt(e, t) {
	let n = (e ? 2 : 0) | !!t,
		r = jt.get(n);
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
	return ((r = new WebAssembly.Module(s)), jt.set(n, r), r);
}
const Nt = new Map(),
	Pt = !!{}.GEX_SNAP_TRACE,
	Ft = 131072,
	It = Object.freeze({ snapNest: !0 });
function Lt(e, t) {
	let n = (e ? 2 : 0) | !!t,
		r = Nt.get(n);
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
	return ((r = new WebAssembly.Module(u)), Nt.set(n, r), r);
}
function Rt(e, t, n, r) {
	let i = e.length + t;
	(i > 1 << 20 &&
		console.warn(`[gex] dispatch table ${r} grows ${e.length} -> ${i} entries`),
		e.grow(t, n));
}
function zt() {
	return Number(globalThis.GEX_ADOPT_AFTER ?? 1);
}
const Bt = `gexfill`,
	W = `gexfillat`;
function Vt(e, t = !1) {
	if (!(!t && !R(`debug`))) {
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
		Ut(e);
	}
}
function Ht(e) {
	R(`debug`) && Ut(e);
}
function Ut(e) {
	let t = typeof process < `u` ? process.getBuiltinModule?.(`fs`) : null;
	if (t?.writeSync)
		try {
			t.writeSync(2, `${e}\n`);
			return;
		} catch {}
	let n = typeof process < `u` ? process.stderr : null;
	n?.write ? n.write(`${e}\n`) : console.debug(e);
}
let Wt = 2,
	Gt = 4096 >> Wt;
function Kt(e) {
	let t = e?.gex_inst_align_shift?.();
	typeof t == `number` && t >= 0 && t <= 2 && ((Wt = t), (Gt = 4096 >> t));
}
const qt = `gexfillall`;
function Jt(e, t, n) {
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
const Yt = 2 ** 32,
	Xt = Yt + 17 * 2 ** 20,
	Zt = () => (B() ? Yt : 1048576),
	Qt = () => (B() ? tt / 4096 : 524288),
	$t = 65535;
function en() {
	let e = globalThis.GEX_MEM_MAX_MIB ?? {}.GEX_MEM_MAX_MIB;
	if (e) return Math.max(tn, Math.min($t, Math.floor(Number(e) * 16)));
}
const tn = 1792;
function nn(e) {
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
function rn(e) {
	return e.len ?? e.bytes?.byteLength ?? 0;
}
function an(e) {
	let t = new Uint32Array(
			e.buffer ?? e,
			e.byteOffset ?? 0,
			Math.floor(e.byteLength / 4),
		),
		n = 2166136261;
	for (let e = 0; e < t.length; e++) n = Math.imul(n ^ t[e], 16777619);
	return n >>> 0;
}
function on(e) {
	if (!e || e.length < 32) return 0;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength);
	return Number(t.getBigUint64(24, !0));
}
const sn = [`main`, `__main_argc_argv`, `__original_main`];
function cn(e) {
	return (un(e) ?? 0) & 3;
}
function ln(e) {
	if (un(e) === null) return null;
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
function un(e) {
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
const dn = BigInt(Math.round(performance.timeOrigin * 1e3)) * 1000n;
function fn() {
	return dn + BigInt(Math.round(performance.now() * 1e6));
}
var pn = class {
	write(e, t) {
		let n = U(t);
		e === 2 ? console.error(n) : console.log(n);
	}
	now() {
		return fn();
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
};
function mn(e) {
	if (!e || e.byteLength < 48) return [];
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = Number(t.getBigUint64(40, !0)),
		r = [],
		i = 48;
	for (let a = 0; a < n && i + 12 <= e.byteLength; a++, i += 12) {
		let e = t.getUint32(i + 8, !0),
			n = e >>> 24,
			a = (e & 16777215) + Gt;
		r[n] >= a || (r[n] = a);
	}
	return r;
}
function hn(e) {
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
function gn(e) {
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
			if (r === 9 && U(e.subarray(t, t + r)) === `gex.dense`) return t + r;
		}
		t = a;
	}
	return -1;
}
function _n(e) {
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
			if (U(e.subarray(n, n + t)) === `gex.dense`) return e.slice(n + t, o);
		}
		n = o;
	}
	return null;
}
function vn(e) {
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
			if (U(e.subarray(n, n + t)) === `gex.meta`) return e.slice(n + t, o);
		}
		n = o;
	}
	return null;
}
const G = [
	`dispatch`,
	`dispatch1`,
	`dispatch2`,
	`dispatch3`,
	`dispatch4`,
	`dispatch5`,
	`dispatch6`,
	`dispatch7`,
];
var yn = class extends Error {
	constructor(e) {
		(super(`gex.provider_throw(${e}) with no gex.provider_try to catch it`),
			(this.code = e));
	}
};
function bn(e) {
	let t = globalThis.GEX_VFORK_TRACE || {}.GEX_VFORK_TRACE;
	t &&
		(typeof t == `string` &&
		t.includes(`/`) &&
		globalThis.process?.getBuiltinModule
			? globalThis.process.getBuiltinModule(`fs`).appendFileSync(t, `${e}\n`)
			: console.error(e));
}
var K = class e {
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
			this.#d || ((this.#d = new MessageChannel()), this.#d.port1.start()),
			new Promise((e) => {
				((this.#d.port1.onmessage = () => e()), this.#d.port2.postMessage(0));
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
			this.#d || ((this.#d = new MessageChannel()), this.#d.port1.start()),
			new Promise((e) => {
				((this.#d.port1.onmessage = () => setTimeout(e, 1)),
					this.#d.port2.postMessage(0));
			})
		);
	}
	constructor(
		e = new pn(),
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
							initial: BigInt(tn),
							maximum: BigInt(tt / 65536),
							shared: t,
						})
					: new WebAssembly.Memory({
							initial: tn,
							maximum: en() ?? $t,
							shared: t,
						}))),
			(this.#ye = r));
	}
	#Be() {
		if (this.#we === null) {
			if (
				typeof this.#t.exports.gex_worker_init?.call == `function` &&
				(lt(this.#e.buffer) || I.on)
			) {
				let e = Atomics.add(new Int32Array(this.#e.buffer), 262096, 1) & 31;
				this.#t.exports.__stack_pointer.value = nt(100663296 - e * 262144);
			}
			if (
				((globalThis.GEX_WINE32_SPLIT || this.#fe) &&
					this.#t.exports.gex_set_wine_split?.(1),
				globalThis.GEX_NULL_GUARD && this.#t.exports.gex_set_null_guard?.(1),
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
				globalThis.GEX_SEH_REPORT && this.#t.exports.gex_set_seh_report?.(1),
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
			if ((this.keepPromise(), e === 0 && (lt(this.#e.buffer) || I.on)))
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
		if (!this.#Ce || !e?.gex_audio_ring_addr || !this.#ye?.memory) return null;
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
			I.on ||
			!lt(this.#e.buffer)
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
				(e.gex_free?.(i, r * 8), (r *= 4), (i = e.gex_alloc(r * 8) >>> 0));
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
					link: [`off`, `no-kernel`, `armed`, `kept`, `restored`, `asked`][
						Number(e.gex_link_state?.() ?? 0)
					],
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
			r = U(this.#Ye().subarray(t, t + n));
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
			r = U(this.#Ye().subarray(t, t + n));
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
			sysMs: Math.round(Number(this.#t.exports.gex_sys_us?.() ?? 0n) / 1e3),
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
				(this.#p || R(`debug`)) &&
				Vt(
					U(this.#Ye().subarray(e >>> 0, (e >>> 0) + (t >>> 0))).replace(
						/\n$/,
						``,
					),
					this.#p,
				),
			warn: (e, t) => {
				let n = U(this.#Ye().subarray(e >>> 0, (e >>> 0) + (t >>> 0))).replace(
					/\n$/,
					``,
				);
				if (n.startsWith(`[gex-note] `)) {
					console.warn(n.slice(11));
					return;
				}
				if (n.startsWith(`[gex-info] `)) {
					Ye() && console.info(`[gex] ${n.slice(11)}`);
					let e =
						this.#_e?.straceExe && /^pid \d+: exec (\S+)/.exec(n.slice(11));
					e &&
						e[1].split(`/`).pop() === this.#_e.straceExe &&
						(this.#t.exports.gex_set_trace(1), (this.#p = !0));
					return;
				}
				let r = /^gex-pe: native wasm32 module for (\S+): /.exec(n);
				if (
					!(
						r &&
						(this.#r.noteStatus?.({ kind: `module`, path: r[1] }), !R(`debug`))
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
			clock_origin: () => dn,
			call_out: I.on
				? new WebAssembly.Suspending((e, t, n, r) =>
						this.#ra()
							? this.#Zi(e >>> 0, t, n, r)
							: this.#Qi(e >>> 0, t, n, r),
					)
				: (e, t, n, r) => this.#Zi(e >>> 0, t, n, r),
			ftab_call: I.on
				? new WebAssembly.Suspending((e, t, n, r, i) => {
						this.#tn.length && this.#rn(e >>> 0);
						let a = this.#Gt.ftab.get(H(e >>> 0));
						return this.#ra() ? a(t, n, r, i) : this.#na(a)(t, n, r, i);
					})
				: (e, t, n, r, i) => (
						this.#tn.length && this.#rn(e >>> 0),
						this.#Gt.ftab.get(H(e >>> 0))(t, n, r, i)
					),
			ftab_call_vi: (e, t) => {
				(this.#tn.length && this.#rn(e >>> 0),
					this.#Gt.ftab.get(H(e >>> 0))(t));
			},
			entry_call: I.on ? (e, t, n) => 0 : this.#zn(),
			snap_ok: () => this.#yr(),
			cgen_serve: () => this.#mi(),
			thread_start: () => this.#Tt(),
			fault_call: (e, t, n, r, i, a) => {
				if (I.on) return 0;
				let o = this.#Gt.ftab.get(H(e >>> 0)),
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
			stack_room: () => kt(),
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
				let i = U(this.#Ye().subarray(t >>> 0, (t >>> 0) + (n >>> 0)));
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
			gl_submit: I.on
				? new WebAssembly.Suspending((e) =>
						this.#c
							? this.#c.submit(this.#e, e, this.wlToken(), !1, this.#Vt)
							: -1,
					)
				: (e) =>
						this.#c
							? this.#c.submit(this.#e, e, this.wlToken(), !1, this.#Vt)
							: -1,
			gl_submit_async: I.on
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
			wl_drag_data: (e, t) => this.#u?.dragData(this.#e, e >>> 0, t >>> 0) ?? 0,
			wl_drag_status: (e, t) => this.#u?.dragStatus(e >>> 0, t >>> 0),
			wl_clip_serial: () => this.#u?.clipSerial?.() ?? 0,
			wl_clip_get: (e, t) => this.#u?.clipGet?.(this.#e, e >>> 0, t >>> 0) ?? 0,
			wl_clip_set: (e, t) => this.#u?.clipSet?.(this.#e, e >>> 0, t >>> 0) ?? 0,
		};
	}
	async load(t, n, r, i = {}, a = [], o = {}) {
		let s = cn(r);
		(s && (this.#de = -1),
			(this.#pe = un(r) & 3 ? null : ln(r)),
			(this.#fe = !!(s & 2)));
		let c = t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t);
		(await this.#st(),
			(this.#t = await WebAssembly.instantiate(c, {
				env: { memory: this.#e },
				gex_env: this.#Xe(),
				gex_k: this.#gt(c),
			})),
			(this.#i = null),
			(this.#t.exports.__stack_pointer.value = nt(this.#Be())));
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
			R(`serveall`) && this.#t.exports.gex_cgen_serve_always?.(1),
			R(`record`) && this.#t.exports.gex_cgen_set_record?.(1),
			this.#Wt && this.#t.exports.gex_elfprov_off?.(),
			this.#Ut(),
			this.#t.exports.gex_set_wl?.(+!!this.#u),
			this.#xi && this.#t.exports.gex_set_wl_output?.(...this.#xi),
			this.#xi && this.#t.exports.gex_set_wl_scale?.(this.#Si),
			this.#t.exports.gex_set_network?.(+!!this.#o),
			this.#t.exports.gex_set_cpus?.(
				o.cpus || globalThis.navigator?.hardwareConcurrency || 1,
			),
			e.watchDir >= 0 && this.#t.exports.gex_watch_dir?.(BigInt(e.watchDir)),
			(this.#t.exports.__stack_pointer.value = nt(this.#Be())),
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
			Kt(this.#t.exports),
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
			o.xlateReport && this.#t.exports.gex_set_xlate_report?.(o.xlateReport),
			o.discoverSkip && this.#t.exports.gex_set_discover_skip?.(o.discoverSkip),
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
				(this.#Ye().set(n, t), (m ||= this.#t.exports.gex_alloc(p) >>> 0));
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
				(f[e] !== void 0 && this.#t.exports.gex_chmod?.(t, n.length, f[e]),
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
			let s = this.#t.exports.gex_add_hardlink?.(o, r.length, a, n.length) ?? 0,
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
					console.warn(`gex: symlink ${e} -> ${t} not made (no global kernel)`),
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
					o = this.#t.exports.gex_alloc(t.length + i.length + a.length) >>> 0;
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
			((v = this.#t.exports.gex_alloc(_.length) >>> 0), this.#Ye().set(_, v)),
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
				? (e, t) => (o.syscallGuard(e >>> 0, t, this.#e), b.gex_syscall(e, t))
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
			safepoint: I.on ? this.#Ri(b) : b.gex_safepoint,
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
		let S = o.dense !== !1 && !!this.#n.exports.blocks && !!b.gex_set_dense;
		return (
			(this.#B = S),
			(this.#_e.dense = S ? (o.dense === 2 ? 2 : 1) : !1),
			b.gex_set_dense?.(bt(this.#_e, this.#B)),
			$e && b.gex_test_keep_probe?.(1),
			this.#io(),
			(globalThis.GEX_TEST_UNPUBLISHED_RETIRE ||
				{}.GEX_TEST_UNPUBLISHED_RETIRE) &&
				b.gex_test_unpublished_retire?.(1),
			(globalThis.GEX_TEST_FORK_REBASE || {}.GEX_TEST_FORK_REBASE) &&
				b.gex_test_fork_rebase?.(1),
			{}.GEX_TEST_DENSE_HOLES && b.gex_test_dense_holes?.(1),
			(globalThis.GEX_TEST_SERVE_UNMERGED || {}.GEX_TEST_SERVE_UNMERGED) &&
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
			n = this.#B ? (e.dense ?? _n(e.mod)) : null;
		if (globalThis.GEX_DENSE_DEBUG && n && e.dense) {
			let t = _n(e.mod);
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
		let r = Math.max(e.need >>> 0, on(e.meta));
		if (!e.meta || !e.meta.length || !t.gex_add_lazy_module) {
			await this.#ka(e.mod, r, 64, e.meta, `adopt-nometa`, null, !1, e.dense);
			return;
		}
		let i = t.gex_alloc(e.meta.length) >>> 0;
		this.#Ye().set(e.meta, i);
		let a = t.gex_add_lazy_module(i, e.meta.length) >>> 0;
		if ((t.gex_free?.(i, e.meta.length), !a)) {
			await this.#ka(e.mod, r, 64, e.meta, `adopt-noneed`, null, !1, e.dense);
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
		let t = e instanceof Uint8Array ? vn(e) : e.meta;
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
				o = i ? r.meta : vn(r),
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
					need: Math.max(s, on(o)),
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
			a = e instanceof WebAssembly.Module ? e : await WebAssembly.compile(e);
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
			r && (this.#t.exports.__stack_pointer.value = nt(this.#Be())));
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
			safepoint: I.on ? this.#Ri(s) : s.gex_safepoint,
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
					(this.#t.exports.__stack_pointer.value = nt(this.#Be())))
				: await this.#$e(t, n, i),
			r &&
				(this.#t.exports.gex_set_gl?.(+!!this.#c),
				this.#t.exports.gex_set_d3d?.(+!!this.#l),
				this.#t.exports.gex_set_wl?.(+!!this.#u),
				this.#xi && this.#t.exports.gex_set_wl_output?.(...this.#xi),
				this.#xi && this.#t.exports.gex_set_wl_scale?.(this.#Si),
				this.#t.exports.gex_set_network?.(+!!this.#o),
				this.#Ht && this.#t.exports.gex_cgen_set_mode?.(this.#Ht),
				R(`serveall`) && this.#t.exports.gex_cgen_serve_always?.(1),
				R(`record`) && this.#t.exports.gex_cgen_set_record?.(1),
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
			((e.bytes = o.slice(e.at, e.at + e.len)), delete e.len, delete e.stage);
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
				lt(this.#e.buffer) &&
				lt(this.#ye?.memory?.buffer);
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
		(a.push({ at: 0, bytes: new Uint8Array(), zeros: u(0, 3145728) }),
			B() && a.push({ at: Yt, bytes: new Uint8Array(), zeros: u(Yt, Xt) }));
		let d = this.#ot();
		this.#it = d;
		let f = d ? nn(d) : this.#at();
		for (let { start: e, end: t, prot: n } of f)
			if (t > e) {
				let r = { at: e, end: t, prot: n, bytes: new Uint8Array(), zeros: 0 };
				(a.push(r), (r.zeros = u(e, t)));
			}
		if (
			(c && t.gex_free?.(l, c * 8), s && this.#tt(a), globalThis.GEX_DEBUG_EXIT)
		)
			for (let e of a) e.sum = an(e.bytes);
		if (globalThis.GEX_DEBUG_EXIT) {
			let n = a.reduce((e, t) => e + t.bytes.byteLength, 0),
				r = 0;
			if (t.gex_vma_reloadable) {
				let e = t.gex_vma_count(),
					n = t.gex_alloc(24) >>> 0,
					i = new DataView(this.#e.buffer);
				for (let a = 0; a < e; a++) {
					if (t.gex_vma_at(a, n) !== 0 || !t.gex_vma_reloadable(a)) continue;
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
		let a = t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t);
		(e(`instantiate`), await de());
		let o = await WebAssembly.instantiate(a, {
			env: {
				memory: n,
				...xe(this.#e, B(), i),
				lazy_fetch: Ce(n),
				page_fs: ke(n),
			},
		});
		(e(`instantiated`), r && Se(o.exports, r), (this.#Ce = o.exports));
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
		let e = BigInt.asUintN(64, BigInt(this.#Ce?.k_guest_clock?.(0, 0) ?? 0));
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
				e - BigInt(this.#Ce?.k_boot_secs?.(0) ?? 0) * 1000000000n - this.#ut();
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
					...(e.k_mono_held_at ? { monoHeld: e.k_mono_held_at() >>> 0 } : {}),
					...(e.k_snap_extents_at
						? { extents: e.k_snap_extents_at() >>> 0 }
						: {}),
				}
			: null;
	}
	#pt() {
		if (this.#xe || !R(`debug`)) return;
		let e = this.#t?.exports;
		if (!e?.gex_wait_census) return;
		let t = ``;
		((this.#xe = setInterval(() => {
			if (this.#Te) return;
			let n = e.gex_alloc(512) >>> 0,
				r = e.gex_wait_census(n, 512) >>> 0;
			if (r) {
				let i = U(this.#Ye().slice(n, n + r));
				(i === t &&
					Ht(
						`[gex] quiet: ${i}${I.on ? ` js=${this.#Se}/installs=${this.#R}/pending=${e.gex_jit_pending_len() >>> 0}` : ``}`,
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
			i = await Fe(e);
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
		if (!(!e || !a?.k_store_save) && !(n && !Le(n)))
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
					for (; Atomics.load(n, 1); ) await ze(5);
				}
			} finally {
				n && Re(n);
			}
	}
	async #ht(e, t, n, r, i) {
		let a = this.#Ce;
		try {
			let o = a.k_store_save_ptr() >>> 0,
				s = new Uint8Array(this.#ye.memory.buffer, o, t).slice();
			(a.k_store_save_done(),
				r && (await ze(r)),
				await Ie(String(e), s),
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
		if ((t || (a.k_halt_code = () => -1), t && I.on)) {
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
						L.parkSlot(n, (t.k_ws_addr(r) >>> 0) >>> 2, i, a, this.#be))
					: 1,
			)),
				(a.k_wq_notify = (e) => {
					(t.k_wq_notify(e), L.checkSlots());
				}),
				(a.k_futex_wake = (e) => {
					(t.k_futex_wake(e), L.checkSlots());
				}),
				(a.k_wq_release = () => {
					(t.k_wq_release(), L.checkSlots());
				}));
		}
		return a;
	}
	#_t(e) {
		let t = vn(e);
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
			bn(`[pool] pid ${n.pid}: ${i ? `pooled runtime` : `new runtime`}`));
		let a = this.#t.exports;
		this.#_t(t);
		let o = n.opts ?? {},
			s = o.uid ?? n.uid;
		(s !== void 0 && a.gex_set_identity(s, o.gid ?? n.gid ?? s),
			n.cwd && this.#bt(new TextEncoder().encode(n.cwd), a.gex_set_cwd),
			n.state?.length && this.#bt(n.state, a.gex_set_child_state),
			a.gex_adopt_child(n.pid, n.ctx, 0n, 0n, 0n, 0n));
		let c = o.dense !== !1 && !!this.#n.exports.blocks && !!a.gex_set_dense;
		return (
			(this.#B = c),
			(o.dense = c ? (o.dense === 2 ? 2 : 1) : !1),
			a.gex_set_dense?.(bt(o, this.#B)),
			$e && a.gex_test_keep_probe?.(1),
			this.#io(),
			(this.#_e = o),
			Kt(a),
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
				e.gex_fjit_limit?.(t.fjitMax ?? 4294967295, BigInt(t.fjitOnly ?? 0)),
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
			t.intrinsicMask !== void 0 && e.gex_set_intrinsic_mask?.(t.intrinsicMask),
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
				n.image.reduce((e, t) => Math.max(e, t.end ?? 0, t.at + rn(t)), 0),
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
			let t = rn(e);
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
			let [n, r] = Jt(c, new Uint8Array(e.bytes), e.at);
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
				an(c.subarray(t.at, n)) !== t.sum &&
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
				Math.max(e.end ?? 0, e.at + rn(e)),
			])),
			await this.attach(e, t),
			o(`instantiated, ${p()} non-zero bytes in the context`));
		let m = this.#t.exports;
		((globalThis.GEX_TEST_FORK_REBASE || {}.GEX_TEST_FORK_REBASE) &&
			m.gex_test_fork_rebase?.(1),
			this.#_t(t),
			zt() > 0 &&
				m.gex_reset_directory &&
				o(`directory rebuilt: ${m.gex_reset_directory() >>> 0} entries kept`));
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
		let h = m.gex_adopt_child(n.pid, n.ctx, n.pc, n.sp, n.tls, n.brk ?? 0n);
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
			!!(n.opts ?? {}).dense && !!this.#n.exports.blocks && !!m.gex_set_dense),
			m.gex_set_dense?.(bt(n.opts, this.#B)),
			$e && m.gex_test_keep_probe?.(1),
			this.#io(),
			o(
				`kernel built, entry 0x${h.toString(16)}, ${p()} non-zero bytes in the context`,
			));
		let g = n.opts ?? {};
		((this.#_e = g), Kt(m), this.#Ct(m, g, n.pid));
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
					`[heap] debug=${!!globalThis.GEX_DEBUG_EXIT} api=${typeof performance.measureUserAgentSpecificMemory} isolated=${globalThis.crossOriginIsolated} used=${performance.memory?.usedJSHeapSize ?? `n/a`} limit=${performance.memory?.jsHeapSizeLimit ?? `n/a`} image=${(n.image ?? []).reduce((e, t) => e + rn(t), 0)} modules=${(n.modules ?? []).length}`,
				),
			globalThis.GEX_DEBUG_EXIT && performance.measureUserAgentSpecificMemory)
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
				.catch((e) => console.error(`[heap] measure failed: ${e.message}`));
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
		if (zt() <= 0) {
			for (let e of n.modules ?? []) v = Math.max(v, e.need);
			v = Math.max(v, (n.slots ?? 0) >>> 0);
		}
		if ((v && this.#wi(v, `a1806`), (this.#me = n.modules ?? []), zt() <= 0)) {
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
				an(e.subarray(r.at, n)) !== r.sum &&
					t++ < 8 &&
					console.error(
						`[adopt] region ${r.at.toString(16)}..${n.toString(16)} (${r.prot ?? `-`}) is not what the parent sent`,
					);
			}
			o(t ? `${t} of ${n.image.length} regions differ` : `image verified`);
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
				yt(e, t);
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
		this.#fa ??= ft();
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
			!lt(this.#e?.buffer) && !I.on)
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
			let t = z(`spare`);
			t &&
				console.warn(
					`[spare] pid ${this.#t.exports.gex_my_pid?.() ?? `?`}: caught up with ${this.#Gt?.dyl.size ?? 0} modules, waiting`,
				);
			let r,
				i = n.spareGo().then((e) => {
					r = e ?? !1;
				});
			for (
				let n = 20;
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
					(n = i === r ? Math.min(2 * n, 1e3) : 20));
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
			((c = this.#Mt(i, a, performance.now() - n)), e.gex_vfork_exec_done());
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
			bn(
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
			((s = this.#Mt(r, i, performance.now() - n)), t.gex_vfork_exec_done());
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
			bn(
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
		if ((bn(`[vfork] not here: ${e}`), this.#Nt)) return;
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
					I.on || t.gex_fork_hold?.();
					let n;
					try {
						n = this.#rt();
					} finally {
						t.gex_fork_release?.();
					}
					return (
						(this.#v = performance.now() - e),
						(this.#y = n.reduce((e, t) => e + rn(t), 0)),
						(this.#b = n.length),
						n
					);
				})(),
				imageStage: this.#nt,
				vmaBlob: this.#it,
				slots: t.gex_jit_slots_total?.() ?? 0,
				pages: this.#vt(),
				shared: this.#yt(),
				modules: [...this.#me, ...this.#q.filter((e) => !e.inst), ...this.#ve],
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
							(t.gex_fork_state_ptr() >>> 0) + (t.gex_fork_state_len() >>> 0),
						)
					: null,
				exe:
					t.gex_fork_exe_len && t.gex_fork_exe_len() > 0
						? new TextDecoder().decode(
								this.#Ye().slice(
									t.gex_fork_exe_ptr() >>> 0,
									(t.gex_fork_exe_ptr() >>> 0) + (t.gex_fork_exe_len() >>> 0),
								),
							)
						: null,
				cwd:
					t.gex_fork_cwd_len && t.gex_fork_cwd_len() > 0
						? new TextDecoder().decode(
								this.#Ye().slice(
									t.gex_fork_cwd_ptr() >>> 0,
									(t.gex_fork_cwd_ptr() >>> 0) + (t.gex_fork_cwd_len() >>> 0),
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
		if (!e.gex_module_count || (e.gex_has_host && !e.gex_has_host())) return;
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
				c = (s ? this.#z.get(s) : void 0) ?? this.#Ca(this.#ba(t)) ?? void 0,
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
			(u && s && (this.#z.set(s, u), this.#to.delete(s), this.#Xa(e, s, u)),
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
			let e = this.#Bt < 0 ? (this.#Bt = performance.now() - this.#zt) : -1;
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
			R(`unit`) &&
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
			i = `ftab-runtime:${ht(r)}`,
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
		for (let e = 0; e < G.length; e++)
			c[G[e]] =
				t[e] ?? new WebAssembly.Table({ element: `anyfunc`, initial: 0 });
		this.#B && (c.blocks = this.#n.exports.blocks);
		let l = new WebAssembly.Instance(a, { gex: c }),
			u = z(`bridges`) ? this.#oo(l.exports.bridge) : l.exports.bridge;
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
			o.set(H(1), e.gex_ftab_fallback),
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
				(i < r && (e.ftab.grow(H(r - i), e.resolve), this.#fo(`ftab grew`)),
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
			(t.gex_ftab_enter(Number(e.ftab.length)) >>> 0 > Number(e.ftab.length) &&
				this.#Yt());
	}
	#Zt = et() || 4096;
	#Qt() {
		let e = et() || 8192;
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
				let e = c && r.gex_wasmprog_owned ? r.gex_wasmprog_owned(a) >>> 0 : 0;
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
			let e = (e) => BigInt.asUintN(64, BigInt(r.gex_cgen_pmod_wasm_key(a, e)));
			if (((_ = `wasm:${m}:${e(0)}:${e(1)}`), c && !p && !z(`nodlpack`))) {
				if (this.#z.has(`${_}:p`)) ((_ = `${_}:p`), (b = !0));
				else if (!this.#z.has(_)) {
					let e = h(),
						n = performance.now();
					((g = it(e, y, t)),
						z(`dlpack`) &&
							console.warn(
								`[dlpack] ${this.#Kt(r.gex_cgen_pmod_file, a)}: ${g ? `${e.length} -> ${g.length} bytes, ${y.length} slots` : `not packed`} in ${(performance.now() - n).toFixed(1)} ms`,
							),
						g ? ((_ = `${_}:p`), (b = !0)) : (g = e));
				}
			}
			!b && !this.#z.has(_) && (g ??= h());
		} else s && ((g = h()), (_ = `wasm:${ht(g)}`));
		if (s) {
			let e = this.#Kt(r.gex_cgen_pmod_file, a);
			R(`record`) && console.warn(`[gex-record] module ${e} ${_.slice(5)}`);
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
			S =
				a >= 0
					? (r.gex_cgen_pmod_memory_base?.(a) >>> 0) +
						(r.gex_cgen_pmod_memory_base_hi?.(a) >>> 0) * 2 ** 32
					: 0,
			C =
				a >= 0
					? (e, t) => r.gex_cgen_pmod_regs(a, e, t)
					: o >= 0
						? (e, t) => r.gex_fjit_regs(o, e, t)
						: (t, n) => r.gex_cgen_regs(e, t, n),
			ee = this.#wi(
				(a >= 0
					? r.gex_cgen_pmod_slots(a)
					: o >= 0
						? r.gex_fjit_slots(o)
						: r.gex_cgen_slots(e)) >>> 0,
				`cgen`,
			),
			te = performance.now(),
			w,
			T = {
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
						p ? BigInt(S) : S,
					),
					__stack_pointer:
						S && !c
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
								sn.map((e) => [
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
								sn.map((e) => [
									e,
									B()
										? new WebAssembly.Global({ value: `i64`, mutable: !0 }, 0n)
										: new WebAssembly.Global({ value: `i32`, mutable: !0 }, 0),
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
								code_changed: (e, t) => r.gex_code_changed?.(rt(e), t),
								wine_pe_slot: (e, t) => r.gex_wine_pe_slot?.(V(e), t) ?? 0,
								...(c && B()
									? {
											sysreg_write: (e, t, n, r) =>
												this.#a.sysreg_write(V(e), t, n, r),
										}
									: {}),
								call_out: I.on
									? new WebAssembly.Suspending((e, t, n, r) =>
											this.#ra()
												? this.#Zi(e >>> 0, t, n, r)
												: this.#Qi(e >>> 0, t, n, r),
										)
									: (e, t, n, r) => this.#Zi(e >>> 0, t, n, r),
								image_mapped: (e, t) => {
									let n = r.gex_image_mapped?.(rt(e), t) ?? -1;
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
					...(S && !c ? (l ? this.#Tn() : this.#En()) : {}),
					...(f ? { provider_alloc: (e) => r.gex_provider_alloc(e) } : {}),
					...(c
						? this.#Dr(() => w, x)
						: l
							? { syscall: this.#di }
							: s
								? {
										syscall: I.on
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
		a < 0 && o < 0 && this.#on(x, this.#Kt(r.gex_cgen_key, e), T);
		let E =
			d &&
			!I.on &&
			WebAssembly.Module.exports(x).some(
				(e) => e.name === `__gexw_snap_globals`,
			);
		if (E) {
			let e = T.gex,
				t = e.unix_dispatcher;
			((e.unix_dispatcher = (e, n) => (e === 1 || e === 5 ? 0 : t(e, n))),
				(e.snap_pe_stop = (e, t, n, r, i) => this.#dr(e, t, n, r, i)),
				this.#vr && (e.call_out = (e, t, n, r) => this.#fr(e >>> 0, t, n, r)),
				(this.#Cr ??= new WebAssembly.Global({ value: `i32`, mutable: !0 }, 0)),
				Object.assign(T.env, {
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
		let D = c ? this.#Yn(a, T, i, v) : [];
		if (
			(c &&
				(this.#Or = {
					module: x,
					base: t,
					memBase: S,
					binds: this.#kr,
					packed: b,
				}),
			(w = new WebAssembly.Instance(x, T)),
			E &&
				((this.#gr = { inst: w, state: T.env.__asyncify_state }), this.#hr()),
			!this.#ii && c)
		) {
			if (r.gex_wasmprog_relocate(a))
				try {
					w.exports.__wasm_apply_data_relocs?.();
				} finally {
					r.gex_wasmprog_relocated?.(a);
				}
		} else
			!this.#ii &&
				S &&
				r.gex_provider_relocate(S) &&
				w.exports.__wasm_apply_data_relocs?.();
		if (c) {
			if (!b)
				for (let [e, t] of D) {
					let n = w.exports[t];
					if (!n) throw Error(`wasm32 module ${a}: ${t} is not exported`);
					i.ftab.set(H(e), n);
				}
			(i.dyl.set(a, w),
				r.gex_wasmprog_release?.(a),
				this.#Zn && this.#rr(a, w, i, this.#Zn));
		}
		let O = n ? 0 : this.#en(C, ee);
		(i.instances.push(w), o >= 0 && r.gex_fjit_installed(o));
		let k = performance.now() - te;
		if (s && z(`wasmlib`)) {
			let e = this.#Dn;
			console.warn(
				`[wasmlib] pid ${r.gex_my_pid?.() ?? `?`} w${Math.round(performance.timeOrigin) % 1e6}: ${this.#Kt(r.gex_cgen_pmod_file, a).split(`/`).pop()} ${e < 0 ? `had` : `compiled ${e.toFixed(1)} ms`}, instantiated ${k.toFixed(1)} ms, at ${Math.round(performance.timeOrigin + performance.now()) % 1e7}`,
			);
		}
		return (
			a < 0 &&
				o < 0 &&
				k >= 20 &&
				console.error(
					`[unit] installed at ${t} in ${Math.round(k)} ms (${O} bridges)`,
				),
			O
		);
	}
	#en(e, t) {
		let n = this.#t.exports,
			r = this.#Gt,
			i = e(0, 0) >>> 0,
			a = n.gex_alloc(4 * Math.max(1, i)) >>> 0,
			o;
		try {
			(e(a, i), (o = new Uint32Array(this.#e.buffer.slice(a, a + 4 * i))));
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
		(o.splice(s, 0, { u: e, base: t, end: a, retired: null }), (this.#tn = o));
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
			R(`unit`) &&
				console.error(
					`[unit] ${this.#qa()}: unit at ${i.base} instantiated at its first call (${t.length} still deferred)`,
				));
		let a = z(`unitstall`),
			o = a ? performance.now() : 0,
			s =
				a && this.#z.has(`cgen:${this.#Kt(this.#t.exports.gex_cgen_key, i.u)}`);
		if (
			(this.#$t(i.u, i.base, !0),
			a &&
				console.warn(
					`[unitstall] ${this.#qa()}: ${(performance.now() - o).toFixed(1)} ms ${s ? `had` : `compiled`}`,
				),
			i.retired)
		)
			for (let e of i.retired) this.#Gt.ftab.set(H(e), this.#Gt.resolve);
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
					WebAssembly.Module.imports(e).map((e) => `${e.module}.${e.name}`),
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
			if (!t) throw Error(`gex-cgen: ${e}: a split unit with no cold.idx`);
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
			R(`unit`) &&
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
				0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 21, 3, 1, 109,
				1, 109, 2, 0, 1, 1, 109, 1, 111, 3, 127, 0, 1, 109, 1, 102, 0, 0, 3, 2,
				1, 0, 7, 7, 1, 3, 104, 105, 116, 0, 1, 10, 47, 1, 45, 1, 2, 127, 32, 0,
				35, 0, 106, 65, 2, 116, 34, 1, 40, 2, 0, 34, 2, 69, 4, 64, 32, 0, 16, 0,
				11, 32, 1, 32, 2, 65, 1, 106, 65, 127, 32, 2, 65, 127, 71, 27, 54, 2, 0,
				11,
			]);
			((this.#pn ??= new WebAssembly.Module(r)),
				(this.#hn ??= new WebAssembly.Memory({ initial: 1 })));
			let i = this.#gn;
			this.#gn += t;
			let a =
				Math.ceil((4 * this.#gn) / 65536) - this.#hn.buffer.byteLength / 65536;
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
							o.set(e, Math.round(performance.timeOrigin + performance.now()));
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
					if (t instanceof yn) return (e.gex_provider_note(1), t.code);
					throw t;
				}
			},
			provider_throw: (e) => {
				throw new yn(e);
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
			throw Error(`gex-cgen: ${e} was published but cannot be loaded here`);
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
					n >= 0 && (t.gex_cgen_pmod_installed(n), t.gex_wasmdll_installed()),
					this.#Pn());
				continue;
			}
			let n = this.#Kt((e, n, i) => t.gex_cgen_provider_file(e, r, n, i), e),
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
				a.entries instanceof Uint8Array ? a.entries : new Uint8Array(a.entries),
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
			i = `fjit:${ht(r)}`,
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
		let i = z(`unitstall`),
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
					if (t < 1073741824 && !I.on && e.gex_ftab_install_len)
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
					(r.ftab.set(H(i), r.resolve), this.#tn.length && this.#in(i));
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
		At ??= new WebAssembly.Module(Et);
		let e = new WebAssembly.Table({ element: `anyfunc`, initial: 1 }),
			t = new WebAssembly.Instance(At, {
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
				? new WebAssembly.Instance(Lt(B(), typeof r.value == `bigint`), {
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
				: new WebAssembly.Instance(Mt(B(), typeof r.value == `bigint`), {
						e: { t: this.#Gt.ftab, sp: r },
					}).exports.entry;
		return (this.#Ln.set(0, a), a(e, t, n));
	}
	#Hn() {
		this.#Ln && this.#Ln.set(0, this.#Rn);
	}
	#Un() {
		return I.on ? void 0 : this.#In?.value || void 0;
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
							() => new WebAssembly.Global({ value: `i32`, mutable: !0 }, 0),
						)),
						a(`env`, r[2], this.#qn[r[2] === `__asyncify_state` ? 0 : 1]));
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
									: n.ftab.get(H(Number(r[5])))),
						i === void 0)
					)
						throw Error(
							`wasm32 module ${e}: ${r[1]}.${r[2]}: ${r[4]} of module ${r[3]} is not instantiated in this Worker`,
						);
					a(r[1], r[2], i);
					break;
				}
				case `L`: {
					let e = H(Number(r[3])),
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
			(this.#Qn.delete(o), t.exports.__gex_set_tls_base(s), n.dlTls.set(e, s));
			return;
		}
		i = Math.max(i, 8);
		let c = this.#$n.at(-1),
			l = (this.#nr + i - 1) & -i;
		if (!c || l + r > c[0] + c[1]) {
			let t = Math.max(16384, r + i),
				n = a.gex_wasmprog_tls_chunk(t) >>> 0;
			if (!n)
				throw Error(`wasm32 module ${e}: no memory for its thread-local block`);
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
			a = !I.on && i.includes(`__gex_snap_resume64`);
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
					(t.__gex_snap_ready(), new Uint8Array(this.#e.buffer, n, 264).set(r));
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
									t.value = typeof t.value == `bigint` ? BigInt(e) : e | 0;
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
			...(a ? { call_out: (e, t, n, r) => this.#ur(e >>> 0, t, n, r) } : {}),
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
				maxPages: en() ?? $t,
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
			throw Error(`snapshot: an unwind not the snapshot's reached the entry`);
		((this.#Tr = !1), s.asyncify_stop_unwind());
		let l = this.#Cr.value - 1,
			u = new DataView(this.#e.buffer),
			d = c + 32 + l * 40;
		if (
			(u.getUint32(c + 24, !0) === 0 && u.setUint32(c + 24, l + 1, !0),
			u.setUint32(d, e, !0),
			u.setUint32(d + 4, t >>> 0, !0),
			u.setUint32(d + 8, i >>> 0, !0),
			u.setUint32(d + 12, o >>> 0, !0),
			u.setBigUint64(d + 24, BigInt.asUintN(64, BigInt(a)), !0),
			u.setBigUint64(d + 32, BigInt.asUintN(64, BigInt(r)), !0),
			s.__gex_snap_fill(BigInt(c)),
			l > 0)
		)
			throw (e === 0 && this.#Cr.value--, It);
		(u.setUint32(c + 20, t >>> 0, !0),
			Pt && this.#pr(c),
			this.#or(c),
			new DataView(this.#e.buffer).setUint32(c + 24, 0, !0),
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
			a = e + 32 + t * 40,
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
				a = e + Ft + t * 128;
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
			let t = this.#Jt().ftab.get(H(s)),
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
				s = new DataView(this.#e.buffer).getUint32(a + 32 + o * 40 + 16, !0),
				c = this.#Gn();
			return (
				(c.value = typeof c.value == `bigint` ? BigInt(s) : s | 0),
				this.#$i(this.#ia(e, t, n, r, !1, () => this.#lr(a, o, e)))
			);
		}
		try {
			return this.#Zi(e, t, n, r);
		} catch (e) {
			if (e !== It) throw e;
			let t = this.#Cr.value;
			return (
				new DataView(this.#e.buffer).setUint32(
					a + 32 + t * 40 + 16,
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
			l = o + 32 + s * 40,
			u = o + Ft + s * 128;
		if (
			(c.getUint32(o + 24, !0) === 0 && c.setUint32(o + 24, s + 1, !0),
			c.setUint32(l, 2, !0),
			c.setUint32(l + 4, 0, !0),
			c.setInt32(u, e, !0),
			c.setInt32(u + 4, t, !0),
			c.setInt32(u + 8, n, !0),
			c.setBigUint64(u + 16, BigInt.asUintN(64, r), !0),
			c.setBigUint64(u + 24, BigInt.asUintN(64, i), !0),
			s > 0)
		)
			throw It;
		(this.#xr().exports.__gex_snap_fill(BigInt(o)),
			c.setUint32(o + 20, 0, !0),
			Pt && this.#pr(o),
			this.#or(o),
			new DataView(this.#e.buffer).setUint32(o + 24, 0, !0),
			a.asyncify_start_rewind(this.#mr(o)));
	}
	#fr(e, t, n, r) {
		let i = this.#gr,
			a = i.inst.exports,
			o = this.#wr,
			s = this.#Cr.value,
			c = this.#xn(),
			l = o + Ft + s * 128;
		if (i.state.value === 2)
			return (
				a.asyncify_stop_rewind(),
				a.__gexw_snap_globals(1, BigInt(l + 40)),
				(c.value = new DataView(this.#e.buffer).getBigUint64(l + 80, !0)),
				this.#$i(this.#ia(e, t, n, r, !1, () => this.#lr(o, s, e)))
			);
		o &&
			s < 16 &&
			(a.__gexw_snap_globals(0, BigInt(l + 40)),
			new DataView(this.#e.buffer).setBigUint64(l + 80, c.value, !0));
		try {
			return this.#Zi(e, t, n, r);
		} catch (e) {
			if (e !== It || !o || s >= 16) throw e;
			return ((this.#_r = !0), a.asyncify_start_unwind(this.#mr(o)), 0);
		}
	}
	#pr(e) {
		let t = new DataView(this.#e.buffer),
			n = t.getUint32(e + 24, !0),
			r = Array.from({ length: n }, (n, r) => t.getUint32(e + 32 + r * 40, !0));
		console.error(
			`[gex-snap] tid ${this.#Ka}: stopped, levels by route [${r.join(` `)}]`,
		);
	}
	#mr(e) {
		let t = new DataView(this.#e.buffer),
			n = e + Ft + 2048;
		return (
			t.getUint32(n + 4, !0) === 0 &&
				(t.setUint32(n, n + 8, !0), t.setUint32(n + 4, e + 245760, !0)),
			n
		);
	}
	#hr() {
		let e = this.#wr;
		if (!this.#gr || !e) return;
		let t = new DataView(this.#e.buffer);
		t.getUint32(e + 4, !0) > e + Ft &&
			t.getUint32(e, !0) < e + Ft &&
			t.setUint32(e + 4, e + Ft, !0);
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
			t <= 16 &&
			this.#ki.length === t &&
			(t === 1 || this.#vr) &&
			this.#Di.every((e) => e.ri === -1)
		)
			return 1;
		if (Pt && !this.#br) {
			this.#br = !0;
			let n = `?`;
			try {
				let e = new DataView(this.#e.buffer),
					t = Number(this.#t.exports.gex_snap_ctx()),
					r = e.getBigUint64(t + 32, !0);
				n = `0x${e.getBigUint64(t + 256, !0).toString(16)} rax 0x${e.getBigUint64(t, !0).toString(16)} ret 0x${e.getBigUint64(Number(r), !0).toString(16)}`;
			} catch {}
			console.error(
				`[gex-snap] tid ${this.#Ka}: not at a root (rec ${this.#wr}, root ${this.#Sr}, vfork ${this.#Er}, entry depth ${e}, call-outs ${t}${t > 16 ? `, past the record's 16 levels` : ``} [${this.#Di.map((e) => e.ri).join(` `)}], nest ${this.#ki.length}, pc ${n})`,
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
					if (!I.on) {
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
			syscall: I.on ? this.#Ii(o, a) : (n.gex_wasmprog_syscall ?? o),
			dl_size: this.#tr,
			dl_stale: () => {
				((this.#er = n.gex_wasmprog_dl_gen?.() ?? this.#er),
					n.gex_wasmprog_dl_seen?.(),
					this.#Mn());
			},
			asyncify: i,
			...this.#ar(i, I.on ? this.#Ii(o, a) : o, e, t),
			i386_bind: (e, t) => n.gex_libprov_i386_bind(rt(e), t >>> 0),
			fork_point: (e) => {
				let t = i(0, 0);
				if (t === 0) i(1, e);
				else if (t === 2) i(4, 0);
				else throw Error(`gex.fork_point in asyncify state ${t}`);
			},
			dlopen: (e, t, r) => {
				let i = n.gex_wasmprog_dlopen(rt(e), rt(t), r) >>> 0;
				if (!i) return 0;
				this.#Mn();
				let a = this.#Jt(),
					o = [];
				for (let e = 0, t; (t = n.gex_wasmprog_dl_new(e)) >= 0; e++) o.push(t);
				for (let e of o) a.dyl.get(e)?.exports.__wasm_call_ctors?.();
				return i | 0;
			},
			dlsym: (e, t) => n.gex_wasmprog_dlsym(e, rt(t)) | 0,
			door_publish: (e) => this.#Fr(e >>> 0),
			door_call: (e, t, n) => this.#Yr(V(e), t, n, !1),
			door_call_lp64: (e, t, n) => this.#Yr(V(e), t, n, !0),
			door_missing: () => ((this.#Ar && this.#Hr(this.#Ar)) || I.on ? 0 : 1),
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
				this.#Ce?.k_pipe_write?.(e, rt(t), n >>> 0) ?? -38,
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
		if (!t || I.on) return;
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
		if (!r || I.on || !this.#Hr(r)) return -1;
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
			((t = { door: e, base: r, len: i, end: r + i, u8: n.u8, i64: n.i64 }),
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
			this.#Qr(e + i).u8.set(r.u8.subarray(r.base + t, r.base + t + i), e),
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
			s = e.base + xn(e.module);
		for (let t of e.binds.split(`
`)) {
			if (!t) continue;
			let e = t.split(`	`);
			if (e[0] === `X`)
				(a.push([Number(e[1]), e[2]]), (s = Math.max(s, Number(e[1]) + 1)));
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
				BigInt(this.#Ce?.k_boot_secs?.(0) ?? 0) * 1000000000n + this.#ut(),
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
			Atomics.store(i, (c + 4) >> 2, 1), Atomics.notify(i, c >> 2), this.#Jr();
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
		return !i || I.on ? 1 : this.#ei(i, e, t, n, null, r);
	}
	#Xr = !!globalThis.GEX_DOOR_STATS;
	#Zr = null;
	#Qr(e) {
		let t = this.#Zr;
		if (!t || e > t.u8.length) {
			let e = this.#e.buffer;
			t = this.#Zr = st(e);
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
			(Atomics.compareExchange(b, S, 0, 1) !== 0 && !this.#ti(b, g, S, n, r))
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
				let r = o ? Number(c.dv.getBigUint64(n, !0)) : c.dv.getUint32(n, !0),
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
				C = a.dispatch(n, r, i / 100n + 116444736000000000n, o / 100n) >>> 0;
			}
			if (i) {
				let e = performance.now();
				((i.tPre += u - s), (i.tDisp += e - u), (i.T2 = e));
			}
			if (C === 4294967295) (i && i.fallbacks++, (C = 1));
			else if (C === 4294967294) C = 2;
			else {
				let e = _ + C;
				if (((c = this.#Qr(Math.max(t + 64, p + d))), !o && !((t | e) & 3))) {
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
		let ee = (g + 80) >> 2,
			te = b[ee] !== 0;
		return (
			te && (b[ee] = 0),
			Atomics.exchange(b, S, 0) === 2 && Atomics.notify(b, S),
			te && this.#Jr(),
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
		if (!i || I.on)
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
				(globalThis.GEX_DOOR_STATS > 1 ? globalThis.GEX_DOOR_STATS : 1e4) ||
			a.calls + a.fallbacks >= 5e4
		) {
			let e = c.getUint32(l + 96, !0) >> 2,
				r = [];
			if (e) for (let t = 0; t < 512; t++) s[e + t] && r.push([s[e + t], t]);
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
					: I.on
						? `single-thread build`
						: typeof this.#r.offerSpare == `function`
							? e < dt()
								? `few modules`
								: lt(this.#e?.buffer)
									? ``
									: `memory not shared`
							: `no offerSpare`;
		(z(`spare`) &&
			console.warn(
				`[spare] pid ${t.gex_my_pid?.() ?? `?`}: program ${n} with ${e} modules, ${r ? `no spare (${r})` : `offered`}`,
			),
			(this.#ai = n),
			!r &&
				((this.#fa ??= ft()),
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
		return I.on ? this.#Ii(r, n) : (t.gex_staged_syscall ?? r);
	}
	#ci = (e, t) => {
		(this.#t.exports.gex_syscall(e, BigInt.asIntN(64, BigInt(t) | (1n << 61n))),
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
		return I.on
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
					r.ret === _t &&
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
				for (let n = e.gex_elfprov_wanted(); n >= 0; n = e.gex_elfprov_wanted())
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
					let a = this.#wi(e.gex_elfprov_rebridge_need() >>> 0, `elfprov`),
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
							this.#r.loadFile?.(this.#Kt(e.gex_cgen_icall_path, t)) ?? null,
						r = n ? (n instanceof Uint8Array ? n : new Uint8Array(n)) : null,
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
						R(`unit`) && console.warn(`gex-pe: ${i}: held for its link group`),
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
			a = R(`placelat`)
				? [
						Number(i.gex_cgen_mapped_age_us?.(e, 0) ?? -1n),
						Number(i.gex_cgen_mapped_age_us?.(e, 1) ?? -1n),
						performance.now(),
					]
				: null,
			o = z(`unitstall`) ? performance.now() : -1,
			s = this.#r.loadUnit?.(t) ?? null,
			c = o >= 0 ? performance.now() : -1;
		(a &&
			a[0] >= 0 &&
			console.warn(
				`[placelat] ${n} ${(a[0] / 1e3).toFixed(1)} ms mapped, ${(a[1] / 1e3).toFixed(1)} ms wanted, load ${(performance.now() - a[2]).toFixed(1)} ms`,
			),
			R(`record`) &&
				console.warn(`[gex-record] unit ${t} ${s ? `hit` : `miss`} ${n}`),
			R(`record`) &&
				i.gex_cgen_base &&
				console.warn(
					`[gex-record] base ${t} 0x${BigInt.asUintN(64, BigInt(i.gex_cgen_base(e))).toString(16)}`,
				));
		let l = /\.exe$/i.test(n) ? this.cmdline : void 0;
		if (
			(l !== void 0 &&
				R(`record`) &&
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
				throw Error(`gex-cgen: --cgen: ${n} has no function-tier unit (${t})`);
			this.#kn(e);
			return;
		}
		if (this.#_i(e, t, n, s) === 1) {
			R(`unit`) &&
				console.error(
					`gex-pe: function tier for ${n}: placed by another thread`,
				);
			return;
		}
		(this.#kn(e),
			R(`unit`) &&
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
		e < 1073741824 && !I.on && i.gex_ftab_install_len
			? this.#z.has(`cgen:${t}`) ||
				(this.#gi.set(t, r), this.#r.prefetchUnit?.(t))
			: this.#qt(t, r);
		let a =
				r.entries instanceof Uint8Array ? r.entries : new Uint8Array(r.entries),
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
				if ((this.#t.exports.gex_callout_leave_ok?.(0), (a = this.#Un()), i)) {
					let e = i;
					i = null;
					try {
						I.on
							? await this.#na(e.f)(r, e.code, e.addr, e.kind)
							: e.f(r, e.code, e.addr, e.kind);
					} finally {
						e.spG.value = e.cur;
					}
					n = this.#ca(r);
				}
				return (
					this.#Xt(),
					I.on
						? ((this.#Se = `enter`), await this.#Mi(r, n), (this.#Se = `trap`))
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
					((this.#t.exports.__stack_pointer.value = nt(this.#Be())),
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
							e = new DataView(this.#e.buffer).getBigUint64(r + 352, !0);
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
							(e) => `, lr=0x${(e < 0n ? e + (1n << 64n) : e).toString(16)}`,
						),
						c = i(a.gex_exit_code, (e) => (e ? `, exit code ${e}` : ``)),
						l =
							i(a.gex_heap_used_kib, (e) =>
								e >= 0 ? `, ${(e / 1024) | 0} MiB of shim heap in use` : ``,
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
									a = new DataView(this.#e.buffer).getUint32(Zt() + i * 4, !0),
									o = this.#po(),
									s = a >>> 0,
									c = s >>> 24,
									l = s & 16777215,
									u = l + ((Number(r) & 4095) >> Wt),
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
								for (let e = 0, t = Qt(); e < t; e++) {
									let t = _.getUint32(Zt() + e * 4, !0) >>> 0;
									if (t === 0) continue;
									let n = t >>> 24,
										r = t & 16777215,
										i = o[n]?.length ?? 0;
									(n < o.length && r + Gt <= i) ||
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
				((this.#t.exports.__stack_pointer.value = nt(this.#Be())), this.#Wn(a));
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
								(this.endStdin(), await new Promise((e) => setTimeout(e, 1)));
						} else if (
							I.on
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
						r && (n = ` in ` + U(this.#Ye().subarray(e, e + r)));
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
											U(new Uint8Array(r.buffer, n, t)),
									);
								}
							} catch {}
						if (!s.gex_exited?.() && s.gex_last_open && s.gex_alloc)
							try {
								let e = s.gex_alloc(256) >>> 0,
									t = s.gex_last_open(e, 256) >>> 0,
									n = U(this.#Ye().subarray(e, e + t));
								(s.gex_free?.(e, 256),
									n && console.error(`[gex] the last path it opened: ${n}`));
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
				u = Math.min(Math.max(o, Math.min(s * 2, s + 1048576)), i);
			(this.#E++,
				(this.#D += u - r[a].length),
				(this.#k += u),
				u - r[a].length > 1e5 &&
					this.#C.push(
						`${t}:t${a}:${r[a].length}->${u}:need${e}:ni${o}:tn${n.gex_table_need ? n.gex_table_need(a) >>> 0 : -1}`,
					));
			try {
				Rt(r[a], u - r[a].length, l, a);
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
					(Rt(t[i], a - t[i].length, n, i),
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
		if (++this.#ge < zt()) return;
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
								? L.yieldNow(this.#be)
								: L.maybeYield(this.#be)
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
				this.#ra() ? 0 : L.maybeYield(this.#be)
			),
		));
	}
	#zi = null;
	#Bi() {
		if (this.#zi) return this.#zi;
		let e = new Uint8Array([
				0, 97, 115, 109, 1, 0, 0, 0, 1, 10, 2, 96, 1, 127, 0, 96, 1, 127, 1,
				127, 2, 9, 1, 1, 119, 3, 104, 105, 116, 0, 1, 3, 2, 1, 0, 7, 5, 1, 1,
				99, 0, 1, 10, 13, 1, 11, 0, 32, 0, 16, 0, 4, 64, 15, 11, 0, 11,
			]),
			t = new WebAssembly.Instance(new WebAssembly.Module(e), {
				w: { hit: (e) => this.#Vi(e >>> 0) },
			});
		return ((this.#zi = t.exports.c), this.#zi);
	}
	#Vi(e) {
		let t = new DataView(this.#e.buffer),
			n = t.getBigUint64(e + 352, !0),
			r = t.getBigUint64(e + this.#sa(), !0),
			i = -1;
		for (let e = this.#Di.length - 1; e >= 0; e--) {
			let t = this.#Di[e];
			if (t.ret === n && r >= t.spWant && r <= t.spWant + t.span) {
				i = e;
				break;
			}
		}
		if ((t.setBigUint64(e + 256, n, !0), i >= 0))
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
			c = this.#Di.find((e) => e.w && e.w.table === o && e.w.index === s)?.w;
		return ((this.#Oi = { kind: `bypass`, f: c?.old ?? null }), 0);
	}
	#Hi(e) {
		return e === G.length ? this.#n.exports.blocks : this.#po()[e];
	}
	#Ui = new WeakMap();
	#Wi(e, t) {
		let n = this.#Ui.get(e);
		n || this.#Ui.set(e, (n = new Map()));
		let r = n.get(t);
		return (
			r ||
				((Tt ??= new WebAssembly.Module(Ct)),
				(this.#Gi ??= (e) => this.#Vi(e >>> 0)),
				(r = new WebAssembly.Instance(Tt, {
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
		return n ? (this.#V && e === G.length ? t >>> 8 : t) < n.length : !1;
	}
	#qi(e, t) {
		let n = this.#Hi(e);
		if (!this.#V || e !== G.length) return n.get(t);
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
		if (!this.#V || e !== G.length) {
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
						n !== e && n.w && n.w.table === t.table && n.w.index === t.index,
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
					e === `enter` ? await this.#Mi(r, i) : await this.#na(r)(i, a, o, s);
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
		((f.span = p >= 0n ? p : gt),
			(f.unwound = p >= 0n ? p : f.ret === _t ? 512n : gt),
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
						((h = null), o.gex_callout_leave_ok?.(d + 1), yield [`call`, t, e]);
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
						: (console.error(`[gex] guest code returned out of a call-out`), 0);
				} catch (t) {
					if (
						((o.__stack_pointer.value = s),
						this.#Wn(c),
						this.#Cr && (this.#Cr.value = u),
						t === It)
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
							throw Error(`gex: a watched dispatch entry with nothing to run`);
						h = n.f;
						continue;
					}
					if (!t?.gexHandoff && !o.gex_handoff()) {
						if (/table index is out of bounds/.test(t.message)) {
							let t = new DataView(this.#e.buffer).getBigUint64(
								Number(e) + 352,
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
						f.ret === _t &&
						new DataView(this.#e.buffer).getBigUint64(e + this.#sa(), !0) >
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
								console.error(`[gex] starting a process: ${e.message ?? e}`),
							),
							this.#Tt());
						let r = this.#la(e);
						if (r && o.gex_fault_nesting?.() > 0 && !kt())
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
											(e, t, n, i) => this.#cr(r.f, r.idx, e, t, n, i, r.rsp),
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
					let y = new DataView(this.#e.buffer).getBigUint64(e + this.#sa(), !0);
					if ((m === _t || m === vt) && o.gex_callout_stray?.(0)) {
						let t =
							m === _t &&
							f.ret === _t &&
							y >= f.spWant &&
							y <= f.spWant + f.unwound;
						return (
							t && o.gex_callout_stray(1),
							new DataView(this.#e.buffer).setBigUint64(
								e + 256,
								t ? m : vt,
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
							new DataView(this.#e.buffer).setBigUint64(e + 256, m, !0),
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
					`[callout] end depth ${l}: pc ${t.getBigUint64(e + 256, !0).toString(16)} sp ${t.getBigUint64(e + this.#sa(), !0).toString(16)} want ${f.spWant.toString(16)}`,
				);
			}
		}
	}
	#aa = 0;
	#oa = -1;
	#sa() {
		return (
			this.#oa < 0 && (this.#oa = this.#t.exports.gex_ctx_sp?.() ?? 32),
			this.#oa
		);
	}
	#ca(e) {
		return BigInt.asUintN(
			64,
			new DataView(this.#e.buffer).getBigUint64(e + 256, !0),
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
		let s = this.#Jt().ftab.get(H(r));
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
			: ht(t);
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
		if (!this.#fa || !t || !n.gex_jit_note_external || !n.gex_jit_keeps?.())
			return;
		let r = mt(this.#fa, e);
		if (r < 0) return;
		let i = globalThis.GEX_REGISTRY_TRACE || {}.GEX_REGISTRY_TRACE,
			a = i ? 20 : 26;
		if (Math.floor((r + e.length) / 2 ** a) !== Math.floor(r / 2 ** a)) {
			let t = `[gex] module store at ${((r + e.length) / 1048576).toFixed(0)} MiB; registry bytes in the shim heap: ${n.gex_registry_mib?.(0) ?? `?`} MiB`,
				a = i ? globalThis.process?.getBuiltinModule?.(`fs`) : null;
			a ? a.writeSync(2, `${t}\n`) : Ht(t);
		}
		let [, o, s] = t.split(`:`);
		n.gex_jit_note_external(BigInt(r), e.length, Number(o) | 0, Number(s) | 0);
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
		let n = gn(e);
		if (n < 0) return `u:${ht(e)}`;
		let r = e.slice(n, n + 4);
		e.fill(0, n, n + 4);
		let i = ht(e);
		return (e.set(r, n), `u:${i}`);
	}
	#xa(e) {
		let t = this.#t.exports.gex_jit_pending_key,
			n = e.length,
			r = `${n}:${t(0) >>> 0}:${t(1) >>> 0}`,
			i = `u:${n}:${t(2) >>> 0}:${t(3) >>> 0}`;
		if (globalThis.GEX_CHECK_INSTALL || {}.GEX_CHECK_INSTALL) {
			let t = ht(e),
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
			a && r && (this.#z.set(r, a), this.#to.delete(r), this.#Xa(e, r, a));
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
						Zt() + Number(n >> 12n) * 4,
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
			if (e instanceof Uint8Array && t instanceof WebAssembly.CompileError) {
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
						`${{}.GEX_DUMP_WASM}/u-${this.#t.exports.gex_my_pid?.() ?? 0}-${ht(e).replaceAll(`:`, `-`)}.wasm`,
						e,
					);
			} catch {}
		let m = s ?? _n(e instanceof Uint8Array ? e : p);
		this.#ve.push({
			mod: p,
			need: t,
			meta: e instanceof Uint8Array ? vn(e) : void 0,
			dense: m ?? void 0,
		});
		let h = { ...this.#a };
		for (let e = 0; e < d.length; e++) h[G[e]] = d[e];
		if (
			((h.dense_base = 0),
			this.#n?.exports?.blocks &&
				((h.blocks = this.#n.exports.blocks), this.#do(), m))
		) {
			let t = new DataView(m.buffer, m.byteOffset, m.byteLength),
				n = t.getUint32(0, !0);
			if (globalThis.GEX_DENSE_DEBUG) {
				let r = e instanceof Uint8Array ? _n(p) : null,
					a = r ? new DataView(r.buffer, r.byteOffset).getUint32(0, !0) : n;
				console.error(
					`[dense] pid ${c.gex_my_pid?.() ?? `?`} ${i} base=${n} n=${t.getUint32(4, !0) & 2147483647} blocks=${h.blocks.length} size=${c.gex_dense_size()}` +
						(a === n ? `` : ` (a module compiled elsewhere, at base ${a})`),
				);
			}
			if (n === 0)
				throw Error(
					`gex: a translation with unnumbered dense blocks reached the install (${i})`,
				);
			h.dense_base = n;
		}
		l.push(performance.now());
		let g = r ?? (e instanceof Uint8Array ? vn(e) : null);
		l.push(performance.now());
		let _ = hn(e);
		l.push(performance.now());
		let v = _.length ? _ : g ? mn(g) : [];
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
					((a += i - d[e].length), Rt(d[e], i - d[e].length, r, e));
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
					`[fill] module ${this.#R}: gexfill ${typeof y.exports[Bt]}, exports ${Object.keys(y.exports).slice(0, 4).join(`,`)}`,
				),
			typeof y.exports[W] == `function`)
		)
			(this.#W.unshift(y), c.gex_fill_possible?.(1));
		else if (typeof y.exports[qt] == `function`) y.exports[qt]();
		else if (typeof y.exports[Bt] == `function`)
			for (let e = 0; y.exports[Bt](e); e++);
		return (l.push(performance.now()), (this.#Ba = l), y);
	}
	#Ma(e) {
		typeof e?.exports?.[W] == `function` &&
			(this.#W.unshift(e), this.#t.exports.gex_fill_possible?.(1));
	}
	#Na(e, t) {
		this.#T(`pre-pub`);
		let n = this.#t.exports;
		if (!e.meta || !e.meta.length || !n.gex_publish_closure_module) return;
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
		return r === 0 ? 0 : (this.#Fa(n, r + Gt), r >>> 0);
	}
	#Fa(e, t) {
		let n = this.#t.exports,
			r = this.#po();
		if (e < 0 || e >= r.length || r[e].length >= t || this.#ro(e)) return;
		let i = (n.gex_slots_per_table?.() ?? 0) >>> 0 || 2 ** 53 - 1,
			a = Gt * 16,
			o = Math.min(Math.ceil(t / a) * a, i),
			s = r[0].get(0),
			c = o - r[e].length;
		if (c <= 0) return;
		let l = performance.now();
		(Rt(r[e], c, s, e),
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
				let n = l + ((s & 4095) >>> Wt);
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
						f = o?.exports?.[W];
					if (typeof f == `function`) {
						let t = ((s & 4095) >>> Wt) & -32,
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
		let a = t + ((n & 4095) >>> Wt);
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
							? typeof r.instObj.exports[W] == `function`
								? `reached the fill`
								: `no fill export`
							: `module not instantiated`
						: `no lazy entry`;
					console.error(`[closure] fill page ${t} owner ${o}: ${n}`);
				}
				if (
					!r ||
					(r.published || ((r.published = !0), this.#Na(r, o)), !r.instObj)
				)
					continue;
				if (typeof r.instObj.exports[W] != `function`) {
					i = !0;
					continue;
				}
				this.#_ ||
					((this.#_ = !0),
					r.instObj.exports[W].length < 3 &&
						this.#t.exports.gex_set_fill_width?.(Gt));
				let a = performance.now(),
					s = this.#Pa(t),
					c = performance.now();
				this.#h += c - a;
				let l = this.#Ia();
				if (e.askState.size < 4096) {
					let i = n.gex_page_table ? n.gex_page_table(BigInt(t >>> 0)) : -1,
						a = this.#po();
					e.askState.set(`${t}:${l}`, {
						at: s,
						len: i >= 0 && i < a.length ? a[i].length : -1,
						published: !!r.published,
						inst: r.instObj,
					});
				}
				let u = s > 0 && r.instObj.exports[W](t, s, l);
				if (((this.#g += performance.now() - c), e.watchSlot && s > 0)) {
					let n = Number(this.#t.exports.gex_fill_pc?.() ?? 0n);
					if (n && e.#Ke < 12) {
						e.#Ke++;
						let r = s + ((n & 4095) >>> Wt),
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
								`[closure] pc ${n.toString(16)} page ${t} slot ${r} (base ${s} + ${(n & 4095) >>> Wt}) t=${i}: ${o}`,
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
			if (e.exports[W](t, a, this.#Ia()) && this.#La(t, a))
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
		if (i && typeof i.exports[W] != `function`) return !0;
		let a = this.#Pa(t);
		if (i && a > 0 && i.exports[W](t, a, this.#Ia()) && this.#La(t, a))
			return (this.#J++, !0);
		if (t * 4096 >= 77594624) {
			for (let e of this.#W)
				if (a > 0 && e.exports[W](t, a, this.#Ia()) && this.#La(t, a))
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
			e && c && (this.#z.set(c, e), this.#to.delete(c), this.#Xa(n, c, e));
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
		(this.#B && r.gex_registry_dense_n && r.gex_registry_dense_n(e) >>> 0) ||
			this.#Za(t, n, this.#ma(e).len);
	}
	#Za(e, t, n) {
		if (!(n >= 262144) && !/^(wasm|cgen|cold):/.test(String(e))) {
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
				for (let e = t, i = Math.min(t + a, n.length); e < i; e++) n.set(e, r);
		}
		let a = new Set();
		if (
			((this.#ve = this.#ve.filter((e) => {
				let t = e.dense;
				if (!t || t.byteLength < 4) return !0;
				let n = new DataView(t.buffer, t.byteOffset, t.byteLength).getUint32(
					0,
					!0,
				);
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
		return this.#B && e >= 4;
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
		return new WebAssembly.Instance(new WebAssembly.Module(St), {
			w: {
				count: (e) => {
					let i = new DataView(this.#e.buffer).getBigUint64(
						(e >>> 0) + 352,
						!0,
					);
					t.has(i) ||
						(t.add(i),
						n.push(i),
						(t.size <= 8 || n.length >= 64 || performance.now() - r >= 1e3) &&
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
				((wt ??= new WebAssembly.Module(xt)),
				(t = new WebAssembly.Instance(wt, { w: { f: e } }).exports.e),
				this.#H.set(e, t),
				this.#so.add(t)),
			t
		);
	}
	#lo(e, t, n, r) {
		for (let i = 0; i + 1 < n.length; i += 2)
			n[i] === G.length ? this.#uo(t, n[i + 1], r) : e[n[i]].set(n[i + 1], r);
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
							0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 7, 1, 1,
							119, 1, 102, 0, 0, 3, 2, 1, 0, 7, 5, 1, 1, 98, 0, 1, 10, 8, 1, 6,
							0, 32, 0, 16, 0, 11,
						]),
					),
					a = (e) =>
						new WebAssembly.Instance(i, {
							w: { f: (t) => r.push(`${e}:${t}`) },
						}).exports.b,
					o = a(`one`),
					s = a(`two`),
					c = G.length,
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
			: (Rt(e, t + Math.max(t >>> 3, 4096) - n, e.get(0), `blocks`),
				this.#fo(`blocks grew`),
				!0);
	}
	#fo(e) {
		if (!R(`tables`)) return;
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
					i(`ftab`, this.#Gt.ftab, this.#Gt.resolve, r.gex_ftab_size?.()));
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
		for (let t of G) {
			let n = this.#n.exports[t];
			if (!n) break;
			e.push(n);
		}
		return e;
	}
};
function xn(e) {
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
var Sn = c({
	GL_RING_BYTES: () => Kn,
	GlProxy: () => Xn,
	failGlChannel: () => Dn,
	makeGlChannel: () => Tn,
	serveGl: () => En,
	shownInReply: () => wn,
});
function Cn(e) {
	return zn + Bn * ((e >>> 0) % Vn);
}
function wn(e, t) {
	let n = new Uint32Array(e.buffer, e.byteOffset + t, Gn / 4),
		r = n[Yn];
	if (r < 4) return 0;
	let i = t + Gn + n[qn] + r;
	return new DataView(e.buffer, e.byteOffset).getUint32(i - 4, !0);
}
function Tn() {
	return {
		control: new SharedArrayBuffer(1600),
		data: new SharedArrayBuffer(Kn),
	};
}
function En(e, t) {
	let n = new Int32Array(t.control);
	Atomics.store(n, jn, 1);
	let r = { buffer: t.data },
		i = new Uint8Array(t.data),
		a = !0,
		o = null,
		s = function () {
			if (o) return o;
			if (Atomics.load(n, q) !== Un) return;
			if (e.statsOn) {
				n[Nn] = 1;
				let r = new Float64Array(t.control, Fn, 1)[0];
				e.noteBridge(
					r ? performance.timeOrigin + performance.now() - r : 0,
					Atomics.exchange(n, Pn, 0),
					Atomics.exchange(n, In, 0),
					Atomics.exchange(n, Ln, 0),
					Atomics.exchange(n, Rn, 0),
				);
			}
			let a = Atomics.load(n, An) === 1,
				s = Atomics.load(n, kn) >>> 0,
				c = (e) => {
					if (!a) {
						((n[On] = e), Atomics.store(n, q, Wn), Atomics.notify(n, q));
						return;
					}
					let t = Cn(s);
					((n[t] = s + 1),
						(n[t + 1] = e < 0 ? 0 : wn(i, 0)),
						(n[t + 2] = +(e < 0)),
						(n[An] = 0),
						Atomics.store(n, q, Hn),
						Atomics.notify(n, q),
						Atomics.store(n, J, 0),
						Atomics.notify(n, J));
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
			((a = !1), Atomics.notify(n, q));
		}),
		typeof Atomics.waitAsync == `function` &&
			((t.direct = !0),
			(async () => {
				for (; a; ) {
					let e = Atomics.load(n, q);
					if (e === Un) {
						await s();
						continue;
					}
					let t = Atomics.waitAsync(n, q, e, 1e3);
					t.async && (await t.value);
				}
			})()),
		s
	);
}
function Dn(e) {
	if (!e?.control) return;
	let t = new Int32Array(e.control);
	(Atomics.store(t, jn, -1), Atomics.notify(t, q), Atomics.notify(t, J));
}
var q,
	On,
	kn,
	J,
	An,
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
	Zn = o(() => {
		((q = 0),
			(On = 1),
			(kn = 2),
			(J = 3),
			(An = 4),
			(jn = 5),
			(Mn = 6e5),
			(Nn = 6),
			(Pn = 7),
			(Fn = 32),
			(In = 10),
			(Ln = 11),
			(Rn = 12),
			(zn = 16),
			(Bn = 3),
			(Vn = 128),
			(Hn = 0),
			(Un = 1),
			(Wn = 2),
			(Gn = 32),
			(Kn = 67108896),
			(qn = 1),
			(Jn = 2),
			(Yn = 4),
			(Xn = class {
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
					if (this.#e[Nn] !== 1) return this.#s(e, t, n, r, i);
					let a = performance.now();
					((this.#i = 0), (this.#a = 0));
					try {
						return this.#s(e, t, n, r, i);
					} finally {
						let e = this.#e;
						(Atomics.add(e, Pn, Math.round(this.#i * 1e3)),
							Atomics.add(e, In, Math.round(this.#a * 1e3)),
							Atomics.add(e, Ln, Math.round((performance.now() - a) * 1e3)),
							Atomics.add(e, Rn, 1));
					}
				}
				#i = 0;
				#a = 0;
				#o(e, t, n) {
					if (this.#e[Nn] !== 1) {
						this.#t.set(e.subarray(t, t + Gn + n), 0);
						return;
					}
					let r = performance.now();
					(this.#t.set(e.subarray(t, t + Gn + n), 0),
						(this.#a += performance.now() - r),
						(new Float64Array(this.#e.buffer, Fn, 1)[0] =
							performance.timeOrigin + performance.now()));
				}
				#s(e, t, n, r, i) {
					let a = new Uint8Array(e.buffer),
						o = new Uint32Array(e.buffer, t, Gn / 4),
						s = o[qn],
						c = o[Jn];
					if (Gn + c > this.#t.length) return -1;
					let l = this.#e,
						u = n || 1,
						d = Date.now() + 3e4,
						f = 0;
					for (;;) {
						let e = Atomics.compareExchange(l, J, 0, u);
						if (e === 0) break;
						if (
							((f ||= performance.now()),
							Atomics.wait(l, J, e, 50),
							Atomics.load(l, jn) === 0 && (d = Date.now() + 3e4),
							Date.now() > d)
						) {
							(console.warn(`[gl] taking the ring from client ${e}`),
								Atomics.store(l, J, u));
							break;
						}
					}
					f && (i?.(performance.now() - f), (this.#i += performance.now() - f));
					let p = Cn(n),
						m = 0;
					if (l[p] === (((n >>> 0) + 1) | 0)) {
						if (l[p + 2])
							return (
								(l[p] = 0),
								Atomics.store(l, J, 0),
								Atomics.notify(l, J),
								-1
							);
						m = l[p + 1] >>> 0;
					}
					if (r)
						return (
							this.#o(a, t, c),
							Atomics.store(l, kn, n >>> 0),
							Atomics.store(l, An, 1),
							Atomics.store(l, q, Un),
							Atomics.notify(l, q),
							this.#r(),
							(o[Jn] = 0),
							m & 2147483647
						);
					try {
						return this.#c(a, t, s, c, n);
					} finally {
						(Atomics.store(l, J, 0), Atomics.notify(l, J));
					}
				}
				#c(e, t, n, r, i) {
					this.#o(e, t, r);
					let a = this.#e;
					(Atomics.store(a, kn, i >>> 0),
						Atomics.store(a, q, Un),
						Atomics.notify(a, q),
						this.#r());
					let o = Date.now();
					for (; Atomics.load(a, q) === Un; ) {
						if (Atomics.load(a, jn) < 0) return (Atomics.store(a, q, Hn), -1);
						if (Atomics.wait(a, q, Un, 3e4) === `timed-out`) {
							if (Atomics.load(a, jn) !== 0)
								throw Error(`the GL device did not answer in thirty seconds`);
							if (Date.now() - o > Mn)
								throw Error(`the GL device did not start in ten minutes`);
						}
					}
					(Atomics.store(a, q, Hn),
						Atomics.notify(a, q),
						e.set(this.#t.subarray(0, Gn), t));
					let s = this.#n[Yn];
					if (s > 0) {
						let r = Gn + n;
						e.set(this.#t.subarray(r, r + s), t + r);
					}
					return a[On];
				}
			}));
	}),
	Qn = c({
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
		F_POINTER_LOCK: () => kr,
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
		WlProxy: () => mi,
		ackBlock: () => gr,
		clipboardSerial: () => rr,
		dragState: () => yr,
		getClipboard: () => nr,
		makeWlChannel: () => ar,
		mergeDamage: () => Tr,
		notifyQueue: () => wr,
		outputSize: () => cr,
		readScene: () => lr,
		recordAddr: () => Or,
		releaseToken: () => dr,
		sceneMark: () => mr,
		sceneMarks: () => fr,
		sceneStill: () => hr,
		sendEvent: () => xr,
		setClipboard: () => ir,
		setDragData: () => vr,
		setKernelMemory: () => _r,
		setOutputSize: () => or,
		startWakeRelay: () => Cr,
		takesPointer: () => ur,
		waitDrag: () => br,
		waitPublish: () => sr,
	});
function $n(e) {
	for (; Atomics.compareExchange(e, 110921, 0, 1) !== 0; )
		typeof Atomics.wait == `function` &&
			!globalThis.document &&
			Atomics.wait(e, 110921, 1, 1);
}
function er(e) {
	(Atomics.store(e, 110921, 0), Atomics.notify(e, 110921));
}
function tr(e, t, n) {
	let r = Math.min(t.length, $r);
	($n(e),
		new Uint8Array(e.buffer, 443700, r).set(t.subarray(0, r)),
		Atomics.store(e, 110924, r),
		Atomics.store(e, 110923, n));
	let i = (Atomics.add(e, 110922, 1) + 1) >>> 0;
	return (er(e), i);
}
function nr(e) {
	let t = new Int32Array(e.arena);
	$n(t);
	let n = Atomics.load(t, 110922) >>> 0,
		r = Atomics.load(t, 110923) ? `guest` : `page`,
		i = Math.min(Atomics.load(t, 110924) >>> 0, $r),
		a = new Uint8Array(i);
	return (
		a.set(new Uint8Array(t.buffer, 443700, i)),
		er(t),
		{ serial: n, from: r, text: new TextDecoder().decode(a) }
	);
}
function rr(e) {
	return Atomics.load(new Int32Array(e.arena), 110922) >>> 0;
}
function ir(e, t) {
	let n = new Int32Array(e.arena),
		r = tr(n, new TextEncoder().encode(String(t)), 0);
	for (let t = 0; t < Er; t++) Atomics.load(n, X(t) + Y) && Sr(e, n, t);
	return r;
}
function ar() {
	return typeof SharedArrayBuffer == `function`
		? { arena: new SharedArrayBuffer(ei * 4), pixels: !0 }
		: { arena: new ArrayBuffer(ei * 4) };
}
function or(e, t, n, r) {
	let i = new Int32Array(e.arena),
		a = [Atomics.load(i, Ar), Atomics.load(i, jr)];
	if (
		(Atomics.store(i, Ar, t | 0),
		Atomics.store(i, jr, n | 0),
		r && Atomics.store(i, Nr, Math.max(1, r | 0)),
		!(!a[0] || (a[0] === (t | 0) && a[1] === (n | 0))))
	)
		for (let t = 0; t < Er; t++) Atomics.load(i, X(t) + Y) && Sr(e, i, t);
}
async function sr(e, t) {
	if (
		typeof Atomics.waitAsync != `function` ||
		!(e.arena instanceof SharedArrayBuffer)
	)
		return null;
	let n = new Int32Array(e.arena),
		r = t ?? Atomics.load(n, Mr),
		i = Atomics.waitAsync(n, Mr, r);
	return (i.async && (await i.value), Atomics.load(n, Mr));
}
function cr(e) {
	let t = new Int32Array(e.arena);
	return {
		w: Atomics.load(t, Ar) || 640,
		h: Atomics.load(t, jr) || 480,
		scale: Atomics.load(t, Nr) || 1,
	};
}
function lr(e, { onlyChanged: t = !1 } = {}) {
	let n = new Int32Array(e.arena),
		r = !!e.pixels,
		i = [],
		a = [],
		o = Date.now();
	for (let e = 0; e < Er; e++) {
		let s = X(e),
			c = Atomics.load(n, s + Y);
		if (!c) continue;
		let l = Atomics.load(n, s + Vr),
			u = Atomics.load(n, s + Hr),
			d = Atomics.load(n, s + zr);
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
		let f = Math.min(Atomics.load(n, s + Br), 64);
		for (let t = 0; t < f; t++) {
			let a = s + Kr + t * 38,
				o = di;
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
					addr: r ? n[a + 8] >>> 0 : Or(n, a),
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
					title: l ? ui.decode(o.subarray(0, l)) : ``,
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
function ur(e) {
	let t = e.input;
	return !t || (t.w > 0 && t.h > 0);
}
function dr(e, t) {
	let n = new Int32Array(e.arena),
		r = 0;
	for (let e = 0; e < Er; e++) {
		let i = X(e);
		!t ||
			Atomics.load(n, i + Y) !== t ||
			(Atomics.store(n, i + Br, 0),
			Atomics.compareExchange(n, i + Y, t, 0) === t && r++);
	}
	return r;
}
function fr() {
	return new Int32Array(64);
}
function pr(e) {
	let t = fi.get(e.arena);
	return (t || fi.set(e.arena, (t = new Int32Array(e.arena))), t);
}
function mr(e, t) {
	e.fill(0);
	for (let n of t) ((e[2 * n.block] = n.token), (e[2 * n.block + 1] = n.gen));
}
function hr(e, t) {
	let n = pr(e);
	for (let e = 0; e < Er; e++) {
		let r = X(e),
			i = Atomics.load(n, r + Y);
		if (i !== t[2 * e]) return !1;
		if (!i) continue;
		let a = Atomics.load(n, r + Vr);
		if (a !== t[2 * e + 1] || a !== Atomics.load(n, r + Hr)) return !1;
	}
	return !0;
}
function gr(e, t, n) {
	let r = new Int32Array(e.arena);
	Atomics.store(r, X(t) + Hr, n);
}
function _r(e, t) {
	t && !e.kernelMemory && (e.kernelMemory = t);
}
function vr(e, t) {
	let n = new TextEncoder().encode(t);
	if (n.length > Qr) return !1;
	let r = new Int32Array(e.arena);
	return (
		new Uint8Array(e.arena, 378148, Qr).set(n),
		Atomics.store(r, ti, n.length),
		!0
	);
}
function yr(e, t) {
	let n = Atomics.load(new Int32Array(e.arena), X(t) + Gr) >>> 0;
	return { serial: n >>> 4, flags: n & 15 };
}
async function br(e, t, n, r, i) {
	let a = new Int32Array(e.arena),
		o = X(t) + Gr,
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
function xr(e, t, n, r = 0, i = 0, a = 0, o = 0, s = 0, c = 0) {
	let l = new Int32Array(e.arena),
		u = ni(t),
		d = Atomics.load(l, u + Jr),
		f = u + Xr + (d % Dr) * 8;
	((l[f] = n | 0),
		(l[f + 1] = r | 0),
		(l[f + 2] = i | 0),
		(l[f + 3] = a | 0),
		(l[f + 4] = o | 0),
		(l[f + 5] = s | 0),
		(l[f + 6] = c | 0),
		(l[f + 7] = 0),
		Atomics.store(l, u + Jr, d + 1),
		globalThis.__gexEvLog?.push([n, r, i, performance.now()]),
		console.timeStamp(`gex:ev ${n} b${t}`),
		Sr(e, l, t));
}
function Sr(e, t, n) {
	let r = Atomics.load(t, X(n) + Ur),
		i = Atomics.load(t, X(n) + Wr),
		a = e.kernelMemory;
	r && i && a
		? (wr(new Int32Array(a.buffer), r >>> 0, i >>> 0), I.on && L.checkSlots())
		: r &&
			i &&
			e.arena instanceof SharedArrayBuffer &&
			(Atomics.or(t, Ir, 1 << n), Atomics.add(t, Fr, 1), Atomics.notify(t, Fr));
}
function Cr(e, t) {
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
			let e = Atomics.load(n, Fr),
				r = Atomics.exchange(n, Ir, 0) >>> 0;
			if (r) {
				let e = new Int32Array(t.buffer);
				for (; r; ) {
					let t = 31 - Math.clz32(r & -r);
					r &= r - 1;
					let i = Atomics.load(n, X(t) + Ur),
						a = Atomics.load(n, X(t) + Wr);
					i && a && wr(e, i >>> 0, a >>> 0);
				}
			}
			let i = Atomics.waitAsync(n, Fr, e);
			i.async && (await i.value);
		}
	})();
}
function wr(e, t, n) {
	for (let r = 0; r < pi; r++) {
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
function Tr(e, t) {
	if (e.w <= 0 || e.h <= 0 || t.w <= 0 || t.h <= 0)
		return { x: 0, y: 0, w: 0, h: 0 };
	let n = Math.min(e.x, t.x),
		r = Math.min(e.y, t.y),
		i = Math.max(e.x + e.w, t.x + t.w),
		a = Math.max(e.y + e.h, t.y + t.h);
	return { x: n, y: r, w: i - n, h: a - r };
}
var Er,
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
	Y,
	zr,
	Br,
	Vr,
	Hr,
	Ur,
	Wr,
	Gr,
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
	X,
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
	hi = o(() => {
		(Ke(),
			(Er = 32),
			(Dr = 64),
			(Or = (e, t) => (e[t + 8] >>> 0) + (e[t + 37] >>> 0) * 4294967296),
			(kr = 1 << 31),
			(Ar = 0),
			(jr = 1),
			(Mr = 2),
			(Nr = 3),
			(Pr = 4),
			(Fr = 5),
			(Ir = 6),
			(Lr = 7),
			(Rr = 8),
			(Y = 0),
			(zr = 1),
			(Br = 2),
			(Vr = 3),
			(Hr = 4),
			(Ur = 5),
			(Wr = 6),
			(Gr = 7),
			(Kr = 8),
			(qr = 2440),
			(Jr = 0),
			(Yr = 1),
			(Xr = 2),
			(Zr = 514),
			(Qr = 65536),
			($r = 1 << 20),
			(ei = 373069),
			(ti = 94536),
			(X = (e) => Rr + e * qr),
			(ni = (e) => 78088 + e * Zr),
			(ri = 0),
			(ii = 1),
			(ai = 4),
			(oi = 5),
			(si = 2048),
			(ci = 64 << 20),
			(li = 1 << 20),
			(ui = new TextDecoder()),
			(di = new Uint8Array(32)),
			(fi = new WeakMap()),
			(pi = 64),
			(mi = class {
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
					let t = Math.ceil(e / li) * li;
					if (t > ci) return !1;
					let n = this.#p;
					this.#f = new SharedArrayBuffer(t);
					let r = (Atomics.add(this.#e, Lr, 1) + 1) >>> 0;
					return (
						(r ||= (Atomics.add(this.#e, Lr, 1) + 1) >>> 0),
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
					return Atomics.compareExchange(this.#e, Pr, 0, 1) === 0;
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
								let i = ai + r * oi;
								e[i + 2] &&
									e[i] === n[t + 0] &&
									e[i + 1] === n[t + 1] &&
									(s = i);
							}
							(s < 0 || e[s + 3] < o) && (r += o);
						}
						let a = e ? Math.max(e[ii], si) : si;
						if (
							!e ||
							(a + r > this.#f.byteLength && si + i > this.#f.byteLength)
						) {
							let e = si + i,
								r = Math.max(
									e + (e >> 2),
									this.#f ? this.#f.byteLength * 2 : 0,
								);
							if (!this.#h(Math.min(r, ci)) && !this.#f) {
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
								let r = ai + n * oi;
								if (i[r + 2] && i[r] === e && i[r + 1] === t) return r;
							}
							return -1;
						};
					for (; Atomics.compareExchange(i, ri, 0, 1) !== 0; );
					try {
						i[ii] < si && (i[ii] = si);
						let o = 0;
						for (let e = 0; e < t; e++) {
							let t = this.#s[e],
								r = a(n[t + 0], n[t + 1]),
								s = n[t + 6] * n[t + 7] * 4;
							(r < 0 || i[r + 3] < s) && (o += (s + 255) & -256);
						}
						if (i[ii] + o > r.byteLength) {
							for (let e = 0; e < 320; e++) i[ai + e] = 0;
							i[ii] = si;
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
								g = Or(n, t),
								_ = n[t + 9],
								v = a(n[t + 0], n[t + 1]),
								y = !c;
							if (v < 0 || i[v + 3] < h) {
								if (v < 0) {
									for (let e = 0; e < 64 && v < 0; e++)
										i[ai + e * oi + 2] || (v = ai + e * oi);
									v < 0 && (v = ai);
								}
								let e = i[ii];
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
									(i[ii] = e + ((h + 255) & -256)),
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
						Atomics.store(i, ri, 0);
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
					for (let e = 0; e < Er; e++) {
						let t = X(e);
						if (Atomics.load(this.#e, t + Y) === this.#i) {
							((this.#t = e), (this.#n = t), (this.#r = ni(e)), this.#D());
							return;
						}
					}
					for (let t = 0; t < 2; t++)
						for (let n = 0; n < Er; n++) {
							let r = X(n),
								i = Atomics.load(this.#e, r + Y),
								a = t === 1 && i && e - Atomics.load(this.#e, r + zr) > 5e3;
							if (
								!(i && !a) &&
								Atomics.compareExchange(this.#e, r + Y, i, this.#i) === i
							) {
								((this.#t = n),
									(this.#n = r),
									(this.#r = ni(n)),
									Atomics.store(this.#e, r + Br, 0),
									Atomics.store(this.#e, r + Vr, 0),
									Atomics.store(this.#e, r + Hr, 0),
									Atomics.store(this.#e, r + Gr, 0),
									Atomics.store(this.#e, r + zr, e),
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
						(Atomics.store(this.#e, this.#n + Wr, e.slots | 0),
						Atomics.store(this.#e, this.#n + Ur, e.addr | 0));
				}
				get token() {
					return this.#i;
				}
				get ok() {
					return this.#t >= 0;
				}
				get generation() {
					return Atomics.load(this.#e, this.#n + Vr);
				}
				get drawnGeneration() {
					return Atomics.load(this.#e, this.#n + Hr);
				}
				publish(e, t, n, r = e) {
					if (
						(this.#t >= 0 &&
							Atomics.load(this.#e, this.#n + Y) !== this.#i &&
							((this.#t = -1), (this.#o = 0)),
						!this.#w())
					)
						return;
					let i = this.#e,
						a = Math.min(n, 64),
						o = this.#O(e),
						s = Atomics.load(i, this.#n + Vr);
					Atomics.load(i, this.#n + Hr) === s && (this.#o = 0);
					let c = this.#a,
						l = 0;
					for (let e = 0; e < a; e++) {
						let n = (t >>> 2) + e * 38,
							r = this.#n + Kr + e * 38,
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
							Or(i, r) &&
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
						Atomics.store(this.#e, this.#n + Br, a),
						Atomics.store(this.#e, this.#n + zr, Date.now()),
						Atomics.add(this.#e, this.#n + Vr, 1),
						Atomics.add(this.#e, Mr, 1),
						Atomics.notify(this.#e, Mr),
						this.#T?.());
				}
				pollInput(e, t, n) {
					if (!this.#w()) return 0;
					let r = this.#e,
						i = this.#r,
						a = Atomics.load(r, i + Jr),
						o = Atomics.load(r, i + Yr);
					if ((a - o > Dr && (o = a - Dr), o === a)) return 0;
					let s = this.#O(e),
						c = t >>> 2,
						l = 0;
					for (; o < a && l < n; ) {
						let e = i + Xr + (o % Dr) * 8;
						for (let t = 0; t < 8; t++) s[c + l * 8 + t] = r[e + t];
						(o++, l++);
					}
					return (Atomics.store(r, i + Yr, o), l);
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
					$n(r);
					let i = Math.min(Atomics.load(r, 110924) >>> 0, $r),
						a = Math.min(i, n);
					return (
						new Uint8Array(e.buffer, t, a).set(
							new Uint8Array(r.buffer, 443700, a),
						),
						er(r),
						i
					);
				}
				clipSet(e, t, n) {
					return (this.#k = tr(this.#e, new Uint8Array(e.buffer, t, n), 1));
				}
				dragData(e, t, n) {
					let r = this.#e,
						i = Math.min(Atomics.load(r, ti) >>> 0, Qr);
					return (
						new Uint8Array(e.buffer, t, Math.min(i, n)).set(
							new Uint8Array(r.buffer, 378148, Math.min(i, n)),
						),
						i
					);
				}
				dragStatus(e, t) {
					if (this.#t < 0) return;
					let n = this.#n + Gr;
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
						Atomics.load(e, this.#r + Jr) !== Atomics.load(e, this.#r + Yr)
					);
				}
				outputSize() {
					return ((this.#A = this.#j()), this.#A);
				}
				#A = 0;
				#j() {
					let e = this.#e;
					return (
						(((Atomics.load(e, Ar) & 65535) << 16) |
							(Atomics.load(e, jr) & 65535)) >>>
						0
					);
				}
				release() {
					this.#t < 0 ||
						(Atomics.store(this.#e, this.#n + Br, 0),
						Atomics.store(this.#e, this.#n + Y, 0),
						(this.#t = -1));
				}
			}));
	}),
	gi = c({
		NetProxy: () => ea,
		Rings: () => $i,
		makeNetChannel: () => _i,
		serveNet: () => vi,
	});
function _i() {
	if (
		typeof Atomics.waitAsync != `function` ||
		typeof SharedArrayBuffer != `function`
	)
		return null;
	let e = null;
	try {
		((e = new SharedArrayBuffer(0, { maxByteLength: Bi * qi })),
			(typeof e.grow != `function` || !e.growable) && (e = null));
	} catch {
		e = null;
	}
	return {
		control: new SharedArrayBuffer(64),
		data: new SharedArrayBuffer(zi),
		rx: e ? new SharedArrayBuffer(256 * Q) : void 0,
		rxData: e ?? void 0,
	};
}
function vi(e, t) {
	let n = new Int32Array(t.control),
		r = new Uint8Array(t.data),
		i = new TextDecoder(),
		a = !0;
	t.rx && `rings` in e && (e.rings = new $i(t, !0));
	let o = e.onActivity;
	e.onActivity = (...t) => {
		(o?.apply(e, t), Atomics.add(n, Ti, 1), Atomics.notify(n, Ti));
	};
	let s = () => {
		let t = n[yi],
			a = n[bi],
			o = 0;
		try {
			switch (t) {
				case ki:
					o = e.open();
					break;
				case Ai:
					e.connect(a, i.decode(r.slice(0, n[xi])), n[Si]);
					break;
				case ji:
					o = e.status(a);
					break;
				case Mi:
					o = e.send(a, r.subarray(0, n[xi]));
					break;
				case Ni:
					o = e.recv(a, r.subarray(0, Math.min(n[xi], zi)));
					break;
				case Pi:
					o = +!!e.available(a);
					break;
				case Fi:
					e.close(a);
					break;
				case Ii:
					o = e.dup ? e.dup(a) : 0;
					break;
				case Li:
					o = e.peek ? e.peek(a, r.subarray(0, Math.min(n[xi], zi))) : -2;
					break;
				case Ri:
					o = e.refill?.(a) ?? 0;
					break;
				default:
					o = -1;
			}
		} catch (e) {
			(console.error(`[net] the network threw`, e), (o = -2));
		}
		((n[Ci] = o), Atomics.store(n, Z, Oi), Atomics.notify(n, Z));
	};
	return (
		(async () => {
			for (; a; ) {
				let e = Atomics.load(n, Z);
				if (e === Di) {
					s();
					continue;
				}
				let t = Atomics.waitAsync(n, Z, e, 1e3);
				t.async && (await t.value);
			}
		})(),
		() => {
			((a = !1),
				(e.onActivity = o),
				t.rx && `rings` in e && (e.rings = null),
				Atomics.notify(n, Z));
		}
	);
}
var Z,
	yi,
	bi,
	xi,
	Si,
	Ci,
	wi,
	Ti,
	Ei,
	Di,
	Oi,
	ki,
	Ai,
	ji,
	Mi,
	Ni,
	Pi,
	Fi,
	Ii,
	Li,
	Ri,
	zi,
	Bi,
	Q,
	Vi,
	Hi,
	Ui,
	Wi,
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
	ta = o(() => {
		((Z = 0),
			(yi = 1),
			(bi = 2),
			(xi = 3),
			(Si = 4),
			(Ci = 5),
			(wi = 6),
			(Ti = 8),
			(Ei = 0),
			(Di = 1),
			(Oi = 2),
			(ki = 1),
			(Ai = 2),
			(ji = 3),
			(Mi = 4),
			(Ni = 5),
			(Pi = 6),
			(Fi = 7),
			(Ii = 8),
			(Li = 9),
			(Ri = 10),
			(zi = 1 << 20),
			(Bi = 64),
			(Q = 8),
			(Vi = 0),
			(Hi = 1),
			(Ui = 2),
			(Wi = 3),
			(Gi = 4),
			(Ki = 5),
			(qi = 262144),
			(Ji = 4),
			(Yi = 0),
			(Xi = 1),
			(Zi = 2),
			(Qi = 3),
			($i = class {
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
					for (let n = 0; n < Bi; n++) {
						let r = n * Q;
						if (Atomics.load(t, r + Vi) !== 0) continue;
						let i = Math.min(Bi, Math.ceil((n + 1) / Ji) * Ji) * qi;
						return (
							this.#i.byteLength < i && this.#i.grow(i),
							this.#a(r, () => {
								((t[r + Hi] = Yi),
									(t[r + Ui] = 0),
									(t[r + Wi] = 0),
									(t[r + Gi] = 0),
									Atomics.store(t, r + Vi, e));
							}),
							n
						);
					}
					return -1;
				}
				release(e) {
					let t = e * Q;
					this.#a(t, () => Atomics.store(this.#e, t + Vi, 0));
				}
				#a(e, t) {
					let n = this.#e,
						r = this.#n ? -1 : 1;
					for (;;) {
						let t = Atomics.compareExchange(n, e + Ki, 0, r);
						if (t === 0) break;
						this.#n || Atomics.wait(n, e + Ki, t, 1);
					}
					try {
						return t();
					} finally {
						(Atomics.store(n, e + Ki, 0), this.#n || Atomics.notify(n, e + Ki));
					}
				}
				setState(e, t) {
					Atomics.store(this.#e, e * Q + Hi, t);
				}
				setSpill(e, t) {
					Atomics.store(this.#e, e * Q + Gi, +!!t);
				}
				write(e, t) {
					let n = this.#e,
						r = e * Q,
						i = Atomics.load(n, r + Ui) >>> 0,
						a = qi - ((i - (Atomics.load(n, r + Wi) >>> 0)) >>> 0),
						o = Math.min(a, t.length);
					if (o <= 0) return 0;
					let s = i & 262143,
						c = e * qi,
						l = Math.min(o, qi - s);
					return (
						this.#t.set(t.subarray(0, l), c + s),
						o > l && this.#t.set(t.subarray(l, o), c),
						Atomics.store(n, r + Ui, (i + o) | 0),
						o
					);
				}
				find(e) {
					let t = this.#e,
						n = this.#r.get(e);
					if (n === -1) return -1;
					if (n !== void 0 && Atomics.load(t, n * Q + Vi) === e) return n * Q;
					for (let n = 0; n < Bi; n++)
						if (Atomics.load(t, n * Q + Vi) === e)
							return (this.#r.set(e, n), n * Q);
					return (this.#r.set(e, -1), -1);
				}
				queued(e) {
					return (
						((Atomics.load(this.#e, e + Ui) >>> 0) -
							(Atomics.load(this.#e, e + Wi) >>> 0)) >>>
						0
					);
				}
				spill(e) {
					return Atomics.load(this.#e, e + Gi) !== 0;
				}
				status(e) {
					let t = Atomics.load(this.#e, e + Hi);
					return t === Yi && (this.queued(e) || this.spill(e)) ? Xi : t;
				}
				ended(e) {
					let t = Atomics.load(this.#e, e + Hi);
					return t === Zi || t === Qi;
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
						if (Atomics.load(i, e + Vi) !== t) return -1;
						let a = Atomics.load(i, e + Wi) >>> 0,
							o = Math.min(
								n.length,
								((Atomics.load(i, e + Ui) >>> 0) - a) >>> 0,
							),
							s = a & 262143,
							c = (e / Q) * qi,
							l = Math.min(o, qi - s);
						return (
							n.set(this.#t.subarray(c + s, c + s + l), 0),
							o > l && n.set(this.#t.subarray(c, c + o - l), l),
							r || Atomics.store(i, e + Wi, (a + o) | 0),
							o
						);
					});
				}
			}),
			(ea = class {
				#e;
				#t;
				#n = new TextEncoder();
				#r;
				#i = null;
				constructor(e, t = 1) {
					((this.#e = new Int32Array(e.control)),
						(this.#t = new Uint8Array(e.data)),
						(this.#r = t || 1),
						e.rx && (this.#i = new $i(e)));
				}
				activitySeq() {
					return Atomics.load(this.#e, Ti);
				}
				activityWait(e, t) {
					let n = Atomics.waitAsync(this.#e, Ti, e, t);
					return n.async ? n.value : Promise.resolve(n.value);
				}
				#a(e, t = 0, n = 0, r = 0) {
					let i = this.#e,
						a = Date.now() + 5e3;
					for (;;) {
						let e = Atomics.compareExchange(i, wi, 0, this.#r);
						if (e === 0) break;
						if ((Atomics.wait(i, wi, e, 50), Date.now() > a)) {
							(console.warn(`[net] taking the channel from ${e}`),
								Atomics.store(i, wi, this.#r));
							break;
						}
					}
					return { a0: t, a1: n, a2: r, op: e };
				}
				#o({ op: e, a0: t, a1: n, a2: r }, i) {
					let a = this.#e;
					try {
						for (
							a[yi] = e,
								a[bi] = t,
								a[xi] = n,
								a[Si] = r,
								Atomics.store(a, Z, Di),
								Atomics.notify(a, Z);
							Atomics.load(a, Z) === Di;
						)
							if (Atomics.wait(a, Z, Di, 3e4) === `timed-out`)
								throw Error(
									`the page did not answer a network call in thirty seconds`,
								);
						let o = a[Ci];
						return (i?.(o), Atomics.store(a, Z, Ei), o);
					} finally {
						(Atomics.store(a, wi, 0), Atomics.notify(a, wi));
					}
				}
				open() {
					return this.#o(this.#a(ki));
				}
				connect(e, t, n) {
					let r = this.#a(Ai, e, 0, n),
						i = this.#n.encode(t);
					(this.#t.set(i.subarray(0, zi), 0),
						(r.a1 = Math.min(i.length, zi)),
						this.#o(r));
				}
				status(e) {
					return this.#i?.statusOf(e) ?? this.#o(this.#a(ji, e));
				}
				send(e, t) {
					let n = Math.min(t.length, zi),
						r = this.#a(Mi, e, n);
					return (this.#t.set(t.subarray(0, n), 0), this.#o(r));
				}
				recv(e, t) {
					let n = this.#i?.recv(e, t, !1, () => this.#s(e));
					return n === void 0
						? this.#o(this.#a(Ni, e, Math.min(t.length, zi)), (e) => {
								e > 0 && t.set(this.#t.subarray(0, e), 0);
							})
						: n;
				}
				peek(e, t) {
					let n = this.#i?.recv(e, t, !0, () => this.#s(e));
					return n === void 0
						? this.#o(this.#a(Li, e, Math.min(t.length, zi)), (e) => {
								e > 0 && t.set(this.#t.subarray(0, e), 0);
							})
						: n;
				}
				#s(e) {
					this.#o(this.#a(Ri, e));
				}
				available(e) {
					return this.#i?.available(e) ?? this.#o(this.#a(Pi, e)) === 1;
				}
				close(e) {
					this.#o(this.#a(Fi, e));
				}
				dup(e) {
					return this.#o(this.#a(Ii, e));
				}
			}));
	});
function na(e) {
	for (let t = 0; t + 3 < e.length; t++)
		if (e[t] === 13 && e[t + 1] === 10 && e[t + 2] === 13 && e[t + 3] === 10)
			return t;
	return -1;
}
function ra(e) {
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
var ia,
	aa,
	oa,
	sa,
	ca,
	la = o(() => {
		((ia = {
			200: `OK`,
			206: `Partial Content`,
			304: `Not Modified`,
			400: `Bad Request`,
			404: `Not Found`,
			405: `Method Not Allowed`,
			416: `Range Not Satisfiable`,
			502: `Bad Gateway`,
		}),
			(aa = [
				`range`,
				`if-range`,
				`if-modified-since`,
				`if-none-match`,
				`accept`,
			]),
			(oa = [
				`content-type`,
				`last-modified`,
				`etag`,
				`content-range`,
				`accept-ranges`,
				`cache-control`,
			]),
			(sa = new TextEncoder()),
			(ca = class {
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
						let e = na(this.#n);
						if (e < 0) break;
						let t = new TextDecoder().decode(this.#n.subarray(0, e));
						this.#n = this.#n.subarray(e + 4);
						let n = ra(t);
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
					let n = [`HTTP/1.1 ${e} ${ia[e] ?? ``}`.trimEnd()];
					for (let [e, r] of t) n.push(`${e}: ${r}`);
					this.#s(
						sa.encode(
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
					for (let t of aa) e.headers.has(t) && (a[t] = e.headers.get(t));
					let o;
					try {
						o = await this.#t(i.href, { method: e.method, headers: a });
					} catch {
						(this.#l(502, [[`Content-Length`, `0`], ...n]), t || this.#c());
						return;
					}
					let s = [];
					for (let e of oa)
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
								(l && this.#s(sa.encode(`${t.length.toString(16)}\r\n`)),
								this.#s(t),
								l &&
									this.#s(
										sa.encode(`\r
`),
									));
						}
						((this.#o = null),
							l &&
								this.#s(
									sa.encode(`0\r
\r
`),
								));
					} else await o.body?.cancel().catch(() => {});
					t || this.#c();
				}
			}));
	}),
	ua = c({ NodeNetwork: () => xa });
async function da(e, t) {
	if (!e.startsWith(`file:`)) return fetch(e, t);
	let n = (0, ga.fileURLToPath)(e),
		r;
	try {
		if (((r = await (0, ma.stat)(n)), !r.isFile())) throw Error(`not a file`);
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
			: ha.Readable.toWeb((0, pa.createReadStream)(n, { start: a, end: o }));
	return new Response(l, { status: s, headers: i });
}
var fa,
	pa,
	ma,
	ha,
	ga,
	_a,
	va,
	ya,
	ba,
	xa,
	Sa = o(() => {
		((fa = E()),
			(pa = E()),
			(ma = E()),
			(ha = E()),
			(ga = E()),
			la(),
			(_a = 0),
			(va = 1),
			(ya = 2),
			(ba = 3),
			(xa = class {
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
							status: _a,
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
						let e = new ca(i, da);
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
							(r.status = va));
						return;
					}
					if (!this.#r) {
						((r.status = ya), (r.eof = !0));
						return;
					}
					let a = (0, fa.createConnection)({ host: t, port: n }, () => {
						((r.status = va), this.onActivity());
					});
					(a.on(`data`, (e) => {
						(r.rx.push(e), this.onActivity());
					}),
						a.on(`end`, () => {
							((r.eof = !0), this.onActivity());
						}),
						a.on(`error`, () => {
							((r.status = r.status === _a ? ya : ba),
								(r.eof = !0),
								this.onActivity());
						}),
						a.on(`close`, () => {
							(r.status === _a && (r.status = ya),
								(r.eof = !0),
								this.onActivity());
						}),
						(r.sock = a));
				}
				status(e) {
					return this.#e.get(e)?.status ?? ba;
				}
				send(e, t) {
					let n = this.#e.get(e);
					return !n?.sock || n.status !== va
						? -1
						: (n.sock.write(Buffer.from(t)), t.length);
				}
				recv(e, t) {
					let n = this.#e.get(e);
					if (!n) return 0;
					if (!n.rx.length) return n.eof || n.status === ya ? 0 : -1;
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
					if (!n.rx.length) return n.eof || n.status === ya ? 0 : -1;
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
					return !!t && (t.rx.length > 0 || t.eof || t.status === ya);
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
	Ca,
	wa,
	Ta = o(() => {
		((Ca = typeof globalThis > `u` ? window : globalThis),
			(wa = Ca.WebSocket),
			Ca.crypto);
	}),
	Ea,
	Da,
	Oa,
	ka,
	$,
	Aa,
	ja,
	Ma,
	Na,
	Pa,
	Fa,
	Ia,
	La,
	Ra,
	za = o(() => {
		((Ea = new TextEncoder()),
			(Da = Ea.encode.bind(Ea)),
			(Oa = new TextDecoder()),
			(ka = Oa.decode.bind(Oa)),
			($ = class e {
				constructor(e) {
					if (e instanceof Uint8Array) this.from_array(e);
					else if (typeof e == `number`) this.from_array(new Uint8Array(e));
					else if (typeof e == `string`) this.from_array(Da(e));
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
					return Oa.decode(this.bytes);
				}
			}),
			(Aa = class e {
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
						r = Ia[n.type];
					if (r === void 0) throw TypeError(`invalid packet type`);
					if (n.payload_bytes.size < r.size)
						throw TypeError(`payload too small`);
					return ((n.payload = r.parse(n.payload_bytes)), n);
				}
				serialize() {
					let e = new $(5);
					return (
						e.view.setUint8(0, this.type),
						e.view.setUint32(1, this.stream_id, !0),
						(e = e.concat(this.payload.serialize())),
						e
					);
				}
			}),
			(ja = class e {
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
						hostname: ka(t.slice(3).bytes),
					});
				}
				serialize() {
					let e = new $(3);
					return (
						e.view.setUint8(0, this.stream_type),
						e.view.setUint16(1, this.port, !0),
						(e = e.concat(new $(this.hostname))),
						e
					);
				}
			}),
			(Ma = class e {
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
			(Na = class e {
				static type = 3;
				static name = `CONTINUE`;
				constructor({ buffer_remaining: e }) {
					this.buffer_remaining = e;
				}
				static parse(t) {
					return new e({ buffer_remaining: t.view.getUint32(0, !0) });
				}
				serialize() {
					let e = new $(4);
					return (e.view.setUint32(0, this.buffer_remaining, !0), e);
				}
			}),
			(Pa = class e {
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
					let e = new $(1);
					return (e.view.setUint8(0, this.reason), e);
				}
			}),
			(Fa = class e {
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
					let e = new $(2);
					return (
						e.view.setUint8(0, this.major_ver),
						e.view.setUint8(1, this.minor_ver),
						e.concat(this.extensions)
					);
				}
			}),
			(Ia = { 1: ja, 2: Ma, 3: Na, 4: Pa, 5: Fa }),
			(La = { CONNECT: 1, DATA: 2, CONTINUE: 3, CLOSE: 4, INFO: 5 }),
			(Ra = { TCP: 1, UDP: 2 }));
	});
function Ba(e, t, n) {
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
			let e = Ua.parse(s, o, n);
			r.push(e);
		}
		e = e.slice(5 + a);
	}
	return r;
}
function Va(e) {
	{
		let t = new $(0);
		for (let n of e) t = t.concat(n.serialize());
		return t;
	}
}
var Ha,
	Ua,
	Wa,
	Ga,
	Ka = o(() => {
		(za(),
			(Ha = class e {
				constructor() {}
				static parse() {
					return new e();
				}
				serialize() {
					return new $(0);
				}
			}),
			(Ua = class {
				static id = 0;
				static name = ``;
				static Server = Ha;
				static Client = Ha;
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
					let e = new $(5),
						t = this.payload.serialize();
					return (
						e.view.setInt8(0, this.constructor.id),
						e.view.setUint32(1, t.size, !0),
						e.concat(t)
					);
				}
			}),
			(Wa = class extends Ua {
				static id = 1;
				static name = `UDP`;
			}),
			(Ga = class e extends Ua {
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
						return new $(this.message);
					}
				};
				static Client = Ha;
			}));
	}),
	qa,
	Ja,
	Ya = o(() => {
		(Ta(),
			za(),
			Ka(),
			(qa = class {
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
						this.stream_type === Ra.UDP
					) {
						let t = new Aa({
							type: La.DATA,
							stream_id: this.stream_id,
							payload: new Ma({ data: new $(e) }),
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
					let t = new Aa({
						type: La.CLOSE,
						stream_id: this.stream_id,
						payload: new Pa({ reason: e }),
					});
					(this.ws.send(t.serialize().bytes),
						(this.open = !1),
						delete this.connection.active_streams[this.stream_id]);
				}
			}),
			(Ja = class {
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
						this.wisp_extensions.push(new Wa({ client_config: {} })),
						this.wisp_extensions.push(new Ga({ client_config: {} })));
				}
				connect_ws() {
					let e = this.wisp_version === 2 ? `wisp-v2` : void 0;
					((this.ws = new wa(this.wisp_url, e)),
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
						(typeof r == `string` && (r = n === `udp` ? Ra.UDP : Ra.TCP),
						r == Ra.UDP && !this.udp_enabled)
					)
						throw Error(`udp is not enabled for this wisp connection`);
					let i = this.next_stream_id++,
						a = new qa(e, t, this.ws, this.max_buffer_size, i, this, r);
					((this.active_streams[i] = a), (a.open = this.connected));
					let o = new Aa({
						type: La.CONNECT,
						stream_id: i,
						payload: new ja({ stream_type: r, port: t, hostname: e }),
					});
					return (this.ws.send(o.serialize().bytes), a);
				}
				close_stream(e, t) {
					(e.onclose(t), delete this.active_streams[e.stream_id]);
				}
				on_ws_msg(e) {
					let t = new $(new Uint8Array(e.data));
					if (t.size < Aa.min_size) {
						console.warn(
							`wisp client warning: received a packet which is too short`,
						);
						return;
					}
					let n = Aa.parse_all(t),
						r = this.active_streams[n.stream_id];
					if (n.stream_id === 0 && this.connecting) {
						if (
							(n.type === La.CONTINUE &&
								((this.max_buffer_size = n.payload.buffer_remaining),
								(this.connected = !0),
								this.info_received || (this.wisp_version = 1)),
							n.type === La.INFO && this.wisp_version === 2)
						) {
							let e = Ba(n.payload.extensions, this.wisp_extensions, `server`);
							for (let t of e)
								for (let e of this.wisp_extensions)
									t.id === e.id &&
										((this.server_exts[t.id] = t),
										(this.client_exts[e.id] = e));
							((this.info_received = !0),
								(this.server_motd = this.server_exts[Ga.id]?.payload?.message),
								(this.udp_enabled = !!this.server_exts[Wa.id]));
							let t = Va(this.wisp_extensions),
								r = new Aa({
									type: Fa.type,
									stream_id: 0,
									payload: new Fa({
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
							`wisp client warning: received a ${Ia[n.type].name} packet for a stream which doesn't exist`,
						);
						return;
					}
					n.type === La.DATA
						? r.onmessage(n.payload_bytes.bytes)
						: n.type === La.CONTINUE
							? r.continue_received(n.payload.buffer_remaining)
							: n.type === La.CLOSE
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
	Xa = o(() => {
		(Ta(), Ya(), Ca.CloseEvent);
	}),
	Za = o(() => {
		(Ya(), Xa());
	}),
	Qa = o(() => {
		(Za(), za(), Ka());
	}),
	$a = c({ WispNetwork: () => so }),
	eo,
	to,
	no,
	ro,
	io,
	ao,
	oo,
	so,
	co = o(() => {
		(Qa(),
			Qe(),
			la(),
			(eo = 0),
			(to = 1),
			(no = 2),
			(ro = 3),
			(io = 16 << 20),
			(ao = class {
				constructor(e) {
					((this.id = e),
						(this.state = eo),
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
			(oo = { n: 0, bytes: 0, last: 0 }),
			(so = class {
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
							let n = new Ja(this.#r);
							((n.onopen = () => {
								((this.#e = n), (this.#o = 0), e());
								let t = this.#s;
								this.#s = [];
								for (let [e, n, r] of t) this.connect(e, n, r);
							}),
								(n.onerror = (e) =>
									t(Error(`wisp: ${e?.message || `could not connect`}`))),
								(n.onclose = () => {
									for (let e of this.#t.values()) e.waiting || this.#d(e, no);
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
						t = new ao(e);
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
						this.#f(r, e, new ca(i), t, n);
						return;
					}
					if (this.#l) {
						let i;
						try {
							i = this.#l(t, n);
						} catch {
							this.#d(r, ro);
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
						this.#d(r, ro);
						return;
					}
					this.#f(r, e, a, t, n);
				}
				#f(e, t, n, r, i) {
					((e.wisp = n),
						(n.onopen = () => {
							(this.#d(e, to), this.onActivity());
						}),
						(n.onmessage = (n) => {
							let r = n instanceof Uint8Array ? n : new Uint8Array(n),
								i = performance.now();
							if (!e.firstRecv) {
								e.firstRecv = i;
								let n = e.firstSend ? (i - e.firstSend) / 1e3 : -1;
								R(`debug`) &&
									console.info(
										`[wisp] stream ${t}: first reply at ${(i / 1e3).toFixed(1)}s, ${n.toFixed(1)}s after the request`,
									);
							}
							(oo.last &&
								i - oo.last > 1e3 &&
								R(`debug`) &&
								console.info(
									`[wisp] nothing for ${((i - oo.last) / 1e3).toFixed(1)}s after ${oo.n} messages and ${(oo.bytes / 1048576).toFixed(1)} MiB`,
								),
								(oo.last = i),
								(oo.n += 1),
								(oo.bytes += r.length),
								e.buffered > io &&
									!e.warned &&
									((e.warned = !0),
									console.warn(
										`[wisp] stream ${t}: ${e.buffered >> 20} MiB unread`,
									)),
								this.#p(e, r),
								this.onActivity());
						}),
						(n.onclose = () => {
							(this.#d(e, e.state === eo ? ro : no), this.onActivity());
						}),
						(n.onerror = () => {
							(this.#d(e, e.state === eo ? ro : no), this.onActivity());
						}),
						(n.open === !0 || e.wisp?.open === !0) && this.#d(e, to),
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
						? (n.state === eo && n.chunks.length && (n.state = to), n.state)
						: no;
				}
				send(e, t) {
					let n = this.#t.get(e);
					return !n || !n.wisp || n.state === no || n.state === ro
						? -1
						: ((n.sends = (n.sends ?? 0) + 1),
							(n.firstSend ||= performance.now()),
							R(`debug`) &&
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
							: r.state === no || r.state === ro
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
							: r.state === no || r.state === ro
								? 0
								: -1
						: 0;
				}
				available(e) {
					let t = this.rings?.available(e);
					if (t !== void 0) return t;
					let n = this.#t.get(e);
					return !n || n.chunks.length > 0 || n.state === no || n.state === ro;
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
	});
(Ke(), Qe());
async function lo() {
	if (typeof self < `u` && typeof self.postMessage == `function`)
		return {
			post: (e, t) =>
				t && t.length ? self.postMessage(e, t) : self.postMessage(e),
			on: (e) => {
				self.onmessage = (t) => e(t.data);
			},
		};
	let { parentPort: e } = await Promise.resolve().then(() => u(E(), 1)),
		t = null;
	return {
		post: (t, n) => (n && n.length ? e.postMessage(t, n) : e.postMessage(t)),
		on: (n) => {
			(t || e.on(`message`, (e) => t(e)), (t = n));
		},
	};
}
const uo = [`modules`, `image`, `vmaBlob`, `pages`, `shared`],
	fo = () =>
		!I.on &&
		typeof MessageChannel == `function` &&
		typeof WorkerGlobalScope < `u`;
function po(e) {
	let t = 0;
	for (let n of e?.image ?? [])
		t = Math.max(t, n.end ?? 0, n.at + (n.len ?? n.bytes?.byteLength ?? 0));
	return t;
}
async function mo(e) {
	let t = e?.bulk;
	if (!t) return;
	delete e.bulk;
	let n = await new Promise((e) => {
		t.onmessage = (t) => e(t.data);
	});
	(t.close(), Object.assign(e, n));
}
if (
	(typeof process < `u` &&
		{}.GEX_WATCH_DIR &&
		(K.watchDir = Number({}.GEX_WATCH_DIR)),
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
const ho = new Set(),
	go = new Set(Object.getOwnPropertyNames(globalThis));
if (!I.on)
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
									return (ho.delete(i), e.apply(this, t));
								}
							: e;
				return ((i = r.call(globalThis, a, ...t)), ho.add(i), i);
			}),
			(globalThis[t] = function (e) {
				return (ho.delete(e), i.call(globalThis, e));
			}));
	}
function _o() {
	for (let e of ho) (clearTimeout(e), clearInterval(e));
	ho.clear();
	for (let e of Object.getOwnPropertyNames(globalThis))
		if (!(go.has(e) || e === `__gexMarkedConsole`))
			try {
				delete globalThis[e];
			} catch {}
}
async function vo(e, t = null) {
	let n = { on: !0 },
		r = {
			post: (t, r) => {
				n.on && e.post(t, r);
			},
			on: e.on,
		};
	I.on || m((e) => r.post({ kind: `note`, note: e }));
	let i = null,
		a = new Map();
	globalThis.__gexWho = () => i?.who ?? null;
	let o = t?.pooled ?? new Map(),
		s = (t?.runs ?? 0) + 1,
		c = {
			gl: () => Promise.resolve().then(() => (Zn(), Sn)),
			wl: () => Promise.resolve().then(() => (hi(), Qn)),
			net: () => Promise.resolve().then(() => (ta(), gi)),
		},
		l = {},
		d = (e) => l[e] ?? c[e]().then((t) => (l[e] = t)),
		f = null,
		p = !0,
		h = null,
		v = null,
		y = null,
		b = !1,
		x = () => 0,
		C = 0,
		ee = () => {};
	r.on((t) => {
		if (t?.kind === `spareGo`) {
			(v ? v(t.thread ?? null) : (h = t), (v = null));
			return;
		}
		if (t?.kind === `reset`) {
			((n.on = !1),
				_o(),
				vo(e, { pooled: o, runs: s }).catch((t) => {
					(console.error(
						`gex: a given-back worker could not start again:`,
						t?.stack ?? t,
					),
						e.post({ kind: `threw`, message: String(t?.message ?? t) }));
				}));
			return;
		}
		re(t).catch((e) => {
			let t = e?.stack ?? e?.message ?? String(e);
			(typeof console < `u` && console.error(`gex: worker failed:`, t),
				r.post({ kind: `threw`, message: t }));
		});
	});
	function te(e) {
		let t = e.shim.exports;
		if (!t.gex_hot_blocks) return [];
		let n = t.gex_alloc(4096) >>> 0,
			r = t.gex_hot_blocks(n, 4096) >>> 0,
			i = U(new Uint8Array(e.memory.buffer, n, r)).trim();
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
							s = o ? U(new Uint8Array(e.memory.buffer, a, o)) : r;
						return `${String(i).padStart(10)}  ${s}`;
					})
			: [];
	}
	let w = [],
		T = 0,
		D = null,
		O = null;
	function k(e) {
		(w.push(e), O && w.length >= T && O());
	}
	let A = new Map();
	function j(e) {
		let t = A.get(e);
		if (!t) {
			let n;
			((t = {
				p: new Promise((e) => {
					n = e;
				}),
				settle: n,
			}),
				A.set(e, t),
				r.post({ kind: `wantLibrary`, i: e }));
		}
		return t.p;
	}
	function ne(e) {
		return (
			(T = e),
			!e || w.length >= e
				? Promise.resolve(w)
				: ((D ??= new Promise((e) => {
						O = e;
					})),
					w.length >= T && O(),
					D.then(() => w))
		);
	}
	async function re(t) {
		if ((Xe(t?.log), t?.unitFiles?.buf)) {
			let { buf: e, index: n } = t.unitFiles;
			for (let [t, r, i] of n)
				a.has(t) || a.set(t, i < 0 ? null : new Uint8Array(e, r, i));
		}
		if (t?.kind === `closureMeta`) {
			((t.metas ?? []).forEach((e, n) =>
				k({ meta: e, mod: null, program: (t.programs ?? [])[n] ?? `` }),
			),
				(T = w.length),
				O?.());
			return;
		}
		if (t?.kind === `closureModule`) {
			if (typeof t.i == `number`) {
				let e = A.get(t.i);
				(w[t.i] && (w[t.i].mod = t.mod), e?.settle(t.mod));
				return;
			}
			k(t.entry);
			return;
		}
		if (t?.kind === `stdin`) {
			(y?.(t.bytes), (y = null));
			return;
		}
		if (t?.kind === `winsize`) {
			ee(t.rows, t.cols);
			return;
		}
		if (t?.kind === `eof`) {
			((b = !0), y?.(null), (y = null));
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
					let a = new K(new pn(), {
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
			(t.kind === `adopt` && (await mo(t.child)),
			t.kind === `thread` && (await mo(t)),
			Me(t),
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
			m = (t.preModules ?? []).some(([e]) => e === `closed`),
			D = null;
		if (t.cgen?.zstd && typeof XMLHttpRequest == `function`)
			try {
				let e = z(`unitstall`) ? performance.now() : -1,
					{ ZSTDDecoder: n } = await import(
						/* @vite-ignore */ /* webpackIgnore: true */ t.cgen.zstd
					);
				((D = new n()),
					await D.init(),
					e >= 0 &&
						console.warn(
							`[unitzstd] decoder ready in ${(performance.now() - e).toFixed(1)} ms`,
						));
			} catch (e) {
				(console.error(
					`[gex] no zstd decoder for units (${t.cgen.zstd}): ${e?.message ?? e}`,
				),
					(D = null));
			}
		class re extends pn {
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
				(t.debugExit && console.error(U(i.slice())),
					n++,
					r.post(
						t.rawOutput
							? { kind: `output`, fd: e, bytes: i.slice(), lflag: C }
							: { kind: `output`, fd: e, text: U(i.slice()), lflag: C },
					));
			}
			now() {
				return fn();
			}
			async readStdin() {
				if (b) return !1;
				let e = await new Promise((e) => {
					((y = e), (C = x()), r.post({ kind: `stdin`, lflag: C }));
				});
				return e === !0
					? !0
					: e
						? (P.pushStdin(e instanceof Uint8Array ? e : new Uint8Array(e)), !0)
						: !1;
			}
			async spawnProcess(e) {
				if (fo()) {
					let t = new MessageChannel(),
						n = {};
					for (let t of uo) n[t] = e[t];
					let i = { ...e, extent: po(e), bulk: t.port2 };
					for (let e of uo) delete i[e];
					(t.port1.postMessage(n, we(n)),
						r.post({ kind: `fork`, child: i }, [t.port2]));
					return;
				}
				r.post({ kind: `fork`, child: e }, we(e));
			}
			snapParked(e) {
				r.post({ kind: `snap-parked`, ...e, memory: P.memory });
			}
			async spawnThread(e) {
				if (((p = !1), fo() && !t.memories && e.memory)) {
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
					_(e));
			}
			owner = ``;
			prefetchUnit(e) {
				let n = t.cgen;
				if (!n?.url || m || l.has(`${e}/c.wasm`)) return;
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
					let a = g(`unit:${e}`, r, this.owner);
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
				return D;
			}
			loadFile(e) {
				let n = t.cgen;
				if (!n) return null;
				let o = l.get(e);
				if (o) return o.slice();
				let s = ae(`unit:${e}`);
				if (s) return s;
				if (m) return null;
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
					let t = n.zst && D && e.endsWith(`/c.wasm`),
						o = new XMLHttpRequest();
					(o.open(
						`GET`,
						n.files ? n.files[e] : `${n.url}/${e}${t ? `.zst` : ``}`,
						!1,
					),
						(o.responseType = `arraybuffer`));
					let s = g(`unit:${e}`, 0, this.owner),
						c = z(`unitstall`) ? performance.now() : -1;
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
									? D.decode(new Uint8Array(o.response))
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
			t.wasmDlls && (K.wasmDlls = t.wasmDlls),
			t.elfUnits && (K.elfUnits = t.elfUnits),
			t.providerSkip && (K.providerSkip = t.providerSkip),
			t.providerSources && (K.providerSources = t.providerSources),
			t.stateful && (K.stateful = t.stateful),
			t.fjitLibs && (K.fjitLibs = t.fjitLibs),
			t.identities && (K.identities = t.identities),
			t.testBreakStackGuard && (globalThis.GEX_TEST_BREAK_STACK_GUARD = 1),
			t.testUd2Entry && (globalThis.GEX_TEST_UD2_ENTRY = 1),
			t.fillTime && (globalThis.GEX_FILL_TIME = 1),
			t.unitCache && (globalThis.GEX_UNIT_CACHE = 1),
			t.fill && ie(t.fill),
			t.lazyCache && S(t.lazyCache),
			t.pageFs && De(t.pageFs),
			t.restBundle && (globalThis.GEX_REST_BUNDLE = 1));
		let M =
			f &&
			t.kind === `adopt` &&
			t.child?.exec &&
			!t.memory &&
			!t.recycledMemory &&
			!t.moduleStore
				? await f
				: null;
		(f &&
			!M &&
			bn(
				`[pool] pid ${t.child?.pid ?? t.pid ?? `?`}: a runtime made ahead was left unused (${t.kind})`,
			),
			(f = null));
		let N =
			M &&
			M.shared === !!t.shared &&
			M.stack === t.kernelStack &&
			M.mem64 === !!t.mem64;
		(M &&
			!N &&
			console.error(
				`[gex] pid ${t.child?.pid}: the pooled runtime does not fit its process (shared ${M.shared}/${!!t.shared}, stack ${M.stack}/${t.kernelStack}, mem64 ${M.mem64}/${!!t.mem64}); a new one is made`,
			),
			M && M.mem64 && !t.mem64 && delete globalThis.GEX_MEM64);
		let P = N
			? M.gex
			: new K(new re(), {
					kernel: t.kernel ? { ...t.kernel, stackTop: t.kernelStack } : null,
					memory: t.memory ?? t.recycledMemory ?? null,
					moduleStore: t.moduleStore ?? null,
					shared: !!t.shared,
					modules: o,
					fiber: e.fiber ?? null,
				});
		(P === M?.gex && P.setEnv(new re()),
			(i = P),
			P.setDoorWord(t.doorWord),
			t.door && P.setDoor(t.door),
			t.cgen?.mode && P.useCgen(t.cgen.mode),
			(t.providers ?? t.opts?.providers) === 0 && P.noElfProviders());
		for (let [e, n] of t.sharedModules ?? []) P.addSharedModule(e, n);
		for (let [e, n] of t.preModules ?? [])
			(e.startsWith(`cgen:`) || e.startsWith(`cgenfile:`)) &&
				P.addSharedModule(e, n);
		if (
			((globalThis.GEX_SHARE_TRACE || {}.GEX_SHARE_TRACE || t.shareTrace) &&
				console.warn(
					`[share] ${t.kind} start with ${(t.sharedModules ?? []).length} shared modules (${(t.sharedModules ?? []).filter(([e]) => String(e).startsWith(`cgen:`)).length} units, ${(t.sharedModules ?? []).filter(([e]) => String(e).startsWith(`wasm:`)).length} programs)`,
				),
			t.glChannel?.inRealm)
		) {
			let { shownInReply: e } = await d(`gl`);
			P.useGl({
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
			P.useGl(
				new e(t.glChannel, () => {
					t.glChannel.direct || r.post({ kind: `gl` });
				}),
			);
		}
		if ((t.glChannel?.d3d && P.useD3d(!0), t.wlChannel)) {
			let { WlProxy: e, outputSize: n } = await d(`wl`),
				i = new e(
					t.wlChannel,
					() => r.post({ kind: `wl` }),
					() => P.wlToken(),
				);
			P.useWl(i);
			let a = n(t.wlChannel);
			(P.wlOutput(a.w, a.h, a.scale),
				(P.onWlToken = (e) => {
					p = !1;
					let n = i.firstForKernel() ? P.kernelWake()?.memory : void 0,
						a = !!t.wlChannel.pixels;
					(a && !n) ||
						r.post({
							kind: `wl-memory`,
							token: e,
							memory: a ? void 0 : P.memory,
							kernel: n,
						});
				}),
				(i.onToken = P.onWlToken),
				(i.onPixels = (e) => r.post({ kind: `wl-pixels`, ...e })),
				(i.wakeAddr = () => P.kernelWake()));
		} else if (t.wlStub) {
			let e = {}.GEX_WL_DUMP,
				t = {}.GEX_COVERAGE_OUT,
				n = e || t ? await Promise.resolve().then(() => u(E(), 1)) : null,
				r = await d(`wl`),
				i = () => {
					if (!(!n || !t))
						try {
							let e = P.coverage();
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
			P.useWl({
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
			let { NodeNetwork: e } = await Promise.resolve().then(() => (Sa(), ua)),
				n = new e({ pageHosts: t.pageHosts ?? null, tcp: !!t.tcp });
			(I.on && (n.onActivity = () => L.wake()), P.useNetwork(n));
		}
		if (t.wispNet)
			((t.wispNet.onActivity = () => L.wake()),
				P.useNetwork(t.wispNet, { shared: !0 }));
		else if (t.netChannel) {
			let { NetProxy: e } = await d(`net`);
			P.useNetwork(new e(t.netChannel, t.child?.pid ?? t.pid ?? 1), {
				shared: !0,
			});
		} else if (t.wispUrl || (t.pageHosts && !t.network)) {
			let { WispNetwork: e } = await Promise.resolve().then(() => (co(), $a)),
				n = new e(t.wispUrl ?? null, (e) => r.post({ kind: `net`, event: e }), {
					pageHosts: t.pageHosts ?? null,
				});
			try {
				await n.start();
			} catch (e) {
				r.post({ kind: `net`, event: `error ${e?.message ?? e}` });
			}
			P.useNetwork(n);
		}
		s > 1 &&
			t.kind !== `thread` &&
			bn(
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
							h
								? Promise.resolve(h.thread ?? null)
								: new Promise((e) => {
										v = e;
									})),
					({
						entry: e,
						ctx: n,
						gone: i,
					} = await (t.snap
						? P.snapThread(t.shim, t.guest, t)
						: P.adoptThread(t.shim, t.guest, t))),
					t.snap && (r.post({ kind: `snap-attached` }), P.snapRelease()),
					(a = P.adoptGen ?? P.shim.exports.gex_exec_gen?.() ?? 0),
					o(`adopt done entry=0x${(e ?? 0n).toString(16)}, entering run`));
			} else if (t.kind === `adopt`)
				(Ht(`[worker] pid ${t.child?.pid}: adopt arrived`),
					t.child &&
						((t.child.uid = t.uid ?? t.opts?.uid),
						(t.child.gid = t.gid ?? t.opts?.gid)),
					(e = await P.adoptProcess(t.shim, t.guest, t.child, {
						...t,
						closure: t.closure ?? (await ne(t.closureCount ?? 0)),
						wantLibrary: j,
					})),
					t.child?.ctx && (n = Number(t.child.ctx)));
			else {
				if (
					((e = await P.load(
						t.shim,
						t.guest,
						t.elf,
						t.files ?? {},
						t.args ?? [],
						{
							...(t.opts ?? {}),
							closure:
								t.closure ?? t.opts?.closure ?? (await ne(t.closureCount ?? 0)),
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
							wantLibrary: j,
						},
					)),
					!e)
				)
					throw Error(`the program could not be loaded`);
				let n = P.audioRing?.();
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
			o && P.shim.exports.gex_set_recompile_objects?.(o);
			let c = t.heartbeat || t.opts?.heartbeat;
			if (
				(c && P.shim.exports.gex_set_heartbeat?.(BigInt(c)),
				(t.phases || t.opts?.phases) &&
					P.shim.exports.gex_set_phases?.(t.phases || t.opts.phases),
				t.inPlace === 0 && P.shim.exports.gex_set_in_place?.(0),
				t.excTrace && P.shim.exports.gex_set_exc_trace?.(1),
				t.fcacheStats && P.shim.exports.gex_set_fcache_stats?.(1),
				t.winsize &&
					P.shim.exports.gex_set_winsize?.(t.winsize.rows, t.winsize.cols),
				!t.kernelStack)
			) {
				let e = P.kernelStacks?.();
				e && r.post({ kind: `kernelStacks`, ...e });
			}
			((ee = (e, t) => {
				P.released || P.shim.exports.gex_set_winsize?.(e, t);
			}),
				(x = () => P.shim.exports.gex_tty_lflag?.() ?? 0));
			let l = P.shim.exports;
			if (
				((t.jit ?? t.opts?.jit) === !1 && l.gex_set_jit(0),
				(t.aot ?? t.opts?.aot) && l.gex_set_aot?.(1),
				t.hot && l.gex_set_hot?.(1),
				t.noIntrinsics && l.gex_set_intrinsics?.(0),
				t.intrinsicMask !== void 0 &&
					l.gex_set_intrinsic_mask?.(t.intrinsicMask),
				t.trace && l.gex_set_trace?.(1),
				(t.wholePage ?? t.opts?.wholePage) && (K.wholePage = !0),
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
						memoryMib: P.memory.buffer.byteLength / (1 << 20),
					}));
			let d = t.kind === `thread` && !t.snapMain;
			globalThis.GEX_REPORT_ABANDONED = !d;
			let f = performance.now(),
				m = i ? 0 : await P.run(e, n),
				g = !i && !d ? P.execAwayRecord?.() : null;
			if (g) {
				(P.close?.(),
					P.releaseWorker?.(),
					r.post({ kind: `execAway`, child: g }));
				return;
			}
			let _ =
					d && !i && !l.gex_thread_gone?.() && (l.gex_exec_gen?.() ?? 0) !== a,
				y = (d && !_) || !!l.gex_thread_gone?.();
			d &&
				!i &&
				!_ &&
				!l.gex_thread_gone?.() &&
				!l.gex_exited?.() &&
				(l.gex_exec_gen?.() ?? 0) === a &&
				P.freeThreadTls?.();
			let b = Math.round(performance.now() - f);
			if (t.exitTrace && m !== 0) {
				try {
					let e = P.kernel,
						n = BigInt.asUintN(64, BigInt(e?.k_last_kill?.() ?? 0));
					console.warn(
						`[gex] pid ${t.pid ?? `?`} ended with ${m}; last signal sent: ${Number(n & 255n)} from pid ${Number(BigInt.asIntN(24, n >> 40n))} to ${Number(BigInt.asIntN(32, (n >> 8n) & 4294967295n))} (#${e?.k_last_kill_seq?.() ?? `?`})`,
					);
				} catch {}
				(l.gex_set_trace?.(1), l.gex_dump_state?.(), l.gex_set_trace?.(0));
			}
			(t.opts?.pins && l.gex_pin_report?.(),
				y || l.gex_fjit_report?.(),
				y || l.gex_process_gone?.(134));
			let S = t.xcache ?? t.opts?.xcache ?? t.child?.opts?.xcache,
				C = t.xcacheMin ?? t.opts?.xcacheMin ?? t.child?.opts?.xcacheMin;
			(!y &&
				S &&
				(await P.xcacheSave?.(
					S,
					C ?? 1 << 20,
					t.saveGate,
					t.xcacheDelay,
					t.child?.pid ?? t.pid ?? 1,
				)),
				P.close?.());
			let w =
				d && !_ && (i || (l.gex_exec_gen?.() ?? 0) !== a)
					? { kind: `exit`, status: m, guestMillis: b }
					: {
							kind: `exit`,
							status: m,
							threadGone: y && !d ? !0 : void 0,
							carries: _ || void 0,
							guestMillis: b,
							exitPc: t.exitTrace ? Number(l.gex_current_pc?.() ?? 0n) : void 0,
							hot: t.hot ? te(P) : void 0,
							fmaCalls: t.fmaCount ? Number(l.gex_fma_calls?.() ?? -1) : void 0,
							extracted: (t.extract ?? []).map((e) => [e, P.readFile(e)]),
							blocks: Number(P.shim.exports.gex_jit_blocks?.() ?? 0),
							liftInClosure: Number(
								P.shim.exports.gex_lift_in_closure?.() ?? 0,
							),
							liftWhy: P.shim.exports.gex_lift_why
								? [0, 1, 2, 3].map((e) =>
										Number(P.shim.exports.gex_lift_why(e)),
									)
								: void 0,
							liftSlots: P.liftSlots?.(),
							millis: Number(P.shim.exports.gex_jit_millis?.() ?? 0),
							dl: (() => {
								let e = P.shim.exports,
									t = e.gex_dl_text?.(0, 0) >>> 0;
								if (!t) return;
								let n = e.gex_alloc(t) >>> 0;
								e.gex_dl_text(n, t);
								let r = new TextDecoder().decode(
									new Uint8Array(P.memory.buffer, n, t).slice(),
								);
								return (e.gex_free?.(n, t), r);
							})(),
							xlate: P.shim.exports.gex_xlate_stat
								? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11].map((e) =>
										Number(P.shim.exports.gex_xlate_stat(e)),
									)
								: void 0,
							installMs: P.installMillis,
							compileMs: P.compileMillis,
							unitHits: P.unitHits,
							compiles: P.compileCount,
							instantiateMs: P.instantiateMillis,
							growMs: P.growMillis,
							byObject: P.blocksByObject,
							cmdline: P.cmdline,
							waits: P.waits,
							traps: P.traps,
							loader: P.loader,
							shimCompileMs: P.shimCompileMillis,
							shimInstMs: P.shimInstantiateMillis,
							guestInstMs: P.guestInstantiateMillis,
							installs: P.installCount,
							fill: P.fillStats,
							reuse: P.shim.exports.gex_reuse_stat
								? [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((e) =>
										Number(P.shim.exports.gex_reuse_stat(e)),
									)
								: null,
							heapKib: Number(P.shim.exports.gex_heap_used_kib?.() ?? -1),
							memoryMib: Math.round(P.memory.buffer.byteLength / (1 << 20)),
							slotsLeftK: Number(P.shim.exports.gex_slots_left_k?.() ?? -1),
							forkCopied: P.forkCopiedBytes,
							forkSkipped: P.forkSkippedBytes,
							forkZeros: P.forkZeroBytes,
							vforkMs: t.child?.vforkMs,
							arena: P.shim.exports.gex_arena_spent_mib
								? [0, 1, 2].map((e) =>
										Number(P.shim.exports.gex_arena_spent_mib(e)),
									)
								: null,
						};
			(P.releaseWorker?.(),
				p &&
					!y &&
					!t.child?.exec &&
					(w.recycle = P.recycleMemory?.() ?? void 0),
				(w.workerRuns = s),
				(w.giveBack =
					!I.on &&
					!y &&
					!_ &&
					!i &&
					p &&
					(t.kind === `adopt` || t.kind === `run`) &&
					m >= 0 &&
					m < 128 &&
					!t.network &&
					!t.wispUrl &&
					!t.pageHosts),
				r.post(w));
		} catch (e) {
			P?.keepPromise?.();
			let n = !!P?.noSlot,
				i = ``;
			try {
				let e = n ? null : P.shim?.exports;
				if (e?.gex_current_pc && e.gex_has_host?.()) {
					let t = e.gex_current_pc();
					if (
						((i = ` at guest pc=0x${(t < 0n ? t + (1n << 64n) : t).toString(16)}`),
						e.gex_object_at)
					) {
						let n = e.gex_alloc(160) >>> 0,
							r = e.gex_object_at(t, n, 160) >>> 0;
						r && (i += ` in ${U(new Uint8Array(P.memory.buffer, n, r))}`);
					}
				}
			} catch {}
			try {
				let e = P.kernel;
				if (e?.k_panic_len?.()) {
					let n = e.k_panic_len() >>> 0,
						r = e.k_panic_ptr() >>> 0;
					i += ` -- the global kernel panicked: ${U(new Uint8Array(t.kernel.memory.buffer, r, n))}`;
				}
			} catch {}
			console.error(
				`gex: worker threw: ${e?.message ?? e}${i}\n${e?.stack ?? ``}`,
			);
			try {
				n ||
					(P?.shim?.exports?.gex_dump_state?.(),
					P?.shim?.exports?.gex_abandon?.(-9));
			} catch {}
			(I.on && P?.close?.(),
				r.post({
					kind: `threw`,
					message: (e?.message ?? String(e)) + i,
					stack: e?.stack ?? ``,
				}),
				P?.releaseWorker?.());
		}
	}
	let M = await (async () => {
		if (typeof self < `u`) return null;
		try {
			let { workerData: e } = await Promise.resolve().then(() => u(E(), 1));
			return e?.gexStart ?? null;
		} catch {
			return null;
		}
	})();
	if ((r.post({ kind: `ready` }), typeof self < `u`))
		for (let e of Object.keys(c)) d(e).catch(() => {});
	M && !t && re(M);
}
I.on
	? Be(vo)
	: lo()
			.then(vo)
			.catch((e) =>
				setTimeout(() => {
					throw e;
				}),
			);
