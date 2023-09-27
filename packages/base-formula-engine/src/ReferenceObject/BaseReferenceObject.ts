import { CellValueType, ICellData, ISelectionRange, Nullable } from '@univerjs/core';

import { SheetNameMapType, UnitDataType } from '../Basics/Common';
import { ERROR_TYPE_SET, ErrorType } from '../Basics/ErrorType';
import { ObjectClassType } from '../Basics/ObjectClassType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { ArrayValueObject } from '../ValueObject/ArrayValueObject';
import { BaseValueObject, CalculateValueType, IArrayValueObject } from '../ValueObject/BaseValueObject';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../ValueObject/PrimitiveObject';

export type NodeValueType = BaseValueObject | BaseReferenceObject | ErrorValueObject | AsyncObject;

export type FunctionVariantType = BaseValueObject | BaseReferenceObject | ErrorValueObject;

export class BaseReferenceObject extends ObjectClassType {
    private _forcedSheetId: string = '';

    private _forcedSheetName: string = '';

    private _defaultSheetId: string = '';

    private _rangeData: ISelectionRange = {
        startColumn: -1,
        startRow: -1,
        endRow: -1,
        endColumn: -1,
    };

    private _unitData: UnitDataType = {};

    private _rowCount: number = 0;

    private _columnCount: number = 0;

    private _defaultUnitId: string = '';

    private _forcedUnitId: string = '';

    private _runtimeData: UnitDataType = {};

    constructor(private _token: string) {
        super();
    }

    getRangePosition() {
        let startRow = this._rangeData.startRow;
        let endRow = this._rangeData.endRow;
        let startColumn = this._rangeData.startColumn;
        let endColumn = this._rangeData.endColumn;

        if (startRow === -1) {
            startRow = 0;
        }

        if (startColumn === -1) {
            startColumn = 0;
        }

        if (endRow === -1) {
            endRow = this._rowCount - 1;
        }

        if (endColumn === -1) {
            endColumn = this._columnCount - 1;
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

    iterator(callback: (valueObject: CalculateValueType, rowIndex: number, columnIndex: number) => Nullable<boolean>) {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = this.getCellData(r, c);
                let result: Nullable<boolean> = false;
                if (!cell) {
                    result = callback(new NumberValueObject(0, true), r, c);
                    continue;
                }

                const resultObjectValue = this.getCellValueObject(cell);

                result = callback(resultObjectValue, r, c);

                if (result === false) {
                    return;
                }
            }
        }
    }

    getRangeData() {
        return this._rangeData;
    }

    setRangeData(rangeData: ISelectionRange) {
        this._rangeData = rangeData;
    }

    getUnitId() {
        if (this._forcedUnitId) {
            return this._forcedUnitId;
        }
        return this._defaultUnitId;
    }

    getSheetId() {
        if (this._forcedSheetId) {
            return this._forcedSheetId;
        }
        return this._defaultSheetId;
    }

    setForcedUnitIdDirect(unitId: string) {
        this._forcedUnitId = unitId;
    }

    getForcedUnitId() {
        return this._forcedUnitId;
    }

    setForcedSheetId(sheetNameMap: SheetNameMapType) {
        this._forcedSheetId = sheetNameMap[this._forcedSheetName];
    }

    setForcedSheetIdDirect(sheetId: string) {
        this._forcedSheetId = sheetId;
    }

    getForcedSheetId() {
        return this._forcedSheetId;
    }

    setForcedSheetName(sheetName: string) {
        this._forcedSheetName = sheetName;
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

    setDefaultUnitId(sheetId: string) {
        this._defaultUnitId = sheetId;
    }

    getDefaultUnitId() {
        return this._defaultUnitId;
    }

    getUnitData() {
        return this._unitData;
    }

    setUnitData(unitData: UnitDataType) {
        this._unitData = unitData;
    }

    getRuntimeData() {
        return this._runtimeData;
    }

    setRuntimeData(runtimeData: UnitDataType) {
        this._runtimeData = runtimeData;
    }

    getRowCount() {
        return this._rowCount;
    }

    setRowCount(rowCount: number) {
        this._rowCount = rowCount;
    }

    getColumnCount() {
        return this._columnCount;
    }

    setColumnCount(columnCount: number) {
        this._columnCount = columnCount;
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

    unionRange(rangeData1: ISelectionRange, rangeData2: ISelectionRange): ISelectionRange {
        /** abstract */
        return {
            startRow: -1,
            startColumn: -1,
            endRow: -1,
            endColumn: -1,
        };
    }

    getCellValueObject(cell: ICellData) {
        const value = cell.v || 0;
        if (ERROR_TYPE_SET.has(value as string)) {
            return ErrorValueObject.create(value as ErrorType);
        }
        if (cell.t === CellValueType.BOOLEAN) {
            return new BooleanValueObject(value);
        }
        if (cell.t === CellValueType.FORCE_STRING || cell.t === CellValueType.STRING) {
            return new StringValueObject(value);
        }
        return new NumberValueObject(value);
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

    getCellData(row: number, column: number) {
        const activeSheetData = this.getCurrentActiveSheetData();

        const activeRuntimeData = this.getCurrentRuntimeSheetData();

        return activeRuntimeData?.getValue(row, column) || activeSheetData.getValue(row, column);
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

    toArrayValueObject(): ArrayValueObject {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();
        const rowSize = endRow - startRow + 1;
        const columnSize = endColumn - startColumn + 1;
        const arrayValueList: CalculateValueType[][] = new Array(rowSize);
        this.iterator((valueObject: CalculateValueType, rowIndex: number, columnIndex: number) => {
            const row = rowIndex - startRow;
            const column = columnIndex - startColumn;
            if (!arrayValueList[row]) {
                arrayValueList[row] = new Array(columnSize);
            }

            arrayValueList[row][column] = valueObject;
        });

        const arrayValueObject: IArrayValueObject = {
            calculateValueList: arrayValueList,
            rowCount: arrayValueList.length,
            columnCount: arrayValueList[0].length,
        };

        return new ArrayValueObject(arrayValueObject);
    }

    toUnitRange() {
        return {
            rangeData: this._rangeData,
            sheetId: this.getSheetId(),
            unitId: this.getUnitId(),
        };
    }
}

export class AsyncObject extends ObjectClassType {
    constructor(private _promise: Promise<FunctionVariantType>) {
        super();
    }

    override isAsyncObject() {
        return true;
    }

    getValue() {
        return this._promise;
    }
}
