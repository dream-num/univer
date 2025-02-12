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
import { createNewArray } from '../../../engine/utils/array-object';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { filterSameValueObjectResult } from '../../../engine/utils/value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Averageif extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(range: FunctionVariantType, criteria: FunctionVariantType, averageRange?: FunctionVariantType) {
        if (range.isError()) {
            return range;
        }

        if (criteria.isError()) {
            return criteria;
        }

        if (averageRange?.isError()) {
            return averageRange;
        }

        let _range = range;

        if (_range.isReferenceObject()) {
            _range = (_range as BaseReferenceObject).toArrayValueObject();
        }

        if (!_range.isArray()) {
            _range = createNewArray([[_range as BaseValueObject]], 1, 1);
        }

        let _criteria = criteria;

        if (_criteria.isReferenceObject()) {
            _criteria = (_criteria as BaseReferenceObject).toArrayValueObject();
        }

        if (averageRange && !averageRange?.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        _criteria = _criteria as BaseValueObject;

        if (_criteria.isArray()) {
            return (_criteria as ArrayValueObject).map((criteriaItem) => this._handleSingleObject(_range as BaseValueObject, criteriaItem, averageRange as BaseReferenceObject));
        }

        return this._handleSingleObject(_range as BaseValueObject, _criteria, averageRange as BaseReferenceObject);
    }

    private _handleSingleObject(range: BaseValueObject, criteria: BaseValueObject, averageRange?: BaseReferenceObject) {
        let resultArrayObject = valueObjectCompare(range, criteria);

        // When comparing non-numbers and numbers, it does not take the result
        resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, range as ArrayValueObject, criteria);

        // averageRange has the same dimensions as range
        let averageRangeArray = averageRange
            ? this._createRangeReferenceObject(averageRange, range)
            : (range as ArrayValueObject);

        if (!averageRangeArray) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (averageRangeArray.isError()) {
            return averageRangeArray as ErrorValueObject;
        }

        if (averageRangeArray.isReferenceObject()) {
            averageRangeArray = (averageRangeArray as BaseReferenceObject).toArrayValueObject();
        }

        averageRangeArray = averageRangeArray as ArrayValueObject;

        const picked = averageRangeArray.pick(resultArrayObject as ArrayValueObject);
        const sum = picked.sum();
        const count = picked.count();
        return sum.divided(count);
    }

    /**
     * Create reference object, starting from the first cell in the upper left corner, the height is rowCount and the width is columnCount
     * @param averageRange
     * @param rowCount
     * @param columnCount
     * @returns
     */
    private _createRangeReferenceObject(averageRange: BaseReferenceObject, range: BaseValueObject) {
        const averageRangeRow = averageRange.getRowCount();
        const averageRangeColumn = averageRange.getColumnCount();

        const rowCount = range.isArray() ? (range as ArrayValueObject).getRowCount() : 1;
        const columnCount = range.isArray() ? (range as ArrayValueObject).getColumnCount() : 1;

        if (averageRangeRow === rowCount && averageRangeColumn === columnCount) {
            return averageRange;
        }

        const { startRow, startColumn } = averageRange.getRangePosition();
        const rangeData = {
            startRow,
            startColumn,
            endRow: startRow + rowCount - 1,
            endColumn: startColumn + columnCount - 1,
        };

        return this.createReferenceObject(averageRange, rangeData);
    }
}
