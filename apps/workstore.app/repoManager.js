let Workstore;
let client;
let workstore;

async function loadMainScreen() {
    Workstore = Workstore || (await anura.import("anura.libstore")).Workstore;

    client = client ||
        (await createBareClient(anura.settings.get("bare-url"))); // define the bare client if its not defined already
    
    console.log(client);

    workstore = workstore || new Workstore((await createBareClient(anura.settings.get("bare-url"))), {
        onError: (appName, error) => {
            anura.notifications.add({
                title: "Workstore Application",
                description: `Workstore encountered an error while installing ${appName}: ${error}`,
                timeout: 5000,
            });
        },
        onDownloadStart: (appName) => {
            anura.notifications.add({
                title: "Workstore Application",
                description: `Workstore started downloading ${appName}`,
                timeout: 5000,
            });
        },
        onDepInstallStart: (appName, libName) => {
            anura.notifications.add({
                title: "Workstore Application",
                description: `Workstore started installing dependency ${libName} for ${appName}`,
                timeout: 5000,
            });
        },
        onComplete: (appName) => {
            anura.notifications.add({
                title: "Workstore Application",
                description: `Workstore finished installing ${appName}`,
                timeout: 5000,
            });
        },
    });

    repoList.innerHTML = ''
    appListScreen.style.display = 'none'
    repoList.style.display = ''
    document.getElementById("head").innerHTML = "Workstore";
    
    for (const repo in repos) {
        const repoItem = document.createElement('div')
        repoItem.innerText = repo
        repoItem.oncontextmenu = (e) => {
            const newcontextmenu = new anura.ContextMenu();
            newcontextmenu.addItem("Delete Repo", async function() {
                delete repos[repo];
                await anura.settings.set('workstore-repos', repos)
                loadMainScreen();
            });
            newcontextmenu.show(e.clientX, e.clientY)
            document.onclick = (e) => {
                document.onclick = null;
                newcontextmenu.hide();
                e.preventDefault();
            }
            e.preventDefault()
        }
        try {
            const workstoreRepo = await workstore.getRepo(repos[repo]);
            repoItem.onclick = async function() {
                loadappListScreen(workstoreRepo); 
            }
        } catch (e) {
            repoItem.innerText += " (Error)";
            repoItem.style.color = "red";
            repoItem.onclick = async function() {
                anura.notifications.add({
                    title: "Workstore Application",
                    description: "The repository " + repo + " encountered an error: " + e,
                    timeout: 5000,
                });
            }
        }

        repoItem.className = "repoItem"
        repoList.appendChild(repoItem)
    }
    {
        const newRepo = document.createElement('div')
        const newRepoName = document.createElement('input')
        const newRepoURL = document.createElement('input')
        const newRepoButton = document.createElement('input')
        newRepoName.placeholder = "My Repo"
        newRepoURL.placeholder = "https://anura.repo/"
        newRepoButton.type = 'submit'
        newRepoButton.value = 'add repo'
        newRepoButton.onclick = function() {
            if (!newRepoURL.value.endsWith("/")) {
                anura.notifications.add({
                    title: "Workstore",
                    description: "URL does not end with a \"/\" character",
                    timeout: 5000,
                });
                return;
            }
            const repoItem = document.createElement('div')
            repoItem.innerText = newRepoName.value
            if (repos[newRepoName.value]) {
                anura.notifications.add({
                    title: "Workstore",
                    description: "Repo is already added",
                    timeout: 5000,
                });
                return;
            }
            repos[newRepoName.value] = newRepoURL.value;
            repoItem.onclick = function() {
                loadappListScreen(newRepoName.value)
            }
            repoItem.className = "repoItem";
            repoList.appendChild(repoItem)
            anura.settings.set('workstore-repos', repos)
            loadMainScreen();
        }
        newRepo.className = "repoItem"
        newRepo.appendChild(newRepoName)
        newRepo.appendChild(newRepoURL)
        newRepo.appendChild(newRepoButton)
        repoList.appendChild(newRepo)
    }
        

}
loadMainScreen()
