(() => {
    // js.js
    var __reference_stack = [];
    var ALICEJS_REFERENCES_MAPPING = Symbol();
    var ALICEJS_REFERENCES_MARKER = Symbol();
    var ALICEJS_STATEFUL_LISTENERS = Symbol();
    Object.defineProperty(window, "use", {
        get: () => {
            __reference_stack = [];
            return (_sink, mapping) => {
                let references = __reference_stack;
                __reference_stack = [];
                references[ALICEJS_REFERENCES_MARKER] = true;
                if (mapping) references[ALICEJS_REFERENCES_MAPPING] = mapping;
                return references;
            };
        },
    });
    Object.assign(window, { h: h2, stateful, handle: handle2, useValue });
    function stateful(target) {
        target[ALICEJS_STATEFUL_LISTENERS] = [];
        const proxy = new Proxy(target, {
            get(target2, property, proxy2) {
                __reference_stack.push({
                    target: target2,
                    property,
                    proxy: proxy2,
                });
                return Reflect.get(target2, property, proxy2);
            },
            set(target2, property, val) {
                for (const listener of target2[ALICEJS_STATEFUL_LISTENERS]) {
                    listener(target2, property, val);
                }
                return Reflect.set(target2, property, val);
            },
        });
        return proxy;
    }
    function isAJSReferences(arr) {
        return arr instanceof Array && ALICEJS_REFERENCES_MARKER in arr;
    }
    function handle2(references, callback) {
        if (!isAJSReferences(references))
            throw new Error("Not an AliceJS reference set!");
        if (ALICEJS_REFERENCES_MAPPING in references) {
            const mapping = references[ALICEJS_REFERENCES_MAPPING];
            const used_props = [];
            const used_targets = [];
            const values = /* @__PURE__ */ new Map();
            const pairs = [];
            const partial_update = (target, prop, val) => {
                if (
                    used_props.includes(prop) &&
                    used_targets.includes(target)
                ) {
                    values.get(target)[prop] = val;
                }
            };
            const full_update = () => {
                const flattened_values = pairs.map(
                    (pair) => values.get(pair[0])[pair[1]],
                );
                const value = mapping(...flattened_values.reverse());
                callback(value);
            };
            for (const p of references) {
                const target = p.target;
                const prop = p.property;
                used_props.push(prop);
                used_targets.push(target);
                pairs.push([target, prop]);
                if (!values.has(target)) {
                    values.set(target, {});
                }
                partial_update(target, prop, target[prop]);
                target[ALICEJS_STATEFUL_LISTENERS].push((t, p2, v) => {
                    partial_update(t, p2, v);
                    full_update();
                });
            }
            full_update();
        } else {
            const reference = references[references.length - 1];
            const subscription = (target, prop, val) => {
                if (
                    prop === reference.property &&
                    target === reference.target
                ) {
                    callback(val);
                }
            };
            reference.target[ALICEJS_STATEFUL_LISTENERS].push(subscription);
            subscription(
                reference.target,
                reference.property,
                reference.target[reference.property],
            );
        }
    }
    function useValue(references) {
        let reference = references[references.length - 1];
        return reference.proxy[reference.property];
    }
    function h2(type, props, ...children) {
        if (typeof type === "function") {
            let newthis = stateful(Object.create(type.prototype));
            for (const name in props) {
                const references = props[name];
                if (isAJSReferences(references) && name.startsWith("bind:")) {
                    let reference = references[references.length - 1];
                    const propname = name.substring(5);
                    if (propname == "this") {
                        reference.proxy[reference.property] = newthis;
                    } else {
                        let isRecursive = false;
                        handle2(references, (value) => {
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
                            reference.proxy[reference.property] = value;
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
            return elm2;
        }
        const elm = document.createElement(type);
        for (const child of children) {
            JSXAddChild(child, elm.appendChild.bind(elm));
        }
        if (!props) return elm;
        function useProp(name, callback) {
            if (!(name in props)) return;
            let prop = props[name];
            callback(prop);
            delete props[name];
        }
        useProp("before", (callback) => {
            JSXAddChild(callback());
        });
        useProp("if", (condition) => {
            let thenblock = props["then"];
            let elseblock = props["else"];
            if (isAJSReferences(condition)) {
                if (thenblock) elm.appendChild(thenblock);
                if (elseblock) elm.appendChild(elseblock);
                handle2(condition, (val) => {
                    if (thenblock) {
                        if (val) {
                            thenblock.style.display = "";
                            if (elseblock) elseblock.style.display = "none";
                        } else {
                            thenblock.style.display = "none";
                            if (elseblock) elseblock.style.display = "";
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
                if (thenblock) {
                    if (condition) {
                        elm.appendChild(thenblock);
                    } else if (elseblock) {
                        elm.appendChild(elseblock);
                    }
                } else {
                    if (condition) {
                        elm.appendChild(thenblock);
                    } else if (elseblock) {
                        elm.appendChild(elseblock);
                    } else {
                        elm.style.display = "none";
                        return document.createTextNode("");
                    }
                }
            }
            delete props["then"];
            delete props["else"];
        });
        if ("for" in props && "do" in props) {
            const predicate = props["for"];
            const closure = props["do"];
            if (isAJSReferences(predicate)) {
                const __elms = [];
                let lastpredicate = [];
                handle2(predicate, (val) => {
                    if (
                        Object.keys(val).length &&
                        Object.keys(val).length == lastpredicate.length
                    ) {
                        let i = 0;
                        for (const index in val) {
                            if (deepEqual(val[index], lastpredicate[index])) {
                                continue;
                            }
                            const part = closure(val[index], index, val);
                            elm.replaceChild(part, __elms[i]);
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
        useProp("after", (callback) => {
            JSXAddChild(callback());
        });
        for (const name in props) {
            const references = props[name];
            if (isAJSReferences(references) && name.startsWith("bind:")) {
                let reference = references[references.length - 1];
                const propname = name.substring(5);
                if (propname == "this") {
                    reference.proxy[reference.property] = elm;
                } else if (propname == "value") {
                    handle2(references, (value) => (elm.value = value));
                    elm.addEventListener("change", () => {
                        reference.proxy[reference.property] = elm.value;
                    });
                } else if (propname == "checked") {
                    handle2(references, (value) => (elm.checked = value));
                    elm.addEventListener("click", () => {
                        reference.proxy[reference.property] = elm.checked;
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
            if (isAJSReferences(classlist)) {
                handle2(classlist, (classname) => (elm.className = classname));
                return;
            }
            for (const name of classlist) {
                if (isAJSReferences(name)) {
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
            if (isAJSReferences(prop)) {
                handle2(prop, (val) => {
                    JSXAddAttributes(elm, name, val);
                });
            } else {
                JSXAddAttributes(elm, name, prop);
            }
        }
        return elm;
    }
    function JSXAddChild(child, cb) {
        if (isAJSReferences(child)) {
            let appended = [];
            handle2(child, (val) => {
                if (appended.length > 1) {
                    appended.forEach((n) => n.remove());
                    appended = JSXAddChild(val, cb);
                } else if (appended.length > 0) {
                    let old = appended[0];
                    appended = JSXAddChild(val, cb);
                    if (appended[0]) {
                        old.replaceWith(appended[0]);
                    } else {
                        old.remove();
                    }
                } else {
                    appended = JSXAddChild(val, cb);
                }
            });
        } else if (child instanceof Node) {
            cb(child);
            return [child];
        } else if (child instanceof Array) {
            let elms = [];
            for (const childchild of child) {
                elms = elms.concat(JSXAddChild(childchild, cb));
            }
            return elms;
        } else {
            let node = document.createTextNode(child);
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
        if (typeof prop === "function" && name.startsWith("observe")) {
            const observerclass = window[`${name.substring(8)}Observer`];
            if (!observerclass) {
                console.error(`Observer ${name} does not exist`);
                return;
            }
            const observer = new observerclass((entries) => {
                for (const entry of entries) {
                    window.$el = elm;
                    prop(entry);
                }
            });
            observer.observe(elm);
            return;
        }
        elm.setAttribute(name, prop);
    }
    function deepEqual(object1, object2) {
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
    function isObject(object) {
        return object != null && typeof object === "object";
    }

    // css.js
    Object.assign(window, { css, rule, styled: { new: css, rule } });
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
        const uid = `dream-${Array(16)
            .fill(0)
            .map(() => {
                return Math.floor(Math.random() * 16).toString(16);
            })
            .join("")}`;
        const styleElement = document.createElement("style");
        document.head.appendChild(styleElement);
        const flattened_template = [];
        for (const i in strings) {
            flattened_template.push(strings[i]);
            if (values[i]) {
                const prop = values[i];
                if (isAJSReferences(prop)) {
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
        return uid;
    }
    function rule(strings, ...values) {
        return tagcss(strings, values, false);
    }
    function css(strings, ...values) {
        return tagcss(strings, values, true);
    }

    // html.js
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
})();
