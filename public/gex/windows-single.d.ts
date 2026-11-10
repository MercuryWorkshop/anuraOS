import type { System } from "./index";
import type { WindowEnv } from "./windows-host";

/** Every window drawn into one positioned element. Made before boot.
 *  Events: `change`. */
export declare class SingleCanvas extends EventTarget {
	constructor(sys: System, options: { container: HTMLElement });
	get env(): WindowEnv;
	/** After the page resized the container. */
	resized(): void;
	describe(): unknown;
}
