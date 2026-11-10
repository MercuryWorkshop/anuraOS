function e(e, t, n) {
	let r = t,
		i = t + n;
	for (; r < i && e[r] !== 0; ) r++;
	return new TextDecoder().decode(e.slice(t, r));
}
function t(t, n, r) {
	let i = e(t, n, r).trim();
	if (!i) return 0;
	if (t[n] & 128) {
		let e = 0n;
		for (let i = n + 1; i < n + r; i++) e = (e << 8n) | BigInt(t[i]);
		return Number(e);
	}
	return parseInt(i, 8) || 0;
}
function n(n, i) {
	let a = n instanceof Uint8Array ? n : new Uint8Array(n),
		o = 0,
		s = null,
		c = null,
		l = null;
	for (; o + 512 <= a.length; ) {
		if (a[o] === 0) {
			o += 512;
			continue;
		}
		let n = t(a, o + 124, 12),
			u = String.fromCharCode(a[o + 156] || 48),
			d = o + 512,
			f = d + Math.ceil(n / 512) * 512;
		if (u === `x`) l = r(a.subarray(d, d + n));
		else if (u === `K`) c = e(a, d, n);
		else if (u === `L`) s = e(a, d, n);
		else if (u !== `g`) {
			let t = e(a, o, 100),
				r = e(a, o + 345, 155);
			(r && (t = `${r}/${t}`), s !== null && (t = s));
			let f = c ?? e(a, o + 157, 100);
			s = c = null;
			let p = l;
			if (
				((l = null),
				p?.path !== void 0 && (t = p.path),
				p?.linkpath !== void 0 && (f = p.linkpath),
				i({ name: t, type: u, size: n, body: d, off: o, link: f, ext: p }))
			)
				return;
		}
		o = f;
	}
}
function r(e) {
	let t = {},
		n = 0;
	for (; n < e.length; ) {
		let r = n;
		for (; r < e.length && e[r] !== 32; ) r++;
		let i = parseInt(new TextDecoder().decode(e.slice(n, r)), 10);
		if (!(i > 0) || n + i > e.length) break;
		let a = n + i - 1,
			o = r + 1;
		for (; o < a && e[o] !== 61; ) o++;
		let s = new TextDecoder().decode(e.slice(r + 1, o)),
			c = e.slice(o + 1, a);
		if (s === `path`) t.path = new TextDecoder().decode(c);
		else if (s === `linkpath`) t.linkpath = new TextDecoder().decode(c);
		else if (s.startsWith(`SCHILY.xattr.user.`))
			(t.xattrs ??= {})[s.slice(13)] = c;
		else if (s.startsWith(`LIBARCHIVE.xattr.user.`)) {
			let e = atob(new TextDecoder().decode(c));
			(t.xattrs ??= {})[decodeURIComponent(s.slice(17))] = Uint8Array.from(
				e,
				(e) => e.charCodeAt(0),
			);
		}
		n += i;
	}
	return t;
}
export { n as tarEntries };
