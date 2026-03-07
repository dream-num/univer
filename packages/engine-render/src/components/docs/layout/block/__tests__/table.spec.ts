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

import { BooleanNumber, TableAlignmentType, TableRowHeightRule, VerticalAlignmentType } from '@univerjs/core';
import { beforeEach, describe, expect, it, vi } from 'vitest';

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

    it('handles rollback/slice id helpers and missing table branches', () => {
        const listCache = new Map<string, any[][]>([
            ['a', [[{ paragraph: { startIndex: 1 } }, { paragraph: { startIndex: 20 } }]]],
        ]);
        rollbackListCache(listCache as any, { startIndex: 5, endIndex: 50 } as any);
        expect(listCache.get('a')?.[0].length).toBe(1);

        const sliceId = getTableSliceId('table-x', 3);
        expect(sliceId).toBe('table-x#-#3');
        expect(getTableIdAndSliceIndex(sliceId)).toEqual({ tableId: 'table-x', sliceIndex: 3 });
        expect(getTableIdAndSliceIndex('table-y')).toEqual({ tableId: 'table-y', sliceIndex: 0 });

        const nullTable = getNullTableSkeleton(1, 2, { tableId: 't0' } as any);
        expect(nullTable.rows).toEqual([]);
        expect(nullTable.tableId).toBe('t0');

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
