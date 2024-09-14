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
import { charLenByte } from '../../../engine/utils/char-kit';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Leftb extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(text: BaseValueObject, numBytes?: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (numBytes?.isError()) {
            return numBytes;
        }

        const _numBytes = numBytes || NumberValueObject.create(1);

        const maxRowLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
            _numBytes && _numBytes.isArray() ? (_numBytes as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
            _numBytes && _numBytes.isArray() ? (_numBytes as ArrayValueObject).getColumnCount() : 1
        );

        const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text);
        const numBytesArray = expandArrayValueObject(maxRowLength, maxColumnLength, _numBytes);

        return textArray.map((textValue, rowIndex, columnIndex) => {
            return this._handleSingleText(textValue, rowIndex, columnIndex, numBytesArray);
        });
    }

    private _handleSingleText(textValue: BaseValueObject, rowIndex: number, columnIndex: number, numBytesArray: ArrayValueObject) {
        let numBytes = numBytesArray.get(rowIndex, columnIndex) || NumberValueObject.create(1);

        if (numBytes.isError()) {
            return numBytes;
        }

        let textValueString = textValue.getValue();

        if (textValue.isNull()) {
            textValueString = '';
        }

        if (textValue.isBoolean()) {
            textValueString = textValueString ? 'TRUE' : 'FALSE';
        }

        textValueString = `${textValueString}`;

        if (numBytes.isString() || numBytes.isBoolean() || numBytes.isNull()) {
            numBytes = numBytes.convertToNumberObjectValue();
        }

        if (numBytes.isError()) {
            return numBytes;
        }

        const numBytesValueNumber = Math.floor(+numBytes.getValue());

        if (numBytesValueNumber < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return StringValueObject.create(this._sliceByBytes(textValueString, numBytesValueNumber));
    }

    private _sliceByBytes(text: string, numBytes: number) {
        let byteCount = 0;
        let sliceIndex = 0;

        // Iterate over each Unicode character (correctly handling multi-byte characters and emoji)
        for (let i = 0; i < text.length; i++) {
            const char = text[i];
            const charByteLength = charLenByte(char);
            if (byteCount + charByteLength > numBytes) {
                break;
            }
            byteCount += charByteLength;
            sliceIndex++;
        }

        return [...text].slice(0, sliceIndex).join('');
    }
}
