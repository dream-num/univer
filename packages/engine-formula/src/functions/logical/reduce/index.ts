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

import type { IRange, Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';

export class Reduce extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(initialValue: FunctionVariantType, array: FunctionVariantType, lambda: BaseValueObject): BaseValueObject {
        let _initialValue: BaseValueObject;
        let _initialValueReference: Nullable<BaseReferenceObject>;
        if (initialValue.isReferenceObject()) {
            _initialValue = (initialValue as BaseReferenceObject).toArrayValueObject();
            _initialValueReference = initialValue as BaseReferenceObject;
        } else {
            _initialValue = initialValue as BaseValueObject;
            _initialValueReference = null;
        }

        let _array: BaseValueObject;
        let _arrayReference: Nullable<BaseReferenceObject>;
        if (array.isReferenceObject()) {
            _array = (array as BaseReferenceObject).toArrayValueObject();
            _arrayReference = array as BaseReferenceObject;
        } else {
            _array = array as BaseValueObject;
            _arrayReference = null;
        }

        if (_initialValue.isArray()) {
            return _initialValue.mapValue((initialValueObject) =>
                this._handleSingleValueObject(initialValueObject, _array, lambda, _initialValueReference, _arrayReference));
        }

        return this._handleSingleValueObject(_initialValue, _array, lambda, _initialValueReference, _arrayReference);
    }

    private _handleSingleValueObject(
        initialValue: BaseValueObject,
        array: BaseValueObject,
        lambda: BaseValueObject,
        _initialValue_reference: Nullable<BaseReferenceObject>,
        _array_reference: Nullable<BaseReferenceObject>
    ): BaseValueObject {
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

        let accumulator: FunctionVariantType = initialValue;

        if (_initialValue_reference) {
            accumulator = _initialValue_reference;
        }

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                let valueObject: FunctionVariantType = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject;
                }

                if (_array_reference) {
                    const { startRow, startColumn } = _array_reference.getRangePosition();
                    const range: IRange = {
                        startRow: startRow + r,
                        startColumn: startColumn + c,
                        endRow: startRow + r,
                        endColumn: startColumn + c,
                    };

                    valueObject = this.createReferenceObject(_array_reference, range);
                }

                let value = _lambda.execute(accumulator, valueObject) as BaseValueObject;

                if (value.isError()) {
                    return value;
                }

                if (value.isNull()) {
                    value = NumberValueObject.create(0);
                }

                accumulator = value;
            }
        }

        if (accumulator.isReferenceObject()) {
            return (accumulator as BaseReferenceObject).toArrayValueObject();
        }

        return accumulator as BaseValueObject;
    }
}
