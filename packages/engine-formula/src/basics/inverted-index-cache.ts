import type { IRange } from '@univerjs/core';

interface ICellPosition {
    row: number;
    column: number;
}

export class InvertedIndexCache {
    /**
     * {
     *    unitId:{
     *       sheetId:{
     *          'IAMCache': [{1,1}, {3,3}, {2,2}]
     *       }
     *    }
     * }
     */
    private _cache: Map<string, Map<string, Map<string | number | boolean, ICellPosition[]>>> = new Map();

    set(unitId: string, sheetId: string, value: string | number | boolean, row: number, column: number) {
        let sheetMap = this._cache.get(unitId);
        if (sheetMap == null) {
            sheetMap = new Map();
            this._cache.set(unitId, sheetMap);
        }

        let valueMap = sheetMap.get(sheetId);
        if (valueMap == null) {
            valueMap = new Map();
            sheetMap.set(unitId, valueMap);
        }

        let cellList = valueMap.get(value);
        if (cellList == null) {
            cellList = [];
            valueMap.set(value, cellList);
        }

        cellList.push({
            row,
            column,
        });
    }

    getCellPositions(unitId: string, sheetId: string, value: string | number | boolean) {
        return this._cache.get(unitId)?.get(sheetId)?.get(value);
    }

    getCellPosition(unitId: string, sheetId: string, value: string | number | boolean, range: IRange) {
        const positions = this.getCellPositions(unitId, sheetId, value);
        if (positions == null) {
            return;
        }
        const { startRow, startColumn, endRow, endColumn } = range;
        for (const pos of positions) {
            const { row, column } = pos;
            if (row >= startRow && row <= endRow && column >= startColumn && column <= endColumn) {
                return pos;
            }
        }
    }

    clear() {
        this._cache.clear();
    }
}

export const CELL_INVERTED_INDEX_CACHE = new InvertedIndexCache();
