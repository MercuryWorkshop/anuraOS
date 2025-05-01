class WispBus {
	clientMappings = new Map();
	serverMappings = new Map();
	upstream: WebSocket | RTCDataChannel;
	lastId: 1;
	lastUpstreamId: 1;
	upstreamClients = new Map();

	setUpstreamProvider(upstreamProvider: WebSocket | RTCDataChannel) {
		// TODO: close all client mappings assigned to upstream first

		this.upstream = upstreamProvider;
	}

	handleOutgoingPacket(packet: Uint8Array, dataCallBack?: any) {
		const parsed = wisp.parseIncomingPacket(packet);
		if (parsed?.packetType == wisp.CONNECT) {
			if (!dataCallBack) {
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
					serverMapping.clients.set(assignedRemoteStreamId, this.lastId);
					serverMapping.lastId++;
				}
			}
			if (handleByUpstream) {
				assignedHandler = this.upstream;
				assignedRemoteStreamId = this.lastUpstreamId;
				this.upstreamClients.set(this.lastUpstreamId, this.lastId);
				this.lastUpstreamId++;
			}

			this.clientMappings.set(this.lastId, {
				remoteId: assignedRemoteStreamId,
				handler: assignedHandler,
				dataCallBack,
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
	handleIncomingPacket(packet: Uint8Array, sourceID: string) {
		const parsed = wisp.parseIncomingPacket(packet)!;
		parsed.streamID = this.serverMappings
			.get(sourceID)
			.clients.get(parsed?.streamID);
		const reconstructedPacket = wisp.createWispPacket(parsed);
		this.clientMappings.get(parsed.streamID).handler.send(reconstructedPacket);
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
