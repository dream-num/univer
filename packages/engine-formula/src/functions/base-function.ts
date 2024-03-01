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

import type { Nullable } from '@univerjs/core';
import { Disposable, isRealNum } from '@univerjs/core';

import { ErrorType } from '../basics/error-type';
import type { IFunctionNames } from '../basics/function';
import { compareToken } from '../basics/token';
import type { FunctionVariantType, NodeValueType } from '../engine/reference-object/base-reference-object';
import type { ArrayBinarySearchType } from '../engine/utils/compare';
import { ArrayOrderSearchType } from '../engine/utils/compare';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../engine/value-object/base-value-object';
import { NumberValueObject, type PrimitiveValueType } from '../engine/value-object/primitive-object';
import { convertTonNumber } from '../engine/utils/object-covert';
import { createNewArray } from '../engine/utils/array-object';

export class BaseFunction extends Disposable {
    private _unitId: Nullable<string>;
    private _subUnitId: Nullable<string>;
    private _row: number = -1;
    private _column: number = -1;

    /**
     * Whether the function needs to expand the parameters
     */
    needsExpandParams: boolean = false;

    /**
     * Whether the function needs to pass in reference object
     */
    needsReferenceObject: boolean = false;

    constructor(private _name: IFunctionNames) {
        super();
    }

    get name() {
        return this._name;
    }

    get unitId() {
        return this._unitId;
    }

    get subUnitId() {
        return this._subUnitId;
    }

    get row() {
        return this._row;
    }

    get column() {
        return this._column;
    }

    isAsync() {
        return false;
    }

    isAddress() {
        return false;
    }

    isCustom() {
        return false;
    }

    setRefInfo(unitId: string, subUnitId: string, row: number, column: number) {
        this._unitId = unitId;
        this._subUnitId = subUnitId;
        this._row = row;
        this._column = column;
    }

    calculateCustom(
        ...arg: Array<PrimitiveValueType | PrimitiveValueType[][]>
    ): PrimitiveValueType | PrimitiveValueType[][] {
        return null;
    }

    calculate(...arg: BaseValueObject[]): NodeValueType {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    checkArrayType(variant: FunctionVariantType) {
        return variant.isReferenceObject() || (variant.isValueObject() && (variant as BaseValueObject).isArray());
    }

    /**
     * Starting with 1
     * For instance, The column number (starting with 1 for the left-most column of table_array) that contains the return value.
     * https://support.microsoft.com/en-us/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1
     * @param indexNum
     * @returns
     */
    getIndexNumValue(indexNum: BaseValueObject, defaultValue = 1) {
        if (indexNum.isArray()) {
            indexNum = (indexNum as ArrayValueObject).getFirstCell();
        }

        if (indexNum.isBoolean()) {
            const colIndexNumV = indexNum.getValue() as boolean;
            if (colIndexNumV === false) {
                return new ErrorValueObject(ErrorType.VALUE);
            }

            return defaultValue;
        }
        if (indexNum.isString()) {
            const colIndexNumV = Number(indexNum.getValue() as string);
            if (isNaN(colIndexNumV)) {
                return new ErrorValueObject(ErrorType.REF);
            }
            return colIndexNumV;
        } else if (indexNum.isNumber()) {
            const colIndexNumV = indexNum.getValue() as number;
            return colIndexNumV;
        }

        return new ErrorValueObject(ErrorType.VALUE);
    }

    /**
     * A logical value that specifies 1/TRUE , 0/FALSE, default 1
     * For instance range_lookup, A logical value that specifies whether you want VLOOKUP to find an approximate or an exact match
     * Approximate match - 1/TRUE
     * Exact match - 0/FALSE
     * https://support.microsoft.com/en-us/office/vlookup-function-0bbc8083-26fe-4963-8ab8-93a18ad188a1
     * For instance A1, A logical value that specifies what type of reference is contained in the cell ref_text.
     * If a1 is TRUE or omitted, ref_text is interpreted as an A1-style reference.
     * If a1 is FALSE, ref_text is interpreted as an R1C1-style reference.
     * https://support.microsoft.com/zh-cn/office/indirect-%E5%87%BD%E6%95%B0-474b3a3a-8a26-4f44-b491-92b6306fa261
     * @param logicValueObject
     * @returns
     */
    getZeroOrOneByOneDefault(logicValueObject?: BaseValueObject) {
        if (logicValueObject == null) {
            return 1;
        }

        let logicValue = 1;

        if (logicValueObject.isArray()) {
            logicValueObject = (logicValueObject as ArrayValueObject).getFirstCell();
        }

        if (logicValueObject.isBoolean()) {
            const logicV = logicValueObject.getValue() as boolean;
            if (logicV === false) {
                logicValue = 0;
            }
        } else if (logicValueObject.isString()) {
            return;
        } else if (logicValueObject.isNumber()) {
            const logicV = logicValueObject.getValue() as number;
            if (logicV === 0) {
                logicValue = 0;
            }
        }

        return logicValue;
    }

    /**
     * A logical value that specifies 1/TRUE , 0/FALSE, -1, default 1.
     * The difference from getZeroOrOneByOneDefault is that we need to get -1
     * @param logicValueObject
     * @returns
     */
    getMatchTypeValue(logicValueObject?: BaseValueObject) {
        if (logicValueObject == null) {
            return 1;
        }

        let logicValue = 1;

        if (logicValueObject.isArray()) {
            logicValueObject = (logicValueObject as ArrayValueObject).getFirstCell();
        }

        if (logicValueObject.isBoolean()) {
            const logicV = logicValueObject.getValue() as boolean;
            if (logicV === false) {
                logicValue = 0;
            }
        } else if (logicValueObject.isString()) {
            return;
        } else if (logicValueObject.isNumber()) {
            const logicV = logicValueObject.getValue() as number;
            if (logicV <= 0) {
                logicValue = logicV;
            }
        }

        return logicValue;
    }

    binarySearch(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        searchType?: ArrayBinarySearchType
    ) {
        const rowOrColumn = searchArray.binarySearch(value, searchType);

        if (rowOrColumn == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        let resultValue: BaseValueObject;

        if (resultArray.getRowCount() === 1) {
            resultValue = resultArray.get(0, rowOrColumn);
        } else {
            resultValue = resultArray.get(rowOrColumn, 0);
        }

        if (resultValue.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return resultValue;
    }

    equalSearch(value: BaseValueObject, searchArray: ArrayValueObject, resultArray: ArrayValueObject, isFirst = true) {
        const resultArrayValue = resultArray.pick(searchArray.isEqual(value) as ArrayValueObject);

        let resultValue: BaseValueObject;

        if (isFirst) {
            resultValue = resultArrayValue.getFirstCell();
        } else {
            resultValue = resultArrayValue.getLastCell();
        }

        if (resultValue.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return resultValue;
    }

    fuzzySearch(value: BaseValueObject, searchArray: ArrayValueObject, resultArray: ArrayValueObject, isFirst = true) {
        const resultArrayValue = resultArray.pick(searchArray.compare(value, compareToken.EQUALS) as ArrayValueObject);

        let resultValue: BaseValueObject;

        if (isFirst) {
            resultValue = resultArrayValue.getFirstCell();
        } else {
            resultValue = resultArrayValue.getLastCell();
        }

        if (resultValue.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return resultValue;
    }

    orderSearch(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        searchType: ArrayOrderSearchType = ArrayOrderSearchType.MIN,
        isDesc = false
    ) {
        const position = searchArray.orderSearch(value, searchType, isDesc);

        if (position == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        const resultValue = resultArray.get(position.row, position.column);

        if (resultValue.isNull()) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return resultValue;
    }

    /**
     * @param axis 0 row, 1 column
     * @returns
     */
    binarySearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        axis = 0,
        searchType?: ArrayBinarySearchType
    ) {
        const rowOrColumn = searchArray.binarySearch(value, searchType);

        if (rowOrColumn == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([rowOrColumn, rowOrColumn + 1]);
        }
        return resultArray.slice(undefined, [rowOrColumn, rowOrColumn + 1]);
    }

    equalSearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        isFirst = true,
        axis = 0
    ) {
        const matchObject = searchArray.isEqual(value) as ArrayValueObject;

        let position: Nullable<{ row: number; column: number }>;

        if (isFirst) {
            position = matchObject.getFirstTruePosition();
        } else {
            position = matchObject.getLastTruePosition();
        }

        if (position == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]);
        }
        return resultArray.slice(undefined, [position.column, position.column + 1]);
    }

    fuzzySearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        isFirst = true,
        axis = 0
    ) {
        const matchObject = searchArray.compare(value, compareToken.EQUALS) as ArrayValueObject;

        let position: Nullable<{ row: number; column: number }>;

        if (isFirst) {
            position = matchObject.getFirstTruePosition();
        } else {
            position = matchObject.getLastTruePosition();
        }

        if (position == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]);
        }
        return resultArray.slice(undefined, [position.column, position.column + 1]);
    }

    orderSearchExpand(
        value: BaseValueObject,
        searchArray: ArrayValueObject,
        resultArray: ArrayValueObject,
        searchType: ArrayOrderSearchType = ArrayOrderSearchType.MIN,
        isDesc = false,
        axis = 0
    ) {
        const position = searchArray.orderSearch(value, searchType, isDesc);

        if (position == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (axis === 0) {
            return resultArray.slice([position.row, position.row + 1]);
        }
        return resultArray.slice(undefined, [position.column, position.column + 1]);
    }

    flattenArray(variants: BaseValueObject[], ignoreLogicalValuesAndText: boolean = true): ArrayValueObject | BaseValueObject {
        const flattenValues: BaseValueObject[][] = [];
        flattenValues[0] = [];

        for (let i = 0; i < variants.length; i++) {
            let variant = variants[i];

            if (variant.isError()) {
                return variant;
            }

            if (variant.isString()) {
                const value = variant.getValue();
                const isStringNumber = isRealNum(value);

                if (!isStringNumber) {
                    return new ErrorValueObject(ErrorType.VALUE);
                }

                variant = new NumberValueObject(value);
            }

            if (variant.isBoolean()) {
                variant = convertTonNumber(variant);
            }

            if (variant.isArray()) {
                let errorValue: Nullable<BaseValueObject>;

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject == null || valueObject.isNull()) {
                        return true;
                    }

                    if (ignoreLogicalValuesAndText && (valueObject.isString() || valueObject.isBoolean())) {
                        return true;
                    }

                    valueObject = this._includingLogicalValuesAndText(valueObject);

                    if (valueObject.isError()) {
                        errorValue = valueObject;
                        return false;
                    }

                    flattenValues[0].push(valueObject);
                });

                if (errorValue?.isError()) {
                    return errorValue;
                }
            } else if (!variant.isNull()) {
                flattenValues[0].push(variant);
            }
        }

        return createNewArray(flattenValues, 1, flattenValues[0].length);
    }

    private _includingLogicalValuesAndText(valueObject: BaseValueObject) {
        // Including logical values
        if (valueObject.isBoolean()) {
            valueObject = convertTonNumber(valueObject);
        }

        // Including number string
        if (valueObject.isString()) {
            const value = Number(valueObject.getValue());

            // Non-text numbers also need to be counted to the sample size
            valueObject = new NumberValueObject(isNaN(value) ? 0 : value);
        }

        return valueObject;
    }
}
