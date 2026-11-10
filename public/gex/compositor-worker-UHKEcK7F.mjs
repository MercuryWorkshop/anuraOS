var e = Object.defineProperty,
	t = (e, t, n) => () => {
		if (n) throw n[0];
		try {
			return (e && (t = e((e = 0))), t);
		} catch (e) {
			throw ((n = [e]), e);
		}
	},
	n = (t, n) => {
		let r = {};
		for (var i in t) e(r, i, { get: t[i], enumerable: !0 });
		return (n || e(r, Symbol.toStringTag, { value: `Module` }), r);
	};
function r() {
	if (u || typeof GPUDevice > `u`) return;
	u = !0;
	let e = (e, t, n) => {
			let r = l.get(t);
			(r || l.set(t, (r = { n: 0, bytes: 0, made: 0, destroyed: 0, each: n })),
				r.n++,
				r.made++,
				(r.bytes += n),
				c.set(e, t));
		},
		t = (e) => {
			let t = c.get(e);
			if (t === void 0) return;
			c.delete(e);
			let n = l.get(t);
			(n.n--, n.destroyed++, (n.bytes -= n.each));
		},
		n = GPUDevice.prototype.createTexture;
	GPUDevice.prototype.createTexture = function (t) {
		let r = n.call(this, t),
			[i, a = 1, o = 1] = Array.isArray(t.size)
				? t.size
				: [t.size.width, t.size.height ?? 1, t.size.depthOrArrayLayers ?? 1],
			s =
				i *
				a *
				o *
				(f[t.format] ?? 4) *
				(t.sampleCount ?? 1) *
				((t.mipLevelCount ?? 1) > 1 ? 1.34 : 1);
		return (
			e(
				r,
				`texture ${i}x${a}x${o} ${t.format} usage 0x${t.usage.toString(16)}${(t.sampleCount ?? 1) > 1 ? ` x${t.sampleCount}` : ``}`,
				Math.round(s),
			),
			r
		);
	};
	let r = GPUDevice.prototype.createBuffer;
	GPUDevice.prototype.createBuffer = function (t) {
		let n = r.call(this, t);
		return (
			e(n, `buffer ${t.size} usage 0x${t.usage.toString(16)}`, t.size),
			n
		);
	};
	let i = (e, t, n) => {
			let r = e?.[t];
			typeof r != `function` ||
				!globalThis.GEX_GPU_CALLS ||
				(e[t] = function (...e) {
					let i = d.get(t);
					if ((i || d.set(t, (i = [0, 0])), i[0]++, n))
						try {
							i[1] += n(e) || 0;
						} catch {}
					return r.apply(this, e);
				});
		},
		a = (e) => {
			let t = e[2] ?? e[3];
			return Array.isArray(t)
				? t[0] * (t[1] ?? 1) * 4
				: (t?.width ?? 0) * (t?.height ?? 1) * 4;
		};
	(i(GPUQueue.prototype, `writeBuffer`, (e) =>
		e[4] === void 0
			? (e[2]?.byteLength ?? 0)
			: e[4] * (e[2]?.BYTES_PER_ELEMENT ?? 1),
	),
		i(GPUQueue.prototype, `writeTexture`, (e) => e[1]?.byteLength ?? 0),
		i(GPUQueue.prototype, `copyExternalImageToTexture`, a),
		i(GPUQueue.prototype, `submit`),
		i(globalThis.GPUCanvasContext?.prototype, `getCurrentTexture`),
		i(GPUTexture.prototype, `createView`),
		i(GPUBuffer.prototype, `mapAsync`),
		i(GPUBuffer.prototype, `getMappedRange`),
		i(GPUCommandEncoder.prototype, `copyTextureToTexture`, a),
		i(GPUCommandEncoder.prototype, `copyTextureToBuffer`, a),
		i(GPUCommandEncoder.prototype, `copyBufferToTexture`, a),
		i(GPUCommandEncoder.prototype, `beginRenderPass`),
		i(GPUCommandEncoder.prototype, `beginComputePass`));
	for (let e of [
		`createBindGroup`,
		`createCommandEncoder`,
		`createQuerySet`,
		`createSampler`,
		`createShaderModule`,
		`createRenderPipeline`,
		`createComputePipeline`,
		`importExternalTexture`,
		`createBindGroupLayout`,
		`createPipelineLayout`,
	])
		i(GPUDevice.prototype, e);
	for (let e of [GPUTexture.prototype, GPUBuffer.prototype]) {
		let n = e.destroy;
		e.destroy = function () {
			return (t(this), n.call(this));
		};
	}
}
function i(e = 8) {
	let t = 0,
		n = 0;
	for (let e of l.values()) ((t += e.n), (n += e.bytes));
	let r = [...l.entries()]
			.filter(([, e]) => e.n > 0)
			.sort((e, t) => t[1].bytes - e[1].bytes)
			.slice(0, e)
			.map(
				([e, t]) =>
					`${e}: ${t.n} live (${(t.bytes / 1048576).toFixed(1)} MiB), ${t.made} made, ${t.destroyed} destroyed`,
			),
		i = Object.fromEntries(
			[...d.entries()].map(([e, [t, n]]) => [
				e,
				n ? [t, +(n / 1048576).toFixed(1)] : t,
			]),
		);
	return {
		tracking: u,
		objects: t,
		mib: +(n / 1048576).toFixed(1),
		calls: i,
		rows: r,
	};
}
function a() {
	return (
		(s ??= (async () => {
			if (!navigator.gpu) throw Error(`navigator.gpu unavailable`);
			r();
			let e = null;
			for (let t = 0; t < 20 && !e; t++)
				((e = await navigator.gpu.requestAdapter({
					powerPreference: `high-performance`,
				})),
					e || (await new Promise((e) => setTimeout(e, 250))));
			if (!e) throw Error(`WebGPU adapter unavailable`);
			let t = [
					`texture-compression-bc`,
					`depth32float-stencil8`,
					`rg11b10ufloat-renderable`,
					`depth-clip-control`,
					`float32-filterable`,
					`float32-blendable`,
					`clip-distances`,
					`dual-source-blending`,
					`timestamp-query`,
				].filter((t) => e.features.has(t)),
				n = {
					maxUniformBuffersPerShaderStage: 16,
					maxStorageBuffersPerShaderStage: 16,
					maxStorageBuffersInVertexStage: 16,
					maxStorageBuffersInFragmentStage: 16,
					maxColorAttachmentBytesPerSample: 64,
				},
				i = globalThis.GEX_GL_LIMITS,
				a = i === void 0 ? 43 : Number(i) || 0;
			if (
				(a >= 41 &&
					Object.assign(n, {
						maxTextureDimension1D: 16384,
						maxTextureDimension2D: 16384,
						maxTextureDimension3D: 2048,
						maxTextureArrayLayers: 2048,
					}),
				a >= 43)
			)
				for (let e of [
					`maxComputeInvocationsPerWorkgroup`,
					`maxComputeWorkgroupSizeX`,
					`maxComputeWorkgroupSizeY`,
					`maxComputeWorkgroupSizeZ`,
					`maxComputeWorkgroupStorageSize`,
					`maxComputeWorkgroupsPerDimension`,
				])
					n[e] = 1 / 0;
			let o = {};
			for (let [t, r] of Object.entries(n)) {
				let n = e.limits[t];
				typeof n == `number` && n > 0 && (o[t] = Math.min(n, r));
			}
			let s = await e.requestDevice({ requiredFeatures: t, requiredLimits: o });
			return (
				(globalThis.__gexWebGPU ||= []).push({
					adapter: e,
					device: s,
					queue: s.queue,
				}),
				{ adapter: e, device: s }
			);
		})()),
		s.catch(() => {
			s = null;
		}),
		s
	);
}
function o() {
	let e = new OffscreenCanvas(16, 16),
		t = null,
		n = null,
		r = 0,
		i = {
			canvas: e,
			configure(e) {
				t = e;
			},
			unconfigure() {
				t = null;
			},
			getConfiguration() {
				return t;
			},
			getCurrentTexture() {
				if (!t) throw Error(`the GL canvas is not configured`);
				return (
					(!n ||
						n.width !== e.width ||
						n.height !== e.height ||
						n.format !== t.format) &&
						(n?.destroy(),
						(n = t.device.createTexture({
							size: [e.width, e.height],
							format: t.format,
							usage:
								(t.usage ?? GPUTextureUsage.RENDER_ATTACHMENT) |
								GPUTextureUsage.TEXTURE_BINDING |
								GPUTextureUsage.COPY_DST |
								GPUTextureUsage.COPY_SRC,
							viewFormats: t.viewFormats ?? [],
						}))),
					r++,
					n
				);
			},
		},
		a = e.getContext.bind(e);
	return (
		(e.getContext = (e, t) => (e === `webgpu` ? i : a(e, t))),
		{ canvas: e, texture: () => n, serial: () => r }
	);
}
var s,
	c,
	l,
	u,
	d,
	f,
	p = t(() => {
		((s = null),
			(c = new Map()),
			(l = new Map()),
			(u = !1),
			(d = new Map()),
			(f = {
				rgba8unorm: 4,
				bgra8unorm: 4,
				"rgba8unorm-srgb": 4,
				"bgra8unorm-srgb": 4,
				depth24plus: 4,
				"depth24plus-stencil8": 4,
				depth32float: 4,
				"depth32float-stencil8": 8,
				rgba16float: 8,
				rgba32float: 16,
				r8unorm: 1,
				rg8unorm: 2,
				r32float: 4,
				depth16unorm: 2,
			}));
	});
p();
const m = { on: !1 };
WebAssembly.Suspending;
const h =
	typeof process == `object` &&
	!!process.versions?.node &&
	typeof setImmediate == `function`;
var g = class {
	constructor(e, t, n) {
		((this.resolve = e),
			(this.futex = t),
			(this.fiber = n),
			(this.timer = 0),
			(this.done = !1),
			(this.words = null),
			(this.at = 0),
			(this.seq = 0));
	}
};
const _ = new (class {
		#e = new Set();
		#t = new Map();
		#n = new Set();
		#r = [];
		#i = [];
		#a = !1;
		#o = null;
		#s = performance.now();
		stats = {
			parks: 0,
			futexParks: 0,
			wakes: 0,
			yields: 0,
			macroTurns: 0,
			timeouts: 0,
			flushes: 0,
		};
		constructor() {
			typeof MessageChannel == `function` &&
				((this.#o = new MessageChannel()),
				(this.#o.port1.onmessage = () => this.#c()),
				this.#o.port1.start?.(),
				this.#o.port1.unref?.());
		}
		#c() {
			((this.#a = !1),
				this.#o?.port1.unref?.(),
				(this.#s = performance.now()),
				this.stats.macroTurns++);
			let e = this.#r,
				t = this.#i;
			((this.#r = []), (this.#i = []));
			for (let e of t) e();
			for (let t of e) t();
		}
		#l() {
			if (!this.#a) {
				if (((this.#a = !0), h)) {
					setImmediate(() => this.#c());
					return;
				}
				(this.#o?.port1.ref?.(),
					this.#o
						? this.#o.port2.postMessage(0)
						: setTimeout(() => this.#c(), 0));
			}
		}
		sliceOver() {
			return performance.now() - this.#s >= 8;
		}
		#u(e) {
			this.sliceOver() ? (this.#r.push(e), this.#l()) : e();
		}
		#d(e, t) {
			if (!e.done) {
				if (((e.done = !0), e.timer && clearTimeout(e.timer), e.words))
					this.#n.delete(e);
				else if (e.futex === null) this.#e.delete(e);
				else {
					let t = this.#t.get(e.futex);
					(t?.delete(e), t && !t.size && this.#t.delete(e.futex));
				}
				(this.#i.push(() => {
					e.fiber?.dead || e.resolve(t);
				}),
					this.#l());
			}
		}
		#f() {
			if (!this.#i.length) return;
			this.stats.flushes++;
			let e = this.#i;
			this.#i = [];
			for (let t of e) this.#u(t);
		}
		#p(e, t, n, r = null) {
			return (
				this.checkSlots(),
				new Promise((i) => {
					let a = new g(i, e, n);
					if (r)
						((a.words = r.words),
							(a.at = r.at),
							(a.seq = r.seq),
							this.#n.add(a));
					else if (e === null) this.#e.add(a);
					else {
						let t = this.#t.get(e);
						(t || this.#t.set(e, (t = new Set())), t.add(a));
					}
					let o = Number(t),
						s = Math.max(0, o / 1e6);
					(o >= 0 &&
						Number.isFinite(s) &&
						s < 2 ** 31 &&
						(a.timer = setTimeout(() => {
							(this.stats.timeouts++, this.#d(a, 2));
						}, s)),
						this.#f());
				})
			);
		}
		parkSlot(e, t, n, r, i = null) {
			return Atomics.load(e(), t) === n
				? ((this.stats.slotParks = (this.stats.slotParks ?? 0) + 1),
					this.#p(null, r, i, { words: e, at: t, seq: n }))
				: 1;
		}
		checkSlots() {
			if (this.#n.size)
				for (let e of [...this.#n])
					Atomics.load(e.words(), e.at) !== e.seq && this.#d(e, 0);
		}
		park(e, t = null) {
			return (this.stats.parks++, this.#p(null, e, t));
		}
		wake() {
			if (!(!this.#e.size && !this.#n.size)) {
				this.stats.wakes++;
				for (let e of [...this.#e]) this.#d(e, 0);
				for (let e of [...this.#n]) this.#d(e, 0);
			}
		}
		drop(e) {
			for (let t of [...this.#n])
				t.fiber === e &&
					((t.done = !0), clearTimeout(t.timer), this.#n.delete(t));
			for (let t of [...this.#e])
				t.fiber === e &&
					((t.done = !0), clearTimeout(t.timer), this.#e.delete(t));
			for (let [t, n] of this.#t) {
				for (let t of [...n])
					t.fiber === e && ((t.done = !0), clearTimeout(t.timer), n.delete(t));
				n.size || this.#t.delete(t);
			}
		}
		maybeYield(e = null) {
			return (
				this.checkSlots(),
				this.sliceOver()
					? (this.stats.yields++,
						new Promise((t) => {
							(this.#r.push(() => {
								e?.dead || t(0);
							}),
								this.#l());
						}))
					: 0
			);
		}
		yieldNow(e = null) {
			return (
				this.checkSlots(),
				this.#i.length
					? (this.stats.yields++, this.#f(), Promise.resolve(0))
					: this.maybeYield(e)
			);
		}
		get parked() {
			let e = this.#e.size + this.#n.size;
			for (let t of this.#t.values()) e += t.size;
			return e;
		}
	})(),
	v = (e, t) => (e[t + 8] >>> 0) + (e[t + 37] >>> 0) * 4294967296,
	y = (e) => 8 + e * 2440,
	ee = (e) => 78088 + e * 514;
function te(e, t, n, r) {
	let i = new Int32Array(e.arena),
		a = [Atomics.load(i, 0), Atomics.load(i, 1)];
	if (
		(Atomics.store(i, 0, t | 0),
		Atomics.store(i, 1, n | 0),
		r && Atomics.store(i, 3, Math.max(1, r | 0)),
		!(!a[0] || (a[0] === (t | 0) && a[1] === (n | 0))))
	)
		for (let t = 0; t < 32; t++) Atomics.load(i, y(t) + 0) && me(e, i, t);
}
async function ne(e, t) {
	if (
		typeof Atomics.waitAsync != `function` ||
		!(e.arena instanceof SharedArrayBuffer)
	)
		return null;
	let n = new Int32Array(e.arena),
		r = t ?? Atomics.load(n, 2),
		i = Atomics.waitAsync(n, 2, r);
	return (i.async && (await i.value), Atomics.load(n, 2));
}
const re = new TextDecoder(),
	ie = new Uint8Array(32);
function ae(e, { onlyChanged: t = !1 } = {}) {
	let n = new Int32Array(e.arena),
		r = !!e.pixels,
		i = [],
		a = [],
		o = Date.now();
	for (let e = 0; e < 32; e++) {
		let s = y(e),
			c = Atomics.load(n, s + 0);
		if (!c) continue;
		let l = Atomics.load(n, s + 3),
			u = Atomics.load(n, s + 4),
			d = Atomics.load(n, s + 1);
		if (
			(a.push({
				block: e,
				token: c,
				gen: l,
				ack: u,
				beat: d,
				stale: o - d > 5e3,
			}),
			t && l === u)
		)
			continue;
		let f = Math.min(Atomics.load(n, s + 2), 64);
		for (let t = 0; t < f; t++) {
			let a = s + 8 + t * 38,
				o = ie;
			for (let e = 0; e < 8; e++) {
				let t = n[a + 18 + e];
				((o[e * 4] = t & 255),
					(o[e * 4 + 1] = (t >>> 8) & 255),
					(o[e * 4 + 2] = (t >>> 16) & 255),
					(o[e * 4 + 3] = (t >>> 24) & 255));
			}
			let l = o.indexOf(0);
			(l < 0 && (l = o.length),
				i.push({
					token: c,
					block: e,
					client: n[a + 0],
					surface: n[a + 1],
					role: n[a + 2],
					parent: n[a + 3],
					relX: n[a + 4],
					relY: n[a + 5],
					width: n[a + 6],
					height: n[a + 7],
					addr: r ? n[a + 8] >>> 0 : v(n, a),
					pix: r ? n[a + 37] >>> 0 : 0,
					stride: n[a + 9],
					format: n[a + 10],
					serial: n[a + 11] >>> 0,
					damage: { x: n[a + 12], y: n[a + 13], w: n[a + 14], h: n[a + 15] },
					flags: n[a + 16],
					xid: n[a + 17] >>> 0,
					external: !!(n[a + 16] & 2),
					glRect:
						n[a + 16] & 2 && n[a + 27]
							? {
									x: (n[a + 26] << 16) >> 16,
									y: n[a + 26] >> 16,
									w: n[a + 27] & 65535,
									h: n[a + 27] >>> 16,
								}
							: null,
					title: l ? re.decode(o.subarray(0, l)) : ``,
					placed: !!(n[a + 28] & 1),
					unmanaged: !!(n[a + 28] & 2),
					layer: (n[a + 28] >> 8) & 255,
					stackId: n[a + 29] >>> 0,
					below: n[a + 30] >>> 0,
					restack: n[a + 31] >>> 0,
					activate: n[a + 32] >>> 0,
					input:
						n[a + 16] & 128
							? { x: n[a + 33], y: n[a + 34], w: n[a + 35], h: n[a + 36] }
							: null,
				}));
		}
	}
	return { surfaces: i, blocks: a };
}
function oe(e, t) {
	let n = new Int32Array(e.arena),
		r = 0;
	for (let e = 0; e < 32; e++) {
		let i = y(e);
		!t ||
			Atomics.load(n, i + 0) !== t ||
			(Atomics.store(n, i + 2, 0),
			Atomics.compareExchange(n, i + 0, t, 0) === t && r++);
	}
	return r;
}
function se() {
	return new Int32Array(64);
}
const ce = new WeakMap();
function le(e) {
	let t = ce.get(e.arena);
	return (t || ce.set(e.arena, (t = new Int32Array(e.arena))), t);
}
function ue(e, t) {
	e.fill(0);
	for (let n of t) ((e[2 * n.block] = n.token), (e[2 * n.block + 1] = n.gen));
}
function de(e, t) {
	let n = le(e);
	for (let e = 0; e < 32; e++) {
		let r = y(e),
			i = Atomics.load(n, r + 0);
		if (i !== t[2 * e]) return !1;
		if (!i) continue;
		let a = Atomics.load(n, r + 3);
		if (a !== t[2 * e + 1] || a !== Atomics.load(n, r + 4)) return !1;
	}
	return !0;
}
function fe(e, t, n) {
	let r = new Int32Array(e.arena);
	Atomics.store(r, y(t) + 4, n);
}
function pe(e, t) {
	t && !e.kernelMemory && (e.kernelMemory = t);
}
function b(e, t, n, r = 0, i = 0, a = 0, o = 0, s = 0, c = 0) {
	let l = new Int32Array(e.arena),
		u = ee(t),
		d = Atomics.load(l, u + 0),
		f = u + 2 + (d % 64) * 8;
	((l[f] = n | 0),
		(l[f + 1] = r | 0),
		(l[f + 2] = i | 0),
		(l[f + 3] = a | 0),
		(l[f + 4] = o | 0),
		(l[f + 5] = s | 0),
		(l[f + 6] = c | 0),
		(l[f + 7] = 0),
		Atomics.store(l, u + 0, d + 1),
		globalThis.__gexEvLog?.push([n, r, i, performance.now()]),
		console.timeStamp(`gex:ev ${n} b${t}`),
		me(e, l, t));
}
function me(e, t, n) {
	let r = Atomics.load(t, y(n) + 5),
		i = Atomics.load(t, y(n) + 6),
		a = e.kernelMemory;
	r && i && a
		? (he(new Int32Array(a.buffer), r >>> 0, i >>> 0), m.on && _.checkSlots())
		: r &&
			i &&
			e.arena instanceof SharedArrayBuffer &&
			(Atomics.or(t, 6, 1 << n), Atomics.add(t, 5, 1), Atomics.notify(t, 5));
}
function he(e, t, n) {
	for (let r = 0; r < 64; r++) {
		let i = Atomics.load(e, (t >>> 2) + r) >>> 0;
		for (; i; ) {
			let t = 31 - Math.clz32(i & -i);
			i &= i - 1;
			let a = (n >>> 2) + r * 32 + t;
			(Atomics.add(e, a, 1),
				e.buffer instanceof SharedArrayBuffer && Atomics.notify(e, a));
		}
	}
}
var x,
	ge = t(() => {
		x = {
			NONE: 0,
			TRUNCATED: 1,
			BAD_OPCODE: 2,
			BAD_ARGUMENT: 3,
			NO_CONTEXT: 4,
			VERSION_MISMATCH: 5,
		};
	});
function _e() {
	return globalThis.GEX_PAGE_SEARCH ?? globalThis.location?.search ?? ``;
}
function ve() {
	return new URLSearchParams(_e());
}
function ye(e) {
	let t = e.replace(/^\//, ``),
		n = globalThis.GEX_ASSET_FILES?.[t];
	if (n) return n;
	let r = globalThis.GEX_ASSET_BASE;
	return r
		? new URL(/* @vite-ignore */ /* webpackIgnore: true */ t, r).href
		: e;
}
function be(e) {
	let t = globalThis.GEX_ASSET_FILES;
	if (!t) return null;
	let n = e.replace(/^\//, ``),
		r = {};
	for (let [e, i] of Object.entries(t))
		e.startsWith(n) && (r[e.slice(n.length)] = i);
	return r;
}
var xe = t(() => {});
function Se(e) {
	return (4 - (e & 3)) & 3;
}
function Ce(e, t, n, r = null) {
	let i = _e(),
		a =
			r ??
			(i
				? new URLSearchParams(i).get(`glcapture`)
				: ({}.GEX_GLCAPTURE ?? null));
	if (!a || a === `0`) return null;
	let o = Number(a),
		s = new De(e, t, n, Number.isFinite(o) && o > 1 ? o : S);
	return ((globalThis.__gexGlCapture = s), s);
}
var we,
	Te,
	Ee,
	S,
	De,
	Oe = t(() => {
		(xe(),
			(we = `GEXGLTR\0`),
			(Te = 1),
			(Ee = 24),
			(S = 67108864),
			(De = class {
				constructor(e, t, n, r = S) {
					let i = new Uint8Array(Ee),
						a = new DataView(i.buffer);
					for (let e = 0; e < 8; e++) i[e] = we.charCodeAt(e);
					(a.setUint32(8, Te, !0),
						a.setUint32(12, e, !0),
						a.setUint32(16, t, !0),
						a.setUint32(20, n, !0),
						(this.parts = [i]),
						(this.bytes = Ee),
						(this.batches = 0),
						(this.maxBytes = r),
						(this.truncated = !1));
				}
				record(e, t) {
					let n = 8 + e.length + Se(e.length);
					if (this.bytes + n > this.maxBytes)
						return ((this.truncated = !0), !1);
					let r = new Uint8Array(n),
						i = new DataView(r.buffer);
					return (
						i.setUint32(0, e.length, !0),
						i.setUint32(4, t, !0),
						r.set(e, 8),
						this.parts.push(r),
						(this.bytes += n),
						this.batches++,
						!0
					);
				}
				toBytes() {
					let e = new Uint8Array(this.bytes),
						t = 0;
					for (let n of this.parts) (e.set(n, t), (t += n.length));
					return e;
				}
				toBase64() {
					let e = this.toBytes(),
						t = ``;
					for (let n = 0; n < e.length; n += 32768)
						t += String.fromCharCode.apply(null, e.subarray(n, n + 32768));
					return btoa(t);
				}
			}));
	});
function ke() {
	if (w === void 0) {
		w = null;
		try {
			typeof window < `u` &&
				window.location?.search &&
				(w = new URLSearchParams(window.location.search).get(`log`));
		} catch {}
	}
	return w;
}
function Ae() {
	let e = globalThis.GEX_LOG ?? {}.GEX_LOG ?? ke();
	return e == null || e === `` || e === `0` ? null : String(e);
}
function C(e) {
	let t = Ae();
	if (t === null || t === `off` || t === `none` || t === `quiet`) return !1;
	if (t === `1` || t === `all`) return !0;
	let n = t.split(`,`);
	return e === void 0 ? n.length > 0 : n.includes(e);
}
var w,
	je = t(() => {}),
	Me,
	Ne = t(() => {
		Me = class {
			constructor({
				first: e = 5,
				every: t = 1e4,
				now: n = () => performance.now(),
				log: r = console.error,
			} = {}) {
				((this.count = 0),
					(this.first = null),
					(this.last = null),
					(this.#e = e),
					(this.#t = t),
					(this.#n = n),
					(this.#r = r));
			}
			#e;
			#t;
			#n;
			#r;
			#i = -1 / 0;
			#a = 0;
			note(e) {
				if (
					(this.count++,
					(this.first ??= e),
					(this.last = e),
					this.count <= this.#e)
				)
					return (
						this.#r(`[mesa-gl] WebGPU validation:`, e),
						this.count === this.#e && (this.#i = this.#n()),
						!0
					);
				this.#a++;
				let t = this.#n();
				return t - this.#i < this.#t
					? !1
					: (this.#r(
							`[mesa-gl] WebGPU validation: ${this.#a} more (${this.count} in all), the last:`,
							e,
						),
						(this.#a = 0),
						(this.#i = t),
						!0);
			}
			summary() {
				return this.count
					? `validation=${this.count} (first: ${this.first}) `
					: ``;
			}
		};
	});
function Pe(e, t) {
	return e > t ? { len: t, cut: e - t } : { len: e, cut: 0 };
}
var Fe = t(() => {}),
	Ie = n({
		D3D_MAGIC: () => Ge,
		D3D_PROTOCOL_VERSION: () => 1,
		MesaGlDevice: () => Ke,
	});
async function Le(e) {
	try {
		return (await import(/* @vite-ignore */ /* webpackIgnore: true */ e))
			.default;
	} catch {}
	let t = await fetch(e, { cache: `no-store` });
	if (!t.ok) throw Error(`${e}: ${t.status} ${t.statusText}`);
	let n = URL.createObjectURL(
		new Blob([await t.text()], { type: `text/javascript` }),
	);
	try {
		return (await import(/* @vite-ignore */ /* webpackIgnore: true */ n))
			.default;
	} finally {
		URL.revokeObjectURL(n);
	}
}
async function Re(e, t) {
	let n = new URL(/* @vite-ignore */ /* webpackIgnore: true */ e, location.href)
			.href,
		r = n.split(`/`).pop().replace(/\.js$/, ``),
		[i, a, o] = await Promise.all(
			[`${r}.js`, `${r}.wasm`, `${r}.deferred.wasm`].map((e) =>
				Promise.resolve()
					.then(() => t(e))
					.catch(
						(t) => (
							console.warn(
								`[mesa-gl] ${e}: ${t?.message ?? t}; fetched as a file`,
							),
							null
						),
					),
			),
		);
	if (!i) return null;
	let s = new TextDecoder()
			.decode(i)
			.replaceAll(`import.meta.url`, JSON.stringify(n)),
		c = new Blob([s], { type: `text/javascript` }),
		l = URL.createObjectURL(c),
		u;
	try {
		u = (await import(/* @vite-ignore */ /* webpackIgnore: true */ l)).default;
	} finally {
		URL.revokeObjectURL(l);
	}
	let d = { mainScriptUrlOrBlob: c },
		f,
		p = new Promise((e, t) => {
			f = t;
		});
	if (a) {
		let e = await WebAssembly.compile(a),
			t = WebAssembly.Module.imports(e).some((e) => e.module === `gexcold`);
		if (!t || o) {
			let n = t ? await WebAssembly.compile(o) : null;
			((d.gexNoColdPrefetch = !0),
				(d.instantiateWasm = (t, r) => {
					let i = () => {
							throw Error(
								`Mesa's cold part was not instantiated with the module`,
							);
						},
						a = new Proxy(t, {
							get: (e, t) => (t === `gexcold` ? { load: i } : e[t]),
						});
					return (
						(async () => {
							let t = await WebAssembly.instantiate(e, a);
							(n && (await WebAssembly.instantiate(n, { primary: t.exports })),
								r(t, e));
						})().catch((e) =>
							f(Error(`instantiating Mesa failed: ${e?.message ?? e}`)),
						),
						{}
					);
				}));
		}
	}
	return { factory: u, extra: d, failed: p };
}
function T() {
	if (T.done || typeof GPUQueue > `u`) return;
	T.done = !0;
	let e = (e) => {
			let t = j.get(e);
			return (t || j.set(e, (t = [0, 0, 0, 0])), t);
		},
		t = (t, n, r) => {
			let i = t?.[n];
			typeof i == `function` &&
				(t[n] = function (...t) {
					let a = performance.now(),
						o = i.apply(this, t),
						s = e(n);
					if ((s[0]++, (s[1] += performance.now() - a), r))
						try {
							s[2] += r(t) || 0;
						} catch {}
					return (
						o &&
							typeof o.then == `function` &&
							o.then(
								() => {
									s[3] += performance.now() - a;
								},
								() => {},
							),
						o
					);
				});
		},
		n = (e, t, n) => {
			let r = e?.BYTES_PER_ELEMENT ?? 1;
			return n === void 0 ? (e?.byteLength ?? 0) - (t ?? 0) * r : n * r;
		};
	(t(GPUQueue.prototype, `writeBuffer`, (e) => n(e[2], e[3], e[4])),
		t(GPUQueue.prototype, `writeTexture`, (e) => e[1]?.byteLength ?? 0),
		t(GPUQueue.prototype, `submit`),
		t(GPUQueue.prototype, `onSubmittedWorkDone`),
		t(GPUCommandEncoder.prototype, `finish`),
		t(GPUCommandEncoder.prototype, `beginRenderPass`),
		t(GPUCommandEncoder.prototype, `copyBufferToBuffer`),
		t(GPUCommandEncoder.prototype, `copyBufferToTexture`),
		t(GPUCommandEncoder.prototype, `copyTextureToTexture`),
		t(GPUDevice.prototype, `createCommandEncoder`),
		t(GPUDevice.prototype, `createBindGroup`),
		t(GPUDevice.prototype, `createBuffer`, (e) => e[0]?.size ?? 0),
		t(GPUDevice.prototype, `createTexture`),
		t(GPUDevice.prototype, `createRenderPipeline`),
		t(GPUBuffer.prototype, `mapAsync`),
		t(GPURenderPassEncoder.prototype, `draw`),
		t(GPURenderPassEncoder.prototype, `drawIndexed`),
		t(GPURenderPassEncoder.prototype, `setBindGroup`),
		t(GPURenderPassEncoder.prototype, `setPipeline`));
}
function ze(e) {
	try {
		return globalThis.document !== void 0 && ve().get(e) === `1`;
	} catch {
		return !1;
	}
}
function Be(e, t) {
	if (t) return e;
	let n = new Map();
	return (t) => {
		let r = /^gex-wgpu: ([a-z -]{4,40}?)(?: --|:| [0-9])/.exec(String(t));
		if (r) {
			let e = performance.now(),
				t = n.get(r[1]);
			if (t !== void 0 && e - t < 6e4) return;
			n.set(r[1], e);
		}
		e(t);
	};
}
function Ve(e, t, n) {
	return new Promise((r, i) => {
		let a = indexedDB.open(`gex-wgsl-cache`, 1);
		((a.onupgradeneeded = () => a.result.createObjectStore(`blobs`)),
			(a.onerror = () => i(a.error)),
			(a.onsuccess = () => {
				let o = a.result,
					s = o.transaction(`blobs`, e === `get` ? `readonly` : `readwrite`),
					c =
						e === `get`
							? s.objectStore(`blobs`).get(t)
							: s.objectStore(`blobs`).put(n, t);
				((c.onsuccess = () => r(c.result)),
					(c.onerror = () => i(c.error)),
					(s.oncomplete = () => o.close()));
			}));
	});
}
var E,
	He,
	D,
	Ue,
	O,
	k,
	A,
	We,
	Ge,
	j,
	Ke,
	qe = t(() => {
		(ge(),
			Oe(),
			xe(),
			je(),
			Ne(),
			Fe(),
			(E = 0),
			(He = 1),
			(D = 2),
			(Ue = 3),
			(O = 4),
			(k = 5),
			(A = 6),
			(We = 7),
			(Ge = 1144210503),
			(j = new Map()),
			(Ke = class e {
				#e = null;
				#t = null;
				#n = null;
				#r = null;
				#i = null;
				#a = null;
				#o = new Me();
				#s = 0;
				#c = 0;
				#l = ``;
				#u = ``;
				#d = 0;
				#f = 0;
				#p = 0;
				#m = 0;
				#h = 0;
				#g = 0;
				#_ = !1;
				#v = [];
				#y = [];
				#b = !1;
				#x = 0;
				#S = 0;
				static #C = !1;
				static async create(t, n = {}) {
					let {
							api: r = `es`,
							major: i = 0,
							minor: o = 0,
							url: s = ye(`/gex/gex-wgpu-replay.js`),
						} = n,
						c = new e();
					t.id = `gex-gl`;
					try {
						let { adapter: e, device: l } = n.gpu ?? (await a());
						((c.#e = e), (c.#t = l), (n.wgpuStats ?? ze(`wgpustats`)) && T());
						{
							let e = l.destroy.bind(l);
							l.destroy = () => {
								(console.error(
									`[mesa-gl] the WebGPU device is being destroyed`,
									Error(`destroy`).stack,
								),
									e());
							};
						}
						(l.lost.then((e) => {
							let t = `${e.reason}: ${e.message}`;
							(console.error(`[mesa-gl] WebGPU device lost:`, t),
								(c.#a ||= `WebGPU device lost: ${t}`));
						}),
							l.addEventListener(`uncapturederror`, (e) => {
								c.#o.note(e.error?.message || String(e.error));
							}));
						let u = performance.now(),
							d = n.source ? await Re(s, n.source) : null,
							f = (d?.factory ?? (await Le(s)))({
								preinitializedWebGPUDevice: l,
								mainScriptUrlOrBlob: new URL(
									/* @vite-ignore */ /* webpackIgnore: true */ s,
									location.href,
								).href,
								locateFile: (e) =>
									(n.files ?? be(`/gex/`))?.[e] ??
									new URL(
										/* @vite-ignore */ /* webpackIgnore: true */ e,
										new URL(
											/* @vite-ignore */ /* webpackIgnore: true */ s,
											location.href,
										),
									).href,
								print: (e) => C(`debug`) && console.log(`[mesa-gl]`, e),
								printErr: Be(
									(e) => console.warn(`[mesa-gl]`, e),
									n.glTrace ?? ze(`gltrace`),
								),
								...d?.extra,
							});
						((c.#n = await (d ? Promise.race([f, d.failed]) : f)),
							C(`debug`) &&
								console.warn(
									`[mesa-gl] Mesa loaded${d ? ` from the page's files` : ``} in ${Math.round(performance.now() - u)} ms`,
								),
							(c.#r = WebAssembly.promising(c.#n.gexGlSubmitRaw)),
							c.#n.gexD3dSubmitRaw &&
								(c.#i = WebAssembly.promising(c.#n.gexD3dSubmitRaw)),
							c.#n._gex_gl_set_api &&
								c.#n._gex_gl_set_api(+(r === `core`), i, o));
						for (let e of (n.env || ``).split(`,`).filter(Boolean)) {
							if (!c.#n._gex_gl_setenv) break;
							let t = new TextEncoder().encode(`${e}\0`),
								n = c.#n._malloc(t.length);
							(c.#n.HEAPU8.set(t, n), c.#n._gex_gl_setenv(n), c.#n._free(n));
						}
						await c.#E(s, n.wgslCache ?? `all`);
						let p = c.#n._gex_gl_init(t.width, t.height);
						(p !== 0 && (c.#a = `Mesa/WebGPU initialization failed (${p})`),
							(c.#u = `Mesa st/mesa + gex_wgpu on WebGPU (${r})`),
							(c.capture = Ce(13, t.width, t.height, n.capture)));
					} catch (e) {
						c.#a = e?.message || String(e);
					}
					return c;
				}
				#w = null;
				#T = 0;
				async #E(e, t) {
					let n = this.#n;
					if (!n._gex_wgsl_cache_load || t === `0`) return;
					let r = new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ e,
						location.href,
					);
					this.#w = r.href;
					let i = (e, t) => {
						if (!e?.byteLength) return;
						let r = n._malloc(e.byteLength);
						n.HEAPU8.set(new Uint8Array(e), r);
						let i = n._gex_wgsl_cache_load(r, e.byteLength);
						(n._free(r),
							C(`debug`) &&
								console.log(
									`[mesa-gl] shader cache: ${i < 0 ? `refused (another build)` : `${i} translations`} from ${t}`,
								));
					};
					try {
						let e = await fetch(new URL(`gex-wgsl-cache.bin`, r));
						e.ok && i(await e.arrayBuffer(), `the site`);
					} catch {}
					if (t === `site`) {
						this.#w = null;
						return;
					}
					try {
						i(await Ve(`get`, this.#w), `this browser`);
					} catch {}
					let a = setInterval(() => this.#D(), 5e3);
					(globalThis.__gexWgslTimers ||= []).push(a);
				}
				wgslCache(e = !1) {
					let t = this.#n;
					if (!t?._gex_wgsl_cache_dump) return null;
					let n = t._malloc(4),
						r = t._gex_wgsl_cache_dump(+!!e, n),
						i = new Uint32Array(t.HEAPU8.buffer, n, 1)[0];
					if ((t._free(n), !r)) return null;
					let a = t.HEAPU8.slice(r, r + i).buffer;
					return (t._free(r), a);
				}
				wgslStats() {
					let e = this.#n;
					if (!e?._gex_wgsl_cache_stats) return null;
					let t = e._malloc(16);
					e._gex_wgsl_cache_stats(t);
					let [n, r, i, a] = new Uint32Array(e.HEAPU8.buffer, t, 4);
					return (e._free(t), { hits: n, misses: r, loaded: i, held: a });
				}
				async #D() {
					let e = this.wgslStats();
					if (!(!this.#w || !e || e.misses === this.#T)) {
						this.#T = e.misses;
						try {
							await Ve(`put`, this.#w, this.wgslCache());
						} catch {}
					}
				}
				get ok() {
					return this.#n !== null && this.#a === null;
				}
				get error() {
					return this.#a;
				}
				get validationError() {
					return this.#o.first;
				}
				get validationCount() {
					return this.#o.count;
				}
				describe() {
					return this.#a ? `unavailable: ${this.#a}` : this.#u;
				}
				stats() {
					return `${this.#d} submits, ${(this.#f / 1024) | 0} KiB`;
				}
				submit(t, n, r = 0) {
					if (!this.#n) return -1;
					let i = new Uint32Array(t.buffer, n, 8),
						a = i[E] === Ge;
					if ((!a && i[E] !== 1196967239) || (a && !this.#i)) return -1;
					if (i[We] !== (a ? 1 : 13)) return ((i[k] = x.VERSION_MISMATCH), -1);
					let o = i[He],
						s = i[D],
						c = i[Ue];
					if (s > o) return -1;
					let l = performance.now();
					(this.#d++, (this.#f += s));
					let u = new Uint8Array(t.buffer, n + 32, s);
					if (
						!a &&
						this.capture &&
						!this.capture.record(u, c) &&
						!this.capture.posted
					) {
						this.capture.posted = !0;
						let e = this.capture.toBytes();
						((this.capture = null),
							fetch(`/__gex_capture`, { method: `POST`, body: e }).catch(
								() => {},
							));
					}
					let d = a && this.statsOn,
						f = d ? performance.now() : 0,
						p = this.#n._malloc(s || 1);
					s && this.#n.HEAPU8.set(u, p);
					let m = d ? performance.now() : 0,
						h = (e) => {
							d &&
								this.#n._gex_d3d_note_js(
									m - f,
									performance.now() - m,
									+!!this.#n._gex_d3d_reply_len(),
								);
							let i = new Uint32Array(t.buffer, n, 8),
								s = performance.now() - l;
							this.#p += s;
							let u = this.#n,
								h = a ? u._gex_d3d_reply_len : u._gex_gl_reply_len,
								g = a ? u._gex_d3d_reply_data : u._gex_gl_reply_data;
							if (
								((h?.() ?? 0) >= 262144 && (this.#m++, (this.#h += s)),
								s > this.#g && (this.#g = s),
								this.#n._free(p),
								e !== 0)
							) {
								if ((this.#s++, a))
									return (
										(this.#l = `client ${r} D3D stream refused (${e})`),
										console.error(`[mesa-gl] ${this.#l}`),
										(i[k] = x.BAD_OPCODE),
										(i[O] = 0),
										(i[D] = 0),
										(i[A] = 0),
										e
									);
								let t =
									[
										``,
										`short read`,
										`trailing data`,
										`unknown opcode`,
										`no context`,
									][u._gex_gl_reject_why?.() ?? 0] || `refused`;
								return (
									(this.#l = `client ${r} batch rejected (${e}): opcode ${u._gex_gl_reject_op?.() ?? `?`} ${t}, payload ${u._gex_gl_reject_payload?.() ?? `?`}`),
									console.error(`[mesa-gl] ${this.#l}`),
									(i[k] = x.BAD_OPCODE),
									(i[O] = 0),
									(i[D] = 0),
									(i[A] = 0),
									e
								);
							}
							let _ = Pe(h(), c),
								v = _.len;
							if (
								(_.cut &&
									(this.#c++ ||
										console.error(
											`[mesa-gl] client ${r}: a reply ${_.cut} bytes over the ring's ${c}; cut, as natively`,
										)),
								v)
							) {
								let e = g();
								new Uint8Array(t.buffer, n + 32 + o, v).set(
									this.#n.HEAPU8.subarray(e, e + v),
								);
							}
							return ((i[D] = 0), (i[O] = v), (i[k] = x.NONE), (i[A] = 0), 0);
						};
					this.#_ = !0;
					let g = (e) => {
							this.#k();
							let t = h(e);
							return (
								this.#b &&
									((this.#b = !1),
									this.display(),
									this.presentedCount(),
									this.producedCount()),
								t
							);
						},
						_ = (t) => {
							throw (
								this.#k(),
								e.#C ||
									((e.#C = !0),
									String(t?.stack || ``)
										.split(
											`
`,
										)
										.slice(0, 8)
										.forEach((e, t) => {
											let n = e.match(/wasm\.([A-Za-z_][A-Za-z0-9_]*)/);
											console.error(
												`[mesa-gl] frame` +
													t +
													` ` +
													(n ? n[1] : e.trim().slice(0, 52)),
											);
										})),
								t
							);
						},
						v;
					try {
						v = (a ? this.#i : this.#r)(p, s, r >>> 0);
					} catch (e) {
						return _(e);
					}
					return v instanceof Promise ? v.then(g, _) : g(v);
				}
				attachment() {
					let e = this.#n;
					return e?._gex_gl_attached_id
						? {
								kind: e._gex_gl_attached_kind(),
								id: e._gex_gl_attached_id(),
								token: e._gex_gl_attached_token(),
								generation: e._gex_gl_attached_generation(),
							}
						: null;
				}
				surfaces() {
					let e = this.#n;
					if (!e?._gex_gl_surface_count) {
						let e = this.attachment();
						return e && e.id ? [{ ...e, frame: 0, client: e.token }] : [];
					}
					let t = [],
						n = e._gex_gl_surface_count();
					for (let r = 0; r < n; r++)
						t.push({
							kind: e._gex_gl_surface_kind(r),
							id: e._gex_gl_surface_id(r),
							token: e._gex_gl_surface_token(r),
							client: e._gex_gl_surface_client(r),
							frame: e._gex_gl_surface_frame(r),
							width: e._gex_gl_surface_width(r),
							height: e._gex_gl_surface_height(r),
						});
					return t;
				}
				surfaceCanvas(e, t) {
					let n = this.#n;
					if (!(!n?._gex_gl_surface_canvas || !e)) {
						if (this.#_) {
							this.#y.push([e >>> 0, +!!t]);
							return;
						}
						n._gex_gl_surface_canvas(e >>> 0, +!!t);
					}
				}
				forgetClient(e) {
					let t = this.#n;
					if (!(!t?._gex_gl_forget_client || !e)) {
						if (this.#_) {
							(console.log(
								`[mesa-gl] client ${e} exited mid-submit: forgotten after it`,
							),
								this.#v.push(e >>> 0));
							return;
						}
						(t._gex_d3d_forget_client?.(e >>> 0),
							t._gex_gl_forget_client(e >>> 0));
					}
				}
				get statsOn() {
					return (
						this.#O === void 0 && (this.#O = !!this.#n?._gex_d3d_stats_on?.()),
						this.#O
					);
				}
				#O = void 0;
				noteBridge(e, t, n, r, i) {
					this.#_ || this.#n?._gex_d3d_note_bridge?.(e, t, n, r, i);
				}
				get hasD3d() {
					return !!this.#i;
				}
				#k() {
					this.#_ = !1;
					let e = this.#v.splice(0);
					for (let t of e) this.forgetClient(t);
					for (let [e, t] of this.#y.splice(0)) this.surfaceCanvas(e, t);
				}
				display() {
					return this.#_
						? ((this.#b = !0), 0)
						: (this.#n?._gex_gl_display?.() ?? 0);
				}
				presentedCount() {
					return (
						this.#_ || (this.#x = this.#n?._gex_gl_presented?.() ?? 0),
						this.#x
					);
				}
				producedCount() {
					return (
						this.#_ || (this.#S = this.#n?._gex_gl_produced?.() ?? 0),
						this.#S
					);
				}
				attachChannel() {
					return null;
				}
				refresh() {
					return Promise.resolve();
				}
				traceCommands() {}
				glState() {
					return this.ok
						? (this.#s ? `rejects=${this.#s} (${this.#l}) ` : ``) +
								(this.#c ? `reply-cuts=${this.#c} ` : ``) +
								this.#o.summary() +
								`presented=${this.presentedCount()} produced=${this.producedCount()} mesa=1 submits=${this.#d} bytes=${this.#f} submit_ms=${this.#p.toFixed(1)} avg_ms=${(this.#p / Math.max(1, this.#d)).toFixed(3)} max_ms=${this.#g.toFixed(1)} readbacks=${this.#m} readback_ms=${this.#h.toFixed(1)}` +
								this.#j()
						: (this.#a ?? ``);
				}
				#A = { frames: 0, calls: new Map() };
				#j() {
					if (!j.size) return ``;
					let e = this.producedCount(),
						t = Math.max(1, e - this.#A.frames),
						n = [];
					for (let [e, r] of [...j].sort((e, t) => t[1][1] - e[1][1])) {
						let i = this.#A.calls.get(e) ?? [0, 0, 0, 0],
							a = r.map((e, t) => e - i[t]);
						if (!a[0]) continue;
						let o = `${e} ${(a[0] / t).toFixed(1)}/${(a[1] / t).toFixed(2)}ms`;
						(a[2] && (o += `/${(a[2] / t / 1024).toFixed(0)}KiB`),
							a[3] && (o += `/wait ${(a[3] / t).toFixed(2)}ms`),
							n.push(o));
					}
					return (
						(this.#A = {
							frames: e,
							calls: new Map([...j].map(([e, t]) => [e, [...t]])),
						}),
						` wgpu per frame over ${t}: ${n.join(`, `)}`
					);
				}
				commands() {
					return null;
				}
				dispose() {
					((this.#n = null), (this.#r = null));
				}
			}));
	}),
	Je = n({
		GL_RING_BYTES: () => dt,
		GlProxy: () => ht,
		failGlChannel: () => $e,
		makeGlChannel: () => Ze,
		serveGl: () => Qe,
		shownInReply: () => Xe,
	});
function Ye(e) {
	return st + ct * ((e >>> 0) % lt);
}
function Xe(e, t) {
	let n = new Uint32Array(e.buffer, e.byteOffset + t, B / 4),
		r = n[mt];
	if (r < 4) return 0;
	let i = t + B + n[ft] + r;
	return new DataView(e.buffer, e.byteOffset).getUint32(i - 4, !0);
}
function Ze() {
	return {
		control: new SharedArrayBuffer(1600),
		data: new SharedArrayBuffer(dt),
	};
}
function Qe(e, t) {
	let n = new Int32Array(t.control);
	Atomics.store(n, I, 1);
	let r = { buffer: t.data },
		i = new Uint8Array(t.data),
		a = !0,
		o = null,
		s = function () {
			if (o) return o;
			if (Atomics.load(n, M) !== z) return;
			if (e.statsOn) {
				n[L] = 1;
				let r = new Float64Array(t.control, rt, 1)[0];
				e.noteBridge(
					r ? performance.timeOrigin + performance.now() - r : 0,
					Atomics.exchange(n, nt, 0),
					Atomics.exchange(n, it, 0),
					Atomics.exchange(n, at, 0),
					Atomics.exchange(n, ot, 0),
				);
			}
			let a = Atomics.load(n, F) === 1,
				s = Atomics.load(n, N) >>> 0,
				c = (e) => {
					if (!a) {
						((n[et] = e), Atomics.store(n, M, ut), Atomics.notify(n, M));
						return;
					}
					let t = Ye(s);
					((n[t] = s + 1),
						(n[t + 1] = e < 0 ? 0 : Xe(i, 0)),
						(n[t + 2] = +(e < 0)),
						(n[F] = 0),
						Atomics.store(n, M, R),
						Atomics.notify(n, M),
						Atomics.store(n, P, 0),
						Atomics.notify(n, P));
				},
				l;
			try {
				l = e.submit(r, 0, s);
			} catch (e) {
				(console.error(`[gl] the device threw`, e), c(-1));
				return;
			}
			if (l instanceof Promise)
				return (
					(o = l
						.then(c, (e) => {
							(console.error(`[gl] the async device threw`, e), c(-1));
						})
						.finally(() => {
							o = null;
						})),
					o
				);
			c(l);
		};
	return (
		(s.stop = () => {
			((a = !1), Atomics.notify(n, M));
		}),
		typeof Atomics.waitAsync == `function` &&
			((t.direct = !0),
			(async () => {
				for (; a; ) {
					let e = Atomics.load(n, M);
					if (e === z) {
						await s();
						continue;
					}
					let t = Atomics.waitAsync(n, M, e, 1e3);
					t.async && (await t.value);
				}
			})()),
		s
	);
}
function $e(e) {
	if (!e?.control) return;
	let t = new Int32Array(e.control);
	(Atomics.store(t, I, -1), Atomics.notify(t, M), Atomics.notify(t, P));
}
var M,
	et,
	N,
	P,
	F,
	I,
	tt,
	L,
	nt,
	rt,
	it,
	at,
	ot,
	st,
	ct,
	lt,
	R,
	z,
	ut,
	B,
	dt,
	ft,
	pt,
	mt,
	ht,
	gt = t(() => {
		((M = 0),
			(et = 1),
			(N = 2),
			(P = 3),
			(F = 4),
			(I = 5),
			(tt = 6e5),
			(L = 6),
			(nt = 7),
			(rt = 32),
			(it = 10),
			(at = 11),
			(ot = 12),
			(st = 16),
			(ct = 3),
			(lt = 128),
			(R = 0),
			(z = 1),
			(ut = 2),
			(B = 32),
			(dt = 67108896),
			(ft = 1),
			(pt = 2),
			(mt = 4),
			(ht = class {
				#e;
				#t;
				#n;
				#r;
				constructor(e, t) {
					((this.#e = new Int32Array(e.control)),
						(this.#t = new Uint8Array(e.data)),
						(this.#n = new Uint32Array(e.data)),
						(this.#r = t));
				}
				submit(e, t, n = 0, r = !1, i = null) {
					if (this.#e[L] !== 1) return this.#s(e, t, n, r, i);
					let a = performance.now();
					((this.#i = 0), (this.#a = 0));
					try {
						return this.#s(e, t, n, r, i);
					} finally {
						let e = this.#e;
						(Atomics.add(e, nt, Math.round(this.#i * 1e3)),
							Atomics.add(e, it, Math.round(this.#a * 1e3)),
							Atomics.add(e, at, Math.round((performance.now() - a) * 1e3)),
							Atomics.add(e, ot, 1));
					}
				}
				#i = 0;
				#a = 0;
				#o(e, t, n) {
					if (this.#e[L] !== 1) {
						this.#t.set(e.subarray(t, t + B + n), 0);
						return;
					}
					let r = performance.now();
					(this.#t.set(e.subarray(t, t + B + n), 0),
						(this.#a += performance.now() - r),
						(new Float64Array(this.#e.buffer, rt, 1)[0] =
							performance.timeOrigin + performance.now()));
				}
				#s(e, t, n, r, i) {
					let a = new Uint8Array(e.buffer),
						o = new Uint32Array(e.buffer, t, B / 4),
						s = o[ft],
						c = o[pt];
					if (B + c > this.#t.length) return -1;
					let l = this.#e,
						u = n || 1,
						d = Date.now() + 3e4,
						f = 0;
					for (;;) {
						let e = Atomics.compareExchange(l, P, 0, u);
						if (e === 0) break;
						if (
							((f ||= performance.now()),
							Atomics.wait(l, P, e, 50),
							Atomics.load(l, I) === 0 && (d = Date.now() + 3e4),
							Date.now() > d)
						) {
							(console.warn(`[gl] taking the ring from client ${e}`),
								Atomics.store(l, P, u));
							break;
						}
					}
					f && (i?.(performance.now() - f), (this.#i += performance.now() - f));
					let p = Ye(n),
						m = 0;
					if (l[p] === (((n >>> 0) + 1) | 0)) {
						if (l[p + 2])
							return (
								(l[p] = 0),
								Atomics.store(l, P, 0),
								Atomics.notify(l, P),
								-1
							);
						m = l[p + 1] >>> 0;
					}
					if (r)
						return (
							this.#o(a, t, c),
							Atomics.store(l, N, n >>> 0),
							Atomics.store(l, F, 1),
							Atomics.store(l, M, z),
							Atomics.notify(l, M),
							this.#r(),
							(o[pt] = 0),
							m & 2147483647
						);
					try {
						return this.#c(a, t, s, c, n);
					} finally {
						(Atomics.store(l, P, 0), Atomics.notify(l, P));
					}
				}
				#c(e, t, n, r, i) {
					this.#o(e, t, r);
					let a = this.#e;
					(Atomics.store(a, N, i >>> 0),
						Atomics.store(a, M, z),
						Atomics.notify(a, M),
						this.#r());
					let o = Date.now();
					for (; Atomics.load(a, M) === z; ) {
						if (Atomics.load(a, I) < 0) return (Atomics.store(a, M, R), -1);
						if (Atomics.wait(a, M, z, 3e4) === `timed-out`) {
							if (Atomics.load(a, I) !== 0)
								throw Error(`the GL device did not answer in thirty seconds`);
							if (Date.now() - o > tt)
								throw Error(`the GL device did not start in ten minutes`);
						}
					}
					(Atomics.store(a, M, R),
						Atomics.notify(a, M),
						e.set(this.#t.subarray(0, B), t));
					let s = this.#n[mt];
					if (s > 0) {
						let r = B + n;
						e.set(this.#t.subarray(r, r + s), t + r);
					}
					return a[et];
				}
			}));
	});
p();
let V = 1,
	H = 26,
	U = 1,
	W = 6;
const _t = {
	1: `ns-resize`,
	2: `ns-resize`,
	4: `ew-resize`,
	8: `ew-resize`,
	5: `nwse-resize`,
	10: `nwse-resize`,
	9: `nesw-resize`,
	6: `nesw-resize`,
};
let G = 18,
	vt = 6;
function yt(e) {
	((V = e > 0 && Number.isFinite(e) ? e : 1),
		(H = Math.round(26 * V)),
		(U = Math.max(1, Math.round(V))),
		(W = Math.round(6 * V)),
		(G = Math.round(18 * V)),
		(vt = Math.round(6 * V)));
}
const K = {
		desktop: [0.07, 0.09, 0.12, 1],
		titleActive: [0.16, 0.42, 0.72, 1],
		titleIdle: [0.18, 0.2, 0.24, 1],
		border: [0.05, 0.06, 0.08, 1],
		close: [0.78, 0.28, 0.28, 1],
		closeIdle: [0.35, 0.3, 0.32, 1],
		shadow: [0, 0, 0, 0.35],
	},
	bt = 1024;
function xt(e, t, n) {
	return e.createTexture({
		size: [Math.max(1, t), Math.max(1, n)],
		format: `rgba8unorm`,
		usage:
			GPUTextureUsage.TEXTURE_BINDING |
			GPUTextureUsage.COPY_DST |
			GPUTextureUsage.RENDER_ATTACHMENT,
	});
}
let q = null;
function St(e) {
	if (q === `canvas` || q === `readback`) return q;
	let t = e?.info ?? {};
	return t.isFallbackAdapter || t.architecture === `swiftshader`
		? `readback`
		: `canvas`;
}
function Ct(e, t) {
	if (e.length !== t.length) return !1;
	if (!(e.byteOffset & 3) && !(t.byteOffset & 3) && !(e.length & 3)) {
		let n = new Uint32Array(e.buffer, e.byteOffset, e.length >> 2),
			r = new Uint32Array(t.buffer, t.byteOffset, t.length >> 2);
		for (let e = 0; e < n.length; e++) if (n[e] !== r[e]) return !1;
		return !0;
	}
	for (let n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
	return !0;
}
var wt = class {
	constructor(e, t, n) {
		((this.device = e), (this.context = t), (this.format = n));
		let r = e.createShaderModule({
			code: `
struct U {
  rect: vec4f,      // x, y, w, h in output pixels
  texRect: vec4f,   // sub-rectangle of the texture to sample (0..1)
  color: vec4f,
  output: vec2f,    // output size in pixels
  mode: u32,        // 0 = texture, 1 = solid colour
  swizzle: u32,     // 1 = the texture holds BGRA bytes (wl_shm)
  opaque: u32,      // 1 = force alpha to 1 (XRGB has no alpha)
};
@group(0) @binding(0) var<uniform> u: U;
@group(0) @binding(1) var samp: sampler;
@group(0) @binding(2) var tex: texture_2d<f32>;
struct V { @builtin(position) pos: vec4f, @location(0) uv: vec2f };
// One unit quad, placed by a pixel rectangle: the corner comes from the
// vertex index, so a draw is a uniform slice and a call.
@vertex fn vs(@builtin(vertex_index) i: u32) -> V {
  let corner = vec2f(f32(i & 1u), f32((i >> 1u) & 1u));
  let px = u.rect.xy + corner * u.rect.zw;
  var o: V;
  o.pos = vec4f(px.x / u.output.x * 2.0 - 1.0, 1.0 - px.y / u.output.y * 2.0, 0.0, 1.0);
  o.uv = u.texRect.xy + corner * u.texRect.zw;
  return o;
}
@fragment fn fs(v: V) -> @location(0) vec4f {
  var c = textureSample(tex, samp, v.uv);
  if (u.mode == 1u) { return u.color; }
  if (u.swizzle == 1u) { c = c.bgra; }
  if (u.opaque == 1u) { c.a = 1.0; }
  return c;
}`,
		});
		this.layout = e.createBindGroupLayout({
			entries: [
				{
					binding: 0,
					visibility: GPUShaderStage.VERTEX | GPUShaderStage.FRAGMENT,
					buffer: { type: `uniform`, hasDynamicOffset: !0 },
				},
				{ binding: 1, visibility: GPUShaderStage.FRAGMENT, sampler: {} },
				{ binding: 2, visibility: GPUShaderStage.FRAGMENT, texture: {} },
			],
		});
		let i = {
			srcFactor: `src-alpha`,
			dstFactor: `one-minus-src-alpha`,
			operation: `add`,
		};
		((this.pipeline = e.createRenderPipeline({
			layout: e.createPipelineLayout({ bindGroupLayouts: [this.layout] }),
			vertex: { module: r, entryPoint: `vs` },
			fragment: {
				module: r,
				entryPoint: `fs`,
				targets: [{ format: n, blend: { color: i, alpha: i } }],
			},
			primitive: { topology: `triangle-strip` },
		})),
			(this.sampler = e.createSampler({
				minFilter: `linear`,
				magFilter: `linear`,
			})),
			(this.nearest = e.createSampler({
				minFilter: `nearest`,
				magFilter: `nearest`,
			})),
			(this.groupsNearest = new WeakMap()),
			(this.uniforms = e.createBuffer({
				size: 256 * bt,
				usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST,
			})),
			(this.data = new ArrayBuffer(256 * bt)),
			(this.f32 = new Float32Array(this.data)),
			(this.u32 = new Uint32Array(this.data)),
			(this.white = xt(e, 1, 1)),
			e.queue.writeTexture(
				{ texture: this.white },
				new Uint8Array([255, 255, 255, 255]),
				{ bytesPerRow: 4 },
				[1, 1],
			),
			(this.groups = new WeakMap()),
			(this.scene = null),
			(this.keep = !1));
	}
	#e(e, t) {
		let n = t ? this.groupsNearest : this.groups,
			r = n.get(e);
		return (
			r ||
				((r = this.device.createBindGroup({
					layout: this.layout,
					entries: [
						{ binding: 0, resource: { buffer: this.uniforms, size: 80 } },
						{ binding: 1, resource: t ? this.nearest : this.sampler },
						{ binding: 2, resource: e.createView() },
					],
				})),
				n.set(e, r)),
			r
		);
	}
	begin(e, t) {
		let n;
		return (
			this.context && !this.keep
				? (n = this.context.getCurrentTexture())
				: ((!this.scene || this.scene.width !== e || this.scene.height !== t) &&
						(this.scene?.destroy(),
						(this.scene = this.device.createTexture({
							size: [e, t],
							format: this.format,
							usage:
								GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
						}))),
					(n = this.scene)),
			(this.w = e),
			(this.h = t),
			(this.n = 0),
			(this.encoder = this.device.createCommandEncoder()),
			(this.pass = this.encoder.beginRenderPass({
				colorAttachments: [
					{
						view: n.createView(),
						loadOp: `clear`,
						storeOp: `store`,
						clearValue: {
							r: K.desktop[0],
							g: K.desktop[1],
							b: K.desktop[2],
							a: 1,
						},
					},
				],
			})),
			this.pass.setPipeline(this.pipeline),
			!0
		);
	}
	#t(e, t, n, r, i, a, o, s, c, l) {
		if (this.n >= bt) return;
		let u = (this.n * 256) / 4,
			d = this.f32;
		((d[u] = e),
			(d[u + 1] = t),
			(d[u + 2] = n),
			(d[u + 3] = r),
			(d[u + 4] = l[0]),
			(d[u + 5] = l[1]),
			(d[u + 6] = l[2]),
			(d[u + 7] = l[3]),
			(d[u + 8] = o[0]),
			(d[u + 9] = o[1]),
			(d[u + 10] = o[2]),
			(d[u + 11] = o[3]),
			(d[u + 12] = this.w),
			(d[u + 13] = this.h),
			(this.u32[u + 14] = a),
			(this.u32[u + 15] = s),
			(this.u32[u + 16] = c));
		let f =
			a === 1 ||
			(n === Math.round(n) &&
				r === Math.round(r) &&
				e === Math.round(e) &&
				t === Math.round(t) &&
				Math.round(n / Math.max(1e-9, l[2])) === i.width &&
				Math.round(r / Math.max(1e-9, l[3])) === i.height);
		(this.pass.setBindGroup(0, this.#e(i, f), [this.n * 256]),
			this.pass.draw(4),
			this.n++);
	}
	solid(e, t, n, r, i) {
		this.#t(e, t, n, r, this.white, 1, i, 0, 0, [0, 0, 1, 1]);
	}
	textured(
		e,
		t,
		n,
		r,
		i,
		{ swizzle: a = 0, opaque: o = 0, uv: s = [0, 0, 1, 1] } = {},
	) {
		i && this.#t(e, t, n, r, i, 0, [0, 0, 0, 0], a, o, s);
	}
	end() {
		if (
			(this.pass.end(),
			this.n &&
				this.device.queue.writeBuffer(
					this.uniforms,
					0,
					this.data,
					0,
					this.n * 256,
				),
			this.context && this.keep)
		) {
			let e = this.context.getCurrentTexture();
			this.encoder.copyTextureToTexture(
				{ texture: this.scene },
				{ texture: e },
				[this.w, this.h],
			);
		}
		(this.device.queue.submit([this.encoder.finish()]),
			(this.pass = null),
			(this.encoder = null),
			this.ctx2d && this.#a());
		let e = this.#n;
		this.#n = [];
		for (let t of e) t();
	}
	#n = [];
	sceneFor() {
		return !this.context || this.keep ? !0 : ((this.keep = !0), !1);
	}
	drawn(e) {
		return new Promise((t) => {
			let n = setTimeout(t, e);
			this.#n.push(() => {
				(clearTimeout(n), t());
			});
		});
	}
	directFrame(e, t, n) {
		((this.w = t),
			(this.h = n),
			(this.n = 0),
			(this.encoder = this.device.createCommandEncoder()));
		let r;
		(this.context
			? (r = this.context.getCurrentTexture())
			: ((!this.scene || this.scene.width !== t || this.scene.height !== n) &&
					(this.scene?.destroy(),
					(this.scene = this.device.createTexture({
						size: [t, n],
						format: this.format,
						usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_SRC,
					}))),
				(r = this.scene)),
			(this.pass = this.encoder.beginRenderPass({
				colorAttachments: [
					{
						view: r.createView(),
						loadOp: `clear`,
						storeOp: `store`,
						clearValue: { r: 0, g: 0, b: 0, a: 1 },
					},
				],
			})),
			this.pass.setPipeline(this.pipeline),
			this.textured(0, 0, t, n, e, { opaque: 1 }),
			this.pass.end(),
			this.device.queue.writeBuffer(
				this.uniforms,
				0,
				this.data,
				0,
				this.n * 256,
			),
			this.device.queue.submit([this.encoder.finish()]),
			(this.pass = null),
			(this.encoder = null),
			this.ctx2d && this.#a());
	}
	#r = !1;
	#i = !1;
	#a() {
		if (this.#r) {
			this.#i = !0;
			return;
		}
		((this.#r = !0),
			(this.#i = !1),
			this.read()
				.then((e) => {
					e &&
						e.w === this.ctx2d.canvas.width &&
						e.h === this.ctx2d.canvas.height &&
						this.ctx2d.putImageData(
							new ImageData(
								new Uint8ClampedArray(e.px.buffer, 0, e.w * e.h * 4),
								e.w,
								e.h,
							),
							0,
							0,
						);
				})
				.catch(() => {})
				.finally(() => {
					((this.#r = !1), this.#i && this.#a());
				}));
	}
	async read() {
		if (!this.scene) return null;
		let e = this.scene.width,
			t = this.scene.height,
			n = Math.ceil((e * 4) / 256) * 256,
			r = this.device.createBuffer({
				size: n * t,
				usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
			}),
			i = this.device.createCommandEncoder();
		(i.copyTextureToBuffer(
			{ texture: this.scene },
			{ buffer: r, bytesPerRow: n },
			[e, t],
		),
			this.device.queue.submit([i.finish()]),
			await r.mapAsync(GPUMapMode.READ));
		let a = new Uint8Array(r.getMappedRange()),
			o = new Uint8Array(e * t * 4);
		for (let r = 0; r < t; r++)
			o.set(a.subarray(r * n, r * n + e * 4), r * e * 4);
		return (r.unmap(), r.destroy(), { w: e, h: t, px: o });
	}
};
function Tt(e, t) {
	let n = xt(e, t.width, t.height);
	return (
		e.queue.copyExternalImageToTexture(
			{ source: t },
			{ texture: n, premultipliedAlpha: !1 },
			[t.width, t.height],
		),
		n
	);
}
var Et = class {
	#e;
	#t = new Map();
	constructor(e) {
		this.#e = e;
	}
	get(e) {
		let t = this.#t.get(e);
		if (t) return t;
		let n = new OffscreenCanvas(1, 1),
			r = n.getContext(`2d`),
			i = Math.round(13 * V);
		if (
			((r.font = `${i}px system-ui, sans-serif`),
			(n.width = Math.max(1, Math.ceil(r.measureText(e).width))),
			(n.height = Math.round(18 * V)),
			(r = n.getContext(`2d`)),
			(r.font = `${i}px system-ui, sans-serif`),
			(r.textBaseline = `middle`),
			(r.fillStyle = `white`),
			r.fillText(e, 0, n.height / 2),
			(t = { tex: Tt(this.#e, n), w: n.width, h: n.height }),
			this.#t.size > 64)
		) {
			for (let [e, t] of this.#t)
				if ((t.tex.destroy(), this.#t.delete(e), this.#t.size <= 32)) break;
		}
		return (this.#t.set(e, t), t);
	}
};
const Dt = (e) => `${e.token}:${e.client}:${e.surface}`;
var Ot = class {
	#e;
	#t;
	#n;
	#r;
	#i = new Map();
	#a = new Map();
	#o = new Map();
	#s = [];
	#c = ``;
	#l = 0;
	#u = 0;
	#d = null;
	#f = null;
	#p = { x: 0, y: 0, over: null, buttons: 0 };
	#m = null;
	#h = null;
	#g = null;
	pointerLock(e, t) {
		let n = this.#g ? this.#o.get(this.#g) : null;
		(n && b(this.#r, n.block, 15, 0, 0, t, 0, n.client, n.surface),
			(this.#g = e ? this.#m : null));
		let r = this.#g ? this.#o.get(this.#g) : null;
		r && b(this.#r, r.block, 15, 1, 0, t, 0, r.client, r.surface);
	}
	pointerRelative(e, t, n) {
		let r = this.#g ? this.#o.get(this.#g) : null;
		if (!r) return;
		let i = r.cs || 1;
		b(
			this.#r,
			r.block,
			16,
			Math.round(e / i),
			Math.round(t / i),
			n,
			0,
			r.client,
			r.surface,
		);
	}
	#_ = null;
	#v = null;
	#y = null;
	#b = 0;
	#x = 0;
	#S = 0;
	#C = 0;
	#w = null;
	#T = null;
	#E = new Uint8Array();
	#D = { n: 0, bytes: 0, same: 0, full: 0, fullBytes: 0 };
	#O = [];
	#k = new Map();
	constructor(e, t, n, r) {
		((this.#r = t), (this.#w = n));
		let i = r.device;
		if (((this.#e = i), (this.#A = e), St(r.adapter) === `canvas`)) {
			let t = e.getContext(`webgpu`);
			if (!t) throw Error(`no webgpu context for the compositor`);
			let n = navigator.gpu.getPreferredCanvasFormat();
			(t.configure({
				device: i,
				format: n,
				alphaMode: `opaque`,
				usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.COPY_DST,
			}),
				(this.#t = new wt(i, t, n)));
		} else
			((this.#t = new wt(i, null, `rgba8unorm`)),
				(this.#t.ctx2d = e.getContext(`2d`, { alpha: !1 })));
		((this.#n = new Et(i)), this.resize(e.width, e.height));
	}
	#A;
	resize(e, t) {
		((this.#b = Math.max(1, e | 0)),
			(this.#x = Math.max(1, t | 0)),
			!this.#de && this.#A.width !== this.#b && (this.#A.width = this.#b),
			!this.#de && this.#A.height !== this.#x && (this.#A.height = this.#x),
			te(this.#r, this.#b, this.#x));
		for (let [e, t] of this.#o) t.role === 1 && this.#we(t, this.#d === e);
	}
	addMemory(e, t, n) {
		(pe(this.#r, n),
			t &&
				!this.#r.pixels &&
				this.#i.set(e, { memory: t, view: new Uint8Array(t.buffer) }));
	}
	addPixels(e, t, n, r) {
		(r && this.#M.delete(r),
			t && n && this.#M.set(t, { token: e, view: new Uint8Array(n) }));
	}
	#j(e) {
		return this.#r.pixels
			? (this.#M.get(e.pix)?.view ?? null)
			: this.#N(e.token);
	}
	#M = new Map();
	#N(e) {
		let t = this.#i.get(e);
		if (!t) return null;
		let n = t.memory.buffer;
		return (
			(t.view.buffer !== n || t.view.length !== n.byteLength) &&
				(t.view = new Uint8Array(n)),
			t.view
		);
	}
	dropMemory(e) {
		this.#i.delete(e);
		for (let [t, n] of this.#M) n.token === e && this.#M.delete(t);
		let t = oe(this.#r, e);
		t && this.#H(`released ${t} block(s) of exited process ${e}`);
	}
	#P(e) {
		let t = Math.max(160, this.#b - 2 * U),
			n = Math.max(120, this.#x - H - 2 * U);
		return e.fullscreen
			? { w: this.#b, h: this.#x }
			: e.want
				? { w: Math.min(e.want.w, t), h: Math.min(e.want.h, n) }
				: { w: 0, h: 0 };
	}
	#F(e, t, n) {
		let r = n & 7,
			i = !!(this.#p.buttons & 1);
		(this.#H(
			`request ${e} ${[`none`, `move`, `resize`, `maximize`, `unmaximize`][r] ?? r}`,
		),
			!t.fullscreen &&
				(r === 1 && i && !t.maximized
					? (this.#_ = { key: e, dx: this.#p.x - t.x, dy: this.#p.y - t.y })
					: r === 2 && i && !t.maximized
						? this.#I(e, t, n >> 3)
						: r === 3
							? this.#z(e, !0)
							: r === 4 && this.#z(e, !1)));
	}
	#I(e, t, n) {
		n &&
			((this.#v = {
				key: e,
				edges: n,
				px: this.#p.x,
				py: this.#p.y,
				x0: t.x,
				y0: t.y,
				w0: t.want?.w ?? t.width,
				h0: t.want?.h ?? t.height,
				sentAt: 0,
			}),
			this.#H(`resize ${e} edges ${n}`));
	}
	#L(e, t, n) {
		let r = this.#v,
			i = this.#o.get(r.key);
		if (!i) return;
		let a = Math.round(e - r.px),
			o = Math.round(t - r.py),
			s = Math.max(160, this.#b - 2 * U),
			c = Math.max(120, this.#x - H - 2 * U),
			l = Math.round(96 * V),
			u = Math.round(48 * V),
			d = r.w0,
			f = r.h0;
		(r.edges & 8 && (d = r.w0 + a),
			r.edges & 4 && (d = r.w0 - a),
			r.edges & 2 && (f = r.h0 + o),
			r.edges & 1 && (f = r.h0 - o),
			(d = Math.max(l, Math.min(s, d))),
			(f = Math.max(u, Math.min(c, f))),
			r.edges & 4 && (i.x = r.x0 + (r.w0 - d)),
			r.edges & 1 && (i.y = r.y0 + (r.h0 - f)),
			r.edges & 5 && this.#V(i),
			(i.want = { w: d, h: f }));
		let p = performance.now();
		(!n && i.configurePending && p - r.sentAt < 250) ||
			((r.sentAt = p), this.#we(i, this.#d === r.key, n ? 0 : 4));
	}
	#R(e, t, n) {
		if (n)
			((t.restoreFs = { x: t.x, y: t.y }),
				(t.x = 0),
				(t.y = 0),
				(t.fullscreen = !0),
				this.#Ee(e),
				this.#Te(e));
		else {
			let e = t.restoreFs ?? { x: U, y: H };
			((t.x = e.x), (t.y = e.y), (t.fullscreen = !1));
		}
		(this.#H(`${n ? `fullscreen` : `unfullscreen`} ${e}`),
			this.#V(t),
			this.#we(t, this.#d === e));
	}
	#z(e, t) {
		let n = this.#o.get(e);
		if (!(!n || n.role !== 1 || !!n.maximized === t)) {
			if (t) {
				n.restore = { x: n.x, y: n.y, want: n.want, w: n.width, h: n.height };
				let e = Math.max(160, this.#b - 2 * U),
					t = Math.max(120, this.#x - H - 2 * U);
				((n.x = U), (n.y = H), (n.want = { w: e, h: t }), (n.maximized = !0));
			} else {
				let e = n.restore ?? {
					x: n.x,
					y: n.y,
					want: void 0,
					w: n.width,
					h: n.height,
				};
				((n.x = e.x),
					(n.y = e.y),
					(n.want = e.want ?? { w: e.w, h: e.h }),
					(n.maximized = !1));
			}
			(this.#H(`${t ? `maximize` : `unmaximize`} ${e}`),
				this.#V(n),
				this.#Ee(e),
				this.#we(n, this.#d === e));
		}
	}
	#B() {
		let { surfaces: e, blocks: t } = ae(this.#r),
			n = new Set(),
			r = new Map(),
			i = [],
			a = [];
		for (let t of e) {
			let e = Dt(t);
			(n.add(e), r.set(e, t));
			let o = this.#o.get(e);
			if (!o) {
				((o = {
					key: e,
					token: t.token,
					block: t.block,
					client: t.client,
					surface: t.surface,
					role: t.role,
					x: 0,
					y: 0,
					width: t.width,
					height: t.height,
					title: t.title,
					serial: 0,
				}),
					this.#H(`+ ${e} role=${t.role} ${t.width}x${t.height}`),
					this.#o.set(e, o));
				let n = this.#k.get(e);
				if (t.placed) this.#s.push(e);
				else if (t.role === 1 && n)
					((o.x = n.x), (o.y = n.y), this.#s.push(e), this.#Te(e), this.#V(o));
				else if (t.role === 1) {
					let n = Math.round(28 * V),
						r = this.#C++,
						i = Math.max(1, this.#b - t.width - U),
						a = Math.max(1, this.#x - t.height - H - U);
					((o.x = U + ((r * n) % i)),
						(o.y = H + U + ((r * n) % a)),
						this.#s.push(e),
						this.#Te(e),
						this.#V(o));
				}
			}
			let s = (t.flags >> 8) & 255 || 1,
				c = (t.flags >> 16) & 255 || 1;
			((o.role = t.role),
				(o.bs = s),
				(o.cs = c),
				(o.width = Math.round((t.width * c) / s)),
				(o.height = Math.round((t.height * c) / s)),
				(o.title = t.title),
				(o.parent = t.parent),
				(o.relX = t.relX * c),
				(o.relY = t.relY * c),
				(o.hotX = t.relX),
				(o.hotY = t.relY),
				(o.info = t),
				(o.configurePending = !!(t.flags & 4)));
			let l = (t.flags >> 3) & 15;
			o.requestSeq === void 0
				? (o.requestSeq = l)
				: l !== o.requestSeq &&
					t.role === 1 &&
					!t.placed &&
					((o.requestSeq = l), this.#F(e, o, (t.flags >>> 24) & 127));
			let u = !!(t.flags & 1) && t.role === 1 && !t.placed;
			u !== !!o.fullscreen && this.#R(e, o, u);
			let d = !!o.wantsLock;
			((o.wantsLock = !!(t.flags & -2147483648)),
				!o.wantsLock && this.#g === e && J({ kind: `lock-release` }),
				o.wantsLock &&
					!d &&
					this.#h === e &&
					!this.#g &&
					((this.#m = e), J({ kind: `lock-wanted`, late: !0 })),
				(o.placed = t.placed),
				(o.unmanaged = t.unmanaged),
				(o.layer = t.layer),
				(o.stackId = t.stackId),
				t.placed &&
					((o.x = o.relX),
					(o.y = o.relY),
					(o.originX !== t.relX || o.originY !== t.relY) &&
						((o.originX = t.relX),
						(o.originY = t.relY),
						b(this.#r, o.block, 10, t.relX, t.relY, 0, 0, o.client, o.surface)),
					this.#s.includes(e) || this.#s.push(e),
					o.restack !== t.restack &&
						((o.restack = t.restack), t.restack && i.push([e, t.below])),
					o.activate !== t.activate &&
						((o.activate = t.activate), t.activate && a.push(e))));
		}
		for (let [e, t] of i) this.#U(e, t);
		for (let e of a) this.#Te(e);
		for (let e of [...this.#o.keys()]) {
			if (n.has(e)) continue;
			let t = this.#a.get(e);
			(t && (t.tex.destroy(), this.#a.delete(e)), this.#H(`- ${e}`));
			let r = this.#o.get(e);
			if (
				r?.role === 1 &&
				!r.placed &&
				(this.#k.set(e, { x: r.x, y: r.y }), this.#k.size > 128)
			) {
				for (let e of this.#k.keys())
					if ((this.#k.delete(e), this.#k.size <= 64)) break;
			}
			if (
				(this.#o.delete(e),
				(this.#s = this.#s.filter((t) => t !== e)),
				this.#g === e && J({ kind: `lock-release` }),
				this.#d === e)
			) {
				this.#d = null;
				let e =
					[...this.#s].reverse().find((e) => !this.#o.get(e)?.placed) ?? null;
				e && this.#Te(e);
			}
			(this.#p.over === e && (this.#p.over = null),
				this.#f === e && (this.#f = null));
		}
		return { byKey: r, blocks: t };
	}
	#V(e) {
		b(this.#r, e.block, 10, e.x, e.y, 0, 0, e.client, e.surface);
	}
	note(e) {
		this.#H(e);
	}
	#H(e) {
		(this.#O.push(`${this.#S} ${e}`),
			this.#O.length > 64 && this.#O.splice(0, 32));
	}
	#U(e, t) {
		let n = this.#s.filter((t) => t !== e),
			r = n.length;
		if (t === 4294967295) r = 0;
		else if (t) {
			let e = n.findIndex((e) => {
				let n = this.#o.get(e);
				return n?.placed && n.stackId === t;
			});
			e >= 0 && (r = e);
		}
		(n.splice(r, 0, e), (this.#s = n));
	}
	#W() {
		let e = (e) => {
			let t = this.#o.get(e);
			return t?.placed ? t.layer : 0;
		};
		return [...this.#s].sort((t, n) => e(t) - e(n));
	}
	#G(e) {
		return e.role === 1 && !(e.placed && e.unmanaged) && !e.fullscreen;
	}
	#K(e) {
		if (e.placed || e.role === 1) return { x: e.x, y: e.y };
		let t = `${e.token}:${e.client}:${e.parent}`,
			n = e.parent ? this.#o.get(t) : null;
		if (!n) return { x: e.relX, y: e.relY };
		let r = this.#K(n);
		return { x: r.x + e.relX, y: r.y + e.relY };
	}
	#q(e, t, n) {
		let r = this.#a.get(e);
		return (
			r && (r.w !== t || r.h !== n) && (r.tex.destroy(), (r = null)),
			r ||
				((r = {
					tex: xt(this.#e, t, n),
					w: t,
					h: n,
					serial: 0,
					version: 0,
					last: null,
				}),
				this.#a.set(e, r)),
			r
		);
	}
	#J(e, t) {
		if (!t.addr) return !0;
		let n = this.#j(t);
		if (!n) return !1;
		let r = this.#q(e, t.width, t.height),
			i =
				t.damage.w <= 0 ||
				t.damage.h <= 0 ||
				r.serial === 0 ||
				t.serial !== r.serial + 1,
			a = 0,
			o = 0,
			s = t.width,
			c = t.height;
		if (
			(i ||
				((a = Math.max(0, Math.min(t.damage.x, t.width))),
				(o = Math.max(0, Math.min(t.damage.y, t.height))),
				(s = Math.max(0, Math.min(t.damage.w, t.width - a))),
				(c = Math.max(0, Math.min(t.damage.h, t.height - o)))),
			s <= 0 || c <= 0)
		)
			return ((r.serial = t.serial), !0);
		let l = t.addr + o * t.stride + a * 4,
			u = (c - 1) * t.stride + s * 4;
		if (l + u > n.length)
			return (this.#H(`! ${e} buffer at ${l}+${u} past ${n.length}`), !1);
		let d = s * 4,
			f = d * c,
			p = u > 2 * f,
			m = f <= 262144,
			h,
			g = t.stride;
		if (p || m || this.#T === !1) {
			if (p || m) {
				this.#E.length < f && (this.#E = new Uint8Array(f));
				for (let e = 0; e < c; e++) {
					let r = l + e * t.stride;
					this.#E.set(n.subarray(r, r + d), e * d);
				}
				((h = this.#E.subarray(0, f)), (g = d));
			} else
				(this.#E.length < u && (this.#E = new Uint8Array(u)),
					this.#E.set(n.subarray(l, l + u)),
					(h = this.#E.subarray(0, u)));
		} else h = n.subarray(l, l + u);
		if (m) {
			let e = r.last;
			if (e && e.x === a && e.y === o && e.w === s && e.h === c && Ct(e.px, h))
				return (this.#D.same++, (r.serial = t.serial), !0);
			(e && e.px.length === f
				? e.px.set(h)
				: (r.last = { x: a, y: o, w: s, h: c, px: h.slice() }),
				Object.assign(r.last, { x: a, y: o, w: s, h: c }));
		} else r.last = null;
		try {
			(this.#e.queue.writeTexture(
				{ texture: r.tex, origin: { x: a, y: o } },
				h,
				{ offset: 0, bytesPerRow: g, rowsPerImage: c },
				{ width: s, height: c },
			),
				this.#T === null && (this.#T = !0));
		} catch (n) {
			if (this.#T === null)
				return ((this.#T = !1), (r.last = null), this.#J(e, t));
			throw n;
		}
		return (
			this.#D.n++,
			(this.#D.bytes += h.length),
			i && (this.#D.full++, (this.#D.fullBytes += h.length)),
			r.version++,
			(r.serial = t.serial),
			!0
		);
	}
	#Y(e) {
		let t = this.#K(e);
		return {
			x: t.x,
			y: t.y,
			w: e.width,
			h: e.height,
			frameX: t.x - U,
			frameY: t.y - H,
			frameW: e.width + 2 * U,
			frameH: e.height + H + U,
		};
	}
	#X(e) {
		let t = this.#Y(e);
		return {
			x: t.frameX + t.frameW - G - vt,
			y: t.frameY + Math.floor((H - G) / 2),
			w: G,
			h: G,
		};
	}
	#Z(e, t) {
		let n = this.#t,
			r = this.#Y(e);
		(n.solid(
			r.frameX + Math.round(3 * V),
			r.frameY + Math.round(4 * V),
			r.frameW,
			r.frameH,
			K.shadow,
		),
			n.solid(r.frameX, r.frameY, r.frameW, r.frameH, K.border),
			n.solid(
				r.frameX,
				r.frameY,
				r.frameW,
				H,
				t ? K.titleActive : K.titleIdle,
			));
		let i = e.title || `window`,
			a = this.#n.get(i),
			o = r.frameW - G - 2 * vt - Math.round(10 * V),
			s = Math.min(a.w, Math.max(0, o));
		s > 4 &&
			n.textured(
				r.frameX + Math.round(8 * V),
				r.frameY + Math.floor((H - a.h) / 2),
				s,
				a.h,
				a.tex,
				{ uv: [0, 0, s / a.w, 1] },
			);
		let c = this.#X(e);
		n.solid(c.x, c.y, c.w, c.h, t ? K.close : K.closeIdle);
		let l = this.#n.get(`✕`),
			u = Math.min(c.w, c.h) - Math.round(6 * V);
		n.textured(
			c.x + Math.floor((c.w - u) / 2),
			c.y + Math.floor((c.h - u) / 2),
			u,
			u,
			l.tex,
		);
	}
	#Q(e, t) {
		let n = this.#Y(t),
			r = this.#$(t),
			i = this.#a.get(e),
			a = r && t.info?.glRect;
		if (r) {
			(this.#u++,
				a
					? (i &&
							this.#t.textured(n.x, n.y, t.width, t.height, i.tex, {
								swizzle: 1,
								opaque: +(t.info?.format === 1),
							}),
						this.#t.textured(n.x + a.x, n.y + a.y, a.w, a.h, r.tex, {
							opaque: 1,
						}))
					: this.#t.textured(n.x, n.y, t.width, t.height, r.tex, {
							opaque: 1,
						}));
			return;
		}
		i &&
			this.#t.textured(n.x, n.y, t.width, t.height, i.tex, {
				swizzle: 1,
				opaque: +(t.info?.format === 1),
			});
	}
	#$(e) {
		Lt();
		let t = Ut(),
			n = performance.now(),
			r = Vt(),
			i =
				n - this.#l > 2e3
					? `${r.length} surface(s) ` +
						r.map((e) => `${e.kind}:${e.id}@${e.token}/${e.frame}`).join(` `) +
						` f${t?.serial ?? 0}`
					: this.#c;
		if ((i !== this.#c && (this.#l = n), i !== this.#c)) {
			this.#c = i;
			let t = Ut();
			this.#H(
				`gl attachment ${i}, frame ${t ? `${t.w}x${t.h} #${t.serial}` : `none`}, window ${e.token}:${e.surface} xid ${e.info?.xid ?? 0}, drawn ${this.#u}, device ${Q?.glState?.() ?? `?`}`,
			);
		}
		let a = Ht(e);
		return a?.tex ? a : null;
	}
	#ee(e) {
		if (!this.#o.get(e)) return [];
		let t = [];
		for (let [n, r] of this.#o)
			n !== e &&
				(r.role === 2 || r.role === 3) &&
				`${r.token}:${r.client}:${r.parent}` === e &&
				t.push(n);
		return t;
	}
	#te = null;
	#ne = 0;
	#re = se();
	#ie = 1;
	#ae = 0;
	#oe = -1;
	touch() {
		this.#ie++;
	}
	#se() {
		return this.#ie !== this.#ae || (Q?.presentedCount?.() ?? 0) !== this.#oe
			? !1
			: de(this.#r, this.#re);
	}
	#ce(e) {
		(ue(this.#re, e),
			(this.#ae = this.#ie),
			(this.#oe = Q?.presentedCount?.() ?? 0));
	}
	#le() {
		let e = [this.#b, this.#x, this.#d, this.#s.join(`,`)];
		for (let [t, n] of this.#o) {
			let r = n.role === 1 ? this.#Y(n) : null;
			e.push(
				t,
				n.role,
				n.width,
				n.height,
				n.relX,
				n.relY,
				n.title,
				n.parent,
				n.placed ? `p${n.layer}${n.unmanaged ? `u` : ``}` : ``,
				r ? `${r.x},${r.y},${r.frameW}` : ``,
				this.#a.get(t)?.version ?? `-`,
				JSON.stringify(n.info?.glRect ?? null),
				Ht(n)?.serial ?? ``,
			);
		}
		return e.join(`|`);
	}
	#ue = !1;
	#de = null;
	#fe = -1;
	setDirect(e) {
		this.#ue = !!e;
	}
	#pe() {
		if (!this.#ue) return null;
		let e = null;
		for (let [t, n] of this.#o)
			if (n.role !== 4) {
				if (n.role !== 1 || e) return null;
				e = [t, n];
			}
		if (!e) return null;
		let [t, n] = e,
			r = this.#$(n);
		if (!r) return null;
		let i = this.#Y(n),
			a = n.info?.glRect;
		return {
			k: t,
			win: n,
			gl: r,
			w: r.w,
			h: r.h,
			ox: i.x + (a ? a.x : 0),
			oy: i.y + (a ? a.y : 0),
		};
	}
	#me(e, t, n) {
		((!this.#de || this.#de.w !== e.w || this.#de.h !== e.h) &&
			((this.#A.width = e.w),
			(this.#A.height = e.h),
			(this.#fe = -1),
			J({ kind: `direct`, w: e.w, h: e.h }),
			this.#H(`direct present ${e.w}x${e.h} (${e.k})`)),
			(this.#de = { k: e.k, w: e.w, h: e.h, ox: e.ox, oy: e.oy }));
		for (let e of n) fe(this.#r, e.block, e.gen);
		if ((this.#ce(n), e.gl.serial === this.#fe)) {
			this.#ne++;
			return;
		}
		((this.#fe = e.gl.serial),
			this.#t.directFrame(e.gl.tex, e.w, e.h),
			this.#S++,
			this.#w &&
				(Atomics.store(this.#w, 0, this.#S),
				Atomics.store(this.#w, 1, this.#o.size)));
	}
	#he() {
		((this.#de = null),
			(this.#A.width = this.#b),
			(this.#A.height = this.#x),
			(this.#te = null),
			J({ kind: `direct`, w: 0, h: 0 }),
			this.#H(`direct present off: compositing`));
	}
	#ge = ``;
	#_e = new Map();
	#ve = null;
	#ye = null;
	#be(e) {
		let t = `default`,
			n = this.#v ? _t[this.#v.edges] : null;
		if (n || this.#ve) {
			((t = n ?? this.#ve),
				t !== this.#ge && ((this.#ge = t), J({ kind: `cursor`, css: t })));
			return;
		}
		let r = this.#de ? this.#de.k : this.#_ ? null : this.#p.over,
			i = r ? this.#o.get(r) : null;
		if (i) {
			let n = null;
			for (let [e, t] of this.#o)
				if (t.role === 4 && t.token === i.token && t.client === i.client) {
					n = [e, t];
					break;
				}
			if (!n) t = `none`;
			else {
				let r = this.#xe(e.get(n[0]), n[1]);
				if (r === null) return;
				t = r;
			}
		}
		t !== this.#ge && ((this.#ge = t), J({ kind: `cursor`, css: t }));
	}
	#xe(e, t) {
		if (
			!e ||
			!e.addr ||
			e.width <= 0 ||
			e.height <= 0 ||
			e.width > 256 ||
			e.height > 256
		)
			return `none`;
		if (t.cursorSerial === e.serial && t.cursorAddr === e.addr && t.cursorCss)
			return t.cursorCss;
		let n = this.#j(e);
		if (!n || e.addr + (e.height - 1) * e.stride + e.width * 4 > n.length)
			return `none`;
		let r = new Uint8ClampedArray(e.width * e.height * 4),
			i = e.format === 1,
			a =
				2166136261 ^
				e.width ^
				(e.height << 12) ^
				(t.hotX << 20) ^
				(t.hotY << 26) ^
				(t.bs << 8);
		for (let t = 0; t < e.height; t++)
			for (let o = 0; o < e.width; o++) {
				let s = e.addr + t * e.stride + o * 4,
					c = (t * e.width + o) * 4;
				((r[c] = n[s + 2]),
					(r[c + 1] = n[s + 1]),
					(r[c + 2] = n[s]),
					(r[c + 3] = i ? 255 : n[s + 3]),
					(a = Math.imul(
						a ^ (r[c] | (r[c + 1] << 8) | (r[c + 2] << 16) | (r[c + 3] << 24)),
						16777619,
					)));
			}
		let o = `${a >>> 0}`,
			s = this.#_e.get(o);
		if (typeof s == `string`)
			return (
				(t.cursorSerial = e.serial),
				(t.cursorAddr = e.addr),
				(t.cursorCss = s),
				s
			);
		if (!s) {
			let n = new OffscreenCanvas(e.width, e.height);
			n.getContext(`2d`).putImageData(
				new ImageData(r, e.width, e.height),
				0,
				0,
			);
			let i = Math.max(0, t.hotX | 0),
				a = Math.max(0, t.hotY | 0),
				s = t.bs || 1;
			this.#_e.set(
				o,
				n
					.convertToBlob()
					.then((e) => {
						let t = URL.createObjectURL(e),
							n = s > 1 ? `-webkit-image-set(url(${t}) ${s}x)` : `url(${t})`;
						if (
							(this.#_e.set(o, `${n} ${i} ${a}, default`), this.#_e.size > 64)
						) {
							for (let [e, t] of this.#_e)
								if (
									e !== o &&
									(typeof t == `string` &&
										URL.revokeObjectURL(
											t.slice(t.indexOf(`url(`) + 4, t.indexOf(`)`)),
										),
									this.#_e.delete(e),
									this.#_e.size <= 32)
								)
									break;
						}
					})
					.catch(() => this.#_e.delete(o)),
			);
		}
		return null;
	}
	frame() {
		if (this.#se()) {
			this.#ne++;
			return;
		}
		let { byKey: e, blocks: t } = this.#B();
		this.#be(e);
		let n = this.#pe();
		if (n) {
			this.#me(n, e, t);
			return;
		}
		this.#de && this.#he();
		let r = !1;
		for (let [t, n] of e) {
			if (n.role === 4) continue;
			let e = this.#a.get(t);
			(e && e.serial === n.serial) || this.#J(t, n) || (r = !0);
		}
		let i = this.#le();
		if (i !== null && i === this.#te) {
			for (let e of t) fe(this.#r, e.block, e.gen);
			(r || this.#ce(t), this.#ne++);
			return;
		}
		if (
			((this.#te = i),
			console.timeStamp(`gex:draw`),
			this.#t.begin(this.#b, this.#x) === !1)
		) {
			this.#te = null;
			return;
		}
		for (let e of this.#W()) {
			let t = this.#o.get(e);
			if (!(!t || (t.role !== 1 && !t.placed))) {
				(this.#G(t) && this.#Z(t, this.#d === e), this.#Q(e, t));
				for (let t of this.#ee(e)) {
					let e = this.#o.get(t);
					e && this.#Q(t, e);
				}
			}
		}
		(this.#t.end(), console.timeStamp(`gex:drawn`));
		for (let e of t) fe(this.#r, e.block, e.gen);
		(r || this.#ce(t),
			this.#S++,
			this.#w &&
				(Atomics.store(this.#w, 0, this.#S),
				Atomics.store(this.#w, 1, this.#o.size)));
	}
	#Se(e, t, n) {
		let r = e.info?.input;
		if (!r) return !0;
		let i = e.cs || 1,
			a = Math.floor(t / i),
			o = Math.floor(n / i);
		return a >= r.x && a < r.x + r.w && o >= r.y && o < r.y + r.h;
	}
	#Ce(e, t) {
		let n = this.#W();
		for (let r = n.length - 1; r >= 0; r--) {
			let i = n[r],
				a = this.#o.get(i);
			if (!a) continue;
			for (let n of this.#ee(i)) {
				let r = this.#o.get(n);
				if (!r) continue;
				let i = this.#K(r);
				if (
					e >= i.x &&
					e < i.x + r.width &&
					t >= i.y &&
					t < i.y + r.height &&
					this.#Se(r, e - i.x, t - i.y)
				)
					return {
						key: n,
						win: r,
						local: { x: e - i.x, y: t - i.y },
						part: `content`,
					};
			}
			let o = this.#Y(a);
			if (
				e >= o.x &&
				e < o.x + a.width &&
				t >= o.y &&
				t < o.y + a.height &&
				this.#Se(a, e - o.x, t - o.y)
			)
				return {
					key: i,
					win: a,
					local: { x: e - o.x, y: t - o.y },
					part: `content`,
				};
			if (
				this.#G(a) &&
				!a.maximized &&
				e >= o.frameX - W &&
				e < o.frameX + o.frameW + W &&
				t >= o.frameY - W &&
				t < o.frameY + o.frameH + W
			) {
				let n =
					(t < o.frameY + W / 2) |
					(t >= o.frameY + o.frameH - W ? 2 : 0) |
					(e < o.frameX + W ? 4 : 0) |
					(e >= o.frameX + o.frameW - W ? 8 : 0);
				if (n)
					return {
						key: i,
						win: a,
						local: { x: 0, y: 0 },
						part: `resize`,
						edges: n,
					};
			}
			if (
				this.#G(a) &&
				e >= o.frameX &&
				e < o.frameX + o.frameW &&
				t >= o.frameY &&
				t < o.frameY + o.frameH
			) {
				let n = this.#X(a);
				return {
					key: i,
					win: a,
					local: { x: 0, y: 0 },
					part:
						e >= n.x && e < n.x + n.w && t >= n.y && t < n.y + n.h
							? `close`
							: `title`,
				};
			}
		}
		return null;
	}
	#we(e, t, n = 0) {
		if (e.placed) return;
		let r = this.#P(e),
			i = !!t | (e.maximized ? 2 : 0) | (e.fullscreen ? 8 : 0) | n,
			a = `${r.w}x${r.h}:${i}`;
		if (e.configuredAs === a) return;
		((e.configuredAs = a), this.#H(`configure ${e.key} ${a}`));
		let o = e.cs || 1;
		b(
			this.#r,
			e.block,
			7,
			Math.floor(r.w / o),
			Math.floor(r.h / o),
			i,
			+!!t,
			e.client,
			e.surface,
		);
	}
	#Te(e) {
		if (this.#d === e) return;
		this.#H(`focus ${e}`);
		let t = this.#d ? this.#o.get(this.#d) : null;
		((this.#d = e),
			t && (b(this.#r, t.block, 6, 0, 0, 0, 0, t.client, 0), this.#we(t, !1)));
		let n = e ? this.#o.get(e) : null;
		n &&
			(b(this.#r, n.block, 6, 0, 0, 0, 0, n.client, n.surface),
			this.#we(n, !0));
	}
	#Ee(e) {
		((this.#s = this.#s.filter((t) => t !== e)), this.#s.push(e));
	}
	#De(e) {
		let t = e ? this.#o.get(e) : null;
		t && b(this.#r, t.block, 5, 0, 0, 0, 0, t.client, 0);
	}
	pointerMove(e, t, n) {
		if (
			(this.#de &&
				((e = this.#de.ox + Math.max(0, Math.min(this.#de.w - 1, e))),
				(t = this.#de.oy + Math.max(0, Math.min(this.#de.h - 1, t)))),
			(this.#p.x = e),
			(this.#p.y = t),
			this.#v)
		) {
			this.#L(e, t, !1);
			return;
		}
		let r = this.#f ? this.#o.get(this.#f) : null;
		if (r) {
			let i = this.#K(r),
				a = r.cs || 1;
			b(
				this.#r,
				r.block,
				0,
				Math.floor((e - i.x) / a),
				Math.floor((t - i.y) / a),
				n,
				0,
				r.client,
				r.surface,
			);
			return;
		}
		if (this.#_) {
			let n = this.#o.get(this.#_.key);
			n &&
				((n.x = Math.round(e - this.#_.dx)),
				(n.y = Math.round(t - this.#_.dy)),
				this.#V(n));
			return;
		}
		let i = this.#Ce(e, t);
		((this.#ye = {
			x: e,
			y: t,
			key: i?.key ?? null,
			part: i?.part ?? null,
			edges: i?.edges ?? 0,
		}),
			(this.#ve = i?.part === `resize` ? (_t[i.edges] ?? `default`) : null));
		let a = i && i.part === `content` ? i.key : null;
		if (this.#p.over && this.#p.over !== a) {
			let e = this.#o.get(this.#p.over),
				t = a ? this.#o.get(a) : null;
			e &&
				(!t || t.token !== e.token || t.client !== e.client) &&
				this.#De(this.#p.over);
		}
		if (((this.#p.over = a), !i || i.part !== `content`)) return;
		let o = i.win.cs || 1;
		b(
			this.#r,
			i.win.block,
			0,
			Math.floor(i.local.x / o),
			Math.floor(i.local.y / o),
			n,
			0,
			i.win.client,
			i.win.surface,
		);
	}
	pointerButton(e, t, n) {
		let r = this.#g ? this.#o.get(this.#g) : null;
		if (r) {
			b(this.#r, r.block, 1, e, +!!t, n, 0, r.client, r.surface);
			return;
		}
		if (t) {
			let e = this.#Ce(this.#p.x, this.#p.y);
			((this.#h = e?.part === `content` ? e.key : null),
				e?.part === `content` &&
					e.win.wantsLock &&
					((this.#m = e.key), J({ kind: `lock-wanted` })));
		}
		if (
			((this.#p.buttons = t ? this.#p.buttons | 1 : this.#p.buttons & -2),
			!t && this.#v)
		) {
			(this.#L(this.#p.x, this.#p.y, !0), (this.#v = null));
			return;
		}
		if (!t && this.#_) {
			this.#_ = null;
			return;
		}
		let i = this.#f ? this.#o.get(this.#f) : null;
		if (i) {
			(b(this.#r, i.block, 1, e, +!!t, n, 0, i.client, i.surface),
				this.#p.buttons || (this.#f = null));
			return;
		}
		let a = this.#Ce(this.#p.x, this.#p.y);
		if (t)
			for (let [e, t] of this.#o)
				t.role === 2 &&
					((a && a.key === e) ||
						b(this.#r, t.block, 9, 0, 0, 0, 0, t.client, t.surface));
		if (a) {
			if (a.part === `close`) {
				t &&
					b(this.#r, a.win.block, 8, 0, 0, 0, 0, a.win.client, a.win.surface);
				return;
			}
			if (a.part === `resize`) {
				t && (this.#Ee(a.key), this.#Te(a.key), this.#I(a.key, a.win, a.edges));
				return;
			}
			if (a.part === `title`) {
				if (t && !a.win.placed) {
					(this.#Ee(a.key), this.#Te(a.key));
					let e = performance.now(),
						t = this.#y && this.#y.key === a.key && e - this.#y.at < 400;
					if (((this.#y = t ? null : { key: a.key, at: e }), t)) {
						this.#z(a.key, !a.win.maximized);
						return;
					}
					if (a.win.maximized) return;
					this.#_ = {
						key: a.key,
						dx: this.#p.x - a.win.x,
						dy: this.#p.y - a.win.y,
					};
				}
				return;
			}
			if (t) {
				let e =
					a.win.role === 1 || a.win.placed
						? a.key
						: `${a.win.token}:${a.win.client}:${a.win.parent}`;
				(this.#o.has(e) && !this.#o.get(e).placed && (this.#Ee(e), this.#Te(e)),
					this.#o.get(e)?.placed && (this.#f = a.key));
				let t = a.win.cs || 1;
				b(
					this.#r,
					a.win.block,
					0,
					Math.floor(a.local.x / t),
					Math.floor(a.local.y / t),
					n,
					0,
					a.win.client,
					a.win.surface,
				);
			}
			b(this.#r, a.win.block, 1, e, +!!t, n, 0, a.win.client, a.win.surface);
		}
	}
	pointerAxis(e, t, n) {
		let r = this.#Ce(this.#p.x, this.#p.y);
		!r ||
			r.part !== `content` ||
			b(this.#r, r.win.block, 2, e, t, n, 0, r.win.client, r.win.surface);
	}
	key(e, t, n, r) {
		if (!this.#d && t) {
			let e = (e) =>
					e?.role === 1 &&
					(e.info?.serial ?? 0) > 0 &&
					e.width > 0 &&
					e.height > 0 &&
					e.x < this.#b &&
					e.y < this.#x &&
					e.x + e.width > 0 &&
					e.y + e.height > 0,
				t = [...this.#s].reverse().find((t) => e(this.#o.get(t)));
			t &&
				(this.#H(`no window has the keyboard; it goes to the top one, ${t}`),
				this.#Te(t));
		}
		let i = this.#d ? this.#o.get(this.#d) : null;
		i &&
			(b(this.#r, i.block, 4, n, 0, 0, 0, i.client, 0),
			b(this.#r, i.block, 3, e, +!!t, r, 0, i.client, i.surface));
	}
	async #Oe() {
		return (
			this.#t.sceneFor() || ((this.#te = null), await this.#t.drawn(1e3)),
			this.#t.read()
		);
	}
	async readout() {
		try {
			return await this.#Oe();
		} catch (e) {
			return (
				this.#H(`readout failed: ${e?.message ?? e}`),
				console.error(`[compositor] readout failed:`, e),
				null
			);
		}
	}
	windowAt(e, t) {
		let n = this.#Ce(e, t);
		if (!n || n.part !== `content`) return null;
		let r = n.win;
		for (let e = 0; r.parent && e < 16; e++) {
			let e = this.#o.get(`${r.token}:${r.client}:${r.parent}`);
			if (!e) break;
			r = e;
		}
		let i = n.win.cs || 1;
		return {
			key: n.key,
			client: n.win.client,
			block: n.win.block,
			surface: n.win.surface,
			title: r.title || ``,
			x: Math.floor(n.local.x / i),
			y: Math.floor(n.local.y / i),
		};
	}
	async describe({ pixels: e = !0 } = {}) {
		let t = [...this.#o.values()].filter((e) => e.role === 1),
			n = e ? 0 : null,
			r = e ? 0 : null,
			a = e ? 2166136261 : null;
		if (e)
			try {
				let e = (await this.#Oe())?.px ?? new Uint8Array(),
					t = Math.round(K.desktop[2] * 255) + 12;
				for (let i = 0; i < e.length; i += 16) {
					let o = Math.max(e[i], e[i + 1], e[i + 2]);
					(o > t && n++, o > r && (r = o), (a = ((a ^ o) * 16777619) >>> 0));
				}
			} catch {}
		return {
			frames: this.#S,
			uploads: { ...this.#D },
			windows: t.length,
			surfaces: this.#o.size,
			list: [...this.#o.values()].map(
				(e) =>
					`${e.key} role=${e.role} ${e.width}x${e.height}@${e.x},${e.y} serial=${e.info?.serial ?? 0} scale=${e.bs ?? 1}/${e.cs ?? 1}${e.placed ? ` placed` : ``}${e.unmanaged ? ` unmanaged` : ``}${e.maximized ? ` maximized` : ``}` +
					(e.info?.input
						? ` input=${e.info.input.w}x${e.info.input.h}@${e.info.input.x},${e.info.input.y}`
						: ``) +
					(e.parent ? ` parent=${e.parent} rel=${e.relX},${e.relY}` : ``) +
					` "${e.title}"`,
			),
			log: this.#O.slice(-24),
			staging: this.#T === !1,
			titles: t.map((e) => e.title || `(untitled)`),
			focus: this.#d,
			lit: n,
			brightest: r,
			hash: a,
			output: `${this.#b}x${this.#x}`,
			direct: this.#de ? `${this.#de.w}x${this.#de.h}` : null,
			gl: Q?.glState?.() ?? null,
			glWindows: Q
				? Q.surfaces().map((e) => `${e.kind}:${e.id}@${e.token}`)
				: [],
			gpu: i(),
			pointer: this.#ye,
			turns: kt,
		};
	}
};
let J = (e, t) => self.postMessage(e, t ?? []),
	Y = null,
	X = null,
	Z = !1,
	kt = 0,
	At = !1;
function jt() {
	if (!(!Y || !Z)) {
		((At = !1), kt++);
		try {
			(Bt++, Q?.display?.(), Y.frame());
		} catch (e) {
			(J({ kind: `error`, error: e?.stack || String(e) }), (Z = !1));
			return;
		}
		requestAnimationFrame(jt);
	}
}
async function Mt(e) {
	let t;
	for (;;) {
		if (((t = await ne(e, t)), t === null || !Z)) return;
		if (!(!Y || At)) {
			At = !0;
			try {
				Y.frame();
			} catch (e) {
				(J({ kind: `error`, error: e?.stack || String(e) }), (Z = !1));
				return;
			}
		}
	}
}
let Q = null,
	Nt = null,
	Pt = !1,
	Ft = null,
	It = null;
function Lt() {
	return Q?.ok ? Q.attachment() : null;
}
let Rt = [],
	zt = -1,
	Bt = 0;
function Vt() {
	return Q?.ok ? (zt === Bt ? Rt : ((zt = Bt), (Rt = Q.surfaces()), Rt)) : [];
}
function Ht(e) {
	for (let t of Vt())
		if (
			t.id &&
			(t.kind === 0
				? e.token === t.token && e.surface === t.id
				: e.info?.xid === t.id)
		)
			return Ut();
	return null;
}
function Ut() {
	let e = It?.texture();
	return !e || e.width < 2 || e.height < 2
		? null
		: { tex: e, w: e.width, h: e.height, serial: Q?.presentedCount?.() ?? 0 };
}
async function Wt(e, t) {
	((It = o()),
		(Ft = It.canvas),
		globalThis.document ||
			(globalThis.document = {
				querySelector: () => Ft,
				querySelectorAll: () => [],
			}));
	let { MesaGlDevice: n } = await Promise.resolve().then(() => (qe(), Ie));
	if (
		((Q = await n.create(Ft, {
			url: e.url,
			files: e.files,
			api: e.api || `core`,
			env: e.mesaEnv,
			capture: e.glCapture,
			wgslCache: e.wgslCache,
			wgpuStats: e.wgpuStats,
			glTrace: e.glTrace,
			...(e.sources ? { source: (t) => e.sources[t] ?? null } : {}),
			gpu: await a(),
		})),
		!Q.ok)
	)
		throw Error(Q.error || `the GL device would not start`);
	if (
		((Nt = e.channel), J({ kind: `gl-ready`, describe: Q.describe() }), !Nt)
	) {
		$.resolve?.($);
		return;
	}
	Gt();
}
const $ = {
	resolve: null,
	ready: null,
	tail: Promise.resolve(),
	submit(e, t, n) {
		let r = $.tail.then(async () => {
			if ((await $.ready, !Q?.ok)) return -1;
			try {
				return await Q.submit(e, t, n);
			} catch (e) {
				return (console.error(`[gl] the device threw`, e), -1);
			}
		});
		return (
			($.tail = r.then(
				() => {},
				() => {},
			)),
			r
		);
	},
};
(($.ready = new Promise((e) => ($.resolve = e))),
	globalThis.GEX_COMPOSITOR_IN_REALM && (globalThis.__gexGlInRealm = $));
async function Gt() {
	if (Pt) return;
	Pt = !0;
	let { serveGl: e } = await Promise.resolve().then(() => (gt(), Je));
	e(Q, Nt);
}
globalThis.GEX_COMPOSITOR_IN_REALM ||
	(self.onmessage = ({ data: e }) => {
		Y?.touch();
		try {
			if (e.kind === `init`)
				((q = e.present ?? null),
					(X = e.canvas),
					yt(e.scale || 1),
					e.glLimits != null && (globalThis.GEX_GL_LIMITS = e.glLimits),
					a()
						.then((t) => {
							((Y = new Ot(
								X,
								e.channel,
								e.stats ? new Int32Array(e.stats) : null,
								t,
							)),
								Y.setDirect(e.direct),
								(Z = !0),
								requestAnimationFrame(jt),
								e.drawOnPublish !== !1 &&
									!globalThis.GEX_NO_PUBDRAW &&
									Mt(e.channel),
								J({ kind: `ready` }));
						})
						.catch((e) => J({ kind: `error`, error: e?.stack || String(e) })));
			else if (e.kind === `gl`)
				Wt(e, X).catch((e) =>
					J({ kind: `gl-failed`, error: e?.message || String(e) }),
				);
			else if (e.kind === `memory`) Y?.addMemory(e.token, e.memory, e.kernel);
			else if (e.kind === `pixels`)
				Y?.addPixels(e.token, e.id, e.buffer, e.replaces);
			else if (e.kind === `drop-memory`) {
				if ((Y?.dropMemory(e.token), Q)) {
					let t = performance.now();
					(Y?.note?.(`forget client ${e.token}`),
						Q.forgetClient(e.token),
						Y?.note?.(
							`forgot client ${e.token} in ${(performance.now() - t).toFixed(1)} ms`,
						));
				}
				zt = -1;
			} else if (e.kind === `resize`) Y?.resize(e.width, e.height);
			else if (e.kind === `pointer-move`) Y?.pointerMove(e.x, e.y, e.time);
			else if (e.kind === `pointer-lock`) Y?.pointerLock(e.on, e.time);
			else if (e.kind === `pointer-relative`)
				Y?.pointerRelative(e.dx, e.dy, e.time);
			else if (e.kind === `pointer-button`)
				Y?.pointerButton(e.button, e.pressed, e.time);
			else if (e.kind === `pointer-axis`)
				Y?.pointerAxis(e.axis, e.value, e.time);
			else if (e.kind === `key`) Y?.key(e.code, e.pressed, e.mods, e.time);
			else if (e.kind === `wgsl-cache`) {
				let t = Q?.wgslCache?.() ?? null;
				J(
					{
						kind: `wgsl-cache`,
						id: e.id,
						blob: t,
						stats: Q?.wgslStats?.() ?? null,
					},
					t ? [t] : [],
				);
			} else
				e.kind === `readout`
					? Promise.resolve(Y?.readout?.() ?? null).then((t) =>
							J(
								{ kind: `readout`, id: e.id, state: t },
								t ? [t.px.buffer] : [],
							),
						)
					: e.kind === `window-at`
						? J({
								kind: `window-at`,
								id: e.id,
								state: Y?.windowAt(e.x, e.y) ?? null,
							})
						: e.kind === `describe`
							? Promise.resolve(
									Y?.describe({ pixels: e.pixels !== !1 }) ?? null,
								).then((t) => J({ kind: `describe`, id: e.id, state: t }))
							: e.kind === `stop` && (Z = !1);
		} catch (e) {
			J({ kind: `error`, error: e?.stack || String(e) });
		}
	});
