import { n as e, r as t, s as n, u as r } from "./internal-DhuCGrNL.mjs";
var i = class {
		open = !1;
		onopen = null;
		onmessage = null;
		onclose = null;
		onerror = null;
		#e = null;
		#t = null;
		#n = [];
		#r = !1;
		constructor(e) {
			Promise.resolve(e).then(
				async ({ readable: e, writable: t }) => {
					if (this.#r) {
						(e?.cancel?.().catch(() => {}), t?.abort?.().catch(() => {}));
						return;
					}
					this.#e = t.getWriter();
					for (let e of this.#n.splice(0)) this.#e.write(e).catch(() => {});
					((this.open = !0), this.onopen?.(), (this.#t = e.getReader()));
					try {
						for (;;) {
							let { value: e, done: t } = await this.#t.read();
							if (t) break;
							e?.length &&
								this.onmessage?.(
									e instanceof Uint8Array ? e : new Uint8Array(e),
								);
						}
					} catch {}
					((this.#r = !0), this.onclose?.());
				},
				(e) => {
					((this.#r = !0), this.onerror?.(e));
				},
			);
		}
		send(e) {
			this.#r || (this.#e ? this.#e.write(e).catch(() => {}) : this.#n.push(e));
		}
		close() {
			this.#r ||
				((this.#r = !0),
				this.#e?.close().catch(() => {}),
				this.#t?.cancel().catch(() => {}));
		}
	},
	a = class a extends EventTarget {
		#e = null;
		constructor(t, i = {}) {
			super();
			let { connect: o } = i;
			if (new.target === a && typeof o != `function`)
				throw TypeError(`Network: { connect(host, port) }`);
			let s = n(t, `Network`);
			(s.attach(`network`, this),
				(this.#t = (async () => {
					let { WispNetwork: t } = await r(
							async () => {
								let { WispNetwork: e } = await import(`./net-RY1ircSr.mjs`);
								return { WispNetwork: e };
							},
							[],
							import.meta.url,
						),
						n = this[e](t, o);
					((this.#e = n), s.network(n));
					for (let e = 2e3, t = !1; ; e = Math.min(e * 2, 3e4))
						try {
							await n.start?.();
							return;
						} catch (n) {
							(t ||
								s.say(`gex: the network: ${n?.message ?? n}; trying again\n`),
								(t = !0),
								await new Promise((t) => setTimeout(t, e)));
						}
				})()));
		}
		#t;
		get ready() {
			return this.#t;
		}
		[e](e, n) {
			return new e(null, (e) => this[t](e), { dial: (e, t) => new i(n(e, t)) });
		}
		[t](e) {
			let t = /^connect (.*):(\d+)$/.exec(e);
			t
				? this.dispatchEvent(
						Object.assign(new Event(`connect`), {
							host: t[1],
							port: Number(t[2]),
						}),
					)
				: this.dispatchEvent(new Event(e));
		}
	};
export { a as Network };
