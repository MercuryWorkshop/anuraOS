/* global workbox, filepickerCallbacks */

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
