
/**
 * the purpose of the following code is to give a demo of
 * how to realize the floating dialog using javascript.
 * It was written without any consideration of cross-browser compatibility,
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
let windowInformation = {}
let windowID = 0;

class ContainerData {
    _dragging: boolean;
    _originalLeft: number;
    _originalTop: number;
    _mouseLeft: number;
    _mouseTop: number;
}

class WindowInformation {
    title: string;
    width: string;
    height: string;
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

    mouseLeft: number;
    mouseTop: number;

    justresized = false;

    mouseover = false;



    maximizeImg: HTMLImageElement;
    constructor(wininfo: WindowInformation) {
        this.element =
            <div class="aliceWMwin" style={`
                    resize: both;
                    width: ${wininfo.width};
                    height: ${wininfo.height};
                `}
                observe:Resize={() => {
                    if (this.justresized) {
                        this.justresized = false;
                        return;
                    }
                    if (this.maximized) {
                        this.unmaximize();
                    }
                }}
                on:mouseover={() => {
                    this.mouseover = true;
                }}
                on:mouseout={() => {
                    this.mouseover = false;
                }}
                on:mousedown={this.focus.bind(this)}>
                <style scoped>

                </style>
                <div class="title"
                    on:mousedown={(evt: MouseEvent) => {

                        var i, frames;
                        frames = document.getElementsByTagName("iframe");
                        for (i = 0; i < frames.length; ++i) {
                            anura.logger.debug(frames[i])
                            frames[i]!.style.pointerEvents = 'none'
                        }

                        this.dragging = true;
                        this.originalLeft = this.element.offsetLeft;
                        this.originalTop = this.element.offsetTop;
                        this.mouseLeft = evt.clientX;
                        this.mouseTop = evt.clientY;
                    }}
                    on:mouseup={(evt: MouseEvent) => {
                        var i, frames;
                        frames = document.getElementsByTagName("iframe");
                        for (i = 0; i < frames.length; ++i) {
                            frames[i]!.style.pointerEvents = 'auto'
                        }

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
                    }}>
                    <div class="titleContent">{wininfo.title}</div>

                    <button class="windowButton">
                        <img src="/assets/window/minimize.svg" on:click={() => {
                            if (wininfo.allowMultipleInstance) {
                                new anura.notification({
                                    title: "Cannot minimize",
                                    description: "minimizing isn't implimented on Multi-Instance windows"
                                }).show()
                                return;
                            }
                            this.element.style.display = 'none'
                        }} height="12px" class="windowButtonIcon" />
                    </button>

                    <button class="windowButton">
                        <img src="/assets/window/maximize.svg" bind:maximizeImg={this} on:click={this.maximize.bind(this)} height="12px" class="windowButtonIcon" />
                    </button>
                    <button class="windowButton">
                        <img src="/assets/window/close.svg" on:click={this.close.bind(this)} height="12px" class="windowButtonIcon" />
                    </button>

                </div>
                <div class="content" bind:content={this} style="width: 100%; padding:0; margin:0;"></div>
            </div>

        document.addEventListener('mousemove', (evt) => {

            if (this.dragging) {
                this.handleDrag(evt);
            }
        })

        // a very elegant way of detecting if the user clicked on an iframe inside of the window. credit to https://gist.github.com/jaydson/1780598
        window.addEventListener("blur", () => {
            if (this.mouseover) {
                this.focus();
            }
        })

        // finish the dragging when release the mouse button
        document.addEventListener('mouseup', (evt) => {
            var i, frames;
            frames = document.getElementsByTagName("iframe");
            for (i = 0; i < frames.length; ++i) {
                frames[i]!.style.pointerEvents = 'auto'
            }
            evt = evt || window.event;

            if (this.dragging) {
                this.handleDrag(evt);

                this.dragging = false;
            }
        });
    }
    handleDrag(evt: MouseEvent) {
        this.element.style.left =
            Math.min(window.innerWidth, Math.max(0, this.originalLeft + evt.clientX! - this.mouseLeft)) + "px";
        this.element.style.top =
            Math.min(window.innerHeight, Math.max(0, this.originalTop + evt.clientY! - this.mouseTop)) + "px";

        if (this.maximized) {
            this.unmaximize()
            this.originalLeft = this.element.offsetLeft;
            this.originalTop = this.element.offsetTop;
            this.mouseLeft = evt.clientX;
            this.mouseTop = evt.clientY;
        }
    }

    focus() {
        this.element.style.setProperty("z-index", (getHighestZindex() + 1).toString());
        normalizeZindex()


    }
    close() {
        this.element.remove()
    }
    togglemaximize() {
        if (!this.maximized) {
            this.maximize()
        } else {
            this.unmaximize()
        }
    }
    maximize() {
        this.oldstyle = this.element.getAttribute("style");
        const width = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
        const height = window.innerHeight || document.documentElement.clientHeight ||
            document.body.clientHeight;

        this.element.style.top = "0"
        this.element.style.left = "0"
        this.element.style.width = `${width}px`;
        this.element.style.height = `${height - 53}px`;

        this.maximizeImg.src = "/assets/window/restore.svg";


        this.justresized = true;
        this.maximized = true;
    }
    unmaximize() {

        this.element.setAttribute("style", this.oldstyle!);
        this.maximizeImg.src = "/assets/window/maximize.svg";

        this.justresized = true;
        this.maximized = false;
    }
    minimize() {

    }


}


var AliceWM = {
    create: function(givenWinInfo: string | WindowInformation) { // CODE ORIGINALLY FROM https://gist.github.com/chwkai/290488
        // Default param
        let wininfo: WindowInformation = {
            title: "",
            width: '1000px',
            height: '500px',
            allowMultipleInstance: false
        }
        // Param given in argument
        if (typeof (givenWinInfo) == 'object')
            wininfo = givenWinInfo;

        if (typeof (givenWinInfo) == 'string') // Only title given
            wininfo.title = givenWinInfo

        let win = new WMWindow(wininfo);
        document.body.appendChild(win.element);
        return win;

    }
}
function handleDrag(container: HTMLDivElement, containerData: ContainerData, evt: MouseEventInit) {
    container.style.left =
        Math.min(window.innerWidth, Math.max(0, containerData._originalLeft + evt.clientX! - containerData._mouseLeft)) + "px";
    container.style.top =
        Math.min(window.innerHeight, Math.max(0, containerData._originalTop + evt.clientY! - containerData._mouseTop)) + "px";
}


function getHighestZindex() {
    const allWindows: HTMLElement[] = Array.from(document.querySelectorAll<HTMLTableElement>(".aliceWMwin"))
    anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge

    let highestZindex = 0
    for (const wmwindow of allWindows) {
        if (Number(wmwindow.style.getPropertyValue("z-index")) >= highestZindex)
            highestZindex = Number(wmwindow.style.getPropertyValue("z-index"))
    }
    return highestZindex
}

async function normalizeZindex() {
    const allWindows: HTMLElement[] = Array.from(document.querySelectorAll<HTMLTableElement>(".aliceWMwin"))
    anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge

    let lowestZindex = 9999
    for (const wmwindow of allWindows) {
        if (Number(wmwindow.style.getPropertyValue("z-index")) <= lowestZindex)
            lowestZindex = Number(wmwindow.style.getPropertyValue("z-index"))
    }

    let normalizeValue = lowestZindex - 1;

    for (const wmwindow of allWindows) {

        wmwindow.style.setProperty("z-index", (Number(wmwindow.style.getPropertyValue("z-index")) - normalizeValue).toString())

    }
}

/**
 * place the given dom element in the center of the browser window
 * @param {Object} element
 */
function center(element: HTMLElement) {
    if (element) {
        element.style.left = (window.innerWidth - element.offsetWidth) / 2 + "px";
        element.style.top = (window.innerHeight - element.offsetHeight) / 2 + "px";
    }
}

/**
 * callback function for the dialog closed event
 * @param {Object} container
 */
