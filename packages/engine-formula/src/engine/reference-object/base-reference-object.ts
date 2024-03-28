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

import type { ICellData, IRange, Nullable } from '@univerjs/core';
import { CellValueType, isNullCell } from '@univerjs/core';

import { FormulaAstLRU } from '../../basics/cache-lru';
import type { INumfmtItemMap, IRuntimeUnitDataType, IUnitData, IUnitSheetNameMap } from '../../basics/common';
import { ERROR_TYPE_SET, ErrorType } from '../../basics/error-type';
import { ObjectClassType } from '../../basics/object-class-type';
import { ArrayValueObject, ValueObjectFactory } from '../value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject, type IArrayValueObject } from '../value-object/base-value-object';
import {
    createBooleanValueObjectByRawValue,
    createNumberValueObjectByRawValue,
    createStringValueObjectByRawValue,
    NullValueObject,
    NumberValueObject,
} from '../value-object/primitive-object';
import { getCellValue } from '../utils/cell';

export type NodeValueType = BaseValueObject | BaseReferenceObject | AsyncObject | AsyncArrayObject;

export type FunctionVariantType = BaseValueObject | BaseReferenceObject;

const FORMULA_CACHE_LRU_COUNT = 100000;

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

    private _defaultUnitId: string = '';

    private _forcedUnitId: string = '';

    private _runtimeData: IRuntimeUnitDataType = {};

    private _arrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeArrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeFeatureCellData: { [featureId: string]: IRuntimeUnitDataType } = {};

    private _numfmtItemData: INumfmtItemMap = {};

    private _refOffsetX = 0;

    private _refOffsetY = 0;

    constructor(private _token: string) {
        super();
    }

    override dispose(): void {
        this._unitData = {};

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
        let startRow = this._rangeData.startRow + this._refOffsetY;
        let endRow = this._rangeData.endRow + this._refOffsetY;
        let startColumn = this._rangeData.startColumn + this._refOffsetX;
        let endColumn = this._rangeData.endColumn + this._refOffsetX;

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

                const cell = this.getCellData(r, c);
                let result: Nullable<boolean> = false;
                if (cell == null || isNullCell(cell)) {
                    result = callback(null, r, c);
                    continue;
                }

                const resultObjectValue = this.getCellValueObject(cell);
                const isNumber = resultObjectValue.isNumber();

                const pattern = this._numfmtItemData[unitId]?.[sheetId]?.[r]?.[c];
                pattern && isNumber && resultObjectValue.setPattern(pattern);

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

        const cellValueObject = this.getCellValueObject(cell);
        const isNumber = cellValueObject.isNumber();

        // Set numfmt pattern
        const unitId = this._forcedUnitId || this._defaultUnitId;
        const sheetId = this._forcedSheetId || this._defaultSheetId;
        const numfmtItem = this._numfmtItemData[unitId]?.[sheetId]?.[startRow]?.[startColumn];
        numfmtItem && isNumber && cellValueObject.setPattern(numfmtItem);

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

    getNumfmtItemData() {
        return this._numfmtItemData;
    }

    setNumfmtItemData(numfmtItemData: INumfmtItemMap) {
        this._numfmtItemData = numfmtItemData;
    }

    getActiveSheetRowCount() {
        return this.getCurrentActiveSheetData().rowCount;
    }

    getActiveSheetColumnCount() {
        return this.getCurrentActiveSheetData().columnCount;
    }

    getRowCount() {
        return this._rangeData.endRow - this._rangeData.startRow + 1;
    }

    getColumnCount() {
        return this._rangeData.endColumn - this._rangeData.startColumn + 1;
    }

    getRowData() {
        return this.getCurrentActiveSheetData().rowData;
    }

    getColumnData() {
        return this.getCurrentActiveSheetData().columnData;
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
            return createNumberValueObjectByRawValue(value);
        }
        if (cell.t === CellValueType.STRING || cell.t === CellValueType.FORCE_STRING) {
            return createStringValueObjectByRawValue(value);
        }
        if (cell.t === CellValueType.BOOLEAN) {
            return createBooleanValueObjectByRawValue(value);
        }

        return ValueObjectFactory.create(value);
    }

    getCellByRow(row: number) {
        return this.getCellByPosition(row);
    }

    getCellByColumn(column: number) {
        return this.getCellByPosition(undefined, column);
    }

    getCurrentActiveSheetData() {
        return this._unitData[this.getUnitId()][this.getSheetId()];
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
        const featureKeys = Object.keys(this._runtimeFeatureCellData);

        for (const featureId of featureKeys) {
            const data = this._runtimeFeatureCellData[featureId];
            const runtimeFeatureCellData = data?.[this.getUnitId()]?.[this.getSheetId()];
            if (runtimeFeatureCellData == null) {
                continue;
            }

            const value = runtimeFeatureCellData.getValue(row, column);

            if (value == null) {
                continue;
            }

            return value;
        }
    }

    getCellByPosition(row?: number, column?: number) {
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
