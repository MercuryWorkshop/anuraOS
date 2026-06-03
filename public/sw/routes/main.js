/* global workbox, bootStrapFSReady, idbKeyval, cacheenabled, opfs, filerfs, opfssh, filersh, serveFile, corsheaders */

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
