import { P as e } from "./wl-bridge-6Hq-j3j2.mjs";
import { n as t, r as n, t as r } from "./page-env-BH7IngaK.mjs";
import { i, n as a, r as o } from "./input-map-8py0bNx7.mjs";
var s = class s {
	#e;
	#t;
	#n;
	#r = [];
	#i = new Map();
	#a = 1;
	#o;
	static async create(
		e,
		t,
		n = e,
		{ makeWorker: r = null, scale: i = 1 } = {},
	) {
		let a = new s();
		return (await a.#s(e, t, n, r, { scale: i }), a);
	}
	async hostGl(e, i = {}) {
		let { source: a, ...o } = i,
			s = null;
		if (typeof a == `function`) {
			let e = [
					`gex-wgpu-replay.js`,
					`gex-wgpu-replay.wasm`,
					`gex-wgpu-replay.deferred.wasm`,
				],
				t = await Promise.all(
					e.map((e) =>
						Promise.resolve()
							.then(() => a(e))
							.catch(() => null),
					),
				);
			t.every(Boolean) && (s = Object.fromEntries(e.map((e, n) => [e, t[n]])));
		}
		return (
			(i = s ? { ...o, sources: s } : o),
			new Promise((a, o) => {
				let s = ({ data: e }) => {
					(e.kind === `gl-ready` || e.kind === `gl-failed`) &&
						(this.#e.removeEventListener(`message`, s),
						e.kind === `gl-ready` ? a(e.describe) : o(Error(e.error)));
				};
				this.#e.addEventListener(`message`, s);
				let c = n(),
					l = c?.get(`mesaenv`),
					u = c?.get(`glcapture`),
					d = c?.get(`wgslcache`),
					f = c?.get(`wgpustats`) === `1`,
					p = c?.get(`gltrace`) === `1`;
				this.#e.postMessage({
					kind: `gl`,
					channel: e,
					url: t(`/gex/gex-wgpu-replay.js`),
					files: r(`/gex/`),
					...i,
					...(l ? { mesaEnv: l } : {}),
					...(u ? { glCapture: u } : {}),
					...(d ? { wgslCache: d } : {}),
					...(f ? { wgpuStats: f } : {}),
					...(p ? { glTrace: p } : {}),
				});
			})
		);
	}
	async #s(e, t, r, i, { scale: a = 1 } = {}) {
		this.#t = t;
		let o = r === e,
			s;
		try {
			s = e.transferControlToOffscreen();
		} catch {
			((e = c(e)), o && (r = e), (s = e.transferControlToOffscreen()));
		}
		((this.#n = e),
			(this.#o =
				typeof SharedArrayBuffer == `function`
					? new SharedArrayBuffer(16)
					: new ArrayBuffer(16)));
		let l = i
			? i()
			: new Worker(
					new URL("./compositor-worker-UHKEcK7F.mjs", import.meta.url),
					{ type: "module", name: "compositor" },
				);
		this.#e = l;
		let u = new Promise((e, t) => {
			let n = ({ data: r }) => {
				r.kind === `ready`
					? (l.removeEventListener(`message`, n), e())
					: r.kind === `error` &&
						(l.removeEventListener(`message`, n), t(Error(r.error)));
			};
			l.addEventListener(`message`, n);
		});
		l.addEventListener(`message`, ({ data: e }) => {
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
							: e.kind === `error` && console.error(`[compositor]`, e.error);
		});
		let d = n(),
			f = d?.get(`present`) ?? null,
			p = d?.get(`direct`) === `1`;
		this.#d = d?.get(`pointerlock`) === `1`;
		let m = d?.has(`gllimits`) ? Number(d.get(`gllimits`)) || 0 : null;
		(l.postMessage(
			{
				kind: `init`,
				canvas: s,
				width: e.width,
				height: e.height,
				scale: a,
				channel: t,
				stats: this.#o,
				present: f,
				direct: p,
				glLimits: m,
			},
			[s],
		),
			await u,
			this.#g(r));
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
				document.pointerLockElement === t && document.exitPointerLock?.()),
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
			s = () => {
				let e = this.pointerLock && document.pointerLockElement === this.#n;
				e !== this.#p &&
					((this.#p = e),
					t({ kind: `pointer-lock`, on: e, time: n() }),
					this.onpointerlock?.(e));
			};
		(document.addEventListener(`pointerlockchange`, s),
			this.#r.push(() => document.removeEventListener(`pointerlockchange`, s)));
		let c = (e) => {
				if (this.#p) {
					let r = this.#n.getBoundingClientRect(),
						i = this.#n.width / Math.max(1, r.width),
						a = Math.round(e.movementX * i * 256),
						o = Math.round(e.movementY * i * 256);
					(a || o) && t({ kind: `pointer-relative`, dx: a, dy: o, time: n() });
					return;
				}
				let { x: r, y: i } = this.#h(e);
				t({ kind: `pointer-move`, x: r, y: i, time: n() });
			},
			l = (i) => {
				(e.focus?.({ preventScroll: !0 }),
					this.#c &&
						this.#d &&
						document.pointerLockElement !== e &&
						e.requestPointerLock?.());
				let o = a[i.button];
				if (o !== void 0) {
					if ((i.button >= 3 && r.add(i.button), !this.#p)) {
						let { x: e, y: r } = this.#h(i);
						t({ kind: `pointer-move`, x: e, y: r, time: n() });
					}
					(t({ kind: `pointer-button`, button: o, pressed: !0, time: n() }),
						i.preventDefault());
				}
			},
			u = (e) => {
				let i = a[e.button];
				i !== void 0 &&
					(r.delete(e.button) && e.preventDefault(),
					t({ kind: `pointer-button`, button: i, pressed: !1, time: n() }));
			},
			d = (r) => {
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
			f = (r) => (a) => {
				if (r && this.#c && a.altKey && a.code === `Enter`) {
					(document.fullscreenElement
						? document.exitFullscreen?.()
						: e.requestFullscreen?.(),
						a.preventDefault());
					return;
				}
				let s = o[a.code];
				s !== void 0 &&
					(t({ kind: `key`, code: s, pressed: r, mods: i(a), time: n() }),
					a.preventDefault());
			},
			p = (e) => e.preventDefault(),
			m = f(!0),
			h = f(!1);
		(e.hasAttribute?.(`tabindex`) || e.setAttribute?.(`tabindex`, `0`),
			e.addEventListener(`mousemove`, c),
			e.addEventListener(`mousedown`, l),
			window.addEventListener(`mouseup`, u),
			e.addEventListener(`wheel`, d, { passive: !1 }),
			e.addEventListener(`contextmenu`, p),
			e.addEventListener(`keydown`, m),
			e.addEventListener(`keyup`, h),
			this.#r.push(() => {
				(e.removeEventListener(`mousemove`, c),
					e.removeEventListener(`mousedown`, l),
					window.removeEventListener(`mouseup`, u),
					e.removeEventListener(`wheel`, d),
					e.removeEventListener(`contextmenu`, p),
					e.removeEventListener(`keydown`, m),
					e.removeEventListener(`keyup`, h));
			}));
	}
	addMemory(t, n, r) {
		(r && this.#t?.pixels && (e(this.#t, r), (r = void 0)),
			(n || r) &&
				this.#e.postMessage({
					kind: `memory`,
					token: t,
					memory: n,
					kernel: r,
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
			(this.#i.set(e, t), this.#e.postMessage({ kind: `wgsl-cache`, id: e }));
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
			r = Math.round((e - n.left) * (this.#n.width / Math.max(1, n.width))),
			i = Math.round((t - n.top) * (this.#n.height / Math.max(1, n.height))),
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
		globalThis.__gexCompositor === this && delete globalThis.__gexCompositor;
	}
};
function c(e) {
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
export { s as Compositor };
