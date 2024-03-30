import RepoList from "./screens/RepoList.mjs";
import ItemList from "./screens/ItemList.mjs";
import Overview from "./screens/Overview.mjs";
const { Store } = await anura.import("anura.libstore@2.0.0");

const branding = anura.settings.get("marketplace-branding") || {
    repoList: "Marketplace",
    itemList: "Marketplace | %0",
    overview: "Marketplace | %0/%1",
}

window.saved = stateful({
    repos: Object.entries(
        anura.settings.get("workstore-repos") || { 
            "Anura App Repository": "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/",
            "Anura Games": "https://anura.games/",
            "Kxtz's Emulators": "https://anura.kxtz.dev/emulators/",
        }
    ),
});

const oldOnClose = instanceWindow.onclose;
instanceWindow.onclose = () => {
    oldOnClose && oldOnClose();
    anura.settings.set("workstore-repos", Object.fromEntries(saved.repos));
};

window.state = stateful({
    showBackButton: false,
    currentScreen: "repoList",
    currentItem: null,
    currentItemType: null,
    currentRepo: null,
});

window.marketplace = new Store(anura.net, {
    onError: (appName, error) => {
        anura.notifications.add({
            title: "Marketplace",
            description: `Marketplace encountered an error while installing ${appName}: ${error}`,
            timeout: 5000,
        });
    },
    onDownloadStart: (appName) => {
        anura.notifications.add({
            title: "Marketplace",
            description: `Marketplace started downloading ${appName}`,
            timeout: 5000,
        });
    },
    onDepInstallStart: (appName, libName) => {
        anura.notifications.add({
            title: "Marketplace",
            description: `Marketplace started installing dependency ${libName} for ${appName}`,
            timeout: 5000,
        });
    },
    onComplete: (appName) => {
        anura.notifications.add({
            title: "Marketplace",
            description: `Marketplace finished installing ${appName}`,
            timeout: 5000,
        });
    },
});

const back = html`
<button 
    class=${["windowButton"]} 
    style=${{
        width: "24px", 
        height: "24px", 
        display: use(state.showBackButton)
    }}
    on:mousedown=${(evt) => {
        evt.stopPropagation();
    }}
    on:click=${async () => {
        switch (state.currentScreen) {
            case "overview":
                state.currentScreen = "itemList";
                break;
            default:
                state.currentScreen = "repoList";
                break;
        }
    }}>
    <span 
        class=${["material-symbols-outlined"]}
        style=${{
            fontSize: "16px",
            lineHeight: "24px"
        }}>
        arrow_back
    </span>
</button>
`;

instanceWindow.content.style.position = "absolute";
instanceWindow.content.style.height = "100%";
const titlebar = Array
    .from(instanceWindow.element.children)
    .filter(e => e.classList.contains("title"))[0];

titlebar.style.backgroundColor = "rgba(0, 0, 0, 0)"

titlebar.insertBefore(back, titlebar.children[1]);

function App() {
    this.mount = () => {
        handle(use(state.currentScreen), (screen) => {
            this.screen.innerHTML = "";
            switch (screen) {
                case "repoList":
                    instanceWindow.state.title = "Marketplace";
                    back.style.display = "none";
                    this.screen.appendChild(html`<${RepoList}/>`);
                    break;
                case "itemList":
                    instanceWindow.state.title = branding.itemList.replace("%0", state.currentRepo[0]);
                    back.style.display = "block";
                    this.screen.appendChild(html`<${ItemList}/>`);
                    break;
                case "overview":
                    instanceWindow.state.title = branding.overview.replace("%0", state.currentRepo[0]).replace("%1", state.currentItem.name);
                    back.style.display = "block";
                    this.screen.appendChild(html`<${Overview}/>`);
                    break;
            }
        });
    }

    this.css = css`
        #topbar {
            position: fixed;
            display: block;
            width: 100%;
            height: 28px;
            background-color: rgba(32,33,36,0.8);
            backdrop-filter: blur(8px);
            border-bottom: #bdbdbd;
            top: 0;
            user-select: none;
            z-index: 1000;
        }
    `;

    return html`
        <div>
            <div id="topbar"></div>
            <div bind:this=${use(this.screen)}></div>
        </div>
    `;

}

document.body.appendChild(html`<${App} />`);