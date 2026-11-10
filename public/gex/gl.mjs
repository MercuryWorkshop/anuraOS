import { s as e } from "./internal-DhuCGrNL.mjs";
var t = class extends EventTarget {
	#e = null;
	#t = null;
	constructor(t, { eager: n = !1, d3d: r = !1, source: i = null } = {}) {
		super();
		let a = e(t, `MesaGl`);
		(a.attach(`gl`, this, { beforeBoot: !0 }),
			a.devices(async (e) => {
				if (!e.compositor)
					throw Error(
						`MesaGl draws into the windows: make HostWindows, CompositorWindows or SingleCanvas too`,
					);
				((e.glChannel = await e.rt.openGlChannel(r)),
					(this.#e = e.rt.glStarter(
						e.compositor,
						e.glChannel,
						{
							dom: e.dom,
							source: i,
							...(a.preset.glBackend ? { backend: a.preset.glBackend } : {}),
						},
						e.term,
					)),
					n || e.rt.glOnFirstRequest(e.glChannel, this.#e));
			}, 1),
			a.afterBoot(() => {
				n && this.start();
			}));
	}
	start() {
		return this.#e
			? ((this.#t ??= Promise.resolve(this.#e()).then(
					(e) => {
						if (e == null)
							throw Error(globalThis.__gexGlError ?? `Mesa did not start`);
						return (
							this.dispatchEvent(
								Object.assign(new Event(`started`), { description: e }),
							),
							e
						);
					},
					(e) => {
						throw e;
					},
				)),
				this.#t.catch((e) =>
					this.dispatchEvent(Object.assign(new Event(`failed`), { error: e })),
				),
				this.#t)
			: Promise.reject(Error(`MesaGl: the system is not running`));
	}
};
export { t as MesaGl };
