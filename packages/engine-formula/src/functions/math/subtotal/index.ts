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

import type { IObjectArrayPrimitiveType, IRowData } from '@univerjs/core';
import { BooleanNumber } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
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
    override needsReferenceObject = true;

    override calculate(functionNum: BaseValueObject, ...refs: FunctionVariantType[]) {
        if (functionNum == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (functionNum.isError()) {
            return functionNum;
        }

        if (refs.length === 0) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (functionNum.isArray()) {
            return functionNum.map((value) => this._handleSingleObject(
                value,
                ...refs
            ));
        }

        return this._handleSingleObject(functionNum, ...refs);
    }

    private _handleSingleObject(functionNum: BaseValueObject, ...refs: FunctionVariantType[]) {
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
                result = new ErrorValueObject(ErrorType.VALUE);
        }

        return result as BaseValueObject;
    }

    private _getIndexNumValue(indexNum: BaseValueObject) {
        // null, true, false, 0 , 1, '  1',
        const indexNumValue = Number(indexNum.getValue());

        if (isNaN(indexNumValue)) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        const indexNumValueInt = Math.floor(indexNumValue);

        // 1-11, or 101-111
        if ((indexNumValueInt >= 1 && indexNumValueInt <= 11) || (indexNumValueInt >= 101 && indexNumValueInt <= 111)) {
            return indexNumValueInt;
        }

        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _average(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _count(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _counta(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _max(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _min(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _product(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _stdev(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _stdevp(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _sum(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        let accumulatorRefs: BaseValueObject = new NumberValueObject(0);

        for (let i = 0; i < refs.length; i++) {
            const variant = refs[i];

            if (variant.isError()) {
                return variant;
            }

            if (!variant.isReferenceObject()) {
                return new ErrorValueObject(ErrorType.VALUE);
            }

            const rowData = (variant as BaseReferenceObject).getRowData();

            // Keeping in sync with the sum algorithm in ArrayValueObject
            let accumulatorRef: BaseValueObject = new NumberValueObject(0);
            (variant as BaseReferenceObject).iterator((valueObject, rowIndex, columnIndex) => {
                if (ignoreHidden && this._isRowHidden(rowData, rowIndex)) {
                    return true; // continue
                }

                 // 'test', ' ',  blank cell, TRUE and FALSE are ignored
                if (valueObject == null || valueObject.isString() || valueObject.isBoolean() || valueObject.isNull()) {
                    return true; // continue
                }

                if (valueObject.isError()) {
                    accumulatorRef = valueObject;
                    return false; // break
                }
                accumulatorRef = (accumulatorRef as NumberValueObject).plus(
                    valueObject as BaseValueObject
                ) as BaseValueObject;
            });

            accumulatorRefs = accumulatorRefs.plus(accumulatorRef);

            if (accumulatorRefs.isError()) {
                return accumulatorRefs;
            }
        }

        return accumulatorRefs;
    }

    private _isRowHidden(rowData: IObjectArrayPrimitiveType<Partial<IRowData>>, rowIndex: number
    ) {
        const row = rowData[rowIndex];
        if (!row) {
            return false;
        }

        return row.hd === BooleanNumber.TRUE;
    }

    private _var(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }

    private _varp(ignoreHidden: boolean, ...refs: FunctionVariantType[]) {
        return new ErrorValueObject(ErrorType.VALUE);
    }
}
