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

import type { IDocumentSkeletonPage } from '../../../../../../basics/i-document-skeleton-cached';
import {
    AlignTypeH,
    AlignTypeV,
    BooleanNumber,
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    DocumentFlavor,
    GridType,
    HorizontalAlign,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    SpacingRule,
    WrapTextType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { GlyphType } from '../../../../../../basics/i-document-skeleton-cached';
import { setDocsCustomBlockRenderViewportProvider } from '../../../../custom-block-render-viewport';
import { updateInlineDrawingCoordsAndBorder } from '../../../tools';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { createParagraphLayoutTestBed, createSectionLayoutTestBed } from './create-paragraph-layout-test-bed';

function createContext() {
    return {
        paragraphConfigCache: new Map(),
        skeletonResourceReference: {
            skeHeaders: new Map(),
            skeFooters: new Map(),
            skeListLevel: new Map(),
            drawingAnchor: new Map(),
        },
    } as any;
}

function paragraphLines(page: IDocumentSkeletonPage, paragraphIndex: number) {
    return page.sections.flatMap((section) =>
        section.columns.flatMap((column) =>
            column.lines.filter((line) => line.paragraphIndex === paragraphIndex)
        )
    );
}

function paginationSignature(pages: IDocumentSkeletonPage[]) {
    return pages.map((page) => ({
        pageNumber: page.pageNumber,
        breakType: page.breakType,
        sections: page.sections.map((section) => ({
            columns: section.columns.map((column) => ({
                lines: column.lines.map((line) => ({
                    paragraphIndex: line.paragraphIndex,
                    lineIndex: line.lineIndex,
                    top: line.top,
                    divideCount: line.divides.length,
                })),
            })),
        })),
    }));
}

describe('linebreaking', () => {
    beforeEach(() => {
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText: (value: string) => ({
                        width: value.length * 8,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 4,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 4,
                    }),
                }),
            }),
        });
    });
    afterEach(() => {
        setDocsCustomBlockRenderViewportProvider(null);
    });

    it('lays out short text on a single page', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Hi');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBe(1);
        expect(result[0].sections.length).toBeGreaterThan(0);
    });

    it.each([
        { name: 'explicitly disabled', snapToGrid: BooleanNumber.FALSE, expectedLineHeight: 21 },
        { name: 'enabled by default', snapToGrid: undefined, expectedLineHeight: 41.6 },
    ])('keeps document-grid multiline spacing $name outside a table', ({ snapToGrid, expectedLineHeight }) => {
        const content = '一'.repeat(30);
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                gridType: GridType.LINES,
                linePitch: 20.8,
                pageSize: { width: 160, height: 600 },
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'grid-paragraph',
                    paragraphStyle: {
                        lineSpacing: 1.5,
                        spacingRule: SpacingRule.AUTO,
                        ...(snapToGrid == null ? {} : { snapToGrid }),
                        spaceBelow: { v: 10.4 },
                    },
                }],
                sectionBreaks: [{
                    sectionId: 'grid-section',
                    startIndex: content.length + 1,
                    linePitch: 20.8,
                    gridType: GridType.LINES,
                }],
            },
        });

        const result = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            null
        );
        const lines = paragraphLines(result[0], paragraphNode.endIndex);

        expect(lines.length).toBeGreaterThan(1);
        for (const line of lines) {
            expect(line.lineHeight).toBeCloseTo(expectedLineHeight, 6);
        }
    });

    it('suppresses paragraph space above at the top of a traditional page', () => {
        const content = 'Heading';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                textRuns: [{ st: 0, ed: content.length, ts: { ff: 'Arial', fs: 14 } }],
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'page-heading',
                    paragraphStyle: { spaceAbove: { v: 22 }, textStyle: { ff: 'Arial', fs: 14 } },
                }],
            },
        });

        const result = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            null
        );
        const firstLine = result[0].sections[0].columns[0].lines[0];

        expect(firstLine.marginTop).toBe(0);
        expect(firstLine.top).toBe(0);
    });

    it('starts pageBreakBefore paragraphs on the next physical page without doubling a blank page', () => {
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(['First', 'Second'], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                paragraphs: [
                    { startIndex: 5, paragraphId: 'first' },
                    {
                        startIndex: 12,
                        paragraphId: 'second',
                        paragraphStyle: { pageBreakBefore: BooleanNumber.TRUE },
                    },
                ],
            },
        });
        const [firstParagraph, secondParagraph] = sectionNode.children;
        const firstPages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, firstParagraph.content!, viewModel, firstParagraph, sectionBreakConfig),
            curPage,
            firstParagraph,
            sectionBreakConfig,
            null
        );
        const result = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, secondParagraph.content!, viewModel, secondParagraph, sectionBreakConfig),
            firstPages[firstPages.length - 1],
            secondParagraph,
            sectionBreakConfig,
            null
        );

        expect(result).toHaveLength(2);
        expect(paragraphLines(result[0], secondParagraph.endIndex)).toHaveLength(0);
        expect(paragraphLines(result[1], secondParagraph.endIndex).length).toBeGreaterThan(0);

        const blankTestBed = createParagraphLayoutTestBed('Only', {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                paragraphs: [{
                    startIndex: 4,
                    paragraphId: 'only',
                    paragraphStyle: { pageBreakBefore: BooleanNumber.TRUE },
                }],
            },
        });
        const blankResult = lineBreaking(
            blankTestBed.ctx,
            blankTestBed.viewModel,
            shaping(
                blankTestBed.ctx,
                blankTestBed.paragraphNode.content!,
                blankTestBed.viewModel,
                blankTestBed.paragraphNode,
                blankTestBed.sectionBreakConfig
            ),
            blankTestBed.curPage,
            blankTestBed.paragraphNode,
            blankTestBed.sectionBreakConfig,
            null
        );
        expect(blankResult).toHaveLength(1);
    });

    it('promotes a first-cell pageBreakBefore to the table wrapper paragraph', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('Before', {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });
        const firstPages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            null
        );

        const result = lineBreaking(
            ctx,
            viewModel,
            [],
            firstPages[firstPages.length - 1],
            paragraphNode,
            sectionBreakConfig,
            null,
            true
        );

        expect(result).toHaveLength(2);
    });

    it('does not duplicate a page boundary already created by an explicit page break', () => {
        const firstContent = `Before${DataStreamTreeTokenType.PAGE_BREAK}`;
        const secondContent = 'Chapter';
        const firstEnd = firstContent.length;
        const secondEnd = firstEnd + 1 + secondContent.length;
        const testBed = createSectionLayoutTestBed([firstContent, secondContent], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                paragraphs: [
                    { startIndex: firstEnd, paragraphId: 'explicit-break' },
                    {
                        startIndex: secondEnd,
                        paragraphId: 'chapter',
                        paragraphStyle: { pageBreakBefore: BooleanNumber.TRUE },
                    },
                ],
            },
        });
        const [firstParagraph, secondParagraph] = testBed.sectionNode.children;
        const firstPages = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                firstParagraph.content!,
                testBed.viewModel,
                firstParagraph,
                testBed.sectionBreakConfig
            ),
            testBed.curPage,
            firstParagraph,
            testBed.sectionBreakConfig,
            null
        );
        const result = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                secondParagraph.content!,
                testBed.viewModel,
                secondParagraph,
                testBed.sectionBreakConfig
            ),
            firstPages.at(-1)!,
            secondParagraph,
            testBed.sectionBreakConfig,
            null
        );

        expect(firstPages).toHaveLength(2);
        expect(result).toHaveLength(1);
        expect(paragraphLines(result[0], secondParagraph.endIndex).length).toBeGreaterThan(0);
    });

    it('does not create a blank page for a manual page break at the top of an empty page', () => {
        const testBed = createParagraphLayoutTestBed(DataStreamTreeTokenType.PAGE_BREAK, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
        });

        const result = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                testBed.paragraphNode.content!,
                testBed.viewModel,
                testBed.paragraphNode,
                testBed.sectionBreakConfig
            ),
            testBed.curPage,
            testBed.paragraphNode,
            testBed.sectionBreakConfig,
            null
        );

        expect(result).toHaveLength(1);
    });

    it('renders a list marker only once when a bullet paragraph ends with a manual page break', () => {
        const content = `Item 6${DataStreamTreeTokenType.PAGE_BREAK}`;
        const testBed = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    bullet: { listId: 'list-1', listType: 'test-list', nestingLevel: 0 },
                }],
            },
            lists: {
                'test-list': {
                    listType: 'test-list',
                    nestingLevel: [{
                        bulletAlignment: 1,
                        glyphFormat: '%1)',
                        startNumber: 1,
                        glyphType: 0,
                    }],
                },
            },
        });

        const result = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                testBed.paragraphNode.content!,
                testBed.viewModel,
                testBed.paragraphNode,
                testBed.sectionBreakConfig
            ),
            testBed.curPage,
            testBed.paragraphNode,
            testBed.sectionBreakConfig,
            null
        );
        const listGlyphCounts = result.map((page) =>
            page.sections.reduce((pageCount, section) =>
                pageCount + section.columns.reduce((sectionCount, column) =>
                    sectionCount + column.lines.reduce((columnCount, line) =>
                        columnCount + line.divides.reduce((lineCount, divide) =>
                            lineCount + divide.glyphGroup.filter((glyph) => glyph.glyphType === GlyphType.LIST).length, 0), 0), 0), 0)
        );

        expect(result).toHaveLength(2);
        expect(listGlyphCounts).toEqual([1, 0]);
    });

    it('does not add a second boundary when a rendered page break follows natural overflow', () => {
        const beforeBreak = 'One two three four five six seven eight nine ten '.repeat(8);
        const content = `${beforeBreak}${DataStreamTreeTokenType.PAGE_BREAK}After`;
        const testBed = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                renderedPageBreaks: [beforeBreak.length],
            },
        });
        const manualBed = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
        });
        const layout = (bed: typeof testBed) => lineBreaking(
            bed.ctx,
            bed.viewModel,
            shaping(bed.ctx, bed.paragraphNode.content!, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig),
            bed.curPage,
            bed.paragraphNode,
            bed.sectionBreakConfig,
            null
        );
        const result = layout(testBed);
        const manualResult = layout(manualBed);

        expect(result.length).toBeGreaterThan(1);
        expect(result).toHaveLength(manualResult.length - 1);
        expect(result.at(-1)?.sections.some((section) =>
            section.columns.some((column) => !column.isFull)
        )).toBe(true);
    });

    it('preserves a rendered page break before a fitting inline drawing', () => {
        const beforeBreak = 'Intro';
        const content = `${beforeBreak}${DataStreamTreeTokenType.PAGE_BREAK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const createBed = (rendered: boolean) => createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 400, height: 600 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                customBlocks: [{ startIndex: beforeBreak.length + 1, blockId: 'inline-image' }],
                ...(rendered ? { renderedPageBreaks: [beforeBreak.length] } : {}),
            },
            drawings: {
                'inline-image': {
                    drawingId: 'inline-image',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: {},
                        positionV: {},
                        // DOCX EMU-to-pixel conversion can leave a sub-pixel width over the column.
                        size: { width: 360.4, height: 90 },
                    },
                },
            },
        });
        const layout = (bed: ReturnType<typeof createBed>) => lineBreaking(
            bed.ctx,
            bed.viewModel,
            shaping(bed.ctx, bed.paragraphNode.content!, bed.viewModel, bed.paragraphNode, bed.sectionBreakConfig),
            bed.curPage,
            bed.paragraphNode,
            bed.sectionBreakConfig,
            null
        );
        const renderedResult = layout(createBed(true));
        const manualResult = layout(createBed(false));

        expect(renderedResult).toHaveLength(manualResult.length);

        expect({
            rendered: paginationSignature(renderedResult),
            manual: paginationSignature(manualResult),
        }).toMatchInlineSnapshot(`
          {
            "manual": [
              {
                "breakType": 0,
                "pageNumber": 1,
                "sections": [
                  {
                    "columns": [
                      {
                        "lines": [
                          {
                            "divideCount": 1,
                            "lineIndex": 0,
                            "paragraphIndex": 7,
                            "top": 0,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                "breakType": 1,
                "pageNumber": 2,
                "sections": [
                  {
                    "columns": [
                      {
                        "lines": [
                          {
                            "divideCount": 1,
                            "lineIndex": 0,
                            "paragraphIndex": 7,
                            "top": 0,
                          },
                          {
                            "divideCount": 1,
                            "lineIndex": 1,
                            "paragraphIndex": 7,
                            "top": 90,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
            "rendered": [
              {
                "breakType": 0,
                "pageNumber": 1,
                "sections": [
                  {
                    "columns": [
                      {
                        "lines": [
                          {
                            "divideCount": 1,
                            "lineIndex": 0,
                            "paragraphIndex": 7,
                            "top": 0,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                "breakType": 1,
                "pageNumber": 2,
                "sections": [
                  {
                    "columns": [
                      {
                        "lines": [
                          {
                            "divideCount": 1,
                            "lineIndex": 0,
                            "paragraphIndex": 7,
                            "top": 0,
                          },
                          {
                            "divideCount": 1,
                            "lineIndex": 1,
                            "paragraphIndex": 7,
                            "top": 90,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          }
        `);
    });

    it('does not duplicate a rendered page boundary already reached by an earlier paragraph', () => {
        const overflowingParagraph = 'One two three four five six seven eight nine ten '.repeat(8);
        const beforeBreak = 'Short paragraph';
        const breakParagraph = `${beforeBreak}${DataStreamTreeTokenType.PAGE_BREAK}After`;
        const renderedBreakIndex = overflowingParagraph.length + 1 + beforeBreak.length;
        const testBed = createSectionLayoutTestBed([overflowingParagraph, breakParagraph], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 120 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                renderedPageBreaks: [renderedBreakIndex],
            },
        });
        const [firstParagraph, secondParagraph] = testBed.sectionNode.children;
        const firstPages = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                firstParagraph.content!,
                testBed.viewModel,
                firstParagraph,
                testBed.sectionBreakConfig
            ),
            testBed.curPage,
            firstParagraph,
            testBed.sectionBreakConfig,
            null
        );
        const secondPages = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                secondParagraph.content!,
                testBed.viewModel,
                secondParagraph,
                testBed.sectionBreakConfig
            ),
            firstPages.at(-1)!,
            secondParagraph,
            testBed.sectionBreakConfig,
            null
        );

        expect(firstPages.length).toBeGreaterThan(1);
        expect(firstPages.at(-1)?.sections.some((section) =>
            section.columns.some((column) => !column.isFull)
        )).toBe(true);
        expect(secondPages).toHaveLength(1);
        expect(paragraphLines(secondPages[0], secondParagraph.endIndex).length).toBeGreaterThan(0);
    });

    it('exposes cell-local rendered page breaks to the outer table paginator', () => {
        const beforeBreak = 'Before';
        const content = `${beforeBreak}${DataStreamTreeTokenType.PAGE_BREAK}After`;
        const testBed = createParagraphLayoutTestBed(content, {
            documentStyle: { documentFlavor: DocumentFlavor.TRADITIONAL },
            body: {
                renderedPageBreaks: [beforeBreak.length],
                tables: [{ startIndex: 0, endIndex: content.length, tableId: 'table-1' }],
            },
        });

        const result = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                testBed.paragraphNode.content!,
                testBed.viewModel,
                testBed.paragraphNode,
                testBed.sectionBreakConfig
            ),
            testBed.curPage,
            testBed.paragraphNode,
            testBed.sectionBreakConfig,
            null
        );

        expect(result).toHaveLength(2);
    });

    it.each([
        { name: 'modern', flavor: DocumentFlavor.MODERN },
        { name: 'unspecified', flavor: DocumentFlavor.UNSPECIFIED },
    ])('does not apply Word-compatible paragraph pagination to $name documents', ({ name, flavor }) => {
        const contents = ['First', 'Second'];
        const firstEnd = contents[0].length;
        const secondEnd = firstEnd + 1 + contents[1].length;
        const testBed = createSectionLayoutTestBed(contents, {
            documentStyle: {
                documentFlavor: flavor,
            },
            body: {
                paragraphs: [
                    { startIndex: firstEnd, paragraphId: `${name}-first` },
                    {
                        startIndex: secondEnd,
                        paragraphId: `${name}-second`,
                        paragraphStyle: {
                            pageBreakBefore: BooleanNumber.TRUE,
                            keepLines: BooleanNumber.TRUE,
                            keepNext: BooleanNumber.TRUE,
                            widowControl: BooleanNumber.TRUE,
                        },
                    },
                ],
            },
        });
        const [firstParagraph, secondParagraph] = testBed.sectionNode.children;
        const firstPages = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                firstParagraph.content!,
                testBed.viewModel,
                firstParagraph,
                testBed.sectionBreakConfig
            ),
            testBed.curPage,
            firstParagraph,
            testBed.sectionBreakConfig,
            null
        );
        const result = lineBreaking(
            testBed.ctx,
            testBed.viewModel,
            shaping(
                testBed.ctx,
                secondParagraph.content!,
                testBed.viewModel,
                secondParagraph,
                testBed.sectionBreakConfig
            ),
            firstPages.at(-1)!,
            secondParagraph,
            testBed.sectionBreakConfig,
            null
        );

        expect(firstPages).toHaveLength(1);
        expect(result).toHaveLength(1);
        expect(paragraphLines(result[0], firstParagraph.endIndex).length).toBeGreaterThan(0);
        expect(paragraphLines(result[0], secondParagraph.endIndex).length).toBeGreaterThan(0);
    });

    it('advances pageBreakBefore past every column on the current physical page', () => {
        const contents = ['First column', 'New physical page'];
        const firstEnd = contents[0].length;
        const secondEnd = firstEnd + 1 + contents[1].length;
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                paragraphs: [
                    { startIndex: firstEnd, paragraphId: 'first-column' },
                    {
                        startIndex: secondEnd,
                        paragraphId: 'new-physical-page',
                        paragraphStyle: { pageBreakBefore: BooleanNumber.TRUE },
                    },
                ],
                sectionBreaks: [{
                    sectionId: 'two-column-section',
                    startIndex: secondEnd + 1,
                    columnProperties: [
                        { width: 170, paddingEnd: 20 },
                        { width: 170, paddingEnd: 0 },
                    ],
                }],
            },
        });
        const [firstParagraph, secondParagraph] = sectionNode.children;
        const firstPages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, firstParagraph.content!, viewModel, firstParagraph, sectionBreakConfig),
            curPage,
            firstParagraph,
            sectionBreakConfig,
            null
        );
        const result = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, secondParagraph.content!, viewModel, secondParagraph, sectionBreakConfig),
            firstPages.at(-1)!,
            secondParagraph,
            sectionBreakConfig,
            null
        );

        expect(result).toHaveLength(2);
        expect(paragraphLines(result[0], secondParagraph.endIndex)).toHaveLength(0);
        expect(paragraphLines(result[1], secondParagraph.endIndex).length).toBeGreaterThan(0);
        expect(result[0].sections[0].columns).toHaveLength(2);
    });

    it('DOCX golden e2e moves a split keepLines paragraph when it fits on an empty page', () => {
        const contents = ['Filler filler filler filler', 'One two three four five'];
        const firstEnd = contents[0].length;
        const secondEnd = firstEnd + 1 + contents[1].length;
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                paragraphs: [
                    { startIndex: firstEnd, paragraphId: 'filler' },
                    {
                        startIndex: secondEnd,
                        paragraphId: 'kept',
                        paragraphStyle: { keepLines: BooleanNumber.TRUE },
                    },
                ],
            },
        });
        const [firstParagraph, secondParagraph] = sectionNode.children;
        const firstPages = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, firstParagraph.content!, viewModel, firstParagraph, sectionBreakConfig),
            curPage,
            firstParagraph,
            sectionBreakConfig,
            null
        );
        const result = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, secondParagraph.content!, viewModel, secondParagraph, sectionBreakConfig),
            firstPages[firstPages.length - 1],
            secondParagraph,
            sectionBreakConfig,
            null
        );

        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(paragraphLines(result[0], secondParagraph.endIndex)).toHaveLength(0);
        expect(paragraphLines(result[1], secondParagraph.endIndex).length).toBeGreaterThan(1);
    });

    it('keeps a heading tail with the following paragraph when the pair fits on an empty page', () => {
        const contents = [
            'Prefix prefix prefix prefix prefix prefix',
            'Heading',
            'Following paragraph words',
        ];
        let offset = 0;
        const paragraphs = contents.map((content, index) => {
            offset += content.length;
            const paragraph = {
                startIndex: offset,
                paragraphId: `paragraph-${index}`,
                ...(index === 1
                    ? { paragraphStyle: { keepNext: BooleanNumber.TRUE } }
                    : {}),
            };
            offset += 1;
            return paragraph;
        });
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: { paragraphs },
        });

        let currentPage = curPage;
        let lastResult: IDocumentSkeletonPage[] = [curPage];
        for (const paragraph of sectionNode.children) {
            lastResult = lineBreaking(
                ctx,
                viewModel,
                shaping(ctx, paragraph.content!, viewModel, paragraph, sectionBreakConfig),
                currentPage,
                paragraph,
                sectionBreakConfig,
                null
            );
            currentPage = lastResult[lastResult.length - 1];
        }

        const headingIndex = sectionNode.children[1].endIndex;
        const followingIndex = sectionNode.children[2].endIndex;
        expect(lastResult.length).toBeGreaterThanOrEqual(2);
        expect(paragraphLines(lastResult[0], headingIndex)).toHaveLength(0);
        expect(paragraphLines(lastResult[1], headingIndex).length).toBeGreaterThan(0);
        expect(paragraphLines(lastResult[1], followingIndex).length).toBeGreaterThan(0);
    });

    it('DOCX golden e2e moves a bounded keepNext chain and stops at a manual break', () => {
        const contents = [
            'Prefix prefix prefix prefix prefix prefix',
            'Heading one',
            'Heading two',
            'Following paragraph words',
        ];
        let offset = 0;
        const paragraphs = contents.map((content, index) => {
            offset += content.length;
            const paragraph = {
                startIndex: offset,
                paragraphId: `keep-chain-${index}`,
                ...(index === 1 || index === 2
                    ? { paragraphStyle: { keepNext: BooleanNumber.TRUE } }
                    : {}),
            };
            offset += 1;
            return paragraph;
        });
        const testBed = createSectionLayoutTestBed(contents, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 220, height: 100 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: { paragraphs },
        });

        let currentPage = testBed.curPage;
        let result = [currentPage];
        for (const paragraph of testBed.sectionNode.children) {
            result = lineBreaking(
                testBed.ctx,
                testBed.viewModel,
                shaping(
                    testBed.ctx,
                    paragraph.content!,
                    testBed.viewModel,
                    paragraph,
                    testBed.sectionBreakConfig
                ),
                currentPage,
                paragraph,
                testBed.sectionBreakConfig,
                null
            );
            currentPage = result.at(-1)!;
        }
        for (const paragraph of testBed.sectionNode.children.slice(1)) {
            expect(paragraphLines(result[0], paragraph.endIndex)).toHaveLength(0);
            expect(paragraphLines(result[1], paragraph.endIndex).length).toBeGreaterThan(0);
        }

        const manualContent = `After${DataStreamTreeTokenType.PAGE_BREAK}break`;
        const manualBed = createSectionLayoutTestBed(['Heading', manualContent], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                paragraphs: [
                    {
                        startIndex: 'Heading'.length,
                        paragraphId: 'manual-heading',
                        paragraphStyle: { keepNext: BooleanNumber.TRUE },
                    },
                    {
                        startIndex: 'Heading'.length + 1 + manualContent.length,
                        paragraphId: 'manual-following',
                    },
                ],
            },
        });
        const [manualHeading, manualFollowing] = manualBed.sectionNode.children;
        const headingPages = lineBreaking(
            manualBed.ctx,
            manualBed.viewModel,
            shaping(
                manualBed.ctx,
                manualHeading.content!,
                manualBed.viewModel,
                manualHeading,
                manualBed.sectionBreakConfig
            ),
            manualBed.curPage,
            manualHeading,
            manualBed.sectionBreakConfig,
            null
        );
        const manualResult = lineBreaking(
            manualBed.ctx,
            manualBed.viewModel,
            shaping(
                manualBed.ctx,
                manualFollowing.content!,
                manualBed.viewModel,
                manualFollowing,
                manualBed.sectionBreakConfig
            ),
            headingPages.at(-1)!,
            manualFollowing,
            manualBed.sectionBreakConfig,
            null
        );
        expect(paragraphLines(manualResult[0], manualHeading.endIndex).length).toBeGreaterThan(0);
    });

    it('caps keepNext look-behind at 32 paragraphs for an oversized chain', () => {
        const headings = Array.from({ length: 40 }, (_, index) => `H${index}`);
        const contents = [
            'Prefix '.repeat(10),
            ...headings,
            'Following paragraph words '.repeat(8),
        ];
        let offset = 0;
        const paragraphs = contents.map((content, index) => {
            offset += content.length;
            const paragraph = {
                startIndex: offset,
                paragraphId: `bounded-chain-${index}`,
                ...(index > 0 && index <= headings.length
                    ? { paragraphStyle: { keepNext: BooleanNumber.TRUE } }
                    : {}),
            };
            offset += 1;
            return paragraph;
        });
        const testBed = createSectionLayoutTestBed(contents, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 140, height: 640 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: { paragraphs },
        });

        let currentPage = testBed.curPage;
        let result = [currentPage];
        for (const paragraph of testBed.sectionNode.children) {
            result = lineBreaking(
                testBed.ctx,
                testBed.viewModel,
                shaping(
                    testBed.ctx,
                    paragraph.content!,
                    testBed.viewModel,
                    paragraph,
                    testBed.sectionBreakConfig
                ),
                currentPage,
                paragraph,
                testBed.sectionBreakConfig,
                null
            );
            currentPage = result.at(-1)!;
        }

        expect(result.length).toBeGreaterThanOrEqual(2);
        expect(testBed.ctx.paginationMetrics?.keepNextScanCount).toBeLessThanOrEqual(32);
        expect(testBed.ctx.paginationMetrics?.retryCount).toBeLessThanOrEqual(contents.length);
    });

    it('DOCX golden e2e avoids a single natural widow line and lets oversized keepLines paragraphs terminate', () => {
        const content = 'One two three four five six seven eight nine ten eleven twelve';
        const widowBed = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 85 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'widow',
                    paragraphStyle: { widowControl: BooleanNumber.TRUE },
                }],
            },
        });
        const widowResult = lineBreaking(
            widowBed.ctx,
            widowBed.viewModel,
            shaping(
                widowBed.ctx,
                widowBed.paragraphNode.content!,
                widowBed.viewModel,
                widowBed.paragraphNode,
                widowBed.sectionBreakConfig
            ),
            widowBed.curPage,
            widowBed.paragraphNode,
            widowBed.sectionBreakConfig,
            null
        );
        const widowCounts = widowResult.map((page) =>
            paragraphLines(page, widowBed.paragraphNode.endIndex).length);
        expect(widowCounts.filter(Boolean)).not.toContain(1);

        const oversizedContent = content.repeat(4);
        const oversizedBed = createParagraphLayoutTestBed(oversizedContent, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                pageSize: { width: 120, height: 85 },
                marginTop: 20,
                marginBottom: 20,
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                paragraphs: [{
                    startIndex: oversizedContent.length,
                    paragraphId: 'oversized',
                    paragraphStyle: { keepLines: BooleanNumber.TRUE },
                }],
            },
        });
        const oversizedResult = lineBreaking(
            oversizedBed.ctx,
            oversizedBed.viewModel,
            shaping(
                oversizedBed.ctx,
                oversizedBed.paragraphNode.content!,
                oversizedBed.viewModel,
                oversizedBed.paragraphNode,
                oversizedBed.sectionBreakConfig
            ),
            oversizedBed.curPage,
            oversizedBed.paragraphNode,
            oversizedBed.sectionBreakConfig,
            null
        );
        expect(oversizedResult.length).toBeGreaterThan(2);
        expect(oversizedResult.every((page) =>
            paragraphLines(page, oversizedBed.paragraphNode.endIndex).length > 0)).toBe(true);
    });

    it('DOCX golden e2e does not soften a manual page break with keep or widow constraints', () => {
        const content = `Before${DataStreamTreeTokenType.PAGE_BREAK}After`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'manual-break',
                    paragraphStyle: {
                        keepLines: BooleanNumber.TRUE,
                        keepNext: BooleanNumber.TRUE,
                        widowControl: BooleanNumber.TRUE,
                    },
                }],
            },
        });
        const result = lineBreaking(
            ctx,
            viewModel,
            shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig),
            curPage,
            paragraphNode,
            sectionBreakConfig,
            null
        );

        expect(result).toHaveLength(2);
        expect(paragraphLines(result[0], paragraphNode.endIndex).length).toBeGreaterThan(0);
        expect(paragraphLines(result[1], paragraphNode.endIndex).length).toBeGreaterThan(0);
    });

    it('keeps pagination checkpoints bounded and produces a deterministic structure', () => {
        const runLayout = () => {
            const contents = [
                'Prefix prefix prefix prefix prefix prefix',
                'Heading',
                'Following paragraph words',
            ];
            let offset = 0;
            const paragraphs = contents.map((content, index) => {
                offset += content.length;
                const paragraph = {
                    startIndex: offset,
                    paragraphId: `deterministic-${index}`,
                    ...(index === 1
                        ? { paragraphStyle: { keepNext: BooleanNumber.TRUE } }
                        : {}),
                };
                offset += 1;
                return paragraph;
            });
            const testBed = createSectionLayoutTestBed(contents, {
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
                    pageSize: { width: 120, height: 100 },
                    marginTop: 20,
                    marginBottom: 20,
                    marginLeft: 20,
                    marginRight: 20,
                },
                body: { paragraphs },
            });
            let currentPage = testBed.curPage;
            let result = [currentPage];
            for (const paragraph of testBed.sectionNode.children) {
                result = lineBreaking(
                    testBed.ctx,
                    testBed.viewModel,
                    shaping(
                        testBed.ctx,
                        paragraph.content!,
                        testBed.viewModel,
                        paragraph,
                        testBed.sectionBreakConfig
                    ),
                    currentPage,
                    paragraph,
                    testBed.sectionBreakConfig,
                    null
                );
                currentPage = result.at(-1)!;
            }
            return {
                signature: paginationSignature(result),
                metrics: testBed.ctx.paginationMetrics!,
                paragraphCount: testBed.sectionNode.children.length,
            };
        };

        const first = runLayout();
        const second = runLayout();

        expect(second.signature).toEqual(first.signature);
        expect(first.signature).toEqual([
            {
                pageNumber: 2,
                breakType: 0,
                sections: [{
                    columns: [{
                        lines: [
                            { paragraphIndex: 41, lineIndex: 0, top: 0, divideCount: 1 },
                            { paragraphIndex: 41, lineIndex: 1, top: 14, divideCount: 1 },
                        ],
                    }],
                }],
            },
            {
                pageNumber: 3,
                breakType: 0,
                sections: [{
                    columns: [{
                        lines: [
                            { paragraphIndex: 49, lineIndex: 0, top: 0, divideCount: 1 },
                            { paragraphIndex: 75, lineIndex: 1, top: 14, divideCount: 1 },
                            { paragraphIndex: 75, lineIndex: 2, top: 28, divideCount: 1 },
                            { paragraphIndex: 75, lineIndex: 3, top: 42, divideCount: 1 },
                        ],
                    }],
                }],
            },
        ]);
        expect(first.metrics.noConstraintParagraphs).toBeGreaterThan(0);
        expect(first.metrics.constrainedParagraphs).toBeGreaterThan(0);
        expect(first.metrics.retryCount).toBeLessThanOrEqual(first.paragraphCount);
        expect(first.metrics.keepNextScanCount).toBeLessThanOrEqual(32);
        expect(first.metrics.measuredLineCount).toBeGreaterThanOrEqual(first.metrics.movedLineCount);
        expect(first.metrics.peakCheckpointLineCount).toBeLessThanOrEqual(first.metrics.measuredLineCount);
    });

    it('reserves bottom-border clearance when paragraph spacing is smaller', () => {
        const content = 'Rule';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    paragraphStyle: {
                        spaceBelow: { v: 0 },
                        borderBottom: {
                            color: { rgb: '#cdd0d8' },
                            padding: 5,
                            width: 2,
                        },
                    },
                }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const paragraphConfig = ctx.paragraphConfigCache.get(curPage.segmentId)?.get(paragraphNode.endIndex);
        expect(paragraphConfig?.paragraphStyle?.spaceBelow?.v).toBe(6);
    });

    it('lays out longer text that may span multiple lines', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('This is a longer text that should still fit within a reasonable page width for testing purposes');
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('handles bullet list paragraphs', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('List item', {
            body: {
                dataStream: 'List item\r\n',
                textRuns: [{ st: 0, ed: 11, ts: {} }],
                paragraphs: [{
                    startIndex: 9,
                    bullet: {
                        listId: 'list-1',
                        listType: 'test-list',
                        nestingLevel: 0,
                    },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1020', startIndex: 10 }],
            },
            lists: {
                'test-list': {
                    listType: 'test-list',
                    nestingLevel: [{
                        bulletAlignment: 1,
                        glyphFormat: '%1.',
                        startNumber: 1,
                        glyphType: 0,
                    }],
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('aligns wrapped list lines with the body text after the hanging marker', () => {
        const content = 'A wrapped list item with enough text to continue';
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                pageSize: { width: 160, height: 600 },
                marginLeft: 20,
                marginRight: 20,
            },
            body: {
                paragraphs: [{
                    startIndex: content.length,
                    bullet: {
                        listId: 'list-1',
                        listType: 'test-list',
                        nestingLevel: 0,
                    },
                }],
            },
            lists: {
                'test-list': {
                    listType: 'test-list',
                    nestingLevel: [{
                        bulletAlignment: 1,
                        glyphFormat: '•',
                        startNumber: 1,
                        glyphType: 0,
                        paragraphProperties: {
                            hanging: { v: 21 },
                            indentStart: { v: 21 },
                        },
                    }],
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = paragraphLines(result[0], paragraphNode.endIndex);

        expect(lines.length).toBeGreaterThan(1);
        expect(lines[0].divides[0].left).toBe(0);
        expect(lines.slice(1).map((line) => line.divides[0].left)).toEqual(
            Array.from({ length: lines.length - 1 }, () => 21)
        );
    });

    it('handles empty shaped text list', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed('');

        const result = lineBreaking(ctx, viewModel, [], curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBe(1);
    });

    it('keeps top-bottom custom blocks in the positioned drawing bucket', () => {
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(DataStreamTreeTokenType.CUSTOM_BLOCK, {
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'b1' }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
            },
            drawings: {
                b1: {
                    drawingId: 'b1',
                    layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 100, height: 120 },
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const paragraphConfig = ctx.paragraphConfigCache.get(curPage.segmentId)?.get(paragraphNode.endIndex);
        expect(paragraphConfig?.paragraphInlineSkeDrawings?.has('b1')).toBe(false);
        expect(paragraphConfig?.paragraphNonInlineSkeDrawings?.has('b1')).toBe(true);

        const line = curPage.sections[0].columns[0].lines[0];
        expect(line.lineHeight).toBeLessThan(120);

        const drawing = curPage.skeDrawings.get('b1');
        expect(drawing?.height).toBe(120);
    });

    it('does not multiply an inline drawing height when it follows text', () => {
        const content = `Before${DataStreamTreeTokenType.CUSTOM_BLOCK}after`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 6, blockId: 'inline-shape' }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
            },
            drawings: {
                'inline-shape': {
                    drawingId: 'inline-shape',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        positionH: {},
                        positionV: {},
                        size: { width: 100, height: 96 },
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const line = curPage.sections[0].columns[0].lines[0];
        expect(line.contentHeight).toBeCloseTo(96);
        expect(line.lineHeight).toBeCloseTo(96);
    });

    it.each([
        PositionedObjectLayoutType.WRAP_SQUARE,
        PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
    ])('starts flow text after a positioned-only anchor line for layout %s', (layoutType) => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}Hello world`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'b1' }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
            },
            drawings: {
                b1: {
                    drawingId: 'b1',
                    layoutType,
                    wrapText: WrapTextType.BOTH_SIDES,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 100, height: 120 },
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        const lines = result.flatMap((page) => page.sections)
            .flatMap((section) => section.columns)
            .flatMap((column) => column.lines);
        const anchorLine = lines.find((line) => line.divides.some((divide) =>
            divide.glyphGroup.some((glyph) => glyph.drawingId === 'b1')
        ));
        const textLine = lines.find((line) => line.divides
            .flatMap((divide) => divide.glyphGroup)
            .map((glyph) => glyph.content)
            .join('')
            .includes('Hello'));

        expect(anchorLine).toBeDefined();
        expect(textLine).toBeDefined();
        expect(textLine).not.toBe(anchorLine);
        expect(textLine!.contentHeight).toBeGreaterThan(0.01);
    });

    it('uses measured custom block viewport height to push following paragraphs', () => {
        setDocsCustomBlockRenderViewportProvider(() => ({
            contentHeight: 240,
            contentWidth: 160,
            height: 240,
            viewportHeight: 120,
            width: 160,
        }));

        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed([DataStreamTreeTokenType.CUSTOM_BLOCK, 'After block'], {
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'b1' }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 400, height: 1200 },
            },
            drawings: {
                b1: {
                    drawingId: 'b1',
                    layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 160, height: 80 },
                    },
                },
            },
        });
        const [blockParagraph, textParagraph] = sectionNode.children;
        const blockShapedTextList = shaping(ctx, blockParagraph.content!, viewModel, blockParagraph, sectionBreakConfig);
        const afterBlockPages = lineBreaking(ctx, viewModel, blockShapedTextList, curPage, blockParagraph, sectionBreakConfig, null);
        const textShapedTextList = shaping(ctx, textParagraph.content!, viewModel, textParagraph, sectionBreakConfig);
        const result = lineBreaking(ctx, viewModel, textShapedTextList, afterBlockPages[afterBlockPages.length - 1], textParagraph, sectionBreakConfig, null);

        const page = result[0];
        const drawing = page.skeDrawings.get('b1');
        const textLine = page.sections[0].columns[0].lines.find((line) => line.paragraphIndex === textParagraph.endIndex);

        expect(drawing?.height).toBe(240);
        expect(textLine?.top).toBeGreaterThanOrEqual((drawing?.aTop ?? 0) + (drawing?.height ?? 0));
    });

    it('keeps inline custom block height when the paragraph terminator relayouts its line', () => {
        const content = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'b1' }],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                gridType: GridType.LINES,
                linePitch: 20.8,
            },
            drawings: {
                b1: {
                    drawingId: 'b1',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        angle: 0,
                        size: { width: 200, height: 316.8 },
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        const line = paragraphLines(result[0], paragraphNode.endIndex)[0];

        expect(line.contentHeight).toBeCloseTo(316.8, 4);
        expect(line.lineHeight).toBeCloseTo(316.8, 4);
    });

    it('ignores custom blocks that reference missing drawings', () => {
        const content = `A${DataStreamTreeTokenType.CUSTOM_BLOCK}B`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 1, blockId: 'missing' }],
            },
            drawings: {},
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('DOCX golden e2e honors page breaks in paragraphs that only contain floating custom blocks', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.PAGE_BREAK}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [
                    { startIndex: 0, blockId: 'cover-background' },
                    { startIndex: 1, blockId: 'cover-title' },
                ],
            },
            drawings: {
                'cover-background': {
                    drawingId: 'cover-background',
                    layoutType: 1,
                    docTransform: {
                        size: { width: 400, height: 600 },
                        positionH: {},
                        positionV: {},
                    },
                },
                'cover-title': {
                    layoutType: 1,
                    docTransform: {
                        size: { width: 200, height: 80 },
                        positionH: {},
                        positionV: {},
                    },
                },
            },
        });
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText: (value: string) => ({
                        width: value.length * 8,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 4,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 4,
                    }),
                }),
            }),
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(2);
        expect(result[1].breakType).toBe(1);
    });

    it('keeps floating custom blocks after a page break on the next page', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.PAGE_BREAK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [
                    { startIndex: 0, blockId: 'cover-background' },
                    { startIndex: 2, blockId: 'checklist-panel' },
                ],
            },
            drawings: {
                'cover-background': {
                    drawingId: 'cover-background',
                    layoutType: 1,
                    docTransform: {
                        size: { width: 400, height: 600 },
                        positionH: {},
                        positionV: {},
                    },
                },
                'checklist-panel': {
                    drawingId: 'checklist-panel',
                    layoutType: 1,
                    docTransform: {
                        size: { width: 200, height: 120 },
                        positionH: {},
                        positionV: {},
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(2);
        expect(result[0].skeDrawings.has('cover-background')).toBe(true);
        expect(result[0].skeDrawings.has('checklist-panel')).toBe(false);
        expect(result[1].skeDrawings.has('cover-background')).toBe(false);
        expect(result[1].skeDrawings.has('checklist-panel')).toBe(true);
    });

    it('DOCX golden e2e keeps every floating custom block on its side of a page break', () => {
        const firstPageIds = Array.from({ length: 15 }, (_, index) => `cover-${index + 1}`);
        const secondPageIds = Array.from({ length: 14 }, (_, index) => `content-${index + 1}`);
        const drawingIds = [...firstPageIds, ...secondPageIds];
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK.repeat(firstPageIds.length)}${DataStreamTreeTokenType.PAGE_BREAK}${DataStreamTreeTokenType.CUSTOM_BLOCK.repeat(secondPageIds.length)}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: drawingIds.map((blockId, startIndex) => ({ startIndex: startIndex < firstPageIds.length ? startIndex : startIndex + 1, blockId })),
            },
            drawings: Object.fromEntries(
                drawingIds.map((drawingId, index) => [
                    drawingId,
                    {
                        drawingId,
                        layoutType: 1,
                        docTransform: {
                            size: { width: 100 + index, height: 40 + index },
                            positionH: { posOffset: 10 + index },
                            positionV: { posOffset: 20 + index },
                            angle: 0,
                        },
                    },
                ])
            ),
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(2);
        expect([...result[0].skeDrawings.keys()].sort()).toEqual([...firstPageIds].sort());
        expect([...result[1].skeDrawings.keys()].sort()).toEqual([...secondPageIds].sort());
    });

    it('keeps inline custom blocks after adjacent floating blocks before a page break', () => {
        const content = `Intro${DataStreamTreeTokenType.CUSTOM_BLOCK.repeat(6)}${DataStreamTreeTokenType.PAGE_BREAK}`;
        const drawingIds = ['float-left', 'float-right', 'inline-map-left', 'float-frame-left', 'inline-map-right', 'float-frame-right'];
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: drawingIds.map((blockId, index) => ({ startIndex: 5 + index, blockId })),
            },
            drawings: {
                'float-left': {
                    drawingId: 'float-left',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    docTransform: {
                        size: { width: 80, height: 40 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 10 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 120 },
                    },
                },
                'float-right': {
                    drawingId: 'float-right',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    docTransform: {
                        size: { width: 80, height: 40 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 180 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 120 },
                    },
                },
                'inline-map-left': {
                    drawingId: 'inline-map-left',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: {},
                        positionV: {},
                        angle: 0,
                    },
                },
                'float-frame-left': {
                    drawingId: 'float-frame-left',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 20 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 180 },
                    },
                },
                'inline-map-right': {
                    drawingId: 'inline-map-right',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: {},
                        positionV: {},
                        angle: 0,
                    },
                },
                'float-frame-right': {
                    drawingId: 'float-frame-right',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 170 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, posOffset: 180 },
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        updateInlineDrawingCoordsAndBorder(ctx, result);

        const inlineMapLeft = result[0].skeDrawings.get('inline-map-left');
        const inlineMapRight = result[0].skeDrawings.get('inline-map-right');

        expect(inlineMapLeft).toMatchObject({ width: 120, height: 90 });
        expect(inlineMapRight).toMatchObject({ width: 120, height: 90 });
        expect(inlineMapRight?.lineTop).toBeGreaterThanOrEqual(inlineMapLeft?.lineTop ?? 0);
        if (inlineMapRight?.lineTop === inlineMapLeft?.lineTop) {
            expect(inlineMapRight?.aLeft).toBeGreaterThan(inlineMapLeft?.aLeft ?? 0);
        }
    });

    it('places an oversized inline custom block in the usable divide after a paragraph-relative wrap drawing', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [
                    { startIndex: 0, blockId: 'inline-photo' },
                    { startIndex: 1, blockId: 'left-wrap' },
                ],
            },
            drawings: {
                'inline-photo': {
                    drawingId: 'inline-photo',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        size: { width: 120, height: 80 },
                        positionH: {},
                        positionV: {},
                        angle: 0,
                    },
                },
                'left-wrap': {
                    drawingId: 'left-wrap',
                    layoutType: PositionedObjectLayoutType.WRAP_TIGHT,
                    behindDoc: 1,
                    wrapText: WrapTextType.BOTH_SIDES,
                    docTransform: {
                        size: { width: 50, height: 180 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 1.25 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 1.25 },
                        angle: 0,
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        updateInlineDrawingCoordsAndBorder(ctx, result);

        const inlinePhoto = result[0].skeDrawings.get('inline-photo');
        const leftWrap = result[0].skeDrawings.get('left-wrap');

        expect(inlinePhoto?.aLeft).toBeGreaterThanOrEqual((leftWrap?.aLeft ?? 0) + (leftWrap?.width ?? 0));
    });

    it('DOCX golden e2e keeps an inline drawing on the same page as an adjacent top-bottom floating drawing in the same paragraph', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [
                    { startIndex: 0, blockId: 'floating-contract-page' },
                    { startIndex: 1, blockId: 'inline-contract-page' },
                ],
            },
            drawings: {
                'floating-contract-page': {
                    drawingId: 'floating-contract-page',
                    layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
                    docTransform: {
                        size: { width: 160, height: 300 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 20 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 20 },
                        angle: 0,
                    },
                },
                'inline-contract-page': {
                    drawingId: 'inline-contract-page',
                    layoutType: PositionedObjectLayoutType.INLINE,
                    docTransform: {
                        size: { width: 160, height: 300 },
                        positionH: {},
                        positionV: {},
                        angle: 0,
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        updateInlineDrawingCoordsAndBorder(ctx, result);

        expect(result).toHaveLength(1);
        expect(result[0].skeDrawings.has('floating-contract-page')).toBe(true);
        expect(result[0].skeDrawings.has('inline-contract-page')).toBe(true);
        const floatingDrawing = result[0].skeDrawings.get('floating-contract-page')!;
        const inlineDrawing = result[0].skeDrawings.get('inline-contract-page')!;
        expect(inlineDrawing.aTop).toBeGreaterThanOrEqual(floatingDrawing.aTop + floatingDrawing.height);
    });

    it('does not move a zero-width wrap-none floating anchor to a new page at the page bottom', () => {
        const content = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'behind-picture' }],
            },
            drawings: {
                'behind-picture': {
                    drawingId: 'behind-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        const column = curPage.sections[0].columns[0];
        const previousLine = {
            lineHeight: 0,
            top: curPage.sections[0].height - 0.1,
            paragraphIndex: 0,
            lineIndex: 0,
            divides: [],
            parent: column,
        };
        column.lines.push(previousLine as any);
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(1);
        expect(result[0].skeDrawings.has('behind-picture')).toBe(true);
        expect(result[0].skeDrawings.get('behind-picture')).toMatchObject({
            width: 120,
            height: 90,
        });
        const lines = result[0].sections[0].columns[0].lines;
        expect(lines[lines.length - 1].lineHeight).toBe(0);
    });

    it('keeps consecutive zero-width wrap-none floating anchors on a non-flow line', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [
                    { startIndex: 0, blockId: 'behind-picture-1' },
                    { startIndex: 1, blockId: 'behind-picture-2' },
                ],
            },
            drawings: {
                'behind-picture-1': {
                    drawingId: 'behind-picture-1',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
                'behind-picture-2': {
                    drawingId: 'behind-picture-2',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 80, height: 60 },
                        positionH: { posOffset: 40 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 20 },
                        angle: 0,
                    },
                },
            },
        });
        const [shapedText] = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const firstGlyph = shapedText.glyphs[0];
        const secondGlyph = { ...firstGlyph, drawingId: 'behind-picture-2' };
        const shapedTextList = [
            { ...shapedText, text: DataStreamTreeTokenType.CUSTOM_BLOCK, glyphs: [firstGlyph] },
            { ...shapedText, text: DataStreamTreeTokenType.CUSTOM_BLOCK, glyphs: [secondGlyph] },
        ];

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(1);
        expect(result[0].skeDrawings.has('behind-picture-1')).toBe(true);
        expect(result[0].skeDrawings.has('behind-picture-2')).toBe(true);
        expect(result[0].sections[0].columns[0].lines[0].lineHeight).toBe(0);
    });

    it('positions oversized behind-doc wrap-none anchors with negative Word offsets', () => {
        const content = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'cover-background' }],
            },
            drawings: {
                'cover-background': {
                    drawingId: 'cover-background',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 1895.68, height: 1280.81 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: -603.2 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: -96.89 },
                        angle: 0,
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(1);
        expect(result[0].skeDrawings.get('cover-background')).toMatchObject({
            width: 1895.68,
            height: 1280.81,
            aTop: expect.closeTo(-96.89, 2),
        });
    });

    it('positions page-relative full-page behind-doc anchors at the page origin', () => {
        const content = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'cover-background' }],
            },
            drawings: {
                'cover-background': {
                    drawingId: 'cover-background',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 400, height: 600 },
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, align: AlignTypeH.CENTER },
                        positionV: { relativeFrom: ObjectRelativeFromV.PAGE, align: AlignTypeV.TOP },
                        angle: 0,
                    },
                },
            },
        });
        curPage.pageWidth = 400;
        curPage.pageHeight = 600;
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(1);
        expect(result[0].skeDrawings.get('cover-background')).toMatchObject({
            aLeft: 0,
            aTop: 0,
            width: 400,
            height: 600,
        });
    });

    it('keeps DOCX manual line breaks in the same page instead of treating them as column breaks', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}PROGRAM${DataStreamTreeTokenType.COLUMN_BREAK}SECOND`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'cover-background' }],
            },
            drawings: {
                'cover-background': {
                    drawingId: 'cover-background',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 400, height: 600 },
                        positionH: { posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText: (value: string) => ({
                        width: value.length * 8,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 4,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 4,
                    }),
                }),
            }),
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result).toHaveLength(1);
        const lines = result[0].sections[0].columns[0].lines;
        const textLines = lines.map((line) => line.divides
            .flatMap((divide) => divide.glyphGroup)
            .map((glyph) => glyph.content)
            .join(''));
        expect(textLines.findIndex((line) => line.includes('PROGRAM')))
            .not
            .toBe(textLines.findIndex((line) => line.includes('SECOND')));
        const renderedText = lines
            .flatMap((line) => line.divides)
            .flatMap((divide) => divide.glyphGroup)
            .map((glyph) => glyph.content)
            .join('');
        expect(renderedText).toContain('PROGRAM');
        expect(renderedText).toContain('SECOND');
    });

    it('treats marked DOCX column breaks as column breaks in traditional documents', () => {
        const content = `FIRST${DataStreamTreeTokenType.COLUMN_BREAK}SECOND`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customRanges: [{
                    startIndex: 5,
                    endIndex: 5,
                    rangeId: 'docx-break-0',
                    rangeType: 5,
                    wholeEntity: true,
                    properties: { breakType: 'column' },
                }],
                sectionBreaks: [{ sectionId: 'section_fixture_1021', startIndex: content.length + 1, columnProperties: [
                    { width: 170, paddingEnd: 20 },
                    { width: 170, paddingEnd: 0 },
                ] }],
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const firstColumnText = result[0].sections[0].columns[0].lines
            .flatMap((line) => line.divides)
            .flatMap((divide) => divide.glyphGroup)
            .map((glyph) => glyph.content)
            .join('');
        const secondColumnText = result[0].sections[0].columns[1].lines
            .flatMap((line) => line.divides)
            .flatMap((divide) => divide.glyphGroup)
            .map((glyph) => glyph.content)
            .join('');

        expect(firstColumnText).toContain('FIRST');
        expect(firstColumnText).not.toContain('SECOND');
        expect(secondColumnText).toContain('SECOND');
    });

    it('DOCX golden e2e wraps second-column text around a drawing anchored below a preceding section', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}FIRST${DataStreamTreeTokenType.COLUMN_BREAK}ments without duplicating content in the body`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'cross-column' }],
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'cross-column-wrap-paragraph',
                    paragraphStyle: { horizontalAlign: HorizontalAlign.JUSTIFIED },
                }],
                customRanges: [{
                    startIndex: 6,
                    endIndex: 6,
                    rangeId: 'cross-column-break',
                    rangeType: 5,
                    wholeEntity: true,
                    properties: { breakType: 'column' },
                }],
                sectionBreaks: [{
                    sectionId: 'section_fixture_cross_column_wrap',
                    startIndex: content.length + 1,
                    columnProperties: [
                        { width: 170, paddingEnd: 20 },
                        { width: 170, paddingEnd: 0 },
                    ],
                }],
            },
            drawings: {
                'cross-column': {
                    drawingId: 'cross-column',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    wrapText: WrapTextType.BOTH_SIDES,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 8 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 100, height: 96 },
                    },
                },
            },
        });
        curPage.sections[0].top = 70;
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);
        const secondColumn = result[0].sections[0].columns[1];
        const textDivides = secondColumn.lines
            .flatMap((line) => line.divides)
            .filter((divide) => divide.glyphGroup.some((glyph) => glyph.content && glyph.content !== DataStreamTreeTokenType.PARAGRAPH));

        expect(result[0].skeDrawings.get('cross-column')).toMatchObject({ aLeft: 198, aTop: 70, width: 100 });
        expect(textDivides.length).toBeGreaterThan(0);
        expect(textDivides.every((divide) => divide.width > 8)).toBe(true);
        expect(textDivides.map((divide) => divide.glyphGroup.map((glyph) => glyph.content).join('')).join(''))
            .toContain('ments without duplicating content in the body');
    });

    it('relayouts an earlier column covered by a top-bottom drawing anchored in a later column', () => {
        const content = `LEFT${DataStreamTreeTokenType.COLUMN_BREAK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 5, blockId: 'cross-column-top-bottom' }],
                customRanges: [{
                    startIndex: 4,
                    endIndex: 4,
                    rangeId: 'cross-column-top-bottom-break',
                    rangeType: 5,
                    wholeEntity: true,
                    properties: { breakType: 'column' },
                }],
                sectionBreaks: [{
                    sectionId: 'section_fixture_cross_column_top_bottom',
                    startIndex: content.length + 1,
                    columnProperties: [
                        { width: 170, paddingEnd: 20 },
                        { width: 170, paddingEnd: 0 },
                    ],
                }],
            },
            drawings: {
                'cross-column-top-bottom': {
                    drawingId: 'cross-column-top-bottom',
                    layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
                    docTransform: {
                        angle: 0,
                        positionH: { relativeFrom: ObjectRelativeFromH.PAGE, posOffset: 20 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        size: { width: 100, height: 96 },
                    },
                },
            },
        });
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        expect(ctx.isDirty).toBe(true);
        expect(ctx.layoutStartPointer['']).toBe(paragraphNode.endIndex);
    });

    it('starts normal text on a new flow line after a zero-width wrap-none floating anchor', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}Hello`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'behind-picture' }],
            },
            drawings: {
                'behind-picture': {
                    drawingId: 'behind-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        vi.stubGlobal('document', {
            createElement: () => ({
                getContext: () => ({
                    font: '',
                    textBaseline: 'alphabetic',
                    measureText: (value: string) => ({
                        width: value.length * 8,
                        fontBoundingBoxAscent: 10,
                        fontBoundingBoxDescent: 4,
                        actualBoundingBoxAscent: 10,
                        actualBoundingBoxDescent: 4,
                    }),
                }),
            }),
        });
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const allGlyphs = shapedTexts.flatMap(({ glyphs }) => glyphs);
        const anchorGlyph = allGlyphs.find((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK)!;
        const textGlyphs = allGlyphs
            .filter((glyph) => glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK)
            .map((glyph) => ({
                ...glyph,
                width: glyph.content === 'H' || glyph.content === 'e' || glyph.content === 'l' || glyph.content === 'o' ? 8 : glyph.width,
                bBox: glyph.content === 'H' || glyph.content === 'e' || glyph.content === 'l' || glyph.content === 'o'
                    ? { ...glyph.bBox, ba: 10, bd: 4 }
                    : glyph.bBox,
            }));
        const shapedText = shapedTexts[0];
        const shapedTextList = [
            { ...shapedText, text: DataStreamTreeTokenType.CUSTOM_BLOCK, glyphs: [anchorGlyph] },
            { ...shapedText, text: 'Hello', glyphs: textGlyphs },
        ];

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const lines = result[0].sections[0].columns[0].lines;
        expect(result).toHaveLength(1);
        expect(result[0].skeDrawings.has('behind-picture')).toBe(true);
        expect(lines[0].lineHeight).toBe(0);
        expect(lines[0].divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.drawingId))).toContain('behind-picture');
        expect(lines[1].lineHeight).toBeGreaterThan(0);
        expect(lines[1].divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content)).join('')).toContain('Hello');
    });

    it('positions DOCX column-relative floating anchors from the paragraph indent origin', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}Body`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                marginLeft: 0,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'left-picture' }],
                paragraphs: [{
                    startIndex: content.length,
                    paragraphId: 'indented',
                    paragraphStyle: {
                        indentStart: { v: 737 },
                    },
                }],
            },
            drawings: {
                'left-picture': {
                    drawingId: 'left-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: -616 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTexts, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result[0].skeDrawings.get('left-picture')).toMatchObject({
            aLeft: 121,
        });
    });

    it('DOCX golden e2e positions DOCX floating anchors in empty paragraphs from the following text paragraph indent origin', () => {
        const floatingParagraph = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const bodyParagraph = 'Body';
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed([floatingParagraph, bodyParagraph], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                marginLeft: 0,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'left-textbox' }],
                paragraphs: [
                    {
                        startIndex: floatingParagraph.length,
                        paragraphId: 'floating-anchor',
                    },
                    {
                        startIndex: floatingParagraph.length + 1 + bodyParagraph.length,
                        paragraphId: 'indented-body',
                        paragraphStyle: {
                            indentStart: { v: 737 },
                        },
                    },
                ],
            },
            drawings: {
                'left-textbox': {
                    drawingId: 'left-textbox',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: -616 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        curPage.sections[0].columns[0].left = 113;
        const paragraphNode = sectionNode.children.find((node) => node.blocks?.includes(1)) ?? sectionNode.children[0];
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTexts, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result[0].skeDrawings.get('left-textbox')).toMatchObject({
            aLeft: 121,
        });
    });

    it('positions DOCX positive column-relative floating anchors from the following text paragraph indent origin', () => {
        const floatingParagraph = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const bodyParagraph = 'Body';
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed([floatingParagraph, bodyParagraph], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                marginLeft: 0,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'scroll-picture' }],
                paragraphs: [
                    {
                        startIndex: floatingParagraph.length,
                        paragraphId: 'floating-anchor',
                    },
                    {
                        startIndex: floatingParagraph.length + 1 + bodyParagraph.length,
                        paragraphId: 'indented-body',
                        paragraphStyle: {
                            indentStart: { v: 737 },
                        },
                    },
                ],
            },
            drawings: {
                'scroll-picture': {
                    drawingId: 'scroll-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 33 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        curPage.sections[0].columns[0].left = 113;
        const paragraphNode = sectionNode.children.find((node) => node.blocks?.includes(1)) ?? sectionNode.children[0];
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTexts, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result[0].skeDrawings.get('scroll-picture')).toMatchObject({
            aLeft: 770,
        });
    });

    it('subtracts page margin from DOCX paragraph-origin column anchors stored in the skeleton', () => {
        const floatingParagraph = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const bodyParagraph = 'Body';
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed([floatingParagraph, bodyParagraph], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                marginLeft: 113,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'scroll-picture' }],
                paragraphs: [
                    {
                        startIndex: floatingParagraph.length,
                        paragraphId: 'floating-anchor',
                    },
                    {
                        startIndex: floatingParagraph.length + 1 + bodyParagraph.length,
                        paragraphId: 'indented-body',
                        paragraphStyle: {
                            indentStart: { v: 737 },
                        },
                    },
                ],
            },
            drawings: {
                'scroll-picture': {
                    drawingId: 'scroll-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 33 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        const paragraphNode = sectionNode.children.find((node) => node.blocks?.includes(1)) ?? sectionNode.children[0];
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTexts, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result[0].skeDrawings.get('scroll-picture')).toMatchObject({
            aLeft: 657,
        });
    });

    it('does not borrow a distant following paragraph indent for DOCX column anchors', () => {
        const floatingParagraph = DataStreamTreeTokenType.CUSTOM_BLOCK;
        const bodyParagraph = 'Body';
        const signatureParagraph = 'Signature';
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed([floatingParagraph, bodyParagraph, signatureParagraph], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
                marginLeft: 113,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'cover-picture' }],
                paragraphs: [
                    {
                        startIndex: floatingParagraph.length,
                        paragraphId: 'floating-anchor',
                    },
                    {
                        startIndex: floatingParagraph.length + 1 + bodyParagraph.length,
                        paragraphId: 'body',
                    },
                    {
                        startIndex: floatingParagraph.length + 1 + bodyParagraph.length + 1 + signatureParagraph.length,
                        paragraphId: 'signature',
                        paragraphStyle: {
                            indentStart: { v: 330.4 },
                        },
                    },
                ],
            },
            drawings: {
                'cover-picture': {
                    drawingId: 'cover-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_SQUARE,
                    behindDoc: 0,
                    docTransform: {
                        size: { width: 795, height: 382 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: -75.6 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        const paragraphNode = sectionNode.children.find((node) => node.blocks?.includes(0)) ?? sectionNode.children[0];
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTexts, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result[0].skeDrawings.get('cover-picture')).toMatchObject({
            aLeft: -75.6,
        });
    });

    it('keeps DOCX leading floating anchors in text paragraphs on their own column origin', () => {
        const floatingParagraph = `${DataStreamTreeTokenType.CUSTOM_BLOCK}Body`;
        const indentedContinuation = 'Continuation';
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed([floatingParagraph, indentedContinuation], {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'left-picture' }],
                paragraphs: [
                    {
                        startIndex: floatingParagraph.length,
                        paragraphId: 'floating-with-text-anchor',
                    },
                    {
                        startIndex: floatingParagraph.length + 1 + indentedContinuation.length,
                        paragraphId: 'indented-continuation',
                        paragraphStyle: {
                            indentStart: { v: 737 },
                        },
                    },
                ],
            },
            drawings: {
                'left-picture': {
                    drawingId: 'left-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: -616 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        const paragraphNode = sectionNode.children[0];
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        const result = lineBreaking(ctx, viewModel, shapedTexts, curPage, paragraphNode, sectionBreakConfig, null);

        expect(result[0].skeDrawings.get('left-picture')).toMatchObject({
            aLeft: -616,
        });
    });

    it('starts normal text on a new flow line when the zero-width floating anchor line has paragraph terminators', () => {
        const content = `${DataStreamTreeTokenType.CUSTOM_BLOCK}Hello`;
        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(content, {
            documentStyle: {
                documentFlavor: DocumentFlavor.TRADITIONAL,
            },
            body: {
                customBlocks: [{ startIndex: 0, blockId: 'behind-picture' }],
            },
            drawings: {
                'behind-picture': {
                    drawingId: 'behind-picture',
                    layoutType: PositionedObjectLayoutType.WRAP_NONE,
                    behindDoc: 1,
                    docTransform: {
                        size: { width: 120, height: 90 },
                        positionH: { posOffset: 0 },
                        positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
                        angle: 0,
                    },
                },
            },
        });
        const shapedTexts = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);
        const allGlyphs = shapedTexts.flatMap(({ glyphs }) => glyphs);
        const anchorGlyph = allGlyphs.find((glyph) => glyph.streamType === DataStreamTreeTokenType.CUSTOM_BLOCK)!;
        const terminatorGlyphs = allGlyphs.filter((glyph) =>
            glyph.streamType === DataStreamTreeTokenType.PARAGRAPH ||
            glyph.streamType === DataStreamTreeTokenType.SECTION_BREAK
        );
        const textGlyphs = allGlyphs
            .filter((glyph) => glyph.streamType !== DataStreamTreeTokenType.CUSTOM_BLOCK)
            .filter((glyph) => glyph.streamType !== DataStreamTreeTokenType.PARAGRAPH)
            .filter((glyph) => glyph.streamType !== DataStreamTreeTokenType.SECTION_BREAK)
            .map((glyph) => ({
                ...glyph,
                width: 8,
                bBox: { ...glyph.bBox, ba: 10, bd: 4 },
            }));
        const shapedText = shapedTexts[0];
        const shapedTextList = [
            { ...shapedText, text: DataStreamTreeTokenType.CUSTOM_BLOCK, glyphs: [anchorGlyph, ...terminatorGlyphs] },
            { ...shapedText, text: 'Hello', glyphs: textGlyphs },
        ];

        const result = lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const lines = result[0].sections[0].columns[0].lines;
        expect(result).toHaveLength(1);
        expect(lines[0].lineHeight).toBe(0);
        expect(lines[0].divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.drawingId))).toContain('behind-picture');
        expect(lines[1].lineHeight).toBeGreaterThan(0);
        expect(lines[1].divides.flatMap((divide) => divide.glyphGroup.map((glyph) => glyph.content)).join('')).toContain('Hello');
    });

    it('applies callout outer spacing as a temporary layout style without mutating the paragraph model', () => {
        const ctx = createContext();
        const paragraphStyle = { indentStart: { v: 60 }, indentEnd: { v: 20 } };
        const paragraph = {
            startIndex: 2,
            paragraphStyle,
        };
        const body = {
            paragraphs: [paragraph],
            blockRanges: [{
                blockId: 'callout-1',
                blockType: DocumentBlockRangeType.CALLOUT,
                startIndex: 0,
                endIndex: 6,
            }],
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 5,
                startIndex: 2,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(5)?.paragraphStyle).toEqual({
            indentStart: { v: 60 },
            indentEnd: { v: 20 },
            lineSpacing: 1.5,
            spaceAbove: { v: 34 },
            spaceBelow: { v: 34 },
        });
        expect(paragraphStyle).toEqual({ indentStart: { v: 60 }, indentEnd: { v: 20 } });
    });

    it('removes bottom outer spacing between adjacent layout block ranges', () => {
        const ctx = createContext();
        const firstCalloutParagraph = {
            startIndex: 1,
            paragraphStyle: {},
        };
        const secondCalloutParagraph = {
            startIndex: 4,
            paragraphStyle: {},
        };
        const body = {
            paragraphs: [firstCalloutParagraph, secondCalloutParagraph],
            blockRanges: [
                {
                    blockId: 'callout-1',
                    blockType: DocumentBlockRangeType.CALLOUT,
                    startIndex: 0,
                    endIndex: 2,
                },
                {
                    blockId: 'quote-1',
                    blockType: DocumentBlockRangeType.QUOTE,
                    startIndex: 3,
                    endIndex: 5,
                },
            ],
        };
        const viewModel = {
            getParagraph: vi.fn(() => firstCalloutParagraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 1,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(1)?.paragraphStyle).toEqual({
            lineSpacing: 1.5,
            spaceAbove: { v: 34 },
        });
    });

    it('applies quote outer spacing with the same temporary layout rule', () => {
        const ctx = createContext();
        const firstParagraphStyle = { indentStart: { v: 22 } };
        const lastParagraphStyle = { indentStart: { v: 22 } };
        const firstParagraph = {
            startIndex: 2,
            paragraphStyle: firstParagraphStyle,
        };
        const lastParagraph = {
            startIndex: 4,
            paragraphStyle: lastParagraphStyle,
        };
        const body = {
            paragraphs: [firstParagraph, lastParagraph],
            blockRanges: [{
                blockId: 'quote-1',
                blockType: DocumentBlockRangeType.QUOTE,
                startIndex: 0,
                endIndex: 6,
            }],
        };
        const viewModel = {
            getParagraph: vi.fn(() => firstParagraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 2,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(2)?.paragraphStyle).toEqual({
            indentStart: { v: 22 },
            lineSpacing: 1.5,
            spaceAbove: { v: 24 },
        });
        expect(firstParagraphStyle).toEqual({ indentStart: { v: 22 } });
    });

    it('applies code outer spacing with the same temporary layout rule', () => {
        const ctx = createContext();
        const paragraphStyle = { indentStart: { v: 20 }, indentEnd: { v: 20 } };
        const paragraph = {
            startIndex: 2,
            paragraphStyle,
        };
        const body = {
            paragraphs: [paragraph],
            blockRanges: [{
                blockId: 'code-1',
                blockType: DocumentBlockRangeType.CODE,
                startIndex: 0,
                endIndex: 6,
            }],
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => body),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 5,
                startIndex: 2,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(5)?.paragraphStyle).toEqual({
            indentStart: { v: 20 },
            indentEnd: { v: 20 },
            lineSpacing: 1.5,
            spaceAbove: { v: 32 },
            spaceBelow: { v: 32 },
        });
        expect(paragraphStyle).toEqual({ indentStart: { v: 20 }, indentEnd: { v: 20 } });
    });

    it('applies comfortable default spacing to normal paragraphs as layout-only style', () => {
        const ctx = createContext();
        const paragraphStyle = {};
        const paragraph = {
            startIndex: 3,
            paragraphStyle,
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => ({
                paragraphs: [paragraph],
            })),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.MODERN,
                },
            })),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 3,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.paragraphStyle).toEqual({
            spaceAbove: { v: 0 },
            lineSpacing: 1.5,
            spaceBelow: { v: 12 },
        });
        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.useWordStyleLineHeight).toBe(true);
        expect(paragraphStyle).toEqual({});
    });

    it('keeps embedded sheet cell documents on their explicit paragraph style only', () => {
        const ctx = createContext();
        const paragraphStyle = {};
        const paragraph = {
            startIndex: 3,
            paragraphStyle,
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => ({
                paragraphs: [paragraph],
            })),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.UNSPECIFIED,
                },
            })),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 3,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.paragraphStyle).toEqual({});
        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.useWordStyleLineHeight).toBe(false);
        expect(paragraphStyle).toEqual({});
    });

    it('keeps traditional documents on explicit paragraph spacing while using Word line height', () => {
        const ctx = createContext();
        const paragraphStyle = {};
        const paragraph = {
            startIndex: 3,
            paragraphStyle,
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => ({
                paragraphs: [paragraph],
            })),
            getSnapshot: vi.fn(() => ({
                documentStyle: {
                    documentFlavor: DocumentFlavor.TRADITIONAL,
                },
            })),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 3,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.paragraphStyle).toEqual({
            widowControl: BooleanNumber.TRUE,
        });
        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.useWordStyleLineHeight).toBe(true);
        expect(paragraphStyle).toEqual({});
    });

    it('keeps embedded sheet rich text documents without a flavor on their explicit paragraph style only', () => {
        const ctx = createContext();
        const paragraphStyle = {};
        const paragraph = {
            startIndex: 3,
            paragraphStyle,
        };
        const viewModel = {
            getParagraph: vi.fn(() => paragraph),
            getBody: vi.fn(() => ({
                paragraphs: [paragraph],
            })),
            getSnapshot: vi.fn(() => ({
                documentStyle: {},
            })),
            getCustomBlock: vi.fn(() => null),
        } as any;

        lineBreaking(
            ctx,
            viewModel,
            [],
            {
                segmentId: 'segment-1',
                pageNumber: 1,
            } as any,
            {
                endIndex: 3,
                startIndex: 0,
                blocks: [],
                children: [],
            } as any,
            {
                lists: [],
                localeService: {} as any,
                drawings: {},
            } as any,
            null
        );

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.paragraphStyle).toEqual({});
        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.useWordStyleLineHeight).toBe(false);
        expect(paragraphStyle).toEqual({});
    });

    it('keeps multiple measured top-bottom custom blocks in document-flow order', () => {
        const heights: Record<string, number> = {
            b1: 19004,
            b2: 5156,
            b3: 405,
        };
        setDocsCustomBlockRenderViewportProvider((_unitId, blockId, input) => {
            const height = heights[blockId];
            if (height == null) {
                return null;
            }

            return {
                contentHeight: height,
                contentWidth: input.fallbackWidth,
                height,
                viewportHeight: Math.min(height, 1123),
                width: input.fallbackWidth,
            };
        });

        const contents = ['Embed host document', 'Inserted line above block', DataStreamTreeTokenType.CUSTOM_BLOCK, DataStreamTreeTokenType.CUSTOM_BLOCK, DataStreamTreeTokenType.CUSTOM_BLOCK];
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
            body: {
                customBlocks: [
                    { startIndex: 46, blockId: 'b1' },
                    { startIndex: 48, blockId: 'b2' },
                    { startIndex: 50, blockId: 'b3' },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 1200, height: Number.POSITIVE_INFINITY },
            },
            drawings: {
                b1: createTopBottomDrawing('b1', 960, 480),
                b2: createTopBottomDrawing('b2', 960, 480),
                b3: createTopBottomDrawing('b3', 720, 405),
            },
        });

        let pages = [curPage];
        for (const paragraph of sectionNode.children) {
            const shapedTextList = shaping(ctx, paragraph.content!, viewModel, paragraph, sectionBreakConfig);
            pages = lineBreaking(ctx, viewModel, shapedTextList, pages[pages.length - 1], paragraph, sectionBreakConfig, null);
        }

        const page = pages[0];
        const sheet = page.skeDrawings.get('b1')!;
        const base = page.skeDrawings.get('b2')!;
        const slide = page.skeDrawings.get('b3')!;

        expect(sheet.height).toBe(19004);
        expect(base.height).toBe(5156);
        expect(slide.height).toBe(405);
        expectDrawingInDocumentFlowOrder(pages, ['b1', 'b2', 'b3']);
    });

    it('keeps consecutive measured top-bottom custom blocks in document-flow order on finite pages', () => {
        const heights: Record<string, number> = {
            b1: 19004,
            b2: 5156,
            b3: 405,
        };
        setDocsCustomBlockRenderViewportProvider((_unitId, blockId, input) => {
            const height = heights[blockId];
            if (height == null) {
                return null;
            }

            return {
                contentHeight: height,
                contentWidth: input.fallbackWidth,
                height,
                viewportHeight: Math.min(height, 923),
                width: input.fallbackWidth,
            };
        });

        const contents = ['Embed host document', DataStreamTreeTokenType.CUSTOM_BLOCK, DataStreamTreeTokenType.CUSTOM_BLOCK, DataStreamTreeTokenType.CUSTOM_BLOCK];
        const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
            body: {
                customBlocks: [
                    { startIndex: 20, blockId: 'b1' },
                    { startIndex: 22, blockId: 'b2' },
                    { startIndex: 24, blockId: 'b3' },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 1200, height: 960 },
            },
            drawings: {
                b1: createTopBottomDrawing('b1', 960, 480),
                b2: createTopBottomDrawing('b2', 960, 480),
                b3: createTopBottomDrawing('b3', 720, 405),
            },
        });

        let pages = [curPage];
        for (const paragraph of sectionNode.children) {
            const shapedTextList = shaping(ctx, paragraph.content!, viewModel, paragraph, sectionBreakConfig);
            pages = lineBreaking(ctx, viewModel, shapedTextList, pages[pages.length - 1], paragraph, sectionBreakConfig, null);
        }

        const drawings = pages.flatMap((page) => [...page.skeDrawings.values()]);
        const lines = pages.flatMap((page) => page.sections.flatMap((section) => section.columns.flatMap((column) => column.lines)));
        const sheet = drawings.find((drawing) => drawing.drawingId === 'b1')!;
        const base = drawings.find((drawing) => drawing.drawingId === 'b2')!;
        const slide = drawings.find((drawing) => drawing.drawingId === 'b3')!;
        const slideLine = lines.find((line) => line.divides.some((divide) => divide.glyphGroup.some((glyph) => glyph.drawingId === 'b3')))!;

        expect(sheet.height).toBe(19004);
        expect(base.height).toBe(5156);
        expect(slide.height).toBe(405);
        expect(slide.aTop).toBeGreaterThanOrEqual(slideLine.top);
        expectDrawingInDocumentFlowOrder(pages, ['b1', 'b2', 'b3']);
    });

    it('does not collapse adjacent top-bottom custom blocks in the same paragraph', () => {
        const heights: Record<string, number> = {
            b1: 300,
            b2: 200,
            b3: 100,
        };
        setDocsCustomBlockRenderViewportProvider((_unitId, blockId, input) => {
            const height = heights[blockId];
            if (height == null) {
                return null;
            }

            return {
                contentHeight: height,
                contentWidth: input.fallbackWidth,
                height,
                viewportHeight: height,
                width: input.fallbackWidth,
            };
        });

        const { viewModel, ctx, paragraphNode, sectionBreakConfig, curPage } = createParagraphLayoutTestBed(
            `${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}${DataStreamTreeTokenType.CUSTOM_BLOCK}`,
            {
                body: {
                    customBlocks: [
                        { startIndex: 0, blockId: 'b1' },
                        { startIndex: 1, blockId: 'b2' },
                        { startIndex: 2, blockId: 'b3' },
                    ],
                },
                documentStyle: {
                    documentFlavor: DocumentFlavor.MODERN,
                    pageSize: { width: 1200, height: Number.POSITIVE_INFINITY },
                },
                drawings: {
                    b1: createTopBottomDrawing('b1', 960, 480),
                    b2: createTopBottomDrawing('b2', 960, 480),
                    b3: createTopBottomDrawing('b3', 720, 405),
                },
            }
        );
        const shapedTextList = shaping(ctx, paragraphNode.content!, viewModel, paragraphNode, sectionBreakConfig);

        lineBreaking(ctx, viewModel, shapedTextList, curPage, paragraphNode, sectionBreakConfig, null);

        const sheet = curPage.skeDrawings.get('b1')!;
        const base = curPage.skeDrawings.get('b2')!;
        const slide = curPage.skeDrawings.get('b3')!;

        expect(sheet.height).toBe(300);
        expect(base.aTop).toBeGreaterThanOrEqual(sheet.aTop + sheet.height);
        expect(slide.aTop).toBeGreaterThanOrEqual(base.aTop + base.height);
    });

    it('overwrites stale measured top-bottom drawing positions during relayout', () => {
        const heights: Record<string, number> = {
            b1: 19004,
            b2: 5156,
            b3: 405,
        };
        setDocsCustomBlockRenderViewportProvider((_unitId, blockId, input) => {
            const height = heights[blockId];
            if (height == null) {
                return null;
            }

            return {
                contentHeight: height,
                contentWidth: input.fallbackWidth,
                height,
                viewportHeight: Math.min(height, 923),
                width: input.fallbackWidth,
            };
        });

        const contents = ['Embed host document', DataStreamTreeTokenType.CUSTOM_BLOCK, DataStreamTreeTokenType.CUSTOM_BLOCK, DataStreamTreeTokenType.CUSTOM_BLOCK];
        const { dataModel, viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
            body: {
                customBlocks: [
                    { startIndex: 20, blockId: 'b1' },
                    { startIndex: 22, blockId: 'b2' },
                    { startIndex: 24, blockId: 'b3' },
                ],
            },
            documentStyle: {
                documentFlavor: DocumentFlavor.MODERN,
                pageSize: { width: 1200, height: 960 },
            },
            drawings: {
                b1: createTopBottomDrawing('b1', 960, 480),
                b2: createTopBottomDrawing('b2', 960, 480),
                b3: createTopBottomDrawing('b3', 720, 405),
            },
        });
        const originDrawings = dataModel.getSnapshot().drawings!;
        curPage.skeDrawings.set('b1', createStaleTopBottomSkeleton('b1', originDrawings.b1, 19040, 19004));
        curPage.skeDrawings.set('b2', createStaleTopBottomSkeleton('b2', originDrawings.b2, 5204, 5156));
        curPage.skeDrawings.set('b3', createStaleTopBottomSkeleton('b3', originDrawings.b3, 465, 405));

        let pages = [curPage];
        for (const paragraph of sectionNode.children) {
            const shapedTextList = shaping(ctx, paragraph.content!, viewModel, paragraph, sectionBreakConfig);
            pages = lineBreaking(ctx, viewModel, shapedTextList, pages[pages.length - 1], paragraph, sectionBreakConfig, null);
        }

        const drawings = pages.flatMap((page) => [...page.skeDrawings.values()]);
        const sheet = drawings.find((drawing) => drawing.drawingId === 'b1')!;
        const base = drawings.find((drawing) => drawing.drawingId === 'b2')!;
        const slide = drawings.find((drawing) => drawing.drawingId === 'b3')!;

        expect(sheet.height).toBe(19004);
        expect(base.height).toBe(5156);
        expect(slide.height).toBe(405);
        expect(sheet.aTop).not.toBe(19040);
        expect(base.aTop).not.toBe(5204);
        expect(slide.aTop).not.toBe(465);
        expectDrawingInDocumentFlowOrder(pages, ['b1', 'b2', 'b3']);
    });

    it('moves measured top-bottom custom block with preceding document-flow content', () => {
        setDocsCustomBlockRenderViewportProvider((_unitId, blockId, input) => {
            if (blockId !== 'b1') {
                return null;
            }

            return {
                contentHeight: 640,
                contentWidth: input.fallbackWidth,
                height: 640,
                viewportHeight: 640,
                width: input.fallbackWidth,
            };
        });

        const layoutBlockTop = (contents: string[], blockParagraphIndex: number) => {
            const startIndex = contents
                .slice(0, blockParagraphIndex)
                .reduce((index, content) => index + content.length + 1, 0);
            const { viewModel, ctx, sectionNode, sectionBreakConfig, curPage } = createSectionLayoutTestBed(contents, {
                body: {
                    customBlocks: [{ startIndex, blockId: 'b1' }],
                },
                documentStyle: {
                    documentFlavor: DocumentFlavor.MODERN,
                    pageSize: { width: 1200, height: Number.POSITIVE_INFINITY },
                },
                drawings: {
                    b1: createTopBottomDrawing('b1', 960, 480),
                },
            });

            let pages = [curPage];
            for (const paragraph of sectionNode.children) {
                const shapedTextList = shaping(ctx, paragraph.content!, viewModel, paragraph, sectionBreakConfig);
                pages = lineBreaking(ctx, viewModel, shapedTextList, pages[pages.length - 1], paragraph, sectionBreakConfig, null);
            }

            return pages[0].skeDrawings.get('b1')!.aTop;
        };

        const originalTop = layoutBlockTop(['Embed host document', DataStreamTreeTokenType.CUSTOM_BLOCK], 1);
        const shiftedTop = layoutBlockTop(['Embed host document', 'Inserted paragraph before block', DataStreamTreeTokenType.CUSTOM_BLOCK], 2);

        expect(shiftedTop).toBeGreaterThan(originalTop);
    });
});

function createTopBottomDrawing(drawingId: string, width: number, height: number) {
    return {
        drawingId,
        layoutType: PositionedObjectLayoutType.WRAP_TOP_AND_BOTTOM,
        docTransform: {
            angle: 0,
            positionH: { relativeFrom: ObjectRelativeFromH.COLUMN, posOffset: 0 },
            positionV: { relativeFrom: ObjectRelativeFromV.PARAGRAPH, posOffset: 0 },
            size: { width, height },
        },
    };
}

function expectDrawingInDocumentFlowOrder(pages: IDocumentSkeletonPage[], drawingIds: string[]) {
    const positions = drawingIds.map((drawingId) => getDrawingLinePosition(pages, drawingId));

    for (let i = 1; i < positions.length; i++) {
        expect(compareDocumentFlowPosition(positions[i - 1], positions[i])).toBeLessThan(0);
    }
}

function getDrawingLinePosition(pages: IDocumentSkeletonPage[], drawingId: string) {
    for (let pageIndex = 0; pageIndex < pages.length; pageIndex++) {
        const page = pages[pageIndex];
        for (let sectionIndex = 0; sectionIndex < page.sections.length; sectionIndex++) {
            const section = page.sections[sectionIndex];
            for (let columnIndex = 0; columnIndex < section.columns.length; columnIndex++) {
                const column = section.columns[columnIndex];
                for (let lineIndex = 0; lineIndex < column.lines.length; lineIndex++) {
                    const line = column.lines[lineIndex];
                    for (let divideIndex = 0; divideIndex < line.divides.length; divideIndex++) {
                        const divide = line.divides[divideIndex];
                        const glyphIndex = divide.glyphGroup.findIndex((glyph) => glyph.drawingId === drawingId);
                        if (glyphIndex > -1) {
                            return { columnIndex, divideIndex, glyphIndex, lineIndex, pageIndex, sectionIndex };
                        }
                    }
                }
            }
        }
    }

    throw new Error(`Missing custom block glyph for drawing "${drawingId}"`);
}

function compareDocumentFlowPosition(
    a: ReturnType<typeof getDrawingLinePosition>,
    b: ReturnType<typeof getDrawingLinePosition>
) {
    return (
        a.pageIndex - b.pageIndex ||
        a.sectionIndex - b.sectionIndex ||
        a.columnIndex - b.columnIndex ||
        a.lineIndex - b.lineIndex ||
        a.divideIndex - b.divideIndex ||
        a.glyphIndex - b.glyphIndex
    );
}

function createStaleTopBottomSkeleton(drawingId: string, drawingOrigin: unknown, aTop: number, height: number) {
    return {
        aLeft: 0,
        aTop,
        angle: 0,
        blockAnchorTop: aTop,
        columnLeft: 0,
        customBlockRenderViewport: { height, viewportHeight: Math.min(height, 923) },
        drawingId,
        drawingOrigin,
        height,
        initialState: true,
        isPageBreak: false,
        lineHeight: 0,
        lineTop: aTop,
        width: 960,
    } as never;
}
