import "./wl-bridge-6Hq-j3j2.mjs";
import "./dom-compositor-Bt2Wn5FU.mjs";
function e(e, t) {
	let n = new Map(),
		r = 1,
		i = 0,
		a = (e) => `${e.token}:${e.client}:${e.parent}`,
		o = (e) => {
			if (e.placed) return { x: e.relX | 0, y: e.relY | 0 };
			if (e.role === 1 || !e.parent) return n.get(e.key) ?? { x: 0, y: 0 };
			let t = n.get(a(e)) ?? { x: 0, y: 0 };
			return { x: t.x + (e.relX | 0), y: t.y + (e.relY | 0) };
		},
		s = (t) => {
			let r = t.role === 1 && !t.placed ? n.get(t.key) : o(t);
			(n.set(t.key, r),
				(t.canvas.style.left = `${r.x}px`),
				(t.canvas.style.top = `${r.y}px`),
				t.placed && t.place(r.x, r.y));
			for (let n of e.windows())
				n.role !== 1 && n.parent && !n.placed && a(n) === t.key && s(n);
		},
		c = (e) => {
			((e.canvas.style.width = `${e.canvas.width}px`),
				(e.canvas.style.height = `${e.canvas.height}px`));
		},
		l = [[], [], []],
		u = (t) => {
			for (let n of e.windows())
				n.role === 3 &&
					a(n) === t.key &&
					((n.canvas.style.zIndex = t.canvas.style.zIndex), u(n));
		},
		d = () => {
			l.forEach((e, t) =>
				e.forEach((e, n) => {
					((e.canvas.style.zIndex = String(2e6 + t * 1e5 + n)), u(e));
				}),
			);
		},
		f = (e) => {
			for (let t of l) {
				let n = t.indexOf(e);
				n >= 0 && t.splice(n, 1);
			}
		},
		p = (e, t) => {
			f(e);
			let n = l[Math.min(2, Math.max(0, e.layer | 0))];
			if (t === 4294967295) n.unshift(e);
			else {
				let r = t ? n.findIndex((e) => e.stackId === t) : -1;
				r >= 0 ? n.splice(r, 0, e) : n.push(e);
			}
			d();
		};
	return (
		(e.onwindow = (o) => {
			if (o.role === 4) return;
			let l = o.canvas;
			if (((l.style.position = `absolute`), c(o), o.placed))
				(p(o, 0), (o.onrestack = (e) => p(o, e)));
			else if (o.role === 1) {
				let e = i++,
					a = Math.max(1, t.clientWidth - o.width),
					s = Math.max(1, t.clientHeight - o.height);
				(n.set(o.key, { x: (e * 28) % a, y: (e * 28) % s }),
					(l.style.zIndex = String(r++)),
					l.addEventListener(`pointerdown`, () => {
						o.placed || ((l.style.zIndex = String(r++)), u(o));
					}),
					o.place(n.get(o.key).x, n.get(o.key).y));
			} else if (o.role === 3 && o.parent) {
				let t = e.windows().find((e) => e.key === a(o));
				l.style.zIndex = t?.canvas.style.zIndex || String(1e6 + r++);
			} else l.style.zIndex = String(1e6 + r++);
			((o.onplace = () => s(o)),
				(o.onresized = () => c(o)),
				(o.onclosed = () => {
					(l.remove(), n.delete(o.key), f(o));
				}),
				t.append(l),
				s(o));
		}),
		(e.describe = async () => {
			let n = e.windows().filter((e) => e.role !== 4),
				r = n.filter((e) => e.role === 1),
				i = 2166136261,
				a = 0;
			for (let e of [...n].sort(
				(e, t) => Number(e.canvas.style.zIndex) - Number(t.canvas.style.zIndex),
			)) {
				if (e.canvas.width < 2 || e.canvas.height < 2 || e.external) continue;
				let t;
				try {
					t = e.canvas
						.getContext(`2d`)
						.getImageData(0, 0, e.canvas.width, e.canvas.height).data;
				} catch {
					continue;
				}
				for (let e = 0; e < t.length; e += 16) {
					let n = Math.max(t[e], t[e + 1], t[e + 2]);
					(n > 12 && a++, (i = ((i ^ n) * 16777619) >>> 0));
				}
			}
			return {
				frames: r.reduce((e, t) => e + t.paints, 0),
				windows: r.length,
				surfaces: n.length,
				list: n.map((e) => {
					let t = o(e);
					return `${e.key} role=${e.role} ${e.width}x${e.height}@${t.x},${t.y} serial=${e.serial} "${e.title ?? ``}"`;
				}),
				titles: r.map((e) => e.title || `(untitled)`),
				focus: e.focused?.()?.key ?? null,
				popups: n.filter((e) => e.role === 2).length,
				lit: a,
				hash: i,
				output: `${t.clientWidth}x${t.clientHeight}`,
				compositor: `none`,
			};
		}),
		(e.presented = () =>
			e
				.windows()
				.some(
					(e) =>
						e.role !== 4 &&
						e.paints > 0 &&
						e.canvas.isConnected &&
						e.canvas.width > 1 &&
						e.canvas.height > 1,
				)),
		e
	);
}
export { e as bareDesktop };
