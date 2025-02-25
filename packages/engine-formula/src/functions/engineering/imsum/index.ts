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

import type { Nullable } from '@univerjs/core';
import { isRealNum } from '@univerjs/core';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { NumberValueObject, StringValueObject } from '../../../engine/value-object/primitive-object';
import { Complex } from '../../../basics/complex';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class Imsum extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        let result: number | string | ErrorValueObject = '';

        for (let i = 0; i < variants.length; i++) {
            if (result instanceof ErrorValueObject) {
                return result;
            }

            const variant = variants[i];

            if (variant.isArray()) {
                let isError = false;
                let errorObject: Nullable<ErrorValueObject>;

                (variant as ArrayValueObject).iterator((valueObject) => {
                    result = this._handleSingleObject(valueObject as BaseValueObject, result as number | string);

                    if (result instanceof ErrorValueObject) {
                        isError = true;
                        errorObject = result;
                        return false;
                    }
                });

                if (isError) {
                    return errorObject as ErrorValueObject;
                }
            } else {
                result = this._handleSingleObject(variant, result);
            }
        }

        if (result instanceof ErrorValueObject) {
            return result;
        }

        if (typeof result === 'number' || isRealNum(result)) {
            return NumberValueObject.create(+result);
        }

        return StringValueObject.create(result);
    }

    private _handleSingleObject(variant: BaseValueObject, result: number | string): number | string | ErrorValueObject {
        let _result = result;

        if (variant.isError()) {
            return variant as ErrorValueObject;
        }

        if (variant.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const value = `${variant.getValue()}`;

        if (typeof result !== 'number' && !result) {
            const complex = new Complex(value);

            if (complex.isError()) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            _result = complex.toString();
        } else {
            const complex1: Complex = new Complex(result);
            const complex2 = new Complex(value);

            if (complex1.isError() || complex2.isError()) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // Cannot perform operations on complex numbers with different suffixes.
            if (complex1.isDifferentSuffixes(complex2)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _result = complex1.Sum(complex2);
        }

        return _result;
    }
}
