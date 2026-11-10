import { f as e } from "./internal-DhuCGrNL.mjs";
var t = e({
	assetFiles: () => a,
	assetUrl: () => i,
	pageParams: () => r,
	pageSearch: () => n,
});
function n() {
	return globalThis.GEX_PAGE_SEARCH ?? globalThis.location?.search ?? ``;
}
function r() {
	return new URLSearchParams(n());
}
function i(e) {
	let t = e.replace(/^\//, ``),
		n = globalThis.GEX_ASSET_FILES?.[t];
	if (n) return n;
	let r = globalThis.GEX_ASSET_BASE;
	return r
		? new URL(/* @vite-ignore */ /* webpackIgnore: true */ t, r).href
		: e;
}
function a(e) {
	let t = globalThis.GEX_ASSET_FILES;
	if (!t) return null;
	let n = e.replace(/^\//, ``),
		r = {};
	for (let [e, i] of Object.entries(t))
		e.startsWith(n) && (r[e.slice(n.length)] = i);
	return r;
}
export { t as a, n as i, i as n, r, a as t };
