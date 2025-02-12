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

export class Map extends BaseFunction {
    override minParams = 2;

    override maxParams = 255;

    override needsReferenceObject = true;

    override calculate(...variants: FunctionVariantType[]): BaseValueObject {
        const _variants: FunctionVariantType[] = [];
        let lambda: Nullable<LambdaValueObjectObject> = null;
        let maxRowLength = 0;
        let maxColumnLength = 0;

        for (let i = 0; i < variants.length; i++) {
            const variant = variants[i];

            let _variant = variant;

            if (_variant.isReferenceObject()) {
                _variant = (variant as BaseReferenceObject).toArrayValueObject();
            }

            if (_variant.isError()) {
                return _variant as ErrorValueObject;
            }

            if (i === variants.length - 1) {
                if (!(variant.isValueObject() && (variant as LambdaValueObjectObject).isLambda())) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                lambda = variant as LambdaValueObjectObject;
            } else {
                _variants.push(variant);

                maxRowLength = Math.max(maxRowLength, _variant.isArray() ? (_variant as ArrayValueObject).getRowCount() : 1);
                maxColumnLength = Math.max(maxColumnLength, _variant.isArray() ? (_variant as ArrayValueObject).getColumnCount() : 1);
            }
        }

        const resultArray = this._getResultArray(_variants, lambda as LambdaValueObjectObject, maxRowLength, maxColumnLength);

        if (resultArray instanceof ErrorValueObject) {
            return resultArray;
        }

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

    // eslint-disable-next-line
    private _getResultArray(variants: FunctionVariantType[], lambda: LambdaValueObjectObject, maxRowLength: number, maxColumnLength: number): BaseValueObject[][] | ErrorValueObject {
        const resultArray: BaseValueObject[][] = [];

        for (let r = 0; r < maxRowLength; r++) {
            const row: BaseValueObject[] = [];

            for (let c = 0; c < maxColumnLength; c++) {
                const lambdaVariant: FunctionVariantType[] = [];
                let isRowPushed = false;

                for (let i = 0; i < variants.length; i++) {
                    let variant = variants[i];
                    let _variant_reference: Nullable<BaseReferenceObject> = null;

                    if (variant.isReferenceObject()) {
                        _variant_reference = variant as BaseReferenceObject;
                        variant = (variant as BaseReferenceObject).toArrayValueObject();
                    }

                    if (!variant.isArray()) {
                        if (r === 0 && c === 0) {
                            lambdaVariant.push(_variant_reference || variant);
                            continue;
                        } else {
                            row.push(ErrorValueObject.create(ErrorType.NA));
                            isRowPushed = true;
                            break;
                        }
                    }

                    let valueObject: Nullable<FunctionVariantType> = (variant as ArrayValueObject).get(r, c);

                    if (!valueObject) {
                        row.push(ErrorValueObject.create(ErrorType.NA));
                        isRowPushed = true;
                        break;
                    }

                    if (_variant_reference) {
                        const { startRow, startColumn } = _variant_reference.getRangePosition();
                        const range: IRange = {
                            startRow: startRow + r,
                            startColumn: startColumn + c,
                            endRow: startRow + r,
                            endColumn: startColumn + c,
                        };

                        valueObject = this.createReferenceObject(_variant_reference, range);
                    }

                    lambdaVariant.push(valueObject);
                }

                if (isRowPushed || lambdaVariant.length === 0) {
                    continue;
                }

                let value = (lambda as LambdaValueObjectObject).execute(...lambdaVariant) as BaseValueObject;

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

                row.push(value);
            }

            resultArray.push(row);
        }

        return resultArray;
    }
}
