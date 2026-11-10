//@ts-nocheck

async function bootgex() {
	const { System } = await import("/gex/index.mjs");
	const { Filesystem } = await import("/gex/fs.mjs");
	const { Wisp } = await import("/gex/net-wisp.mjs");
	const { HostWindows } = await import("/gex/windows-host.mjs");
	const { IdbPersist } = await import("/gex/persist-idb.mjs");
	window.gex = { System, Filesystem, Wisp, HostWindows };
	anura.gex = new GexBackend();

	const frogland = new FrogLandApp();
	anura.registerApp(frogland);
	await frogland.startup();
	await anura.gex.boot();
}

class GexBackend {
	sys = new gex.System({});
	fs = new gex.Filesystem(this.sys);
	wisp = new gex.Wisp(this.sys, { url: "wss://anura.pro" });
	windows = new gex.HostWindows(this.sys, {
		width: window.innerWidth,
		height: window.innerHeight,
	});
	persist = new IdbPersist(this.fs, { db: "anura-gex" });

	async boot() {
		this.fs.addTar("/debian-slim.tar.zst");
		console.log("booting gex");
		await this.sys.boot();
		console.log("gex booted");
	}
}
