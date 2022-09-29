import { CellValueType, ICellData, IRangeData, Nullable, ObjectArray, ObjectMatrix } from '@univer/core';
import { CalculateValueType, NodeValueType, SheetDataType, SheetNameMapType } from '../Basics/Common';
import { ErrorType, ERROR_TYPE_SET } from '../Basics/ErrorType';
import { ObjectClassType } from '../Basics/ObjectClassType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { BaseValueObject } from '../ValueObject/BaseValueObject';
import { BooleanValueObject } from '../ValueObject/BooleanValueObject';
import { NumberValueObject } from '../ValueObject/NumberValueObject';
import { StringValueObject } from '../ValueObject/StringValueObject';

export class BaseReferenceObject extends ObjectClassType {
    private _forcedSheetId: string;

    private _forcedSheetName: string;

    private _defaultSheetId: string;

    private _rangeData: IRangeData;

    private _sheetData: SheetDataType;

    private _rowCount: number = 0;

    private _columnCount: number = 0;

    constructor(private _token: string) {
        super();
    }

    isReferenceObject() {
        return true;
    }

    iterator(callback: (valueObject: CalculateValueType, rowIndex: number, columnIndex: number) => Nullable<boolean>) {
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

        const activeSheetData = this._sheetData[this.getSheetId()];

        if (!activeSheetData) {
            return;
        }

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = activeSheetData.getValue(r, c);
                let result: Nullable<boolean> = false;
                if (!cell) {
                    result = callback(new NumberValueObject(0, true), r, c);
                    return;
                }

                const value = cell.v || 0;
                if (ERROR_TYPE_SET.has(value as string)) {
                    result = callback(ErrorValueObject.create(value as ErrorType), r, c);
                } else if (cell.t === CellValueType.BOOLEAN) {
                    result = callback(new BooleanValueObject(value), r, c);
                } else if (cell.t === CellValueType.NUMBER) {
                    result = callback(new NumberValueObject(value), r, c);
                } else {
                    result = callback(new StringValueObject(value), r, c);
                }

                if (result === false) {
                    return;
                }
            }
        }
    }

    getRangeData() {
        return this._rangeData;
    }

    setRangeData(rangeData: IRangeData) {
        this._rangeData = rangeData;
    }

    getSheetId() {
        if (this._forcedSheetId) {
            return this._forcedSheetId;
        }
        return this._defaultSheetId;
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

    getSheetData() {
        return this._sheetData;
    }

    setSheetData(sheetData: SheetDataType) {
        this._sheetData = sheetData;
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

    unionRange(rangeData1: IRangeData, rangeData2: IRangeData): IRangeData {
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
        } else if (cell.t === CellValueType.BOOLEAN) {
            return new BooleanValueObject(value);
        } else if (cell.t === CellValueType.FORCE_STRING || cell.t === CellValueType.STRING) {
            return new StringValueObject(value);
        } else {
            return new NumberValueObject(value);
        }
    }

    getCellByRow(row: number) {
        return this.getCellByPosition(row);
    }

    getCellByColumn(column: number) {
        return this.getCellByPosition(undefined, column);
    }

    getCellByPosition(row?: number, column?: number) {
        const activeSheetData = this._sheetData[this.getSheetId()];

        if (!row) {
            row = this._rangeData.startRow;
        }

        if (!column) {
            column = this._rangeData.startColumn;
        }

        const cell = activeSheetData.getValue(row, column);

        if (!cell) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return this.getCellValueObject(cell);
    }

    toArrayValueObject() {
        const arrayValueList: CalculateValueType[][] = [];
        this.iterator((valueObject: CalculateValueType, rowIndex: number, columnIndex: number) => {
            if (!arrayValueList[rowIndex]) {
                arrayValueList[rowIndex] = [];
            }

            arrayValueList[rowIndex][columnIndex] = valueObject;
        });

        return arrayValueList;
    }
}
