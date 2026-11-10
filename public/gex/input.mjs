import { s as e, u as t } from "./internal-DhuCGrNL.mjs";
var n = class extends EventTarget {
		#e = null;
		#t = !1;
		constructor(t) {
			super();
			let n = e(t, `PointerLock`);
			(n.attach(`pointer lock`, this),
				n.afterBoot((e) => {
					let t = e.compositor;
					if (!t || !(`pointerLock` in t)) {
						n.say(`gex: PointerLock: this system has no windows to lock the pointer to
`);
						return;
					}
					((this.#e = t),
						(t.pointerLock = !0),
						(t.onpointerlock = (e) => {
							((this.#t = !!e),
								this.dispatchEvent(new Event(e ? `lock` : `unlock`)));
						}));
				}));
		}
		get locked() {
			return this.#t;
		}
		release() {
			this.#t && document.exitPointerLock?.();
		}
		close() {
			(this.release(),
				this.#e &&
					((this.#e.pointerLock = !1), (this.#e.onpointerlock = null)));
		}
	},
	r = 200,
	i = class extends EventTarget {
		#e = null;
		#t = 0;
		#n = 0;
		#r;
		#i = [];
		#a = ``;
		#o = null;
		constructor(n, { sync: i = !0 } = {}) {
			(super(), (this.#r = !!i));
			let a = e(n, `Clipboard`);
			(a.attach(`clipboard`, this),
				a.afterBoot(async (e) => {
					if (!e.wlChannel) {
						a.say(`gex: Clipboard: this system has no windows to share a clipboard with
`);
						return;
					}
					if (
						((this.#o = await t(
							() => import(`./wl-bridge-6Hq-j3j2.mjs`).then((e) => e.I),
							[],
							import.meta.url,
						)),
						(this.#e = e.wlChannel),
						(this.#t = this.#o.clipboardSerial(this.#e)),
						(this.#n = setInterval(() => this.#l(), r)),
						this.#r && globalThis.document)
					) {
						let e = (e) => {
								let t = e.clipboardData?.getData(`text/plain`);
								t && this.setText(t);
							},
							t = () => this.#c();
						(document.addEventListener(`paste`, e, !0),
							globalThis.addEventListener(`focus`, t),
							this.#i.push(
								() => document.removeEventListener(`paste`, e, !0),
								() => globalThis.removeEventListener(`focus`, t),
							));
					}
					for (let e of this.#s.splice(0)) e();
				}));
		}
		#s = [];
		get text() {
			return this.#a;
		}
		setText(e) {
			if (((e = String(e)), (this.#a = e), !this.#e)) {
				this.#s.push(() => this.setText(e));
				return;
			}
			this.#t = this.#o.setClipboard(this.#e, e);
		}
		async #c() {
			try {
				let e = await navigator.permissions?.query({ name: `clipboard-read` });
				if (e && e.state !== `granted`) return;
				let t = await navigator.clipboard.readText();
				t && t !== this.#a && this.setText(t);
			} catch {}
		}
		#l() {
			let e = this.#o.clipboardSerial(this.#e);
			if (e === this.#t) return;
			this.#t = e;
			let t = this.#o.getClipboard(this.#e);
			t.from === `guest` &&
				((this.#a = t.text),
				this.dispatchEvent(Object.assign(new Event(`copy`), { text: t.text })),
				this.#r && navigator.clipboard?.writeText(t.text).catch(() => {}));
		}
		close() {
			clearInterval(this.#n);
			for (let e of this.#i.splice(0)) e();
		}
	},
	a = 16,
	o = 4,
	s = 0,
	c = 1,
	l = 2,
	u = 3,
	d = 4,
	f = 5,
	p = 6,
	m = 14,
	h = 30,
	g = 62,
	_ = 32,
	v = 16,
	y = 128;
function b(e) {
	let t =
		/Vendor: ([0-9a-f]{4}) Product: ([0-9a-f]{4})/i.exec(e) ??
		/^([0-9a-f]{1,4})-([0-9a-f]{1,4})-/i.exec(e);
	return t ? [parseInt(t[1], 16), parseInt(t[2], 16)] : [0, 0];
}
function x(e) {
	return (
		String(e)
			.replace(/\s*\((?:[^()]*(?:Vendor|STANDARD GAMEPAD)[^()]*)\)\s*$/i, ``)
			.replace(/^[0-9a-f]{1,4}-[0-9a-f]{1,4}-/i, ``)
			.trim() || `Gamepad`
	);
}
var S = class extends EventTarget {
	#e;
	#t;
	#n = null;
	#r = 0;
	#i = [];
	#a = 0;
	#o = 0;
	#s = !1;
	#c = null;
	constructor(t, { source: n } = {}) {
		(super(),
			(this.#t = n ?? (() => globalThis.navigator?.getGamepads?.() ?? [])));
		let r = e(t, `Gamepads`);
		((this.#e = r),
			r.attach(`gamepads`, this),
			r.afterBoot(async (e) => {
				this.#c = r.kernel();
				let t = (await this.#c.r(`k_joy_table`)) >>> 0;
				if (this.#s) return;
				if (!t) {
					r.say(`gex: Gamepads: this kernel has no game controller table
`);
					return;
				}
				((this.#n = e.kernel.memory), (this.#r = t));
				let n = this.#l()[(t >>> 2) + 2];
				((this.#i = Array.from({ length: n }, () => null)), this.#u());
			}));
	}
	get env() {
		return { SDL_JOYSTICK_DISABLE_UDEV: `1` };
	}
	get pads() {
		return this.#i.flatMap((e, t) =>
			e ? [{ slot: t, id: e.id, mapping: e.mapping }] : [],
		);
	}
	#l() {
		return new Int32Array(this.#n.buffer);
	}
	#u() {
		let e = () => {
			if (!this.#s) {
				try {
					this.poll();
				} catch (e) {
					this.#e.say(`gex: Gamepads: ${e?.message ?? e}\n`);
				}
				globalThis.requestAnimationFrame &&
				globalThis.document?.visibilityState === `visible`
					? (this.#o = requestAnimationFrame(e))
					: (this.#a = setTimeout(e, 16));
			}
		};
		e();
	}
	poll() {
		if (!this.#n || this.#s) return;
		let e = [...(this.#t() ?? [])],
			t = new Set(),
			n = !1;
		for (let r of e)
			!r ||
				!r.connected ||
				r.index >= this.#i.length ||
				(t.add(r.index), (n = this.#f(r.index, r) || n));
		for (let e = 0; e < this.#i.length; e++)
			this.#i[e] && !t.has(e) && (n = this.#p(e) || n);
		n && this.#m();
	}
	#d(e) {
		return (this.#r >>> 2) + a + e * 64;
	}
	#f(e, t) {
		let n = new Int32Array(64),
			r = this.#i[e],
			i = !r || r.id !== t.id || r.mapping !== t.mapping,
			a = Math.min(t.buttons.length, _),
			S = Math.min(t.axes.length, v);
		n[l] = t.mapping === `standard` ? 1 : 2;
		let [C, w] = b(t.id);
		((n[u] = (C << 16) | w), (n[d] = a | (S << 8)));
		let T = 0;
		for (let e = 0; e < a; e++) {
			let r = t.buttons[e];
			r.pressed && (T |= 1 << e);
			let i = Math.round(
				Math.max(0, Math.min(1, r.value ?? +!!r.pressed)) * 255,
			);
			n[p + (e >> 2)] |= i << ((e & 3) * 8);
		}
		n[f] = T;
		for (let e = 0; e < S; e++)
			n[m + e] = Math.round(Math.max(-1, Math.min(1, t.axes[e] || 0)) * 32767);
		let E = new TextEncoder().encode(x(t.id)).subarray(0, 127),
			D = new Uint8Array(y);
		D.set(E);
		let O = new Int32Array(D.buffer);
		if (
			(n.set(O, h),
			!i && r.words.every((e, t) => t === c || t === s || t >= g || e === n[t]))
		)
			return !1;
		let k = this.#l(),
			A = this.#d(e);
		n[c] = i ? (k[A + c] + 1) | 0 : k[A + c];
		let j = Date.now();
		((n[g] = (j % 4294967296) | 0),
			(n[63] = Math.floor(j / 4294967296)),
			Atomics.add(k, A + s, 1));
		for (let e = 1; e < 64; e++) Atomics.store(k, A + e, n[e]);
		return (
			Atomics.add(k, A + s, 1),
			(this.#i[e] = { id: t.id, mapping: t.mapping, words: n }),
			i &&
				(Atomics.store(k, (this.#r >>> 2) + o, Math.floor(j / 1e3)),
				this.dispatchEvent(
					Object.assign(new Event(`connect`), { slot: e, gamepad: t }),
				)),
			!0
		);
	}
	#p(e) {
		let t = this.#l(),
			n = this.#d(e);
		(Atomics.add(t, n + s, 1),
			Atomics.store(t, n + l, 0),
			Atomics.add(t, n + s, 1),
			Atomics.store(t, (this.#r >>> 2) + o, Math.floor(Date.now() / 1e3)));
		let r = this.#i[e];
		return (
			(this.#i[e] = null),
			this.dispatchEvent(
				Object.assign(new Event(`disconnect`), {
					slot: e,
					gamepad: { id: r.id, mapping: r.mapping },
				}),
			),
			!0
		);
	}
	#m() {
		this.#c?.r(`k_joy_notify`).catch(() => {});
	}
	close() {
		if (this.#s) return;
		let e = !1;
		if (this.#n)
			for (let t = 0; t < this.#i.length; t++)
				this.#i[t] && (e = this.#p(t) || e);
		(e && this.#m(),
			(this.#s = !0),
			clearTimeout(this.#a),
			this.#o && cancelAnimationFrame(this.#o));
	}
};
export { i as Clipboard, S as Gamepads, n as PointerLock };
