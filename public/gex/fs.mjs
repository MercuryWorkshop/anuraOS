import { a as e, s as t, t as n, u as r } from "./internal-DhuCGrNL.mjs";
var i = (e) => {
		if (typeof e != `string` || !e.startsWith(`/`))
			throw TypeError(`not an absolute guest path: ${e}`);
		let t = [];
		for (let n of e.split(`/`))
			!n || n === `.` || (n === `..` ? t.pop() : t.push(n));
		return `/${t.join(`/`)}`;
	},
	a = (e, t) => i(`${e}/${t}`),
	o = (e) =>
		e.length > 4 && e[0] === 40 && e[1] === 181 && e[2] === 47 && e[3] === 253;
async function s(t) {
	let n = await e(t, `tar`);
	if (!o(n)) return n;
	let { unzstd: i } = await r(
		async () => {
			let { unzstd: e } = await import(`./zfetch-KvlYIIp-.mjs`);
			return { unzstd: e };
		},
		[],
		import.meta.url,
	);
	return i(n);
}
async function c(t) {
	let n = t,
		r = globalThis.location?.href;
	if (
		((typeof t == `string` || t instanceof URL) &&
			((r = new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ t,
				globalThis.location?.href,
			).href),
			(n = JSON.parse(new TextDecoder().decode(await e(r, `lazy list`))))),
		!Array.isArray(n))
	) {
		if (n?.files) {
			let e = new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ n.base ?? `./`,
				r,
			);
			return n.files.map(([t, n, r, i]) => [
				t,
				n,
				new URL(/* @vite-ignore */ /* webpackIgnore: true */ r, e).href,
				i,
			]);
		}
		throw TypeError(`lazy: a list of [path, size, url] or its URL`);
	}
	return n.map(([e, t, n, i]) => [
		e,
		t,
		new URL(/* @vite-ignore */ /* webpackIgnore: true */ n, r).href,
		i,
	]);
}
function l(e) {
	let t = new URL(
		/* @vite-ignore */ /* webpackIgnore: true */ e,
		globalThis.location?.href,
	);
	if (t.protocol === `file:`) return decodeURIComponent(t.pathname);
	if (globalThis.location && t.origin !== globalThis.location.origin)
		throw Error(
			`lazy file ${e}: only the page's own origin can be read lazily`,
		);
	return t.pathname + t.search + t.hash;
}
var u = class extends EventTarget {
		#e;
		constructor(e, t, n) {
			(super(), (this.#e = e), (this.path = t), (this.provider = n));
		}
		unmount() {
			return this.#e.unmount(this.path);
		}
	},
	d = class extends EventTarget {
		#e;
		#t = [];
		#n = new Map();
		#r = null;
		constructor(e) {
			super();
			let r = t(e, `Filesystem`);
			(r.attach(`filesystem`, this, { beforeBoot: !0 }),
				(this.#e = r),
				r.beforeBoot((e) => this.#o(e)),
				(this[n] = {
					sources: () => this.#t,
					mounts: () => [...this.#n].map(([e, t]) => [e, t.id]),
					persist: (e, t) => {
						(r.attach(`persistence`, e, { beforeBoot: !0 }),
							(this.#r = t),
							r.afterBoot(() => t.running(r)));
					},
					persistArgs: () => this.#r?.startArgs() ?? null,
					addImage: (e) => this.#a(Promise.resolve({ image: !0, ...e })),
				}));
		}
		#i(e) {
			if (this.#e.phase !== `running`)
				throw Error(`${e}: the system is ${this.#e.phase}, not running`);
			return this.#e.files();
		}
		addTar(e, { at: t = `/`, lazy: n } = {}) {
			let r = (async () => {
				let r = n ? await c(n) : [];
				return {
					tar: e == null ? null : await s(e),
					at: i(t),
					lazy: r.map(([e, n, r, i]) => [a(t, e), n, l(r), i]),
				};
			})();
			return this.#a(r);
		}
		addFiles(t, { mode: n } = {}) {
			let r = (async () => {
				let r = {},
					a = {};
				for (let [o, s] of Object.entries(t))
					((r[i(o)] =
						typeof s == `string` ? new TextEncoder().encode(s) : await e(s, o)),
						n !== void 0 && (a[i(o)] = n));
				return { files: r, modes: a };
			})();
			return this.#a(r);
		}
		#a(e) {
			return this.#e.phase === `new` || this.#e.phase === `booting`
				? (this.#t.push(e), e.catch(() => {}), e.then(() => {}))
				: e
						.then((e) =>
							e.image
								? this.#i(`addTar`).layImage(e)
								: this.#i(`addTar`).lay(e),
						)
						.then(() => {});
		}
		async #o(e) {
			((e.layers = await Promise.all(this.#t)),
				(e.records = this.#r ? await this.#r.load() : []),
				(this.#t.length = 0));
		}
		#s() {
			return this.#e.pageFs();
		}
		mount(e, t) {
			let n = i(e);
			if (n === `/`) throw Error(`mount: the root is the system's own`);
			for (let e of [`stat`, `readdir`, `open`, `read`, `close`])
				if (typeof t?.[e] != `function`)
					throw TypeError(`mount: the provider has no ${e}()`);
			if (this.#n.has(n)) throw Error(`mount: ${n} is mounted already`);
			if (![`new`, `booting`, `running`].includes(this.#e.phase))
				throw Error(`mount: the system is ${this.#e.phase}`);
			let r = this.#s().add(t),
				a = new u(this, n, t);
			return (
				this.#n.set(n, { mount: a, id: r }),
				(a.ready =
					this.#e.phase === `running`
						? this.#e
								.files()
								.mount(n, r)
								.then(() => a)
						: Promise.resolve(a)),
				a
			);
		}
		async unmount(e) {
			let t = i(e),
				n = this.#n.get(t);
			if (!n)
				throw Object.assign(Error(`unmount: nothing mounted at ${t}`), {
					code: `EINVAL`,
				});
			(this.#n.delete(t),
				this.#e.phase === `running` && (await this.#e.files().unmount(t)),
				this.#s().remove(n.id),
				n.mount.dispatchEvent(new Event(`unmounted`)));
		}
		mounts() {
			return [...this.#n.values()].map((e) => e.mount);
		}
		async readFile(e, { encoding: t } = {}) {
			let n = await this.#i(`readFile`).readFile(i(e));
			return t ? new TextDecoder(t).decode(n) : n;
		}
		async writeFile(t, n, { mode: r, append: a, exclusive: o } = {}) {
			let s =
				typeof n == `string` ? new TextEncoder().encode(n) : await e(n, t);
			return this.#i(`writeFile`).writeFile(i(t), s, {
				mode: r,
				append: a,
				exclusive: o,
			});
		}
		stat(e, { follow: t = !0 } = {}) {
			return this.#i(`stat`).stat(i(e), t);
		}
		readdir(e) {
			return this.#i(`readdir`).readdir(i(e));
		}
		mkdir(e, { recursive: t = !1, mode: n = 493 } = {}) {
			return this.#i(`mkdir`).mkdir(i(e), { recursive: t, mode: n });
		}
		rm(e, { recursive: t = !1, force: n = !1 } = {}) {
			return this.#i(`rm`).rm(i(e), { recursive: t, force: n });
		}
		rename(e, t) {
			return this.#i(`rename`).rename(i(e), i(t));
		}
		symlink(e, t) {
			return this.#i(`symlink`).symlink(e, i(t));
		}
		readlink(e) {
			return this.#i(`readlink`).readlink(i(e));
		}
		chmod(e, t) {
			return this.#i(`chmod`).chmod(i(e), t);
		}
		watch(e, t) {
			let n = i(e),
				r = this.#e;
			this.#c ||
				((this.#c = new Map()),
				r.on(`watch`, (e) => {
					let t = this.#c.get(e.h);
					t &&
						(e.type === `gone` && this.#c.delete(e.h),
						t({
							type: e.type,
							path: e.name ? i(`${t.at}/${e.name}`) : t.at,
							...(e.cookie ? { cookie: e.cookie } : {}),
						}));
				}));
			let a = null,
				o = !1,
				s = Object.assign((e) => t(e), { at: n });
			return (
				this.#i(`watch`),
				r
					.programs()
					.addWatch(n)
					.then(
						(e) => {
							if (((a = e), o))
								return r
									.programs()
									.rmWatch(a)
									.catch(() => {});
							this.#c.set(a, s);
						},
						(e) => t({ type: `error`, path: n, error: e }),
					),
				() => {
					o ||
						((o = !0),
						a !== null &&
							this.#c.delete(a) &&
							r
								.programs()
								?.rmWatch(a)
								.catch(() => {}));
				}
			);
		}
		#c = null;
	};
export { d as Filesystem, u as Mount };
