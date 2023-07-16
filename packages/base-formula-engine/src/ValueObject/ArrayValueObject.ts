import { Nullable } from '@univerjs/core';
import { $ARRAY_VALUE_REGEX } from '../Basics/Regex';
import { BooleanValue } from '../Basics/Common';
import { ErrorType } from '../Basics/ErrorType';
import { ErrorValueObject } from '../OtherObject/ErrorValueObject';
import { compareToken } from '../Basics/Token';
import { BaseValueObject, CalculateValueType, IArrayValueObject } from './BaseValueObject';
import { BooleanValueObject, NumberValueObject, StringValueObject } from './PrimitiveObject';

enum BatchOperatorType {
    MINUS,
    PLUS,
    MULTIPLY,
    DIVIDED,
    COMPARE,
    CONCATENATE_FRONT,
    CONCATENATE_BACK,
}

export function fromObjectToString(array: IArrayValueObject) {
    return '';
}

export class ArrayValueObject extends BaseValueObject {
    private _value: CalculateValueType[][];

    private _rowCount: number;

    private _columnCount: number;

    constructor(rawValue: string | IArrayValueObject) {
        if (rawValue instanceof String) {
            super(rawValue as string);
        } else {
            const rawString = fromObjectToString(rawValue as IArrayValueObject);
            super(rawString);
        }

        this._value = this._formatValue(rawValue);
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

    override getArrayValue() {
        return this._value;
    }

    override setArrayValue(value: CalculateValueType[][]) {
        this._value = value;
    }

    override isArray() {
        return true;
    }

    getRangePosition() {
        let startRow = 0;
        let rowCount = this.getRowCount();
        let startColumn = 0;
        let columnCount = this.getColumnCount();

        return {
            startRow,
            endRow: rowCount - 1,
            startColumn,
            endColumn: columnCount - 1,
        };
    }

    iterator(callback: (valueObject: CalculateValueType, rowIndex: number, columnIndex: number) => Nullable<boolean>) {
        const { startRow, endRow, startColumn, endColumn } = this.getRangePosition();

        const valueList = this.getArrayValue();

        for (let r = startRow; r <= endRow; r++) {
            for (let c = startColumn; c <= endColumn; c++) {
                if (callback(valueList[r][c], r, c) === false) {
                    return;
                }
            }
        }
    }

    override plus(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.PLUS);
    }

    override minus(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.MINUS);
    }

    override multiply(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.MULTIPLY);
    }

    override divided(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.DIVIDED);
    }

    override compare(valueObject: BaseValueObject, operator: compareToken): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.COMPARE, operator);
    }

    override concatenateFront(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.CONCATENATE_FRONT);
    }

    override concatenateBack(valueObject: BaseValueObject): CalculateValueType {
        return this._batchOperator(valueObject, BatchOperatorType.CONCATENATE_BACK);
    }

    // eslint-disable-next-line max-lines-per-function
    private _batchOperator(valueObject: BaseValueObject, batchOperatorType: BatchOperatorType, operator?: compareToken): CalculateValueType {
        if (valueObject.isArray()) {
            let rowCount = (valueObject as ArrayValueObject).getRowCount();
            let columnCount = (valueObject as ArrayValueObject).getColumnCount();

            if (rowCount < this._rowCount) {
                rowCount = this._rowCount;
            }

            if (columnCount < this._columnCount) {
                columnCount = this._columnCount;
            }

            const result: CalculateValueType[][] = [];

            const valueObjectList = (valueObject as ArrayValueObject).getArrayValue();

            for (let r = 0; r < rowCount; r++) {
                const rowList: CalculateValueType[] = [];
                for (let c = 0; c < columnCount; c++) {
                    const currentValue = this._value?.[r]?.[c];

                    const opValue = valueObjectList?.[r]?.[c];

                    if (currentValue && opValue) {
                        if (currentValue.isErrorObject() || opValue.isErrorObject()) {
                            rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                        } else {
                            switch (batchOperatorType) {
                                case BatchOperatorType.PLUS:
                                    rowList[c] = (currentValue as BaseValueObject).plus(opValue as BaseValueObject);
                                    break;
                                case BatchOperatorType.MINUS:
                                    rowList[c] = (currentValue as BaseValueObject).minus(opValue as BaseValueObject);
                                    break;
                                case BatchOperatorType.MULTIPLY:
                                    rowList[c] = (currentValue as BaseValueObject).multiply(opValue as BaseValueObject);
                                    break;
                                case BatchOperatorType.DIVIDED:
                                    rowList[c] = (currentValue as BaseValueObject).divided(opValue as BaseValueObject);
                                    break;
                                case BatchOperatorType.COMPARE:
                                    if (!operator) {
                                        rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                                    } else {
                                        rowList[c] = (currentValue as BaseValueObject).compare(opValue as BaseValueObject, operator);
                                    }
                                    break;
                                case BatchOperatorType.CONCATENATE_FRONT:
                                    rowList[c] = (currentValue as BaseValueObject).concatenateFront(opValue as BaseValueObject);
                                    break;
                                case BatchOperatorType.CONCATENATE_BACK:
                                    rowList[c] = (currentValue as BaseValueObject).concatenateBack(opValue as BaseValueObject);
                                    break;
                            }
                        }
                    } else if (currentValue) {
                        rowList[c] = currentValue;
                    } else if (opValue) {
                        rowList[c] = opValue;
                    } else {
                        rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                    }
                }
                result.push(rowList);
            }

            this.setArrayValue(result);
            this.setRowCount(rowCount);
            this.setColumnCount(columnCount);

            return this;
        }

        let rowCount = this._rowCount;
        let columnCount = this._columnCount;

        const result: CalculateValueType[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const rowList: CalculateValueType[] = [];
            for (let c = 0; c < columnCount; c++) {
                const currentValue = this._value?.[r]?.[c];

                if (currentValue && valueObject) {
                    if (currentValue.isErrorObject() || valueObject.isErrorObject()) {
                        rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                    } else {
                        switch (batchOperatorType) {
                            case BatchOperatorType.PLUS:
                                rowList[c] = (currentValue as BaseValueObject).plus(valueObject);
                                break;
                            case BatchOperatorType.MINUS:
                                rowList[c] = (currentValue as BaseValueObject).minus(valueObject);
                                break;
                            case BatchOperatorType.MULTIPLY:
                                rowList[c] = (currentValue as BaseValueObject).multiply(valueObject);
                                break;
                            case BatchOperatorType.DIVIDED:
                                rowList[c] = (currentValue as BaseValueObject).divided(valueObject);
                                break;
                            case BatchOperatorType.COMPARE:
                                if (!operator) {
                                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                                } else {
                                    rowList[c] = (currentValue as BaseValueObject).compare(valueObject, operator);
                                }
                                break;
                            case BatchOperatorType.CONCATENATE_FRONT:
                                rowList[c] = (currentValue as BaseValueObject).concatenateFront(valueObject);
                                break;
                            case BatchOperatorType.CONCATENATE_BACK:
                                rowList[c] = (currentValue as BaseValueObject).concatenateBack(valueObject);
                                break;
                        }
                    }
                } else if (currentValue) {
                    rowList[c] = currentValue;
                } else if (valueObject) {
                    rowList[c] = valueObject;
                } else {
                    rowList[c] = ErrorValueObject.create(ErrorType.VALUE);
                }
            }
            result.push(rowList);
        }

        this.setArrayValue(result);
        this.setRowCount(rowCount);
        this.setColumnCount(columnCount);

        return this;
    }

    private _formatValue(rawValue: string | IArrayValueObject) {
        if (!(rawValue instanceof String)) {
            rawValue = rawValue as IArrayValueObject;

            this._rowCount = rawValue.rowCount;

            this._columnCount = rawValue.columnCount;

            return rawValue.calculateValueList;
        }
        rawValue = rawValue.slice(1, -1) as string;
        const rowArray = rawValue.split(';');
        const rowArrayCount = rowArray.length;
        const result: CalculateValueType[][] = [];
        let maxColumnCount = 0;
        for (let r = 0; r < rowArrayCount; r++) {
            const columnRaw = rowArray[r];
            const columnArray = columnRaw.split(',');
            const columnArrayCount = columnArray.length;

            if (maxColumnCount < columnArrayCount) {
                maxColumnCount = columnArrayCount;
            }

            const row: CalculateValueType[] = [];
            for (let c = 0; c < columnArrayCount; c++) {
                const cellRaw = columnArray[c];
                row.push(ValueObjectFactory.create(cellRaw));
            }
            result.push(row);
        }

        this._rowCount = rowArrayCount;

        this._columnCount = maxColumnCount;

        return result;
    }
}

export class ValueObjectFactory {
    static create(rawValue: string | number | boolean) {
        if (typeof rawValue === 'boolean') {
            return new BooleanValueObject(rawValue, true);
        }
        if (typeof rawValue === 'string') {
            const rawValueUpper = rawValue.toLocaleUpperCase();
            if (rawValueUpper === BooleanValue.TRUE || rawValueUpper === BooleanValue.FALSE) {
                return new BooleanValueObject(rawValueUpper);
            }
            if (!isNaN(Number(rawValue))) {
                return new NumberValueObject(rawValue);
            }
            if ($ARRAY_VALUE_REGEX.test(rawValue)) {
                return new ArrayValueObject(rawValue);
            }
            return new StringValueObject(rawValue);
        }
        if (typeof rawValue === 'number') {
            return new NumberValueObject(rawValue, true);
        }
        return ErrorValueObject.create(ErrorType.NA);
    }
}
