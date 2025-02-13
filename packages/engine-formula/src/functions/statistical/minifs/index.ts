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

import { ErrorType } from '../../../basics/error-type';
import { calculateMaxDimensions, getBooleanResults, getErrorArray } from '../../../engine/utils/value-object';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject, IArrayValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Minifs extends BaseFunction {
    override minParams = 3;

    override maxParams = 255;

    override calculate(minRange: BaseValueObject, ...variants: BaseValueObject[]) {
        if (minRange.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (!minRange.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // Range and criteria must be paired
        if (variants.length % 2 !== 0) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        // Every range must be array
        if (variants.some((variant, i) => i % 2 === 0 && !variant.isArray())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const { maxRowLength, maxColumnLength } = calculateMaxDimensions(variants);

        const errorArray = getErrorArray(variants, minRange, maxRowLength, maxColumnLength);

        if (errorArray) {
            return errorArray;
        }

        const booleanResults = getBooleanResults(variants, maxRowLength, maxColumnLength, true);

        return this._aggregateResults(minRange, booleanResults);
    }

    private _aggregateResults(minRange: BaseValueObject, booleanResults: BaseValueObject[][]): ArrayValueObject {
        const maxResults = booleanResults.map((row) => {
            return row.map((booleanResult) => {
                const picked = (minRange as ArrayValueObject).pick(booleanResult as ArrayValueObject);
                if (picked.getColumnCount() === 0) {
                    return ArrayValueObject.create('0');
                }

                return picked.min();
            });
        });

        const arrayValueObjectData: IArrayValueObject = {
            calculateValueList: maxResults,
            rowCount: maxResults.length,
            columnCount: maxResults[0].length,
            unitId: this.unitId || '',
            sheetId: this.subUnitId || '',
            row: this.row,
            column: this.column,
        };

        return ArrayValueObject.create(arrayValueObjectData);
    }
}
