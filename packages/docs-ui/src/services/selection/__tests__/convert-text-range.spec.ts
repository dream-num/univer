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
import { DataStreamTreeTokenType } from '@univerjs/core';
import { DocumentSkeletonPageType, setDocsTableRenderViewportProvider } from '@univerjs/engine-render';
import { afterEach, describe, expect, it } from 'vitest';
import {
    compareNodePosition,
    compareNodePositionLogic,
    getOneTextSelectionRange,
    NodePositionConvertToCursor,
    pushToPoints,
} from '../convert-text-range';
import { getAnchorBounding, getLineBounding } from '../text-range';

describe('selection convert text range helpers', () => {
    afterEach(() => {
        setDocsTableRenderViewportProvider(null);
    });

    it('compares node positions in document order', () => {
        const start = { page: 0, section: 0, column: 0, line: 0, divide: 0, glyph: 0 } as never;
        const end = { page: 0, section: 0, column: 0, line: 1, divide: 0, glyph: 0 } as never;
        const earlierPage = { page: 0, section: 1, column: 0, line: 0, divide: 0, glyph: 0 } as never;
        const laterPage = { page: 1, section: 0, column: 0, line: 0, divide: 0, glyph: 0 } as never;

        expect(compareNodePositionLogic(start, end)).toBe(true);
        expect(compareNodePositionLogic(end, start)).toBe(false);
        expect(compareNodePositionLogic(earlierPage, laterPage)).toBe(true);
        expect(compareNodePosition(start, end)).toEqual({ start, end });
        expect(compareNodePosition(end, start)).toEqual({ start, end });
    });

    it('orders positions in different document columns by their column-group path', () => {
        const firstColumnEnd = {
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 2,
            path: ['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page'],
        } as never;
        const secondColumnStart = {
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            section: 0,
            column: 0,
            line: 0,
            divide: 0,
            glyph: 0,
            path: ['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 1, 'page'],
        } as never;

        expect(compareNodePositionLogic(firstColumnEnd, secondColumnStart)).toBe(true);
        expect(compareNodePositionLogic(secondColumnStart, firstColumnEnd)).toBe(false);
        expect(compareNodePosition(secondColumnStart, firstColumnEnd)).toEqual({
            start: firstColumnEnd,
            end: secondColumnStart,
        });
    });

    it('merges cursor fragments into one text range', () => {
        expect(getOneTextSelectionRange([])).toBeUndefined();
        expect(getOneTextSelectionRange([
            { startOffset: 2, endOffset: 2, collapsed: true },
        ] as never)).toEqual({
            startOffset: 2,
            endOffset: 2,
            collapsed: true,
        });
        expect(getOneTextSelectionRange([
            { startOffset: 2, endOffset: 4, collapsed: false },
            { startOffset: 5, endOffset: 8, collapsed: false },
        ] as never)).toEqual({
            startOffset: 2,
            endOffset: 8,
            collapsed: false,
        });
    });

    it('converts positions into polygon points and bounding boxes', () => {
        const points = pushToPoints({
            startX: 10,
            startY: 20,
            endX: 30,
            endY: 40,
        });

        expect(points).toEqual([
            { x: 10, y: 20 },
            { x: 30, y: 20 },
            { x: 30, y: 40 },
            { x: 10, y: 40 },
            { x: 10, y: 20 },
        ]);
        expect(getAnchorBounding([points])).toEqual({
            left: 10,
            top: 20,
            width: 20,
            height: 20,
        });
        expect(getLineBounding([
            points,
            [{ x: 0, y: 0 }, { x: 4, y: 0 }, { x: 4, y: 2 }, { x: 0, y: 2 }],
        ])).toEqual([
            { left: 10, right: 30, top: 20, bottom: 40 },
            { left: 0, right: 4, top: 0, bottom: 2 },
        ]);
    });

    it('projects cell cursors through the table horizontal viewport', () => {
        setDocsTableRenderViewportProvider((unitId, tableId) => {
            if (unitId !== 'unit-1' || tableId !== 'table-1') {
                return null;
            }

            return {
                contentWidth: 400,
                scrollLeft: 50,
                viewportWidth: 120,
            };
        });

        const glyph = {
            bBox: { ba: 8, bd: 2 },
            count: 1,
            glyphType: 'LETTER',
            left: 20,
            width: 10,
        };
        const cell = {
            left: 100,
            marginLeft: 0,
            marginTop: 0,
            sections: [{
                columns: [{
                    left: 0,
                    lines: [{
                        asc: 10,
                        divides: [{
                            glyphGroup: [glyph],
                            left: 0,
                            paddingLeft: 0,
                        }],
                        lineHeight: 20,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        top: 0,
                    }],
                }],
                top: 0,
            }],
        };
        const row = {
            cells: [cell],
            height: 20,
            index: 0,
            top: 0,
        };
        const table = {
            left: 0,
            rows: [row],
            tableId: 'table-1',
            top: 0,
        };
        const page = {
            marginLeft: 0,
            marginTop: 0,
            pageHeight: 500,
            pageWidth: 500,
            skeTables: new Map([['table-1', table]]),
        };

        (cell as { parent?: unknown }).parent = row;
        (row as { parent?: unknown }).parent = table;

        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
                skeFooters: new Map(),
                skeHeaders: new Map(),
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getUnitId: () => 'unit-1',
                }),
            }),
        };
        const position: INodePosition = {
            column: 0,
            divide: 0,
            glyph: 0,
            isBack: false,
            line: 0,
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            path: ['pages', 0, 'skeTables', 'table-1', 'rows', 0, 'cells', 0],
            section: 0,
            segmentPage: 0,
        };

        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(position, position);

        expect(getAnchorBounding(result.contentBoxPointGroup).left).toBe(70);
    });

    it('projects header table cell cursors from the segment page without requiring a body page index', () => {
        const glyph = {
            bBox: { ba: 8, bd: 2 },
            count: 1,
            glyphType: 'LETTER',
            left: 20,
            width: 10,
        };
        const cell = {
            left: 30,
            marginLeft: 0,
            marginTop: 0,
            sections: [{
                columns: [{
                    left: 0,
                    lines: [{
                        asc: 10,
                        divides: [{
                            glyphGroup: [glyph],
                            left: 0,
                            paddingLeft: 0,
                        }],
                        lineHeight: 20,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        top: 0,
                    }],
                }],
                top: 0,
            }],
        };
        const row = {
            cells: [cell],
            height: 20,
            index: 0,
            top: 0,
        };
        const table = {
            left: 7,
            rows: [row],
            tableId: 'header-table',
            top: 4,
        };
        const headerPage = {
            marginLeft: 0,
            marginTop: 12,
            pageHeight: 100,
            pageWidth: 420,
            sections: [],
            skeTables: new Map([['header-table', table]]),
            type: DocumentSkeletonPageType.HEADER,
        };
        const page = {
            headerId: 'header-1',
            marginLeft: 50,
            marginTop: 100,
            pageHeight: 500,
            pageWidth: 600,
            skeTables: new Map(),
        };

        (cell as { parent?: unknown }).parent = row;
        (row as { parent?: unknown }).parent = table;
        (table as { parent?: unknown }).parent = headerPage;

        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
                skeFooters: new Map(),
                skeHeaders: new Map([['header-1', new Map([[600, headerPage]])]]),
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getUnitId: () => 'unit-1',
                }),
            }),
        };
        const position: INodePosition = {
            column: 0,
            divide: 0,
            glyph: 0,
            isBack: false,
            line: 0,
            page: -1,
            pageType: DocumentSkeletonPageType.CELL,
            path: ['skeTables', 'header-table', 'rows', 0, 'cells', 0],
            section: 0,
            segmentPage: 0,
        };

        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(position, position);

        expect(getAnchorBounding(result.contentBoxPointGroup).left).toBe(107);
        expect(getAnchorBounding(result.contentBoxPointGroup).top).toBe(18);
    });

    it('projects column page cursors through the column group offset', () => {
        const glyph = {
            bBox: { ba: 8, bd: 2 },
            count: 1,
            glyphType: 'LETTER',
            left: 20,
            width: 10,
        };
        const columnPage = {
            marginLeft: 0,
            marginTop: 0,
            sections: [{
                columns: [{
                    left: 0,
                    lines: [{
                        asc: 10,
                        divides: [{
                            glyphGroup: [glyph],
                            left: 0,
                            paddingLeft: 0,
                        }],
                        lineHeight: 20,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        top: 0,
                    }],
                }],
                top: 0,
            }],
        };
        const columnGroupColumn = {
            left: 60,
            page: columnPage,
            top: 4,
        };
        const columnGroup = {
            columnGroupId: 'cg-1',
            columns: [columnGroupColumn],
            left: 20,
            top: 30,
        };
        const page = {
            marginLeft: 0,
            marginTop: 0,
            pageHeight: 500,
            pageWidth: 500,
            skeColumnGroups: new Map([['cg-1', columnGroup]]),
            skeTables: new Map(),
        };

        (columnPage as { parent?: unknown }).parent = columnGroupColumn;
        (columnGroupColumn as { parent?: unknown }).parent = columnGroup;
        (columnGroup as { parent?: unknown }).parent = page;

        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
                skeFooters: new Map(),
                skeHeaders: new Map(),
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getUnitId: () => 'unit-1',
                }),
            }),
        };
        const position: INodePosition = {
            column: 0,
            divide: 0,
            glyph: 0,
            isBack: false,
            line: 0,
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            path: ['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page'],
            section: 0,
            segmentPage: 0,
        };

        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(position, position);

        expect(getAnchorBounding(result.contentBoxPointGroup).left).toBe(100);
    });

    it('projects table cell cursors inside column groups through the column and table offsets', () => {
        const glyph = {
            bBox: { ba: 8, bd: 2 },
            count: 1,
            glyphType: 'LETTER',
            left: 20,
            width: 10,
        };
        const cell = {
            left: 30,
            marginLeft: 3,
            marginTop: 0,
            sections: [{
                columns: [{
                    left: 0,
                    lines: [{
                        asc: 10,
                        divides: [{
                            glyphGroup: [glyph],
                            left: 0,
                            paddingLeft: 0,
                        }],
                        lineHeight: 20,
                        marginBottom: 0,
                        marginTop: 0,
                        paddingTop: 0,
                        top: 0,
                    }],
                }],
                top: 0,
            }],
        };
        const row = {
            cells: [cell],
            height: 20,
            index: 0,
            top: 0,
        };
        const table = {
            left: 7,
            rows: [row],
            tableId: 'table-in-column',
            top: 0,
        };
        const columnPage = {
            marginLeft: 5,
            marginTop: 0,
            sections: [],
            skeTables: new Map([['table-in-column', table]]),
        };
        const columnGroupColumn = {
            left: 60,
            page: columnPage,
            top: 4,
        };
        const columnGroup = {
            columnGroupId: 'cg-1',
            columns: [columnGroupColumn],
            left: 20,
            top: 30,
        };
        const page = {
            marginLeft: 0,
            marginTop: 0,
            pageHeight: 500,
            pageWidth: 500,
            skeColumnGroups: new Map([['cg-1', columnGroup]]),
            skeTables: new Map(),
        };

        (cell as { parent?: unknown }).parent = row;
        (row as { parent?: unknown }).parent = table;
        (table as { parent?: unknown }).parent = columnPage;
        (columnPage as { parent?: unknown }).parent = columnGroupColumn;
        (columnGroupColumn as { parent?: unknown }).parent = columnGroup;
        (columnGroup as { parent?: unknown }).parent = page;

        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
                skeFooters: new Map(),
                skeHeaders: new Map(),
            }),
            getViewModel: () => ({
                getDataModel: () => ({
                    getUnitId: () => 'unit-1',
                }),
            }),
        };
        const position: INodePosition = {
            column: 0,
            divide: 0,
            glyph: 0,
            isBack: false,
            line: 0,
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            path: ['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page', 'skeTables', 'table-in-column', 'rows', 0, 'cells', 0],
            section: 0,
            segmentPage: 0,
        };

        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(position, position);

        expect(getAnchorBounding(result.contentBoxPointGroup).left).toBe(145);
    });

    it('excludes layout-only paragraph spacing from text selection height', () => {
        const glyph = {
            bBox: { ba: 10, bd: 3 },
            count: 1,
            glyphType: 'LETTER',
            left: 0,
            width: 20,
        };
        const line = {
            asc: 13,
            contentHeight: 16,
            divides: [{
                glyphGroup: [glyph],
                left: 0,
                paddingLeft: 0,
            }],
            lineHeight: 92,
            marginBottom: 34,
            marginTop: 0,
            paddingBottom: 4,
            paddingTop: 4,
            top: 0,
        };
        const page = {
            marginLeft: 0,
            marginTop: 0,
            pageHeight: 500,
            pageWidth: 500,
            sections: [{
                columns: [{
                    left: 0,
                    lines: [line],
                }],
                top: 0,
            }],
        };
        const skeleton = {
            getSkeletonData: () => ({
                pages: [page],
                skeFooters: new Map(),
                skeHeaders: new Map(),
            }),
        };
        const position: INodePosition = {
            column: 0,
            divide: 0,
            glyph: 0,
            isBack: false,
            line: 0,
            page: 0,
            pageType: DocumentSkeletonPageType.BODY,
            path: ['pages', 0],
            section: 0,
            segmentPage: -1,
        };
        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(position, position);

        expect(getLineBounding(result.borderBoxPointGroup)[0]).toEqual({
            bottom: 24,
            left: 0,
            right: 20,
            top: 0,
        });
    });

    it('uses normal caret height for non-inline embed custom blocks', () => {
        const { position, skeleton } = createEmbedCustomBlockCursorHarness();
        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(position, position);

        expect(getAnchorBounding(result.contentBoxPointGroup).height).toBeLessThan(30);
    });

    it('does not draw text selection rectangles for non-inline embed custom blocks', () => {
        const { position, skeleton } = createEmbedCustomBlockCursorHarness();
        const convertor = new NodePositionConvertToCursor({
            docsLeft: 0,
            docsTop: 0,
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(
            { ...position, isBack: true },
            { ...position, isBack: false }
        );

        expect(result.borderBoxPointGroup).toHaveLength(0);
        expect(result.contentBoxPointGroup).toHaveLength(0);
    });
});

function createEmbedCustomBlockCursorHarness() {
    const drawingId = 'embed-block-1';
    const glyph = {
        bBox: { ba: 480, bd: 0 },
        count: 1,
        drawingId,
        fontStyle: { fontSize: 14 },
        glyphType: 'PLACEHOLDER',
        left: 0,
        streamType: DataStreamTreeTokenType.CUSTOM_BLOCK,
        width: 720,
    };
    const line = {
        asc: 13,
        contentHeight: 480,
        divides: [{
            glyphGroup: [glyph],
            left: 0,
            paddingLeft: 0,
            st: 0,
        }],
        lineHeight: 480,
        marginBottom: 0,
        marginTop: 0,
        paddingBottom: 0,
        paddingTop: 0,
        top: 0,
    };
    const page = {
        marginLeft: 0,
        marginTop: 0,
        pageHeight: 1000,
        pageWidth: 1000,
        sections: [{
            columns: [{
                left: 0,
                lines: [line],
            }],
            top: 0,
        }],
    };
    const skeleton = {
        getSkeletonData: () => ({
            pages: [page],
            skeFooters: new Map(),
            skeHeaders: new Map(),
        }),
        getViewModel: () => ({
            getDataModel: () => ({
                getSnapshot: () => ({
                    drawings: {
                        [drawingId]: {
                            data: {
                                version: 1,
                                embedId: 'embed-1',
                                hostAnchorId: drawingId,
                                interactionMode: 'block',
                            },
                        },
                    },
                }),
            }),
        }),
    };
    const position: INodePosition = {
        column: 0,
        divide: 0,
        glyph: 0,
        isBack: false,
        line: 0,
        page: 0,
        pageType: DocumentSkeletonPageType.BODY,
        path: ['pages', 0],
        section: 0,
        segmentPage: -1,
    };

    return { position, skeleton };
}
