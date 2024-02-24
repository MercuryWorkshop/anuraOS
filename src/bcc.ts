const bare = (window as any).bare;
class TLSClient extends bare.Client {
    queue = [];
    canstart = true;
    constructor() {
        super();
        bare.registerRemoteListener();
        bare.setBareClientImplementation(this);
    }

    async request(
        method: any,
        requestHeaders: any,
        body: any,
        remote: { href: any },
        cache: any,
        duplex: any,
        signal: any,
        arrayBufferImpl: any,
    ) {
        //@ts-ignore
        return anura.net.fetch(remote.href, {
            method,
            headers: requestHeaders,
            body,
            redirect: "manual",
        });
    }

    connect(
        remote: { toString: () => any },
        protocols: string | Iterable<unknown> | ArrayLike<unknown> | undefined,
        getRequestHeaders: any,
        onMeta: any,
        onReadyState: (arg0: number) => void,
        webSocketImpl: any,
        arrayBufferImpl: { prototype: any },
    ) {
        // this will error. that's okay
        const ws = new WebSocket("wss:null", protocols as any);

        let initalCloseHappened = false;
        ws.addEventListener("close", (e) => {
            if (!initalCloseHappened) {
                // we can freely mess with the fake readyState here because there is no
                //  readyStateChange listener for WebSockets
                onReadyState(WebSocket.CONNECTING);
                e.stopImmediatePropagation();
                initalCloseHappened = true;
            }
        });
        let initialErrorHappened = false;
        ws.addEventListener("error", (e) => {
            if (!initialErrorHappened) {
                onReadyState(WebSocket.CONNECTING);
                e.stopImmediatePropagation();
                initialErrorHappened = true;
            }
        });
        // coerce iframe Array type to our window array type
        protocols = Array.from(protocols as any);
        //@ts-ignore
        const wsws = new window.parent.anura.net.WebSocket(
            remote.toString(),
            protocols,
        );
        wsws.onopen = (protocol: any) => {
            onReadyState(WebSocket.OPEN);
            // @ts-ignore yes it does
            ws.__defineGetter__("protocol", () => {
                return protocol;
            });
            Object.defineProperty(wsws, "binaryType", {
                value: ws.binaryType,
                writable: false,
            });
            ws.dispatchEvent(new Event("open"));
        };
        //@ts-ignore
        wsws.onclose = (code, reason, wasClean) => {
            onReadyState(WebSocket.CLOSED);
            ws.dispatchEvent(
                new CloseEvent("close", { code, reason, wasClean }),
            );
        };
        //@ts-ignore
        wsws.onerror = (message) => {
            ws.dispatchEvent(new ErrorEvent("error", { message }));
        };
        //@ts-ignore
        wsws.onmessage = (event) => {
            const payload = event.data;
            if (typeof payload === "string") {
                ws.dispatchEvent(
                    new MessageEvent("message", { data: payload }),
                );
            } else if (payload instanceof ArrayBuffer) {
                // @ts-ignore yes it does
                payload.__proto__ = arrayBufferImpl.prototype;

                ws.dispatchEvent(
                    new MessageEvent("message", { data: payload }),
                );
            } else if (payload instanceof Blob) {
                console.log(payload);
                console.log(event);
                ws.dispatchEvent(
                    new MessageEvent("message", { data: payload }),
                );
            }
        };
        ws.send = (data) => {
            wsws.send(data);
        };
        ws.close = () => {
            wsws.close();
        };
        return ws;
    }
}

console.log("Registering BCC impl");
bare.setBareClientImplementation(new TLSClient());
