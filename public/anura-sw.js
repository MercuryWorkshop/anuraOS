/* global workbox */

// was a workaround for a firefox quirk where crossOriginIsolated
// is not reported properly in a service worker, now its just assumed for
// compatibility with UV
Object.defineProperty(globalThis, "crossOriginIsolated", {
	value: true,
	writable: false,
});

// Due to anura's filesystem only being available once an anura instance is running,
// we need a temporary filesystem to store files that are requested for caching.
// As the anura filesystem is a wrapper around Filer, we can use default Filer here.
importScripts("/libs/filer/filer.min.js");

// Importing mime
importScripts("/libs/mime/mime.iife.js");
importScripts("/lib/api/Filesystem.js");
importScripts("/lib/api/LocalFS.js");
importScripts("/libs/idb-keyval/idb-keyval.js");
importScripts("/libs/comlink/comlink.min.umd.js");
importScripts("/libs/workbox/workbox-v7.4.0/workbox-sw.js");

/* global workbox */

workbox.setConfig({
	debug: false,
	modulePathPrefix: "/libs/workbox/workbox-v7.4.0",
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();

importScripts("/sw/consts.js", "/sw/messages.js", "/sw/fs.js");
importScripts(
	"/sw/routes/fs.js",
	"/sw/routes/display.js",
	"/sw/routes/dav.js",
	"/sw/routes/filepicker.js",
	"/sw/routes/proxy.js",
	"/sw/routes/main.js",
);

(async () => {
	for (const client of await self.clients.matchAll()) {
		client.postMessage({
			anura_target: "anura.sw.reinit",
		});
	}
})();
