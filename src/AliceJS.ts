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
          elm.addEventListener(name.substring(3), prop);
          continue;
        }
        if (typeof prop === "function" && name.startsWith("observe")) {
          let observerclass = (window as any)[`${name.substring(8)}Observer`];
          if (!observerclass) {
            console.error(`Observer ${name} does not exist`);
            continue;
          }
          let observer = new observerclass((entries: any) => {
            for (let entry of entries) {
              prop(entry);
            }
          });
          observer.observe(elm)
          continue;
        }
        if (name.startsWith("bind")) {
          let propname = name.substring(5);
          prop[propname] = elm;
          continue;
        }


        elm.setAttribute(name, props[name]);
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

// class Component {
//   element: HTMLElement;
//   constructor() {
//
//
//   }
// }
