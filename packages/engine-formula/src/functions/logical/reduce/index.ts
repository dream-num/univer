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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';

export class Reduce extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(initialValue: BaseValueObject, array: BaseValueObject, lambda: BaseValueObject): BaseValueObject {
        if (initialValue.isArray()) {
            return initialValue.mapValue((initialValueObject) => this._handleSingleValueObject(initialValueObject, array, lambda));
        }

        return this._handleSingleValueObject(initialValue, array, lambda);
    }

    private _handleSingleValueObject(initialValue: BaseValueObject, array: BaseValueObject, lambda: BaseValueObject): BaseValueObject {
        if (initialValue.isError()) {
            return initialValue;
        }

        if (array.isError()) {
            return array;
        }

        if (lambda.isError()) {
            return lambda;
        }

        if (!(lambda.isValueObject() && (lambda as LambdaValueObjectObject).isLambda() && (lambda as LambdaValueObjectObject).getLambdaPrivacyVarKeys().length === 2)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const _lambda = lambda as LambdaValueObjectObject;

        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let accumulator = initialValue;

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject;
                }

                let value = _lambda.execute(accumulator, valueObject) as BaseValueObject;

                if (value.isArray()) {
                    value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                if (value.isError()) {
                    return value;
                }

                if (value.isNull()) {
                    value = NumberValueObject.create(0);
                }

                accumulator = value;
            }
        }

        const result = +accumulator.getValue();

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return NumberValueObject.create(result);
    }
}
