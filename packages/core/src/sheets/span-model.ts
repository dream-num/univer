/**
 * Copyright 2023-present DreamNum Inc.
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

import { Disposable } from '../shared/lifecycle';
import { RANGE_TYPE } from './typedef';
import type { IRange } from './typedef';

interface IMergeDataCache {
    [key: string]: number;
}
class WorkSheetSpanModel extends Disposable {
    /**
     * @property Cache for RANGE_TYPE.NORMAL
     */
    private _cellCache: IMergeDataCache = {};
    /**
     * @property Cache for RANGE_TYPE.ROW
     */
    private _rowCache: IMergeDataCache = {};
    /**
     * @property Cache for RANGE_TYPE.COLUMN
     */
    private _columnCache: IMergeDataCache = {};
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

    constructor(mergeData: IRange[]) {
        super();
        this._init(mergeData.concat());
    }

    private _init(mergeData: IRange[]) {
        this._mergeData = mergeData;
        this._createCache(mergeData);
    }

    private _clearCache() {
        this._cellCache = {};
        this._rowCache = {};
        this._columnCache = {};
        this._hasAll = false;
        this._allIndex = -1;
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

    private _createRowCache(range: IRange, index: number) {
        const { startRow, endRow } = range;
        for (let i = startRow; i <= endRow; i++) {
            const key = `${i}`;
            this._rowCache[key] = index;
        }
    }

    private _createColumnCache(range: IRange, index: number) {
        const { startColumn, endColumn } = range;
        for (let i = startColumn; i <= endColumn; i++) {
            const key = `${i}`;
            this._columnCache[key] = index;
        }
    }

    private _createCellAllCache(index: number) {
        this._hasAll = true;
        this._allIndex = index;
    }

    private _createCellCache(range: IRange, index: number) {
        const key = `${range.startRow}-${range.startColumn}`;
        this._cellCache[key] = index;
    }

    public add(range: IRange) {
        this._mergeData.push(range);
        this._clearCache();
        this._createCache(this._mergeData);
    }

    public remove(row: number, column: number) {
        const index = this.getMergeDataIndex(row, column);
        if (index !== -1) {
            this._mergeData.splice(index, 1);
            this._clearCache();
            this._createCache(this._mergeData);
        }
    }

    public getMergeData(row: number, column: number) {
        const index = this.getMergeDataIndex(row, column);
        if (index !== -1) {
            return this._mergeData[index];
        }
        return undefined;
    }

    private getMergeDataIndex(row: number, column: number) {
        if (this._hasAll) {
            return this._allIndex;
        }
        const rowKey = `${row}`;
        const columnKey = `${column}`;
        if (this._rowCache[rowKey] !== undefined) {
            return this._rowCache[rowKey];
        }
        if (this._columnCache[columnKey] !== undefined) {
            return this._columnCache[columnKey];
        }
        const key = `${row}-${column}`;
        if (this._cellCache[key] !== undefined) {
            return this._cellCache[key];
        }
        return -1;
    }

    public getMergeDataSnapshot() {
        return this._mergeData;
    }
}