const bare = (window as any).BareMux;
/*
const connection = new bare.BareMuxConnection("/libs/bare-mux/worker.js");
*/

class AnuraBareClient {
    ready = true;

    constructor() {}
    async init() {
        this.ready = true;
    }
    async meta() {}

    async request(
        remote: URL,
        method: string,
        body: BodyInit | null,
        headers: any,
        signal: AbortSignal | undefined,
    ): Promise<any> {
        const payload = await anura.net.fetch(remote.href, {
            method,
            headers: headers,
            body,
            redirect: "manual",
            duplex: "half",
        });

        const respheaders = {};

        //@ts-ignore
        if (payload.raw_headers)
            for (const [key, value] of payload.raw_headers) {
                //@ts-ignore
                if (!respheaders[key]) {
                    //@ts-ignore
                    respheaders[key] = [value];
                } else {
                    //@ts-ignore
                    respheaders[key].push(value);
                }
            }

        return {
            body: payload.body!,
            headers: respheaders,
            status: payload.status,
            statusText: payload.statusText,
        };
    }

    connect(
        url: URL,
        origin: string,
        protocols: string[],
        requestHeaders: any,
        onopen: (protocol: string) => void,
        onmessage: (data: Blob | ArrayBuffer | string) => void,
        onclose: (code: number, reason: string) => void,
        onerror: (error: string) => void,
    ): [
        (data: Blob | ArrayBuffer | string) => void,
        (code: number, reason: string) => void,
    ] {
        //@ts-ignore
        const socket = new anura.net.WebSocket(url.toString(), protocols, {
            headers: requestHeaders,
        });
        //bare client always expects an arraybuffer for some reason
        socket.binaryType = "arraybuffer";

        socket.onopen = (event: Event) => {
            onopen("");
        };
        socket.onclose = (event: CloseEvent) => {
            onclose(event.code, event.reason);
        };
        socket.onerror = (event: Event) => {
            onerror("");
        };
        socket.onmessage = (event: MessageEvent) => {
            onmessage(event.data);
        };

        return [
            (data) => {
                socket.send(data);
            },
            (code, reason) => {
                socket.close(code, reason);
            },
        ];
    }
}
/*
keeping this for when we can revert to a less garbage version of this library
connection.setRemoteTransport(new AnuraBareClient(), "AnuraBareClient");
*/

navigator.serviceWorker.ready.then((isReady) => {
    bare.registerRemoteListener(isReady.active);
    bare.SetSingletonTransport(new AnuraBareClient());
});
