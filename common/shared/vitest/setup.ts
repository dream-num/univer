// jsdom has no layout engine. Tests that drive a resize supply their own observer.
if (typeof window !== 'undefined') {
    // jest-dom can install CSS.escape on its own. jsdom has no CSS feature detection.
    if (!window.CSS?.supports) {
        Reflect.set(window, 'CSS', { ...window.CSS, supports: () => false });
    }

    document.elementFromPoint ??= () => null;
    Element.prototype.scrollIntoView ??= () => {};
    Element.prototype.scrollTo ??= function (this: Element, options?: ScrollToOptions | number, y?: number) {
        if (typeof options === 'number') {
            this.scrollLeft = options;
            this.scrollTop = y ?? this.scrollTop;
        } else {
            this.scrollLeft = options?.left ?? this.scrollLeft;
            this.scrollTop = options?.top ?? this.scrollTop;
        }
    };

    window.ResizeObserver ??= class {
        observe() {}
        unobserve() {}
        disconnect() {}
    };

    window.matchMedia ??= (media) => {
        const maxDpi = /^\(max-resolution:\s*(\d+)dpi\)$/.exec(media);
        return Object.assign(new EventTarget(), {
            media,
            matches: maxDpi !== null && Number(maxDpi[1]) >= 96 * window.devicePixelRatio,
            onchange: null,
            addListener() {},
            removeListener() {},
        });
    };

    // Detached clipboard markup has no rendered text layout.
    if (!Object.getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText')) {
        Object.defineProperty(HTMLElement.prototype, 'innerText', {
            configurable: true,
            get(this: HTMLElement) { return this.textContent ?? ''; },
            set(this: HTMLElement, value: string) { this.textContent = value; },
        });
    }

    // jsdom parses stylesheets in documents but does not attach them to style elements in shadow roots.
    const sheet = Object.getOwnPropertyDescriptor(HTMLStyleElement.prototype, 'sheet')!;
    Object.defineProperty(HTMLStyleElement.prototype, 'sheet', {
        ...sheet,
        get(this: HTMLStyleElement) {
            const attached = sheet.get!.call(this);
            if (attached || !(this.getRootNode() instanceof ShadowRoot)) {
                return attached;
            }
            const parsed = new CSSStyleSheet();
            parsed.replaceSync(this.textContent ?? '');
            return parsed;
        },
    });
}
