/**
 * Anura-styled context menu you can use in your apps. Exposed on the global
 * `anura` object as `anura.ContextMenu` and used as a constructor.
 *
 * @example
 * ```js
 * const contextmenu = new anura.ContextMenu();
 * contextmenu.addItem("Log to console", function () {
 *     console.log("hello world!");
 * });
 * element.addEventListener("contextmenu", (e) => {
 *     e.preventDefault();
 *     const boundingRect = window.frameElement.getBoundingClientRect();
 *     contextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y);
 *     document.onclick = (e) => {
 *         document.onclick = null;
 *         contextmenu.hide();
 *         e.preventDefault();
 *     };
 * });
 * ```
 */
class ContextMenu {
	large: boolean;
	private isShown = false;
	private element = (<div class={["custom-menu"]} style=""></div>);

	item(text: string, callback: VoidFunction, icon?: string) {
		return (
			<div class="custom-menu-item" on:click={callback.bind(this)}>
				{$if(icon, <span class="material-symbols-outlined">{icon}</span>)}
				<span>{text}</span>
			</div>
		);
	}

	constructor(large = false) {
		this.large = large;
		if (this.large) {
			this.element.classList.add("large");
		}
		setTimeout(
			() =>
				document.addEventListener("click", (event) => {
					const withinBoundaries = event.composedPath().includes(this.element);

					if (!withinBoundaries) {
						this.element.remove();
					}
				}),
			100,
		);
	}
	/**
	 * Add an item to the context menu. The callback is invoked when the user
	 * selects the item; the menu is hidden automatically before the callback
	 * runs.
	 *
	 * @param text - The label to display for the menu item.
	 * @param callback - Function invoked when the item is selected.
	 * @param icon - Optional Material Symbols icon name to display next to the
	 *   label.
	 *
	 * @example
	 * ```js
	 * const contextmenu = new anura.ContextMenu();
	 * contextmenu.addItem("Log to console", function () {
	 *     console.log("hello world!");
	 * });
	 * ```
	 */
	addItem(text: string, callback: VoidFunction, icon?: string) {
		this.element.appendChild(
			this.item(
				text,
				() => {
					this.hide();
					callback();
				},
				icon,
			),
		);
	}

	removeAllItems() {
		this.element.innerHTML = "";
	}

	/**
	 * Make the context menu visible at the given page coordinates. If the menu
	 * overflows the body bounds it will be repositioned to remain visible.
	 *
	 * @param x - The page x coordinate to place the menu at.
	 * @param y - The page y coordinate to place the menu at.
	 * @returns The menu's root element.
	 *
	 * @example
	 * ```js
	 * contextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y);
	 * ```
	 */
	show(x: number, y: number) {
		// remove any existing context menus. i will admit this is a bit of a quick n dirty hack
		if (document.querySelector(".custom-menu")) {
			console.warn(
				"FORCE REMOVING OTHER CONTEXT MENUS, THE APP SHOULD TAKE CARE OF ONLY ALLOWING ONE CONTEXT MENU AT A TIME.",
			);
			document.querySelectorAll(".custom-menu").forEach((el) => {
				el.remove();
			});
		}

		// Reset out of bound fixes
		this.element.style.bottom = "";
		this.element.style.right = "";

		this.element.style.top = y.toString() + "px";
		this.element.style.left = x.toString() + "px";
		document.body.appendChild(this.element);
		this.isShown = true;
		this.element.focus();
		if (
			this.element.getBoundingClientRect().bottom >=
			document.body.getBoundingClientRect().bottom
		) {
			this.element.style.top = "";
			this.element.style.bottom = "0px";
		}
		if (
			this.element.getBoundingClientRect().right >=
			document.body.getBoundingClientRect().right
		) {
			this.element.style.left = "";
			this.element.style.right = "0px";
		}

		return this.element;
	}
	/**
	 * Hide the context menu if it is currently visible.
	 *
	 * @example
	 * ```js
	 * contextmenu.hide();
	 * ```
	 */
	hide() {
		if (this.isShown) {
			document.body.removeChild(this.element);
			this.isShown = false;
		}
	}
}
