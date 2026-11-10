import { Persist as e } from "./persist.mjs";
var t = `nodes`;
function n(e) {
	return new Promise((t, n) => {
		((e.onsuccess = () => t(e.result)), (e.onerror = () => n(e.error)));
	});
}
function r(e) {
	return new Promise((t, n) => {
		((e.oncomplete = () => t()),
			(e.onerror = () => n(e.error)),
			(e.onabort = () =>
				n(e.error ?? Error(`IndexedDB: the transaction was aborted`))));
	});
}
var i = class {
		#e;
		#t = null;
		constructor(e) {
			if (typeof indexedDB > `u`)
				throw Error(`IdbPersist: this page has no IndexedDB`);
			this.#e = String(e);
		}
		#n() {
			if (this.#t) return this.#t;
			let e = indexedDB.open(this.#e, 1);
			return (
				(e.onupgradeneeded = () => {
					e.result.objectStoreNames.contains(t) ||
						e.result.createObjectStore(t, { keyPath: `path` });
				}),
				(this.#t = n(e).then(
					(e) => (
						(e.onversionchange = () => {
							(e.close(), (this.#t = null));
						}),
						e
					),
				)),
				this.#t
			);
		}
		async load() {
			return n(
				(await this.#n()).transaction(t, `readonly`).objectStore(t).getAll(),
			);
		}
		async store({ put: e = [], drop: n = [] }) {
			let i = (await this.#n()).transaction(t, `readwrite`),
				a = i.objectStore(t);
			for (let e of n) a.delete(e);
			for (let t of e) a.put(t);
			await r(i);
		}
		async reset() {
			((await this.#t?.catch(() => null))?.close(),
				(this.#t = null),
				await n(indexedDB.deleteDatabase(this.#e)));
		}
	},
	a = class extends e {
		constructor(e, { db: t, ...n } = {}) {
			if (!t) throw TypeError(`IdbPersist: name its database ({ db })`);
			super(e, new i(t), n);
		}
	};
export { a as IdbPersist, i as IdbStore };
