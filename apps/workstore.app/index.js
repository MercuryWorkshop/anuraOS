let repos = {"Main repo": "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/"}

const repoList = document.getElementById('repoList');
const repoScreen = document.getElementById('repoScreen');
const appListScreen = document.getElementById('appListScreen')
const appInstallerScreen = document.getElementById('appInstallerScreen');


async function loadappListScreen(repo) {

    appListScreen.style.display = ''
    appListScreen.innerHTML = ''
    repoList.style.display = 'none'
    
    const repoItems = await (await fetch(repos[repo] + 'list.json')).json()
    const appList = document.createElement('div')
    
    for (const item in repoItems['apps']) {
        console.log(item)
        const app = document.createElement('button')
        const thumbnail = document.createElement('img')
        const itemText = document.createElement('span')
        itemText.innerText = repoItems['apps'][item]['name']
        thumbnail.src = repos[repo] + repoItems['apps'][item]['icon']
        app.className = 'app'
        app.appendChild(itemText);
        app.appendChild(thumbnail);
        app.onclick = function() {console.log('todo')}
        appList.appendChild(app)
    }
    appListScreen.appendChild(appList)

}
