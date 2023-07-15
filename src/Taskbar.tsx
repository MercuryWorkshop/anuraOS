class Taskbar {
    shortcutsTray: HTMLElement;

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
            <nav>
                <ul bind:shortcutsTray={this}>
                    <li style="height: 40px; width=40px"></li>
                </ul>
            </nav>
        </footer>
    );
    constructor() {}
    addShortcut(svg: string, launch: () => void, appID: string) {
        const elm = (
            <li application={appID}>
                <input
                    type="image"
                    src={svg}
                    class="showDialog"
                    on:click={launch}
                />
                <div
                    class="lightbar"
                    style="position: relative; bottom: 1px;"
                ></div>
                <div class="hoverMenu" style="display: none;">
                    <ul class="openWindows"></ul>
                </div>
            </li>
        );
        this.shortcutsTray.appendChild(elm);
        return elm;
    }
    killself() {
        this.element.remove();
    }
    removeShortcuts() {
        this.element.querySelectorAll("li").forEach((element: HTMLElement) => {
            if (element.hasAttribute("application")) element.remove();
        });
    }
    updateTaskbar() {
        taskbar.removeShortcuts();

        const orderedApps = anura.settings.get("applist");
        const takenCareOf: any = [];
        for (const appID in orderedApps) {
            const appName = orderedApps[appID];
            if (appName in anura.apps) {
                const app = anura.apps[appName];

                const item = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );
                if (app.windowinstance.length !== 0) {
                    item.getElementsByClassName(
                        "lightbar",
                    )[0].style.backgroundColor = "#FFF";
                }
                takenCareOf.push(appName);
            }
        }
        for (const appName in anura.apps) {
            const app = anura.apps[appName];
            console.log(appName);
            if (
                app.windowinstance.length !== 0 &&
                !takenCareOf.includes(appName)
            ) {
                const item = taskbar.addShortcut(
                    app.icon,
                    app.launch.bind(app),
                    appName,
                );
                item.getElementsByClassName(
                    "lightbar",
                )[0].style.backgroundColor = "#FFF";
            }
        }
    }
}
