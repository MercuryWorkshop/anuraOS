let anura = window.parent.anura;

let taskbarList = anura.settings.get("applist")
console.log(taskbarList)
console.log(anura.apps)

function allowDrop(ev) {
    ev.preventDefault();
}
function drag(ev) {
    ev.dataTransfer.setData("text", ev.target.id);
}
function drop(ev) {
    console.log("boop")
    ev.preventDefault();
    var data = ev.dataTransfer.getData("text");
    ev.target.appendChild(document.getElementById(data));
}

allContainer = document.getElementsByClassName("allApps")[0]
for (appName in anura.apps) {
    if (taskbarList.includes(appName))
        continue;
    const app = anura.apps[appName]
    let newImg = document.createElement('img')
    if (app.icon.startsWith('/'))
        newImg.src = app.icon;
    else 
        newImg.src = '/' + app.icon;
    newImg.className = "taskbarImg"
    newImg.draggable = true
    newImg.ondrag = drag
    newImg.id = appName
    allContainer.appendChild(newImg)
}
function drawTaskbar() {
    taskbarList = anura.settings.get("applist")
    let taskbar = document.getElementsByClassName("taskbar")[0]
    let backBoundry = document.createElement("div")
    backBoundry.className = "element"
    backBoundry.addEventListener("drop", drop);
    taskbar.appendChild(backBoundry)
    for (appID in taskbarList) {
        let appName = taskbarList[appID]
        let container = document.createElement("div");
        container.className = "element"
        container.addEventListener("drop", (event) => {
            console.log(event);
        });
        const app = anura.apps[appName]
        console.log(app)
        let newImg = document.createElement('img')
        if (app.icon.startsWith('/'))
            newImg.src = app.icon;
        else 
            newImg.src = '/' + app.icon;
        newImg.className = "taskbarImg"
        newImg.draggable = true
        newImg.ondrag = drag
        newImg.id = appName
        container.appendChild(newImg)
        taskbar.appendChild(container)
    }
    let frontBoundary = document.createElement("div")
    frontBoundary.className = "element"
    frontBoundary.addEventListener("drop", drop);
    taskbar.appendChild(frontBoundary)
}
drawTaskbar()