import type { System } from "./index";

/** Events: `running`. */
export declare class WebAudio extends EventTarget {
	/** Made in a user gesture's handler. */
	constructor(
		sys: System,
		options?: { latency?: AudioContextLatencyCategory | number },
	);
	get ready(): Promise<WebAudio>;
	get context(): AudioContext | null;
	get stats(): {
		backlog: { avg: number; min: number; max: number };
		base: number;
		output: number;
		rms: number;
		underruns: number;
	} | null;
	close(): Promise<void>;
}
