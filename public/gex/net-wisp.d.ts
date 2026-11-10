import type { System } from "./index";
import { Network } from "./net";

export declare const DEFAULT_WISP: string;

/** Over a Wisp proxy. Events: `open`, `closed`, `connect`. */
export declare class Wisp extends Network {
	constructor(sys: System, options?: { url?: string });
	get url(): string;
}
