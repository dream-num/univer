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
import { StringValueObject } from '../../../engine/value-object/primitive-object';
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

        const resultArray = numberArray.map((NumberItemValueObject, rowIndex, columnIndex) => {
            let radixItemValueObject = radixArray.get(rowIndex, columnIndex) as BaseValueObject;
            let minLengthItemValueObject = minLength ? (minLengthArray as ArrayValueObject).get(rowIndex, columnIndex) : {};

            if (NumberItemValueObject.isString()) {
                NumberItemValueObject = NumberItemValueObject.convertToNumberObjectValue();
            }

            if (radixItemValueObject.isString()) {
                radixItemValueObject = radixItemValueObject.convertToNumberObjectValue();
            }

            if (minLength && (minLengthItemValueObject as BaseValueObject).isString()) {
                minLengthItemValueObject = (minLengthItemValueObject as BaseValueObject).convertToNumberObjectValue();
            }

            if (NumberItemValueObject.isString() || radixItemValueObject.isString() || (minLength && (minLengthItemValueObject as BaseValueObject).isString())) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (NumberItemValueObject.isError()) {
                return NumberItemValueObject;
            }

            if (radixItemValueObject.isError()) {
                return radixItemValueObject as BaseValueObject;
            }

            if (minLength && (minLengthItemValueObject as BaseValueObject).isError()) {
                return minLengthItemValueObject as BaseValueObject;
            }

            // Any non-integer number entered as an argument is truncated to an integer.
            const NumberItemValue = Math.floor(+NumberItemValueObject.getValue());
            const radixItemValue = Math.floor(+radixItemValueObject.getValue());
            const minLengthItemValue = minLength ? Math.floor(+(minLengthItemValueObject as BaseValueObject).getValue()) : 0;

            // The number that you want to convert. Must be an integer greater than or equal to 0 and less than 2^53.
            if (NumberItemValue < 0 || NumberItemValue >= 2 ** 53) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // The base radix that you want to convert the number into. Must be an integer greater than or equal to 2 and less than or equal to 36.
            if (radixItemValue < 2 || radixItemValue > 36) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // The minimum length of the returned string. Must be an integer greater than or equal to 0.
            if (minLengthItemValue < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            let result = NumberItemValue.toString(radixItemValue);

            if (minLength && result.length < minLengthItemValue) {
                result = new Array(minLengthItemValue - result.length + 1).join('0') + result;
            }

            return StringValueObject.create(result);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return resultArray.getArrayValue()[0][0] as StringValueObject;
        }

        return resultArray;
    }
}
