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
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Averageif extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(range: BaseValueObject, criteria: BaseValueObject, averageRange?: BaseValueObject) {
        if (range.isError() || criteria.isError() || averageRange?.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (!range.isArray() || (averageRange && !averageRange.isArray())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (criteria.isArray()) {
            return criteria.map((criteriaItem) => this._handleSingleObject(range, criteriaItem, averageRange));
        }

        return this._handleSingleObject(range, criteria, averageRange);
    }

    private _handleSingleObject(range: BaseValueObject, criteria: BaseValueObject, averageRange?: BaseValueObject) {
        const resultArrayObject = valueObjectCompare(range, criteria);

        // averageRange has the same dimensions as range
        const averageRangeArray = averageRange
            ? (averageRange as ArrayValueObject).slice(
                [0, (range as ArrayValueObject).getRowCount()],
                [0, (range as ArrayValueObject).getColumnCount()]
            )
            : (range as ArrayValueObject);

        if (!averageRangeArray) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const picked = averageRangeArray.pick(resultArrayObject as ArrayValueObject);
        const sum = picked.sum();
        const count = picked.count();
        return sum.divided(count);
    }
}
