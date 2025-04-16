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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';

export class Byrow extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override needsReferenceObject = true;

    // eslint-disable-next-line
    override calculate(array: FunctionVariantType, lambda: BaseValueObject): BaseValueObject {
        let _array = array;
        let _array_reference: Nullable<BaseReferenceObject> = null;

        if (array.isReferenceObject()) {
            _array = (array as BaseReferenceObject).toArrayValueObject();
            _array_reference = array as BaseReferenceObject;
        }

        if (_array.isError()) {
            return _array as ErrorValueObject;
        }

        if (lambda.isError()) {
            return lambda;
        }

        if (!(lambda.isValueObject() && (lambda as LambdaValueObjectObject).isLambda() && (lambda as LambdaValueObjectObject).getLambdaPrivacyVarKeys().length === 1)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const _lambda = lambda as LambdaValueObjectObject;

        const rowCount = _array.isArray() ? (_array as ArrayValueObject).getRowCount() : 1;
        const columnCount = _array.isArray() ? (_array as ArrayValueObject).getColumnCount() : 1;
        _array = expandArrayValueObject(rowCount, columnCount, _array as BaseValueObject);

        const result: BaseValueObject[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const rows: BaseValueObject[][] = [[]];

            for (let c = 0; c < columnCount; c++) {
                const col = (_array as ArrayValueObject).get(r, c) as BaseValueObject;
                rows[0].push(col);
            }

            let lambdaVariant: FunctionVariantType = ArrayValueObject.create({
                calculateValueList: rows,
                rowCount: 1,
                columnCount,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });

            if (_array_reference) {
                const { startRow, startColumn } = _array_reference.getRangePosition();
                const range: IRange = {
                    startRow: startRow + r,
                    startColumn,
                    endRow: startRow + r,
                    endColumn: startColumn + columnCount - 1,
                };

                lambdaVariant = this.createReferenceObject(_array_reference, range);
            }

            let value = _lambda.execute(lambdaVariant) as BaseValueObject;

            if (value.isArray()) {
                const valueRowCount = (value as ArrayValueObject).getRowCount();
                const valueColumnCount = (value as ArrayValueObject).getColumnCount();

                if (valueRowCount > 1 || valueColumnCount > 1) {
                    return ErrorValueObject.create(ErrorType.CALC);
                }

                value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            if (value.isNull()) {
                value = NumberValueObject.create(0);
            }

            result.push([value]);
        }

        if (rowCount === 1) {
            return result[0][0];
        }

        return ArrayValueObject.create({
            calculateValueList: result,
            rowCount,
            columnCount: 1,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }
}
