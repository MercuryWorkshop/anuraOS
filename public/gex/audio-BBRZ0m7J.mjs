var e = !1;
function t(t) {
	e || (r(t) && (e = !0));
}
function n(e) {
	return (
		typeof AudioContext == `function` &&
		typeof AudioWorkletNode == `function` &&
		typeof SharedArrayBuffer == `function` &&
		e?.buffer instanceof SharedArrayBuffer
	);
}
function r({
	memory: e,
	at: t,
	clock: r = !0,
	latency: i = `interactive`,
	loop: a = !1,
	context: o = null,
}) {
	if (!t || !n(e)) return null;
	let s = o;
	if (!s)
		try {
			s = new AudioContext({ latencyHint: i });
		} catch {
			s = new AudioContext({ latencyHint: `interactive` });
		}
	let c = { ctx: s, last: null, history: [] };
	globalThis.__gexAudio = c;
	let l = () => {
			s.state !== `running` && s.resume().catch(() => {});
		},
		u = [`pointerdown`, `mousedown`, `keydown`, `touchend`];
	for (let e of u) addEventListener(e, l, { capture: !0, passive: !0 });
	l();
	let d = URL.createObjectURL(
		new Blob(
			[
				`
// Layout: shims/kernel/src/audio.rs (version 2).
const HDR = 32, SW = 16, OFF = (HDR + 8 * SW) * 4;
const HIGH = 0.3, BACK = 0.08;
class GexDsp extends AudioWorkletProcessor {
  constructor() {
    super();
    this.words = null;
    this.port.onmessage = (e) => {
      const { buffer, at, clock, loop } = e.data;
      if (e.data.latencyUs !== undefined) { if (this.words) Atomics.store(this.words, 6, e.data.latencyUs); return; }
      // ?audioclock=0: not the device's clock (it keeps the wall clock), and
      // the larger start the drift needs: as before, for measuring.
      this.clock = clock !== false;
      this.low = this.clock ? 0.006 : 0.04;
      this.loop = !!loop;
      this.words = new Uint32Array(buffer, at, HDR + 8 * SW);
      this.nslots = this.words[2]; this.cap = this.words[3]; this.ccap = this.words[8];
      this.slots = [];
      for (let s = 0; s < this.nslots; s++) {
        this.slots.push({ base: HDR + s * SW, f: new Float32Array(buffer, at + OFF + s * this.cap * 8, this.cap * 2), ri: null, fr: 0, gen: -1, waiting: true, lastW: 0, still: 0 });
      }
      this.capture = new Float32Array(buffer, at + OFF + this.nslots * this.cap * 8, this.ccap * 2);
      Atomics.store(this.words, 5, sampleRate);
      Atomics.store(this.words, 9, 128);
    };
    this.played = 0; this.under = 0; this.sumsq = 0; this.n = 0; this.cross = 0; this.last = 0; this.tick = 0;
    // The rings' backlog when a quantum starts (frames written and not yet
    // played, the most of any slot playing): the software part of the
    // output latency, measured.
    this.bsum = 0; this.bmin = Infinity; this.bmax = 0; this.bn = 0; this.active = 0;
  }
  // Add slot \`sl\`'s next \`n\` frames, resampled, into L/R. Whether it played.
  mix(sl, L, R, n) {
    const W = this.words, b = sl.base;
    const w = Atomics.load(W, b + 3);
    const rate = W[b + 1] || sampleRate;
    const gen = Atomics.load(W, b + 2);
    if (sl.ri === null || gen !== sl.gen) { sl.gen = gen; sl.ri = w; sl.fr = 0; sl.waiting = true; sl.lastW = w; sl.still = 0; }
    let avail = (w - sl.ri) >>> 0;
    // Lapped (or wrapped past), or far behind the writer: the newest frames, a short latency.
    if (avail > this.cap || avail > HIGH * rate) { sl.ri = (w - Math.floor(BACK * rate)) >>> 0; avail = (w - sl.ri) >>> 0; sl.fr = 0; }
    // Frames of the context's time since the writer last added any.
    sl.still = w === sl.lastW ? sl.still + n : 0;
    sl.lastW = w;
    // Waiting for the start's worth, unless the writer has added nothing
    // for as long: a device buffer shorter than the start holds all it can
    // (the writer waits for room), and only playing frees it.
    if (sl.waiting && avail < this.low * rate && !(avail >= 2 && sl.still >= this.low * sampleRate)) { Atomics.store(W, b + 4, sl.ri); return false; }
    sl.waiting = false;
    const ms = avail * 1000 / rate;
    if (ms > this.qmax) this.qmax = ms;
    const step = rate / sampleRate, f = sl.f, cap = this.cap;
    for (let i = 0; i < n; i++) {
      if (((w - sl.ri) >>> 0) < 2) {
        // Ran dry: an underrun only while its stream still has the slot.
        if (W[b] !== 0) { this.under++; Atomics.add(W, b + 6, 1); }
        sl.waiting = true; break;
      }
      const a = (sl.ri % cap) * 2, c = ((sl.ri + 1) % cap) * 2, t = sl.fr;
      L[i] += f[a] * (1 - t) + f[c] * t; R[i] += f[a + 1] * (1 - t) + f[c + 1] * t;
      sl.fr += step;
      while (sl.fr >= 1) { sl.fr -= 1; sl.ri = (sl.ri + 1) >>> 0; }
    }
    Atomics.store(W, b + 4, sl.ri);
    return true;
  }
  process(_inputs, outputs) {
    const L = outputs[0][0], R = outputs[0][1] ?? L, n = L.length;
    if (!this.words) return true;
    const W = this.words;
    if (this.clock) Atomics.add(W, 4, 1);
    L.fill(0); if (R !== L) R.fill(0);
    this.qmax = -1;
    let any = 0;
    for (const sl of this.slots) if (this.mix(sl, L, R, n)) any++;
    if (any) {
      this.bsum += this.qmax; this.bn++; if (this.qmax < this.bmin) this.bmin = this.qmax; if (this.qmax > this.bmax) this.bmax = this.qmax;
      for (let i = 0; i < n; i++) {
        const l = L[i];
        this.sumsq += l * l; this.n++;
        if ((l >= 0) !== (this.last >= 0)) this.cross++;
        this.last = l;
      }
      this.played += n;
      this.active = any;
    }
    // ?audioloop=1: what is played goes back in as capture (a digital
    // loopback, for the round trip).
    if (this.loop) {
      let cw = W[7];
      const C = this.capture, cc = this.ccap;
      for (let i = 0; i < n; i++) { const k = (cw % cc) * 2; C[k] = L[i]; C[k + 1] = R[i]; cw = (cw + 1) >>> 0; }
      Atomics.store(W, 7, cw);
    }
    // About twice a second: what was played, for the page's checks.
    if (++this.tick % 200 === 0 && this.n) {
      const backlog = this.bn ? { avg: +(this.bsum / this.bn).toFixed(1), min: +this.bmin.toFixed(1), max: +this.bmax.toFixed(1) } : null;
      this.port.postMessage({ rms: Math.sqrt(this.sumsq / this.n), hz: this.cross / 2 / (this.n / sampleRate), frames: this.n, underruns: this.under, rate: sampleRate, played: this.played, streams: this.active, backlog });
      this.sumsq = 0; this.n = 0; this.cross = 0;
      this.bsum = 0; this.bmin = Infinity; this.bmax = 0; this.bn = 0;
    }
    return true;
  }
}
registerProcessor('gex-dsp', GexDsp);
`,
			],
			{ type: `text/javascript` },
		),
	);
	return (
		(c.close = () => {
			for (let e of u) removeEventListener(e, l, { capture: !0 });
			return (
				c.node?.disconnect(),
				globalThis.__gexAudio === c && (globalThis.__gexAudio = null),
				s.close().catch(() => {})
			);
		}),
		(c.ready = s.audioWorklet.addModule(d).then(
			() => {
				URL.revokeObjectURL(d);
				let n = new AudioWorkletNode(s, `gex-dsp`, {
					numberOfInputs: 0,
					numberOfOutputs: 1,
					outputChannelCount: [2],
				});
				((n.port.onmessage = (e) => {
					((e.data.base = +(1e3 * (s.baseLatency ?? 0)).toFixed(1)),
						(e.data.output = +(1e3 * (s.outputLatency ?? 0)).toFixed(1)),
						n.port.postMessage({
							latencyUs: Math.round(1e3 * (e.data.base + e.data.output)),
						}),
						(c.last = e.data),
						c.history.push(e.data),
						c.history.length > 64 && c.history.shift());
				}),
					n.port.postMessage({ buffer: e.buffer, at: t, clock: r, loop: a }),
					n.port.postMessage({
						latencyUs: Math.round(
							1e6 * ((s.baseLatency ?? 0) + (s.outputLatency ?? 0)),
						),
					}),
					n.connect(s.destination),
					(c.node = n));
			},
			(e) => {
				throw (
					console.warn(
						`[gex] audio: the player did not start:`,
						e?.message ?? e,
					),
					e
				);
			},
		)),
		c.ready.catch(() => {}),
		c
	);
}
export { r as playAudio, t as startAudio };
