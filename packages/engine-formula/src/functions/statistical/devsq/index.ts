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

import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Devsq extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        const values: number[] = [];
        let sum = 0;
        let noCalculate = true;

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isArray()) {
                let isError = false;
                let errorObject = ErrorValueObject.create(ErrorType.VALUE);

                (variant as ArrayValueObject).iterator((valueObject) => {
                    const _valueObject = this._handleSingleObject(valueObject as BaseValueObject);

                    if (_valueObject.isError()) {
                        isError = true;
                        errorObject = _valueObject as ErrorValueObject;
                        return false;
                    }

                    if (_valueObject.isNull()) {
                        return true;
                    }

                    const value = (_valueObject as NumberValueObject).getValue();

                    values.push(value);
                    sum += value;
                    noCalculate = false;
                });

                if (isError) {
                    return errorObject;
                }
            } else {
                const _variant = this._handleSingleObject(variant);

                if (_variant.isError()) {
                    return _variant;
                }

                if (_variant.isNull()) {
                    continue;
                }

                const value = (_variant as NumberValueObject).getValue();

                values.push(value);
                sum += value;
                noCalculate = false;
            }
        }

        if (noCalculate) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const mean = sum / values.length;

        let result = 0;

        for (let i = 0; i < values.length; i++) {
            result += (values[i] - mean) ** 2;
        }

        return NumberValueObject.create(result);
    }

    private _handleSingleObject(variant: BaseValueObject): BaseValueObject {
        if (variant.isError()) {
            return variant;
        }

        if (variant.isNull() || variant.isBoolean()) {
            return NullValueObject.create();
        }

        const value = variant.getValue();

        if (!isRealNum(value)) {
            return NullValueObject.create();
        }

        return NumberValueObject.create(+value);
    }
}
