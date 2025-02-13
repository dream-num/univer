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

import type { IRange } from './typedef';
import { LRUMap, Rectangle, Tools } from '../shared';
import { Disposable } from '../shared/lifecycle';
import { RANGE_TYPE } from './typedef';

export class SpanModel extends Disposable {
    /**
     * @property Cache for RANGE_TYPE.NORMAL
     */
    private _cellCache: Map<number, Map<number, number>> = new Map();
    /**
     * @property Cache for RANGE_TYPE.ROW
     */
    private _rowCache: Map<number, number> = new Map();
    /**
     * @property Cache for RANGE_TYPE.COLUMN
     */
    private _columnCache: Map<number, number> = new Map();
    /**
     * @property Whether has RANGE_TYPE.ROW
     */
    private _hasRow: boolean = false;
    /**
     * @property Whether has RANGE_TYPE.COLUMN
     */
    private _hasColumn: boolean = false;
    /**
     * @property Whether has RANGE_TYPE.ALL
     */
    private _hasAll: boolean = false;
    /**
     * @property Index for RANGE_TYPE.ALL
     */
    private _allIndex: number = -1;

    /**
     * @property the original merge data
     */
    private _mergeData: IRange[];

    private _rangeMap: LRUMap<string, number[]> = new LRUMap<string, number[]>(50000);

    private _skeletonCache: LRUMap<string, number[]> = new LRUMap<string, number[]>(50000); ;

    constructor(mergeData: IRange[]) {
        super();
        this._init(mergeData.concat());
    }

    private _init(mergeData: IRange[]) {
        this._mergeData = mergeData;
        this._createCache(mergeData);
    }

    private _clearCache() {
        this._cellCache.clear();
        this._rowCache.clear();
        this._columnCache.clear();
        this._hasAll = false;
        this._allIndex = -1;
        this._rangeMap.clear();
        this._skeletonCache.clear();
        this._hasColumn = false;
        this._hasRow = false;
    }

    private _createCache(mergeData: IRange[]) {
        let index = 0;
        for (const range of mergeData) {
            const { rangeType } = range;
            if (rangeType === RANGE_TYPE.ROW) {
                this._createRowCache(range, index);
            } else if (rangeType === RANGE_TYPE.COLUMN) {
                this._createColumnCache(range, index);
            } else if (rangeType === RANGE_TYPE.ALL) {
                this._createCellAllCache(index);
            } else {
                this._createCellCache(range, index);
            }
            index++;
        }
    }

    /**
     * Rebuild the merge data cache when the merge data is changed.
     * @param {IRange[]} mergeData
     */
    rebuild(mergeData: IRange[]) {
        this._clearCache();
        this._init(mergeData.concat());
    }

    private _createRowCache(range: IRange, index: number) {
        const { startRow, endRow } = range;
        for (let i = startRow; i <= endRow; i++) {
            this._rowCache.set(i, index);
            this._hasRow = true;
        }
    }

    private _createColumnCache(range: IRange, index: number) {
        const { startColumn, endColumn } = range;
        for (let i = startColumn; i <= endColumn; i++) {
            this._columnCache.set(i, index);
            this._hasColumn = true;
        }
    }

    private _createCellAllCache(index: number) {
        this._hasAll = true;
        this._allIndex = index;
    }

    private _createCellCache(range: IRange, index: number) {
        for (let i = range.startRow; i <= range.endRow; i++) {
            let columnCache = this._cellCache.get(i);
            if (columnCache == null) {
                columnCache = new Map();
                this._cellCache.set(i, columnCache);
            }
            for (let j = range.startColumn; j <= range.endColumn; j++) {
                columnCache.set(j, index);
            }
        }
    }

    public add(range: IRange) {
        this._mergeData.push(range);
        this._clearCache();
        this._createCache(this._mergeData);
    }

    public remove(row: number, column: number) {
        const index = this._getMergeDataIndex(row, column);
        if (index !== -1) {
            this._mergeData.splice(index, 1);
            this._clearCache();
            this._createCache(this._mergeData);
        }
    }

    public getMergedCell(row: number, column: number) {
        const index = this._getMergeDataIndex(row, column);
        if (index !== -1) {
            return this._mergeData[index];
        }
        return null;
    }

    /**
     * Return index of merge data if (row,col) is in merge range. -1 means not in merge range.
     * @param row
     * @param column
     * @returns {number} index of merge range.
     */
    public getMergeDataIndex(row: number, column: number) {
        return this._getMergeDataIndex(row, column);
    }

    public isRowContainsMergedCell(row: number) {
        if (this._hasAll) {
            return true;
        }
        if (!Tools.isEmptyObject(this._columnCache)) {
            return true;
        }
        return this._mergeData.some((mergedCell) => mergedCell.startRow <= row && row <= mergedCell.endRow);
    }

    public isColumnContainsMergedCell(column: number) {
        if (this._hasAll) {
            return true;
        }
        if (!Tools.isEmptyObject(this._rowCache)) {
            return true;
        }
        return this._mergeData.some((mergedCell) => mergedCell.startColumn <= column && column <= mergedCell.endColumn);
    }

    public getMergedCellRange(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        const ranges: IRange[] = [];

        const key = `${startRow}-${startColumn}-${endRow}-${endColumn}`;
        if (this._rangeMap.has(key)) {
            return this._getRangeFromCache(key);
        }
        let index = 0;
        const indexes: number[] = [];
        for (const range of this._mergeData || []) {
            if (Rectangle.intersects(range, {
                startRow,
                endRow,
                startColumn,
                endColumn,
            })) {
                ranges.push({
                    ...range,
                });
                indexes.push(index);
            }
            index++;
        }
        this._rangeMap.set(key, indexes);
        return ranges;
    }

    /**
     * @deprecated sigificant performance impact, use _getCellMergeInfo instead.
     * @param startRow
     * @param startColumn
     * @param endRow
     * @param endColumn
     */
    public getMergedCellRangeForSkeleton(startRow: number, startColumn: number, endRow: number, endColumn: number) {
        // copy from packages\engine-render\src\components\sheets\sheet-skeleton.ts  _getMergeCells
        const cacheDataMerge: IRange[] = [];
        const mergeData = this._mergeData;
        const key = `${startRow}-${startColumn}-${endRow}-${endColumn}`;

        if (this._skeletonCache.has(key)) {
            return this._getSkeletonRangeFromCache(key);
        }
        const indexes: number[] = [];

        for (let i = 0; i < mergeData.length; i++) {
            const {
                startRow: mergeStartRow,
                endRow: mergeEndRow,
                startColumn: mergeStartColumn,
                endColumn: mergeEndColumn,
            } = mergeData[i];
            for (let r = startRow; r <= endRow; r++) {
                let isBreak = false;
                for (let c = startColumn; c <= endColumn; c++) {
                    if (r >= mergeStartRow && r <= mergeEndRow && c >= mergeStartColumn && c <= mergeEndColumn) {
                        cacheDataMerge.push({
                            startRow: mergeStartRow,
                            endRow: mergeEndRow,
                            startColumn: mergeStartColumn,
                            endColumn: mergeEndColumn,
                        });
                        indexes.push(i);
                        isBreak = true;
                        break;
                    }
                }
                if (isBreak) {
                    break;
                }
            }
        }
        this._skeletonCache.set(key, indexes);
        return cacheDataMerge;
    }

    private _getRangeFromCache(key: string) {
        const indexes = this._rangeMap.get(key) || [];
        const ranges: IRange[] = [];
        for (const index of indexes) {
            ranges.push({
                ...this._mergeData[index],
            });
        }
        return ranges;
    }

    private _getSkeletonRangeFromCache(key: string) {
        const indexes = this._skeletonCache.get(key) || [];
        const ranges: IRange[] = [];
        for (const index of indexes) {
            ranges.push({
                ...this._mergeData[index],
            });
        }
        return ranges;
    }

    private _getMergeDataIndex(row: number, column: number) {
        if (this._hasAll) {
            return this._allIndex;
        }

        if (this._hasRow) {
            const rowValue = this._rowCache.get(row);
            if (rowValue !== undefined) {
                return rowValue;
            }
        }

        if (this._hasColumn) {
            const columnValue = this._columnCache.get(column);
            if (columnValue !== undefined) {
                return columnValue;
            }
        }

        const cellValue = this._cellCache.get(row)?.get(column);
        if (cellValue !== undefined) {
            return cellValue;
        }
        return -1;
    }

    public getMergeDataSnapshot() {
        return this._mergeData;
    }

    override dispose() {
        this._clearCache();
        this._mergeData = [];
    }
}
