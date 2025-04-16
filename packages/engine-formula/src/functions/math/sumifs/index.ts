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

import type { BaseValueObject, IArrayValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { calculateMaxDimensions, getBooleanResults, getErrorArray } from '../../../engine/utils/value-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Sumifs extends BaseFunction {
    override minParams = 3;

    override maxParams = 255;

    override calculate(sumRange: BaseValueObject, ...variants: BaseValueObject[]) {
        if (sumRange.isError()) {
            return sumRange;
        }

        if (!sumRange.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // Range and criteria must be paired
        if (variants.length < 2 || variants.length % 2 !== 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // Every range must be array
        if (variants.some((variant, i) => i % 2 === 0 && !variant.isArray())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const { maxRowLength, maxColumnLength } = calculateMaxDimensions(variants);

        const errorArray = getErrorArray(variants, sumRange, maxRowLength, maxColumnLength);

        if (errorArray) {
            return errorArray;
        }

        const booleanResults = getBooleanResults(variants, maxRowLength, maxColumnLength, true);

        return this._aggregateResults(sumRange, booleanResults);
    }

    private _aggregateResults(sumRange: BaseValueObject, booleanResults: BaseValueObject[][]): ArrayValueObject {
        const sumResults = booleanResults.map((row) => {
            return row.map((booleanResult) => {
                return (sumRange as ArrayValueObject).pick(booleanResult as ArrayValueObject).sum();
            });
        });

        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList: sumResults,
            rowCount: sumResults.length,
            columnCount: sumResults[0].length,
            unitId: this.unitId || '',
            sheetId: this.subUnitId || '',
            row: this.row,
            column: this.column,
        };

        return ArrayValueObject.create(arrayValueObjectData);
    }
}
