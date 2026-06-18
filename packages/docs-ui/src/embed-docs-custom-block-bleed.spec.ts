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

import { describe, expect, it, vi } from 'vitest';
import { resolveDocsTableLikeCustomBlockBleedViewport } from './embed-docs-custom-block-bleed';

describe('resolveDocsTableLikeCustomBlockBleedViewport', () => {
    it('uses the clipping ancestor as the bleed boundary', () => {
        const boundary = createElementWithRect({ left: 100, right: 1200, width: 1100 });
        const root = createElementWithRect({ left: 220, right: 1180, width: 960 });
        boundary.style.overflow = 'hidden';
        boundary.appendChild(root);
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1800);

        expect(resolveDocsTableLikeCustomBlockBleedViewport(root, 1500)).toEqual({
            bleedLeft: 110,
            bleedRight: 10,
            bleedWidth: 1080,
            contentWidth: 1500,
            virtualWidth: 1620,
        });
    });

    it('falls back to the visual window when no clipping ancestor exists', () => {
        const root = createElementWithRect({ left: 220, right: 1180, width: 960 });
        document.body.appendChild(root);
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);

        expect(resolveDocsTableLikeCustomBlockBleedViewport(root, 960)).toEqual({
            bleedLeft: 210,
            bleedRight: 250,
            bleedWidth: 1420,
            contentWidth: 960,
            virtualWidth: 1420,
        });
    });
});

function createElementWithRect(rect: { left: number; right: number; width: number }): HTMLElement {
    const element = document.createElement('div');
    element.getBoundingClientRect = () => ({
        bottom: 0,
        height: 0,
        left: rect.left,
        right: rect.right,
        top: 0,
        width: rect.width,
        x: rect.left,
        y: 0,
        toJSON: () => rect,
    });

    return element;
}
