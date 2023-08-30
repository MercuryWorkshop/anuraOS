function loadingScript(currentpath) {
    var script = document.createElement('script'); 
    script.src=`${currentpath}/rjs.js`; 
    document.head.appendChild(script); 
}
