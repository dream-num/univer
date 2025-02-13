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
import { calculateMmult } from '../../../basics/math';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Mmult extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(array1: BaseValueObject, array2: BaseValueObject): BaseValueObject {
        const array1RowCount = array1.isArray() ? (array1 as ArrayValueObject).getRowCount() : 1;
        const array1ColumnCount = array1.isArray() ? (array1 as ArrayValueObject).getColumnCount() : 1;

        const array2RowCount = array2.isArray() ? (array2 as ArrayValueObject).getRowCount() : 1;
        const array2ColumnCount = array2.isArray() ? (array2 as ArrayValueObject).getColumnCount() : 1;

        if (array1ColumnCount !== array2RowCount) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const matrix1 = this._getMatrix(array1, array1RowCount, array1ColumnCount);
        const matrix2 = this._getMatrix(array2, array2RowCount, array2ColumnCount);

        if (matrix1 instanceof ErrorValueObject) {
            return matrix1;
        }

        if (matrix2 instanceof ErrorValueObject) {
            return matrix2;
        }

        const result = calculateMmult(matrix1, matrix2);

        return ArrayValueObject.createByArray(result);
    }

    private _getMatrix(array: BaseValueObject, rowCount: number, columnCount: number): number[][] | ErrorValueObject {
        const matrix: number[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const row: number[] = [];

            for (let c = 0; c < columnCount; c++) {
                let valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                if (valueObject.isNull() || valueObject.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                if (valueObject.isString()) {
                    valueObject = valueObject.convertToNumberObjectValue();
                }

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                const value = +valueObject.getValue();

                row.push(value);
            }

            matrix.push(row);
        }

        return matrix;
    }
}
