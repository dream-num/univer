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

import { describe, expect, it } from 'vitest';
import { getTableAutoExpandCandidates, resolveTableAutoExpandCandidates } from '../auto-expand';

const table = { tableId: 'orders', range: { startRow: 2, endRow: 5, startColumn: 2, endColumn: 4 } };
const range = (startRow: number, endRow: number, startColumn: number, endColumn = startColumn) => ({ startRow, endRow, startColumn, endColumn });

describe('Table auto expansion candidates', () => {
    it.each([
        [range(6, 6, 2), 'row', range(2, 6, 2, 4)],
        [range(2, 2, 5), 'column', range(2, 5, 2, 5)],
        [range(3, 3, 5), 'column', range(2, 5, 2, 5)],
        [range(5, 8, 2, 4), 'row', range(2, 8, 2, 4)],
        [range(6, 8, 2, 6), 'row', range(2, 8, 2, 4)],
        [range(3, 7, 5, 7), 'column', range(2, 5, 2, 7)],
        [range(5, 7, 4, 6), 'row', range(2, 7, 2, 4)],
    ])('expands the complete strip for %o', (target, direction, expected) => {
        const candidates = getTableAutoExpandCandidates([table], [target]);
        expect(candidates).toHaveLength(1);
        expect(candidates[0]).toMatchObject({ tableId: table.tableId, direction, oldRange: table.range, newRange: expected });
    });

    it.each([range(6, 6, 5), range(7, 7, 2), range(5, 5, 1), range(1, 1, 2), range(3, 4, 3, 4)])('does not expand for %o', (target) => {
        expect(getTableAutoExpandCandidates([table], [target])).toEqual([]);
    });

    it('preserves a blank paste rectangle without requiring nonempty cells', () => {
        expect(getTableAutoExpandCandidates([table], [range(6, 8, 2, 4)])[0].newRange).toEqual(range(2, 8, 2, 4));
    });

    it('does not absorb a separate write beyond a physical gap', () => {
        expect(getTableAutoExpandCandidates([table], [range(6, 6, 2), range(8, 8, 2)])[0].newRange).toEqual(range(2, 6, 2, 4));
    });

    it('selects the row candidate for a shared input and does not fall back if it is invalid', () => {
        const left = { tableId: 'left', range: range(6, 9, 0, 1) };
        const upper = { tableId: 'upper', range: range(2, 5, 2, 4) };
        for (const tables of [[left, upper], [upper, left]]) {
            const candidates = getTableAutoExpandCandidates(tables, [range(6, 6, 2)]);
            expect(candidates.map((candidate) => candidate.tableId)).toEqual(['upper']);
            expect(resolveTableAutoExpandCandidates(candidates, () => false)).toEqual([]);
        }
    });

    it('does not suppress independent input positions of another candidate', () => {
        const left = { tableId: 'left', range: range(6, 9, 0, 1) };
        const upper = { tableId: 'upper', range: range(2, 5, 2, 4) };
        const candidates = getTableAutoExpandCandidates([left, upper], [range(6, 7, 2)]);
        expect(candidates.map((candidate) => candidate.tableId).sort()).toEqual(['left', 'upper']);
        expect(resolveTableAutoExpandCandidates(candidates, () => true)).toEqual([]);
    });

    it('keeps an independent legal table when another table cannot expand', () => {
        const right = { tableId: 'right', range: range(2, 5, 7, 9) };
        const candidates = getTableAutoExpandCandidates([table, right], [range(6, 7, 2, 9)]);
        expect(resolveTableAutoExpandCandidates(candidates, (candidate) => candidate.tableId !== 'orders').map((candidate) => candidate.tableId)).toEqual(['right']);
    });

    it('cancels every member of a collision chain regardless of enumeration order', () => {
        const a = { tableId: 'a', direction: 'row' as const, oldRange: range(0, 1, 0, 1), newRange: range(0, 5, 0, 1), addedRanges: [range(2, 5, 0, 1)] };
        const b = { tableId: 'b', direction: 'column' as const, oldRange: range(3, 4, 2, 3), newRange: range(3, 4, 0, 5), addedRanges: [range(3, 4, 0, 1), range(3, 4, 4, 5)] };
        const c = { tableId: 'c', direction: 'row' as const, oldRange: range(0, 1, 4, 5), newRange: range(0, 5, 4, 5), addedRanges: [range(2, 5, 4, 5)] };
        const independent = { ...a, tableId: 'independent', oldRange: range(0, 1, 10, 11), newRange: range(0, 5, 10, 11), addedRanges: [range(2, 5, 10, 11)] };
        for (const candidates of [[a, b, c, independent], [independent, c, b, a]]) {
            expect(resolveTableAutoExpandCandidates(candidates, () => true).map((candidate) => candidate.tableId)).toEqual(['independent']);
            expect(resolveTableAutoExpandCandidates(candidates, (candidate) => candidate.tableId !== 'b').map((candidate) => candidate.tableId).sort()).toEqual(['a', 'c', 'independent']);
        }
    });

    it('does not expand rows below a footer but permits a right-side candidate', () => {
        const footer = { ...table, showFooter: true };
        expect(getTableAutoExpandCandidates([footer], [range(6, 6, 2)])).toEqual([]);
        expect(getTableAutoExpandCandidates([footer], [range(3, 3, 5)])[0].direction).toBe('column');
    });

    it('does not mutate the original table or target ranges', () => {
        const target = range(6, 7, 2);
        getTableAutoExpandCandidates([table], [target]);
        expect(table.range).toEqual(range(2, 5, 2, 4));
        expect(target).toEqual(range(6, 7, 2));
    });
});
