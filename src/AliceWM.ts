
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
}
var AliceWM = {
 create: function(givenWinInfo: string | WindowInformation) { // CODE ORIGINALLY FROM https://gist.github.com/chwkai/290488
    // Default param
    let wininfo: WindowInformation = {
        title: "",
        width: '1000px',
        height: '500px',
    }

    // Param given in argument
    if (givenWinInfo instanceof WindowInformation)
        wininfo = givenWinInfo;

    if (typeof (givenWinInfo) == 'string') // Only title given
        wininfo.title = givenWinInfo
    

    anura.logger.debug(typeof (givenWinInfo))
   
    
    // initializing dialog: title, close, content
    var container = document.createElement("div");
    var containerData = new ContainerData()

    var titleContainer = document.createElement("div");
    var titleContent = document.createElement("div");

    var contentContainer = document.createElement("div");
    var closeContainer = document.createElement("button");
    var maximizeContainer = document.createElement("button");
    var minimizeContainer = document.createElement("button");

    container.setAttribute("maximized", "false") 
    container.setAttribute("class", "aliceWMwin");
    container.setAttribute("id", "Window"+windowID)
    // container.setAttribute("style", "resize: both;")
    container.style.resize = 'both'
    container.style.height = wininfo.height
    container.style.width = wininfo.width

    titleContainer.setAttribute("class", "title");

    contentContainer.setAttribute("class", "content");
    contentContainer.setAttribute("style", "width: 100%; padding:0; margin:0; ")

    titleContent.setAttribute("class", "titleContent");
    titleContent.innerHTML = wininfo.title;

    closeContainer.setAttribute("class", "close");
    closeContainer.setAttribute("class", "windowButton");
    closeContainer.innerHTML = '<img src="/assets/window/close.svg" height="12px">';

    maximizeContainer.setAttribute("class", "maximize");
    maximizeContainer.setAttribute("class", "windowButton");
    maximizeContainer.innerHTML = '<img src="/assets/window/maximize.svg" height="12px">'

    minimizeContainer.setAttribute("class", "minimize");
    minimizeContainer.setAttribute("class", "windowButton");
    minimizeContainer.innerHTML = '<img src="/assets/window/minimize.svg" height="12px">';

    titleContainer.appendChild(titleContent);
    titleContainer.appendChild(minimizeContainer);
    titleContainer.appendChild(maximizeContainer);
    titleContainer.appendChild(closeContainer);

    container.appendChild(titleContainer);
    container.appendChild(contentContainer);
    document.body.appendChild(container);

    // place the container in the center of the browser window
    window.center(container);

    // binding mouse events
    closeContainer.onclick = function(evt) {
        // if (containerData._overlay) {
        //     containerData._overlay.parentNode.removeChild(containerData._overlay);
        // }

        container.parentNode!.removeChild(container);
        // calling the callback function to notify the dialog closed
        evt.stopPropagation();
    };
    // const ro = new ResizeObserver(entries => {
    //     container.setAttribute("maximized", "false")
    //     ro.unobserve(container);
    //   });
    
    maximizeContainer.onclick = function() {
        if (container.getAttribute("maximized") === "false") {
            container.setAttribute("old-style", container.getAttribute("style")!) 
            const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            const height = window.innerHeight|| document.documentElement.clientHeight|| 
            document.body.clientHeight;
            container.style.top = "0"
            container.style.left = "0"
            container.style.width = `${width}px`;
            container.style.height = `${height - 53}px`;
            container.setAttribute("maximized", "true") 
            maximizeContainer.innerHTML = '<img src="/assets/window/restore.svg" height="12px">'
            // ro.observe(container);
        } else {
            container.setAttribute("style", container.getAttribute("old-style")!)
            container.setAttribute("maximized", "false")
            maximizeContainer.innerHTML = '<img src="/assets/window/maximize.svg" height="12px">'
            // ro.unobserve(container);
        }

    };

    container.onresize = function() {
        anura.logger.debug("resized")
        container.setAttribute("maximized", "false")
    }



      

    // self explanatory everything is self explanatory
    container.onmousedown = function(evt) {

        (titleContainer.parentNode as HTMLElement)!.style.setProperty("z-index", (getHighestZindex() + 1).toString());
        normalizeZindex()

        // container.setAttribute("maximized", "false")
        // ro.unobserve(container);
    }

    // start dragging when the mouse clicked in the title area
    titleContainer.onmousedown = function(evt) {
        var i, frames;
        frames = document.getElementsByTagName("iframe");
        for (i = 0; i < frames.length; ++i) {
            anura.logger.debug(frames[i])
            frames[i]!.style.pointerEvents = 'none'
        }
        evt = evt || window.event;

        containerData._dragging = true;
        containerData._originalLeft = container.offsetLeft;
        containerData._originalTop = container.offsetTop;
        containerData._mouseLeft = evt.clientX;
        containerData._mouseTop = evt.clientY;
    };

    // do the dragging during the mouse move
    document.addEventListener('mousemove', (evt) => {
        evt = evt || window.event;

        if (containerData._dragging) {
            container.style.left =
                (containerData._originalLeft + evt.clientX - containerData._mouseLeft) + "px";
            container.style.top =
                (containerData._originalTop + evt.clientY - containerData._mouseTop) + "px";
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

        if (containerData._dragging) {
            container.style.left =
                (containerData._originalLeft + evt.clientX - containerData._mouseLeft) + "px";
            container.style.top =
                (containerData._originalTop + evt.clientY - containerData._mouseTop) + "px";

            containerData._dragging = false;
        }
    });
    windowID++;
    return { content: contentContainer };
}
}


function getHighestZindex() {
    const allWindows: HTMLElement[] = Array.from(document.querySelectorAll<HTMLTableElement>(".aliceWMwin"))
    anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge
    
    let highestZindex = 0
    for (const wmwindow of allWindows) {
        if (Number(wmwindow.style.getPropertyValue("z-index")) >= highestZindex )  
            highestZindex =  Number(wmwindow.style.getPropertyValue("z-index"))
    }
    return highestZindex
}

async function normalizeZindex() {
    const allWindows: HTMLElement[] = Array.from(document.querySelectorAll<HTMLTableElement>(".aliceWMwin"))
    anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge
    
    let lowestZindex = 9999
    for (const wmwindow of allWindows) {
        if (Number(wmwindow.style.getPropertyValue("z-index")) <= lowestZindex )  
            lowestZindex =  Number(wmwindow.style.getPropertyValue("z-index"))
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
function center(element:HTMLElement) {
    if (element) {
        element.style.left = (window.innerWidth - element.offsetWidth) / 2 + "px";
        element.style.top = (window.innerHeight - element.offsetHeight) / 2 + "px";
    }
}

/**
 * callback function for the dialog closed event
 * @param {Object} container
 */
