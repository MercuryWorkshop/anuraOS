import { f as e, p as t, u as n } from "./internal-DhuCGrNL.mjs";
import { r } from "./page-fs-DR8goUYz.mjs";
import { i, n as a, r as o, t as s } from "./single-CjFw-sb8.mjs";
import { startAudio as c } from "./audio-BBRZ0m7J.mjs";
import { i as l, n as u, r as d, t as f } from "./page-env-BH7IngaK.mjs";
import { i as p, n as m, r as h, t as g } from "./log-BhnhOsaP.mjs";
import { n as _ } from "./options-DQnMMog3.mjs";
var v,
	y = 0;
function b(e) {
	(v === void 0 &&
		((v =
			typeof BroadcastChannel == `function`
				? new BroadcastChannel(`gex-fetch`)
				: null),
		v?.unref?.()),
		v?.postMessage(e));
}
function x(e, t = 0, n = ``) {
	if (typeof BroadcastChannel != `function`) return () => {};
	let r = `${globalThis.name ?? ``}:${y++}:${Math.random().toString(36).slice(2, 8)}`;
	try {
		b({ id: r, what: e, bytes: t, owner: n, phase: `start` });
	} catch {}
	let i = !1;
	return (t = 0) => {
		if (!i) {
			i = !0;
			try {
				b({ id: r, what: e, bytes: t, phase: `end` });
			} catch {}
		}
	};
}
var S = null;
function C() {
	return S !== null;
}
function w(e, t, n, r) {
	return -1;
}
var T = Object.freeze([250, 1e3, 4e3]),
	E = 3e4,
	D = class {
		#e = new Map();
		held(e, t = Date.now()) {
			let n = this.#e.get(e);
			return n === void 0 ? !1 : t < n || (this.#e.delete(e), !1);
		}
		failed(e, t = Date.now()) {
			this.#e.set(e, t + E);
		}
		ok(e) {
			this.#e.delete(e);
		}
	},
	ee = null;
function O(e, t = T) {
	for (let n = 0; ; n++) {
		let r = null;
		try {
			r = e();
		} catch {
			r = null;
		}
		if (r) return r;
		if (n >= t.length) return null;
		Atomics.wait((ee ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, t[n]);
	}
}
var k = null;
function te(e, t, n, r, i) {
	let a = {}.GEX_NODE_LAZY && globalThis.process.getBuiltinModule?.(`node:fs`);
	if (!a) return -1;
	let o = Number({}.GEX_LAZY_DELAY_MS || 0);
	o > 0 &&
		Atomics.wait((k ??= new Int32Array(new SharedArrayBuffer(4))), 0, 0, o);
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
var ne = 3,
	re = null,
	ie = null;
function ae() {
	return C() || !globalThis.GEX_REST_BUNDLE
		? Promise.resolve()
		: ((ie ??= n(
				async () => {
					let { ZSTDDecoder: e } = await import(
						`./zstddec-stream-wg9AJ-0L.mjs`
					);
					return { ZSTDDecoder: e };
				},
				[],
				import.meta.url,
			)
				.then(async ({ ZSTDDecoder: e }) => {
					let t = new e();
					(await t.init(), (re = t));
				})
				.catch((e) => {
					console.error(`[lazy] no zstd decoder: ${e?.message ?? e}`);
				})),
			ie);
}
var oe = new Map(),
	se = new D(),
	ce = new D();
function le(e, t) {
	ce.held(e) || (ce.failed(e), console.error(t));
}
function ue(e, t) {
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
function de(e) {
	let t = oe.get(e);
	if (t) return t;
	let n = `${e}.json`;
	if (se.held(n)) return null;
	let r = O(() => {
		let e = JSON.parse(new TextDecoder().decode(ue(n)));
		return Array.isArray(e.frames) ? e : null;
	});
	if (!r) return (se.failed(n), console.error(`[lazy] ${n}: no answer`), null);
	let i = { frame: r.frame, frames: r.frames, kept: new Map() };
	return (oe.set(e, i), i);
}
function fe(e, t, n, r, i) {
	let a = pe(e),
		o = a.lastIndexOf(`#`);
	if (o < 0 || typeof XMLHttpRequest != `function`) return -1;
	let s = a.slice(0, o),
		c = Number(a.slice(o + 1)) + t;
	if (!re)
		return (
			C() || le(s, `[lazy] ${s}: the zstd decoder is not loaded (lazyReady)`),
			-1
		);
	let l = de(s);
	if (!l) return -1;
	let u = Math.floor(c / l.frame),
		d = Math.floor((c + i - 1) / l.frame),
		f = [];
	for (let e = u; e <= d; e++) l.kept.has(e) || f.push(e);
	if (f.length) {
		if (f.some((e) => se.held(`${s}#${e}`))) return -1;
		let e = l.frames[f[0]][0],
			t = l.frames[f.at(-1)][0] + l.frames[f.at(-1)][1],
			n = O(() => ue(s, [e, t]));
		if (!n) {
			for (let e of f) se.failed(`${s}#${e}`);
			return -1;
		}
		for (let t of f) {
			let [r, i] = l.frames[t],
				a = t === l.frames.length - 1 ? 0 : l.frame;
			for (
				l.kept.set(t, re.decode(n.subarray(r - e, r - e + i), a));
				l.kept.size > Math.max(ne, d - u + 1);
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
var pe = (e) => {
		try {
			return new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.GEX_BASE ?? globalThis.location?.href,
			).href;
		} catch {
			return e;
		}
	},
	me = new Map();
function he(e = !0) {
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
function ge(e, t = !1, n = null) {
	let r =
			typeof SharedArrayBuffer < `u` && e.buffer instanceof SharedArrayBuffer,
		i = t ? n?.m32 : n?.m64;
	i &&
		(typeof SharedArrayBuffer < `u` &&
			i.buffer instanceof SharedArrayBuffer) !== r &&
		(i = null);
	let a = `${t ? 32 : 64}:${r}`;
	return (
		(i ??= me.get(a)),
		i ||
			((i = t
				? new WebAssembly.Memory({ initial: 0, maximum: 0, shared: r })
				: new WebAssembly.Memory({
						address: `i64`,
						initial: 0n,
						maximum: 0n,
						shared: r,
					})),
			me.set(a, i)),
		t ? { process: i, process64: e } : { process: e, process64: i }
	);
}
var _e = Object.freeze({ tty: 0, hostx: 1, persist: 2, fsOpened: 3 });
function ve(e, t) {
	let n = e.k_stack_area() >>> 0,
		r = e.k_stack_size() >>> 0;
	return n + ((e.k_stack_count() >>> 0) - _e[t]) * r;
}
function ye(e, t) {
	let n = t >>> 0,
		r = e.__tls_size ? e.__tls_size.value >>> 0 : 0;
	if (r && typeof e.__wasm_init_tls == `function`) {
		let t = Math.max(16, e.__tls_align ? e.__tls_align.value >>> 0 : 16),
			i = (n - r) & -t;
		(e.__wasm_init_tls(i), (n = i));
	}
	return ((e.__stack_pointer.value = n | 0), n);
}
function be(e) {
	return (t, n, r, i, a) => {
		((t >>>= 0), (n >>>= 0), (i >>>= 0), (a >>>= 0));
		let o = Number(r),
			s = new TextDecoder().decode(new Uint8Array(e.buffer, t, n).slice()),
			c = x(s, a);
		if (s.includes(`#`)) {
			if (w(pe(s), o, i, a) === a) return (c(a), a);
			let t = fe(s, o, e, i, a);
			return (
				c(t > 0 ? t : 0),
				t < 0 && le(s, `[lazy] ${s}: a read failed (rest bundle)`),
				t
			);
		}
		if (w(pe(s), o, i, a) === a) return (c(a), a);
		if (typeof XMLHttpRequest != `function`) {
			let t = te(s, o, e, i, a);
			return (c(t > 0 ? t : 0), t);
		}
		let l = `no response`;
		try {
			for (let t = 0; t < 3; t++)
				try {
					let t = new XMLHttpRequest();
					(t.open(`GET`, pe(s), !1),
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
var xe = () => !!globalThis.navigator?.storage?.getDirectory,
	A = () => (typeof process < `u` ? {}.GEX_XCACHE_DIR : void 0);
async function j(e) {
	try {
		if (xe()) {
			let t = await (await navigator.storage.getDirectory()).getFileHandle(e);
			return new Uint8Array(await (await t.getFile()).arrayBuffer());
		}
		let r = A();
		if (r) {
			let i = await n(
				() =>
					import(`./__vite-browser-external-6NL05v10.mjs`).then((e) =>
						t(e.default, 1),
					),
				[],
				import.meta.url,
			);
			return new Uint8Array(await i.readFile(`${r}/${e}`));
		}
	} catch {}
	return null;
}
async function Se(e, r) {
	if (xe()) {
		let t = await (
			await navigator.storage.getDirectory()
		).getFileHandle(e, { create: !0 });
		if (t.createSyncAccessHandle) {
			let e = await t.createSyncAccessHandle();
			try {
				(e.truncate(0), e.write(r, { at: 0 }), e.flush());
			} finally {
				e.close();
			}
		} else {
			let e = await t.createWritable();
			(await e.write(r), await e.close());
		}
		return !0;
	}
	let i = A();
	if (i) {
		let a = await n(
			() =>
				import(`./__vite-browser-external-6NL05v10.mjs`).then((e) =>
					t(e.default, 1),
				),
			[],
			import.meta.url,
		);
		await a.mkdir(i, { recursive: !0 });
		let o = `${i}/${e}.${process.pid}.${Date.now()}`;
		return (await a.writeFile(o, r), await a.rename(o, `${i}/${e}`), !0);
	}
	return !1;
}
function M(...e) {
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
var Ce = 1 << 30;
function we() {
	try {
		return new Int32Array(new SharedArrayBuffer(8));
	} catch {
		return;
	}
}
function Te(e) {
	for (;;) {
		let t = Atomics.load(e, 0);
		if (t & 1073741824) return !1;
		if (Atomics.compareExchange(e, 0, t, t + 1) === t) return !0;
	}
}
function N(e) {
	Atomics.sub(e, 0, 1);
}
function P(e) {
	return e ? Atomics.load(e, 0) & -1073741825 : 0;
}
var F = (e) => new Promise((t) => setTimeout(t, e)),
	I = 4294901760,
	L = () => !!globalThis.GEX_MEM64,
	Ee = 4096,
	De = 8192,
	Oe = !!{}.GEX_TEST_KEEP_PROBE,
	ke = () =>
		Number(globalThis.GEX_TEST_FTAB_SPARE ?? {}.GEX_TEST_FTAB_SPARE ?? 0),
	Ae = 16 * 2 ** 30,
	je = 262144,
	R = (e) => (L() ? BigInt(e >>> 0) : e | 0),
	z = (e) => (typeof e == `bigint` ? Number(e) : e >>> 0),
	Me = (e) => (typeof e == `bigint` ? e : BigInt(e >>> 0));
function Ne(e, t, n) {
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
					a = Fe.decode(e.slice(r, n));
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
				n = Pe(t.length) + t.reduce((e, t) => e + t.b - t.a, 0);
			(y.push(7), b(n), b(t.length), C());
			for (let n of t) S.push(e.subarray(n.a, n.b));
		} else if (t === 9 && v.length) {
			r = p[0];
			let t = i(),
				n = e.subarray(r, p[1]),
				a = T();
			(y.push(9),
				b(Pe(t + v.length) + n.length + a.length),
				b(t + v.length),
				C(),
				S.push(n, Uint8Array.from(a)));
		} else S.push(e.subarray(n, a));
		if (o + 1 === m && !p && v.length) {
			let e = T();
			(y.push(9),
				b(Pe(v.length) + e.length),
				b(v.length),
				C(),
				S.push(Uint8Array.from(e)));
		}
	}),
		C());
	let E = S.reduce((e, t) => e + t.length, 0),
		D = new Uint8Array(E),
		ee = 0;
	for (let e of S) (D.set(e, ee), (ee += e.length));
	return D;
}
var Pe = (e) => {
		let t = 1;
		for (; e >= 128; ) ((e = Math.floor(e / 128)), t++);
		return t;
	},
	B = (e) => (L() ? BigInt(e) : e),
	Fe = new TextDecoder();
function Ie(e) {
	return {
		u8: new Uint8Array(e),
		i32: new Int32Array(e, 0, Math.floor(e.byteLength / 4)),
		dv: new DataView(e),
	};
}
function V(e) {
	return Fe.decode(H(e.buffer) ? e.slice() : e);
}
var Le = globalThis.SharedArrayBuffer;
function H(e) {
	return typeof Le == `function` && e instanceof Le;
}
var Re = [32, 16, 8, 4].map((e) => e * 1024 * 1024 * 1024),
	ze = 20,
	Be = 20,
	Ve = 1e3,
	He = () =>
		Number(
			globalThis.GEX_TEST_SPARE_MODULES ?? {}.GEX_TEST_SPARE_MODULES ?? 0,
		) || ze;
function Ue() {
	if (
		typeof SharedArrayBuffer > `u` ||
		typeof SharedArrayBuffer.prototype.grow != `function`
	)
		return null;
	for (let e of Re)
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
var We = !1;
function Ge(e, t) {
	let n = t.length,
		r = Number(
			Atomics.add(new BigInt64Array(e, 0, 1), 0, BigInt((n + 7) & -8)),
		),
		i = r + n;
	if (i > e.maxByteLength)
		return (
			We ||
				((We = !0),
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
					We ||
						((We = !0),
						console.error(
							`[gex] module store would not grow to ${(i / 1048576).toFixed(0)} MiB (${n?.message ?? n}): the translated-module registry keeps its bytes in the shim heap from here`,
						)),
					-1
				);
		}
	}
	return (new Uint8Array(e, r, n).set(t), r);
}
function U(e) {
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
var Ke = 117440512,
	qe = 100663296,
	Je = 4,
	Ye = 1 << 20,
	Xe = 352,
	Ze = 256,
	Qe = 32,
	$e = 64n << 10n,
	et = 4194289n,
	tt = 512n,
	nt = 4194290n;
function rt(e, t) {
	console.error(`[${e}] starting a thread: ${t?.message ?? t}`);
}
function it(e, t) {
	return t ? (e?.dense === 2 ? 2 : 1) : 0;
}
var at = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 10, 2, 96, 1, 127, 0, 96, 2, 127, 127, 0, 2,
		7, 1, 1, 119, 1, 102, 0, 0, 3, 2, 1, 1, 7, 5, 1, 1, 101, 0, 1, 10, 8, 1, 6,
		0, 32, 0, 18, 0, 11,
	]),
	ot = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 1, 127, 0, 2, 20, 2, 1, 119, 5,
		99, 111, 117, 110, 116, 0, 0, 1, 119, 4, 114, 101, 97, 108, 0, 0, 3, 2, 1,
		0, 7, 5, 1, 1, 99, 0, 2, 10, 12, 1, 10, 0, 32, 0, 16, 0, 32, 0, 18, 1, 11,
	]),
	st = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 11, 2, 96, 2, 127, 127, 0, 96, 1, 127, 1,
		127, 2, 26, 3, 1, 119, 3, 111, 108, 100, 0, 0, 1, 119, 3, 104, 105, 116, 0,
		1, 1, 119, 3, 97, 114, 109, 3, 127, 0, 3, 2, 1, 0, 7, 5, 1, 1, 99, 0, 2, 10,
		27, 1, 25, 0, 32, 1, 35, 0, 70, 4, 64, 32, 0, 16, 1, 4, 64, 15, 11, 0, 11,
		32, 0, 32, 1, 18, 0, 11,
	]),
	ct = null,
	lt = null,
	ut = new Uint8Array([
		0, 97, 115, 109, 1, 0, 0, 0, 1, 8, 1, 96, 3, 127, 127, 126, 1, 127, 2, 21,
		2, 1, 101, 4, 104, 111, 111, 107, 1, 112, 0, 1, 1, 101, 4, 115, 108, 111,
		119, 0, 0, 3, 3, 2, 0, 0, 7, 21, 2, 4, 115, 108, 111, 119, 0, 1, 10, 101,
		110, 116, 114, 121, 95, 99, 97, 108, 108, 0, 2, 9, 7, 1, 0, 65, 0, 11, 1, 1,
		10, 26, 2, 10, 0, 32, 0, 32, 1, 32, 2, 18, 0, 11, 13, 0, 32, 0, 32, 1, 32,
		2, 65, 0, 19, 0, 0, 11,
	]),
	dt = Array(32768).fill(0),
	ft = function () {
		return 1;
	};
function pt() {
	try {
		return Reflect.apply(ft, null, dt);
	} catch (e) {
		if (e instanceof RangeError) return 0;
		throw e;
	}
}
var mt = null,
	ht = new Map();
function gt(e, t) {
	let n = (e ? 2 : 0) | !!t,
		r = ht.get(n);
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
	return ((r = new WebAssembly.Module(s)), ht.set(n, r), r);
}
var _t = new Map(),
	vt = !!{}.GEX_SNAP_TRACE,
	W = 24,
	yt = 32,
	bt = 40,
	xt = 16,
	G = 131072,
	St = 128,
	Ct = 2048,
	wt = 245760,
	Tt = Object.freeze({ snapNest: !0 });
function Et(e, t) {
	let n = (e ? 2 : 0) | !!t,
		r = _t.get(n);
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
	return ((r = new WebAssembly.Module(u)), _t.set(n, r), r);
}
function Dt(e, t, n, r) {
	let i = e.length + t;
	(i > 1 << 20 &&
		console.warn(`[gex] dispatch table ${r} grows ${e.length} -> ${i} entries`),
		e.grow(t, n));
}
function Ot() {
	return Number(globalThis.GEX_ADOPT_AFTER ?? 1);
}
var kt = `gexfill`,
	K = `gexfillat`;
function At(e, t = !1) {
	if (!(!t && !m(`debug`))) {
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
		Mt(e);
	}
}
function jt(e) {
	m(`debug`) && Mt(e);
}
function Mt(e) {
	let t = typeof process < `u` ? process.getBuiltinModule?.(`fs`) : null;
	if (t?.writeSync)
		try {
			t.writeSync(2, `${e}\n`);
			return;
		} catch {}
	let n = typeof process < `u` ? process.stderr : null;
	n?.write ? n.write(`${e}\n`) : console.debug(e);
}
var q = 2,
	Nt = 4096 >> q;
function Pt(e) {
	let t = e?.gex_inst_align_shift?.();
	typeof t == `number` && t >= 0 && t <= 2 && ((q = t), (Nt = 4096 >> t));
}
var Ft = `gexfillall`;
function It(e, t, n) {
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
var Lt = 1048576,
	Rt = 3145728,
	zt = 2 ** 32,
	Bt = zt + 17 * 2 ** 20,
	Vt = () => (L() ? zt : Lt),
	Ht = () => (L() ? Ae / 4096 : 524288),
	Ut = I / 65536;
function Wt() {
	let e = globalThis.GEX_MEM_MAX_MIB ?? {}.GEX_MEM_MAX_MIB;
	if (e) return Math.max(Gt, Math.min(Ut, Math.floor(Number(e) * 16)));
}
var Gt = Ke / 65536;
function Kt(e) {
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
function qt(e) {
	return e.len ?? e.bytes?.byteLength ?? 0;
}
function Jt(e) {
	let t = new Uint32Array(
			e.buffer ?? e,
			e.byteOffset ?? 0,
			Math.floor(e.byteLength / 4),
		),
		n = 2166136261;
	for (let e = 0; e < t.length; e++) n = Math.imul(n ^ t[e], 16777619);
	return n >>> 0;
}
function Yt(e) {
	if (!e || e.length < 32) return 0;
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength);
	return Number(t.getBigUint64(24, !0));
}
var Xt = [`main`, `__main_argc_argv`, `__original_main`];
function Zt(e) {
	return ($t(e) ?? 0) & 3;
}
function Qt(e) {
	if ($t(e) === null) return null;
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
function $t(e) {
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
var en = BigInt(Math.round(performance.timeOrigin * 1e3)) * 1000n;
function tn() {
	return en + BigInt(Math.round(performance.now() * 1e6));
}
var nn = class {
	write(e, t) {
		let n = V(t);
		e === 2 ? console.error(n) : console.log(n);
	}
	now() {
		return tn();
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
function rn(e) {
	if (!e || e.byteLength < 48) return [];
	let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
		n = Number(t.getBigUint64(40, !0)),
		r = [],
		i = 48;
	for (let a = 0; a < n && i + 12 <= e.byteLength; a++, i += 12) {
		let e = t.getUint32(i + 8, !0),
			n = e >>> 24,
			a = (e & 16777215) + Nt;
		r[n] >= a || (r[n] = a);
	}
	return r;
}
function an(e) {
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
function on(e) {
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
			if (r === 9 && V(e.subarray(t, t + r)) === `gex.dense`) return t + r;
		}
		t = a;
	}
	return -1;
}
function sn(e) {
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
			if (V(e.subarray(n, n + t)) === `gex.dense`) return e.slice(n + t, o);
		}
		n = o;
	}
	return null;
}
function cn(e) {
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
			if (V(e.subarray(n, n + t)) === `gex.meta`) return e.slice(n + t, o);
		}
		n = o;
	}
	return null;
}
var J = [
		`dispatch`,
		`dispatch1`,
		`dispatch2`,
		`dispatch3`,
		`dispatch4`,
		`dispatch5`,
		`dispatch6`,
		`dispatch7`,
	],
	ln = class extends Error {
		constructor(e) {
			(super(`gex.provider_throw(${e}) with no gex.provider_try to catch it`),
				(this.code = e));
		}
	};
function un(e) {
	let t = globalThis.GEX_VFORK_TRACE || {}.GEX_VFORK_TRACE;
	t &&
		(typeof t == `string` &&
		t.includes(`/`) &&
		globalThis.process?.getBuiltinModule
			? globalThis.process.getBuiltinModule(`fs`).appendFileSync(t, `${e}\n`)
			: console.error(e));
}
(class e {
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
		e = new nn(),
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
				(L()
					? new WebAssembly.Memory({
							address: `i64`,
							initial: BigInt(Gt),
							maximum: BigInt(Ae / 65536),
							shared: t,
						})
					: new WebAssembly.Memory({
							initial: Gt,
							maximum: Wt() ?? Ut,
							shared: t,
						}))),
			(this.#ye = r));
	}
	#Be() {
		if (this.#we === null) {
			if (
				typeof this.#t.exports.gex_worker_init?.call == `function` &&
				(H(this.#e.buffer) || o.on)
			) {
				let e = Atomics.add(new Int32Array(this.#e.buffer), 262096, 1) & 31;
				this.#t.exports.__stack_pointer.value = R(qe - e * 262144);
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
			if ((this.keepPromise(), e === 0 && (H(this.#e.buffer) || o.on)))
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
			this.#e.grow(L() ? BigInt(n) : n);
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
			L() ||
			o.on ||
			!H(this.#e.buffer)
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
			r = V(this.#Ye().subarray(t, t + n));
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
			r = V(this.#Ye().subarray(t, t + n));
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
				(this.#p || m(`debug`)) &&
				At(
					V(this.#Ye().subarray(e >>> 0, (e >>> 0) + (t >>> 0))).replace(
						/\n$/,
						``,
					),
					this.#p,
				),
			warn: (e, t) => {
				let n = V(this.#Ye().subarray(e >>> 0, (e >>> 0) + (t >>> 0))).replace(
					/\n$/,
					``,
				);
				if (n.startsWith(`[gex-note] `)) {
					console.warn(n.slice(11));
					return;
				}
				if (n.startsWith(`[gex-info] `)) {
					p() && console.info(`[gex] ${n.slice(11)}`);
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
						(this.#r.noteStatus?.({ kind: `module`, path: r[1] }), !m(`debug`))
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
			clock_origin: () => en,
			call_out: o.on
				? new WebAssembly.Suspending((e, t, n, r) =>
						this.#ra()
							? this.#Zi(e >>> 0, t, n, r)
							: this.#Qi(e >>> 0, t, n, r),
					)
				: (e, t, n, r) => this.#Zi(e >>> 0, t, n, r),
			ftab_call: o.on
				? new WebAssembly.Suspending((e, t, n, r, i) => {
						this.#tn.length && this.#rn(e >>> 0);
						let a = this.#Gt.ftab.get(B(e >>> 0));
						return this.#ra() ? a(t, n, r, i) : this.#na(a)(t, n, r, i);
					})
				: (e, t, n, r, i) => (
						this.#tn.length && this.#rn(e >>> 0),
						this.#Gt.ftab.get(B(e >>> 0))(t, n, r, i)
					),
			ftab_call_vi: (e, t) => {
				(this.#tn.length && this.#rn(e >>> 0),
					this.#Gt.ftab.get(B(e >>> 0))(t));
			},
			entry_call: o.on ? (e, t, n) => 0 : this.#zn(),
			snap_ok: () => this.#yr(),
			cgen_serve: () => this.#mi(),
			thread_start: () => this.#Tt(),
			fault_call: (e, t, n, r, i, a) => {
				if (o.on) return 0;
				let s = this.#Gt.ftab.get(B(e >>> 0)),
					c = this.#In ?? this.#Gn(),
					l = c.value;
				if (typeof l == `bigint`) {
					let e = BigInt.asUintN(64, a);
					c.value = ((l !== 0n && l < e ? l : e) - 4096n) & -16n;
				} else {
					let e = Number(a & 4294967295n),
						t = Number(l) >>> 0;
					c.value = (((t !== 0 && t < e ? t : e) - 4096) & -16) | 0;
				}
				try {
					let o =
						this.#t.exports.gex_guest_x86_64?.() === 1
							? BigInt.asUintN(64, r)
							: Number(BigInt.asUintN(32, r)) | 0;
					this.#vr
						? this.#cr(s, e >>> 0, t, n, o, i, BigInt.asUintN(64, a))
						: s(t, n, o, i);
				} finally {
					c.value = l;
				}
				return 1;
			},
			stack_room: () => pt(),
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
				let i = V(this.#Ye().subarray(t >>> 0, (t >>> 0) + (n >>> 0)));
				this.#o?.connect(e, i, r);
			},
			net_status: (e) => (this.#o ? this.#o.status(e) : 2),
			net_send: (e, t, n) =>
				this.#o
					? this.#o.send(e, this.#Ye().subarray(z(t), z(t) + (n >>> 0)))
					: -1,
			net_recv: (e, t, n) =>
				this.#o
					? this.#o.recv(e, this.#Ye().subarray(z(t), z(t) + (n >>> 0)))
					: 0,
			net_peek: (e, t, n) =>
				this.#o?.peek
					? this.#o.peek(e, this.#Ye().subarray(z(t), z(t) + (n >>> 0)))
					: this.#o
						? -2
						: 0,
			net_avail: (e) => (this.#o ? +!!this.#o.available(e) : 1),
			net_close: (e) => this.#o?.close(e),
			net_dup: (e) => (this.#s && this.#o?.dup ? this.#o.dup(e) : 0),
			gl_submit: o.on
				? new WebAssembly.Suspending((e) =>
						this.#c
							? this.#c.submit(this.#e, e, this.wlToken(), !1, this.#Vt)
							: -1,
					)
				: (e) =>
						this.#c
							? this.#c.submit(this.#e, e, this.wlToken(), !1, this.#Vt)
							: -1,
			gl_submit_async: o.on
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
	async load(t, n, r, i = {}, a = [], s = {}) {
		let c = Zt(r);
		(c && (this.#de = -1),
			(this.#pe = $t(r) & 3 ? null : Qt(r)),
			(this.#fe = !!(c & 2)));
		let l = t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t);
		(await this.#st(),
			(this.#t = await WebAssembly.instantiate(l, {
				env: { memory: this.#e },
				gex_env: this.#Xe(),
				gex_k: this.#gt(l),
			})),
			(this.#i = null),
			(this.#t.exports.__stack_pointer.value = R(this.#Be())));
		let u = [
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
		if (u.length)
			throw Error(
				`the gex runtime is out of date: it has no ${u.join(`, `)}. Rebuild it with web/build-assets.sh and reload.`,
			);
		if (
			(this.#t.exports.gex_set_gl?.(+!!this.#c),
			this.#t.exports.gex_set_d3d?.(+!!this.#l),
			this.#Ht && this.#t.exports.gex_cgen_set_mode?.(this.#Ht),
			m(`serveall`) && this.#t.exports.gex_cgen_serve_always?.(1),
			m(`record`) && this.#t.exports.gex_cgen_set_record?.(1),
			this.#Wt && this.#t.exports.gex_elfprov_off?.(),
			this.#Ut(),
			this.#t.exports.gex_set_wl?.(+!!this.#u),
			this.#xi && this.#t.exports.gex_set_wl_output?.(...this.#xi),
			this.#xi && this.#t.exports.gex_set_wl_scale?.(this.#Si),
			this.#t.exports.gex_set_network?.(+!!this.#o),
			this.#t.exports.gex_set_cpus?.(
				s.cpus || globalThis.navigator?.hardwareConcurrency || 1,
			),
			e.watchDir >= 0 && this.#t.exports.gex_watch_dir?.(BigInt(e.watchDir)),
			(this.#t.exports.__stack_pointer.value = R(this.#Be())),
			(this.#_e = {
				strace: s.strace,
				stracePid: s.stracePid,
				straceExe: s.straceExe,
				tty: s.tty,
				uid: s.uid,
				gid: s.gid,
				traceBlocks: s.traceBlocks,
				traceMisses: s.traceMisses,
				checkSp: s.checkSp,
				dlChecked: s.dlChecked,
				jitDiag: s.jitDiag,
				watchMem: s.watchMem,
				noIntrinsics: s.noIntrinsics,
				intrinsicMask: s.intrinsicMask,
				liftMax: s.liftMax,
				inlineDispatch: s.inlineDispatch,
				xlateReport: s.xlateReport,
				discoverSkip: s.discoverSkip,
				t1Fold: s.t1Fold,
			}),
			Pt(this.#t.exports),
			s.strace && (this.#t.exports.gex_set_trace(1), (this.#p = !0)),
			s.jit === !1)
		) {
			if (!this.#t.exports.gex_set_jit)
				throw Error(`this gex runtime cannot turn translation off`);
			this.#t.exports.gex_set_jit(0);
		}
		if (
			(s.liftMax && this.#t.exports.gex_set_lift_max?.(s.liftMax),
			s.inlineDispatch && this.#t.exports.gex_set_inline_dispatch?.(1),
			s.xlateReport && this.#t.exports.gex_set_xlate_report?.(s.xlateReport),
			s.discoverSkip && this.#t.exports.gex_set_discover_skip?.(s.discoverSkip),
			s.t1Fold && this.#t.exports.gex_set_t1_fold?.(1),
			s.link && this.#t.exports.gex_set_snapshot?.(Number(s.link)),
			s.tty && this.#t.exports.gex_set_tty(1),
			s.uid !== void 0 &&
				this.#t.exports.gex_set_identity(s.uid, s.gid ?? s.uid),
			this.#_t(n),
			s.cwd)
		) {
			let e = new TextEncoder().encode(s.cwd),
				t = this.#t.exports.gex_alloc(e.length) >>> 0;
			(this.#Ye().set(e, t), this.#t.exports.gex_set_cwd(t, e.length));
		}
		if (s.stdin && s.stdin.length) {
			let e = this.#t.exports.gex_alloc(s.stdin.length) >>> 0;
			(this.#Ye().set(s.stdin, e),
				this.#t.exports.gex_set_stdin(e, s.stdin.length));
		}
		let d = new TextEncoder(),
			f = this.#t.exports.gex_free;
		for (let e of s.dirs ?? []) {
			let t = d.encode(e),
				n = this.#t.exports.gex_alloc(t.length) >>> 0;
			(this.#Ye().set(t, n),
				this.#t.exports.gex_add_dir?.(n, t.length),
				f?.(n, t.length));
		}
		let p = s.modes ?? {};
		for (let e of s.env ?? []) {
			let t = d.encode(e),
				n = this.#t.exports.gex_alloc(t.length) >>> 0;
			(this.#Ye().set(t, n),
				this.#t.exports.gex_add_env?.(n, t.length),
				f?.(n, t.length));
		}
		let h = 16 << 20,
			g = 0;
		for (let [e, t] of Object.entries(i)) {
			let n = d.encode(e),
				r = t instanceof Uint8Array ? t : d.encode(t);
			if (r.length > h && this.#t.exports.gex_add_file_part) {
				let t = this.#t.exports.gex_alloc(n.length) >>> 0;
				(this.#Ye().set(n, t), (g ||= this.#t.exports.gex_alloc(h) >>> 0));
				for (let e = 0; e < r.length; e += h) {
					let i = r.subarray(e, Math.min(e + h, r.length));
					(this.#Ye().set(i, g),
						this.#t.exports.gex_add_file_part(
							t,
							n.length,
							BigInt(e),
							g,
							i.length,
						));
				}
				(p[e] !== void 0 && this.#t.exports.gex_chmod?.(t, n.length, p[e]),
					f?.(t, n.length));
				continue;
			}
			let i = this.#t.exports.gex_alloc(n.length) >>> 0,
				a = this.#t.exports.gex_alloc(r.length) >>> 0;
			(this.#Ye().set(n, i),
				this.#Ye().set(r, a),
				this.#t.exports.gex_add_file(i, n.length, a, r.length),
				p[e] !== void 0 && this.#t.exports.gex_chmod?.(i, n.length, p[e]),
				f?.(i, n.length),
				f?.(a, r.length));
		}
		g && f?.(g, h);
		for (let e of s.dirs ?? []) {
			if (p[e] === void 0) continue;
			let t = d.encode(e),
				n = this.#t.exports.gex_alloc(t.length) >>> 0;
			(this.#Ye().set(t, n),
				this.#t.exports.gex_chmod?.(n, t.length, p[e]),
				f?.(n, t.length));
		}
		for (let [e, t, n, r] of s.lazy ?? []) {
			if (!this.#t.exports.gex_add_lazy) break;
			if (i[e] !== void 0 && !(r && i[e].length === r)) continue;
			let a = d.encode(e),
				o = d.encode(n),
				s = this.#t.exports.gex_alloc(a.length) >>> 0,
				c = this.#t.exports.gex_alloc(o.length) >>> 0;
			(this.#Ye().set(a, s),
				this.#Ye().set(o, c),
				this.#t.exports.gex_add_lazy(s, a.length, c, o.length, BigInt(t)),
				p[e] !== void 0 && this.#t.exports.gex_chmod?.(s, a.length, p[e]),
				f?.(s, a.length),
				f?.(c, o.length));
		}
		for (let [e, t] of Object.entries(s.hard ?? {})) {
			let n = d.encode(e),
				r = d.encode(t),
				a = this.#t.exports.gex_alloc(n.length) >>> 0,
				o = this.#t.exports.gex_alloc(r.length) >>> 0;
			(this.#Ye().set(n, a), this.#Ye().set(r, o));
			let s = this.#t.exports.gex_add_hardlink?.(o, r.length, a, n.length) ?? 0,
				c = i[t];
			if (!s && c) {
				let e = this.#t.exports.gex_alloc(c.length) >>> 0;
				(this.#Ye().set(c, e),
					this.#t.exports.gex_add_file(a, n.length, e, c.length),
					f?.(e, c.length));
			}
			(p[t] !== void 0 && this.#t.exports.gex_chmod?.(a, n.length, p[t]),
				f?.(a, n.length),
				f?.(o, r.length));
		}
		for (let [e, t] of Object.entries(s.symlinks ?? {})) {
			let n = d.encode(e),
				r = d.encode(t),
				i = this.#t.exports.gex_alloc(n.length) >>> 0,
				a = this.#t.exports.gex_alloc(r.length) >>> 0;
			(this.#Ye().set(n, i),
				this.#Ye().set(r, a),
				this.#t.exports.gex_add_symlink(a, r.length, i, n.length) ||
					console.warn(`gex: symlink ${e} -> ${t} not made (no global kernel)`),
				f?.(i, n.length),
				f?.(a, r.length));
		}
		for (let [e, t] of Object.entries(s.mtimes ?? {})) {
			if (!this.#t.exports.gex_set_mtime) break;
			let n = d.encode(e),
				r = this.#t.exports.gex_alloc(n.length) >>> 0;
			(this.#Ye().set(n, r),
				this.#t.exports.gex_set_mtime(r, n.length, BigInt(Math.trunc(t))),
				f?.(r, n.length));
		}
		for (let [e, t] of Object.entries(s.xattrs ?? {})) {
			if (!this.#t.exports.gex_set_xattr) break;
			for (let [n, r] of Object.entries(t)) {
				let t = d.encode(e),
					i = d.encode(n),
					a = r instanceof Uint8Array ? r : d.encode(String(r)),
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
					f?.(o, t.length + i.length + a.length));
			}
		}
		if (s.program && this.#t.exports.gex_set_image_program) {
			let e = d.encode(s.program),
				t = this.#t.exports.gex_alloc(e.length) >>> 0;
			(this.#Ye().set(e, t),
				this.#t.exports.gex_set_image_program(t, e.length),
				f?.(t, e.length));
		}
		if (s.exe) {
			if (!this.#t.exports.gex_set_exe)
				throw Error(`this gex runtime cannot be told the program path`);
			let e = d.encode(s.exe),
				t = this.#t.exports.gex_alloc(e.length) >>> 0;
			(this.#Ye().set(e, t),
				this.#t.exports.gex_set_exe(t, e.length),
				f?.(t, e.length));
		}
		let _ = this.#t.exports.gex_pin_object;
		for (let [e, t] of Object.entries(s.pins ?? {})) {
			if (!_) break;
			let n = d.encode(e),
				r = this.#t.exports.gex_alloc(n.length) >>> 0;
			(this.#Ye().set(n, r),
				_(r, n.length, BigInt(t.base ?? t), BigInt(t.span ?? 0)),
				f?.(r, n.length));
		}
		let v = this.#t.exports.gex_alloc(r.length) >>> 0;
		this.#Ye().set(r, v);
		let y = new TextEncoder().encode(a.join(`\0`)),
			b = 0;
		(y.length &&
			((b = this.#t.exports.gex_alloc(y.length) >>> 0), this.#Ye().set(y, b)),
			globalThis.GEX_DEBUG_EXIT &&
				console.error(
					`[gex] load: ${Object.keys(s.pins ?? {}).length} pins, ${Object.keys(i).length} files staged, loading the program`,
				));
		let x = this.#t.exports.gex_load(v, r.length, b, y.length);
		if (x === 0n) throw Error(`gex: could not load the program`);
		(s.xcache && (await this.#mt(String(s.xcache))),
			globalThis.GEX_DEBUG_EXIT &&
				console.error(
					`[gex] load: program at ${x}, ${(s.closure ?? []).length} closure modules to install`,
				),
			(this.#He = s.closure ?? []),
			(this.#Ue = s.wantLibrary ?? this.#Ue));
		let S = this.#t.exports;
		this.#a = {
			memory: this.#e,
			syscall: s.syscallGuard
				? (e, t) => (s.syscallGuard(e >>> 0, t, this.#e), S.gex_syscall(e, t))
				: this.#si(S),
			dispatch_miss: S.gex_dispatch_miss,
			illegal: S.gex_illegal,
			breakpoint: S.gex_breakpoint,
			sysreg_read: S.gex_sysreg_read,
			sysreg_write: s.replace
				? (e, t, n, r) =>
						n === -200
							? s.replace(e >>> 0, t, Number(r), this.#e, this.#a)
							: S.gex_sysreg_write(e, t, n, r)
				: S.gex_sysreg_write,
			cache_op: S.gex_cache_op,
			safepoint: o.on ? this.#Ri(S) : S.gex_safepoint,
			fma: S.gex_fma,
			x87: S.gex_x87,
			mx: S.gex_mx,
			icall_note: S.gex_icall_note,
		};
		let C = performance.now();
		((this.#n = await WebAssembly.instantiate(
			n instanceof WebAssembly.Module ? n : await WebAssembly.compile(n),
			{ gex: this.#a },
		)),
			(this.#L = performance.now() - C),
			this.#T(`boot`));
		let w = s.dense !== !1 && !!this.#n.exports.blocks && !!S.gex_set_dense;
		return (
			(this.#B = w),
			(this.#_e.dense = w ? (s.dense === 2 ? 2 : 1) : !1),
			S.gex_set_dense?.(it(this.#_e, this.#B)),
			Oe && S.gex_test_keep_probe?.(1),
			this.#io(),
			(globalThis.GEX_TEST_UNPUBLISHED_RETIRE ||
				{}.GEX_TEST_UNPUBLISHED_RETIRE) &&
				S.gex_test_unpublished_retire?.(1),
			(globalThis.GEX_TEST_FORK_REBASE || {}.GEX_TEST_FORK_REBASE) &&
				S.gex_test_fork_rebase?.(1),
			{}.GEX_TEST_DENSE_HOLES && S.gex_test_dense_holes?.(1),
			(globalThis.GEX_TEST_SERVE_UNMERGED || {}.GEX_TEST_SERVE_UNMERGED) &&
				S.gex_test_serve_unmerged?.(1),
			Object.assign(this.#_e, {
				fjit: s.fjit,
				fjitMax: s.fjitMax,
				fjitOnly: s.fjitOnly,
			}),
			this.#St(S, s),
			this.#Ma(this.#n),
			globalThis.GEX_DEBUG_EXIT &&
				console.error(`[gex] load: instantiated, installing`),
			await this.#Qe(),
			globalThis.GEX_DEBUG_EXIT && console.error(`[gex] load: done`),
			x
		);
	}
	async #Ze(e) {
		let t = this.#t.exports,
			n = this.#B ? (e.dense ?? sn(e.mod)) : null;
		if (globalThis.GEX_DENSE_DEBUG && n && e.dense) {
			let t = sn(e.mod);
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
		let r = Math.max(e.need >>> 0, Yt(e.meta));
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
		let t = e instanceof Uint8Array ? cn(e) : e.meta;
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
				o = i ? r.meta : cn(r),
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
					need: Math.max(s, Yt(o)),
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
		let s = performance.now();
		((this.#t = await WebAssembly.instantiate(a, {
			env: { memory: this.#e },
			gex_env: this.#Xe(),
			gex_k: this.#gt(a),
		})),
			(this.#I = performance.now() - s),
			n(`shim instantiated`),
			(this.#i = null),
			r && (this.#t.exports.__stack_pointer.value = R(this.#Be())));
		let c = this.#t.exports;
		this.#a = {
			memory: this.#e,
			syscall: this.#si(c),
			dispatch_miss: c.gex_dispatch_miss,
			illegal: c.gex_illegal,
			breakpoint: c.gex_breakpoint,
			sysreg_read: c.gex_sysreg_read,
			sysreg_write: c.gex_sysreg_write,
			cache_op: c.gex_cache_op,
			safepoint: o.on ? this.#Ri(c) : c.gex_safepoint,
			fma: c.gex_fma,
			x87: c.gex_x87,
			mx: c.gex_mx,
			icall_note: c.gex_icall_note,
		};
		let l = performance.now();
		((this.#n = await WebAssembly.instantiate(
			t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t),
			{ gex: this.#a },
		)),
			(this.#L = performance.now() - l),
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
					(this.#t.exports.__stack_pointer.value = R(this.#Be())))
				: await this.#$e(t, n, i),
			r &&
				(this.#t.exports.gex_set_gl?.(+!!this.#c),
				this.#t.exports.gex_set_d3d?.(+!!this.#l),
				this.#t.exports.gex_set_wl?.(+!!this.#u),
				this.#xi && this.#t.exports.gex_set_wl_output?.(...this.#xi),
				this.#xi && this.#t.exports.gex_set_wl_scale?.(this.#Si),
				this.#t.exports.gex_set_network?.(+!!this.#o),
				this.#Ht && this.#t.exports.gex_cgen_set_mode?.(this.#Ht),
				m(`serveall`) && this.#t.exports.gex_cgen_serve_always?.(1),
				m(`record`) && this.#t.exports.gex_cgen_set_record?.(1),
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
				!L() &&
				!!o?.k_stage_take &&
				H(this.#e.buffer) &&
				H(this.#ye?.memory?.buffer);
		this.#nt = 0;
		let c = 0,
			l = 0,
			u =
				(t.gex_image_runs && !L()
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
		(a.push({ at: 0, bytes: new Uint8Array(), zeros: u(0, Rt) }),
			L() && a.push({ at: zt, bytes: new Uint8Array(), zeros: u(zt, Bt) }));
		let d = this.#ot();
		this.#it = d;
		let f = d ? Kt(d) : this.#at();
		for (let { start: e, end: t, prot: n } of f)
			if (t > e) {
				let r = { at: e, end: t, prot: n, bytes: new Uint8Array(), zeros: 0 };
				(a.push(r), (r.zeros = u(e, t)));
			}
		if (
			(c && t.gex_free?.(l, c * 8), s && this.#tt(a), globalThis.GEX_DEBUG_EXIT)
		)
			for (let e of a) e.sum = Jt(e.bytes);
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
		let { module: t, memory: n, stackTop: i, spare: a } = this.#ye;
		e(
			`compile (isModule=${t instanceof WebAssembly.Module} stackTop=0x${(i >>> 0).toString(16)})`,
		);
		let o = t instanceof WebAssembly.Module ? t : await WebAssembly.compile(t);
		(e(`instantiate`), await ae());
		let s = await WebAssembly.instantiate(o, {
			env: {
				memory: n,
				...ge(this.#e, L(), a),
				lazy_fetch: be(n),
				page_fs: r(n),
			},
		});
		(e(`instantiated`), i && ye(s.exports, i), (this.#Ce = s.exports));
		let c = Number(globalThis.GEX_TIME_SCALE) || 0,
			l = Number(globalThis.GEX_FIXED_TIME) || 0;
		if ((c > 0 && c !== 1) || l) {
			let e = l ? Math.floor(Number(this.#r.now() / 1000000000n)) - l : 0;
			s.exports.k_guest_clock?.(Math.round((c || 1) * 1e3), e | 0);
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
		if (this.#xe || !m(`debug`)) return;
		let e = this.#t?.exports;
		if (!e?.gex_wait_census) return;
		let t = ``;
		((this.#xe = setInterval(() => {
			if (this.#Te) return;
			let n = e.gex_alloc(512) >>> 0,
				r = e.gex_wait_census(n, 512) >>> 0;
			if (r) {
				let i = V(this.#Ye().slice(n, n + r));
				(i === t &&
					jt(
						`[gex] quiet: ${i}${o.on ? ` js=${this.#Se}/installs=${this.#R}/pending=${e.gex_jit_pending_len() >>> 0}` : ``}`,
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
			i = await j(e);
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
		if (!(!e || !a?.k_store_save) && !(n && !Te(n)))
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
					for (; Atomics.load(n, 1); ) await F(5);
				}
			} finally {
				n && N(n);
			}
	}
	async #ht(e, t, n, r, i) {
		let a = this.#Ce;
		try {
			let o = a.k_store_save_ptr() >>> 0,
				s = new Uint8Array(this.#ye.memory.buffer, o, t).slice();
			(a.k_store_save_done(),
				r && (await F(r)),
				await Se(String(e), s),
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
			s = { k_present: () => +!!t };
		for (let e of r)
			if (!(e in s)) {
				if (t) {
					if (typeof t[e] != `function`)
						throw Error(
							`the global kernel has no ${e}: it is older than this glue. Rebuild it with shims/kernel/build.sh.`,
						);
					s[e] = t[e];
				} else s[e] = i.has(e) ? () => 0n : n;
			}
		if ((t || (s.k_halt_code = () => -1), t && o.on)) {
			let e = () => {
					throw Error(
						`gex (single-thread build): a blocking call inside a nested guest call (${this.#ki.join(` > `)}) cannot suspend`,
					);
				},
				n = () => new Int32Array(this.#ye.memory.buffer);
			((s.k_ws_park = new WebAssembly.Suspending((r, i, o) =>
				t.k_ws_seq(r) === i
					? (this.#ra() && e(),
						(this.#Se = `park(${o})`),
						a.parkSlot(n, (t.k_ws_addr(r) >>> 0) >>> 2, i, o, this.#be))
					: 1,
			)),
				(s.k_wq_notify = (e) => {
					(t.k_wq_notify(e), a.checkSlots());
				}),
				(s.k_futex_wake = (e) => {
					(t.k_futex_wake(e), a.checkSlots());
				}),
				(s.k_wq_release = () => {
					(t.k_wq_release(), a.checkSlots());
				}));
		}
		return s;
	}
	#_t(e) {
		let t = cn(e);
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
			un(`[pool] pid ${n.pid}: ${i ? `pooled runtime` : `new runtime`}`));
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
			a.gex_set_dense?.(it(o, this.#B)),
			Oe && a.gex_test_keep_probe?.(1),
			this.#io(),
			(this.#_e = o),
			Pt(a),
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
				n.image.reduce((e, t) => Math.max(e, t.end ?? 0, t.at + qt(t)), 0),
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
			let t = qt(e);
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
			let [n, r] = It(c, new Uint8Array(e.bytes), e.at);
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
				Jt(c.subarray(t.at, n)) !== t.sum &&
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
				Math.max(e.end ?? 0, e.at + qt(e)),
			])),
			await this.attach(e, t),
			o(`instantiated, ${p()} non-zero bytes in the context`));
		let m = this.#t.exports;
		((globalThis.GEX_TEST_FORK_REBASE || {}.GEX_TEST_FORK_REBASE) &&
			m.gex_test_fork_rebase?.(1),
			this.#_t(t),
			Ot() > 0 &&
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
			m.gex_set_dense?.(it(n.opts, this.#B)),
			Oe && m.gex_test_keep_probe?.(1),
			this.#io(),
			o(
				`kernel built, entry 0x${h.toString(16)}, ${p()} non-zero bytes in the context`,
			));
		let g = n.opts ?? {};
		((this.#_e = g), Pt(m), this.#Ct(m, g, n.pid));
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
					`[heap] debug=${!!globalThis.GEX_DEBUG_EXIT} api=${typeof performance.measureUserAgentSpecificMemory} isolated=${globalThis.crossOriginIsolated} used=${performance.memory?.usedJSHeapSize ?? `n/a`} limit=${performance.memory?.jsHeapSizeLimit ?? `n/a`} image=${(n.image ?? []).reduce((e, t) => e + qt(t), 0)} modules=${(n.modules ?? []).length}`,
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
		if (Ot() <= 0) {
			for (let e of n.modules ?? []) v = Math.max(v, e.need);
			v = Math.max(v, (n.slots ?? 0) >>> 0);
		}
		if ((v && this.#wi(v, `a1806`), (this.#me = n.modules ?? []), Ot() <= 0)) {
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
				Jt(e.subarray(r.at, n)) !== r.sum &&
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
				rt(e, t);
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
		this.#fa ??= Ue();
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
			!H(this.#e?.buffer) && !o.on)
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
			let t = g(`spare`);
			t &&
				console.warn(
					`[spare] pid ${this.#t.exports.gex_my_pid?.() ?? `?`}: caught up with ${this.#Gt?.dyl.size ?? 0} modules, waiting`,
				);
			let r,
				i = n.spareGo().then((e) => {
					r = e ?? !1;
				});
			for (
				let n = Be;
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
					(n = i === r ? Math.min(2 * n, Ve) : Be));
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
			un(
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
			un(
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
		if ((un(`[vfork] not here: ${e}`), this.#Nt)) return;
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
					o.on || t.gex_fork_hold?.();
					let n;
					try {
						n = this.#rt();
					} finally {
						t.gex_fork_release?.();
					}
					return (
						(this.#v = performance.now() - e),
						(this.#y = n.reduce((e, t) => e + qt(t), 0)),
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
			m(`unit`) &&
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
			i = `ftab-runtime:${U(r)}`,
			a = this.#z.get(i);
		a || ((a = new WebAssembly.Module(r)), this.#z.set(i, a));
		let o = new WebAssembly.Table(
				L()
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
		for (let e = 0; e < J.length; e++)
			c[J[e]] =
				t[e] ?? new WebAssembly.Table({ element: `anyfunc`, initial: 0 });
		this.#B && (c.blocks = this.#n.exports.blocks);
		let l = new WebAssembly.Instance(a, { gex: c }),
			u = g(`bridges`) ? this.#oo(l.exports.bridge) : l.exports.bridge;
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
			o.set(B(1), e.gex_ftab_fallback),
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
				(i < r && (e.ftab.grow(B(r - i), e.resolve), this.#fo(`ftab grew`)),
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
	#Zt = ke() || Ee;
	#Qt() {
		let e = ke() || De;
		this.#Zt !== e && ((this.#Zt = e), this.#Gt && this.#Yt());
	}
	#$t(e, t, n = !1) {
		let r = this.#t.exports,
			i = this.#Jt(),
			a = e >= 2147483648 ? e - 2147483648 : -1,
			s = a < 0 && e >= 1073741824 ? e - 1073741824 : -1,
			c = a >= 0 && r.gex_cgen_pmod_wasm_len?.(a) >>> 0 > 0,
			l = c && !!r.gex_cgen_pmod_wasmprog?.(a),
			u = c && !!r.gex_cgen_pmod_libprov?.(a),
			d = l && !!r.gex_cgen_pmod_lowered?.(a),
			f = c && !l && !u && this.#Kn && !L(),
			p = (u || d || f) && !L(),
			h = L() || p;
		l &&
			((this.#Kn = L() || d),
			this.#In &&
				(typeof this.#In.value == `bigint`) !== this.#Kn &&
				((this.#In = null), this.#Hn()));
		let _ = c ? r.gex_cgen_pmod_wasm_len(a) >>> 0 : 0,
			v = () => {
				let e = l && r.gex_wasmprog_owned ? r.gex_wasmprog_owned(a) >>> 0 : 0;
				if (l && r.gex_wasmprog_owned && !e)
					throw Error(`wasm32 module ${a}: its bytes are gone`);
				let t = e || r.gex_cgen_pmod_wasm_ptr(a) >>> 0,
					n = new Uint8Array(this.#e.buffer, t, _).slice();
				return (e && r.gex_free(e, _), n);
			},
			y = null,
			b = null,
			x = l ? this.#Xn(a) : ``,
			S = [];
		for (let e of x.split(`
`))
			if (e.startsWith(`X	`)) {
				let t = e.split(`	`);
				S.push([Number(t[1]), t[2]]);
			}
		let C = !1;
		if ((l || (c && !u)) && r.gex_cgen_pmod_wasm_key) {
			let e = (e) => BigInt.asUintN(64, BigInt(r.gex_cgen_pmod_wasm_key(a, e)));
			if (((b = `wasm:${_}:${e(0)}:${e(1)}`), l && !h && !g(`nodlpack`))) {
				if (this.#z.has(`${b}:p`)) ((b = `${b}:p`), (C = !0));
				else if (!this.#z.has(b)) {
					let e = v(),
						n = performance.now();
					((y = Ne(e, S, t)),
						g(`dlpack`) &&
							console.warn(
								`[dlpack] ${this.#Kt(r.gex_cgen_pmod_file, a)}: ${y ? `${e.length} -> ${y.length} bytes, ${S.length} slots` : `not packed`} in ${(performance.now() - n).toFixed(1)} ms`,
							),
						y ? ((b = `${b}:p`), (C = !0)) : (y = e));
				}
			}
			!C && !this.#z.has(b) && (y ??= v());
		} else c && ((y = v()), (b = `wasm:${U(y)}`));
		if (c) {
			let e = this.#Kt(r.gex_cgen_pmod_file, a);
			m(`record`) && console.warn(`[gex-record] module ${e} ${b.slice(5)}`);
			let t = e.replace(/^wasm(dll|prog):/, ``);
			this.#r.noteStatus?.({
				kind: `module`,
				path: t,
				program: l ? void 0 : /\.exe$/i.test(t) ? this.cmdline : void 0,
			});
		}
		let w = c
				? this.#On(this.#Kt(r.gex_cgen_pmod_file, a), y, b)
				: a >= 0
					? this.#On(this.#Kt(r.gex_cgen_pmod_file, a))
					: s >= 0
						? this.#jn(s)
						: this.#qt(this.#Kt(r.gex_cgen_key, e)),
			T =
				a >= 0
					? (r.gex_cgen_pmod_memory_base?.(a) >>> 0) +
						(r.gex_cgen_pmod_memory_base_hi?.(a) >>> 0) * 2 ** 32
					: 0,
			E =
				a >= 0
					? (e, t) => r.gex_cgen_pmod_regs(a, e, t)
					: s >= 0
						? (e, t) => r.gex_fjit_regs(s, e, t)
						: (t, n) => r.gex_cgen_regs(e, t, n),
			D = this.#wi(
				(a >= 0
					? r.gex_cgen_pmod_slots(a)
					: s >= 0
						? r.gex_fjit_slots(s)
						: r.gex_cgen_slots(e)) >>> 0,
				`cgen`,
			),
			ee = performance.now(),
			O,
			k = {
				env: {
					memory: this.#e,
					__indirect_function_table: i.ftab,
					__table_base: new WebAssembly.Global(
						{ value: h ? `i64` : `i32`, mutable: !1 },
						h ? BigInt(t >>> 0) : t | 0,
					),
					__table_base32: new WebAssembly.Global(
						{ value: `i32`, mutable: !1 },
						t | 0,
					),
					__memory_base: new WebAssembly.Global(
						{ value: h ? `i64` : `i32`, mutable: !1 },
						h ? BigInt(T) : T,
					),
					__stack_pointer:
						T && !l
							? u || f || (c && L())
								? this.#xn()
								: this.#vn()
							: l
								? this.#Gn()
								: new WebAssembly.Global(
										L()
											? { value: `i64`, mutable: !0 }
											: { value: `i32`, mutable: !0 },
										L() ? 0n : 0,
									),
					...(c
						? Object.fromEntries(
								Xt.map((e) => [
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
				...(c
					? {
							"GOT.func": Object.fromEntries(
								Xt.map((e) => [
									e,
									L()
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
										: (r.gex_unix_dispatcher?.(e, z(t)) ?? 0),
								fault_hook: (e) => r.gex_fault_hook_set?.(z(e)),
								signal_hook: (e) => r.gex_signal_hook_set?.(z(e)),
								code_changed: (e, t) => r.gex_code_changed?.(Me(e), t),
								wine_pe_slot: (e, t) => r.gex_wine_pe_slot?.(z(e), t) ?? 0,
								...(l && L()
									? {
											sysreg_write: (e, t, n, r) =>
												this.#a.sysreg_write(z(e), t, n, r),
										}
									: {}),
								call_out: o.on
									? new WebAssembly.Suspending((e, t, n, r) =>
											this.#ra()
												? this.#Zi(e >>> 0, t, n, r)
												: this.#Qi(e >>> 0, t, n, r),
										)
									: (e, t, n, r) => this.#Zi(e >>> 0, t, n, r),
								image_mapped: (e, t) => {
									let n = r.gex_image_mapped?.(Me(e), t) ?? -1;
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
					...(T && !l ? (u ? this.#Tn() : this.#En()) : {}),
					...(p ? { provider_alloc: (e) => r.gex_provider_alloc(e) } : {}),
					...(l
						? this.#Dr(() => O, w)
						: u
							? { syscall: this.#di }
							: c
								? {
										syscall: o.on
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
		a < 0 && s < 0 && this.#on(w, this.#Kt(r.gex_cgen_key, e), k);
		let te =
			f &&
			!o.on &&
			WebAssembly.Module.exports(w).some(
				(e) => e.name === `__gexw_snap_globals`,
			);
		if (te) {
			let e = k.gex,
				t = e.unix_dispatcher;
			((e.unix_dispatcher = (e, n) => (e === 1 || e === 5 ? 0 : t(e, n))),
				(e.snap_pe_stop = (e, t, n, r, i) => this.#dr(e, t, n, r, i)),
				this.#vr && (e.call_out = (e, t, n, r) => this.#fr(e >>> 0, t, n, r)),
				(this.#Cr ??= new WebAssembly.Global({ value: `i32`, mutable: !0 }, 0)),
				Object.assign(k.env, {
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
		let ne = l ? this.#Yn(a, k, i, x) : [];
		if (
			(l &&
				(this.#Or = {
					module: w,
					base: t,
					memBase: T,
					binds: this.#kr,
					packed: C,
				}),
			(O = new WebAssembly.Instance(w, k)),
			te &&
				((this.#gr = { inst: O, state: k.env.__asyncify_state }), this.#hr()),
			!this.#ii && l)
		) {
			if (r.gex_wasmprog_relocate(a))
				try {
					O.exports.__wasm_apply_data_relocs?.();
				} finally {
					r.gex_wasmprog_relocated?.(a);
				}
		} else
			!this.#ii &&
				T &&
				r.gex_provider_relocate(T) &&
				O.exports.__wasm_apply_data_relocs?.();
		if (l) {
			if (!C)
				for (let [e, t] of ne) {
					let n = O.exports[t];
					if (!n) throw Error(`wasm32 module ${a}: ${t} is not exported`);
					i.ftab.set(B(e), n);
				}
			(i.dyl.set(a, O),
				r.gex_wasmprog_release?.(a),
				this.#Zn && this.#rr(a, O, i, this.#Zn));
		}
		let re = n ? 0 : this.#en(E, D);
		(i.instances.push(O), s >= 0 && r.gex_fjit_installed(s));
		let ie = performance.now() - ee;
		if (c && g(`wasmlib`)) {
			let e = this.#Dn;
			console.warn(
				`[wasmlib] pid ${r.gex_my_pid?.() ?? `?`} w${Math.round(performance.timeOrigin) % 1e6}: ${this.#Kt(r.gex_cgen_pmod_file, a).split(`/`).pop()} ${e < 0 ? `had` : `compiled ${e.toFixed(1)} ms`}, instantiated ${ie.toFixed(1)} ms, at ${Math.round(performance.timeOrigin + performance.now()) % 1e7}`,
			);
		}
		return (
			a < 0 &&
				s < 0 &&
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
			m(`unit`) &&
				console.error(
					`[unit] ${this.#qa()}: unit at ${i.base} instantiated at its first call (${t.length} still deferred)`,
				));
		let a = g(`unitstall`),
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
			for (let e of i.retired) this.#Gt.ftab.set(B(e), this.#Gt.resolve);
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
			m(`unit`) &&
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
						t.get(L() ? BigInt(n) : n >>> 0)(r),
						e.gex_provider_note(0),
						0
					);
				} catch (t) {
					if (t instanceof ln) return (e.gex_provider_note(1), t.code);
					throw t;
				}
			},
			provider_throw: (e) => {
				throw new ln(e);
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
			i = `fjit:${U(r)}`,
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
		let i = g(`unitstall`),
			a = i ? performance.now() : 0,
			s = r.have;
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
					if (t < 1073741824 && !o.on && e.gex_ftab_install_len)
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
					(r.ftab.set(B(i), r.resolve), this.#tn.length && this.#in(i));
			(r.have++, e.gex_cgen_have(r.have));
		}
		((this.#tr.value = t),
			i &&
				r.have - s > 16 &&
				console.warn(
					`[unitcatch] ${this.#qa()}${this.#Oe ? ` (fork child)` : ``}: ${r.have - s} events in ${(performance.now() - a).toFixed(1)} ms`,
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
		mt ??= new WebAssembly.Module(ut);
		let e = new WebAssembly.Table({ element: `anyfunc`, initial: 1 }),
			t = new WebAssembly.Instance(mt, {
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
				? new WebAssembly.Instance(Et(L(), typeof r.value == `bigint`), {
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
				: new WebAssembly.Instance(gt(L(), typeof r.value == `bigint`), {
						e: { t: this.#Gt.ftab, sp: r },
					}).exports.entry;
		return (this.#Ln.set(0, a), a(e, t, n));
	}
	#Hn() {
		this.#Ln && this.#Ln.set(0, this.#Rn);
	}
	#Un() {
		return o.on ? void 0 : this.#In?.value || void 0;
	}
	#Wn(e) {
		let t = this.#In;
		t && e !== void 0 && typeof t.value == typeof e && (t.value = e);
	}
	#Gn() {
		let e = L() || this.#Kn;
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
									: n.ftab.get(B(Number(r[5])))),
						i === void 0)
					)
						throw Error(
							`wasm32 module ${e}: ${r[1]}.${r[2]}: ${r[4]} of module ${r[3]} is not instantiated in this Worker`,
						);
					a(r[1], r[2], i);
					break;
				}
				case `L`: {
					let e = B(Number(r[3])),
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
			a = !o.on && i.includes(`__gex_snap_resume64`);
		((this.#vr = a),
			a &&
				(this.#Cr ??= new WebAssembly.Global(
					{ value: `i32`, mutable: !0 },
					0,
				)));
		let s = i.includes(`__gex_snap_blocks`),
			c = this.#t.exports,
			l = () => this.#Ce,
			u = () => new DataView(this.#e.buffer),
			d = () => {
				let t = this.#wr,
					n = this.#In;
				(n && u().setUint32(t + 16, Number(n.value) >>> 0, !0),
					(this.#Tr = !0),
					e(1, t));
			},
			f = i.includes(`__gex_snap_resume64`),
			p = (e) => {
				let t = u().getBigUint64(Number(e) >>> 0, !0);
				return !!n().exports.__gex_snap_blocks(
					f ? t : Number(BigInt.asIntN(32, t)),
				);
			},
			m = (e) => {
				let t = n().exports;
				if (!p(e)) return !1;
				if (!this.#wr && t.__gex_snap_ready) {
					let n = Number(e) >>> 0,
						r = new Uint8Array(this.#e.buffer, n, 264).slice();
					(t.__gex_snap_ready(), new Uint8Array(this.#e.buffer, n, 264).set(r));
				}
				return !!this.#wr && this.#yr();
			};
		return {
			...(s
				? {
						syscall: (n, r) => {
							let i = e(0, 0);
							if (i === 2) {
								e(4, 0);
								let t = this.#In;
								if (t) {
									let e = u().getUint32(this.#wr + 16, !0);
									t.value = typeof t.value == `bigint` ? BigInt(e) : e | 0;
								}
							} else if (i !== 0)
								throw Error(`gex.syscall in asyncify state ${i}`);
							else if (!this.#Er && l()?.k_snap_pending?.() && m(n)) {
								d();
								return;
							}
							let a = this.#wr && p(n);
							(t(n, r), a && c.gex_snap_stopped?.() && d());
						},
					}
				: {}),
			snap_wanted: () => +!this.#Er,
			snap_register: (e, t) => {
				((this.#wr = Number(e) >>> 0),
					(this.#Sr = this.#wr ? t : 0),
					this.#hr(),
					c.gex_snap_enable?.(this.#wr && !this.#Er ? 1 : 0));
			},
			snap_entry_rewind: (e) => {
				this.#lr(Number(e) >>> 0, 0, Number(c.gex_snap_ctx()));
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
				maxPages: Wt() ?? Ut,
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
			d = c + yt + l * bt;
		if (
			(u.getUint32(c + W, !0) === 0 && u.setUint32(c + W, l + 1, !0),
			u.setUint32(d, e, !0),
			u.setUint32(d + 4, t >>> 0, !0),
			u.setUint32(d + 8, i >>> 0, !0),
			u.setUint32(d + 12, o >>> 0, !0),
			u.setBigUint64(d + 24, BigInt.asUintN(64, BigInt(a)), !0),
			u.setBigUint64(d + 32, BigInt.asUintN(64, BigInt(r)), !0),
			s.__gex_snap_fill(BigInt(c)),
			l > 0)
		)
			throw (e === 0 && this.#Cr.value--, Tt);
		(u.setUint32(c + 20, t >>> 0, !0),
			vt && this.#pr(c),
			this.#or(c),
			new DataView(this.#e.buffer).setUint32(c + W, 0, !0),
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
			a = e + yt + t * bt,
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
				a = e + G + t * St;
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
			let t = this.#Jt().ftab.get(B(s)),
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
				s = new DataView(this.#e.buffer).getUint32(a + yt + o * bt + 16, !0),
				c = this.#Gn();
			return (
				(c.value = typeof c.value == `bigint` ? BigInt(s) : s | 0),
				this.#$i(this.#ia(e, t, n, r, !1, () => this.#lr(a, o, e)))
			);
		}
		try {
			return this.#Zi(e, t, n, r);
		} catch (e) {
			if (e !== Tt) throw e;
			let t = this.#Cr.value;
			return (
				new DataView(this.#e.buffer).setUint32(
					a + yt + t * bt + 16,
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
			l = o + yt + s * bt,
			u = o + G + s * St;
		if (
			(c.getUint32(o + W, !0) === 0 && c.setUint32(o + W, s + 1, !0),
			c.setUint32(l, 2, !0),
			c.setUint32(l + 4, 0, !0),
			c.setInt32(u, e, !0),
			c.setInt32(u + 4, t, !0),
			c.setInt32(u + 8, n, !0),
			c.setBigUint64(u + 16, BigInt.asUintN(64, r), !0),
			c.setBigUint64(u + 24, BigInt.asUintN(64, i), !0),
			s > 0)
		)
			throw Tt;
		(this.#xr().exports.__gex_snap_fill(BigInt(o)),
			c.setUint32(o + 20, 0, !0),
			vt && this.#pr(o),
			this.#or(o),
			new DataView(this.#e.buffer).setUint32(o + W, 0, !0),
			a.asyncify_start_rewind(this.#mr(o)));
	}
	#fr(e, t, n, r) {
		let i = this.#gr,
			a = i.inst.exports,
			o = this.#wr,
			s = this.#Cr.value,
			c = this.#xn(),
			l = o + G + s * St;
		if (i.state.value === 2)
			return (
				a.asyncify_stop_rewind(),
				a.__gexw_snap_globals(1, BigInt(l + 40)),
				(c.value = new DataView(this.#e.buffer).getBigUint64(l + 80, !0)),
				this.#$i(this.#ia(e, t, n, r, !1, () => this.#lr(o, s, e)))
			);
		o &&
			s < xt &&
			(a.__gexw_snap_globals(0, BigInt(l + 40)),
			new DataView(this.#e.buffer).setBigUint64(l + 80, c.value, !0));
		try {
			return this.#Zi(e, t, n, r);
		} catch (e) {
			if (e !== Tt || !o || s >= xt) throw e;
			return ((this.#_r = !0), a.asyncify_start_unwind(this.#mr(o)), 0);
		}
	}
	#pr(e) {
		let t = new DataView(this.#e.buffer),
			n = t.getUint32(e + W, !0),
			r = Array.from({ length: n }, (n, r) => t.getUint32(e + yt + r * bt, !0));
		console.error(
			`[gex-snap] tid ${this.#Ka}: stopped, levels by route [${r.join(` `)}]`,
		);
	}
	#mr(e) {
		let t = new DataView(this.#e.buffer),
			n = e + G + Ct;
		return (
			t.getUint32(n + 4, !0) === 0 &&
				(t.setUint32(n, n + 8, !0), t.setUint32(n + 4, e + wt, !0)),
			n
		);
	}
	#hr() {
		let e = this.#wr;
		if (!this.#gr || !e) return;
		let t = new DataView(this.#e.buffer);
		t.getUint32(e + 4, !0) > e + G &&
			t.getUint32(e, !0) < e + G &&
			t.setUint32(e + 4, e + G, !0);
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
			t <= xt &&
			this.#ki.length === t &&
			(t === 1 || this.#vr) &&
			this.#Di.every((e) => e.ri === -1)
		)
			return 1;
		if (vt && !this.#br) {
			this.#br = !0;
			let n = `?`;
			try {
				let e = new DataView(this.#e.buffer),
					t = Number(this.#t.exports.gex_snap_ctx()),
					r = e.getBigUint64(t + 32, !0);
				n = `0x${e.getBigUint64(t + 256, !0).toString(16)} rax 0x${e.getBigUint64(t, !0).toString(16)} ret 0x${e.getBigUint64(Number(r), !0).toString(16)}`;
			} catch {}
			console.error(
				`[gex-snap] tid ${this.#Ka}: not at a root (rec ${this.#wr}, root ${this.#Sr}, vfork ${this.#Er}, entry depth ${e}, call-outs ${t}${t > xt ? `, past the record's ${xt} levels` : ``} [${this.#Di.map((e) => e.ri).join(` `)}], nest ${this.#ki.length}, pc ${n})`,
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
					if (!o.on) {
						let e = n.gex_vfork_ok?.() ?? 0;
						e > 0 ? this.#Ot() : e !== -2 && this.#Pt(e);
					}
					(this.#It()?.catch((e) =>
						console.error(`[gex] starting a process: ${e.message ?? e}`),
					),
						this.#Tt());
				}
			},
			s = (e, t) => {
				(n.gex_syscall(e, t), a());
				let r = n.gex_wasmprog_dl_gen?.();
				r !== void 0 && r !== this.#er && ((this.#er = r), this.#Mn());
			};
		return {
			syscall: o.on ? this.#Ii(s, a) : (n.gex_wasmprog_syscall ?? s),
			dl_size: this.#tr,
			dl_stale: () => {
				((this.#er = n.gex_wasmprog_dl_gen?.() ?? this.#er),
					n.gex_wasmprog_dl_seen?.(),
					this.#Mn());
			},
			asyncify: i,
			...this.#ar(i, o.on ? this.#Ii(s, a) : s, e, t),
			i386_bind: (e, t) => n.gex_libprov_i386_bind(Me(e), t >>> 0),
			fork_point: (e) => {
				let t = i(0, 0);
				if (t === 0) i(1, e);
				else if (t === 2) i(4, 0);
				else throw Error(`gex.fork_point in asyncify state ${t}`);
			},
			dlopen: (e, t, r) => {
				let i = n.gex_wasmprog_dlopen(Me(e), Me(t), r) >>> 0;
				if (!i) return 0;
				this.#Mn();
				let a = this.#Jt(),
					o = [];
				for (let e = 0, t; (t = n.gex_wasmprog_dl_new(e)) >= 0; e++) o.push(t);
				for (let e of o) a.dyl.get(e)?.exports.__wasm_call_ctors?.();
				return i | 0;
			},
			dlsym: (e, t) => n.gex_wasmprog_dlsym(e, Me(t)) | 0,
			door_publish: (e) => this.#Fr(e >>> 0),
			door_call: (e, t, n) => this.#Yr(z(e), t, n, !1),
			door_call_lp64: (e, t, n) => this.#Yr(z(e), t, n, !0),
			door_missing: () => ((this.#Ar && this.#Hr(this.#Ar)) || o.on ? 0 : 1),
			exec_fresh: () => {
				n.gex_exec_fresh?.();
			},
			space_top: () => (n.gex_space_top?.() ?? 0) | 0,
			session_copy: (e, t, n) => this.#Br(z(e), t >>> 0, n >>> 0),
			session_seq: (e) => this.#Vr(e >>> 0),
			usd_copy: (e, t) => this.#Ir(z(e), t >>> 0, !1),
			usd_publish: (e, t) => this.#Ir(z(e), t >>> 0, !0),
			kuser_address: () =>
				(n.gex_kuser_address ? n.gex_kuser_address() : 2147352576) | 0,
			wake_pipe: (e) => this.#t.exports.gex_fd_pipe_id?.(e) ?? -1,
			wake_write: (e, t, n) =>
				this.#Ce?.k_pipe_write?.(e, Me(t), n >>> 0) ?? -38,
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
		if (!t || o.on) return;
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
		let s = r.getUint32(e + 136, !0);
		if (s < 1120) {
			console.error(
				`[gex-door] the server's door context is ${s} bytes, under gex's 1120: no doors`,
			);
			return;
		}
		let c = {
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
				`[gex-door] wineserver pid ${c.pid} published its door (area ${e})`,
			),
			this.#jr && Atomics.store(this.#jr, 0, c.pid),
			this.#r.publishDoor?.(c));
	}
	#Ir(e, t, n) {
		let r = this.#Ar;
		if (!r || o.on || !this.#Hr(r)) return -1;
		let { u8: i, dv: a } = this.#Ur(),
			s = a.getUint32(r.area + 140, !0);
		if (!s) return -1;
		let c = Math.min(t, 4096);
		return (
			n
				? i.set(this.#Ye().subarray(e, e + c), s)
				: this.#Ye().set(i.subarray(s, s + c), e),
			c
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
			s = e.base + dn(e.module);
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
		return !i || o.on ? 1 : this.#ei(i, e, t, n, null, r);
	}
	#Xr = !!globalThis.GEX_DOOR_STATS;
	#Zr = null;
	#Qr(e) {
		let t = this.#Zr;
		if (!t || e > t.u8.length) {
			let e = this.#e.buffer;
			t = this.#Zr = Ie(e);
		}
		return t;
	}
	#$r(e) {
		let t = this.#Nr;
		return t && e <= t.len ? t : this.#Ur();
	}
	#ei(e, t, n, r, i, a) {
		let o = L(),
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
		if (!i || o.on)
			return (
				a.nodoor++ & 16383 ||
					console.error(
						`[gex-door] pid ${t} tid ${n}: no door here (${a.nodoor} calls)`,
					),
				1
			);
		a.hi = Math.max(a.hi, e);
		let s = this.#ei(i, e, t, n, a, r),
			{ i32: c, dv: l } = this.#Ur(),
			u = i.area,
			d = performance.now();
		if (((a.T2 &&= ((a.tPost += d - a.T2), 0)), !a.t0)) a.t0 = d;
		else if (
			d - a.t0 >=
				(globalThis.GEX_DOOR_STATS > 1 ? globalThis.GEX_DOOR_STATS : 1e4) ||
			a.calls + a.fallbacks >= 5e4
		) {
			let e = l.getUint32(u + 96, !0) >> 2,
				r = [];
			if (e) for (let t = 0; t < 512; t++) c[e + t] && r.push([c[e + t], t]);
			(r.sort((e, t) => t[0] - e[0]),
				console.error(
					`[gex-door] pid ${t} tid ${n}: ${a.calls} door calls, ${a.fallbacks} fallbacks, ${a.proxies} proxies in ${Math.round(d - a.t0)} ms; server: ${c[(u + 104) >> 2]} calls, ${c[(u + 100) >> 2]} proxies (${r
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
				(a.t0 = d),
				(a.calls = a.fallbacks = a.proxies = 0));
		}
		return s;
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
					: o.on
						? `single-thread build`
						: typeof this.#r.offerSpare == `function`
							? e < He()
								? `few modules`
								: H(this.#e?.buffer)
									? ``
									: `memory not shared`
							: `no offerSpare`;
		(g(`spare`) &&
			console.warn(
				`[spare] pid ${t.gex_my_pid?.() ?? `?`}: program ${n} with ${e} modules, ${r ? `no spare (${r})` : `offered`}`,
			),
			(this.#ai = n),
			!r &&
				((this.#fa ??= Ue()),
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
		return o.on ? this.#Ii(r, n) : (t.gex_staged_syscall ?? r);
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
		return o.on
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
					r.ret === et &&
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
						m(`unit`) && console.warn(`gex-pe: ${i}: held for its link group`),
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
			a = m(`placelat`)
				? [
						Number(i.gex_cgen_mapped_age_us?.(e, 0) ?? -1n),
						Number(i.gex_cgen_mapped_age_us?.(e, 1) ?? -1n),
						performance.now(),
					]
				: null,
			o = g(`unitstall`) ? performance.now() : -1,
			s = this.#r.loadUnit?.(t) ?? null,
			c = o >= 0 ? performance.now() : -1;
		(a &&
			a[0] >= 0 &&
			console.warn(
				`[placelat] ${n} ${(a[0] / 1e3).toFixed(1)} ms mapped, ${(a[1] / 1e3).toFixed(1)} ms wanted, load ${(performance.now() - a[2]).toFixed(1)} ms`,
			),
			m(`record`) &&
				console.warn(`[gex-record] unit ${t} ${s ? `hit` : `miss`} ${n}`),
			m(`record`) &&
				i.gex_cgen_base &&
				console.warn(
					`[gex-record] base ${t} 0x${BigInt.asUintN(64, BigInt(i.gex_cgen_base(e))).toString(16)}`,
				));
		let l = /\.exe$/i.test(n) ? this.cmdline : void 0;
		if (
			(l !== void 0 &&
				m(`record`) &&
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
			m(`unit`) &&
				console.error(
					`gex-pe: function tier for ${n}: placed by another thread`,
				);
			return;
		}
		(this.#kn(e),
			m(`unit`) &&
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
		e < 1073741824 && !o.on && i.gex_ftab_install_len
			? this.#z.has(`cgen:${t}`) ||
				(this.#gi.set(t, r), this.#r.prefetchUnit?.(t))
			: this.#qt(t, r);
		let a =
				r.entries instanceof Uint8Array ? r.entries : new Uint8Array(r.entries),
			s = i.gex_alloc(Math.max(8, a.byteLength)) >>> 0;
		this.#Ye().set(a, s);
		let c = i.gex_cgen_publish(e, s, a.byteLength / 8);
		if ((i.gex_free?.(s, Math.max(8, a.byteLength)), c < 0))
			throw Error(`gex-cgen: publishing ${n}'s unit failed`);
		return (this.#Mn(), i.gex_cgen_installed(e), c);
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
						o.on
							? await this.#na(e.f)(r, e.code, e.addr, e.kind)
							: e.f(r, e.code, e.addr, e.kind);
					} finally {
						e.spG.value = e.cur;
					}
					n = this.#ca(r);
				}
				return (
					this.#Xt(),
					o.on
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
					s =
						t &&
						((/memory access out of bounds/.test(e?.message ?? ``) &&
							(this.#t.exports.gex_guest_oob?.(r) ?? 0) === 1) ||
							this.#Sn(e, r));
				if (
					t &&
					!s &&
					this.#kt.length &&
					!/table index is out of bounds/.test(e?.message ?? ``)
				) {
					((this.#t.exports.__stack_pointer.value = R(this.#Be())),
						this.#Wn(a),
						({ pc: n, ctx: r } = this.#jt(e)));
					continue;
				}
				if (t && !s) {
					let t = this.#t.exports;
					if (
						/table index is out of bounds/.test(e.message) &&
						t.gex_last_target
					) {
						let e = 0n;
						try {
							e = new DataView(this.#e.buffer).getBigUint64(r + Xe, !0);
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
									a = new DataView(this.#e.buffer).getUint32(Vt() + i * 4, !0),
									o = this.#po(),
									s = a >>> 0,
									c = s >>> 24,
									l = s & 16777215,
									u = l + ((Number(r) & 4095) >> q),
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
								for (let e = 0, t = Ht(); e < t; e++) {
									let t = _.getUint32(Vt() + e * 4, !0) >>> 0;
									if (t === 0) continue;
									let n = t >>> 24,
										r = t & 16777215,
										i = o[n]?.length ?? 0;
									(n < o.length && r + Nt <= i) ||
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
				((this.#t.exports.__stack_pointer.value = R(this.#Be())), this.#Wn(a));
				let c = this.#t.exports;
				(c.gex_libprov_guest_calls?.() ?? 0) > 0 &&
					(++this.#wn <= 16 &&
						console.error(
							`[gex] a trap reached the run loop with ${c.gex_libprov_guest_calls()} provider guest call(s) open: ${e?.message ?? e}; resume ${BigInt.asUintN(64, BigInt(c.gex_resume_pc())).toString(16)}\n${e?.stack ?? ``}`,
						),
					c.gex_libprov_guest_calls_set(0));
				let l = this.#Me();
				if (l !== 0n) {
					(this.traps.loop++, (n = l));
					let e = this.#Pe();
					(e !== 0 && (r = e), this.#pt());
					continue;
				}
				this.traps.loopFull++;
				let u = c.gex_fill_wanted ? Number(c.gex_fill_wanted()) : -1;
				if (u >= 0) {
					let e = performance.now(),
						t = this.fillSlotNow(u >>> 0);
					(this.#x++, (this.#S += performance.now() - e));
					let n = t;
					if (n == null) {
						let e = performance.now();
						((this.#Se = `fillSlot(${u >>> 0})`),
							(n = await this.fillSlot(u >>> 0)),
							(this.#Se = `trap`),
							this.#X++,
							(this.#Z += performance.now() - e));
					}
					c.gex_fill_done(+!!n);
				}
				if ((this.#za(), c.gex_jit_pending_len() >>> 0)) {
					let e = (c.gex_jit_pending_slots?.() ?? 0) >>> 0;
					e && this.#wi(e, `a2358`);
				}
				for (this.#Se = `install`; c.gex_jit_pending_len() >>> 0; )
					await this.#Oa();
				if (
					((this.#Se = `adopt`),
					await this.#Ei(),
					this.#pt(),
					(this.#Se = `catchUp`),
					await this.#Rt(),
					this.#mi(),
					this.#kt.length && c.gex_vfork_over())
				) {
					({ pc: n, ctx: r } = this.#jt(null));
					continue;
				}
				let d = c.gex_vfork_ok?.() ?? 0;
				if (d > 0) {
					let e = this.#At();
					if (e) {
						({ pc: n, ctx: r } = e);
						continue;
					}
				} else d !== -2 && this.#Pt(d);
				((this.#Se = `drainFork`),
					await this.#It(),
					(this.#Se = `drainThread`),
					await this.#wt(),
					(this.#Se = `resume`));
				let f = this.#la(r),
					p = c.gex_exited?.() ? 0n : c.gex_resume_pc();
				if (p !== 0n) {
					n = p;
					let e = c.gex_resume_ctx() >>> 0;
					(e !== 0 && (r = e), (i = f));
					continue;
				}
				if ((f && (f.spG.value = f.cur), c.gex_exited?.()))
					return c.gex_exit_code();
				if (c.gex_paused_for_net() || c.gex_paused_for_input()) {
					let e = 0,
						t = this.#Le();
					for (; c.gex_paused_for_net() || c.gex_paused_for_input(); ) {
						if (c.gex_exited?.()) return c.gex_exit_code();
						if (c.gex_paused_for_input()) {
							let e = this.#r.readStdin();
							(c.gex_paused_for_net()
								? await Promise.race([
										e,
										new Promise((e) => setTimeout(() => e(!0), 5)),
									])
								: await e) === !1 &&
								(this.endStdin(), await new Promise((e) => setTimeout(e, 1)));
						} else if (
							o.on
								? (await this.#Pi(20)) < 0
								: c.gex_paused_for_host() || c.gex_park(20) < 0
						) {
							let e = !!c.gex_paused_for_host();
							((this.#je = e ? this.#je + 1 : 0),
								e && c.gex_wait_bound_ms && c.gex_wait_word?.()
									? (this.waits.net++, await this.#Re(c, t))
									: e && this.#je & 1023
										? (this.waits.turn++, await this.#Ae())
										: (this.waits.nap++, await this.#ze()));
						} else (this.waits.park++, await this.#Ae());
						if (c.gex_exited?.()) return c.gex_exit_code();
						if (((t = this.#Le()), (e = c.gex_wake()), e === 1)) break;
					}
					if (c.gex_exited?.()) return c.gex_exit_code();
					if (e !== 1) {
						let t =
							(c.gex_exited ? !c.gex_exited() : !1) &&
							!(c.gex_ctx_exited?.(r) > 0);
						if (t) {
							try {
								c.gex_dump_threads?.();
							} catch {}
							let n = `[gex] the run stopped and nothing could wake it (wake=${e}, exited=${!t})`;
							return (
								this.#r.write(2, new TextEncoder().encode(`${n}\n`)),
								console.error(n),
								125
							);
						}
						return c.gex_exit_code();
					}
					n = c.gex_resume_pc();
					let i = c.gex_resume_ctx() >>> 0;
					i !== 0 && (r = i);
					continue;
				}
				if (c.gex_current_pc && !String(e).includes(`unreachable`)) {
					let t = c.gex_current_pc(),
						n = ``;
					if (c.gex_object_at) {
						let e = c.gex_alloc(160) >>> 0,
							r = c.gex_object_at(t, e, 160) >>> 0;
						r && (n = ` in ` + V(this.#Ye().subarray(e, e + r)));
					}
					let r = c.gex_current_ctx ? c.gex_current_ctx() : 0n,
						i = c.gex_heap_used_kib?.() ?? -1,
						a = c.gex_heap_total_kib?.() ?? -1,
						o =
							i >= 0 && a > 0
								? `, heap ${(i / 1024).toFixed(0)}/${(a / 1024).toFixed(0)} MiB`
								: ``,
						s = ``;
					if (c.gex_dispatch_slot) {
						let e = c.gex_dispatch_slot(t),
							n = this.#po()
								.map((e) => e.length)
								.join(`,`);
						s =
							e < 0
								? `, no slots for this page, tables ${n}`
								: `, table ${e >>> 24} slot ${e & 16777215}, tables ${n}`;
					}
					e.message += ` (guest pc=0x${(t < 0n ? t + (1n << 64n) : t).toString(16)}${n}, ctx=0x${r.toString(16)}${o}${s})`;
				}
				if (String(e).includes(`unreachable`)) {
					if (!c.gex_exited?.() && c.gex_wake && c.gex_resume_pc) {
						let e = c.gex_wake(),
							t = c.gex_resume_pc();
						if (e === 1 && t !== 0n) {
							n = t < 0n ? t + (1n << 64n) : t;
							let e = c.gex_resume_ctx?.() >>> 0;
							e && (r = e);
							continue;
						}
						globalThis.GEX_REPORT_ABANDONED &&
							console.error(
								`[gex] final handoff recovery found scheduler=${e}, resume=0x${(t < 0n ? t + (1n << 64n) : t).toString(16)}`,
							);
					}
					if (
						(!c.gex_exited?.() && globalThis.GEX_REPORT_ABANDONED) ||
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
									c.gex_current_pc,
									(e) =>
										`, pc=0x${(e < 0n ? e + (1n << 64n) : e).toString(16)}`,
								) +
								t(c.gex_last_syscall, (e) =>
									e === 4294967295 ? `` : `, in syscall ${e}`,
								),
							r = t(c.gex_heap_used_kib, (e) =>
								e >= 0 ? `, shim heap ${(e / 1024).toFixed(1)} MiB` : ``,
							);
						if (
							(console.error(
								`[gex] run ended: ${c.gex_exited?.() ? `exited` : `ABANDONED`}, code ${c.gex_exit_code()}${n}${r}`,
							),
							!c.gex_exited?.())
						)
							try {
								let e = this.#Ce,
									t = e?.k_panic_len?.() >>> 0;
								if (t) {
									let n = e.k_panic_ptr() >>> 0,
										r = this.#ye.memory;
									console.error(
										`[gex] the global kernel panicked: ` +
											V(new Uint8Array(r.buffer, n, t)),
									);
								}
							} catch {}
						if (!c.gex_exited?.() && c.gex_last_open && c.gex_alloc)
							try {
								let e = c.gex_alloc(256) >>> 0,
									t = c.gex_last_open(e, 256) >>> 0,
									n = V(this.#Ye().subarray(e, e + t));
								(c.gex_free?.(e, 256),
									n && console.error(`[gex] the last path it opened: ${n}`));
							} catch {}
						if (!c.gex_exited?.()) {
							try {
								c.gex_dump_threads?.();
							} catch {}
							try {
								c.gex_dump_state?.();
							} catch {}
							console.error(
								`[gex] the stack under it:\n${e.stack ?? String(e)}`,
							);
						}
					}
					return c.gex_exit_code();
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
				u = Math.min(Math.max(o, Math.min(s * 2, s + Ye)), i);
			(this.#E++,
				(this.#D += u - r[a].length),
				(this.#k += u),
				u - r[a].length > 1e5 &&
					this.#C.push(
						`${t}:t${a}:${r[a].length}->${u}:need${e}:ni${o}:tn${n.gex_table_need ? n.gex_table_need(a) >>> 0 : -1}`,
					));
			try {
				Dt(r[a], u - r[a].length, l, a);
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
					(Dt(t[i], a - t[i].length, n, i),
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
		if (++this.#ge < Ot()) return;
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
		return new WebAssembly.Suspending((i, o) =>
			this.#ra()
				? e(i, o)
				: ((this.#Fi ??= WebAssembly.promising(r.gex_syscall)),
					(this.#Se = `syscall`),
					this.#Fi(i, n ? BigInt.asIntN(64, BigInt(o) | n) : o).then(
						() => (
							(this.#Se = `syscall-done`),
							t?.(),
							r.gex_last_syscall() ===
							(globalThis.GEX_ARCH === `x86` ? 24 : 124)
								? a.yieldNow(this.#be)
								: a.maybeYield(this.#be)
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
				this.#ra() ? 0 : a.maybeYield(this.#be)
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
			n = t.getBigUint64(e + Xe, !0),
			r = t.getBigUint64(e + this.#sa(), !0),
			i = -1;
		for (let e = this.#Di.length - 1; e >= 0; e--) {
			let t = this.#Di[e];
			if (t.ret === n && r >= t.spWant && r <= t.spWant + t.span) {
				i = e;
				break;
			}
		}
		if ((t.setBigUint64(e + Ze, n, !0), i >= 0))
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
		return e === J.length ? this.#n.exports.blocks : this.#po()[e];
	}
	#Ui = new WeakMap();
	#Wi(e, t) {
		let n = this.#Ui.get(e);
		n || this.#Ui.set(e, (n = new Map()));
		let r = n.get(t);
		return (
			r ||
				((lt ??= new WebAssembly.Module(st)),
				(this.#Gi ??= (e) => this.#Vi(e >>> 0)),
				(r = new WebAssembly.Instance(lt, {
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
		return n ? (this.#V && e === J.length ? t >>> 8 : t) < n.length : !1;
	}
	#qi(e, t) {
		let n = this.#Hi(e);
		if (!this.#V || e !== J.length) return n.get(t);
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
		if (!this.#V || e !== J.length) {
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
		((f.span = p >= 0n ? p : $e),
			(f.unwound = p >= 0n ? p : f.ret === et ? tt : $e),
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
						t === Tt)
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
								Number(e) + Xe,
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
						f.ret === et &&
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
						if (r && o.gex_fault_nesting?.() > 0 && !pt())
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
					if ((m === et || m === nt) && o.gex_callout_stray?.(0)) {
						let t =
							m === et &&
							f.ret === et &&
							y >= f.spWant &&
							y <= f.spWant + f.unwound;
						return (
							t && o.gex_callout_stray(1),
							new DataView(this.#e.buffer).setBigUint64(e + Ze, t ? m : nt, !0),
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
							new DataView(this.#e.buffer).setBigUint64(e + Ze, m, !0),
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
					`[callout] end depth ${l}: pc ${t.getBigUint64(e + Ze, !0).toString(16)} sp ${t.getBigUint64(e + this.#sa(), !0).toString(16)} want ${f.spWant.toString(16)}`,
				);
			}
		}
	}
	#aa = 0;
	#oa = -1;
	#sa() {
		return (
			this.#oa < 0 && (this.#oa = this.#t.exports.gex_ctx_sp?.() ?? Qe),
			this.#oa
		);
	}
	#ca(e) {
		return BigInt.asUintN(
			64,
			new DataView(this.#e.buffer).getBigUint64(e + Ze, !0),
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
		let s = this.#Jt().ftab.get(B(r));
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
			: U(t);
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
		let r = Ge(this.#fa, e);
		if (r < 0) return;
		let i = globalThis.GEX_REGISTRY_TRACE || {}.GEX_REGISTRY_TRACE,
			a = i ? 20 : 26;
		if (Math.floor((r + e.length) / 2 ** a) !== Math.floor(r / 2 ** a)) {
			let t = `[gex] module store at ${((r + e.length) / 1048576).toFixed(0)} MiB; registry bytes in the shim heap: ${n.gex_registry_mib?.(0) ?? `?`} MiB`,
				a = i ? globalThis.process?.getBuiltinModule?.(`fs`) : null;
			a ? a.writeSync(2, `${t}\n`) : jt(t);
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
		let n = on(e);
		if (n < 0) return `u:${U(e)}`;
		let r = e.slice(n, n + 4);
		e.fill(0, n, n + 4);
		let i = U(e);
		return (e.set(r, n), `u:${i}`);
	}
	#xa(e) {
		let t = this.#t.exports.gex_jit_pending_key,
			n = e.length,
			r = `${n}:${t(0) >>> 0}:${t(1) >>> 0}`,
			i = `u:${n}:${t(2) >>> 0}:${t(3) >>> 0}`;
		if (globalThis.GEX_CHECK_INSTALL || {}.GEX_CHECK_INSTALL) {
			let t = U(e),
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
						Vt() + Number(n >> 12n) * 4,
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
						`${{}.GEX_DUMP_WASM}/u-${this.#t.exports.gex_my_pid?.() ?? 0}-${U(e).replaceAll(`:`, `-`)}.wasm`,
						e,
					);
			} catch {}
		let m = s ?? sn(e instanceof Uint8Array ? e : p);
		this.#ve.push({
			mod: p,
			need: t,
			meta: e instanceof Uint8Array ? cn(e) : void 0,
			dense: m ?? void 0,
		});
		let h = { ...this.#a };
		for (let e = 0; e < d.length; e++) h[J[e]] = d[e];
		if (
			((h.dense_base = 0),
			this.#n?.exports?.blocks &&
				((h.blocks = this.#n.exports.blocks), this.#do(), m))
		) {
			let t = new DataView(m.buffer, m.byteOffset, m.byteLength),
				n = t.getUint32(0, !0);
			if (globalThis.GEX_DENSE_DEBUG) {
				let r = e instanceof Uint8Array ? sn(p) : null,
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
		let g = r ?? (e instanceof Uint8Array ? cn(e) : null);
		l.push(performance.now());
		let _ = an(e);
		l.push(performance.now());
		let v = _.length ? _ : g ? rn(g) : [];
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
					((a += i - d[e].length), Dt(d[e], i - d[e].length, r, e));
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
					`[fill] module ${this.#R}: gexfill ${typeof y.exports[kt]}, exports ${Object.keys(y.exports).slice(0, 4).join(`,`)}`,
				),
			typeof y.exports[K] == `function`)
		)
			(this.#W.unshift(y), c.gex_fill_possible?.(1));
		else if (typeof y.exports[Ft] == `function`) y.exports[Ft]();
		else if (typeof y.exports[kt] == `function`)
			for (let e = 0; y.exports[kt](e); e++);
		return (l.push(performance.now()), (this.#Ba = l), y);
	}
	#Ma(e) {
		typeof e?.exports?.[K] == `function` &&
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
		return r === 0 ? 0 : (this.#Fa(n, r + Nt), r >>> 0);
	}
	#Fa(e, t) {
		let n = this.#t.exports,
			r = this.#po();
		if (e < 0 || e >= r.length || r[e].length >= t || this.#ro(e)) return;
		let i = (n.gex_slots_per_table?.() ?? 0) >>> 0 || 2 ** 53 - 1,
			a = Nt * 16,
			o = Math.min(Math.ceil(t / a) * a, i),
			s = r[0].get(0),
			c = o - r[e].length;
		if (c <= 0) return;
		let l = performance.now();
		(Dt(r[e], c, s, e),
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
				let n = l + ((s & 4095) >>> q);
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
						f = o?.exports?.[K];
					if (typeof f == `function`) {
						let t = ((s & 4095) >>> q) & -32,
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
		let a = t + ((n & 4095) >>> q);
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
							? typeof r.instObj.exports[K] == `function`
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
				if (typeof r.instObj.exports[K] != `function`) {
					i = !0;
					continue;
				}
				this.#_ ||
					((this.#_ = !0),
					r.instObj.exports[K].length < 3 &&
						this.#t.exports.gex_set_fill_width?.(Nt));
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
				let u = s > 0 && r.instObj.exports[K](t, s, l);
				if (((this.#g += performance.now() - c), e.watchSlot && s > 0)) {
					let n = Number(this.#t.exports.gex_fill_pc?.() ?? 0n);
					if (n && e.#Ke < 12) {
						e.#Ke++;
						let r = s + ((n & 4095) >>> q),
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
								`[closure] pc ${n.toString(16)} page ${t} slot ${r} (base ${s} + ${(n & 4095) >>> q}) t=${i}: ${o}`,
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
			if (e.exports[K](t, a, this.#Ia()) && this.#La(t, a))
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
		if (i && typeof i.exports[K] != `function`) return !0;
		let a = this.#Pa(t);
		if (i && a > 0 && i.exports[K](t, a, this.#Ia()) && this.#La(t, a))
			return (this.#J++, !0);
		if (t * 4096 >= 77594624) {
			for (let e of this.#W)
				if (a > 0 && e.exports[K](t, a, this.#Ia()) && this.#La(t, a))
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
		if (!(n >= je) && !/^(wasm|cgen|cold):/.test(String(e))) {
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
		return this.#B && e >= Je;
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
		return new WebAssembly.Instance(new WebAssembly.Module(ot), {
			w: {
				count: (e) => {
					let i = new DataView(this.#e.buffer).getBigUint64((e >>> 0) + Xe, !0);
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
				((ct ??= new WebAssembly.Module(at)),
				(t = new WebAssembly.Instance(ct, { w: { f: e } }).exports.e),
				this.#H.set(e, t),
				this.#so.add(t)),
			t
		);
	}
	#lo(e, t, n, r) {
		for (let i = 0; i + 1 < n.length; i += 2)
			n[i] === J.length ? this.#uo(t, n[i + 1], r) : e[n[i]].set(n[i + 1], r);
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
					c = J.length,
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
			: (Dt(e, t + Math.max(t >>> 3, 4096) - n, e.get(0), `blocks`),
				this.#fo(`blocks grew`),
				!0);
	}
	#fo(e) {
		if (!m(`tables`)) return;
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
		for (let t of J) {
			let n = this.#n.exports[t];
			if (!n) break;
			e.push(n);
		}
		return e;
	}
});
function dn(e) {
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
function fn(e) {
	let t = [],
		n = (e) => {
			if (!ArrayBuffer.isView(e)) return;
			let n = e.buffer;
			!(n instanceof ArrayBuffer) || t.includes(n) || t.push(n);
		};
	for (let t of e?.image ?? []) n(t?.bytes);
	return (n(e?.vmaBlob), n(e?.fds), n(e?.pages), n(e?.shared), t);
}
function pn(e) {
	if (!m(`debug`)) return;
	let t = typeof process < `u` ? process.stderr : null;
	t?.write ? t.write(`${e}\n`) : console.debug(e);
}
function mn(e) {
	if (h()) return;
	let t = typeof process < `u` ? process.getBuiltinModule?.(`fs`) : null;
	if (t?.writeSync)
		try {
			t.writeSync(2, `${e}\n`);
			return;
		} catch {}
	console.info(e);
}
var hn = !!(
	globalThis.GEX_MEMORIES ||
	{}.GEX_MEMORIES ||
	(typeof location < `u` &&
		new URLSearchParams(location.search).get(`memories`) === `1`)
);
function gn(e) {
	hn && globalThis.__gexMemories?.delete(Number(String(e).split(`:`)[0]));
}
var _n = new Set(),
	vn = null;
function yn(e) {
	if (!e || (e.kind !== `module` && e.kind !== `unit`) || !e.path) return;
	let t = String(e.path).replace(/^wasm(dll|prog):/, ``);
	_n.has(t) ||
		(_n.add(t),
		p() &&
			mn(
				`[gex] loaded ${t}${e.kind === `unit` ? (e.hit ? ` (with its unit)` : ` (no unit)`) : ``}`,
			));
}
function bn() {
	vn ||
		typeof BroadcastChannel != `function` ||
		((vn = new BroadcastChannel(`gex-fetch`)),
		vn.unref?.(),
		(vn.onmessage = (e) => yn(e.data?.status)));
}
function xn(e) {
	(yn(e?.status), bn());
	try {
		vn?.postMessage(e);
	} catch {}
}
function Sn(e) {
	try {
		globalThis.GEX_ON_CRASH?.(e);
	} catch {}
}
var Cn = Symbol(`gex.early`),
	Y = Symbol(`gex.pooled`),
	wn = Symbol(`gex.stackKey`),
	Tn = Symbol(`gex.ready`),
	En = Symbol(`gex.listening`);
function Dn(e, t) {
	let n = e?.gexName;
	if (!n) return;
	let r = (globalThis.__gexWorkers ??= new Map()),
		i = r.get(n);
	i ? i.push(String(t)) : r.set(n, [String(t)]);
}
var On = Symbol(`gex.reuses`),
	kn = 256,
	An = 2,
	jn = 6e4,
	Mn = 4,
	Nn = 8,
	Pn = 5e3,
	Fn = !!{}.GEX_TEST_FORK_RECORDS,
	In = 768 << 20,
	Ln = 15e3;
function Rn(e) {
	if (e?.extent !== void 0) return e.extent;
	let t = 0;
	for (let n of e?.image ?? [])
		t = Math.max(t, n.end ?? 0, n.at + (n.len ?? n.bytes?.byteLength ?? 0));
	return t;
}
var zn = 1024,
	Bn = 1024 << 20,
	Vn = 4096,
	Hn = 16384,
	Un = 256 << 20,
	Wn = 256 << 20,
	Gn = 512,
	Kn = (e) => Number(String(e).replace(/^u:/, ``).split(`:`)[0]) || 0,
	qn = (e) => Number(String(e).split(`:`)[1]) || 0;
function Jn(e) {
	return e.length;
}
var Yn = `a restored session takes no snapshot: a new one comes from a fresh boot that records`;
function Xn(e, t = null) {
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
function Zn() {
	return String(
		BigInt(Math.round(performance.timeOrigin * 1e3)) * 1000n +
			BigInt(Math.round(performance.now() * 1e6)),
	);
}
function Qn(e, t, n = null) {
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
var $n = globalThis.Buffer
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
			for (let r = n << 2; r < e.length; r++) if (e[r] !== t[r]) return !1;
			return !0;
		};
function er(e, t) {
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
function tr(e, t, n) {
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
				!$n(new Uint8Array(e, n, r), h.subarray(n - t, n - t + r)) ||
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
var nr = class {
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
			if (o.on || typeof SharedArrayBuffer > `u`) return;
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
				i = [...this.#C.entries(), ...this.#w.entries(), ...this.#E.entries()],
				a = n?.[Y];
			return [...r, ...(a ? i.filter(([e]) => !a.has(e)) : i)];
		}
		#I(e) {
			let t = [
				...this.#C.entries(),
				...this.#w.entries(),
				...this.#E.entries(),
			];
			((e[Y] = new Set(t.map(([e]) => e))),
				t.length && e.postMessage({ kind: `pooledModules`, entries: t }));
		}
		#L(e) {
			if (!this.#r || !this.#Z || !this.#i?.shared || e[wn]) return;
			let t = `pool:${++this.#R}`,
				n;
			try {
				n = this.#Oe(t);
			} catch {
				return;
			}
			((e[wn] = t),
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
			if (this.#te.some((e) => e[wn] !== void 0)) return;
			let e = this.#te.find((e) => e[Tn]);
			e && this.#L(e);
		}
		#B(e, t) {
			let n = e[wn];
			if (n === void 0) return this.#Oe(t);
			delete e[wn];
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
					this.#E.size > Vn;
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
				!n[Y] ||
					n[Y].has(e) ||
					(n[Y].add(e),
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
				(this.#ve = r ? we() : void 0),
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
			return this.#c.get(Number(String(e).split(`:`)[0])) ?? !!this.#i?.mem64;
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
				typeof this.#a == `function` ? await (this.#s ??= this.#a()) : this.#a;
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
			bn();
			let a = [r.argv0, ...n]
				.filter((e) => typeof e == `string` && e)
				.join(` `);
			p() &&
				mn(
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
			if (this.#ge) return { refused: Yn, stopMs: 0 };
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
				f = Zn();
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
				g = tr(h, er(h, r.extents), n),
				_ = Xn(h, g.skip);
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
					(v.set(n, Xn(t.memory.buffer)), (b[n] = t.maxPages), t.moduleStore)
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
					door: this.#_ ? { ...this.#_, memory: void 0, module: void 0 } : null,
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
			if (((this.#ge = !0), bn(), !this.#r?.memory))
				throw Error(`restore: no global kernel`);
			if (e.refs?.length && (!a || (a.id ?? null) !== r.bundle))
				throw Error(
					`restore: the snapshot's pages are by reference to bundle ${r.bundle}, and this session's is ${a?.id ?? `none`}`,
				);
			let s = this.#r.memory,
				c = Math.ceil((Jn(e) - s.buffer.byteLength) / 65536);
			(c > 0 && s.grow(c), Qn(s, e, a));
			let l = new Int32Array(s.buffer),
				u = r.stacks.snapWord >>> 2;
			(Atomics.store(l, u, 1), (this.#Z = r.stacks));
			for (let [e, t] of r.flavourOf ?? []) this.#c.set(e, t);
			mn(`[gex] restore: ${r.threads.length} threads of ${t.size} processes`);
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
						initial: Jn(a) / 65536,
						maximum: r.maxPages[e],
						shared: !0,
					});
				Qn(o, a);
				let s,
					c = n.get(e);
				(c &&
					((s = new SharedArrayBuffer(Math.max(1 << 20, c.length), {
						maxByteLength: 4294967296,
					})),
					new Uint8Array(s).set(c)),
					hn && (globalThis.__gexMemories ??= new Map()).set(e, o));
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
				let e = r.at ? BigInt(Zn()) - BigInt(r.at) : 0n;
				(e > 0n &&
					r.stacks.monoHeld &&
					Atomics.add(new BigUint64Array(s.buffer), r.stacks.monoHeld >>> 3, e),
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
				e && Atomics.or(e, 0, Ce),
				P(e)
					? (async () => {
							let t = performance.now();
							for (; P(e) && performance.now() - t < jn; ) await F(5);
							(P(e) &&
								console.log(
									`[gex] xcache: a save still under way after ${jn / 1e3} s; stopping anyway`,
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
					(this.#g.set(e, i), Dn(i, e), e === 1 && (this.#b = i));
					let a = (t) => this.#ze(e, i, t.data, n, r),
						o = (t) => this.#ze(e, i, t, n, r);
					(i.addEventListener?.(`message`, a), i.on?.(`message`, o));
					let s = (t) => {
						(this.#g.delete(e),
							r(t instanceof Error ? t : Error(t?.message ?? String(t))));
					};
					(i.addEventListener?.(`error`, s),
						i.on?.(`error`, s),
						(i[En] = { onEvent: a, onMsg: o, fail: s }),
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
					pn(`[host] pid ${e}: worker taken, ${c} held for ready`);
					let l = i[Cn];
					if (l) {
						(delete i[Cn],
							i.removeEventListener?.(`message`, l.buf),
							i.off?.(`message`, l.buf));
						for (let t of l.early) this.#ze(e, i, t, n, r);
					}
				})
			);
		}
		#xe(e = !1) {
			let t = this.#te.findIndex((t) => (t[wn] !== void 0) === e);
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
			e[Tn] = !1;
			let i = (i) => {
				let a = i && i.data !== void 0 ? i.data : i;
				(a?.kind === `ready` && (r = !0),
					r &&
						(n.push(a),
						a?.kind === `ready` &&
							((e[Tn] = !0),
							e[Y] || this.#I(e),
							this.#te.includes(e) && this.#z()),
						a?.kind === `ready` && !t && this.#te.includes(e) && this.#Se()));
			};
			(e.addEventListener?.(`message`, i),
				e.on?.(`message`, i),
				(e[Cn] = { early: n, buf: i }),
				t ? this.#te.unshift(e) : this.#te.push(e));
		}
		#we(e) {
			let t = (e[On] ?? 0) + 1,
				n = e[En];
			return !n || t > kn || this.#te.length >= this.#ne + An
				? !1
				: (delete e[En],
					e.removeEventListener?.(`message`, n.onEvent),
					e.off?.(`message`, n.onMsg),
					e.removeEventListener?.(`error`, n.fail),
					e.off?.(`error`, n.fail),
					(e[On] = t),
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
							if (!r.ok) throw Error(`${n.url}: ${r.status} ${r.statusText}`);
							let i = new Uint8Array(await r.arrayBuffer()),
								a = await WebAssembly.compile(i);
							return (
								pn(
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
			(this.#g.set(t, r), Dn(r, t));
			let i = { key: t },
				a = (e) =>
					this.#ze(
						i.key,
						r,
						e,
						() => {},
						() => {},
					);
			(r.addEventListener?.(`message`, (e) => a(e.data)), r.on?.(`message`, a));
			let o = (t) => {
				(this.#d(
					2,
					`gex: thread ${i.key} failed: ${t?.message ?? String(t)}\n`,
					e,
				),
					Sn(`thread ${i.key}: ${t?.message ?? String(t)}`));
			};
			(r.addEventListener?.(`error`, o), r.on?.(`error`, o), this.#y.set(t, n));
			let s = r[Cn];
			if (s) {
				(delete r[Cn],
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
							g(`spare`) &&
								console.warn(
									`[spare] ${n}: let go, no thread in ${Pn / 1e3} s`,
								),
							this.#Pe(a));
					}, Pn).unref?.(),
					g(`spare`) &&
						console.warn(
							`[spare] ${n}: started (${this.#q.length} waiting on the page)`,
						);
				this.#q.length > Nn;
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
				a = [...this.#g.keys()].filter((e) => String(e).split(`:`)[0] === i);
			if (a.length && a.every((e) => this.#q.some((t) => t.ref.key === e))) {
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
					(pn(
						`[host] ${this.#re.length} kept memories let go: no exit in ${Ln / 1e3} s`,
					),
						(this.#re.length = 0),
						(this.#ie = null));
				}, Ln)),
				this.#ie.unref?.());
			let t = this.#re.reduce((e, t) => e + t.buffer.byteLength, 0);
			for (; this.#re.length > Mn || (this.#re.length > 1 && t > In); )
				t -= this.#re.shift().buffer.byteLength;
			t > In && (this.#re.length = 0);
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
						pn(
							`[host] pid ${e}: ready, ${n ? `sending ${n.kind}` : `NOTHING HELD`}`,
						),
						n &&
							this.#me(e).then((r) => {
								let { closure: i, ...a } = this.#i,
									o = g(`unitstall`) ? performance.now() : -1;
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
										memories: hn || void 0,
										recycledMemory:
											n.kind === `adopt` &&
											n.child &&
											!n.child.exec &&
											!this.#pe(e)
												? this.#Re(Rn(n.child))
												: void 0,
									},
									[
										...fn(n.child),
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
								(Fn && this.#oe(e),
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
					xn(n.note);
					break;
				case `doorPublish`:
					((this.#_ = n.door),
						pn(`[host] wineserver pid ${n.door?.pid} published its door`));
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
						(a?.has(e) && (a.delete(e), (a.bytes = (a.bytes ?? 0) - Kn(e))),
							this.#w.delete(e) &&
								((this.#T -= Number(e.split(`:`)[1])), o.push(e)));
					for (let [e, n] of this.#g)
						n !== t &&
							String(e).split(`:`)[0] === r &&
							n.postMessage({ kind: `droppedModules`, keys: i });
					if (o.length) {
						for (let e of this.#te)
							if (e[Y]) {
								for (let t of o) e[Y].delete(t);
								e.postMessage({ kind: `droppedModules`, keys: o });
							}
					}
					break;
				}
				case `unitFile`:
					typeof n.rel == `string` &&
						!this.#k.has(n.rel) &&
						this.#k.size < Hn &&
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
						s = g(`unitstall`);
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
						for (let t of this.#C.keys()) e += qn(t);
						for (; this.#C.size > 1 && (this.#C.size > zn || e > Bn); ) {
							let t = this.#C.keys().next().value;
							((e -= qn(t)), this.#C.delete(t));
						}
					}
					if (typeof n.key == `string` && n.key.startsWith(`u:`)) {
						if (this.#i?.unitCache && !this.#w.has(n.key))
							for (
								this.#w.set(n.key, n.mod),
									this.#U(n.key, n.mod),
									this.#T += Number(n.key.split(`:`)[1]);
								(this.#T > Un || this.#w.size > Gn) && this.#w.size > 1;
							) {
								let e = this.#w.keys().next().value;
								((this.#T -= Number(e.split(`:`)[1])), this.#w.delete(e));
							}
						break;
					}
					if (typeof n.key == `string` && !i.has(n.key)) {
						for (
							i.set(n.key, n.mod), i.bytes = (i.bytes ?? 0) + Kn(n.key);
							(i.bytes > Wn || i.size > Gn) && i.size > 1;
						) {
							let e = i.keys().next().value;
							((i.bytes -= Kn(e)),
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
								i.postMessage({ kind: `sharedModule`, key: n.key, mod: n.mod });
					}
					break;
				}
				case `fork`: {
					let t = n.child?.forkCost;
					if (t) {
						let e = Math.round(
							performance.timeOrigin + performance.now() - t.sentAt,
						);
						(pn(
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
						Fn && this.#ae.set(n.child.pid, new WeakRef(n.child)));
					let r = n.child.pid;
					(this.#be(r, { kind: `adopt`, child: n.child }).catch((t) => {
						(this.#d(2, `gex: process ${r} failed: ${t.message}\n`, e),
							Sn(`pid ${r}: ${t.message}`));
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
					(hn &&
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
							Dn(a.w, t));
						let e = this.#le.get(a.key);
						e !== void 0 && (this.#le.delete(a.key), this.#le.set(t, e));
						let r = this.#y.get(a.key);
						(r && (this.#y.delete(a.key), this.#y.set(t, r)),
							(a.ref.key = t),
							g(`spare`) &&
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
					if ((this.#Fe(t), this.#pe(t) || !this.#i?.shared || o.on)) break;
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
							gn(r),
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
							this.#v && Atomics.compareExchange(this.#v, 0, this.#_.pid, 0),
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
						n.traps && g(`traps`))
					) {
						let t = n.traps;
						console.error(
							`[gex] pid ${e}: traps straight on/through each step: run loop ${t.loop}/${t.loopFull}, call-outs ${t.callout}/${t.calloutFull}, native calls ${t.native}/${t.nativeFull}`,
						);
					}
					if (!this.#i?.ownExitLines && n.millis !== void 0 && m(`debug`)) {
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
									(n.waits.park || n.waits.turn || n.waits.nap || n.waits.net)
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
											(n.fill.bigGrows ? `, big [${n.fill.bigGrows}]` : ``) +
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
					for (let t of n.hot ?? []) this.#d(2, `[hot] pid ${e}: ${t}\n`, e);
					(this.#p(n, e), gn(e), this.#Ae(e, t, !!n.giveBack), r(n.status));
					break;
				case `threw`:
					(String(e).includes(`:`) || gn(e),
						this.#Ae(e, t),
						console.error(
							`[gex] pid ${e} threw: ${n.message}\n${n.stack ?? ``}`,
						),
						Sn(`pid ${e} threw: ${n.message}`),
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
	},
	rr = () => {
		o.on && a.checkSlots();
	},
	ir = 256,
	ar = 4096,
	or = class e {
		#e;
		#t;
		#n;
		static async open(t) {
			return !t?.module || !t?.memory
				? null
				: !o.on &&
					  typeof Worker == `function` &&
					  typeof SharedArrayBuffer < `u` &&
					  t.memory.buffer instanceof SharedArrayBuffer
					? sr.open(t)
					: e.openHere(t);
		}
		static async openHere(t) {
			if (!t?.module || !t?.memory) return null;
			let n =
					t.module instanceof WebAssembly.Module
						? t.module
						: await WebAssembly.compile(t.module),
				i,
				a;
			try {
				try {
					((a = new WebAssembly.Memory({
						initial: 1,
						maximum: 65535,
						shared: !0,
					})),
						(i = await WebAssembly.instantiate(n, {
							env: {
								memory: t.memory,
								...ge(a),
								lazy_fetch: be(t.memory),
								page_fs: r(t.memory),
							},
						})));
				} catch {
					((a = new WebAssembly.Memory({ initial: 1, maximum: 65535 })),
						(i = await WebAssembly.instantiate(n, {
							env: {
								memory: t.memory,
								...ge(a),
								lazy_fetch: be(t.memory),
								page_fs: r(t.memory),
							},
						})));
				}
			} catch (e) {
				return (console.warn(`[gex] no shared terminal: ${e.message}`), null);
			}
			let o = i.exports;
			return typeof o.k_tty_input == `function`
				? (o.k_stack_area &&
						i.exports.__stack_pointer &&
						ye(i.exports, ve(o, `tty`)),
					new e(o, a))
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
				let r = t.subarray(e, e + ar - ir);
				(this.#r().set(r, ir), (n = this.#e.k_tty_input(BigInt(ir), r.length)));
			}
			return (rr(), n);
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
				let t = this.#e.k_tty_echo(BigInt(ir), 3840);
				if (t <= 0 || (e.push(this.#r().slice(ir, ir + t)), t < 3840)) break;
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
			(this.#e.k_stdin_eof(), rr());
		}
		lflag() {
			if (this.#e.k_tty_get_termios(BigInt(ir), 60) < 16) return 0;
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
			return (rr(), r);
		}
		fg() {
			return this.#e.k_tty_fg();
		}
		signal(e) {
			let t = this.#e.k_tty_signal(e >>> 0);
			return (rr(), t);
		}
	},
	sr = class e {
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
	},
	cr = `gex-modules-v1`,
	lr = /(["'`])(\.\/[A-Za-z0-9_.-]+\.m?js)\1/g,
	ur = /(?:\bfrom\s*|\bimport\s*\(?\s*)(["'`])([^"'`\s]+)\1/g,
	dr = (e) =>
		/-[A-Za-z0-9_-]{8}\.m?js$/.test(
			new URL(/* @vite-ignore */ /* webpackIgnore: true */ e).pathname,
		);
function fr(e) {
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
async function pr(e, t = () => {}) {
	let n = null;
	try {
		n = typeof caches == `object` && caches ? await caches.open(cr) : null;
	} catch {
		n = null;
	}
	let r = async (e) => {
			if (n && dr(e))
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
					dr(e) &&
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
			let n = [...t.matchAll(ur)]
				.map((e) => e[2])
				.find((e) => !e.startsWith(`./`));
			if (n) throw Error(`${e} imports ${n}`);
			let c = [
				...new Set(
					[...t.matchAll(lr)].map(
						(t) =>
							new URL(/* @vite-ignore */ /* webpackIgnore: true */ t[2], e)
								.href,
					),
				),
			];
			for (let e of c) await s(e);
			t = t.replace(
				lr,
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
var mr = e({
		TerminalEnv: () => Jr,
		archAsset: () => xr,
		audioFrom: () => ri,
		detectTso: () => Kr,
		elfMachine: () => wr,
		execOptions: () => ai,
		fetchBytes: () => Nr,
		glOnFirstRequest: () => pi,
		glStarter: () => li,
		globalKernel: () => Zr,
		guestArch: () => X,
		heldBytes: () => Lr,
		loadKernel: () => Zr,
		loadRuntime: () => Hr,
		makeProcessHost: () => ui,
		multiarch: () => Cr,
		openGlChannel: () => fi,
		openNet: () => di,
		openWayland: () => mi,
		primeRuntime: () => Vr,
		runProgram: () => ni,
		runtimeUrls: () => Ur,
		singleMode: () => $r,
		startHostGl: () => Xr,
		startXServer: () => ii,
		workerGraphBytes: () => hr,
		xcRead: () => j,
		xcacheName: () => Rr,
	}),
	hr = { net: 0, cached: 0 },
	gr = (e) => {
		try {
			return new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ e,
				globalThis.location?.href,
			).href;
		} catch {
			return e;
		}
	},
	_r = (e) =>
		e.url.startsWith(`file:`)
			? {
					...e,
					root: decodeURIComponent(
						new URL(/* @vite-ignore */ /* webpackIgnore: true */ e.url)
							.pathname,
					),
				}
			: e,
	vr = 2,
	yr = 8;
function X() {
	return globalThis.GEX_ARCH === `x86` ? `x86` : `aarch64`;
}
function br() {
	return X() === `x86` ? `.x86` : ``;
}
function xr(e) {
	return X() === `x86` ? e.replace(/^\/(rootfs|closure|fs)\//, `/$1/x86/`) : e;
}
var Sr = !0;
function Cr() {
	return X() === `x86` ? `x86_64-linux-gnu` : `aarch64-linux-gnu`;
}
function wr() {
	return X() === `x86` ? 62 : 183;
}
var Tr = () => (globalThis.GEX_MEM64 && X() === `x86` ? `.m64` : ``),
	Er = () => u(`/gex/gex_browser${br()}${Tr()}.shared.wasm`),
	Dr = () => u(`/gex/seed${br()}${Tr()}.shared.wasm`),
	Or = () => u(`/gex/gex_kernel${br()}${Tr()}.wasm`),
	Z = null,
	kr = null;
function Ar(e, t, n) {
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
function jr(e) {
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
function Mr(e, t) {
	return e?.size ? (n) => e.get(n.split(`/`).at(-2)) ?? t(n) : t;
}
async function Nr(e, t) {
	let n = await fetch(e, { cache: `no-cache` });
	if (!n.ok) throw Error(`${e}: ${n.status} ${n.statusText}`);
	let r = Number(n.headers.get(`content-length`)) || 0;
	if (!t || !n.body) return Ar(e, n, new Uint8Array(await n.arrayBuffer()));
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
	return Ar(e, n, s);
}
var Q = null,
	Pr = { shim: null, kernel: null },
	Fr = () => !!$(`xcache`) && $(`xcache`) !== `0`;
function Ir(e, t) {
	(Fr() && t && (Pr[e] ??= M(t)), e === `shim` ? (Z = null) : (Q = null));
}
function Lr() {
	return { shim: !!Z, kernel: !!Q };
}
function Rr() {
	if (!Fr()) return;
	let e = Pr.shim ?? (Z && M(Z)),
		t = Pr.kernel ?? (Q && M(Q));
	return !e || !t
		? void 0
		: `xc-${M(e, t, [`tso`, `coherentloads`, `arch`, `mem64`, `fjit`, `fjitlibs`, `dense`, `dual`, `cgen`, `providers`, `elfunits`, `provskip`, `pins`, `sp`, `inlinedispatch`, `t1fold`, `liftmax`, `unitcache`].map((e) => `${e}=${$(e) ?? ``}`).join(`&`) + ($(`tso`) === `arm` && Wr() ? `&tsohost=1` : ``) + (globalThis.GEX_NULL_GUARD ? `&nullguard=1` : ``) + (globalThis.GEX_MXCSR ? `&mxcsr=1` : ``), globalThis.GEX_FLAVOUR ?? (typeof __GEX_FLAVOUR__ < `u` ? __GEX_FLAVOUR__ : ``), globalThis.location?.pathname ?? ``)}`;
}
var zr = null,
	Br = (e) => (zr ?? Nr)(e);
function Vr(e) {
	(e?.fetchOther && (zr = e.fetchOther),
		e?.shimBytes && !Z && (Z = e.shimBytes),
		e?.seedBytes && !kr && (kr = e.seedBytes),
		e?.kernelBytes && !Q && (Q = e.kernelBytes));
}
async function Hr(e) {
	return (
		(Z ||= await Nr(Er(), e)),
		(kr ||= await Nr(Dr())),
		{ shimBytes: Z, seedBytes: kr }
	);
}
function Ur() {
	return { shimBytes: Er(), seedBytes: Dr(), kernelBytes: Or() };
}
function Wr() {
	let e = $(`tso`) ?? $(`coherentloads`);
	return e === `arm` ? Gr : !!e && e !== `0`;
}
var Gr = !1;
async function Kr() {
	if ($(`tso`) === `arm`)
		try {
			let e = globalThis.navigator?.userAgentData;
			Gr =
				(e?.getHighEntropyValues
					? await e.getHighEntropyValues([`architecture`])
					: null
				)?.architecture === `arm`;
		} catch {
			Gr = !1;
		}
	return Wr();
}
function qr() {
	let e = $(`audiolatency`);
	return e !== null && e !== `` && Number.isFinite(+e) ? +e : `interactive`;
}
function $(e) {
	let t = l();
	return t
		? new URLSearchParams(t).get(e)
		: ({}[`GEX_${e.toUpperCase()}`] ?? null);
}
var Jr = class extends nn {
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
			return (this.lflag & vr) === 0;
		}
		#t() {
			return (this.lflag & yr) !== 0;
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
						.catch((e) => console.warn(`[gex] terminal: ${e?.message ?? e}`));
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
	},
	Yr = null;
async function Xr(e, t, r, i) {
	try {
		return await e.hostGl(t, r);
	} catch (e) {
		let a = e?.message || String(e);
		return (
			console.error(
				`[gex] the guest's OpenGL did not start (${r.backend || `wgpu`}): ${a}`,
			),
			i?.writeln?.(
				`gex: the guest's OpenGL did not start (${r.backend || `wgpu`}): ${a}`,
			),
			i?.writeln?.(`gex: GL windows will be blank; everything else still runs`),
			(globalThis.__gexGlError = a),
			t?.control &&
				(
					await n(
						async () => {
							let { failGlChannel: e } = await import(
								`./gl-bridge-JJI48dWv.mjs`
							);
							return { failGlChannel: e };
						},
						[],
						import.meta.url,
					)
				).failGlChannel(t),
			null
		);
	}
}
async function Zr() {
	if (Yr !== null) return Yr || null;
	if (typeof SharedArrayBuffer != `function` && !o.on) return ((Yr = !1), null);
	try {
		let e = Q ?? (await Nr(Or()));
		Q = e;
		let t = await WebAssembly.compile(e);
		(Ir(`kernel`, e),
			(Yr = {
				module: t,
				memory: new WebAssembly.Memory({
					initial: 2048,
					maximum: 65536,
					shared: !0,
				}),
				spare: he(!o.on),
			}));
	} catch {
		return ((Yr = !1), null);
	}
	return Yr;
}
async function Qr() {
	if (o.on) return () => new s();
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
			r = d().get(`workergraph`) === `0` ? null : fr(n),
			i = r
				? await pr(gr(r), (e, t) => {
						((hr.net += e), (hr.cached += t));
					})
				: null;
		return i
			? () => {
					let n = `gex-w${++e}`;
					return t(new Worker(i, { type: `module`, name: n }), n);
				}
			: n;
	}
	let { Worker: e } = await n(
			async () => {
				let { Worker: e } = await import(
					`./__vite-browser-external-6NL05v10.mjs`
				).then((e) => t(e.default, 1));
				return { Worker: e };
			},
			[],
			import.meta.url,
		),
		r = [`..`, `..`, `shims`, `browser`, `js`, `worker.mjs`].join(`/`);
	return () =>
		new e(
			new URL(/* @vite-ignore */ /* webpackIgnore: true */ r, import.meta.url),
		);
}
function $r() {
	if (o.on) return !0;
	let e = $(`single`);
	return e === `0` || !i()
		? !1
		: e === `1` || typeof SharedArrayBuffer != `function`;
}
function ei() {
	let e = { GEX_PAGE_SEARCH: l() };
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
async function ti(e, t) {
	let {
		network: r,
		onNetEvent: i,
		onFilesLoaded: a,
		onDesktop: o,
		onSystem: s,
		transfer: c,
		wl: l,
		wlInput: u,
		gl: d,
		hostX: f,
		preModules: p,
		closure: m,
		glSource: h,
		...g
	} = t;
	e.writeln?.(
		`gex: single-thread build (no SharedArrayBuffer): every guest thread in one Worker`,
	);
	let _ =
			typeof l?.getContext == `function` &&
			typeof l.transferControlToOffscreen == `function`
				? l
				: null,
		v = d === `compositor` && !!_,
		y = !!f && !!_;
	((l && !_) || (d && !v) || (f && !y)) &&
		e.writeln?.(
			`gex: the single-thread build has no ${[l && !_ && `DOM desktop`, d && !v && `GL`, f && !y && `X server`].filter(Boolean).join(`, `)} yet${_ ? `` : `; running without the screen`}`,
		);
	let b = new Worker(new URL("./system-worker-B7wX0xMV.mjs", import.meta.url), {
		type: "module",
		name: "system",
	});
	((globalThis.__gexSystemWorker = b),
		await new Promise((e, t) => {
			(b.addEventListener(`message`, (t) => {
				t.data?.kind === `ready` && e();
			}),
				b.addEventListener(`error`, (e) =>
					t(Error(e.message || `the system Worker failed to start`)),
				));
		}));
	let x = new Set(),
		S = null,
		C = {
			postMessage(e, t = []) {
				(e?.kind === `init` && e.stats && (S = new Int32Array(e.stats)),
					b.postMessage({ kind: `comp`, m: e }, t));
			},
			addEventListener(e, t) {
				e === `message` && x.add(t);
			},
			removeEventListener(e, t) {
				x.delete(t);
			},
			terminate() {},
		};
	b.addEventListener(`message`, (e) => {
		let t = e.data;
		if (t?.kind === `comp-out`) for (let e of [...x]) e({ data: t.m });
		else t?.kind === `comp-stats` && S && S.set(t.stats.subarray(0, S.length));
	});
	let w = null;
	if (_ && Sr) {
		let { Compositor: e } = await n(
			async () => {
				let { Compositor: e } = await import(`./compositor-BcFltmqO.mjs`);
				return { Compositor: e };
			},
			[],
			import.meta.url,
		);
		(b.postMessage({ kind: `comp-open`, width: _.width, height: _.height }),
			(w = await e.create(_, null, u || _, { makeWorker: () => C })),
			(globalThis.__gexCompositor = w));
	}
	let T = e.onData((e) => b.postMessage({ kind: `key`, data: e })),
		E = e.onResize(({ rows: e, cols: t }) =>
			b.postMessage({ kind: `resize`, rows: e, cols: t }),
		);
	e.focus?.();
	try {
		return await new Promise((t, n) => {
			(b.addEventListener(`message`, (r) => {
				let a = r.data;
				a.kind === `write`
					? e.write(a.data)
					: a.kind === `net`
						? i?.(a.event)
						: a.kind === `done`
							? t({ status: a.status, host: null, tenv: null })
							: a.kind === `failed` &&
								n(Object.assign(Error(a.message), { workerStack: a.stack }));
			}),
				b.postMessage({
					kind: `run`,
					globals: ei(),
					runtime: Z ? { shimBytes: Z, seedBytes: kr } : void 0,
					rows: e.rows,
					cols: e.cols,
					opts: {
						...g,
						networkUrl: r?.url ?? null,
						pageHosts: r?.pageHosts,
						wl: _ ? { inRealm: !0 } : void 0,
						gl: v ? `compositor` : void 0,
						hostX: y ? f : void 0,
					},
				}));
		});
	} finally {
		(T.dispose(), E.dispose(), w?.stop(), b.terminate());
	}
}
async function ni(e, t) {
	if (o.on) return hi(e, t);
	if ($r()) return ti(e, t);
	let { runPreset: r } = await n(
		async () => {
			let { runPreset: e } = await import(`./run-program-B3gP9PMv.mjs`);
			return { runPreset: e };
		},
		[],
		import.meta.url,
	);
	return r(e, t);
}
function ri(e) {
	c({
		...e,
		clock: $(`audioclock`) !== `0`,
		latency: qr(),
		loop: $(`audioloop`) === `1`,
	});
}
async function ii({
	kernel: e,
	wlChannel: t,
	compositor: r,
	term: i,
	rootful: a = !1,
	listen: s,
}) {
	let c,
		l = o.on ? `/gex/xwayland-st/` : `/gex/xwayland/`,
		p = u(l),
		m = (e) =>
			new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ f(l)?.[e] ?? `${p}${e}`,
				location.href,
			).href;
	if (o.on) {
		let { HostX: e } = await n(
				async () => {
					let { HostX: e } = await import(`./hostx-iX71WgRN.mjs`);
					return { HostX: e };
				},
				[],
				import.meta.url,
			),
			t = null,
			r = new e((e) => t?.({ data: e }));
		c = {
			set onmessage(e) {
				t = e;
			},
			postMessage: (e) =>
				r.start(e).catch((e) => {
					(r.log(`[hostx] ${e?.stack || e}`),
						t?.({ data: { kind: `failed`, why: String(e?.message || e) } }));
				}),
			terminate() {},
		};
	} else
		c = new Worker(new URL("./xwayland-worker-COiIvpxm.mjs", import.meta.url), {
			type: "module",
			name: "xwayland",
		});
	let h = null,
		_ = new Promise((e) => (h = e)),
		v = !!$(`hostxcount`);
	return (
		(c.onmessage = (e) => {
			let t = e.data;
			t.kind === `log`
				? (i.writeln(t.text),
					v && console.log(`${(performance.now() / 1e3).toFixed(2)} ${t.text}`))
				: t.kind === `win`
					? console.log(`[win] ${t.text}`)
					: t.kind === `wl-memory`
						? r()?.addMemory(t.token, t.memory, t.kernel)
						: t.kind === `wl-pixels`
							? r()?.addPixels?.(t.token, t.id, t.buffer, t.replaces)
							: t.kind === `ready`
								? h(!0)
								: t.kind === `failed` &&
									(i.writeln(`gex: the X server failed: ${t.why}`), h(!1));
		}),
		c.postMessage({
			kind: `start`,
			xwaylandUrl: m(`Xwayland.mjs`),
			hostwlUrl: m(`gexhostwl.wasm`),
			keymapUrl: m(`gex.xkm`),
			xwaylandFiles: { "Xwayland.wasm": m(`Xwayland.wasm`) },
			kernel: { module: e.module, memory: e.memory, spare: e.spare },
			wlChannel: t,
			token: 2021092401,
			display: `:0`,
			listen: s,
			rootful: a || void 0,
			verbose:
				globalThis.GEX_HOSTX_VERBOSE || Number(d().get(`xverbose`)) || void 0,
			trace: globalThis.GEX_HOSTX_TRACE || void 0,
			wlTrace: $(`wltrace`) ? 1 : void 0,
			count: $(`hostxcount`) ? 1 : void 0,
			win: g(`win`) ? 1 : void 0,
		}),
		(await Promise.race([
			_,
			new Promise((e) => setTimeout(() => e(`timeout`), 6e4)),
		])) === `timeout` && i.writeln(`gex: the X server did not come up in 60s`),
		c
	);
}
function ai({ uid: e = 0, gid: t = e } = {}) {
	return {
		..._(`opts`),
		recompileObjects: oi(),
		heartbeat: si(),
		link: ci(),
		uid: e,
		gid: t,
	};
}
var oi = () =>
		typeof globalThis.GEX_RECOMPILE_OBJECTS == `number`
			? globalThis.GEX_RECOMPILE_OBJECTS
			: 0,
	si = () => globalThis.GEX_HEARTBEAT ?? 0,
	ci = () => Number(globalThis.GEX_LINK ?? 0);
function li(e, t, { dom: n, backend: r = `wgpu`, source: i = null }, a) {
	let o = n
			? { api: `core`, backend: r, source: i }
			: {
					api: `core`,
					backend: r,
					canvasBlit: d().get(`glcanvas`) === `1`,
					source: i,
				},
		s = null;
	return () => (s ??= Xr(e, t, o, a));
}
async function ui(
	{
		kernel: e,
		closure: t = null,
		lateUnits: n = null,
		heartbeat: r = si(),
		fill: i = null,
		lazyCache: a = null,
		pageFs: s = null,
		restBundle: c = !1,
		identities: l = null,
		providerSources: d = null,
		stateful: p = null,
		recompileObjects: m = oi(),
		closureBuildNumbered: h = !1,
		link: g = ci(),
		uid: v,
		preModules: y = null,
		glChannel: b = null,
		wlChannel: x = null,
		netChannel: S = null,
		network: C = null,
		winsize: w,
	},
	T,
) {
	let { shimBytes: E, seedBytes: D } = await Hr(),
		ee = new nr({
			makeWorker: await Qr(),
			unitModule:
				globalThis.GEX_CGEN &&
				globalThis.GEX_CGEN_ZST &&
				globalThis.GEX_CGEN_ZSTD
					? Mr(n, jr(gr(globalThis.GEX_CGEN_ZSTD)))
					: null,
			shim: E,
			guest: t?.image ?? D,
			kernel: e,
			other: Tr()
				? async () => ({
						shim: await Br(u(`/gex/gex_browser${br()}.shared.wasm`)),
						guest: await Br(u(`/gex/seed${br()}.shared.wasm`)),
						kernel: e.module,
					})
				: e && X() === `x86`
					? async () => ({
							shim: await Br(u(`/gex/gex_browser${br()}.m64.shared.wasm`)),
							guest: await Br(u(`/gex/seed${br()}.m64.shared.wasm`)),
							kernel: e.module,
						})
					: null,
			extra: {
				..._(`extra`),
				heartbeat: r || void 0,
				fill: i || void 0,
				lazyCache: a || void 0,
				pageFs: s || void 0,
				restBundle: c || void 0,
				identities: l || void 0,
				closure: t?.libs,
				trace: $(`trace`) ? 1 : void 0,
				hot: $(`hot`) ? 1 : void 0,
				wholePage: $(`wholepage`) ? 1 : void 0,
				vforkTrace: $(`vforktrace`) ? 1 : void 0,
				trapPc: $(`trappc`) ? Number.parseInt($(`trappc`), 16) : void 0,
				shared: !0,
				glChannel: b ?? void 0,
				wlChannel: x ?? void 0,
				netChannel: S ?? void 0,
				wispNet: o.on ? (C ?? void 0) : void 0,
				wispUrl: S || o.on ? void 0 : (C?.url ?? void 0),
				pageHosts: S || o.on ? void 0 : C?.pageHosts,
				winsize: w,
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
					globalThis.GEX_CGEN && !Wr()
						? _r({
								mode: globalThis.GEX_CGEN,
								url: gr(globalThis.GEX_CGEN_URL ?? `/gex-cgen`),
								zstd: globalThis.GEX_CGEN_ZSTD && gr(globalThis.GEX_CGEN_ZSTD),
								zst: globalThis.GEX_CGEN_ZST ? !0 : void 0,
							})
						: $(`providers`) === `0`
							? void 0
							: { mode: 8, url: u(`/gex/cgen`), files: f(`/gex/cgen/`) },
				jit: !globalThis.GEX_NO_JIT && void 0,
				aot: globalThis.GEX_AOT ? !0 : void 0,
				mem64: globalThis.GEX_MEM64 ? 1 : void 0,
				fjit: globalThis.GEX_FJIT || void 0,
				xcache: Rr(),
				unitCache: globalThis.GEX_UNIT_CACHE || void 0,
				elfUnits: globalThis.GEX_ELF_UNITS || void 0,
				providerSources: d || globalThis.GEX_PROVIDER_SOURCES || void 0,
				stateful: p || globalThis.GEX_STATEFUL || void 0,
				dlChecked: $(`dlchecked`) ? 1 : void 0,
				jitDiag: $(`jitdiag`) ? 1 : void 0,
				shareTrace: $(`sharetrace`) ? 1 : void 0,
				log: (globalThis.GEX_LOG ??= $(`log`) || void 0) || void 0,
				preModules: y ?? void 0,
				adoptTrace:
					!!globalThis.GEX_ADOPT_TRACE ||
					(typeof process < `u` && !!{}.GEX_ADOPT_TRACE),
				attachTrace:
					!!globalThis.GEX_ATTACH_TRACE ||
					(typeof process < `u` && !!{}.GEX_ATTACH_TRACE),
				recompileObjects: m,
				noIntrinsics: $(`nointrinsics`) ? 1 : void 0,
				pregrow: $(`pregrow`) ? 1 : void 0,
				checkSp: $(`checksp`) ? 1 : void 0,
				fillTime: $(`filltime`) ? 1 : void 0,
				claimPages:
					$(`claimpages`) == null
						? h
							? 0
							: void 0
						: $(`claimpages`) === `0`
							? 0
							: 1,
				intrinsicMask:
					$(`intrinsicmask`) == null
						? void 0
						: parseInt($(`intrinsicmask`), 10) >>> 0,
				copyLoop: $(`copyloop`) ? 1 : void 0,
				coherentLoads: Wr() ? 1 : void 0,
				wlTrace: $(`wltrace`) ? 1 : void 0,
				link: g || void 0,
				uid: v,
				gid: v,
			},
			...T,
		});
	return (Ir(`shim`, E), ee);
}
async function di(e) {
	if (!e || !globalThis.crossOriginIsolated) return null;
	let { makeNetChannel: t, serveNet: r } = await n(
			async () => {
				let { makeNetChannel: e, serveNet: t } = await import(
					`./net-bridge-CqGk-CBe.mjs`
				);
				return { makeNetChannel: e, serveNet: t };
			},
			[],
			import.meta.url,
		),
		i = t();
	return (i && r(e, i), i);
}
async function fi(e = !1) {
	if (!globalThis.crossOriginIsolated)
		throw Error(
			`the guest GL needs a cross-origin isolated page (SharedArrayBuffer bridge).`,
		);
	let { makeGlChannel: t } = await n(
			async () => {
				let { makeGlChannel: e } = await import(`./gl-bridge-JJI48dWv.mjs`);
				return { makeGlChannel: e };
			},
			[],
			import.meta.url,
		),
		r = t();
	return ((r.d3d = !!e), r);
}
function pi(e, t) {
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
async function mi({
	wl: e,
	wlInput: t = null,
	wlScale: r = 1,
	onDesktop: i = null,
	say: a = () => {},
}) {
	if (!globalThis.crossOriginIsolated)
		throw Error(
			`the Wayland compositor needs a cross-origin isolated page (SharedArrayBuffer bridge).`,
		);
	let { makeWlChannel: o, setOutputSize: s } = await n(
			async () => {
				let { makeWlChannel: e, setOutputSize: t } = await import(
					`./wl-bridge-6Hq-j3j2.mjs`
				).then((e) => e.I);
				return { makeWlChannel: e, setOutputSize: t };
			},
			[],
			import.meta.url,
		),
		c = o(),
		l = typeof e.getContext != `function` && e.nodeType === 1 ? e : null;
	if (l) {
		let { DomDesktop: e } = await n(
				async () => {
					let { DomDesktop: e } = await import(`./dom-compositor-Bt2Wn5FU.mjs`);
					return { DomDesktop: e };
				},
				[],
				import.meta.url,
			),
			t = e.create(l, c, { width: l.clientWidth, height: l.clientHeight });
		return (
			(globalThis.__gexDesktop = t),
			i?.(t),
			(t.onglfailed = (e) => {
				(a(`gex: the guest's OpenGL is gone: ${e}`),
					a(`gex: GL windows will be blank; everything else still runs`));
			}),
			{ wlChannel: c, compositor: t, dom: !0 }
		);
	}
	if (typeof e.getContext != `function`)
		return { wlChannel: c, compositor: null, dom: !1 };
	s(c, e.width, e.height, Math.max(1, Math.round(r)));
	let { Compositor: u } = await n(
			async () => {
				let { Compositor: e } = await import(`./compositor-BcFltmqO.mjs`);
				return { Compositor: e };
			},
			[],
			import.meta.url,
		),
		d = await u.create(e, c, t || e, { scale: r });
	return (
		(globalThis.__gexCompositor = d),
		{ wlChannel: c, compositor: d, dom: !1 }
	);
}
async function hi(
	e,
	{
		elf: t,
		files: r = {},
		dirs: i = [],
		modes: a = {},
		hard: s = {},
		symlinks: l = {},
		lazy: u = [],
		mtimes: d = void 0,
		xattrs: f = void 0,
		env: p = [],
		args: h,
		cwd: g = `/`,
		tty: v = !0,
		network: y = null,
		onNetEvent: b = null,
		onFilesLoaded: x = null,
		transfer: S = [],
		onDesktop: C = null,
		gl: w = null,
		glBackend: T = `wgpu`,
		d3d: E = !1,
		wl: D = null,
		wlInput: ee = null,
		wlScale: O = 1,
		hostX: k = !1,
		uid: te,
		heartbeat: ne = si(),
		fill: re = null,
		lazyCache: ie = null,
		pageFs: ae = null,
		playAudio: oe = !0,
		restBundle: se = !1,
		identities: ce = null,
		stateful: le = null,
		providerSources: ue = null,
		recompileObjects: de = oi(),
		closure: fe = null,
		closureBuildNumbered: pe = !1,
		link: me = ci(),
		preModules: he = null,
		lateUnits: ge = null,
		onSystem: _e = null,
		glLazy: ve = !1,
		glSource: ye = null,
	},
) {
	((globalThis.__gexTso = await Kr()),
		Wr() &&
			fe &&
			(console.warn(
				`[gex] tso: the closure is translated with plain accesses; translating instead`,
			),
			(fe = null)));
	let { shimBytes: be, seedBytes: xe } = await Hr(),
		A = await Zr();
	await Qr();
	let j = v ? await or.open(A) : null,
		Se = new Jr(e, j);
	((globalThis.gexTty = j),
		j?.resize(e.rows, e.cols),
		m(`debug`) && console.warn(`[gex] runtime rings: gl=${!!w} wl=${!!D}`));
	let M = null,
		Ce = null,
		we = null;
	if (w && o.on) M = { inRealm: !0, d3d: !!E };
	else if (w) {
		M = await fi(E);
		let { serveGl: e } = await n(
			async () => {
				let { serveGl: e } = await import(`./gl-bridge-JJI48dWv.mjs`);
				return { serveGl: e };
			},
			[],
			import.meta.url,
		);
		w !== `compositor` && (Ce = w.attachChannel?.(M) || e(w, M));
	}
	let Te = await di(y),
		N = null,
		P = null;
	if (D?.inRealm) ({ channel: N, compositor: P } = D.inRealm);
	else if (D) {
		let t;
		(({
			wlChannel: N,
			compositor: P,
			dom: t,
		} = await mi({
			wl: D,
			wlInput: ee,
			wlScale: O,
			onDesktop: C,
			say: (t) => e.writeln(t),
		})),
			w === `compositor` &&
				M &&
				P &&
				((we = li(P, M, { dom: t, backend: T, source: ye }, e)),
				ve ? pi(M, we) : await we()));
	}
	let F = null;
	if (k && N) {
		if (!A) throw Error(`the host X server needs the global kernel`);
		F = await ii({
			kernel: A,
			wlChannel: N,
			compositor: () => P,
			term: e,
			rootful: k === `rootful`,
		});
	}
	let I = await ui(
			{
				kernel: A,
				closure: fe,
				lateUnits: ge,
				heartbeat: ne,
				fill: re,
				lazyCache: ie,
				pageFs: ae,
				restBundle: se,
				identities: ce,
				providerSources: ue,
				stateful: le,
				recompileObjects: de,
				closureBuildNumbered: pe,
				link: me,
				uid: te,
				preModules: he,
				glChannel: M,
				wlChannel: N,
				netChannel: Te,
				network: y,
				winsize: j ? void 0 : { rows: e.rows, cols: e.cols },
			},
			{
				onOutput: (t, n, r, i) => {
					(i?.lflag !== void 0 && (Se.lflag = i.lflag), e.write(n));
				},
				onExit: (e, t) => {
					typeof t == `number` && P?.dropMemory?.(t);
				},
				readStdin: (e) => (e !== void 0 && (Se.lflag = e), Se.readStdin()),
				onMessage: (e) => {
					e.kind === `gl`
						? Ce?.()
						: e.kind === `wl-memory`
							? P?.addMemory(e.token, e.memory, e.kernel)
							: e.kind === `wl-pixels`
								? P?.addPixels?.(e.token, e.id, e.buffer, e.replaces)
								: e.kind === `wl` ||
									(e.kind === `net`
										? b?.(e.event)
										: e.kind === `files-loaded`
											? x?.()
											: e.kind === `audio` &&
												oe &&
												c({
													...e,
													clock: $(`audioclock`) !== `0`,
													latency: qr(),
													loop: $(`audioloop`) === `1`,
												}));
				},
			},
		),
		L = e.onData((e) => Se.onKey(e));
	e.focus?.();
	let Ee = e.onResize(({ rows: e, cols: t }) => {
			j ? Promise.resolve(j.resize(e, t)).catch(() => {}) : I.resize(e, t);
		}),
		De =
			N && A && !F
				? (t) =>
						(Oe ??= ii({
							kernel: A,
							wlChannel: N,
							compositor: () => P,
							term: e,
							listen: t,
						}).then((e) => ((F = e), e)))
				: null,
		Oe = null,
		ke = null,
		Ae = t
			? null
			: new Promise((e) => {
					ke = e;
				});
	_e?.({
		host: I,
		kernel: A,
		tty: j,
		compositor: P,
		startGl: we,
		wlChannel: N,
		startX: De,
		spawnExec: t
			? null
			: ({ uid: e = te, gid: t = e, ...n }) =>
					I.spawnExec({
						...n,
						opts: {
							..._(`opts`),
							recompileObjects: de,
							heartbeat: ne,
							link: me,
							uid: e,
							gid: t,
						},
					}),
		halt: (e = 0) => ke?.(e),
	});
	try {
		return {
			status: Ae
				? await Ae
				: await I.start({
						elf: t,
						files: r,
						transfer: S,
						dirs: i,
						modes: a,
						env: p,
						args: h,
						opts: {
							cwd: g,
							tty: v,
							uid: te,
							recompileObjects: de,
							heartbeat: ne,
							link: me,
							dirs: i,
							modes: a,
							hard: s,
							symlinks: l,
							lazy: u,
							mtimes: d,
							xattrs: f,
							env: p,
							pins: gi(fe?.pins, globalThis.GEX_PINS),
							..._(`opts`),
							program: fe?.program ?? h?.[0],
						},
					}),
			host: I,
			tenv: Se,
		};
	} finally {
		(L.dispose(),
			Ee.dispose(),
			I.stop(),
			P?.stop(),
			F?.terminate(),
			Ce?.stop?.());
	}
}
function gi(e, t) {
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
export {
	Jr as TerminalEnv,
	ge as a,
	xr as archAsset,
	ri as audioFrom,
	Kr as detectTso,
	wr as elfMachine,
	ai as execOptions,
	Nr as fetchBytes,
	pi as glOnFirstRequest,
	li as glStarter,
	Zr as globalKernel,
	Zr as loadKernel,
	X as guestArch,
	Lr as heldBytes,
	be as i,
	Hr as loadRuntime,
	ui as makeProcessHost,
	Cr as multiarch,
	ve as n,
	fi as openGlChannel,
	di as openNet,
	mi as openWayland,
	Vr as primeRuntime,
	ye as r,
	ni as runProgram,
	Ur as runtimeUrls,
	$r as singleMode,
	Xr as startHostGl,
	ii as startXServer,
	mr as t,
	hr as workerGraphBytes,
	j as xcRead,
	Rr as xcacheName,
};
