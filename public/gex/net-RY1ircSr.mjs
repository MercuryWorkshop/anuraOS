import { n as e } from "./log-BhnhOsaP.mjs";
var t = typeof globalThis > `u` ? window : globalThis,
	n = t.WebSocket;
t.crypto;
var r = new TextEncoder(),
	i = r.encode.bind(r),
	a = new TextDecoder(),
	o = a.decode.bind(a),
	s = class e {
		constructor(e) {
			if (e instanceof Uint8Array) this.from_array(e);
			else if (typeof e == `number`) this.from_array(new Uint8Array(e));
			else if (typeof e == `string`) this.from_array(i(e));
			else
				throw (
					console.trace(),
					`invalid data type passed to wisp buffer constructor`
				);
		}
		from_array(e) {
			((this.size = e.length),
				(this.bytes = e),
				(this.view = new DataView(e.buffer)));
		}
		concat(t) {
			let n = new e(this.size + t.size);
			return (n.bytes.set(this.bytes, 0), n.bytes.set(t.bytes, this.size), n);
		}
		slice(t, n) {
			let r = this.bytes.slice(t, n);
			return new e(r);
		}
		get_string() {
			return a.decode(this.bytes);
		}
	},
	c = class e {
		static min_size = 5;
		constructor({ type: e, stream_id: t, payload: n, payload_bytes: r }) {
			((this.type = e),
				(this.stream_id = t),
				(this.payload_bytes = r),
				(this.payload = n));
		}
		static parse(t) {
			return new e({
				type: t.view.getUint8(0),
				stream_id: t.view.getUint32(1, !0),
				payload_bytes: t.slice(5),
			});
		}
		static parse_all(t) {
			if (t.size < e.min_size) throw TypeError(`packet too small`);
			let n = e.parse(t),
				r = m[n.type];
			if (r === void 0) throw TypeError(`invalid packet type`);
			if (n.payload_bytes.size < r.size) throw TypeError(`payload too small`);
			return ((n.payload = r.parse(n.payload_bytes)), n);
		}
		serialize() {
			let e = new s(5);
			return (
				e.view.setUint8(0, this.type),
				e.view.setUint32(1, this.stream_id, !0),
				(e = e.concat(this.payload.serialize())),
				e
			);
		}
	},
	l = class e {
		static min_size = 3;
		static type = 1;
		static name = `CONNECT`;
		constructor({ stream_type: e, port: t, hostname: n }) {
			((this.stream_type = e), (this.port = t), (this.hostname = n));
		}
		static parse(t) {
			return new e({
				stream_type: t.view.getUint8(0),
				port: t.view.getUint16(1, !0),
				hostname: o(t.slice(3).bytes),
			});
		}
		serialize() {
			let e = new s(3);
			return (
				e.view.setUint8(0, this.stream_type),
				e.view.setUint16(1, this.port, !0),
				(e = e.concat(new s(this.hostname))),
				e
			);
		}
	},
	u = class e {
		static min_size = 0;
		static type = 2;
		static name = `DATA`;
		constructor({ data: e }) {
			this.data = e;
		}
		static parse(t) {
			return new e({ data: t });
		}
		serialize() {
			return this.data;
		}
	},
	d = class e {
		static type = 3;
		static name = `CONTINUE`;
		constructor({ buffer_remaining: e }) {
			this.buffer_remaining = e;
		}
		static parse(t) {
			return new e({ buffer_remaining: t.view.getUint32(0, !0) });
		}
		serialize() {
			let e = new s(4);
			return (e.view.setUint32(0, this.buffer_remaining, !0), e);
		}
	},
	f = class e {
		static min_size = 1;
		static type = 4;
		static name = `CLOSE`;
		constructor({ reason: e }) {
			this.reason = e;
		}
		static parse(t) {
			return new e({ reason: t.view.getUint8(0) });
		}
		serialize() {
			let e = new s(1);
			return (e.view.setUint8(0, this.reason), e);
		}
	},
	p = class e {
		static min_size = 2;
		static type = 5;
		static name = `INFO`;
		constructor({ major_ver: e, minor_ver: t, extensions: n }) {
			((this.major_ver = e), (this.minor_ver = t), (this.extensions = n));
		}
		static parse(t) {
			return new e({
				major_ver: t.view.getUint8(0),
				minor_ver: t.view.getUint8(1),
				extensions: t.slice(2),
			});
		}
		serialize() {
			let e = new s(2);
			return (
				e.view.setUint8(0, this.major_ver),
				e.view.setUint8(1, this.minor_ver),
				e.concat(this.extensions)
			);
		}
	},
	m = { 1: l, 2: u, 3: d, 4: f, 5: p },
	h = { CONNECT: 1, DATA: 2, CONTINUE: 3, CLOSE: 4, INFO: 5 },
	g = { TCP: 1, UDP: 2 },
	_ = class e {
		constructor() {}
		static parse() {
			return new e();
		}
		serialize() {
			return new s(0);
		}
	},
	v = class {
		static id = 0;
		static name = ``;
		static Server = _;
		static Client = _;
		constructor({ server_config: e, client_config: t } = {}) {
			((this.id = this.constructor.id),
				(this.name = this.constructor.name),
				e
					? (this.payload = new this.constructor.Server(e))
					: t && (this.payload = new this.constructor.Client(t)));
		}
		static parse(e, t, n) {
			let r = new e({});
			if (n === `client`) r.payload = e.Client.parse(t.slice(5));
			else if (n === `server`) r.payload = e.Server.parse(t.slice(5));
			else throw TypeError(`invalid role`);
			return r;
		}
		serialize() {
			let e = new s(5),
				t = this.payload.serialize();
			return (
				e.view.setInt8(0, this.constructor.id),
				e.view.setUint32(1, t.size, !0),
				e.concat(t)
			);
		}
	},
	y = class extends v {
		static id = 1;
		static name = `UDP`;
	},
	b = class e extends v {
		static id = 4;
		static name = `Server MOTD`;
		static Server = class {
			constructor({ message: e }) {
				this.message = e;
			}
			static parse(t) {
				return new e.Server({ message: t.get_string() });
			}
			serialize() {
				return new s(this.message);
			}
		};
		static Client = _;
	};
function x(e, t, n) {
	let r = [];
	for (; e.size; ) {
		let i = e.view.getUint8(0),
			a = e.view.getUint32(1, !0),
			o = e.slice(0, 5 + a),
			s;
		for (let e of t)
			if (e.id === i) {
				s = e.constructor;
				break;
			}
		if (s) {
			let e = v.parse(s, o, n);
			r.push(e);
		}
		e = e.slice(5 + a);
	}
	return r;
}
function S(e) {
	{
		let t = new s(0);
		for (let n of e) t = t.concat(n.serialize());
		return t;
	}
}
var C = class {
		constructor(e, t, n, r, i, a, o) {
			((this.hostname = e),
				(this.port = t),
				(this.ws = n),
				(this.buffer_size = r),
				(this.stream_id = i),
				(this.connection = a),
				(this.stream_type = o),
				(this.send_buffer = []),
				(this.open = !0),
				(this.onopen = () => {}),
				(this.onclose = () => {}),
				(this.onmessage = () => {}));
		}
		send(e) {
			if (this.buffer_size > 0 || !this.open || this.stream_type === g.UDP) {
				let t = new c({
					type: h.DATA,
					stream_id: this.stream_id,
					payload: new u({ data: new s(e) }),
				});
				(this.ws.send(t.serialize().bytes), this.buffer_size--);
			} else this.send_buffer.push(e);
		}
		continue_received(e) {
			for (
				this.buffer_size = e;
				this.buffer_size > 0 && this.send_buffer.length > 0;
			)
				this.send(this.send_buffer.shift());
		}
		close(e = 1) {
			if (!this.open) return;
			let t = new c({
				type: h.CLOSE,
				stream_id: this.stream_id,
				payload: new f({ reason: e }),
			});
			(this.ws.send(t.serialize().bytes),
				(this.open = !1),
				delete this.connection.active_streams[this.stream_id]);
		}
	},
	w = class {
		constructor(e, { wisp_version: t, wisp_extensions: n } = {}) {
			if (!e.endsWith(`/`))
				throw TypeError(
					`wisp endpoints must end with a trailing forward slash`,
				);
			((this.wisp_url = e),
				(this.wisp_version = t || 2),
				(this.wisp_extensions = n || null),
				(this.max_buffer_size = null),
				(this.active_streams = {}),
				(this.connected = !1),
				(this.connecting = !1),
				(this.next_stream_id = 1),
				(this.server_exts = {}),
				(this.client_exts = {}),
				(this.info_received = !1),
				(this.server_motd = null),
				(this.udp_enabled = !0),
				(this.onopen = () => {}),
				(this.onclose = () => {}),
				(this.onerror = () => {}),
				(this.onmessage = () => {}),
				this.wisp_version === 2 &&
					this.wisp_extensions === null &&
					this.add_extensions(),
				this.connect_ws());
		}
		add_extensions() {
			((this.wisp_extensions = []),
				this.wisp_extensions.push(new y({ client_config: {} })),
				this.wisp_extensions.push(new b({ client_config: {} })));
		}
		connect_ws() {
			let e = this.wisp_version === 2 ? `wisp-v2` : void 0;
			((this.ws = new n(this.wisp_url, e)),
				(this.ws.binaryType = `arraybuffer`),
				(this.connecting = !0),
				(this.ws.onerror = () => {
					if (this.wisp_version === 2) {
						((this.ws.onclose = null),
							this.cleanup(),
							(this.wisp_version = 1),
							this.connect_ws());
						return;
					}
					(this.cleanup(), this.onerror());
				}),
				(this.ws.onclose = () => {
					(this.cleanup(), this.onclose());
				}),
				(this.ws.onmessage = (e) => {
					(this.on_ws_msg(e),
						this.connected &&
							this.connecting &&
							((this.connecting = !1), this.onopen()));
				}));
		}
		close() {
			this.ws.close();
		}
		create_stream(e, t, n = 1) {
			let r = n;
			if (
				(typeof r == `string` && (r = n === `udp` ? g.UDP : g.TCP),
				r == g.UDP && !this.udp_enabled)
			)
				throw Error(`udp is not enabled for this wisp connection`);
			let i = this.next_stream_id++,
				a = new C(e, t, this.ws, this.max_buffer_size, i, this, r);
			((this.active_streams[i] = a), (a.open = this.connected));
			let o = new c({
				type: h.CONNECT,
				stream_id: i,
				payload: new l({ stream_type: r, port: t, hostname: e }),
			});
			return (this.ws.send(o.serialize().bytes), a);
		}
		close_stream(e, t) {
			(e.onclose(t), delete this.active_streams[e.stream_id]);
		}
		on_ws_msg(e) {
			let t = new s(new Uint8Array(e.data));
			if (t.size < c.min_size) {
				console.warn(
					`wisp client warning: received a packet which is too short`,
				);
				return;
			}
			let n = c.parse_all(t),
				r = this.active_streams[n.stream_id];
			if (n.stream_id === 0 && this.connecting) {
				if (
					(n.type === h.CONTINUE &&
						((this.max_buffer_size = n.payload.buffer_remaining),
						(this.connected = !0),
						this.info_received || (this.wisp_version = 1)),
					n.type === h.INFO && this.wisp_version === 2)
				) {
					let e = x(n.payload.extensions, this.wisp_extensions, `server`);
					for (let t of e)
						for (let e of this.wisp_extensions)
							t.id === e.id &&
								((this.server_exts[t.id] = t), (this.client_exts[e.id] = e));
					((this.info_received = !0),
						(this.server_motd = this.server_exts[b.id]?.payload?.message),
						(this.udp_enabled = !!this.server_exts[y.id]));
					let t = S(this.wisp_extensions),
						r = new c({
							type: p.type,
							stream_id: 0,
							payload: new p({
								major_ver: this.wisp_version,
								minor_ver: 0,
								extensions: t,
							}),
						});
					this.ws.send(r.serialize().bytes);
				}
				return;
			}
			if (r === void 0) {
				console.warn(
					`wisp client warning: received a ${m[n.type].name} packet for a stream which doesn't exist`,
				);
				return;
			}
			n.type === h.DATA
				? r.onmessage(n.payload_bytes.bytes)
				: n.type === h.CONTINUE
					? r.continue_received(n.payload.buffer_remaining)
					: n.type === h.CLOSE
						? this.close_stream(r, n.payload.reason)
						: console.warn(
								`wisp client warning: received an invalid packet of type ${n.type}`,
							);
		}
		cleanup() {
			((this.connected = !1), (this.connecting = !1));
			for (let e of Object.keys(this.active_streams))
				this.close_stream(this.active_streams[e], 3);
		}
	};
t.CloseEvent;
var T = {
		200: `OK`,
		206: `Partial Content`,
		304: `Not Modified`,
		400: `Bad Request`,
		404: `Not Found`,
		405: `Method Not Allowed`,
		416: `Range Not Satisfiable`,
		502: `Bad Gateway`,
	},
	E = [`range`, `if-range`, `if-modified-since`, `if-none-match`, `accept`],
	D = [
		`content-type`,
		`last-modified`,
		`etag`,
		`content-range`,
		`accept-ranges`,
		`cache-control`,
	],
	O = new TextEncoder(),
	k = class {
		open = !0;
		onopen = null;
		onmessage = null;
		onclose = null;
		onerror = null;
		#e;
		#t;
		#n = new Uint8Array();
		#r = Promise.resolve();
		#i = !1;
		#a = !1;
		#o = null;
		constructor(e, t = null) {
			((this.#e = e),
				(this.#t = t ?? ((e, t) => globalThis.fetch(e, t))),
				queueMicrotask(() => this.onopen?.()));
		}
		send(e) {
			if (this.#i || this.#a) return;
			let t = new Uint8Array(this.#n.length + e.length);
			for (t.set(this.#n), t.set(e, this.#n.length), this.#n = t; ; ) {
				let e = A(this.#n);
				if (e < 0) break;
				let t = new TextDecoder().decode(this.#n.subarray(0, e));
				this.#n = this.#n.subarray(e + 4);
				let n = j(t);
				if (
					((this.#r = this.#r.then(() => this.#u(n)).catch(() => this.#c())),
					n.body || n.bad)
				) {
					this.#a = !0;
					break;
				}
			}
		}
		close() {
			((this.#i = !0), this.#o?.cancel().catch(() => {}));
		}
		#s(e) {
			!this.#i && e.length && this.onmessage?.(e);
		}
		#c() {
			this.#i || ((this.#i = !0), this.onclose?.());
		}
		#l(e, t) {
			let n = [`HTTP/1.1 ${e} ${T[e] ?? ``}`.trimEnd()];
			for (let [e, r] of t) n.push(`${e}: ${r}`);
			this.#s(
				O.encode(
					`${n.join(`\r
`)}\r\n\r\n`,
				),
			);
		}
		async #u(e) {
			if (this.#i) return;
			if (
				!(
					(e.method === `GET` || e.method === `HEAD`) &&
					!e.body &&
					!e.bad &&
					!e.headers.get(`upgrade`)
				)
			) {
				let t = e.bad ? 400 : 405;
				(this.#l(t, [
					[`Allow`, `GET, HEAD`],
					[`Content-Length`, `0`],
					[`Connection`, `close`],
				]),
					this.#c());
				return;
			}
			let t =
					e.version === `HTTP/1.1` &&
					!/\bclose\b/i.test(e.headers.get(`connection`) ?? ``),
				n = t ? [] : [[`Connection`, `close`]],
				r = e.target.replace(/^[a-z]+:\/\/[^/]*/i, ``).replace(/^\/+/, ``),
				i = new URL(/* @vite-ignore */ /* webpackIgnore: true */ r, this.#e);
			if (!i.href.startsWith(this.#e)) {
				(this.#l(404, [[`Content-Length`, `0`], ...n]), t || this.#c());
				return;
			}
			let a = {};
			for (let t of E) e.headers.has(t) && (a[t] = e.headers.get(t));
			let o;
			try {
				o = await this.#t(i.href, { method: e.method, headers: a });
			} catch {
				(this.#l(502, [[`Content-Length`, `0`], ...n]), t || this.#c());
				return;
			}
			let s = [];
			for (let e of D)
				o.headers.get(e) != null &&
					s.push([
						e.replace(/(^|-)./g, (e) => e.toUpperCase()),
						o.headers.get(e),
					]);
			let c = o.headers.get(`content-encoding`)
					? null
					: o.headers.get(`content-length`),
				l = c == null && e.method === `GET` && o.status !== 304;
			if (
				(c == null
					? l
						? s.push([`Transfer-Encoding`, `chunked`])
						: e.method !== `HEAD` && s.push([`Content-Length`, `0`])
					: s.push([`Content-Length`, c]),
				this.#l(o.status, [...s, ...n]),
				e.method === `GET` && o.body && o.status !== 304)
			) {
				for (this.#o = o.body.getReader(); ; ) {
					let { done: e, value: t } = await this.#o.read();
					if (e || this.#i) break;
					t?.length &&
						(l && this.#s(O.encode(`${t.length.toString(16)}\r\n`)),
						this.#s(t),
						l &&
							this.#s(
								O.encode(`\r
`),
							));
				}
				((this.#o = null),
					l &&
						this.#s(
							O.encode(`0\r
\r
`),
						));
			} else await o.body?.cancel().catch(() => {});
			t || this.#c();
		}
	};
function A(e) {
	for (let t = 0; t + 3 < e.length; t++)
		if (e[t] === 13 && e[t + 1] === 10 && e[t + 2] === 13 && e[t + 3] === 10)
			return t;
	return -1;
}
function j(e) {
	let [t, ...n] = e.split(`\r
`),
		[r, i, a] = t.split(` `),
		o = new Map();
	for (let e of n) {
		let t = e.indexOf(`:`);
		t > 0 && o.set(e.slice(0, t).trim().toLowerCase(), e.slice(t + 1).trim());
	}
	let s =
		Number(o.get(`content-length`) ?? 0) > 0 || o.has(`transfer-encoding`);
	return {
		method: r,
		target: i ?? ``,
		version: a ?? ``,
		headers: o,
		body: s,
		bad: !r || !i || !/^HTTP\/1\.[01]$/.test(a ?? ``),
	};
}
var M = 0,
	N = 1,
	P = 2,
	F = 3,
	I = 16 << 20,
	L = class {
		constructor(e) {
			((this.id = e),
				(this.state = M),
				(this.chunks = []),
				(this.buffered = 0),
				(this.wisp = null),
				(this.refs = 1),
				(this.slot = -1));
		}
		take(e) {
			let t = 0;
			for (; t < e.length && this.chunks.length; ) {
				let n = this.chunks[0],
					r = Math.min(e.length - t, n.length);
				(e.set(n.subarray(0, r), t),
					(t += r),
					r === n.length
						? this.chunks.shift()
						: (this.chunks[0] = n.subarray(r)),
					(this.buffered -= r));
			}
			return t;
		}
		peek(e) {
			let t = 0;
			for (let n of this.chunks) {
				if (t >= e.length) break;
				let r = Math.min(e.length - t, n.length);
				(e.set(n.subarray(0, r), t), (t += r));
			}
			return t;
		}
	},
	R = { n: 0, bytes: 0, last: 0 },
	z = class {
		#e = null;
		#t = new Map();
		#n = 1;
		#r;
		#i;
		#a = !1;
		#o = 0;
		#s = [];
		#c = null;
		#l = null;
		rings = null;
		onActivity = () => {};
		constructor(e, t = () => {}, { pageHosts: n = null, dial: r = null } = {}) {
			((this.#r = e == null ? null : e.endsWith(`/`) ? e : `${e}/`),
				(this.#i = t),
				(this.#c = n?.size ? n : null),
				(this.#l = r));
		}
		get pageHosts() {
			return this.#c ?? void 0;
		}
		get url() {
			return this.#r;
		}
		async start() {
			this.#e ||
				this.#r == null ||
				(await new Promise((e, t) => {
					let n = new w(this.#r);
					((n.onopen = () => {
						((this.#e = n), (this.#o = 0), e());
						let t = this.#s;
						this.#s = [];
						for (let [e, n, r] of t) this.connect(e, n, r);
					}),
						(n.onerror = (e) =>
							t(Error(`wisp: ${e?.message || `could not connect`}`))),
						(n.onclose = () => {
							for (let e of this.#t.values()) e.waiting || this.#d(e, P);
							this.#e === n && ((this.#e = null), this.#i(`closed`), this.#u());
						}),
						setTimeout(() => t(Error(`wisp: the proxy did not answer`)), 1e4));
				}),
				this.#i(`open`));
		}
		#u() {
			if (this.#a) return;
			this.#a = !0;
			let e = Math.min(250 * 2 ** this.#o, 8e3);
			((this.#o += 1),
				console.info(`[wisp] connection dropped; dialling again in ${e} ms`),
				setTimeout(() => {
					this.start()
						.catch((e) => console.warn(`[wisp] ${e.message}`))
						.finally(() => {
							((this.#a = !1), this.#e || this.#u());
						});
				}, e));
		}
		open() {
			if (!this.#e && !this.#a && !this.#c && !this.#l) return 0;
			let e = this.#n++,
				t = new L(e);
			return (
				this.rings && (t.slot = this.rings.claim(e)),
				this.#t.set(e, t),
				e
			);
		}
		#d(e, t) {
			((e.state = t), e.slot >= 0 && this.rings?.setState(e.slot, t));
		}
		connect(e, t, n) {
			let r = this.#t.get(e);
			if (!r) return;
			let i = this.#c?.get(String(t).toLowerCase());
			if (i) {
				this.#f(r, e, new k(i), t, n);
				return;
			}
			if (this.#l) {
				let i;
				try {
					i = this.#l(t, n);
				} catch {
					this.#d(r, F);
					return;
				}
				this.#f(r, e, i, t, n);
				return;
			}
			if (!this.#e) {
				if (!this.#a) return;
				((r.waiting = !0), this.#s.push([e, t, n]));
				return;
			}
			r.waiting = !1;
			let a;
			try {
				a = this.#e.create_stream(t, n, `tcp`);
			} catch {
				this.#d(r, F);
				return;
			}
			this.#f(r, e, a, t, n);
		}
		#f(t, n, r, i, a) {
			((t.wisp = r),
				(r.onopen = () => {
					(this.#d(t, N), this.onActivity());
				}),
				(r.onmessage = (r) => {
					let i = r instanceof Uint8Array ? r : new Uint8Array(r),
						a = performance.now();
					if (!t.firstRecv) {
						t.firstRecv = a;
						let r = t.firstSend ? (a - t.firstSend) / 1e3 : -1;
						e(`debug`) &&
							console.info(
								`[wisp] stream ${n}: first reply at ${(a / 1e3).toFixed(1)}s, ${r.toFixed(1)}s after the request`,
							);
					}
					(R.last &&
						a - R.last > 1e3 &&
						e(`debug`) &&
						console.info(
							`[wisp] nothing for ${((a - R.last) / 1e3).toFixed(1)}s after ${R.n} messages and ${(R.bytes / 1048576).toFixed(1)} MiB`,
						),
						(R.last = a),
						(R.n += 1),
						(R.bytes += i.length),
						t.buffered > I &&
							!t.warned &&
							((t.warned = !0),
							console.warn(
								`[wisp] stream ${n}: ${t.buffered >> 20} MiB unread`,
							)),
						this.#p(t, i),
						this.onActivity());
				}),
				(r.onclose = () => {
					(this.#d(t, t.state === M ? F : P), this.onActivity());
				}),
				(r.onerror = () => {
					(this.#d(t, t.state === M ? F : P), this.onActivity());
				}),
				(r.open === !0 || t.wisp?.open === !0) && this.#d(t, N),
				this.#i(`connect ${i}:${a}`));
		}
		#p(e, t) {
			(e.slot >= 0 &&
				!e.chunks.length &&
				(t = t.subarray(this.rings.write(e.slot, t))),
				t.length &&
					(e.chunks.push(t),
					(e.buffered += t.length),
					e.slot >= 0 && this.rings.setSpill(e.slot, !0)));
		}
		refill(e) {
			let t = this.#t.get(e);
			if (!t || t.slot < 0) return 0;
			for (; t.chunks.length; ) {
				let e = t.chunks[0],
					n = this.rings.write(t.slot, e);
				if (((t.buffered -= n), n < e.length)) {
					t.chunks[0] = e.subarray(n);
					break;
				}
				t.chunks.shift();
			}
			return (this.rings.setSpill(t.slot, t.chunks.length > 0), 1);
		}
		status(e) {
			let t = this.rings?.statusOf(e);
			if (t !== void 0) return t;
			let n = this.#t.get(e);
			return n
				? (n.state === M && n.chunks.length && (n.state = N), n.state)
				: P;
		}
		send(t, n) {
			let r = this.#t.get(t);
			return !r || !r.wisp || r.state === P || r.state === F
				? -1
				: ((r.sends = (r.sends ?? 0) + 1),
					(r.firstSend ||= performance.now()),
					e(`debug`) &&
						console.info(
							`[wisp] stream ${t}: send ${r.sends}, ${n.length} bytes at ${(performance.now() / 1e3).toFixed(1)}s`,
						),
					r.wisp.send(n.slice()),
					n.length);
		}
		recv(e, t) {
			let n = this.rings?.recv(e, t, !1, () => this.refill(e));
			if (n !== void 0) return n;
			let r = this.#t.get(e);
			return r
				? r.chunks.length
					? r.take(t)
					: r.state === P || r.state === F
						? 0
						: -1
				: 0;
		}
		peek(e, t) {
			let n = this.rings?.recv(e, t, !0, () => this.refill(e));
			if (n !== void 0) return n;
			let r = this.#t.get(e);
			return r
				? r.chunks.length
					? r.peek(t)
					: r.state === P || r.state === F
						? 0
						: -1
				: 0;
		}
		available(e) {
			let t = this.rings?.available(e);
			if (t !== void 0) return t;
			let n = this.#t.get(e);
			return !n || n.chunks.length > 0 || n.state === P || n.state === F;
		}
		dup(e) {
			let t = this.#t.get(e);
			return t ? (t.refs++, 1) : 0;
		}
		close(e) {
			let t = this.#t.get(e);
			if (t && !(--t.refs > 0)) {
				try {
					t.wisp?.close();
				} catch {}
				(this.#t.delete(e), t.slot >= 0 && this.rings?.release(t.slot));
			}
		}
	};
export { z as WispNetwork };
