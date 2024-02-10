// app arg is either app or lib
async function loadOverviewScreen(repo, app, repoVersion) {
    overviewScreen.style.display = ''
    overviewScreen.innerHTML = ''

    repoList.style.display = 'none'
    appListScreen.style.display = 'none'

    repoListButton.dataset.repo = repo.name
    repoListButton.dataset.repo_version = repo.version
    repoListButton.value = repo.name
    let query;
    if (repoVersion == "legacy") {
        query = app.name
    } else {
        query = app.package
    }

    document.getElementById("head").innerHTML = app.name;

    const infoSection = document.createElement('div');
    infoSection.className = 'overview-infoSection';
    const infoContainer = document.createElement('div');
    infoContainer.className = 'overview-infoContainer';
    const thumbnailContainer = document.createElement('div');
    thumbnailContainer.className = 'overview-thumbnailContainer';
    const thumbnail = document.createElement('img');
    thumbnail.className = 'overview-thumbnail';
    const appInfoContainer = document.createElement('div');
    appInfoContainer.className = 'overview-appInfoContainer';
    const appTitle = document.createElement('h1');
    appTitle.className = 'overview-appTitle';
    const appCategory = document.createElement('span');
    appCategory.className = 'overview-appCategory';
    const installButton = document.createElement('input');
    installButton.className = 'overview-installButton';
    installButton.type = 'button';
    installButton.value = 'Install';
    thumbnailContainer.appendChild(thumbnail);
    infoContainer.appendChild(thumbnailContainer);
    appInfoContainer.appendChild(appTitle);
    appInfoContainer.appendChild(appCategory);
    infoContainer.appendChild(appInfoContainer);
    infoContainer.appendChild(installButton);
    infoSection.appendChild(infoContainer);

    const screenshotSection = document.createElement('div');
    screenshotSection.className = 'overview-screenshotSection';
    let screenshotContainer = document.createElement('div');
    screenshotContainer.className = 'overview-screenshotContainer';
    let screenshotDisplay = (src, alt) => { return null; };
    // Will be used after libstore@2.0.0 is released
    // if (false) {
    //     screenshotDisplay = function(src, alt) {
    //         const screenshotElem = document.createElement('img');
    //         screenshotElem.src = screenshot;
    //         screenshotElem.alt = alt;
    //         screenshotElem.title = alt;
    //         screenshotElem.className = 'screenshot';
    //         screenshotContainer.appendChild(screenshotElem);
    //     }
    // }
    screenshotSection.appendChild(screenshotContainer);

    const aboutSection = document.createElement('div');
    aboutSection.className = 'overview-aboutSection';
    const aboutContainer = document.createElement('div');
    aboutContainer.className = 'overview-aboutContainer';
    const aboutTitle = document.createElement('h2'); // Short description
    aboutTitle.className = 'overview-aboutTitle';
    const aboutDesc = document.createElement('p'); // Long description
    aboutDesc.className = 'overview-aboutDesc';
    aboutContainer.appendChild(aboutTitle);
    aboutContainer.appendChild(aboutDesc);
    aboutSection.appendChild(aboutContainer);

    if (await repo.getApp(query)) {
        thumbnail.src = await repo.getAppThumb(query);
        installButton.onclick = async () => {
            await repo.installApp(query);
        };
    } else if (await repo.getLib(query)) {
        thumbnail.src = await repo.getLibThumb(query);
        installButton.onclick = async () => {
            await repo.installLib(query);
        };
    } else {
        loadappListScreen(repo);
        throw new Error("App not found");
    }
    appTitle.innerText = app.name;
    appCategory.innerText = app.category;
    if (repoVersion == "legacy") {
        aboutDesc.innerText = app.desc;
    } else {
        aboutTitle.innerText = app.summary;
        aboutDesc.innerText = app.desc;
    }
    // Screenshots not yet implemented
    screenshotSection.style.display = 'none';

    overviewScreen.appendChild(infoSection);
    overviewScreen.appendChild(screenshotSection);
    overviewScreen.appendChild(aboutSection);


}
