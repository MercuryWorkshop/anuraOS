//mapping of packet names to packet types
const packet_types = {
	CONNECT: 0x01,
	DATA: 0x02,
	CONTINUE: 0x03,
	CLOSE: 0x04,
};

//mapping of types to packet names
const packet_names = [undefined, "CONNECT", "DATA", "CONTINUE", "CLOSE"];

function uint_from_array(array: any) {
	if (array.length == 4) return new Uint32Array(array.buffer)[0];
	else if (array.length == 2) return new Uint16Array(array.buffer)[0];
	else if (array.length == 1) return array[0];
	else throw "invalid array length";
}

function array_from_uint(int: number, size: number) {
	const buffer = new ArrayBuffer(size);
	const view = new DataView(buffer);
	if (size == 1) view.setUint8(0, int);
	else if (size == 2) view.setUint16(0, int, true);
	else if (size == 4) view.setUint32(0, int, true);
	else throw "invalid array length";
	return new Uint8Array(buffer);
}

function concat_uint8array(...args: any) {
	let total_length = 0;
	for (const array of args) {
		total_length += array.length;
	}
	const new_array = new Uint8Array(total_length);
	let index = 0;
	for (const array of args) {
		new_array.set(array, index);
		index += array.length;
	}
	return new_array;
}

function create_packet(packet_type: any, stream_id: any, payload: any) {
	const stream_id_array = array_from_uint(stream_id, 4);
	const packet_type_array = array_from_uint(packet_type, 1);
	const packet = concat_uint8array(packet_type_array, stream_id_array, payload);
	return packet;
}

class WispStream extends EventTarget {
	hostname: any;
	port: any;
	ws: any;
	buffer_size: any;
	stream_id: any;
	connection: any;
	stream_type: number;
	send_buffer: any[];
	open: boolean;
	onopen: () => void;
	onclose: () => void;
	onerror: () => void;
	onmessage: () => void;
	constructor(
		hostname: any,
		port: any,
		websocket: any,
		buffer_size: any,
		stream_id: any,
		connection: any,
		stream_type: number,
	) {
		super();
		this.hostname = hostname;
		this.port = port;
		this.ws = websocket;
		this.buffer_size = buffer_size;
		this.stream_id = stream_id;
		this.connection = connection;
		this.stream_type = stream_type;
		this.send_buffer = [];
		this.open = true;

		this.onopen = () => {};
		this.onclose = () => {};
		this.onerror = () => {};
		this.onmessage = () => {};
	}

	send(data: any) {
		//note: udp shouldn't buffer anything
		if (this.buffer_size > 0 || !this.open || this.stream_type === 0x02) {
			//construct and send a DATA packet
			const packet = create_packet(0x02, this.stream_id, data);
			this.ws.send(packet);
			this.buffer_size--;
		} else {
			//server is slow, don't send data yet
			this.send_buffer.push(data);
		}
	}

	//handle receiving a CONTINUE packet
	continue_received(buffer_size: any) {
		this.buffer_size = buffer_size;
		//send buffered data now
		while (this.buffer_size > 0 && this.send_buffer.length > 0) {
			this.send(this.send_buffer.shift());
		}
	}

	//construct and send a CLOSE packet
	close(reason = 0x01) {
		if (!this.open) return;
		const payload = array_from_uint(reason, 1);
		const packet = create_packet(0x04, this.stream_id, payload);
		this.ws.send(packet);
		this.open = false;
		delete this.connection.active_streams[this.stream_id];
	}
}

class WispConnection extends EventTarget {
	wisp_url: any;
	max_buffer_size: null;
	active_streams: any;
	connected: boolean;
	connecting: boolean;
	next_stream_id: number;
	ws: any;
	constructor(wisp_url: any) {
		super();
		this.wisp_url = wisp_url;
		this.max_buffer_size = null;
		this.active_streams = {};
		this.connected = false;
		this.connecting = false;
		this.next_stream_id = 1;

		if (!this.wisp_url.endsWith("/")) {
			throw "wisp endpoints must end with a trailing forward slash";
		}

		this.connect_ws();
	}

	connect_ws() {
		this.ws = new (anura.net.bus.getFakeWispProxySocket())();
		this.ws.binaryType = "arraybuffer";
		this.connecting = true;

		this.ws.onerror = () => {
			this.on_ws_close();
			this.dispatchEvent(new Event("error"));
		};
		this.ws.onclose = () => {
			this.on_ws_close();
			const event = new CloseEvent("close");
			this.dispatchEvent(event);
		};
		this.ws.onmessage = (event: any) => {
			this.on_ws_msg(event);
			if (this.connecting) {
				this.connected = true;
				this.connecting = false;
				this.dispatchEvent(new Event("open"));
			}
		};
	}

	close_stream(
		stream: {
			open: boolean;
			dispatchEvent: (arg0: CloseEvent) => void;
			stream_id: string | number;
		},
		reason: number | undefined,
	) {
		const close_event = new CloseEvent("close", { code: reason });
		stream.open = false;
		stream.dispatchEvent(close_event);
		delete this.active_streams[stream.stream_id];
	}

	on_ws_close() {
		this.connected = false;
		this.connecting = false;
		for (const stream_id of Object.keys(this.active_streams)) {
			this.close_stream(this.active_streams[stream_id], 0x03);
		}
	}

	create_stream(hostname: string | undefined, port: number, type = "tcp") {
		const stream_type = type === "udp" ? 0x02 : 0x01;
		const stream_id = this.next_stream_id;
		this.next_stream_id++;
		const stream = new WispStream(
			hostname,
			port,
			this.ws,
			this.max_buffer_size,
			stream_id,
			this,
			stream_type,
		);
		stream.open = this.connected;

		//construct CONNECT packet
		const type_array = array_from_uint(stream_type, 1);
		const port_array = array_from_uint(port, 2);
		const host_array = new TextEncoder().encode(hostname);
		const payload = concat_uint8array(type_array, port_array, host_array);
		const packet = create_packet(0x01, stream_id, payload);

		this.active_streams[stream_id] = stream;
		this.ws.send(packet);
		return stream;
	}

	on_ws_msg(event: { data: any }) {
		const packet = new Uint8Array(event.data);

		if (packet.length < 5) {
			console.warn(`wisp client warning: received a packet which is too short`);
			return;
		}

		const packet_type = packet[0];
		const stream_id = uint_from_array(packet.slice(1, 5));
		const payload = packet.slice(5);
		const stream = this.active_streams[stream_id];

		if (typeof stream === "undefined" && stream_id !== 0) {
			console.warn(
				`wisp client warning: received a ${packet_names[packet_type!]} packet for a stream which doesn't exist`,
			);
			return;
		}

		if (packet_type === packet_types.DATA) {
			//DATA packets
			const msg_event = new MessageEvent("message", { data: payload });
			stream.dispatchEvent(msg_event);
		} else if (packet_type === packet_types.CONTINUE && stream_id == 0) {
			//initial CONTINUE packet
			this.max_buffer_size = uint_from_array(payload);
		} else if (packet_type === packet_types.CONTINUE) {
			//other CONTINUE packets
			stream.continue_received(uint_from_array(payload));
		} else if (packet_type === packet_types.CLOSE) {
			//CLOSE packets
			this.close_stream(stream, payload[0]);
		} else {
			console.warn(
				`wisp client warning: receive an invalid packet of type ${packet_type}`,
			);
		}
	}
}
