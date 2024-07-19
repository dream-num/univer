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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Base extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(number: BaseValueObject, radix: BaseValueObject, minLength?: BaseValueObject) {
        if (number.isError()) {
            return number;
        }

        if (radix.isError()) {
            return radix;
        }

        if (minLength?.isError()) {
            return minLength;
        }

        // get max row length
        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            radix.isArray() ? (radix as ArrayValueObject).getRowCount() : 1,
            minLength?.isArray() ? (minLength as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            radix.isArray() ? (radix as ArrayValueObject).getColumnCount() : 1,
            minLength?.isArray() ? (minLength as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const radixArray = expandArrayValueObject(maxRowLength, maxColumnLength, radix, ErrorValueObject.create(ErrorType.NA));
        const minLengthArray = minLength ? expandArrayValueObject(maxRowLength, maxColumnLength, minLength, ErrorValueObject.create(ErrorType.NA)) : [];

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            let radixObject = radixArray.get(rowIndex, columnIndex) as BaseValueObject;
            let minLengthObject = minLength ? (minLengthArray as ArrayValueObject).get(rowIndex, columnIndex) : NumberValueObject.create(0);

            if (numberObject.isString()) {
                numberObject = numberObject.convertToNumberObjectValue();
            }

            if (radixObject.isString()) {
                radixObject = radixObject.convertToNumberObjectValue();
            }

            if (minLength && (minLengthObject as BaseValueObject).isString()) {
                minLengthObject = (minLengthObject as BaseValueObject).convertToNumberObjectValue();
            }

            if (numberObject.isString() || radixObject.isString() || (minLength && (minLengthObject as BaseValueObject).isString())) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (numberObject.isError()) {
                return numberObject;
            }

            if (radixObject.isError()) {
                return radixObject as BaseValueObject;
            }

            if (minLength && (minLengthObject as BaseValueObject).isError()) {
                return minLengthObject as BaseValueObject;
            }

            // Any non-integer number entered as an argument is truncated to an integer.
            const numberValue = Math.floor(+numberObject.getValue());
            const radixValue = Math.floor(+radixObject.getValue());
            const minLengthValue = minLength ? Math.floor(+(minLengthObject as BaseValueObject).getValue()) : 0;

            // The number that you want to convert. Must be an integer greater than or equal to 0 and less than 2^53.
            if (numberValue < 0 || numberValue >= 2 ** 53) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // The base radix that you want to convert the number into. Must be an integer greater than or equal to 2 and less than or equal to 36.
            if (radixValue < 2 || radixValue > 36) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // The minimum length of the returned string. Must be an integer greater than or equal to 0.
            if (minLengthValue < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            let result = numberValue.toString(radixValue);

            if (minLength && result.length < minLengthValue) {
                result = new Array(minLengthValue - result.length + 1).join('0') + result;
            }

            return StringValueObject.create(result.toLocaleUpperCase());
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return resultArray.getArrayValue()[0][0] as StringValueObject;
        }

        return resultArray;
    }
}
