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

import type { INodePosition } from '@univerjs/engine-render';
import { getOffsetRectForDom, setDocsTableRenderViewportProvider } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NodePositionConvertToRectRange } from '../convert-rect-range';
import { RectRange } from '../rect-range';
import {
    getCanvasOffsetByEngine,
    getParagraphInfoByGlyph,
    getRangeListFromSelection,
    getRectRangeFromCharIndex,
    getTextRangeFromCharIndex,
    serializeRectRange,
    serializeTextRange,
} from '../selection-utils';
import { TextRange } from '../text-range';

interface IMockCellPage {
    segmentId: string;
    left: number;
    top: number;
    pageWidth: number;
    width: number;
    height: number;
    sections: Array<{
        columns: Array<{
            lines: unknown[];
        }>;
    }>;
    parent?: unknown;
}

interface IMockRow {
    index: number;
    top: number;
    height: number;
    cells: IMockCellPage[];
    parent?: unknown;
}

function createCellPage(left: number, width: number, segmentId = 'table-1'): IMockCellPage {
    return {
        segmentId,
        left,
        top: 0,
        pageWidth: width,
        width,
        height: 20,
        sections: [{
            columns: [{
                lines: [{
                    divides: [{
                        glyphGroup: [{ count: 1, content: 'A' }],
                    }],
                }],
            }],
        }],
    };
}

function createEmptyCellPage(left: number, width: number, segmentId = 'table-1'): IMockCellPage {
    return {
        segmentId,
        left,
        top: 0,
        pageWidth: width,
        width,
        height: 20,
        sections: [{
            columns: [{
                lines: [],
            }],
        }],
    };
}

function createRectRangeConvertorHarness() {
    const cell00 = createCellPage(0, 200);
    const cell01 = createCellPage(100, 0);
    const cell10 = createCellPage(0, 100);
    const cell11 = createCellPage(100, 100);
    const row0 = { index: 0, top: 0, height: 20, cells: [cell00, cell01] } as never;
    const row1 = { index: 1, top: 20, height: 20, cells: [cell10, cell11] } as never;
    const table = { tableId: 'table-1', top: 0, left: 0, rows: [row0, row1] } as never;
    const page = { skeTables: new Map([['table-1', table]]), marginTop: 0, marginLeft: 0, width: 300, height: 200 } as never;

    (cell00 as { parent?: unknown }).parent = row0;
    (cell01 as { parent?: unknown }).parent = row0;
    (cell10 as { parent?: unknown }).parent = row1;
    (cell11 as { parent?: unknown }).parent = row1;
    (row0 as { parent?: unknown }).parent = table;
    (row1 as { parent?: unknown }).parent = table;

    const skeleton = {
        getSkeletonData: () => ({
            pages: [page],
        }),
        getViewModel: () => ({
            getSnapshot: () => ({
                tableSource: {
                    'table-1': {
                        tableRows: [
                            {
                                tableCells: [
                                    { columnSpan: 2 },
                                    { rowSpan: 0, columnSpan: 0 },
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    {},
                                ],
                            },
                        ],
                    },
                },
            }),
        }),
    };

    return {
        anchor: createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 1]),
        focus: createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 1, 'cells', 1]),
        skeleton,
    };
}

function createVerticalMergeConvertorHarness() {
    const rows = Array.from({ length: 4 }, (_, rowIndex) => {
        const cells = Array.from({ length: 4 }, (_, columnIndex) => createCellPage(columnIndex * 100, 100));
        const row: IMockRow = { index: rowIndex, top: rowIndex * 20, height: 20, cells };
        cells.forEach((cell) => {
            (cell as { parent?: unknown }).parent = row;
        });

        return row;
    });
    const table = { tableId: 'table-1', top: 0, left: 0, rows } as never;
    const page = { skeTables: new Map([['table-1', table]]), marginTop: 0, marginLeft: 0, width: 500, height: 200 } as never;
    rows.forEach((row) => {
        (row as { parent?: unknown }).parent = table;
    });

    const tableNode = {
        children: rows.map((_row, rowIndex) => ({
            children: Array.from({ length: 4 }, (_cell, columnIndex) => ({
                startIndex: rowIndex * 100 + columnIndex * 10,
                endIndex: rowIndex * 100 + columnIndex * 10 + 8,
            })),
        })),
    };
    const findNodePositionByCharIndex = vi.fn((index: number) => createNodePosition(['char', index]));
    const skeleton = {
        getSkeletonData: () => ({
            pages: [page],
        }),
        findCharIndexByPosition: vi
            .fn()
            .mockReturnValueOnce(0)
            .mockReturnValueOnce(999),
        findNodePositionByCharIndex,
        getViewModel: () => ({
            getSnapshot: () => ({
                tableSource: {
                    'table-1': {
                        tableRows: [
                            {
                                tableCells: [
                                    { rowSpan: 3, columnSpan: 2 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    { rowSpan: 0, columnSpan: 0 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    { rowSpan: 0, columnSpan: 0 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    {},
                                    {},
                                    {},
                                ],
                            },
                        ],
                    },
                },
            }),
            findTableNodeById: () => tableNode,
        }),
    };

    return {
        anchor: createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]),
        focus: createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 3, 'cells', 1]),
        findNodePositionByCharIndex,
        skeleton,
    };
}

function createRowSpanMergePointHarness() {
    const rows = Array.from({ length: 4 }, (_, rowIndex) => {
        const cells = Array.from({ length: 4 }, (_cell, columnIndex) => createCellPage(columnIndex * 100, 100));
        const row: IMockRow = { index: rowIndex, top: rowIndex * 20, height: 20, cells };
        cells.forEach((cell) => {
            (cell as { parent?: unknown }).parent = row;
        });

        return row;
    });

    rows[0].cells[1] = createCellPage(100, 200);
    rows[0].cells[2] = createEmptyCellPage(200, 0);
    rows[1].cells[1] = createEmptyCellPage(100, 0);
    rows[1].cells[2] = createEmptyCellPage(200, 0);
    rows[2].cells[1] = createEmptyCellPage(100, 0);
    rows[2].cells[2] = createEmptyCellPage(200, 0);

    rows.forEach((row) => {
        row.cells.forEach((cell) => {
            (cell as { parent?: unknown }).parent = row;
        });
    });

    const table = { tableId: 'table-1', top: 0, left: 0, rows } as never;
    const page = { skeTables: new Map([['table-1', table]]), marginTop: 0, marginLeft: 0, width: 500, height: 200 } as never;
    rows.forEach((row) => {
        (row as { parent?: unknown }).parent = table;
    });

    const skeleton = {
        getSkeletonData: () => ({
            pages: [page],
        }),
        getViewModel: () => ({
            getSnapshot: () => ({
                tableSource: {
                    'table-1': {
                        tableRows: [
                            {
                                tableCells: [
                                    {},
                                    { rowSpan: 3, columnSpan: 2 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    { rowSpan: 0, columnSpan: 0 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    { rowSpan: 0, columnSpan: 0 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    {},
                                    {},
                                    {},
                                ],
                            },
                        ],
                    },
                },
            }),
        }),
    };

    return {
        anchor: createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]),
        focus: createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 2, 'cells', 1]),
        skeleton,
    };
}

vi.mock('@univerjs/engine-render', async (importOriginal) => {
    const actual = await importOriginal<typeof import('@univerjs/engine-render')>();

    return {
        ...actual,
        getOffsetRectForDom: vi.fn(),
    };
});

function createNodePosition(path: Array<string | number>, glyph = 0): INodePosition {
    return {
        path,
        page: 0,
        section: 0,
        column: 0,
        line: 0,
        divide: 0,
        glyph,
        isBack: false,
        segmentPage: -1,
        pageType: 0,
    } as INodePosition;
}

function createGlyphInCell(cellPage: object) {
    return {
        parent: {
            parent: {
                parent: {
                    parent: {
                        parent: cellPage,
                    },
                },
            },
        },
    } as never;
}

function createDocument() {
    return {
        getOffsetConfig: () => ({
            docsLeft: 0,
            docsTop: 0,
        }),
    } as never;
}

describe('selection utils', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        vi.spyOn(TextRange.prototype as unknown as Record<'_anchorBlink', () => void>, '_anchorBlink').mockImplementation(() => {});
        vi.spyOn(TextRange.prototype, 'refresh').mockImplementation(() => {});
        vi.spyOn(RectRange.prototype, 'refresh').mockImplementation(() => {});
    });

    afterEach(() => {
        setDocsTableRenderViewportProvider(null);
        vi.restoreAllMocks();
    });

    it('creates text and rect ranges from char indexes', () => {
        const startPosition = { glyph: 0 };
        const endPosition = { glyph: 1 };
        const skeleton = {
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startPosition)
                .mockReturnValueOnce(endPosition)
                .mockReturnValueOnce(startPosition)
                .mockReturnValueOnce(endPosition),
        } as never;

        const textRange = getTextRangeFromCharIndex(1, 2, {} as never, createDocument(), skeleton, {} as never, '', -1);
        const rectRange = getRectRangeFromCharIndex(1, 2, {} as never, createDocument(), skeleton, {} as never, '', -1);

        expect(textRange).toBeInstanceOf(TextRange);
        expect(textRange?.anchorNodePosition).toEqual(startPosition);
        expect(textRange?.focusNodePosition).toEqual(endPosition);
        expect(rectRange).toBeInstanceOf(RectRange);
        expect(rectRange?.anchorNodePosition).toEqual(startPosition);
        expect(rectRange?.focusNodePosition).toEqual(endPosition);
    });

    it('routes same-cell and rect selections into the expected range buckets', () => {
        const sameCellAnchor = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0]);
        const sameCellFocus = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0], 1);
        const crossPageFocus = createNodePosition(['skeTables', 'table-1#-#1', 'rows', 0, 'cells', 0], 1);
        const rectAnchor = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0]);
        const rectFocus = createNodePosition(['skeTables', 'table-1#-#0', 'rows', 1, 'cells', 0], 1);
        const sameCellPage = {} as { parent?: unknown };
        const sameCellRow = { index: 0, cells: [sameCellPage] };
        sameCellPage.parent = sameCellRow;

        const crossPageStartCell = {} as { parent?: unknown };
        const crossPageStartRow = { index: 0, cells: [crossPageStartCell] };
        crossPageStartCell.parent = crossPageStartRow;

        const crossPageEndCell = {} as { parent?: unknown };
        const crossPageEndRow = { index: 0, cells: [crossPageEndCell] };
        crossPageEndCell.parent = crossPageEndRow;

        const skeleton = {
            findGlyphByPosition: vi
                .fn()
                .mockReturnValueOnce(createGlyphInCell(sameCellPage))
                .mockReturnValueOnce(createGlyphInCell(sameCellPage))
                .mockReturnValueOnce(createGlyphInCell(crossPageStartCell))
                .mockReturnValueOnce(createGlyphInCell(crossPageEndCell))
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(null),
        } as never;
        const document = createDocument();

        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([
            {
                anchor: rectAnchor,
                focus: rectFocus,
            },
        ] as never);

        const sameCell = getRangeListFromSelection(sameCellAnchor, sameCellFocus, {} as never, document, skeleton, {} as never, '', -1);
        expect(sameCell?.textRanges).toHaveLength(1);
        expect(sameCell?.rectRanges).toHaveLength(0);
        expect(sameCell?.textRanges[0]).toBeInstanceOf(TextRange);

        const sameTable = getRangeListFromSelection(sameCellAnchor, crossPageFocus, {} as never, document, skeleton, {} as never, '', -1);
        expect(sameTable?.textRanges).toHaveLength(0);
        expect(sameTable?.rectRanges).toHaveLength(1);
        expect(sameTable?.rectRanges[0]).toBeInstanceOf(RectRange);

        const rectRange = getRangeListFromSelection(rectAnchor, rectFocus, {} as never, document, skeleton, {} as never, '', -1);
        expect(rectRange?.textRanges).toHaveLength(0);
        expect(rectRange?.rectRanges).toHaveLength(1);
        expect(rectRange?.rectRanges[0]).toBeInstanceOf(RectRange);
    });

    it('expands core rect selection records to cover intersecting merged cells', () => {
        const { anchor, focus, skeleton } = createRectRangeConvertorHarness();
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result).toMatchObject({
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            tableId: 'table-1',
        });
    });

    it('keeps merge-expanded rect selection as one range to avoid overlapping highlights', () => {
        const { anchor, focus, findNodePositionByCharIndex, skeleton } = createVerticalMergeConvertorHarness();
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const groups = convertor.getNodePositionGroup(anchor, focus);

        expect(groups).toEqual([{ anchor, focus }]);
        expect(findNodePositionByCharIndex).not.toHaveBeenCalled();
    });

    it('draws row-spanning merged cells as full merged rectangles without row gaps', () => {
        const { anchor, focus, skeleton } = createRowSpanMergePointHarness();
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result).toMatchObject({
            startRow: 0,
            endRow: 2,
            startColumn: 0,
            endColumn: 2,
        });
        expect(result?.pointGroup).toHaveLength(1);
        expect(result?.pointGroup[0]).toEqual([
            { x: 0, y: 0 },
            { x: 300, y: 0 },
            { x: 300, y: 60 },
            { x: 0, y: 60 },
            { x: 0, y: 0 },
        ]);
    });

    it('draws a full row-spanning merge when the drag only reaches its first row', () => {
        const { anchor, skeleton } = createRowSpanMergePointHarness();
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 1]);
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result).toMatchObject({
            startRow: 0,
            endRow: 2,
            startColumn: 0,
            endColumn: 2,
        });
        expect(result?.pointGroup).toHaveLength(1);
        expect(result?.pointGroup[0]).toEqual([
            { x: 0, y: 0 },
            { x: 300, y: 0 },
            { x: 300, y: 60 },
            { x: 0, y: 60 },
            { x: 0, y: 0 },
        ]);
    });

    it('draws merge-expanded rect selection as one solid rectangle', () => {
        const { anchor, focus, skeleton } = createVerticalMergeConvertorHarness();
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result?.pointGroup).toHaveLength(1);
        expect(result?.pointGroup[0]).toEqual([
            { x: 0, y: 0 },
            { x: 200, y: 0 },
            { x: 200, y: 80 },
            { x: 0, y: 80 },
            { x: 0, y: 0 },
        ]);
    });

    it('clips table rect selection to the horizontal render viewport', () => {
        const { anchor, focus, skeleton } = createRowSpanMergePointHarness();
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 400,
                scrollLeft: 150,
                viewportWidth: 200,
            };
        });
        (skeleton as unknown as {
            getViewModel: () => {
                getDataModel: () => {
                    getUnitId: () => string;
                };
                getSnapshot: () => unknown;
            };
        }).getViewModel = () => ({
            getDataModel: () => ({
                getUnitId: () => 'unit-1',
            }),
            getSnapshot: () => ({
                tableSource: {
                    'table-1': {
                        tableRows: [
                            {
                                tableCells: [
                                    {},
                                    { rowSpan: 3, columnSpan: 2 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    { rowSpan: 0, columnSpan: 0 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    { rowSpan: 0, columnSpan: 0 },
                                    { rowSpan: 0, columnSpan: 0 },
                                    {},
                                ],
                            },
                            {
                                tableCells: [
                                    {},
                                    {},
                                    {},
                                    {},
                                ],
                            },
                        ],
                    },
                },
            }),
        });
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result?.pointGroup).toHaveLength(1);
        expect(result?.pointGroup[0]).toEqual([
            { x: 0, y: 0 },
            { x: 150, y: 0 },
            { x: 150, y: 60 },
            { x: 0, y: 60 },
            { x: 0, y: 0 },
        ]);
    });

    it('keeps drags inside one merged cell as text selection', () => {
        const { anchor, skeleton } = createRectRangeConvertorHarness();
        const focus = {
            ...anchor,
            glyph: 1,
        };
        const cellPage = createCellPage(0, 200);
        const row = { index: 0, cells: [cellPage] };
        (cellPage as { parent?: unknown }).parent = row;
        (skeleton as { findGlyphByPosition?: unknown }).findGlyphByPosition = vi.fn(() => createGlyphInCell(cellPage));
        (skeleton as { findCharIndexByPosition?: unknown }).findCharIndexByPosition = vi.fn(() => undefined);

        const result = getRangeListFromSelection(anchor, focus, {} as never, createDocument(), skeleton as never, {} as never, '', -1);

        expect(result?.textRanges).toHaveLength(1);
        expect(result?.textRanges[0]).toBeInstanceOf(TextRange);
        expect(result?.rectRanges).toHaveLength(0);
    });

    it('routes drags from another cell through a merged cell into core rect selection', () => {
        const { anchor: mergedFocus, focus: normalAnchor, skeleton } = createRectRangeConvertorHarness();
        const mergedCellPage = createCellPage(0, 200);
        const normalCellPage = createCellPage(100, 100);
        const mergedRow = { index: 0, cells: [mergedCellPage] };
        const normalRow = { index: 1, cells: [normalCellPage] };
        (mergedCellPage as { parent?: unknown }).parent = mergedRow;
        (normalCellPage as { parent?: unknown }).parent = normalRow;
        (skeleton as { findGlyphByPosition?: unknown }).findGlyphByPosition = vi
            .fn()
            .mockReturnValueOnce(createGlyphInCell(normalCellPage))
            .mockReturnValueOnce(createGlyphInCell(mergedCellPage));
        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([
            {
                anchor: normalAnchor,
                focus: mergedFocus,
            },
        ] as never);

        const result = getRangeListFromSelection(normalAnchor, mergedFocus, {} as never, createDocument(), skeleton as never, {} as never, '', -1);

        expect(result?.textRanges).toHaveLength(0);
        expect(result?.rectRanges).toHaveLength(1);
        expect(result?.rectRanges[0]).toBeInstanceOf(RectRange);
    });

    it('builds normal text ranges outside tables and skips when offsets are missing', () => {
        const startNode = { glyph: 10 };
        const endNode = { glyph: 20 };
        const paragraph = {
            startIndex: 0,
            endIndex: 10,
            children: [],
        };
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(1)
                .mockReturnValueOnce(4)
                .mockReturnValueOnce(null)
                .mockReturnValueOnce(4),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{ children: [paragraph] }],
                }),
            }),
        } as never;

        const result = getRangeListFromSelection(
            createNodePosition(['body']),
            createNodePosition(['body'], 1),
            {} as never,
            createDocument(),
            skeleton,
            {} as never,
            '',
            -1
        );
        expect(result?.textRanges).toHaveLength(1);
        expect(result?.rectRanges).toHaveLength(0);
        expect(result?.textRanges[0]).toBeInstanceOf(TextRange);

        const missing = getRangeListFromSelection(
            createNodePosition(['body']),
            createNodePosition(['body'], 1),
            {} as never,
            createDocument(),
            skeleton,
            {} as never,
            '',
            -1
        );
        expect(missing).toBeUndefined();
    });

    it('reads canvas offsets, paragraph glyph info, and serializes ranges', () => {
        vi.mocked(getOffsetRectForDom).mockReturnValue({ left: 12, top: 34 } as never);

        expect(getCanvasOffsetByEngine({ getCanvasElement: () => ({}) } as never)).toEqual({ left: 12, top: 34 });
        expect(getCanvasOffsetByEngine(null)).toEqual({ left: 0, top: 0 });

        const glyphA: Record<string, unknown> = { count: 1, content: 'A' };
        const glyphB: Record<string, unknown> = { count: 2, content: 'BC' };
        const paragraphLine1 = { paragraphIndex: 1, st: 3, divides: [{ glyphGroup: [glyphA] }] };
        const paragraphLine2 = { paragraphIndex: 1, st: 3, divides: [{ glyphGroup: [glyphB] }] };
        const column = { lines: [paragraphLine1, paragraphLine2] };
        const line = { paragraphIndex: 1, parent: column };
        glyphA.parent = { parent: line };
        glyphB.parent = { parent: line };

        expect(getParagraphInfoByGlyph(glyphB as never)).toEqual({
            st: 3,
            ed: 1,
            content: 'ABC',
            nodeIndex: 2,
        });
        expect(getParagraphInfoByGlyph({ parent: null } as never)).toBeUndefined();

        const textRange = {
            startOffset: 1,
            endOffset: 3,
            collapsed: false,
            rangeType: 'TEXT',
            startNodePosition: { glyph: 0 },
            endNodePosition: { glyph: 1 },
            direction: 'FORWARD',
            segmentId: 'body',
            segmentPage: -1,
            isActive: () => true,
        } as never;
        expect(serializeTextRange(textRange)).toMatchObject({
            startOffset: 1,
            endOffset: 3,
            isActive: true,
            segmentId: 'body',
        });

        const rectRange = {
            startOffset: 1,
            endOffset: 3,
            collapsed: false,
            rangeType: 'RECT',
            startNodePosition: { glyph: 0 },
            endNodePosition: { glyph: 1 },
            direction: 'FORWARD',
            segmentId: 'body',
            segmentPage: -1,
            startRow: 0,
            startColumn: 1,
            endRow: 2,
            endColumn: 3,
            tableId: 'table-1',
            spanEntireRow: true,
            spanEntireColumn: false,
            spanEntireTable: false,
            isActive: () => false,
        } as never;
        expect(serializeRectRange(rectRange)).toMatchObject({
            tableId: 'table-1',
            startRow: 0,
            endColumn: 3,
            isActive: false,
        });
    });
});
