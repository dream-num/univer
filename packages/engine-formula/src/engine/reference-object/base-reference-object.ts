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

import type { ICellData, IRange, Nullable } from '@univerjs/core';
import type { IRuntimeUnitDataType, IUnitData, IUnitSheetNameMap, IUnitStylesData } from '../../basics/common';

import type { BaseValueObject, IArrayValueObject } from '../value-object/base-value-object';
import { CellValueType, moveRangeByOffset } from '@univerjs/core';
import { isTextFormat } from '@univerjs/engine-numfmt';
import { FormulaAstLRU } from '../../basics/cache-lru';
import { ERROR_TYPE_SET, ErrorType } from '../../basics/error-type';
import { isNullCellForFormula } from '../../basics/is-null-cell';
import { ObjectClassType } from '../../basics/object-class-type';
import { getCellValue } from '../utils/cell';
import { getRuntimeFeatureCell } from '../utils/get-runtime-feature-cell';
import { ArrayValueObject, ValueObjectFactory } from '../value-object/array-value-object';
import { ErrorValueObject } from '../value-object/base-value-object';
import {
    createBooleanValueObjectByRawValue,
    createNumberValueObjectByRawValue,
    NullValueObject,
    NumberValueObject,
    StringValueObject,
} from '../value-object/primitive-object';

export type NodeValueType = BaseValueObject | BaseReferenceObject | AsyncObject | AsyncArrayObject;

export type FunctionVariantType = BaseValueObject | BaseReferenceObject;

const FORMULA_CACHE_LRU_COUNT = 10000;

export const FORMULA_REF_TO_ARRAY_CACHE = new FormulaAstLRU<ArrayValueObject>(FORMULA_CACHE_LRU_COUNT);
export class BaseReferenceObject extends ObjectClassType {
    private _forcedSheetId: Nullable<string> = '';

    private _forcedSheetName: string = '';

    private _defaultSheetId: string = '';

    private _rangeData: IRange = {
        startColumn: -1,
        startRow: -1,
        endRow: -1,
        endColumn: -1,
    };

    private _unitData: IUnitData = {};

    private _unitStylesData: IUnitStylesData = {};

    private _filteredOutRows: number[] = [];

    private _defaultUnitId: string = '';

    private _forcedUnitId: string = '';

    private _runtimeData: IRuntimeUnitDataType = {};

    private _arrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeArrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeFeatureCellData: { [featureId: string]: IRuntimeUnitDataType } = {};

    private _refOffsetX = 0;

    private _refOffsetY = 0;

    constructor(private _token: string) {
        super();
    }

    override dispose(): void {
        this._unitData = {};

        this._unitStylesData = {};

        this._runtimeData = {};
    }

    getToken() {
        return this._token;
    }

    setToken(token: string) {
        this._token = token;
    }

    isExceedRange() {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();

        if (startRow < 0 || startColumn < 0 || endRow >= this.getActiveSheetRowCount() || endColumn >= this.getActiveSheetColumnCount()) {
            return true;
        }
        return false;
    }

    setRefOffset(x: number = 0, y: number = 0) {
        this._refOffsetX = x;
        this._refOffsetY = y;
    }

    getRefOffset() {
        return {
            x: this._refOffsetX,
            y: this._refOffsetY,
        };
    }

    getRangePosition() {
        let { startRow, startColumn, endRow, endColumn } = moveRangeByOffset(this._rangeData, this._refOffsetX, this._refOffsetY);

        if (Number.isNaN(startRow)) {
            startRow = 0;
        }

        if (Number.isNaN(startColumn)) {
            startColumn = 0;
        }

        if (Number.isNaN(endRow)) {
            endRow = this.getActiveSheetRowCount() - 1;
        }

        if (Number.isNaN(endColumn)) {
            endColumn = this.getActiveSheetColumnCount() - 1;
        }

        return {
            ...this._rangeData,
            startRow,
            endRow,
            startColumn,
            endColumn,
        };
    }

    override isReferenceObject() {
        return true;
    }

    iterator(
        callback: (valueObject: Nullable<BaseValueObject>, rowIndex: number, columnIndex: number) => Nullable<boolean>
    ) {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();

        if (this._checkIfWorksheetMiss()) {
            return callback(ErrorValueObject.create(ErrorType.VALUE), startRow, startColumn);
        }

        const unitId = this._forcedUnitId || this._defaultUnitId;
        const sheetId = this._forcedSheetId || this._defaultSheetId;

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (r < 0 || c < 0) {
                    return callback(ErrorValueObject.create(ErrorType.REF), r, c);
                }

                const cell = this.getCellData(r, c)!;
                let result: Nullable<boolean> = false;
                if (isNullCellForFormula(cell)) {
                    result = callback(null, r, c);
                    continue;
                }

                let resultObjectValue = this.getCellValueObject(cell);

                // Set numfmt pattern for first cell
                // TODO@Dushusir it does not have to be a number, the string can also be set a number format
                if (r === startRow && c === startColumn) {
                    const pattern = this.getCellPattern(unitId, sheetId, r, c);
                    if (pattern && resultObjectValue.isNumber()) {
                        const value = Number(resultObjectValue.getValue());
                        resultObjectValue = NumberValueObject.create(value, pattern);
                    }
                }

                result = callback(resultObjectValue, r, c);

                if (result === false) {
                    return;
                }
            }
        }
    }

    getFirstCell() {
        const { startRow, startColumn } = this.getRangePosition();
        const cell = this.getCellData(startRow, startColumn);

        if (!cell) {
            return NumberValueObject.create(0);
        }

        let cellValueObject = this.getCellValueObject(cell);

        // Set numfmt pattern,
        // TODO@Dushusir it does not have to be a number, the string can also be set a number format
        const unitId = this._forcedUnitId || this._defaultUnitId;
        const sheetId = this._forcedSheetId || this._defaultSheetId;
        const pattern = this.getCellPattern(unitId, sheetId, startRow, startColumn);
        if (pattern && cellValueObject.isNumber()) {
            const value = Number(cellValueObject.getValue());
            cellValueObject = NumberValueObject.create(value, pattern);
        }

        return cellValueObject;
    }

    getRangeData() {
        return this._rangeData;
    }

    setRangeData(range: IRange) {
        this._rangeData = range;
    }

    getUnitId() {
        if (this._forcedUnitId && this._forcedUnitId.length > 0) {
            return this._forcedUnitId;
        }
        return this._defaultUnitId;
    }

    getSheetId() {
        if (this._forcedSheetId && this._forcedSheetId.length > 0) {
            return this._forcedSheetId;
        }
        return this._defaultSheetId;
    }

    setForcedUnitIdDirect(unitId: string) {
        if (unitId.length > 0) {
            this._forcedUnitId = unitId;
        }
    }

    getForcedUnitId() {
        return this._forcedUnitId;
    }

    setForcedSheetId(sheetNameMap: IUnitSheetNameMap) {
        this._forcedSheetId = sheetNameMap[this.getUnitId()]?.[this._forcedSheetName];
    }

    setForcedSheetIdDirect(sheetId: string) {
        this._forcedSheetId = sheetId;
    }

    getForcedSheetId() {
        return this._forcedSheetId;
    }

    setForcedSheetName(sheetName: string) {
        if (sheetName.length > 0) {
            this._forcedSheetName = sheetName;
        }
    }

    getForcedSheetName() {
        return this._forcedSheetName;
    }

    setDefaultSheetId(sheetId: string) {
        this._defaultSheetId = sheetId;
    }

    getDefaultSheetId() {
        return this._defaultSheetId;
    }

    setDefaultUnitId(unitId: string) {
        this._defaultUnitId = unitId;
    }

    getDefaultUnitId() {
        return this._defaultUnitId;
    }

    getUnitData() {
        return this._unitData;
    }

    setUnitData(unitData: IUnitData) {
        this._unitData = unitData;
    }

    getUnitStylesData() {
        return this._unitStylesData;
    }

    setUnitStylesData(unitStylesData: IUnitStylesData) {
        this._unitStylesData = unitStylesData;
    }

    getFilteredOutRows() {
        return this._filteredOutRows;
    }

    setFilteredOutRows(filteredOutRows: number[]) {
        this._filteredOutRows = filteredOutRows;
    }

    getRuntimeData() {
        return this._runtimeData;
    }

    setRuntimeData(runtimeData: IRuntimeUnitDataType) {
        this._runtimeData = runtimeData;
    }

    getArrayFormulaCellData() {
        return this._arrayFormulaCellData;
    }

    setArrayFormulaCellData(unitData: IRuntimeUnitDataType) {
        this._arrayFormulaCellData = unitData;
    }

    getRuntimeArrayFormulaCellData() {
        return this._runtimeArrayFormulaCellData;
    }

    setRuntimeArrayFormulaCellData(unitData: IRuntimeUnitDataType) {
        this._runtimeArrayFormulaCellData = unitData;
    }

    getRuntimeFeatureCellData() {
        return this._runtimeFeatureCellData;
    }

    setRuntimeFeatureCellData(unitData: { [featureId: string]: IRuntimeUnitDataType }) {
        this._runtimeFeatureCellData = unitData;
    }

    getActiveSheetRowCount() {
        return this.getCurrentActiveSheetData()?.rowCount || 0;
    }

    getActiveSheetColumnCount() {
        return this.getCurrentActiveSheetData()?.columnCount || 0;
    }

    getRowCount() {
        return this._rangeData.endRow - this._rangeData.startRow + 1;
    }

    getColumnCount() {
        return this._rangeData.endColumn - this._rangeData.startColumn + 1;
    }

    getRowData() {
        return this.getCurrentActiveSheetData()?.rowData || {};
    }

    getColumnData() {
        return this.getCurrentActiveSheetData()?.columnData || {};
    }

    isCell() {
        return false;
    }

    isColumn() {
        return false;
    }

    isRow() {
        return false;
    }

    isRange() {
        return false;
    }

    isTable() {
        return false;
    }

    unionBy(referenceObject: BaseReferenceObject): NodeValueType {
        /** abstract */
        return ErrorValueObject.create(ErrorType.REF);
    }

    unionRange(rangeData1: IRange, rangeData2: IRange): IRange {
        /** abstract */
        return {
            startRow: -1,
            startColumn: -1,
            endRow: -1,
            endColumn: -1,
        };
    }

    getCellValueObject(cell: ICellData) {
        const value = getCellValue(cell);
        if (ERROR_TYPE_SET.has(value as ErrorType)) {
            return ErrorValueObject.create(value as ErrorType);
        }

        if (cell.t === CellValueType.NUMBER) {
            const pattern = this._getPatternByCell(cell);

            if (isTextFormat(pattern)) {
                return StringValueObject.create(value.toString());
            }

            return createNumberValueObjectByRawValue(value, pattern);
        }
        if (cell.t === CellValueType.STRING || cell.t === CellValueType.FORCE_STRING) {
            // A1 is `"test"`, =A1 also needs to get `"test"`
            return StringValueObject.create(value.toString());
        }
        if (cell.t === CellValueType.BOOLEAN) {
            return createBooleanValueObjectByRawValue(value);
        }

        return ValueObjectFactory.create(value);
    }

    private _getPatternByCell(cell: ICellData) {
        const styles = this._unitStylesData[this.getUnitId()];

        if (!styles) return '';

        const style = styles.getStyleByCell(cell);
        return style?.n?.pattern || '';
    }

    getCellByRow(row: number) {
        return this.getCellByPosition(row);
    }

    getCellByColumn(column: number) {
        return this.getCellByPosition(undefined, column);
    }

    getCurrentActiveSheetData() {
        return this._unitData[this.getUnitId()]?.[this.getSheetId()];
    }

    getCurrentStylesData() {
        return this._unitStylesData[this.getUnitId()];
    }

    getCurrentRuntimeSheetData() {
        return this._runtimeData?.[this.getUnitId()]?.[this.getSheetId()];
    }

    getCurrentActiveArrayFormulaCellData() {
        return this._arrayFormulaCellData?.[this.getUnitId()]?.[this.getSheetId()];
    }

    getCurrentRuntimeActiveArrayFormulaCellData() {
        return this._runtimeArrayFormulaCellData?.[this.getUnitId()]?.[this.getSheetId()];
    }

    getCellData(row: number, column: number) {
        const activeSheetData = this.getCurrentActiveSheetData();

        const activeRuntimeData = this.getCurrentRuntimeSheetData();

        const activeArrayFormulaCellData = this.getCurrentActiveArrayFormulaCellData();

        const activeRuntimeArrayFormulaCellData = this.getCurrentRuntimeActiveArrayFormulaCellData();

        return (
            activeRuntimeData?.getValue(row, column) ||
            activeRuntimeArrayFormulaCellData?.getValue(row, column) ||
            this.getRuntimeFeatureCellValue(row, column) ||
            activeArrayFormulaCellData?.getValue(row, column) ||
            activeSheetData?.cellData.getValue(row, column)
        );
    }

    getRuntimeFeatureCellValue(row: number, column: number) {
        return getRuntimeFeatureCell(row, column, this.getSheetId(), this.getUnitId(), this._runtimeFeatureCellData);
    }

    getCellByPosition(rowRaw?: number, columnRaw?: number) {
        let row = rowRaw;
        let column = columnRaw;
        if (!row) {
            row = this._rangeData.startRow;
        }

        if (!column) {
            column = this._rangeData.startColumn;
        }

        const cell = this.getCellData(row, column);

        if (!cell) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return this.getCellValueObject(cell);
    }

    /**
     * Get the pattern of the cell
     * @param unitId
     * @param sheetId
     * @param row
     * @param column
     * @returns
     */
    getCellPattern(unitId: string, sheetId: string, row: number, column: number) {
        const currentStyles = this._unitStylesData[unitId];

        if (!currentStyles) {
            return '';
        }

        const currentCell = this._unitData[unitId]?.[sheetId]?.cellData?.getValue(row, column);

        if (!currentCell) {
            return '';
        }

        const style = currentStyles.getStyleByCell(currentCell);

        return style?.n?.pattern || '';
    }

    toArrayValueObject(useCache: boolean = true): ArrayValueObject {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();

        const key = `${this.getUnitId()}_${this.getSheetId()}_${startRow}_${endRow}_${startColumn}_${endColumn}`;

        const array = FORMULA_REF_TO_ARRAY_CACHE.get(key);

        if (array && useCache) {
            return array;
        }

        const rowSize = endRow - startRow + 1;
        const columnSize = endColumn - startColumn + 1;

        if (rowSize < 0 || columnSize < 0) {
            return this._getBlankArrayValueObject();
        }

        const arrayValueList: BaseValueObject[][] = new Array(rowSize);
        this.iterator((valueObject: Nullable<BaseValueObject>, rowIndex: number, columnIndex: number) => {
            const row = rowIndex - startRow;
            const column = columnIndex - startColumn;
            if (!arrayValueList[row]) {
                arrayValueList[row] = new Array(columnSize);
            }

            if (valueObject == null) {
                valueObject = NullValueObject.create();
            }

            arrayValueList[row][column] = valueObject;
        });

        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList: arrayValueList,
            rowCount: arrayValueList.length,
            columnCount: arrayValueList[0]?.length || 0,
            unitId: this.getUnitId(),
            sheetId: this.getSheetId(),
            row: startRow,
            column: startColumn,
        };

        const arrayValueObject = ArrayValueObject.create(arrayValueObjectData);

        useCache && FORMULA_REF_TO_ARRAY_CACHE.set(key, arrayValueObject);

        return arrayValueObject;
    }

    toUnitRange() {
        return {
            range: this.getRangePosition(),
            sheetId: this.getSheetId(),
            unitId: this.getUnitId(),
        };
    }

    private _checkIfWorksheetMiss() {
        if ((this._forcedSheetId == null || this._forcedSheetId.length === 0) && this._forcedSheetName.length > 0) {
            return true;
        }
        return false;
    }

    private _getBlankArrayValueObject() {
        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList: [],
            rowCount: 0,
            columnCount: 0,
            unitId: this.getUnitId(),
            sheetId: this.getSheetId(),
            row: 0,
            column: 0,
        };

        return ArrayValueObject.create(arrayValueObjectData);
    }
}

export class AsyncObject extends ObjectClassType {
    constructor(private _promise: Promise<BaseValueObject>) {
        super();
    }

    override isAsyncObject() {
        return true;
    }

    async getValue() {
        return this._promise;
    }
}

export class AsyncArrayObject extends ObjectClassType {
    constructor(private _promiseList: Array<Array<BaseValueObject | AsyncObject>>) {
        super();
    }

    override isAsyncArrayObject() {
        return true;
    }

    async getValue() {
        const variants: BaseValueObject[][] = [];

        for (let r = 0; r < this._promiseList.length; r++) {
            const promiseCells = this._promiseList[r];
            if (variants[r] == null) {
                variants[r] = [];
            }
            for (let c = 0; c < promiseCells.length; c++) {
                const promiseCell = promiseCells[c];
                if ((promiseCell as AsyncObject).isAsyncObject()) {
                    variants[r][c] = await (promiseCell as AsyncObject).getValue();
                } else {
                    variants[r][c] = promiseCell as BaseValueObject;
                }
            }
        }

        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList: variants,
            rowCount: variants.length,
            columnCount: variants[0]?.length || 0,
            unitId: '',
            sheetId: '',
            row: 0,
            column: 0,
        };

        return ArrayValueObject.create(arrayValueObjectData);
    }
}
