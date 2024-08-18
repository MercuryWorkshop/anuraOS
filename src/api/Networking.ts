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
    fetch = async (url: any, methods: any) => {
        // these are any because they can be multiple things and I dont feel like typing them
        let requestObj: Request;
        if (url instanceof Request) {
            requestObj = url;
        } else {
            if (methods) requestObj = new Request(url, methods);
            else requestObj = new Request(url);
        }
        const urlObj = new URL(requestObj.url);
        if (urlObj.hostname === "localhost") {
            // we will assume if theres no port, its 80, god forbid it being 443
            const port = Number(urlObj.port) || 80;

            if (this.loopback.addressMap.has(port))
                return this.loopback.call(port, requestObj);
            else {
                if (anura.x86?.ready) {
                    return await new Promise(async (resolve) => {
                        let buffer = "";
                        let curlHeaders = "";

                        for (const header of (
                            requestObj as any
                        ).headers.entries()) {
                            curlHeaders += `-H "${header[0]}: ${header[1]}" `;
                        }

                        let tmpFileName: string;
                        if (requestObj.body) {
                            const id = crypto.randomUUID();
                            tmpFileName = "/tmp." + id;
                            await anura.fs.promises.writeFile(
                                tmpFileName,
                                (await requestObj.body?.getReader().read())!
                                    .value!,
                            );
                            curlHeaders += `--data "@/root${tmpFileName}" `;
                        }
                        const endMarker = crypto.randomUUID();

                        const pty = anura.x86!.openpty(
                            `/bin/ash -c 'curl -o - -s -i -X "${requestObj.method}" ${JSON.stringify(`http://localhost:${urlObj.port}${urlObj.pathname}${urlObj.search}`)} ${curlHeaders}| cat | base64 && echo -n "${endMarker}"'`,
                            0,
                            0,
                            async (data) => {
                                try {
                                    buffer += data;
                                    if (buffer.endsWith(endMarker)) {
                                        buffer = buffer.replace(endMarker, ""); // Get rid of endmarker from buffer
                                        const binaryData = Filer.Buffer.from(
                                            buffer,
                                            "base64",
                                        );

                                        const stringData = new TextDecoder(
                                            "utf-8",
                                        ).decode(binaryData);

                                        const infoPortion =
                                            stringData.split("\r\n\r\n")[0];

                                        const data = binaryData.subarray(
                                            infoPortion!.length + 4,
                                        );

                                        const splitInfo =
                                            infoPortion?.split("\r\n");

                                        const status = Number(
                                            splitInfo![0]!.split(" ")[1],
                                        );

                                        const raw_headers: any[] = [];
                                        splitInfo?.shift(); // remove the HTTP/1.1 <status>
                                        for (const header of splitInfo!) {
                                            raw_headers.push(
                                                header.split(": "),
                                            );
                                        }
                                        if (requestObj.bodyUsed) {
                                            await anura.fs.promises.unlink(
                                                tmpFileName,
                                            );
                                        }

                                        anura.x86!.closepty(await pty);

                                        const res = new Response(data, {
                                            status: status,
                                            statusText: "OK",
                                            headers: new Headers(raw_headers),
                                        });
                                        // @ts-expect-error
                                        res.raw_headers = raw_headers;

                                        resolve(res);
                                    }
                                } catch (e) {
                                    // This should only really error if theres nothing in v86, so I'll give the user an error that might be wrong
                                    anura.notifications.add({
                                        title: "Anura Networking Error",
                                        description:
                                            "fetch requested to non binded localhost port " +
                                            requestObj.url,
                                        timeout: 5000,
                                    });
                                    resolve(new Response(e));
                                }
                            },
                        );
                    });
                }
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
