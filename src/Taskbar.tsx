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
                    style="position: relative; bottom: 1px; background-color:#FFF; display:none"
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
    pinnedTray: HTMLElement;

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
                <div id="taskbar-separator"></div>
                <ul bind:pinnedTray={this}>
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
    updateTaskbar() {
        taskbar.removeShortcuts();

        const rendered = [];

        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            if (app.windowinstance.length !== 0) {
                rendered.push(appName);
                const shortcut = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );

                this.activeTray.appendChild(shortcut.element);
                shortcut.lightbar.style.display = "block";
            }
        }
        const pinnedApps = anura.settings.get("applist");
        for (const appName of pinnedApps) {
            if (appName in anura.apps && !rendered.includes(appName)) {
                const app = anura.apps[appName];

                const shortcut = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );

                this.pinnedTray.appendChild(shortcut.element);
            }
        }
    }
}
