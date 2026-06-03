/* global workbox, Filer, mime */

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
