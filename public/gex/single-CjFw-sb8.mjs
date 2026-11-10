var e = { on: !1 },
	t = typeof WebAssembly.Suspending == `function`;
function n() {
	return t && typeof WebAssembly.promising == `function`;
}
var r = 8,
	i =
		typeof process == `object` &&
		!!process.versions?.node &&
		typeof setImmediate == `function`,
	a = class {
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
	},
	o = new (class {
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
				if (((this.#a = !0), i)) {
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
			return performance.now() - this.#s >= r;
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
					let o = new a(i, e, n);
					if (r)
						((o.words = r.words),
							(o.at = r.at),
							(o.seq = r.seq),
							this.#n.add(o));
					else if (e === null) this.#e.add(o);
					else {
						let t = this.#t.get(e);
						(t || this.#t.set(e, (t = new Set())), t.add(o));
					}
					let s = Number(t),
						c = Math.max(0, s / 1e6);
					(s >= 0 &&
						Number.isFinite(c) &&
						c < 2 ** 31 &&
						(o.timer = setTimeout(() => {
							(this.stats.timeouts++, this.#d(o, 2));
						}, c)),
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
	s = [],
	c = !1;
function l(e) {
	(s.push(e), !c && ((c = !0), queueMicrotask(u)));
}
function u() {
	let e = performance.now();
	for (; s.length; ) {
		let t = s.shift();
		try {
			t();
		} catch (e) {
			console.error(`[gex] a fiber message handler threw:`, e);
		}
		if (performance.now() - e > r && s.length) {
			setTimeout(u, 0);
			return;
		}
	}
	c = !1;
}
var d = class e {
	#e = [];
	#t = [];
	#n = null;
	#r = [];
	dead = !1;
	static count = 0;
	constructor() {
		throw (
			e.count++,
			Error(`fiber.mjs: process.mjs has not registered workerMain`)
		);
	}
	postMessage(e) {
		if (this.dead) return;
		if (!this.#n) {
			this.#r.push(e);
			return;
		}
		let t = this.#n;
		l(() => t(e));
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
		this.dead || ((this.dead = !0), o.drop(this));
	}
};
export { n as i, o as n, e as r, d as t };
