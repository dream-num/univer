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
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';

export class Scan extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(initialValue: FunctionVariantType, array: FunctionVariantType, lambda: BaseValueObject): BaseValueObject {
        let _initialValue = initialValue;
        let _initialValue_reference: Nullable<BaseReferenceObject> = null;

        if (initialValue.isReferenceObject()) {
            _initialValue = (initialValue as BaseReferenceObject).toArrayValueObject();
            _initialValue_reference = initialValue as BaseReferenceObject;
        }

        _initialValue = _initialValue as BaseValueObject;

        let _array = array;
        let _array_reference: Nullable<BaseReferenceObject> = null;

        if (array.isReferenceObject()) {
            _array = (array as BaseReferenceObject).toArrayValueObject();
            _array_reference = array as BaseReferenceObject;
        }

        _array = _array as BaseValueObject;

        if (_initialValue.isError()) {
            return _initialValue;
        }

        if (_array.isError()) {
            return _array;
        }

        if (lambda.isError()) {
            return lambda;
        }

        if (!(lambda.isValueObject() && (lambda as LambdaValueObjectObject).isLambda() && (lambda as LambdaValueObjectObject).getLambdaPrivacyVarKeys().length === 2)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (_initialValue.isArray()) {
            const rowCount = (_initialValue as ArrayValueObject).getRowCount();
            const columnCount = (_initialValue as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.CALC);
            }

            _initialValue = (_initialValue as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return this._getResult(_initialValue, _array, lambda as LambdaValueObjectObject, _initialValue_reference, _array_reference);
    }

    // eslint-disable-next-line
    private _getResult(
        initialValue: BaseValueObject,
        array: BaseValueObject,
        lambda: LambdaValueObjectObject,
        _initialValue_reference: Nullable<BaseReferenceObject>,
        _array_reference: Nullable<BaseReferenceObject>
    ): BaseValueObject {
        const resultArray: BaseValueObject[][] = [];
        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        // let accumulator = initialValue;
        let accumulator: FunctionVariantType = initialValue;

        if (_initialValue_reference) {
            accumulator = _initialValue_reference;
        }

        for (let r = 0; r < rowCount; r++) {
            const row: BaseValueObject[] = [];

            for (let c = 0; c < columnCount; c++) {
                if (accumulator.isError()) {
                    row.push(accumulator as BaseValueObject);
                    continue;
                }

                let valueObject: FunctionVariantType = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

                if (valueObject.isError()) {
                    accumulator = valueObject;
                    row.push(valueObject);
                    continue;
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

                let value = lambda.execute(accumulator, valueObject) as BaseValueObject;

                if (value.isArray()) {
                    const rowCount = (value as ArrayValueObject).getRowCount();
                    const columnCount = (value as ArrayValueObject).getColumnCount();

                    if (rowCount > 1 || columnCount > 1) {
                        return ErrorValueObject.create(ErrorType.CALC);
                    }

                    value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                if (value.isNull()) {
                    value = NumberValueObject.create(0);
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
