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
import { charLenByte } from '../../../engine/utils/char-kit';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Findb extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(findText: BaseValueObject, withinText: BaseValueObject, startNum?: BaseValueObject): BaseValueObject {
        const _startNum = startNum ?? NumberValueObject.create(1);

        const maxRowLength = Math.max(
            findText.isArray() ? (findText as ArrayValueObject).getRowCount() : 1,
            withinText.isArray() ? (withinText as ArrayValueObject).getRowCount() : 1,
            _startNum.isArray() ? (_startNum as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            findText.isArray() ? (findText as ArrayValueObject).getColumnCount() : 1,
            withinText.isArray() ? (withinText as ArrayValueObject).getColumnCount() : 1,
            _startNum.isArray() ? (_startNum as ArrayValueObject).getColumnCount() : 1
        );

        const findTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, findText, ErrorValueObject.create(ErrorType.NA));
        const withinTextArray = expandArrayValueObject(maxRowLength, maxColumnLength, withinText, ErrorValueObject.create(ErrorType.NA));
        const startNumArray = expandArrayValueObject(maxRowLength, maxColumnLength, _startNum, ErrorValueObject.create(ErrorType.NA));

        const resultArray = findTextArray.mapValue((findTextObject, rowIndex, columnIndex) => {
            const withinTextObject = withinTextArray.get(rowIndex, columnIndex) as BaseValueObject;
            const startNumObject = startNumArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (findTextObject.isError()) {
                return findTextObject;
            }

            if (withinTextObject.isError()) {
                return withinTextObject;
            }

            if (startNumObject.isError()) {
                return startNumObject;
            }

            return this._handleSingleObject(findTextObject, withinTextObject, startNumObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(findText: BaseValueObject, withinText: BaseValueObject, startNum: BaseValueObject): BaseValueObject {
        const findTextValue = getTextValueOfNumberFormat(findText);
        const withinTextValue = getTextValueOfNumberFormat(withinText);

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(startNum);

        if (isError) {
            return errorObject as BaseValueObject;
        }

        const [startNumObject] = variants as BaseValueObject[];

        const startNumValue = Math.floor(+startNumObject.getValue());

        if (withinText.isNull() || startNumValue <= 0 || startNumValue > withinTextValue.length) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (findText.isNull() || findTextValue.length === 0) {
            return NumberValueObject.create(startNumValue);
        }

        const index = withinTextValue.indexOf(findTextValue, startNumValue - 1);

        if (index === -1) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = charLenByte(withinTextValue.substring(0, index)) + 1;

        return NumberValueObject.create(result);
    }
}
