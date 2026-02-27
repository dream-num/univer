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
        // 1. Early error from array1
        if (array1.isError()) {
            return array1;
        }

        const _array1 = this._initArray1(array1);

        // No variants: behave like SUM(array1)
        if (variants.length === 0) {
            return _array1.sum();
        }

        const rowCount = _array1.getRowCount();
        const columnCount = _array1.getColumnCount();

        // 2. Build base numeric array from array1
        const baseArrayOrError = this._getResultArrayByArray1(rowCount, columnCount, _array1);
        if (baseArrayOrError instanceof ErrorValueObject) {
            return baseArrayOrError;
        }
        const baseArray = baseArrayOrError as number[][];

        // 3. Validate variants (errors + dimension)
        const variantError = this._validateVariants(variants, rowCount, columnCount);

        if (variantError) {
            return variantError;
        }

        // 4. Core: sum-product over all cells
        return this._sumProduct(baseArray, variants, rowCount, columnCount);
    }

    /**
     * Validate all variants:
     * - propagate first error BaseValueObject
     * - ensure array dimensions are compatible with base (rowCount/columnCount)
     * Returns an ErrorValueObject / BaseValueObject on failure, or null when OK.
     */
    private _validateVariants(
        variants: BaseValueObject[],
        rowCount: number,
        columnCount: number
    ): BaseValueObject | ErrorValueObject | null {
        for (const v of variants) {
            if (v.isError()) {
                // Propagate the error object directly (same as original)
                return v;
            }

            if (v.isArray()) {
                const arr = v as ArrayValueObject;
                const variantRowCount = arr.getRowCount();
                const variantColumnCount = arr.getColumnCount();

                // Keep original rule:
                // only when BOTH row and column mismatch => #VALUE!
                if (variantRowCount !== rowCount && variantColumnCount !== columnCount) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }
            }
        }

        return null;
    }

    /**
     * Core SUMPRODUCT loop.
     * - baseArray already contains numeric values from array1
     * - variants may be scalar or array; non-number cells are treated as 0
     * - any error cell short-circuits with that error
     */
    private _sumProduct(
        baseArray: number[][],
        variants: BaseValueObject[],
        rowCount: number,
        columnCount: number
    ): BaseValueObject {
        let sum = 0;

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                let cellProduct = baseArray[r][c];

                for (let i = 0; i < variants.length; i++) {
                    const v = variants[i];

                    const variantValueObject = this._getVariantCell(v, r, c);
                    if (!variantValueObject) {
                        // Same as original: missing cell -> #VALUE!
                        // Cannot throw directly here; need to wrap it in ErrorValueObject for the caller.
                        // But to keep the signature simple, we let _getVariantCell return null,
                        // and convert it to ErrorValueObject here uniformly.
                        return ErrorValueObject.create(ErrorType.VALUE);
                    }

                    if (variantValueObject.isError()) {
                        // Bubble up error via exception; caller will catch and return
                        return variantValueObject as ErrorValueObject;
                    }

                    if (variantValueObject.isNumber()) {
                        cellProduct *= variantValueObject.getValue() as number;
                    } else {
                        // Non-numeric cell contributes 0 at this position
                        cellProduct = 0;
                    }
                }

                sum += cellProduct;
            }
        }

        return NumberValueObject.create(sum);
    }

    /**
     * Get the value object of a variant at (r, c).
     * - For scalar variants, returns the variant itself.
     * - For array variants, returns the cell at (r, c).
     *   If cell does not exist, returns null and let caller convert to #VALUE!.
     */
    private _getVariantCell(
        variant: BaseValueObject,
        row: number,
        col: number
    ): BaseValueObject | null {
        if (!variant.isArray()) {
            // Scalar case: single value for all cells
            return variant;
        }

        const arr = variant as ArrayValueObject;
        const cell = arr.get(row, col) as BaseValueObject | null | undefined;

        return cell ?? null;
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
