import type { Filesystem } from "./fs";

export type PersistRecord =
	| {
			path: string;
			kind: "file";
			stamp: unknown;
			data: Uint8Array;
			mode: number;
			mtime?: number;
	  }
	| { path: string; kind: "dir"; stamp: unknown; mode: number }
	| { path: string; kind: "symlink"; stamp: unknown; target: string }
	| { path: string; kind: "mode"; stamp: unknown; mode: number }
	| { path: string; kind: "gone"; stamp: unknown };

/** Where a `Persist` keeps the root: it keeps each record as it is. */
export interface PersistStore {
	load(): Promise<PersistRecord[]>;
	store(changes: { put: PersistRecord[]; drop: string[] }): Promise<void>;
	reset?(): Promise<void>;
}

export interface PersistOptions {
	/** More paths never kept. */
	exclude?: string[];
	/** The longest between saves, ms (default 30000). */
	every?: number;
	/** How long after programs' last change a save waits, ms (default 1000). */
	quiet?: number;
}

/** Never kept: what the kernel makes, and scratch. */
export declare const ALWAYS_EXCLUDED: readonly string[];

/** Events: `stored` (`stored`, `dropped`, `bytes`), `error` (`error`). */
export declare class Persist extends EventTarget {
	/** Made before boot. */
	constructor(fs: Filesystem, store: PersistStore, options?: PersistOptions);
	get stats(): {
		saves: number;
		stored: number;
		dropped: number;
		bytes: number;
		last: number | null;
		error: string | null;
	};
	save(): Promise<{ stored: number; dropped: number; bytes: number }>;
	reset(): Promise<void>;
}
