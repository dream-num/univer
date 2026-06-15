import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

const rootsByContainer = new WeakMap<Element, Root>();
const containersByRoot = new WeakMap<Root, Element>();
const rootVersions = new WeakMap<Root, number>();

export function createEmbedReactRoot(container: Element): Root {
    const existing = rootsByContainer.get(container);
    if (existing) {
        rootVersions.set(existing, (rootVersions.get(existing) ?? 0) + 1);
        return existing;
    }

    const root = createRoot(container);
    rootsByContainer.set(container, root);
    containersByRoot.set(root, container);
    rootVersions.set(root, 0);
    return root;
}

export function disposeEmbedReactRoot(root: Root): void {
    const container = containersByRoot.get(root);
    const version = rootVersions.get(root) ?? 0;
    const unmount = () => {
        if (container && rootsByContainer.get(container) !== root) {
            return;
        }
        if ((rootVersions.get(root) ?? 0) !== version) {
            return;
        }
        if (container) {
            rootsByContainer.delete(container);
            containersByRoot.delete(root);
        }
        rootVersions.delete(root);
        root.unmount();
    };
    if (typeof queueMicrotask === 'function') {
        queueMicrotask(unmount);
        return;
    }
    void Promise.resolve().then(unmount);
}
