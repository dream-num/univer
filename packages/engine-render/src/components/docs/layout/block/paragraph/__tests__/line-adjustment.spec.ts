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

import { BooleanNumber, characterSpacingControlType, DocumentFlavor, HorizontalAlign, SpacingRule, WrapStrategy } from '@univerjs/core';
import { describe, expect, it, onTestFinished, vi } from 'vitest';
import { getFontStyleString } from '../../../../../../basics/tools';
import { getDocumentCompatibilityPolicy } from '../../../../document-compatibility';
import { getGlyphGroupFontBoundingBox } from '../../../model/glyph';
import { FontCache } from '../../../shaping-engine/font-cache';
import { clearFontCreateConfigCache } from '../../../tools';
import { lineAdjustment } from '../line-adjustment';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed } from './create-paragraph-layout-test-bed';

describe('line-adjustment', () => {
    it.each([12, 17, 22, 30].flatMap((points) => [DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN].map((documentFlavor) => ({ points, documentFlavor }))))('aligns exact-spaced text like Word without changing line boxes: %j', ({ points, documentFlavor }) => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 12,
            fontBoundingBoxDescent: 4,
        }) as TextMetrics);
        onTestFinished(() => measure.mockRestore());
        const content = 'Exact line';
        const bed = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { spacingRule: SpacingRule.EXACT, lineSpacing: points / 0.75, snapToGrid: BooleanNumber.FALSE } }] },
        });
        const before = JSON.stringify(bed.dataModel.getSnapshot());
        try {
            const shaped = shaping(bed.ctx, bed.paragraphNode.content!, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig);
            const pages = lineBreaking(bed.ctx, bed.viewModel, shaped, bed.curPage, bed.paragraphNode, bed.sectionBreakConfig, null);
            const line = pages[0].sections[0].columns[0].lines[0];
            const height = line.lineHeight;
            const paddingTop = line.paddingTop;
            lineAdjustment(pages, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig);
            const { boundingBoxAscent } = getGlyphGroupFontBoundingBox(bed.sectionBreakConfig.documentCompatibilityPolicy, ...line.divides.map((divide) => divide.glyphGroup));
            if (documentFlavor === DocumentFlavor.TRADITIONAL) {
                expect(line.paddingTop + boundingBoxAscent).toBeCloseTo(points / 0.75 * 0.8);
            } else {
                expect(line.paddingTop).toBe(paddingTop);
            }
            const baselinePadding = line.paddingTop;
            lineAdjustment(pages, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig);
            expect(line.paddingTop).toBeCloseTo(baselinePadding);
            expect(line.lineHeight).toBe(height);
            expect(JSON.stringify(bed.dataModel.getSnapshot())).toBe(before);
        } finally {
            bed.viewModel.dispose();
            bed.dataModel.dispose();
        }
    });

    it.each([' '.repeat(20), '\u3000'.repeat(3), '\u00A0'.repeat(3), '\t'])('matches Word trailing-space alignment without changing the text (%j)', (suffix) => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as TextMetrics);
        onTestFinished(() => measure.mockRestore());
        for (const documentFlavor of [DocumentFlavor.TRADITIONAL, DocumentFlavor.MODERN]) {
            for (const horizontalAlign of [HorizontalAlign.CENTER, HorizontalAlign.RIGHT]) {
                const offsets = ['', suffix].map((ending) => {
                    const content = `Aligned text${ending}`;
                    const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                        documentStyle: { documentFlavor },
                        body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { horizontalAlign, snapToGrid: BooleanNumber.FALSE } }] },
                    });
                    const before = JSON.stringify(dataModel.getSnapshot());
                    try {
                        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
                        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
                        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
                        const lines = pages[0].sections[0].columns[0].lines;
                        expect(lines).toHaveLength(1);
                        const divide = lines[0].divides[0];
                        const offset = divide.paddingLeft;
                        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
                        expect(divide.paddingLeft).toBeCloseTo(offset);
                        expect(JSON.stringify(dataModel.getSnapshot())).toBe(before);
                        return offset;
                    } finally {
                        viewModel.dispose();
                        dataModel.dispose();
                    }
                });
                if (documentFlavor === DocumentFlavor.TRADITIONAL && (suffix[0] === ' ' || suffix[0] === '\u3000')) {
                    expect(offsets[1]).toBeCloseTo(offsets[0]);
                } else {
                    expect(offsets[1]).toBeLessThan(offsets[0]);
                }
            }
        }
    });

    it.each([undefined, BooleanNumber.FALSE])('preserves native no-compression hanging punctuation and explicit overrides (%s)', (hangingPunctuation) => {
        const firstLine = '本报告由上海申银万国证券研究所有限公司（隶属于申万宏源证券有限公司，以下简称“本公司”）在中华人民共和国内地（香港、';
        const content = `${firstLine}澳门、台湾除外）发布。`;
        const measure = vi.spyOn(FontCache, 'getTextSize').mockReturnValue({
            width: 12,
            ba: 14,
            bd: 3,
            aba: 11,
            abd: 1,
            sp: 0,
            sbr: 0,
            sbo: 0,
            spr: 0,
            spo: 0,
        });
        const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                characterSpacingControl: characterSpacingControlType.doNotCompress,
                defaultParagraphStyle: { hangingPunctuation: BooleanNumber.TRUE },
                textStyle: { ff: '微软雅黑', fs: 9 },
                pageSize: { width: 719.2, height: 600 },
            },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: {
                horizontalAlign: HorizontalAlign.BOTH,
                snapToGrid: BooleanNumber.FALSE,
                hangingPunctuation,
            } }] },
        });
        try {
            const shaped = shaping(ctx, content, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
            const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
            const divide = lines[0].divides[0];
            const text = divide.glyphGroup.map((glyph) => glyph.content).join('');
            const lastGlyph = divide.glyphGroup[divide.glyphGroup.length - 1];
            if (hangingPunctuation === undefined) {
                expect(text).toBe(firstLine);
                expect(lastGlyph.content).toBe('、');
                expect(lastGlyph.width).toBeCloseTo(12);
                expect(lastGlyph.left).toBeCloseTo(divide.width);
                expect(divide.glyphGroupWidth).toBeCloseTo(691.2);
            } else {
                expect(text).not.toBe(firstLine);
                expect(lastGlyph.left + lastGlyph.width).toBeLessThanOrEqual(divide.width + 1e-8);
            }
            expect(lines.flatMap((line) => line.divides.flatMap((part) => part.glyphGroup)).map((glyph) => glyph.content).join('')).toBe(content);
        } finally {
            viewModel.dispose();
            dataModel.dispose();
            measure.mockRestore();
        }
    });

    it.each([
        { flavor: DocumentFlavor.TRADITIONAL, topLinePunct: undefined, expectedWidth: 8 },
        { flavor: DocumentFlavor.TRADITIONAL, topLinePunct: BooleanNumber.FALSE, expectedWidth: 8 },
        { flavor: DocumentFlavor.TRADITIONAL, topLinePunct: BooleanNumber.TRUE, expectedWidth: 4 },
        { flavor: DocumentFlavor.MODERN, topLinePunct: undefined, expectedWidth: 4 },
        { flavor: DocumentFlavor.MODERN, topLinePunct: BooleanNumber.FALSE, expectedWidth: 8 },
    ])('respects line-start punctuation compression before alignment: $flavor/$topLinePunct', ({ flavor, topLinePunct, expectedWidth }) => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as TextMetrics);
        try {
            const traditional = flavor === DocumentFlavor.TRADITIONAL;
            for (const content of traditional ? ['（AB）', '甲乙丙丁（AB）'] : ['（AB）']) {
                const { dataModel, ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
                    documentStyle: { documentFlavor: flavor, pageSize: { width: traditional ? 72 : 400, height: 600 } },
                    body: { paragraphs: [{ startIndex: content.length, paragraphStyle: {
                        topLinePunct,
                        snapToGrid: BooleanNumber.FALSE,
                        horizontalAlign: HorizontalAlign.LEFT,
                    } }] },
                });
                try {
                    const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
                    const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
                    lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
                    const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
                    const divide = lines.flatMap((line) => line.divides).find((divide) => divide.glyphGroup[0]?.content === '（')!;
                    expect(divide).toBeDefined();
                    expect(divide.glyphGroup[0].width).toBe(expectedWidth);
                    expect(divide.glyphGroup[0].xOffset).toBe(expectedWidth - 8);
                    expect(divide.glyphGroup[1].left).toBe(expectedWidth);
                } finally {
                    viewModel.dispose();
                    dataModel.dispose();
                }
            }
        } finally {
            measure.mockRestore();
        }
    });

    it('fills a mixed-script line with automatic spacing before compressing another Han character onto it', () => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as TextMetrics);
        const content = '甲A乙B丙C丁D戊后';
        const { dataModel, ctx, paragraphNode, viewModel, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 124, height: 600 } },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { snapToGrid: BooleanNumber.FALSE, horizontalAlign: HorizontalAlign.BOTH } }] },
        });
        try {
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
            const first = lines[0].divides[0];
            expect(first.glyphGroup.map((glyph) => glyph.content).join('')).toBe('甲A乙B丙C丁D');
            lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
            expect(first.glyphGroupWidth).toBeCloseTo(84);
            expect(first.glyphGroup[0].width).toBeCloseTo(10 + 6 / 7);
            expect(first.glyphGroup[2].width).toBeCloseTo(12 + 12 / 7);
            expect(first.glyphGroup[2].xOffset).toBeCloseTo(2 + 6 / 7);
            const continuation = lines[1].divides[0];
            expect(continuation.glyphGroup[0].content).toBe('戊');
            expect(continuation.glyphGroup[0].xOffset).toBe(0);
            expect(continuation.glyphGroup[0].adjustability.stretchability).toEqual([0, 0]);
            expect(continuation.glyphGroupWidth).toBeLessThan(84);
            for (const line of lines) {
                const glyphs = line.divides[0].glyphGroup;
                for (let index = 1; index < glyphs.length; index++) {
                    expect(glyphs[index].left).toBeCloseTo(glyphs[index - 1].left + glyphs[index - 1].width);
                }
            }
            expect(lines.flatMap((line) => line.divides.flatMap((divide) => divide.glyphGroup)).map((glyph) => glyph.content).join(''))
                .toBe(`${content}\r`);
        } finally {
            viewModel.dispose();
            dataModel.dispose();
            measure.mockRestore();
        }
    });

    it.each([HorizontalAlign.CENTER, HorizontalAlign.RIGHT, HorizontalAlign.DISTRIBUTED])(
        'aligns DrawingML trailing breakable spaces without deleting editable glyphs (%s)',
        (horizontalAlign) => {
            const textStyle = { ff: 'DrawingML trailing-space regression', fs: 12 };
            const font = getFontStyleString(textStyle).fontString;
            const outlineFont = font.replace(/\b\d+(?:\.\d+)?(?:pt|px)\b/, '1024px');
            for (const text of ['A', 'B', 'C', 'D', ' ', '\u3000', '\u00A0', '\t', '\u2028', '\r']) {
                FontCache.setFontMeasureCache(font, text, {
                    width: text === '\r' ? 0 : 10,
                    fontBoundingBoxAscent: 12,
                    fontBoundingBoxDescent: 3,
                    actualBoundingBoxAscent: 10,
                    actualBoundingBoxDescent: 2,
                });
                FontCache.setFontMeasureCache(outlineFont, text, {
                    width: text === '\r' ? 0 : 10 * 64,
                    fontBoundingBoxAscent: 12 * 64,
                    fontBoundingBoxDescent: 3 * 64,
                    actualBoundingBoxAscent: 10 * 64,
                    actualBoundingBoxDescent: 2 * 64,
                });
            }
            try {
                for (const documentFlavor of [DocumentFlavor.UNSPECIFIED, DocumentFlavor.MODERN, DocumentFlavor.TRADITIONAL, DocumentFlavor.DRAWINGML]) {
                    for (const wrapStrategy of [WrapStrategy.WRAP, WrapStrategy.OVERFLOW]) {
                        for (const ending of ['', '\u2028CD']) {
                            const results = ['', ' ', '  ', '\u3000', '\u00A0', '\t'].map((suffix) => {
                                clearFontCreateConfigCache();
                                const content = `AB${suffix}${ending}`;
                                const context = createParagraphLayoutTestBed(content, {
                                    documentStyle: {
                                        documentFlavor,
                                        textStyle,
                                        pageSize: { width: 240, height: 600 },
                                        marginLeft: 0,
                                        marginRight: 0,
                                        autoHyphenation: BooleanNumber.FALSE,
                                        renderConfig: { wrapStrategy },
                                    },
                                    body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { horizontalAlign } }] },
                                });
                                const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = context;
                                sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
                                const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
                                const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
                                const divide = pages[0].sections[0].columns[0].lines[0].divides[0];
                                const characters = divide.glyphGroup.map(({ content, count }) => ({ content, count }));
                                const trailingWidths = divide.glyphGroup.filter((glyph) => suffix.includes(glyph.content) && glyph.content !== '')
                                    .map((glyph) => glyph.width);
                                lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
                                expect(divide.glyphGroup.map(({ content, count }) => ({ content, count }))).toEqual(characters);
                                if (horizontalAlign !== HorizontalAlign.DISTRIBUTED || (documentFlavor === DocumentFlavor.DRAWINGML && [' ', '  ', '\u3000'].includes(suffix))) {
                                    expect(divide.glyphGroup.filter((glyph) => suffix.includes(glyph.content) && glyph.content !== '')
                                        .map((glyph) => glyph.width)).toEqual(trailingWidths);
                                }
                                const positions = divide.glyphGroup.filter((glyph) => /[AB]/.test(glyph.content))
                                    .map((glyph) => divide.paddingLeft + glyph.left);
                                viewModel.dispose();
                                return positions;
                            });
                            if (documentFlavor === DocumentFlavor.DRAWINGML ||
                                (documentFlavor === DocumentFlavor.TRADITIONAL && wrapStrategy === WrapStrategy.WRAP && ending === '' && horizontalAlign !== HorizontalAlign.DISTRIBUTED)) {
                                for (const index of [1, 2, 3]) {
                                    expect(results[index], `${wrapStrategy}/${ending}/${index}`).toEqual(results[0]);
                                }
                            } else {
                                expect(results[1]).not.toEqual(results[0]);
                            }
                            expect(results[4]).not.toEqual(results[0]);
                            expect(results[5]).not.toEqual(results[0]);
                        }
                    }
                }
            } finally {
                FontCache.clearFontMeasureCache(font);
                FontCache.clearFontMeasureCache(outlineFont);
                clearFontCreateConfigCache();
            }
        }
    );

    it('justifies a wrapped DrawingML line using internal spaces without stretching trailing spaces', () => {
        const content = 'A B  CCCCCCC';
        const textStyle = { ff: 'DrawingML justified-space regression', fs: 12 };
        const font = getFontStyleString(textStyle).fontString;
        for (const text of ['A', 'B', 'C', ' ']) {
            FontCache.setFontMeasureCache(font, text, {
                width: 10,
                fontBoundingBoxAscent: 12,
                fontBoundingBoxDescent: 3,
                actualBoundingBoxAscent: 10,
                actualBoundingBoxDescent: 2,
            });
        }
        const { ctx, viewModel, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.DRAWINGML,
                textStyle,
                pageSize: { width: 50, height: 600 },
                marginLeft: 0,
                marginRight: 0,
                autoHyphenation: BooleanNumber.FALSE,
            },
            body: { paragraphs: [{ startIndex: content.length, paragraphStyle: { horizontalAlign: HorizontalAlign.JUSTIFIED } }] },
        });
        try {
            clearFontCreateConfigCache();
            sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(DocumentFlavor.DRAWINGML);
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const divide = pages[0].sections[0].columns[0].lines[0].divides[0];
            expect(divide.glyphGroup.map((glyph) => glyph.content).join('')).toBe('A B  ');
            expect(divide.isFull).toBe(true);
            lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
            expect(divide.glyphGroup.map((glyph) => glyph.width)).toEqual([10, 30, 10, 10, 10]);
            expect(divide.glyphGroup.map((glyph) => glyph.left)).toEqual([0, 10, 40, 50, 60]);
            expect(divide.glyphGroupWidth).toBe(70);
        } finally {
            viewModel.dispose();
            FontCache.clearFontMeasureCache(font);
            clearFontCreateConfigCache();
        }
    });

    it.each([0, 1024])('adjusts a late paragraph without revisiting unrelated cell lines (%i following lines)', (followingLineCount) => {
        const prefixCount = 1024;
        const prefix = 'A\r'.repeat(prefixCount);
        const dataStream = `${prefix}Hello\r${'B\r'.repeat(followingLineCount)}\n`;
        const paragraphIndex = prefix.length + 5;
        const { viewModel, ctx, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream,
                textRuns: [],
                paragraphs: [...dataStream.matchAll(/\r/g)].map((match) => ({
                    startIndex: match.index!,
                    paragraphId: `paragraph-${match.index}`,
                    paragraphStyle: { horizontalAlign: HorizontalAlign.CENTER },
                })),
                sectionBreaks: [{ sectionId: 'long-cell', startIndex: dataStream.length - 1 }],
            },
        });
        const paragraphNode = viewModel.getChildren()[0].children.find((node) => node.endIndex === paragraphIndex)!;
        const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
        const column = pages[0].sections[0].columns[0];
        const currentLine = column.lines[0];
        let earlierLineReads = 0;
        column.lines.unshift(...Array.from({ length: prefixCount }, (_, index) => ({
            ...currentLine,
            divides: [],
            get paragraphIndex() {
                earlierLineReads++;
                return index * 2 + 1;
            },
        })));
        column.lines.push(...Array.from({ length: followingLineCount }, (_, index) => ({
            ...currentLine,
            divides: [],
            paragraphIndex: paragraphIndex + 2 + index * 2,
        })));
        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);
        expect(currentLine.divides[0].paddingLeft).toBeGreaterThan(0);
        expect(earlierLineReads).toBeLessThan(20);
        viewModel.dispose();
    });

    function createGlyph(content: string, width: number, overrides: Record<string, unknown> = {}) {
        return {
            content,
            width,
            left: 0,
            xOffset: 0,
            isJustifiable: content === ' ',
            adjustability: {
                stretchability: content === ' ' ? [0, 3] : [0, 0],
                shrinkability: content === ' ' ? [0, 2] : [0, 0],
            },
            bBox: {
                width,
            },
            ...overrides,
        } as any;
    }

    function createPagesWithLine(divide: any, horizontalAlign: HorizontalAlign) {
        const { dataModel, viewModel, paragraphNode, sectionBreakConfig } = createParagraphLayoutTestBed('', {
            body: { paragraphs: [{ startIndex: 0, paragraphStyle: { horizontalAlign } }] },
        });
        onTestFinished(() => {
            viewModel.dispose();
            dataModel.dispose();
        });
        const line = {
            paragraphIndex: 0,
            divides: [divide],
        } as any;
        const column = {
            lines: [line],
        };
        const section = {
            columns: [column],
        };
        const page = {
            sections: [section],
        };

        divide.parent = line;
        line.parent = column;

        return {
            pages: [page] as any[],
            viewModel,
            paragraphNode,
            sectionBreakConfig,
        };
    }

    it('adjusts lines after layout', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        // lineAdjustment should not throw
        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles CJK punctuation shrinkage', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('\u3002\u3002'); // Two full-width periods
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align CENTER', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream: 'Hello\r\n',
                textRuns: [{ st: 0, ed: 7, ts: {} }],
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.CENTER,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1022', startIndex: 6 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align RIGHT', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello', {
            body: {
                dataStream: 'Hello\r\n',
                textRuns: [{ st: 0, ed: 7, ts: {} }],
                paragraphs: [{
                    startIndex: 5,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.RIGHT,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1023', startIndex: 6 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('handles horizontal align JUSTIFIED', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hello world test', {
            body: {
                dataStream: 'Hello world test\r\n',
                textRuns: [{ st: 0, ed: 18, ts: {} }],
                paragraphs: [{
                    startIndex: 16,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.JUSTIFIED,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1024', startIndex: 17 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('spreads glyphs across the line for horizontal align DISTRIBUTED', () => {
        const text = '2038';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(text, {
            body: {
                dataStream: `${text}\r\n`,
                textRuns: [{ st: 0, ed: 6, ts: {} }],
                paragraphs: [{
                    startIndex: text.length,
                    paragraphStyle: {
                        horizontalAlign: HorizontalAlign.DISTRIBUTED,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1025', startIndex: text.length + 1 }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        const divide = pages[0].sections[0].columns[0].lines[0].divides[0];
        const visibleGlyphs = divide.glyphGroup.filter((glyph) => glyph.content !== '');
        const lastVisibleGlyph = visibleGlyphs[visibleGlyphs.length - 1];
        const initialLastGlyphLeft = lastVisibleGlyph.left;

        lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);

        expect(lastVisibleGlyph.left).toBeGreaterThan(initialLastGlyphLeft);
        expect(lastVisibleGlyph.left + lastVisibleGlyph.width).toBeCloseTo(divide.width, 1);
        expect(divide.paddingLeft).toBe(0);
    });

    it('handles line with only paragraph break', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const pages = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(() => lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig)).not.toThrow();
    });

    it('sets center and right padding from actual glyph group width', () => {
        const centerDivide = {
            width: 100,
            isFull: false,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 20), createGlyph('B', 30)],
        } as any;
        const center = createPagesWithLine(centerDivide, HorizontalAlign.CENTER);

        lineAdjustment(center.pages, center.viewModel, center.paragraphNode, center.sectionBreakConfig);
        expect(centerDivide.glyphGroupWidth).toBe(50);
        expect(centerDivide.paddingLeft).toBe(25);

        const rightDivide = {
            width: 100,
            isFull: false,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 20), createGlyph('B', 30)],
        } as any;
        const right = createPagesWithLine(rightDivide, HorizontalAlign.RIGHT);

        lineAdjustment(right.pages, right.viewModel, right.paragraphNode, right.sectionBreakConfig);
        expect(rightDivide.glyphGroupWidth).toBe(50);
        expect(rightDivide.paddingLeft).toBe(50);
    });

    it.each([HorizontalAlign.JUSTIFIED, HorizontalAlign.BOTH])('expands justifiable spaces to fill a full justified divide (%s)', (alignment) => {
        const space = createGlyph(' ', 5);
        const divide = {
            width: 40,
            isFull: true,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 10), space, createGlyph('B', 10)],
        } as any;
        const context = createPagesWithLine(divide, alignment);

        lineAdjustment(context.pages, context.viewModel, context.paragraphNode, context.sectionBreakConfig);

        expect(space.width).toBe(20);
        expect(divide.glyphGroupWidth).toBe(40);
        expect(divide.paddingLeft).toBe(0);
    });

    it.each([HorizontalAlign.JUSTIFIED, HorizontalAlign.BOTH])('justifies wrapped CJK lines without stretching the paragraph ending (%s)', (horizontalAlign) => {
        const measure = vi.spyOn(FontCache, 'getMeasureText').mockImplementation((text: string) => ({
            width: text.length * 8,
            fontBoundingBoxAscent: 8,
            fontBoundingBoxDescent: 2,
        }) as TextMetrics);
        const text = '公司产品市场持续增长'.repeat(12);
        const { dataModel, viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(text, {
            body: {
                paragraphs: [{ startIndex: text.length, paragraphStyle: { horizontalAlign, snapToGrid: BooleanNumber.FALSE } }],
            },
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL, pageSize: { width: 500, height: 1200 } },
        });
        try {
            const shaped = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
            const pages = lineBreaking(ctx, viewModel, shaped, curPage, paragraphNode, sectionBreakConfig, null);
            const divides = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines.flatMap((line) => line.divides))));
            expect(divides.length).toBeGreaterThan(1);
            const lastDivide = divides[divides.length - 1];
            const lastWidths = lastDivide.glyphGroup.map((glyph) => glyph.width);

            lineAdjustment(pages, viewModel, paragraphNode, sectionBreakConfig);

            for (const divide of divides.slice(0, -1)) {
                expect(divide.glyphGroupWidth).toBeCloseTo(divide.width, 5);
                const lastGlyph = divide.glyphGroup[divide.glyphGroup.length - 1];
                expect(lastGlyph.width).toBeCloseTo(lastGlyph.bBox.width, 5);
            }
            expect(lastDivide.glyphGroup.map((glyph) => glyph.width)).toEqual(lastWidths);
        } finally {
            viewModel.dispose();
            dataModel.dispose();
            measure.mockRestore();
        }
    });

    it.each([{ autoSpacing: undefined }, { autoSpacing: [0, 5] }])('removes only recorded automatic spacing at line end: $autoSpacing', ({ autoSpacing }) => {
        const cjkGlyph = createGlyph('中', 20, {
            xOffset: 5,
            autoSpacing,
            bBox: { width: 10 },
            adjustability: {
                stretchability: [0, 0],
                shrinkability: [0, 7],
            },
        });
        const divide = {
            width: 100,
            isFull: true,
            paddingLeft: 0,
            glyphGroup: [createGlyph('A', 10), cjkGlyph],
        };
        const context = createPagesWithLine(divide, HorizontalAlign.UNSPECIFIED);

        lineAdjustment(context.pages, context.viewModel, context.paragraphNode, context.sectionBreakConfig);

        expect(cjkGlyph.width).toBe(autoSpacing ? 15 : 20);
        expect(cjkGlyph.adjustability.shrinkability[1]).toBe(autoSpacing ? 4.5 : 7);
        expect(cjkGlyph.xOffset).toBe(5);
        lineAdjustment(context.pages, context.viewModel, context.paragraphNode, context.sectionBreakConfig);
        expect(cjkGlyph.width).toBe(autoSpacing ? 15 : 20);
    });
});
