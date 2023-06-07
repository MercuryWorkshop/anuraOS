class Launcher {
  element = (
    <div class="launcher">
      <div class="topSearchBar">
        <img src="/assets/icons/googleg.png"></img>
        <input placeholder="Search your tabs, files, apps, and more..." />
      </div>
      <div class="recentItemsWrapper">
        <div class="recentItemsText">Continue where you left off</div>
      </div>
      <div id="appsView" class="appsView">

      </div>
    </div>
  )

  clickoffChecker = (
    <div id="clickoffChecker" class="clickoffChecker"></div>
  )

  constructor() {

  }


  toggleVisible() {
    this.element.classList.toggle("active")
    this.clickoffChecker.classList.toggle("active");
  }

  addShortcut(name: string, svg: string, onclick: () => void) {
    let shortcut = this.shortcutElement(name, svg);
    shortcut.addEventListener("click", onclick);
    this.element.querySelector("#appsView").appendChild(shortcut);
  }


  shortcutElement(name: string, svg: string): HTMLElement {
    return (
      <div class="app">
        <input class="app-shortcut-image" type="image" src={svg} id="showDialog" />
        <div class="app-shortcut-name">{name}</div>
      </div>
    )
  }
}
