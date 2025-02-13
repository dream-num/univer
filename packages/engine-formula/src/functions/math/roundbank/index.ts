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
        if (numDigits > 16) {
            return number;
        }

        if (numDigits < -16) {
            return 0;
        }

        // logic is:
        // If the digit to be rounded is 4 or less than, it is discarded.
        // If the digit to be rounded is 6 or greater, it rounds up.
        // If the digit to be rounded is exactly 5:
        // If there are any digits following the 5, it rounded up.
        // If there are no digits following the 5, If the preceding digit is odd, it rounds up. If the preceding digit is even, it is discarded.
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
