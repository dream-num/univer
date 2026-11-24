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

import type { IRange } from '../sheets/typedef';
import { partitionAt } from './spatial-partition';

// The leaf size affects the order in which overlapping formula dependencies are returned.
const LEAF_CAPACITY = 65;

type DependencyId = string | number;

export class CellPoint {
    // A new cell is invisible to the open index. An indexed cell with an unknown rank uses -1.
    declare order?: number;
    // A cell with one dependency can store its ID directly.
    declare private _ids: DependencyId | Set<DependencyId>;

    constructor(readonly column: number, readonly row: number, id: DependencyId) {
        this.order = undefined;
        // Set iteration returns positive zero for either signed zero.
        this._ids = id === 0 ? 0 : id;
    }

    add(id: DependencyId) {
        if (this._ids instanceof Set) {
            this._ids.add(id);
        } else if (this._ids !== id) {
            this._ids = new Set([this._ids, id]);
        }
    }

    delete(id: DependencyId) {
        if (this._ids instanceof Set) {
            this._ids.delete(id);
        } else if (this._ids === id || Object.is(this._ids, id)) {
            this._ids = new Set();
        }
    }

    appendTo(result: DependencyId[]) {
        if (this._ids instanceof Set) {
            for (const id of this._ids) {
                result.push(id);
            }
        } else {
            result.push(this._ids);
        }
        return result;
    }

    values(): Iterable<DependencyId> {
        return this._ids instanceof Set ? this._ids : [this._ids];
    }
}

interface IPartitions {
    columns: Float64Array;
    rows: Float64Array;
    positions: number[];
    divided: Uint8Array;
}

/** Captures the indexed coordinates while keeping the dependency IDs of existing cells live. */
export class CellPointIndex {
    private _points: CellPoint[] = [];
    private _ordered = true;
    private _partitions?: IPartitions;
    private _minColumn = Infinity;
    private _maxColumn = -Infinity;
    private _minRow = Infinity;
    private _maxRow = -Infinity;
    private _integerGrid = true;

    constructor(private readonly _cells: Map<number, Map<number, CellPoint>>) {
        const points = this._points;
        let added = false;
        for (const [row, entries] of _cells) {
            this._minRow = Math.min(this._minRow, row);
            this._maxRow = Math.max(this._maxRow, row);
            if (!Number.isSafeInteger(row)) {
                this._integerGrid = false;
            }
            for (const [column, cell] of entries) {
                this._minColumn = Math.min(this._minColumn, column);
                this._maxColumn = Math.max(this._maxColumn, column);
                if (!Number.isSafeInteger(column)) {
                    this._integerGrid = false;
                }
                if (cell.order == null) {
                    added = true;
                } else if (cell.order < 0) {
                    this._ordered = false;
                }
                points.push(cell);
            }
        }
        if (points.length <= LEAF_CAPACITY) {
            this._ordered = true;
            for (let i = 0; i < points.length; i++) {
                points[i].order = i;
            }
        } else if (added) {
            // An added coordinate can change the rank of every existing point.
            this._ordered = false;
            for (const point of points) {
                point.order = -1;
            }
        } else if (this._ordered) {
            // Coordinates never leave an individual sheet map. If every point has a rank,
            // no coordinates were added since that layout was built.
            this._points = new Array(points.length);
            for (const point of points) {
                this._points[point.order!] = point;
            }
        }
    }

    private _getPartitions(): IPartitions | undefined {
        if (this._ordered) {
            return;
        }
        if (!this._partitions) {
            const points = this._points;
            const columns = new Float64Array(points.length);
            const rows = new Float64Array(points.length);
            const positions = new Array<number>(points.length);
            for (let i = 0; i < points.length; i++) {
                columns[i] = points[i].column;
                rows[i] = points[i].row;
                positions[i] = i;
            }
            this._partitions = { columns, rows, positions, divided: new Uint8Array(points.length) };
        }
        return this._partitions;
    }

    search({ startColumn, startRow, endColumn, endRow }: IRange): DependencyId[] {
        if (this._integerGrid && startColumn === endColumn && startRow === endRow) {
            const cell = this._cells.get(startRow)?.get(startColumn);
            return cell?.order != null ? cell.appendTo([]) : [];
        }
        const left = Math.max(startColumn, this._minColumn);
        const right = Math.min(endColumn, this._maxColumn);
        const top = Math.max(startRow, this._minRow);
        const bottom = Math.min(endRow, this._maxRow);
        if (!(left <= right && top <= bottom)) {
            return [];
        }
        if (this._integerGrid && (right - left + 1) * (bottom - top + 1) <= LEAF_CAPACITY) {
            const ids = this._probeCells(left, top, right, bottom);
            if (ids) {
                return ids;
            }
        }
        return this._searchTree(left, top, right, bottom);
    }

    // A small rectangle can use the cell map directly once its hits have a known visit order.
    private _probeCells(left: number, top: number, right: number, bottom: number): DependencyId[] | undefined {
        const hits: CellPoint[] = [];
        for (let row = Math.ceil(top); row <= bottom; row++) {
            const line = this._cells.get(row);
            if (line) {
                for (let column = Math.ceil(left); column <= right; column++) {
                    const cell = line.get(column);
                    if (cell?.order != null) {
                        hits.push(cell);
                    }
                }
            }
        }
        if (hits.length <= 1) {
            return hits.length ? hits[0].appendTo([]) : [];
        }
        if (this._ordered || hits.every((point) => point.order! >= 0)) {
            hits.sort((a, b) => a.order! - b.order!);
            const result: DependencyId[] = [];
            for (const cell of hits) {
                cell.appendTo(result);
            }
            return result;
        }
    }

    private _searchTree(left: number, top: number, right: number, bottom: number): DependencyId[] {
        const points = this._points;
        const result: DependencyId[] = [];
        const all = left === this._minColumn && right === this._maxColumn && top === this._minRow && bottom === this._maxRow;
        if (all && this._ordered) {
            for (const point of points) {
                point.appendTo(result);
            }
            return result;
        }

        const partitions = this._getPartitions();
        const ordered = all && partitions ? new Array<CellPoint>(points.length) : undefined;
        let keys = partitions?.columns;
        const compare = (a: number, b: number) => {
            const x = keys![a];
            const y = keys![b];
            return x === y ? 0 : x - y;
        };
        const collect = (slot: number, rank: number) => {
            const point = partitions ? points[partitions.positions[slot]] : points[rank];
            if (partitions) {
                point.order = rank;
                if (ordered) {
                    ordered[rank] = point;
                }
            }
            if (all || (point.column >= left && point.column <= right && point.row >= top && point.row <= bottom)) {
                point.appendTo(result);
            }
            return point;
        };
        const visit = (start: number, end: number, byColumn: boolean, rank: number) => {
            if (end - start <= LEAF_CAPACITY) {
                for (let i = start; i < end; i++) {
                    collect(i, rank + (i - start));
                }
                return;
            }
            const middle = (start + end - 1) >>> 1;
            if (partitions && !partitions.divided[middle]) {
                keys = byColumn ? partitions.columns : partitions.rows;
                partitionAt(partitions.positions, middle, start, end - 1, compare);
                partitions.divided[middle] = 1;
            }
            const pivot = collect(middle, rank);
            // The median is followed by the upper half and then the lower half.
            if (byColumn ? right >= pivot.column : bottom >= pivot.row) {
                visit(middle + 1, end, !byColumn, rank + 1);
            }
            if (byColumn ? left <= pivot.column : top <= pivot.row) {
                visit(start, middle, !byColumn, rank + end - middle);
            }
        };
        visit(0, points.length, true, 0);
        if (ordered) {
            this._points = ordered;
            this._ordered = true;
            this._partitions = undefined;
        }
        return result;
    }
}
