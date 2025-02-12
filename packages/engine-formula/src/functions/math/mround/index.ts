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
import { round } from '../../../engine/utils/math-kit';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';

export class Mround extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(number: BaseValueObject, multiple: BaseValueObject) {
        let _number = number;

        if (_number.isArray()) {
            const rowCount = (_number as ArrayValueObject).getRowCount();
            const columnCount = (_number as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _number = (_number as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_number.isError()) {
            return _number;
        }

        let _multiple = multiple;

        if (_multiple.isArray()) {
            const rowCount = (_multiple as ArrayValueObject).getRowCount();
            const columnCount = (_multiple as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _multiple = (_multiple as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_multiple.isError()) {
            return _multiple;
        }

        if (_number.isBoolean() || _multiple.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const numberValue = +_number.getValue();
        const multipleValue = +_multiple.getValue();

        if (Number.isNaN(numberValue) || Number.isNaN(multipleValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (multipleValue === 0) {
            return NumberValueObject.create(0);
        }

        if ((numberValue > 0 && multipleValue < 0) || (numberValue < 0 && multipleValue > 0)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = round(numberValue / multipleValue, 0) * multipleValue;

        return NumberValueObject.create(result);
    }
}
