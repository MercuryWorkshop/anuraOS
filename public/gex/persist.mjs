import { t as e } from "./internal-DhuCGrNL.mjs";
var t = Object.freeze([`/tmp`, `/proc`, `/sys`, `/dev`, `/run`]),
	n = 250,
	r = class extends EventTarget {
		#e;
		#t;
		#n;
		#r = [];
		#i = null;
		#a = !1;
		#o = [];
		#s = !1;
		#c = null;
		#l = { saves: 0, stored: 0, dropped: 0, bytes: 0, last: null, error: null };
		constructor(
			t,
			n,
			{ exclude: r = [], every: i = 3e4, quiet: a = 1e3 } = {},
		) {
			super();
			let o = t?.[e];
			if (!o?.persist)
				throw TypeError(`Persist takes a Filesystem as its first argument`);
			for (let e of [`load`, `store`])
				if (typeof n?.[e] != `function`)
					throw TypeError(`Persist: the store has no ${e}()`);
			((this.#e = t),
				(this.#t = n),
				(this.#n = { exclude: r.map(String), every: i, quiet: a }),
				(this[e] = {
					shutdown: async () => {
						(this.#p && !this.#s && (await this.save().catch(() => {})),
							this.#h());
					},
				}),
				o.persist(this, {
					load: () => this.#d(),
					startArgs: () => ({ known: this.#r, exclude: this.#u() }),
					running: (e) => this.#f(e),
					stop: () => this.#h(),
				}));
		}
		get stats() {
			return { ...this.#l };
		}
		#u() {
			return [...t, ...this.#n.exclude, ...this.#e.mounts().map((e) => e.path)];
		}
		async #d() {
			let e = [];
			try {
				e = (await this.#t.load()) ?? [];
			} catch (e) {
				((this.#l.error = String(e?.message ?? e)),
					console.warn(`[gex] persist: nothing restored: ${e?.message ?? e}`));
			}
			return ((this.#r = e.map((e) => [e.path, e.stamp])), e);
		}
		#f(e) {
			this.#p = e.changes();
			let t = this.#p,
				r = 0,
				i = 0;
			(this.#o.push(
				setInterval(() => {
					this.#s ||
						t.changed().then(
							(e) => {
								let t = performance.now();
								(e && ((i = t), (r ||= t)),
									r &&
										(t - i >= this.#n.quiet || t - r >= 5 * this.#n.quiet) &&
										((r = 0), this.save().catch(() => {})));
							},
							() => {},
						);
				}, n),
			),
				this.#o.push(
					setInterval(() => this.save().catch(() => {}), this.#n.every),
				),
				globalThis.document &&
					((this.#c = () => {
						document.hidden && this.save().catch(() => {});
					}),
					document.addEventListener(`visibilitychange`, this.#c),
					globalThis.addEventListener?.(`pagehide`, this.#c)));
		}
		#p = null;
		save() {
			return this.#p
				? this.#i
					? ((this.#a = !0), this.#i)
					: ((this.#i = (async () => {
							try {
								let e;
								do ((this.#a = !1), (e = await this.#m()));
								while (this.#a && !this.#s);
								return e;
							} finally {
								this.#i = null;
							}
						})()),
						this.#i)
				: Promise.reject(Error(`persist: the system is not running`));
		}
		async #m() {
			let { put: e, drop: t } = await this.#p.diff(this.#u()),
				n = 0;
			for (let t of e) n += t.data?.length ?? 0;
			if (e.length || t.length) {
				try {
					await this.#t.store({ put: e, drop: t });
				} catch (e) {
					throw (
						(this.#l.error = String(e?.message ?? e)),
						this.dispatchEvent(Object.assign(new Event(`error`), { error: e })),
						e
					);
				}
				this.#p.stored({ put: e.map((e) => [e.path, e.stamp]), drop: t });
			}
			let r = this.#l;
			(r.saves++,
				(r.stored += e.length),
				(r.dropped += t.length),
				(r.bytes += n),
				(r.last = Date.now()),
				(r.error = null));
			let i = { stored: e.length, dropped: t.length, bytes: n };
			return (
				(e.length || t.length) &&
					this.dispatchEvent(Object.assign(new Event(`stored`), i)),
				i
			);
		}
		async reset() {
			(this.#h(),
				await this.#i?.catch(() => {}),
				await this.#t.reset?.(),
				(this.#r = []));
		}
		#h() {
			this.#s = !0;
			for (let e of this.#o) clearInterval(e);
			((this.#o = []),
				this.#c &&
					(document.removeEventListener(`visibilitychange`, this.#c),
					globalThis.removeEventListener?.(`pagehide`, this.#c)));
		}
	};
export { t as ALWAYS_EXCLUDED, r as Persist };
