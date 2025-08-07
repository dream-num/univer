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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Sumproduct extends BaseFunction {
    override minParams = 1;

    override maxParams = 255;

    override calculate(array1: BaseValueObject, ...variants: BaseValueObject[]) {
        if (array1.isError()) {
            return array1;
        }

        const _array1 = this._initArray1(array1);

        if (variants.length > 0) {
            const rowCount = _array1.getRowCount();
            const columnCount = _array1.getColumnCount();

            let resultArray = this._getResultArrayByArray1(rowCount, columnCount, _array1);

            if (resultArray instanceof ErrorValueObject) {
                return resultArray;
            }
            resultArray = resultArray as number[][];

            for (let i = 0; i < variants.length; i++) {
                if (variants[i].isError()) {
                    return variants[i];
                }

                let variantRowCount = 1;
                let variantColumnCount = 1;

                if (variants[i].isArray()) {
                    variantRowCount = (variants[i] as ArrayValueObject).getRowCount();
                    variantColumnCount = (variants[i] as ArrayValueObject).getColumnCount();
                }

                if (variantRowCount !== rowCount || variantColumnCount !== columnCount) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                for (let r = 0; r < rowCount; r++) {
                    const row: number[] = [];

                    for (let c = 0; c < columnCount; c++) {
                        let variantValueObject = variants[i] as BaseValueObject;

                        if (variants[i].isArray()) {
                            variantValueObject = (variants[i] as ArrayValueObject).get(r, c) as BaseValueObject;
                        }

                        if (variantValueObject.isError()) {
                            return variantValueObject;
                        }

                        // Only number values are considered for the sumproduct calculation
                        if (variantValueObject.isNumber()) {
                            row.push((variantValueObject.getValue() as number) * resultArray[r][c]);
                        } else {
                            row.push(0);
                        }
                    }

                    resultArray[r] = row;
                }
            }

            const result = resultArray.reduce((acc, cur) => acc.concat(cur)).reduce((acc, cur) => acc + cur, 0);

            return NumberValueObject.create(result);
        } else {
            return _array1.sum();
        }
    }

    private _initArray1(array1: BaseValueObject): ArrayValueObject {
        let _array1 = array1;

        if (!_array1.isArray()) {
            _array1 = ArrayValueObject.create({
                calculateValueList: [[_array1]],
                rowCount: 1,
                columnCount: 1,
                unitId: '',
                sheetId: '',
                row: 0,
                column: 0,
            });
        }

        return _array1 as ArrayValueObject;
    }

    private _getResultArrayByArray1(rowCount: number, columnCount: number, array1: ArrayValueObject) {
        const resultArray: number[][] = [];

        for (let r = 0; r < rowCount; r++) {
            const row: number[] = [];

            for (let c = 0; c < columnCount; c++) {
                const array1ValueObject = array1.get(r, c) as BaseValueObject;

                if (array1ValueObject.isError()) {
                    return array1ValueObject;
                }

                // Only number values are considered for the sumproduct calculation
                if (array1ValueObject.isNumber()) {
                    row.push(array1ValueObject.getValue() as number);
                } else {
                    row.push(0);
                }
            }

            resultArray.push(row);
        }

        return resultArray;
    }
}
