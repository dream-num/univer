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

import type { IDocumentSkeletonGlyph } from '../../../../../basics/i-document-skeleton-cached';
import { BooleanNumber, DataStreamTreeTokenType, DocumentFlavor, GridType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../../basics/i-document-skeleton-cached';
import { getFontStyleString } from '../../../../../basics/tools';
import { getDocumentCompatibilityPolicy } from '../../../document-compatibility';
import { FontCache } from '../../shaping-engine/font-cache';
import {
    applyGlyphKerning,
    baseAdjustability,
    createSkeletonBulletGlyph,
    createSkeletonLetterGlyph,
    glyphShrinkLeft,
    glyphShrinkRight,
    isJustifiable,
    isSpace,
    measureTextWithCharacterSpacing,
    setGlyphGroupLeft,
} from '../glyph';

describe('Glyph utils test cases', () => {
    it.each([['）', [0, 0]], ['（', [0, 0]], ['・', [0, 0]]] as const)('does not compress already half-width DrawingML punctuation %s', (content, shrinkability) => {
        const textStyle = { ff: 'Proportional punctuation regression', fs: 13.5 };
        const fontStyle = getFontStyleString(textStyle);
        FontCache.setFontMeasureCache(fontStyle.fontString, content, {
            width: 9,
            fontBoundingBoxAscent: 17,
            fontBoundingBoxDescent: 5,
            actualBoundingBoxAscent: 15,
            actualBoundingBoxDescent: 2,
        });
        try {
            for (const flavor of [DocumentFlavor.UNSPECIFIED, DocumentFlavor.DRAWINGML]) {
                const glyph = createSkeletonLetterGlyph(content, {
                    textStyle,
                    fontStyle,
                    charSpace: 0,
                    snapToGrid: BooleanNumber.FALSE,
                    documentCompatibilityPolicy: getDocumentCompatibilityPolicy(flavor),
                });
                expect(glyph.width).toBe(9);
                expect(glyph.adjustability.shrinkability).toEqual(flavor === DocumentFlavor.DRAWINGML
                    ? shrinkability
                    : baseAdjustability(content, 9).shrinkability);
            }
            expect(baseAdjustability('）', 18, 18).shrinkability).toEqual([0, 9]);
            expect(baseAdjustability('。', 12, 18).shrinkability).toEqual([0, 3]);
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
        }
    });

    it.each([
        [11, 9, 8.8],
        [12, 9.5, 9.6],
        [13, 10.5, 10.4],
        [24, 19, 19.2],
        [36, 29, 28.8],
    ])('uses native small-cap sizing at %s pt without shrinking line metrics or kerning thresholds', (fs, wordSize, drawingSize) => {
        const textStyle = { ff: 'Small caps regression', fs, smallCaps: true, kerning: fs };
        const fontStyle = getFontStyleString(textStyle);
        for (const [flavor, expectedSize] of [[DocumentFlavor.MODERN, wordSize], [DocumentFlavor.DRAWINGML, drawingSize]] as const) {
            const config = {
                textStyle,
                fontStyle,
                charSpace: 0,
                snapToGrid: BooleanNumber.FALSE,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(flavor),
            };
            const normal = createSkeletonLetterGlyph('H', config);
            for (const [raw, content] of [['h', 'H'], ['é', 'É'], ['ß', 'ß'], ['a\u0301', 'A\u0301']]) {
                const small = createSkeletonLetterGlyph(raw, config);
                expect(small.fontStyle?.fontSize).toBeCloseTo(expectedSize);
                expect(small.fontStyle?.originFontSize).toBe(fs);
                expect(small.fontStyle?.fontKerning).toBe('normal');
                expect(small.bBox.ba).toBe(normal.bBox.ba);
                expect(small.bBox.bd).toBe(normal.bBox.bd);
                expect(small.bBox.normalLineHeight).toBe(normal.bBox.normalLineHeight);
                expect(small).toMatchObject({ raw, content, count: raw.length, ts: textStyle });
            }
            for (const raw of ['H', '1', ' ', '中', '😀']) {
                expect(createSkeletonLetterGlyph(raw, config).fontStyle).toBe(fontStyle);
            }
            expect(createSkeletonLetterGlyph('h', { ...config, textStyle: { ...textStyle, caps: true } }).fontStyle).toBe(fontStyle);
            expect(createSkeletonLetterGlyph('h', { ...config, textStyle: { ...textStyle, smallCaps: false } }).content).toBe('h');
        }
    });

    it('measures display capitals while preserving Unicode text and source offsets', () => {
        const raw = 'aéß中😀a\u0301';
        const content = 'AÉß中😀A\u0301';
        const textStyle = { ff: 'Caps regression', fs: 12, caps: true };
        const fontStyle = getFontStyleString(textStyle);
        FontCache.setFontMeasureCache(fontStyle.fontString, content, {
            width: 70,
            fontBoundingBoxAscent: 12,
            fontBoundingBoxDescent: 3,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        });
        try {
            const glyph = createSkeletonLetterGlyph(raw, { textStyle, fontStyle, charSpace: 0, snapToGrid: BooleanNumber.FALSE });
            expect(glyph).toMatchObject({ content, raw, count: raw.length, width: 70 });
            expect(glyph.ts).toEqual(textStyle);
            expect(glyph.fontStyle).toEqual(fontStyle);
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
        }
    });

    it.each(['V', ' ', '\u00A0'])('shares threshold decisions and recomputes pair advances with %j at line splits without changing source indices', (right) => {
        const textStyle = { ff: 'Kerning regression', fs: 12, kerning: 12 };
        const fontStyle = getFontStyleString(textStyle);
        expect(fontStyle.fontKerning).toBe('normal');
        expect(getFontStyleString({ ...textStyle, fs: 11 }).fontKerning).toBe('none');
        expect(getFontStyleString({ ...textStyle, kerning: 0 }).fontKerning).toBe('none');
        expect(getFontStyleString({ fs: 12 }).fontKerning).toBeUndefined();
        const metrics = { width: 10, fontBoundingBoxAscent: 12, fontBoundingBoxDescent: 3, actualBoundingBoxAscent: 10, actualBoundingBoxDescent: 2 };
        for (const mode of ['normal', 'none']) {
            for (const content of ['A', right, `A${right}`]) {
                FontCache.setFontMeasureCache(`${fontStyle.fontString}\u0000${mode}`, content, {
                    ...metrics,
                    width: content === `A${right}` ? (mode === 'normal' ? 18 : 20) : 10,
                });
            }
        }
        try {
            const config = { fontStyle, textStyle, charSpace: 0, snapToGrid: BooleanNumber.FALSE };
            const glyphs = ['A', right].map((content) => createSkeletonLetterGlyph(content, config));
            applyGlyphKerning(glyphs);
            setGlyphGroupLeft(glyphs);
            expect(glyphs.map((glyph) => [glyph.left, glyph.width, glyph.count])).toEqual([[0, 8, 1], [8, 10, 1]]);
            applyGlyphKerning(glyphs);
            expect(glyphs[0].width).toBe(8);
            applyGlyphKerning(glyphs.slice(0, 1));
            expect(glyphs[0].width).toBe(10);
            expect(glyphs[0].bBox.width).toBe(10);
        } finally {
            for (const mode of ['normal', 'none']) {
                FontCache.clearFontMeasureCache(`${fontStyle.fontString}\u0000${mode}`);
            }
        }
    });

    it('keeps DrawingML line separators zero-width without losing their source or font metrics', () => {
        const fontStyle = getFontStyleString({ ff: 'Line separator regression', fs: 12 });
        FontCache.setFontMeasureCache(fontStyle.fontString, '\u2028', {
            width: 8,
            fontBoundingBoxAscent: 12,
            fontBoundingBoxDescent: 3,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
        });
        try {
            for (const sc of [0, 2]) {
                for (const snapToGrid of [BooleanNumber.FALSE, BooleanNumber.TRUE]) {
                    const config = {
                        fontStyle,
                        textStyle: { sc },
                        charSpace: 4,
                        gridType: GridType.SNAP_TO_CHARS,
                        snapToGrid,
                        documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML),
                    };
                    const glyph = createSkeletonLetterGlyph('\u2028', config);
                    expect(glyph.width).toBe(0);
                    expect(glyph.bBox).toMatchObject({ width: 0, ba: 12, bd: 3 });
                    expect(glyph).toMatchObject({ content: '\u2028', raw: '\u2028', count: 1, xOffset: 0 });
                    if (snapToGrid === BooleanNumber.FALSE) {
                        expect(createSkeletonLetterGlyph('\u2028', config, 25).width).toBe(25);
                    }
                }
            }
            for (const flavor of [DocumentFlavor.UNSPECIFIED, DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL]) {
                expect(createSkeletonLetterGlyph('\u2028', {
                    fontStyle,
                    textStyle: {},
                    charSpace: 0,
                    snapToGrid: BooleanNumber.FALSE,
                    documentCompatibilityPolicy: getDocumentCompatibilityPolicy(flavor),
                }).width).toBe(8);
            }
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
        }
    });

    it('applies character spacing to advances without changing ink, source positions, or explicit object widths', () => {
        const fontStyle = getFontStyleString({ ff: 'Spacing regression', fs: 12 });
        const metrics = {
            width: 10,
            fontBoundingBoxAscent: 12,
            fontBoundingBoxDescent: 3,
            actualBoundingBoxAscent: 10,
            actualBoundingBoxDescent: 2,
        };
        for (const text of ['A', '中', 'e\u0301', '👩‍💻', '\r', '\t']) {
            FontCache.setFontMeasureCache(fontStyle.fontString, text, metrics);
        }
        try {
            for (const sc of [-3, 0, 2]) {
                const config = { fontStyle, textStyle: { sc }, charSpace: 0, snapToGrid: BooleanNumber.FALSE };
                for (const text of ['A', '中', 'e\u0301', '👩‍💻']) {
                    const glyph = createSkeletonLetterGlyph(text, config);
                    expect(glyph.width).toBe(10 + sc);
                    expect(glyph.bBox.width).toBe(10);
                    expect(glyph.count).toBe(text.length);
                    expect(glyph.raw).toBe(text);
                    expect(createSkeletonLetterGlyph(text, config, 25).width).toBe(25);
                    const next = createSkeletonLetterGlyph('A', config);
                    setGlyphGroupLeft([glyph, next]);
                    expect(next.left).toBe(10 + sc);
                }
                expect(createSkeletonLetterGlyph('\r', config).width).toBe(10);
                expect(createSkeletonLetterGlyph('\t', config).width).toBe(10);
                expect(createSkeletonLetterGlyph(DataStreamTreeTokenType.DOCS_END, config).width).toBe(0);
            }
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
        }
    });

    it('tracks graphemes, keeps cursive words intact, and shares the measured offsets with painting', () => {
        const measured: string[] = [];
        const result = measureTextWithCharacterSpacing('e\u0301👩‍💻مرحباก้ข', -3, (text) => {
            measured.push(text);
            return 10;
        })!;
        expect(measured).toEqual(['e\u0301', '👩‍💻', 'مرحبا', 'ก้', 'ข']);
        expect(result.segments.map((segment) => segment.left)).toEqual([0, 7, 14, 21, 28]);
        expect(result.width).toBe(35);
        expect(result.inkWidth).toBe(38);
        const kerned = measureTextWithCharacterSpacing('AV', 2, () => 10, () => -2)!;
        expect(kerned.segments.map((segment) => segment.left)).toEqual([0, 10]);
        expect(kerned.width).toBe(22);
        expect(kerned.inkWidth).toBe(20);
        for (const spacing of [undefined, 0, Number.NaN, Infinity]) {
            expect(measureTextWithCharacterSpacing('AV', spacing, () => {
                throw new Error('Untracked text must retain its original shaping');
            })).toBeUndefined();
        }
    });

    describe('test baseAdjustability', () => {
        it('should return correct adjustability for space', () => {
            const result = baseAdjustability(' ', 12);
            expect(result).toEqual({
                stretchability: [0, 6],
                shrinkability: [0, 4],
            });
        });

        it('should return correct adjustability for CJK left aligned punctuation', () => {
            const result = baseAdjustability('，', 10);
            expect(result).toEqual({
                stretchability: [0, 0],
                shrinkability: [0, 5],
            });
        });

        it('should return correct adjustability for CJK right aligned punctuation', () => {
            const result = baseAdjustability('“', 10);
            expect(result).toEqual({
                stretchability: [0, 0],
                shrinkability: [5, 0],
            });
        });

        it('should return correct adjustability for CJK center aligned punctuation', () => {
            const result = baseAdjustability('\u{30FB}', 12);
            expect(result).toEqual({
                stretchability: [0, 0],
                shrinkability: [3, 3],
            });
        });
    });

    describe('test isJustifiable', () => {
        it('should return true for space', () => {
            const result = isJustifiable(' ');
            expect(result).toBe(true);
        });

        it('should return true for Chinese', () => {
            const result = isJustifiable('中');
            expect(result).toBe(true);
        });

        it('should return true for CJK left aligned punctuation', () => {
            const result = isJustifiable('，');
            expect(result).toBe(true);
        });

        it('should return true for CJK right aligned punctuation', () => {
            const result = isJustifiable('“');
            expect(result).toBe(true);
        });

        it('should return true for CJK center aligned punctuation', () => {
            const result = isJustifiable('\u{30FB}');
            expect(result).toBe(true);
        });
    });

    describe('test isSpace', () => {
        it('should return true for space', () => {
            const result = isSpace(' ');
            expect(result).toBe(true);
        });

        it('should return true for non-breaking space', () => {
            const result = isSpace('\u{00A0}');
            expect(result).toBe(true);
        });

        it('should return true for full-width space', () => {
            const result = isSpace('　');
            expect(result).toBe(true);
        });

        it('should return false for other characters', () => {
            const result = isSpace('a');
            expect(result).toBe(false);
        });
    });

    describe('test glyphShrinkRight', () => {
        it('should shrink right', () => {
            const glyph = {
                adjustability: {
                    shrinkability: [10, 10],
                    stretchability: [10, 10],
                },
                width: 20,
            } as IDocumentSkeletonGlyph;
            glyphShrinkRight(glyph, 5);
            expect(glyph.adjustability.shrinkability).toEqual([10, 5]);
            expect(glyph.width).toBe(15);
        });
    });

    describe('test glyphShrinkLeft', () => {
        it('should shrink left', () => {
            const glyph = {
                adjustability: {
                    shrinkability: [10, 10],
                    stretchability: [10, 10],
                },
                xOffset: 0,
                width: 20,
            } as IDocumentSkeletonGlyph;
            glyphShrinkLeft(glyph, 5);
            expect(glyph.adjustability.shrinkability).toEqual([5, 10]);
            expect(glyph.width).toBe(15);
            expect(glyph.xOffset).toBe(-5);
        });
    });

    describe('test bullet glyph style', () => {
        it('uses explicit bullet style while inheriting omitted properties from the paragraph glyph', () => {
            let measuredFont = '';
            const measureSpy = vi.spyOn(FontCache, 'getTextSize').mockImplementation((_content, fontStyle) => {
                measuredFont = fontStyle.fontString;
                return {
                    width: 12,
                    ba: 18,
                    bd: 4,
                    aba: 18,
                    abd: 4,
                    sp: 0,
                    sbr: 0,
                    sbo: 0,
                    spr: 0,
                    spo: 0,
                };
            });
            const paragraphGlyph = {
                content: 'I',
                raw: 'I',
                ts: {
                    ff: 'Arial',
                    fs: 24,
                    bl: BooleanNumber.TRUE,
                    cl: { rgb: '#111111' },
                },
                fontStyle: {
                    fontString: 'bold 24pt Arial',
                    fontSize: 24,
                    originFontSize: 24,
                    fontFamily: 'Arial',
                    fontCache: 'Arial-24-bold',
                },
                width: 12,
                bBox: {
                    width: 12,
                    ba: 18,
                    bd: 4,
                    aba: 18,
                    abd: 4,
                    sp: 0,
                    sbr: 0,
                    sbo: 0,
                    spr: 0,
                    spo: 0,
                },
                xOffset: 0,
                left: 0,
                glyphType: GlyphType.LETTER,
                streamType: DataStreamTreeTokenType.LETTER,
                isJustifiable: false,
                adjustability: {
                    stretchability: [0, 0],
                    shrinkability: [0, 0],
                },
                count: 1,
            } as IDocumentSkeletonGlyph;

            const bulletGlyph = createSkeletonBulletGlyph(
                paragraphGlyph,
                {
                    listId: 'issue-1207-list',
                    symbol: 'p',
                    ts: {
                        ff: 'Wingdings',
                        cl: { rgb: '#FF0000' },
                    },
                    startIndexItem: 1,
                },
                10
            );

            expect(bulletGlyph.content).toBe('p');
            expect(bulletGlyph.ts).toMatchObject({
                ff: 'Wingdings',
                fs: 24,
                bl: BooleanNumber.TRUE,
                cl: { rgb: '#FF0000' },
            });
            expect(bulletGlyph.fontStyle?.fontFamily).toBe('Wingdings');
            expect(bulletGlyph.fontStyle?.originFontSize).toBe(24);
            expect(measuredFont).toContain('Wingdings');
            expect(measuredFont).toContain('24pt');
            measureSpy.mockRestore();
        });

        it('inherits the paragraph font size when centering the custom checkbox shape', () => {
            const measureSpy = vi.spyOn(FontCache, 'getTextSize').mockReturnValue({
                width: 16,
                ba: 18,
                bd: 2,
                aba: 18,
                abd: 2,
                sp: 0,
                sbr: 0,
                sbo: 0,
                spr: 0,
                spo: 0,
            });

            const bulletGlyph = createSkeletonBulletGlyph(
                {
                    ts: { fs: 20 },
                    bBox: { ba: 18, bd: 2 },
                } as IDocumentSkeletonGlyph,
                {
                    listId: 'check-list',
                    symbol: '\u2610',
                    ts: {},
                    startIndexItem: 1,
                },
                10
            );

            expect(bulletGlyph.ts?.fs).toBe(20);
            expect(bulletGlyph.width).toBe(30);
            expect(bulletGlyph.bBox).toMatchObject({
                width: 24,
                ba: 20,
                bd: 4,
                aba: 20,
                abd: 4,
            });
            expect(bulletGlyph.bBox.ba + bulletGlyph.bBox.bd).toBe(24);
            expect(bulletGlyph.bBox.aba + bulletGlyph.bBox.abd).toBe(24);
            expect((bulletGlyph.bBox.bd - bulletGlyph.bBox.ba) / 2).toBe(-8);
            expect((bulletGlyph.bBox.abd - bulletGlyph.bBox.aba) / 2).toBe(-8);
            expect(bulletGlyph.width).toBeGreaterThanOrEqual(bulletGlyph.bBox.width);
            measureSpy.mockRestore();
        });
    });

    describe('test font compatibility policy', () => {
        it('should apply traditional font metric width rules to letter glyphs only when enabled', () => {
            const config = {
                fontStyle: {
                    fontString: 'normal bold 24pt "Calibri", Arial',
                    fontSize: 24,
                    originFontSize: 24,
                    fontFamily: '"Calibri", Arial',
                    fontCache: 'normal bold 24pt "Calibri"',
                },
                textStyle: {},
                charSpace: 0,
                snapToGrid: 0,
            } as any;

            FontCache.setFontMeasureCache(config.fontStyle.fontString, '5', {
                width: 16,
                fontBoundingBoxAscent: 30,
                fontBoundingBoxDescent: 9,
                actualBoundingBoxAscent: 30,
                actualBoundingBoxDescent: 9,
            });
            const traditionalGlyph = createSkeletonLetterGlyph('5', {
                ...config,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
            });
            const modernGlyph = createSkeletonLetterGlyph('5', {
                ...config,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.MODERN),
            });

            expect(traditionalGlyph.width).toBeCloseTo(14.72);
            expect(modernGlyph.width).toBe(16);
            FontCache.clearFontMeasureCache(config.fontStyle.fontString);
        });

        it('should calibrate SimSun CJK width only for traditional documents', () => {
            const config = {
                fontStyle: {
                    fontString: 'normal normal 12pt "Times New Roman", 宋体',
                    fontSize: 12,
                    originFontSize: 12,
                    fontFamily: '"Times New Roman", 宋体',
                    fontCache: 'normal normal 12pt "Times New Roman", 宋体',
                },
                textStyle: {},
                charSpace: 0,
                snapToGrid: 0,
            } as any;

            FontCache.setFontMeasureCache(config.fontStyle.fontString, '文', {
                width: 16,
                fontBoundingBoxAscent: 15,
                fontBoundingBoxDescent: 4,
                actualBoundingBoxAscent: 15,
                actualBoundingBoxDescent: 4,
            });
            const traditionalGlyph = createSkeletonLetterGlyph('文', {
                ...config,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.TRADITIONAL),
            });
            const modernGlyph = createSkeletonLetterGlyph('文', {
                ...config,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(DocumentFlavor.MODERN),
            });

            expect(traditionalGlyph.width).toBeCloseTo(15.52);
            expect(modernGlyph.width).toBe(16);
            FontCache.clearFontMeasureCache(config.fontStyle.fontString);
        });
    });
});
