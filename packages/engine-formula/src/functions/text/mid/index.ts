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
import { StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Mid extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(withinText: BaseValueObject, startNum: BaseValueObject, numChars: BaseValueObject) {
        if (withinText.isError()) {
            return withinText;
        }

        if (startNum.isError()) {
            return startNum;
        }

        if (numChars.isError()) {
            return numChars;
        }

        if (withinText.isArray()) {
            // get max row length
            const maxRowLength = Math.max(
                withinText.isArray() ? (withinText as ArrayValueObject).getRowCount() : 1,
                startNum.isArray() ? (startNum as ArrayValueObject).getRowCount() : 1,
                numChars.isArray() ? (numChars as ArrayValueObject).getRowCount() : 1
            );

            // get max column length
            const maxColumnLength = Math.max(
                withinText.isArray() ? (withinText as ArrayValueObject).getColumnCount() : 1,
                startNum.isArray() ? (startNum as ArrayValueObject).getColumnCount() : 1,
                numChars.isArray() ? (numChars as ArrayValueObject).getColumnCount() : 1
            );

            const withinTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, withinText);
            const startNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, startNum);
            const numCharsArray = expandArrayValueObject(maxRowLength, maxColumnLength, numChars);

            return withinTextArray.map((withinTextValue, rowIndex, columnIndex) => {
                if (withinTextValue.isError() || withinTextValue.isBoolean()) {
                    return withinTextValue;
                }

                const startNumValue = startNumArray.get(rowIndex, columnIndex);
                const numCharsValue = numCharsArray.get(rowIndex, columnIndex);

                if (startNumValue == null || startNumValue.isError() || numCharsValue == null || numCharsValue.isError()) {
                    return startNumValue || numCharsValue || ErrorValueObject.create(ErrorType.VALUE);
                }

                if (withinTextValue.isBoolean() || startNumValue.isBoolean() || numCharsValue.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                if (withinTextValue.isNull()) {
                    withinTextValue = StringValueObject.create('');
                }

                const withinTextValueString = `${withinTextValue.getValue()}`;
                const startNumValueNumber = (startNumValue.getValue() as number) - 1;
                const numCharsValueNumber = numCharsValue.getValue() as number;

                if (startNumValueNumber < 0 || startNumValueNumber >= withinTextValueString.length) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const graphemes = Array.from(withinTextValueString);
                const substring = graphemes.slice(startNumValueNumber, startNumValueNumber + numCharsValueNumber).join('');

                return StringValueObject.create(substring);
            });
        }
        return this._handleSingleText(withinText, startNum, numChars);
    }

    private _handleSingleText(withinText: BaseValueObject, startNum: BaseValueObject, numChars: BaseValueObject) {
        if (withinText.isError()) {
            return withinText;
        }

        if (startNum.isError()) {
            return startNum;
        }

        if (numChars.isError()) {
            return numChars;
        }

        // Default start number is 1
        const startNumValue = startNum ? (startNum.getValue() as number) : 1;
        const startIndex = startNumValue - 1;

        const numCharsValue = numChars ? (numChars.getValue() as number) : 0;

        const withinTextString = withinText.getValue() as string;

        // Ensure startIndex is within bounds
        if (startIndex < 0 || startIndex >= withinTextString.length) {
            return ArrayValueObject.createByArray([[ErrorType.VALUE]]);
        }

        const graphemes = Array.from(withinTextString);
        const substring = graphemes.slice(startIndex, startIndex + numCharsValue).join('');

        return ArrayValueObject.createByArray([[substring]]);
    }
}

