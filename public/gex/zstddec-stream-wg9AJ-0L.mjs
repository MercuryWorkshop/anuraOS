import { p as e, u as t } from "./internal-DhuCGrNL.mjs";
var n,
	r,
	i,
	a,
	o = {
		env: {
			emscripten_notify_memory_growth: (e) => {
				((i = new Uint8Array(r.exports.memory.buffer)),
					(a = new DataView(i.buffer)));
			},
		},
	},
	s = class {
		init() {
			if (n) return n;
			let r = new URL("./zstddec-x1VHh1jj.wasm?no-inline", import.meta.url);
			return (
				(n =
					typeof process < `u` && r.protocol === `file:`
						? t(
								() =>
									import(`./__vite-browser-external-6NL05v10.mjs`)
										.then((t) => e(t.default, 1))
										.then((e) => e.readFile(r)),
								[],
								import.meta.url,
							)
								.then((e) => WebAssembly.instantiate(e, o))
								.then(this._init)
						: fetch(r)
								.then((e) => {
									if (!e.ok) throw Error(`${r}: ${e.status}`);
									return e.arrayBuffer();
								})
								.then((e) => WebAssembly.instantiate(e, o))
								.then(this._init)),
				n
			);
		}
		dispose() {
			r = i = a = n = void 0;
		}
		_init(e) {
			((r = e.instance), o.env.emscripten_notify_memory_growth(0));
		}
		decode(e, t = 0) {
			if (!r) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
			let n = e.byteLength,
				a = r.exports.malloc(n);
			if (
				(i.set(e, a),
				t === 0 && (t = Number(r.exports.ZSTD_findDecompressedSize(a, n))),
				t === -1)
			) {
				r.exports.free(a);
				let t = [];
				for (let n of this.decodeStreaming([e])) t.push(n);
				if (t.length === 1) return t[0];
				let n = t.reduce((e, t) => e + t.byteLength, 0),
					i = new Uint8Array(n),
					o = 0;
				for (let e of t) (i.set(e, o), (o += e.byteLength));
				return i;
			}
			let o = r.exports.malloc(t),
				s = r.exports.ZSTD_decompress(o, t, a, n),
				c = i.slice(o, o + s);
			return (r.exports.free(a), r.exports.free(o), c);
		}
		stream() {
			if (!r) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
			let e = r.exports.ZSTD_DStreamOutSize(),
				t = r.exports.malloc(e),
				n = r.exports.ZSTD_createDCtx(),
				o = r.exports.malloc(12),
				s = r.exports.malloc(12),
				c = 0,
				l = 0,
				u = 0;
			return {
				push(d, f) {
					for (
						d.byteLength > l &&
							(u && r.exports.free(u),
							(l = d.byteLength),
							(u = r.exports.malloc(l))),
							i.set(d, u),
							a.setInt32(o, u, !0),
							a.setInt32(o + 4, d.byteLength, !0),
							a.setInt32(o + 8, 0, !0);
						a.getUint32(o + 8, !0) < a.getUint32(o + 4, !0);
					) {
						if (
							(a.setInt32(s, t, !0),
							a.setInt32(s + 4, e, !0),
							a.setInt32(s + 8, 0, !0),
							(c = r.exports.ZSTD_decompressStream(n, s, o)),
							c > 4294967040)
						)
							throw Error(`ZSTD_decompressStream: error ${c}`);
						let l = a.getUint32(s + 8, !0);
						l && f(i.subarray(t, t + l));
					}
				},
				end() {
					if (
						(u && r.exports.free(u),
						r.exports.ZSTD_freeDCtx(n),
						r.exports.free(t),
						r.exports.free(o),
						r.exports.free(s),
						c !== 0)
					)
						throw Error(`Incomplete stream, more data expected.`);
				},
			};
		}
		*decodeStreaming(e) {
			if (!r) throw Error(`ZSTDDecoder: Await .init() before decoding.`);
			let t = r.exports.ZSTD_DStreamInSize(),
				n = r.exports.malloc(t),
				o = r.exports.ZSTD_DStreamOutSize(),
				s = r.exports.malloc(o),
				c = r.exports.ZSTD_createDCtx(),
				l = r.exports.malloc(12),
				u = r.exports.malloc(12),
				d = 0;
			for (let t of e) {
				let e = r.exports.malloc(t.byteLength);
				for (
					i.set(t, e),
						a.setInt32(l, e, !0),
						a.setInt32(l + 4, t.byteLength, !0),
						a.setInt32(l + 4 + 4, 0, !0);
					a.getUint32(l + 4 + 4, !0) < a.getUint32(l + 4, !0);
				) {
					(a.setInt32(u, s, !0),
						a.setInt32(u + 4, o, !0),
						a.setInt32(u + 4 + 4, 0, !0),
						(d = r.exports.ZSTD_decompressStream(c, u, l)));
					let e = a.getUint32(u + 4 + 4, !0);
					yield i.slice(s, s + e);
				}
				r.exports.free(e);
			}
			if (
				(r.exports.ZSTD_freeDCtx(c),
				r.exports.free(n),
				r.exports.free(s),
				r.exports.free(l),
				r.exports.free(u),
				d !== 0)
			)
				throw Error(`Incomplete stream, more data expected.`);
		}
	};
export { s as ZSTDDecoder };
