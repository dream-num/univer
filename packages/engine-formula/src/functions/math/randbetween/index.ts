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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';

export class Randbetween extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(bottom: BaseValueObject, top: BaseValueObject) {
        let _bottom = bottom;

        if (_bottom.isArray()) {
            const rowCount = (_bottom as ArrayValueObject).getRowCount();
            const columnCount = (_bottom as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _bottom = (_bottom as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_bottom.isError()) {
            return _bottom;
        }

        let _top = top;

        if (_top.isArray()) {
            const rowCount = (_top as ArrayValueObject).getRowCount();
            const columnCount = (_top as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _top = (_top as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_top.isError()) {
            return _top;
        }

        if (_bottom.isBoolean() || _top.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let bottomValue = +_bottom.getValue();
        let topValue = +_top.getValue();

        if (Number.isNaN(bottomValue) || Number.isNaN(topValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (bottomValue > topValue) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        bottomValue = Math.ceil(bottomValue as number);
        topValue = Math.floor(topValue as number);

        const result = Math.floor(Math.random() * (topValue - bottomValue + 1)) + bottomValue;

        return NumberValueObject.create(result);
    }
}
