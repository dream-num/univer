export class InvertedIndexCache {
    /**
     * {
     *    unitId:{
     *       sheetId:{
     *          'columnIndex': {
     *              'operatorToken':{ //'=*10'
     *                 '10':{
     *                      row:1,
     *                      column:1,
     *                  }
     *              }
     *          }
     *       }
     *    }
     * }
     */
    private _cache: Map<string, Map<string, Map<number, Map<string, Map<string | number | boolean, number[]>>>>> =
        new Map();

    private _continueBuildingCache: Map<string, Map<string, Map<number, { startRow: number; endRow: number }>>> =
        new Map();

    set(
        unitId: string,
        sheetId: string,
        column: number,
        operatorToken: string,
        value: string | number | boolean,
        row: number
    ) {
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

        let operatorMap = columnMap.get(operatorToken);
        if (operatorMap == null) {
            operatorMap = new Map();
            columnMap.set(operatorToken, operatorMap);
        }

        let cellList = operatorMap.get(value);
        if (cellList == null) {
            cellList = [];
            operatorMap.set(value, cellList);
        }

        cellList.push(row);
    }

    getCellPositions(
        unitId: string,
        sheetId: string,
        column: number,
        operatorToken: string,
        value: string | number | boolean
    ) {
        return this._cache.get(unitId)?.get(sheetId)?.get(column)?.get(operatorToken)?.get(value);
    }

    getCellPosition(
        unitId: string,
        sheetId: string,
        column: number,
        operatorToken: string,
        value: string | number | boolean,
        startRow: number,
        endRow: number
    ) {
        const rows = this.getCellPositions(unitId, sheetId, column, operatorToken, value);
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

        columnMap.startRow = startRow;

        columnMap.endRow = endRow;
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
    }
}

export const CELL_INVERTED_INDEX_CACHE = new InvertedIndexCache();
