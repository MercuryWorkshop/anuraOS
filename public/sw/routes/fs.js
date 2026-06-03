/* global workbox, corsheaders, Buffer */

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
