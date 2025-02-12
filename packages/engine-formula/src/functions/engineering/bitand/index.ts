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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class Bitand extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(number1: BaseValueObject, number2: BaseValueObject): BaseValueObject {
        if (number1.isError()) {
            return number1;
        }

        if (number2.isError()) {
            return number2;
        }

        const maxRowLength = Math.max(
            number1.isArray() ? (number1 as ArrayValueObject).getRowCount() : 1,
            number2.isArray() ? (number2 as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number1.isArray() ? (number1 as ArrayValueObject).getColumnCount() : 1,
            number2.isArray() ? (number2 as ArrayValueObject).getColumnCount() : 1
        );

        const number1Array = expandArrayValueObject(maxRowLength, maxColumnLength, number1, ErrorValueObject.create(ErrorType.NA));
        const number2Array = expandArrayValueObject(maxRowLength, maxColumnLength, number2, ErrorValueObject.create(ErrorType.NA));

        const resultArray = number1Array.map((itemObject, rowIndex, columnIndex) => {
            let number1Object = itemObject;

            if (number1Object.isString()) {
                number1Object = number1Object.convertToNumberObjectValue();
            }

            if (number1Object.isError()) {
                return number1Object;
            }

            let number2Object = number2Array.get(rowIndex, columnIndex) as BaseValueObject;

            if (number2Object.isString()) {
                number2Object = number2Object.convertToNumberObjectValue();
            }

            if (number2Object.isError()) {
                return number2Object;
            }

            const number1Value = +number1Object.getValue();
            const number2Value = +number2Object.getValue();

            // Return error if either number is less than 0
            // Return error if either number is a non-integer
            // Return error if either number is greater than (2^48)-1
            if (
                number1Value < 0 ||
                number2Value < 0 ||
                Math.floor(number1Value) !== number1Value ||
                Math.floor(number2Value) !== number2Value ||
                number1Value > 281474976710655 ||
                number2Value > 281474976710655
            ) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const result = number1Value & number2Value;

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
