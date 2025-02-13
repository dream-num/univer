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
import { calculateFactorial } from '../../../basics/math';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Factdouble extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(number: BaseValueObject): BaseValueObject {
        let _number = number;

        if (number.isArray()) {
            const rowCount = (number as ArrayValueObject).getRowCount();
            const columnCount = (number as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _number = (number as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return this._handleSingleObject(_number);
    }

    private _handleSingleObject(number: BaseValueObject): BaseValueObject {
        let _number = number;

        if (_number.isString()) {
            _number = _number.convertToNumberObjectValue();
        }

        if (_number.isError()) {
            return _number;
        }

        const numberValue = Math.floor(+_number.getValue());

        const result = calculateFactorial(numberValue, 2);

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
