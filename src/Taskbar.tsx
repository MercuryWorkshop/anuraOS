class Taskbar {
  element = (
    <footer>
      <nav>
        <ul>
          <li><input type="image" src="/assets/icons/chrome.svg" id="showDialog" onclick="openBrowser()" /></li >
          <li><input type="image" src="/assets/icons/linux.png" id="showDialog" onclick="openVMManager()" /></li>
          <li><input type="image" src="/assets/icons/settings.png" id="showDialog" onclick="openAppManager()" />
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
