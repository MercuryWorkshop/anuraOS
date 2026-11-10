import type { Filesystem } from "./fs";
import {
	Persist,
	type PersistOptions,
	type PersistRecord,
	type PersistStore,
} from "./persist";

/** A store in the IndexedDB database `name`. */
export declare class IdbStore implements PersistStore {
	constructor(name: string);
	load(): Promise<PersistRecord[]>;
	store(changes: { put: PersistRecord[]; drop: string[] }): Promise<void>;
	reset(): Promise<void>;
}

export declare class IdbPersist extends Persist {
	/** `db`: the IndexedDB database, one per tree. */
	constructor(fs: Filesystem, options: PersistOptions & { db: string });
}
