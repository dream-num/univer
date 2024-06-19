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
import { charLenByte } from '../../../engine/utils/char-kit';

export class Findb extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(findText: BaseValueObject, withinText: BaseValueObject, startNum?: BaseValueObject) {
        if (findText.isError()) {
            return findText;
        }

        if (withinText.isError()) {
            return withinText;
        }

        if (startNum && startNum.isError()) {
            return startNum;
        }

        if (withinText.isArray()) {
            // get max row length
            const maxRowLength = Math.max(
                findText.isArray() ? (findText as ArrayValueObject).getRowCount() : 1,
                withinText.isArray() ? (withinText as ArrayValueObject).getRowCount() : 1,
                startNum && startNum.isArray() ? (startNum as ArrayValueObject).getRowCount() : 1
            );

            // get max column length
            const maxColumnLength = Math.max(
                findText.isArray() ? (findText as ArrayValueObject).getColumnCount() : 1,
                withinText.isArray() ? (withinText as ArrayValueObject).getColumnCount() : 1,
                startNum && startNum.isArray() ? (startNum as ArrayValueObject).getColumnCount() : 1
            );

            const findTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, findText);
            const withinTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, withinText);
            const startNumArray = startNum ? expandArrayValueObject(maxRowLength, maxColumnLength, startNum) : null;

            return findTextArray.map((findTextValue, rowIndex, columnIndex) => {
                if (findTextValue.isError() || findTextValue.isBoolean()) {
                    return findTextValue;
                }

                let withinTextValue = withinTextArray.get(rowIndex, columnIndex);
                const startNumValue = startNumArray ? startNumArray.get(rowIndex, columnIndex) : NumberValueObject.create(1);

                if (withinTextValue == null || withinTextValue.isError()) {
                    return withinTextValue || ErrorValueObject.create(ErrorType.VALUE);
                }

                if (withinTextValue.isBoolean() || findTextValue.isBoolean() || startNumValue == null || startNumValue.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                if (withinTextValue.isNull()) {
                    withinTextValue = StringValueObject.create('');
                }

                const findTextValueString = `${findTextValue.getValue()}`;
                const withinTextValueString = `${withinTextValue.getValue()}`;
                const startNumValueNumber = (startNumValue.getValue() as number) - 1;

                if (startNumValueNumber < 0 || startNumValueNumber >= withinTextValueString.length) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const foundIndex = this._findByteIndexOf(findTextValueString, withinTextValueString, startNumValueNumber);
                if (foundIndex === -1) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                return NumberValueObject.create(foundIndex + 1);
            });
        }
        return this._handleSingleText(findText, withinText, startNum);
    }

    private _handleSingleText(findText: BaseValueObject, withinText: BaseValueObject, startNum?: BaseValueObject) {
        if (findText.isError()) {
            return findText;
        }

        if (withinText.isError()) {
            return withinText;
        }

        if (startNum && startNum.isError()) {
            return startNum;
        }
        // Default start number is 1
        const startNumValue = startNum ? (startNum.getValue() as number) : 1;
        const startIndex = startNumValue - 1;

        const findTextString = findText.getValue() as string;
        const withinTextString = withinText.getValue() as string;

        // Ensure startIndex is within bounds
        if (startIndex < 0 || startIndex >= withinTextString.length) {
            return ArrayValueObject.createByArray([[ErrorType.VALUE]]);
        }

        const foundIndex = this._findByteIndexOf(findTextString, withinTextString, startIndex);
        if (foundIndex === -1) {
            return ArrayValueObject.createByArray([[ErrorType.VALUE]]);
        }

        // Return 1-based index
        return ArrayValueObject.createByArray([[foundIndex + 1]]);
    }

    private _findByteIndexOf(findTextString: string, withinTextString: string, startIndex: number): number {
        let byteIndex = 0;
        let foundIndex = -1;

        for (let i = 0; i < withinTextString.length; i++) {
            if (i >= startIndex) {
                if (withinTextString.slice(i, i + findTextString.length) === findTextString) {
                    foundIndex = i;
                    break;
                }
            }
            byteIndex += charLenByte(withinTextString[i]);
        }

        return foundIndex === -1 ? -1 : byteIndex;
    }
}
