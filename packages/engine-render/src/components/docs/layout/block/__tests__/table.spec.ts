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
import { TableAlignmentType, TableSizeType } from '@univerjs/core';
import { describe, expect, it } from 'vitest';
import { getNullTableSkeleton, getTableIdAndSliceIndex, getTableSliceId, rollbackListCache } from '../table';

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
    });
});
