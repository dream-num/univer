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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sqrtpi extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(number: BaseValueObject) {
        let _number = number;

        if (_number.isArray()) {
            const rowCount = (_number as ArrayValueObject).getRowCount();
            const columnCount = (_number as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _number = (_number as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_number.isString()) {
            _number = _number.convertToNumberObjectValue();
        }

        if (_number.isError()) {
            return _number;
        }

        const numberValue = +_number.getValue();

        if (numberValue < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = Math.sqrt(numberValue * Math.PI);

        return NumberValueObject.create(result);
    }
}
