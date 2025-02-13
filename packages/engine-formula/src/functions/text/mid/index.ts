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

export class Mid extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(text: BaseValueObject, startNum: BaseValueObject, numChars: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            startNum.isArray() ? (startNum as ArrayValueObject).getRowCount() : 1,
            numChars.isArray() ? (numChars as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            startNum.isArray() ? (startNum as ArrayValueObject).getColumnCount() : 1,
            numChars.isArray() ? (numChars as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const startNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, startNum, ErrorValueObject.create(ErrorType.NA));
        const numCharsArray = expandArrayValueObject(maxRowLength, maxColumnLength, numChars, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.mapValue((textObject, rowIndex, columnIndex) => {
            const startNumObject = startNumArray.get(rowIndex, columnIndex) as BaseValueObject;
            const numCharsObject = numCharsArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (textObject.isError()) {
                return textObject;
            }

            if (startNumObject.isError()) {
                return startNumObject;
            }

            if (numCharsObject.isError()) {
                return numCharsObject;
            }

            return this._handleSingleObject(textObject, startNumObject, numCharsObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(text: BaseValueObject, startNum: BaseValueObject, numChars: BaseValueObject): BaseValueObject {
        const textValue = getTextValueOfNumberFormat(text);

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

        if (text.isNull() || startNumValue > textValue.length || numCharsValue === 0) {
            return StringValueObject.create('');
        }

        const result = textValue.substring(startNumValue - 1, startNumValue - 1 + numCharsValue);

        return StringValueObject.create(result);
    }
}
