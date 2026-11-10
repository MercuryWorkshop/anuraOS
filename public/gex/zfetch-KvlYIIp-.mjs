import { u as e } from "./internal-DhuCGrNL.mjs";
var t = null;
async function n() {
	return (
		(t ||= (async () => {
			let { ZSTDDecoder: t } = await e(
					async () => {
						let { ZSTDDecoder: e } = await import(
							`./zstddec-stream-wg9AJ-0L.mjs`
						);
						return { ZSTDDecoder: e };
					},
					[],
					import.meta.url,
				),
				n = new t();
			return (await n.init(), n);
		})()),
		t
	);
}
function r(e) {
	return (
		e.length > 4 && e[0] === 40 && e[1] === 181 && e[2] === 47 && e[3] === 253
	);
}
async function i(e) {
	return (await n()).decode(e);
}
export { r as isZstd, i as unzstd };
