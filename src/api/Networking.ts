class Networking {
    libcurl: any;
    fetch: typeof fetch;
    WebSocket: typeof WebSocket;
    Socket: any;
    TLSSocket: any;
    constructor(wisp_server: string) {
        //@ts-ignore
        import("/libcurl.mjs").then((m) => {
            this.libcurl = m.libcurl;
            this.libcurl.load_wasm("libcurl.wasm");
        });
        document.addEventListener("libcurl_load", () => {
            this.libcurl.set_websocket(wisp_server);
            Object.assign(this, {
                WebSocket: this.libcurl.WebSocket,
                fetch: this.libcurl.fetch,
                Socket: this.libcurl.WispConnection,
                TLSSocket: this.libcurl.TLSSocket,
            });
            console.log("libcurl.js ready!");
        });
    }
    setWispServer = function (wisp_server: string) {
        this.libcurl.set_websocket(wisp_server);
    };
}
