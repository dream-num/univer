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

type valueMapType = Record<number, {
    count: number;
    order: number;
}>;

export class ModeSngl extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        const valueMap: valueMapType = {};

        let order = 0;
        let maxCount = 1;

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

                    if (valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                        continue;
                    }

                    const value = valueObject.getValue();

                    if (!isRealNum(value)) {
                        continue;
                    }

                    if (valueMap[+value]) {
                        valueMap[+value].count++;

                        if (valueMap[+value].count > maxCount) {
                            maxCount = valueMap[+value].count;
                        }
                    } else {
                        valueMap[+value] = { count: 1, order: order++ };
                    }
                }
            }
        }

        if (order === 0 || maxCount === 1) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return this._getResult(valueMap, maxCount);
    }

    private _getResult(valueMap: valueMapType, maxCount: number): BaseValueObject {
        const result = Object.entries(valueMap)
            .filter(([_, { count }]) => count === maxCount)
            .sort((a, b) => a[1].order - b[1].order)
            .map(([value]) => +value);

        return NumberValueObject.create(result[0]);
    }
}
