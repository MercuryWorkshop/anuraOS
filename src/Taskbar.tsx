class Shortcut {
    element: HTMLElement;

    lightbar: HTMLElement;
    constructor(svg: string, launch: () => void, appID: string) {
        this.element = (
            <li application={appID}>
                <input
                    type="image"
                    src={svg}
                    class="showDialog"
                    on:click={launch}
                />
                <div
                    class="lightbar"
                    bind:lightbar={this}
                    style="position: relative; bottom: 1px; background-color:#FFF; width:50%; left:50%; transform:translateX(-50%); display:none"
                ></div>
                <div class="hoverMenu" style="display: none;">
                    <ul class="openWindows"></ul>
                </div>
            </li>
        );
    }
}

class Taskbar {
    activeTray: HTMLElement;

    element = (
        <footer>
            <div id="launcher-button-container">
                <div
                    id="launcher-button"
                    on:click={() => {
                        launcher.toggleVisible();
                    }}
                >
                    <img
                        src="/assets/icons/launcher.svg"
                        style="height:100%;width:100%"
                    ></img>
                </div>
            </div>
            <nav id="taskbar-bar">
                <ul bind:activeTray={this}>
                    <li style="height: 40px; width=40px"></li>
                </ul>
            </nav>
        </footer>
    );

    shortcuts: { [key: string]: Shortcut } = {};
    constructor() {}
    addShortcut(svg: string, launch: () => void, appID: string) {
        const shortcut = new Shortcut(svg, launch, appID);
        this.shortcuts[appID] = shortcut;
        return shortcut;
    }
    killself() {
        this.element.remove();
    }
    removeShortcuts() {
        for (const name in this.shortcuts) {
            this.shortcuts[name]!.element.remove();
            delete this.shortcuts[name];
        }
    }
    rendered: string[] = [];
    updateTaskbar() {
        taskbar.removeShortcuts();

        this.rendered = [];
        const pinnedApps = anura.settings.get("applist");
        for (const appName of pinnedApps) {
            if (appName in anura.apps) {
                const app = anura.apps[appName];

                const shortcut = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );

                if (app.windowinstance.length !== 0) {
                    shortcut.lightbar.style.display = "block";
                }
                this.activeTray.appendChild(shortcut.element);
                this.rendered.push(appName);
            }
        }
        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            if (
                app.windowinstance.length !== 0 &&
                !this.rendered.includes(appName)
            ) {
                const shortcut = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );

                this.activeTray.appendChild(shortcut.element);
                shortcut.lightbar.style.display = "block";
                this.rendered.push(appName);
            }
        }
    }
    updateTaskbarPartial() {
        const pinnedApps = anura.settings.get("applist");
        // For our purposes, we will assume that all pinned apps are already rendered
        for (const appName of pinnedApps) {
            if (appName in anura.apps) {
                let lightbar: HTMLElement;
                if (this.rendered.includes(appName)) {
                    const app = anura.apps[appName];

                    // you could totally inject something into a query selector but like... why?
                    const shortcut: HTMLElement = this.element.querySelector(
                        `[application="${appName}"]`,
                    );
                    lightbar = (shortcut.getElementsByClassName(
                        "lightbar",
                    )[0] as HTMLElement)!;

                    if (app.windowinstance.length !== 0) {
                        lightbar.style.display = "block";
                    } else {
                        lightbar.style.display = "none";
                    }
                } else {
                    // Something went wrong, this should never be false, fallback to rerender
                    taskbar.updateTaskbar();
                }
            }
        }

        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            if (
                app.windowinstance.length !== 0 &&
                !this.rendered.includes(appName)
            ) {
                console.log(
                    appName + " is not rendered, but has a window open",
                );
                // if there is a window of the app, and its icon hasn't been rendered, render it
                const shortcut = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );

                this.activeTray.appendChild(shortcut.element);
                shortcut.lightbar.style.display = "block";
                this.rendered.push(appName);
            } else if (
                app.windowinstance.length === 0 &&
                this.rendered.includes(appName) &&
                !pinnedApps.includes(appName)
            ) {
                // if there is no window of the app, the icon has been rendered, and the app is NOT pinned, remove the app
                const shortcut: HTMLElement = this.element.querySelector(
                    `[application="${appName}"]`,
                );
                shortcut.remove();
                this.rendered.splice(this.rendered.indexOf(appName));
            }
        }
    }
}
