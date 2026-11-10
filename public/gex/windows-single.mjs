import { s as e, t, u as n } from "./internal-DhuCGrNL.mjs";
import { t as r } from "./x11-5DB5tmr-.mjs";
var i = class extends EventTarget {
	#e = null;
	#t;
	constructor(i, { container: a } = {}) {
		if ((super(), !a || a.nodeType !== 1))
			throw TypeError(`SingleCanvas: a container element`);
		let o = e(i, `SingleCanvas`);
		((this.#t = a), o.attach(`windows`, this, { beforeBoot: !0 }));
		let s = {};
		(o.devices(async (e) => {
			let { bareDesktop: t } = await n(
				async () => {
					let { bareDesktop: e } = await import(`./bare-desktop-BDFgF1Tp.mjs`);
					return { bareDesktop: e };
				},
				[],
				import.meta.url,
			);
			Object.assign(
				e,
				await e.rt.openWayland({
					wl: a,
					onDesktop: (e) => {
						((this.#e = t(e, a)),
							s.onDesktop?.(e, this.#e),
							(e.onwindowgone = () => this.dispatchEvent(new Event(`change`))));
						let n = e.onwindow;
						e.onwindow = (e) => {
							(n(e), this.dispatchEvent(new Event(`change`)));
						};
					},
					say: (t) => e.say(`${t}\n`),
				}),
			);
		}),
			r(o, s),
			(this[t] = { x: s, of: () => [], shutdown: () => this.#e?.stop() }));
	}
	get env() {
		return {
			XDG_RUNTIME_DIR: `/tmp`,
			WAYLAND_DISPLAY: `wayland-0`,
			DISPLAY: `:0`,
		};
	}
	resized() {
		this.#e?.resizeOutput(this.#t.clientWidth, this.#t.clientHeight);
	}
	describe() {
		return this.#e?.describe?.() ?? null;
	}
};
export { i as SingleCanvas };
