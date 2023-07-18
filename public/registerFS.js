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
        function (err) {
            if (err) console.error(err);
        },
    );
}

/**
 * Register the nohost service worker, passing `route` or other options.
 */

if ("serviceWorker" in navigator) {
    //
    //
    const proxy = new Workbox("/anura-sw.js");
    proxy.addEventListener("waiting", (event) => {
        // proxy.messageSkipWaiting();
    });
    proxy.addEventListener("activate", function (event) {
        console.log("ash");
        event.waitUntil(
            caches.keys().then(function (cacheNames) {
                return Promise.all(
                    cacheNames
                        .filter(function (cacheName) {
                            // Return true if you want to remove this cache,
                            // but remember that caches are shared across
                            // the whole origin
                        })
                        .map(function (cacheName) {
                            return caches.delete(cacheName);
                        }),
                );
            }),
        );
    });
    proxy.register();
    // console.log(proxy);
    // console.log("rg?")
    //
    // const wb = new Workbox('/nohost-sw.js?debug');
    //
    // // Wait on the server to be fully ready to handle routing requests
    // wb.controlling.then(serverReady);
    //
    // // Deal with first-run install, if necessary
    // wb.addEventListener('installed', (event) => {
    //   if (!event.isUpdate) {
    //     serverInstall();
    //   }
    // });
    //
    // wb.register();
}
