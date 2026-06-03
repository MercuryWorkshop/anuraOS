/* global Comlink, LocalFS, AFSShell, idbKeyval */

var cacheenabled;

const callbacks = {};
const filepickerCallbacks = {};

addEventListener("message", async (event) => {
	if (event.data.anura_target === "anura.x86.proxy") {
		let callback = callbacks[event.data.id];
		callback(event.data.value);
	}
	if (event.data.anura_target === "anura.cache") {
		cacheenabled = event.data.value;
		idbKeyval.set("cacheenabled", event.data.value);
	}
	if (event.data.anura_target === "anura.bootFromOPFS") {
		if (event.data.value) {
			opfs = await LocalFS.newRootOPFS();
			globalThis.anura = { fs: opfs }; // Stupid thing for AFSShell compat
			opfssh = new AFSShell();
		} else {
			opfs = undefined;
			opfssh = undefined;
		}
	}
	if (event.data.anura_target === "anura.filepicker.result") {
		let callback = filepickerCallbacks[event.data.id];
		callback(event.data.value);
	}
	if (event.data.anura_target === "anura.comlink.init") {
		self.swShared = Comlink.wrap(event.data.value);
		swShared.test.then(console.log);
		self.isConnected = swShared.test;
	}
	if (event.data.anura_target === "anura.nohost.set") {
		self.anurafs = swShared.anura.fs;
		self.anurash = swShared.sh;
	}
});
