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

import { BooleanNumber } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { textShape } from '../text-shaping';

const h = vi.hoisted(() => {
    const getKerningValue = vi.fn((prev: any, next: any) => (prev?.index === 1 && next?.index === 2 ? -20 : 0));
    const mockFont = {
        unitsPerEm: 1000,
        stringToGlyphs: vi.fn((content: string) => {
            return content.split('').map((char, index) => ({
                index: char === '?' ? 0 : index + 1,
                advanceWidth: 520,
                getBoundingBox: () => ({
                    x1: 0,
                    y1: -120,
                    x2: 520,
                    y2: 720,
                }),
            }));
        }),
        getKerningValue,
    };

    return {
        parse: vi.fn(() => mockFont),
        fontLibrary: {
            isReady: true,
            getValidFontFamilies: vi.fn((families: string[]) => families),
            findBestMatchFontByStyle: vi.fn(() => ({
                font: {
                    family: 'Arial',
                    fullName: 'Arial Regular',
                    postscriptName: 'Arial-Regular',
                    style: 'Regular',
                },
                buffer: new ArrayBuffer(8),
            })),
        },
        getKerningValue,
    };
});

vi.mock('opentype.js/dist/opentype.module', () => ({
    parse: h.parse,
}));

vi.mock('../font-library', () => ({
    fontLibrary: h.fontLibrary,
}));

describe('text shaping runtime', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        h.fontLibrary.isReady = true;
        h.fontLibrary.getValidFontFamilies.mockImplementation((families: string[]) => families);
        h.fontLibrary.findBestMatchFontByStyle.mockReturnValue({
            font: {
                family: 'Arial',
                fullName: 'Arial Regular',
                postscriptName: 'Arial-Regular',
                style: 'Regular',
            },
            buffer: new ArrayBuffer(8),
        });
    });

    it('returns empty result when font library is not ready', () => {
        h.fontLibrary.isReady = false;
        const result = textShape({
            dataStream: 'AB',
        } as any);
        expect(result).toEqual([]);
    });

    it('shapes text chunks with kerning and caches results', () => {
        const body = {
            dataStream: 'AB\r',
            textRuns: [{
                st: 0,
                ed: 2,
                ts: {
                    ff: 'Arial',
                    bl: BooleanNumber.FALSE,
                    it: BooleanNumber.FALSE,
                },
            }],
        } as any;

        const first = textShape(body);
        expect(first.length).toBeGreaterThanOrEqual(2);
        expect(first[0].glyph).toBeTruthy();
        expect(first[1].kerning).toBe(-20);
        expect(h.parse).toHaveBeenCalledTimes(1);

        const second = textShape(body);
        expect(second).toBe(first);
        expect(h.parse).toHaveBeenCalledTimes(1);
    });

    it('falls back to null glyph when no valid font family exists', () => {
        h.fontLibrary.getValidFontFamilies.mockReturnValueOnce([]);
        const result = textShape({
            dataStream: 'A',
        } as any);

        expect(result).toHaveLength(1);
        expect(result[0].glyph).toBeNull();
        expect(result[0].font).toBeNull();
    });
});
