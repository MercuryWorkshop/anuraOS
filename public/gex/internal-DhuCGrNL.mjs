var e = Object.create,
	t = Object.defineProperty,
	n = Object.getOwnPropertyDescriptor,
	r = Object.getOwnPropertyNames,
	i = Object.getPrototypeOf,
	a = Object.prototype.hasOwnProperty,
	o = (e, t) => () => (
		t || (e((t = { exports: {} }).exports, t), (e = null)),
		t.exports
	),
	s = (e, n) => {
		let r = {};
		for (var i in e) t(r, i, { get: e[i], enumerable: !0 });
		return (n || t(r, Symbol.toStringTag, { value: `Module` }), r);
	},
	c = (e, i, o, s) => {
		if ((i && typeof i == `object`) || typeof i == `function`)
			for (var c = r(i), l = 0, u = c.length, d; l < u; l++)
				((d = c[l]),
					!a.call(e, d) &&
						d !== o &&
						t(e, d, {
							get: ((e) => i[e]).bind(null, d),
							enumerable: !(s = n(i, d)) || s.enumerable,
						}));
		return e;
	},
	l = (n, r, o) => (
		(o = n == null ? {} : e(i(n))),
		c(
			r || !n || !n.__esModule || !a.call(n, `default`)
				? t(o, `default`, { value: n, enumerable: !0 })
				: o,
			n,
		)
	),
	u = (function () {
		let e = typeof document < `u` && document.createElement(`link`).relList;
		return e && e.supports && e.supports(`modulepreload`)
			? `modulepreload`
			: `preload`;
	})(),
	d = function (e, t) {
		return new URL(/* @vite-ignore */ /* webpackIgnore: true */ e, t).href;
	},
	f = {},
	p = function (e, t, n) {
		let r = Promise.resolve();
		if (t && t.length > 0) {
			let e = document.getElementsByTagName(`link`),
				i = document.querySelector(`meta[property=csp-nonce]`),
				a = i?.nonce || i?.getAttribute(`nonce`);
			function o(e) {
				return Promise.all(
					e.map((e) =>
						Promise.resolve(e).then(
							(e) => ({ status: `fulfilled`, value: e }),
							(e) => ({ status: `rejected`, reason: e }),
						),
					),
				);
			}
			function s(e) {
				return import.meta.resolve
					? import.meta.resolve(e)
					: new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ e,
							import.meta.url,
						).href;
			}
			r = o(
				t.map((t) => {
					if (((t = d(t, n)), (t = s(t)), t in f)) return;
					f[t] = !0;
					let r = t.endsWith(`.css`);
					for (let n = e.length - 1; n >= 0; n--) {
						let i = e[n];
						if (i.href === t && (!r || i.rel === `stylesheet`)) return;
					}
					let i = document.createElement(`link`);
					if (
						((i.rel = r ? `stylesheet` : u),
						r || (i.as = `script`),
						(i.crossOrigin = ``),
						(i.href = t),
						a && i.setAttribute(`nonce`, a),
						document.head.appendChild(i),
						r)
					)
						return new Promise((e, n) => {
							(i.addEventListener(`load`, e),
								i.addEventListener(`error`, () =>
									n(Error(`Unable to preload CSS for ${t}`)),
								));
						});
				}),
			);
		}
		function i(e) {
			let t = new Event(`vite:preloadError`, { cancelable: !0 });
			if (((t.payload = e), window.dispatchEvent(t), !t.defaultPrevented))
				throw e;
		}
		return r.then((t) => {
			for (let e of t || []) e.status === `rejected` && i(e.reason);
			return e().catch(i);
		});
	},
	m = Symbol.for(`gex.runtime.internal`),
	h = Symbol(`gex.runtime.net.backend`),
	g = Symbol(`gex.runtime.net.event`);
function _(e, t) {
	let n = e?.[m];
	if (!n) throw TypeError(`${t} takes a System as its first argument`);
	return n;
}
var v = Object.freeze({
	SIGHUP: 1,
	SIGINT: 2,
	SIGQUIT: 3,
	SIGILL: 4,
	SIGTRAP: 5,
	SIGABRT: 6,
	SIGBUS: 7,
	SIGFPE: 8,
	SIGKILL: 9,
	SIGUSR1: 10,
	SIGSEGV: 11,
	SIGUSR2: 12,
	SIGPIPE: 13,
	SIGALRM: 14,
	SIGTERM: 15,
	SIGCHLD: 17,
	SIGCONT: 18,
	SIGSTOP: 19,
	SIGTSTP: 20,
	SIGTTIN: 21,
	SIGTTOU: 22,
	SIGWINCH: 28,
});
function y(e) {
	if (typeof e == `number` && Number.isInteger(e) && e >= 0 && e < 65) return e;
	let t =
		v[
			String(e)
				.toUpperCase()
				.replace(/^(?!SIG)/, `SIG`)
		];
	if (t === void 0) throw TypeError(`no signal ${e}`);
	return t;
}
function b(e) {
	return Object.keys(v).find((t) => v[t] === e) ?? `SIG${e}`;
}
function x(e) {
	return e
		? Array.isArray(e)
			? e.map(String)
			: Object.entries(e).map(([e, t]) => `${e}=${t}`)
		: [];
}
async function S(e, t = `source`) {
	if (e instanceof Uint8Array) return e;
	if (
		e instanceof ArrayBuffer ||
		(typeof SharedArrayBuffer == `function` && e instanceof SharedArrayBuffer)
	)
		return new Uint8Array(e);
	if (ArrayBuffer.isView(e))
		return new Uint8Array(e.buffer, e.byteOffset, e.byteLength);
	if (
		(typeof Blob == `function` && e instanceof Blob) ||
		(typeof Response == `function` && e instanceof Response)
	)
		return new Uint8Array(await e.arrayBuffer());
	if (typeof ReadableStream == `function` && e instanceof ReadableStream)
		return new Uint8Array(await new Response(e).arrayBuffer());
	if (e instanceof URL || typeof e == `string`) {
		if (String(e).startsWith(`file:`) && globalThis.process?.versions?.node) {
			let { readFile: t } = await p(
				async () => {
					let { readFile: e } = await import(
						`./__vite-browser-external-6NL05v10.mjs`
					).then((e) => l(e.default, 1));
					return { readFile: e };
				},
				[],
				import.meta.url,
			);
			return new Uint8Array(
				await t(new URL(/* @vite-ignore */ /* webpackIgnore: true */ e)),
			);
		}
		let n = await fetch(e);
		if (!n.ok) throw Error(`${t} ${e}: ${n.status} ${n.statusText}`);
		return new Uint8Array(await n.arrayBuffer());
	}
	throw TypeError(`${t}: not bytes, a Blob, a stream or a URL`);
}
export {
	S as a,
	b as c,
	o as d,
	s as f,
	v as i,
	y as l,
	h as n,
	x as o,
	l as p,
	g as r,
	_ as s,
	m as t,
	p as u,
};
