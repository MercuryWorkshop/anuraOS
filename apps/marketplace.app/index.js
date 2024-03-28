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
// const repoListButton = document.getElementById("repoListButton");
// const repoListButtonLabel = document.getElementById("repoListButtonLabel");

const back = document.createElement("button");
back.classList.add("windowButton");
back.style.width = "24px";
back.style.height = "24px";
back.style.display = "none";

const backIcon = document.createElement("span");
backIcon.classList.add("material-symbols-outlined");
backIcon.innerText = "arrow_back";
backIcon.style.fontSize = "16px";
backIcon.style.lineHeight = "24px";

back.appendChild(backIcon);

back.addEventListener("mousedown", function (evt) {
    evt.stopPropagation();
});

back.addEventListener("click", async function (evt) {
    if (back.dataset.repo) {
        // We were on the overview screen, so load the app list
        const marketplaceRepo = await marketplace.getRepo(
            repos[back.dataset.repo],
            back.dataset.repo,
        );
        loadappListScreen(marketplaceRepo);
        return;
    } else {
        loadMainScreen();
    }
});

async function loadappListScreen(repo) {
    appListScreen.style.display = "";
    appListScreen.innerHTML = "";
    repoList.style.display = "none";
    overviewScreen.style.display = "none";
    back.style.display = "";
    // document.getElementById("head").innerHTML = repo.name;
    instanceWindow.state.title = repo.name;

    delete back.dataset.repo;
    back.value = "Repo List";

    const search = document.createElement("input");

    search.setAttribute("type", "text");
    search.setAttribute("placeholder", "Search for apps...");
    search.style.color = "white";
    search.setAttribute("class", "search");
    search.addEventListener("input", function () {
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
    appList.id = "appList";

    let apps = await repo.getApps();
    let libs = await repo.getLibs();

    apps.forEach(async (app) => {
        const appElem = document.createElement("div");
        const thumbnailContainer = document.createElement("div");
        const thumbnail = document.createElement("img");
        const infoContainer = document.createElement("div");
        const itemText = document.createElement("span");
        const itemDesc = document.createElement("p");

        const installButton = document.createElement("input");

        itemText.innerText = app.name;
        if (repo.version == "legacy") {
            itemDesc.innerText = app.desc;
            thumbnail.src = await repo.getAppThumb(app.name);
        } else {
            itemDesc.innerText = app.summary;
            thumbnail.src = await repo.getAppThumb(app.package);
        }

        appElem.className = "app";
        thumbnailContainer.className = "thumbnailContainer";
        infoContainer.className = "infoContainer";

        let query;
        if (repo.version == "legacy") {
            query = app.name;
        } else {
            query = app.package;
        }

        installButton.classList.add("overview-installButton");
        installButton.classList.add("matter-button-contained");
        installButton.type = "button";

        if (
            anura.apps[app.package] ||
            (repo.version == "legacy" && anura.apps[app.name])
        ) {
            installButton.style.backgroundColor = "#2a2a2a";
            installButton.style.color = "#fff";
            installButton.disabled = true;
            installButton.value = "Installed";
        } else {
            installButton.classList.add("matter-success");
            installButton.onclick = async () => {
                await repo.installApp(query);
            };
            installButton.value = "Install";
        }

        appElem.onclick = () => {
            loadOverviewScreen(repo, app);
        };

        thumbnailContainer.appendChild(thumbnail);
        appElem.appendChild(thumbnailContainer);
        infoContainer.appendChild(itemText);
        infoContainer.appendChild(itemDesc);
        appElem.appendChild(infoContainer);
        appElem.appendChild(installButton);
        appList.appendChild(appElem);
    });

    libs.forEach(async (lib) => {
        const libElem = document.createElement("div");
        const thumbnailContainer = document.createElement("div");
        const thumbnail = document.createElement("img");
        const infoContainer = document.createElement("div");
        const itemText = document.createElement("span");
        const itemDesc = document.createElement("p");
        const installButton = document.createElement("input");

        itemText.innerText = lib.name;
        if (repo.version == "legacy") {
            itemDesc.innerText = lib.desc;
            thumbnail.src = await repo.getLibThumb(lib.name);
        } else {
            itemDesc.innerText = lib.summary;
            thumbnail.src = await repo.getLibThumb(lib.package);
        }

        libElem.className = "app";
        thumbnailContainer.className = "thumbnailContainer";
        infoContainer.className = "infoContainer";

        let query;
        if (repo.version == "legacy") {
            query = lib.name;
        } else {
            query = lib.package;
        }

        installButton.classList.add("overview-installButton");
        installButton.classList.add("matter-success");
        installButton.classList.add("matter-button-contained");
        installButton.type = "button";

        if (
            anura.apps[lib.package] ||
            (repo.version == "legacy" && anura.apps[lib.name])
        ) {
            installButton.style.backgroundColor = "#2a2a2a";
            installButton.style.color = "#fff";
            installButton.disabled = true;
            installButton.value = "Installed";
        } else {
            installButton.classList.add("matter-success");
            installButton.onclick = async () => {
                await repo.installLib(query);
            };
            installButton.value = "Install";
        }

        libElem.onclick = () => {
            loadOverviewScreen(repo, lib);
        };

        thumbnailContainer.appendChild(thumbnail);
        libElem.appendChild(thumbnailContainer);
        infoContainer.appendChild(itemText);
        infoContainer.appendChild(itemDesc);
        libElem.appendChild(infoContainer);
        libElem.appendChild(installButton);
        appList.appendChild(libElem);
    });
    appListScreen.appendChild(appList);
}
