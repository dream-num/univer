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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

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
            return this._handleSingleText(withinTextValue, rowIndex, columnIndex, startNumArray, numCharsArray);
        });
    }

    private _handleSingleText(withinTextValue: BaseValueObject, rowIndex: number, columnIndex: number, startNumArray: ArrayValueObject, numCharsArray: ArrayValueObject) {
        let startNumValue = startNumArray.get(rowIndex, columnIndex) || NullValueObject.create();
        let numCharsValue = numCharsArray.get(rowIndex, columnIndex) || NullValueObject.create();

        if (startNumValue.isError()) {
            return startNumValue;
        }

        if (numCharsValue.isError()) {
            return numCharsValue;
        }

        let withinTextValueString = withinTextValue.getValue();

        if (withinTextValue.isNull()) {
            withinTextValueString = '';
        }

        if (withinTextValue.isBoolean()) {
            withinTextValueString = withinTextValueString ? 'TRUE' : 'FALSE';
        }

        withinTextValueString = `${withinTextValueString}`;

        if (startNumValue.isString() || startNumValue.isBoolean() || startNumValue.isNull()) {
            startNumValue = startNumValue.convertToNumberObjectValue();
        }

        if (startNumValue.isError()) {
            return startNumValue;
        }

        if (numCharsValue.isString() || numCharsValue.isBoolean() || numCharsValue.isNull()) {
            numCharsValue = numCharsValue.convertToNumberObjectValue();
        }

        if (numCharsValue.isError()) {
            return numCharsValue;
        }

        const startNumValueNumber = Math.floor(+startNumValue.getValue()) - 1;
        const numCharsValueNumber = numCharsValue.getValue() as number;

        if (startNumValueNumber < 0 || numCharsValueNumber < 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return StringValueObject.create(withinTextValueString.substring(startNumValueNumber, startNumValueNumber + numCharsValueNumber));
    }
}

