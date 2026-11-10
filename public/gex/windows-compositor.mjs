import { s as e, t } from "./internal-DhuCGrNL.mjs";
import { t as n } from "./x11-5DB5tmr-.mjs";
var r = class extends EventTarget {
	#e = null;
	constructor(r, { canvas: i, scale: a } = {}) {
		if ((super(), typeof i?.getContext != `function`))
			throw TypeError(`CompositorWindows: a canvas`);
		let o = e(r, `CompositorWindows`);
		(o.attach(`windows`, this, { beforeBoot: !0 }),
			o.devices(async (e) => {
				let t = Math.max(1, Math.round(a ?? globalThis.devicePixelRatio ?? 1));
				(Object.assign(
					e,
					await e.rt.openWayland({
						wl: i,
						wlScale: t,
						say: (t) => e.say(`${t}\n`),
					}),
				),
					(this.#e = e.compositor));
			}));
		let s = {};
		(n(o, s),
			(this[t] = { x: s, of: () => [], shutdown: () => this.#e?.stop() }));
	}
	get env() {
		return {
			XDG_RUNTIME_DIR: `/tmp`,
			WAYLAND_DISPLAY: `wayland-0`,
			DISPLAY: `:0`,
		};
	}
	resize(e, t) {
		this.#e?.resize(e, t);
	}
	describe() {
		return this.#e?.describe() ?? Promise.resolve(null);
	}
};
export { r as CompositorWindows };
