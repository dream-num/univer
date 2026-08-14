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
import { BooleanNumber, DataStreamTreeTokenType, DocumentFlavor } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../../basics/i-document-skeleton-cached';
import { getDocumentCompatibilityPolicy } from '../../../document-compatibility';
import { FontCache } from '../../shaping-engine/font-cache';
import { baseAdjustability, createSkeletonBulletGlyph, createSkeletonLetterGlyph, glyphShrinkLeft, glyphShrinkRight, isJustifiable, isSpace } from '../glyph';

describe('Glyph utils test cases', () => {
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
            vi.stubGlobal('document', {
                createElement: () => ({
                    getContext: () => ({
                        font: '',
                        textBaseline: 'alphabetic',
                        measureText: () => ({
                            width: 16,
                            fontBoundingBoxAscent: 30,
                            fontBoundingBoxDescent: 9,
                            actualBoundingBoxAscent: 30,
                            actualBoundingBoxDescent: 9,
                        }),
                    }),
                }),
            });
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
        });

        it('should calibrate SimSun CJK width only for traditional documents', () => {
            vi.stubGlobal('document', {
                createElement: () => ({
                    getContext: () => ({
                        font: '',
                        textBaseline: 'alphabetic',
                        measureText: () => ({
                            width: 16,
                            fontBoundingBoxAscent: 15,
                            fontBoundingBoxDescent: 4,
                            actualBoundingBoxAscent: 15,
                            actualBoundingBoxDescent: 4,
                        }),
                    }),
                }),
            });
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
        });
    });
});
