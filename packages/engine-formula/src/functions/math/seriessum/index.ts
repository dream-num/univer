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
import { checkVariantsErrorIsArrayOrBoolean, checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

export class Seriessum extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(x: BaseValueObject, n: BaseValueObject, m: BaseValueObject, coefficients: BaseValueObject): BaseValueObject {
        if (x.isNull() || n.isNull() || m.isNull() || coefficients.isNull()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(x, n, m);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const { isError: isError2, errorObject: errorObject2, variants: variants2 } = checkVariantsErrorIsStringToNumber(...variants as BaseValueObject[]);

        if (isError2) {
            return errorObject2 as ErrorValueObject;
        }

        const [xObject, nObject, mObject] = variants2 as BaseValueObject[];

        const xValue = +xObject.getValue();
        const nValue = +nObject.getValue();
        const mValue = +mObject.getValue();

        const coefficientsArray: number[] = [];

        if (coefficients.isArray()) {
            let isError_coefficients = false;
            let errorObject_coefficients: ErrorValueObject = ErrorValueObject.create(ErrorType.VALUE);

            (coefficients as ArrayValueObject).iterator((coefficientsObject) => {
                const { isError: _isError, errorObject: _errorObject, coefficientsObject: _coefficientsObject } = this._handleSingleObject(coefficientsObject as BaseValueObject);

                if (_isError) {
                    isError_coefficients = true;
                    errorObject_coefficients = _errorObject as ErrorValueObject;
                    return false;
                }

                const coefficientsValue = +(_coefficientsObject as BaseValueObject).getValue();

                coefficientsArray.push(coefficientsValue);
            });

            if (isError_coefficients) {
                return errorObject_coefficients;
            }
        } else {
            const { isError: _isError, errorObject: _errorObject, coefficientsObject: _coefficientsObject } = this._handleSingleObject(coefficients);

            if (_isError) {
                return _errorObject as ErrorValueObject;
            }

            const coefficientsValue = +(_coefficientsObject as BaseValueObject).getValue();

            coefficientsArray.push(coefficientsValue);
        }

        let result = 0;

        for (let i = 0; i < coefficientsArray.length; i++) {
            result += coefficientsArray[i] * (xValue ** (nValue + i * mValue));
        }

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }

    private _handleSingleObject(coefficientsObject: BaseValueObject) {
        if (coefficientsObject.isError()) {
            return {
                isError: true,
                errorObject: coefficientsObject as ErrorValueObject,
                coefficientsObject: null,
            };
        }

        if (coefficientsObject?.isBoolean()) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.VALUE),
                coefficientsObject: null,
            };
        }

        let _coefficientsObject = coefficientsObject as BaseValueObject;

        if (_coefficientsObject.isString()) {
            _coefficientsObject = _coefficientsObject.convertToNumberObjectValue();
        }

        if (_coefficientsObject.isError()) {
            return {
                isError: true,
                errorObject: _coefficientsObject as ErrorValueObject,
                coefficientsObject: null,
            };
        }

        return {
            isError: false,
            errorObject: null,
            coefficientsObject: _coefficientsObject,
        };
    }
}
