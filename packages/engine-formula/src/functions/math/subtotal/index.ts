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

import type { IObjectArrayPrimitiveType, IRowData, Nullable } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanNumber } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { createNewArray } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

enum FunctionNum {
    AVERAGE = 1,
    COUNT = 2,
    COUNTA = 3,
    MAX = 4,
    MIN = 5,
    PRODUCT = 6,
    STDEV = 7,
    STDEVP = 8,
    SUM = 9,
    VAR = 10,
    VARP = 11,
}

enum FunctionNumIgnoreHidden {
    AVERAGE = 101,
    COUNT = 102,
    COUNTA = 103,
    MAX = 104,
    MIN = 105,
    PRODUCT = 106,
    STDEV = 107,
    STDEVP = 108,
    SUM = 109,
    VAR = 110,
    VARP = 111,
}

export class Subtotal extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override needsReferenceObject = true;

    override needsFilteredOutRows = true;

    override calculate(functionNum: FunctionVariantType, ...refs: FunctionVariantType[]) {
        if (functionNum.isError()) {
            return functionNum;
        }

        if (functionNum.isReferenceObject()) {
            return (functionNum as BaseReferenceObject).toArrayValueObject().mapValue((valueObject) => this._handleSingleObject(valueObject, ...refs));
        }

        return this._handleSingleObject(functionNum as BaseValueObject, ...refs);
    }

    // eslint-disable-next-line max-lines-per-function, complexity
    private _handleSingleObject(functionNum: Nullable<BaseValueObject>, ...refs: FunctionVariantType[]) {
        const indexNum = this._getIndexNumValue(functionNum);
        let result;

        if (indexNum instanceof ErrorValueObject) {
            return indexNum;
        }

        switch (indexNum) {
            case FunctionNum.AVERAGE:
                result = this._average(false, ...refs);
                break;
            case FunctionNum.COUNT:
                result = this._count(false, ...refs);
                break;
            case FunctionNum.COUNTA:
                result = this._counta(false, ...refs);
                break;
            case FunctionNum.MAX:
                result = this._max(false, ...refs);
                break;
            case FunctionNum.MIN:
                result = this._min(false, ...refs);
                break;
            case FunctionNum.PRODUCT:
                result = this._product(false, ...refs);
                break;
            case FunctionNum.STDEV:
                result = this._stdev(false, ...refs);
                break;
            case FunctionNum.STDEVP:
                result = this._stdevp(false, ...refs);
                break;
            case FunctionNum.SUM:
                result = this._sum(false, ...refs);
                break;
            case FunctionNum.VAR:
                result = this._var(false, ...refs);
                break;
            case FunctionNum.VARP:
                result = this._varp(false, ...refs);
                break;
            case FunctionNumIgnoreHidden.AVERAGE:
                result = this._average(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.COUNT:
                result = this._count(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.COUNTA:
                result = this._counta(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.MAX:
                result = this._max(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.MIN:
                result = this._min(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.PRODUCT:
                result = this._product(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.STDEV:
                result = this._stdev(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.STDEVP:
                result = this._stdevp(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.SUM:
                result = this._sum(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.VAR:
                result = this._var(true, ...refs);
                break;
            case FunctionNumIgnoreHidden.VARP:
                result = this._varp(true, ...refs);
                break;
            default:
                result = ErrorValueObject.create(ErrorType.VALUE);
        }

        return result as BaseValueObject;
    }

    private _getIndexNumValue(indexNum: Nullable<BaseValueObject>) {
        // null, true, false, 0 , 1, '  1',
        const indexNumValue = indexNum ? Number(indexNum.getValue()) : 0;

        if (Number.isNaN(indexNumValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const indexNumValueInt = Math.floor(indexNumValue);

        // 1-11, or 101-111
        if ((indexNumValueInt >= 1 && indexNumValueInt <= 11) || (indexNumValueInt >= 101 && indexNumValueInt <= 111)) {
            return indexNumValueInt;
        }

        return ErrorValueObject.create(ErrorType.VALUE);
    }

    private _average(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        return flattenArray.mean();
    }

    private _count(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(0);
        for (let i = 0; i < refs.length; i++) {
            const variant = refs[i];

            if (!variant.isReferenceObject()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const filteredOutRows = (variant as BaseReferenceObject).getFilteredOutRows();
            const rowData = (variant as BaseReferenceObject).getRowData();

            (variant as BaseReferenceObject).iterator((valueObject, rowIndex) => {
                // Filtered rows are always excluded.
                if (filteredOutRows.includes(rowIndex)) {
                    return true; // continue
                }

                if (ignoreHidden && this._isRowHidden(rowData, rowIndex)) {
                    return true;
                }

                if (valueObject?.isNumber()) {
                    accumulatorAll = accumulatorAll.plusBy(1);
                }
            });
        }

        return accumulatorAll;
    }

    private _counta(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(0);
        for (let i = 0; i < refs.length; i++) {
            const variant = refs[i];

            if (!variant.isReferenceObject()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const filteredOutRows = (variant as BaseReferenceObject).getFilteredOutRows();
            const rowData = (variant as BaseReferenceObject).getRowData();

            (variant as BaseReferenceObject).iterator((valueObject, rowIndex) => {
                // Filtered rows are always excluded.
                if (filteredOutRows.includes(rowIndex)) {
                    return true; // continue
                }

                if (ignoreHidden && this._isRowHidden(rowData, rowIndex)) {
                    return true;
                }

                if (valueObject == null || valueObject.isNull()) {
                    return true;
                }

                accumulatorAll = accumulatorAll.plusBy(1);
            });
        }

        return accumulatorAll;
    }

    private _max(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return NumberValueObject.create(0);
        }

        return flattenArray.max();
    }

    private _min(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return NumberValueObject.create(0);
        }

        return flattenArray.min();
    }

    private _product(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return NumberValueObject.create(0);
        }

        let result: NumberValueObject = NumberValueObject.create(1);
        (flattenArray as ArrayValueObject).iterator((valueObject) => {
            result = result.multiply(
                valueObject as BaseValueObject
            ) as NumberValueObject;
        });

        return result;
    }

    private _stdev(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return flattenArray.std(1);
    }

    private _stdevp(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return flattenArray.std();
    }

    private _sum(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        return flattenArray.sum();
    }

    private _var(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return flattenArray.var(1);
    }

    private _varp(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        const flattenArray = this._flattenRefArray(ignoreHidden, ...refs);

        if (flattenArray.isError()) {
            return flattenArray;
        }

        if (this._isBlankArrayObject(flattenArray)) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return flattenArray.var();
    }

    private _flattenRefArray(ignoreHidden: boolean, ...variants: FunctionVariantType[]) {
        const flattenValues: BaseValueObject[][] = [];
        flattenValues[0] = [];

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isError()) {
                return variant as ErrorValueObject;
            }

            if (!variant.isReferenceObject()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const filteredOutRows = (variant as BaseReferenceObject).getFilteredOutRows();
            const rowData = (variant as BaseReferenceObject).getRowData();

            let errorValue: Nullable<BaseValueObject>;

            (variant as BaseReferenceObject).iterator((valueObject, rowIndex) => {
                // Filtered rows are always excluded.
                if (filteredOutRows.includes(rowIndex)) {
                    return true; // continue
                }

                if (ignoreHidden && this._isRowHidden(rowData, rowIndex)) {
                    return true; // continue
                }

                // 'test', ' ',  blank cell, TRUE and FALSE are ignored
                if (valueObject == null || valueObject.isNull() || valueObject.isString() || valueObject.isBoolean()) {
                    return true;
                }

                if (valueObject.isError()) {
                    errorValue = valueObject;
                    return false; // break
                }

                flattenValues[0].push(valueObject);
            });

            if (errorValue?.isError()) {
                return errorValue;
            }
        }

        return createNewArray(flattenValues, 1, flattenValues[0].length);
    }

    private _isRowHidden(rowData: IObjectArrayPrimitiveType<Partial<IRowData>>, rowIndex: number) {
        const row = rowData[rowIndex];
        if (!row) {
            return false;
        }

        return row.hd === BooleanNumber.TRUE;
    }

    private _isBlankArrayObject(arrayObject: BaseValueObject) {
        return arrayObject.getArrayValue()[0].length === 0;
    }
}
