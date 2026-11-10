import { s as e, u as t } from "./internal-DhuCGrNL.mjs";
var n = class extends EventTarget {
	#e = null;
	#t = !1;
	#n;
	constructor(n, { latency: i = `interactive` } = {}) {
		super();
		let a = e(n, `WebAudio`);
		a.attach(`audio`, this);
		let o = typeof AudioContext == `function` ? r(i) : null;
		((this.#n = new Promise((e, n) => {
			a.afterBoot(async (r) => {
				try {
					let n = (await a.kernel().r(`k_audio_ring`)) >>> 0;
					if (this.#t) return e(this);
					let { playAudio: s } = await t(
						async () => {
							let { playAudio: e } = await import(`./audio-BBRZ0m7J.mjs`);
							return { playAudio: e };
						},
						[],
						import.meta.url,
					);
					if (
						((this.#e = s({
							memory: r.kernel.memory,
							at: n,
							latency: i,
							context: o,
						})),
						!this.#e)
					)
						throw Error(
							`WebAudio: this browser has no AudioWorklet over shared memory`,
						);
					await this.#e.ready;
					let c = this.#e.ctx,
						l = () => {
							c.state === `running` && this.dispatchEvent(new Event(`running`));
						};
					(c.addEventListener(`statechange`, l), l(), e(this));
				} catch (e) {
					(o?.close().catch(() => {}), n(e));
				}
			});
		})),
			this.#n.catch(() => {}));
	}
	get ready() {
		return this.#n;
	}
	get context() {
		return this.#e?.ctx ?? null;
	}
	get stats() {
		return this.#e?.last ?? null;
	}
	async close() {
		((this.#t = !0), await this.#e?.close(), (this.#e = null));
	}
};
function r(e) {
	try {
		return new AudioContext({ latencyHint: e });
	} catch {
		try {
			return new AudioContext({ latencyHint: `interactive` });
		} catch {
			return null;
		}
	}
}
export { n as WebAudio };
