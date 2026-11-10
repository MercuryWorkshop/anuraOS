var e;
function t() {
	if (e === void 0) {
		e = null;
		try {
			typeof window < `u` &&
				window.location?.search &&
				(e = new URLSearchParams(window.location.search).get(`log`));
		} catch {}
	}
	return e;
}
function n() {
	let e = globalThis.GEX_LOG ?? {}.GEX_LOG ?? t();
	return e == null || e === `` || e === `0` ? null : String(e);
}
function r() {
	let e = n();
	return e === `off` || e === `none`;
}
function i() {
	let e = n();
	return e !== `quiet` && e !== `off` && e !== `none`;
}
function a(e) {
	let t = n();
	if (t === null || t === `off` || t === `none` || t === `quiet`) return !1;
	if (t === `1` || t === `all`) return !0;
	let r = t.split(`,`);
	return e === void 0 ? r.length > 0 : r.includes(e);
}
function o(e) {
	let t = n();
	return t !== null && t.split(`,`).includes(e);
}
export { i, a as n, r, o as t };
