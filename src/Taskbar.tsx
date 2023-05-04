class Taskbar {
  element = (
    <footer>
      <div id="launcher-button-container">
        <div id="launcher-button" onClick={() => { launcher.toggleVisible() }}></div>
      </div>
      {/* r58 i'm begging you please extract the asset for whatever this thing is or make an svg i don't feel like doing it and 1/2 stack was using a fucking image :skull: */}
      <nav>
        <ul>
          <li><input type="image" src="/assets/icons/chrome.svg" id="showDialog" onClick="openBrowser()" /></li >
          <li><input type="image" src="/assets/icons/linux.png" id="showDialog" onClick="openVMManager()" /></li>
          <li><input type="image" src="/assets/icons/settings.png" id="showDialog" onClick={() => { openAppManager() }} />
          </li>
        </ul >
      </nav >
    </footer >
  );
  constructor() {
    this.element.querySelector("#showDialog")!.addEventListener("click", () => {
      console.log("test")
    })

  }
  killself() {
    this.element.remove();
  }
}
