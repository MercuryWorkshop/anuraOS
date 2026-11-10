var e = 1 << 20,
	t = 64,
	n = 8,
	r = 0,
	i = 1,
	a = 2,
	o = 3,
	s = 4,
	c = 5,
	l = 262144,
	u = 4,
	d = 0,
	f = 1,
	p = 2,
	m = 3;
function h() {
	if (
		typeof Atomics.waitAsync != `function` ||
		typeof SharedArrayBuffer != `function`
	)
		return null;
	let r = null;
	try {
		((r = new SharedArrayBuffer(0, { maxByteLength: t * l })),
			(typeof r.grow != `function` || !r.growable) && (r = null));
	} catch {
		r = null;
	}
	return {
		control: new SharedArrayBuffer(64),
		data: new SharedArrayBuffer(e),
		rx: r ? new SharedArrayBuffer(256 * n) : void 0,
		rxData: r ?? void 0,
	};
}
var g = class {
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
		let c = this.#e;
		for (let f = 0; f < t; f++) {
			let p = f * n;
			if (Atomics.load(c, p + r) !== 0) continue;
			let m = Math.min(t, Math.ceil((f + 1) / u) * u) * l;
			return (
				this.#i.byteLength < m && this.#i.grow(m),
				this.#a(p, () => {
					((c[p + i] = d),
						(c[p + a] = 0),
						(c[p + o] = 0),
						(c[p + s] = 0),
						Atomics.store(c, p + r, e));
				}),
				f
			);
		}
		return -1;
	}
	release(e) {
		let t = e * n;
		this.#a(t, () => Atomics.store(this.#e, t + r, 0));
	}
	#a(e, t) {
		let n = this.#e,
			r = this.#n ? -1 : 1;
		for (;;) {
			let t = Atomics.compareExchange(n, e + c, 0, r);
			if (t === 0) break;
			this.#n || Atomics.wait(n, e + c, t, 1);
		}
		try {
			return t();
		} finally {
			(Atomics.store(n, e + c, 0), this.#n || Atomics.notify(n, e + c));
		}
	}
	setState(e, t) {
		Atomics.store(this.#e, e * n + i, t);
	}
	setSpill(e, t) {
		Atomics.store(this.#e, e * n + s, +!!t);
	}
	write(e, t) {
		let r = this.#e,
			i = e * n,
			s = Atomics.load(r, i + a) >>> 0,
			c = l - ((s - (Atomics.load(r, i + o) >>> 0)) >>> 0),
			u = Math.min(c, t.length);
		if (u <= 0) return 0;
		let d = s & 262143,
			f = e * l,
			p = Math.min(u, l - d);
		return (
			this.#t.set(t.subarray(0, p), f + d),
			u > p && this.#t.set(t.subarray(p, u), f),
			Atomics.store(r, i + a, (s + u) | 0),
			u
		);
	}
	find(e) {
		let i = this.#e,
			a = this.#r.get(e);
		if (a === -1) return -1;
		if (a !== void 0 && Atomics.load(i, a * n + r) === e) return a * n;
		for (let a = 0; a < t; a++)
			if (Atomics.load(i, a * n + r) === e) return (this.#r.set(e, a), a * n);
		return (this.#r.set(e, -1), -1);
	}
	queued(e) {
		return (
			((Atomics.load(this.#e, e + a) >>> 0) -
				(Atomics.load(this.#e, e + o) >>> 0)) >>>
			0
		);
	}
	spill(e) {
		return Atomics.load(this.#e, e + s) !== 0;
	}
	status(e) {
		let t = Atomics.load(this.#e, e + i);
		return t === d && (this.queued(e) || this.spill(e)) ? f : t;
	}
	ended(e) {
		let t = Atomics.load(this.#e, e + i);
		return t === p || t === m;
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
		if (!(t < 0)) return this.queued(t) > 0 || this.spill(t) || this.ended(t);
	}
	statusOf(e) {
		let t = this.find(e);
		return t < 0 ? void 0 : this.status(t);
	}
	copy(e, t, i, s) {
		let c = this.#e;
		return this.#a(e, () => {
			if (Atomics.load(c, e + r) !== t) return -1;
			let u = Atomics.load(c, e + o) >>> 0,
				d = Math.min(i.length, ((Atomics.load(c, e + a) >>> 0) - u) >>> 0),
				f = u & 262143,
				p = (e / n) * l,
				m = Math.min(d, l - f);
			return (
				i.set(this.#t.subarray(p + f, p + f + m), 0),
				d > m && i.set(this.#t.subarray(p, p + d - m), m),
				s || Atomics.store(c, e + o, (u + d) | 0),
				d
			);
		});
	}
};
function _(t, n) {
	let r = new Int32Array(n.control),
		i = new Uint8Array(n.data),
		a = new TextDecoder(),
		o = !0;
	n.rx && `rings` in t && (t.rings = new g(n, !0));
	let s = t.onActivity;
	t.onActivity = (...e) => {
		(s?.apply(t, e), Atomics.add(r, 8, 1), Atomics.notify(r, 8));
	};
	let c = () => {
		let n = r[1],
			o = r[2],
			s = 0;
		try {
			switch (n) {
				case 1:
					s = t.open();
					break;
				case 2:
					t.connect(o, a.decode(i.slice(0, r[3])), r[4]);
					break;
				case 3:
					s = t.status(o);
					break;
				case 4:
					s = t.send(o, i.subarray(0, r[3]));
					break;
				case 5:
					s = t.recv(o, i.subarray(0, Math.min(r[3], e)));
					break;
				case 6:
					s = +!!t.available(o);
					break;
				case 7:
					t.close(o);
					break;
				case 8:
					s = t.dup ? t.dup(o) : 0;
					break;
				case 9:
					s = t.peek ? t.peek(o, i.subarray(0, Math.min(r[3], e))) : -2;
					break;
				case 10:
					s = t.refill?.(o) ?? 0;
					break;
				default:
					s = -1;
			}
		} catch (e) {
			(console.error(`[net] the network threw`, e), (s = -2));
		}
		((r[5] = s), Atomics.store(r, 0, 2), Atomics.notify(r, 0));
	};
	return (
		(async () => {
			for (; o; ) {
				let e = Atomics.load(r, 0);
				if (e === 1) {
					c();
					continue;
				}
				let t = Atomics.waitAsync(r, 0, e, 1e3);
				t.async && (await t.value);
			}
		})(),
		() => {
			((o = !1),
				(t.onActivity = s),
				n.rx && `rings` in t && (t.rings = null),
				Atomics.notify(r, 0));
		}
	);
}
export { h as makeNetChannel, _ as serveNet };
