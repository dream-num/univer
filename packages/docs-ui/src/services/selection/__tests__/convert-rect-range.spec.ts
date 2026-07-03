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
import { DocumentSkeletonPageType } from '@univerjs/engine-render';
import { describe, expect, it } from 'vitest';
import {
    compareNodePositionInTable,
    isInSameTableCell,
    isInSameTableCellData,
    isValidRectRange,
    NodePositionConvertToRectRange,
} from '../convert-rect-range';

function createNodePosition(path: Array<string | number>): INodePosition {
    return {
        page: 0,
        section: 0,
        column: 0,
        line: 0,
        divide: 0,
        glyph: 0,
        path,
    } as INodePosition;
}

describe('selection rect range helpers', () => {
    it('validates rectangle selections across table cells', () => {
        const sameCell = createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0]);
        const otherCell = createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 1]);
        const otherTable = createNodePosition(['pages', 0, 'skeTables', 'table-2#-#0', 'rows', 0, 'cells', 0]);
        const nonTable = createNodePosition(['pages', 0, 'sections', 0]);

        expect(isValidRectRange(sameCell, otherCell)).toBe(true);
        expect(isValidRectRange(sameCell, sameCell)).toBe(false);
        expect(isValidRectRange(sameCell, otherTable)).toBe(false);
        expect(isValidRectRange(sameCell, nonTable)).toBe(false);
        expect(isInSameTableCell(sameCell, createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0]))).toBe(true);
        expect(isInSameTableCell(sameCell, otherCell)).toBe(false);
    });

    it('ignores column page paths when converting rect ranges', () => {
        const columnPosition = createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page']);
        const columnPage = { parent: { parent: { columnGroupId: 'cg-1' } } };
        const skeleton = {
            findCharIndexByPosition: () => 1,
            getSkeletonData: () => ({
                pages: [{
                    skeColumnGroups: new Map([
                        ['cg-1', { columns: [{ page: columnPage }] }],
                    ]),
                }],
            }),
        };
        const convertor = new NodePositionConvertToRectRange({} as never, skeleton as never);

        expect(convertor.getNodePositionGroup(columnPosition, columnPosition)).toBeUndefined();
    });

    it('projects rect ranges for table cells inside column groups through column offsets', () => {
        const firstCell = {
            left: 0,
            pageWidth: 50,
            segmentId: 'table-in-column',
            sections: [{ columns: [{ lines: [{}] }] }],
        };
        const secondCell = {
            left: 50,
            pageWidth: 50,
            segmentId: 'table-in-column',
            sections: [{ columns: [{ lines: [{}] }] }],
        };
        const row = {
            cells: [firstCell, secondCell],
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

        (firstCell as { parent?: unknown }).parent = row;
        (secondCell as { parent?: unknown }).parent = row;
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
                getSnapshot: () => ({
                    tableSource: {
                        'table-in-column': {
                            tableRows: [{
                                tableCells: [{}, {}],
                            }],
                        },
                    },
                }),
            }),
        };
        const anchor = {
            ...createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page', 'skeTables', 'table-in-column', 'rows', 0, 'cells', 0]),
            pageType: DocumentSkeletonPageType.CELL,
        } as never;
        const focus = {
            ...createNodePosition(['pages', 0, 'skeColumnGroups', 'cg-1', 'columns', 0, 'page', 'skeTables', 'table-in-column', 'rows', 0, 'cells', 1]),
            pageType: DocumentSkeletonPageType.CELL,
        } as never;
        const convertor = new NodePositionConvertToRectRange({
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result?.pointGroup[0]).toEqual([
            { x: 92, y: 34 },
            { x: 192, y: 34 },
            { x: 192, y: 54 },
            { x: 92, y: 54 },
            { x: 92, y: 34 },
        ]);
    });

    it('projects rect ranges for header table cells from segment-relative paths', () => {
        const firstCell = {
            left: 0,
            pageWidth: 50,
            segmentId: 'header-table',
            sections: [{ columns: [{ lines: [{}] }] }],
        };
        const secondCell = {
            left: 50,
            pageWidth: 50,
            segmentId: 'header-table',
            sections: [{ columns: [{ lines: [{}] }] }],
        };
        const row = {
            cells: [firstCell, secondCell],
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

        (firstCell as { parent?: unknown }).parent = row;
        (secondCell as { parent?: unknown }).parent = row;
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
                getSnapshot: () => ({
                    tableSource: {
                        'header-table': {
                            tableRows: [{
                                tableCells: [{}, {}],
                            }],
                        },
                    },
                }),
            }),
        };
        const anchor = {
            ...createNodePosition(['skeTables', 'header-table', 'rows', 0, 'cells', 0]),
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            segmentPage: 0,
        } as never;
        const focus = {
            ...createNodePosition(['skeTables', 'header-table', 'rows', 0, 'cells', 1]),
            page: 0,
            pageType: DocumentSkeletonPageType.CELL,
            segmentPage: 0,
        } as never;
        const convertor = new NodePositionConvertToRectRange({
            pageLayoutType: 0,
            pageMarginLeft: 0,
            pageMarginTop: 0,
        } as never, skeleton as never);

        const result = convertor.getRangePointData(anchor, focus);

        expect(result?.pointGroup[0]).toEqual([
            { x: 57, y: 16 },
            { x: 157, y: 16 },
            { x: 157, y: 36 },
            { x: 57, y: 36 },
            { x: 57, y: 16 },
        ]);
    });

    it('detects same table-cell data across pages and compares table order', () => {
        const anchor = createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 1, 'cells', 2]);
        const focus = createNodePosition(['pages', 1, 'skeTables', 'table#-#1', 'rows', 1, 'cells', 2]);

        const anchorCellPage: Record<string, unknown> = {};
        const focusCellPage: Record<string, unknown> = {};
        const anchorRow = { index: 1, cells: [null, null, anchorCellPage] };
        const focusRow = { index: 1, cells: [null, null, focusCellPage] };

        const skeleton = {
            findGlyphByPosition: (position: unknown) => ({
                parent: {
                    parent: {
                        parent: {
                            parent: {
                                parent: position === anchor ? { ...anchorCellPage, parent: anchorRow } : { ...focusCellPage, parent: focusRow },
                            },
                        },
                    },
                },
            }),
        } as never;

        expect(isInSameTableCellData(skeleton, anchor, focus)).toBe(true);
        expect(compareNodePositionInTable(
            createNodePosition(['pages', 0, 'skeTables', 'table#-#0', 'rows', 0, 'cells', 0]),
            createNodePosition(['pages', 0, 'skeTables', 'table#-#1', 'rows', 0, 'cells', 0])
        )).toBe(true);
        expect(compareNodePositionInTable(
            createNodePosition(['pages', 0, 'skeTables', 'table#-#1', 'rows', 2, 'cells', 1]),
            createNodePosition(['pages', 0, 'skeTables', 'table#-#1', 'rows', 2, 'cells', 0])
        )).toBe(false);
    });
});
