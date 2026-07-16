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
import { DataStreamTreeNodeType } from '@univerjs/core';
import { DocumentSkeletonPageType, getOffsetRectForDom, setDocsTableRenderViewportProvider } from '@univerjs/engine-render';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { NodePositionConvertToRectRange } from '../convert-rect-range';
import { convertPositionsToRectRanges, RectRange } from '../rect-range';
import {
    getCanvasOffsetByEngine,
    getParagraphInfoByGlyph,
    getRangeListFromCharIndex,
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
        };

        const textRange = getTextRangeFromCharIndex(1, 2, {} as never, createDocument(), skeleton as never, {} as never, '', -1);
        const rectRange = getRectRangeFromCharIndex(1, 2, {} as never, createDocument(), skeleton as never, {} as never, '', -1);

        expect(textRange).toBeInstanceOf(TextRange);
        expect(textRange?.anchorNodePosition).toEqual(startPosition);
        expect(textRange?.focusNodePosition).toEqual(endPosition);
        expect(rectRange).toBeInstanceOf(RectRange);
        expect(rectRange?.anchorNodePosition).toEqual(startPosition);
        expect(rectRange?.focusNodePosition).toEqual(endPosition);
    });

    it('does not create ranges when a character boundary cannot be resolved', () => {
        const skeleton = {
            findNodePositionByCharIndex: vi.fn(() => undefined),
        };
        const document = createDocument();

        expect(getTextRangeFromCharIndex(1, 2, {} as never, document, skeleton as never, {} as never, '', -1)).toBeUndefined();
        expect(getRectRangeFromCharIndex(1, 2, {} as never, document, skeleton as never, {} as never, '', -1)).toBeUndefined();
        expect(getRangeListFromCharIndex(1, 2, {} as never, document, skeleton as never, {} as never, '', -1)).toBeUndefined();
    });

    it('disposes rect ranges created before a later range fails', () => {
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]);
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 1, 'cells', 0]);
        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([
            { anchor, focus: anchor },
            { anchor: focus, focus },
        ]);
        vi.mocked(RectRange.prototype.refresh)
            .mockReset()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(() => {
                throw new Error('invalid range');
            });
        const dispose = vi.spyOn(RectRange.prototype, 'dispose');

        expect(() => convertPositionsToRectRanges(
            {} as never,
            createDocument(),
            {} as never,
            anchor,
            focus
        )).toThrow('invalid range');
        expect(dispose).toHaveBeenCalledTimes(1);
    });

    it('disposes text ranges created before a later range fails', () => {
        const startNode = createNodePosition(['pages', 0]);
        const middleNode = createNodePosition(['pages', 0], 1);
        const endNode = createNodePosition(['pages', 0], 2);
        const tableStartNode = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]);
        const tableEndNode = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 1]);
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(20),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(tableStartNode)
                .mockReturnValueOnce(tableEndNode)
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(middleNode)
                .mockReturnValueOnce(middleNode)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [{
                            startIndex: 0,
                            endIndex: 20,
                            children: [{
                                nodeType: DataStreamTreeNodeType.TABLE,
                                startIndex: 5,
                                endIndex: 15,
                                children: [],
                            }],
                        }],
                    }],
                }),
            }),
        };
        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([{
            anchor: tableStartNode,
            focus: tableEndNode,
        }]);
        vi.mocked(TextRange.prototype.refresh)
            .mockReset()
            .mockImplementationOnce(() => {})
            .mockImplementationOnce(() => {
                throw new Error('invalid range');
            });
        const disposeTextRange = vi.spyOn(TextRange.prototype, 'dispose');
        const disposeRectRange = vi.spyOn(RectRange.prototype, 'dispose');

        expect(() => getRangeListFromSelection(
            startNode,
            endNode,
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        )).toThrow('invalid range');
        expect(disposeTextRange).toHaveBeenCalledTimes(1);
        expect(disposeRectRange).toHaveBeenCalledTimes(1);
    });

    it('does not treat a column group child as a table', () => {
        const startNode = createNodePosition(['pages', 0]);
        const endNode = createNodePosition(['pages', 0], 1);
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(10),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [{
                            nodeType: DataStreamTreeNodeType.COLUMN_GROUP,
                            startIndex: 0,
                            endIndex: 20,
                            children: [{
                                nodeType: DataStreamTreeNodeType.COLUMN,
                                startIndex: 1,
                                endIndex: 19,
                                children: [],
                            }],
                        }],
                    }],
                }),
            }),
        };

        const result = getRangeListFromSelection(
            createNodePosition(['pages', 0]),
            createNodePosition(['pages', 0], 1),
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        );

        expect(result?.textRanges).toHaveLength(1);
        expect(result?.rectRanges).toHaveLength(0);
    });

    it('splits a body drag across a column group into one range per render page', () => {
        const bodyStart = createNodePosition(['pages', 0]);
        const bodyBeforeColumns = createNodePosition(['pages', 0], 1);
        const firstColumnStart = {
            ...createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page']),
            pageType: DocumentSkeletonPageType.CELL,
        };
        const firstColumnEnd = { ...firstColumnStart, glyph: 1 };
        const secondColumnStart = {
            ...createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 1, 'page']),
            pageType: DocumentSkeletonPageType.CELL,
        };
        const secondColumnEnd = { ...secondColumnStart, glyph: 1 };
        const bodyAfterColumns = createNodePosition(['pages', 0], 2);
        const bodyEnd = createNodePosition(['pages', 0], 3);
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(20),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(bodyStart)
                .mockReturnValueOnce(bodyBeforeColumns)
                .mockReturnValueOnce(firstColumnStart)
                .mockReturnValueOnce(firstColumnEnd)
                .mockReturnValueOnce(secondColumnStart)
                .mockReturnValueOnce(secondColumnEnd)
                .mockReturnValueOnce(bodyAfterColumns)
                .mockReturnValueOnce(bodyEnd),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [
                            { nodeType: DataStreamTreeNodeType.PARAGRAPH, startIndex: 0, endIndex: 2, children: [] },
                            {
                                nodeType: DataStreamTreeNodeType.COLUMN_GROUP,
                                startIndex: 3,
                                endIndex: 14,
                                children: [
                                    { nodeType: DataStreamTreeNodeType.COLUMN, startIndex: 4, endIndex: 8, children: [] },
                                    { nodeType: DataStreamTreeNodeType.COLUMN, startIndex: 9, endIndex: 13, children: [] },
                                ],
                            },
                            { nodeType: DataStreamTreeNodeType.PARAGRAPH, startIndex: 15, endIndex: 20, children: [] },
                        ],
                    }],
                }),
            }),
        };

        const result = getRangeListFromSelection(
            bodyStart,
            bodyEnd,
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        );

        expect(result?.textRanges.map((range) => [range.anchorNodePosition, range.focusNodePosition])).toEqual([
            [bodyStart, bodyBeforeColumns],
            [firstColumnStart, firstColumnEnd],
            [secondColumnStart, secondColumnEnd],
            [bodyAfterColumns, bodyEnd],
        ]);
        expect(result?.rectRanges).toHaveLength(0);
    });

    it('keeps a table inside a selected column as a rect range', () => {
        const bodyStart = createNodePosition(['pages', 0]);
        const bodyBeforeColumns = createNodePosition(['pages', 0], 1);
        const columnStart = {
            ...createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page']),
            pageType: DocumentSkeletonPageType.CELL,
        };
        const columnBeforeTable = { ...columnStart, glyph: 1 };
        const tablePosition = {
            ...createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page', 'skeTables', 'table-1', 'rows', 0, 'cells', 0]),
            pageType: DocumentSkeletonPageType.CELL,
        };
        const columnAfterTable = { ...columnStart, glyph: 2 };
        const columnEnd = { ...columnStart, glyph: 3 };
        const bodyAfterColumns = createNodePosition(['pages', 0], 2);
        const bodyEnd = createNodePosition(['pages', 0], 3);
        const table = {
            nodeType: DataStreamTreeNodeType.TABLE,
            startIndex: 8,
            endIndex: 15,
            children: [{ startIndex: 9, endIndex: 14 }],
        };
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(25),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(bodyStart)
                .mockReturnValueOnce(bodyBeforeColumns)
                .mockReturnValueOnce(columnStart)
                .mockReturnValueOnce(columnBeforeTable)
                .mockReturnValueOnce(tablePosition)
                .mockReturnValueOnce(tablePosition)
                .mockReturnValueOnce(columnAfterTable)
                .mockReturnValueOnce(columnEnd)
                .mockReturnValueOnce(bodyAfterColumns)
                .mockReturnValueOnce(bodyEnd),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [
                            { nodeType: DataStreamTreeNodeType.PARAGRAPH, startIndex: 0, endIndex: 2, children: [] },
                            {
                                nodeType: DataStreamTreeNodeType.COLUMN_GROUP,
                                startIndex: 3,
                                endIndex: 20,
                                children: [{
                                    nodeType: DataStreamTreeNodeType.COLUMN,
                                    startIndex: 4,
                                    endIndex: 19,
                                    children: [{
                                        nodeType: DataStreamTreeNodeType.PARAGRAPH,
                                        startIndex: 5,
                                        endIndex: 18,
                                        children: [table],
                                    }],
                                }],
                            },
                            { nodeType: DataStreamTreeNodeType.PARAGRAPH, startIndex: 21, endIndex: 25, children: [] },
                        ],
                    }],
                }),
            }),
        };
        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([{
            anchor: tablePosition,
            focus: tablePosition,
        }]);

        const result = getRangeListFromSelection(
            bodyStart,
            bodyEnd,
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        );

        expect(result?.textRanges).toHaveLength(4);
        expect(result?.rectRanges).toHaveLength(1);
        expect(result?.rectRanges[0].anchorNodePosition).toBe(tablePosition);
    });

    it('does not create one text range across different header pages', () => {
        const startNode = {
            ...createNodePosition(['pages', 0]),
            pageType: DocumentSkeletonPageType.HEADER,
            segmentPage: 0,
        };
        const endNode = {
            ...createNodePosition(['pages', 1]),
            pageType: DocumentSkeletonPageType.HEADER,
            segmentPage: 1,
        };
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(10),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [{ startIndex: 0, endIndex: 10, children: [] }],
                    }],
                }),
            }),
        };

        const result = getRangeListFromSelection(
            startNode,
            endNode,
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        );

        expect(result).toBeUndefined();
    });

    it('abandons a transient table selection when its end row cannot be resolved', () => {
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(24),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [{
                            startIndex: 0,
                            endIndex: 30,
                            children: [{
                                nodeType: DataStreamTreeNodeType.TABLE,
                                startIndex: 5,
                                endIndex: 25,
                                children: [{ startIndex: 6, endIndex: 10 }],
                            }],
                        }],
                    }],
                }),
            }),
        };

        let result: ReturnType<typeof getRangeListFromSelection>;
        expect(() => {
            result = getRangeListFromSelection(
                createNodePosition(['pages', 0]),
                createNodePosition(['pages', 0], 1),
                {} as never,
                createDocument(),
                skeleton as never,
                {} as never,
                '',
                -1
            );
        }).not.toThrow();
        expect(result).toBeUndefined();
    });

    it('resolves collapsed ranges from the backward character boundary', () => {
        const position = createNodePosition(['pages', 0], 0);
        const skeleton = {
            findNodePositionByCharIndex: vi.fn(() => position),
            findGlyphByPosition: vi.fn(() => null),
            findCharIndexByPosition: vi.fn(() => 5),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{
                        children: [{
                            children: [],
                            endIndex: 8,
                            startIndex: 1,
                        }],
                    }],
                }),
            }),
        };
        const document = createDocument();

        const ranges = getRangeListFromCharIndex(5, 5, {} as never, document, skeleton as never, {} as never, '', -1);

        expect(skeleton.findNodePositionByCharIndex).toHaveBeenNthCalledWith(1, 5, true, '', -1);
        expect(ranges?.textRanges[0].anchorNodePosition).toBe(position);
        expect(ranges?.textRanges[0].focusNodePosition).toBe(position);
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

    it('keeps text selection inside one table cell even when glyph paths differ', () => {
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0, 'sections', 0, 'columns', 0, 'lines', 0, 'divides', 0, 'glyphs', 0]);
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1#-#0', 'rows', 0, 'cells', 0, 'sections', 0, 'columns', 0, 'lines', 1, 'divides', 0, 'glyphs', 3], 3);
        const cellPage = {} as { parent?: unknown };
        const row = { index: 0, cells: [cellPage] };
        cellPage.parent = row;
        const skeleton = {
            findGlyphByPosition: vi
                .fn()
                .mockReturnValueOnce(createGlyphInCell(cellPage))
                .mockReturnValueOnce(createGlyphInCell(cellPage)),
        } as never;

        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([
            {
                anchor,
                focus,
            },
        ] as never);

        const result = getRangeListFromSelection(anchor, focus, {} as never, createDocument(), skeleton, {} as never, '', -1);

        expect(result?.textRanges).toHaveLength(1);
        expect(result?.rectRanges).toHaveLength(0);
        expect(result?.textRanges[0]).toBeInstanceOf(TextRange);
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

    it('keeps header table rect selection points relative to the document offset', () => {
        const rows = Array.from({ length: 3 }, (_, rowIndex) => {
            const cells = Array.from({ length: 3 }, (_cell, columnIndex) => createCellPage(columnIndex * 100, 100, 'header-table-1'));
            const row: IMockRow = { index: rowIndex, top: rowIndex * 34, height: 34, cells };
            cells.forEach((cell) => {
                (cell as { parent?: unknown }).parent = row;
            });

            return row;
        });
        const table = { tableId: 'header-table-1', top: 0, left: 0, width: 300, height: 102, rows } as never;
        rows.forEach((row) => {
            (row as { parent?: unknown }).parent = table;
        });

        const rootPage = {
            headerId: 'header-1',
            marginLeft: 36,
            marginTop: 120,
            pageHeight: 960,
            pageWidth: 720,
            skeTables: new Map(),
        };
        const headerPage = {
            marginTop: 60,
            pageWidth: 720,
            sections: [],
            skeTables: new Map([['header-table-1', table]]),
        };
        const skeleton = {
            getSkeletonData: () => ({
                pages: [rootPage],
                skeFooters: new Map(),
                skeHeaders: new Map([['header-1', new Map([[720, headerPage]])]]),
            }),
            getViewModel: () => ({
                getSnapshot: () => ({
                    tableSource: {
                        'header-table-1': {
                            tableRows: rows.map(() => ({
                                tableCells: [{}, {}, {}],
                            })),
                        },
                    },
                }),
            }),
        };
        const anchor = {
            ...createNodePosition(['skeTables', 'header-table-1', 'rows', 0, 'cells', 0]),
            pageType: 3,
            segmentPage: 0,
        };
        const focus = {
            ...createNodePosition(['skeTables', 'header-table-1', 'rows', 2, 'cells', 0]),
            pageType: 3,
            segmentPage: 0,
        };
        const convertor = new NodePositionConvertToRectRange({
            docsLeft: 360,
            docsTop: 20,
            pageLayoutType: 0,
            pageMarginLeft: 20,
            pageMarginTop: 20,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result?.pointGroup[0]).toEqual([
            { x: 36, y: 60 },
            { x: 136, y: 60 },
            { x: 136, y: 94 },
            { x: 36, y: 94 },
            { x: 36, y: 60 },
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

    it('collapses a first-column input boundary instead of turning it into a cross-column selection', () => {
        const anchor = createNodePosition(['pages', 0, 'skeColumnGroups', 'column-group-1', 'columns', 0, 'page'], 1);
        const focus = createNodePosition(['pages', 0, 'skeColumnGroups', 'column-group-1', 'columns', 1, 'page']);
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(190)
                .mockReturnValueOnce(189),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [],
                }),
            }),
        };

        const result = getRangeListFromSelection(
            anchor,
            focus,
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        );

        expect(result?.textRanges).toHaveLength(1);
        expect(result?.rectRanges).toHaveLength(0);
        expect(result?.textRanges[0].anchorNodePosition).toBe(anchor);
        expect(result?.textRanges[0].focusNodePosition).toBe(anchor);
    });

    it('resolves both endpoints for collapsed text ranges instead of reusing the start node', () => {
        const startNode = createNodePosition(['body', 'collapsed-start'], 10);
        const endNode = createNodePosition(['body', 'collapsed-end'], 11);
        const skeleton = {
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(endNode),
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(5)
                .mockReturnValueOnce(5),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{ children: [{ startIndex: 0, endIndex: 10, children: [] }] }],
                }),
            }),
        };

        const result = getRangeListFromCharIndex(5, 5, {} as never, createDocument(), skeleton as never, {} as never, '', -1);

        expect(result?.textRanges).toHaveLength(1);
        expect(skeleton.findNodePositionByCharIndex).toHaveBeenNthCalledWith(1, 5, true, '', -1);
        expect(skeleton.findNodePositionByCharIndex).toHaveBeenNthCalledWith(2, 5, true, '', -1);
    });

    it('falls back to original boundary positions when the first character index cannot be resolved back to a node', () => {
        const focusPosition = createNodePosition(['body'], 0);
        focusPosition.isBack = true;
        const anchorPosition = createNodePosition(['body'], 4);
        const endNode = createNodePosition(['char', 468], 4);
        const paragraph = {
            startIndex: 0,
            endIndex: 500,
            children: [],
        };
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(468)
                .mockReturnValueOnce(0),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(undefined)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{ children: [paragraph] }],
                }),
            }),
        };

        const result = getRangeListFromSelection(
            anchorPosition,
            focusPosition,
            {} as never,
            createDocument(),
            skeleton as never,
            {} as never,
            '',
            -1
        );

        expect(result?.textRanges).toHaveLength(1);
        expect(result?.textRanges[0].anchorNodePosition).toBe(endNode);
        expect(result?.textRanges[0].focusNodePosition).toBe(focusPosition);
    });

    it('splits a body selection that crosses a table into text and table ranges', () => {
        const anchorPosition = createNodePosition(['body'], 0);
        const focusPosition = createNodePosition(['body'], 1);
        const tableStartPosition = createNodePosition(['table-start']);
        const tableEndPosition = createNodePosition(['table-end']);
        const bodyStartPosition = createNodePosition(['body-start']);
        const bodyBeforeTableEndPosition = createNodePosition(['body-before-table-end']);
        const bodyAfterTableStartPosition = createNodePosition(['body-after-table-start']);
        const bodyEndPosition = createNodePosition(['body-end']);
        const paragraph = {
            startIndex: 0,
            endIndex: 100,
            children: [{
                nodeType: DataStreamTreeNodeType.TABLE,
                startIndex: 20,
                endIndex: 50,
                children: [
                    { startIndex: 20, endIndex: 35 },
                    { startIndex: 36, endIndex: 50 },
                ],
            }],
        };
        const skeleton = {
            findCharIndexByPosition: vi
                .fn()
                .mockReturnValueOnce(0)
                .mockReturnValueOnce(100),
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(tableStartPosition)
                .mockReturnValueOnce(tableEndPosition)
                .mockReturnValueOnce(bodyStartPosition)
                .mockReturnValueOnce(bodyBeforeTableEndPosition)
                .mockReturnValueOnce(bodyAfterTableStartPosition)
                .mockReturnValueOnce(bodyEndPosition),
            getViewModel: () => ({
                getSelfOrHeaderFooterViewModel: () => ({
                    getChildren: () => [{ children: [paragraph] }],
                }),
            }),
        } as never;

        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getNodePositionGroup').mockReturnValue([
            {
                anchor: tableStartPosition,
                focus: tableEndPosition,
            },
        ] as never);

        const result = getRangeListFromSelection(
            anchorPosition,
            focusPosition,
            {} as never,
            createDocument(),
            skeleton,
            {} as never,
            '',
            -1
        );

        expect(result?.textRanges).toHaveLength(2);
        expect(result?.textRanges[0].anchorNodePosition).toBe(bodyStartPosition);
        expect(result?.textRanges[0].focusNodePosition).toBe(bodyBeforeTableEndPosition);
        expect(result?.textRanges[1].anchorNodePosition).toBe(bodyAfterTableStartPosition);
        expect(result?.textRanges[1].focusNodePosition).toBe(bodyEndPosition);
        expect(result?.rectRanges).toHaveLength(1);
        expect(result?.rectRanges[0].anchorNodePosition).toBe(tableStartPosition);
        expect(result?.rectRanges[0].focusNodePosition).toBe(tableEndPosition);
    });

    it('tracks rect range table coverage and updates its highlight shape', () => {
        vi.mocked(RectRange.prototype.refresh).mockRestore();
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]);
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 1, 'cells', 1]);
        const addedObjects: unknown[] = [];
        const scene = {
            addObject: (object: unknown) => {
                addedObjects.push(object);
            },
        } as never;
        const skeleton = {
            findCharIndexByPosition: (position: INodePosition) => position === anchor ? 10 : 20,
            getViewModel: () => ({
                getSnapshot: () => ({
                    tableSource: {
                        'table-1': {
                            tableColumns: [{}, {}],
                            tableRows: [{}, {}],
                        },
                    },
                }),
            }),
        } as never;
        vi.spyOn(NodePositionConvertToRectRange.prototype, 'getRangePointData').mockReturnValue({
            pointGroup: [[
                { x: 0, y: 0 },
                { x: 200, y: 0 },
                { x: 200, y: 80 },
                { x: 0, y: 80 },
                { x: 0, y: 0 },
            ]],
            startRow: 0,
            endRow: 1,
            startColumn: 0,
            endColumn: 1,
            tableId: 'table-1',
        } as never);

        const range = new RectRange(scene, createDocument(), skeleton, anchor, focus, {} as never, 'segment-1', 2);

        expect(range.startOffset).toBe(10);
        expect(range.endOffset).toBe(20);
        expect(range.segmentId).toBe('segment-1');
        expect(range.segmentPage).toBe(2);
        expect(range.tableId).toBe('table-1');
        expect(range.spanEntireRow).toBe(true);
        expect(range.spanEntireColumn).toBe(true);
        expect(range.spanEntireTable).toBe(true);
        expect(addedObjects).toHaveLength(1);

        range.activate();
        expect(range.isActive()).toBe(true);
        range.deactivate();
        expect(range.isActive()).toBe(false);

        range.refresh();
        expect(addedObjects).toHaveLength(1);
        range.dispose();
    });

    it('checks intersections between table rect ranges', () => {
        const first = Object.create(RectRange.prototype) as RectRange;
        const second = Object.create(RectRange.prototype) as RectRange;
        const third = Object.create(RectRange.prototype) as RectRange;

        Object.assign(first, { _startRow: 0, _endRow: 2, _startCol: 0, _endCol: 2 });
        Object.assign(second, { _startRow: 1, _endRow: 3, _startCol: 1, _endCol: 3 });
        Object.assign(third, { _startRow: 4, _endRow: 5, _startCol: 4, _endCol: 5 });

        expect(first.isIntersection(second)).toBe(true);
        expect(first.isIntersection(third)).toBe(false);
    });

    it('does not build table rect data when skeleton data or table metadata is missing', () => {
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]);
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 1]);
        const emptySkeleton = {
            getSkeletonData: () => null,
            findCharIndexByPosition: () => 0,
        } as never;
        const missingTableNodeSkeleton = {
            ...createRectRangeConvertorHarness().skeleton,
            findCharIndexByPosition: (position: INodePosition) => position === anchor ? 0 : 10,
            getViewModel: () => ({
                getSnapshot: () => ({
                    tableSource: {
                        'table-1': {
                            tableRows: [
                                { tableCells: [{}, {}] },
                            ],
                        },
                    },
                }),
                findTableNodeById: () => null,
            }),
        } as never;

        expect(new NodePositionConvertToRectRange({} as never, emptySkeleton).getRangePointData(anchor, focus)).toBeUndefined();
        expect(new NodePositionConvertToRectRange({} as never, emptySkeleton).getNodePositionGroup(anchor, focus)).toBeUndefined();
        expect(new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, missingTableNodeSkeleton).getNodePositionGroup(anchor, focus)).toBeUndefined();
    });

    it('converts a full-row table drag into one text range group', () => {
        const cell00 = createCellPage(0, 100);
        const cell01 = createCellPage(100, 100);
        const cell10 = createCellPage(0, 100);
        const cell11 = createCellPage(100, 100);
        const row0: IMockRow = { index: 0, top: 0, height: 20, cells: [cell00, cell01] };
        const row1: IMockRow = { index: 1, top: 20, height: 20, cells: [cell10, cell11] };
        const table = { tableId: 'table-1', top: 0, left: 0, rows: [row0, row1] } as never;
        const page = { skeTables: new Map([['table-1', table]]), marginTop: 0, marginLeft: 0, width: 300, height: 200 } as never;
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0]);
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 1, 'cells', 1]);
        const startNode = createNodePosition(['char', 1]);
        const endNode = createNodePosition(['char', 28]);

        cell00.parent = row0 as never;
        cell01.parent = row0 as never;
        cell10.parent = row1 as never;
        cell11.parent = row1 as never;
        row0.parent = table;
        row1.parent = table;

        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
            }),
            findCharIndexByPosition: (position: INodePosition) => position === anchor ? 0 : 100,
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(startNode)
                .mockReturnValueOnce(endNode),
            getViewModel: () => ({
                getSnapshot: () => ({
                    tableSource: {
                        'table-1': {
                            tableRows: [
                                { tableCells: [{}, {}] },
                                { tableCells: [{}, {}] },
                            ],
                        },
                    },
                }),
                findTableNodeById: () => ({
                    children: [
                        { children: [{ startIndex: 0, endIndex: 8 }, { startIndex: 10, endIndex: 18 }] },
                        { children: [{ startIndex: 20, endIndex: 28 }, { startIndex: 30, endIndex: 40 }] },
                    ],
                }),
            }),
        } as never;

        expect(new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton).getNodePositionGroup(anchor, focus)).toEqual([{
            anchor: startNode,
            focus: endNode,
        }]);
    });

    it('converts a column-only table drag into one text range group per row', () => {
        const cell00 = createCellPage(0, 100);
        const cell01 = createCellPage(100, 100);
        const cell10 = createCellPage(0, 100);
        const cell11 = createCellPage(100, 100);
        const row0: IMockRow = { index: 0, top: 0, height: 20, cells: [cell00, cell01] };
        const row1: IMockRow = { index: 1, top: 20, height: 20, cells: [cell10, cell11] };
        const table = { tableId: 'table-1', top: 0, left: 0, rows: [row0, row1] } as never;
        const page = { skeTables: new Map([['table-1', table]]), marginTop: 0, marginLeft: 0, width: 300, height: 200 } as never;
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 1]);
        const focus = createNodePosition(['pages', 0, 'skeTables', 'table-1', 'rows', 1, 'cells', 1]);
        const row0Start = createNodePosition(['char', 11]);
        const row0End = createNodePosition(['char', 16]);
        const row1Start = createNodePosition(['char', 31]);
        const row1End = createNodePosition(['char', 38]);

        cell00.parent = row0 as never;
        cell01.parent = row0 as never;
        cell10.parent = row1 as never;
        cell11.parent = row1 as never;
        row0.parent = table;
        row1.parent = table;

        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
            }),
            findCharIndexByPosition: (position: INodePosition) => position === anchor ? 10 : 100,
            findNodePositionByCharIndex: vi
                .fn()
                .mockReturnValueOnce(row0Start)
                .mockReturnValueOnce(row0End)
                .mockReturnValueOnce(row1Start)
                .mockReturnValueOnce(row1End),
            getViewModel: () => ({
                getSnapshot: () => ({
                    tableSource: {
                        'table-1': {
                            tableRows: [
                                { tableCells: [{}, {}] },
                                { tableCells: [{}, {}] },
                            ],
                        },
                    },
                }),
                findTableNodeById: () => ({
                    children: [
                        { children: [{ startIndex: 0, endIndex: 8 }, { startIndex: 10, endIndex: 18 }] },
                        { children: [{ startIndex: 20, endIndex: 28 }, { startIndex: 30, endIndex: 40 }] },
                    ],
                }),
            }),
        } as never;

        expect(new NodePositionConvertToRectRange({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton).getNodePositionGroup(anchor, focus)).toEqual([
            { anchor: row0Start, focus: row0End },
            { anchor: row1Start, focus: row1End },
        ]);
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
