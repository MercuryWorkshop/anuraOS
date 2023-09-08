let anura = window.parent.anura;
const fs = Filer.fs
const Buffer = Filer.Buffer;
let repos = anura.settings.get('workstore-repos') || {"Main repo": "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/"}

const repoList = document.getElementById('repoList');
const repoScreen = document.getElementById('repoScreen');
const appListScreen = document.getElementById('appListScreen')
const appInstallerScreen = document.getElementById('appInstallerScreen');



async function loadappListScreen(repo) {
    
    window.client = window.client || await createBareClient(anura.settings.get("bare-url")); // define the bare client if its not defined already

    appListScreen.style.display = ''
    appListScreen.innerHTML = ''
    repoList.style.display = 'none'
    
    const repoItems = await (await client.fetch(repos[repo] + 'list.json')).json()
    const appList = document.createElement('div')
    
    for (const item in repoItems['apps']) {
        console.log(item)
        const app = document.createElement('button')
        const thumbnail = document.createElement('img')
        const itemText = document.createElement('span')
        
        itemText.innerText = repoItems['apps'][item]['name']
        thumbnail.src = repos[repo] + repoItems['apps'][item]['icon']
        app.title = repoItems['apps'][item]['desc'] // idk why the tooltip is called title but whatever
        app.className = 'app'
        
        app.appendChild(itemText);
        app.appendChild(thumbnail);
        const dataUrl = repos[repo] + repoItems['apps'][item]['data']
        app.onclick = async function() {
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
            console.log(path)
            try {
                await zip.forEach(async function (relativePath, zipEntry) {  // 2) print entries
                    if (zipEntry.dir) {
                        fs.mkdir(`${path}/${zipEntry.name}`)
                    } else {
                        console.log(zipEntry)
                        console.log(await zipEntry.async("arraybuffer"))
                        fs.writeFile(`${path}/${zipEntry.name}`, await Buffer.from(await zipEntry.async("arraybuffer")))
                        if (zipEntry.name == "manifest.json") {
                            await anura.registerExternalApp('/fs' + path)
                            anura.notifications.add(
                                {
                                    title: "Application Installed",
                                    description: `Application ${itemText.innerText} has been installed.`,
                                    timeout: 50000
                                })
                        }
                    }
                }, function (e) {
                    anura.notifications.add({
                        title: "Application ZIP extraction error",
                        description: `Application had an error installing: ${e}`,
                        timeout: 50000
                    })
                    console.error(e)
                })
            } catch (e) {
                anura.notifications.add({
                    title: "Workstore application",
                    description: `Workstore failed to install ${itemText.innerText}`,
                    timeout: 5000
                })
            }
        }
        appList.appendChild(app)
    }
    appListScreen.appendChild(appList)

}
