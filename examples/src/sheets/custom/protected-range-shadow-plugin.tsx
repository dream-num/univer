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

import type { Univer } from '@univerjs/core';
import type { FUniver } from '@univerjs/core/facade';
import { connectInjector } from '@univerjs/ui';
import { createRoot } from 'react-dom/client';
import { ProtectedRangeShadowDemo } from './protected-range-shadow-demo';

/**
 * Initialize the protected range shadow demo by mounting it directly to a DOM element
 */
export function initProtectedRangeShadowDemo(univer: Univer, univerAPI: FUniver) {
    // Create a container div for our demo
    const container = document.createElement('div');
    container.id = 'protected-range-shadow-demo';
    document.body.appendChild(container);

    // Connect the component to the injector
    const ConnectedDemo = connectInjector(ProtectedRangeShadowDemo, univer.__getInjector());

    // Mount the component
    const root = createRoot(container);
    root.render(<ConnectedDemo univerAPI={univerAPI} />);

    // Clean up on univer dispose
    univer.onDispose(() => {
        root.unmount();
        container.remove();
    });
}
