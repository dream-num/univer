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

import type { ITable } from '@univerjs/core';
import type { IParagraphList } from '../../../../../basics/i-document-skeleton-cached';
import type { DataStreamTreeNode } from '../../../view-model/data-stream-tree-node';
import {
    BooleanNumber,
    DocumentFlavor,
    TableAlignmentType,
    TableRowHeightRule,
    TableSizeType,
    VerticalAlignmentType,
} from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { getDocumentCompatibilityPolicy } from '../../../document-compatibility';
import {
    createTableSkeleton,
    createTableSkeletons,
    getNullTableSkeleton,
    getTableIdAndSliceIndex,
    getTableSliceId,
    rollbackListCache,
} from '../table';

const createSkeletonCellPagesMock = vi.fn();
const createNullCellPageMock = vi.fn();

vi.mock('../../model/page', () => ({
    createSkeletonCellPages: (...args: unknown[]) => createSkeletonCellPagesMock(...args),
    createNullCellPage: (...args: unknown[]) => createNullCellPageMock(...args),
}));

function createMockTable(overrides: Partial<ITable> = {}): ITable {
    return {
        tableId: 'test-table',
        tableRows: [],
        tableColumns: [],
        align: TableAlignmentType.START,
        indent: { v: 0 },
        textWrap: 0 as unknown as ITable['textWrap'],
        position: {} as unknown as ITable['position'],
        dist: {} as unknown as ITable['dist'],
        size: { type: TableSizeType.UNSPECIFIED, width: { v: 100 } },
        ...overrides,
    } as ITable;
}

function createRowNode(startIndex: number, endIndex: number, cellCount: number) {
    return {
        startIndex,
        endIndex,
        children: new Array(cellCount).fill(0).map((_, i) => ({
            startIndex: startIndex + i * 5,
            endIndex: startIndex + i * 5 + 4,
            children: [],
        })),
    };
}

function createContextAndTable() {
    const tableSource = {
        tableId: 'table-1',
        align: TableAlignmentType.START,
        indent: { v: 8 },
        tableRows: [
            {
                repeatHeaderRow: BooleanNumber.TRUE,
                trHeight: {
                    hRule: TableRowHeightRule.AUTO,
                    val: { v: 16 },
                },
                cantSplit: BooleanNumber.FALSE,
                tableCells: [
                    { vAlign: VerticalAlignmentType.TOP },
                    { vAlign: VerticalAlignmentType.CENTER },
                ],
            },
            {
                repeatHeaderRow: BooleanNumber.FALSE,
                trHeight: {
                    hRule: TableRowHeightRule.AT_LEAST,
                    val: { v: 28 },
                },
                cantSplit: BooleanNumber.TRUE,
                tableCells: [
                    { vAlign: VerticalAlignmentType.BOTTOM },
                    { vAlign: VerticalAlignmentType.TOP },
                ],
            },
        ],
    } as any;

    const viewModel = {
        getTableByStartIndex: vi.fn(() => ({ tableSource })),
    } as any;

    const tableNode = {
        startIndex: 0,
        endIndex: 80,
        children: [
            createRowNode(1, 20, 2),
            createRowNode(21, 40, 2),
        ],
    } as any;

    const curPage = {
        pageWidth: 400,
        pageHeight: 300,
        marginTop: 20,
        marginBottom: 20,
        marginLeft: 10,
        marginRight: 10,
    } as any;

    return {
        ctx: {} as any,
        sectionBreakConfig: {} as any,
        tableSource,
        viewModel,
        tableNode,
        curPage,
    };
}

function makeCellPage(width: number, height: number) {
    return {
        width,
        height,
        pageWidth: width,
        pageHeight: height,
        marginTop: 1,
        marginBottom: 1,
        originMarginTop: 1,
        originMarginBottom: 1,
        sections: [],
    };
}

function useDocumentFlavor(sectionBreakConfig: Record<string, unknown>, documentFlavor: DocumentFlavor) {
    sectionBreakConfig.documentCompatibilityPolicy = getDocumentCompatibilityPolicy(documentFlavor);
}

describe('table utilities', () => {
    describe('getTableSliceId', () => {
        it('concatenates tableId and sliceIndex with delimiter', () => {
            expect(getTableSliceId('table1', 0)).toBe('table1#-#0');
            expect(getTableSliceId('table1', 2)).toBe('table1#-#2');
            expect(getTableSliceId('my-table', 99)).toBe('my-table#-#99');
        });
    });

    describe('getTableIdAndSliceIndex', () => {
        it('parses sliced table id', () => {
            expect(getTableIdAndSliceIndex('table1#-#0')).toEqual({
                tableId: 'table1',
                sliceIndex: 0,
            });
            expect(getTableIdAndSliceIndex('table1#-#2')).toEqual({
                tableId: 'table1',
                sliceIndex: 2,
            });
        });

        it('returns sliceIndex 0 for unsliced table id', () => {
            expect(getTableIdAndSliceIndex('table1')).toEqual({
                tableId: 'table1',
                sliceIndex: 0,
            });
        });
    });

    describe('getNullTableSkeleton', () => {
        it('returns a skeleton with zero dimensions and given bounds', () => {
            const table = createMockTable();
            const skeleton = getNullTableSkeleton(10, 50, table);

            expect(skeleton.rows).toEqual([]);
            expect(skeleton.width).toBe(0);
            expect(skeleton.height).toBe(0);
            expect(skeleton.top).toBe(0);
            expect(skeleton.left).toBe(0);
            expect(skeleton.st).toBe(10);
            expect(skeleton.ed).toBe(50);
            expect(skeleton.tableId).toBe('test-table');
            expect(skeleton.tableSource).toBe(table);
        });
    });

    describe('rollbackListCache', () => {
        it('removes paragraph lists whose startIndex is inside the table range', () => {
            const paragraphList1: IParagraphList = {
                bullet: {} as unknown as IParagraphList['bullet'],
                paragraph: { startIndex: 5 } as unknown as IParagraphList['paragraph'],
            };
            const paragraphList2: IParagraphList = {
                bullet: {} as unknown as IParagraphList['bullet'],
                paragraph: { startIndex: 15 } as unknown as IParagraphList['paragraph'],
            };
            const paragraphList3: IParagraphList = {
                bullet: {} as unknown as IParagraphList['bullet'],
                paragraph: { startIndex: 25 } as unknown as IParagraphList['paragraph'],
            };

            const listLevel = new Map<string, IParagraphList[][]>([
                ['list1', [[paragraphList1, paragraphList2, paragraphList3]]],
            ]);

            const tableNode = {
                startIndex: 10,
                endIndex: 20,
            } as DataStreamTreeNode;

            rollbackListCache(listLevel, tableNode);

            const result = listLevel.get('list1')![0];
            expect(result).toHaveLength(1);
            expect(result[0].paragraph.startIndex).toBe(5);
        });

        it('does not remove paragraph lists outside the table range', () => {
            const paragraphList1: IParagraphList = {
                bullet: {} as unknown as IParagraphList['bullet'],
                paragraph: { startIndex: 1 } as unknown as IParagraphList['paragraph'],
            };
            const paragraphList2: IParagraphList = {
                bullet: {} as unknown as IParagraphList['bullet'],
                paragraph: { startIndex: 2 } as unknown as IParagraphList['paragraph'],
            };

            const listLevel = new Map<string, IParagraphList[][]>([
                ['list1', [[paragraphList1, paragraphList2]]],
            ]);

            const tableNode = {
                startIndex: 10,
                endIndex: 20,
            } as DataStreamTreeNode;

            rollbackListCache(listLevel, tableNode);

            const result = listLevel.get('list1')![0];
            expect(result).toHaveLength(2);
        });

        it('handles empty listLevel', () => {
            const listLevel = new Map<string, IParagraphList[][]>();
            const tableNode = {
                startIndex: 10,
                endIndex: 20,
            } as DataStreamTreeNode;

            expect(() => rollbackListCache(listLevel, tableNode)).not.toThrow();
        });

        it('skips sparse paragraph list levels', () => {
            const paragraphList: IParagraphList = {
                bullet: {} as unknown as IParagraphList['bullet'],
                paragraph: { startIndex: 25 } as unknown as IParagraphList['paragraph'],
            };
            const paragraphLists = [] as unknown as IParagraphList[][];
            paragraphLists[2] = [paragraphList];
            const listLevel = new Map<string, IParagraphList[][]>([
                ['list1', paragraphLists],
            ]);
            const tableNode = {
                startIndex: 10,
                endIndex: 20,
            } as DataStreamTreeNode;

            expect(() => rollbackListCache(listLevel, tableNode)).not.toThrow();
            expect(listLevel.get('list1')![2]).toHaveLength(1);
        });
    });
});

describe('docs table layout', () => {
    beforeEach(() => {
        createSkeletonCellPagesMock.mockReset();
        createNullCellPageMock.mockReset();

        createNullCellPageMock.mockImplementation(() => ({
            page: makeCellPage(60, 10),
        }));

        createSkeletonCellPagesMock.mockImplementation(
            (_ctx: unknown, _viewModel: unknown, _cellNode: unknown, _section: unknown, _table: unknown, row: number, col: number, availableHeight?: number) => {
                const baseHeight = row === 0 ? 20 : 24;
                if (row === 1 && col === 0 && typeof availableHeight === 'number' && availableHeight < 40) {
                    return [makeCellPage(60, baseHeight), makeCellPage(60, 16)];
                }
                return [makeCellPage(60, baseHeight)];
            }
        );
    });

    it('creates table skeleton and applies row/cell alignment data', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig } = createContextAndTable();

        const skeleton = createTableSkeleton(ctx, curPage, viewModel, tableNode, sectionBreakConfig);
        expect(skeleton).toBeTruthy();
        expect(skeleton?.rows.length).toBe(2);
        expect(skeleton?.width).toBeGreaterThan(0);
        expect(skeleton?.height).toBeGreaterThan(0);
        expect(skeleton?.left).toBeGreaterThanOrEqual(0);
        expect(skeleton?.rows[0].cells[0].marginTop).toBeGreaterThanOrEqual(1);
        expect(skeleton?.rows[0].cells[1].marginTop).toBeGreaterThanOrEqual(1);
    });

    it('keeps covered merged cells as non-rendering layout placeholders', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        createSkeletonCellPagesMock.mockImplementation(
            (_ctx: unknown, _viewModel: unknown, _cellNode: unknown, _section: unknown, table: any, row: number, col: number) => {
                const columnSpan = Math.max(1, table.tableRows[row].tableCells[col].columnSpan ?? 1);
                return [makeCellPage(60 * columnSpan, 20)];
            }
        );
        tableSource.tableRows[0].tableCells = [
            { columnSpan: 2, vAlign: VerticalAlignmentType.TOP },
            { rowSpan: 0, columnSpan: 0, vAlign: VerticalAlignmentType.TOP },
            { vAlign: VerticalAlignmentType.TOP },
        ];
        tableNode.children[0] = createRowNode(1, 30, 3) as any;

        const skeleton = createTableSkeleton(ctx, curPage, viewModel, tableNode, sectionBreakConfig);

        expect(skeleton).not.toBeNull();
        const cells = skeleton!.rows[0].cells;
        expect(cells).toHaveLength(3);
        expect((cells[1] as any).isMergedCellCovered).toBe(true);
        expect(cells[2].left).toBe(120);
        expect(createSkeletonCellPagesMock.mock.calls.some((call) => call[5] === 0 && call[6] === 1)).toBe(false);
    });

    it('does not shift cells after a same-row horizontally covered merged cell', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        createSkeletonCellPagesMock.mockImplementation(
            (_ctx: unknown, _viewModel: unknown, _cellNode: unknown, _section: unknown, table: any, row: number, col: number) => {
                const columnSpan = Math.max(1, table.tableRows[row].tableCells[col].columnSpan ?? 1);
                return [makeCellPage(60 * columnSpan, 20)];
            }
        );
        tableSource.tableRows[0].tableCells = [
            { vAlign: VerticalAlignmentType.TOP },
            { columnSpan: 2, vAlign: VerticalAlignmentType.TOP },
            { rowSpan: 0, columnSpan: 0, vAlign: VerticalAlignmentType.TOP },
            { vAlign: VerticalAlignmentType.TOP },
        ];
        tableNode.children[0] = createRowNode(1, 30, 4) as any;

        const skeleton = createTableSkeleton(ctx, curPage, viewModel, tableNode, sectionBreakConfig);

        expect(skeleton?.rows[0].cells[3].left).toBe(180);
    });

    it('expands merged master cell height across spanned rows', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        tableSource.tableRows[0].tableCells = [
            { rowSpan: 2, columnSpan: 2, vAlign: VerticalAlignmentType.TOP },
            { rowSpan: 0, columnSpan: 0, vAlign: VerticalAlignmentType.TOP },
        ];
        tableSource.tableRows[1].tableCells = [
            { rowSpan: 0, columnSpan: 0, vAlign: VerticalAlignmentType.TOP },
            { rowSpan: 0, columnSpan: 0, vAlign: VerticalAlignmentType.TOP },
        ];

        const skeleton = createTableSkeleton(ctx, curPage, viewModel, tableNode, sectionBreakConfig);

        expect(skeleton?.rows[0].cells[0].pageHeight).toBe(
            skeleton!.rows[0].height + skeleton!.rows[1].height
        );
    });

    it('treats explicit row height as a minimum so wrapped cell content remains visible', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        tableSource.tableRows[0].trHeight = {
            hRule: TableRowHeightRule.EXACT,
            val: { v: 18 },
        };
        createSkeletonCellPagesMock.mockImplementation(
            (_ctx: unknown, _viewModel: unknown, _cellNode: unknown, _section: unknown, _table: unknown, row: number) =>
                [makeCellPage(60, row === 0 ? 48 : 20)]
        );

        const skeleton = createTableSkeleton(ctx, curPage, viewModel, tableNode, sectionBreakConfig);

        expect(skeleton?.rows[0].height).toBe(50);
        expect(skeleton?.rows[0].cells[0].pageHeight).toBe(50);
    });

    it('creates sliced tables when available height is limited', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig } = createContextAndTable();

        const result = createTableSkeletons(ctx, curPage, viewModel, tableNode, sectionBreakConfig, 90);
        expect(result.skeTables.length).toBeGreaterThan(0);
        expect(typeof result.fromCurrentPage).toBe('boolean');
        expect(result.skeTables[0].rows.length).toBeGreaterThan(0);

        if (result.skeTables.length > 1) {
            expect(result.skeTables[1].tableId).toContain('#-#');
        }
    });

    it('keeps a table on the current page when it only slightly overflows available height', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        useDocumentFlavor(sectionBreakConfig, DocumentFlavor.TRADITIONAL);
        tableSource.tableRows = [
            {
                repeatHeaderRow: BooleanNumber.FALSE,
                trHeight: {
                    hRule: TableRowHeightRule.AUTO,
                    val: { v: 16 },
                },
                cantSplit: BooleanNumber.FALSE,
                tableCells: [
                    { vAlign: VerticalAlignmentType.TOP },
                    { vAlign: VerticalAlignmentType.TOP },
                ],
            },
        ];
        tableNode.children = [createRowNode(1, 20, 2) as any];
        createSkeletonCellPagesMock.mockImplementation(() => [makeCellPage(60, 115)]);

        const result = createTableSkeletons(ctx, curPage, viewModel, tableNode, sectionBreakConfig, 109);

        expect(result.skeTables[0].height).toBe(117);
        expect(result.fromCurrentPage).toBe(true);
    });

    it('opens a new table slice in modern documents when it overflows available height', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        useDocumentFlavor(sectionBreakConfig, DocumentFlavor.MODERN);
        tableSource.tableRows = [
            {
                repeatHeaderRow: BooleanNumber.FALSE,
                trHeight: {
                    hRule: TableRowHeightRule.AUTO,
                    val: { v: 16 },
                },
                cantSplit: BooleanNumber.FALSE,
                tableCells: [
                    { vAlign: VerticalAlignmentType.TOP },
                    { vAlign: VerticalAlignmentType.TOP },
                ],
            },
        ];
        tableNode.children = [createRowNode(1, 20, 2) as any];
        createSkeletonCellPagesMock.mockImplementation(() => [makeCellPage(60, 115)]);

        const result = createTableSkeletons(ctx, curPage, viewModel, tableNode, sectionBreakConfig, 109);

        expect(result.skeTables[0].height).toBe(117);
        expect(result.fromCurrentPage).toBe(false);
    });

    it('lays out splittable auto rows against the remaining page height', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        tableSource.tableRows[0].repeatHeaderRow = BooleanNumber.FALSE;
        tableSource.tableRows[0].trHeight = {
            hRule: TableRowHeightRule.EXACT,
            val: { v: 140 },
        };
        tableSource.tableRows[1].trHeight = {
            hRule: TableRowHeightRule.AUTO,
            val: { v: 0 },
        };
        tableSource.tableRows[1].cantSplit = BooleanNumber.FALSE;
        createSkeletonCellPagesMock.mockImplementation(
            (_ctx: unknown, _viewModel: unknown, _cellNode: unknown, _section: unknown, _table: unknown, row: number, _col: number) =>
                row === 0 ? [makeCellPage(60, 20)] : [makeCellPage(60, 80)]
        );

        createTableSkeletons(ctx, curPage, viewModel, tableNode, sectionBreakConfig, 240);

        const secondRowCall = createSkeletonCellPagesMock.mock.calls.find((call) => call[5] === 1 && call[6] === 0);
        expect(secondRowCall?.[7]).toBe(100);
    });

    it('keeps a splittable auto row on the current page when its first slice slightly overflows', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        useDocumentFlavor(sectionBreakConfig, DocumentFlavor.TRADITIONAL);
        tableSource.tableRows[0].repeatHeaderRow = BooleanNumber.FALSE;
        tableSource.tableRows[0].trHeight = {
            hRule: TableRowHeightRule.EXACT,
            val: { v: 140 },
        };
        tableSource.tableRows[1].trHeight = {
            hRule: TableRowHeightRule.AUTO,
            val: { v: 0 },
        };
        tableSource.tableRows[1].cantSplit = BooleanNumber.FALSE;
        createSkeletonCellPagesMock.mockImplementation(
            (_ctx: unknown, _viewModel: unknown, _cellNode: unknown, _section: unknown, _table: unknown, row: number) =>
                row === 0 ? [makeCellPage(60, 20)] : [makeCellPage(60, 100.5)]
        );

        const result = createTableSkeletons(ctx, curPage, viewModel, tableNode, sectionBreakConfig, 240);

        expect(result.skeTables[0].rows.map((row) => row.index)).toEqual([0, 1]);
        expect(result.skeTables[1]?.rows.map((row) => row.index) ?? []).not.toContain(1);
    });

    it('repeats multiple leading header rows on sliced table pages', () => {
        const { ctx, curPage, viewModel, tableNode, sectionBreakConfig, tableSource } = createContextAndTable();
        tableSource.tableRows[1].repeatHeaderRow = BooleanNumber.TRUE;
        tableSource.tableRows.push(
            {
                repeatHeaderRow: BooleanNumber.FALSE,
                trHeight: {
                    hRule: TableRowHeightRule.EXACT,
                    val: { v: 70 },
                },
                cantSplit: BooleanNumber.FALSE,
                tableCells: [
                    { vAlign: VerticalAlignmentType.TOP },
                    { vAlign: VerticalAlignmentType.TOP },
                ],
            },
            {
                repeatHeaderRow: BooleanNumber.FALSE,
                trHeight: {
                    hRule: TableRowHeightRule.EXACT,
                    val: { v: 40 },
                },
                cantSplit: BooleanNumber.FALSE,
                tableCells: [
                    { vAlign: VerticalAlignmentType.TOP },
                    { vAlign: VerticalAlignmentType.TOP },
                ],
            }
        );
        tableNode.children.push(createRowNode(41, 60, 2) as any, createRowNode(61, 80, 2) as any);

        const result = createTableSkeletons(ctx, curPage, viewModel, tableNode, sectionBreakConfig, 110);

        expect(result.skeTables.length).toBeGreaterThan(1);
        expect(result.skeTables[1].rows[0]).toMatchObject({ index: 0, isRepeatRow: true });
        expect(result.skeTables[1].rows[1]).toMatchObject({ index: 1, isRepeatRow: true });
        expect(result.skeTables[1].rows[2]).toMatchObject({ index: 2, isRepeatRow: false });
    });

    it('returns an empty slice result when the table is missing', () => {
        const { ctx, curPage, tableNode, sectionBreakConfig } = createContextAndTable();
        const noTableViewModel = {
            getTableByStartIndex: vi.fn(() => null),
        };

        expect(createTableSkeleton(ctx, curPage, noTableViewModel as any, tableNode, sectionBreakConfig)).toBeNull();
        const sliced = createTableSkeletons(ctx, curPage, noTableViewModel as any, tableNode, sectionBreakConfig, 100);
        expect(sliced.skeTables).toEqual([]);
        expect(sliced.fromCurrentPage).toBe(false);
    });
});
