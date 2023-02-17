import { Component, RefObject } from '../Framework';

/**
 * check element
 * @param element
 * @returns
 */
export function isElement(element: any) {
    return element instanceof Element || element instanceof HTMLDocument;
}

export const isDOM =
    typeof HTMLElement === 'object'
        ? function (obj: any) {
            return obj instanceof HTMLElement;
        }
        : function (obj: any) {
            return obj && typeof obj === 'object' && obj.nodeType === 1 && typeof obj.nodeName === 'string';
        };

/**
 * DOM selector
 * @param {String}  selector css selector
 * @param {String}  context  parent DOM
 */
export function $$(selector: string, context?: HTMLElement | Document) {
    context = context || document;
    let elements = context.querySelectorAll(selector);

    return elements.length === 1 ? Array.prototype.slice.call(elements)[0] : Array.prototype.slice.call(elements);
}

/**
 * add classname
 * @param className
 * @param selector
 * @param context
 */
export function addClass(className: string, selector: HTMLElement | string, context?: HTMLElement | Document) {
    if (typeof selector !== 'string') {
        selector.classList.add(className);
        return;
    }

    context = context || document;
    let elements = Array.prototype.slice.call(context.querySelectorAll(selector));

    elements.forEach((ele) => {
        ele.classList.add(className);
    });
}
/**
 * remove classname
 * @param className
 * @param selector
 * @param context
 */
export function removeClass(className: string, selector: HTMLElement | string, context?: HTMLElement | Document) {
    if (typeof selector !== 'string') {
        selector.classList.remove(className);
        return;
    }

    context = context || document;
    let elements = Array.prototype.slice.call(context.querySelectorAll(selector));

    elements.forEach((ele) => {
        ele.classList.remove(className);
    });
}
/**
 * Return the first matched element by provided selector, traversing from current element up through its ancestors in the DOM tree.
 * Native - IE10+
 * reference: https://github.com/nefe/You-Dont-Need-jQuery#1.6
 * @param  {Element} el
 * @param  {string} selector
 */
export function closest(el: any, selector: string) {
    const matchesSelector = el.matches || el.webkitMatchesSelector || el.mozMatchesSelector || el.msMatchesSelector;

    while (el) {
        if (matchesSelector.call(el, selector)) {
            return el;
        }
        el = el.parentElement;
    }
    return null;
}

/**
 *  generate random id
 */
export function randomId(prefix: string) {
    prefix = prefix ? `${prefix}-` : '';
    return (
        prefix +
        Math.random()
            .toString(36)
            .replace(/[^a-z]+/g, '')
            .substr(2, 10)
    );
}

/**
 * 获取第一级子元素
 * @param obj
 * @returns
 */
export function getFirstChildren(obj: HTMLElement) {
    let objChild = [];
    let objs = obj.getElementsByTagName('*');
    for (let i = 0, j = objs.length; i < j; ++i) {
        if (objs[i].nodeType !== 1) {
            // alert(objs[i].nodeType);
            continue;
        }
        let temp: HTMLElement | any = objs[i].parentNode;
        if (temp && temp.nodeType === 1) {
            if (temp === obj) {
                objChild[objChild.length] = objs[i];
            }
        } else if (temp && temp.parentNode === obj) {
            objChild[objChild.length] = objs[i];
        }
    }
    return objChild;
}
/**
 * join className
 */
export function joinClassNames(...args: any) {
    if (!args.length) return;
    let result = '';
    args.forEach((item: any) => {
        if (item instanceof Object) {
            for (let k in item) {
                if (item[k]) {
                    result += ` ${k}`;
                }
            }
        } else {
            result += item ? ` ${item}` : '';
        }
    });
    return result;
}

export const getNodeindex = (elm: any) => [...elm.parentNode.children].indexOf(elm);

// 防抖
export function debounce(fn: Function, time: number) {
    let timer: any = null;
    return function (...arg: any) {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...arg);
        }, time);
    };
}

export function selectTextContent(ele: Node) {
    if (window.getSelection) {
        // all browsers, except IE before version 9
        let range = document.createRange();
        let content = ele.firstChild;
        if (content) {
            range.setStart(content, 0);
            range.setEnd(content, (content as Text).length);
            if (range.startContainer && isInPage(range.startContainer)) {
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);
            }
        }
    }
}

export function selectTextContentCross(sEle: Node, eEle: Node) {
    if (window.getSelection) {
        let range = document.createRange();
        let sContent = sEle.firstChild;
        let eContent = eEle.firstChild;
        if (sContent && eContent) {
            range.setStart(sContent, 0);
            range.setEnd(eContent, (eContent as Text).length);
            if (range.startContainer && isInPage(range.startContainer)) {
                window.getSelection()?.removeAllRanges();
                window.getSelection()?.addRange(range);
            }
        }
    }
}

export function isInPage(node: Node) {
    return node === document.body ? false : document.body.contains(node);
}

export function textTrim(x: string): string {
    if (x.length === 0) {
        // if (x == null || x.length == 0) {
        return x;
    }
    return x.replace(/^\s+|\s+$/gm, '');
}

export function getRefElement(ref: RefObject<HTMLElement | Component> | Component) {
    if (isDOM((ref as RefObject<HTMLElement>).current)) {
        return (ref as RefObject<HTMLElement>).current as HTMLElement;
    }
    let refCurrent = (ref as RefObject<Component>).current as Component<{}, {}>;

    if (refCurrent) {
        return refCurrent?.base as HTMLElement;
    }
    return (ref as Component).base as HTMLElement;
}

export function printableCharacter(keycode: number) {
    let valid =
        (keycode > 47 && keycode < 58) || // number keys
        keycode === 32 ||
        keycode === 13 || // spacebar & return key(s) (if you want to allow carriage returns)
        (keycode > 64 && keycode < 91) || // letter keys
        (keycode > 95 && keycode < 112) || // numpad keys
        (keycode > 185 && keycode < 193) || // ;=,-./` (in order)
        (keycode > 218 && keycode < 223); // [\]' (in order)

    return valid;
}

export function xssDeal(str: string) {
    if (typeof str !== 'string') return str;
    return str.replace(/<script>/g, '&lt;script&gt;').replace(/<\/script>/, '&lt;/script&gt;');
}

export function setLastCaretPosition(dom: HTMLElement) {
    const range = window.getSelection();
    range && range.selectAllChildren(dom);
    range && range.collapseToEnd();
}

/**
 * 翻译数据中的国际化
 */
// function resetLabel(label: string[] | string, locale: Locale) {
//     let str = '';

//     if (label instanceof Array) {
//         label.forEach((item) => {
//             if (item.includes('.')) {
//                 str += locale.get(item);
//             } else {
//                 str += item;
//             }
//         });
//     } else {
//         if (label.includes('.')) {
//             str = locale.get(label);
//         } else {
//             str += label;
//         }
//     }

//     return str;
// }

export function findLocale<T>(obj: T, fn: Function) {
    for (let k in obj) {
        if (k.endsWith('Locale') && typeof obj[k] === 'string') {
            const index = k.indexOf('Locale');
            obj[k.slice(0, index)] = fn(obj[k]);
        }
    }
    return obj;
}

// function findLocale(obj: any, locale: Locale) {
//     for (let k in obj) {
//         if (k === 'locale') {
//             obj.label = resetLabel(obj[k], locale);
//         } else if (k.endsWith('Locale')) {
//             const index = k.indexOf('Locale');
//             obj[k.slice(0, index)] = resetLabel(obj[k], locale);
//         } else if (obj[k] && !obj[k].$$typeof) {
//             if (Object.prototype.toString.call(obj[k]) === '[object Object]') {
//                 findLocale(obj[k], locale);
//             } else if (Object.prototype.toString.call(obj[k]) === '[object Array]') {
//                 resetDataLabel(obj[k], locale);
//             }
//         }
//     }

//     return obj;
// }

// export function resetDataLabel(data: any[], locale: Locale) {
//     for (let i = 0; i < data.length; i++) {
//         let item = data[i];

//         item = findLocale(item, locale);

//         if (item.children) {
//             item.children = resetDataLabel(item.children, locale);
//         }
//     }

//     return data;
// }
