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

import type { NumericTuple } from '@flatten-js/interval-tree';
import type { ErrorType } from './error-type';
import IntervalTree from '@flatten-js/interval-tree';
import { isRealNum } from '@univerjs/core';
import { ERROR_TYPE_SET } from './error-type';

type ValueType = string | number | boolean;
type ValueTypeWithNullUndefined = ValueType | null | undefined;
type ValueTypeWithSymbol = ValueType | symbol;

// empty cell, empty string and null value share the same inverted index cache key
export const DEFAULT_EMPTY_CELL_KEY = Symbol('EMPTY_CELL');

const normalizedValueMap: Map<ValueTypeWithNullUndefined, ValueTypeWithSymbol> = new Map();

function normalizeValue(value: ValueTypeWithNullUndefined): ValueTypeWithSymbol {
    if (normalizedValueMap.has(value)) {
        return normalizedValueMap.get(value) as ValueTypeWithSymbol;
    }

    let _value: ValueTypeWithSymbol;

    if (value === null || value === undefined || value === '') {
        _value = DEFAULT_EMPTY_CELL_KEY;
    } else if (isRealNum(value) && Number(value).toString() === value.toString()) {
        // Number string that can be converted to number will be converted to number and stored in the inverted index cache, but '12a' or '012' will not be converted to number, because they are not pure number string.
        _value = Number(value) === 0 ? 0 : Number(value);
    } else if (typeof value === 'string') {
        // For string value, we will convert it to lower case to make the compare operation case-insensitive.
        _value = value.toLowerCase();
    } else {
        _value = value;
    }

    normalizedValueMap.set(value, _value);
    return _value;
}

export class InvertedIndexCache {
    /**
     * {
     *    unitId:{
     *       sheetId:{
     *          'columnIndex': {
     *              10:[1,3,4,5],
     *              5:[2,6,11,22]
     *          }
     *       }
     *    }
     * }
     */
    private _cache: Map<string, Map<string, Map<number, Map<ValueTypeWithSymbol, Set<number>>>>> = new Map();

    private _continueBuildingCache: Map<string, Map<string, Map<number, IntervalTree<NumericTuple>>>> = new Map();

    set(unitId: string, sheetId: string, column: number, value: ValueTypeWithNullUndefined, row: number, isForceUpdate: boolean = false) {
        if (!this.shouldContinueBuildingCache(unitId, sheetId, column, row) && !isForceUpdate) {
            return;
        }

        let unitMap = this._cache.get(unitId);
        if (unitMap == null) {
            unitMap = new Map();
            this._cache.set(unitId, unitMap);
        }

        let sheetMap = unitMap.get(sheetId);
        if (sheetMap == null) {
            sheetMap = new Map();
            unitMap.set(sheetId, sheetMap);
        }

        let columnMap = sheetMap.get(column);
        if (columnMap == null) {
            columnMap = new Map();
            sheetMap.set(column, columnMap);
        }

        // If is force update, we need to remove the old value from the map
        if (isForceUpdate) {
            for (const [_, _cellList] of columnMap) {
                if (_cellList.has(row)) {
                    _cellList.delete(row);
                    break;
                }
            }
        }

        const _value = normalizeValue(value);

        let cellList = columnMap.get(_value);
        if (cellList == null) {
            cellList = new Set<number>();
            columnMap.set(_value, cellList);
        }

        cellList.add(row);
    }

    getCellValuePositions(unitId: string, sheetId: string, column: number) {
        return this._cache.get(unitId)?.get(sheetId)?.get(column);
    }

    getCellPositions(unitId: string, sheetId: string, column: number, value: ValueTypeWithNullUndefined, rowsInCache: NumericTuple[]): {
        errorType: ErrorType | null;
        matchingRows: number[];
    } | undefined {
        const columnMap = this._cache.get(unitId)?.get(sheetId)?.get(column);
        if (!columnMap) return;

        const result: {
            errorType: ErrorType | null;
            matchingRows: number[];
        } = {
            errorType: null,
            matchingRows: [],
        };

        const _value = normalizeValue(value);

        if (ERROR_TYPE_SET.has(_value as ErrorType)) {
            result.errorType = _value as ErrorType;
        } else if (_value === 0) {
            const rows = [];

            const rowsForZero = columnMap.get(0);
            if (rowsForZero) {
                rows.push(...rowsForZero);
            }

            const rowsForEmpty = columnMap.get(DEFAULT_EMPTY_CELL_KEY);
            if (rowsForEmpty) {
                rows.push(...rowsForEmpty);
            }

            result.matchingRows = rows.filter((row) => rowsInCache.some(([start, end]) => row >= start && row <= end));
        } else if (_value === DEFAULT_EMPTY_CELL_KEY) {
            result.matchingRows = Array.from(columnMap.get(DEFAULT_EMPTY_CELL_KEY) ?? []).filter((row) => rowsInCache.some(([start, end]) => row >= start && row <= end));
        } else {
            result.matchingRows = Array.from(columnMap.get(_value) ?? []).filter((row) => rowsInCache.some(([start, end]) => row >= start && row <= end));
        }

        return result;
    }

    setContinueBuildingCache(unitId: string, sheetId: string, column: number, startRow: number, endRow: number) {
        if (column === -1 || startRow === -1 || endRow === -1) {
            return;
        }

        let unitMap = this._continueBuildingCache.get(unitId);
        if (unitMap == null) {
            unitMap = new Map();
            this._continueBuildingCache.set(unitId, unitMap);
        }

        let sheetMap = unitMap.get(sheetId);
        if (sheetMap == null) {
            sheetMap = new Map();
            unitMap.set(sheetId, sheetMap);
        }

        let columnMap = sheetMap.get(column);
        if (columnMap == null) {
            columnMap = new IntervalTree<NumericTuple>();
            columnMap.insert([startRow, endRow]);
            sheetMap.set(column, columnMap);
            return;
        }

        this._handleNewInterval(columnMap, startRow, endRow);
    }

    shouldContinueBuildingCache(unitId: string, sheetId: string, column: number, row: number) {
        if (column === -1 || row === -1) {
            return false;
        }

        const columnMap = this._continueBuildingCache.get(unitId)?.get(sheetId)?.get(column);

        if (!columnMap) {
            return true;
        }

        const result = columnMap.search([row, row]);

        return result.length === 0;
    }

    canUseCache(unitId: string, sheetId: string, column: number, rangeStartRow: number, rangeEndRow: number) {
        const columnMap = this._continueBuildingCache.get(unitId)?.get(sheetId)?.get(column);

        if (column === -1 || rangeStartRow === -1 || rangeEndRow === -1 || !columnMap) {
            return {
                rowsInCache: [],
                rowsNotInCache: [],
            };
        }

        const result = columnMap.search([rangeStartRow, rangeEndRow]);

        if (result.length === 0) {
            return {
                rowsInCache: [],
                rowsNotInCache: [],
            };
        }

        result.sort((a, b) => a[0] - b[0]);

        const rowsInCache: NumericTuple[] = [];
        const rowsNotInCache: NumericTuple[] = [];

        let _rangeStartRow = rangeStartRow;

        for (let i = 0; i < result.length; i++) {
            const [start, end] = result[i];

            if (_rangeStartRow >= start) {
                if (rangeEndRow <= end) {
                    rowsInCache.push([_rangeStartRow, rangeEndRow]);
                    break;
                }

                rowsInCache.push([_rangeStartRow, end]);
                _rangeStartRow = end + 1;

                if (i === result.length - 1 && _rangeStartRow <= rangeEndRow) {
                    rowsNotInCache.push([_rangeStartRow, rangeEndRow]);
                }
            } else {
                if (rangeEndRow > end) {
                    rowsInCache.push([start, end]);
                    rowsNotInCache.push([_rangeStartRow, start - 1]);
                    _rangeStartRow = end + 1;

                    if (i === result.length - 1 && _rangeStartRow <= rangeEndRow) {
                        rowsNotInCache.push([_rangeStartRow, rangeEndRow]);
                    }
                    continue;
                }

                rowsInCache.push([start, rangeEndRow]);
                rowsNotInCache.push([_rangeStartRow, start - 1]);
            }
        }

        return {
            rowsInCache,
            rowsNotInCache,
        };
    }

    clear() {
        this._cache.clear();
        this._continueBuildingCache.clear();
        normalizedValueMap.clear();
    }

    private _handleNewInterval(columnMap: IntervalTree<NumericTuple>, startRow: number, endRow: number) {
        let result = columnMap.search([startRow, endRow]);

        // the range is not overlapping with any existing range
        if (result.length === 0) {
            // check if the range is adjacent to any existing range
            const adjacentRange: NumericTuple = [startRow - 1 < 0 ? 0 : startRow - 1, endRow + 1];

            result = columnMap.search(adjacentRange);

            // the range is not overlapping or adjacent to any existing range, then insert it
            if (result.length === 0) {
                columnMap.insert([startRow, endRow]);
                return;
            }
        }

        // merge overlapping or adjacent ranges
        let min = startRow;
        let max = endRow;

        for (const interval of result) {
            min = Math.min(min, interval[0]);
            max = Math.max(max, interval[1]);
            columnMap.remove(interval);
        }

        columnMap.insert([min, max]);
    }
}

export const CELL_INVERTED_INDEX_CACHE = new InvertedIndexCache();
