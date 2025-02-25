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

import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Base extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(number: BaseValueObject, radix: BaseValueObject, minLength?: BaseValueObject) {
        const _minLength = minLength ?? NumberValueObject.create(0);

        if (number.isError()) {
            return number;
        }

        if (radix.isError()) {
            return radix;
        }

        if (_minLength.isError()) {
            return _minLength;
        }

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            radix.isArray() ? (radix as ArrayValueObject).getRowCount() : 1,
            _minLength.isArray() ? (_minLength as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            radix.isArray() ? (radix as ArrayValueObject).getColumnCount() : 1,
            _minLength.isArray() ? (_minLength as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const radixArray = expandArrayValueObject(maxRowLength, maxColumnLength, radix, ErrorValueObject.create(ErrorType.NA));
        const minLengthArray = expandArrayValueObject(maxRowLength, maxColumnLength, _minLength, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            const radixObject = radixArray.get(rowIndex, columnIndex) as BaseValueObject;
            const minLengthObject = minLengthArray.get(rowIndex, columnIndex) as BaseValueObject;

            return this._handleSingleObject(numberObject, radixObject, minLengthObject);
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return resultArray.getArrayValue()[0][0] as StringValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(numberObject: BaseValueObject, radixObject: BaseValueObject, minLengthObject: BaseValueObject): BaseValueObject {
        let _numberObject = numberObject;

        if (_numberObject.isString()) {
            _numberObject = _numberObject.convertToNumberObjectValue();
        }

        if (_numberObject.isError()) {
            return _numberObject;
        }

        let _radixObject = radixObject;

        if (_radixObject.isString()) {
            _radixObject = _radixObject.convertToNumberObjectValue();
        }

        if (_radixObject.isError()) {
            return _radixObject as BaseValueObject;
        }

        let _minLengthObject = minLengthObject;

        if (_minLengthObject.isString()) {
            _minLengthObject = _minLengthObject.convertToNumberObjectValue();
        }

        if (_minLengthObject.isError()) {
            return _minLengthObject;
        }

        // Any non-integer number entered as an argument is truncated to an integer.
        const numberValue = Math.floor(+_numberObject.getValue());
        const radixValue = Math.floor(+_radixObject.getValue());
        const minLengthValue = Math.floor(+_minLengthObject.getValue());

        // The number that you want to convert. Must be an integer greater than or equal to 0 and less than 2^53.
        if (numberValue < 0 || numberValue >= 2 ** 53) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // The base radix that you want to convert the number into. Must be an integer greater than or equal to 2 and less than or equal to 36.
        if (radixValue < 2 || radixValue > 36) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // The minimum length of the returned string. Must be an integer greater than or equal to 0.
        if (minLengthValue < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = numberValue.toString(radixValue);

        if (result.length < minLengthValue) {
            result = new Array(minLengthValue - result.length + 1).join('0') + result;
        }

        return StringValueObject.create(result.toLocaleUpperCase());
    }
}
