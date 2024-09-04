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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';
import { BaseFunction } from '../../base-function';

export class Scan extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(initialValue: BaseValueObject, array: BaseValueObject, lambda: BaseValueObject): BaseValueObject {
        if (initialValue.isError()) {
            return initialValue;
        }

        if (array.isError()) {
            return array;
        }

        if (lambda.isError()) {
            return lambda;
        }

        if (!(lambda.isValueObject() && (lambda as LambdaValueObjectObject).isLambda())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _initialValue = initialValue;

        if (initialValue.isArray()) {
            const rowCount = (initialValue as ArrayValueObject).getRowCount();
            const columnCount = (initialValue as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.CALC);
            }

            _initialValue = (initialValue as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return this._getResult(_initialValue, array, lambda as LambdaValueObjectObject);
    }

    private _getResult(initialValue: BaseValueObject, array: BaseValueObject, lambda: LambdaValueObjectObject): BaseValueObject {
        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        let accumulator = initialValue;
        const resultArray: BaseValueObject[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const row: BaseValueObject[] = [];

            for (let c = 0; c < columnCount; c++) {
                if (accumulator.isError()) {
                    row.push(accumulator);
                    continue;
                }

                const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    accumulator = valueObject;
                    row.push(valueObject);
                    continue;
                }

                let value = lambda.execute(accumulator, valueObject) as BaseValueObject;

                if (value.isArray()) {
                    value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                if (value.isError()) {
                    return value;
                }

                accumulator = value;

                row.push(value);
            }

            resultArray.push(row);
        }

        if (rowCount === 1 && columnCount === 1) {
            return resultArray[0][0];
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount,
            columnCount,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }
}
