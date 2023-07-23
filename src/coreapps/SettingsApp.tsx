class SettingsApp implements App {
    name = "Settings App";
    package = "anura.settings";
    icon = "/assets/xorg.svg";
    windows: WMWindow[];
    source: string;

    screen_container = (
        <div id="app">
            <div class="header">
                <h3 color="white">Settings (Under Construction)</h3>
            </div>
            <div class="tab">
                <button class="tablinks" onclick="openSetting(event, 'Tab0')">
                    <div class="tabbtndiv" id="default">
                        <img src="/assets/icons/desktop.svg"></img>
                        System
                    </div>
                </button>

                <button class="tablinks" onclick="openSetting(event, 'Tab2')">
                    <div class="tabbtndiv">
                        <img src="/assets/icons/theme.svg"></img>
                        Style
                    </div>
                    <button
                        class="tablinks"
                        onclick="openSetting(event, 'Tab1')"
                    >
                        <div class="tabbtndiv">
                            <img src="/assets/icons/taskbar.svg"></img>
                            Taskbar
                        </div>
                    </button>
                </button>
            </div>

            <div id="Tab0" class="tabcontent" style="display: none;">
                <div class="rowswrapper">
                    <div class="rows">
                        <button class="rowsbtn" id="x86subsystemsstate">
                            x86 Subsystem - ON
                        </button>
                    </div>
                    <div class="rows">
                        <button class="rowsbtn" id="abtbrowser">
                            Borderless Browser - OFF
                        </button>
                    </div>
                    <div class="rows">
                        <button class="rowsbtn">Not Implemented</button>
                    </div>
                    <div class="rows">
                        <button class="rowsbtn">Not Implemented</button>
                    </div>
                </div>
            </div>

            <div id="Tab2" class="tabcontent" style="display: none;">
                <h3>Under Construction</h3>
                <p>(be patient)</p>
            </div>

            <div id="Tab1" class="tabcontent" style="display: none;">
                All Apps
                <div class="allApps"></div>
                <hr></hr>
                Taskbar
                <div class="taskbar"></div>
                <p>Usage:</p>
                <ul>
                    <li>
                        If you drag an element into another element, the element
                        you drag is deleted
                    </li>
                    <li>
                        Drag an element to the corner positions to add or change
                        the position
                    </li>
                </ul>
            </div>
        </div>
    );

    constructor() {
        this.windows = [];
    }
    async open(): Promise<WMWindow | undefined> {
        const win = AliceWM.create({
            title: "Settings",
            width: "700px",
            height: "500px",
        } as unknown as any);
        this.windows[0] = win;

        win.content.appendChild(this.screen_container);
        win.content.style.backgroundColor = "#222222";
        function openSetting(
            evt: { currentTarget: { className: string } },
            TabName: string,
        ) {
            const x86button = document.getElementById("x86subsystemsstate");

            if (!anura.settings.get("x86-disabled")) {
                x86button!.innerText = "x86 Subsystem - ON";
            } else {
                x86button!.innerText = "x86 Subsystem - OFF";
            }

            x86button!.onclick = function () {
                if (anura.settings.get("x86-disabled")) {
                    anura.settings.set("x86-disabled", false);
                    x86button!.innerText = "x86 Subsystem - ON";
                } else {
                    anura.settings.set("x86-disabled", true);
                    x86button!.innerText = "x86 Subsystem - OFF";
                }
            };

            const aboutbrowserbutton = document.getElementById("abtbrowser");
            if (!anura.settings.get("borderless-aboutbrowser")) {
                aboutbrowserbutton!.innerText = "Borderless Browser - OFF";
            } else {
                aboutbrowserbutton!.innerText = "Borderless Browser - ON";
            }

            aboutbrowserbutton!.onclick = function () {
                if (!anura.settings.get("borderless-aboutbrowser")) {
                    anura.settings.set("borderless-aboutbrowser", true);
                    aboutbrowserbutton!.innerText = "Borderless Browser - ON";
                } else {
                    anura.settings.set("borderless-aboutbrowser", false);
                    aboutbrowserbutton!.innerText = "Borderless Browser - OFF";
                }
            };

            document.getElementById("default")!.click();

            const tabcontent = document.getElementsByClassName("tabcontent");
            for (let i = 0; i < tabcontent.length; i++) {
                (tabcontent[i]! as HTMLElement).style.display = "none";
            }

            const tablinks = document.getElementsByClassName("tablinks");
            for (let i = 0; i < tablinks.length; i++) {
                tablinks[i]!.className = tablinks[i]!.className.replace(
                    " active",
                    "",
                );
            }

            document.getElementById(TabName)!.style.display = "flex";
            evt.currentTarget.className += " active";
        }

        /* Event fired on the drag target */
        document.ondragstart = function (event) {
            event.dataTransfer!.setData(
                "Text",
                (event.target! as HTMLElement).id,
            );
        };

        /* Events fired on the drop target */
        document.ondragover = function (event) {
            event.preventDefault();
        };

        function allowDrop(ev: any) {
            ev.preventDefault();
        }
        function drag(ev: any) {
            ev.dataTransfer.setData("text", ev.target.id);
        }
        function drop(ev: any) {
            console.log("boop");
            ev.preventDefault();
            const data = ev.dataTransfer.getData("text");
            ev.target.appendChild(document.getElementById(data));
            // Now we gotta figure out how to store shit, here we go mf
            const newTaskBar = [];
            const elements = document.getElementsByClassName("element");
            for (const elementIndex in elements) {
                const element = elements[elementIndex] as HTMLElement;
                if (!element!.childNodes || element!.childNodes.length == 0)
                    continue;
                console.log(element);
                if (element)
                    newTaskBar.push((element.childNodes[0]! as HTMLElement).id);
            }
            console.log(newTaskBar);
            anura.settings.set("applist", newTaskBar);
            //@ts-ignore
            window.parent.taskbar.updateTaskbar();
            drawTaskbar();
        }

        function drawTaskbar() {
            let taskbarList = anura.settings.get("applist");
            const taskbar = document.getElementsByClassName("taskbar")[0];
            taskbar!.innerHTML = "";
            const backBoundry = document.createElement("div");
            backBoundry.className = "element";
            backBoundry.addEventListener("drop", drop);
            taskbar!.appendChild(backBoundry);
            for (const appID in taskbarList) {
                const appName = taskbarList[appID];
                const container = document.createElement("div");
                container.className = "element";
                container.addEventListener("drop", drop);

                const app = anura.apps[appName];
                if (!app) {
                    // Sometimes the pinned list will contain nonexistent apps
                    console.log(
                        "Pinned app " +
                            appName +
                            " is not installed on the system, it will be removed on save",
                    );
                    continue;
                }
                const newImg = document.createElement("img");
                if (app.icon.startsWith("/")) newImg.src = app.icon;
                else newImg.src = "/" + app.icon;
                newImg.className = "taskbarImg";
                newImg.draggable = true;
                newImg.ondrag = drag;
                newImg.id = appName;
                container.appendChild(newImg);
                taskbar!.appendChild(container);
            }
            const frontBoundary = document.createElement("div");
            frontBoundary.className = "element";
            frontBoundary.addEventListener("drop", drop);
            taskbar!.appendChild(frontBoundary);

            const allContainer = document.getElementsByClassName("allApps")[0];
            allContainer!.innerHTML = "";
            for (const appName in anura.apps) {
                if (taskbarList.includes(appName)) continue;
                const app = anura.apps[appName];
                const newImg = document.createElement("img");
                if (app.icon.startsWith("/")) newImg.src = app.icon;
                else newImg.src = "/" + app.icon;
                newImg.className = "taskbarImg";
                newImg.draggable = true;
                newImg.ondragstart = function (event) {
                    drag(event);
                };
                newImg.id = appName;
                allContainer!.appendChild(newImg);
            }
            taskbarList = anura.settings.get("applist");
        }
        drawTaskbar();

        taskbar.updateTaskbar();

        return win;
    }
}
