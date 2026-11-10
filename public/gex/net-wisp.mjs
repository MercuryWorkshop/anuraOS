import { n as e, r as t } from "./internal-DhuCGrNL.mjs";
import { Network as n } from "./net.mjs";
var r = `wss://anura.pro/`,
	i = class extends n {
		constructor(e, { url: t = r } = {}) {
			(super(e, { url: String(t) }), (this.#e = String(t)));
		}
		#e;
		get url() {
			return this.#e;
		}
		[e](e) {
			return new e(this.url, (e) => this[t](e));
		}
	};
export { r as DEFAULT_WISP, i as Wisp };
