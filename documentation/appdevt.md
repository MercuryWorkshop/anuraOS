# Application development

all of the below is undergoing change. see public/glxgears.app for an example

<!-- Every application is a .app folder with an entry file called launchapp.js. In this file, a function called loadingScript is called with the path of the app  -->
<!---->
<!-- take the python application loader for example. -->
<!-- ```js -->
<!-- function loadingScript(currentpath) { -->
<!--     let python = AliceWM.create("python") -->
<!---->
<!--     let iframe = document.createElement("iframe") -->
<!--     iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;" -->
<!--     iframe.setAttribute("src", currentpath +"/console.html") -->
<!--     console.log(document.currentScript); -->
<!--     python.content.appendChild(iframe) -->
<!-- } -->
<!-- ``` -->
<!---->
<!-- from here you can do a variety of things, Applications can directly interface with the x86 subsystem (anura.x86) or its filesystem (anura.x86fs) or use the anura filesystem.  -->
<!---->
<!-- You can make a python app with the following logic,  -->
<!-- ```js -->
<!-- function loadingScript(currentpath) { -->
<!--     let py = await anura.python('APP NAME') -->
<!--     py.runPython(` -->
<!--     print("Hello World") -->
<!--     win = AliceWM.create("Window") -->
<!--     win.content.innerText = "Python Application!" -->
<!--     `) -->
<!-- } -->
<!-- ``` -->
<!---->
<!-- you can make a JS app with the following logic, -->
<!-- ```js -->
<!-- function loadingScript(currentpath) { -->
<!--     console.log("Hello World") -->
<!--     let win = AliceWM.create("Window") -->
<!--     win.content.innerText = "Python Application!" -->
<!-- } -->
<!-- ``` -->

you can create a C app by crying
