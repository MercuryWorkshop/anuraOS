function loadingScript(currentpath) {
    
    // standard app init stuff...
    let browser = AliceWM.create({"title":"", "width":"700px", "height":"500px"})
    let iframe = document.createElement("iframe")
    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;"
    iframe.setAttribute("src", "../../browser.html")
    browser.content.appendChild(iframe)

    if (localStorage['borderless-aboutbrowser'] == "true") {
        // make borderless
        browser.content.style.position = "absolute";
        browser.content.style.height = "100%";
        browser.content.style.display = "inline-block"

        let container = browser.content.parentElement

        container.querySelector(".title").style["background-color"] = "rgba(0, 0, 0, 0)"
    }
    anura.apps['anura.browser'].windowinstance.push(browser.content.parentElement)
    taskbar.updateTaskbar();

}


