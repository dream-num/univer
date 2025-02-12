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

export class Permutationa extends BaseFunction {
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
            const numberChosenObject = numberChosenArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberObject.isError()) {
                return numberObject;
            }

            if (numberChosenObject.isError()) {
                return numberChosenObject;
            }

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(numberObject, numberChosenObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_numberObject, _numberChosenObject] = variants as BaseValueObject[];

            const numberValue = Math.floor(+_numberObject.getValue());
            const numberChosenValue = Math.floor(+_numberChosenObject.getValue());

            if (numberValue < 0 || numberValue >= 2147483647 || numberChosenValue < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // for excel
            if (numberValue === 0) {
                if (numberChosenValue === 0) {
                    return NumberValueObject.create(1);
                } else {
                    return NumberValueObject.create(0);
                }
            }

            const result = numberValue ** numberChosenValue;

            if (!Number.isFinite(result)) {
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
