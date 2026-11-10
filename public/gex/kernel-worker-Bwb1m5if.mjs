var e = Object.create,
	t = Object.defineProperty,
	n = Object.getOwnPropertyDescriptor,
	r = Object.getOwnPropertyNames,
	i = Object.getPrototypeOf,
	a = Object.prototype.hasOwnProperty,
	o = (e, t) => () => (
		t || (e((t = { exports: {} }).exports, t), (e = null)),
		t.exports
	),
	s = (e, i, o, s) => {
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
	c = (n, r, o) => (
		(o = n == null ? {} : e(i(n))),
		s(
			r || !n || !n.__esModule || !a.call(n, `default`)
				? t(o, `default`, { value: n, enumerable: !0 })
				: o,
			n,
		)
	);
let l,
	u = 0;
function d(e) {
	(l === void 0 &&
		((l =
			typeof BroadcastChannel == `function`
				? new BroadcastChannel(`gex-fetch`)
				: null),
		l?.unref?.()),
		l?.postMessage(e));
}
function f(e, t = 0, n = ``) {
	if (typeof BroadcastChannel != `function`) return () => {};
	let r = `${globalThis.name ?? ``}:${u++}:${Math.random().toString(36).slice(2, 8)}`;
	try {
		d({ id: r, what: e, bytes: t, owner: n, phase: `start` });
	} catch {}
	let i = !1;
	return (t = 0) => {
		if (!i) {
			i = !0;
			try {
				d({ id: r, what: e, bytes: t, phase: `end` });
			} catch {}
		}
	};
}
function p() {
	return !1;
}
function m(e, t, n, r) {
	return -1;
}
Object.freeze([250, 1e3, 4e3]);
var h = class {
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
	},
	g = o((e, t) => {
		t.exports = {};
	});
let _ = null;
function v(e, t, n, r, i) {
	let a = {}.GEX_NODE_LAZY && globalThis.process.getBuiltinModule?.(`node:fs`);
	if (!a) return -1;
	let o = Number({}.GEX_LAZY_DELAY_MS || 0);
	o > 0 &&
		Atomics.wait((_ ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, o);
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
new h();
const y = new h();
function b(e, t) {
	y.held(e) || (y.failed(e), console.error(t));
}
function x(e, t, n, r, i) {
	let a = S(e),
		o = a.lastIndexOf(`#`);
	if (o < 0 || typeof XMLHttpRequest != `function`) return -1;
	let s = a.slice(0, o);
	return (
		Number(a.slice(o + 1)) + t,
		p() || b(s, `[lazy] ${s}: the zstd decoder is not loaded (lazyReady)`),
		-1
	);
}
const S = (e) => {
		try {
			return new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.GEX_BASE ?? globalThis.location?.href,
			).href;
		} catch {
			return e;
		}
	},
	C = new Map();
function w(e, t = !1, n = null) {
	let r =
			typeof SharedArrayBuffer < `u` && e.buffer instanceof SharedArrayBuffer,
		i = t ? n?.m32 : n?.m64;
	i &&
		(typeof SharedArrayBuffer < `u` &&
			i.buffer instanceof SharedArrayBuffer) !== r &&
		(i = null);
	let a = `${t ? 32 : 64}:${r}`;
	return (
		(i ??= C.get(a)),
		i ||
			((i = t
				? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: r })
				: new WebAssembly.Memory({
						address: `i64`,
						initial: 0n,
						maximum: 0n,
						shared: r,
					})),
			C.set(a, i)),
		t ? { process: i, process64: e } : { process: e, process64: i }
	);
}
Object.freeze({ tty: 0, hostx: 1, persist: 2, fsOpened: 3 });
function T(e, t) {
	let n = t >>> 0,
		r = e.__tls_size ? e.__tls_size.value >>> 0 : 0;
	if (r && typeof e.__wasm_init_tls == `function`) {
		let t = Math.max(16, e.__tls_align ? e.__tls_align.value >>> 0 : 16),
			i = (n - r) & -t;
		(e.__wasm_init_tls(i), (n = i));
	}
	return ((e.__stack_pointer.value = n | 0), n);
}
function E(e) {
	return (t, n, r, i, a) => {
		((t >>>= 0), (n >>>= 0), (i >>>= 0), (a >>>= 0));
		let o = Number(r),
			s = new TextDecoder().decode(new Uint8Array(e.buffer, t, n).slice()),
			c = f(s, a);
		if (s.includes(`#`)) {
			if (m(S(s), o, i, a) === a) return (c(a), a);
			let t = x(s, o, e, i, a);
			return (
				c(t > 0 ? t : 0),
				t < 0 && b(s, `[lazy] ${s}: a read failed (rest bundle)`),
				t
			);
		}
		if (m(S(s), o, i, a) === a) return (c(a), a);
		if (typeof XMLHttpRequest != `function`) {
			let t = v(s, o, e, i, a);
			return (c(t > 0 ? t : 0), t);
		}
		let l = `no response`;
		try {
			for (let t = 0; t < 3; t++)
				try {
					let t = new XMLHttpRequest();
					(t.open(`GET`, S(s), !1),
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
const D = 147472;
let O = null,
	k = null;
function A(e) {
	!e?.ctl || O || ((O = new Int32Array(e.ctl)), (k = new Uint8Array(e.ctl)));
}
function j() {
	for (;;) {
		let e = Atomics.load(O, 1);
		for (let e = 0; e < 8; e++)
			if (Atomics.compareExchange(O, (64 + e * 147472) / 4, 0, 1) === 0)
				return e;
		Atomics.wait(O, 1, e, 1e3);
	}
}
function M(e) {
	return (t, n, r, i) => {
		if (
			((t >>>= 0),
			(n >>>= 0),
			(r >>>= 0),
			(i >>>= 0),
			!O || globalThis.document || n > 147456)
		)
			return -5;
		let a;
		try {
			a = j();
		} catch {
			return -5;
		}
		let o = (64 + a * D) / 4,
			s = 64 + a * D + 16;
		for (
			k.set(new Uint8Array(e.buffer, t, n), s),
				O[o + 1] = -5,
				O[o + 2] = n,
				O[o + 3] = 0,
				Atomics.store(O, o, 2),
				Atomics.add(O, 0, 1),
				Atomics.notify(O, 0);
			;
		) {
			let e = Atomics.load(O, o);
			if (e === 4) break;
			Atomics.wait(O, o, e, 5e3);
		}
		let c = O[o + 1],
			l = Math.min(O[o + 3] >>> 0, i);
		return (
			l > 0 && new Uint8Array(e.buffer, r, l).set(k.subarray(s, s + l)),
			Atomics.store(O, o, 0),
			Atomics.add(O, 1, 1),
			Atomics.notify(O, 1),
			c
		);
	};
}
async function N(e, t, n = 16) {
	e.pageFs && A(e.pageFs);
	let r, i;
	for (let t of [!0, !1]) {
		i = new WebAssembly.Memory({ initial: n, maximum: 65535, shared: t });
		try {
			r = await WebAssembly.instantiate(e.module, {
				env: {
					memory: e.memory,
					...w(i),
					lazy_fetch: E(e.memory),
					page_fs: M(e.memory),
				},
			});
			break;
		} catch (e) {
			if (!t) throw e;
		}
	}
	let a = r.exports,
		o = typeof t == `function` ? t(a) : t;
	return (o && a.__stack_pointer && T(a, o), { k: a, mem: i });
}
let P = globalThis.postMessage ? globalThis : null;
const F = (e, t) => P.postMessage(e, t ?? []),
	I = new TextEncoder();
let L = null,
	R = null;
function z(e) {
	let t = R.buffer.byteLength;
	e > t && R.grow(Math.ceil((e - t) / 65536));
}
function B(e) {
	let t = 0,
		n = (e) => {
			let n = t;
			return ((t = (t + e + 15) & -16), z(t + 16), n);
		},
		r = [],
		i = [];
	for (let { f: t, a = [], stop: o } of e) {
		let e = L[t];
		if (typeof e != `function`) throw Error(`the kernel has no ${t}`);
		let s = [],
			c = [];
		for (let e of a)
			if (typeof e == `number` || typeof e == `bigint`) s.push(e);
			else if (e.in !== void 0 || e.ptr !== void 0) {
				let t = e.in ?? e.ptr,
					r = typeof t == `string` ? I.encode(t) : t,
					i = n(r.length);
				(new Uint8Array(R.buffer).set(r, i),
					s.push(BigInt(i)),
					e.in !== void 0 && s.push(r.length));
			} else if (e.out !== void 0 || e.outPtr !== void 0) {
				let t = e.out ?? e.outPtr,
					r = n(t);
				(s.push(BigInt(r)),
					e.out !== void 0 && s.push(t),
					c.push({ at: r, cap: t, all: e.outPtr !== void 0 }));
			} else if (e.ref !== void 0) {
				let t = r[e.ref].r;
				s.push(e.big ? BigInt(t) : Number(t));
			} else
				throw Error(
					`${t}: an argument the kernel Worker cannot pass: ${JSON.stringify(e)}`,
				);
		let l = e(...s),
			u = c.map(({ at: e, cap: t, all: n }) => {
				let r = n ? t : typeof l == `number` && l >= 0 && l <= t ? l : t,
					a = new Uint8Array(R.buffer).slice(e, e + r);
				return (i.push(a.buffer), a);
			});
		if (
			(r.push({ r: l, out: u }), o && (typeof l == `bigint` ? l < 0n : l < 0))
		)
			break;
	}
	return { value: r, transfer: i };
}
const V = {
		async start({ spec: e }) {
			return (
				({ k: L, mem: R } = await N(e, 0, 32)),
				{ value: Object.keys(L).filter((e) => typeof L[e] == `function`) }
			);
		},
		calls({ groups: e }) {
			let t = [],
				n = [];
			for (let r of e) {
				let e = B(r);
				(t.push(e.value), n.push(...e.transfer));
			}
			return { value: t, transfer: n };
		},
	},
	H = async (e) => {
		if (e?.call !== void 0)
			try {
				let { value: t, transfer: n } = await V[e.op](e);
				F({ call: e.call, value: t }, n);
			} catch (t) {
				F({
					call: e.call,
					error: { message: t?.message ?? String(t), stack: t?.stack },
				});
			}
	};
P === globalThis
	? (globalThis.onmessage = (e) => H(e.data))
	: Promise.resolve()
			.then(() => c(g(), 1))
			.then(({ parentPort: e }) => {
				((P = e), P.on(`message`, H));
			});
