let Store;
let client;
let marketplace;

const libstoreCache = {};

frameElement.parentNode.style.position = "absolute";
frameElement.parentNode.style.height = "100%";
const titlebar = Array
    .from(frameElement.parentNode.parentNode.children)
    .filter(e => e.classList.contains("title"))[0];

titlebar.style.backgroundColor = "rgba(0, 0, 0, 0)"
// titlebar.style.position = "absolute";
// titlebar.style.left = "auto";
// titlebar.style.right = "0";

titlebar.insertBefore(back, titlebar.children[1]);

// const innerTitleBar = document.getElementById("innerTitleBar");
// // innerTitleBar.addEventListener("resize", (e) => {
// //     titlebar.style.width = e.detail.width + 84 + "px";
// // })
// const observer = new ResizeObserver((entries) => {
//     entries.forEach((entry) => {
//        if (entry.target === innerTitleBar) titlebar.style.width = entry.contentRect.width - 88 + "px";
//     });
// });
// observer.observe(innerTitleBar);

async function loadMainScreen() {
    back.style.display = "none";

    libstoreCache["2.0.0"] ??= (await anura.import("anura.libstore@2.0.0"));

    marketplace = marketplace ??= new libstoreCache["2.0.0"].Store((anura.net), {
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

    repoList.innerHTML = ''
    appListScreen.style.display = 'none'
    overviewScreen.style.display = 'none'
    repoList.style.display = ''
    // document.getElementById("head").innerHTML = "Select a Repository";
    instanceWindow.state.title = "Select a Repository";

    for (const repo in repos) {
        const repoItem = document.createElement('div')
        repoItem.innerText = repo
        repoItem.oncontextmenu = (e) => {
            const newcontextmenu = new anura.ContextMenu();
            newcontextmenu.addItem("Delete Repo", async function () {
                delete repos[repo];
                await anura.settings.set('workstore-repos', repos)
                loadMainScreen();
            });
            const boundingRect = window.frameElement.getBoundingClientRect();
            newcontextmenu.show(e.pageX + boundingRect.x, e.pageY + boundingRect.y)
            document.onclick = (e) => {
                document.onclick = null;
                newcontextmenu.hide();
                e.preventDefault();
            }
            e.preventDefault()
        }
        (async function () { // check repo status
            try {
                const marketplaceRepo = await marketplace.getRepo(repos[repo], repo);
                console.log(marketplaceRepo)
                repoItem.onclick = async function () {
                    await loadappListScreen(marketplaceRepo);
                }
            } catch (e) {
                repoItem.innerText += " (Error)";
                repoItem.style.color = "red";
                repoItem.onclick = async function () {
                    anura.notifications.add({
                        title: "Marketplace",
                        description: "The repository " + repo + " encountered an error: " + e,
                        timeout: 5000,
                    });
                }
            }
        })()
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
        newRepoButton.onclick = function () {
            if (!newRepoURL.value.endsWith("/")) {
                anura.notifications.add({
                    title: "Marketplace",
                    description: "URL does not end with a \"/\" character",
                    timeout: 5000,
                });
                return;
            }
            const repoItem = document.createElement('div')
            repoItem.innerText = newRepoName.value
            if (repos[newRepoName.value]) {
                anura.notifications.add({
                    title: "Marketplace",
                    description: "Repo is already added",
                    timeout: 5000,
                });
                return;
            }
            repos[newRepoName.value] = newRepoURL.value;
            repoItem.onclick = function () {
                loadappListScreen(newRepoName.value)
            }
            repoItem.className = "repoItem";
            repoList.appendChild(repoItem)
            anura.settings.set('workstore-repos', repos)
            loadMainScreen();
        }
        newRepo.className = "repoAdd"
        newRepo.appendChild(newRepoName)
        newRepo.appendChild(newRepoURL)
        newRepo.appendChild(newRepoButton)
        repoList.appendChild(newRepo)
    }


}

loadMainScreen()