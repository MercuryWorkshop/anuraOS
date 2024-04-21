import RepoList from "./screens/RepoList.mjs";
import ItemList from "./screens/ItemList.mjs";
import Overview from "./screens/Overview.mjs";
const { Store } = await anura.import("anura.libstore@2.0.0");

const branding = anura.settings.get("marketplace-branding") || {
    repoList: "Marketplace",
    itemList: "Marketplace | %0",
    overview: "Marketplace | %0/%1",
}

// Wrapped in a fragment because for some reason html`<style />` doesn't work
document.head.appendChild(html`<><style>${anura.ui.theme.css()}</style></>`);

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

const url = new URL(window.location.href);
let fullArgs = ExternalApp.deserializeArgs(url.searchParams.get("args"));

if (fullArgs[0] == "URI") {
    fullArgs.shift();
    let newArgs = [];
    for (let i = 0; i < fullArgs.length; i++) {
        let current = fullArgs[i];
        if (i == 0) {
            current = current.replace("//", "");
        }
        if (current === "view") {
            let capitalized = fullArgs[i + 1].charAt(0).toUpperCase() + fullArgs[i + 1].slice(1);
            newArgs.push((current + capitalized));
            i++;
        } else {
            newArgs.push(decodeURIComponent(current));
        }
    }
    fullArgs = newArgs;
}

if (fullArgs.length > 1) {
    const [action, ...args] = fullArgs;
    switch (action) {
        case "add":
            saved.repos.push(args);
            state.currentRepo = [...args, await marketplace.getRepo(args[1])];
            break;
        case "remove":
            saved.repos = saved.repos.filter(repo => repo[0] !== args[0]);
            break;
        case "viewRepo":
            {
                let [name, url] = saved.repos.find(repo => repo[0] === args[0]);
                state.currentRepo = [name, url, await marketplace.getRepo(url)];
                state.currentScreen = "itemList";
            }
            break;
        case "viewApp":
            {
                let [name, url] = saved.repos.find(repo => repo[0] === args[0]);
                state.currentRepo = [name, url, await marketplace.getRepo(url)];
                state.currentItem = await state.currentRepo[2].getApp(args[1]);
                state.currentItemType = "app";
                state.currentScreen = "overview";
            }
            break;
        case "viewLib":
            {
                let [name, url] = saved.repos.find(repo => repo[0] === args[0]);
                state.currentRepo = [name, url, await marketplace.getRepo(url)];
                state.currentItem = await state.currentRepo[2].getLib(args[1]);
                state.currentItemType = "lib";
                state.currentScreen = "overview";
            }
            break;
    }
}

// Example URIs:
// marketplace://add:Anura%20App%20Repository:https%3A%2F%2Fraw.githubusercontent.com%2FMercuryWorkshop%2Fanura-repo%2Fmaster%2F
// marketplace://remove:Anura%20App%20Repository
// marketplace://view:repo:Anura%20App%20Repository
// marketplace://view:app:Anura%20App%20Repository:games.run3
// marketplace://view:lib:Anura%20App%20Repository:anura.flash.handler

if (!anura.uri.has("marketplace")) {
    anura.uri.set("marketplace", {
        handler: {
            tag: "app",
            pkg: instance.package,
            method: {
                tag: "split",
                separator: ":",
            }
        },
        prefix: "URI"
    });
}


function App() {
    this.mount = () => {
        handle(use(state.currentScreen), (screen) => {
            this.screen.innerHTML = "";
            switch (screen) {
                case "repoList":
                    instanceWindow.state.title = "Marketplace";
                    back.style.display = "none";
                    this.screen.appendChild(html`
                      <div style="display: grid; place-items: center;height:100%">
                      <div style="display: flex; align-items: center; justify-content: center;margin-bottom:28px;">
                      <img src="./playstore.webp" style="width: 5rem; height: 5rem; display: inline; margin-right: 1.5rem;"/>
                      <span>
                      <h1 style="margin-bottom: 2px;">Welcome to Marketplace</h1>
                      <p>Click a repository to view its contents.</p> 
                      </span>
                      </div>
                      </div>
                      `);
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
            backdrop-filter: blur(8px);
            border-bottom: #bdbdbd;
            top: 0;
            user-select: none;
            z-index: 1000;
        }

        .matter-button-contained {
            background-color: var(--theme-accent);
            color: var(--theme-fg);
        }
    `;

    return html`
        <div>
            <div id="topbar" style=${{
                backgroundColor: anura.ui.theme.background + "cc",
            }}></div>
            <div id="content">
            <div style="position: absolute; width: 30%; height: calc(100% - 28px); top: 28px; left: 0;"><${RepoList}/></div>
            <div style="position: absolute; width: 70%; height: calc(100% - 28px); top: 28px; right: 0;" bind:this=${use(this.screen)}></div>
            </div>
        </div>
    `;

}

document.body.appendChild(html`<${App} />`);
