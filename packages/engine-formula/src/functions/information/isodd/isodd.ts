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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Isodd extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(value: BaseValueObject) {
        let _value = value;

        if (_value.isArray()) {
            const rowCount = (_value as ArrayValueObject).getRowCount();
            const columnCount = (_value as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _value = (_value as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_value.isError()) {
            return _value;
        }

        if (_value.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const val = Math.trunc(+_value.getValue());

        if (Number.isNaN(val)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = val % 2 !== 0;

        return BooleanValueObject.create(result);
    }
}
