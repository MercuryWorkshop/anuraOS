import type { System } from "./index";

/** Events: `started` (`description`), `failed` (`error`). */
export declare class MesaGl extends EventTarget {
	/** Made before boot, beside a windows class. `source(name)`: Mesa's files as bytes, or null to fetch them. */
	constructor(
		sys: System,
		options?: {
			eager?: boolean;
			d3d?: boolean;
			source?:
				| ((
						name: string,
				  ) =>
						| Uint8Array
						| ArrayBuffer
						| null
						| Promise<Uint8Array | ArrayBuffer | null>)
				| null;
		},
	);
	/** Start Mesa now; resolves its description. */
	start(): Promise<unknown>;
}
