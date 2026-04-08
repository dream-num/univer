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

import type { IRange } from '../../sheets/typedef';
import { describe, expect, it } from 'vitest';
import { RTree } from '../r-tree';

describe('RTree integration', () => {
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
