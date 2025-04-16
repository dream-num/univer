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

import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Decimal extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(text: BaseValueObject, radix: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (radix.isError()) {
            return radix;
        }

        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            radix.isArray() ? (radix as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            radix.isArray() ? (radix as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const radixArray = expandArrayValueObject(maxRowLength, maxColumnLength, radix, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.map((textObject, rowIndex, columnIndex) => {
            if (textObject.isError()) {
                return textObject;
            }

            let radixObject = radixArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (radixObject.isString()) {
                radixObject = radixObject.convertToNumberObjectValue();
            }

            if (radixObject.isError()) {
                return radixObject;
            }

            const textValue = `${textObject.getValue()}`;
            const radixValue = Math.floor(+radixObject.getValue());

            // The number that you want to convert. Must be an integer greater than or equal to 0 and less than 2^53.
            if (isRealNum(textValue) && (+textValue < 0 || +textValue >= 2 ** 53 || !Number.isInteger(+textValue))) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (textValue.toLocaleLowerCase() === 'true' || textValue.toLocaleLowerCase() === 'false') {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // The base radix that you want to convert the number into. Must be an integer greater than or equal to 2 and less than or equal to 36.
            if (radixValue < 2 || radixValue > 36) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (textValue.replace(/\s/g, '') === '') {
                return NumberValueObject.create(0);
            }

            if (!this._isValidCharForRadix(textValue, radixValue)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const result = Number.parseInt(textValue, radixValue);

            if (Number.isNaN(result)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _isValidCharForRadix(text: string, radix: number): boolean {
        for (const char of text) {
            const charCode = char.toUpperCase().charCodeAt(0);

            if (radix <= 10 && !(charCode >= 48 && charCode < 48 + radix)) { // '0' to 'radix-1'
                return false;
            }

            if (radix > 10 && !((charCode >= 48 && charCode < 58) || (charCode >= 65 && charCode < 65 + radix - 10))) { // '0' to '9'  'A' to 'A+radix-10'
                return false;
            }
        }

        return true;
    }
}
