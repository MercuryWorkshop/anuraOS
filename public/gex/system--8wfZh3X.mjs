import {
	a as e,
	c as t,
	l as n,
	o as r,
	p as i,
	t as a,
	u as o,
} from "./internal-DhuCGrNL.mjs";
import { n as s, t as c } from "./page-fs-DR8goUYz.mjs";
var l = new TextEncoder();
function u(e) {
	if (typeof e == `string`) return l.encode(e);
	if (e instanceof ArrayBuffer) return new Uint8Array(e.slice(0));
	if (ArrayBuffer.isView(e))
		return new Uint8Array(e.buffer, e.byteOffset, e.byteLength).slice();
	throw TypeError(`write: a string or bytes`);
}
var d = class extends Event {
		constructor(e) {
			(super(`data`), (this.data = e));
		}
	},
	f = class extends EventTarget {
		#e;
		constructor(e) {
			(super(), (this.#e = e));
		}
		write(e) {
			this.#e.write(u(e));
		}
		resize(e, t) {
			this.#e.resize(e | 0, t | 0);
		}
	},
	p = class extends EventTarget {
		#e;
		#t = null;
		#n = null;
		#r = 0;
		#i = null;
		#a = null;
		#o;
		#s;
		#c;
		#l;
		#u = [];
		#d = null;
		constructor({
			argv: e,
			stdio: n,
			encoding: r,
			untilExit: i = !1,
			read: o,
			unread: s,
			write: c,
			closeStdin: l,
			resize: p,
			kill: m,
			kick: h,
			release: g,
			windows: _,
		}) {
			if (
				(super(),
				(this.argv = [...e]),
				(this.#e = {
					write: c,
					closeStdin: l,
					resize: p,
					kill: m,
					kick: h,
					release: g,
					windows: _,
				}),
				(this.started = new Promise((e, t) => {
					((this.#o = e), (this.#s = t));
				})),
				(this.exited = new Promise((e, t) => {
					((this.#c = e), (this.#l = t));
				})),
				this.started.catch(() => {}),
				this.exited.catch(() => {}),
				(this.pty = null),
				(this.stdin = this.stdout = this.stderr = null),
				n === `pty`)
			)
				(r && (this.#i = new TextDecoder(r)),
					(this.pty = new f({ write: c, resize: p })),
					(this.#r = 1));
			else if (n === `pipe`) {
				this.stdin = new WritableStream({
					write: (e) => c(u(e)),
					close: () => l(),
					abort: () => l(),
				});
				let e = i ? () => this.#n !== null : null,
					t = async (e) => {
						for (; await o(e); );
						(this.#r--, this.#f());
					},
					n = (n) =>
						new ReadableStream(
							{
								pull: async (r) => {
									let i = this.#a ? null : await o(n, e);
									if (i) return r.enqueue(i);
									if (this.#a) return r.error(this.#a);
									if ((r.close(), i === void 0)) return void t(n);
									(this.#r--, this.#f());
								},
								cancel: () => {
									(s(n), this.#r--, this.#f());
								},
							},
							{ highWaterMark: 0 },
						);
				((this.stdout = n(1)), (this.stderr = n(2)), (this.#r = 2));
			}
			let v = this.#e;
			this[a] = {
				started: (e) => {
					((this.#t = e), this.#o(e));
					for (let t of this.#u.splice(0)) v.kill(e, t);
				},
				failed: (e) => {
					let t =
						typeof e == `number`
							? Object.assign(
									Error(
										`${this.argv[0]}: ${e === 2 ? `no such program` : e === 13 ? `permission denied` : e === 8 ? `not a program gex can run` : `could not start (errno ${e})`}`,
									),
									{ errno: e },
								)
							: e;
					((this.#a = t),
						this.#s(t),
						this.#l(t),
						this.dispatchEvent(
							Object.assign(new Event(`error`), { error: t }),
						));
				},
				data: (e) => {
					e
						? this.pty?.dispatchEvent(
								new d(this.#i ? this.#i.decode(e, { stream: !0 }) : e),
							)
						: (this.#r--, this.#f());
				},
				drained: () =>
					this.#m
						? Promise.resolve()
						: new Promise((e) => {
								let t = this.#d;
								this.#d = () => {
									(t?.(), e());
								};
							}),
				exit: ({ code: e, signal: n, shutdown: r }) => {
					this.#n ||
						((this.#n = { code: e, signal: n ? t(n) : null }),
						r ? (this.#r = 0) : i && v.kick?.(),
						this.#f());
				},
			};
		}
		#f() {
			this.#n &&
				(this.#p ||
					((this.#p = !0),
					this.#c(this.#n),
					this.dispatchEvent(Object.assign(new Event(`exit`), this.#n))),
				this.#r <= 0 &&
					!this.#m &&
					((this.#m = !0), this.#d?.(), this.#e.release()));
		}
		#p = !1;
		#m = !1;
		get pid() {
			return this.#t;
		}
		kill(e = `SIGTERM`) {
			this.#n ||
				(this.#t === null ? this.#u.push(e) : this.#e.kill(this.#t, e));
		}
		windows() {
			return this.#t === null ? [] : (this.#e.windows?.(this.#t) ?? []);
		}
	},
	m = 2,
	h = class {
		#e = null;
		#t = null;
		onActivity = () => {};
		set(e) {
			((this.#e = e),
				`rings` in e && (e.rings = this.#t),
				(e.onActivity = (...e) => this.onActivity(...e)));
		}
		get rings() {
			return this.#t;
		}
		set rings(e) {
			((this.#t = e), this.#e && `rings` in this.#e && (this.#e.rings = e));
		}
		get url() {
			return this.#e?.url ?? null;
		}
		get pageHosts() {
			return this.#e?.pageHosts;
		}
		open() {
			return this.#e ? this.#e.open() : 0;
		}
		connect(e, t, n) {
			this.#e?.connect(e, t, n);
		}
		status(e) {
			return this.#e ? this.#e.status(e) : m;
		}
		send(e, t) {
			return this.#e ? this.#e.send(e, t) : -1;
		}
		recv(e, t) {
			return this.#e ? this.#e.recv(e, t) : 0;
		}
		peek(e, t) {
			return this.#e ? this.#e.peek(e, t) : 0;
		}
		available(e) {
			return !this.#e || this.#e.available(e);
		}
		dup(e) {
			return this.#e ? this.#e.dup(e) : 0;
		}
		close(e) {
			this.#e?.close(e);
		}
		refill(e) {
			return this.#e?.refill?.(e) ?? 0;
		}
	},
	g = class extends EventTarget {
		#e;
		#t = null;
		#n = !1;
		constructor({ read: e, write: t, closeStdin: n, release: r }) {
			(super(),
				(this.#e = { write: t, closeStdin: n, release: r }),
				(this.readable = new ReadableStream(
					{
						start: (e) => {
							this.#t = e;
						},
						pull: async (t) => {
							let n = this.#n ? null : await e();
							if (n) return t.enqueue(n);
							try {
								t.close();
							} catch {}
							this.#r();
						},
						cancel: () => this.close(),
					},
					{ highWaterMark: 0 },
				)),
				(this.writable = new WritableStream({
					write: (e) => {
						t(
							e instanceof Uint8Array
								? e.slice()
								: typeof e == `string`
									? new TextEncoder().encode(e)
									: new Uint8Array(e),
						);
					},
					close: () => n(),
					abort: () => this.close(),
				})),
				(this[a] = {
					exit: () => {
						try {
							this.#t?.close();
						} catch {}
						this.#r();
					},
				}));
		}
		#r() {
			this.#n ||
				((this.#n = !0),
				this.#e.release(),
				this.dispatchEvent(new Event(`close`)));
		}
		close() {
			if (!this.#n) {
				try {
					this.#t?.close();
				} catch {}
				this.#r();
			}
		}
	},
	_ = {
		STAT: 1,
		LSTAT: 2,
		READDIR: 3,
		OPEN: 4,
		READ: 5,
		WRITE: 6,
		CLOSE: 7,
		MKDIR: 8,
		UNLINK: 9,
		RMDIR: 10,
		RENAME: 11,
		TRUNCATE: 12,
		CHMOD: 13,
		UTIMES: 14,
		READLINK: 15,
		SYMLINK: 16,
		HOSTCALL: 17,
		HOSTREAD: 18,
		HOSTDONE: 19,
	},
	v = {
		ACCMODE: 3,
		WRONLY: 1,
		RDWR: 2,
		CREAT: 64,
		EXCL: 128,
		TRUNC: 512,
		APPEND: 1024,
	},
	y = {
		EPERM: 1,
		ENOENT: 2,
		EIO: 5,
		EBADF: 9,
		EAGAIN: 11,
		ENOMEM: 12,
		EACCES: 13,
		EBUSY: 16,
		EEXIST: 17,
		EXDEV: 18,
		ENODEV: 19,
		ENOTDIR: 20,
		EISDIR: 21,
		EINVAL: 22,
		EFBIG: 27,
		ENOSPC: 28,
		EROFS: 30,
		ENAMETOOLONG: 36,
		ENOSYS: 38,
		ENOTEMPTY: 39,
		ELOOP: 40,
		ENOTSUP: 95,
		EOPNOTSUPP: 95,
		ETIMEDOUT: 110,
	},
	b = { file: 1, directory: 2, symlink: 3 },
	x = 32;
function S(e) {
	if (Number.isInteger(e?.errno) && e.errno !== 0) return -Math.abs(e.errno);
	let t = typeof e?.code == `string` ? e.code : null;
	return t && y[t]
		? -y[t]
		: e?.name === `NotFoundError`
			? -y.ENOENT
			: e?.name === `TypeMismatchError`
				? -y.ENOTDIR
				: e?.name === `NoModificationAllowedError` ||
					  e?.name === `NotAllowedError`
					? -y.EACCES
					: e?.name === `QuotaExceededError`
						? -y.ENOSPC
						: e?.name === `InvalidModificationError`
							? -y.ENOTEMPTY
							: -y.EIO;
}
var C = (e) => Object.assign(Error(e), { code: e });
function w(e) {
	let t =
		typeof e?.type == `string`
			? e.type
			: e?.isDirectory?.()
				? `directory`
				: e?.isSymbolicLink?.()
					? `symlink`
					: `file`;
	return b[t === `dir` ? `directory` : t] ?? 1;
}
function T(e, t, n) {
	let r = w(n),
		i = Number.isInteger(n?.mode) ? n.mode & 4095 : r === 2 ? 493 : 420,
		a =
			n?.mtime instanceof Date
				? n.mtime.getTime()
				: Number(n?.mtimeMs ?? n?.mtime ?? 0);
	(e.setUint32(t, r, !0),
		e.setUint32(t + 4, i, !0),
		e.setBigUint64(
			t + 8,
			BigInt(Math.max(0, Math.floor(Number(n?.size ?? 0)))),
			!0,
		),
		e.setBigInt64(t + 16, BigInt(Math.floor(a / 1e3)), !0));
	let o = Number(n?.ino ?? 0);
	e.setBigUint64(
		t + 24,
		BigInt(Number.isFinite(o) && o > 0 ? Math.floor(o) : 0),
		!0,
	);
}
var ee = class {
		#e;
		#t;
		#n;
		#r = new Map();
		#i = new Map();
		#a = 1;
		#o = 1;
		#s = 0;
		#c = new Map();
		#l = !1;
		#u;
		#d = new Map();
		#f = 1;
		constructor(e) {
			((this.#e = s()),
				(this.#t = new Int32Array(this.#e)),
				(this.#n = new Uint8Array(this.#e)),
				(this.#u = e),
				this.#p());
		}
		get control() {
			return { ctl: this.#e };
		}
		add(e) {
			let t = this.#o++;
			return (this.#r.set(t, e), this.#p(), t);
		}
		remove(e) {
			this.#r.delete(e);
			for (let [t, n] of this.#i) n.id === e && this.#i.delete(t);
		}
		#p() {
			if (this.#l) return;
			this.#l = !0;
			let e = () => {
				this.#m();
				let t = Atomics.waitAsync(this.#t, 0, this.#s);
				t.async ? t.value.then(e) : queueMicrotask(e);
			};
			e();
		}
		#m() {
			this.#s = Atomics.load(this.#t, 0);
			for (let e = 0; e < 8; e++) {
				let t = (64 + e * c) / 4;
				Atomics.compareExchange(this.#t, t, 2, 3) === 2 &&
					this.#h(e).catch(() => {});
			}
		}
		async #h(e) {
			let t = (64 + e * c) / 4,
				n = 64 + e * c + 16,
				r = this.#t[t + 2],
				i = this.#n.slice(n, n + r),
				a,
				o = null;
			try {
				[a, o] = await this.#g(i);
			} catch (e) {
				((a = S(e)), (o = null));
			}
			let s = o ? Math.min(o.length, c - 16) : 0;
			(s && this.#n.set(o.subarray(0, s), n),
				(this.#t[t + 1] = a),
				(this.#t[t + 3] = s),
				Atomics.store(this.#t, t, 4),
				Atomics.notify(this.#t, t));
		}
		async #g(e) {
			let t = new DataView(e.buffer, e.byteOffset, e.byteLength),
				n = t.getUint32(0, !0),
				r = t.getUint32(4, !0),
				i = t.getUint32(8, !0),
				a = t.getUint32(12, !0),
				o = t.getUint32(16, !0),
				s = t.getUint32(20, !0),
				c = Number(t.getBigUint64(24, !0)),
				l = 32,
				u = () => {
					let n = t.getUint32(l, !0),
						r = new TextDecoder().decode(e.subarray(l + 4, l + 4 + n));
					return ((l += 4 + n), r);
				},
				d = e.length > l ? u() : ``,
				f = e.length > l ? u() : ``,
				p = e.subarray(l);
			if (n === _.HOSTCALL) return this.#v(p);
			if (n === _.HOSTREAD) {
				let e = this.#d.get(i);
				if (!e) throw C(`EBADF`);
				let t = e.subarray(c, c + s);
				return [t.length, t];
			}
			if (n === _.HOSTDONE) return (this.#d.delete(i), [0, null]);
			let m =
				n === _.READ || n === _.WRITE || n === _.CLOSE
					? this.#r.get(this.#i.get(i)?.id)
					: this.#r.get(r);
			if (!m) throw C(`ENODEV`);
			let h = (e) => {
				let t = new Uint8Array(x);
				return (T(new DataView(t.buffer), 0, e), t);
			};
			switch (n) {
				case _.STAT:
					return [0, h(await m.stat(d))];
				case _.LSTAT:
					return [0, h(await (m.lstat ?? m.stat).call(m, d))];
				case _.READDIR:
					return this.#b(m, r, d, c);
				case _.OPEN:
					return this.#y(m, r, d, a, o);
				case _.READ: {
					let e = this.#i.get(i),
						t = await m.read(e.h, c, s),
						n = t instanceof Uint8Array ? t : new Uint8Array(t ?? []);
					return [Math.min(n.length, s), n];
				}
				case _.WRITE: {
					let e = this.#i.get(i),
						t = await m.write(e.h, c, p.slice());
					return [Number.isInteger(t) ? t : p.length, null];
				}
				case _.CLOSE: {
					let e = this.#i.get(i);
					return (this.#i.delete(i), await m.close?.(e.h), [0, null]);
				}
				case _.MKDIR:
					return (await m.mkdir(d, o & 4095), [0, null]);
				case _.UNLINK:
					return (await m.unlink(d), [0, null]);
				case _.RMDIR:
					return (await (m.rmdir ?? m.unlink).call(m, d), [0, null]);
				case _.RENAME:
					return (await m.rename(d, f), [0, null]);
				case _.TRUNCATE: {
					if (!m.truncate) throw C(`EPERM`);
					let e = i === 4294967295 ? void 0 : this.#i.get(i)?.h;
					return (await m.truncate(d, c, e), [0, null]);
				}
				case _.CHMOD:
					return (await m.chmod?.(d, o & 4095), [0, null]);
				case _.UTIMES:
					return (await m.utimes?.(d, new Date(c * 1e3)), [0, null]);
				case _.READLINK:
					if (!m.readlink) throw C(`EINVAL`);
					return this.#_(new TextEncoder().encode(await m.readlink(d)));
				case _.SYMLINK:
					if (!m.symlink) throw C(`EPERM`);
					return (await m.symlink(d, f), [0, null]);
				default:
					throw C(`ENOSYS`);
			}
		}
		#_(e) {
			return [e.length, e];
		}
		async #v(e) {
			let t = e.indexOf(0),
				n = new TextDecoder().decode(e.subarray(0, t < 0 ? e.length : t)),
				r = t < 0 ? `` : new TextDecoder().decode(e.subarray(t + 1)),
				{ ok: i, text: a } = await this.#u(n, r),
				o = new TextEncoder().encode(a),
				s = new Uint8Array(1 + o.length);
			((s[0] = +!i), s.set(o, 1));
			let c = this.#f++,
				l = s.subarray(0, 131072);
			l.length < s.length && this.#d.set(c, s);
			let u = new Uint8Array(4 + l.length);
			return (
				new DataView(u.buffer).setUint32(0, c, !0),
				u.set(l, 4),
				[s.length, u]
			);
		}
		async #y(e, t, n, r, i) {
			let a = null;
			try {
				a = await e.stat(n);
			} catch (e) {
				if (S(e) !== -y.ENOENT || !(r & v.CREAT)) throw e;
			}
			if (a && r & v.CREAT && r & v.EXCL) throw C(`EEXIST`);
			let o = new Uint8Array(36),
				s = new DataView(o.buffer);
			if (a && w(a) === b.directory)
				return (T(s, 0, a), s.setInt32(x, -1, !0), [0, o]);
			let c = r & v.ACCMODE,
				l = await e.open(n, {
					read: c !== v.WRONLY,
					write: c === v.WRONLY || c === v.RDWR,
					create: !!(r & v.CREAT),
					truncate: !!(r & v.TRUNC),
					exclusive: !!(r & v.EXCL),
					append: !!(r & v.APPEND),
					mode: i & 4095,
				});
			if (!a || r & v.TRUNC)
				try {
					a = await e.stat(n);
				} catch {
					a = { type: `file`, size: 0, mode: i & 4095, mtime: Date.now() };
				}
			let u = this.#a++;
			return (
				this.#i.set(u, { id: t, h: l }),
				T(s, 0, a),
				s.setInt32(x, u, !0),
				[0, o]
			);
		}
		async #b(e, t, n, r) {
			let i = `${t}:${n}`,
				a = r > 0 ? this.#c.get(i) : null;
			if (!a) {
				let t = await e.readdir(n);
				a = [];
				for (let r of t)
					if (typeof r == `string`) {
						let t = b.file;
						try {
							t = w(
								(await e.lstat?.(`${n.replace(/\/$/, ``)}/${r}`)) ??
									(await e.stat(`${n.replace(/\/$/, ``)}/${r}`)),
							);
						} catch {}
						a.push([r, t]);
					} else a.push([r.name, w(r)]);
				((a = a.filter(([e]) => e && e !== `.` && e !== `..`)),
					this.#c.set(i, a));
			}
			let o = new Uint8Array(c - 16),
				s = 0,
				l = 0,
				u = new TextEncoder();
			for (let e = r; e < a.length; e++) {
				let t = u.encode(a[e][0]);
				if (s + 3 + t.length > o.length) break;
				((o[s] = a[e][1]),
					(o[s + 1] = t.length & 255),
					(o[s + 2] = t.length >> 8),
					o.set(t, s + 3),
					(s += 3 + t.length),
					l++);
			}
			return (l === 0 && this.#c.delete(i), [l, o.subarray(0, s)]);
		}
	},
	E = {
		1: `EPERM`,
		2: `ENOENT`,
		9: `EBADF`,
		11: `EAGAIN`,
		13: `EACCES`,
		17: `EEXIST`,
		18: `EXDEV`,
		20: `ENOTDIR`,
		21: `EISDIR`,
		22: `EINVAL`,
		28: `ENOSPC`,
		36: `ENAMETOOLONG`,
		39: `ENOTEMPTY`,
		40: `ELOOP`,
		111: `ECONNREFUSED`,
	};
function D(e, t) {
	let n = E[-e] ?? `errno ${-e}`;
	return Object.assign(Error(`${n}: ${t}`), { code: n, errno: -e });
}
async function O() {
	if (typeof Worker == `function`)
		return new Worker(
			new URL("./kernel-worker-Bwb1m5if.mjs", import.meta.url),
			{ type: "module", name: "gex-kernel" },
		);
	let { Worker: e } = await o(
		async () => {
			let { Worker: e } = await import(
				`./__vite-browser-external-6NL05v10.mjs`
			).then((e) => i(e.default, 1));
			return { Worker: e };
		},
		[],
		import.meta.url,
	);
	return new e(
		new URL(
			/* @vite-ignore */ /* webpackIgnore: true */ import.meta.url.replace(
				/[^/]*$/,
				`kernel-worker.js`,
			),
		),
	);
}
var te = class e {
		#e;
		#t = 1;
		#n = new Map();
		#r;
		#i = new Set();
		#a = null;
		#o = !1;
		#s = -1;
		#c = 0;
		#l = new Set();
		#u = [];
		#d = !1;
		static async start(t) {
			let n = new e(await O(), t.memory);
			return ((n.#i = new Set(await n.#p(`start`, { spec: t }))), n);
		}
		has(e) {
			return this.#i.has(e);
		}
		constructor(e, t) {
			((this.#e = e), (this.#r = t));
			let n = (e) => {
					let t = this.#n.get(e?.call);
					t &&
						(this.#n.delete(e.call),
						e.error
							? t.reject(
									Object.assign(Error(e.error.message), {
										workerStack: e.error.stack,
									}),
								)
							: t.resolve(e.value));
				},
				r = (e) =>
					this.#f(Error(`the kernel Worker failed: ${e?.message ?? e}`));
			e.addEventListener
				? (e.addEventListener(`message`, (e) => n(e.data)),
					e.addEventListener(`error`, r))
				: (e.on(`message`, n), e.on(`error`, r));
		}
		#f(e) {
			for (let t of this.#n.values()) t.reject(e);
			this.#n.clear();
		}
		#p(e, t) {
			if (this.#o) return Promise.reject(Error(`the kernel is stopped`));
			let n = this.#t++;
			return new Promise((r, i) => {
				(this.#n.set(n, { resolve: r, reject: i }),
					this.#e.postMessage({ call: n, op: e, ...t }));
			});
		}
		calls(e) {
			for (let t of e)
				for (let e of t.a ?? []) {
					let t = e?.in ?? e?.ptr;
					t instanceof Uint8Array &&
						t.byteLength !== t.buffer.byteLength &&
						!(t.buffer instanceof SharedArrayBuffer) &&
						(e.in === void 0 ? (e.ptr = t.slice()) : (e.in = t.slice()));
				}
			if (!this.#a) {
				let e = (this.#a = { groups: [], done: [] });
				queueMicrotask(() => {
					((this.#a = null),
						this.#p(`calls`, { groups: e.groups }).then(
							(t) => e.done.forEach(([e], n) => e(t[n])),
							(t) => e.done.forEach(([, e]) => e(t)),
						));
				});
			}
			let t = this.#a;
			return (t.groups.push(e), new Promise((e, n) => t.done.push([e, n])));
		}
		async call(e, ...t) {
			return (await this.calls([{ f: e, a: t }]))[0];
		}
		async r(e, ...t) {
			return (await this.call(e, ...t)).r;
		}
		words() {
			return new Int32Array(this.#r.buffer);
		}
		async watch(e) {
			if (!(!e || this.#l.has(e))) {
				if ((this.#l.add(e), this.#s < 0)) {
					let [{ r: e }, { r: t }] = await this.calls([
						{ f: `k_ws_alloc` },
						{ f: `k_ws_addr`, a: [{ ref: 0 }] },
					]);
					if (e < 0)
						throw Error(`the runtime found no free wait slot in the kernel`);
					((this.#s = e), (this.#c = (t >>> 0) >>> 2));
				}
				await this.r(`k_wq_add`, e, this.#s);
			}
		}
		async unwatch(e) {
			!this.#l.delete(e) ||
				this.#o ||
				(await this.r(`k_wq_del`, e, this.#s).catch(() => {}));
		}
		seq() {
			return this.#s < 0 ? 0 : Atomics.load(this.words(), this.#c);
		}
		changed(e) {
			return this.#o || this.seq() !== e
				? Promise.resolve()
				: new Promise((t) => {
						(this.#u.push([e, t]), this.#m());
					});
		}
		async #m() {
			if (!this.#d) {
				for (this.#d = !0; this.#u.length && !this.#o; ) {
					let e = this.seq(),
						t = this.#u.filter(([t, n]) => t === e || void n());
					if (((this.#u = t), !t.length)) break;
					let n = Atomics.waitAsync(this.words(), this.#c, e, 3e4);
					n.async &&
						(await n.value) === `timed-out` &&
						this.#u.splice(0).forEach(([, e]) => e());
				}
				this.#d = !1;
			}
		}
		kick() {
			this.#u.splice(0).forEach(([, e]) => e());
		}
		terminate() {
			((this.#o = !0),
				this.#e.terminate(),
				this.#f(Error(`the kernel is stopped`)),
				this.#u.splice(0).forEach(([, e]) => e()));
		}
	},
	k = new TextEncoder(),
	A = new TextDecoder(),
	j = -34,
	M = 128,
	ne = 512,
	re = 1024,
	ie = 65536,
	ae = 131072,
	N = 4 << 20,
	P = 16 << 20,
	F = 72,
	I = 1,
	L = [`file`, `directory`, `symlink`, `chardev`, `fifo`, `socket`],
	oe = 32 << 20;
async function R(e, t, n) {
	let r = [],
		i = 0,
		a = async () => {
			if (!r.length) return;
			let t = await e.calls(r);
			(n && t.forEach((e, t) => n(e.r, r[t])), (r = []), (i = 0));
		};
	for (let e of t) {
		let t = (e.a ?? []).reduce((e, t) => e + (t?.in?.length ?? 0), 0);
		(i + t > oe && (await a()), r.push(e), (i += t));
	}
	await a();
}
var se = class {
	#e;
	constructor(e) {
		this.#e = e;
	}
	async real(e, t = !0) {
		let {
			r: n,
			out: [r],
		} = await this.#e.call(`k_fs_walk`, { in: e }, { in: `` }, +!!t, {
			out: 4096,
		});
		if (n < 0) return e;
		let i = A.decode(r.subarray(0, n & ((1 << 30) - 1)));
		return i.startsWith(`/`) ? i : `/${i}`;
	}
	async open(e, t = 0, n = 0) {
		let r = await this.#e.r(
			`k_fs_open`,
			{ in: await this.real(e, !(t & ae)) },
			BigInt(t),
			n,
		);
		if (r < 0) throw D(r, e);
		return r;
	}
	async stat(e, t = !0) {
		let {
			r: n,
			out: [r],
		} = await this.#e.call(
			`k_fs_path_meta`,
			{ in: await this.real(e, t) },
			{ outPtr: F },
		);
		if (n < 0) throw D(n, e);
		return B(r);
	}
	async readFile(e) {
		let t = await this.open(e, 0);
		try {
			let n = [],
				r = 0;
			for (;;) {
				let {
					r: i,
					out: [a],
				} = await this.#e.call(`k_fs_read`, t, BigInt(r), { out: N });
				if (i < 0) throw D(i, e);
				if (i === 0) break;
				(n.push(a), (r += i));
			}
			return z(n, r);
		} finally {
			await this.#e.r(`k_fs_close`, t);
		}
	}
	async writeFile(
		e,
		t,
		{ mode: n = 420, append: r = !1, exclusive: i = !1 } = {},
	) {
		let a = typeof t == `string` ? k.encode(t) : new Uint8Array(t),
			o = 65 | (r ? re : ne) | (i ? M : 0),
			s = await this.open(e, o, n);
		try {
			let t = r ? (await this.stat(e)).size : 0,
				n = [];
			for (let e = 0; e < a.length; e += N) {
				let r = a.subarray(e, e + N);
				n.push({ f: `k_fs_write`, a: [s, BigInt(t + e), { in: r }] });
			}
			(n.push({
				f: `k_fs_touch`,
				a: [s, BigInt(Math.floor(Date.now() / 1e3))],
			}),
				await R(this.#e, n, (t, n) => {
					if (n.f === `k_fs_write` && t < 0) throw D(t, e);
				}));
		} finally {
			await this.#e.r(`k_fs_close`, s);
		}
	}
	async readdir(e) {
		let t = await this.open(e, ie);
		try {
			for (let n = 65536; ; n *= 4) {
				let {
					r,
					out: [i],
				} = await this.#e.call(`k_fs_read_dir`, t, { out: n });
				if (r === j) continue;
				if (r < 0) throw D(r, e);
				let a = new DataView(i.buffer, i.byteOffset, i.length),
					o = [];
				for (let e = 0; e + 16 <= r; ) {
					let t = a.getUint32(e, !0),
						n = A.decode(i.subarray(e + 16, e + 16 + t));
					(n !== `.` &&
						n !== `..` &&
						o.push({ name: n, type: L[a.getUint32(e + 4, !0)] ?? `file` }),
						(e += 16 + t));
				}
				return o;
			}
		} finally {
			await this.#e.r(`k_fs_close`, t);
		}
	}
	async mkdir(e, { recursive: t = !1, mode: n = 493 } = {}) {
		if (!t) {
			let t = await this.#e.r(`k_fs_mkdir`, { in: e }, n);
			if (t < 0) throw D(t, e);
			return;
		}
		let r = [],
			i = ``;
		for (let t of e.split(`/`).filter(Boolean))
			((i += `/${t}`), r.push({ f: `k_fs_mkdir`, a: [{ in: i }, n] }));
		(await this.#e.calls(r)).forEach(({ r: e }, t) => {
			if (e < 0 && e !== -17) throw D(e, r[t].a[0].in);
		});
	}
	async rm(e, { recursive: t = !1, force: n = !1 } = {}) {
		let r;
		try {
			r = await this.stat(e, !1);
		} catch (e) {
			if (n && e.errno === 2) return;
			throw e;
		}
		if (r.type === `directory`) {
			if (t)
				for (let { name: r } of await this.readdir(e))
					await this.rm(`${e.replace(/\/+$/, ``)}/${r}`, {
						recursive: t,
						force: n,
					});
			let r = await this.#e.r(`k_fs_rmdir`, { in: e });
			if (r < 0) throw D(r, e);
			return;
		}
		let i = await this.#e.r(`k_fs_unlink`, { in: e });
		if (i < 0 && !(n && i === -2)) throw D(i, e);
	}
	async rename(e, t) {
		let n = await this.#e.r(`k_fs_rename`, { in: e }, { in: t }, 0);
		if (n < 0) throw D(n, `${e} -> ${t}`);
	}
	async symlink(e, t) {
		let n = await this.#e.r(`k_fs_symlink`, { in: e }, { in: t });
		if (n < 0) throw D(n, t);
	}
	async readlink(e) {
		let {
			r: t,
			out: [n],
		} = await this.#e.call(`k_fs_read_link`, { in: e }, { out: 4096 });
		if (t < 0) throw D(t, e);
		return A.decode(n);
	}
	async chmod(e, t) {
		let n = await this.#e.r(`k_fs_chmod`, { in: await this.real(e) }, t);
		if (n < 0) throw D(n, e);
	}
	async lay({
		tar: e,
		at: t = `/`,
		files: n = {},
		modes: r = {},
		lazy: i = [],
	}) {
		let a = this.#e,
			o = 0;
		if (e) {
			let n = await a.r(`k_fs_tar_open`, { in: t }),
				r = [];
			for (let t = 0; t < e.length; t += P)
				r.push({ f: `k_fs_tar_feed`, a: [n, { in: e.subarray(t, t + P) }] });
			(await R(a, r), (o += await a.r(`k_fs_tar_close`, n)));
		}
		let s = [];
		for (let [e, t] of Object.entries(n)) {
			let n = typeof t == `string` ? k.encode(t) : t;
			s.push({ f: `k_fs_add`, a: [{ in: e }, { in: n.subarray(0, P) }] });
			for (let t = P; t < n.length; t += P)
				s.push({
					f: `k_fs_add_part`,
					a: [{ in: e }, BigInt(t), { in: n.subarray(t, t + P) }],
				});
			(r[e] !== void 0 && s.push({ f: `k_fs_chmod`, a: [{ in: e }, r[e]] }),
				o++);
		}
		for (let [e, t, n, r] of i)
			(s.push(
				{ f: `k_fs_unlink`, a: [{ in: e }] },
				{ f: `k_fs_add_lazy`, a: [{ in: e }, { in: n }, BigInt(t)] },
			),
				r !== void 0 && s.push({ f: `k_fs_chmod`, a: [{ in: e }, r] }),
				o++);
		return (
			await R(a, s, (e, t) => {
				if ((t.f === `k_fs_add` || t.f === `k_fs_add_lazy`) && e < 0)
					throw D(e, t.a[0].in);
			}),
			o
		);
	}
	async layImage({
		files: e = {},
		modes: t = {},
		dirs: n = [],
		lazy: r = [],
		hard: i = {},
		symlinks: a = {},
		mtimes: o,
		xattrs: s,
	}) {
		let c = this.#e,
			l = [];
		for (let e of n) l.push({ f: `k_fs_add_dir`, a: [{ in: e }, 493] });
		let u = 0;
		for (let [n, r] of Object.entries(e)) {
			let e = typeof r == `string` ? k.encode(r) : r;
			l.push({ f: `k_fs_add`, a: [{ in: n }, { in: e.subarray(0, P) }] });
			for (let t = P; t < e.length; t += P)
				l.push({
					f: `k_fs_add_part`,
					a: [{ in: n }, BigInt(t), { in: e.subarray(t, t + P) }],
				});
			(t[n] !== void 0 && l.push({ f: `k_fs_chmod`, a: [{ in: n }, t[n]] }),
				u++);
		}
		for (let e of n)
			t[e] !== void 0 && l.push({ f: `k_fs_chmod`, a: [{ in: e }, t[e]] });
		for (let [n, i, a, o] of r)
			(e[n] !== void 0 && !(o && e[n].length === o)) ||
				(l.push({ f: `k_fs_add_lazy`, a: [{ in: n }, { in: a }, BigInt(i)] }),
				t[n] !== void 0 && l.push({ f: `k_fs_chmod`, a: [{ in: n }, t[n]] }),
				u++);
		await R(c, l.splice(0), (e, t) => {
			if ((t.f === `k_fs_add` || t.f === `k_fs_add_lazy`) && e < 0)
				throw D(e, t.a[0].in);
		});
		let d = [];
		await R(
			c,
			Object.entries(i).map(([e, t]) => ({
				f: `k_fs_link`,
				a: [{ in: t }, { in: e }],
				p: e,
				target: t,
			})),
			(t, n) => {
				t < 0 && e[n.target] !== void 0 && d.push(n);
			},
		);
		for (let { p: t, target: n } of d) {
			let r = e[n];
			l.push({ f: `k_fs_add`, a: [{ in: t }, { in: r.subarray(0, P) }] });
			for (let e = P; e < r.length; e += P)
				l.push({
					f: `k_fs_add_part`,
					a: [{ in: t }, BigInt(e), { in: r.subarray(e, e + P) }],
				});
		}
		for (let [e, n] of Object.entries(i))
			t[n] !== void 0 && l.push({ f: `k_fs_chmod`, a: [{ in: e }, t[n]] });
		for (let [e, t] of Object.entries(a))
			l.push({ f: `k_fs_symlink`, a: [{ in: t }, { in: e }] });
		for (let [e, t] of Object.entries(o ?? {}))
			l.push({ f: `k_fs_set_mtime`, a: [{ in: e }, BigInt(Math.trunc(t))] });
		for (let [e, t] of Object.entries(s ?? {}))
			for (let [n, r] of Object.entries(t)) {
				let t = r instanceof Uint8Array ? r : k.encode(String(r));
				l.push({
					f: `k_fs_xattr`,
					a: [-1, { in: e }, I, { in: n }, { in: t }, 0],
				});
			}
		return (
			await R(c, l, (e, t) => {
				if (t.f === `k_fs_add` && e < 0) throw D(e, t.a[0].in);
			}),
			u
		);
	}
	async restore(e) {
		for (let t of e)
			t.kind === `gone` &&
				(await this.rm(t.path, { recursive: !0, force: !0 }));
		let t = [];
		for (let n of e
			.filter((e) => e.kind !== `gone`)
			.sort((e, t) => e.path.length - t.path.length)) {
			let e = { in: n.path };
			n.kind === `file`
				? (t.push(
						{
							f: `k_fs_add`,
							a: [
								e,
								{
									in:
										n.data instanceof Uint8Array
											? n.data
											: new Uint8Array(n.data ?? []),
								},
							],
						},
						{ f: `k_fs_chmod`, a: [e, n.mode ?? 420] },
					),
					n.mtime &&
						t.push({
							f: `k_fs_set_mtime`,
							a: [e, BigInt(Math.trunc(n.mtime))],
						}))
				: n.kind === `dir`
					? t.push(
							{ f: `k_fs_add_dir`, a: [e, n.mode ?? 493] },
							{ f: `k_fs_chmod`, a: [e, n.mode ?? 493] },
						)
					: n.kind === `symlink`
						? t.push(
								{ f: `k_fs_unlink`, a: [e] },
								{ f: `k_fs_symlink`, a: [{ in: n.target }, e] },
							)
						: n.kind === `mode` && t.push({ f: `k_fs_chmod`, a: [e, n.mode] });
		}
		await R(this.#e, t);
	}
	async readRaw(e, t) {
		let n = await this.#e.r(`k_fs_open`, { in: e }, 0n, 0);
		if (n < 0) return null;
		try {
			let e = [];
			for (let r = 0; r < t; r += N)
				e.push({
					f: `k_fs_read`,
					a: [n, BigInt(r), { out: Math.min(N, t - r) }],
					stop: !0,
				});
			let r = [],
				i = 0;
			for (let t = 0; t < e.length; t += 8)
				for (let {
					r: n,
					out: [a],
				} of await this.#e.calls(e.slice(t, t + 8))) {
					if (n <= 0) return z(r, i);
					(r.push(a), (i += n));
				}
			return z(r, i);
		} finally {
			await this.#e.r(`k_fs_close`, n);
		}
	}
	async mount(e, t) {
		let n = await this.#e.r(`k_pagefs_mount`, { in: e }, t);
		if (n < 0) throw D(n, `mounting ${e}`);
	}
	async unmount(e) {
		let t = await this.#e.r(`k_pagefs_unmount`, { in: e });
		if (t < 0) throw D(t, `unmounting ${e}`);
	}
};
function z(e, t) {
	if (e.length === 1 && e[0].length === t) return e[0];
	let n = new Uint8Array(t),
		r = 0;
	for (let i of e)
		(n.set(i.subarray(0, Math.min(i.length, t - r)), r), (r += i.length));
	return n;
}
function B(e) {
	let t = new DataView(e.buffer, e.byteOffset, F),
		n = t.getUint32(4, !0);
	return {
		type: L[t.getUint32(0, !0)] ?? `file`,
		mode: n & 4095,
		size: Number(t.getBigUint64(8, !0)),
		ino: Number(t.getBigUint64(16, !0)),
		mtime:
			Number(t.getBigInt64(24, !0)) * 1e3 +
			Math.floor(t.getUint32(36, !0) / 1e6),
		nlink: t.getUint32(32, !0),
	};
}
var V = new TextEncoder(),
	H = new TextDecoder(),
	U = -11,
	W = 1,
	G = 0,
	K = 1 << 18,
	q = {
		MODIFY: 2,
		ATTRIB: 4,
		CLOSE_WRITE: 8,
		MOVED_FROM: 64,
		MOVED_TO: 128,
		CREATE: 256,
		DELETE: 512,
		DELETE_SELF: 1024,
		MOVE_SELF: 2048,
		IGNORED: 32768,
	},
	ce =
		q.ATTRIB |
		q.CLOSE_WRITE |
		q.MOVED_FROM |
		q.MOVED_TO |
		q.CREATE |
		q.DELETE |
		q.DELETE_SELF |
		q.MOVE_SELF,
	le = (e, t) => (BigInt(t & 65535) << 48n) | (BigInt(e & 65535) << 32n),
	ue = class {
		#e;
		#t;
		#n;
		#r = new Map();
		#i = new Map();
		#a = new Map();
		#o = 1;
		constructor(e, t, n) {
			((this.#e = e), (this.#t = t), (this.#n = n));
		}
		async start({ init: e }) {
			let t = [];
			(e ||
				t.push(
					{ f: `k_init_virtual`, a: [1] },
					{
						f: `k_proc_set_info`,
						a: [
							W,
							{
								in: `init
init\0`,
							},
						],
					},
				),
				t.push({ f: `k_proc_queue`, a: [W] }));
			let n = await this.#e.calls(t),
				r = n[n.length - 1].r;
			(await this.#e.watch(r),
				this.#s(
					e ? { f: `k_wait`, a: [0, W, 0] } : { f: `k_wait`, a: [W, -1, 0] },
				));
		}
		async #s(e) {
			let t = this.#e;
			for (;;) {
				let n = t.seq(),
					r;
				try {
					r = await t.calls([e, e, e, e]);
				} catch {
					return;
				}
				let i = r.filter(({ r: e }) => e);
				for (let { r: e } of i)
					await this.#c(Number(e >> 32n), Number(e & 4294967295n));
				i.length || (await t.changed(n));
			}
		}
		async #c(e, t) {
			let n = this.#i.get(e);
			this.#i.delete(e);
			let r = n === void 0 ? null : await this.#r.get(n);
			if (r?.reading) {
				let e = new Promise((e) => {
					r.flushed = e;
				});
				(this.#e.kick(), await e);
			}
			let i = t & 127;
			this.#n.exit({ pid: e, code: i ? 128 + i : (t >> 8) & 255, signal: i });
		}
		spawn(e) {
			let t = this.#l(e);
			return (
				this.#r.set(
					e.h,
					t.then(
						(e) => e.ends ?? null,
						() => null,
					),
				),
				t.then(({ ends: e, ...t }) => t)
			);
		}
		async #l({
			h: e,
			argv: t,
			env: n = [],
			cwd: r = ``,
			stdio: i = `pipe`,
			cols: a = 80,
			rows: o = 24,
			init: s = !1,
		}) {
			let c = this.#e,
				l = V.encode(
					[i, a, o, +!!s, r, t.length, ...t, n.length, ...n]
						.map((e) => `${e}\0`)
						.join(``),
				),
				{
					r: u,
					out: [d],
				} = await c.call(`k_page_spawn`, { in: l }, { out: l.length + 16384 });
			if (u < 0) return { error: -u };
			let f = new DataView(d.buffer, d.byteOffset, d.length),
				p = (e) => f.getInt32(e * 4, !0),
				m = {
					h: e,
					pid: p(0),
					pty: p(1),
					stdin: p(2),
					stdout: p(3),
					stderr: p(4),
					sock: -1,
				};
			m.queues = m.pty >= 0 ? [p(5)] : m.stdin >= 0 ? [p(5), p(6), p(7)] : [];
			for (let e of m.queues) await c.watch(e);
			(this.#i.set(m.pid, e), m.pty >= 0 && this.#u(m));
			let h = p(8)
					? [Number(f.getBigUint64(48, !0)), Number(f.getBigUint64(56, !0))]
					: null,
				g = d.slice(64, 64 + p(9)),
				_ = d.slice(64 + p(9), 64 + p(9) + p(10));
			return {
				pid: m.pid,
				exec: g,
				fds: _,
				cwd: r || `/`,
				wasmImage: h,
				ends: m,
			};
		}
		async abandon(e) {
			await this.#e.calls([
				{ f: `k_pipe_forget`, a: [e] },
				{ f: `k_pty_forget`, a: [e] },
				{ f: `k_exit`, a: [e, 127] },
			]);
		}
		async connectGuest(e, t) {
			let n = (async () => {
				let n = await this.#e.r(`k_sock_connect`, { in: `\0gex-tcp:${t}` });
				if (n < 0) throw D(n === -2 ? -111 : n, `127.0.0.1:${t}`);
				let r = await this.#e.r(`k_sock_queue`, n);
				return (
					await this.#e.watch(r),
					{
						h: e,
						pid: 0,
						pty: -1,
						stdin: -1,
						stdout: -1,
						stderr: -1,
						sock: n,
						queues: [r],
					}
				);
			})();
			(this.#r.set(
				e,
				n.catch(() => null),
			),
				await n);
		}
		async read(e, t = 1, n = null) {
			let r = await this.#r.get(e),
				i = r ? (r.sock >= 0 ? r.sock : t === 2 ? r.stderr : r.stdout) : -1;
			if (i < 0) return null;
			let a = r.sock >= 0 ? `k_sock_read` : `k_pipe_read`;
			for (let e = this.#e; ; ) {
				let o = e.seq(),
					{ r: s, out: c } = await e
						.call(a, i, { out: K })
						.catch(() => ({ r: -9 }));
				if (s > 0) return c[0];
				if (s === U) {
					if (n?.()) return;
					await e.changed(o);
					continue;
				}
				return (
					r.sock < 0 && (await this.#d(r, t === 2 ? `stderr` : `stdout`)),
					null
				);
			}
		}
		kick() {
			this.#e.kick();
		}
		async unread(e, t) {
			let n = await this.#r.get(e);
			n?.sock < 0 && (await this.#d(n, t === 2 ? `stderr` : `stdout`));
		}
		async write(e, t) {
			let n = await this.#r.get(e);
			if (!n) return;
			let r = this.#e;
			if (n.pty >= 0) {
				await r.r(`k_pty_write`, n.pty, 1, { in: t }).catch(() => {});
				return;
			}
			let i = n.sock >= 0 ? n.sock : n.stdin,
				a = n.sock >= 0 ? `k_sock_write` : `k_pipe_write`;
			for (let e = t; e.length && i >= 0; ) {
				let t = r.seq(),
					n = await r.r(a, i, { in: e.subarray(0, K) }).catch(() => -9);
				if (n === U || n === 0) await r.changed(t);
				else if (n < 0) return;
				else e = e.subarray(n);
			}
		}
		async closeStdin(e) {
			let t = await this.#r.get(e);
			t?.sock >= 0
				? await this.#e.r(`k_sock_shutdown`, t.sock, 1).catch(() => {})
				: t && (await this.#d(t, `stdin`));
		}
		async #u(e) {
			let t = this.#e;
			for (e.reading = !0; ; ) {
				let n = t.seq(),
					r = e.flushed,
					{ r: i, out: a } = await t
						.call(`k_pty_read`, e.pty, 1, { out: K })
						.catch(() => ({ r: -9 }));
				if (i > 0) {
					this.#n.data(e.h, a[0]);
					continue;
				}
				if ((r && ((e.flushed = null), r()), i === U)) {
					await t.changed(n);
					continue;
				}
				((e.reading = !1),
					e.flushed?.(),
					await t.unwatch(e.queues[0]),
					this.#n.end(e.h));
				return;
			}
		}
		async resize(e, t, n) {
			let r = await this.#r.get(e);
			r?.pty >= 0 && (await this.#e.r(`k_pty_set_winsize`, r.pty, le(t, n)));
		}
		async kill(e, t) {
			let n = await this.#e.r(`k_kill`, W, e, t);
			if (n < 0 && n !== -3) throw D(n, `kill ${e}`);
		}
		async release(e) {
			let t = await this.#r.get(e);
			if ((this.#r.delete(e), t)) {
				(t.sock >= 0 &&
					(await this.#e.unwatch(t.queues[0]),
					await this.#e.r(`k_sock_close`, t.sock),
					(t.sock = -1)),
					t.pty >= 0 &&
						(t.reading && (await this.#e.unwatch(t.queues[0])),
						await this.#e.r(`k_pty_close_end`, t.pty, 1, G),
						(t.pty = -1)));
				for (let e of [`stdin`, `stdout`, `stderr`]) await this.#d(t, e);
			}
		}
		async #d(e, t) {
			let n = e[t];
			if (n < 0) return;
			e[t] = -1;
			let r = [`stdin`, `stdout`, `stderr`].indexOf(t);
			(await this.#e.unwatch(e.queues[r]),
				await this.#e
					.r(`k_pipe_close_end`, n, +(t === `stdin`), G)
					.catch(() => {}));
		}
		async addWatch(e) {
			let t = this.#e,
				n = await t.r(`k_inotify_create`);
			if (n < 0) throw D(n, `inotify`);
			let [{ r }, { r: i }] = await t.calls([
				{ f: `k_inotify_add_watch`, a: [n, { in: await this.#t.real(e) }, ce] },
				{ f: `k_inotify_queue`, a: [n] },
			]);
			if (r < 0) throw (await t.r(`k_inotify_close`, n), D(r, e));
			await t.watch(i);
			let a = this.#o++,
				o = { id: n, queue: i, open: !0 };
			return (
				this.#a.set(a, o),
				(async () => {
					for (; o.open; ) {
						let e = t.seq(),
							{ r, out: i } = await t
								.call(`k_inotify_read`, n, { out: 65536 })
								.catch(() => ({ r: -9 }));
						if (r > 0) this.#f(a, i[0]) && (await this.rmWatch(a));
						else if (r === U || r === 0) await t.changed(e);
						else return;
					}
				})(),
				a
			);
		}
		async rmWatch(e) {
			let t = this.#a.get(e);
			t &&
				(this.#a.delete(e),
				(t.open = !1),
				await this.#e.unwatch(t.queue),
				await this.#e.r(`k_inotify_close`, t.id).catch(() => {}));
		}
		#f(e, t) {
			let n = new DataView(t.buffer, t.byteOffset, t.length),
				r = !1;
			for (let i = 0; i + 16 <= t.length; ) {
				let a = n.getUint32(i + 4, !0),
					o = n.getUint32(i + 8, !0),
					s = n.getUint32(i + 12, !0),
					c = t.subarray(i + 16, i + 16 + s),
					l = c.indexOf(0),
					u = H.decode(l < 0 ? c : c.subarray(0, l));
				i += 16 + s;
				let d =
					a & q.CREATE
						? `create`
						: a & q.CLOSE_WRITE
							? `change`
							: a & q.ATTRIB
								? `attrib`
								: a & q.DELETE
									? `delete`
									: a & q.MOVED_FROM
										? `move-out`
										: a & q.MOVED_TO
											? `move-in`
											: a & (q.DELETE_SELF | q.MOVE_SELF | q.IGNORED)
												? `gone`
												: null;
				!d ||
					r ||
					(this.#n.watch({ h: e, type: d, name: u, cookie: o }),
					(r = d === `gone`));
			}
			return r;
		}
		async holdX() {
			let e = this.#e,
				t = [`\0/tmp/.X11-unix/X0`, `/tmp/.X11-unix/X0`].map((e) => ({
					f: `k_sock_bind`,
					a: [{ in: e }],
				})),
				n = (await e.calls(t)).map(({ r: e }, n) => {
					if (e < 0)
						throw D(e, `X display :0 (${JSON.stringify(t[n].a[0].in)})`);
					return e;
				}),
				r = (await e.calls(n.map((e) => ({ f: `k_sock_queue`, a: [e] })))).map(
					(e) => e.r,
				);
			for (let t of r) await e.watch(t);
			return (
				(async () => {
					for (;;) {
						let t = e.seq(),
							r = await e
								.calls(n.map((e) => ({ f: `k_sock_pending`, a: [e] })))
								.catch(() => null);
						if (!r) return;
						if (r.some(({ r: e }) => e > 0)) break;
						await e.changed(t);
					}
					for (let t of r) await e.unwatch(t);
					this.#n.xWanted();
				})(),
				n
			);
		}
	},
	J = new TextDecoder(),
	de = -34,
	Y = 40,
	fe = [`file`, `dir`, `symlink`, `socket`],
	pe = (e, t) => e === t || e.startsWith(t === `/` ? `/` : `${t}/`),
	me = (e) => e.replace(/\/[^/]*$/, ``) || `/`;
function he(e) {
	let t = 2166136261,
		n = new Uint32Array(
			e.buffer,
			e.byteOffset,
			e.byteOffset % 4 ? 0 : e.length >>> 2,
		);
	for (let e = 0; e < n.length; e++) t = Math.imul(t ^ n[e], 16777619);
	for (let r = n.length * 4; r < e.length; r++)
		t = Math.imul(t ^ e[r], 16777619);
	return (t >>> 0).toString(16);
}
var ge = class {
		#e;
		#t;
		#n = null;
		#r = new Map();
		#i = new Map();
		#a = [];
		#o = 0;
		constructor(e, t) {
			((this.#e = e), (this.#t = t));
		}
		async #s() {
			for (let e = 1 << 20; ; ) {
				let {
					r: t,
					out: [n],
				} = await this.#e.call(`k_fs_tree`, { out: e });
				if (t === de) {
					e = new DataView(n.buffer, n.byteOffset).getUint32(0, !0) + 65536;
					continue;
				}
				if (t < 0) throw D(t, `the tree`);
				let r = new DataView(n.buffer, n.byteOffset, n.length),
					i = new Map();
				for (let e = 0; e + Y <= t; ) {
					let t = r.getUint32(e + 32, !0),
						a = r.getUint32(e + 36, !0),
						o = `/${J.decode(n.subarray(e + Y, e + Y + t))}`;
					(i.set(o, {
						kind: fe[n[e]] ?? `file`,
						written: n[e + 1] === 1,
						mode: r.getUint32(e + 4, !0) & 4095,
						size: Number(r.getBigUint64(e + 8, !0)),
						changes: r.getBigUint64(e + 16, !0),
						mtime: Number(r.getBigInt64(e + 24, !0)),
						target: a ? J.decode(n.subarray(e + Y + t, e + Y + t + a)) : ``,
					}),
						(e += Y + t + a));
				}
				return i;
			}
		}
		async start({ known: e = [], exclude: t = [] }) {
			((this.#n = await this.#s()), (this.#r = new Map(e)), (this.#a = t));
			let [, { r: n }] = await this.#e.calls([
				{ f: `k_fs_watch`, a: [{ in: `/` }] },
				{ f: `k_fs_saves` },
			]);
			this.#o = n;
		}
		async changed() {
			let e = await this.#e.r(`k_fs_saves`),
				t = e !== this.#o;
			return ((this.#o = e), t);
		}
		async diff(e) {
			if (!this.#n) throw Error(`persistence is not started`);
			e && (this.#a = e);
			let t = (e) => e === `/` || this.#a.some((t) => pe(e, t)),
				n = await this.#s(),
				r = this.#n,
				i = this.#r,
				a = [],
				o = new Set(),
				s = (e, t) => i.get(e) === t && o.add(e);
			for (let [e, c] of n) {
				if (t(e) || c.kind === `socket`) continue;
				let n = r.get(e);
				if (c.kind === `file`) {
					let t = i.get(e),
						r =
							t?.startsWith(`f:`) && !t.startsWith(`f:${c.mode.toString(8)}:`);
					if (c.written || r) {
						if (!r && i.has(e) && this.#i.get(e) === c.changes) {
							o.add(e);
							continue;
						}
						let t = await this.#t.readRaw(e, c.size);
						if (!t) continue;
						let n = `f:${c.mode.toString(8)}:${t.length}:${he(t)}`;
						if ((this.#i.set(e, c.changes), s(e, n))) continue;
						a.push({
							path: e,
							kind: `file`,
							stamp: n,
							mode: c.mode,
							mtime: c.mtime,
							data: t,
						});
					} else if (t?.startsWith(`f:`)) o.add(e);
					else {
						let t = `m:${c.mode.toString(8)}`;
						if (s(e, t)) continue;
						n?.kind === `file` &&
							n.mode !== c.mode &&
							a.push({ path: e, kind: `mode`, stamp: t, mode: c.mode });
					}
				} else if (c.kind === `dir`) {
					let t = `d:${c.mode.toString(8)}`;
					if (s(e, t) || (n?.kind === `dir` && n.mode === c.mode)) continue;
					a.push({
						path: e,
						kind: `dir`,
						stamp: t,
						mode: c.mode,
						mtime: c.mtime,
					});
				} else if (c.kind === `symlink`) {
					let t = `l:${c.target}`;
					if (s(e, t) || (n?.kind === `symlink` && n.target === c.target))
						continue;
					a.push({ path: e, kind: `symlink`, stamp: t, target: c.target });
				}
			}
			for (let e of r.keys()) {
				if (n.has(e) || t(e)) continue;
				let i = me(e);
				(i !== `/` && !n.has(i) && r.has(i)) ||
					s(e, `gone`) ||
					a.push({ path: e, kind: `gone`, stamp: `gone` });
			}
			for (let [e, t] of i) t === `gone` && !n.has(e) && o.add(e);
			let c = new Set(a.map((e) => e.path));
			return {
				put: a,
				drop: [...i.keys()].filter((e) => !o.has(e) && !c.has(e)),
			};
		}
		stored({ put: e = [], drop: t = [] }) {
			for (let e of t) (this.#r.delete(e), this.#i.delete(e));
			for (let [t, n] of e) this.#r.set(t, n);
		}
	},
	X = {
		"gex/cgen/providers/glibc_math_a64-2714c436e8c59f8b.wasm": new URL(
			"./glibc_math_a64-2714c436e8c59f8b-MnXqYZmc.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/cgen/providers/glibc_mem_a64-7d5169185db285ff.wasm": new URL(
			"./glibc_mem_a64-7d5169185db285ff-DRCwhgHm.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/gex-wgpu-replay.deferred.wasm": new URL(
			"./gex-wgpu-replay.deferred-C7j-NL4N.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/gex-wgpu-replay.js": new URL(
			"./gex-wgpu-replay-D6MKPkOc.js?no-inline",
			import.meta.url,
		).href,
		"gex/gex-wgpu-replay.wasm": new URL(
			"./gex-wgpu-replay-HjYIHsVb.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/gex_browser.shared.wasm": new URL(
			"./gex_browser.shared-BPbadGAv.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/gex_browser.x86.shared.wasm": new URL(
			"./gex_browser.x86.shared-D65X29hu.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/gex_kernel.wasm": new URL(
			"./gex_kernel-CI6RbXUT.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/gex_kernel.x86.wasm": new URL(
			"./gex_kernel.x86-Bt4Cjbme.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/seed.shared.wasm": new URL(
			"./seed.shared-S7K6XoKN.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/seed.x86.shared.wasm": new URL(
			"./seed.shared-S7K6XoKN.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/xwayland/Xwayland.mjs": new URL(
			"./Xwayland-DwF5TURD.mjs?no-inline",
			import.meta.url,
		).href,
		"gex/xwayland/Xwayland.wasm": new URL(
			"./Xwayland-mDPmwsBQ.wasm?no-inline",
			import.meta.url,
		).href,
		"gex/xwayland/gex.xkm": new URL(
			"./gex-NRf3g43h.xkm?no-inline",
			import.meta.url,
		).href,
		"gex/xwayland/gexhostwl.wasm": new URL(
			"./gexhostwl-CI5STBXm.wasm?no-inline",
			import.meta.url,
		).href,
	},
	_e = () => new URL(`/`, globalThis.location?.href).href,
	Z = !1,
	ve = { 62: `x86`, 183: `aarch64` };
function Q(e, t = 0) {
	return e &&
		e.length >= t + 20 &&
		e[t] === 127 &&
		e[t + 1] === 69 &&
		e[t + 2] === 76 &&
		e[t + 3] === 70 &&
		e[t + 4] === 2
		? (ve[e[t + 18] | (e[t + 19] << 8)] ?? null)
		: null;
}
function ye(e, t) {
	let n = null;
	return (
		e(
			t,
			({ type: e, body: r }) => (
				(e === `0` || e === `\0` || e === `7`) && (n = Q(t, r)),
				!!n
			),
		),
		n
	);
}
function be(e = {}) {
	for (let t of Object.values(e)) if (Q(t)) return Q(t);
	return null;
}
async function xe(e) {
	let { tarEntries: t } = await o(
		async () => {
			let { tarEntries: e } = await import(`./tar-6xBlZbiQ.mjs`);
			return { tarEntries: e };
		},
		[],
		import.meta.url,
	);
	for (let n of [...e].reverse()) {
		if (n.at && n.at !== `/`) continue;
		let e = n.tar ? ye(t, n.tar) : be(n.files);
		if (e) return e;
	}
	return null;
}
function $(e, t, n = {}) {
	if (!Array.isArray(t) || !t.length || t.some((e) => typeof e != `string`))
		throw TypeError(`${e}: argv is a non-empty array of strings`);
	if (typeof n != `object` || !n) throw TypeError(`${e}: options is an object`);
	for (let t of Object.keys(n))
		if (![`pty`, `env`, `cwd`, `uid`, `gid`, `detached`].includes(t))
			throw TypeError(`${e}: no option ${t}`);
	return [t, n];
}
var Se = class extends EventTarget {
	#e;
	#t = { phase: `new`, error: null, progress: null, console: `` };
	#n = new Map();
	#r = [];
	#i = [];
	#a = null;
	#o = null;
	#s = null;
	#c = null;
	#l = null;
	#u = [];
	#d = new Map();
	#f = new Map();
	#p = new Map();
	#m = 1;
	#h = null;
	#g = null;
	#_ = new h();
	#v = new Map();
	#y = null;
	#b = null;
	#x = null;
	#S = { host: {}, exec: {}, onMessage: [], loud: !1 };
	constructor({ baseUrl: e, units: t, xcache: n = !1, debug: r = {} } = {}) {
		super();
		for (let e of Object.keys(arguments[0] ?? {}))
			if (![`baseUrl`, `units`, `xcache`, `debug`].includes(e))
				throw TypeError(`System: no option ${e}`);
		if (Z)
			throw Error(`System: a page runs one system; this page already made one`);
		Z = !0;
		let i =
			typeof t == `object` && t && !(t instanceof URL)
				? t
				: t
					? { url: t }
					: null;
		((this.#e = {
			baseUrl: String(e ?? _e()),
			files: e == null ? X : null,
			units: i && {
				url: new URL(
					/* @vite-ignore */ /* webpackIgnore: true */ String(i.url).replace(
						/\/*$/,
						``,
					),
					globalThis.location?.href,
				).href,
				require: !!i.require,
			},
			xcache: !!n,
			debug: { ...r },
		}),
			(this.#y = new ee((e, t) => this.#A(e, t))));
		let o = this;
		this[a] = {
			system: this,
			attach: (e, t, { once: n = !0, beforeBoot: r = !1 } = {}) => {
				if (r && this.#t.phase !== `new`)
					throw Error(`${e} must be made before the system boots`);
				if (n && this.#n.has(e))
					throw Error(`this system already has its ${e}`);
				n
					? this.#n.set(e, t)
					: (this.#n.get(e) ?? this.#n.set(e, []).get(e)).push(t);
			},
			part: (e) => this.#n.get(e) ?? null,
			beforeBoot: (e) => this.#r.push(e),
			devices: (e, t = 0) => this.#u.push({ fn: e, stage: t }),
			afterBoot: (e) => {
				if (this.#t.phase === `running`) return e(this.#l);
				this.#i.push(e);
			},
			on: (e, t) => (this.#k.get(e) ?? this.#k.set(e, []).get(e)).push(t),
			kernel: () => this.#a,
			files: () => this.#o,
			programs: () => this.#s,
			changes: () => this.#c,
			network: (e) => this.#_.set(e),
			sys: () => this.#l,
			get phase() {
				return o.#t.phase;
			},
			opts: this.#e,
			say: (e) => this.#C(e),
			pageFs: () => this.#y,
			preset: this.#S,
		};
	}
	get state() {
		return { ...this.#t };
	}
	#C(e) {
		((this.#t.console += e),
			this.#t.console.length > 65536 &&
				(this.#t.console = this.#t.console.slice(-49152)),
			this.dispatchEvent(Object.assign(new Event(`console`), { text: e })),
			this.#e.debug.console && console.log(`[gex] ${e.replace(/\n$/, ``)}`));
	}
	boot(...e) {
		let t = e.length ? $(`boot`, ...e) : null;
		return this.#h
			? this.#h
			: ((this.#b = t),
				(this.#h = this.#w().catch((e) => {
					throw (
						(this.#t.phase = `failed`),
						(this.#t.error = String(e?.stack ?? e)),
						e
					);
				})),
				this.#h);
	}
	async #w() {
		if (this.#t.phase !== `new`) throw Error(`this system has already booted`);
		if (((this.#t.phase = `booting`), typeof SharedArrayBuffer != `function`))
			throw Error(
				`the gex runtime needs a cross-origin isolated page (Cross-Origin-Opener-Policy: same-origin, Cross-Origin-Embedder-Policy: require-corp)`,
			);
		let { arch: t, ...n } = this.#e.debug,
			r = new URLSearchParams();
		for (let [e, t] of Object.entries(n))
			t !== void 0 &&
				t !== !1 &&
				e !== `console` &&
				r.set(e, t === !0 ? `1` : String(t));
		(this.#S.loud ||
			r.has(`log`) ||
			globalThis.GEX_LOG !== void 0 ||
			{}.GEX_LOG ||
			r.set(`log`, `quiet`),
			this.#e.units &&
				(r.set(`cgen`, this.#e.units.require ? `2` : `1`),
				r.set(`cgenurl`, this.#e.units.url)),
			this.#e.xcache && r.set(`xcache`, `1`),
			(globalThis.GEX_PAGE_SEARCH = `?${r}`),
			(globalThis.GEX_ASSET_BASE = new URL(
				/* @vite-ignore */ /* webpackIgnore: true */ this.#e.baseUrl,
				globalThis.location?.href,
			).href),
			this.#e.files && (globalThis.GEX_ASSET_FILES = this.#e.files),
			await o(
				() => import(`./page-env-BH7IngaK.mjs`).then((e) => e.a),
				[],
				import.meta.url,
			));
		let i = { layers: [], records: [] };
		for (let e of this.#r) await e(i);
		let s = t ?? (await xe(i.layers)) ?? `aarch64`,
			{ setGlobals: c } = await o(
				async () => {
					let { setGlobals: e } = await import(`./page-globals-ieOgkJIk.mjs`);
					return { setGlobals: e };
				},
				[],
				import.meta.url,
			);
		c((e) => r.get(e), { arch: s });
		let l = await o(
			() => import(`./runtime-D-GJDdJD.mjs`).then((e) => e.t),
			[],
			import.meta.url,
		);
		if (globalThis.process?.versions?.node && !globalThis.document) {
			let t = l.runtimeUrls(),
				n = (t) =>
					e(
						new URL(
							/* @vite-ignore */ /* webpackIgnore: true */ t,
							globalThis.GEX_ASSET_BASE,
						).href,
					);
			l.primeRuntime({
				shimBytes: await n(t.shimBytes),
				seedBytes: await n(t.seedBytes),
				kernelBytes: await n(t.kernelBytes),
				fetchOther: n,
			});
		}
		((this.#g = s), (globalThis.__gexTso = await l.detectTso()));
		let u = await l.loadKernel();
		if (!u) throw Error(`the kernel would not load`);
		let d = {
				write: (e) => this.#C(String(e)),
				writeln: (e) => this.#C(`${e}\n`),
			},
			f = {
				rt: l,
				kernel: u,
				term: d,
				say: (e) => this.#C(e),
				wlChannel: null,
				compositor: null,
				dom: !1,
				glChannel: null,
			};
		for (let { fn: e } of this.#u.sort((e, t) => e.stage - t.stage)) await e(f);
		let { compositor: p } = f,
			m = await l.openNet(this.#_),
			h = [],
			g = await l.makeProcessHost(
				{
					uid: 0,
					...this.#S.host,
					kernel: u,
					pageFs: this.#y.control,
					glChannel: f.glChannel,
					wlChannel: f.wlChannel,
					netChannel: m,
					network: this.#_,
				},
				{
					onOutput: (e, t) => this.#C(t),
					onExit: (e, t) => {
						typeof t == `number` && p?.dropMemory?.(t);
					},
					readStdin: () => new Promise(() => {}),
					onMessage: (e) => {
						e.kind === `wl-memory`
							? p?.addMemory(e.token, e.memory, e.kernel)
							: e.kind === `wl-pixels` &&
								p?.addPixels?.(e.token, e.id, e.buffer, e.replaces);
						for (let t of this.#S.onMessage) t(e);
					},
				},
			);
		this.#l = {
			host: g,
			kernel: u,
			term: d,
			rt: l,
			compositor: p,
			wlChannel: f.wlChannel,
			spawnExec: ({ uid: e = 0, gid: t = e, ...n }) =>
				g.spawnExec({
					...n,
					opts: { ...l.execOptions({ uid: e, gid: t }), ...this.#S.exec },
				}),
			onStop: (e) => h.push(e),
			stop: () => {
				for (let e of h.splice(0))
					try {
						e();
					} catch {}
				g.stop();
			},
		};
		let _ = this.#n.get(`filesystem`)?.[a],
			{ layers: v, records: y } = i;
		i.layers = i.records = null;
		try {
			await this.#T(this.#l, v, y, _);
		} catch (e) {
			throw (this.#l.stop(), e);
		}
		if (((this.#t.phase = `running`), this.#b)) {
			let [e, t] = this.#b,
				n = (this.#x = this.#N(e, { env: [`HOME=/`, `TERM=linux`], ...t }, !0));
			n.exited.then(
				async (e) => {
					this.#t.phase === `running` &&
						((this.#t.init = e),
						await Promise.race([
							n[a].drained(),
							new Promise((e) => setTimeout(e, 1e3)),
						]),
						this.shutdown());
				},
				(e) => {
					this.#t.phase === `running` &&
						((this.#t.init = { error: String(e?.message ?? e) }),
						this.shutdown());
				},
			);
		}
		for (let e of this.#i.splice(0)) await e(this.#l);
		return (this.dispatchEvent(new Event(`running`)), this);
	}
	async #T(e, t, n, r) {
		let i = await te.start({
			module: e.kernel.module,
			memory: e.kernel.memory,
			pageFs: this.#y.control,
		});
		((this.#a = i),
			(this.#o = new se(i)),
			(this.#c = new ge(i, this.#o)),
			(this.#s = new ue(i, this.#o, {
				data: (e, t) => this.#d.get(e)?.[a].data(t),
				end: (e) => this.#d.get(e)?.[a].data(null),
				exit: (e) => this.#D(e),
				watch: (e) => this.#O(`watch`, e),
				xWanted: () => this.#O(`x-wanted`, {}),
			})));
		for (let e of t) await (e.image ? this.#o.layImage(e) : this.#o.lay(e));
		(n.length && (await this.#o.restore(n)),
			await i.r(`k_fs_populate_done`),
			this.#e.xcache && (await this.#E(e, i)));
		for (let [e, t] of r?.mounts?.() ?? []) await this.#o.mount(e, t);
		await i.r(`k_host_calls_serve`);
		let o = r?.persistArgs?.();
		(o && (await this.#c.start(o)), await this.#s.start({ init: !!this.#b }));
		let s = (e, ...t) => (i.has(e) ? [{ f: e, a: t }] : []),
			c = [
				{ f: `k_stack_area` },
				{ f: `k_stack_size` },
				{ f: `k_stack_count` },
				...s(`k_snap_word`),
				...s(`k_ws_addr`, 0),
				...s(`k_ws_count`),
				...s(`k_mono_held_at`),
				...s(`k_snap_extents_at`),
			],
			l = Object.fromEntries(
				(await i.calls(c)).map((e, t) => [c[t].f, e.r >>> 0]),
			);
		e.host.useKernelStacks({
			area: l.k_stack_area,
			size: l.k_stack_size,
			count: l.k_stack_count,
			...(i.has(`k_snap_word`)
				? {
						snapWord: l.k_snap_word,
						wsAddr: l.k_ws_addr,
						wsCount: l.k_ws_count,
					}
				: {}),
			...(i.has(`k_mono_held_at`) ? { monoHeld: l.k_mono_held_at } : {}),
			...(i.has(`k_snap_extents_at`) ? { extents: l.k_snap_extents_at } : {}),
		});
	}
	async #E(e, t) {
		let n = e.rt.xcacheName();
		if (!n || !t.has(`k_store_restore`)) return;
		await t.r(`k_xcache_enable`);
		let r = await e.rt.xcRead(n);
		if (!r) return void this.#C(`xcache ${n}: nothing saved\n`);
		let i = (await t.r(`k_store_restore_buf`, r.length)) >>> 0;
		new Uint8Array(e.kernel.memory.buffer).set(r, i);
		let a = await t.r(`k_store_restore`);
		this.#C(
			`xcache ${n}: ${(r.length / 1048576).toFixed(1)} MiB, restored ${a} modules\n`,
		);
	}
	#D(e) {
		let t = this.#f.get(e.pid);
		t
			? (this.#f.delete(e.pid), t[a].exit(e))
			: (this.#p.set(e.pid, e),
				this.#p.size > 4096 && this.#p.delete(this.#p.keys().next().value));
	}
	#O(e, t) {
		for (let n of this.#k.get(e) ?? []) n(t);
	}
	#k = new Map();
	async #A(e, t) {
		try {
			let n = this.#v.get(e);
			if (!n) throw Error(`no host call ${e}`);
			let r;
			try {
				r = t.trim() ? JSON.parse(t) : null;
			} catch {
				throw Error(`${e}: not JSON: ${t.slice(0, 200)}`);
			}
			let i = await n(r);
			return { ok: !0, text: i === void 0 ? `null` : JSON.stringify(i) };
		} catch (e) {
			return { ok: !1, text: String(e?.message ?? e) };
		}
	}
	get hostCalls() {
		let e = this.#v;
		return {
			register(t, n) {
				if (typeof t != `string` || !t || /[\0\s]/.test(t))
					throw TypeError(`hostCalls.register: a name without spaces`);
				if (typeof n != `function`)
					throw TypeError(`hostCalls.register: a function`);
				return (
					e.set(t, n),
					() => {
						e.get(t) === n && e.delete(t);
					}
				);
			},
			unregister(t) {
				e.delete(t);
			},
			names: () => [...e.keys()],
		};
	}
	get net() {
		return {
			connectGuest: (e, { host: t = `127.0.0.1` } = {}) => this.#j(e, t),
		};
	}
	async #j(e, t) {
		if (
			(this.#M(`connectGuest`),
			![`127.0.0.1`, `localhost`, `0.0.0.0`].includes(t))
		)
			throw Error(`connectGuest: only the guest's own 127.0.0.1, not ${t}`);
		if (!Number.isInteger(e) || e <= 0 || e > 65535)
			throw TypeError(`connectGuest: no port ${e}`);
		let n = this.#m++,
			r = this.#s,
			i = new g({
				read: () => r.read(n),
				write: (e) => r.write(n, e),
				closeStdin: () => r.closeStdin(n),
				release: () => {
					(r.release(n).catch(() => {}), this.#d.delete(n));
				},
			});
		this.#d.set(n, i);
		try {
			await r.connectGuest(n, e);
		} catch (e) {
			throw (this.#d.delete(n), e);
		}
		return i;
	}
	#M(e) {
		if (this.#t.phase !== `running`)
			throw Error(`${e}: the system is ${this.#t.phase}, not running`);
	}
	spawn(e, t = {}) {
		if ((this.#M(`spawn`), this.#b))
			throw Error(
				`spawn: this system has an init (${this.#b[0][0]}), which owns the processes; the page reaches programs through what it starts`,
			);
		return this.#N(e, t, !1, !1);
	}
	get init() {
		return this.#x;
	}
	#N(e, t, i, o) {
		[e, t] = $(i ? `boot` : `spawn`, e, t);
		let s = this.#m++,
			c = t.pty ? `pty` : t.detached ? `null` : `pipe`,
			l = this.#s,
			u = (e) => e.catch((e) => this.#C(`gex: ${e?.message ?? e}\n`)),
			d = new p({
				argv: e,
				stdio: c,
				encoding: t.pty?.encoding,
				untilExit: o,
				read: (e, t) => l.read(s, e, t),
				unread: (e) => u(l.unread(s, e)),
				kick: () => l.kick(),
				write: (e) => l.write(s, e),
				closeStdin: () => l.closeStdin(s),
				resize: (e, t) => u(l.resize(s, e, t)),
				kill: (e, t) => u(l.kill(e, n(t))),
				release: () => {
					(this.#d.delete(s), u(l.release(s)));
				},
				windows: (e) => this.#n.get(`windows`)?.[a]?.of?.(e) ?? [],
			});
		return (
			this.#d.set(s, d),
			l
				.spawn({
					h: s,
					argv: e,
					env: r(t.env),
					cwd: t.cwd ?? ``,
					stdio: c,
					cols: t.pty?.cols ?? 80,
					rows: t.pty?.rows ?? 24,
					init: i,
				})
				.then(
					(n) => {
						if (n.error) {
							(this.#d.delete(s), d[a].failed(n.error));
							return;
						}
						(this.#f.set(n.pid, d), d[a].started(n.pid));
						let r = this.#p.get(n.pid);
						r && (this.#p.delete(n.pid), this.#f.delete(n.pid), d[a].exit(r));
						let i = t.uid ?? 0;
						this.#l
							.spawnExec({
								pid: n.pid,
								exec: n.exec,
								fds: n.fds,
								cwd: n.cwd,
								wasmImage: n.wasmImage,
								uid: i,
								gid: t.gid ?? t.uid ?? 0,
							})
							.catch((t) => {
								(this.#C(
									`gex: ${e[0]} (pid ${n.pid}) did not start: ${t?.message ?? t}\n`,
								),
									u(l.abandon(n.pid)));
							});
					},
					(e) => {
						(this.#d.delete(s), d[a].failed(e));
					},
				),
			d
		);
	}
	async run(t, { input: n, encoding: r = `utf-8`, ...i } = {}) {
		if ((this.#M(`spawn`), this.#b))
			throw Error(
				`run: this system has an init (${this.#b[0][0]}), which owns the processes; the page reaches programs through what it starts`,
			);
		let a = this.#N(t, { ...i, detached: !1, pty: void 0 }, !1, !0),
			o = async (e) => {
				let t = [];
				for (let n = e.getReader(); ; ) {
					let { value: e, done: r } = await n.read();
					if (r) break;
					t.push(e);
				}
				let n = t.reduce((e, t) => e + t.length, 0),
					i = new Uint8Array(n),
					a = 0;
				for (let e of t) (i.set(e, a), (a += e.length));
				return r ? new TextDecoder(r).decode(i) : i;
			},
			s = o(a.stdout),
			c = o(a.stderr),
			l = a.stdin.getWriter();
		(n !== void 0 &&
			(await l.write(
				typeof n == `string`
					? new TextEncoder().encode(n)
					: await e(n, `input`),
			)),
			await l.close());
		let { code: u, signal: d } = await a.exited;
		return { code: u, signal: d, stdout: await s, stderr: await c };
	}
	async shutdown() {
		if (this.#t.phase !== `stopped`) {
			this.#t.phase = `stopped`;
			for (let e of this.#d.values())
				e[a].exit({ code: 137, signal: 9, shutdown: !0 });
			(this.#d.clear(), this.#f.clear());
			for (let e of this.#n.values())
				for (let t of [e].flat()) await t?.[a]?.shutdown?.();
			(this.#l?.stop(),
				this.#a?.terminate(),
				this.dispatchEvent(new Event(`stopped`)));
		}
	}
	describe() {
		let e = this.#l?.host;
		return {
			phase: this.#t.phase,
			arch: this.#g,
			processes: [...this.#d.values()].map((e) => ({
				pid: e.pid,
				argv: e.argv,
			})),
			pids: e?.pids ?? [],
			threads: e?.threads ?? 0,
			memory: { kernel: this.#l?.kernel?.memory?.buffer?.byteLength ?? 0 },
		};
	}
};
export { f as i, d as n, p as r, Se as t };
