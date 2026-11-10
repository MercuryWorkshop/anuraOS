import { t as e } from "./options-DQnMMog3.mjs";
function t(t, n = {}) {
	(e(t),
		(globalThis.GEX_ARCH = n.arch === `aarch64` ? `aarch64` : `x86`),
		t(`heartbeat`) && (globalThis.GEX_HEARTBEAT = Number(t(`heartbeat`))),
		(t(`mem64`) === `1` || n.mem64) && (globalThis.GEX_MEM64 = 1));
	let r = t(`fjit`);
	(r !== null && r !== `0` && (globalThis.GEX_FJIT = Number(r) || 1),
		t(`elfunits`) &&
			t(`cgen`) !== `0` &&
			(globalThis.GEX_ELF_UNITS = t(`elfunits`)),
		t(`pins`) && (globalThis.GEX_PINS = t(`pins`)),
		t(`dense`) === `0` && (globalThis.GEX_DENSE = 0),
		t(`dense`) === `2` && (globalThis.GEX_DENSE = 2));
	let i = t(`cgen`);
	(i &&
		i !== `0` &&
		(globalThis.GEX_CGEN =
			Number(i) |
			(t(`unguarded`) === `0` ? 0 : 4) |
			(t(`icallcount`) === `1` ? 16 : 0)),
		t(`cgenurl`) && (globalThis.GEX_CGEN_URL = t(`cgenurl`)),
		t(`cgenzst`) === `1` && (globalThis.GEX_CGEN_ZST = 1),
		t(`aot`) === `1` && (globalThis.GEX_NO_JIT = 1),
		t(`aot`) && (globalThis.GEX_AOT = 1),
		(globalThis.GEX_UNIT_CACHE =
			t(`unitcache`) === null ? 1 : Number(t(`unitcache`))));
}
export { t as setGlobals };
