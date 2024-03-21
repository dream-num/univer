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
    private _cache: Map<string, Map<string, Map<number, Map<string | number | boolean | null, Set<number>>>>> = new Map();

    private _continueBuildingCache: Map<string, Map<string, Map<number, { startRow: number; endRow: number }>>> =
        new Map();

    set(unitId: string, sheetId: string, column: number, value: string | number | boolean | null, row: number) {
        if (!this.shouldContinueBuildingCache(unitId, sheetId, column, row)) {
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

        let cellList = columnMap.get(value);
        if (cellList == null) {
            cellList = new Set<number>();
            columnMap.set(value, cellList);
        }

        cellList.add(row);
    }

    getCellValuePositions(unitId: string, sheetId: string, column: number) {
        return this._cache.get(unitId)?.get(sheetId)?.get(column);
    }

    getCellPositions(unitId: string, sheetId: string, column: number, value: string | number | boolean) {
        return this._cache.get(unitId)?.get(sheetId)?.get(column)?.get(value);
    }

    getCellPosition(
        unitId: string,
        sheetId: string,
        column: number,
        value: string | number | boolean,
        startRow: number,
        endRow: number
    ) {
        const rows = this.getCellPositions(unitId, sheetId, column, value);
        if (rows == null) {
            return;
        }

        for (const row of rows) {
            if (row >= startRow && row <= endRow) {
                return row;
            }
        }
    }

    setContinueBuildingCache(unitId: string, sheetId: string, column: number, startRow: number, endRow: number) {
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
            columnMap = { startRow, endRow };
            sheetMap.set(column, columnMap);
            return;
        }

        columnMap.startRow = Math.min(columnMap.startRow, startRow);

        columnMap.endRow = Math.max(columnMap.endRow, endRow);
    }

    shouldContinueBuildingCache(unitId: string, sheetId: string, column: number, row: number) {
        const rowRange = this._continueBuildingCache.get(unitId)?.get(sheetId)?.get(column);
        if (rowRange == null) {
            return true;
        }

        const { startRow, endRow } = rowRange;

        if (row >= startRow && row <= endRow) {
            return false;
        }

        return true;
    }

    canUseCache(unitId: string, sheetId: string, column: number, rangeStartRow: number, rangeEndRow: number) {
        if (column === -1 || rangeStartRow === -1 || rangeEndRow === -1) {
            return false;
        }
        const rowRange = this._continueBuildingCache.get(unitId)?.get(sheetId)?.get(column);
        if (rowRange == null) {
            return false;
        }

        const { startRow, endRow } = rowRange;

        if (!(rangeStartRow > endRow || rangeEndRow < startRow)) {
            return true;
        }

        return false;
    }

    clear() {
        this._cache.clear();
        this._continueBuildingCache.clear();
    }
}

export const CELL_INVERTED_INDEX_CACHE = new InvertedIndexCache();
