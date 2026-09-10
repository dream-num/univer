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

import type { ITextStyle } from '@univerjs/core';
import type { IDocumentSkeletonGlyph } from '../../../../../basics/i-document-skeleton-cached';
import type { IFontCreateConfig } from '../../../../../basics/interfaces';
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
    getGlyphGroupFontBoundingBox,
    getGlyphGroupShrinkability,
    glyphShrinkLeft,
    glyphShrinkRight,
    isJustifiable,
    isSpace,
    measureTextWithCharacterSpacing,
    preserveLineStartPunctuationSpace,
    setGlyphGroupLeft,
} from '../glyph';

describe('Glyph utils test cases', () => {
    it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('uses the correct picture-only line metrics in %s mode', (flavor) => {
        const policy = getDocumentCompatibilityPolicy(flavor);
        const picture = {
            streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
            width: 100,
            bBox: { ba: 54, bd: 0 },
        } as IDocumentSkeletonGlyph;
        const largeMark = {
            streamType: DataStreamTreeTokenType.PARAGRAPH,
            width: 0,
            bBox: { ba: 96, bd: 24 },
        } as IDocumentSkeletonGlyph;
        const mark = { ...largeMark, bBox: { ba: 14, bd: 4 } } as IDocumentSkeletonGlyph;
        const text = { ...mark, streamType: DataStreamTreeTokenType.LETTER, width: 8 };
        expect(getGlyphGroupFontBoundingBox(policy, [picture], [largeMark])).toEqual(
            flavor === DocumentFlavor.TRADITIONAL
                ? { boundingBoxAscent: 54, boundingBoxDescent: 0, normalLineHeight: 0 }
                : { boundingBoxAscent: 96, boundingBoxDescent: 24, normalLineHeight: 0 }
        );
        expect(getGlyphGroupFontBoundingBox(policy, [picture, text], [mark])).toEqual({
            boundingBoxAscent: 54,
            boundingBoxDescent: 4,
            normalLineHeight: 0,
        });
        expect(getGlyphGroupFontBoundingBox(policy, [largeMark])).toEqual({
            boundingBoxAscent: 96,
            boundingBoxDescent: 24,
            normalLineHeight: 0,
        });
    });

    it.each([' ', '\t', '\u3000', '\u00A0', 'X'])('preserves the Word line-height distinction for %j', (content) => {
        const mark = {
            streamType: DataStreamTreeTokenType.PARAGRAPH,
            content: '\r',
            width: 0,
            bBox: { ba: 8, bd: 2, normalLineHeight: 12 },
        } as IDocumentSkeletonGlyph;
        const large = {
            streamType: DataStreamTreeTokenType.LETTER,
            content,
            width: 30,
            bBox: { ba: 32, bd: 8, normalLineHeight: 48 },
        } as IDocumentSkeletonGlyph;
        for (const flavor of [DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]) {
            const ignored = flavor === DocumentFlavor.TRADITIONAL && [' ', '\t', '\u3000'].includes(content);
            expect(getGlyphGroupFontBoundingBox(getDocumentCompatibilityPolicy(flavor), [large], [mark])).toEqual(
                ignored
                    ? { boundingBoxAscent: 8, boundingBoxDescent: 2, normalLineHeight: 12 }
                    : { boundingBoxAscent: 32, boundingBoxDescent: 8, normalLineHeight: 48 }
            );
        }
    });

    it('restores pair-compressed opening punctuation at a line boundary without offering that space to justification', () => {
        const glyph = {
            content: '（',
            width: 12,
            xOffset: 0,
            adjustability: baseAdjustability('（', 12),
        } as IDocumentSkeletonGlyph;
        glyphShrinkLeft(glyph, 6);
        expect(glyph.width).toBe(6);
        preserveLineStartPunctuationSpace(glyph);
        preserveLineStartPunctuationSpace(glyph);
        expect(glyph.width).toBe(12);
        expect(glyph.xOffset).toBe(0);
        expect(getGlyphGroupShrinkability([glyph])).toBe(0);
    });

    it('counts punctuation compression separately from authored and automatic spacing', () => {
        const glyphs = ['，', '“', '”', '・', ' ', '　', '中'].map((content) => ({
            content,
            adjustability: baseAdjustability(content, 12),
        } as IDocumentSkeletonGlyph));
        glyphs[glyphs.length - 1].adjustability.shrinkability = [1.5, 1.5];
        expect(getGlyphGroupShrinkability(glyphs, true)).toBe(24);
        expect(getGlyphGroupShrinkability(glyphs)).toBe(35);
    });

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

    it.each(['V', ' ', '\u00A0'].flatMap((right) => [50, 100, 200].map((sa) => ({ right, sa }))))('shares threshold decisions and recomputes pair advances at line splits ($right, scale=$sa)', ({ right, sa }) => {
        const textStyle = { ff: 'Kerning regression', fs: 12, kerning: 12, sa };
        const scale = sa / 100;
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
            expect(glyphs.map((glyph) => [glyph.left, glyph.width, glyph.count])).toEqual([[0, 8 * scale, 1], [8 * scale, 10 * scale, 1]]);
            applyGlyphKerning(glyphs);
            expect(glyphs[0].width).toBe(8 * scale);
            applyGlyphKerning(glyphs.slice(0, 1));
            expect(glyphs[0].width).toBe(10 * scale);
            expect(glyphs[0].bBox.width).toBe(10 * scale);
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
        const outlineFont = fontStyle.fontString.replace(/\b\d+(?:\.\d+)?(?:pt|px)\b/, '1024px');
        FontCache.setFontMeasureCache(outlineFont, '\u2028', {
            width: 8 * 64,
            fontBoundingBoxAscent: 12 * 64,
            fontBoundingBoxDescent: 3 * 64,
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
            FontCache.clearFontMeasureCache(outlineFont);
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
                    expect(glyph.width).toBe(10 + sc / 0.75);
                    expect(glyph.bBox.width).toBe(10);
                    expect(glyph.count).toBe(text.length);
                    expect(glyph.raw).toBe(text);
                    expect(createSkeletonLetterGlyph(text, config, 25).width).toBe(25);
                    const next = createSkeletonLetterGlyph('A', config);
                    setGlyphGroupLeft([glyph, next]);
                    expect(next.left).toBe(10 + sc / 0.75);
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
        it.each([DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL])('measures list markers with the same font policy as body text in %s mode', (flavor) => {
            const textStyle = { ff: 'Symbol', fs: 12 };
            const fontStyle = getFontStyleString(textStyle);
            const outlineFont = fontStyle.fontString.replace('12pt', '1024px');
            const content = '\uF0B7';
            FontCache.setFontMeasureCache(fontStyle.fontString, content, {
                width: 8,
                fontBoundingBoxAscent: 16,
                fontBoundingBoxDescent: 4,
                actualBoundingBoxAscent: 8,
                actualBoundingBoxDescent: 0,
            });
            FontCache.setFontMeasureCache(outlineFont, content, {
                width: 500,
                fontBoundingBoxAscent: 960,
                fontBoundingBoxDescent: 224,
                actualBoundingBoxAscent: 512,
                actualBoundingBoxDescent: 0,
            });
            try {
                const bullet = createSkeletonBulletGlyph(
                    { ts: textStyle, bBox: { ba: 15, bd: 3 } } as IDocumentSkeletonGlyph,
                    { listId: 'list', symbol: content, ts: textStyle, startIndexItem: 1 },
                    10,
                    getDocumentCompatibilityPolicy(flavor)
                );
                expect(bullet.bBox.ba).toBe(flavor === DocumentFlavor.TRADITIONAL ? 15 : 16);
                expect(bullet.bBox.bd).toBe(flavor === DocumentFlavor.TRADITIONAL ? 3.5 : 4);
                expect(bullet.bBox.width).toBe(flavor === DocumentFlavor.TRADITIONAL ? 7.8125 : 8);
            } finally {
                FontCache.clearFontMeasureCache(fontStyle.fontString);
                FontCache.clearFontMeasureCache(outlineFont);
            }
        });

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
            const config: IFontCreateConfig = {
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
            };

            const metrics = {
                width: 16,
                fontBoundingBoxAscent: 30,
                fontBoundingBoxDescent: 9,
                actualBoundingBoxAscent: 30,
                actualBoundingBoxDescent: 9,
            };
            FontCache.setFontMeasureCache(config.fontStyle.fontString, '5', metrics);
            FontCache.setFontMeasureCache('normal bold 1024px "Calibri", Arial', '5', { ...metrics, width: 512 });
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
            const config: IFontCreateConfig = {
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
            };

            const metrics = {
                width: 16,
                fontBoundingBoxAscent: 15,
                fontBoundingBoxDescent: 4,
                actualBoundingBoxAscent: 15,
                actualBoundingBoxDescent: 4,
            };
            FontCache.setFontMeasureCache(config.fontStyle.fontString, '文', metrics);
            FontCache.setFontMeasureCache('normal normal 1024px "Times New Roman", 宋体', '文', { ...metrics, width: 1024 });
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

    it.each([
        { enabled: BooleanNumber.TRUE, fontHint: 'eastAsia', flavor: DocumentFlavor.TRADITIONAL, content: ' ', sa: 100, expected: 12 },
        { enabled: BooleanNumber.TRUE, fontHint: 'eastAsia', flavor: DocumentFlavor.TRADITIONAL, content: ' ', sa: 50, expected: 6 },
        { enabled: BooleanNumber.FALSE, fontHint: 'eastAsia', flavor: DocumentFlavor.TRADITIONAL, content: ' ', sa: 100, expected: 6.66796875 },
        { enabled: undefined, fontHint: 'eastAsia', flavor: DocumentFlavor.TRADITIONAL, content: ' ', sa: 100, expected: 6.66796875 },
        { enabled: BooleanNumber.TRUE, fontHint: 'default', flavor: DocumentFlavor.TRADITIONAL, content: ' ', sa: 100, expected: 6.66796875 },
        { enabled: BooleanNumber.TRUE, fontHint: 'eastAsia', flavor: DocumentFlavor.MODERN, content: ' ', sa: 100, expected: 6.66796875 },
        { enabled: BooleanNumber.TRUE, fontHint: 'eastAsia', flavor: DocumentFlavor.TRADITIONAL, content: '　', sa: 100, expected: 24 },
    ] as const)('gates legacy East Asian half-em space advances: %j', ({ enabled, fontHint, flavor, content, sa, expected }) => {
        const textStyle: ITextStyle = { ff: 'Arial', fs: 18, fontHint, sa };
        const fontStyle = getFontStyleString(textStyle);
        const measuredWidth = content === '　' ? 24 : 6.66796875;
        FontCache.setFontMeasureCache(fontStyle.fontString, content, {
            width: measuredWidth,
            fontBoundingBoxAscent: 18,
            fontBoundingBoxDescent: 4,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
        });
        const outlineFont = fontStyle.fontString.replace('18pt', '1024px');
        FontCache.setFontMeasureCache(outlineFont, content, {
            width: measuredWidth * 1024 / 24,
            fontBoundingBoxAscent: 768,
            fontBoundingBoxDescent: 170,
            actualBoundingBoxAscent: 0,
            actualBoundingBoxDescent: 0,
        });
        try {
            const glyph = createSkeletonLetterGlyph(content, {
                textStyle,
                fontStyle,
                charSpace: 0,
                snapToGrid: BooleanNumber.FALSE,
                balanceSingleByteDoubleByteWidth: enabled,
                documentCompatibilityPolicy: getDocumentCompatibilityPolicy(flavor),
            });
            expect(glyph.width).toBeCloseTo(expected);
            expect(glyph.bBox.width).toBeCloseTo(expected);
            expect(glyph.bBox.ba).toBe(18);
            expect(glyph.bBox.bd).toBe(flavor === DocumentFlavor.TRADITIONAL ? 170 * 24 / 1024 : 4);
            expect(FontCache.getTextSize(content, fontStyle).width).toBe(measuredWidth);
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
            FontCache.clearFontMeasureCache(outlineFont);
        }
    });

    it.each([-0.5, 1, 0, -100, Number.NaN, Number.POSITIVE_INFINITY])('applies point tracking without changing ink or structural advances: %s', (sc) => {
        const fontStyle = getFontStyleString({ ff: 'Arial', fs: 10 });
        const content = '😀';
        FontCache.setFontMeasureCache(fontStyle.fontString, content, {
            width: 20,
            fontBoundingBoxAscent: 10,
            fontBoundingBoxDescent: 3,
            actualBoundingBoxAscent: 9,
            actualBoundingBoxDescent: 2,
        });
        try {
            const config = { fontStyle, textStyle: { sc }, charSpace: 1, snapToGrid: BooleanNumber.FALSE };
            const glyph = createSkeletonLetterGlyph(content, config);
            expect(glyph.width).toBeCloseTo(Math.max(0, 20 + (Number.isFinite(sc) ? sc / 0.75 : 0)));
            expect(glyph.bBox.width).toBe(20);
            expect(createSkeletonLetterGlyph(content, config, 30).width).toBe(30);
            expect(createSkeletonLetterGlyph(DataStreamTreeTokenType.CUSTOM_RANGE_START, config).width).toBe(0);
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
        }
    });

    it.each([50, 90, 100, 200, 0, -1, Number.NaN])('scales glyph advances and ink widths without scaling height: %s', (sa) => {
        const fontStyle = getFontStyleString({ ff: 'Arial', fs: 10 });
        FontCache.setFontMeasureCache(fontStyle.fontString, 'AB', {
            width: 20,
            fontBoundingBoxAscent: 10,
            fontBoundingBoxDescent: 3,
            actualBoundingBoxAscent: 9,
            actualBoundingBoxDescent: 2,
        });
        try {
            const config = { fontStyle, textStyle: { sa }, charSpace: 1, snapToGrid: BooleanNumber.FALSE };
            const scale = Number.isFinite(sa) && sa > 0 ? sa / 100 : 1;
            const glyph = createSkeletonLetterGlyph('AB', config);
            const overrideGlyph = createSkeletonLetterGlyph('AB', config, 30);
            expect(glyph.width).toBeCloseTo(20 * scale);
            expect(glyph.bBox.width).toBeCloseTo(20 * scale);
            expect(overrideGlyph.width).toBeCloseTo(30 * scale);
            expect(glyph.bBox.ba).toBe(10);
            expect(glyph.bBox.bd).toBe(3);
            expect(FontCache.getTextSize('AB', fontStyle).width).toBe(20);
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
        }
    });

    it.each([undefined, 'default', 'eastAsia', 'cs'] as const)('uses the East Asian font only for applicable characters with hint %s', (fontHint) => {
        const textStyle: ITextStyle = { ff: 'Arial', eastAsiaFontFamily: '微软雅黑', fontHint, fs: 7.5, bl: BooleanNumber.TRUE };
        const fontStyle = getFontStyleString({ ...textStyle, ff: 'Arial, 微软雅黑' });
        const eastAsiaFontStyle = getFontStyleString({ ...textStyle, ff: '微软雅黑, Arial, 微软雅黑' });
        const config = { textStyle, fontStyle, charSpace: 0, snapToGrid: BooleanNumber.FALSE };
        const metrics = {
            width: 10,
            fontBoundingBoxAscent: 9,
            fontBoundingBoxDescent: 2,
            actualBoundingBoxAscent: 8,
            actualBoundingBoxDescent: 1,
        };
        const ambiguous = ['“', '”', '‘', '’', '·', '℃', '①', 'α', 'Ж'];
        const latin = ['A', '7', ' ', 'é'];
        for (const content of ['工', '：', 'か', '한', ...ambiguous, ...latin]) {
            FontCache.setFontMeasureCache(fontStyle.fontString, content, metrics);
            FontCache.setFontMeasureCache(eastAsiaFontStyle.fontString, content, {
                ...metrics,
                width: 14,
                fontBoundingBoxAscent: 11,
                fontBoundingBoxDescent: 3,
            });
        }

        try {
            for (const content of ['工', '：', 'か', '한']) {
                const glyph = createSkeletonLetterGlyph(content, config);
                expect(glyph.fontStyle).toEqual(eastAsiaFontStyle);
                expect(glyph.bBox.normalLineHeight).toBe(14);
                expect(glyph.ts).toBe(textStyle);
            }
            for (const content of [...ambiguous, ...latin]) {
                const glyph = createSkeletonLetterGlyph(content, config);
                const eastAsian = fontHint === 'eastAsia' && ambiguous.includes(content);
                expect(glyph.fontStyle).toEqual(eastAsian ? eastAsiaFontStyle : fontStyle);
                expect(glyph.width).toBe(eastAsian ? 14 : 10);
                expect(glyph.bBox.normalLineHeight).toBe(eastAsian ? 14 : 11);
            }
            expect(config.fontStyle).toBe(fontStyle);

            const withoutEastAsiaFont = createSkeletonLetterGlyph('工', { ...config, textStyle: { ...textStyle, eastAsiaFontFamily: undefined } });
            expect(withoutEastAsiaFont.fontStyle).toBe(fontStyle);
            expect(withoutEastAsiaFont.bBox.normalLineHeight).toBe(11);
        } finally {
            FontCache.clearFontMeasureCache(fontStyle.fontString);
            FontCache.clearFontMeasureCache(eastAsiaFontStyle.fontString);
        }
    });
});
