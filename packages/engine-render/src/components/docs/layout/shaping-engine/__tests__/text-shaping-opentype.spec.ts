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

import type { IDocumentBody } from '@univerjs/core';
import { afterEach, describe, expect, it, vi } from 'vitest';

function createBody(dataStream: string): IDocumentBody {
    return {
        dataStream,
        textRuns: [],
    };
}

async function flushImportQueue() {
    await Promise.resolve();
    await Promise.resolve();
    await vi.dynamicImportSettled();
}

describe('textShape optional opentype loading', () => {
    afterEach(() => {
        vi.resetModules();
        vi.clearAllMocks();
        vi.unmock('opentype.js/dist/opentype.module');
        vi.unmock('../font-library');
    });

    it('should shape text after async opentype parser is loaded', async () => {
        const parseMock = vi.fn(() => ({
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            stringToGlyphs: (content: string) => (content.match(/[\s\S]/gu) ?? []).map(() => ({
                index: 1,
                advanceWidth: 500,
                getBoundingBox: () => ({ x1: 0, y1: -10, x2: 10, y2: 10 }),
            })),
            getKerningValue: () => 0,
        }));

        const findBestMatchFontByStyleMock = vi.fn(() => ({
            font: {
                fullName: 'MockFont',
            },
            buffer: new ArrayBuffer(8),
        }));

        vi.doMock('opentype.js/dist/opentype.module', () => ({
            parse: parseMock,
        }));

        vi.doMock('../font-library', () => ({
            fontLibrary: {
                isReady: true,
                getValidFontFamilies: () => ['MockFont'],
                findBestMatchFontByStyle: findBestMatchFontByStyleMock,
            },
        }));

        const { fontLibrary } = await import('../font-library');
        expect(fontLibrary.isReady).toBe(true);

        const { textShape } = await import('../text-shaping');
        const body = createBody('AB');

        expect(textShape(body)).toEqual([]);

        await flushImportQueue();

        const shaped = textShape(body);

        expect(shaped.map((item) => item.char)).toEqual(['A', 'B']);
        expect(shaped.map((item) => [item.start, item.end])).toEqual([[0, 1], [1, 2]]);
        expect(parseMock).toHaveBeenCalledTimes(1);
        expect(findBestMatchFontByStyleMock).toHaveBeenCalled();
    });

    it('should gracefully return empty result when opentype module is unavailable', async () => {
        const findBestMatchFontByStyleMock = vi.fn();

        vi.doMock('opentype.js/dist/opentype.module', () => {
            throw new Error('Cannot find module');
        });

        vi.doMock('../font-library', () => ({
            fontLibrary: {
                isReady: true,
                getValidFontFamilies: () => ['MockFont'],
                findBestMatchFontByStyle: findBestMatchFontByStyleMock,
            },
        }));

        const { textShape } = await import('../text-shaping');
        const body = createBody('AB');

        expect(textShape(body)).toEqual([]);

        await flushImportQueue();

        expect(textShape(body)).toEqual([]);
        expect(findBestMatchFontByStyleMock).not.toHaveBeenCalled();
    });

    it('should fallback to per-character glyph infos when no valid font family exists', async () => {
        const parseMock = vi.fn(() => ({
            unitsPerEm: 1000,
            ascender: 800,
            descender: -200,
            stringToGlyphs: () => [],
            getKerningValue: () => 0,
        }));

        vi.doMock('opentype.js/dist/opentype.module', () => ({
            parse: parseMock,
        }));

        vi.doMock('../font-library', () => ({
            fontLibrary: {
                isReady: true,
                getValidFontFamilies: () => [],
                findBestMatchFontByStyle: vi.fn(),
            },
        }));

        const { fontLibrary } = await import('../font-library');
        expect(fontLibrary.isReady).toBe(true);

        const { textShape } = await import('../text-shaping');
        const body = createBody('ABC');

        expect(textShape(body)).toEqual([]);

        await flushImportQueue();

        const shaped = textShape(body);

        expect(shaped.map((item) => item.char)).toEqual(['A', 'B', 'C']);
        expect(shaped.map((item) => [item.start, item.end])).toEqual([[0, 1], [1, 2], [2, 3]]);
        expect(shaped.every((item) => item.glyph == null && item.font == null)).toBe(true);
        expect(parseMock).not.toHaveBeenCalled();
    });
});
