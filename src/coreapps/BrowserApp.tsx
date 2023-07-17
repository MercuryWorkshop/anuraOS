class BrowserApp implements App {
  name = "Anura Browser";
  package = "anura.browser";
  icon = "/assets/chrome.svg";
  windows: WMWindow[];
  source: string;

  constructor() {
    this.windows = [];
  }
  async open(): Promise<WMWindow | undefined> {


    const browser = AliceWM.create({ "title": "", "width": "700px", "height": "500px" } as unknown as any);
    const iframe = document.createElement("iframe");
    //@ts-ignore
    iframe.style = "top:0; left:0; bottom:0; right:0; width:100%; height:100%; border:none; margin:0; padding:0;";
    iframe.setAttribute("src", "../../browser.html");
    browser.content.appendChild(iframe);

    if (localStorage['borderless-aboutbrowser'] == "true") {
      // make borderless
      browser.content.style.position = "absolute";
      browser.content.style.height = "100%";
      browser.content.style.display = "inline-block";

      const container = browser.content.parentElement;

      (container!.querySelector(".title") as any).style["background-color"] = "rgba(0, 0, 0, 0)";
    }
    this.windows.push(browser);
    taskbar.updateTaskbar();






    return browser;

  }
}
