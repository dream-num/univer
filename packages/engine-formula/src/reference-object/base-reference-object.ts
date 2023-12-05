import type { ICellData, IRange, Nullable } from '@univerjs/core';
import { CellValueType } from '@univerjs/core';

import type { IRuntimeUnitDataType, IUnitData, IUnitSheetNameMap } from '../basics/common';
import { ERROR_TYPE_SET, ErrorType } from '../basics/error-type';
import { ObjectClassType } from '../basics/object-class-type';
import { ErrorValueObject } from '../other-object/error-value-object';
import { ArrayValueObject } from '../value-object/array-value-object';
import type { BaseValueObject, CalculateValueType, IArrayValueObject } from '../value-object/base-value-object';
import { BooleanValueObject, NumberValueObject, StringValueObject } from '../value-object/primitive-object';

export type NodeValueType = BaseValueObject | BaseReferenceObject | ErrorValueObject | AsyncObject;

export type FunctionVariantType = BaseValueObject | BaseReferenceObject | ErrorValueObject;

export class BaseReferenceObject extends ObjectClassType {
    private _forcedSheetId: string = '';

    private _forcedSheetName: string = '';

    private _defaultSheetId: string = '';

    private _rangeData: IRange = {
        startColumn: -1,
        startRow: -1,
        endRow: -1,
        endColumn: -1,
    };

    private _unitData: IUnitData = {};

    private _rowCount: number = 0;

    private _columnCount: number = 0;

    private _defaultUnitId: string = '';

    private _forcedUnitId: string = '';

    private _runtimeData: IRuntimeUnitDataType = {};

    private _arrayFormulaCellData: IRuntimeUnitDataType = {};

    private _runtimeArrayFormulaCellData: IRuntimeUnitDataType = {};

    private _refOffsetX = 0;

    private _refOffsetY = 0;

    constructor(private _token: string) {
        super();
    }

    override dispose(): void {
        this._unitData = {};

        this._runtimeData = {};
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

        if (this._checkIfComponentMiss()) {
            return callback(new ErrorValueObject(ErrorType.VALUE), startRow, startColumn);
        }

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                const cell = this.getCellData(r + this._refOffsetY, c + this._refOffsetX);
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

    getRowCount() {
        return this.getCurrentActiveSheetData().rowCount;
    }

    getColumnCount() {
        return this.getCurrentActiveSheetData().columnCount;
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
            activeArrayFormulaCellData?.getValue(row, column) ||
            activeSheetData.cellData.getValue(row, column)
        );
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
            range: this._rangeData,
            sheetId: this.getSheetId(),
            unitId: this.getUnitId(),
            forcedSheetId: this.getForcedSheetId(),
            forcedSheetName: this.getForcedSheetName(),
            forcedUnitId: this.getForcedUnitId(),
        };
    }

    private _checkIfComponentMiss() {
        if ((this._forcedSheetId == null || this._forcedSheetId.length === 0) && this._forcedSheetName.length > 0) {
            return true;
        }
        return false;
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
