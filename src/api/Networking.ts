class Networking {
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
        //@ts-ignore
        import(this.libcurl_src).then((m) => {
            this.libcurl = m.libcurl;
            this.libcurl.load_wasm(this.libcurl_wasm);
        });
        document.addEventListener("libcurl_load", () => {
            this.libcurl.set_websocket(wisp_server);
            this.external.fetch = this.libcurl.fetch;
            Object.assign(this, {
                WebSocket: this.libcurl.WebSocket,
                Socket: this.libcurl.WispConnection,
                TLSSocket: this.libcurl.TLSSocket,
            });
            console.log("libcurl.js ready!");
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
    fetch = async (url: any, methods: any) => {
        // these are any because they can be multiple things and I dont feel like typing them
        let requestObj;
        if (url instanceof Request) {
            requestObj = url;
        } else {
            if (methods) requestObj = new Request(url, methods);
            else requestObj = new Request(url);
        }
        const urlObj = new URL(requestObj.url);
        if (urlObj.hostname == "localhost") {
            // we will assume if theres no port, its 80, god forbid it being 443
            const port = Number(urlObj.port) || 80;

            if (this.loopback.addressMap.has(port))
                return this.loopback.call(port, requestObj);
            else {
                anura.notifications.add({
                    title: "Anura Networking Error",
                    description: "fetch requested to non binded localhost port",
                    timeout: 5000,
                });
                return new Response();
            }
        } else {
            return this.external.fetch(url, methods); // just pass through
        }
    };
    setWispServer = function (wisp_server: string) {
        this.libcurl.set_websocket(wisp_server);
    };
}
