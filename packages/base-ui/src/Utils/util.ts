/**
 * check element
 * @param element
 * @returns
 */
export function isElement(element: any) {
    return element instanceof Element || element instanceof HTMLDocument;
}

/**
 * DOM selector
 * @param {String}  selector css selector
 * @param {String}  context  parent DOM
 */
export function $$(selector: string, context?: HTMLElement | Document) {
    context = context || document;
    const elements = context.querySelectorAll(selector);

    return elements.length === 1 ? Array.prototype.slice.call(elements)[0] : Array.prototype.slice.call(elements);
}

/**
 * add className
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
    const elements = Array.prototype.slice.call(context.querySelectorAll(selector));

    elements.forEach((ele) => {
        ele.classList.add(className);
    });
}
/**
 * remove className
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
    const elements = Array.prototype.slice.call(context.querySelectorAll(selector));

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
 * join className
 */
export function joinClassNames(...args: any) {
    if (!args.length) return;
    let result = '';
    args.forEach((item: any) => {
        if (item instanceof Object) {
            for (const k in item) {
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

export const getNodeIndex = (elm: any) => [...elm.parentNode.children].indexOf(elm);

// 防抖
export function debounce(fn: Function, time: number) {
    let timer: any = null;
    return (...arg: any) => {
        clearTimeout(timer);
        timer = setTimeout(() => {
            fn(...arg);
        }, time);
    };
}

export function selectTextContent(ele: Node) {
    if (window.getSelection) {
        // all browsers, except IE before version 9
        const range = document.createRange();
        const content = ele.firstChild;
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
        const range = document.createRange();
        const sContent = sEle.firstChild;
        const eContent = eEle.firstChild;
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

export function printableCharacter(keycode: number) {
    const valid =
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

export function isCtrlPressed(event: KeyboardEvent) {
    let isCtrl = false;

    // Determine the corresponding key code of the Ctrl key according to the operating system
    if (navigator.userAgent.indexOf('Mac') !== -1) {
        // Mac
        isCtrl = event.metaKey;
    } else {
        // Windows
        isCtrl = event.ctrlKey;
    }

    return isCtrl;
}
