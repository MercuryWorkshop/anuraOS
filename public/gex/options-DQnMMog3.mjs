var e = [
	[
		`trapStack`,
		`GEX_TRAP_STACK`,
		`trapstack`,
		`GEX_TRAP_STACK`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`doorStats`,
		`GEX_DOOR_STATS`,
		`doorstats`,
		`GEX_DOOR_STATS`,
		`numor1`,
		`extra`,
		!0,
	],
	[
		`fcacheStats`,
		`GEX_FCACHE_STATS`,
		`fcachestats`,
		`GEX_FCACHE_STATS`,
		`flag`,
		`extra`,
		!1,
	],
	[`exitTrace`, `GEX_EXIT_TRACE`, `exittrace`, null, `flag`, `extra`, !1],
	[
		`calloutTrace`,
		`GEX_CALLOUT_TRACE`,
		`callouttrace`,
		`GEX_CALLOUT_TRACE`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`strayTrap`,
		`GEX_STRAY_TRAP`,
		`straytrap`,
		`GEX_STRAY_TRAP`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`wine32Split`,
		`GEX_WINE32_SPLIT`,
		`winesplit`,
		`GEX_WINE32_SPLIT`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`nullGuard`,
		`GEX_NULL_GUARD`,
		`nullguard`,
		`GEX_NULL_GUARD`,
		`one`,
		`extra`,
		!0,
	],
	[`mxcsr`, `GEX_MXCSR`, `mxcsr`, `GEX_MXCSR`, `one`, `extra`, !0],
	[
		`pinRegion`,
		`GEX_PIN_REGION`,
		`pinregion`,
		`GEX_PIN_REGION`,
		`num`,
		`extra`,
		!0,
	],
	[
		`sehReport`,
		`GEX_SEH_REPORT`,
		`sehreport`,
		`GEX_SEH_REPORT`,
		`one`,
		`extra`,
		!0,
	],
	[`timeScale`, `GEX_TIME_SCALE`, `timescale`, null, `num`, `extra`, !0],
	[`fixedTime`, `GEX_FIXED_TIME`, `fixedtime`, null, `num`, `extra`, !0],
	[`forkSkip`, `GEX_FORK_SKIP_MIB`, `forkskip`, null, `num0`, `extra`, !0],
	[
		`adoptAfter`,
		`GEX_ADOPT_AFTER`,
		`adopt`,
		`GEX_ADOPT_AFTER`,
		`num0`,
		`extra`,
		!0,
	],
	[
		`adoptTrace`,
		`GEX_ADOPT_TRACE`,
		`adopttrace`,
		`GEX_ADOPT_TRACE`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`attachTrace`,
		`GEX_ATTACH_TRACE`,
		`attachtrace`,
		`GEX_ATTACH_TRACE`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`denseDebug`,
		`GEX_DENSE_DEBUG`,
		`densedebug`,
		`GEX_DENSE_DEBUG`,
		`flag`,
		`extra`,
		!0,
	],
	[
		`traceMisses`,
		`GEX_TRACE_MISSES`,
		`tracemisses`,
		`GEX_TRACE_MISSES`,
		`flag`,
		`extra`,
		!1,
	],
	[`liftMax`, `GEX_LIFT_MAX`, `liftmax`, `GEX_LIFT_MAX`, `num`, `extra`, !1],
	[
		`inlineDispatch`,
		`GEX_INLINE_DISPATCH`,
		`inlinedispatch`,
		`GEX_INLINE_DISPATCH`,
		`num`,
		`extra`,
		!1,
	],
	[
		`xlateReport`,
		`GEX_XLATE_REPORT`,
		`xlatereport`,
		`GEX_XLATE_REPORT`,
		`num`,
		`extra`,
		!1,
	],
	[`t1Fold`, `GEX_T1_FOLD`, `t1fold`, `GEX_T1_FOLD`, `num`, `extra`, !1],
	[
		`wasmDlls`,
		`GEX_WASM_DLLS`,
		`wasmdlls`,
		`GEX_WASM_DLLS`,
		`str`,
		`extra`,
		!1,
	],
	[
		`providerSkip`,
		`GEX_PROVIDER_SKIP`,
		`provskip`,
		`GEX_PROVIDER_SKIP`,
		`str`,
		`extra`,
		!1,
	],
	[`fjitLibs`, `GEX_FJIT_LIBS`, `fjitlibs`, null, `str`, `extra`, !1],
	[`strace`, `GEX_STRACE`, `strace`, null, `flag`, `opts`, !1],
	[
		`stracePid`,
		`GEX_STRACE_PID`,
		`stracepid`,
		`GEX_STRACE_PID`,
		`num`,
		`opts`,
		!1,
	],
	[`straceExe`, `GEX_STRACE_EXE`, `straceexe`, null, `str`, `opts`, !1],
];
function t(e, t) {
	if (t != null)
		switch (e) {
			case `flag`:
				return t === `` ? void 0 : 1;
			case `one`:
				return t === `1` ? 1 : void 0;
			case `num`:
			case `num0`:
				return Number(t);
			case `numor1`:
				return Number(t) || 1;
			default:
				return t === `` ? void 0 : String(t);
		}
}
function n(e, t) {
	return e === `num0`
		? typeof t == `number`
			? t
			: void 0
		: e === `flag` || e === `one`
			? t
				? 1
				: void 0
			: t || void 0;
}
function r(n) {
	for (let [, r, i, , a] of e) {
		let e = t(a, n(i));
		e !== void 0 && (globalThis[r] = e);
	}
}
function i(t) {
	let r = {};
	for (let [i, a, , , o, s] of e) {
		if (s !== t) continue;
		let e = n(o, globalThis[a]);
		e !== void 0 && (r[i] = e);
	}
	return r;
}
export { i as n, r as t };
