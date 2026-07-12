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
    DataStreamTreeTokenType,
    DocumentBlockRangeType,
    DocumentFlavor,
    ObjectRelativeFromH,
    ObjectRelativeFromV,
    PositionedObjectLayoutType,
    WrapTextType,
} from '@univerjs/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
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

    it('honors page breaks in paragraphs that only contain floating custom blocks', () => {
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

    it('keeps every floating custom block on its side of a page break', () => {
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
        const renderedText = result[0].sections[0].columns[0].lines
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
                    properties: { docxBreakType: 'column' },
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

    it('positions DOCX floating anchors in empty paragraphs from the following text paragraph indent origin', () => {
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

        expect(ctx.paragraphConfigCache.get('segment-1')?.get(3)?.paragraphStyle).toEqual({});
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
