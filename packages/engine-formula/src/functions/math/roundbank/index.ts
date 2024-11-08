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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Roundbank extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(number: BaseValueObject, numDigits: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            numDigits.isArray() ? (numDigits as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            numDigits.isArray() ? (numDigits as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const numDigitsArray = expandArrayValueObject(maxRowLength, maxColumnLength, numDigits, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.mapValue((numberObject, rowIndex, columnIndex) => {
            const numDigitsObject = numDigitsArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberObject.isError()) {
                return numberObject;
            }

            if (numDigitsObject.isError()) {
                return numDigitsObject;
            }

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(numberObject, numDigitsObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_numberObject, _numDigitsObject] = variants as BaseValueObject[];

            const numberValue = +_numberObject.getValue();
            const numDigitsValue = Math.trunc(+_numDigitsObject.getValue());
            const result = this._roundBank(numberValue, numDigitsValue);

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _roundBank(number: number, numDigits: number): number {
        const EPSILON = 1e-8;
        const multiplier = 10 ** numDigits;
        const adjustedNum = +(number * multiplier).toFixed(8);
        const integerPart = Math.floor(adjustedNum);
        const decimalPart = adjustedNum - integerPart;

        let result = Math.round(adjustedNum);

        if (decimalPart > 0.5 - EPSILON && decimalPart < 0.5 + EPSILON) {
            result = integerPart % 2 === 0 ? integerPart : integerPart + 1;
        }

        return numDigits ? result / multiplier : result;
    }
}
