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
import { getCharLenByteInText } from '../../../engine/utils/char-kit';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Midb extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(text: BaseValueObject, startNum: BaseValueObject, numBytes: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            startNum.isArray() ? (startNum as ArrayValueObject).getRowCount() : 1,
            numBytes.isArray() ? (numBytes as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            startNum.isArray() ? (startNum as ArrayValueObject).getColumnCount() : 1,
            numBytes.isArray() ? (numBytes as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const startNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, startNum, ErrorValueObject.create(ErrorType.NA));
        const numBytesArray = expandArrayValueObject(maxRowLength, maxColumnLength, numBytes, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.mapValue((textObject, rowIndex, columnIndex) => {
            const startNumObject = startNumArray.get(rowIndex, columnIndex) as BaseValueObject;
            const numBytesObject = numBytesArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (textObject.isError()) {
                return textObject;
            }

            if (startNumObject.isError()) {
                return startNumObject;
            }

            if (numBytesObject.isError()) {
                return numBytesObject;
            }

            return this._handleSingleObject(textObject, startNumObject, numBytesObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(text: BaseValueObject, startNum: BaseValueObject, numBytes: BaseValueObject): BaseValueObject {
        let textValue = getTextValueOfNumberFormat(text);

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(startNum, numBytes);

        if (isError) {
            return errorObject as BaseValueObject;
        }

        const [startNumObject, numBytesObject] = variants as BaseValueObject[];

        const startNumValue = Math.floor(+startNumObject.getValue());
        const numBytesValue = Math.floor(+numBytesObject.getValue());

        if (startNumValue <= 0 || numBytesValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (text.isNull() || startNumValue > textValue.length || numBytesValue === 0) {
            return StringValueObject.create('');
        }

        textValue = textValue.substring(startNumValue - 1);

        let index = 0;
        let lenByte = 0;
        let result = '';

        while (lenByte < numBytesValue && index < textValue.length) {
            lenByte += getCharLenByteInText(textValue, index);
            result += textValue.charAt(index);
            index++;
        }

        return StringValueObject.create(result);
    }
}
