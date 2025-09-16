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
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Countif extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override needsReferenceObject = true;

    override calculate(range: FunctionVariantType, criteria: FunctionVariantType): BaseValueObject {
        if (!range.isReferenceObject()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let _criteria = criteria;

        if (criteria.isReferenceObject()) {
            _criteria = (criteria as BaseReferenceObject).toArrayValueObject();
        }

        if (_criteria.isArray()) {
            const resultArray = (_criteria as ArrayValueObject).mapValue((criteriaObject) => this._handleSingleObject(range, criteriaObject));

            if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
                return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
            }

            return resultArray;
        }

        return this._handleSingleObject(range, _criteria as BaseValueObject);
    }

    private _handleSingleObject(range: FunctionVariantType, criteria: BaseValueObject): BaseValueObject {
        const _range = (range as BaseReferenceObject).toArrayValueObject();

        let resultArrayObject = valueObjectCompare(_range, criteria);

        // If the condition is a numeric comparison, only numbers are counted, otherwise text is counted.
        resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, _range, criteria);

        const picked = (_range as ArrayValueObject).pick(resultArrayObject as ArrayValueObject);
        return this._countA(picked);
    }

    private _countA(array: ArrayValueObject) {
        let accumulatorAll: BaseValueObject = NumberValueObject.create(0);
        array.iterator((valueObject) => {
            if (valueObject == null) {
                return true; // continue
            }

            accumulatorAll = accumulatorAll.plusBy(1);
        });

        return accumulatorAll;
    }
}
