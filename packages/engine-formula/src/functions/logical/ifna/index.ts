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

import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';
import { ErrorType } from '../../../basics/error-type';

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

        if (!value.isArray()) {
            return value.isError() && (value as ErrorValueObject).getErrorType() === ErrorType.NA ? valueIfNa : value;
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

        const valueArray = expandArrayValueObject(maxRowLength, maxColumnLength, value);
        const valueIfNaArray = expandArrayValueObject(maxRowLength, maxColumnLength, valueIfNa);

        valueArray.iterator((cellValue, rowIndex, columnIndex) => {
            if (cellValue?.isError() && (cellValue as ErrorValueObject).getErrorType() === ErrorType.NA) {
                valueArray.set(rowIndex, columnIndex, valueIfNaArray.get(rowIndex, columnIndex));
            }
        });

        return valueArray;
    }
}
