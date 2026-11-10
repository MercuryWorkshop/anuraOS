import type { System } from "./index";

export interface Duplex {
	readable: ReadableStream<Uint8Array>;
	writable: WritableStream<Uint8Array>;
}

/** The guest's connections out. Events: `connect` (`host`, `port`). */
export declare class Network extends EventTarget {
	/** `connect(host, port)`: a duplex, or a promise of one; a throw or a rejection refuses the connection. */
	constructor(
		sys: System,
		options: { connect(host: string, port: number): Duplex | Promise<Duplex> },
	);
	/** Resolves once programs' connections go through it. */
	get ready(): Promise<void>;
}
