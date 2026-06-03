/* global workbox, $scramjetController */

importScripts("/browser/controller.sw.js");

const methods = ["GET", "POST", "HEAD", "PUT", "DELETE", "OPTIONS", "PATCH"];
for (const method of methods) {
	workbox.routing.registerRoute(
		({ event }) => $scramjetController.shouldRoute(event),
		async ({ event }) => {
			return await $scramjetController.route(event);
		},
		method,
	);
}
