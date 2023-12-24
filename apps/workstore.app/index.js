let anura = window.parent.anura;
const fs = Filer.fs
const Buffer = Filer.Buffer;
let repos = anura.settings.get('workstore-repos') || {"Anura App Repository": "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/"}

const repoList = document.getElementById('repoList');
const repoScreen = document.getElementById('repoScreen');
const appListScreen = document.getElementById('appListScreen')
const appInstallerScreen = document.getElementById('appInstallerScreen');


// background-image: radial-gradient(#666 1px, transparent 0);
 //   background-size: 20px 20px;
//   background-position: -19px -19px;

async function loadappListScreen(repo) {
    
    window.client = window.client || await createBareClient(anura.settings.get("bare-url")); // define the bare client if its not defined already

    appListScreen.style.display = ''
    appListScreen.innerHTML = ''
    repoList.style.display = 'none'
    document.getElementById("head").innerHTML = "< Go Back";

    const search = document.createElement('input');

    search.setAttribute('type', 'text');
    search.setAttribute('placeholder', 'Search for apps...');

    search.addEventListener('input', function() {
        const searchQuery = this.value.toLowerCase();
        const appButtons = document.querySelectorAll('.app');

        appButtons.forEach(appButton => {
            const appName = appButton.querySelector('span').innerText.toLowerCase();
            if (searchQuery === '') {
                appButton.style.display = '';
            } else if (appName.includes(searchQuery)) {
                appButton.style.display = '';
            } else {
                appButton.style.display = 'none';
            }
        });
    });

    appListScreen.appendChild(search);

    const repoItems = await (await client.fetch(repos[repo] + 'list.json')).json()
    const appList = document.createElement('div')
    
    for (const item in repoItems['apps']) {
        console.log(item)
        const app = document.createElement('button')
        const thumbnail = document.createElement('img')
        const itemText = document.createElement('span')
        
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
        app.title = repoItems['apps'][item]['desc'] // idk why the tooltip is called title but whatever
        app.className = 'app'
        
        
        app.appendChild(thumbnail);
        app.appendChild(itemText);
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

                await anura.registerExternalApp('/fs' + path)
                if (postInstallScript) window.top.eval(postInstallScript)
                anura.notifications.add(
                {
                    title: "Application Installed",
                    description: `Application ${itemText.innerText} has been installed.`,
                    timeout: 50000
                })
            } catch (e) {
                anura.notifications.add({
                    title: "Workstore application",
                    description: `Workstore failed to install ${itemText.innerText}`,
                    timeout: 5000
                })
                console.error(e)
            }
        }
        appList.appendChild(app)
    }
    appListScreen.appendChild(appList)

}
