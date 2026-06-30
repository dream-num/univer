/**
 * Copyright 2023-present DreamNum Co., Ltd.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import type { ReactElement } from 'react';
import { render, unmount } from '@univerjs/design';

export interface IEmbedReactRoot {
    render: (node: ReactElement) => void;
}

const rootsByContainer = new WeakMap<Element, IEmbedReactRoot>();
const containersByRoot = new WeakMap<IEmbedReactRoot, Element>();
const rootVersions = new WeakMap<IEmbedReactRoot, number>();

export function createEmbedReactRoot(container: Element): IEmbedReactRoot {
    const existing = rootsByContainer.get(container);
    if (existing) {
        rootVersions.set(existing, (rootVersions.get(existing) ?? 0) + 1);
        return existing;
    }

    const root: IEmbedReactRoot = {
        render: (node) => render(node, container),
    };
    rootsByContainer.set(container, root);
    containersByRoot.set(root, container);
    rootVersions.set(root, 0);
    return root;
}

export function disposeEmbedReactRoot(root: IEmbedReactRoot): void {
    const container = containersByRoot.get(root);
    const version = rootVersions.get(root) ?? 0;
    const dispose = () => {
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
        if (container) {
            unmount(container);
        }
    };
    globalThis.setTimeout(dispose, 0);
}
