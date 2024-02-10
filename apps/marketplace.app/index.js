// This is a workaround for a strange bug where the anura object is undefined
// after deleting a repo or adding a new one
let anura = window.top.anura;

let repos = anura.settings.get("workstore-repos") || {
    "Anura App Repository":
        "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/",
    "Anura Games": "https://anura.games/",
    "Kxtz's Emulators": "https://anura.kxtz.dev/emulators/",
};

const repoList = document.getElementById("repoList");
const repoScreen = document.getElementById("repoScreen");
const overviewScreen = document.getElementById("overviewScreen");
const appListScreen = document.getElementById("appListScreen");
const appInstallerScreen = document.getElementById("appInstallerScreen");
const repoListButton = document.getElementById("repoListButton");

repoListButton.addEventListener("click", async function (evt) {
    if (evt.target.dataset.repo) {
        // We were on the overview screen, so load the app list
        const marketplaceRepo = await marketplace.getRepo(repos[evt.target.dataset.repo], evt.target.dataset.repo);
        loadappListScreen(marketplaceRepo, evt.target.dataset.repo_version);
        return;
    }
    loadMainScreen();
});

async function loadappListScreen(repo, repoVersion) {
    appListScreen.style.display = ''
    appListScreen.innerHTML = ''
    repoList.style.display = 'none'
    overviewScreen.style.display = 'none'
    repoListButton.style.display = '';
    document.getElementById("head").innerHTML = repo.name;

    delete repoListButton.dataset.repo;
    repoListButton.value = "Repo List";

    const search = document.createElement("input");

    search.setAttribute('type', 'text');
    search.setAttribute('placeholder', 'Search for apps...');
    search.style.color = 'white'
    search.setAttribute('class', 'search');
    search.addEventListener('input', function() {
        const searchQuery = this.value.toLowerCase();
        const appButtons = document.querySelectorAll(".app");

        appButtons.forEach((appButton) => {
            const appName = appButton
                .querySelector("span")
                .innerText.toLowerCase();
            if (searchQuery === "") {
                appButton.style.display = "";
            } else if (appName.includes(searchQuery)) {
                appButton.style.display = "";
            } else {
                appButton.style.display = "none";
            }
        });
    });

    appListScreen.appendChild(search);

    const appList = document.createElement("div");

    let apps = await repo.getApps()
    let libs = await repo.getLibs()

    apps.forEach(async (app) => {
        const appElem = document.createElement('div')
        const thumbnailContainer = document.createElement('div');
        const thumbnail = document.createElement('img')
        const infoContainer = document.createElement('div');
        const itemText = document.createElement('span')
        const itemDesc = document.createElement('p')
        const view = document.createElement('input')

        itemText.innerText = app.name;
        if (repoVersion == "legacy") {
            itemDesc.innerText = app.desc;
            thumbnail.src = await repo.getAppThumb(app.name);
        } else {
            itemDesc.innerText = app.summary;
            thumbnail.src = await repo.getAppThumb(app.package);
        }

        appElem.className = 'app'
        thumbnailContainer.className = 'thumbnailContainer'
        infoContainer.className = 'infoContainer'
        view.type = 'button'
        view.value = 'View'
        
        view.onclick = () => {
            // repo.installApp(app.name);
            // nuh uh
            loadOverviewScreen(repo, app, repoVersion);
        };

        thumbnailContainer.appendChild(thumbnail);
        appElem.appendChild(thumbnailContainer);
        infoContainer.appendChild(itemText);
        infoContainer.appendChild(itemDesc);
        appElem.appendChild(infoContainer);
        appElem.appendChild(view);
        appList.appendChild(appElem);
    });
    
    libs.forEach(async (lib) => {
        const libElem = document.createElement('div')
        const thumbnailContainer = document.createElement('div');
        const thumbnail = document.createElement('img')
        const infoContainer = document.createElement('div');
        const itemText = document.createElement('span')
        const itemDesc = document.createElement('p')
        const view = document.createElement('input')

        itemText.innerText = lib.name;
        if (repoVersion == "legacy") {
            itemDesc.innerText = lib.desc;
            thumbnail.src = await repo.getLibThumb(lib.name);
        } else {
            itemDesc.innerText = lib.summary;
            thumbnail.src = await repo.getLibThumb(lib.package);
        }

        libElem.className = 'app'
        thumbnailContainer.className = 'thumbnailContainer'
        infoContainer.className = 'infoContainer'
        view.type = 'button'
        view.value = 'View'
        
        view.onclick = () => {
            // repo.installLib(lib.name);
            // nuh uh
            loadOverviewScreen(repo, lib, repoVersion);
        };

        thumbnailContainer.appendChild(thumbnail);
        libElem.appendChild(thumbnailContainer);
        infoContainer.appendChild(itemText);
        infoContainer.appendChild(itemDesc);
        libElem.appendChild(infoContainer);
        libElem.appendChild(view);
        appList.appendChild(libElem);
    });
    appListScreen.appendChild(appList);
}
