import type { System } from "./index";

export interface WindowEnv extends Record<string, string> {
	XDG_RUNTIME_DIR: string;
	WAYLAND_DISPLAY: string;
	DISPLAY: string;
}

/** Events: `title`, `resized`, `position`, `restack` (`below`), `request`
 *  (`kind`, `edges`), `closed`. */
export declare class GuestWindow extends EventTarget {
	/** Its pixels, CSS-sized to the window; focusable. */
	readonly canvas: HTMLCanvasElement;
	readonly kind: "toplevel" | "popup" | "subsurface";
	get pid(): number;
	get parent(): GuestWindow | null;
	get title(): string;
	get appId(): string | null;
	get decorations(): "host" | "client" | "none";
	get placed(): boolean;
	get x(): number;
	get y(): number;
	get width(): number;
	get height(): number;
	get states(): { maximized: boolean; fullscreen: boolean; resizing: boolean };
	resize(width: number, height: number): void;
	setStates(
		states: { maximized?: boolean; fullscreen?: boolean; resizing?: boolean },
		width?: number,
		height?: number,
	): void;
	place(x: number, y: number): void;
	focus(): void;
	close(): void;
}

/** Each window handed to the page to frame and place. Made before boot.
 *  Events: `window` (`window`), `cursor` (`css`). */
export declare class HostWindows extends EventTarget {
	constructor(
		sys: System,
		options?: { width?: number; height?: number; scale?: number },
	);
	get env(): WindowEnv;
	setOutputSize(width: number, height: number, scale?: number): void;
	windows(): GuestWindow[];
	get focused(): GuestWindow | null;
	keyEvent(e: KeyboardEvent, pressed: boolean): void;
}
