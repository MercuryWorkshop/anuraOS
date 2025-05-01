class WispBus {
	clientMappings = new Map();
	serverMappings: any[] = [];
	upstream: WebSocket | RTCDataChannel;

	setUpstreamProvider(upstreamProvider: WebSocket | RTCDataChannel) {
		// TODO: close all client mappings assigned to upstream first

		this.upstream = upstreamProvider;
	}

	parseIncomingPacket(packet: any) {
		// forwards packet to the correct handler in serverMappings or to upstream
	}

	packetForRegex(regex: RegExp, handler: any) {
		this.serverMappings.push([regex, handler]);
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
