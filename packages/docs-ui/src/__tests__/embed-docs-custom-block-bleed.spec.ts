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

// @vitest-environment jsdom

import { describe, expect, it, vi } from 'vitest';
import {
    resolveDocsTableLikeCustomBlockBleedViewport,
    resolveDocsTableLikeCustomBlockContentHeight,
    resolveDocsTableLikeCustomBlockContentWidth,
} from '../embed-docs-custom-block-bleed';

describe('resolveDocsTableLikeCustomBlockBleedViewport', () => {
    it('keeps the viewport inside the block when content fits the block width', () => {
        const boundary = createElementWithRect({ left: 100, right: 1200, width: 1100 });
        const root = createElementWithRect({ left: 220, right: 1180, width: 960 });
        boundary.style.overflow = 'hidden';
        boundary.appendChild(root);
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1800);

        expect(resolveDocsTableLikeCustomBlockBleedViewport(root, 960)).toEqual({
            bleedLeft: 0,
            bleedRight: 0,
            bleedWidth: 960,
            contentWidth: 960,
            virtualWidth: 960,
        });
    });

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
            virtualWidth: 1610,
        });
    });

    it('falls back to the visual window when wide content has no clipping ancestor', () => {
        const root = createElementWithRect({ left: 220, right: 1180, width: 960 });
        document.body.appendChild(root);
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);

        expect(resolveDocsTableLikeCustomBlockBleedViewport(root, 1200)).toEqual({
            bleedLeft: 210,
            bleedRight: 250,
            bleedWidth: 1420,
            contentWidth: 1200,
            virtualWidth: 1420,
        });
    });

    it('uses authoritative render viewport bleed hints without expanding the layout root', () => {
        const root = createElementWithRect({ left: 220, right: 1180, width: 960 });
        document.body.appendChild(root);
        vi.spyOn(window, 'innerWidth', 'get').mockReturnValue(1440);

        expect(resolveDocsTableLikeCustomBlockBleedViewport(root, 1800, {
            bleedLeft: 210,
            bleedWidth: 1420,
        })).toEqual({
            bleedLeft: 210,
            bleedRight: 250,
            bleedWidth: 1420,
            contentWidth: 1800,
            virtualWidth: 2010,
        });
    });

    it('keeps authoritative bleed hints even when runtime content width has not caught up', () => {
        const root = createElementWithRect({ left: 220, right: 1180, width: 960 });

        expect(resolveDocsTableLikeCustomBlockBleedViewport(root, 960, {
            bleedLeft: 210,
            bleedWidth: 1420,
        })).toEqual({
            bleedLeft: 210,
            bleedRight: 250,
            bleedWidth: 1420,
            contentWidth: 960,
            virtualWidth: 1420,
        });
    });

    it('prefers authoritative product content width over runtime DOM fallback', () => {
        expect(resolveDocsTableLikeCustomBlockContentWidth(1600, 960)).toBe(1600);
        expect(resolveDocsTableLikeCustomBlockContentWidth(undefined, 960)).toBe(960);
        expect(resolveDocsTableLikeCustomBlockContentWidth(0, 960)).toBe(960);
    });

    it('prefers authoritative product content height over runtime DOM fallback', () => {
        expect(resolveDocsTableLikeCustomBlockContentHeight(1200, 480)).toBe(1200);
        expect(resolveDocsTableLikeCustomBlockContentHeight(undefined, 480)).toBe(480);
        expect(resolveDocsTableLikeCustomBlockContentHeight(0, 480)).toBe(480);
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
