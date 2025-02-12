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
import { calculateFactorial } from '../../../basics/math';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Multinomial extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        let sum = 0;
        let den = 1;

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isNull()) {
                continue;
            }

            if (variant.isArray()) {
                let isError = false;
                let errorObject: ErrorValueObject = ErrorValueObject.create(ErrorType.VALUE);

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject?.isNull()) {
                        return true;
                    }

                    const { isError: _isError, errorObject: _errorObject, number } = this._handleSingleObject(valueObject as BaseValueObject);

                    if (_isError) {
                        isError = true;
                        errorObject = _errorObject as ErrorValueObject;
                        return false;
                    }

                    sum += number as number;

                    if (sum > 170) {
                        isError = true;
                        errorObject = ErrorValueObject.create(ErrorType.NUM);
                        return false;
                    }

                    den *= calculateFactorial(number as number);
                });

                if (isError) {
                    return errorObject as ErrorValueObject;
                }
            } else {
                const { isError, errorObject, number } = this._handleSingleObject(variant);

                if (isError) {
                    return errorObject as ErrorValueObject;
                }

                sum += number as number;

                if (sum > 170) {
                    return ErrorValueObject.create(ErrorType.NUM);
                }

                den *= calculateFactorial(number as number);
            }
        }

        const result = calculateFactorial(sum) / den;

        return NumberValueObject.create(result);
    }

    private _handleSingleObject(number: BaseValueObject) {
        if (number.isBoolean()) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
                number: null,
            };
        }

        let _number = number;

        if (number.isString()) {
            _number = _number.convertToNumberObjectValue();
        }

        if (_number.isError()) {
            return {
                isError: true,
                errorObject: _number as ErrorValueObject,
                number: null,
            };
        }

        const numberValue = Math.floor(+_number.getValue());

        if (numberValue < 0) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.NUM),
                number: null,
            };
        }

        return {
            isError: false,
            errorObject: null,
            number: numberValue,
        };
    }
}
