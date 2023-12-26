const settingsCSS = styled.new`
    .self {
        color: white;
    }
    .header {
        margin-left: 20px;
    }
    .container {
        display: flex;
    }
    .general-settings-category {
        margin-left: 20px;
        width: 100%;
    }
    .sidebar {
        margin-left: 20px;
        margin-top: 15px;
    }
    .sidebar-settings-item {
        height: 40px;
        display: flex;
        align-items: center;
        margin: 5px;
        width: 150px;
        cursor: pointer;
        border-radius: 5px;
        transition: 250ms ease-in-out;
    }
    .sidebar-settings-item-name > a:hover {
        color: #b9b9b9;
    }
    .settings-category-name {
        color: rgb(225 225 225);
        margin-bottom: 15px;
    }
    .settings-item {
        margin-bottom: 10px;
        background-color: rgb(20 20 20);
        height: 40px;
        display: flex;
        margin-right: 10px;
        justify-content: space-between;
        align-items: center;
        width: calc(100% - 20px);
        border-radius: 10px;
    }
    .settings-item-name {
        margin-left: 10px;
    }
    .settings-item-text-input {
        background-color: #2f2f2f;
        margin-right: 10px;
        border: none;
        border-radius: 5px;
        padding: 5px;
    }
    .settings-item-text-input:focus {
        outline: none;
    }
    .sidebar-settings-item-name > a {
        color: #c1c1c1;
        margin-left: 20px;
        text-decoration: none;
    }
    .switch {
        position: relative;
        display: inline-block;
        width: 60px;
        height: 18px;
        margin-right: 10px;
    }
    .switch input {
        opacity: 0;
        width: 0;
        height: 0;
    }
    .slider {
        position: absolute;
        cursor: pointer;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #ccc;
        -webkit-transition: 0.4s;
        transition: 0.4s;
    }

    .slider:before {
        position: absolute;
        content: "";
        height: 28px;
        width: 28px;
        bottom: -5px;
        background-color: white;
        transition: all 0.4s ease 0s;
    }

    input:checked + .slider {
        background-color: #2196f3;
    }

    input:focus + .slider {
        box-shadow: 0 0 1px #2196f3;
    }

    input:checked + .slider:before {
        transform: translateX(34px);
    }
    .slider.round {
        border-radius: 34px;
    }
    .slider.round:before {
        border-radius: 50%;
    }
`;

class SettingsApp extends App {
    name = "Settings";
    package = "anura.settings";
    icon = "/assets/icons/settings.png";

    state = stateful({
        resizing: false,
    });

    page = async () => (
        <div
            style="height:100%;width:100%;position:absolute"
            class={`background ${settingsCSS}`}
        >
            <div class="header">
                <h2 color="white">Anura Settings</h2>
            </div>

            <div class="container">
                <div class="sidebar">
                    <div class="sidebar-settings-item">
                        <h4 class="sidebar-settings-item-name">
                            <a href="#general">General</a>
                        </h4>
                    </div>
                    <div class="sidebar-settings-item">
                        <h4 class="sidebar-settings-item-name">
                            <a href="#v86">v86</a>
                        </h4>
                    </div>
                </div>
                <div class="general-settings-category">
                    <h3 class="settings-category-name">General Settings</h3>
                    <div class="settings-item">
                        <h4 class="settings-item-name">
                            Borderless AboutBrowser
                        </h4>
                        <label class="switch">
                            <input
                                on:click={(event: any) => {
                                    if (event.target.checked) {
                                        anura.settings.set(
                                            "borderless-aboutbrowser",
                                            true,
                                        );
                                    } else {
                                        anura.settings.set(
                                            "borderless-aboutbrowser",
                                            false,
                                        );
                                    }
                                }}
                                id="borderless-aboutbrowser"
                                type="checkbox"
                            />
                            <span class="slider round"></span>
                        </label>
                    </div>
                    <div class="settings-item">
                        <h4 class="settings-item-name">Custom WS Proxy</h4>
                        <input
                            class="settings-item-text-input"
                            on:change={(event: any) => {
                                anura.settings.set(
                                    "wsproxy-url",
                                    event.target.value,
                                );
                            }}
                            placeholder={anura.settings.get("wsproxy-url")}
                            type="text"
                        />
                    </div>
                    <div class="settings-item">
                        <h4 class="settings-item-name">Custom Bare URL</h4>
                        <input
                            class="settings-item-text-input"
                            on:change={(event: any) => {
                                anura.settings.set(
                                    "bare-url",
                                    event.target.value,
                                );
                            }}
                            placeholder={anura.settings.get("bare-url")}
                            type="text"
                        />
                    </div>
                </div>
            </div>
        </div>
    );

    constructor() {
        super();
    }

    async open(): Promise<WMWindow | undefined> {
        const win = anura.wm.create(this, {
            title: "",
            width: "910px",
            height: "720px",
        });

        console.log("here");

        win.content.appendChild(await this.page());

        if (document.getElementById("borderless-aboutbrowser")) {
            if (anura.settings.get("borderless-aboutbrowser")) {
                document
                    .getElementById("borderless-aboutbrowser")!
                    .setAttribute("checked", "");
            }
        }

        return win;
    }
}
