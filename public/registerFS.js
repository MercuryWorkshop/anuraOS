/* eslint no-console:0 */

import { Workbox } from "/assets/libs/workbox/workbox-window.prod.mjs";

function serverReady() {
    console.log("Server ready! use `window.Filer.fs` if you need an fs");
}

function serverInstall() {
    console.log("Server installed for first time");

    const fs = window.Filer.fs;
    fs.writeFile(
        "/test.txt",
        "This file exists to test the filesystem",
        function(err) {
            if (err) console.error(err);
        },
    );
}

/**
 * Register the nohost service worker, passing `route` or other options.
 */

if ("serviceWorker" in navigator) {
    const wb = new Workbox("/nohost-sw.js?debug");

    // Wait on the server to be fully ready to handle routing requests
    wb.controlling.then(serverReady);

    // Deal with first-run install, if necessary
    wb.addEventListener("installed", (event) => {
        if (!event.isUpdate) {
            serverInstall();
        }
    });

    wb.register();
}
function regCache() {
    workbox.routing.registerRoute(
        /^(?!.*(\/bare|\/uncached\/|\/config.json|\/MILESTONE))/,
        ({ url }) => {
            if (url.pathname === "/") {
                url.pathname = "/index.html";
            }
            const basepath = "/anura_files";
            let sh = new fs.Shell();
            // this is more annoying than it needs to be because this uses an old-ass compiler which doesn't like promises
            let path = decodeURI(url.pathname);
            let localreq = serve(`${basepath}${path}`, htmlFormatter, false);
            return new Promise(resolve => {
                localreq.then(r => {
                    if (r.ok) {
                        resolve(r);
                    } else {
                        fetch(url).then(f => {
                            resolve(f);
                            if (f.ok) {
                                let cl = f.clone();
                                cl.arrayBuffer().then(b => {
                                    sh.mkdirp(`${basepath}${path.replace(/[^/]*$/g, "")}`, () => {
                                        fs.writeFile(`${basepath}${path}`, Buffer(b));
                                    });
                                });
                            }
                        }).catch(a => {
                            console.error(`Could not fetch? ${a}`);
                        });
                    }
                });
            });
        },
        'GET'
    );
}
let done = false;
addEventListener("message", event => {
    console.log("Recieved Message")
    console.log(event)
    if (event.data.anuraMsg && event.data.anuraMsg.value) {
        regCache();
    }
    if (done) return;
    console.log("Starting request for anura settings")
    if (event.data.anuraMsg === "readyToGetSettings") {
        self.clients.matchAll().then(clients => {
            clients.forEach(client => {
                done = true;
                console.log("Posting Message")
                client.postMessage({ anura_target: "anura.settings.set", id: 1, prop: "use-sw-cache" });
            });
        });
    }

});


