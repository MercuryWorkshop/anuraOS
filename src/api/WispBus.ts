class WispBus {
	clientMappings = new Map();
	serverMappings = new Map();
	upstream: WebSocket | RTCDataChannel;
	lastGlobalID = 1;
	lastUpstreamId = 1;
	upstreamClients = new Map();
	virtualServerMapping = new Map();

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
					serverMapping.lastId++;
				}
			}
			if (handleByUpstream) {
				assignedHandler = this.upstream;
				assignedRemoteStreamId = this.lastUpstreamId;
				this.upstreamClients.set(this.lastUpstreamId, this.lastGlobalID);
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
		if (parsed.streamID === 0) return;

		if (sourceID !== "upstream") {
			parsed.streamID = this.serverMappings
				.get(sourceID)
				.clients?.get(parsed!.streamID);
		} else {
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
		// 1) Pick a new virtualServerID and init its mappings
		const virtualServerID = this.virtualServerMapping.size + 1;
		this.virtualServerMapping.set(virtualServerID, { mappings: new Map() });

		// 2) Define our FakeSocket
		class FakeSocket extends EventTarget {
			binaryType;
			readyState;
			bufferedAmount;
			onopen = () => {};
			onmessage = () => {};
			onclose = () => {};
			constructor() {
				super();
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

					// initial CONTINUE packet (streamID=0, remainingBuffer=64)
					const contPkt = wisp.createWispPacket({
						packetType: wisp.CONTINUE,
						streamID: 0,
						remainingBuffer: 64,
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
				bus.handleOutgoingPacket(pkt, virtualServerID, (response: any) => {
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

		return new FakeSocket();
	}

	getFakeWSProxySocket() {
		// I'm on the fence about this, add it last
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
// my current test code
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
