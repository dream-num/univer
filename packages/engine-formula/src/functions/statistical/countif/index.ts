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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../basics/error-type';
import { valueObjectCompare } from '../../../engine/utils/object-compare';
import { filterSameValueObjectResult } from '../../../engine/utils/value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Countif extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(range: BaseValueObject, criteria: BaseValueObject) {
        if (range.isError() || criteria.isError()) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        if (!range.isArray()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (criteria.isArray()) {
            return criteria.mapValue((criteriaItem) => this._handleSingleObject(range, criteriaItem));
        }

        return this._handleSingleObject(range, criteria);
    }

    private _handleSingleObject(range: BaseValueObject, criteria: BaseValueObject) {
        let resultArrayObject = valueObjectCompare(range, criteria);

        // If the condition is a numeric comparison, only numbers are counted, otherwise text is counted.
        resultArrayObject = filterSameValueObjectResult(resultArrayObject as ArrayValueObject, range as ArrayValueObject, criteria);

        const picked = (range as ArrayValueObject).pick(resultArrayObject as ArrayValueObject);
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
