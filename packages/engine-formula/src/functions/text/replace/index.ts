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
import { getTextValueOfNumberFormat } from '../../../basics/format';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Replace extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(oldText: BaseValueObject, startNum: BaseValueObject, numChars: BaseValueObject, newText: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            oldText.isArray() ? (oldText as ArrayValueObject).getRowCount() : 1,
            startNum.isArray() ? (startNum as ArrayValueObject).getRowCount() : 1,
            numChars.isArray() ? (numChars as ArrayValueObject).getRowCount() : 1,
            newText.isArray() ? (newText as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            oldText.isArray() ? (oldText as ArrayValueObject).getColumnCount() : 1,
            startNum.isArray() ? (startNum as ArrayValueObject).getColumnCount() : 1,
            numChars.isArray() ? (numChars as ArrayValueObject).getColumnCount() : 1,
            newText.isArray() ? (newText as ArrayValueObject).getColumnCount() : 1
        );

        const oldTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, oldText, ErrorValueObject.create(ErrorType.NA));
        const startNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, startNum, ErrorValueObject.create(ErrorType.NA));
        const numCharsArray = expandArrayValueObject(maxRowLength, maxColumnLength, numChars, ErrorValueObject.create(ErrorType.NA));
        const newTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, newText, ErrorValueObject.create(ErrorType.NA));

        const resultArray = oldTextArray.mapValue((oldTextObject, rowIndex, columnIndex) => {
            const startNumObject = startNumArray.get(rowIndex, columnIndex) as BaseValueObject;
            const numCharsObject = numCharsArray.get(rowIndex, columnIndex) as BaseValueObject;
            const newTextObject = newTextArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (oldTextObject.isError()) {
                return oldTextObject;
            }

            if (startNumObject.isError()) {
                return startNumObject;
            }

            if (numCharsObject.isError()) {
                return numCharsObject;
            }

            if (newTextObject.isError()) {
                return newTextObject;
            }

            return this._handleSingleObject(oldTextObject, startNumObject, numCharsObject, newTextObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(oldText: BaseValueObject, startNum: BaseValueObject, numChars: BaseValueObject, newText: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(startNum, numChars);

        if (isError) {
            return errorObject as BaseValueObject;
        }

        const [startNumObject, numCharsObject] = variants as BaseValueObject[];

        const startNumValue = Math.floor(+startNumObject.getValue());
        const numCharsValue = Math.floor(+numCharsObject.getValue());

        if (startNumValue <= 0 || numCharsValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const oldTextValue = getTextValueOfNumberFormat(oldText);
        const newTextValue = getTextValueOfNumberFormat(newText);

        const result = oldTextValue.substring(0, startNumValue - 1) + newTextValue + oldTextValue.substring(startNumValue - 1 + numCharsValue);

        return StringValueObject.create(result);
    }
}
