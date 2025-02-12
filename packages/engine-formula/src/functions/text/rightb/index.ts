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
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Rightb extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(text: BaseValueObject, numBytes?: BaseValueObject): BaseValueObject {
        const _numBytes = numBytes ?? NumberValueObject.create(1);

        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            _numBytes.isArray() ? (_numBytes as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            _numBytes.isArray() ? (_numBytes as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text, ErrorValueObject.create(ErrorType.NA));
        const numBytesArray = expandArrayValueObject(maxRowLength, maxColumnLength, _numBytes, ErrorValueObject.create(ErrorType.NA));

        const resultArray = textArray.mapValue((textObject, rowIndex, columnIndex) => {
            const numBytesObject = numBytesArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (textObject.isError()) {
                return textObject;
            }

            if (numBytesObject.isError()) {
                return numBytesObject;
            }

            return this._handleSingleObject(textObject, numBytesObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(text: BaseValueObject, numBytes: BaseValueObject): BaseValueObject {
        const textValue = getTextValueOfNumberFormat(text);

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(numBytes);

        if (isError) {
            return errorObject as BaseValueObject;
        }

        const [numBytesObject] = variants as BaseValueObject[];

        const numBytesValue = Math.floor(+numBytesObject.getValue());

        if (numBytesValue < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (text.isNull() || numBytesValue === 0) {
            return StringValueObject.create('');
        }

        let index = textValue.length - 1;
        let lenByte = 0;
        let result = '';

        while (lenByte < numBytesValue && index >= 0) {
            lenByte += getCharLenByteInText(textValue, index, 'rtl');
            result = textValue.charAt(index) + result;
            index--;
        }

        return StringValueObject.create(result);
    }
}
