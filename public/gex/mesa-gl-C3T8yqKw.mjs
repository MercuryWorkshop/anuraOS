import { u as e } from "./internal-DhuCGrNL.mjs";
import { i as t, n, r, t as i } from "./page-env-BH7IngaK.mjs";
import { n as a } from "./log-BhnhOsaP.mjs";
var o = null,
	s = new Map(),
	c = new Map(),
	l = !1,
	u = new Map(),
	d = {
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
	};
function f() {
	if (l || typeof GPUDevice > `u`) return;
	l = !0;
	let e = (e, t, n) => {
			let r = c.get(t);
			(r || c.set(t, (r = { n: 0, bytes: 0, made: 0, destroyed: 0, each: n })),
				r.n++,
				r.made++,
				(r.bytes += n),
				s.set(e, t));
		},
		t = (e) => {
			let t = s.get(e);
			if (t === void 0) return;
			s.delete(e);
			let n = c.get(t);
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
				(d[t.format] ?? 4) *
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
					let i = u.get(t);
					if ((i || u.set(t, (i = [0, 0])), i[0]++, n))
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
function p() {
	return (
		(o ??= (async () => {
			if (!navigator.gpu) throw Error(`navigator.gpu unavailable`);
			f();
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
				r = globalThis.GEX_GL_LIMITS,
				i = r === void 0 ? 43 : Number(r) || 0;
			if (
				(i >= 41 &&
					Object.assign(n, {
						maxTextureDimension1D: 16384,
						maxTextureDimension2D: 16384,
						maxTextureDimension3D: 2048,
						maxTextureArrayLayers: 2048,
					}),
				i >= 43)
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
			let a = {};
			for (let [t, r] of Object.entries(n)) {
				let n = e.limits[t];
				typeof n == `number` && n > 0 && (a[t] = Math.min(n, r));
			}
			let o = await e.requestDevice({ requiredFeatures: t, requiredLimits: a });
			return (
				(globalThis.__gexWebGPU ||= []).push({
					adapter: e,
					device: o,
					queue: o.queue,
				}),
				{ adapter: e, device: o }
			);
		})()),
		o.catch(() => {
			o = null;
		}),
		o
	);
}
var m = {
		NONE: 0,
		TRUNCATED: 1,
		BAD_OPCODE: 2,
		BAD_ARGUMENT: 3,
		NO_CONTEXT: 4,
		VERSION_MISMATCH: 5,
	},
	h = `GEXGLTR\0`,
	g = 1,
	_ = 24,
	v = 67108864;
function y(e) {
	return (4 - (e & 3)) & 3;
}
var b = class {
	constructor(e, t, n, r = v) {
		let i = new Uint8Array(_),
			a = new DataView(i.buffer);
		for (let e = 0; e < 8; e++) i[e] = h.charCodeAt(e);
		(a.setUint32(8, g, !0),
			a.setUint32(12, e, !0),
			a.setUint32(16, t, !0),
			a.setUint32(20, n, !0),
			(this.parts = [i]),
			(this.bytes = _),
			(this.batches = 0),
			(this.maxBytes = r),
			(this.truncated = !1));
	}
	record(e, t) {
		let n = 8 + e.length + y(e.length);
		if (this.bytes + n > this.maxBytes) return ((this.truncated = !0), !1);
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
};
function x(e, n, r, i = null) {
	let a = t(),
		o =
			i ??
			(a
				? new URLSearchParams(a).get(`glcapture`)
				: ({}.GEX_GLCAPTURE ?? null));
	if (!o || o === `0`) return null;
	let s = Number(o),
		c = new b(e, n, r, Number.isFinite(s) && s > 1 ? s : v);
	return ((globalThis.__gexGlCapture = c), c);
}
var S = class {
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
			(this.count++, (this.first ??= e), (this.last = e), this.count <= this.#e)
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
		return this.count ? `validation=${this.count} (first: ${this.first}) ` : ``;
	}
};
function C(e, t) {
	return e > t ? { len: t, cut: e - t } : { len: e, cut: 0 };
}
var w = 0,
	T = 1,
	E = 2,
	D = 3,
	O = 4,
	k = 5,
	A = 6,
	j = 7,
	M = 1144210503;
async function N(t) {
	try {
		return (
			await e(
				async () => {
					let { default: e } = await import(
						/* @vite-ignore */ /* webpackIgnore: true */ t
					);
					return { default: e };
				},
				[],
				import.meta.url,
			)
		).default;
	} catch {}
	let n = await fetch(t, { cache: `no-store` });
	if (!n.ok) throw Error(`${t}: ${n.status} ${n.statusText}`);
	let r = URL.createObjectURL(
		new Blob([await n.text()], { type: `text/javascript` }),
	);
	try {
		return (
			await e(
				async () => {
					let { default: e } = await import(
						/* @vite-ignore */ /* webpackIgnore: true */ r
					);
					return { default: e };
				},
				[],
				import.meta.url,
			)
		).default;
	} finally {
		URL.revokeObjectURL(r);
	}
}
async function P(t, n) {
	let r = new URL(/* @vite-ignore */ /* webpackIgnore: true */ t, location.href)
			.href,
		i = r.split(`/`).pop().replace(/\.js$/, ``),
		[a, o, s] = await Promise.all(
			[`${i}.js`, `${i}.wasm`, `${i}.deferred.wasm`].map((e) =>
				Promise.resolve()
					.then(() => n(e))
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
	if (!a) return null;
	let c = new TextDecoder()
			.decode(a)
			.replaceAll(`import.meta.url`, JSON.stringify(r)),
		l = new Blob([c], { type: `text/javascript` }),
		u = URL.createObjectURL(l),
		d;
	try {
		d = (
			await e(
				async () => {
					let { default: e } = await import(
						/* @vite-ignore */ /* webpackIgnore: true */ u
					);
					return { default: e };
				},
				[],
				import.meta.url,
			)
		).default;
	} finally {
		URL.revokeObjectURL(u);
	}
	let f = { mainScriptUrlOrBlob: l },
		p,
		m = new Promise((e, t) => {
			p = t;
		});
	if (o) {
		let e = await WebAssembly.compile(o),
			t = WebAssembly.Module.imports(e).some((e) => e.module === `gexcold`);
		if (!t || s) {
			let n = t ? await WebAssembly.compile(s) : null;
			((f.gexNoColdPrefetch = !0),
				(f.instantiateWasm = (t, r) => {
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
							p(Error(`instantiating Mesa failed: ${e?.message ?? e}`)),
						),
						{}
					);
				}));
		}
	}
	return { factory: d, extra: f, failed: m };
}
var F = new Map();
function I() {
	if (I.done || typeof GPUQueue > `u`) return;
	I.done = !0;
	let e = (e) => {
			let t = F.get(e);
			return (t || F.set(e, (t = [0, 0, 0, 0])), t);
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
function L(e) {
	try {
		return globalThis.document !== void 0 && r().get(e) === `1`;
	} catch {
		return !1;
	}
}
function R(e, t) {
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
function z(e, t, n) {
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
var B = class e {
	#e = null;
	#t = null;
	#n = null;
	#r = null;
	#i = null;
	#a = null;
	#o = new S();
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
	static async create(t, r = {}) {
		let {
				api: o = `es`,
				major: s = 0,
				minor: c = 0,
				url: l = n(`/gex/gex-wgpu-replay.js`),
			} = r,
			u = new e();
		t.id = `gex-gl`;
		try {
			let { adapter: e, device: n } = r.gpu ?? (await p());
			((u.#e = e), (u.#t = n), (r.wgpuStats ?? L(`wgpustats`)) && I());
			{
				let e = n.destroy.bind(n);
				n.destroy = () => {
					(console.error(
						`[mesa-gl] the WebGPU device is being destroyed`,
						Error(`destroy`).stack,
					),
						e());
				};
			}
			(n.lost.then((e) => {
				let t = `${e.reason}: ${e.message}`;
				(console.error(`[mesa-gl] WebGPU device lost:`, t),
					(u.#a ||= `WebGPU device lost: ${t}`));
			}),
				n.addEventListener(`uncapturederror`, (e) => {
					u.#o.note(e.error?.message || String(e.error));
				}));
			let d = performance.now(),
				f = r.source ? await P(l, r.source) : null,
				m = (f?.factory ?? (await N(l)))({
					preinitializedWebGPUDevice: n,
					mainScriptUrlOrBlob: new URL(
						/* @vite-ignore */ /* webpackIgnore: true */ l,
						location.href,
					).href,
					locateFile: (e) =>
						(r.files ?? i(`/gex/`))?.[e] ??
						new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ e,
							new URL(
								/* @vite-ignore */ /* webpackIgnore: true */ l,
								location.href,
							),
						).href,
					print: (e) => a(`debug`) && console.log(`[mesa-gl]`, e),
					printErr: R(
						(e) => console.warn(`[mesa-gl]`, e),
						r.glTrace ?? L(`gltrace`),
					),
					...f?.extra,
				});
			((u.#n = await (f ? Promise.race([m, f.failed]) : m)),
				a(`debug`) &&
					console.warn(
						`[mesa-gl] Mesa loaded${f ? ` from the page's files` : ``} in ${Math.round(performance.now() - d)} ms`,
					),
				(u.#r = WebAssembly.promising(u.#n.gexGlSubmitRaw)),
				u.#n.gexD3dSubmitRaw &&
					(u.#i = WebAssembly.promising(u.#n.gexD3dSubmitRaw)),
				u.#n._gex_gl_set_api && u.#n._gex_gl_set_api(+(o === `core`), s, c));
			for (let e of (r.env || ``).split(`,`).filter(Boolean)) {
				if (!u.#n._gex_gl_setenv) break;
				let t = new TextEncoder().encode(`${e}\0`),
					n = u.#n._malloc(t.length);
				(u.#n.HEAPU8.set(t, n), u.#n._gex_gl_setenv(n), u.#n._free(n));
			}
			await u.#E(l, r.wgslCache ?? `all`);
			let h = u.#n._gex_gl_init(t.width, t.height);
			(h !== 0 && (u.#a = `Mesa/WebGPU initialization failed (${h})`),
				(u.#u = `Mesa st/mesa + gex_wgpu on WebGPU (${o})`),
				(u.capture = x(13, t.width, t.height, r.capture)));
		} catch (e) {
			u.#a = e?.message || String(e);
		}
		return u;
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
				a(`debug`) &&
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
			i(await z(`get`, this.#w), `this browser`);
		} catch {}
		let o = setInterval(() => this.#D(), 5e3);
		(globalThis.__gexWgslTimers ||= []).push(o);
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
				await z(`put`, this.#w, this.wgslCache());
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
			a = i[w] === M;
		if ((!a && i[w] !== 1196967239) || (a && !this.#i)) return -1;
		if (i[j] !== (a ? 1 : 13)) return ((i[k] = m.VERSION_MISMATCH), -1);
		let o = i[T],
			s = i[E],
			c = i[D];
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
				fetch(`/__gex_capture`, { method: `POST`, body: e }).catch(() => {}));
		}
		let d = a && this.statsOn,
			f = d ? performance.now() : 0,
			p = this.#n._malloc(s || 1);
		s && this.#n.HEAPU8.set(u, p);
		let h = d ? performance.now() : 0,
			g = (e) => {
				d &&
					this.#n._gex_d3d_note_js(
						h - f,
						performance.now() - h,
						+!!this.#n._gex_d3d_reply_len(),
					);
				let i = new Uint32Array(t.buffer, n, 8),
					s = performance.now() - l;
				this.#p += s;
				let u = this.#n,
					g = a ? u._gex_d3d_reply_len : u._gex_gl_reply_len,
					_ = a ? u._gex_d3d_reply_data : u._gex_gl_reply_data;
				if (
					((g?.() ?? 0) >= 262144 && (this.#m++, (this.#h += s)),
					s > this.#g && (this.#g = s),
					this.#n._free(p),
					e !== 0)
				) {
					if ((this.#s++, a))
						return (
							(this.#l = `client ${r} D3D stream refused (${e})`),
							console.error(`[mesa-gl] ${this.#l}`),
							(i[k] = m.BAD_OPCODE),
							(i[O] = 0),
							(i[E] = 0),
							(i[A] = 0),
							e
						);
					let t =
						[``, `short read`, `trailing data`, `unknown opcode`, `no context`][
							u._gex_gl_reject_why?.() ?? 0
						] || `refused`;
					return (
						(this.#l = `client ${r} batch rejected (${e}): opcode ${u._gex_gl_reject_op?.() ?? `?`} ${t}, payload ${u._gex_gl_reject_payload?.() ?? `?`}`),
						console.error(`[mesa-gl] ${this.#l}`),
						(i[k] = m.BAD_OPCODE),
						(i[O] = 0),
						(i[E] = 0),
						(i[A] = 0),
						e
					);
				}
				let v = C(g(), c),
					y = v.len;
				if (
					(v.cut &&
						(this.#c++ ||
							console.error(
								`[mesa-gl] client ${r}: a reply ${v.cut} bytes over the ring's ${c}; cut, as natively`,
							)),
					y)
				) {
					let e = _();
					new Uint8Array(t.buffer, n + 32 + o, y).set(
						this.#n.HEAPU8.subarray(e, e + y),
					);
				}
				return ((i[E] = 0), (i[O] = y), (i[k] = m.NONE), (i[A] = 0), 0);
			};
		this.#_ = !0;
		let _ = (e) => {
				this.#k();
				let t = g(e);
				return (
					this.#b &&
						((this.#b = !1),
						this.display(),
						this.presentedCount(),
						this.producedCount()),
					t
				);
			},
			v = (t) => {
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
			y;
		try {
			y = (a ? this.#i : this.#r)(p, s, r >>> 0);
		} catch (e) {
			return v(e);
		}
		return y instanceof Promise ? y.then(_, v) : _(y);
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
			(t._gex_d3d_forget_client?.(e >>> 0), t._gex_gl_forget_client(e >>> 0));
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
		return this.#_ ? ((this.#b = !0), 0) : (this.#n?._gex_gl_display?.() ?? 0);
	}
	presentedCount() {
		return (
			this.#_ || (this.#x = this.#n?._gex_gl_presented?.() ?? 0),
			this.#x
		);
	}
	producedCount() {
		return (this.#_ || (this.#S = this.#n?._gex_gl_produced?.() ?? 0), this.#S);
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
		if (!F.size) return ``;
		let e = this.producedCount(),
			t = Math.max(1, e - this.#A.frames),
			n = [];
		for (let [e, r] of [...F].sort((e, t) => t[1][1] - e[1][1])) {
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
				calls: new Map([...F].map(([e, t]) => [e, [...t]])),
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
};
export { B as MesaGlDevice };
