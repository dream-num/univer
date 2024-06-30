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

import { ErrorType } from '../../../basics/error-type';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Ifna extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(value: BaseValueObject, valueIfNa: BaseValueObject) {
        if (value.isError() && (value as ErrorValueObject).getErrorType() !== ErrorType.NA) {
            return value;
        }

        if (valueIfNa.isError()) {
            return valueIfNa;
        }

        const singleValue = this._getSingleValueObject(value);
        const singleValueIfNa = this._getSingleValueObject(valueIfNa);

        if (singleValue.isNull()) {
            return NumberValueObject.create(0);
        }

        if (singleValue.isArray() || singleValueIfNa.isArray()) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        return singleValue.isError() && (singleValue as ErrorValueObject).getErrorType() === ErrorType.NA ? singleValueIfNa : singleValue;
    }

    private _getSingleValueObject(valueObject: BaseValueObject) {
        if (valueObject.isArray() && (valueObject as ArrayValueObject).getRowCount() === 1 && (valueObject as ArrayValueObject).getColumnCount() === 1) {
            return (valueObject as ArrayValueObject).getFirstCell();
        }
        return valueObject;
    }
}
