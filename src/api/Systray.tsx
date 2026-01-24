interface SystrayInit {
	onclick: (event: MouseEvent) => void;
	onrightclick: (event: MouseEvent) => void;
	icon: string;
	tooltip: string;
}
class SystrayIcon {
	element: HTMLImageElement = document.createElement("img");
	onclick = (event: MouseEvent) => {};
	onrightclick = (event: MouseEvent) => {};
	constructor(init?: SystrayInit) {
		this.element.onclick = (event) => {
			event.preventDefault();
			if (this.onclick) {
				try {
					this.onclick(event);
				} catch (e) {
					this.destroy();
				}
			}
			event.stopPropagation();
		};
		this.element.oncontextmenu = (event) => {
			event.preventDefault();
			if (this.onrightclick) {
				try {
					this.onrightclick(event);
				} catch (e) {
					this.destroy();
				}
			}
			event.stopPropagation();
		};
		this.element.style.height = "1.5em";
		if (init) {
			if (init.onclick) {
				this.onclick = init.onclick;
			}
			if (init.onrightclick) {
				this.onrightclick = init.onrightclick;
			}
			if (init.icon) {
				this.icon = init.icon;
			}
			if (init.tooltip) {
				this.tooltip = init.tooltip;
			}
		}
	}
	get icon() {
		return this.element.src;
	}
	set icon(value) {
		this.element.src = value;
	}
	get tooltip() {
		return this.element.title;
	}
	set tooltip(value) {
		this.element.title = value;
	}
	destroy = () => {
		/*this is set in the Systray class*/
	};
}
class Systray {
	element: HTMLSpanElement;
	icons: SystrayIcon[] = [];
	constructor() {
		this.element = document.getElementsByClassName(
			"systray",
		)[0]! as HTMLSpanElement;
	}

	create(init?: SystrayInit) {
		const systrayIcon = new SystrayIcon(init);
		this.icons.push(systrayIcon);
		systrayIcon.destroy = () => {
			delete this.icons[this.icons.indexOf(systrayIcon)];
			systrayIcon.element.remove();
		};
		this.element.appendChild(systrayIcon.element);
		return systrayIcon;
	}
}
