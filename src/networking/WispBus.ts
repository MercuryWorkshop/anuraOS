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
		const _wisp_connections: any = {};

		class WispWebSocket extends EventTarget {
			url: any;
			protocols: any;
			binaryType: string;
			stream: any;
			event_listeners: any;
			connection: any;
			onopen: (event: Event) => void;
			onerror: (event: Event) => void;
			onmessage: (event: Event) => void;
			onclose: (event: Event) => void;
			CONNECTING: number;
			OPEN: number;
			CLOSING: number;
			CLOSED: number;
			host: any;
			port: number;
			real_url: string;
			constructor(url: any, protocols: any) {
				super();
				this.url = url;
				this.protocols = protocols;
				this.binaryType = "blob";
				this.stream = null;
				this.event_listeners = {};
				this.connection = null;

				//legacy event handlers
				this.onopen = () => {};
				this.onerror = () => {};
				this.onmessage = () => {};
				this.onclose = () => {};

				this.CONNECTING = 0;
				this.OPEN = 1;
				this.CLOSING = 2;
				this.CLOSED = 3;

				//parse the wsproxy url
				const url_split = this.url.split("/");
				const wsproxy_path = url_split.pop().split(":");
				this.host = wsproxy_path[0];
				this.port = parseInt(wsproxy_path[1]);
				this.real_url = url_split.join("/") + "/";

				this.init_connection();
			}

			on_conn_close() {
				if (_wisp_connections[this.real_url]) {
					this.dispatchEvent(new Event("error"));
				}
				delete _wisp_connections[this.real_url];
			}

			init_connection() {
				//create the stream
				this.connection = _wisp_connections[this.real_url];

				if (!this.connection) {
					this.connection = new WispConnection(this.real_url);
					this.connection.addEventListener("open", () => {
						this.init_stream();
					});
					this.connection.addEventListener("close", () => {
						this.on_conn_close();
					});
					this.connection.addEventListener("error", (event: CloseEvent) => {
						this.on_conn_close();
					});
					_wisp_connections[this.real_url] = this.connection;
				} else if (!this.connection.connected) {
					this.connection.addEventListener("open", () => {
						this.init_stream();
					});
				} else {
					this.connection = _wisp_connections[this.real_url];
					this.init_stream();
				}
			}

			init_stream() {
				this.stream = this.connection!.create_stream(this.host, this.port);
				this.stream!.addEventListener("message", (event: MessageEvent) => {
					let data;
					if (this.binaryType == "blob") {
						data = new Blob(event.data);
					} else if (this.binaryType == "arraybuffer") {
						data = event.data.buffer;
					} else {
						throw "invalid binaryType string";
					}
					const msg_event = new MessageEvent("message", { data: data });
					this.onmessage(msg_event);
					this.dispatchEvent(msg_event);
				});
				this.stream.addEventListener("close", (event: CloseEvent) => {
					const close_event = new CloseEvent("close", { code: event.code });
					this.onclose(close_event);
					this.dispatchEvent(close_event);
				});
				const open_event = new Event("open");
				this.onopen(open_event);
				this.dispatchEvent(open_event);
			}

			send(data: any) {
				let data_array;
				if (typeof data === "string") {
					data_array = new TextEncoder().encode(data);
				} else if (data instanceof Blob) {
					data.arrayBuffer().then((array_buffer) => {
						data_array = new Uint8Array(array_buffer);
						this.send(data_array);
					});
					return;
				}
				//any typedarray
				else if (data instanceof ArrayBuffer) {
					//dataview objects
					if (ArrayBuffer.isView(data) && data instanceof DataView) {
						data_array = new Uint8Array(data.buffer);
					}
					//regular arraybuffers
					else {
						data_array = new Uint8Array(data);
					}
				}
				//regular typed arrays
				else if (ArrayBuffer.isView(data)) {
					data_array = Uint8Array.from(data as any);
				} else {
					throw "invalid data type";
				}

				if (!this.stream) {
					throw "websocket is not ready";
				}
				this.stream.send(data_array);
			}

			close() {
				this.stream.close(0x02);
			}

			get bufferedAmount() {
				let total = 0;
				for (const msg of this.stream.send_buffer) {
					total += msg.length;
				}
				return total;
			}

			get extensions() {
				return "";
			}

			get protocol() {
				return "binary";
			}

			get readyState() {
				if (
					this.connection &&
					!this.connection.connected &&
					!this.connection.connecting
				) {
					return this.CLOSED;
				}
				if (!this.connection || !this.connection.connected) {
					return this.CONNECTING;
				}
				if (this.stream!.open) {
					return this.OPEN;
				}
				return this.CLOSED;
			}
		}
		return WispWebSocket;
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
