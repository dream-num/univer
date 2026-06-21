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

import { AlignTypeH, AlignTypeV, DataStreamTreeTokenType, DocumentBlockRangeType, DocumentFlavor, ObjectRelativeFromH, ObjectRelativeFromV, PositionedObjectLayoutType } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lineBreaking } from '../linebreaking';
import { shaping } from '../shaping';
import { updateInlineDrawingCoordsAndBorder } from '../../../tools';
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
                sectionBreaks: [{ startIndex: 10 }],
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
        expect(inlineMapRight?.lineTop).toBe(inlineMapLeft?.lineTop);
        expect(inlineMapRight?.aLeft).toBeGreaterThan(inlineMapLeft?.aLeft ?? 0);
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
                sectionBreaks: [{
                    startIndex: content.length + 1,
                    columnProperties: [
                        { width: 170, paddingEnd: 20 },
                        { width: 170, paddingEnd: 0 },
                    ],
                }],
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
});
