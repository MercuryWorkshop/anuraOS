function e(e) {
	return 16 + 3 * ((e >>> 0) % 128);
}
function t(e, t) {
	let n = new Uint32Array(e.buffer, e.byteOffset + t, 8),
		r = n[4];
	if (r < 4) return 0;
	let i = t + 32 + n[1] + r;
	return new DataView(e.buffer, e.byteOffset).getUint32(i - 4, !0);
}
function n() {
	return {
		control: new SharedArrayBuffer(1600),
		data: new SharedArrayBuffer(67108896),
	};
}
function r(n, r) {
	let i = new Int32Array(r.control);
	Atomics.store(i, 5, 1);
	let a = { buffer: r.data },
		o = new Uint8Array(r.data),
		s = !0,
		c = null,
		l = function () {
			if (c) return c;
			if (Atomics.load(i, 0) !== 1) return;
			if (n.statsOn) {
				i[6] = 1;
				let e = new Float64Array(r.control, 32, 1)[0];
				n.noteBridge(
					e ? performance.timeOrigin + performance.now() - e : 0,
					Atomics.exchange(i, 7, 0),
					Atomics.exchange(i, 10, 0),
					Atomics.exchange(i, 11, 0),
					Atomics.exchange(i, 12, 0),
				);
			}
			let s = Atomics.load(i, 4) === 1,
				l = Atomics.load(i, 2) >>> 0,
				u = (n) => {
					if (!s) {
						((i[1] = n), Atomics.store(i, 0, 2), Atomics.notify(i, 0));
						return;
					}
					let r = e(l);
					((i[r] = l + 1),
						(i[r + 1] = n < 0 ? 0 : t(o, 0)),
						(i[r + 2] = +(n < 0)),
						(i[4] = 0),
						Atomics.store(i, 0, 0),
						Atomics.notify(i, 0),
						Atomics.store(i, 3, 0),
						Atomics.notify(i, 3));
				},
				d;
			try {
				d = n.submit(a, 0, l);
			} catch (e) {
				(console.error(`[gl] the device threw`, e), u(-1));
				return;
			}
			if (d instanceof Promise)
				return (
					(c = d
						.then(u, (e) => {
							(console.error(`[gl] the async device threw`, e), u(-1));
						})
						.finally(() => {
							c = null;
						})),
					c
				);
			u(d);
		};
	return (
		(l.stop = () => {
			((s = !1), Atomics.notify(i, 0));
		}),
		typeof Atomics.waitAsync == `function` &&
			((r.direct = !0),
			(async () => {
				for (; s; ) {
					let e = Atomics.load(i, 0);
					if (e === 1) {
						await l();
						continue;
					}
					let t = Atomics.waitAsync(i, 0, e, 1e3);
					t.async && (await t.value);
				}
			})()),
		l
	);
}
function i(e) {
	if (!e?.control) return;
	let t = new Int32Array(e.control);
	(Atomics.store(t, 5, -1), Atomics.notify(t, 0), Atomics.notify(t, 3));
}
export { i as failGlChannel, n as makeGlChannel, r as serveGl };
