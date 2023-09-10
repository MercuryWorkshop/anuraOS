let anura = window.parent.anura;
const fs = Filer.fs
const Buffer = Filer.Buffer;
let repos = anura.settings.get('workstore-repos') || { "Anura App Repository": "https://raw.githubusercontent.com/MercuryWorkshop/anura-repo/master/" }

const repoList = document.getElementById('repoList');
const repoScreen = document.getElementById('repoScreen');
const appListScreen = document.getElementById('appListScreen')
const appInstallerScreen = document.getElementById('appInstallerScreen');



async function loadappListScreen(repo) {

  window.client = window.client || await createBareClient(anura.settings.get("bare-url")); // define the bare client if its not defined already

  appListScreen.style.display = ''
  appListScreen.innerHTML = ''
  repoList.style.display = 'none'

  const repoItems = await getRepo(repo)
  const appList = document.createElement('div')

  for (const item in repoItems['apps']) {
    console.log(item)
    const app = document.createElement('button')
    const thumbnail = document.createElement('img')
    const itemText = document.createElement('span')


    thumbnail.src = URL.createObjectURL(await (await client.fetch(repos[repo] + repoItems['apps'][item]['icon'])).blob()) // in dire need of lazy loading
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
      await new Promise((resolve) => (new fs.Shell()).mkdirp(path, function() {
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
        await zip.forEach(async function(relativePath, zipEntry) {  // 2) print entries
          if (zipEntry.dir) {
            fs.mkdir(`${path}/${zipEntry.name}`)
          } else {
            console.log(zipEntry)
            console.log(await zipEntry.async("arraybuffer"))
            fs.writeFile(`${path}/${zipEntry.name}`, await Buffer.from(await zipEntry.async("arraybuffer")))
            if (zipEntry.name == "manifest.json") {
              await anura.registerExternalApp('/fs' + path)
              addAppReceipt(itemText.innerText + ".app", repo, itemText.innerText);
              anura.notifications.add(
                {
                  title: "Application Installed",
                  description: `Application ${itemText.innerText} has been installed.`,
                  timeout: 50000
                })
            }
          }
        }, function(e) {
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

async function removeApp(app, package) { // eg: app = "run 3.app", package = "game.run3"
  const appObject = anura.apps[package]
  await anura.unregisterApp(appObject)
  new fs.Shell().rm(`/userApps/${app}`, {
    recursive: true,
  })

  anura.notifications.add({
    title: "Workstore application",
    description: `Workstore uninstalled ${appObject.package}`,
    timeout: 5000
  })

}

async function getRepo(repo) {
  await addCacheFile();

  return await new Promise((res) => {
    fs.readFile("/workstore_cache.json", async (e, contents) => {
      if (e) throw e;
      cacheData = JSON.parse(new TextDecoder("utf-8").decode(contents))
      if (cacheData["cachedRepos"][repo]) {
        res(cacheData["cachedRepos"][repo])
        return;// posibly unessarry, dont want to check docs 
      }

      const info = await (await client.fetch(repos[repo] + 'list.json')).json()

      cacheData["cachedRepos"][repo] = info
      fs.writeFile("/workstore_cache.json", JSON.stringify(cacheData), (e) => { if (e) throw e; })
      res(cacheData["cachedRepos"][repo])
    })
  })

}

function delAppReceipt(app) {

  fs.readFile("/workstore_cache.json", (e, contents) => {
    if (e) throw e;
    cacheData = JSON.parse(new TextDecoder("utf-8").decode(contents))
    delete cacheData["installedApps"][app];

    fs.writeFile("/workstore_cache.json", JSON.stringify(cacheData), (e) => { if (e) throw e; })
  })
}
async function addAppReceipt(app, repo, name) {
  await addCacheFile()
  fs.readFile("/workstore_cache.json", async (e, contents) => {
    if (e) throw e;
    cacheData = JSON.parse(new TextDecoder("utf-8").decode(contents))
    let package = await new Promise((res) => {
      fs.readFile(`/userApps/${app}/manifest.json`, (e, contents) => {
        if (e) throw e;
        manifestData = JSON.parse(new TextDecoder("utf-8").decode(contents))
        res(manifestData["package"]);
      })
    })
    cacheData["installedApps"][app] = { "app": app, "repo": repo, "name": name, "package": package };

    fs.writeFile("/workstore_cache.json", JSON.stringify(cacheData), (e) => { if (e) throw e; })
  })
}

function addCacheFile() {
  return new Promise((res) => {
    fs.exists("/workstore_cache.json", (exists) => {
      if (exists) return; // TODO: corruption checking should be done here

      const cacheTemplate = JSON.stringify({
        "installedApps": {}, // npm like system @repo/app should be implemented in the future
        "cachedRepos": {}
      })

      fs.writeFile("/workstore_cache.json", cacheTemplate, (e) => { res(); if (e) throw e; })
    })
  })
}
