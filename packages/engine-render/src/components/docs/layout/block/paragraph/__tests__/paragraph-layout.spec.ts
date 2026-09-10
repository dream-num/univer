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

import { BooleanNumber, DocumentFlavor } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getFontStyleString } from '../../../../../../basics/tools';
import { getDocumentCompatibilityPolicy } from '../../../../document-compatibility';
import { FontCache } from '../../../shaping-engine/font-cache';
import { clearFontCreateConfigCache } from '../../../tools';
import { dealWidthParagraph } from '../paragraph-layout';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('paragraph-layout', () => {
    it.each(['  ', '　', '　　'].flatMap((spaces) => [true, false].map((trailing) => ({ spaces, trailing }))))('preserves spaces $spaces with trailing=$trailing and hangs them only at the line end', ({ spaces, trailing }) => {
        const textStyle = { ff: 'Trailing space regression', fs: 12 };
        const font = getFontStyleString(textStyle).fontString;
        for (const text of ['中', '文', ' ', '　', '\r']) {
            FontCache.setFontMeasureCache(font, text, {
                width: 10,
                fontBoundingBoxAscent: 12,
                fontBoundingBoxDescent: 3,
                actualBoundingBoxAscent: 10,
                actualBoundingBoxDescent: 2,
            });
        }
        try {
            for (const flavor of [DocumentFlavor.DRAWINGML, DocumentFlavor.UNSPECIFIED]) {
                clearFontCreateConfigCache();
                const content = trailing ? `中文${spaces}` : `中${spaces}文`;
                const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                    documentStyle: {
                        documentFlavor: flavor,
                        textStyle,
                        pageSize: { width: 20, height: 600 },
                        marginLeft: 0,
                        marginRight: 0,
                        renderConfig: { lineWrapTolerance: 0 },
                    },
                });
                sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(flavor);
                const pages = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);
                const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
                const glyphs = lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup));
                expect(glyphs.map((glyph) => glyph.raw).join('')).toBe(`${content}\r\n`);
                expect(glyphs.reduce((count, glyph) => count + glyph.count, 0)).toBe(content.length + 2);
                if (trailing && (flavor === DocumentFlavor.DRAWINGML || spaces === '  ')) {
                    expect(lines).toHaveLength(1);
                } else {
                    expect(lines.length).toBeGreaterThan(1);
                }
            }
        } finally {
            FontCache.clearFontMeasureCache(font);
            clearFontCreateConfigCache();
        }
    });

    it.each([27, 28].flatMap((width) => [false, true].map((caps) => ({ width, caps }))))('includes space-letter kerning when fitting width $width with caps $caps', ({ width, caps }) => {
        const textStyle = { ff: 'Space kerning regression', fs: 12, kerning: 12, caps };
        const font = getFontStyleString(textStyle).fontString;
        for (const mode of ['normal', 'none']) {
            for (const text of ['A', 'V', ' ', '\r', 'A ', ' V']) {
                FontCache.setFontMeasureCache(`${font}\u0000${mode}`, text, {
                    width: text === ' V' && mode === 'normal' ? 18 : text.length * 10,
                    fontBoundingBoxAscent: 12,
                    fontBoundingBoxDescent: 3,
                    actualBoundingBoxAscent: 10,
                    actualBoundingBoxDescent: 2,
                });
            }
        }
        try {
            clearFontCreateConfigCache();
            const raw = caps ? 'a v' : 'A V';
            const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(raw, {
                documentStyle: {
                    documentFlavor: DocumentFlavor.DRAWINGML,
                    textStyle,
                    pageSize: { width, height: 600 },
                    marginLeft: 0,
                    marginRight: 0,
                    autoHyphenation: BooleanNumber.FALSE,
                    renderConfig: { lineWrapTolerance: 0 },
                },
            });
            sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
            const pages = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);
            const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
            const glyphs = lines.map((line) => line.divides.flatMap((divide) => divide.glyphGroup));
            expect(glyphs.map((line) => line.map((glyph) => glyph.content).join('')))
                .toEqual(width === 28 ? ['A V\r'] : ['A ', 'V\r']);
            expect(glyphs.flat().map((glyph) => glyph.raw).join('')).toBe(`${raw}\r\n`);
            expect(glyphs.flat().reduce((count, glyph) => count + glyph.count, 0)).toBe(raw.length + 2);
            expect(glyphs[0][1].width).toBe(width === 28 ? 8 : 10);
            expect(glyphs[glyphs.length - 1].find((glyph) => glyph.content === 'V')?.left).toBe(width === 28 ? 18 : 0);
        } finally {
            for (const mode of ['normal', 'none']) {
                FontCache.clearFontMeasureCache(`${font}\u0000${mode}`);
            }
            clearFontCreateConfigCache();
        }
    });

    it.each([0, 2])('keeps fitting text on its line before a DrawingML explicit break with tracking %s', (sc) => {
        const content = 'AAAA BB \u2028CC';
        const textStyle = { ff: 'Explicit break regression', fs: 12, sc };
        const font = getFontStyleString(textStyle).fontString;
        for (const text of ['A', 'B', 'C', ' ', '\u2028', '\r']) {
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
            const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                documentStyle: {
                    documentFlavor: DocumentFlavor.DRAWINGML,
                    textStyle,
                    pageSize: { width: 85 + 8 * sc, height: 600 },
                    marginLeft: 0,
                    marginRight: 0,
                    autoHyphenation: BooleanNumber.FALSE,
                    renderConfig: { lineWrapTolerance: 0 },
                },
            });
            sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
            const pages = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);
            const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
            expect(lines.map((line) => line.divides.flatMap((divide) => divide.glyphGroup).map((glyph) => glyph.content).join('')))
                .toEqual(['AAAA BB \u2028', 'CC\r']);
        } finally {
            FontCache.clearFontMeasureCache(font);
            clearFontCreateConfigCache();
        }
    });

    it('lays out a normal text paragraph', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result[0].sections.length).toBeGreaterThan(0);
    });

    it('lays out empty paragraph', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('lays out CJK text paragraph', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('你好世界');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('lays out paragraph with multiple words', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('This is a longer paragraph with multiple words to test layout');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('returns pages with line structure', () => {
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Line one\rLine two');

        const result = dealWidthParagraph(ctx, viewModel, paragraphNode, curPage, sectionBreakConfig);

        expect(result.length).toBeGreaterThanOrEqual(1);
        const lastPage = result[result.length - 1];
        expect(lastPage.sections.length).toBeGreaterThan(0);
    });
});
