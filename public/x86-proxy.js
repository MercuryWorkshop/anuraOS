
/* global workbox */

// importScripts('/assets/libs/workbox/workbox-sw.js');

importScripts('/nohost-sw.js');
importScripts("/sw.js");

// workbox.setConfig({ modulePathPrefix: "/assets/libs/workbox" });

workbox.routing.registerRoute(
  /\/x86\/(.*)/,
  (req) => {
    console.log(handleRequests(req))
    return handleRequests(req) // need to do this because of the dumb way workbox handles async
    // console.log(url, request, event, params)
  }
);


const callbacks = {};


addEventListener("message", (event) => {
  if (event.data.anura_target === "anura.x86.proxy") {
    callbacks[event.data.id](event.data.value)
  }
});


async function handleRequests({ url, request, event, params }) {
  let clients = (await self.clients.matchAll()).filter(v => new URL(v.url).pathname === "/"); // clients that aren't at a v86able url are completely useless
  if (clients.length < 1)
    return new Response("no clients were available to take your request")
  let client = clients[0];

  let uuid = crypto.randomUUID();

  console.log(request)


  client.postMessage({
    anura_target: "anura.x86.proxy",
    id: uuid,
    value: {
      url: request.url.substring(request.url.indexOf("/x86/") + 5),
      headers: Object.fromEntries(request.headers.entries()),
      method: request.method,
    }
  });

  let resp = await new Promise(resolve => {
    callbacks[uuid] = resolve
  })

  return new Response(resp.body)
}
