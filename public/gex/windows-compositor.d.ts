import type { System } from "./index";
import type { WindowEnv } from "./windows-host";

/** The whole desktop in one canvas, composited on WebGPU. Made before boot. */
export declare class CompositorWindows extends EventTarget {
	constructor(
		sys: System,
		options: { canvas: HTMLCanvasElement; scale?: number },
	);
	get env(): WindowEnv;
	/** The output's new size, in device pixels. */
	resize(width: number, height: number): void;
	describe(): Promise<unknown>;
}
