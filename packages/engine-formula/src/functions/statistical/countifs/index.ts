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

import type { FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { getPairedRangeAndCriteriaResult, parsePairedRangeAndCriteria } from '../../../engine/utils/value-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Countifs extends BaseFunction {
    override minParams = 2;

    // TODO(formula-contract): Restrict the maximum to 254 so range/criteria pairs cannot be truncated at an odd count.
    override maxParams = 255;

    override needsReferenceObject = true;

    override calculate(...variants: FunctionVariantType[]): BaseValueObject {
        const {
            isError,
            errorObject,
            rangeIsDifferentSize,
            criteriaMaxRowLength,
            criteriaMaxColumnLength,
            variants: _variants,
        } = parsePairedRangeAndCriteria(this._legacyImplicitDerivedCriteria(variants));

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (rangeIsDifferentSize) {
            if (criteriaMaxRowLength === 1 && criteriaMaxColumnLength === 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return expandArrayValueObject(criteriaMaxRowLength, criteriaMaxColumnLength, ErrorValueObject.create(ErrorType.VALUE));
        }

        const results = getPairedRangeAndCriteriaResult(_variants, {
            formulaName: 'COUNTIFS',
            maxRowLength: criteriaMaxRowLength,
            maxColumnLength: criteriaMaxColumnLength,
            isNumberSensitive: true,
        });

        if (results.length === 1 && results[0].length === 1) {
            return results[0][0];
        }

        return ArrayValueObject.create({
            calculateValueList: results,
            rowCount: results.length,
            columnCount: results[0].length,
            unitId: this.unitId || '',
            sheetId: this.subUnitId || '',
            row: this.row,
            column: this.column,
        });
    }

    private _legacyImplicitDerivedCriteria(variants: FunctionVariantType[]): FunctionVariantType[] {
        return variants.map((variant, index) => {
            if (index % 2 === 0 || !variant.isArray()) {
                return variant;
            }

            const array = variant as ArrayValueObject;
            if (array.usesInvertedIndexCache()) {
                return variant;
            }

            const startRow = array.getCurrentRow();
            const startColumn = array.getCurrentColumn();
            if (startRow < 0 || startColumn < 0) {
                return variant;
            }

            const rowCount = array.getRowCount();
            const columnCount = array.getColumnCount();
            let rowIndex = -1;
            let columnIndex = -1;
            if (rowCount === 1) {
                rowIndex = 0;
                columnIndex = this.column - startColumn;
            } else if (columnCount === 1) {
                rowIndex = this.row - startRow;
                columnIndex = 0;
            } else {
                rowIndex = this.row - startRow;
                columnIndex = this.column - startColumn;
            }

            if (rowIndex < 0 || rowIndex >= rowCount || columnIndex < 0 || columnIndex >= columnCount) {
                return variant;
            }

            return array.get(rowIndex, columnIndex) as FunctionVariantType || variant;
        });
    }
}
