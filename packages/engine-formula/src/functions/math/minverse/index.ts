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
import { calculateMinverse } from '../../../basics/math';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Minverse extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(array: BaseValueObject): BaseValueObject {
        const arrayRowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const arrayColumnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        const matrix: number[][] = [];

        for (let r = 0; r < arrayRowCount; r++) {
            const row: number[] = [];

            for (let c = 0; c < arrayColumnCount; c++) {
                let valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject;
                }

                if (valueObject.isNull() || valueObject.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                if (valueObject.isString()) {
                    valueObject = valueObject.convertToNumberObjectValue();
                }

                if (valueObject.isError()) {
                    return valueObject;
                }

                const value = +valueObject.getValue();

                row.push(value);
            }

            matrix.push(row);
        }

        if (arrayRowCount !== arrayColumnCount) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const result = calculateMinverse(matrix);

        if (result === null) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return ArrayValueObject.createByArray(result);
    }
}
