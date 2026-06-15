import type { Root } from 'react-dom/client';

export function disposeEmbedReactRoot(root: Root): void {
    const unmount = () => {
        root.unmount();
    };
    if (typeof queueMicrotask === 'function') {
        queueMicrotask(unmount);
        return;
    }
    void Promise.resolve().then(unmount);
}
