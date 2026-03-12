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

import { beforeEach, describe, expect, it, vi } from 'vitest';
import { FontCache } from '../font-cache';

describe('font cache', () => {
    beforeEach(() => {
        (FontCache as any)._globalFontMeasureCache = new Map();
        (FontCache as any)._fontDataMap = new Map();
        (FontCache as any)._getTextHeightCache = {};
        (FontCache as any)._context = null;
    });

    it('handles measure cache lifecycle and fallback metrics', () => {
        const fakeContext = {
            font: '',
            textBaseline: 'middle',
            measureText: vi.fn(() => ({
                width: 20,
                fontBoundingBoxAscent: Number.NaN,
                fontBoundingBoxDescent: Number.NaN,
                actualBoundingBoxAscent: 10,
                actualBoundingBoxDescent: 5,
            })),
        };
        (FontCache as any)._context = fakeContext;
        const domSpy = vi.spyOn(FontCache, 'getTextSizeByDom').mockReturnValue({
            width: 10,
            height: 18,
        });

        const first = FontCache.getMeasureText('A', '12px Arial');
        expect(first.fontBoundingBoxAscent).toBe(9);
        expect(first.fontBoundingBoxDescent).toBe(9);
        expect(domSpy).toHaveBeenCalled();

        const second = FontCache.getMeasureText('A', '12px Arial');
        expect(second).toEqual(first);
        expect(fakeContext.measureText).toHaveBeenCalledTimes(1);

        FontCache.setFontMeasureCache('12px Arial', 'B', {
            width: 1,
            fontBoundingBoxAscent: 1,
            fontBoundingBoxDescent: 1,
            actualBoundingBoxAscent: 1,
            actualBoundingBoxDescent: 1,
        });
        expect(FontCache.getFontMeasureCache('12px Arial', 'B')).toBeTruthy();
        expect(FontCache.clearFontMeasureCache('12px Arial/B')).toBe(true);
        expect(FontCache.clearFontMeasureCache('12px Arial')).toBe(true);
    });

    it('auto-cleans overflow cache and computes baseline offsets', () => {
        const cache = new Map<string, any>();
        for (let i = 0; i < 10; i++) {
            cache.set(`k-${i}`, {
                width: i,
                fontBoundingBoxAscent: 1,
                fontBoundingBoxDescent: 1,
                actualBoundingBoxAscent: 1,
                actualBoundingBoxDescent: 1,
            });
        }
        (FontCache as any)._globalFontMeasureCache = new Map([
            ['12px Arial', cache],
            ['12px Other', new Map(cache)],
        ]);
        expect(FontCache.autoCleanFontMeasureCache(5)).toBe(true);

        expect(FontCache.getBaselineOffsetInfo('Unknown', 10)).toEqual({
            sbr: 0.6,
            sbo: 10,
            spr: 0.6,
            spo: 10,
        });

        (FontCache as any)._fontDataMap = new Map([
            ['MyFont', {
                subscriptSizeRatio: 0.5,
                subscriptOffset: 0.2,
                superscriptSizeRatio: 0.4,
                superscriptOffset: 0.3,
            }],
        ]);
        expect(FontCache.getBaselineOffsetInfo('MyFont', 20)).toEqual({
            sbr: 0.5,
            sbo: 4,
            spr: 0.4,
            spo: 6,
        });
    });

    it('calculates text bounding box by font data and glyph info', () => {
        (FontCache as any)._fontDataMap = new Map([
            ['Local Font', {
                notDefWidth: 0.6,
                ascender: 0.8,
                descender: 0.2,
                typoAscender: 0.75,
                typoDescender: 0.15,
                strikeoutPosition: 0.35,
                subscriptSizeRatio: 0.6,
                subscriptOffset: 0.3,
                superscriptSizeRatio: 0.5,
                superscriptOffset: 0.4,
                hdmxData: [12],
                glyphHorizonMap: new Map([
                    ['A'.charCodeAt(0), {
                        width: 0.7,
                        lsb: 0,
                        pixelsPerEm: [0.65],
                    }],
                ]),
            }],
        ]);

        const byFont = FontCache.getTextSize('A', {
            fontString: '12px Local Font',
            fontSize: 12,
            originFontSize: 12,
            fontFamily: 'Local Font',
            fontCache: '12px Local Font',
        } as any);
        expect(byFont.width).toBeGreaterThan(0);
        expect(byFont.ba).toBeCloseTo(9.6);
        expect(byFont.abd).toBeCloseTo(1.8);

        const byMeasure = FontCache.getTextSize('Z', {
            fontString: '11px Other Font',
            fontSize: 11,
            originFontSize: 11,
            fontFamily: 'Other Font',
            fontCache: '11px Other Font',
        } as any);
        expect(byMeasure.width).toBeGreaterThanOrEqual(0);

        const fromGlyphInfo = FontCache.getBBoxFromGlyphInfo({
            glyph: {
                advanceWidth: 500,
            },
            font: {
                unitsPerEm: 1000,
                ascender: 800,
                descender: -200,
            },
            boundingBox: {
                x1: 0,
                y1: -120,
                x2: 510,
                y2: 710,
            },
        } as any, {
            fontString: '12px Arial',
            fontSize: 12,
            originFontSize: 12,
            fontFamily: 'Arial',
            fontCache: '12px Arial',
        } as any);

        expect(fromGlyphInfo.width).toBeGreaterThan(0);
        expect(fromGlyphInfo.aba).toBeGreaterThan(0);
    });
});
