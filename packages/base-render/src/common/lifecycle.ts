import { toDisposable } from '@univerjs/core';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fromWindowEvent<K extends keyof WindowEventMap>(
    type: K,
    listener: (this: Window, ev: WindowEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
) {
    window.addEventListener(type, listener, options);
    return toDisposable(() => window.removeEventListener(type, listener, options));
}
