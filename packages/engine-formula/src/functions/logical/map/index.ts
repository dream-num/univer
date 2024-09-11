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

import type { Nullable } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { LambdaValueObjectObject } from '../../../engine/value-object/lambda-value-object';

export class Map extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        const _variants: BaseValueObject[] = [];
        let lambda: Nullable<LambdaValueObjectObject> = null;
        let maxRowLength = 0;
        let maxColumnLength = 0;

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            if (variant.isError()) {
                return variant;
            }

            if (i === variants.length - 1) {
                if (!(variant.isValueObject() && (variant as LambdaValueObjectObject).isLambda())) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                lambda = variant as LambdaValueObjectObject;
            } else {
                _variants.push(variant);

                maxRowLength = Math.max(maxRowLength, variant.isArray() ? (variant as ArrayValueObject).getRowCount() : 1);
                maxColumnLength = Math.max(maxColumnLength, variant.isArray() ? (variant as ArrayValueObject).getColumnCount() : 1);
            }
        }

        const resultArray = this._getResultArray(_variants, lambda as LambdaValueObjectObject, maxRowLength, maxColumnLength);

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return resultArray[0][0];
        }

        return ArrayValueObject.create({
            calculateValueList: resultArray,
            rowCount: maxRowLength,
            columnCount: maxColumnLength,
            unitId: this.unitId as string,
            sheetId: this.subUnitId as string,
            row: this.row,
            column: this.column,
        });
    }

    private _getResultArray(variants: BaseValueObject[], lambda: LambdaValueObjectObject, maxRowLength: number, maxColumnLength: number): BaseValueObject[][] {
        const resultArray: BaseValueObject[][] = [];

        for (let r = 0; r < maxRowLength; r++) {
            const row: BaseValueObject[] = [];

            for (let c = 0; c < maxColumnLength; c++) {
                const lambdaVariant = [];
                let isRowPushed = false;

                for (let i = 0; i < variants.length; i++) {
                    const variant = variants[i];

                    if (!variant.isArray()) {
                        if (r === 0 && c === 0) {
                            lambdaVariant.push(variant);
                            continue;
                        } else {
                            row.push(ErrorValueObject.create(ErrorType.NA));
                            isRowPushed = true;
                            break;
                        }
                    }

                    const valueObject = (variant as ArrayValueObject).get(r, c);

                    if (!valueObject) {
                        row.push(ErrorValueObject.create(ErrorType.NA));
                        isRowPushed = true;
                        break;
                    }

                    lambdaVariant.push(valueObject);
                }

                if (isRowPushed || lambdaVariant.length === 0) {
                    continue;
                }

                let value = (lambda as LambdaValueObjectObject).execute(...lambdaVariant) as BaseValueObject;

                if (value.isArray()) {
                    value = (value as ArrayValueObject).get(0, 0) as BaseValueObject;
                }

                if (value.isNull()) {
                    value = NumberValueObject.create(0);
                }

                row.push(value);
            }

            resultArray.push(row);
        }

        return resultArray;
    }
}
