/**
 * the purpose of the following code is to give a demo of
 * how to realize the floating dialog using javascript.
 *It was written without any consideration of cross-browser compatibility,
 * and it can be run successfully under the firefox 3.5.7.
 *
 * nope nope this code has NOT been stolen rafflesia did NOT make it :thumbsup:
 */

// no i will not use data properties in the dom element fuck off
// ok fine i will fine i just realized how much harder it would be

/**
 * to show a floating dialog displaying the given dom element
 * @param {Object} title "title of the dialog"
 */

const windowInformation = {};
const windowID = 0;

class WindowInformation {
    title: string;
    width: string;
    minwidth: number;
    height: string;
    minheight: number;
    allowMultipleInstance = false;
}

class WMWindow {
    element: HTMLElement;
    content: HTMLElement;
    maximized: boolean;
    oldstyle: string | null;

    dragging = false;

    originalLeft: number;
    originalTop: number;

    width: number;
    height: number;

    mouseLeft: number;
    mouseTop: number;
    wininfo: WindowInformation;

    state: { title: string };

    onfocus: () => void;
    onresize: (w: number, h: number) => void;
    onclose: () => void;

    justresized = false;

    mouseover = false;

    maximizeImg: HTMLImageElement;
    constructor(wininfo: WindowInformation) {
        this.wininfo = wininfo;
        this.state = stateful({
            title: wininfo.title,
        });
        this.element = (
            <div
                class="aliceWMwin opacity0"
                style={`
                    width: ${wininfo.width};
                    height: ${wininfo.height};
                `}
                on:mouseover={() => {
                    this.mouseover = true;
                }}
                on:mouseout={() => {
                    this.mouseover = false;
                }}
                on:mousedown={this.focus.bind(this)}
            >
                <div class="resizers">
                    <div class="resize-edge left"></div>
                    <div class="resize-edge right"></div>
                    <div class="resize-edge top"></div>
                    <div class="resize-edge bottom"></div>

                    <div class="resize-corner top-left"></div>
                    <div class="resize-corner top-right"></div>
                    <div class="resize-corner bottom-left"></div>
                    <div class="resize-corner bottom-right"></div>
                </div>
                <div
                    class="title"
                    on:mousedown={(evt: MouseEvent) => {
                        deactivateFrames();

                        this.dragging = true;
                        this.originalLeft = this.element.offsetLeft;
                        this.originalTop = this.element.offsetTop;
                        this.mouseLeft = evt.clientX;
                        this.mouseTop = evt.clientY;
                    }}
                    on:mouseup={(evt: MouseEvent) => {
                        reactivateFrames();

                        if (this.dragging) {
                            this.handleDrag(evt);
                            this.dragging = false;
                        }
                    }}
                    on:mousemove={(evt: MouseEvent) => {
                        // do the dragging during the mouse move

                        if (this.dragging) {
                            this.handleDrag(evt);
                        }
                    }}
                >
                    <div class="titleContent">
                        {React.use(this.state.title)}
                    </div>

                    <button
                        class="windowButton"
                        on:click={() => {
                            this.minimize();
                        }}
                    >
                        <img
                            src="/assets/window/minimize.svg"
                            height="12px"
                            class="windowButtonIcon"
                        />
                    </button>

                    <button
                        class="windowButton"
                        on:click={this.maximize.bind(this)}
                    >
                        <img
                            src="/assets/window/maximize.svg"
                            bind:maximizeImg={this}
                            height="12px"
                            class="windowButtonIcon"
                        />
                    </button>
                    <button
                        class="windowButton"
                        on:click={this.close.bind(this)}
                    >
                        <img
                            src="/assets/window/close.svg"
                            height="12px"
                            class="windowButtonIcon"
                        />
                    </button>
                </div>
                <div
                    class="content"
                    bind:content={this}
                    style="width: 100%; padding:0; margin:0;"
                ></div>
            </div>
        );
        this.width = parseFloat(
            getComputedStyle(this.element, null)
                .getPropertyValue("width")
                .replace("px", ""),
        );
        this.height = parseFloat(
            getComputedStyle(this.element, null)
                .getPropertyValue("height")
                .replace("px", ""),
        );

        document.addEventListener("mousemove", (evt) => {
            if (this.dragging) {
                this.handleDrag(evt);
            }
        });

        // a very elegant way of detecting if the user clicked on an iframe inside of the window. credit to https://gist.github.com/jaydson/1780598
        window.addEventListener("blur", () => {
            if (this.mouseover) {
                this.focus();
            }
        });

        // finish the dragging when release the mouse button
        document.addEventListener("mouseup", (evt) => {
            reactivateFrames();

            evt = evt || window.event;

            if (this.dragging) {
                this.handleDrag(evt);

                this.dragging = false;
            }
        });

        const resizers = [
            //@ts-ignore
            ...this.element.querySelectorAll(".resize-corner"),
            //@ts-ignore
            ...this.element.querySelectorAll(".resize-edge"),
        ];
        const minimum_size = 20;
        let original_width = 0;
        let original_height = 0;
        let original_x = 0;
        let original_y = 0;
        let original_mouse_x = 0;
        let original_mouse_y = 0;
        let sentResize = false;
        for (let i = 0; i < resizers.length; i++) {
            const currentResizer = resizers[i];
            currentResizer.addEventListener("mousedown", (e: MouseEvent) => {
                e.preventDefault();
                original_width = parseFloat(
                    getComputedStyle(this.element, null)
                        .getPropertyValue("width")
                        .replace("px", ""),
                );
                original_height = parseFloat(
                    getComputedStyle(this.element, null)
                        .getPropertyValue("height")
                        .replace("px", ""),
                );
                deactivateFrames();
                original_x = this.element.getBoundingClientRect().left;
                original_y = this.element.getBoundingClientRect().top;
                original_mouse_x = e.pageX;
                original_mouse_y = e.pageY;
                window.addEventListener("mousemove", resize);

                window.addEventListener("mouseup", () => {
                    reactivateFrames();
                    window.removeEventListener("mousemove", resize);
                    if (!sentResize) {
                        this.onresize(this.width, this.height);
                        sentResize = true;
                    }
                });
            });

            const resize = (e: MouseEvent) => {
                sentResize = false;
                if (this.maximized) {
                    this.unmaximize();
                }
                if (currentResizer.classList.contains("bottom-right")) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    const height =
                        original_height + (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                    }
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                    }
                } else if (currentResizer.classList.contains("bottom-left")) {
                    const height =
                        original_height + (e.pageY - original_mouse_y);
                    const width = original_width - (e.pageX - original_mouse_x);
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                    }
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                        this.element.style.left =
                            original_x + (e.pageX - original_mouse_x) + "px";
                    }
                } else if (currentResizer.classList.contains("top-right")) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    const height =
                        original_height - (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                    }
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                        this.element.style.top =
                            original_y + (e.pageY - original_mouse_y) + "px";
                    }
                } else if (currentResizer.classList.contains("top-left")) {
                    const width = original_width - (e.pageX - original_mouse_x);
                    const height =
                        original_height - (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                        this.element.style.left =
                            original_x + (e.pageX - original_mouse_x) + "px";
                    }
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                        this.element.style.top =
                            original_y + (e.pageY - original_mouse_y) + "px";
                    }
                } else if (currentResizer.classList.contains("left")) {
                    const width = original_width - (e.pageX - original_mouse_x);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                        this.element.style.left =
                            original_x + (e.pageX - original_mouse_x) + "px";
                    }
                } else if (currentResizer.classList.contains("right")) {
                    const width = original_width + (e.pageX - original_mouse_x);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                    }
                } else if (currentResizer.classList.contains("top")) {
                    const width =
                        original_height - (e.pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.height = width + "px";
                        this.element.style.top =
                            original_y + (e.pageY - original_mouse_y) + "px";
                    }
                } else if (currentResizer.classList.contains("bottom")) {
                    const height =
                        original_height + (e.pageY - original_mouse_y);
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                    }
                }
                this.width = parseFloat(
                    getComputedStyle(this.element, null)
                        .getPropertyValue("width")
                        .replace("px", ""),
                );
                this.height = parseFloat(
                    getComputedStyle(this.element, null)
                        .getPropertyValue("height")
                        .replace("px", ""),
                );
            };
        }

        setTimeout(() => this.element.classList.remove("opacity0"), 10);
    }

    handleDrag(evt: MouseEvent) {
        this.element.style.left =
            Math.min(
                window.innerWidth,
                Math.max(0, this.originalLeft + evt.clientX! - this.mouseLeft),
            ) + "px";
        this.element.style.top =
            Math.min(
                window.innerHeight,
                Math.max(0, this.originalTop + evt.clientY! - this.mouseTop),
            ) + "px";

        if (this.maximized) {
            this.unmaximize();
            this.originalLeft = this.element.offsetLeft;
            this.originalTop = this.element.offsetTop;
            this.mouseLeft = evt.clientX;
            this.mouseTop = evt.clientY;
        }
    }

    focus() {
        this.element.style.setProperty(
            "z-index",
            (getHighestZindex() + 1).toString(),
        );
        normalizeZindex();

        if (this.onfocus) this.onfocus();
    }
    close() {
        this.element.remove();
        // TODO, Remove this and make it an event
        anura.removeStaleApps();

        if (this.onclose) this.onclose();
    }
    togglemaximize() {
        if (!this.maximized) {
            this.maximize();
        } else {
            this.unmaximize();
        }
    }
    maximize() {
        if (this.maximized) {
            // Unmaximize if already maximized (this will be done anyways) because titlebar click
            return;
        }

        this.oldstyle = this.element.getAttribute("style");
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        this.element.style.top = "0";
        this.element.style.left = "0";
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height - 61}px`;

        this.maximizeImg.src = "/assets/window/restore.svg";

        this.justresized = true;
        this.maximized = true;
        this.onresize(this.width, this.height);
    }
    async unmaximize() {
        console.log("restoring");
        this.element.setAttribute("style", this.oldstyle!);
        this.maximizeImg.src = "/assets/window/maximize.svg";

        await sleep(10); // Race condition as a feature
        this.justresized = true;
        this.maximized = false;
        this.onresize(this.width, this.height);
    }
    minimize() {
        this.element.style.display = "none";
    }
    unminimize() {
        this.element.style.display = "";
    }
}

const AliceWM = {
    create: function (givenWinInfo: string | WindowInformation) {
        // Default param
        let wininfo: WindowInformation = {
            title: "",
            minheight: 40,
            minwidth: 40,
            width: "1000px",
            height: "500px",
            allowMultipleInstance: false,
        };
        // Param given in argument
        if (typeof givenWinInfo == "object") wininfo = givenWinInfo;

        if (typeof givenWinInfo == "string")
            // Only title given
            wininfo.title = givenWinInfo;

        const win = new WMWindow(wininfo);
        document.body.appendChild(win.element);
        win.focus();
        return win;
    },
};

function deactivateFrames() {
    let i;
    const frames = document.getElementsByTagName("iframe");
    for (i = 0; i < frames.length; ++i) {
        // anura.logger.debug(frames[i]);
        frames[i]!.style.pointerEvents = "none";
    }
}
function reactivateFrames() {
    let i;

    const frames = document.getElementsByTagName("iframe");
    for (i = 0; i < frames.length; ++i) {
        frames[i]!.style.pointerEvents = "auto";
    }
}

function getHighestZindex() {
    const allWindows: HTMLElement[] = Array.from(
        document.querySelectorAll<HTMLTableElement>(".aliceWMwin"),
    );
    // anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge

    let highestZindex = 0;
    for (const wmwindow of allWindows) {
        if (Number(wmwindow.style.getPropertyValue("z-index")) >= highestZindex)
            highestZindex = Number(wmwindow.style.getPropertyValue("z-index"));
    }
    return highestZindex;
}

async function normalizeZindex() {
    const allWindows: HTMLElement[] = Array.from(
        document.querySelectorAll<HTMLTableElement>(".aliceWMwin"),
    );
    // anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge

    let lowestZindex = 9999;
    for (const wmwindow of allWindows) {
        if (Number(wmwindow.style.getPropertyValue("z-index")) <= lowestZindex)
            lowestZindex = Number(wmwindow.style.getPropertyValue("z-index"));
    }

    const normalizeValue = lowestZindex - 1;

    for (const wmwindow of allWindows) {
        wmwindow.style.setProperty(
            "z-index",
            (
                Number(wmwindow.style.getPropertyValue("z-index")) -
                normalizeValue
            ).toString(),
        );
    }
}

/**
 * place the given dom element in the center of the browser window
 * @param {Object} element
 */
function center(element: HTMLElement) {
    if (element) {
        element.style.left =
            (window.innerWidth - element.offsetWidth) / 2 + "px";
        element.style.top =
            (window.innerHeight - element.offsetHeight) / 2 + "px";
    }
}

/**
 * callback function for the dialog closed event
 * @param {Object} container
 */
