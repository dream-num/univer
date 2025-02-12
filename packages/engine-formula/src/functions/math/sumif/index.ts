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
import { ErrorType } from '../../../basics/error-type';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { filterSameValueObjectResult } from '../../../engine/utils/value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Sumif extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(range: FunctionVariantType, criteria: FunctionVariantType, sumRange?: FunctionVariantType): BaseValueObject {
        let _criteria = criteria;

        if (criteria.isReferenceObject()) {
            _criteria = (criteria as BaseReferenceObject).toArrayValueObject();
        }

        if (_criteria.isArray()) {
            const resultArray = (_criteria as ArrayValueObject).mapValue((criteriaObject) => this._handleSingleObject(range, criteriaObject, sumRange));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(range, _criteria as BaseValueObject, sumRange);
    }

    private _handleSingleObject(range: FunctionVariantType, criteria: BaseValueObject, sumRange?: FunctionVariantType): BaseValueObject {
        if (range.isError()) {
            return range as ErrorValueObject;
        }

        if (criteria.isError()) {
            return criteria;
        }

        if (sumRange?.isError()) {
            return sumRange as ErrorValueObject;
        }

        if (!range.isReferenceObject() || (sumRange && !sumRange.isReferenceObject())) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const _range = (range as BaseReferenceObject).toArrayValueObject();

        let resultArrayObject = valueObjectCompare(_range, criteria);

        // When comparing non-numbers and numbers, it does not take the result
        resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, _range, criteria);

        const rangeRowCount = _range.getRowCount();
        const rangeColumnCount = _range.getColumnCount();

        let _sumRange = _range;

        if (sumRange) {
            _sumRange = (sumRange as BaseReferenceObject).toArrayValueObject();

            const sumRangeRowCount = _sumRange.getRowCount();
            const sumRangeColumnCount = _sumRange.getColumnCount();

            // sumRange has different dimensions than range, then adjust sumRange dimensions to match range dimensions
            // TODO: @DR-Univer The current situation is that the cell value in the extended range changes,
            // but it is not within the formula parameter range, so it will not trigger the formula to recalculate.
            if (rangeRowCount !== sumRangeRowCount || rangeColumnCount !== sumRangeColumnCount) {
                const rangeData = (sumRange as BaseReferenceObject).getRangeData();
                rangeData.endRow = rangeData.startRow + rangeRowCount - 1;
                rangeData.endColumn = rangeData.startColumn + rangeColumnCount - 1;

                (sumRange as BaseReferenceObject).setRangeData(rangeData);

                _sumRange = (sumRange as BaseReferenceObject).toArrayValueObject();
            }
        }

        return _sumRange.pick(resultArrayObject as ArrayValueObject).sum();
    }
}
