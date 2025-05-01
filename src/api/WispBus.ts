class WispBus {
	clientMappings = new Map();
	serverMappings: any[] = [];
	upstream: WebSocket | RTCDataChannel;
	lastId: 1;
	lastUpstreamId: 1;

	setUpstreamProvider(upstreamProvider: WebSocket | RTCDataChannel) {
		// TODO: close all client mappings assigned to upstream first

		this.upstream = upstreamProvider;
	}

	handleOutgoingPacket(packet: Uint8Array) {
		const parsed = wisp.parseIncomingPacket(packet);
		if (parsed?.packetType == wisp.CONNECT) {
			let handleByUpstream = true;
			let assignedHandler;
			let assignedRemoteStreamId;
			for (const serverMapping of this.serverMappings) {
				if ((serverMapping.regex as RegExp).test(parsed.hostname!)) {
					handleByUpstream = false;
					assignedRemoteStreamId = serverMapping.lastId;
					assignedHandler = serverMapping.handler;
					serverMapping.lastId++;
				}
			}
			if (handleByUpstream) {
				assignedHandler = this.upstream;
				assignedRemoteStreamId = this.lastUpstreamId;
				this.lastUpstreamId++;
			}

			this.clientMappings.set(this.lastId, {
				remoteId: assignedRemoteStreamId,
				handler: assignedHandler,
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

			this.lastId++;
		}
		if (parsed?.packetType == wisp.DATA || parsed?.packetType == wisp.CLOSE) {
			const streamMetaData = this.clientMappings.get(parsed.streamID);
			const assignedHandler = streamMetaData.handler;
			parsed.streamID = streamMetaData.remoteId; // modify the stream ID and then send it off
			assignedHandler.send(wisp.createWispPacket(parsed));
		}
	}
	handleIncomingPacket(packet: Uint8Array, sourceID: string) {}

	registerServer(
		regex: RegExp,
		id: string,
		handler: RTCDataChannel | WebSocket,
	) {
		this.serverMappings.push({ regex, id, handler, lastId: 0 });
		handler.binaryType = "arraybuffer";
		handler.addEventListener("message", (e: MessageEvent) => {
			this.handleIncomingPacket(e.data, id);
		});
	}
	getFakeWispProxySocket() {
		// fake WispV1 socket impl
	}

	getFakeWSProxySocket() {
		// I'm on the fence about this, add it last
	}

	constructor(upstreamProvider: WebSocket | RTCDataChannel) {
		this.upstream = upstreamProvider;
	}
}
