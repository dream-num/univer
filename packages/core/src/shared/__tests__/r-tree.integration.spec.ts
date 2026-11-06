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

import { describe, expect, it, vi } from 'vitest';
import type { IRange } from '../../sheets/typedef';
import type { IRTreeItem } from '../r-tree';
import { RTree } from '../r-tree';

describe('RTree integration', () => {
    it.each([[false, 2], [true, 2], [false, 8], [true, 8]] as const)('removes sparse ranges without collecting or rebuilding the whole tree (cell cache: %s, searches: %s)', (cellCache, searchCount) => {
        const tree = new RTree(cellCache);
        const items: IRTreeItem[] = Array.from({ length: 1000 }, (_, index) => ({
            unitId: 'unit',
            sheetId: 'sheet',
            id: index,
            range: { startRow: index * 3, endRow: index * 3 + 1, startColumn: 0, endColumn: 1 },
        }));
        tree.bulkInsert(items);
        const index = tree.getTree('unit', 'sheet');
        const collect = vi.spyOn(index, 'all');
        const rebuild = vi.spyOn(index, 'load');
        try {
            const searches = Array.from({ length: searchCount }, (_, index) => items[Math.floor(index * 999 / (searchCount - 1))]);
            tree.bulkRemove(searches);
            expect(collect).not.toHaveBeenCalled();
            expect(rebuild).not.toHaveBeenCalled();
            expect(tree.bulkSearch(searches)).toEqual(new Set());
            expect(tree.bulkSearch([items[1], items[998]])).toEqual(new Set([1, 998]));
            expect(index.all()).toHaveLength(1000 - searchCount);
        } finally {
            collect.mockRestore();
            rebuild.mockRestore();
            tree.dispose();
        }
    });

    it('keeps dense removal batched even when only two searches hit thousands of entries', () => {
        const tree = new RTree();
        const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 };
        const removed = { unitId: 'unit', sheetId: 'sheet', id: 'removed', range };
        tree.bulkInsert(Array.from({ length: 4096 }, () => removed));
        tree.insert({ ...removed, id: 'keep', range: { startRow: 100, endRow: 101, startColumn: 0, endColumn: 1 } });
        const index = tree.getTree('unit', 'sheet');
        const rebuild = vi.spyOn(index, 'load');
        try {
            tree.bulkRemove([removed, { ...removed, id: 'absent' }]);
            expect(rebuild).toHaveBeenCalledTimes(1);
            expect(tree.bulkSearch([removed])).toEqual(new Set());
            expect(index.all().map((item) => item.id)).toEqual(['keep']);
        } finally {
            rebuild.mockRestore();
            tree.dispose();
        }
    });

    it('removes cached points without deleting overlapping ranges with the same ID', () => {
        const tree = new RTree(true);
        const point = (row: number, id = 'same'): IRTreeItem => ({
            unitId: 'unit',
            sheetId: 'sheet',
            id,
            range: { startRow: row, endRow: row, startColumn: 1, endColumn: 1 },
        });
        tree.bulkInsert([point(1), point(2), point(1, 'keep'), point(2, 'keep'), {
            ...point(1),
            range: { startRow: 0, endRow: 3, startColumn: 0, endColumn: 2 },
        }]);
        tree.openKdTree();
        tree.bulkRemove([point(1), point(2)]);
        expect(Array.from(tree.searchGenerator(point(1)))).toEqual(['keep', 'same']);
        expect(Array.from(tree.searchGenerator(point(2)))).toEqual(['keep', 'same']);
        tree.dispose();
    });

    it('removes unbounded cached ranges without walking every coordinate or affecting other IDs', () => {
        const tree = new RTree(true);
        const range = { startRow: 0, endRow: Infinity, startColumn: 0, endColumn: Infinity };
        const removed = { unitId: 'unit', sheetId: 'sheet', id: 'removed', range };
        tree.bulkInsert([
            { ...removed, range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
            { ...removed, id: 'keep', range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } },
            { ...removed, range: { startRow: 2, endRow: 3, startColumn: 2, endColumn: 3 } },
        ]);
        tree.openKdTree();
        tree.bulkRemove([removed, removed]);
        expect(tree.bulkSearch([removed])).toEqual(new Set(['keep']));
        expect(tree.getTree('unit', 'sheet').all()).toEqual([]);
        tree.dispose();
    });

    it('does not allocate an index when removing from an unindexed sheet', () => {
        const tree = new RTree();
        const item = { unitId: 'unit', sheetId: 'sheet', id: 1, range: { startRow: 0, endRow: 1, startColumn: 0, endColumn: 1 } };
        tree.remove(item);
        tree.bulkRemove([item, { ...item, id: 2 }]);
        expect(tree.toJSON()).toEqual({});
        tree.dispose();
    });

    it.each([false, true])('preserves batch removal of NaN IDs (cell cache: %s)', (cellCache) => {
        const tree = new RTree(cellCache);
        const items = [0, 10].map((row) => ({
            unitId: 'unit',
            sheetId: 'sheet',
            id: Number.NaN,
            range: { startRow: row, endRow: row + 1, startColumn: 0, endColumn: 1 },
        }));
        tree.bulkInsert([...items, { ...items[0], id: 'keep' }]);
        tree.bulkRemove(items);
        expect(tree.getTree('unit', 'sheet').all().map((item) => item.id)).toEqual(['keep']);
        tree.dispose();
    });

    it.each([[0.5, 0], [0, 0.5]])('preserves cached-point deletion with fractional range starts (%s, %s)', (startRow, startColumn) => {
        const tree = new RTree(true);
        const point = { unitId: 'unit', sheetId: 'sheet', id: 'removed', range: { startRow: 1, endRow: 1, startColumn: 1, endColumn: 1 } };
        tree.bulkInsert([point, { ...point, id: 'keep' }]);
        tree.openKdTree();
        const range = { startRow, endRow: 2.5, startColumn, endColumn: 2.5 };
        tree.bulkRemove([{ ...point, range }, { ...point, range, id: 'absent' }]);
        expect(tree.bulkSearch([point])).toEqual(new Set(['keep']));
        tree.dispose();
    });

    it('keeps ranged deletion of cached fractional coordinates equivalent to batch matching', () => {
        const tree = new RTree(true);
        const point = { unitId: 'unit', sheetId: 'sheet', id: 'removed', range: { startRow: 1.5, endRow: 1.5, startColumn: 1.5, endColumn: 1.5 } };
        tree.bulkInsert([point, { ...point, id: 'keep' }]);
        tree.openKdTree();
        const range = { startRow: 0, endRow: 2, startColumn: 0, endColumn: 2 };
        tree.bulkRemove([{ ...point, range }, { ...point, range, id: 'absent' }]);
        expect(tree.bulkSearch([point])).toEqual(new Set(['keep']));
        tree.dispose();
    });

    it.each([false, true])('keeps batch removal equivalent to individual removal (cell cache: %s)', (cellCache) => {
        const batch = new RTree(cellCache);
        const individual = new RTree(cellCache);
        const items: IRTreeItem[] = [];
        for (const unitId of ['unit-a', 'unit-b']) {
            for (const sheetId of ['sheet-a', 'sheet-b']) {
                for (let index = 0; index < 40; index++) {
                    const row = index % 5;
                    const column = Math.floor(index / 5);
                    items.push({ unitId, sheetId, id: index % 7, range: {
                        startRow: row,
                        endRow: row + index % 2,
                        startColumn: column,
                        endColumn: column + index % 3,
                    } });
                }
            }
        }
        batch.bulkInsert(items);
        individual.bulkInsert(items);
        batch.openKdTree();
        individual.openKdTree();
        const searches = [
            { ...items[2], range: { startRow: 2, endRow: 2, startColumn: 1, endColumn: 1 } },
            { ...items[2], range: { startRow: 0, endRow: 0, startColumn: 6, endColumn: 6 } },
            { ...items[0], range: { startRow: 0, endRow: 2, startColumn: 0, endColumn: 3 } },
            { ...items[1], range: { startRow: 1, endRow: 4, startColumn: 2, endColumn: 4 } },
            { ...items[0], range: { startRow: 4, endRow: 5, startColumn: 6, endColumn: 7 } },
            { ...items[80], range: { startRow: 0, endRow: 5, startColumn: 0, endColumn: 10 } },
        ];
        batch.bulkRemove(searches);
        for (const search of searches) {
            individual.remove(search);
        }
        for (const unitId of ['unit-a', 'unit-b']) {
            for (const sheetId of ['sheet-a', 'sheet-b']) {
                for (let row = 0; row < 6; row++) {
                    for (let column = 0; column < 10; column++) {
                        const query = { unitId, sheetId, range: { startRow: row, endRow: row, startColumn: column, endColumn: column } };
                        expect(batch.bulkSearch([query])).toEqual(individual.bulkSearch([query]));
                    }
                }
            }
        }
        batch.dispose();
        individual.dispose();
    });
    it('should index both single-cell and ranged items and support removal and serialization', () => {
        const tree = new RTree(true);

        const unitId = 'unit-1';
        const sheetId = 'sheet-1';

        const oneCellRange: IRange = { startRow: 1, endRow: 1, startColumn: 2, endColumn: 2 };
        const blockRange: IRange = { startRow: 0, endRow: 3, startColumn: 0, endColumn: 4 };
        const nanRange: IRange = { startRow: Number.NaN, endRow: Number.NaN, startColumn: Number.NaN, endColumn: Number.NaN };

        tree.bulkInsert([
            { id: 1, unitId, sheetId, range: oneCellRange },
            { id: 2, unitId, sheetId, range: blockRange },
            { id: 3, unitId, sheetId, range: nanRange },
        ]);

        // Without kd-tree, one-cell items are intentionally skipped.
        expect(Array.from(tree.searchGenerator({ unitId, sheetId, range: oneCellRange }))).toEqual([2, 3]);

        tree.openKdTree();
        expect(Array.from(tree.searchGenerator({ unitId, sheetId, range: oneCellRange }))).toEqual([1, 2, 3]);

        const result = tree.bulkSearch([
            { unitId, sheetId, range: oneCellRange },
            { unitId, sheetId, range: blockRange },
        ]);

        expect(Array.from(result.values()).sort()).toEqual([1, 2, 3]);

        const excepted = tree.bulkSearch([{ unitId, sheetId, range: blockRange }], new Set([2]));
        expect(Array.from(excepted.values()).sort()).toEqual([1, 3]);

        tree.remove({ id: 1, unitId, sheetId, range: oneCellRange });
        expect(Array.from(tree.searchGenerator({ unitId, sheetId, range: oneCellRange }))).toEqual([2, 3]);

        tree.remove({ id: 2, unitId, sheetId, range: blockRange });
        expect(Array.from(tree.searchGenerator({ unitId, sheetId, range: blockRange }))).toEqual([3]);

        tree.closeKdTree();
        expect(Array.from(tree.searchGenerator({ unitId, sheetId, range: oneCellRange }))).toEqual([3]);

        tree.removeById(unitId, sheetId);
        expect(Array.from(tree.searchGenerator({ unitId, sheetId, range: blockRange }))).toEqual([]);

        tree.insert({ id: 4, unitId, sheetId, range: blockRange });
        const serialized = tree.toJSON();
        const restored = new RTree();
        restored.fromJSON(serialized);

        expect(Array.from(restored.searchGenerator({ unitId, sheetId, range: oneCellRange }))).toEqual([4]);

        restored.removeById(unitId);
        expect(Array.from(restored.searchGenerator({ unitId, sheetId, range: blockRange }))).toEqual([]);
        restored.dispose();
    });
});
