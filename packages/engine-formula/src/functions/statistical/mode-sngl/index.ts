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

import type { modeSnglValueCountMapType } from '../../../basics/statistical';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { getModeSnglResult } from '../../../basics/statistical';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class ModeSngl extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        const valueCountMap: modeSnglValueCountMapType = {};

        let order = 0;
        let valueMaxCount = 1;

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

                    if (valueCountMap[+value]) {
                        valueCountMap[+value].count++;

                        if (valueCountMap[+value].count > valueMaxCount) {
                            valueMaxCount = valueCountMap[+value].count;
                        }
                    } else {
                        valueCountMap[+value] = { count: 1, order: order++ };
                    }
                }
            }
        }

        if (order === 0 || valueMaxCount === 1) {
            return new ErrorValueObject(ErrorType.NA);
        }

        return getModeSnglResult(valueCountMap, valueMaxCount);
    }
}
