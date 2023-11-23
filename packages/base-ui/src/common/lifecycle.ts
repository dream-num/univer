import { toDisposable } from '@univerjs/core';
import { IDisposable } from '@wendellhu/redi';

export function fromDocumentEvent<K extends keyof DocumentEventMap>(
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: Document, ev: DocumentEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): IDisposable {
    document.addEventListener(type, listener, options);
    return toDisposable(() => document.removeEventListener(type, listener, options));
}

export function fromEvent<K extends keyof HTMLElementEventMap>(
    target: HTMLElement,
    type: K,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
): IDisposable {
    target.addEventListener(type, listener, options);
    return toDisposable(() => target.removeEventListener(type, listener, options));
}
