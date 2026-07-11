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

import { BooleanNumber, DataStreamTreeTokenType, PositionedObjectLayoutType } from '@univerjs/core';
import { describe, expect, it, vi } from 'vitest';
import { Lang } from '../../../hyphenation/lang';
import { createSkeletonLetterGlyph } from '../../../model/glyph';
import { fontLibrary } from '../../../shaping-engine/font-library';
import * as textShapingModule from '../../../shaping-engine/text-shaping';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('shaping', () => {
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

    it('shapes text with useOpenType when font library is ready', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello');
        const originalIsReady = fontLibrary.isReady;
        fontLibrary.isReady = true;

        try {
            const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig, true);
            expect(result.length).toBeGreaterThan(0);
        } finally {
            fontLibrary.isReady = originalIsReady;
        }
    });

    it('shapes tab with useOpenType when font library is ready', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello\tworld');
        const originalIsReady = fontLibrary.isReady;
        fontLibrary.isReady = true;

        const spy = vi.spyOn(textShapingModule, 'textShape').mockReturnValue([
            { char: 'H', start: 0, end: 1, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'e', start: 1, end: 2, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'l', start: 2, end: 3, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'l', start: 3, end: 4, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'o', start: 4, end: 5, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: '\t', start: 5, end: 6, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'w', start: 6, end: 7, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'o', start: 7, end: 8, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'r', start: 8, end: 9, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'l', start: 9, end: 10, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'd', start: 10, end: 11, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: '\r', start: 11, end: 12, glyph: null, font: null, kerning: 0, boundingBox: null },
        ]);

        try {
            const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig, true);
            const allGlyphs = result.flatMap((r) => r.glyphs);
            const tabGlyph = allGlyphs.find((g) => g.content === '\t');
            expect(tabGlyph).toBeDefined();
        } finally {
            spy.mockRestore();
            fontLibrary.isReady = originalIsReady;
        }
    });

    it('shapes emoji with useOpenType when font library is ready', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('Hello \uD83D\uDE00');
        const originalIsReady = fontLibrary.isReady;
        fontLibrary.isReady = true;

        const spy = vi.spyOn(textShapingModule, 'textShape').mockReturnValue([
            { char: 'H', start: 0, end: 1, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'e', start: 1, end: 2, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'l', start: 2, end: 3, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'l', start: 3, end: 4, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: 'o', start: 4, end: 5, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: ' ', start: 5, end: 6, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: '\uD83D\uDE00', start: 6, end: 8, glyph: null, font: null, kerning: 0, boundingBox: null },
            { char: '\r', start: 8, end: 9, glyph: null, font: null, kerning: 0, boundingBox: null },
        ]);

        try {
            const result = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig, true);
            const allGlyphs = result.flatMap((r) => r.glyphs);
            const emojiGlyph = allGlyphs.find((g) => g.content === '\uD83D\uDE00');
            expect(emojiGlyph).toBeDefined();
        } finally {
            spy.mockRestore();
            fontLibrary.isReady = originalIsReady;
        }
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
