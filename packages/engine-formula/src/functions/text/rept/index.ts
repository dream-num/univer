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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Rept extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(text: BaseValueObject, numberTimes: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (numberTimes.isError()) {
            return numberTimes;
        }

        // get max row length
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            numberTimes.isArray() ? (numberTimes as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            numberTimes.isArray() ? (numberTimes as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const numberTimesArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberTimes, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.map((textObject, rowIndex, columnIndex) => {
            let numberTimesObject = numberTimesArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (textObject.isError()) {
                return textObject;
            }

            let textValue = textObject.getValue();

            if (textObject.isNull()) {
                textValue = '';
            }

            if (textObject.isBoolean()) {
                textValue = textValue ? 'TRUE' : 'FALSE';
            }

            textValue += '';

            if (numberTimesObject.isString()) {
                numberTimesObject = numberTimesObject.convertToNumberObjectValue();
            }

            if (numberTimesObject.isError()) {
                return numberTimesObject;
            }

            const stringMaxLength = 32767;
            const numberTimesValue = Math.floor(+numberTimesObject.getValue());

            if (numberTimesValue < 0 || numberTimesValue > stringMaxLength / (textValue as string).length) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const result = (textValue as string).repeat(numberTimesValue);

            return StringValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
