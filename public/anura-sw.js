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
// self.fs = new Filer.FileSystem({
//     name: "anura-mainContext",
//     provider: new Filer.FileSystem.providers.IndexedDB(),
// });

const filerfs = new Filer.FileSystem({
	name: "anura-mainContext",
	provider: new Filer.FileSystem.providers.IndexedDB(),
});
const filersh = new filerfs.Shell();

let opfs = undefined;
let opfssh = undefined;

const bootStrapFSReady = new Promise((res, rej) => {
	console.log(globalThis);
	globalThis.idbKeyval
		.get("bootFromOPFS")
		.then(async (res) => {
			if (res) {
				opfs = await LocalFS.newRootOPFS();
				globalThis.anura = { fs: opfs }; // Stupid thing for AFSShell compat
				opfssh = new AFSShell();
			}
			res(true);
		})
		.catch((e) => {
			res(true);
		});
});

async function currentFs() {
	await bootStrapFSReady;
	// isConnected will return true if the anura instance is running, and otherwise infinitely wait.
	// it will never return false, but it may hang indefinitely if the anura instance is not running.
	// here, we race the isConnected promise with a timeout to prevent hanging indefinitely.

	if (!self.isConnected) {
		// An anura instance has not been started yet to populate the isConnected promise.
		// We automatically know that the filesystem is not connected.
		return {
			fs: opfs || filerfs,
			sh: opfssh || filersh,
		};
	}

	const CONN_TIMEOUT = 1000;
	const winner = await Promise.race([
		new Promise((resolve) =>
			setTimeout(() => {
				resolve({
					fs: opfs || filerfs,
					sh: opfssh || filersh,
					fallback: true,
				});
			}, CONN_TIMEOUT),
		),
		self.isConnected.then(() => ({
			fs: self.anurafs,
			sh: self.anurash,
		})),
	]);

	if (winner.fallback) {
		console.debug("Falling back to Filer");
		// unset isConnected so that we don't hold up future requests
		self.isConnected = undefined;
	}

	return winner;
}

self.Buffer = Filer.Buffer;

importScripts("/libs/comlink/comlink.min.umd.js");

importScripts("/libs/workbox/workbox-v7.3.0/workbox-sw.js");
workbox.setConfig({
	debug: false,
	modulePathPrefix: "/libs/workbox/workbox-v7.3.0",
});

const supportedWebDAVMethods = [
	"OPTIONS",
	"PROPFIND",
	"PROPPATCH",
	"MKCOL",
	"GET",
	"HEAD",
	"POST", // sometimes used for special operations
	"PUT",
	"DELETE",
	"COPY",
	"MOVE",
	"LOCK",
	"UNLOCK",
];

async function handleDavRequest({ request, url }) {
	const fsCallback = (await currentFs()).fs;
	const fs = fsCallback.promises;
	const shell = await new fsCallback.Shell();
	const method = request.method;
	const path = decodeURIComponent(url.pathname.replace(/^\/dav/, "") || "/");

	const getBuffer = async () => new Uint8Array(await request.arrayBuffer());
	const getDestPath = () =>
		decodeURIComponent(
			new URL(request.headers.get("Destination"), url).pathname.replace(
				/^\/dav/,
				"",
			),
		);

	try {
		switch (method) {
			case "OPTIONS":
				return new Response(null, {
					status: 204,
					headers: {
						Allow:
							"OPTIONS, PROPFIND, PROPPATCH, MKCOL, GET, HEAD, POST, PUT, DELETE, COPY, MOVE, LOCK, UNLOCK",
						DAV: "1, 2",
					},
				});

			case "PROPFIND": {
				try {
					const stats = await fs.stat(path);
					const isDirectory = stats.type === "DIRECTORY";
					const href = url.pathname;
					let responses = "";

					const renderEntry = async (entryPath, stat) => {
						const isDir = stat.type === "DIRECTORY";
						const contentLength = isDir
							? ""
							: `<a:getcontentlength b:dt="int">${stat.size}</a:getcontentlength>`;
						const contentType = isDir
							? ""
							: `<a:getcontenttype>${mime.default.getType(entryPath) || "application/octet-stream"}</a:getcontenttype>`;
						const creationDate = new Date(stat.ctime).toISOString();
						const lastModified = new Date(stat.mtime).toUTCString();
						const resourcetype = isDir ? "<a:collection/>" : "";

						return `
							<a:response>
								<a:href>${entryPath}</a:href>
								<a:propstat>
									<a:status>HTTP/1.1 200 OK</a:status>
									<a:prop>
										<a:resourcetype>${resourcetype}</a:resourcetype>
										${contentLength}
										${contentType}
										<a:creationdate>${creationDate}</a:creationdate>
										<a:getlastmodified>${lastModified}</a:getlastmodified>
									</a:prop>
								</a:propstat>
							</a:response>
						`;
					};

					if (isDirectory) {
						responses = await renderEntry(
							href.endsWith("/") ? href : href + "/",
							stats,
						);

						const files = await fs.readdir(path);
						const fileResponses = await Promise.all(
							files.map(async (file) => {
								const fullPath = path.endsWith("/")
									? path + file
									: `${path}/${file}`;
								const stat = await fs.stat(fullPath);
								const entryHref = `${href.endsWith("/") ? href : href + "/"}${file}`;
								return renderEntry(entryHref, stat);
							}),
						);
						responses += fileResponses.join("");
					} else {
						responses = await renderEntry(href, stats);
					}

					const xml = `
						<?xml version="1.0"?>
						<a:multistatus xmlns:a="DAV:" xmlns:b="urn:uuid:c2f41010-65b3-11d1-a29f-00aa00c14882/">
							${responses}
						</a:multistatus>
					`.trim();

					return new Response(xml, {
						headers: { "Content-Type": "application/xml" },
						status: 207,
					});
				} catch (err) {
					console.error(path, err);
					const xml = `
					<?xml version="1.0"?>
					<a:multistatus xmlns:a="DAV:">
						<a:response>
							<a:href>${url.pathname}</a:href>
							<a:status>HTTP/1.1 404 Not Found</a:status>
						</a:response>
					</a:multistatus>
				`.trim();

					return new Response(xml, {
						headers: { "Content-Type": "application/xml" },
						status: 207, // multi-status
					});
				}
			}

			case "PROPPATCH":
				return new Response(null, { status: 207 }); // No-op

			case "MKCOL":
				try {
					await fs.mkdir(path);
					return new Response(null, { status: 201 });
				} catch {
					return new Response(null, { status: 405 });
				}

			case "GET":
			case "HEAD": {
				try {
					const data = await fs.readFile(path);
					return new Response(method === "HEAD" ? null : new Blob([data]), {
						headers: {
							"Content-Type":
								mime.default.getType(path) || "application/octet-stream",
						},
						status: 200,
					});
				} catch {
					return new Response(null, { status: 404 });
				}
			}

			case "PUT": {
				const buffer = await getBuffer();
				try {
					console.log(buffer);
					await fs.writeFile(path, Filer.Buffer.from(buffer));
					return new Response(null, { status: 201 });
				} catch {
					return new Response(null, { status: 500 });
				}
			}

			case "DELETE":
				try {
					await shell.promises.rm(path, { recursive: true });
					return new Response(null, { status: 204 });
				} catch {
					return new Response(null, { status: 404 });
				}

			case "COPY": {
				// This is technically invalid -- Copy should handle full folders as well but filer doesn't have a convinient way to do this :/
				// take this broken solution in the interim - Rafflesia

				const dest = getDestPath();
				try {
					await shell.promises.cpr(path, dest);
					return new Response(null, { status: 201 });
				} catch (e) {
					console.error(e);
					return new Response(null, { status: 404 });
				}
			}

			case "MOVE": {
				const dest = getDestPath();
				try {
					await fs.rename(path, dest);
					return new Response(null, { status: 201 });
				} catch {
					return new Response(null, { status: 500 });
				}
			}

			case "LOCK":
			case "UNLOCK": {
				return new Response(
					`<?xml version="1.0"?><d:prop xmlns:d="DAV:"><d:lockdiscovery/></d:prop>`,
					{
						status: 200,
						headers: {
							"Content-Type": "application/xml",
							"Lock-Token": `<opaquelocktoken:fake-lock-${Date.now()}>`,
						},
					},
				);
			}

			case "POST":
				return new Response("POST not implemented", { status: 204 });

			default:
				return new Response("Unsupported WebDAV method", { status: 405 });
		}
	} catch (err) {
		return new Response(`Internal error: ${err.message}`, { status: 500 });
	}
}

for (const method of supportedWebDAVMethods) {
	workbox.routing.registerRoute(
		/\/dav/,
		async (event) => {
			return await handleDavRequest(event);
		},
		method,
	);
}

workbox.core.skipWaiting();
workbox.core.clientsClaim();

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

workbox.routing.registerRoute(/\/extension\//, async ({ url }) => {
	const { fs } = await currentFs();
	console.debug("Caught a aboutbrowser extension request");
	try {
		return new Response(await fs.promises.readFile(url.pathname));
	} catch (e) {
		return new Response("File not found bruh", { status: 404 });
	}
});

workbox.routing.registerRoute(
	/\/showFilePicker/,
	async ({ url }) => {
		let id = crypto.randomUUID();
		let clients = (await self.clients.matchAll()).filter(
			(v) => new URL(v.url).pathname === "/",
		);
		if (clients.length < 1)
			return new Response("no clients were available to take your request");
		let client = clients[0];

		let regex = url.searchParams.get("regex") || ".*";
		let type = url.searchParams.get("type") || "file";

		client.postMessage({
			anura_target: "anura.filepicker",
			regex,
			id,
			type,
		});

		const resp = await new Promise((resolve) => {
			filepickerCallbacks[id] = resolve;
		});

		return new Response(JSON.stringify(resp), {
			status: resp.cancelled ? 444 : 200,
		});
	},
	"GET",
);

async function serveFile(path, fsOverride, shOverride) {
	let fs;
	let sh;

	if (fsOverride && shOverride) {
		fs = fsOverride;
		sh = shOverride;
	} else {
		const { fs: fs_, sh: sh_ } = await currentFs();
		fs = fsOverride || fs_;
		sh = shOverride || sh_;
	}

	if (!fs) {
		// HOPEFULLY this will never happen,
		// as the filesystem should always have a backup
		return new Response(
			JSON.stringify({
				error: "No filesystem available.",
			}),
			{
				status: 500,
				headers: {
					"Content-Type": "application/json",
					...corsheaders,
				},
			},
		);
	}

	try {
		const stats = await fs.promises.stat(path);
		if (stats.type === "DIRECTORY") {
			// Can't do withFileTypes because it is unserializable
			let entries = await Promise.all(
				(await fs.promises.readdir(path)).map(
					async (e) => await fs.promises.stat(`${path}/${e}`),
				),
			);
			return new Response(JSON.stringify(entries), {
				headers: {
					"Content-Type": "application/json",
					...corsheaders,
				},
			});
		}
		const type = mime.default.getType(path) || "application/octet-stream";

		return new Response(await fs.promises.readFile(path), {
			headers: {
				"Content-Type": type,
				"Content-Disposition": `inline; filename="${path.split("/").pop()}"`,
				...corsheaders,
			},
		});
	} catch (e) {
		return new Response(
			JSON.stringify({ error: e.message, code: e.code, status: 404 }),
			{
				status: 404,
				headers: {
					"Content-Type": "application/json",
					...corsheaders,
				},
			},
		);
	}
}

async function updateFile(path, data) {
	const { fs, sh } = await currentFs();
	switch (data.action) {
		case "write":
			await sh.promises.mkdirp(path.replace(/[^/]*$/g, ""));
			await fs.promises.writeFile(path, data.contents);
			return new Response(
				JSON.stringify({
					status: "ok",
				}),
				{
					headers: {
						"Content-Type": "application/json",
						...corsheaders,
					},
				},
			);
		case "delete":
			await sh.promises.rm(path, { recursive: true });
			return new Response(
				JSON.stringify({
					status: "ok",
				}),
				{
					headers: {
						"Content-Type": "application/json",
						...corsheaders,
					},
				},
			);
		case "touch":
			await sh.promises.touch(path);
			return new Response(
				JSON.stringify({
					status: "ok",
				}),
				{
					headers: {
						"Content-Type": "application/json",
						...corsheaders,
					},
				},
			);
		case "mkdir":
			await sh.promises.mkdirp(path);
			return new Response(
				JSON.stringify({
					status: "ok",
				}),
				{
					headers: {
						"Content-Type": "application/json",
						...corsheaders,
					},
				},
			);
	}
}

const fsRegex = /\/fs(\/.*)/;

const corsheaders = {
	"cross-origin-embedder-policy": "require-corp",
	"access-control-allow-origin": "*",
	"cross-origin-opener-policy": "same-origin",
	"cross-origin-resource-policy": "same-site",
};

workbox.routing.registerRoute(
	fsRegex,
	async ({ url }) => {
		let path = url.pathname.match(fsRegex)[1];
		path = decodeURI(path);
		return serveFile(path);
	},
	"GET",
);

workbox.routing.registerRoute(
	fsRegex,
	async ({ url, request }) => {
		let path = url.pathname.match(fsRegex)[1];
		let action =
			request.headers.get("x-fs-action") || url.searchParams.get("action");
		if (!action) {
			return new Response(
				JSON.stringify({
					error: "No action specified",
					status: 400,
				}),
				{
					status: 400,
					headers: {
						"Content-Type": "application/json",
						...corsheaders,
					},
				},
			);
		}
		path = decodeURI(path);
		let body = await request.arrayBuffer();
		return updateFile(path, {
			action,
			contents: Buffer.from(body),
		});
	},
	"POST",
);

workbox.routing.registerRoute(
	/\/blob/,
	async (event) => {
		console.log("Got blob req");
		const blobURL = new URL(event.request.url).searchParams.get("url");
		if (blobURL && blobURL.startsWith("blob:")) {
			const fetchResponse = await fetch(blobURL);
			const corsResponse = new Response(
				await fetchResponse.clone().arrayBuffer(),
				{
					headers: {
						...Object.fromEntries(fetchResponse.headers.entries()),
						...corsheaders,
					},
				},
			);
			return corsResponse;
		}
	},
	"GET",
);
workbox.routing.registerRoute(
	/\/display/,
	async (event) => {
		const url = new URL(event.request.url);
		const content = url.searchParams.get("content");

		if (content) {
			return new Response(content, {
				headers: {
					"content-type": url.searchParams.get("type") || "text/html",
					...corsheaders,
				},
			});
		}
	},
	"GET",
);

workbox.routing.registerRoute(
	/^(?!.*(\/config.json|\/MILESTONE|\/x86images\/|\/service\/))/,
	async (event) => {
		if (new URL(event.url).origin !== self.location.origin) return false;
		await bootStrapFSReady;
		if (cacheenabled === undefined) {
			console.debug("retrieving cache value");
			cacheenabled = await idbKeyval.get("cacheenabled");
		}
		if (
			(!cacheenabled && event.url.pathname === "/" && !navigator.onLine) ||
			(!cacheenabled &&
				event.url.pathname === "/index.html" &&
				!navigator.onLine)
		) {
			return new Response(offlineError(), {
				status: 500,
				headers: { "content-type": "text/html" },
			});
		}
		if (!cacheenabled) {
			const fetchResponse = await fetch(event.request);
			return new Response(await fetchResponse.arrayBuffer(), {
				headers: {
					...Object.fromEntries(fetchResponse.headers.entries()),
					...corsheaders,
				},
			});
		}
		if (event.url.pathname === "/") event.url.pathname = "/index.html";
		if (event.url.password)
			return new Response(
				"<script>window.location.href = window.location.href</script>",
				{ headers: { "content-type": "text/html" } },
			);
		const basepath = "/anura_files";
		let path = decodeURI(event.url.pathname);

		// Force Filer to be used in cache routes, as it does not require waiting for anura to be connected
		const fs = opfs || filerfs;
		const sh = opfssh || filersh;

		const response = await serveFile(`${basepath}${path}`, fs, sh);

		if (response.ok) {
			return response;
		} else {
			try {
				const fetchResponse = await fetch(event.request);
				// Promise so that we can return the response before we cache it, for faster response times
				return new Promise(async (resolve) => {
					const corsResponse = new Response(
						await fetchResponse.clone().arrayBuffer(),
						{
							headers: {
								...Object.fromEntries(fetchResponse.headers.entries()),
								...corsheaders,
							},
						},
					);

					resolve(corsResponse);

					if (fetchResponse.ok) {
						const buffer = await fetchResponse.clone().arrayBuffer();
						await sh.promises.mkdirp(
							`${basepath}${path.replace(/[^/]*$/g, "")}`,
						);
						// Explicitly use Filer's fs here, as
						// Buffers lose their inheritance when passed
						// to anura's fs, causing them to be treated as
						// strings
						await fs.promises.writeFile(
							`${basepath}${path}`,
							Buffer.from(buffer),
						);
					}
				}).catch((e) => {
					console.error("I hate this bug: ", e);
				});
			} catch (e) {
				return new Response(
					JSON.stringify({
						error: e.message,
						status: 500,
					}),
					{
						status: 500,
						headers: {
							"Content-Type": "application/json",
							...corsheaders,
						},
					},
				);
			}
		}
	},
);

importScripts("./uv/uv.bundle.js");
importScripts("./uv/uv.config.js");
importScripts("./uv/uv.sw.js");

const uv = new UVServiceWorker();

const methods = ["GET", "POST", "HEAD", "PUT", "DELETE", "OPTIONS", "PATCH"];

methods.forEach((method) => {
	workbox.routing.registerRoute(
		/\/service\//,
		async (event) => {
			return await uv.fetch(event);
		},
		method,
	);
});

// have to put this here because no cache
function offlineError() {
	return `<!DOCTYPE html>
            <html>
            <head>
            <style>
            body {
                font-family: "Roboto", RobotoDraft, "Droid Sans", Arial, Helvetica, -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
                text-align: center;
                background: black;
                color: white;
                overflow: none;
                margin: 0;
            }
            #wrapper {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 100vh;
            }
            </style>
            </head>
            <body>
            <div id="wrapper">
            <h1>AnuraOS is offline without offline support enabled.</h1>
            <p>If you have offline support enabled and you are seeing this, please refresh the page.</p>
            </div>
            </body>
            </html>
            `;
}

async function initSw() {
	for (const client of await self.clients.matchAll()) {
		client.postMessage({
			anura_target: "anura.sw.reinit",
		});
	}
}
initSw();
