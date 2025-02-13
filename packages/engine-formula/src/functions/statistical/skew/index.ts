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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Skew extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        const values: number[] = [];

        let sum = 0;

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isError()) {
                return variant;
            }

            if (variant.isString()) {
                const _variant = variant.convertToNumberObjectValue();

                if (_variant.isError()) {
                    return _variant;
                }
            }

            const rowCount = variant.isArray() ? (variant as ArrayValueObject).getRowCount() : 1;
            const columnCount = variant.isArray() ? (variant as ArrayValueObject).getColumnCount() : 1;

            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < columnCount; c++) {
                    const valueObject = variant.isArray() ? (variant as ArrayValueObject).get(r, c) as BaseValueObject : variant;

                    if (valueObject.isError()) {
                        return valueObject;
                    }

                    if (valueObject.isNull() || valueObject.isBoolean()) {
                        continue;
                    }

                    const value = valueObject.getValue();

                    if (!isRealNum(value)) {
                        continue;
                    }

                    values.push(+value);
                    sum += +value;
                }
            }
        }

        if (values.length <= 2) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return this._getResult(values, sum);
    }

    private _getResult(values: number[], sum: number): BaseValueObject {
        const n = values.length;
        const mean = sum / n;

        let sum2 = 0;

        for (let i = 0; i < n; i++) {
            sum2 += (values[i] - mean) ** 2;
        }

        const stdev = Math.sqrt(sum2 / (n - 1));

        if (stdev === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        let sum3 = 0;

        for (let i = 0; i < n; i++) {
            sum3 += ((values[i] - mean) / stdev) ** 3;
        }

        const result = n / ((n - 1) * (n - 2)) * sum3;

        return NumberValueObject.create(result);
    }
}
