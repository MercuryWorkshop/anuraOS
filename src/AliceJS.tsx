namespace JSX {
    export type IntrinsicElements = { [index: string]: any };
}

let __effects: any = [];

class React {
    static get use(): (sink: any, mapping?: (...args: any[]) => any) => any {
        // documentation, in case anyone looks in here. the below is a simple way you would use reactivity.
        //// let reactive = stateful({
        ////      a: 1
        //// })
        //// let elm = <p>{React.use(reactive.a)}</p>
        //// reactive.a += 1;

        // breaking this down, line by line
        // the first line creates the stateful proxy. it's just drop in for any normal object
        //// let closure = React.use
        // the above runs this function, clearing the __effects stack
        //// reactive.a
        // instead of getting the value like js normally would, the above will invoke the getter inside stateful(), pushing the *reference* of "a" into the __effects stack.
        //// let reference = closure()
        // runs the function below, cleaning up the __effects array and passing it down
        //// React.createElement("p",{},reference)
        // instead of passing the value of reactive.a, we passsed the return value of the below closure, which is an array contaning the property referenced, the origin object, and the proxy
        // the createElement function will then add a listener to the set() hook of the stateful proxy
        // React.createElement will then re-run all the important stuff once the reaction has happened
        __effects = [];
        return (sink, mapping) => {
            const tmp = __effects;
            __effects = [];
            tmp.__alicejs_marker = true;
            if (mapping) tmp.__alicejs_mapping = mapping;
            return tmp;
        };
    }
    static createElement(
        type: string,
        props: { [index: string]: any } | null,
        ...children: (HTMLElement | string)[]
    ): HTMLElement {
        const elm: HTMLElement = document.createElement(type);

        if (props) {
            if ("if" in props) {
                const cond = props["if"];
                const then = props["then"];
                const elseelm = props["else"];

                if (typeof cond === "object" && "__alicejs_marker" in cond) {
                    if (then) elm.appendChild(then);

                    if (elseelm) elm.appendChild(elseelm);

                    handle(cond, (val: any) => {
                        if (then) {
                            if (val) {
                                then.style.display = "";
                                if (elseelm) elseelm.style.display = "none";
                            } else {
                                then.style.display = "none";

                                if (elseelm) elseelm.style.display = "";
                            }
                        } else {
                            if (val) {
                                elm.style.display = "";
                            } else {
                                elm.style.display = "none";
                            }
                        }
                    });
                } else {
                    if (then) {
                        if (cond) {
                            elm.appendChild(then);
                        } else if (elseelm) {
                            elm.appendChild(elseelm);
                        }
                    } else {
                        if (!cond) {
                            elm.style.display = "none";
                            // todo: make this not exist
                            // @ts-ignore
                            return document.createTextNode("");
                        }
                    }
                }

                delete props["if"];
                delete props["then"];
                delete props["else"];
            }
            if ("for" in props && "do" in props) {
                const predicate = props["for"];
                const closure = props["do"];

                if (
                    typeof predicate === "object" &&
                    "__alicejs_marker" in predicate
                ) {
                    const __elms: HTMLElement[] = [];
                    let lastpredicate: any = [];
                    handle(predicate, (val) => {
                        if (
                            Object.keys(val).length &&
                            Object.keys(val).length == lastpredicate.length
                        ) {
                            let i = 0;
                            for (const index in val) {
                                if (
                                    deepEqual(val[index], lastpredicate[index])
                                ) {
                                    continue;
                                }
                                const part = closure(val[index], index, val);
                                elm.replaceChild(part, __elms[i]!);
                                __elms[i] = part;

                                i += 1;
                            }
                            lastpredicate = Object.keys(
                                JSON.parse(JSON.stringify(val)),
                            );
                        } else {
                            for (const part of __elms) {
                                part.remove();
                            }
                            for (const index in val) {
                                const value = val[index];

                                const part = closure(value, index, val);
                                if (part instanceof HTMLElement) {
                                    __elms.push(part);
                                    elm.appendChild(part);
                                }
                            }

                            lastpredicate = [];
                        }
                    });
                } else {
                    for (const index in predicate) {
                        const value = predicate[index];

                        const part = closure(value, index, predicate);

                        if (part instanceof Node) elm.appendChild(part);
                    }
                }

                delete props["for"];
                delete props["do"];
            }
            for (const name in props) {
                const prop = props[name];
                if (typeof prop === "object" && "__alicejs_marker" in prop) {
                    handle(prop, (val) => {
                        __assign_prop(elm, name, val);
                    });
                } else {
                    __assign_prop(elm, name, prop);
                }
            }
        }
        // todo: proper selective repainting
        for (const child of children) {
            if (typeof child === "object" && "__alicejs_marker" in child) {
                const text = document.createTextNode("");
                elm.appendChild(text);
                // @ts-ignore
                handle(child, (val) => {
                    text.textContent = val;
                });
            } else if (child instanceof Node) {
                elm.appendChild(child);
            } else {
                elm.appendChild(document.createTextNode(child));
            }
        }

        return elm;
    }
}
function deepEqual(object1: any, object2: any) {
    const keys1 = Object.keys(object1);
    const keys2 = Object.keys(object2);

    if (keys1.length !== keys2.length) {
        return false;
    }

    for (const key of keys1) {
        const val1 = object1[key];
        const val2 = object2[key];
        const areObjects = isObject(val1) && isObject(val2);
        if (
            (areObjects && !deepEqual(val1, val2)) ||
            (!areObjects && val1 !== val2)
        ) {
            return false;
        }
    }

    return true;
}

function isObject(object: any) {
    return object != null && typeof object === "object";
}
function __assign_prop(elm: HTMLElement, name: string, prop: any) {
    if (name === "class") {
        elm.className = prop;
        return;
    }

    if (typeof prop === "function" && name.startsWith("on:")) {
        const names = name.substring(3);
        for (const name of names.split("$")) {
            elm.addEventListener(name, (...args) => {
                (window as any).$el = elm;
                prop(...args);
            });
        }
        return;
    }
    if (typeof prop === "function" && name.startsWith("observe")) {
        const observerclass = (window as any)[`${name.substring(8)}Observer`];
        if (!observerclass) {
            console.error(`Observer ${name} does not exist`);
            return;
        }
        const observer = new observerclass((entries: any) => {
            for (const entry of entries) {
                (window as any).$el = elm;
                prop(entry);
            }
        });
        observer.observe(elm);
        return;
    }
    if (name.startsWith("bind:")) {
        const propname = name.substring(5);
        prop[propname] = elm;
        return;
    }

    elm.setAttribute(name, prop);
}
function stateful<T>(target: T): T {
    // @ts-ignore
    target.__listeners = [];
    // @ts-ignore
    const proxy = new Proxy(target, {
        get(target, prop, reciever) {
            __effects.push([target, prop, reciever]);
            return Reflect.get(target, prop, reciever);
        },
        set(target, prop, val) {
            // @ts-ignore
            for (const listener of target.__listeners) {
                listener(target, prop, val);
            }
            return Reflect.set(target, prop, val);
        },
    });

    // @ts-ignore
    return proxy;
}

function handle(used: [any, any, any][], callback: (val: any) => void) {
    if ("__alicejs_mapping" in used) {
        const mapping: any = used["__alicejs_mapping"];
        const used_props: any[] = [];
        const used_targets: any[] = [];

        const values = new Map();

        const pairs: [any, any][] = [];

        const partial_update = (target: any, prop: any, val: any) => {
            if (used_props.includes(prop) && used_targets.includes(target)) {
                values.get(target)[prop] = val;
            }
        };

        const full_update = () => {
            const flattened_values = pairs.map(
                (pair) => values.get(pair[0])[pair[1]],
            );

            const value = mapping(...flattened_values);

            callback(value);
        };

        for (const p of used) {
            const target = p[0];
            const prop = p[1];

            used_props.push(prop);
            used_targets.push(target);

            pairs.push([target, prop]);

            if (!values.has(target)) {
                values.set(target, {});
            }

            partial_update(target, prop, target[prop]);

            target.__listeners.push((t: any, p: any, v: any) => {
                partial_update(t, p, v);
                full_update();
            });
        }
        full_update();
    } else {
        const p = used[used.length - 1]!;
        const closure = (target: any, prop: any, val: any) => {
            if (prop == p[1] && target == p[0]) {
                callback(val);
            }
        };
        p[0].__listeners.push(closure);
        closure(p[0], p[1], p[0][p[1]]);
    }
}
class styled {
    static new(strings: TemplateStringsArray, ...values: any) {
        const uid = `alicecss-${Array(16)
            .fill(0)
            .map(() => {
                return Math.floor(Math.random() * 16).toString(16);
            })
            .join("")}`;

        const styleElement = document.createElement("style");

        document.head.appendChild(styleElement);

        const flattened_template: string[] = [];
        for (const i in strings) {
            flattened_template.push(strings[i]!);
            if (values[i]) {
                const prop = values[i];

                if (typeof prop === "object" && "__alicejs_marker" in prop) {
                    const current_i = flattened_template.length;
                    handle(prop, (val) => {
                        flattened_template[current_i] = String(val);
                        styleElement.textContent = this.parse_css(
                            uid,
                            flattened_template.join(""),
                        );
                    });
                } else {
                    flattened_template.push(String(prop));
                }
            }
        }

        styleElement.textContent = this.parse_css(
            uid,
            flattened_template.join(""),
        );

        return uid + " self";
    }
    static parse_css(uid: string, css: string) {
        let cssParsed = "";

        const virtualDoc = document.implementation.createHTMLDocument("");
        const virtualStyleElement = document.createElement("style");

        virtualStyleElement.textContent = css;
        virtualDoc.body.appendChild(virtualStyleElement);

        //@ts-ignore
        for (const rule of virtualStyleElement.sheet.cssRules) {
            rule.selectorText = rule.selectorText.includes("self")
                ? `.${uid}.self${rule.selectorText.replace("self", "")}`
                : `.${uid} ${rule.selectorText}`;
            cssParsed += `${rule.cssText}\n`;
        }

        return cssParsed;
    }
}
let css: string;
// //
// function x() {
//     const b = stateful({
//         counter: stateful({
//             b: 1,
//         }),
//         show: false,
//         list: [
//             "test element",
//             "element 2",
//             "another list element",
//             "element 4",
//         ],
//         color: "red",
//         count: 0,
//         count2: 0,
//     });
//     //
//     // const style = styled.new`
//     //     p {
//     //         color: ${React.use(b.count, (c) => {
//     //     return (c % 2 == 0) ? "red" : "blue";
//     // })};
//     //     }
//     // `;
//
//     document.body.appendChild(
//         <div class={""}>
//             <p>count is {React.use(b.count)}. that's an {React.use(b.count, c => c % 2 == 0 ? "even" : "odd")} number!</p>
//             <button on:click={() => b.count += 1}>
//                 add 1 to count
//             </button>
//
//             <button on:click={() => b.count2 += 1}>
//                 add 1 to count2
//             </button>
//
//
//             <p>count is {React.use(b.count)}</p>
//             <p>count2 is {React.use(b.count2)}</p>
//
//
//             <p>the sum of count and count2 is {React.use((b.count, b.count2), (c1, c2) => c1 + c2)}</p>
//
//             {/* <div */}
//             {/*     if={React.use(b.show)} */}
//             {/*     then={<p>b.show is true</p>} */}
//             {/*     else={<p>b.show is fale</p>} */}
//             {/* /> */}
//             {/**/}
//             {/* <p>reactivity demo</p> */}
//             {/* <p asd={React.use(b.counter.b)}> */}
//             {/*     the value of a is {React.use(b.counter.b)} */}
//             {/* </p> */}
//             {/* <div */}
//             {/*     for={b.list} */}
//             {/*     do={(v, i) => { */}
//             {/*         return ( */}
//             {/*             <p> */}
//             {/*                 #{i} of "b.list" is {v} */}
//             {/*             </p> */}
//             {/*         ); */}
//             {/*     }} */}
//             {/* /> */}
//             {/* <button */}
//             {/*     on:click={() => { */}
//             {/*         b.counter.b += 1; */}
//             {/*     }} */}
//             {/* > */}
//             {/*     click me! */}
//             {/* </button> */}
//         </div>,
//     );
//     window.br = b;
// }
// window.addEventListener("load", x);
