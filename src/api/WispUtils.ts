// ORIGIN: Puter.js WISP parser under AGPL3
/* eslint-disable no-case-declarations */

const wisp = {
	// PACKET TYPES
	CONNECT: 0x01,
	DATA: 0x02,
	CONTINUE: 0x03,
	CLOSE: 0x04,
	INFO: 0x05,

	// STREAM TYPES
	TCP: 0x01,
	UDP: 0x02,

	// Frequently used objects
	textde: new TextDecoder(),
	texten: new TextEncoder(),
	errors: {
		0x01: "Reason unspecified or unknown. Returning a more specific reason should be preferred.",
		0x03: "Unexpected stream closure due to a network error.",
		0x41: "Stream creation failed due to invalid information. This could be sent if the destination was a reserved address or the port is invalid.",
		0x42: "Stream creation failed due to an unreachable destination host. This could be sent if the destination is an domain which does not resolve to anything.",
		0x43: "Stream creation timed out due to the destination server not responding.",
		0x44: "Stream creation failed due to the destination server refusing the connection.",
		0x47: "TCP data transfer timed out.",
		0x48: "Stream destination address/domain is intentionally blocked by the proxy server.",
		0x49: "Connection throttled by the server.",
	},
	parseIncomingPacket(data: Uint8Array) {
		const view = new DataView(data.buffer, data.byteOffset);
		const packetType = view.getUint8(0);
		const streamID = view.getUint32(1, true);
		switch (
			packetType // Packet payload starts at Offset 5
		) {
			case wisp.CONNECT:
				const streamType = view.getUint8(5);
				const port = view.getUint16(6, true);
				const hostname = wisp.textde.decode(data.subarray(8, data.length));
				return { packetType, streamID, streamType, port, hostname };
			case wisp.DATA:
				const payload = data.subarray(5, data.length);
				return { packetType, streamID, payload };
			case wisp.CONTINUE:
				const remainingBuffer = view.getUint32(5, true);
				return { packetType, streamID, remainingBuffer };
			case wisp.CLOSE:
				const reason = view.getUint8(5);
				return { packetType, streamID, reason };
			case wisp.INFO:
				const infoObj: any = {};
				infoObj["version_major"] = view.getUint8(5);
				infoObj["version_minor"] = view.getUint8(6);

				let ptr = 7;
				while (ptr < data.length) {
					const extType = view.getUint8(ptr);
					const extLength = view.getUint32(ptr + 1, true);
					const payload = data.subarray(ptr + 5, ptr + 5 + extLength);
					infoObj[extType] = payload;
					ptr += 5 + extLength;
				}
				return { packetType, streamID, infoObj };
			default:
				throw new Error("Undefined packet type");
		}
	},
	createWispPacket(instructions: any) {
		let size = 5;
		switch (
			instructions.packetType // Pass 1: determine size of packet
		) {
			case wisp.CONNECT:
				instructions.hostEncoded = wisp.texten.encode(instructions.hostname);
				size += 3 + instructions.hostEncoded.length;
				break;
			case wisp.DATA:
				size += instructions.payload.byteLength;
				break;
			case wisp.CONTINUE:
				size += 4;
				break;
			case wisp.CLOSE:
				size += 1;
				break;
			case wisp.INFO:
				size += 2;
				if (instructions.password) size += 6;
				if (instructions.puterAuth) {
					instructions.passwordEncoded = wisp.texten.encode(
						instructions.puterAuth,
					);
					size += 8 + instructions.passwordEncoded.length;
				}
				break;
			default:
				throw new Error("Not supported");
		}

		const data = new Uint8Array(size);
		const view = new DataView(data.buffer);
		view.setUint8(0, instructions.packetType);
		view.setUint32(1, instructions.streamID, true);
		switch (
			instructions.packetType // Pass 2: fill out packet
		) {
			case wisp.CONNECT:
				view.setUint8(5, instructions.streamType);
				view.setUint16(6, instructions.port, true);
				data.set(instructions.hostEncoded, 8);
				break;
			case wisp.DATA:
				data.set(instructions.payload, 5);
				break;
			case wisp.CONTINUE:
				view.setUint32(5, instructions.remainingBuffer, true);
				break;
			case wisp.CLOSE:
				view.setUint8(5, instructions.reason);
				break;
			case wisp.INFO:
				// WISP 2.0
				view.setUint8(5, 2);
				view.setUint8(6, 0);

				if (instructions.password) {
					// PASSWORD AUTH REQUIRED
					view.setUint8(7, 0x02); // Protocol ID (Password)
					view.setUint32(8, 1, true);
					view.setUint8(12, 0); // Password required? true
				}

				if (instructions.puterAuth) {
					// PASSWORD AUTH REQUIRED
					view.setUint8(7, 0x02); // Protocol ID (Password)
					view.setUint32(8, 5 + instructions.passwordEncoded.length, true);
					view.setUint8(12, 0);
					view.setUint16(13, instructions.passwordEncoded.length, true);
					data.set(instructions.passwordEncoded, 15);
				}
		}
		return data;
	},
};
