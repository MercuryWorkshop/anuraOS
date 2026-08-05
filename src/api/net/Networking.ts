class Networking {
	bus: WispBus;
	libcurl: any;
	libcurl_src = "/libs/libcurl/libcurl.mjs";
	libcurl_wasm = "/libs/libcurl/libcurl.wasm";
	external = {
		fetch: window.fetch, // Default until another thing is registered ig
	};
	WebSocket: typeof WebSocket;
	Socket: any;
	TLSSocket: any;

	constructor(wisp_server: string) {
		this.bus = new WispBus(new WebSocket(wisp_server));

		//@ts-ignore
		import(this.libcurl_src).then(async (m) => {
			this.libcurl = m.libcurl;
			this.libcurl.load_wasm(this.libcurl_wasm);
			this.libcurl.transport = this.bus.getFakeWSProxySocket();
		});
		document.addEventListener("libcurl_load", () => {
			this.libcurl.set_websocket(wisp_server);
			this.external.fetch = this.libcurl.fetch;

			Object.assign(this, {
				WebSocket: this.libcurl.WebSocket,
				Socket: this.libcurl.WispConnection,
				TLSSocket: this.libcurl.TLSSocket,
			});
			console.debug("libcurl.js ready!");
		});
	}
	loopback = {
		addressMap: new Map(),
		call: async (port: number, request: Request) => {
			return await this.loopback.addressMap.get(port)(request);
		},
		set: async (port: number, handler: () => Response) => {
			this.loopback.addressMap.set(port, handler);
		},
		deregister: async (port: number) => {
			this.loopback.addressMap.delete(port);
		},
	};
	fetch = async (input: RequestInfo | URL, init: RequestInit) => {
		const url = new URL(
			input instanceof Request ? input.url : input.toString(),
		);
		if (url.hostname === "localhost") {
			// we will assume if theres no port, its 80, god forbid it being 443
			const port = Number(url.port) || 80;
			let request: Request;
			if (typeof input === "string" || input instanceof URL) {
				request = new Request(input, init);
			} else if (input instanceof Request) {
				request = input;
			}

			if (this.loopback.addressMap.has(port)) {
				return this.loopback.call(port, request!);
			}
		}
		return this.external.fetch(input, init);
	};
}
