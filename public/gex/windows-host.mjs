import { s as e, t } from "./internal-DhuCGrNL.mjs";
import { t as n } from "./x11-5DB5tmr-.mjs";
var r = { 1: `toplevel`, 2: `popup`, 3: `subsurface` },
	i = { maximized: 2, resizing: 4, fullscreen: 8 },
	a = class extends EventTarget {
		#e;
		#t;
		#n;
		#r = { maximized: !1, fullscreen: !1, resizing: !1 };
		constructor(e, t, n) {
			(super(),
				(this.#n = e),
				(this.#t = t),
				(this.#e = n),
				(this.canvas = n.canvas),
				(this.kind = r[n.role] ?? `toplevel`));
			let i = this.canvas;
			((i.tabIndex = 0),
				(i.style.outline = `none`),
				(i.dataset.gexWindow = n.key),
				this.#i(),
				i.addEventListener(`keydown`, (e) => this.#n.keyEvent(e, !0)),
				i.addEventListener(`keyup`, (e) => this.#n.keyEvent(e, !1)),
				i.addEventListener(`focus`, () => t.focus(n)),
				(n.onretitle = () => this.dispatchEvent(new Event(`title`))),
				(n.onresized = () => {
					(this.#i(), this.dispatchEvent(new Event(`resized`)));
				}),
				(n.onplace = () => this.dispatchEvent(new Event(`position`))),
				(n.onrestack = (e) =>
					this.dispatchEvent(
						Object.assign(new Event(`restack`), { below: e }),
					)),
				(n.onrequest = (e, t) =>
					this.dispatchEvent(
						Object.assign(new Event(`request`), { kind: e, edges: t }),
					)),
				(n.onfullscreen = (e) =>
					this.dispatchEvent(
						Object.assign(new Event(`request`), {
							kind: e ? `fullscreen` : `unfullscreen`,
						}),
					)));
		}
		#i() {
			((this.canvas.style.width = `${this.width}px`),
				(this.canvas.style.height = `${this.height}px`));
		}
		get pid() {
			return this.#e.token;
		}
		get parent() {
			let e = this.#e;
			return !e.parent || this.kind === `toplevel`
				? null
				: this.#n[t].byKey(`${e.token}:${e.client}:${e.parent}`);
		}
		get title() {
			return this.#e.title ?? ``;
		}
		get appId() {
			return null;
		}
		get decorations() {
			return this.kind === `toplevel`
				? this.#e.placed
					? `client`
					: `host`
				: `none`;
		}
		get placed() {
			return !!this.#e.placed;
		}
		get x() {
			return this.kind === `toplevel` && !this.placed ? 0 : this.#e.relX | 0;
		}
		get y() {
			return this.kind === `toplevel` && !this.placed ? 0 : this.#e.relY | 0;
		}
		get width() {
			return Math.round(this.#e.width / (this.#e.bufferScale || 1));
		}
		get height() {
			return Math.round(this.#e.height / (this.#e.bufferScale || 1));
		}
		get states() {
			return { ...this.#r };
		}
		resize(e, t) {
			this.#e.resize(e, t);
		}
		setStates({ maximized: e, fullscreen: t, resizing: n } = {}, r, a) {
			(e !== void 0 && (this.#r.maximized = !!e),
				t !== void 0 && (this.#r.fullscreen = !!t),
				n !== void 0 && (this.#r.resizing = !!n));
			let o = 0;
			for (let [e, t] of Object.entries(i)) this.#r[e] && (o |= t);
			this.#e.setStates(o, r ?? this.width, a ?? this.height);
		}
		place(e, t) {
			this.#e.place(e, t);
		}
		focus() {
			(this.#t.focus(this.#e),
				globalThis.document?.activeElement !== this.canvas &&
					this.canvas.focus({ preventScroll: !0 }));
		}
		close() {
			this.#e.close();
		}
	},
	o = class extends EventTarget {
		#e;
		#t = null;
		#n = null;
		#r;
		#i = new Map();
		constructor(r, { width: i, height: a, scale: o } = {}) {
			super();
			let s = e(r, `HostWindows`);
			(s.attach(`windows`, this, { beforeBoot: !0 }),
				(this.#e = s),
				(this.#r = this.#a(i, a, o)));
			let c = {};
			(n(s, c),
				s.devices(async (e) => {
					let t = document.createElement(`div`);
					((t.style.cssText = `position:fixed;left:0;top:0;width:0;height:0;overflow:hidden;`),
						(t.dataset.gexDesktop = ``),
						document.body.append(t),
						(this.#n = t),
						Object.assign(
							e,
							await e.rt.openWayland({
								wl: t,
								onDesktop: (e) => this.#o(e),
								say: (t) => e.say(`${t}\n`),
							}),
						));
				}));
			let l = this;
			this[t] = {
				x: c,
				byKey: (e) => l.#i.get(e) ?? null,
				of: (e) => [...l.#i.values()].filter((t) => t.pid === e),
				shutdown: () => {
					(l.#t?.stop(), l.#n?.remove());
				},
			};
		}
		#a(e, t, n) {
			let r = Math.max(1, Math.round(n ?? globalThis.devicePixelRatio ?? 1));
			return {
				w: Math.max(1, Math.round(e ?? globalThis.innerWidth ?? 1280)),
				h: Math.max(1, Math.round(t ?? globalThis.innerHeight ?? 720)),
				scale: r,
			};
		}
		get env() {
			return {
				XDG_RUNTIME_DIR: `/tmp`,
				WAYLAND_DISPLAY: `wayland-0`,
				DISPLAY: `:0`,
			};
		}
		setOutputSize(e, t, n) {
			((this.#r = this.#a(e, t, n ?? this.#r.scale)),
				this.#t?.resizeOutput(
					this.#r.w * this.#r.scale,
					this.#r.h * this.#r.scale,
					this.#r.scale,
				));
		}
		windows() {
			return [...this.#i.values()];
		}
		get focused() {
			let e = this.#t?.focused();
			return e ? (this.#i.get(e.key) ?? null) : null;
		}
		keyEvent(e, t) {
			this.#t?.keyEvent(e, t);
		}
		#o(e) {
			this.#t = e;
			let { w: t, h: n, scale: r } = this.#r;
			(e.resizeOutput(t * r, n * r, r),
				(e.oncursor = (e) => {
					for (let t of this.#i.values()) t.canvas.style.cursor = e;
					this.dispatchEvent(Object.assign(new Event(`cursor`), { css: e }));
				}),
				(e.onwindow = (t) => {
					let n = new a(this, e, t);
					(this.#i.set(t.key, n),
						(t.onclosed = () => {
							(this.#i.delete(t.key),
								n.canvas.remove(),
								n.dispatchEvent(new Event(`closed`)));
						}),
						this.dispatchEvent(
							Object.assign(new Event(`window`), { window: n }),
						));
				}));
		}
	};
export { a as GuestWindow, o as HostWindows };
