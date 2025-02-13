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

import type * as React from 'react';
import type { Root } from 'react-dom/client';
import { createRoot } from 'react-dom/client';

// Map to track container and corresponding Root
const rootMap = new WeakMap<Element | DocumentFragment, Root>();

// ========================== Render ==========================
export function render(node: React.ReactElement, container: Element | DocumentFragment) {
    // Get or create the root
    let root = rootMap.get(container);

    if (!root) {
        root = createRoot(container);
        rootMap.set(container, root);
    }

    // Render the React element
    root.render(node);
}

// ========================= Unmount ==========================
export function unmount(container: Element | DocumentFragment) {
    const root = rootMap.get(container);

    if (root) {
        root.unmount();
        rootMap.delete(container); // Clean up the mapping
    }
}
