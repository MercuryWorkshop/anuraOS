
/**
 * the purpose of the following code is to give a demo of
 * how to realize the floating dialog using javascript.
 * It was written without any consideration of cross-browser compatibility,
 * and it can be run successfully under the firefox 3.5.7.
 *
 * nope nope this code has NOT been stolen rafflesia did NOT make it :thumbsup:
 */
var AliceWM:any = {};

// no i will not use data properties in the dom element fuck off
// ok fine i will fine i just realized how much harder it would be


/**
 * to show a floating dialog displaying the given dom element
 * @param {Object} title "title of the dialog"
 */
let windowInformation = {}
let windowID = 0;
AliceWM.create = function(givenWinInfo: string | any) { // CODE ORIGINALLY FROM https://gist.github.com/chwkai/290488
    let wininfo = givenWinInfo;
    anura.logger.debug(typeof (givenWinInfo))
    if (typeof (givenWinInfo) == 'string') {
        wininfo = {
            title: givenWinInfo,
            width: '1000px',
            height: '500px',
        }
    }
   
    
    // initializing dialog: title, close, content
    var container:any = document.createElement("div");
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
    // titleContent.innerHTML = wininfo.title;

    closeContainer.setAttribute("class", "close");
    closeContainer.setAttribute("class", "windowButton");
    closeContainer.innerHTML = '<span class="material-symbols-outlined">close</span>';

    maximizeContainer.setAttribute("class", "maximize");
    maximizeContainer.setAttribute("class", "windowButton");
    maximizeContainer.innerHTML = '<span class="material-symbols-outlined">maximize</span>'

    minimizeContainer.setAttribute("class", "minimize");
    minimizeContainer.setAttribute("class", "windowButton");
    minimizeContainer.innerHTML = '<span class="material-symbols-outlined">minimize</span>';

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
        if (container._overlay) {
            container._overlay.parentNode.removeChild(container._overlay);
        }

        container.parentNode.removeChild(container);
        // calling the callback function to notify the dialog closed
        evt.stopPropagation();
    };
    // const ro = new ResizeObserver(entries => {
    //     container.setAttribute("maximized", "false")
    //     ro.unobserve(container);
    //   });
    
    maximizeContainer.onclick = function() {
        if (container.getAttribute("maximized") === "false") {
            container.setAttribute("old-style", container.getAttribute("style")) 
            const width  = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
            const height = window.innerHeight|| document.documentElement.clientHeight|| 
            document.body.clientHeight;
            container.style.top = 0
            container.style.left = 0
            container.style.width = `${width}px`;
            container.style.height = `${height - 53}px`;
            container.setAttribute("maximized", "true") 
            // ro.observe(container);
        } else {
            container.setAttribute("style", container.getAttribute("old-style"))
            container.setAttribute("maximized", "false")
            // ro.unobserve(container);
        }

    };

    container.onresize = function() {
        anura.logger.debug("resized")
        container.setAttribute("maximized", "false")
    }



      

    // self explanatory everything is self explanatory
    container.onmousedown = function(evt:any) {
        // probably inefficient but i dont caare
        var allWindows = [...document.querySelectorAll(".aliceWMwin") as any];
        anura.logger.debug(allWindows); // this line is fucking crashing edge for some reason -- fuck you go use some other browser instead of edge
        for (const wmwindow of allWindows) {
            wmwindow.style.setProperty("z-index", 92);
        }
        (titleContainer.parentNode as HTMLElement)!.style.setProperty("z-index", "93");

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

        container._dragging = true;
        container._originalLeft = container.offsetLeft;
        container._originalTop = container.offsetTop;
        container._mouseLeft = evt.clientX;
        container._mouseTop = evt.clientY;
    };

    // do the dragging during the mouse move
    document.addEventListener('mousemove', (evt) => {
        evt = evt || window.event;

        if (container._dragging) {
            container.style.left =
                (container._originalLeft + evt.clientX - container._mouseLeft) + "px";
            container.style.top =
                (container._originalTop + evt.clientY - container._mouseTop) + "px";
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

        if (container._dragging) {
            container.style.left =
                (container._originalLeft + evt.clientX - container._mouseLeft) + "px";
            container.style.top =
                (container._originalTop + evt.clientY - container._mouseTop) + "px";

            container._dragging = false;
        }
    });
    windowID++;
    return { content: contentContainer };
};



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
