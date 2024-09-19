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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import { charLenByte } from '../../../engine/utils/char-kit';

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
                const byteLength = charLenByte(textValueString);
                if (numBytesValueNumber >= byteLength) {
                    return ArrayValueObject.createByArray([[textValueString]]); // Return original string if numBytes >= byteLength
                }
                return StringValueObject.create(Array.from(textValueString).slice(0, numBytesValueNumber).join(''));
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
        const byteLength = charLenByte(textValueString);

        if (numBytesValueNumber >= byteLength) {
            return ArrayValueObject.createByArray([[textValueString]]); // Return original string if numBytes >= byteLength
        }

        return ArrayValueObject.createByArray([[Array.from(textValueString).slice(0, numBytesValueNumber).join('')]]);
    }
}
