class WispBus {
	clientMappings = new Map();
	serverMappings = new Map();
	upstream: WebSocket | RTCDataChannel;
	lastGlobalID = 1;
	lastUpstreamId = 1;
	upstreamClients = new Map();
	virtualServerMapping = new Map();
	upstreamBuffer = 64;

	static CONNECTING = 0;
	static OPEN = 1;
	static CLOSING = 2;
	static CLOSED = 3;

	setUpstreamProvider(upstreamProvider: WebSocket | RTCDataChannel) {
		// TODO: close all client mappings assigned to upstream first

		this.upstream = upstreamProvider;
	}

	handleOutgoingPacket(
		packet: Uint8Array,
		virtualServerID: number,
		packetCallBack?: any,
	) {
		const parsed = wisp.parseIncomingPacket(packet);

		if (parsed?.packetType == wisp.CONNECT) {
			if (!packetCallBack) {
				throw new Error("Data callback required if sending connect packet");
			}
			let handleByUpstream = true;
			let assignedHandler;
			let assignedRemoteStreamId;
			for (const [id, serverMapping] of this.serverMappings.entries()) {
				if ((serverMapping.regex as RegExp).test(parsed.hostname!)) {
					handleByUpstream = false;
					assignedRemoteStreamId = serverMapping.lastId;
					assignedHandler = serverMapping.handler;
					serverMapping.clients.set(assignedRemoteStreamId, this.lastGlobalID);
					packetCallBack(
						wisp.createWispPacket({
							packetType: wisp.CONTINUE,
							streamID: parsed.streamID,
							remainingBuffer: serverMapping.defaultBuffer || 64,
						}),
					);
					serverMapping.lastId++;
				}
			}
			if (handleByUpstream) {
				assignedHandler = this.upstream;
				assignedRemoteStreamId = this.lastUpstreamId;
				this.upstreamClients.set(this.lastUpstreamId, this.lastGlobalID);
				packetCallBack(
					wisp.createWispPacket({
						packetType: wisp.CONTINUE,
						streamID: parsed.streamID,
						remainingBuffer: this.upstreamBuffer,
					}),
				);
				this.lastUpstreamId++;
			}

			this.clientMappings.set(this.lastGlobalID, {
				remoteId: assignedRemoteStreamId,
				handler: assignedHandler,
				packetCallBack,
			});
			assignedHandler.send(
				wisp.createWispPacket({
					packetType: parsed.packetType,
					streamType: parsed.streamType,
					streamID: assignedRemoteStreamId,
					hostname: parsed.hostname,
					port: parsed.port,
				}),
			);

			this.virtualServerMapping
				.get(virtualServerID)
				.mappings.set(parsed.streamID, this.lastGlobalID++); // return which ID we actually mapped
		}
		if (parsed?.packetType == wisp.DATA || parsed?.packetType == wisp.CLOSE) {
			const streamMetaData = this.clientMappings.get(
				this.virtualServerMapping
					.get(virtualServerID)
					.mappings.get(parsed.streamID),
			);
			const assignedHandler = streamMetaData.handler;
			parsed.streamID = streamMetaData.remoteId; // modify the stream ID and then send it off
			assignedHandler.send(wisp.createWispPacket(parsed));
			return null;
		}
		return undefined;
	}
	handleIncomingPacket(packet: Uint8Array, sourceID: string) {
		const parsed = wisp.parseIncomingPacket(packet)!;

		if (sourceID !== "upstream") {
			if (parsed.streamID === 0) {
				if (parsed.packetType === wisp.CONTINUE) {
					this.serverMappings.get(sourceID).defaultBuffer =
						parsed.remainingBuffer!;
				}
				return;
			}

			parsed.streamID = this.serverMappings
				.get(sourceID)
				.clients?.get(parsed!.streamID);
		} else {
			if (parsed.streamID === 0) {
				if (parsed.packetType === wisp.CONTINUE) {
					this.upstreamBuffer = parsed.remainingBuffer!;
				}
				return;
			}
			parsed.streamID = this.upstreamClients.get(parsed!.streamID);
		}

		const reconstructedPacket = wisp.createWispPacket(parsed);
		this.clientMappings
			.get(parsed.streamID)
			.packetCallBack(reconstructedPacket);
	}

	registerServer(
		regex: RegExp,
		id: string,
		handler: RTCDataChannel | WebSocket,
	) {
		this.serverMappings.set(id, {
			regex,
			handler,
			lastId: 0,
			clients: new Map(),
		});
		handler.binaryType = "arraybuffer";
		handler.addEventListener("message", (e: MessageEvent) => {
			this.handleIncomingPacket(new Uint8Array(e.data), id);
		});
	}

	getFakeWispProxySocket() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const bus = this;

		// 2) Define our FakeSocket
		class FakeSocket extends EventTarget {
			binaryType;
			readyState;
			bufferedAmount;
			virtualServerID;
			onopen = () => {};
			onmessage = () => {};
			onclose = () => {};
			constructor() {
				super();
				// 1) Pick a new virtualServerID and init its mappings
				this.virtualServerID = bus.virtualServerMapping.size + 1;
				bus.virtualServerMapping.set(this.virtualServerID, {
					mappings: new Map(),
				});

				this.binaryType = "arraybuffer";
				this.readyState = WispBus.CONNECTING;
				this.bufferedAmount = 0;

				// Mirror .onopen/.onmessage/.onclose into EventTarget listeners
				["open", "message", "close"].forEach((type) => {
					this.addEventListener(type, (ev) => {
						const handler = (this as any)["on" + type];
						if (typeof handler === "function") handler.call(this, ev);
					});
				});

				// Next tick: signal open, then send initial CONTINUE packet
				setTimeout(() => {
					this.readyState = WispBus.OPEN;
					this.dispatchEvent(new Event("open"));

					// initial CONTINUE packet
					const contPkt = wisp.createWispPacket({
						packetType: wisp.CONTINUE,
						streamID: 0,
						remainingBuffer: bus.upstreamBuffer,
					});
					this.dispatchEvent(
						new MessageEvent("message", { data: contPkt.buffer }),
					);
				}, 0);
			}

			send(data: any) {
				if (
					this.readyState !== WispBus.OPEN &&
					this.readyState !== WispBus.CONNECTING
				) {
					throw new Error("Socket is not open");
				}
				// ensure a Uint8Array
				const pkt = data instanceof Uint8Array ? data : new Uint8Array(data);
				bus.handleOutgoingPacket(pkt, this.virtualServerID, (response: any) => {
					// route any incoming-from-server WISP data back as a message event
					this.dispatchEvent(
						new MessageEvent("message", { data: response.buffer }),
					);
				});
			}

			close(code = 1000, reason = "") {
				if (
					this.readyState === WispBus.CLOSING ||
					this.readyState === WispBus.CLOSED
				)
					return;
				this.readyState = WispBus.CLOSING;
				// (Optionally: send CLOSE packets on each stream here)
				this.readyState = WispBus.CLOSED;
				this.dispatchEvent(
					new CloseEvent("close", { code, reason, wasClean: true }),
				);
			}
		}

		return FakeSocket;
	}

	getFakeWSProxySocket() {
		// eslint-disable-next-line @typescript-eslint/no-this-alias
		const bus = this;
		const FakeWispProxy = bus.getFakeWispProxySocket();

		return class FakeWS extends EventTarget {
			url: string;
			binaryType: "arraybuffer";
			readyState = WispBus.CONNECTING;
			onopen: (ev: Event) => any = () => {};
			onmessage: (ev: MessageEvent) => any = () => {};
			onclose: (ev: CloseEvent) => any = () => {};
			_wispSocket: InstanceType<typeof FakeWispProxy>;
			_streamID: number;
			_hostname: string;
			_port: number;
			bufferedAmount = 0;
			extensions = "";
			protocol = "";

			static CONNECTING = WispBus.CONNECTING;
			static OPEN = WispBus.OPEN;
			static CLOSING = WispBus.CLOSING;
			static CLOSED = WispBus.CLOSED;

			constructor(url: string) {
				super();
				console.log("Fake WSPROXY for " + url);
				this.url = url;
				this.binaryType = "arraybuffer";
				this.readyState = WispBus.CONNECTING;
				this._streamID = 1;

				// wire up .onopen/.onmessage/.onclose
				["open", "message", "close"].forEach((type) => {
					this.addEventListener(type, (ev) => {
						const handler = (this as any)["on" + type];
						if (typeof handler === "function") handler.call(this, ev);
					});
				});

				// parse host:port out of last path segment
				const segments = url.split("/");
				const lastSegment = segments.pop()!;
				const [host, portStr] = lastSegment.split(":");
				if (!host || !portStr) {
					throw new Error("Invalid URL format; expected …/host:port");
				}
				const portNum = parseInt(portStr, 10);
				if (isNaN(portNum)) {
					throw new Error(`Invalid port: ${portStr}`);
				}
				this._hostname = host;
				this._port = portNum;

				this._wispSocket = new FakeWispProxy(); // this is bad and actually I should have one which is used by every FakeWS

				this._wispSocket.onopen = () => {
					// handshake: open WISP stream
					const connPkt = wisp.createWispPacket({
						packetType: wisp.CONNECT,
						streamType: wisp.TCP,
						streamID: this._streamID,
						hostname: this._hostname,
						port: this._port,
					});
					this._wispSocket.send(connPkt);
					// setTimeout(() => {
					console.log("Marking as open");
					this.readyState = WebSocket.OPEN;

					this.dispatchEvent(new Event("open"));
					console.log(this);
					// }, 10);
				};

				this._wispSocket.addEventListener("message", (e: MessageEvent) => {
					const parsed = wisp.parseIncomingPacket(new Uint8Array(e.data))!;
					switch (parsed.packetType) {
						case wisp.CONTINUE:
							return;
						case wisp.DATA: {
							this.dispatchEvent(
								new MessageEvent("message", { data: parsed.payload }),
							);
							break;
						}
						case wisp.CLOSE:
							this.readyState = WispBus.CLOSED;
							this.dispatchEvent(
								new CloseEvent("close", {
									code: 1000,
									reason: "",
									wasClean: true,
								}),
							);
							break;
					}
				});
			}

			send(data: string | ArrayBuffer | Uint8Array) {
				console.log("sent shit", data);
				if (this.readyState !== WispBus.OPEN) {
					throw new Error("Socket is not open");
				}
				let payload: Uint8Array;
				if (typeof data === "string") {
					payload = new TextEncoder().encode(data);
				} else if (data instanceof ArrayBuffer) {
					payload = new Uint8Array(data);
				} else {
					payload = data;
				}

				const pkt = wisp.createWispPacket({
					packetType: wisp.DATA,
					streamID: this._streamID,
					payload,
				});
				this._wispSocket.send(pkt);
			}

			close(code = 1000, reason = "") {
				if (
					this.readyState === WispBus.CLOSING ||
					this.readyState === WispBus.CLOSED
				)
					return;
				this.readyState = WispBus.CLOSING;

				const pkt = wisp.createWispPacket({
					packetType: wisp.CLOSE,
					streamID: this._streamID,
				});
				this._wispSocket.send(pkt);

				this.readyState = WispBus.CLOSED;
				this.dispatchEvent(
					new CloseEvent("close", { code, reason, wasClean: true }),
				);
			}
		};
	}

	constructor(upstreamProvider: WebSocket | RTCDataChannel) {
		this.upstream = upstreamProvider;
		this.upstream.binaryType = "arraybuffer";
		this.upstream.addEventListener("message", (e: MessageEvent) => {
			this.handleIncomingPacket(new Uint8Array(e.data), "upstream");
		});
	}
}

/*
// my current test code for bus
const bus = new WispBus(new WebSocket("ws://localhost:8000"))

await sleep(10)

bus.virtualServerMapping.set(1, {mappings: new Map()});

bus.handleOutgoingPacket(wisp.createWispPacket({
			packetType: wisp.CONNECT,
			streamType: wisp.TCP,
			streamID: 2,
			hostname: "example.com",
			port: 80,
		}), 1, (data) => {
			console.log(new TextDecoder().decode(wisp.parseIncomingPacket(data).payload))
        })
bus.handleOutgoingPacket(wisp.createWispPacket({
			packetType: wisp.DATA,
			streamID: 2,
			hostname: "example.com",
            payload: new TextEncoder().encode("GET / HTTP/1.1\r\nHost: example.com\r\n\r\n")
		}), 1)
*/

// current test code for emulated wisp socket
/*
const bus    = new WispBus(new WebSocket("ws://localhost:8000/"));
await sleep(100);
const socket = new (bus.getFakeWispProxySocket())();

socket.onopen = () => {
  // first, you'll already have gotten the CONTINUE packet
  // now send CONNECT:
  const connPkt = wisp.createWispPacket({
    packetType:  wisp.CONNECT,
    streamType:  wisp.TCP,
    streamID:    1,
    hostname:    "example.com",
    port:        80,
  });
  socket.send(connPkt);
  const dataPkt = wisp.createWispPacket({
      packetType: wisp.DATA,
      streamID: 1,
      payload: new TextEncoder().encode("GET / HTTP/1.1\r\nHost: example.com\r\n\r\n")
  })
 socket.send(dataPkt)
};

socket.onmessage = (e) => {
  const parsed = wisp.parseIncomingPacket(new Uint8Array(e.data));
    if (parsed.packetType == wisp.DATA) {
        console.log(new TextDecoder().decode(parsed.payload))
    }
    if (parsed.packetType == wisp.CONTINUE) {
        console.log(parsed)
    }
  // handle DATA, CLOSE, etc.
};
*/
