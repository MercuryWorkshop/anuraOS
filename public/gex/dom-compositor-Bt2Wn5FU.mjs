import { u as e } from "./internal-DhuCGrNL.mjs";
import {
	A as t,
	D as n,
	E as r,
	F as i,
	M as a,
	N as o,
	O as s,
	g as c,
	j as l,
	k as u,
	w as d,
} from "./wl-bridge-6Hq-j3j2.mjs";
import { r as f } from "./page-env-BH7IngaK.mjs";
import { i as p, n as m, r as h, t as g } from "./input-map-8py0bNx7.mjs";
import { t as _ } from "./log-BhnhOsaP.mjs";
function v(e, t) {
	e.role === 1 &&
		_(`win`) &&
		console.log(
			`[win] ${t} ${e.key} ${e.width}x${e.height} "${e.title ?? ``}"`,
		);
}
var y = (e) => `${e.token}:${e.client}:${e.surface}`,
	b = class {
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
			((this.x = Math.round(e)), (this.y = Math.round(t)), this.#e.moved(this));
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
			this.paints++ === 0 && v(this, `painted`);
			let {
				x: r,
				y: i,
				w: a,
				h: o,
			} = x(t, this.canvas.width, this.canvas.height, n);
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
	};
function x(e, t, n, r = !1) {
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
var S = class _ {
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
			l(
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
			t && l(this.#e, t.block, 15, 1, 0, n, 0, t.client, t.surface),
			this.onpointerlock?.(t));
	};
	static create(e, t, { width: n, height: r } = {}) {
		let i = new _();
		((i.#t = e), (i.#e = t));
		let a = n || e.clientWidth || 1280,
			s = r || e.clientHeight || 760;
		return (
			o(t, a, s),
			i.#L(),
			document.addEventListener(`pointerlockchange`, i.#x),
			(i.#c = !0),
			(i.#s = requestAnimationFrame(() => i.#T())),
			i
		);
	}
	resizeOutput(e, t, n) {
		(this.#D++,
			o(this.#e, Math.max(1, Math.round(e)), Math.max(1, Math.round(t)), n));
	}
	async hostGl(t, n = {}) {
		let r = document.createElement(`canvas`);
		((r.style.position = `absolute`),
			(r.style.top = `0`),
			(r.style.left = `-99999px`),
			(r.style.pointerEvents = `none`),
			(r.width = Math.max(640, this.#t.clientWidth || 1280)),
			(r.height = Math.max(480, this.#t.clientHeight || 760)),
			(r.style.touchAction = `none`),
			this.#t.append(r),
			(this.#m = r));
		let { MesaGlDevice: i } = await e(
				async () => {
					let { MesaGlDevice: e } = await import(`./mesa-gl-C3T8yqKw.mjs`);
					return { MesaGlDevice: e };
				},
				[],
				import.meta.url,
			),
			a = await i.create(r, {
				url: n.url,
				source: n.source,
				api: n.api || `core`,
				env: f().get(`mesaenv`) ?? void 0,
				wgslCache: f().get(`wgslcache`) ?? void 0,
				preserve: !0,
			});
		if (!a.ok)
			throw (
				this.onglfailed?.(a.error),
				Error(a.error || `the GL device would not start`)
			);
		this.#p = a;
		let { serveGl: o } = await e(
			async () => {
				let { serveGl: e } = await import(`./gl-bridge-JJI48dWv.mjs`);
				return { serveGl: e };
			},
			[],
			import.meta.url,
		);
		return (
			(this.#g = o(a, t)),
			(this.#h = !0),
			this.ongl?.(a.describe()),
			a.describe()
		);
	}
	ongl = null;
	onglfailed = null;
	get gl() {
		return this.#p;
	}
	addMemory(e, t, n) {
		(this.#D++,
			a(this.#e, n),
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
		(n(this.#e, e), this.#p?.forgetClient?.(e));
	}
	stop() {
		((this.#c = !1),
			document.removeEventListener(`pointerlockchange`, this.#x),
			this.#y && document.exitPointerLock?.(),
			this.#s && cancelAnimationFrame(this.#s),
			(this.#s = 0));
		for (let e of this.#n.values()) e.onclosed?.();
		(this.#n.clear(), this.#g?.stop?.(), (this.#g = null), (this.#h = !1));
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
				(this.#h && (this.#F(), this.#p?.display?.()), this.#A() || this.#j());
			} catch (e) {
				console.error(`[dom-desktop]`, e);
			}
			this.#s = requestAnimationFrame(() => this.#T());
		}
	}
	#E = u();
	#D = 1;
	#O = 0;
	#k = !1;
	#A() {
		return this.#D === this.#O && !this.#k && t(this.#e, this.#E);
	}
	#j() {
		this.#k = !1;
		let e = this.#D,
			{ surfaces: t, blocks: n } = r(this.#e),
			i = new Set();
		this.#u = t;
		for (let e of t) {
			let t = y(e);
			i.add(t);
			let n = this.#n.get(t);
			(n ||
				((n = new b(this, t, e)),
				this.#n.set(t, n),
				this.#I(n),
				e.role === 4 ? (this.#l = n) : this.onwindow?.(n),
				v(n, `new`),
				e.role === 1 && !e.placed && this.focus(n)),
				this.#M(n, e));
		}
		for (let [e, t] of [...this.#n])
			if (!i.has(e)) {
				if (
					(this.#n.delete(e),
					(this.#a = this.#a.filter((e) => e !== t)),
					this.#b === t && (this.#b = null),
					this.#i === t)
				) {
					this.#i = null;
					let e = [...this.#a].reverse().find((e) => this.#n.get(e.key) === e);
					e && this.focus(e);
				}
				(this.#l === t &&
					((this.#l = null), (this.#f = -1), this.#P(`default`)),
					t.glFrame && this.#p?.surfaceCanvas?.(t.glFrame, !1),
					t.dropGl(),
					t.onclosed?.(),
					this.onwindowgone?.(t));
			}
		for (let e of n) d(this.#e, e.block, e.gen);
		(s(this.#E, n), (this.#O = e));
	}
	#M(e, t) {
		(t.title !== e.title &&
			((e.title = t.title), e.onretitle?.(t.title), v(e, `title`)),
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
		let a = !!e.wantsLock;
		((e.wantsLock = (t.flags & c) !== 0),
			!e.wantsLock && this.#y === e && document.exitPointerLock?.(),
			e.wantsLock &&
				!a &&
				this.pointerLock &&
				this.#b === e &&
				!this.#y &&
				navigator.userActivation?.isActive &&
				document.pointerLockElement !== e.canvas &&
				e.canvas.requestPointerLock?.()?.catch?.(() => {}));
		let o = !i(t);
		if (
			(o !== e.noInput &&
				((e.noInput = o), (e.canvas.style.pointerEvents = o ? `none` : ``)),
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
		let s = e.serial,
			l = this.#S(t);
		(l ? (e.serial = t.serial) : (this.#k = !0),
			l
				? e.paint(l, t, s < 0 || t.serial !== s + 1)
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
		l(this.#e, e.block, 10, e.x, e.y, 0, 0, e.client, e.surface);
	}
	configure(e, t, n) {
		l(
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
			l(this.#e, e.block, 9, 0, 0, 0, 0, e.client, e.surface);
			return;
		}
		l(this.#e, e.block, 8, 0, 0, 0, 0, e.client, e.surface);
	}
	focus(e) {
		if (this.#i === e) return;
		let t = this.#i;
		((this.#i = e),
			(this.#a = this.#a.filter((n) => n !== e && n !== t)),
			t && this.#a.push(t),
			this.#a.length > 16 && this.#a.shift(),
			t &&
				(l(this.#e, t.block, 6, 0, 0, 0, 0, t.client, 0),
				this.configure(t, t.width, t.height)),
			l(this.#e, e.block, 6, 0, 0, 0, 0, e.client, e.surface),
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
					t.glShown || ((t.glShown = !0), v(t, `gl`)));
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
			l(this.#e, e.block, 0, r.x, r.y, r.t, 0, e.client, e.surface);
		}),
			t.addEventListener(`pointerleave`, () => {
				this.#o === e &&
					((this.#o = null), l(this.#e, e.block, 5, 0, 0, 0, 0, e.client, 0));
			}));
		let r = new Set(),
			i = (t, n, i) => {
				let a = m[t.button];
				a !== void 0 &&
					r.has(a) !== n &&
					(n ? r.add(a) : r.delete(a),
					l(this.#e, e.block, 1, a, +!!n, i.t, 0, e.client, e.surface));
			};
		(t.addEventListener(`pointermove`, (t) => {
			if (this.#y === e) {
				((t.movementX || t.movementY) &&
					l(
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
						i(t, (t.buttons & (g[t.button] ?? 0)) !== 0, {
							t: Math.round(t.timeStamp),
						}));
				return;
			}
			let r = n(t);
			(l(this.#e, e.block, 0, r.x, r.y, r.t, 0, e.client, e.surface),
				t.button >= 0 && i(t, (t.buttons & (g[t.button] ?? 0)) !== 0, r));
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
				(l(this.#e, e.block, 0, a.x, a.y, a.t, 0, e.client, e.surface),
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
					l(this.#e, e.block, 1, t, 0, n, 0, e.client, e.surface);
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
								l(
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
		let r = h[e.code];
		r !== void 0 &&
			(e.preventDefault(),
			l(this.#e, n.block, 4, p(e), 0, 0, 0, n.client, 0),
			l(
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
};
export { S as DomDesktop };
