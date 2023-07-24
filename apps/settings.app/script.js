/// <reference path="../../src/api/Settings.ts"/>
/// <reference path="../../src/Anura.ts"/>
function openSetting(evt, TabName) {
  let x86button = document.getElementById('x86subsystemsstate')

  if (!anura.settings.get("x86-disabled")) {
    x86button.innerText = 'x86 Subsystem - ON'
  } else {
    x86button.innerText = 'x86 Subsystem - OFF'
  }

  x86button.onclick = function() {
    if (anura.settings.get("x86-disabled")) {
      anura.settings.set("x86-disabled", false)
      x86button.innerText = 'x86 Subsystem - ON'

    } else {
      anura.settings.set("x86-disabled", true)
      x86button.innerText = 'x86 Subsystem - OFF'
    }
  }

  let aboutbrowserbutton = document.getElementById('abtbrowser')
  if (!anura.settings.get("borderless-aboutbrowser")) {
    aboutbrowserbutton.innerText = 'Borderless Browser - OFF'
  } else {
    aboutbrowserbutton.innerText = 'Borderless Browser - ON'
  }

  aboutbrowserbutton.onclick = function() {
    if (!anura.settings.get("borderless-aboutbrowser")) {
      anura.settings.set("borderless-aboutbrowser", true)
      aboutbrowserbutton.innerText = 'Borderless Browser - ON'

    } else {
      anura.settings.set("borderless-aboutbrowser", false)
      aboutbrowserbutton.innerText = 'Borderless Browser - OFF'
    }
  }

  document.getElementById('default').click()

  var i, tabcontent, tablinks;

  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
    tabcontent[i].style.display = "none";
  }

  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
    tablinks[i].className = tablinks[i].className.replace(" active", "");
  }

  document.getElementById(TabName).style.display = "flex";
  evt.currentTarget.className += " active";
}

/* Event fired on the drag target */
document.ondragstart = function(event) {
    event.dataTransfer.setData("Text", event.target.id);
};
  
  /* Events fired on the drop target */
document.ondragover = function(event) {
    event.preventDefault();
};

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
    // Now we gotta figure out how to store shit, here we go mf
    let newTaskBar = [];
    const elements = document.getElementsByClassName("element")
    for (let elementIndex in elements) {
        let element = elements[elementIndex];
        if (!element.childNodes || element.childNodes.length == 0) 
            continue;
        console.log(element)
        newTaskBar.push(element.childNodes[0].id);
    }
    console.log(newTaskBar);
    anura.settings.set('applist', newTaskBar);
    window.parent.taskbar.updateTaskbar();
    drawTaskbar();
}


function drawTaskbar() {
    let taskbarList = anura.settings.get("applist")
    let taskbar = document.getElementsByClassName("taskbar")[0]
    taskbar.innerHTML = ''
    let backBoundry = document.createElement("div")
    backBoundry.className = "element"
    backBoundry.addEventListener("drop", drop);
    taskbar.appendChild(backBoundry)
    for (appID in taskbarList) {
        let appName = taskbarList[appID]
        let container = document.createElement("div");
        container.className = "element"
        container.addEventListener("drop", drop);
        
        const app = anura.apps[appName]
        if (!app) // Sometimes the pinned list will contain nonexistent apps
        {
          console.log("Pinned app " + appName + " is not installed on the system, it will be removed on save")
          continue;
        }
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

    allContainer = document.getElementsByClassName("allApps")[0]
    allContainer.innerHTML = ''
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
        newImg.ondragstart = function (event) {
            drag(event)
        }
        newImg.id = appName
        allContainer.appendChild(newImg)
    }
    taskbarList = anura.settings.get("applist")
}
drawTaskbar()
