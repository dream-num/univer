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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Leftb extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(text: BaseValueObject, numBytes?: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (numBytes && numBytes.isError()) {
            return numBytes;
        }

        if (text.isArray()) {
            const maxRowLength = Math.max(
                text.isArray() ? (text as ArrayValueObject).getRowCount() : 1,
                numBytes && numBytes.isArray() ? (numBytes as ArrayValueObject).getRowCount() : 1
            );

            const maxColumnLength = Math.max(
                text.isArray() ? (text as ArrayValueObject).getColumnCount() : 1,
                numBytes && numBytes.isArray() ? (numBytes as ArrayValueObject).getColumnCount() : 1
            );

            const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text);
            const numBytesArray = numBytes ? expandArrayValueObject(maxRowLength, maxColumnLength, numBytes) : null;

            return textArray.map((textValue, rowIndex, columnIndex) => {
                if (textValue.isError()) {
                    return textValue;
                }

                const numBytesValue = numBytesArray ? numBytesArray.get(rowIndex, columnIndex) : NumberValueObject.create(1);

                if (numBytesValue?.isError()) {
                    return numBytesValue;
                }

                const numBytesValueNumber = numBytesValue?.getValue() as number;

                if (typeof numBytesValueNumber !== 'number' || numBytesValueNumber < 0) {
                    return ArrayValueObject.createByArray([[ErrorType.VALUE]]);
                }

                const textValueString = `${textValue.getValue()}`;
                return StringValueObject.create(this._sliceByBytes(textValueString, numBytesValueNumber));
            });
        }

        return this._handleSingleText(text, numBytes);
    }

    private _handleSingleText(text: BaseValueObject, numBytes?: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        const textValueString = `${text.getValue()}`;
        const numBytesValueNumber = numBytes ? (numBytes.getValue() as number) : 1;

        if (typeof numBytesValueNumber !== 'number' || numBytesValueNumber < 0) {
            return ArrayValueObject.createByArray([[ErrorType.VALUE]]);
        }

        return ArrayValueObject.createByArray([[this._sliceByBytes(textValueString, numBytesValueNumber)]]);
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
