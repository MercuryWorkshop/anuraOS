import { t as e } from "./internal-DhuCGrNL.mjs";
import { t } from "./system--8wfZh3X.mjs";
import { Filesystem as n } from "./fs.mjs";
import { SingleCanvas as ee } from "./windows-single.mjs";
import { CompositorWindows as te } from "./windows-compositor.mjs";
import { MesaGl as ne } from "./gl.mjs";
import { r } from "./page-env-BH7IngaK.mjs";
import { audioFrom as re, guestArch as ie } from "./runtime-D-GJDdJD.mjs";
var i = [
		`PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin`,
		`HOME=/root`,
	],
	a = (e) => Object.fromEntries(Object.entries(e).filter(([, e]) => e != null));
async function o(
	o,
	{
		elf: s,
		args: c,
		files: l = {},
		dirs: ae = [],
		modes: oe = {},
		hard: u = {},
		symlinks: d = {},
		lazy: f = [],
		mtimes: p,
		xattrs: se,
		env: m = [],
		cwd: ce = `/`,
		uid: h,
		tty: g = !0,
		wl: _ = null,
		wlScale: v = 1,
		onDesktop: y = null,
		hostX: le = !1,
		gl: b = null,
		glLazy: ue = !1,
		glSource: de = null,
		glBackend: x,
		d3d: fe = !1,
		network: S = null,
		onNetEvent: C = null,
		playAudio: w = !0,
		onFilesLoaded: T = null,
		onSystem: E = null,
		closure: D = null,
		closureBuildNumbered: O,
		fill: k,
		lazyCache: A,
		restBundle: j,
		identities: M,
		stateful: N,
		providerSources: P,
		preModules: F,
		lateUnits: I,
		heartbeat: L,
		recompileObjects: R,
		link: z,
		pageFs: pe,
		transfer: me,
		wlInput: he,
		...B
	},
) {
	let V = Object.keys(B);
	if (V.length) throw TypeError(`runProgram: no option ${V.join(`, `)}`);
	if (!Array.isArray(c) || !c.length)
		throw TypeError(`runProgram: args, the program's argv`);
	if (b && b !== `compositor`)
		throw TypeError(
			`runProgram: gl is 'compositor' (the windows' Mesa) or nothing`,
		);
	let H = c[0],
		U =
			l[H] !== void 0 ||
			u[H] !== void 0 ||
			((e) => {
				let t = ``;
				for (let n of e.split(`/`).filter(Boolean))
					if (((t += `/${n}`), d[t] !== void 0)) return !0;
				return !1;
			})(H);
	if (!s && !U) throw Error(`runProgram: no ${H} in the files`);
	let W = r(),
		G = new t({
			baseUrl:
				globalThis.GEX_ASSET_BASE ??
				(globalThis.location
					? new URL(`/`, globalThis.location.href).href
					: void 0),
			xcache: !!W.get(`xcache`) && W.get(`xcache`) !== `0`,
			debug: { ...Object.fromEntries(W), arch: ie() },
		}),
		K = G[e];
	((K.preset.loud = !0),
		Object.assign(
			K.preset.host,
			a({
				closure: D,
				closureBuildNumbered: O,
				fill: k,
				lazyCache: A,
				restBundle: j,
				identities: M,
				stateful: N,
				providerSources: P,
				preModules: F,
				lateUnits: I,
				heartbeat: L,
				recompileObjects: R,
				link: z,
				uid: h,
			}),
		),
		Object.assign(
			K.preset.exec,
			a({ recompileObjects: R, heartbeat: L, link: z, pins: D?.pins }),
		),
		x && (K.preset.glBackend = x),
		w &&
			K.preset.onMessage.push((e) => {
				e.kind === `audio` && re(e);
			}),
		C &&
			K.preset.onMessage.push((e) => {
				e.kind === `net` && C(e.event);
			}));
	let ge = new n(G),
		q = { ...l },
		J = { ...oe };
	(U || ((q[H] = s), (J[H] ??= 493)),
		ge[e].addImage({
			files: q,
			modes: J,
			dirs: ae,
			lazy: f,
			hard: u,
			symlinks: d,
			mtimes: p,
			xattrs: se,
		}));
	let Y = null;
	(_ && typeof _.getContext == `function`
		? (Y = new te(G, { canvas: _, scale: v }))
		: _ &&
			((Y = new ee(G, { container: _ })),
			(Y[e].x.onDesktop = (e, t) => {
				((globalThis.__gexCompositor = t), y?.(e));
			})),
		Y && (Y[e].x.rootful = le === `rootful`));
	let X = b && Y ? new ne(G, { eager: !ue, d3d: fe, source: de }) : null;
	(S && K.network(S), await G.boot());
	for (let e of Object.keys(q)) delete q[e];
	T?.();
	let Z = K.sys();
	E?.({
		system: G,
		host: Z.host,
		kernel: Z.kernel,
		compositor: Z.compositor,
		wlChannel: Z.wlChannel,
		startGl: X ? () => X.start() : null,
	});
	let _e = g ? { cols: o.cols ?? 80, rows: o.rows ?? 24 } : void 0,
		Q = G.spawn(
			c,
			a({ env: m.length ? m : i, cwd: ce, uid: h, gid: h, pty: _e }),
		),
		$ = [];
	if (Q.pty)
		(Q.pty.addEventListener(`data`, (e) => o.write(e.data)),
			$.push(o.onData((e) => Q.pty.write(e))),
			$.push(o.onResize?.(({ rows: e, cols: t }) => Q.pty.resize(t, e))));
	else {
		let e = async (e) => {
			for (let t = e.getReader(); ; ) {
				let { value: e, done: n } = await t.read();
				if (n) return;
				o.write(e);
			}
		};
		(e(Q.stdout).catch(() => {}), e(Q.stderr).catch(() => {}));
		let t = Q.stdin.getWriter(),
			n = new TextEncoder();
		$.push(
			o.onData((e) => {
				t.write(typeof e == `string` ? n.encode(e) : e).catch(() => {});
			}),
		);
	}
	o.focus?.();
	try {
		let { code: t } = await Q.exited;
		return (
			await Promise.race([
				Q[e].drained(),
				new Promise((e) => setTimeout(e, 1e3)),
			]),
			{ status: t, host: Z.host, system: G }
		);
	} finally {
		for (let e of $) e?.dispose?.();
		await G.shutdown();
	}
}
export { o as runPreset };
