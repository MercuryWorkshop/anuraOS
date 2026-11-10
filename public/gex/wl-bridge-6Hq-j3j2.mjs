import { f as e } from "./internal-DhuCGrNL.mjs";
import { n as t, r as n } from "./single-CjFw-sb8.mjs";
var r = e({
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
		F_POINTER_LOCK: () => h,
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
		WlProxy: () => Ve,
		ackBlock: () => Ne,
		clipboardSerial: () => me,
		dragState: () => Ie,
		getClipboard: () => pe,
		makeWlChannel: () => ye,
		mergeDamage: () => He,
		notifyQueue: () => $,
		outputSize: () => Se,
		readScene: () => Te,
		recordAddr: () => l,
		releaseToken: () => De,
		sceneMark: () => je,
		sceneMarks: () => Oe,
		sceneStill: () => Me,
		sendEvent: () => Re,
		setClipboard: () => he,
		setDragData: () => Fe,
		setKernelMemory: () => Pe,
		setOutputSize: () => be,
		startWakeRelay: () => ze,
		takesPointer: () => Ee,
		waitDrag: () => Le,
		waitPublish: () => xe,
	}),
	i = 32,
	a = 64,
	o = 38,
	s = 8,
	c = 64,
	l = (e, t) => (e[t + 8] >>> 0) + (e[t + 37] >>> 0) * 4294967296,
	u = 1,
	d = 2,
	f = 3,
	p = 4,
	m = 1,
	h = 1 << 31,
	g = 0,
	_ = 1,
	v = 2,
	y = 3,
	b = 4,
	x = 5,
	S = 6,
	ee = 7,
	te = 8,
	ne = 9,
	re = 10,
	ie = 15,
	ae = 16,
	C = 0,
	w = 1,
	T = 2,
	E = 3,
	oe = 4,
	D = 5,
	O = 6,
	se = 7,
	ce = 8,
	k = 0,
	A = 1,
	j = 2,
	M = 3,
	N = 4,
	P = 5,
	F = 6,
	I = 7,
	L = 8,
	le = 2440,
	R = 0,
	z = 1,
	B = 2,
	ue = 514,
	V = 65536,
	H = 1 << 20,
	de = 373069,
	fe = 94536;
function U(e) {
	for (; Atomics.compareExchange(e, 110921, 0, 1) !== 0; )
		typeof Atomics.wait == `function` &&
			!globalThis.document &&
			Atomics.wait(e, 110921, 1, 1);
}
function W(e) {
	(Atomics.store(e, 110921, 0), Atomics.notify(e, 110921));
}
function G(e, t, n) {
	let r = Math.min(t.length, H);
	(U(e),
		new Uint8Array(e.buffer, 443700, r).set(t.subarray(0, r)),
		Atomics.store(e, 110924, r),
		Atomics.store(e, 110923, n));
	let i = (Atomics.add(e, 110922, 1) + 1) >>> 0;
	return (W(e), i);
}
function pe(e) {
	let t = new Int32Array(e.arena);
	U(t);
	let n = Atomics.load(t, 110922) >>> 0,
		r = Atomics.load(t, 110923) ? `guest` : `page`,
		i = Math.min(Atomics.load(t, 110924) >>> 0, H),
		a = new Uint8Array(i);
	return (
		a.set(new Uint8Array(t.buffer, 443700, i)),
		W(t),
		{ serial: n, from: r, text: new TextDecoder().decode(a) }
	);
}
function me(e) {
	return Atomics.load(new Int32Array(e.arena), 110922) >>> 0;
}
function he(e, t) {
	let n = new Int32Array(e.arena),
		r = G(n, new TextEncoder().encode(String(t)), 0);
	for (let t = 0; t < i; t++) Atomics.load(n, K(t) + k) && Q(e, n, t);
	return r;
}
var K = (e) => ce + e * le,
	q = (e) => 78088 + e * ue,
	ge = 0,
	J = 1,
	Y = 4,
	X = 5,
	Z = 2048,
	_e = 64 << 20,
	ve = 1 << 20;
function ye() {
	return typeof SharedArrayBuffer == `function`
		? { arena: new SharedArrayBuffer(de * 4), pixels: !0 }
		: { arena: new ArrayBuffer(de * 4) };
}
function be(e, t, n, r) {
	let a = new Int32Array(e.arena),
		o = [Atomics.load(a, C), Atomics.load(a, w)];
	if (
		(Atomics.store(a, C, t | 0),
		Atomics.store(a, w, n | 0),
		r && Atomics.store(a, E, Math.max(1, r | 0)),
		!(!o[0] || (o[0] === (t | 0) && o[1] === (n | 0))))
	)
		for (let t = 0; t < i; t++) Atomics.load(a, K(t) + k) && Q(e, a, t);
}
async function xe(e, t) {
	if (
		typeof Atomics.waitAsync != `function` ||
		!(e.arena instanceof SharedArrayBuffer)
	)
		return null;
	let n = new Int32Array(e.arena),
		r = t ?? Atomics.load(n, T),
		i = Atomics.waitAsync(n, T, r);
	return (i.async && (await i.value), Atomics.load(n, T));
}
function Se(e) {
	let t = new Int32Array(e.arena);
	return {
		w: Atomics.load(t, C) || 640,
		h: Atomics.load(t, w) || 480,
		scale: Atomics.load(t, E) || 1,
	};
}
var Ce = new TextDecoder(),
	we = new Uint8Array(32);
function Te(e, { onlyChanged: t = !1 } = {}) {
	let n = new Int32Array(e.arena),
		r = !!e.pixels,
		a = [],
		o = [],
		s = Date.now();
	for (let e = 0; e < i; e++) {
		let i = K(e),
			c = Atomics.load(n, i + k);
		if (!c) continue;
		let u = Atomics.load(n, i + M),
			d = Atomics.load(n, i + N),
			f = Atomics.load(n, i + A);
		if (
			(o.push({
				block: e,
				token: c,
				gen: u,
				ack: d,
				beat: f,
				stale: s - f > 5e3,
			}),
			t && u === d)
		)
			continue;
		let p = Math.min(Atomics.load(n, i + j), 64);
		for (let t = 0; t < p; t++) {
			let o = i + L + t * 38,
				s = we;
			for (let e = 0; e < 8; e++) {
				let t = n[o + 18 + e];
				((s[e * 4] = t & 255),
					(s[e * 4 + 1] = (t >>> 8) & 255),
					(s[e * 4 + 2] = (t >>> 16) & 255),
					(s[e * 4 + 3] = (t >>> 24) & 255));
			}
			let u = s.indexOf(0);
			(u < 0 && (u = s.length),
				a.push({
					token: c,
					block: e,
					client: n[o + 0],
					surface: n[o + 1],
					role: n[o + 2],
					parent: n[o + 3],
					relX: n[o + 4],
					relY: n[o + 5],
					width: n[o + 6],
					height: n[o + 7],
					addr: r ? n[o + 8] >>> 0 : l(n, o),
					pix: r ? n[o + 37] >>> 0 : 0,
					stride: n[o + 9],
					format: n[o + 10],
					serial: n[o + 11] >>> 0,
					damage: { x: n[o + 12], y: n[o + 13], w: n[o + 14], h: n[o + 15] },
					flags: n[o + 16],
					xid: n[o + 17] >>> 0,
					external: !!(n[o + 16] & 2),
					glRect:
						n[o + 16] & 2 && n[o + 27]
							? {
									x: (n[o + 26] << 16) >> 16,
									y: n[o + 26] >> 16,
									w: n[o + 27] & 65535,
									h: n[o + 27] >>> 16,
								}
							: null,
					title: u ? Ce.decode(s.subarray(0, u)) : ``,
					placed: !!(n[o + 28] & 1),
					unmanaged: !!(n[o + 28] & 2),
					layer: (n[o + 28] >> 8) & 255,
					stackId: n[o + 29] >>> 0,
					below: n[o + 30] >>> 0,
					restack: n[o + 31] >>> 0,
					activate: n[o + 32] >>> 0,
					input:
						n[o + 16] & 128
							? { x: n[o + 33], y: n[o + 34], w: n[o + 35], h: n[o + 36] }
							: null,
				}));
		}
	}
	return { surfaces: a, blocks: o };
}
function Ee(e) {
	let t = e.input;
	return !t || (t.w > 0 && t.h > 0);
}
function De(e, t) {
	let n = new Int32Array(e.arena),
		r = 0;
	for (let e = 0; e < i; e++) {
		let i = K(e);
		!t ||
			Atomics.load(n, i + k) !== t ||
			(Atomics.store(n, i + j, 0),
			Atomics.compareExchange(n, i + k, t, 0) === t && r++);
	}
	return r;
}
function Oe() {
	return new Int32Array(64);
}
var ke = new WeakMap();
function Ae(e) {
	let t = ke.get(e.arena);
	return (t || ke.set(e.arena, (t = new Int32Array(e.arena))), t);
}
function je(e, t) {
	e.fill(0);
	for (let n of t) ((e[2 * n.block] = n.token), (e[2 * n.block + 1] = n.gen));
}
function Me(e, t) {
	let n = Ae(e);
	for (let e = 0; e < i; e++) {
		let r = K(e),
			i = Atomics.load(n, r + k);
		if (i !== t[2 * e]) return !1;
		if (!i) continue;
		let a = Atomics.load(n, r + M);
		if (a !== t[2 * e + 1] || a !== Atomics.load(n, r + N)) return !1;
	}
	return !0;
}
function Ne(e, t, n) {
	let r = new Int32Array(e.arena);
	Atomics.store(r, K(t) + N, n);
}
function Pe(e, t) {
	t && !e.kernelMemory && (e.kernelMemory = t);
}
function Fe(e, t) {
	let n = new TextEncoder().encode(t);
	if (n.length > V) return !1;
	let r = new Int32Array(e.arena);
	return (
		new Uint8Array(e.arena, 378148, V).set(n),
		Atomics.store(r, fe, n.length),
		!0
	);
}
function Ie(e, t) {
	let n = Atomics.load(new Int32Array(e.arena), K(t) + I) >>> 0;
	return { serial: n >>> 4, flags: n & 15 };
}
async function Le(e, t, n, r, i) {
	let a = new Int32Array(e.arena),
		o = K(t) + I,
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
function Re(e, t, n, r = 0, i = 0, a = 0, o = 0, s = 0, l = 0) {
	let u = new Int32Array(e.arena),
		d = q(t),
		f = Atomics.load(u, d + R),
		p = d + B + (f % c) * 8;
	((u[p] = n | 0),
		(u[p + 1] = r | 0),
		(u[p + 2] = i | 0),
		(u[p + 3] = a | 0),
		(u[p + 4] = o | 0),
		(u[p + 5] = s | 0),
		(u[p + 6] = l | 0),
		(u[p + 7] = 0),
		Atomics.store(u, d + R, f + 1),
		globalThis.__gexEvLog?.push([n, r, i, performance.now()]),
		console.timeStamp(`gex:ev ${n} b${t}`),
		Q(e, u, t));
}
function Q(e, r, i) {
	let a = Atomics.load(r, K(i) + P),
		o = Atomics.load(r, K(i) + F),
		s = e.kernelMemory;
	a && o && s
		? ($(new Int32Array(s.buffer), a >>> 0, o >>> 0), n.on && t.checkSlots())
		: a &&
			o &&
			e.arena instanceof SharedArrayBuffer &&
			(Atomics.or(r, O, 1 << i), Atomics.add(r, D, 1), Atomics.notify(r, D));
}
function ze(e, t) {
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
			let e = Atomics.load(n, D),
				r = Atomics.exchange(n, O, 0) >>> 0;
			if (r) {
				let e = new Int32Array(t.buffer);
				for (; r; ) {
					let t = 31 - Math.clz32(r & -r);
					r &= r - 1;
					let i = Atomics.load(n, K(t) + P),
						a = Atomics.load(n, K(t) + F);
					i && a && $(e, i >>> 0, a >>> 0);
				}
			}
			let i = Atomics.waitAsync(n, D, e);
			i.async && (await i.value);
		}
	})();
}
var Be = 64;
function $(e, t, n) {
	for (let r = 0; r < Be; r++) {
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
var Ve = class {
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
		let t = Math.ceil(e / ve) * ve;
		if (t > _e) return !1;
		let n = this.#p;
		this.#f = new SharedArrayBuffer(t);
		let r = (Atomics.add(this.#e, se, 1) + 1) >>> 0;
		return (
			(r ||= (Atomics.add(this.#e, se, 1) + 1) >>> 0),
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
		return Atomics.compareExchange(this.#e, oe, 0, 1) === 0;
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
					let i = Y + r * X;
					e[i + 2] && e[i] === n[t + 0] && e[i + 1] === n[t + 1] && (s = i);
				}
				(s < 0 || e[s + 3] < o) && (r += o);
			}
			let a = e ? Math.max(e[J], Z) : Z;
			if (!e || (a + r > this.#f.byteLength && Z + i > this.#f.byteLength)) {
				let e = Z + i,
					r = Math.max(e + (e >> 2), this.#f ? this.#f.byteLength * 2 : 0);
				if (!this.#h(Math.min(r, _e)) && !this.#f) {
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
					let r = Y + n * X;
					if (i[r + 2] && i[r] === e && i[r + 1] === t) return r;
				}
				return -1;
			};
		for (; Atomics.compareExchange(i, ge, 0, 1) !== 0; );
		try {
			i[J] < Z && (i[J] = Z);
			let o = 0;
			for (let e = 0; e < t; e++) {
				let t = this.#s[e],
					r = a(n[t + 0], n[t + 1]),
					s = n[t + 6] * n[t + 7] * 4;
				(r < 0 || i[r + 3] < s) && (o += (s + 255) & -256);
			}
			if (i[J] + o > r.byteLength) {
				for (let e = 0; e < 320; e++) i[Y + e] = 0;
				i[J] = Z;
			}
			let s = this.#S(e);
			for (let o = 0; o < t; o++) {
				let t = this.#s[o],
					c = this.#c[o] === this.#p,
					u = this.#l[o * 4],
					d = this.#l[o * 4 + 1],
					f = this.#l[o * 4 + 2],
					p = this.#l[o * 4 + 3],
					m = n[t + 6],
					h = n[t + 7],
					g = m * h * 4,
					_ = l(n, t),
					v = n[t + 9],
					y = a(n[t + 0], n[t + 1]),
					b = !c;
				if (y < 0 || i[y + 3] < g) {
					if (y < 0) {
						for (let e = 0; e < 64 && y < 0; e++)
							i[Y + e * X + 2] || (y = Y + e * X);
						y < 0 && (y = Y);
					}
					let e = i[J];
					if (e + g > r.byteLength) {
						(this.#m ||
							console.warn(
								`[wl] a ${m}x${h} surface does not fit its block's ${r.byteLength >> 20} MiB of pixels`,
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
						(i[J] = e + ((g + 255) & -256)),
						(b = !0));
				}
				let x = i[y + 2],
					S = n[t + 11];
				if (b || i[y + 4] !== S) {
					let t = 0,
						n = 0,
						r = m,
						a = h;
					!b &&
						f > 0 &&
						p > 0 &&
						((t = Math.max(0, Math.min(u, m))),
						(n = Math.max(0, Math.min(d, h))),
						(r = Math.max(0, Math.min(f, m - t))),
						(a = Math.max(0, Math.min(p, h - n))));
					let o = this.#v;
					if (_ + (n + a - 1) * v + (t + r) * 4 <= s.length || a === 0) {
						if (r === m && v === m * 4) {
							let e = _ + n * v;
							o.set(s.subarray(e, e + a * v), x + n * m * 4);
						} else {
							let i = !((_ | v) & 3),
								c = i ? this.#O(e) : null,
								l = this.#y;
							for (let e = 0; e < a; e++) {
								let a = _ + (n + e) * v + t * 4,
									u = x + (n + e) * m * 4 + t * 4;
								if (r >= 64 || !i) o.set(s.subarray(a, a + r * 4), u);
								else
									for (let e = 0, t = a >> 2, n = u >> 2; e < r; e++)
										l[n + e] = c[t + e];
							}
						}
					}
					i[y + 4] = S;
				}
				((n[t + 8] = x), (n[t + 37] = this.#p), (n[t + 9] = m * 4));
			}
		} finally {
			Atomics.store(i, ge, 0);
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
		for (let e = 0; e < i; e++) {
			let t = K(e);
			if (Atomics.load(this.#e, t + k) === this.#i) {
				((this.#t = e), (this.#n = t), (this.#r = q(e)), this.#D());
				return;
			}
		}
		for (let t = 0; t < 2; t++)
			for (let n = 0; n < i; n++) {
				let r = K(n),
					i = Atomics.load(this.#e, r + k),
					a = t === 1 && i && e - Atomics.load(this.#e, r + A) > 5e3;
				if (
					!(i && !a) &&
					Atomics.compareExchange(this.#e, r + k, i, this.#i) === i
				) {
					((this.#t = n),
						(this.#n = r),
						(this.#r = q(n)),
						Atomics.store(this.#e, r + j, 0),
						Atomics.store(this.#e, r + M, 0),
						Atomics.store(this.#e, r + N, 0),
						Atomics.store(this.#e, r + I, 0),
						Atomics.store(this.#e, r + A, e),
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
			(Atomics.store(this.#e, this.#n + F, e.slots | 0),
			Atomics.store(this.#e, this.#n + P, e.addr | 0));
	}
	get token() {
		return this.#i;
	}
	get ok() {
		return this.#t >= 0;
	}
	get generation() {
		return Atomics.load(this.#e, this.#n + M);
	}
	get drawnGeneration() {
		return Atomics.load(this.#e, this.#n + N);
	}
	publish(e, t, n, r = e) {
		if (
			(this.#t >= 0 &&
				Atomics.load(this.#e, this.#n + k) !== this.#i &&
				((this.#t = -1), (this.#o = 0)),
			!this.#w())
		)
			return;
		let i = this.#e,
			a = Math.min(n, 64),
			o = this.#O(e),
			s = Atomics.load(i, this.#n + M);
		Atomics.load(i, this.#n + N) === s && (this.#o = 0);
		let c = this.#a,
			u = 0;
		for (let e = 0; e < a; e++) {
			let n = (t >>> 2) + e * 38,
				r = this.#n + L + e * 38,
				a = o[n + 0],
				s = o[n + 1],
				d = i[r + 0] === a && i[r + 1] === s && this.#d ? i[r + 37] >>> 0 : 0;
			for (let e = 0; e < 38; e++) i[r + e] = o[n + e];
			let f = o[n + 12],
				p = o[n + 13],
				m = o[n + 14],
				h = o[n + 15];
			this.#d &&
				l(i, r) &&
				o[n + 6] > 0 &&
				o[n + 7] > 0 &&
				((this.#s[u] = r),
				(this.#c[u] = d),
				(this.#l[u * 4] = f),
				(this.#l[u * 4 + 1] = p),
				(this.#l[u * 4 + 2] = m),
				(this.#l[u * 4 + 3] = h),
				u++);
			let g = 0;
			for (; g < this.#o && (c[g * 6] !== a || c[g * 6 + 1] !== s); ) g++;
			if (g < this.#o) {
				let e = g * 6;
				if (c[e + 4] <= 0 || c[e + 5] <= 0 || m <= 0 || h <= 0)
					((f = 0), (p = 0), (m = 0), (h = 0));
				else {
					let t = Math.max(c[e + 2] + c[e + 4], f + m),
						n = Math.max(c[e + 3] + c[e + 5], p + h);
					((f = Math.min(c[e + 2], f)),
						(p = Math.min(c[e + 3], p)),
						(m = t - f),
						(h = n - p));
				}
			} else
				g < 64 ? this.#o++ : ((g = -1), (f = 0), (p = 0), (m = 0), (h = 0));
			if (g >= 0) {
				let e = g * 6;
				((c[e] = a),
					(c[e + 1] = s),
					(c[e + 2] = f),
					(c[e + 3] = p),
					(c[e + 4] = m),
					(c[e + 5] = h));
			}
			((i[r + 12] = f), (i[r + 13] = p), (i[r + 14] = m), (i[r + 15] = h));
		}
		(u && this.#g(r, u),
			Atomics.store(this.#e, this.#n + j, a),
			Atomics.store(this.#e, this.#n + A, Date.now()),
			Atomics.add(this.#e, this.#n + M, 1),
			Atomics.add(this.#e, T, 1),
			Atomics.notify(this.#e, T),
			this.#T?.());
	}
	pollInput(e, t, n) {
		if (!this.#w()) return 0;
		let r = this.#e,
			i = this.#r,
			a = Atomics.load(r, i + R),
			o = Atomics.load(r, i + z);
		if ((a - o > c && (o = a - c), o === a)) return 0;
		let s = this.#O(e),
			l = t >>> 2,
			u = 0;
		for (; o < a && u < n; ) {
			let e = i + B + (o % c) * 8;
			for (let t = 0; t < 8; t++) s[l + u * 8 + t] = r[e + t];
			(o++, u++);
		}
		return (Atomics.store(r, i + z, o), u);
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
		U(r);
		let i = Math.min(Atomics.load(r, 110924) >>> 0, H),
			a = Math.min(i, n);
		return (
			new Uint8Array(e.buffer, t, a).set(new Uint8Array(r.buffer, 443700, a)),
			W(r),
			i
		);
	}
	clipSet(e, t, n) {
		return (this.#k = G(this.#e, new Uint8Array(e.buffer, t, n), 1));
	}
	dragData(e, t, n) {
		let r = this.#e,
			i = Math.min(Atomics.load(r, fe) >>> 0, V);
		return (
			new Uint8Array(e.buffer, t, Math.min(i, n)).set(
				new Uint8Array(r.buffer, 378148, Math.min(i, n)),
			),
			i
		);
	}
	dragStatus(e, t) {
		if (this.#t < 0) return;
		let n = this.#n + I;
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
		return Atomics.load(e, this.#r + R) !== Atomics.load(e, this.#r + z);
	}
	outputSize() {
		return ((this.#A = this.#j()), this.#A);
	}
	#A = 0;
	#j() {
		let e = this.#e;
		return (
			(((Atomics.load(e, C) & 65535) << 16) | (Atomics.load(e, w) & 65535)) >>>
			0
		);
	}
	release() {
		this.#t < 0 ||
			(Atomics.store(this.#e, this.#n + j, 0),
			Atomics.store(this.#e, this.#n + k, 0),
			(this.#t = -1));
	}
};
function He(e, t) {
	if (e.w <= 0 || e.h <= 0 || t.w <= 0 || t.h <= 0)
		return { x: 0, y: 0, w: 0, h: 0 };
	let n = Math.min(e.x, t.x),
		r = Math.min(e.y, t.y),
		i = Math.max(e.x + e.w, t.x + t.w),
		a = Math.max(e.y + e.h, t.y + t.h);
	return { x: n, y: r, w: i - n, h: a - r };
}
export {
	Me as A,
	Ve as C,
	De as D,
	Te as E,
	Ee as F,
	r as I,
	Pe as M,
	be as N,
	je as O,
	ze as P,
	a as S,
	Se as T,
	o as _,
	ee as a,
	f as b,
	S as c,
	re as d,
	x as f,
	h as g,
	m as h,
	te as i,
	Re as j,
	Oe as k,
	b as l,
	ae as m,
	v as n,
	ne as o,
	ie as p,
	_ as r,
	y as s,
	s as t,
	g as u,
	p as v,
	Ne as w,
	u as x,
	d as y,
};
