/**
 * Public API for the Anura window manager.
 *
 * Available globally as `anura.wm`.
 */
class WMAPI {
	/**
	 * An array of WeakRefs that contain WMWindows that are in the anura wm.
	 */
	windows: WeakRef<WMWindow>[] = [];

	/**
	 * Create a window that will be displayed in the desktop environment.
	 *
	 * @param ctx - The owning {@link App} instance the window is created under.
	 * @param info - Window options or a string title.
	 * @returns The created {@link WMWindow}.
	 *
	 * @example
	 * ```js
	 * let win = anura.wm.create(instance, {
	 *     title: "Example Window",
	 *     width: "1280px",
	 *     height: "720px",
	 * });
	 * ```
	 */
	create(ctx: App, info: WindowInformation | string): WMWindow {
		const win = AliceWM.create(info as unknown as any, ctx);
		win.focus();

		win.addEventListener("focus", (event) => {
			//@ts-ignore
			document.activeElement?.blur();
			alttab.update();

			taskbar.element.style.zIndex = getHighestZindex() + 3 + "";
		});

		win.addEventListener("resize", (event: MessageEvent) => {});

		win.addEventListener("close", (event) => {
			this.windows = this.windows.filter(
				(w: WeakRef<WMWindow>) => w.deref() !== win,
			);
		});

		win.addEventListener("maximize", () => {
			taskbar.maximizedWins.push(win);
			taskbar.updateRadius();
		});

		win.addEventListener("unmaximize", () => {
			taskbar.maximizedWins = taskbar.maximizedWins.filter((w) => w !== win);
			taskbar.updateRadius();
		});

		win.addEventListener("snap", (event: MessageEvent) => {
			taskbar.updateRadius();
		});

		ctx.windows.push(win);
		this.windows.push(new WeakRef(win));

		taskbar.updateTaskbar();
		alttab.update();
		return win;
	}

	/**
	 * Same as {@link WMAPI.create} but creates a window under the Generic App
	 * instance, useful when there is no specific app context to attach the
	 * window to.
	 *
	 * @param info - Window options or a string title.
	 * @returns The created {@link WMWindow}.
	 *
	 * @example
	 * ```js
	 * let win = anura.wm.createGeneric({
	 *     title: "Example Window",
	 *     width: "1280px",
	 *     height: "720px",
	 * });
	 *
	 * // Another use case
	 * let win = anura.wm.createGeneric("Example Window");
	 * ```
	 */
	createGeneric(info: WindowInformation | string): WMWindow {
		return this.create.call(this, anura.apps["anura.generic"], info);
	}
}
