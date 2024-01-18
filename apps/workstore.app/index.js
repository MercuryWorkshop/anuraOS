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
<<<<<<< Updated upstream
    appListScreen.style.display = "";
    appListScreen.innerHTML = "";
    repoList.style.display = "none";
    document.getElementById("head").innerHTML = "< Go Back";
=======
    
    window.client = window.client || await createBareClient(anura.settings.get("bare-url")); // define the bare client if its not defined already

    appListScreen.style.display = ''
    appListScreen.innerHTML = ''
    repoList.style.display = 'none'
    document.getElementById("head").innerHTML = repo;
>>>>>>> Stashed changes

    const search = document.createElement("input");

<<<<<<< Updated upstream
    search.setAttribute("type", "text");
    search.setAttribute("placeholder", "Search for apps...");

    search.addEventListener("input", function () {
=======
    search.setAttribute('type', 'text');
    search.setAttribute('placeholder', 'Search for apps...');
    search.setAttribute('class', 'search');
    search.addEventListener('input', function() {
>>>>>>> Stashed changes
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
    
<<<<<<< Updated upstream
    libs.forEach(async (lib) => {
        const libElem = document.createElement("button");
        const thumbnail = document.createElement("img");
        const itemText = document.createElement("span");
=======
    for (const item in repoItems['apps']) {
        console.log(item)
        const app = document.createElement('div')
        const install = document.createElement('input')
        const thumbnail = document.createElement('img')
        const itemText = document.createElement('span')
        const itemDesc = document.createElement('p')
        
        async function thumbLoad() {
            try {
                thumbnail.src = URL.createObjectURL(await (await fetch(repos[repo] + repoItems['apps'][item]['icon'])).blob())
            } catch (e) {
                // Probably a network error, the sysadmin might have blocked the repo, this isn't the default because its a massive waste of bandwidth
                thumbnail.src = URL.createObjectURL(await (await client.fetch(repos[repo] + repoItems['apps'][item]['icon'])).blob())
            }
        }
        thumbLoad();
        
        itemText.innerText = repoItems['apps'][item]['name']
        itemDesc.innerText = repoItems['apps'][item]['desc']
        app.className = 'app'
        install.type = 'button'
        install.value = 'Install'
        
        app.appendChild(install);
        app.appendChild(thumbnail);
        app.appendChild(itemText);
        app.appendChild(itemDesc); //yay
        const dataUrl = repos[repo] + repoItems['apps'][item]['data']
        install.onclick = async function() {
            anura.notifications.add({
                title: "Workstore application",
                description: `Workstore is downloading ${itemText.innerText}`,
                timeout: 5000
            })
            let file;
            try {
                console.log(dataUrl)
                file = await ((await client.fetch(dataUrl))).blob();
            } catch (e) {
                anura.notifications.add({
                    title: "Workstore application",
                    description: `Workstore failed to download ${itemText.innerText} with error ${e}`,
                    timeout: 5000
                })
            }
            const path = '/userApps/' + itemText.innerText + '.app';
            await new Promise((resolve) => (new fs.Shell()).mkdirp(path, function () {
                resolve()
            }))
            
            anura.notifications.add({
                title: "Workstore application",
                description: `Workstore is installing ${itemText.innerText}`,
                timeout: 5000
            })
            let zip = await JSZip.loadAsync(file);
            let postInstallScript = null;
            console.log(path)
            try {
                for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
                    if (zipEntry.dir) {
                        fs.mkdir(`${path}/${zipEntry.name}`)
                    } else {
                        console.log(zipEntry)
                        console.log(await zipEntry.async("arraybuffer"))
                        if (zipEntry.name == 'post_install.js') {
                            let script = await zipEntry.async("string")
                            postInstallScript = script
                            continue;
                        }
                        fs.writeFile(`${path}/${zipEntry.name}`, await Buffer.from(await zipEntry.async("arraybuffer")))
                    }
                }
>>>>>>> Stashed changes

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
