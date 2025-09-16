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
import { getBooleanResults, parsePairedRangeAndCriteria } from '../../../engine/utils/value-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Averageifs extends BaseFunction {
    override minParams = 3;

    override maxParams = 255;

    override needsReferenceObject = true;

    override calculate(averageRange: FunctionVariantType, ...variants: FunctionVariantType[]): BaseValueObject {
        const {
            isError,
            errorObject,
            rangeIsDifferentSize,
            criteriaMaxRowLength,
            criteriaMaxColumnLength,
            targetRange: _averageRange,
            variants: _variants,
        } = parsePairedRangeAndCriteria(variants, averageRange);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (rangeIsDifferentSize) {
            if (criteriaMaxRowLength === 1 && criteriaMaxColumnLength === 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return expandArrayValueObject(criteriaMaxRowLength, criteriaMaxColumnLength, ErrorValueObject.create(ErrorType.VALUE));
        }

        const booleanResults = getBooleanResults(_variants, criteriaMaxRowLength, criteriaMaxColumnLength, true);

        return this._aggregateResults(_averageRange as BaseValueObject, booleanResults);
    }

    private _aggregateResults(averageRange: BaseValueObject, booleanResults: BaseValueObject[][]): BaseValueObject {
        const results = booleanResults.map((row) => {
            return row.map((booleanResult) => {
                const picked = (averageRange as ArrayValueObject).pick(booleanResult as ArrayValueObject);
                const sum = picked.sum();
                const count = picked.count();
                return sum.divided(count);
            });
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
}
