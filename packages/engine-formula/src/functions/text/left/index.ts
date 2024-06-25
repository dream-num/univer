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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Left extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(text: BaseValueObject, numChars?: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (numChars && numChars.isError()) {
            return numChars;
        }
        // Check if either text or numChars is an array
        const isTextArray = text.isArray();
        const isNumCharsArray = numChars && numChars.isArray();

        if (isTextArray || isNumCharsArray) {
            const maxRowLength = Math.max(
                isTextArray ? (text as ArrayValueObject).getRowCount() : 1,
                isNumCharsArray ? (numChars as ArrayValueObject).getRowCount() : 1
            );

            const maxColumnLength = Math.max(
                isTextArray ? (text as ArrayValueObject).getColumnCount() : 1,
                isNumCharsArray ? (numChars as ArrayValueObject).getColumnCount() : 1
            );

            const textArray = expandArrayValueObject(maxRowLength, maxColumnLength, text);
            const numCharsArray = numChars ? expandArrayValueObject(maxRowLength, maxColumnLength, numChars) : null;
            return textArray.map((textValue, rowIndex, columnIndex) => {
                if (textValue.isError()) {
                    return textValue;
                }

                const numCharsValue = numCharsArray ? numCharsArray.get(rowIndex, columnIndex) : NumberValueObject.create(1);
                if (numCharsValue?.isError()) {
                    return numCharsValue;
                }

                const numCharsValueNumber = numCharsValue?.getValue() as number;

                if (typeof numCharsValueNumber !== 'number' || numCharsValueNumber < 0) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const textValueString = `${textValue.getValue()}`;
                return StringValueObject.create(Array.from(textValueString).slice(0, numCharsValueNumber).join(''));
            });
        }

        return this._handleSingleText(text, numChars);
    }

    private _handleSingleText(text: BaseValueObject, numChars?: BaseValueObject) {
        if (text.isError()) {
            return text;
        }

        if (numChars && numChars.isError()) {
            return numChars;
        }

        const textValueString = `${text.getValue()}`;
        const numCharsValueNumber = numChars ? (numChars.getValue() as number) : 1;

        if (typeof numCharsValueNumber !== 'number' || numCharsValueNumber < 0) {
            return ArrayValueObject.createByArray([[ErrorType.VALUE]]);
        }

        return ArrayValueObject.createByArray([[Array.from(textValueString).slice(0, numCharsValueNumber).join('')]]);
    }
}
