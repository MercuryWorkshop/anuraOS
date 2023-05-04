namespace JSX {
  export type IntrinsicElements = { [index: string]: any };
}

class React {
  static createElement(type: string, props: { [index: string]: any } | null, ...children: (HTMLElement | string)[]): HTMLElement {

    let elm: HTMLElement = document.createElement(type);
    if (props) {
      for (let name in props) {
        let prop = props[name];
        if (name === "class") {
          elm.className = prop;
          continue;
        }
        if (typeof prop === "function" && name.startsWith("on")) {
          elm.addEventListener(name[2]?.toLowerCase() + name.substring(3), prop);
        }


        (elm as any)[name] = props[name];
      }
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

