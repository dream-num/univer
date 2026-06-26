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

/**
 * @vitest-environment jsdom
 */

import { describe, expect, it } from 'vitest';
import { resolveEmbedFloatingMenuRoot } from '../embed-floating-menu-root';

describe('resolveEmbedFloatingMenuRoot', () => {
    it('uses the runtime menu slot for fullscreen floating menus', () => {
        const menuSlot = document.createElement('div');
        const overlay = document.createElement('div');
        const rootElement = document.createElement('div');

        expect(resolveEmbedFloatingMenuRoot({
            renderScope: { fullscreen: true, rootElement } as any,
            runtimeScope: {
                roots: {
                    menuSlot,
                    overlay,
                },
            },
        } as any)).toBe(menuSlot);
    });

    it('uses overlay roots for normal floating menus before falling back to the render root', () => {
        const overlay = document.createElement('div');
        const renderOverlay = document.createElement('div');
        const rootElement = document.createElement('div');

        expect(resolveEmbedFloatingMenuRoot({
            renderScope: { fullscreen: false, overlayRoot: renderOverlay, rootElement } as any,
            runtimeScope: {
                roots: {
                    overlay,
                },
            },
        } as any)).toBe(overlay);

        expect(resolveEmbedFloatingMenuRoot({
            renderScope: { fullscreen: false, overlayRoot: renderOverlay, rootElement } as any,
            runtimeScope: {
                roots: {},
            },
        } as any)).toBe(renderOverlay);

        expect(resolveEmbedFloatingMenuRoot({
            renderScope: { fullscreen: false, rootElement } as any,
            runtimeScope: {
                roots: {},
            },
        } as any)).toBe(rootElement);
    });
});
