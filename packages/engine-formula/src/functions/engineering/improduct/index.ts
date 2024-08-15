/**
 * Copyright 2023-present DreamNum Inc.
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

import type { Nullable } from '@univerjs/core';
import { isRealNum } from '@univerjs/core';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { Complex } from '../../../basics/engineering';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Improduct extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]) {
        let result: number | string = '';

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isArray()) {
                let isError = false;
                let errorObject: Nullable<ErrorValueObject>;

                (variant as ArrayValueObject).iterator((valueObject) => {
                    if (valueObject?.isError()) {
                        isError = true;
                        errorObject = valueObject as ErrorValueObject;
                        return false;
                    }

                    if (valueObject?.isBoolean()) {
                        isError = true;
                        errorObject = ErrorValueObject.create(ErrorType.VALUE);
                        return false;
                    }

                    const value = `${valueObject?.getValue()}`;

                    if (typeof result !== 'number' && !result) {
                        result = value;
                    } else {
                        const complex1: Complex = new Complex(result);
                        const complex2 = new Complex(value);

                        if (complex1.isError() || complex2.isError()) {
                            isError = true;
                            errorObject = ErrorValueObject.create(ErrorType.NUM);
                            return false;
                        }

                        result = complex1.Product(complex2);
                    }
                });

                if (isError) {
                    return errorObject as ErrorValueObject;
                }
            } else {
                if (variant.isError()) {
                    return variant;
                }

                if (variant.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const value = `${variant.getValue()}`;

                if (typeof result !== 'number' && !result) {
                    result = value;
                } else {
                    const complex1: Complex = new Complex(result);
                    const complex2 = new Complex(value);

                    if (complex1.isError() || complex2.isError()) {
                        return ErrorValueObject.create(ErrorType.NUM);
                    }

                    result = complex1.Product(complex2);
                }
            }
        }

        if (typeof result === 'number' || isRealNum(result)) {
            return NumberValueObject.create(+result);
        }

        return StringValueObject.create(result);
    }
}
