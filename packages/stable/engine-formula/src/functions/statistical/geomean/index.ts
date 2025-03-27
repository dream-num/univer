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

export class Geomean extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        let sum = 1;
        let len = 0;
        let isNonPositive = false;

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isArray()) {
                let isError = false;
                let errorObject = ErrorValueObject.create(ErrorType.VALUE);

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject?.isError()) {
                        isError = true;
                        errorObject = valueObject as ErrorValueObject;
                        return false;
                    }

                    if (valueObject?.isNull() || valueObject?.isBoolean()) {
                        return true;
                    }

                    const value = (valueObject as BaseValueObject).getValue();

                    if (!isRealNum(value)) {
                        return true;
                    }

                    if (+value <= 0) {
                        isNonPositive = true;
                    }

                    sum *= +value;
                    len++;
                });

                if (isError) {
                    return errorObject;
                }
            } else {
                if (variant.isError()) {
                    return variant;
                }

                if (variant.isString()) {
                    const _variant = variant.convertToNumberObjectValue();

                    if (_variant.isError()) {
                        return _variant;
                    }
                }

                if (variant.isNull() || variant.isBoolean()) {
                    continue;
                }

                const value = variant.getValue();

                if (!isRealNum(value)) {
                    continue;
                }

                if (+value <= 0) {
                    isNonPositive = true;
                }

                sum *= +value;
                len++;
            }
        }

        if (len === 0 || isNonPositive) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = sum ** (1 / len);

        return NumberValueObject.create(result);
    }
}
