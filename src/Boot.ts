
const channel = new BroadcastChannel('tab');

// send message to all tabs, after a new tab
channel.postMessage("newtab");
let activetab = true;
channel.addEventListener("message", (msg) => {
  if (msg.data === "newtab" && activetab) {
    // if there's a previously registered tab that can read the message, tell the other tab to kill itself
    channel.postMessage("blackmanthunderstorm");
  }

  if (msg.data === "blackmanthunderstorm") {
    activetab = false;
    //@ts-ignore
    for (let elm of [...document.children]) {
      elm.remove();
    }
    document.open();
    document.write("you already have an anura tab open")
    document.close();
  }
});



let taskbar = new Taskbar();
let launcher = new Launcher();
let contextMenu = new ContextMenu();
let bootsplash = new Bootsplash();
let oobeview = new OobeView();
let oobewelcomestep = new OobeWelcomeStep();
let oobeassetsstep = new OobeAssetsStep();

var anura: Anura;
// global


window.addEventListener("load", async () => {
  document.body.appendChild(bootsplash.element);

  // await sleep(2000);
  anura = await Anura.new();
  (window as any).anura = anura;

  bootsplash.element.remove();
  anura.logger.debug("boot completed");
  document.dispatchEvent(new Event("anura-boot-completed"));
});

document.addEventListener("anura-boot-completed", async () => {
  // document.body.appendChild(oobeview.element);
  // oobeview.content.appendChild(oobewelcomestep.element);
  // oobewelcomestep.nextButton.addEventListener("click", () => {
  //     oobewelcomestep.element.remove();
  //     oobeview.content.appendChild(oobeassetsstep.element);
  //     oobeassetsstep.nextButton.addEventListener("click", () => {
  //         oobeview.element.remove();
  document.dispatchEvent(new Event("anura-login-completed"));
  //     });
  // });
});

document.addEventListener("anura-login-completed", async () => {
  anura.registerApp("apps/browser.app");
  anura.registerApp("apps/term.app");
  anura.registerApp("apps/glxgears.app");
  anura.registerApp("apps/eruda.app");
  anura.registerApp("apps/vnc.app");
  anura.registerApp("apps/sshy.app"); // ssh will be reworked later
  anura.registerApp("apps/fsapp.app");
  anura.registerApp("apps/chideNew.app");
  anura.registerApp("apps/python.app");
  anura.registerApp("apps/workstore.app");
  anura.registerApp("apps/settings.app");

  // Load all persistent sideloaded apps
  try {
    anura.fs.readdir("/userApps", (err: Error, files: string[]) => {
      // Fixes a weird edgecase that I was facing where no user apps are installed, nothing breaks it just throws an error which I would like to mitigate.
      if (files == undefined) return;
      files.forEach(file => {
        try {
          anura.registerApp("/fs/userApps/" + file)
        } catch (e) {
          anura.logger.error("Anura failed to load an app " + e)
        }

      })
    })
  } catch (e) {
    anura.logger.error(e)
  }

  // anura.registerApp("games.app");
  // if you want to use the games app, uncomment this, clone the repo in /apps 
  // and rename it to games.app
  // the games app is too large and unneccesary for ordinary developers

  if ((await (await (fetch('/fs/')))).status === 404) {

    let notif = new anura.notification({ title: "Anura Error", description: "Anura has encountered an error with the Filesystem HTTP bridge, click this notification to restart", timeout: 50000 })
    notif.callback = function() {
      window.location.reload()
      return null;
    }
    notif.show()
  }



  if (!anura.settings.get("x86-disabled")) {
    // v86 stable. can enable it by default now
    let mgr = await anura.registerApp("apps/x86mgr.app");
    await mgr?.launch();


    let finp: HTMLInputElement = React.createElement("input", { type: "file", id: "input" }) as unknown as HTMLInputElement;
    document.body.appendChild(finp);

    anura.x86 = await InitV86Backend();
  }


  document.body.appendChild(contextMenu.element);
  document.body.appendChild(launcher.element);
  document.body.appendChild(launcher.clickoffChecker);
  document.body.appendChild(taskbar.element);

  (window as any).taskbar = taskbar;

  document.addEventListener("contextmenu", function(e) {
    if (e.shiftKey) return;
    e.preventDefault();
    const menu: any = document.querySelector(".custom-menu");
    menu.style.removeProperty("display");
    menu.style.top = `${e.clientY}px`;
    menu.style.left = `${e.clientX}px`;
  });

  document.addEventListener("click", (e) => {
    if (e.button != 0) return;
    (document.querySelector(".custom-menu")! as HTMLElement).style.setProperty("display", "none");
  });

  // This feels wrong but it works and makes TSC happy
  launcher.clickoffChecker?.addEventListener('click', () => {
    launcher.toggleVisible();
  });
  anura.initComplete = true;
  anura.updateTaskbar()
});

