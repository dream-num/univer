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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { baseEpsilon, multiply } from '../../../engine/utils/math-kit';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Trunc extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, numDigits?: BaseValueObject) {
        const _numDigits = numDigits ?? NumberValueObject.create(0);

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            _numDigits.isArray() ? (_numDigits as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            _numDigits.isArray() ? (_numDigits as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const numDigitsArray = expandArrayValueObject(maxRowLength, maxColumnLength, _numDigits, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            let numDigitsObject = numDigitsArray.get(rowIndex, columnIndex) as BaseValueObject;

            let _numberObject = numberObject;

            if (_numberObject.isString()) {
                _numberObject = _numberObject.convertToNumberObjectValue();
            }

            if (_numberObject.isError()) {
                return _numberObject;
            }

            if (numDigitsObject.isString()) {
                numDigitsObject = numDigitsObject.convertToNumberObjectValue();
            }

            if (numDigitsObject.isError()) {
                return numDigitsObject;
            }

            const numberValue = +_numberObject.getValue();
            const numDigitsValue = +numDigitsObject.getValue();

            const factor = 10 ** Math.trunc(numDigitsValue);
            const epsilon = baseEpsilon(numberValue, factor);
            const result = Math.trunc(multiply(numberValue, factor) + epsilon) / factor;

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
