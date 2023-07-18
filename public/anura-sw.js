/* global workbox */

// importScripts('/assets/libs/workbox/workbox-sw.js');

importScripts("/nohost-sw.js");
importScripts("/sw.js");

var cacheenabled = false;

// workbox.setConfig({ modulePathPrefix: "/assets/libs/workbox" });

workbox.routing.registerRoute(/\/x86\/(.*)/, (req) => {
    return handleRequests(req); // need to do this because of the dumb way workbox handles async
    // console.log(url, request, event, params)
});

const callbacks = {};

addEventListener("message", (event) => {
    if (event.data.anura_target === "anura.x86.proxy") {
        let callback = callbacks[event.data.id];
        // console.log(callback)
        callback(event.data.value);
    }
});

async function handleRequests({ url, request, event, params }) {
    let clients = (await self.clients.matchAll()).filter(
        (v) => new URL(v.url).pathname === "/",
    ); // clients that aren't at a v86able url are completely useless
    if (clients.length < 1)
        return new Response("no clients were available to take your request");
    let client = clients[0];

    let uuid = crypto.randomUUID();

    console.log(request);

    client.postMessage({
        anura_target: "anura.x86.proxy",
        id: uuid,
        value: {
            url: request.url.substring(request.url.indexOf("/x86/") + 5),
            headers: Object.fromEntries(request.headers.entries()),
            method: request.method,
        },
    });

    console.log("want uuid" + uuid);
    let resp = await new Promise((resolve) => {
        callbacks[uuid] = resolve;
    });

    return new Response(resp.body);
}

workbox.routing.registerRoute(
    /^(?!.*(\/bare|\/uncached\/|\/config.json|\/MILESTONE))/,
    ({ url }) => {
        if (!cacheenabled) return;
        if (url.pathname === "/") {
            url.pathname = "/index.html";
        }
        const basepath = "/anura_files";
        let sh = new fs.Shell();
        // this is more annoying than it needs to be because this uses an old-ass compiler which doesn't like promises
        let path = decodeURI(url.pathname);
        let localreq = serve(`${basepath}${path}`, htmlFormatter, false);
        return new Promise((resolve) => {
            localreq.then((r) => {
                if (r.ok) {
                    resolve(r);
                } else {
                    fetch(url)
                        .then((f) => {
                            resolve(f);
                            if (f.ok) {
                                let cl = f.clone();
                                cl.arrayBuffer().then((b) => {
                                    sh.mkdirp(
                                        `${basepath}${path.replace(
                                            /[^/]*$/g,
                                            "",
                                        )}`,
                                        () => {
                                            fs.writeFile(
                                                `${basepath}${path}`,
                                                Buffer(b),
                                            );
                                        },
                                    );
                                });
                            }
                        })
                        .catch((a) => {
                            console.error(`Could not fetch? ${a}`);
                        });
                }
            });
        });
    },
    "GET",
);
let done = false;
addEventListener("message", (event) => {
    console.log("Recieved Message");
    console.log(event);
    if (event.data.anuraMsg && event.data.anuraMsg.value) {
        // regCache();
    }
    if (done) return;
    console.log("Starting request for anura settings");
    if (event.data.anuraMsg === "readyToGetSettings") {
        self.clients.matchAll().then((clients) => {
            clients.forEach((client) => {
                done = true;
                console.log("Posting Message");
                client.postMessage({
                    anura_target: "anura.settings.set",
                    id: 1,
                    prop: "use-sw-cache",
                });
            });
        });
    }
});
