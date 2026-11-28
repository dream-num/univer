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

import type { IRange } from '@univerjs/core';
import type { ITableAutoExpandCandidate, ITableAutoExpandTarget } from '../types/auto-expand';

export function getTableAutoExpandCandidates(tables: readonly ITableAutoExpandTarget[], ranges: readonly IRange[]): ITableAutoExpandCandidate[] {
    const rows = new Map<string, ITableAutoExpandCandidate>();
    const rowEntries: IRange[] = [];
    for (const table of tables) {
        const old = table.range;
        for (const target of ranges) {
            if (!crossesBottom(old, target)) {
                continue;
            }
            // Ownership precedes validation: a rejected row expansion must not fall back to a column.
            rowEntries.push({
                startRow: old.endRow + 1,
                endRow: old.endRow + 1,
                startColumn: Math.max(old.startColumn, target.startColumn),
                endColumn: Math.min(old.endColumn, target.endColumn),
            });
            if (!table.showFooter) {
                const endRow = Math.max(rows.get(table.tableId)?.newRange.endRow ?? old.endRow, target.endRow);
                rows.set(table.tableId, {
                    tableId: table.tableId,
                    direction: 'row',
                    oldRange: { ...old },
                    newRange: { ...old, endRow },
                    addedRanges: [{ ...old, startRow: old.endRow + 1, endRow }],
                });
            }
        }
    }

    const columns = new Map<string, ITableAutoExpandCandidate>();
    for (const table of tables) {
        if (rows.has(table.tableId)) {
            continue;
        }
        const old = table.range;
        for (const target of ranges) {
            if (target.startColumn < old.startColumn || target.startColumn > old.endColumn + 1 || target.endColumn <= old.endColumn
                || target.endRow < old.startRow || target.startRow > old.endRow) {
                continue;
            }
            const startRow = Math.max(old.startRow, target.startRow);
            const endRow = Math.min(old.endRow, target.endRow);
            const claimedRows = new Set(rowEntries
                .filter((entry) => entry.startRow >= startRow && entry.startRow <= endRow
                    && entry.startColumn <= old.endColumn + 1 && entry.endColumn >= old.endColumn + 1)
                .map((entry) => entry.startRow));
            if (claimedRows.size === endRow - startRow + 1) {
                continue;
            }
            const endColumn = Math.max(columns.get(table.tableId)?.newRange.endColumn ?? old.endColumn, target.endColumn);
            columns.set(table.tableId, {
                tableId: table.tableId,
                direction: 'column',
                oldRange: { ...old },
                newRange: { ...old, endColumn },
                addedRanges: [{ ...old, startColumn: old.endColumn + 1, endColumn }],
            });
        }
    }
    return [...rows.values(), ...columns.values()].sort(compareCandidates);
}

export function resolveTableAutoExpandCandidates(candidates: readonly ITableAutoExpandCandidate[], isValid: (candidate: ITableAutoExpandCandidate) => boolean): ITableAutoExpandCandidate[] {
    const valid = candidates.filter(isValid);
    const collisions = new Set<string>();
    for (let i = 0; i < valid.length; i++) {
        for (let j = i + 1; j < valid.length; j++) {
            const a = valid[i];
            const b = valid[j];
            if (a.newRange.startRow <= b.newRange.endRow && a.newRange.endRow >= b.newRange.startRow
                && a.newRange.startColumn <= b.newRange.endColumn && a.newRange.endColumn >= b.newRange.startColumn) {
                collisions.add(a.tableId);
                collisions.add(b.tableId);
            }
        }
    }
    return valid.filter((candidate) => !collisions.has(candidate.tableId)).sort(compareCandidates);
}

function compareCandidates(a: ITableAutoExpandCandidate, b: ITableAutoExpandCandidate): number {
    return a.tableId < b.tableId ? -1 : Number(a.tableId > b.tableId);
}

function crossesBottom(table: IRange, target: IRange): boolean {
    return target.startRow >= table.startRow && target.startRow <= table.endRow + 1 && target.endRow > table.endRow
        && target.endColumn >= table.startColumn && target.startColumn <= table.endColumn;
}
