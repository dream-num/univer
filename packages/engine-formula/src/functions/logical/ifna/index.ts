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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Ifna extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override needsReferenceObject = true;

    override calculate(input: FunctionVariantType, fallback: FunctionVariantType) {
        const value = this._toValueObject(input);
        const valueIfNa = this._toValueObject(fallback);
        if (value.isError() && (value as ErrorValueObject).getErrorType() !== ErrorType.NA) {
            return value;
        }

        if (!value.isArray()) {
            return value.isError() ? valueIfNa : value;
        }

        // get max row length
        const maxRowLength = Math.max(
            value.isArray() ? (value as ArrayValueObject).getRowCount() : 1,
            valueIfNa.isArray() ? (valueIfNa as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            value.isArray() ? (value as ArrayValueObject).getColumnCount() : 1,
            valueIfNa.isArray() ? (valueIfNa as ArrayValueObject).getColumnCount() : 1
        );

        const valueArray = expandArrayValueObject(maxRowLength, maxColumnLength, value, ErrorValueObject.create(ErrorType.NA));
        const valueIfNaArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfNa, ErrorValueObject.create(ErrorType.NA));

        valueArray.iterator((cellValue, rowIndex, columnIndex) => {
            const result = cellValue?.isError() && (cellValue as ErrorValueObject).getErrorType() === ErrorType.NA ? valueIfNaArray.get(rowIndex, columnIndex) : cellValue;
            valueArray.set(rowIndex, columnIndex, result == null || result.isNull() ? NumberValueObject.create(0) : result);
        });

        return valueArray;
    }

    private _toValueObject(value: FunctionVariantType): BaseValueObject {
        if (!value.isReferenceObject()) {
            return value as BaseValueObject;
        }
        const array = (value as BaseReferenceObject).toArrayValueObject();
        return array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
    }
}
