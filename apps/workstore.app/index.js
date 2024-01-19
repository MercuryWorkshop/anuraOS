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
    appListScreen.style.display = ''
    appListScreen.innerHTML = ''
    repoList.style.display = 'none'
    document.getElementById("head").innerHTML = repo.name;

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
        const install = document.createElement('input')
        const thumbnail = document.createElement('img')
        const itemText = document.createElement('span')
        const itemDesc = document.createElement('p')

        itemText.innerText = app.name;
        itemDesc.innerText = app.desc;
        thumbnail.src = await repo.getAppThumb(app.name);

        appElem.className = 'app'
        install.type = 'button'
        install.value = 'Install'
        
        install.onclick = () => {
            repo.installApp(app.name);
        };

        appElem.appendChild(install);
        appElem.appendChild(thumbnail);
        appElem.appendChild(itemText);
        appElem.appendChild(itemDesc);
        appListScreen.appendChild(appElem)
    });
    
    libs.forEach(async (lib) => {
        const libElem = document.createElement('div')
        const install = document.createElement('input')
        const thumbnail = document.createElement('img')
        const itemText = document.createElement('span')
        const itemDesc = document.createElement('p')

        itemText.innerText = lib.name;
        itemDesc.innerText = lib.desc;
        thumbnail.src = await repo.getLibThumb(lib.name);

        libElem.className = 'app'
        install.type = 'button'
        install.value = 'Install'
        
        install.onclick = () => {
            repo.installLib(lib.name);
        };

        libElem.appendChild(install);
        libElem.appendChild(thumbnail);
        libElem.appendChild(itemText);
        libElem.appendChild(itemDesc);
        appListScreen.appendChild(libElem)
    });
}
