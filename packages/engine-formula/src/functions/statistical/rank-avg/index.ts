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

import { ErrorType } from '../../../basics/error-type';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

interface IRefType {
    refHasError: boolean;
    refErrorObject: ErrorValueObject;
    refNumbers: number[];
}

export class RankAvg extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(number: FunctionVariantType, ref: FunctionVariantType, order?: FunctionVariantType): BaseValueObject {
        let _number = number;

        if (_number.isReferenceObject()) {
            _number = (_number as BaseReferenceObject).toArrayValueObject();
        }

        const { refHasError, refErrorObject, refNumbers } = this._checkRefReferenceObject(ref);

        let _order = order ?? NumberValueObject.create(0);

        if (_order.isReferenceObject()) {
            _order = (_order as BaseReferenceObject).toArrayValueObject();
        }

        const maxRowLength = Math.max(
            _number.isArray() ? (_number as ArrayValueObject).getRowCount() : 1,
            _order.isArray() ? (_order as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            _number.isArray() ? (_number as ArrayValueObject).getColumnCount() : 1,
            _order.isArray() ? (_order as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, _number as BaseValueObject, ErrorValueObject.create(ErrorType.NA));
        const orderArray = expandArrayValueObject(maxRowLength, maxColumnLength, _order as BaseValueObject, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            const orderObject = orderArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (!number.isReferenceObject() && (number as BaseValueObject).isNull()) {
                return ErrorValueObject.create(ErrorType.NA);
            }

            if (refHasError) {
                return refErrorObject;
            }

            if (orderObject.isError()) {
                return orderObject;
            }

            const numberValue = +numberObject.getValue();
            const orderValue = +orderObject.getValue();

            if (Number.isNaN(numberValue) || Number.isNaN(orderValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return this._getResult(numberValue, orderValue, refNumbers);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getResult(numberValue: number, orderValue: number, refNumbers: number[]): BaseValueObject {
        const refOrderNumbers = refNumbers.sort((a, b) => !orderValue ? b - a : a - b);

        let index = refOrderNumbers.indexOf(numberValue);
        const results = [];

        while (index >= 0) {
            const start = index + 1;
            results.push(start);
            index = refOrderNumbers.indexOf(numberValue, start);
        }

        if (results.length === 0) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const result = results.reduce((acc, cur) => acc + cur, 0) / results.length;

        return NumberValueObject.create(result);
    }

    private _checkRefReferenceObject(ref: FunctionVariantType): IRefType {
        let refHasError = false;
        let refErrorObject = ErrorValueObject.create(ErrorType.NA);
        const refNumbers: number[] = [];

        if (!ref.isReferenceObject()) {
            return {
                refHasError: true,
                refErrorObject,
                refNumbers,
            };
        }

        const _ref = (ref as BaseReferenceObject).toArrayValueObject();

        _ref.iterator((refObject) => {
            const _refObject = refObject as BaseValueObject;

            if (_refObject.isError()) {
                refHasError = true;
                refErrorObject = _refObject as ErrorValueObject;
                return false;
            }

            if (_refObject.isNull() || _refObject.isBoolean()) {
                return true;
            }

            const refValue = +_refObject.getValue();

            if (Number.isNaN(refValue)) {
                return true;
            }

            refNumbers.push(refValue);
        });

        return {
            refHasError,
            refErrorObject,
            refNumbers,
        };
    }
}
