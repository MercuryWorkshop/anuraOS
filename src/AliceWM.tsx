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

type SnappedWindow = {
    window: WMWindow;
    direction: "left" | "right";
};

let splitBar: WMSplitBar | null = null;

const minimizedSnappedWindows: SnappedWindow[] = [];

const snappedWindows: SnappedWindow[] = [];

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
    resizable: boolean;
}

class WMWindow {
    element: HTMLElement;
    content: HTMLElement;
    maximized: boolean;
    oldstyle: string | null;
    dragging = false;
    dragForceX: number;
    dragForceY: number;

    originalLeft: number;
    originalTop: number;
    resizable: boolean;
    width: number;
    height: number;

    mouseLeft: number;
    mouseTop: number;
    wininfo: WindowInformation;

    state: { title: string };

    onfocus: () => void;
    onresize: (w: number, h: number) => void;
    onclose: () => void;
    onmaximize: () => void;
    onsnap: (snapDirection: "left" | "right" | "top") => void;
    onunmaximize: () => void;

    snapped = false;

    clampWindows: boolean;

    justresized = false;

    minimizing = false;

    mouseover = false;

    maximizeImg: HTMLImageElement;
    constructor(wininfo: WindowInformation) {
        this.wininfo = wininfo;
        this.state = stateful({
            title: wininfo.title,
        });
        this.resizable = wininfo.resizable;
        if (this.resizable == undefined) {
            // This happens when resizable isn't passed in.
            this.resizable = true;
        }
        this.clampWindows = !!anura.settings.get("clampWindows");
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
                {(this.resizable && (
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
                )) ||
                    ""}
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
                            this.minimizing = true;
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

        window.addEventListener("resize", async () => {
            if (this.maximized || this.snapped) {
                this.remaximize();
            }
        });

        // finish the dragging when release the mouse button
        document.addEventListener("mouseup", (evt) => {
            reactivateFrames();

            const snapPreview = document.getElementById("snapPreview");

            if (snapPreview) {
                snapPreview.style.opacity = "0";
                setTimeout(() => {
                    snapPreview.remove();
                }, 200);
            }

            evt = evt || window.event;

            if (this.dragging) {
                this.handleDrag(evt);

                if (this.clampWindows) {
                    const forceX = this.dragForceX;
                    const forceY = this.dragForceY;
                    this.dragForceX = 0;
                    this.dragForceY = 0;
                    const snapDirection = this.getSnapDirection(forceX, forceY);
                    if (snapDirection) {
                        this.snap(snapDirection);
                    }
                }

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
                this.dragForceX = 0;
                this.dragForceY = 0;

                sentResize = false;
                if (this.maximized) {
                    this.unmaximize();
                }
                if (this.snapped) {
                    if (splitBar) {
                        return;
                    }
                    const direction = this.getSnapDirectionFromPosition(
                        original_x,
                        original_width,
                    );
                    if (
                        (direction == "left" &&
                            !currentResizer.classList.contains("right")) ||
                        (direction == "right" &&
                            !currentResizer.classList.contains("left"))
                    ) {
                        return;
                    }
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
        const offsetX = this.originalLeft + evt.clientX! - this.mouseLeft;
        const offsetY = this.originalTop + evt.clientY! - this.mouseTop;

        if (this.clampWindows) {
            const newOffsetX = Math.min(
                window.innerWidth - this.element.clientWidth,
                Math.max(0, offsetX),
            );

            const newOffsetY = Math.min(
                window.innerHeight - 61 - this.element.clientHeight,
                Math.max(0, offsetY),
            );

            this.element.style.left = newOffsetX + "px";
            this.element.style.top = newOffsetY + "px";

            if (offsetX != newOffsetX || offsetY != newOffsetY) {
                this.dragForceX = Math.abs(offsetX - newOffsetX);
                this.dragForceY = Math.abs(offsetY - newOffsetY);
                const snapDirection = this.getSnapDirection(
                    this.dragForceX,
                    this.dragForceY,
                );
                if (snapDirection) {
                    const preview = document.getElementById("snapPreview");
                    if (!preview) {
                        document.body.appendChild(
                            this.snapPreview(snapDirection),
                        );
                    } else {
                        const direction = preview.classList[0]?.split("-")[1];
                        if (direction != snapDirection) {
                            preview.remove();
                            document.body.appendChild(
                                this.snapPreview(snapDirection),
                            );
                        }
                    }
                }
            } else {
                this.dragForceX = 0;
                this.dragForceY = 0;
                const preview = document.getElementById("snapPreview");
                if (preview) {
                    preview.style.opacity = "0";
                    setTimeout(() => {
                        preview.remove();
                    }, 200);
                }
            }
        } else {
            this.element.style.left = offsetX + "px";
            this.element.style.top = offsetY + "px";
        }

        if (this.maximized || this.snapped) {
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
        this.element.classList.add("opacity0");
        setTimeout(() => {
            this.element.remove();
            // TODO, Remove this and make it an event
            anura.removeStaleApps();

            if (this.onclose) this.onclose();
        }, 200);
    }
    togglemaximize() {
        if (!this.maximized) {
            this.maximize();
        } else {
            this.unmaximize();
        }
    }
    maximize() {
        if (this.maximized || this.snapped) {
            // Unmaximize if already maximized (this will be done anyways) because titlebar click
            return;
        }

        if (this.onmaximize) this.onmaximize();
        this.oldstyle = this.element.getAttribute("style");
        console.log(this.oldstyle);
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        this.element.classList.add("maxtransition");
        this.element.style.top = "0";
        this.element.style.left = "0";
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height - 61}px`;
        setTimeout(() => {
            this.element.classList.remove("maxtransition");
        }, 200);

        this.maximizeImg.src = "/assets/window/restore.svg";

        this.justresized = true;
        this.maximized = true;
        this.onresize(this.width, this.height);
    }
    async unmaximize() {
        await sleep(10);
        if (this.snapped) {
            if (this.minimizing) {
                this.minimizing = false;
                return;
            }

            this.snapped = false;

            const thisSnappedWindow = snappedWindows.find(
                (x) => x.window == this,
            );

            snappedWindows.splice(
                snappedWindows.indexOf(thisSnappedWindow!),
                1,
            );

            WMSplitBar.prototype.cleanup();

            this.maximizeImg.src = "/assets/window/maximize.svg";

            this.element.setAttribute("style", this.oldstyle!);
            this.justresized = true;
            this.onresize(this.width, this.height);
            return;
        }

        if (this.onunmaximize) this.onunmaximize();
        console.log("restoring");
        this.element.classList.add("maxtransition");
        this.element.setAttribute("style", this.oldstyle!);
        setTimeout(() => {
            this.element.classList.remove("maxtransition");
        }, 200);
        this.maximizeImg.src = "/assets/window/maximize.svg";

        await sleep(10); // Race condition as a feature
        this.justresized = true;
        this.maximized = false;
        this.onresize(this.width, this.height);
    }
    async remaximize() {
        // Do not call the maximize event here, as we are just fixing the window size
        if (!(this.maximized || this.snapped)) {
            return;
        }
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        if (this.snapped) {
            splitBar?.splitWindowsAround(width / 2);
            this.element.style.height = `${height - 61}px`;
            return;
        }
        const oldwidth = parseFloat(this.element.style.width);
        const oldheight = parseFloat(this.element.style.height);
        // Determine if the change in size is higher than some threshold to prevent sluggish animations

        const animx =
            Math.abs(oldwidth - width) > 0.1 * Math.max(oldwidth, width);

        const animy =
            Math.abs(oldheight - height) > 0.1 * Math.max(oldheight, height);

        animx && this.element.classList.add("remaxtransitionx");
        animy && this.element.classList.add("remaxtransitiony");
        this.element.style.top = "0";
        this.element.style.left = "0";
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height - 61}px`;
        animx &&
            setTimeout(() => {
                this.element.classList.remove("remaxtransitionx");
            }, 200);
        animy &&
            setTimeout(() => {
                this.element.classList.remove("remaxtransitiony");
            }, 200);
    }
    minimize() {
        console.log(this.snapped);
        if (this.snapped) {
            const thisSnappedWindow = snappedWindows.find(
                (x) => x.window == this,
            );
            console.log(thisSnappedWindow);

            minimizedSnappedWindows.push(thisSnappedWindow!);
            snappedWindows.splice(
                snappedWindows.indexOf(thisSnappedWindow!),
                1,
            );
            WMSplitBar.prototype.cleanup();
        }

        this.element.classList.add("opacity0");
        // This is to make sure that you cannot interact with the window while it is minimized
        setTimeout(() => {
            this.element.style.display = "none";
        }, 200);
    }
    unminimize() {
        if (
            this.element.style.display != "none" ||
            !this.element.classList.contains("opacity0")
        ) {
            return;
        }
        if (this.snapped) {
            const thisSnappedWindow = minimizedSnappedWindows.find(
                (x) => x.window == this,
            );

            if (!thisSnappedWindow) {
                return;
            }

            snappedWindows.push(thisSnappedWindow);
            minimizedSnappedWindows.splice(
                minimizedSnappedWindows.indexOf(thisSnappedWindow),
                1,
            );

            const leftSnappedWindows = snappedWindows.filter(
                (x) => x.direction == "left",
            );

            const rightSnappedWindows = snappedWindows.filter(
                (x) => x.direction == "right",
            );

            if (thisSnappedWindow.direction == "left") {
                const otherLeftSnappedWindows = leftSnappedWindows.filter(
                    (x) => x.window != this,
                );

                otherLeftSnappedWindows.forEach((x) => {
                    x.window.minimize();
                });

                if (rightSnappedWindows.length == 1) {
                    WMSplitBar.prototype.cleanup(); // Just in case

                    const bar = new WMSplitBar(
                        this,
                        rightSnappedWindows[0]!.window,
                    );

                    const width =
                        window.innerWidth ||
                        document.documentElement.clientWidth ||
                        document.body.clientWidth;

                    bar.leftWindow.element.classList.add("remaxtransitionx");
                    bar.splitWindowsAround(width / 2 - 4);

                    setTimeout(() => {
                        bar.leftWindow.element.classList.remove(
                            "remaxtransitionx",
                        );
                    }, 200);
                }
            }

            if (thisSnappedWindow.direction == "right") {
                const otherRightSnappedWindows = rightSnappedWindows.filter(
                    (x) => x.window != this,
                );

                otherRightSnappedWindows.forEach((x) => {
                    x.window.minimize();
                });

                if (leftSnappedWindows.length == 1) {
                    WMSplitBar.prototype.cleanup(); // Just in case

                    const bar = new WMSplitBar(
                        leftSnappedWindows[0]!.window,
                        this,
                    );

                    const width =
                        window.innerWidth ||
                        document.documentElement.clientWidth ||
                        document.body.clientWidth;

                    bar.leftWindow.element.classList.add("remaxtransitionx");
                    bar.splitWindowsAround(width / 2 - 4);

                    setTimeout(() => {
                        bar.leftWindow.element.classList.remove(
                            "remaxtransitionx",
                        );
                    });
                }
            }
        }
        this.element.style.display = "";
        setTimeout(() => {
            this.element.classList.remove("opacity0");
        }, 10);
    }

    snap(snapDirection: "left" | "right" | "top") {
        this.oldstyle = this.element.getAttribute("style");

        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        let scaledWidth = width;

        if (snapDirection != "top") {
            scaledWidth = width / 2;
            snappedWindows.forEach((x) => {
                if (x.direction == snapDirection) {
                    x.window.minimize();
                }
            });
            snappedWindows.push({
                window: this,
                direction: snapDirection,
            });
        }

        if (
            snappedWindows.length == 2 &&
            !splitBar &&
            snapDirection != "top" &&
            snappedWindows[0]?.direction != snappedWindows[1]?.direction
        ) {
            const bar = new WMSplitBar(
                snappedWindows.find((x) => x.direction == "left")!.window,
                snappedWindows.find((x) => x.direction == "right")!.window,
            );

            bar.splitWindowsAround(width / 2 - 4);

            setTimeout(() => {
                bar.leftWindow.element.classList.remove("remaxtransitionx");
            }, 200);
        }

        console.log("calling onSnap", this.onsnap);
        if (this.onsnap) this.onsnap(snapDirection);

        switch (snapDirection) {
            case "left":
                this.element.style.top = "0px";
                this.element.style.left = "0px";
                break;
            case "right":
                this.element.style.top = "0px";
                this.element.style.left = scaledWidth + "px";
                break;
            case "top":
                this.maximize();
                this.dragging = false;
                return;
        }

        this.element.style.width = scaledWidth - 4 + "px";
        this.element.style.height = height - 61 + "px";
        this.onresize(this.width, this.height);
        this.dragging = false;

        this.maximizeImg.src = "/assets/window/restore.svg";
        this.snapped = true;
    }

    getSnapDirection(
        forceX: number,
        forceY: number,
    ): "left" | "right" | "top" | null {
        if (forceX > 20) {
            if (this.element.offsetLeft == 0) {
                // Snap to left
                return "left";
            }
            // Snap to right
            return "right";
        }
        if (forceY > 20 && this.element.offsetTop == 0) {
            // Snap to top
            return "top";
        }
        return null;
    }

    getSnapDirectionFromPosition(
        left: number,
        width: number,
    ): "left" | "right" | null {
        if (left == 0) {
            return "left";
        }
        const windowWidth =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        if (left + width == windowWidth) {
            return "right";
        }
        console.log(left, width, windowWidth);
        return null;
    }

    snapPreview(side: "left" | "right" | "top") {
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        let scaledWidth = width;
        let scaledHeight = height;

        if (side != "top") {
            scaledWidth = width / 2 + 4;
        }
        scaledHeight = height - 61;

        const elem = (
            <div
                class={`snapPreview-${side}`}
                id="snapPreview"
                style={`${side}: 0px; width: ${scaledWidth}px; height: ${scaledHeight}px; opacity: 0;`}
            ></div>
        );

        setTimeout(() => {
            elem.style.opacity = null;
        }, 10);

        return elem;
    }
}

class WMSplitBar {
    dragging = false;
    mouseLeft: number;
    originalLeft: number;
    leftWindow: WMWindow;
    rightWindow: WMWindow;

    element = (
        <div
            id="snapSplitBar"
            style={`background-color: rgba(0, 0, 0, 0)`}
            on:mouseover={() => {
                this.fadeIn();
            }}
            on:mouseout={() => {
                this.fadeOut();
            }}
            on:mousedown={(evt: MouseEvent) => {
                deactivateFrames();

                this.dragging = true;
                this.mouseLeft = evt.clientX;
                this.originalLeft = this.element.offsetLeft;
            }}
            on:mouseup={(evt: MouseEvent) => {
                reactivateFrames();

                if (this.dragging) {
                    this.handleDrag(evt);
                    this.dragging = false;
                }
            }}
        >
            <div></div>
        </div>
    );

    cleanup() {
        if (splitBar) {
            splitBar.instantRemove();
            splitBar = null;
        }
    }

    constructor(leftWindow: WMWindow, rightWindow: WMWindow) {
        this.cleanup();
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        splitBar = this;
        this.leftWindow = leftWindow;
        this.rightWindow = rightWindow;
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        this.element.style.left = width / 2 - 4 + "px";
        document.body.appendChild(this.element);
        setTimeout(() => {
            this.element.style.backgroundColor = null;
        }, 10);
        document.addEventListener("mousemove", (evt) => {
            if (this.dragging) {
                this.handleDrag(evt);
            }
        });
    }

    handleDrag(evt: MouseEvent) {
        this.splitWindowsAround(
            this.originalLeft + evt.clientX - this.mouseLeft,
        );
    }

    splitWindowsAround(x: number) {
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        this.element.style.left = x + "px";
        this.leftWindow.element.style.width = x + "px";
        this.leftWindow.element.style.left = "0px";
        this.rightWindow.element.style.width = width - x - 4 + "px";
        this.rightWindow.element.style.left = x + 4 + "px";
    }

    fadeIn() {
        this.element.style.backgroundColor = "rgba(0, 0, 0, 1)";
    }

    fadeOut() {
        this.element.style.backgroundColor = null;
    }

    remove() {
        this.dragging = false;
        this.element.style.backgroundColor = "rgba(0, 0, 0, 0)";
        setTimeout(() => {
            this.element.remove();
        }, 200);
    }

    instantRemove() {
        this.dragging = false;
        this.element.remove();
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
            resizable: true,
        };
        // Param given in argument
        if (typeof givenWinInfo == "object") wininfo = givenWinInfo;

        if (typeof givenWinInfo == "string")
            // Only title given
            wininfo.title = givenWinInfo;

        const win = new WMWindow(wininfo);
        document.body.appendChild(win.element);
        win.focus();
        center(win.element);
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
