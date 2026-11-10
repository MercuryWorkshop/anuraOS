let e = null;
self.onmessage = async ({ data: { id: t, url: n, zstd: r } }) => {
	try {
		e ??= import(/* @vite-ignore */ /* webpackIgnore: true */ r).then(
			async ({ ZSTDDecoder: e }) => {
				let t = new e();
				return (await t.init(), t);
			},
		);
		let i = await e,
			a = await fetch(n),
			o = a.status === 404 && n.endsWith(`.zst`);
		if ((o && (a = await fetch(n.slice(0, -4))), !a.ok))
			throw Error(`${n}: ${a.status}`);
		let s = new Uint8Array(await a.arrayBuffer()),
			c = o ? s : i.decode(s);
		self.postMessage({ id: t, mod: await WebAssembly.compile(c) });
	} catch (e) {
		self.postMessage({ id: t, error: String(e?.message ?? e) });
	}
};
