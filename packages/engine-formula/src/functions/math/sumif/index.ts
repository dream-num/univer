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

import { ErrorType } from '../../../basics/error-type';
import { findCompareToken, valueObjectCompare } from '../../../engine/utils/object-compare';
import { filterSameValueObjectResult } from '../../../engine/utils/value-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Sumif extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(range: BaseValueObject, criteria: BaseValueObject, sumRange?: BaseValueObject) {
        if (range.isError()) {
            return range;
        }

        if (criteria.isError()) {
            return criteria;
        }

        if (sumRange?.isError()) {
            return sumRange;
        }

        if (!range.isArray() || (sumRange && !sumRange.isArray())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (criteria.isArray()) {
            return criteria.map((criteriaItem) => this._handleSingleObject(range, criteriaItem, sumRange));
        }

        return this._handleSingleObject(range, criteria, sumRange);
    }

    private _handleSingleObject(range: BaseValueObject, criteria: BaseValueObject, sumRange?: BaseValueObject) {
        let resultArrayObject = valueObjectCompare(range, criteria);

        const [, criteriaStringObject] = findCompareToken(`${criteria.getValue()}`);
        // When comparing non-numbers and numbers, it does not take the result
        resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, range as ArrayValueObject, criteriaStringObject);

        // sumRange has the same dimensions as range
        const sumRangeArray = sumRange
            ? (sumRange as ArrayValueObject).slice(
                [0, (range as ArrayValueObject).getRowCount()],
                [0, (range as ArrayValueObject).getColumnCount()]
            )
            : (range as ArrayValueObject);

        if (!sumRangeArray) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        return sumRangeArray.pick(resultArrayObject as ArrayValueObject).sum();
    }
}
