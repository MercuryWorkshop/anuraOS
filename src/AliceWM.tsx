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
    direction: "left" | "right" | "ne" | "nw" | "se" | "sw";
};

const minimizedSnappedWindows: SnappedWindow[] = [];

const snappedWindows: SnappedWindow[] = [];

let splitBar: WMSplitBar | null = null;

class WindowInformation {
    title: string;
    height: string;
    width: string;
    minwidth: number;
    minheight: number;
    resizable: boolean;
}

class WMWindow extends EventTarget implements Process {
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

    onfocus: () => void = () => {};
    onresize: (w: number, h: number) => void = () => {};
    onclose: () => void = () => {};
    onmaximize: () => void = () => {};
    onsnap: (
        snapDirection: "left" | "right" | "top" | "ne" | "nw" | "se" | "sw",
    ) => void = () => {};
    onunmaximize: () => void = () => {};

    snapped = false;

    clampWindows: boolean;

    justresized = false;

    minimizing = false;

    mouseover = false;

    get title() {
        if (!this.state.title && this.app) {
            return this.app.name;
        }
        return this.state.title;
    }

    set title(title: string) {
        this.state.title = title;
    }

    maximizeImg: HTMLImageElement;
    constructor(
        wininfo: WindowInformation,
        public app?: App,
    ) {
        super();
        this.wininfo = wininfo;
        this.state = $state({
            title: wininfo.title,
        });
        this.resizable = wininfo.resizable;
        if (this.resizable === undefined) {
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
                    ${anura.platform.type === "mobile" || anura.platform.type === "tablet" ? "top: 5px!important; left: 5px!important;" : ""}
                `}
                on:pointerover={() => {
                    this.mouseover = true;
                }}
                on:pointerout={() => {
                    this.mouseover = false;
                }}
                on:pointerdown={this.focus.bind(this)}
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
                    on:pointerdown={(evt: PointerEvent) => {
                        deactivateFrames();

                        if (
                            anura.platform.type !== "mobile" &&
                            anura.platform.type !== "tablet"
                        ) {
                            this.dragging = true;
                            this.originalLeft = this.element.offsetLeft;
                            this.originalTop = this.element.offsetTop;
                            this.mouseLeft = evt.clientX;
                            this.mouseTop = evt.clientY;
                        }
                    }}
                    on:pointerup={(evt: PointerEvent) => {
                        reactivateFrames();

                        if (this.dragging) {
                            this.handleDrag(evt);
                            this.dragging = false;
                        }
                    }}
                    on:dblclick={() => {
                        this.maximize();
                    }}
                    on:pointermove={(evt: PointerEvent) => {
                        // do the dragging during the mouse move

                        if (this.dragging) {
                            this.handleDrag(evt);
                        }
                    }}
                >
                    <div class="titleContent">{use(this.state.title)}</div>

                    <button
                        class="windowButton minimize"
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
                        class="windowButton maximize"
                        on:click={this.maximize.bind(this)}
                    >
                        {
                            (this.maximizeImg = (
                                <img
                                    src="/assets/window/maximize.svg"
                                    height="12px"
                                    class="windowButtonIcon"
                                />
                            ) as HTMLImageElement)
                        }
                    </button>
                    <button
                        class="windowButton close"
                        on:click={this.close.bind(this)}
                    >
                        <img
                            src="/assets/window/close.svg"
                            height="12px"
                            class="windowButtonIcon"
                        />
                    </button>
                </div>
                {
                    (this.content = (
                        <div
                            class="content"
                            style="width: 100%; padding:0; margin:0;"
                        ></div>
                    ))
                }
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

        document.addEventListener("pointermove", (evt: PointerEvent) => {
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
        document.addEventListener("pointerup", (evt: PointerEvent) => {
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
            currentResizer.addEventListener(
                "pointerdown",
                (e: PointerEvent) => {
                    e.preventDefault();
                    if (
                        anura.platform.type === "mobile" ||
                        anura.platform.type === "tablet"
                    )
                        return;
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
                    window.addEventListener("pointermove", resize);

                    window.addEventListener("pointerup", () => {
                        reactivateFrames();
                        window.removeEventListener("pointermove", resize);
                        if (!sentResize) {
                            this.dispatchEvent(
                                new MessageEvent("resize", {
                                    data: {
                                        width: this.width,
                                        height: this.height,
                                    },
                                }),
                            );
                            // TODO: Sometimes attempting to resize just does nothing?
                            // This if statement blocks against an error being spit out, but there is a bug here
                            if (typeof this.onresize === "function") {
                                this.onresize(this.width, this.height);
                                sentResize = true;
                            }
                        }
                    });
                },
            );

            const resize = (e: PointerEvent) => {
                this.dragForceX = 0;
                this.dragForceY = 0;

                const pageX = e.pageX;
                const pageY = e.pageY;

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
                        (direction === "left" &&
                            !currentResizer.classList.contains("right")) ||
                        (direction === "right" &&
                            !currentResizer.classList.contains("left"))
                    ) {
                        return;
                    }
                }
                if (currentResizer.classList.contains("bottom-right")) {
                    const width = original_width + (pageX - original_mouse_x);
                    const height = original_height + (pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                    }
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                    }
                } else if (currentResizer.classList.contains("bottom-left")) {
                    const height = original_height + (pageY - original_mouse_y);
                    const width = original_width - (pageX - original_mouse_x);
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                    }
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                        this.element.style.left =
                            original_x + (pageX - original_mouse_x) + "px";
                    }
                } else if (currentResizer.classList.contains("top-right")) {
                    const width = original_width + (pageX - original_mouse_x);
                    const height = original_height - (pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                    }
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                        this.element.style.top =
                            original_y + (pageY - original_mouse_y) + "px";
                    }
                } else if (currentResizer.classList.contains("top-left")) {
                    const width = original_width - (pageX - original_mouse_x);
                    const height = original_height - (pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                        this.element.style.left =
                            original_x + (pageX - original_mouse_x) + "px";
                    }
                    if (height > minimum_size) {
                        this.element.style.height = height + "px";
                        this.element.style.top =
                            original_y + (pageY - original_mouse_y) + "px";
                    }
                } else if (currentResizer.classList.contains("left")) {
                    const width = original_width - (pageX - original_mouse_x);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                        this.element.style.left =
                            original_x + (pageX - original_mouse_x) + "px";
                    }
                } else if (currentResizer.classList.contains("right")) {
                    const width = original_width + (pageX - original_mouse_x);
                    if (width > minimum_size) {
                        this.element.style.width = width + "px";
                    }
                } else if (currentResizer.classList.contains("top")) {
                    const width = original_height - (pageY - original_mouse_y);
                    if (width > minimum_size) {
                        this.element.style.height = width + "px";
                        this.element.style.top =
                            original_y + (pageY - original_mouse_y) + "px";
                    }
                } else if (currentResizer.classList.contains("bottom")) {
                    const height = original_height + (pageY - original_mouse_y);
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

        if (!anura.settings.get("disable-animation"))
            this.element.classList.add("scaletransition");

        if (
            anura.platform.type === "mobile" ||
            anura.platform.type === "tablet"
        ) {
            this.maximize();
        }

        setTimeout(() => this.element.classList.remove("opacity0"), 10);

        this.pid = anura.processes.state.procs.length;
        anura.processes.register(this);
    }

    handleDrag(evt: PointerEvent) {
        const clientX = evt.clientX;
        const clientY = evt.clientY;

        const offsetX = this.originalLeft + clientX! - this.mouseLeft;
        const offsetY = this.originalTop + clientY! - this.mouseTop;

        if (this.clampWindows) {
            const newOffsetX = Math.min(
                window.innerWidth - this.element.clientWidth,
                Math.max(0, offsetX),
            );

            const newOffsetY = Math.min(
                window.innerHeight - 49 - this.element.clientHeight,
                Math.max(0, offsetY),
            );

            this.element.style.left = newOffsetX + "px";
            this.element.style.top = newOffsetY + "px";

            if (offsetX !== newOffsetX || offsetY !== newOffsetY) {
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
                        if (direction !== snapDirection) {
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
            this.mouseLeft = clientX;
            this.mouseTop = clientY;
        }
    }

    focus() {
        this.element.style.setProperty(
            "z-index",
            (getHighestZindex() + 1).toString(),
        );
        normalizeZindex();
        this.dispatchEvent(new Event("focus"));
        this.onfocus();
    }
    close() {
        anura.processes.remove(this.pid);
        if (!anura.settings.get("disable-animation"))
            this.element.classList.add("scaletransition");

        this.dispatchEvent(new Event("close"));
        this.onclose();
        this.element.classList.add("opacity0");
        setTimeout(() => {
            this.element.remove();
            // TODO, Remove this and make it an event
            anura.removeStaleApps();
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

        this.dispatchEvent(new Event("maximize"));
        this.onmaximize();
        this.oldstyle = this.element.getAttribute("style");
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;

        if (!anura.settings.get("disable-animation"))
            this.element.classList.add("maxtransition");
        this.element.classList.add("scaletransition");

        this.element.style.top = "0";
        this.element.style.left = "0";
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height - 49}px`;

        if (!anura.settings.get("disable-animation"))
            setTimeout(() => {
                this.element.classList.remove("maxtransition");
                this.element.classList.remove("scaletransition");
            }, 200);

        this.maximizeImg.src = "/assets/window/restore.svg";

        this.justresized = true;
        this.maximized = true;
        this.dispatchEvent(
            new MessageEvent("resize", {
                data: { width: this.width, height: this.height },
            }),
        );
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
                (x) => x.window === this,
            );

            snappedWindows.splice(
                snappedWindows.indexOf(thisSnappedWindow!),
                1,
            );

            WMSplitBar.prototype.cleanup();

            this.maximizeImg.src = "/assets/window/maximize.svg";

            this.element.setAttribute("style", this.oldstyle!);
            this.justresized = true;
            this.dispatchEvent(
                new MessageEvent("resize", {
                    data: { width: this.width, height: this.height },
                }),
            );
            this.onresize(this.width, this.height);
            return;
        }

        this.dispatchEvent(new Event("unmaximize"));
        this.onunmaximize();
        if (!anura.settings.get("disable-animation"))
            this.element.classList.add("maxtransition");
        this.element.classList.add("scaletransition");
        this.element.setAttribute("style", this.oldstyle!);
        if (!anura.settings.get("disable-animation"))
            setTimeout(() => {
                this.element.classList.remove("maxtransition");
                this.element.classList.remove("scaletransition");
            }, 200);
        this.maximizeImg.src = "/assets/window/maximize.svg";

        await sleep(10); // Race condition as a feature
        this.justresized = true;
        this.maximized = false;
        this.dispatchEvent(
            new MessageEvent("resize", {
                data: { width: this.width, height: this.height },
            }),
        );
        this.onresize(this.width, this.height);
    }
    async remaximize() {
        // Do not call the maximize event here, as we are just fixing the window size
        if (!(this.maximized || this.snapped)) {
            return;
        }
        const width =
            (window.innerWidth ||
                document.documentElement.clientWidth ||
                document.body.clientWidth) - 4;
        const height =
            window.innerHeight ||
            document.documentElement.clientHeight ||
            document.body.clientHeight;
        if (this.snapped) {
            splitBar?.splitWindowsAround(width / 2);
            this.element.style.height = `${height - 49}px`;
            return;
        }
        const oldwidth = parseFloat(this.element.style.width);
        const oldheight = parseFloat(this.element.style.height);
        // Determine if the change in size is higher than some threshold to prevent sluggish animations

        const animx =
            Math.abs(oldwidth - width) > 0.1 * Math.max(oldwidth, width) &&
            !anura.settings.get("disable-animation");

        const animy =
            Math.abs(oldheight - height) > 0.1 * Math.max(oldheight, height) &&
            !anura.settings.get("disable-animation");

        animx && this.element.classList.add("remaxtransitionx");
        animy && this.element.classList.add("remaxtransitiony");
        this.element.style.top = "0";
        this.element.style.left = "0";
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height - 49}px`;
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
        if (this.snapped) {
            const thisSnappedWindow = snappedWindows.find(
                (x) => x.window === this,
            );
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
            this.element.style.display !== "none" ||
            !this.element.classList.contains("opacity0")
        ) {
            return;
        }
        if (this.snapped) {
            const thisSnappedWindow = minimizedSnappedWindows.find(
                (x) => x.window === this,
            );

            if (!thisSnappedWindow) {
                this.snapped = false;
                this.unminimize();
                return;
            }

            snappedWindows.push(thisSnappedWindow);
            minimizedSnappedWindows.splice(
                minimizedSnappedWindows.indexOf(thisSnappedWindow),
                1,
            );

            const leftSnappedWindows = snappedWindows.filter(
                (x) => x.direction === "left",
            );

            const rightSnappedWindows = snappedWindows.filter(
                (x) => x.direction === "right",
            );

            if (thisSnappedWindow.direction === "left") {
                const otherLeftSnappedWindows = leftSnappedWindows.filter(
                    (x) => x.window !== this,
                );

                otherLeftSnappedWindows.forEach((x) => {
                    x.window.minimize();
                });

                if (rightSnappedWindows.length === 1) {
                    WMSplitBar.prototype.cleanup(); // Just in case

                    const bar = new WMSplitBar(
                        this,
                        rightSnappedWindows[0]!.window,
                    );

                    const width =
                        window.innerWidth ||
                        document.documentElement.clientWidth ||
                        document.body.clientWidth;

                    if (!anura.settings.get("disable-animation"))
                        bar.leftWindow.element.classList.add(
                            "remaxtransitionx",
                        );

                    bar.splitWindowsAround(width / 2);

                    if (!anura.settings.get("disable-animation"))
                        setTimeout(() => {
                            bar.leftWindow.element.classList.remove(
                                "remaxtransitionx",
                            );
                        }, 200);
                }
            }

            if (thisSnappedWindow.direction === "right") {
                const otherRightSnappedWindows = rightSnappedWindows.filter(
                    (x) => x.window !== this,
                );

                otherRightSnappedWindows.forEach((x) => {
                    x.window.minimize();
                });

                if (leftSnappedWindows.length === 1) {
                    WMSplitBar.prototype.cleanup(); // Just in case

                    const bar = new WMSplitBar(
                        leftSnappedWindows[0]!.window,
                        this,
                    );

                    const width =
                        window.innerWidth ||
                        document.documentElement.clientWidth ||
                        document.body.clientWidth;
                    if (!anura.settings.get("disable-animation"))
                        bar.leftWindow.element.classList.add(
                            "remaxtransitionx",
                        );
                    bar.splitWindowsAround(width / 2);

                    if (!anura.settings.get("disable-animation"))
                        setTimeout(() => {
                            bar.leftWindow.element.classList.remove(
                                "remaxtransitionx",
                            );
                        });
                }
            }
        }
        this.element.style.display = "";
        if (!anura.settings.get("disable-animation"))
            this.element.classList.add("scaletransition");

        setTimeout(() => {
            this.element.classList.remove("opacity0");
        }, 10);
    }

    snap(snapDirection: "left" | "right" | "top" | "ne" | "nw" | "se" | "sw") {
        this.dragging = false;
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

        if (snapDirection !== "top") {
            scaledWidth = width / 2;
            snappedWindows.forEach((x) => {
                if (x.direction === snapDirection) {
                    x.window.minimize();
                }
            });
            snappedWindows.push({
                window: this,
                direction: snapDirection,
            });
        }

        if (
            snappedWindows.find((x) => x.direction === "left") &&
            snappedWindows.find((x) => x.direction === "right") &&
            !splitBar &&
            snapDirection !== "top" &&
            snappedWindows[0]?.direction !== snappedWindows[1]?.direction
        ) {
            const bar = new WMSplitBar(
                snappedWindows.find((x) => x.direction === "left")!.window,
                snappedWindows.find((x) => x.direction === "right")!.window,
            );

            bar.splitWindowsAround(width / 2);
            if (!anura.settings.get("disable-animation"))
                setTimeout(() => {
                    bar.leftWindow.element.classList.remove("remaxtransitionx");
                }, 200);
        }
        this.dispatchEvent(
            new MessageEvent("snap", {
                data: { snapDirection: snapDirection },
            }),
        );
        this.onsnap(snapDirection);
        switch (snapDirection) {
            case "left":
                this.element.style.width = scaledWidth - 4 + "px";
                this.element.style.height = height - 49 + "px";
                this.element.style.top = "0px";
                this.element.style.left = "0px";
                break;
            case "right":
                this.element.style.width = scaledWidth - 4 + "px";
                this.element.style.height = height - 49 + "px";
                this.element.style.top = "0px";
                this.element.style.left = scaledWidth + "px";
                break;
            case "top":
                this.maximize();
                this.dragging = false;
                return;
            case "ne":
                this.element.style.width = width / 2 + "px";
                this.element.style.height = (height - 49) / 2 + "px";
                this.element.style.top = "0px";
                this.element.style.left =
                    width - this.element.clientWidth + "px";
                break;
            case "nw":
                this.element.style.width = width / 2 + "px";
                this.element.style.height = (height - 49) / 2 + "px";
                this.element.style.top = "0px";
                this.element.style.left = "0px";
                break;
            case "se":
                this.element.style.width = width / 2 + "px";
                this.element.style.height = (height - 49) / 2 + "px";
                this.element.style.top =
                    height - 49 - this.element.clientHeight + "px";
                this.element.style.left =
                    width - this.element.clientWidth + "px";
                break;
            case "sw":
                this.element.style.width = width / 2 + "px";
                this.element.style.height = (height - 49) / 2 + "px";
                this.element.style.top =
                    height - 49 - this.element.clientHeight + "px";
                this.element.style.left = "0px";
                break;
        }

        this.dispatchEvent(
            new MessageEvent("resize", {
                data: { width: this.width, height: this.height },
            }),
        );
        this.onresize(this.width, this.height);

        this.maximizeImg.src = "/assets/window/restore.svg";
        this.snapped = true;
    }

    getSnapDirection(
        forceX: number,
        forceY: number,
    ): "left" | "right" | "top" | "ne" | "nw" | "se" | "sw" | null {
        if (forceX > 20 && forceY > 20) {
            if (this.element.offsetLeft === 0 && this.element.offsetTop === 0) {
                return "nw";
            }
            if (
                this.element.offsetLeft + this.element.clientWidth ===
                    window.innerWidth &&
                this.element.offsetTop === 0
            ) {
                return "ne";
            }
            if (
                this.element.offsetTop + this.element.clientHeight ==
                    window.innerHeight - 49 &&
                this.element.offsetLeft == 0
            ) {
                return "sw";
            }
            if (
                this.element.offsetTop + this.element.clientHeight ==
                    window.innerHeight - 49 &&
                this.element.offsetLeft + this.element.clientWidth ==
                    window.innerWidth
            ) {
                return "se";
            }
        }

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
    ): "left" | "right" | "top" | "ne" | "nw" | "se" | "sw" | null {
        if (left === 0) {
            return "left";
        }
        const windowWidth =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        if (left + width === windowWidth) {
            return "right";
        }
        return null;
    }

    snapPreview(side: "left" | "right" | "top" | "ne" | "nw" | "se" | "sw") {
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

        if (side !== "top") {
            scaledWidth = width / 2;
        }

        if (["ne", "nw", "se", "sw"].includes(side)) {
            scaledWidth = width / 2;
            scaledHeight = (height - 49) / 2;
        }

        let previewSide = side;

        if (["ne", "se"].includes(side)) {
            previewSide = "right";
        } else if (["nw", "sw"].includes(side)) {
            previewSide = "left";
        }

        const elem: DLElement<any> = (
            <div
                class={`snapPreview-${side}`}
                id="snapPreview"
                style={`${previewSide}: 0px; width: ${scaledWidth}px; height: ${scaledHeight}px; opacity: 0; `}
            ></div>
        );

        setTimeout(() => {
            elem.style.removeProperty("opacity");
        }, 10);

        return elem;
    }

    pid: number;

    stdout: ReadableStream<Uint8Array> = new ReadableStream();
    stdin: WritableStream<Uint8Array> = new WritableStream();
    stderr: ReadableStream<Uint8Array> = new ReadableStream();

    kill = this.close;

    get alive() {
        return this.element.isConnected;
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
            on:pointerdown={(evt: PointerEvent) => {
                deactivateFrames();

                this.dragging = true;
                this.mouseLeft = evt.clientX;
                this.originalLeft = this.element.offsetLeft;
            }}
            on:pointerup={(evt: PointerEvent) => {
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
        this.element.style.zIndex = getHighestZindex() + "";
        document.body.appendChild(this.element);
        setTimeout(() => {
            this.element.style.removeProperty("background-color");
        }, 10);
        document.addEventListener("pointermove", (evt) => {
            if (this.dragging) {
                this.handleDrag(evt);
            }
        });
    }

    handleDrag(evt: PointerEvent) {
        this.splitWindowsAround(
            // Add 4 to account for the center of the bar
            this.originalLeft + evt.clientX - this.mouseLeft + 4,
        );
    }

    splitWindowsAround(x: number) {
        const width =
            window.innerWidth ||
            document.documentElement.clientWidth ||
            document.body.clientWidth;
        // Subtract 4 to account for the center of the bar
        this.element.style.left = x - 4 + "px";
        this.leftWindow.element.style.width = x - 4 + "px";
        this.leftWindow.element.style.left = "0px";
        this.rightWindow.element.style.width = width - x - 4 + "px";
        this.rightWindow.element.style.left = x + "px";
    }

    fadeIn() {
        this.element.style.backgroundColor = "rgba(0, 0, 0, 1)";
    }

    fadeOut() {
        this.element.style.removeProperty("background-color");
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

// eslint-disable-next-line prefer-const
let AliceWM = {
    create: function (givenWinInfo: string | WindowInformation, app?: App) {
        // Default param
        let wininfo: WindowInformation = {
            title: "",
            minheight: 40,
            minwidth: 40,
            width: "1000px",
            height: "500px",
            resizable: true,
        };
        // Param given in argument
        if (typeof givenWinInfo == "object") wininfo = givenWinInfo;

        if (typeof givenWinInfo == "string")
            // Only title given
            wininfo.title = givenWinInfo;

        const win = new WMWindow(wininfo, app);
        document.body.appendChild(win.element);
        win.focus();
        if (
            anura.platform.type !== "mobile" &&
            anura.platform.type !== "tablet"
        ) {
            center(win.element);
        }
        return win;
    },
};

function deactivateFrames() {
    let i;
    const frames = document.getElementsByTagName("iframe");
    for (i = 0; i < frames.length; ++i) {
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
