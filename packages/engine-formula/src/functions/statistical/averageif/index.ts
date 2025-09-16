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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { filterSameValueObjectResult } from '../../../engine/utils/value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Averageif extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(range: FunctionVariantType, criteria: FunctionVariantType, averageRange?: FunctionVariantType): BaseValueObject {
        if (!range.isReferenceObject() || (averageRange && !averageRange.isReferenceObject())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _criteria = criteria;

        if (criteria.isReferenceObject()) {
            _criteria = (criteria as BaseReferenceObject).toArrayValueObject();
        }

        if (_criteria.isArray()) {
            const resultArray = (_criteria as ArrayValueObject).mapValue((criteriaObject) => this._handleSingleObject(range, criteriaObject, averageRange));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(range, _criteria as BaseValueObject, averageRange);
    }

    private _handleSingleObject(range: FunctionVariantType, criteria: BaseValueObject, averageRange?: FunctionVariantType): BaseValueObject {
        const _range = (range as BaseReferenceObject).toArrayValueObject();

        let resultArrayObject = valueObjectCompare(_range, criteria);

        // When comparing non-numbers and numbers, it does not take the result
        resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, _range, criteria);

        const rangeRowCount = _range.getRowCount();
        const rangeColumnCount = _range.getColumnCount();

        let _averageRange = _range;

        if (averageRange) {
            _averageRange = (averageRange as BaseReferenceObject).toArrayValueObject();

            const averageRangeRowCount = _averageRange.getRowCount();
            const averageRangeColumnCount = _averageRange.getColumnCount();

            // averageRange has different dimensions than range, then adjust averageRange dimensions to match range dimensions
            // TODO: @DR-Univer The current situation is that the cell value in the extended range changes,
            // but it is not within the formula parameter range, so it will not trigger the formula to recalculate.
            if (rangeRowCount !== averageRangeRowCount || rangeColumnCount !== averageRangeColumnCount) {
                const rangeData = (averageRange as BaseReferenceObject).getRangeData();
                rangeData.endRow = rangeData.startRow + rangeRowCount - 1;
                rangeData.endColumn = rangeData.startColumn + rangeColumnCount - 1;

                (averageRange as BaseReferenceObject).setRangeData(rangeData);

                _averageRange = (averageRange as BaseReferenceObject).toArrayValueObject();
            }
        }

        const picked = _averageRange.pick(resultArrayObject as ArrayValueObject);
        const sum = picked.sum();
        const count = picked.count();
        return sum.divided(count);
    }
}
