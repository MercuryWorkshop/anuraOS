async function loadMainScreen() {
    repoList.innerHTML = ''
    appListScreen.style.display = 'none'
    repoList.style.display = ''
    document.getElementById("head").innerHTML = "Workstore";
    
    for (repo in repos) {
        const repoItem = document.createElement('div')
        repoItem.innerText = repo
        repoItem.oncontextmenu = (e) => {
            const newcontextmenu = new anura.ContextMenu();
            newcontextmenu.addItem("Delete Repo", async function() {
                delete repos[repoItem.innerText];
                await anura.settings.set('workstore-repos', repos)
                location.reload()
            });
            newcontextmenu.show(e.clientX, e.clientY)
            document.onclick = (e) => {
                document.onclick = null;
                newcontextmenu.hide();
                e.preventDefault();
            }
            e.preventDefault()
        }
        repoItem.onclick = function() {
            loadappListScreen(repoItem.innerText) // Weird hack to work around the fact that repo doesn't work but the innertext of the repoitem does
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
        newRepoURL.placeholder = "https://anura.repo"
        newRepoButton.type = 'submit'
        newRepoButton.value = 'add repo'
        newRepoButton.onclick = function() {
            if (!newRepoName.value.endsWith("/")) {
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
            window.location.reload()
        }
        newRepo.className = "repoItem"
        newRepo.appendChild(newRepoName)
        newRepo.appendChild(newRepoURL)
        newRepo.appendChild(newRepoButton)
        repoList.appendChild(newRepo)
    }
        

}
loadMainScreen()
