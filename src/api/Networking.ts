class Networking {
    Socket = class Socket {
        constructor() {}
        ondata(data: any) {}
        onconnect() {}
        on(type: string, callback: () => void) {
            switch (type) {
                case "data":
                    this.ondata = callback;
                    break;
                case "connect":
                    this.onconnect = callback;
                    break;
            }
        }
        write(data: any) {
            this.websocket.send(data);
        }
        websocket: WebSocket;
        readyState = false;
        connecting = true;
        connect(port: number, host: string) {
            this.websocket = new WebSocket(
                anura.wsproxyURL + `${host}:${port}`,
                ["binary"],
            );
            this.websocket.onmessage = async (event) => {
                const data = Filer.Buffer.from(await event.data);
                this.ondata(data);
            };
            this.websocket.onopen = (event) => {
                this.readyState = true;
                this.connecting = false;
                // webSocket.send('GET / HTTP/1.1\r\nHost: alicesworld.tech\r\n\r\n');
            };
        }
    };
}
