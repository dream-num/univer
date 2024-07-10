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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Log extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, base?: BaseValueObject) {
        if (number.isError()) {
            return number;
        }

        if (base?.isError()) {
            return base;
        }

        // get max row length
        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            base?.isArray() ? (base as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            base?.isArray() ? (base as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const baseArray = base ? expandArrayValueObject(maxRowLength, maxColumnLength, base, ErrorValueObject.create(ErrorType.NA)) : [];

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            let baseObject = base ? (baseArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : NumberValueObject.create(10);

            if (numberObject.isString()) {
                numberObject = numberObject.convertToNumberObjectValue();
            }

            if (numberObject.isError()) {
                return numberObject;
            }

            if (baseObject.isString()) {
                baseObject = baseObject.convertToNumberObjectValue();
            }

            if (baseObject.isError()) {
                return baseObject;
            }

            const numberValue = +numberObject.getValue();
            const baseValue = +baseObject.getValue();

            if (numberValue <= 0 || baseValue <= 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const baseLog = Math.log(baseValue);

            if (baseLog === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = Math.log(numberValue) / baseLog;

            return NumberValueObject.create(result);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return resultArray.getArrayValue()[0][0] as NumberValueObject;
        }

        return resultArray;
    }
}
