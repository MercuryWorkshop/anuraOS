namespace JSX {
  export type IntrinsicElements = { [index: string]: any };
}

class React {
  static createElement(type: string, props: { [index: string]: any } | null, ...children: (HTMLElement | string)[]): HTMLElement {

    let elm: HTMLElement = document.createElement(type);
    if (props) {
      for (let name in props) {
        (elm as any)[name] = props[name];
      }
      elm.className = props["class"];
    }

    for (let child of children) {
      if (typeof child === "string") {
        elm.innerHTML = child;
      } else {
        elm.appendChild(child);
      }
    }

    return elm;
  }
}
