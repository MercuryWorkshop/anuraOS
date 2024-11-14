class SystrayIcon {
    element: HTMLImageElement = document.createElement("img");
    onclick = (event: MouseEvent) => {};
    onrightclick = (event: MouseEvent) => {};
    constructor(template: any) {
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
        if (template) {
            if (template.onclick) {
                this.onclick = template.onclick;
            }
            if (template.onrightclick) {
                this.onrightclick = template.onrightclick;
            }
            if (template.icon) {
                this.icon = template.icon;
            }
            if (template.tooltip) {
                this.tooltip = template.tooltip;
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
    create = (template?: any) => {
        const systrayIcon = new SystrayIcon(template);
        this.icons.push(systrayIcon);
        systrayIcon.destroy = () => {
            delete this.icons[this.icons.indexOf(systrayIcon)];
            systrayIcon.element.remove();
        };
        this.element.appendChild(systrayIcon.element);
        return systrayIcon;
    };
}
