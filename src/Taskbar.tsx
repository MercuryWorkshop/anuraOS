class Taskbar {
  shortcutsTray: HTMLElement;

  element = (
    <footer>

      <div id="launcher-button-container">
        <div id="launcher-button" on:click={() => { launcher.toggleVisible() }}><img src="/assets/icons/launcher.svg" style="height:100%;width:100%"></img></div>
      </div>
      {/* r58 i'm begging you please extract the asset for whatever this thing is or make an svg i don't feel like doing it and 1/2 stack was using a fucking image :skull: */}
      <nav>
        <ul bind:shortcutsTray={this}>
          {/* <li><input type="image" src="/assets/icons/chrome.svg" id="showDialog" on:click={()=> openBrowser()} /></li > */}
          {/* <li><input type="image" src="/assets/icons/linux.png" id="showDialog" on:click={() => open()} /></li> */}
          {/* <li><input type="image" src="/assets/icons/settings.png" id="showDialog" on:click={() => { openAppManager() }} /> */}
          {/* </li> */}
        </ul >
      </nav >
    </footer >
  );
  constructor() {
  }
  addShortcut(svg: string, launch: () => void) {
    let elm = (<li>
      <input type="image" app="among" src={svg} id="showDialog" on:click={launch} />
    </li>);
    this.shortcutsTray.appendChild(elm);
  }
  killself() {
    this.element.remove();
  }
}
