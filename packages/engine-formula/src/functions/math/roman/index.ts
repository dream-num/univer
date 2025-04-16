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
import { arabicToRomanMap, romanFormArray } from '../../../basics/math';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Roman extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, form?: BaseValueObject): BaseValueObject {
        const _form = form ?? NumberValueObject.create(0);

        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            _form.isArray() ? (_form as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            _form.isArray() ? (_form as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const formArray = expandArrayValueObject(maxRowLength, maxColumnLength, _form, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.mapValue((numberObject, rowIndex, columnIndex) => {
            const formObject = formArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberObject.isError()) {
                return numberObject;
            }

            if (formObject.isError()) {
                return formObject;
            }

            return this._handleSingleObject(numberObject, formObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(number: BaseValueObject, form: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(number);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [numberObject] = variants as BaseValueObject[];

        let numberValue = Math.floor(+numberObject.getValue());

        let _form = form;

        if (_form.isString()) {
            _form = _form.convertToNumberObjectValue();

            if (_form.isError()) {
                return _form;
            }
        }

        let formValue = Math.floor(+_form.getValue());

        if (_form.isBoolean()) {
            formValue = _form.getValue() ? 0 : 4;
        }

        if (numberValue < 0 || numberValue > 3999 || formValue < 0 || formValue > 4) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const formArray = romanFormArray[formValue];

        let index = formArray.length - 1;
        let result = '';

        while (numberValue > 0) {
            index = this._binarySearch(numberValue, 0, index, formArray);

            const number = formArray[index];

            numberValue -= number;

            result += arabicToRomanMap.get(number);
        }

        return StringValueObject.create(result);
    }

    private _binarySearch(target: number, left: number, right: number, array: Array<number>): number {
        let _left = left;
        let _right = right;

        while (_right - _left > 1) {
            const mid = Math.floor((_left + _right) / 2);
            const midValue = array[mid];

            if (midValue === target) {
                return mid;
            }

            if (midValue > target) {
                _right = mid;
            } else {
                _left = mid;
            }
        }

        return _left !== _right && array[_right] <= target ? _right : _left;
    }
}
