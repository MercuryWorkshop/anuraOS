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
        }
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
