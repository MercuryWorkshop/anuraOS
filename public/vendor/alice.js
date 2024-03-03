(() => {
    // js.js
    var Fragment = Symbol();
    var [USE_MAPFN, TARGET, PROXY, STEPS, LISTENERS, IF] = new Array(6)
        .fill()
        .map(Symbol);
    var __use_trap = false;
    Object.defineProperty(window, "use", {
        get: () => {
            __use_trap = true;
            return (ptr, mapping) => {
                __use_trap = false;
                if (mapping) ptr[USE_MAPFN] = mapping;
                return ptr;
            };
        },
    });
    Object.assign(window, {
        isDLPtr: isDLPtr2,
        h: h2,
        stateful: stateful2,
        handle: handle2,
        useValue,
        $if,
        Fragment,
    });
    var TRAPS = /* @__PURE__ */ new Map();
    function stateful2(target, hook) {
        target[LISTENERS] = [];
        target[TARGET] = target;
        const proxy = new Proxy(target, {
            get(target2, property, proxy2) {
                if (__use_trap) {
                    let sym = Symbol();
                    let trap = new Proxy(
                        {
                            [TARGET]: target2,
                            [PROXY]: proxy2,
                            [STEPS]: [property],
                            [Symbol.toPrimitive]: () => sym,
                        },
                        {
                            get(target3, property2) {
                                if (
                                    [
                                        TARGET,
                                        PROXY,
                                        STEPS,
                                        USE_MAPFN,
                                        Symbol.toPrimitive,
                                    ].includes(property2)
                                )
                                    return target3[property2];
                                property2 = TRAPS.get(property2) || property2;
                                target3[STEPS].push(property2);
                                return trap;
                            },
                        },
                    );
                    TRAPS.set(sym, trap);
                    return trap;
                }
                return Reflect.get(target2, property, proxy2);
            },
            set(target2, property, val) {
                if (hook) hook(target2, property, val);
                let trap = Reflect.set(target2, property, val);
                for (const listener of target2[LISTENERS]) {
                    listener(target2, property, val);
                }
                return trap;
            },
        });
        return proxy;
    }
    var isobj = (o) => o instanceof Object;
    function isDLPtr2(arr) {
        return isobj(arr) && TARGET in arr;
    }
    function $if(condition, then, otherwise) {
        otherwise ??= document.createTextNode("");
        if (!isDLPtr2(condition)) return condition ? then : otherwise;
        return { [IF]: condition, then, otherwise };
    }
    function handle2(ptr, callback) {
        let step,
            resolvedSteps = [];
        function update() {
            let val = ptr[TARGET];
            for (step of resolvedSteps) {
                val = val[step];
                if (!isobj(val)) break;
            }
            let mapfn = ptr[USE_MAPFN];
            if (mapfn) val = mapfn(val);
            callback(val);
        }
        const curry = (target, i) =>
            function subscription(tgt, prop, val) {
                if (prop === resolvedSteps[i] && target === tgt) {
                    update();
                    if (val instanceof Object) {
                        let v = val[LISTENERS];
                        if (v && !v.includes(subscription)) {
                            v.push(curry(val[TARGET], i + 1));
                        }
                    }
                }
            };
        for (let i in ptr[STEPS]) {
            let step2 = ptr[STEPS][i];
            if (isobj(step2) && step2[TARGET]) {
                handle2(step2, (val) => {
                    resolvedSteps[i] = val;
                    update();
                });
                continue;
            }
            resolvedSteps[i] = step2;
        }
        let sub = curry(ptr[TARGET], 0);
        ptr[TARGET][LISTENERS].push(sub);
        sub(ptr[TARGET], resolvedSteps[0], ptr[TARGET][resolvedSteps[0]]);
    }
    function useValue(references) {
        let reference = references[references.length - 1];
        return reference.proxy[reference.property];
    }
    function JSXAddFixedWrapper(ptr, cb, $if2) {
        let before, appended, first, flag;
        handle2(ptr, (val) => {
            first = appended?.[0];
            if (first)
                before = first.previousSibling || (flag = first.parentNode);
            if (appended) appended.forEach((a) => a.remove());
            appended = JSXAddChild(
                $if2 ? (val ? $if2.then : $if2.otherwise) : val,
                (el) => {
                    if (before) {
                        if (flag) {
                            before.prepend(el);
                            flag = null;
                        } else before.after(el);
                        before = el;
                    } else cb(el);
                },
            );
        });
    }
    function h2(type, props, ...children) {
        if (type == Fragment) return children;
        if (typeof type == "function") {
            let newthis = stateful2(Object.create(type.prototype));
            for (const name in props) {
                const ptr = props[name];
                if (isDLPtr2(ptr) && name.startsWith("bind:")) {
                    const propname = name.substring(5);
                    if (propname == "this") {
                        ptr[PROXY][ptr[STEPS][0]] = newthis;
                    } else {
                        let isRecursive = false;
                        handle2(ptr, (value) => {
                            if (isRecursive) {
                                isRecursive = false;
                                return;
                            }
                            isRecursive = true;
                            newthis[propname] = value;
                        });
                        handle2(use(newthis[propname]), (value) => {
                            if (isRecursive) {
                                isRecursive = false;
                                return;
                            }
                            isRecursive = true;
                            ptr[PROXY][ptr[STEPS][0]] = value;
                        });
                    }
                    delete props[name];
                }
            }
            Object.assign(newthis, props);
            newthis.children = [];
            for (const child of children) {
                JSXAddChild(
                    child,
                    newthis.children.push.bind(newthis.children),
                );
            }
            let elm2 = type.apply(newthis);
            elm2.$ = newthis;
            newthis.root = elm2;
            if (newthis.css) {
                elm2.classList.add(newthis.css);
                elm2.classList.add("self");
            }
            elm2.setAttribute("data-component", type.name);
            if (typeof newthis.mount === "function") newthis.mount();
            return elm2;
        }
        let xmlns = props?.xmlns;
        const elm = xmlns
            ? document.createElementNS(xmlns, type)
            : document.createElement(type);
        for (const child of children) {
            let cond = child && !isDLPtr2(child) && child[IF];
            let bappend = elm.append.bind(elm);
            if (cond) {
                JSXAddFixedWrapper(cond, bappend, child);
            } else JSXAddChild(child, bappend);
        }
        if (!props) return elm;
        function useProp(name, callback) {
            if (!(name in props)) return;
            let prop = props[name];
            callback(prop);
            delete props[name];
        }
        for (const name in props) {
            const ptr = props[name];
            if (isDLPtr2(ptr) && name.startsWith("bind:")) {
                const propname = name.substring(5);
                if (propname == "this") {
                    ptr[PROXY][ptr[STEPS][0]] = elm;
                } else if (propname == "value") {
                    handle2(ptr, (value) => (elm.value = value));
                    elm.addEventListener("change", () => {
                        ptr[PROXY][ptr[STEPS][0]] = elm.value;
                    });
                } else if (propname == "checked") {
                    handle2(ptr, (value) => (elm.checked = value));
                    elm.addEventListener("click", () => {
                        ptr[PROXY][ptr[STEPS][0]] = elm.checked;
                    });
                }
                delete props[name];
            }
        }
        useProp("class", (classlist) => {
            if (typeof classlist === "string") {
                elm.className = classlist;
                return;
            }
            if (isDLPtr2(classlist)) {
                handle2(classlist, (classname) => (elm.className = classname));
                return;
            }
            for (const name of classlist) {
                if (isDLPtr2(name)) {
                    let oldvalue = null;
                    handle2(name, (value) => {
                        if (typeof oldvalue === "string") {
                            elm.classList.remove(oldvalue);
                        }
                        elm.classList.add(value);
                        oldvalue = value;
                    });
                } else {
                    elm.classList.add(name);
                }
            }
        });
        for (const name in props) {
            const prop = props[name];
            if (isDLPtr2(prop)) {
                handle2(prop, (val) => {
                    JSXAddAttributes(elm, name, val);
                });
            } else {
                JSXAddAttributes(elm, name, prop);
            }
        }
        if (xmlns) elm.innerHTML = elm.innerHTML;
        return elm;
    }
    function JSXAddChild(child, cb) {
        let childchild, elms, node;
        if (isDLPtr2(child)) {
            JSXAddFixedWrapper(child, cb);
        } else if (child instanceof Node) {
            cb(child);
            return [child];
        } else if (child instanceof Array) {
            elms = [];
            for (childchild of child) {
                elms = elms.concat(JSXAddChild(childchild, cb));
            }
            if (!elms[0]) elms = JSXAddChild("", cb);
            return elms;
        } else {
            node = document.createTextNode(child);
            cb(node);
            return [node];
        }
    }
    function JSXAddAttributes(elm, name, prop) {
        if (typeof prop === "function" && name === "mount") {
            window.$el = elm;
            prop(elm);
            return;
        }
        if (typeof prop === "function" && name.startsWith("on:")) {
            const names = name.substring(3);
            for (const name2 of names.split("$")) {
                elm.addEventListener(name2, (...args) => {
                    window.$el = elm;
                    prop(...args);
                });
            }
            return;
        }
        elm.setAttribute(name, prop);
    }

    // css.js
    Object.assign(window, { css, rule, styled: { new: css, rule } });
    var cssmap = {};
    function scopify_css(uid, css2) {
        const virtualDoc = document.implementation.createHTMLDocument("");
        const virtualStyleElement = document.createElement("style");
        virtualDoc.body.appendChild(virtualStyleElement);
        let cssParsed = "";
        virtualStyleElement.textContent = css2;
        for (const rule2 of virtualStyleElement.sheet.cssRules) {
            rule2.selectorText = rule2.selectorText.includes("self")
                ? `.${uid}.self${rule2.selectorText.replace("self", "")}`
                : `.${uid} ${rule2.selectorText}`;
            cssParsed += `${rule2.cssText}
`;
        }
        return cssParsed;
    }
    function tagcss(strings, values, isblock) {
        let cached = cssmap[strings[0]];
        let cachable = strings.length == 1;
        if (cachable && cached) return cached;
        const uid = `dl${Array(5)
            .fill(0)
            .map(() => {
                return Math.floor(Math.random() * 36).toString(36);
            })
            .join("")}`;
        const styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
        const flattened_template = [];
        for (const i in strings) {
            flattened_template.push(strings[i]);
            if (values[i]) {
                const prop = values[i];
                if (isDLPtr(prop)) {
                    const current_i = flattened_template.length;
                    let oldparsed;
                    handle(prop, (val) => {
                        flattened_template[current_i] = String(val);
                        let parsed = flattened_template.join("");
                        if (parsed != oldparsed)
                            if (isblock)
                                styleElement.textContent = scopify_css(
                                    uid,
                                    parsed,
                                );
                            else
                                styleElement.textContent = `.${uid} { ${parsed}; }`;
                        oldparsed = parsed;
                    });
                } else {
                    flattened_template.push(String(prop));
                }
            }
        }
        if (isblock) {
            styleElement.textContent = scopify_css(
                uid,
                flattened_template.join(""),
            );
        } else {
            styleElement.textContent = `.${uid} { ${flattened_template.join("")}; }`;
        }
        if (cachable) cssmap[strings[0]] = uid;
        return uid;
    }
    function rule(strings, ...values) {
        return tagcss(strings, values, false);
    }
    function css(strings, ...values) {
        return tagcss(strings, values, true);
    }

    // html.js
    Object.assign(window, { html });
    function html(strings, ...values) {
        let flattened = "";
        let markers = {};
        for (const i in strings) {
            let string = strings[i];
            let value = values[i];
            flattened += string;
            if (i < values.length) {
                let dupe = Object.values(markers).findIndex((v) => v == value);
                if (dupe !== -1) {
                    flattened += Object.keys(markers)[dupe];
                } else {
                    let marker =
                        "m" +
                        Array(16)
                            .fill(0)
                            .map(() =>
                                Math.floor(Math.random() * 16).toString(16),
                            )
                            .join("");
                    markers[marker] = value;
                    flattened += marker;
                }
            }
        }
        let dom = new DOMParser().parseFromString(flattened, "text/html");
        if (dom.body.children.length !== 1)
            throw "html builder needs exactly one child";
        function wraph(elm) {
            let nodename = elm.nodeName.toLowerCase();
            if (nodename === "#text") return elm.textContent;
            if (nodename in markers) nodename = markers[nodename];
            let children = [...elm.childNodes].map(wraph);
            for (let i = 0; i < children.length; i++) {
                let text = children[i];
                if (typeof text !== "string") continue;
                for (const [marker, value] of Object.entries(markers)) {
                    if (!text) break;
                    if (!text.includes(marker)) continue;
                    let before;
                    [before, text] = text.split(marker);
                    children = [
                        ...children.slice(0, i),
                        before,
                        value,
                        text,
                        ...children.slice(i + 1),
                    ];
                    i += 2;
                }
            }
            let attributes = {};
            for (const attr of [...elm.attributes]) {
                let val = attr.nodeValue;
                if (val in markers) val = markers[val];
                attributes[attr.name] = val;
            }
            return h(nodename, attributes, children);
        }
        return wraph(dom.body.children[0]);
    }

    // store.js
    Object.assign(window, { $store });
    function $store(target, ident, type) {
        let stored = localStorage.getItem(ident);
        target = JSON.parse(stored) ?? target;
        addEventListener("beforeunload", () => {
            console.info("[dreamland.js]: saving " + ident);
            localStorage.setItem(ident, JSON.stringify(target));
        });
        return stateful(target);
    }
})();
