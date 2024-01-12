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
const appListScreen = document.getElementById("appListScreen");
const appInstallerScreen = document.getElementById("appInstallerScreen");

async function loadappListScreen(repo) {
    appListScreen.style.display = "";
    appListScreen.innerHTML = "";
    repoList.style.display = "none";
    document.getElementById("head").innerHTML = "< Go Back";

    const search = document.createElement("input");

    search.setAttribute("type", "text");
    search.setAttribute("placeholder", "Search for apps...");

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

    let apps = await repo.getApps()
    let libs = await repo.getLibs()

    apps.forEach(async (app) => {
        const appElem = document.createElement("button");
        const thumbnail = document.createElement("img");
        const itemText = document.createElement("span");

        itemText.innerText = app.name;
        appElem.title = app.desc; 
        appElem.className = "app";
        thumbnail.src = await repo.getAppThumb(app.name);

        appElem.appendChild(thumbnail);
        appElem.appendChild(itemText);
        
        appElem.onclick = () => {
            repo.installApp(app.name);
        };

        appList.appendChild(appElem);
    });
    
    libs.forEach(async (lib) => {
        const libElem = document.createElement("button");
        const thumbnail = document.createElement("img");
        const itemText = document.createElement("span");

        itemText.innerText = lib.name;
        libElem.title = lib.desc; 
        libElem.className = "app";
        thumbnail.src = await repo.getLibThumb(lib.name);

        libElem.appendChild(thumbnail);
        libElem.appendChild(itemText);
        
        libElem.onclick = () => {
            repo.installLib(lib.name);
        };

        appList.appendChild(libElem);
    });
    appListScreen.appendChild(appList);
}
