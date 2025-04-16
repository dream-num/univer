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
import { calculateCombin } from '../../../basics/math';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Combina extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(number: BaseValueObject, numberChosen: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            numberChosen.isArray() ? (numberChosen as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            numberChosen.isArray() ? (numberChosen as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const numberChosenArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberChosen, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.mapValue((numberObject, rowIndex, columnIndex) => {
            let _numberObject = numberObject;
            let numberChosenObject = numberChosenArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (_numberObject.isString()) {
                _numberObject = _numberObject.convertToNumberObjectValue();
            }

            if (numberChosenObject.isString()) {
                numberChosenObject = numberChosenObject.convertToNumberObjectValue();
            }

            if (_numberObject.isError()) {
                return _numberObject;
            }

            if (numberChosenObject.isError()) {
                return numberChosenObject;
            }

            const numberValue = Math.floor(+_numberObject.getValue());
            const numberChosenValue = Math.floor(+numberChosenObject.getValue());

            if (numberValue < 0 || numberChosenValue < 0 || (numberValue === 0 && numberValue < numberChosenValue)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const result = calculateCombin(numberValue + numberChosenValue - 1, numberValue - 1);

            if (Number.isNaN(result) || !Number.isFinite(result)) {
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
