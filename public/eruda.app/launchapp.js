function loadingScript(currentpath) {
    var script = document.createElement('script'); 
    script.src=`${currentpath}/eruda.js`; 
    document.head.appendChild(script); 
    script.onload = function () { 
        eruda.init() 
    }
}
