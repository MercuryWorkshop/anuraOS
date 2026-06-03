/* global workbox, corsheaders */

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
