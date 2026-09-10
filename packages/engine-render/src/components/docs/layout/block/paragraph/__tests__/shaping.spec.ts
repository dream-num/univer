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

import type { ICustomRangeForInterceptor } from '@univerjs/core';
import {
    BooleanNumber,
    characterSpacingControlType,
    CustomRangeType,
    DataStreamTreeTokenType,
    DocumentFlavor,
    NamedStyleType,
    PositionedObjectLayoutType,
} from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { getFontStyleString } from '../../../../../../basics/tools';
import { setDocsCustomBlockRenderViewportProvider } from '../../../../custom-block-render-viewport';
import { getDocumentCompatibilityPolicy } from '../../../../document-compatibility';
import { Lang } from '../../../hyphenation/lang';
import { createSkeletonLetterGlyph } from '../../../model/glyph';
import { FontCache } from '../../../shaping-engine/font-cache';
import { clearFontCreateConfigCache } from '../../../tools';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('shaping', () => {
    it.each([PositionedObjectLayoutType.INLINE, PositionedObjectLayoutType.WRAP_SQUARE])('keeps effect extents separate from drawing geometry (%s)', (layoutType) => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('\b', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: { customBlocks: [{ startIndex: 0, blockId: 'effects' }] },
            drawings: {
                effects: {
                    drawingId: 'effects',
                    layoutType,
                    effectExtent: { left: 2, top: 3, right: 7, bottom: 11 },
                    docTransform: { size: { width: 40, height: 50 }, positionH: {}, positionV: {}, angle: 0 },
                },
            },
        });
        const glyph = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig).flatMap((item) => item.glyphs)[0];
        expect(glyph.width).toBe(layoutType === PositionedObjectLayoutType.INLINE ? 49 : 0);
        expect(glyph.bBox.ba).toBe(layoutType === PositionedObjectLayoutType.INLINE ? 53 : 0);
        expect(glyph.bBox.bd).toBe(layoutType === PositionedObjectLayoutType.INLINE ? 11 : 0);
        expect(viewModel.getDataModel().getSnapshot().drawings?.effects.docTransform.size).toEqual({ width: 40, height: 50 });
    });

    it.each([PositionedObjectLayoutType.INLINE, PositionedObjectLayoutType.WRAP_SQUARE, PositionedObjectLayoutType.WRAP_NONE])(
        'resolves pictures and run styles after a wrapped table: %s',
        (layoutType) => {
            const table = '\x1A\x1B\x1CCell\r\n\x1D\x0E\x0F';
            const content = `${table}\bTail`;
            const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
                documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
                body: {
                    paragraphs: [
                        { startIndex: 7, paragraphId: 'cell' },
                        { startIndex: content.length, paragraphId: 'table-tail' },
                    ],
                    customBlocks: [{ startIndex: table.length, blockId: 'tail-picture' }],
                    textRuns: [
                        { st: 0, ed: table.length, ts: { ff: 'Arial', fs: 9 } },
                        { st: table.length, ed: content.length + 1, ts: { ff: 'Cambria', fs: 18 } },
                    ],
                },
                drawings: {
                    'tail-picture': {
                        drawingId: 'tail-picture',
                        layoutType,
                        docTransform: { size: { width: 40, height: 50 }, positionH: {}, positionV: {}, angle: 0 },
                    },
                },
            });
            expect(paragraphNode.startIndex).toBe(0);
            expect(paragraphNode.content).toBe('\bTail\r\n');
            const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
                .flatMap((item) => item.glyphs);
            expect(glyphs[0].drawingId).toBe('tail-picture');
            expect(glyphs[0].width).toBe(layoutType === PositionedObjectLayoutType.INLINE ? 40 : 0);
            expect(glyphs.find((glyph) => glyph.content === 'T')?.ts).toMatchObject({ ff: 'Cambria', fs: 18 });
        }
    );

    it.each([undefined, 'Heading5'])('preserves resolved Word heading formatting while retaining native presets: %s', (styleId) => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Title', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                paragraphs: [{
                    startIndex: 5,
                    paragraphId: 'heading-font',
                    styleId,
                    paragraphStyle: {
                        namedStyleType: NamedStyleType.HEADING_5,
                        textStyle: { ff: 'Cambria', fs: 12 },
                    },
                }],
            },
        });
        const glyph = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)[0].glyphs[0];
        expect(glyph.ts?.ff).toBe('Cambria');
        expect(glyph.ts?.fs).toBe(12);
        expect(glyph.ts?.bl === BooleanNumber.TRUE).toBe(styleId == null);
    });

    it('uses document font alternates for rendering without replacing authored run fonts', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello', {
            documentStyle: {
                documentFlavor: 1,
                fontFamilyFallbacks: { 'Mind Meridian': 'Cambria', Cambria: 'Mind Meridian' },
            },
            body: { textRuns: [{ st: 0, ed: 5, ts: { ff: 'Mind Meridian', fs: 12 } }] },
        });
        const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
            .flatMap((item) => item.glyphs);
        expect(glyphs[0].fontStyle?.fontFamily).toBe('"Mind Meridian", Cambria');
        expect(glyphs[0].fontStyle?.fontString).toContain('12pt "Mind Meridian", Cambria');
        expect(glyphs[0].ts?.ff).toBe('Mind Meridian');
        expect(viewModel.getDataModel().getBody()?.textRuns?.[0].ts?.ff).toBe('Mind Meridian');
    });

    it.each(['Ae\u0301👩‍💻', 'Aمرحبا', '中\uFE00A', 'A中A'])('preserves source graphemes and inherited tracking in %s', (content) => {
        const textStyle = { ff: 'Tracking shaping', fs: 12, sc: -3 };
        const font = getFontStyleString(textStyle).fontString;
        for (const text of ['A', 'e\u0301', '👩‍💻', 'مرحبا', '中\uFE00', '中']) {
            FontCache.setFontMeasureCache(font, text, {
                width: 10,
                fontBoundingBoxAscent: 12,
                fontBoundingBoxDescent: 3,
                actualBoundingBoxAscent: 10,
                actualBoundingBoxDescent: 2,
            });
        }
        try {
            clearFontCreateConfigCache();
            const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
                documentStyle: { textStyle, spaceWidthEastAsian: content === 'A中A' ? BooleanNumber.TRUE : BooleanNumber.FALSE },
            });
            const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
                .flatMap((item) => item.glyphs)
                .filter((glyph) => glyph.streamType === DataStreamTreeTokenType.LETTER);
            expect(glyphs.map((glyph) => glyph.content).join('')).toBe(content);
            expect(glyphs.reduce((count, glyph) => count + glyph.count, 0)).toBe(content.length);
            if (content === 'A中A') {
                const advance = 10 + textStyle.sc / 0.75;
                expect(glyphs.map((glyph) => glyph.width)).toEqual([advance, advance + 5, advance]);
            } else {
                const advance = 10 + textStyle.sc / 0.75;
                expect(glyphs.map((glyph) => glyph.width)).toEqual(content === 'Ae\u0301👩‍💻' ? [advance, advance, advance] : [advance, advance]);
            }
        } finally {
            FontCache.clearFontMeasureCache(font);
            clearFontCreateConfigCache();
        }
    });

    it.each([DocumentFlavor.UNSPECIFIED, DocumentFlavor.DRAWINGML])('selects font metrics from runtime layout semantics: %s', (documentFlavor) => {
        const measuredWidth = 6.1572265625;
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockReturnValue({
            width: measuredWidth,
            fontBoundingBoxAscent: 11,
            fontBoundingBoxDescent: 3,
            actualBoundingBoxAscent: 11,
            actualBoundingBoxDescent: 3,
        });
        try {
            clearFontCreateConfigCache();
            const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('h', {
                documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            });
            sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
            const glyph = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
                .flatMap((item) => item.glyphs)
                .find((item) => item.content === 'h')!;
            expect(glyph.width).toBe(documentFlavor === DocumentFlavor.DRAWINGML ? 6.125 : measuredWidth);
            expect(glyph.bBox.width).toBe(glyph.width);
            const explicit = createSkeletonLetterGlyph('h', {
                fontStyle: glyph.fontStyle!,
                textStyle: {},
                charSpace: 0,
                snapToGrid: BooleanNumber.FALSE,
                documentCompatibilityPolicy: sectionBreakConfig.documentCompatibilityPolicy,
            }, 6.157);
            expect(explicit.width).toBe(6.157);
        } finally {
            measure.mockRestore();
        }
    });

    it.each([
        [undefined, undefined, true],
        [BooleanNumber.FALSE, undefined, false],
        [BooleanNumber.FALSE, BooleanNumber.TRUE, true],
        [BooleanNumber.TRUE, BooleanNumber.FALSE, false],
    ] as const)('resolves link wrapping from document %s and paragraph %s', (defaultWordWrap, wordWrap, allowBreaks) => {
        const link = 'http://www.swsresearch.com';
        const content = `公司${link}网站`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            documentStyle: { defaultParagraphStyle: { wordWrap: defaultWordWrap } },
            body: { paragraphs: [{ startIndex: content.length, paragraphId: 'link', paragraphStyle: { wordWrap } }] },
        });
        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        expect(result.map((item) => item.text).join('')).toBe(`${content}\r`);
        expect(result.some((item) => item.text === link)).toBe(!allowBreaks);
    });

    it('honors disabled East Asian spacing while preserving the default and explicit enabled spacing', () => {
        // Node has no canvas font measurements; keep the browser boundary deterministic.
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockReturnValue({
            width: 24,
            fontBoundingBoxAscent: 20,
            fontBoundingBoxDescent: 4,
            actualBoundingBoxAscent: 20,
            actualBoundingBoxDescent: 4,
        });
        const shape = (spaceWidthEastAsian?: BooleanNumber) => {
            const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('中A文2字 文 A', {
                documentStyle: { spaceWidthEastAsian },
            });
            return shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
                .flatMap((item) => item.glyphs)
                .map(({ content, width, xOffset, adjustability }) => ({ content, width, xOffset, adjustability }));
        };
        try {
            const disabled = shape(BooleanNumber.FALSE);
            const enabled = shape(BooleanNumber.TRUE);
            expect(shape()).toEqual(enabled);
            expect(disabled.map((glyph) => glyph.content)).toEqual(enabled.map((glyph) => glyph.content));
            const plainWidth = disabled[0].width;
            expect(plainWidth).toBeGreaterThan(0);
            expect(enabled[0].width - disabled[0].width).toBeCloseTo(plainWidth / 4);
            expect(enabled[2].width - disabled[2].width).toBeCloseTo(plainWidth / 2);
            expect(enabled[4].xOffset - disabled[4].xOffset).toBeCloseTo(plainWidth / 4);
            expect(enabled.slice(5)).toEqual(disabled.slice(5));
        } finally {
            measure.mockRestore();
        }
    });

    it('uses paragraph text style for an empty traditional paragraph mark', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('', {
            documentStyle: {
                documentFlavor: 1,
                textStyle: { ff: 'Arial', fs: 11 },
            },
            body: {
                textRuns: [],
                paragraphs: [{
                    startIndex: 0,
                    paragraphId: 'compact-empty-paragraph',
                    paragraphStyle: { textStyle: { ff: 'Arial', fs: 3 } },
                }],
            },
        });

        const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
            .flatMap((item) => item.glyphs);
        const paragraphMark = glyphs.find((glyph) => glyph.streamType === DataStreamTreeTokenType.PARAGRAPH);

        expect(paragraphMark?.fontStyle?.originFontSize).toBe(3);
        expect(paragraphMark?.ts).toMatchObject({ ff: 'Arial', fs: 3 });
    });

    it('shapes plain English text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello world');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        expect(result[0].text).toBeDefined();
        expect(result[0].glyphs.length).toBeGreaterThan(0);
    });

    it.each([DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN])('keeps slash-connected Western words together only in traditional layout (%s)', (documentFlavor) => {
        const content = 'Case Breyer/Duitsland follows';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor },
        });
        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        expect(result.map((item) => item.text).join('')).toBe(`${content}\r`);
        expect(result.some((item) => item.text === 'Breyer/')).toBe(documentFlavor === DocumentFlavor.MODERN);
        if (documentFlavor === DocumentFlavor.TRADITIONAL) {
            expect(result.some((item) => item.text === 'Breyer/Duitsland ')).toBe(true);
        }
    });

    it('shapes text with spaces', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello world test');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes a hidden measured whole entity as one atomic glyph', () => {
        const source = String.raw`\sqrt{x^2 + 1}+\sum_{i=1}^{n} i^2`;
        const prefix = 'Formula: ';
        const content = `${prefix}${source} after`;
        const range: ICustomRangeForInterceptor = {
            startIndex: prefix.length,
            endIndex: prefix.length + source.length - 1,
            rangeId: 'formula-1',
            rangeType: CustomRangeType.CUSTOM,
            wholeEntity: true,
            show: false,
            glyphAscentEm: 1.75,
            glyphDescentEm: 1.25,
            glyphWidthEm: 7.25,
        };
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            body: { customRanges: [range] },
        });
        vi.spyOn(viewModel, 'getCustomRange').mockImplementation((index) =>
            index >= range.startIndex && index <= range.endIndex ? range : undefined
        );

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const allGlyphs = result.flatMap((item) => item.glyphs);
        const formulaGlyph = allGlyphs.find((glyph) => glyph.raw === source);
        let breakPosition = 0;
        const breakPositions = result.map((item) => {
            breakPosition += item.text.length;
            return breakPosition;
        });

        expect(formulaGlyph).toBeDefined();
        if (!formulaGlyph?.fontStyle) {
            throw new Error('Expected the measured whole entity to produce a font-backed glyph.');
        }
        const emSize = formulaGlyph.fontStyle.originFontSize / 0.75;
        expect(formulaGlyph.content).toBe('\u200B');
        expect(formulaGlyph.count).toBe(source.length);
        expect(formulaGlyph.width).toBeCloseTo(emSize * 7.25);
        expect(formulaGlyph.bBox.ba).toBeCloseTo(emSize * 1.75);
        expect(formulaGlyph.bBox.bd).toBeCloseTo(emSize * 1.25);
        expect(allGlyphs.filter((glyph) => glyph.raw === source)).toHaveLength(1);
        expect(breakPositions.some((position) =>
            position > range.startIndex && position <= range.endIndex
        )).toBe(false);
    });

    it('preserves the model text for a one-character measured whole entity', () => {
        const content = 'axb';
        const range: ICustomRangeForInterceptor = {
            startIndex: 1,
            endIndex: 1,
            rangeId: 'formula-1',
            rangeType: CustomRangeType.CUSTOM,
            wholeEntity: true,
            show: false,
            glyphAscentEm: 1,
            glyphDescentEm: 0,
            glyphWidthEm: 1,
        };
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            body: { customRanges: [range] },
        });
        vi.spyOn(viewModel, 'getCustomRange').mockImplementation((index) =>
            index === range.startIndex ? range : undefined
        );

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.map((item) => item.text).join('')).toBe(`${content}${DataStreamTreeTokenType.PARAGRAPH}`);
        expect(result.flatMap((item) => item.glyphs).filter((glyph) => glyph.raw === 'x')).toHaveLength(1);
    });

    it('keeps a hidden whole entity on the normal path until all glyph metrics are ready', () => {
        const source = 'abc';
        const range: ICustomRangeForInterceptor = {
            startIndex: 0,
            endIndex: source.length - 1,
            rangeId: 'formula-1',
            rangeType: CustomRangeType.CUSTOM,
            wholeEntity: true,
            show: false,
            glyphWidthEm: 3,
        };
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(source, {
            body: { customRanges: [range] },
        });
        vi.spyOn(viewModel, 'getCustomRange').mockImplementation((index) =>
            index >= range.startIndex && index <= range.endIndex ? range : undefined
        );

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const sourceGlyphs = result.flatMap((item) => item.glyphs).filter((glyph) => source.includes(glyph.raw));

        expect(sourceGlyphs.map((glyph) => glyph.raw).join('')).toBe(source);
        expect(sourceGlyphs).toHaveLength(source.length);
    });

    it('keeps visible whole-entity text on the normal shaping path', () => {
        const source = 'abc';
        const range: ICustomRangeForInterceptor = {
            startIndex: 0,
            endIndex: source.length - 1,
            rangeId: 'mention-1',
            rangeType: CustomRangeType.CUSTOM,
            wholeEntity: true,
            glyphWidthEm: 3,
        };
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(source, {
            body: { customRanges: [range] },
        });
        vi.spyOn(viewModel, 'getCustomRange').mockImplementation((index) =>
            index >= range.startIndex && index <= range.endIndex ? range : undefined
        );

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const sourceGlyphs = result.flatMap((item) => item.glyphs).filter((glyph) => source.includes(glyph.raw));

        expect(sourceGlyphs.map((glyph) => glyph.raw).join('')).toBe(source);
        expect(sourceGlyphs).toHaveLength(source.length);
    });

    it('does not add per-character custom-range discovery reads for plain text', () => {
        const content = 'a'.repeat(200);
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content);
        const getCustomRange = vi.spyOn(viewModel, 'getCustomRange');

        shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(getCustomRange.mock.calls.length).toBeLessThanOrEqual(paragraphNode.content!.length * 2);
    });

    it('shapes text with tab characters', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello\tworld');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        const tabGlyph = allGlyphs.find((g) => g.content === '\t');
        expect(tabGlyph).toBeDefined();
    });

    it('shapes CJK text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('你好世界');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes mixed CJK and Latin text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello你好');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes text with emoji', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello \uD83D\uDE00');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        const emojiGlyph = allGlyphs.find((g) => g.content === '\uD83D\uDE00');
        expect(emojiGlyph).toBeDefined();
    });

    it('shapes text with Arabic characters', () => {
        const arabicText = '\u0645\u0631\u062D\u0628\u0627'; // 'مرحبا'
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(arabicText);

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('keeps Arabic glyph groups in logical order for canvas text shaping', () => {
        const arabicText = '\u0627\u0637\u0644\u0627\u0639\u064A\u0647';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(arabicText);

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.some((glyph) => glyph.content === arabicText)).toBe(true);
        expect(allGlyphs.some((glyph) => glyph.content === '\u0647\u064A\u0639\u0627\u0644\u0637\u0627')).toBe(false);
    });

    it('returns breakPointType for each shaped text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello world');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        for (const shapedText of result) {
            expect(shapedText.breakPointType).toBeDefined();
        }
    });

    it('shapes Tibetan text', () => {
        const tibetanText = '\u0F40\u0F41';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(tibetanText);

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes Thai text', () => {
        const thaiText = '\u0E01\u0E02';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(thaiText);

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it.each(['），', '》、', '”）'])('distinguishes fixed punctuation pairs from traditional line compression: %s', (pair) => {
        const measure = vi.spyOn(FontCache, 'getTextSize').mockReturnValue({
            width: 20,
            ba: 18,
            bd: 4,
            aba: 18,
            abd: 4,
            sp: 0,
            sbr: 0,
            sbo: 0,
            spr: 0,
            spo: 0,
        });
        try {
            for (const { documentFlavor, compression } of [
                { documentFlavor: DocumentFlavor.TRADITIONAL, compression: undefined },
                { documentFlavor: DocumentFlavor.TRADITIONAL, compression: characterSpacingControlType.doNotCompress },
                { documentFlavor: DocumentFlavor.MODERN, compression: undefined },
                { documentFlavor: undefined, compression: undefined },
            ]) {
                const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(pair, {
                    documentStyle: { documentFlavor, characterSpacingControl: compression, textStyle: { ff: 'Arial', fs: 15 } },
                    body: { paragraphs: [{ startIndex: pair.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE } }] },
                });
                const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
                    .flatMap((item) => item.glyphs)
                    .filter((glyph) => pair.includes(glyph.content) && glyph.content !== '');
                expect(glyphs.map((glyph) => glyph.content).join('')).toBe(pair);
                const compressPair = documentFlavor === DocumentFlavor.TRADITIONAL
                    ? compression === characterSpacingControlType.doNotCompress
                    : pair !== '”）';
                expect(glyphs.reduce((sum, glyph) => sum + glyph.width, 0)).toBe(compressPair ? 30 : 40);
                // Deferred compression remains available to the line fitter, not permanently discarded.
                expect(glyphs.reduce((sum, glyph) => sum + glyph.adjustability.shrinkability[1], 0)).toBe(compressPair ? 10 : 20);
            }
        } finally {
            measure.mockRestore();
        }
    });

    it('adds CJK Latin spacing for mixed text', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('A好B');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        expect(result.length).toBeGreaterThan(0);
        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes paragraph break with zero width when configured', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello');
        sectionBreakConfig.renderConfig = {
            ...sectionBreakConfig.renderConfig,
            zeroWidthParagraphBreak: BooleanNumber.TRUE,
        };

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        const paragraphGlyph = allGlyphs.find((g) => g.content === '\r');
        expect(paragraphGlyph).toBeDefined();
        expect(paragraphGlyph!.width).toBe(0);
    });

    it.each([undefined, BooleanNumber.FALSE])('preserves explicit custom-range metrics on a DrawingML paragraph mark (%s)', (zeroWidthParagraphBreak) => {
        clearFontCreateConfigCache();
        const range: ICustomRangeForInterceptor = {
            startIndex: 1,
            endIndex: 1,
            rangeId: 'paragraph-custom-metrics',
            rangeType: CustomRangeType.CUSTOM,
            glyphWidthEm: 2,
            glyphAscentEm: 1.5,
            glyphDescentEm: 0.5,
        };
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('A', {
            documentStyle: { textStyle: { fs: 12 }, renderConfig: { zeroWidthParagraphBreak } },
            body: { customRanges: [range] },
        });
        sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
        const glyphs = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig)
            .flatMap((item) => item.glyphs);
        const mark = glyphs.find((glyph) => glyph.content === '\r')!;
        expect(mark.width).toBe(32);
        expect(mark.bBox.ba).toBe(24);
        expect(mark.bBox.bd).toBe(8);
        expect(glyphs.map((glyph) => glyph.content).join('')).toBe('A\r');
    });

    it('shapes custom block when drawing is not found', () => {
        const content = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content);

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('falls back when a custom block references a missing drawing', () => {
        const content = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 1, blockId: 'missing' }],
            },
            drawings: {},
        });

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.length).toBeGreaterThan(0);
    });

    it('shapes inline custom block and splits shaped texts', () => {
        const content = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 1, blockId: 'b1' }],
            },
            drawings: {
                b1: {
                    drawingId: 'd1',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        size: { width: 100, height: 100 },
                    },
                },
            },
        });

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        const customBlockGlyph = allGlyphs.find((g) => g.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK);
        expect(customBlockGlyph).toBeDefined();
        expect(customBlockGlyph!.width).toBeGreaterThan(0);
        expect(result.length).toBeGreaterThan(1);
    });

    it.each([0, 90])('rotates measured inline object bounds after resolving its unrotated size (%s degrees)', (angle) => {
        const bed = createParagraphLayoutTestBed('\b', {
            body: { customBlocks: [{ startIndex: 0, blockId: 'autofit' }] },
            drawings: { autofit: {
                drawingId: 'autofit',
                layoutType: PositionedObjectLayoutType.INLINE,
                docTransform: { angle, size: { width: 100, height: 60 } },
            } },
        });
        const unregister = setDocsCustomBlockRenderViewportProvider((_unitId, blockId, input) => {
            if (blockId !== 'autofit') {
                return null;
            }
            expect(input).toMatchObject({ fallbackWidth: 100, fallbackHeight: 60 });
            return { width: 120, height: 80 };
        });
        try {
            const glyph = shaping(bed.ctx, bed.paragraphNode.content!, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig)
                .flatMap((run) => run.glyphs)
                .find((item) => item.drawingId === 'autofit')!;
            expect(glyph.width).toBeCloseTo(angle === 0 ? 120 : 80);
            expect(glyph.bBox.ba + glyph.bBox.bd).toBeCloseTo(angle === 0 ? 80 : 120);
        } finally {
            unregister();
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it('shapes floating custom block without splitting', () => {
        const content = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 1, blockId: 'b1' }],
            },
            drawings: {
                b1: {
                    drawingId: 'd1',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    docTransform: {
                        angle: 0,
                        size: { width: 100, height: 100 },
                    },
                },
            },
        });

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        const customBlockGlyph = allGlyphs.find((g) => g.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK);
        expect(customBlockGlyph).toBeDefined();
        expect(customBlockGlyph!.width).toBe(0);
    });

    it('shapes column group tokens as zero-width placeholders', () => {
        const columnTokens = [
            DataStreamTreeTokenType.COLUMN_GROUP_START,
            DataStreamTreeTokenType.COLUMN_START,
            DataStreamTreeTokenType.COLUMN_END,
            DataStreamTreeTokenType.COLUMN_GROUP_END,
        ];
        for (const token of columnTokens) {
            const glyph = createSkeletonLetterGlyph(token, {
                fontStyle: {},
                textStyle: {},
            } as any);

            expect(glyph.raw).toBe(token);
            expect(glyph.streamType).toBe(token);
            expect(glyph.width).toBe(0);
            expect(glyph.content).toBe('');
        }
    });

    it('keeps top-bottom custom block as an anchor glyph instead of occupying document flow', () => {
        const content = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 1, blockId: 'b1' }],
            },
            drawings: {
                b1: {
                    drawingId: 'd1',
                    layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
                    docTransform: {
                        angle: 0,
                        size: { width: 100, height: 120 },
                    },
                },
            },
        });

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        const customBlockGlyph = allGlyphs.find((g) => g.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK);
        expect(customBlockGlyph).toBeDefined();
        expect(customBlockGlyph!.width).toBe(0);
        expect(customBlockGlyph!.bBox.ba + customBlockGlyph!.bBox.bd).toBe(0);
    });

    it('loads hyphen pattern when language pattern is not available', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('test');
        sectionBreakConfig.autoHyphenation = BooleanNumber.TRUE;
        const paragraph = viewModel.getParagraph(paragraphNode.endIndex)!;
        paragraph.paragraphStyle = { ...paragraph.paragraphStyle, suppressHyphenation: BooleanNumber.FALSE };

        const fakeHyphen = {
            hasPattern: vi.fn(() => false),
            loadPattern: vi.fn(() => Promise.resolve()),
            fetchHyphenCache: vi.fn(),
            hyphenate: vi.fn(),
            dispose: vi.fn(),
        };
        ctx.hyphen = fakeHyphen as any;
        ctx.languageDetector = { detect: vi.fn(() => Lang.Fr), dispose: vi.fn() } as any;

        shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        expect(fakeHyphen.loadPattern).toHaveBeenCalledWith(Lang.Fr);
    });

    it('uses hyphen enhancer when hyphenation is enabled and pattern exists', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('hyphenation');
        sectionBreakConfig.autoHyphenation = BooleanNumber.TRUE;
        const paragraph = viewModel.getParagraph(paragraphNode.endIndex)!;
        paragraph.paragraphStyle = { ...paragraph.paragraphStyle, suppressHyphenation: BooleanNumber.FALSE };

        const fakeHyphen = {
            hasPattern: vi.fn(() => true),
            loadPattern: vi.fn(() => Promise.resolve()),
            fetchHyphenCache: vi.fn(),
            hyphenate: vi.fn((word: string) => [word]),
            dispose: vi.fn(),
        };
        ctx.hyphen = fakeHyphen as any;
        ctx.languageDetector = { detect: vi.fn(() => Lang.EnUs), dispose: vi.fn() } as any;

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        expect(result.length).toBeGreaterThan(0);
        expect(fakeHyphen.loadPattern).not.toHaveBeenCalled();
    });
});
