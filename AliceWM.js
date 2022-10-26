
/**
 * the purpose of the following code is to give a demo of 
 * how to realize the floating dialog using javascript.
 * It was written without any consideration of cross-browser compatibility,
 * and it can be run successfully under the firefox 3.5.7.
 */
var AliceWM = {};

/**
 * to show a floating dialog displaying the given dom element
 * @param {Object} title "title of the dialog"
 */

let windowID = 0;
AliceWM.create = function(title){ // CODE ORIGINALLY FROM https://gist.github.com/chwkai/290488
    
    // initializing dialog: title, close, content
    var container = document.createElement("div");
    var titleContainer = document.createElement("div");
    var left = document.createElement("div");
    
    var contentContainer = document.createElement("div");
    var closeContainer = document.createElement("span");
    
    container.setAttribute("id", "sampleDialog");
    container.setAttribute("style", "resize: both;")
    
    titleContainer.setAttribute("id", "title");

    contentContainer.setAttribute("id", "content");
    contentContainer.setAttribute("style", "width: 100%; height: calc(100% - 20px); padding:0; margin:0; ")
    
    titleContainer.innerHTML = title;

    closeContainer.setAttribute("id", "close");
    closeContainer.innerHTML = "X";
    closeContainer.setAttribute("style", "right: 10px")
    
    container.appendChild(titleContainer);

    
    container.appendChild(contentContainer);
    container.appendChild(closeContainer);
    document.body.appendChild(container);
    // place the container in the center of the browser window
    window.center(container);
    // closeContainer.style.left = (container.offsetWidth - 20) + "px";
    
    
    // binding mouse events
    closeContainer.onclick = function(evt){
        if (container._overlay){
            container._overlay.parentNode.removeChild(container._overlay);
        }
        
        container.parentNode.removeChild(container);
        // calling the callback function to notify the dialog closed  
        evt.stopPropagation();
    };
    
    // start dragging when the mouse clicked in the title area
    titleContainer.onmousedown = function(evt){
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
        
        if(container._dragging){
            container.style.left = 
                (container._originalLeft + evt.clientX - container._mouseLeft) + "px";
            container.style.top = 
                (container._originalTop + evt.clientY - container._mouseTop) + "px";
        }
    })
    
    // finish the dragging when release the mouse button
    document.addEventListener('mouseup', (evt) => {
        evt = evt || window.event;
        
        if(container._dragging){
            container.style.left = 
                (container._originalLeft + evt.clientX - container._mouseLeft) + "px";
            container.style.top = 
                (container._originalTop + evt.clientY - container._mouseTop) + "px";
            
            container._dragging = false;
        }
    });
    windowID++;
    return {content: contentContainer};
};



/**
 * place the given dom element in the center of the browser window
 * @param {Object} element
 */
function center(element){
    if(element){
        element.style.left = (window.innerWidth - element.offsetWidth) / 2 + "px";
        element.style.top = (window.innerHeight - element.offsetHeight) / 2 + "px";
    }
}

/**
 * callback function for the dialog closed event
 * @param {Object} container 
 */