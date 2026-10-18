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

import type { IDocsTableRenderViewport } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import { isDocSideMenuTableOverlapping } from '../doc-side-menu-layout';

const outline = { left: 16, right: 272, top: 16, bottom: 200 };
const table = { left: 420, right: 2340, top: 100, bottom: 280 };
const viewport: IDocsTableRenderViewport = {
    contentWidth: 1920,
    leadingInsetLeft: 404,
    scrollLeft: 0,
    viewportLeft: 16,
    viewportWidth: 1408,
};

describe('document outline table overlap', () => {
    it('keeps the outline open while the table starts at the paragraph origin', () => {
        expect(isDocSideMenuTableOverlapping(outline, table, viewport)).toBe(false);
    });

    it('detects content scrolled into the outline instead of treating the empty leading inset as content', () => {
        expect(isDocSideMenuTableOverlapping(outline, table, { ...viewport, scrollLeft: 200 })).toBe(true);
        expect(isDocSideMenuTableOverlapping(outline, table, { ...viewport, scrollLeft: 148 })).toBe(false);
    });

    it('allows reopening after the table scrolls outside the outline vertically', () => {
        const scrolled = { ...viewport, scrollLeft: 400 };
        expect(isDocSideMenuTableOverlapping(outline, { ...table, top: 200, bottom: 380 }, scrolled)).toBe(false);
        expect(isDocSideMenuTableOverlapping(outline, { ...table, top: -180, bottom: 0 }, scrolled)).toBe(false);
    });

    it('honors clipping and handles tables without a horizontal viewport', () => {
        expect(isDocSideMenuTableOverlapping(outline, table, { ...viewport, scrollLeft: 400, viewportLeft: 300 })).toBe(false);
        expect(isDocSideMenuTableOverlapping(outline, table, null)).toBe(false);
        expect(isDocSideMenuTableOverlapping(outline, { ...table, left: 100 }, null)).toBe(true);
    });
});
