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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { ceil } from '../../../engine/utils/math-kit';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class CeilingPrecise extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(number: BaseValueObject, significance?: BaseValueObject) {
        const _significance = significance ?? NumberValueObject.create(1);

        if (number.isError()) {
            return number;
        }

        if (_significance.isError()) {
            return _significance;
        }

        // get max row length
        const maxRowLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getRowCount() : 1,
            _significance.isArray() ? (_significance as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            number.isArray() ? (number as ArrayValueObject).getColumnCount() : 1,
            _significance.isArray() ? (_significance as ArrayValueObject).getColumnCount() : 1
        );

        const numberArray = expandArrayValueObject(maxRowLength, maxColumnLength, number, ErrorValueObject.create(ErrorType.NA));
        const significanceArray = expandArrayValueObject(maxRowLength, maxColumnLength, _significance, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberArray.map((numberObject, rowIndex, columnIndex) => {
            let significanceObject = significanceArray.get(rowIndex, columnIndex) as BaseValueObject;

            let _numberObject = numberObject;

            if (_numberObject.isString()) {
                _numberObject = _numberObject.convertToNumberObjectValue();
            }

            if (_numberObject.isError()) {
                return _numberObject;
            }

            if (significanceObject.isString()) {
                significanceObject = significanceObject.convertToNumberObjectValue();
            }

            if (significanceObject.isError()) {
                return significanceObject;
            }

            const numberValue = +_numberObject.getValue();
            const significanceValue = +significanceObject.getValue();

            if (numberValue === 0 || significanceValue === 0) {
                return NumberValueObject.create(0);
            }

            const result = (significanceValue < 0 ? -ceil(numberValue / Math.abs(significanceValue), 0) : ceil(numberValue / significanceValue, 0)) * significanceValue;

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
