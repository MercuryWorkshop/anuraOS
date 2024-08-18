/* global workbox */

// workaround for a firefox quirk where crossOriginIsolated
// is not reported properly in a service worker
if (navigator.userAgent.includes("Firefox")) {
    Object.defineProperty(globalThis, "crossOriginIsolated", {
        value: true,
        writable: false,
    });
}

// Due to anura's filesystem only being available once an anura instance is running,
// we need a temporary filesystem to store files that are requested for caching.
// As the anura filesystem is a wrapper around Filer, we can use default Filer here.
importScripts("/libs/filer/filer.min.js");

// Importing mime
importScripts("/libs/mime/mime.iife.js");

// self.fs = new Filer.FileSystem({
//     name: "anura-mainContext",
//     provider: new Filer.FileSystem.providers.IndexedDB(),
// });

const filerfs = new Filer.FileSystem({
    name: "anura-mainContext",
    provider: new Filer.FileSystem.providers.IndexedDB(),
});

const filersh = new filerfs.Shell();

async function currentFs() {
    // isConnected will return true if the anura instance is running, and otherwise infinitely wait.
    // it will never return false, but it may hang indefinitely if the anura instance is not running.
    // here, we race the isConnected promise with a timeout to prevent hanging indefinitely.

    if (!self.isConnected) {
        // An anura instance has not been started yet to populate the isConnected promise.
        // We automatically know that the filesystem is not connected.
        return {
            fs: filerfs,
            sh: filersh,
        };
    }

    const CONN_TIMEOUT = 1000;
    const winner = await Promise.race([
        new Promise((resolve) =>
            setTimeout(() => {
                resolve({
                    fs: filerfs,
                    sh: filersh,
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

importScripts("/libs/workbox/workbox-v7.1.0/workbox-sw.js");
workbox.setConfig({
    debug: false,
    modulePathPrefix: "/libs/workbox/workbox-v7.1.0",
});

workbox.core.skipWaiting();
workbox.core.clientsClaim();

importScripts("/libs/idb-keyval/idb-keyval.js");

var cacheenabled;
workbox.routing.registerRoute(/\/x86\/(.*)/, (req) => {
    return handleRequests(req); // need to do this because of the dumb way workbox handles async
});

const callbacks = {};
const filepickerCallbacks = {};

addEventListener("message", (event) => {
    if (event.data.anura_target === "anura.x86.proxy") {
        let callback = callbacks[event.data.id];
        callback(event.data.value);
    }
    if (event.data.anura_target === "anura.cache") {
        cacheenabled = event.data.value;
        idbKeyval.set("cacheenabled", event.data.value);
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
            return new Response(
                "no clients were available to take your request",
            );
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
    "Cross-Origin-Embedder-Policy": "require-corp",
    "Access-Control-Allow-Origin": "*",
    "Cross-Origin-Opener-Policy": "same-origin",
    "Cross-Origin-Resource-Policy": "same-site",
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
            request.headers.get("x-fs-action") ||
            url.searchParams.get("action");
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
    /^(?!.*(\/config.json|\/MILESTONE|\/x86images\/|\/service\/))/,
    async ({ url }) => {
        if (cacheenabled === undefined) {
            console.debug("retrieving cache value");
            let result = await idbKeyval.get("cacheenabled");
            if (result !== undefined || result !== null) {
                cacheenabled = result;
            }
        }
        if (
            (!cacheenabled && url.pathname === "/" && !navigator.onLine) ||
            (!cacheenabled &&
                url.pathname === "/index.html" &&
                !navigator.onLine)
        ) {
            return new Response(offlineError(), {
                status: 500,
                headers: { "content-type": "text/html" },
            });
        }
        if (!cacheenabled) return fetch(url);
        if (url.pathname === "/") {
            url.pathname = "/index.html";
        }
        if (url.password)
            return new Response(
                "<script>window.location.href = window.location.href</script>",
                { headers: { "content-type": "text/html" } },
            );
        const basepath = "/anura_files";
        let path = decodeURI(url.pathname);

        // Force Filer to be used in cache routes, as it does not require waiting for anura to be connected
        const fs = filerfs;
        const sh = filersh;

        const response = await serveFile(`${basepath}${path}`, fs, sh);

        if (response.ok) {
            return response;
        } else {
            try {
                const fetchResponse = await fetch(url);
                // Promise so that we can return the response before we cache it, for faster response times
                return new Promise(async (resolve) => {
                    resolve(fetchResponse);
                    if (fetchResponse.ok) {
                        const buffer = await fetchResponse
                            .clone()
                            .arrayBuffer();
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
            console.debug("Got UV req");
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
