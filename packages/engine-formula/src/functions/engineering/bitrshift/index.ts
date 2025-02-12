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

export class Bitrshift extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(number: BaseValueObject, shiftAmount: BaseValueObject): BaseValueObject {
        if (number.isError()) {
            return number;
        }

        if (shiftAmount.isError()) {
            return shiftAmount;
        }

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            shiftAmount.isArray() ? (shiftAmount as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            shiftAmount.isArray() ? (shiftAmount as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const shiftAmountArray = expandArrayValueObject(maxRowLength, maxColumnLength, shiftAmount, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.map((itemObject, rowIndex, columnIndex) => {
            let numberObject = itemObject;

            if (numberObject.isString()) {
                numberObject = numberObject.convertToNumberObjectValue();
            }

            if (numberObject.isError()) {
                return numberObject;
            }

            let shiftAmountObject = shiftAmountArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (shiftAmountObject.isString()) {
                shiftAmountObject = shiftAmountObject.convertToNumberObjectValue();
            }

            if (shiftAmountObject.isError()) {
                return shiftAmountObject;
            }

            const numberValue = +numberObject.getValue();
            let shiftAmountValue = +shiftAmountObject.getValue();

            // Return error if number is less than 0
            // Return error if number is a non-integer
            // Return error if number is greater than (2^48)-1
            // Return error if the absolute value of shift is greater than 53
            if (
                numberValue < 0 ||
                Math.floor(numberValue) !== numberValue ||
                numberValue > 281474976710655 ||
                Math.abs(shiftAmountValue) > 53
            ) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            shiftAmountValue = Math.trunc(shiftAmountValue);

            // Return number shifted by shift bits to the right or to the left if shift is negative
            const result = Number(shiftAmountValue >= 0 ? BigInt(numberValue) >> BigInt(shiftAmountValue) : BigInt(numberValue) << BigInt(-shiftAmountValue));

            if (result > 281474976710655) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
