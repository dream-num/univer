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
import { BooleanNumber, CustomRangeType, DataStreamTreeTokenType, PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Lang } from '../../../hyphenation/lang';
import { createSkeletonLetterGlyph } from '../../../model/glyph';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('shaping', () => {
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

    it('applies punctuation space adjustment for consecutive CJK punctuation', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('，。');

        const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const allGlyphs = result.flatMap((r) => r.glyphs);
        expect(allGlyphs.some((g) => g.content === '，')).toBe(true);
        expect(allGlyphs.some((g) => g.content === '。')).toBe(true);
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
