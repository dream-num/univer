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
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BaseFunction } from '../../base-function';

export class Ifs extends BaseFunction {
    override minParams = 2;

    override calculate(...params: BaseValueObject[]) {
        if (params.length % 2 !== 0) {
            return new ErrorValueObject(ErrorType.NA);
        }

        for (let i = 0; i < params.length; i += 2) {
            const condition = params[i];
            const result = params[i + 1];

            if (condition.isError()) {
                return condition;
            }

            if (result.isError()) {
                return result;
            }

            // get single value object for condition
            const singleCondition = this._getSingleValueObject(condition);
            const singleResult = this._getSingleValueObject(result);

            // Check if condition or result is an array (range), which should return a VALUE error
            if (singleCondition.isArray() || singleResult.isArray()) {
                return new ErrorValueObject(ErrorType.VALUE);
            }

            if (singleCondition.getValue()) {
                return singleResult;
            }
        }

        return new ErrorValueObject(ErrorType.NA);
    }

    private _getSingleValueObject(valueObject: BaseValueObject) {
        if (valueObject.isArray() && (valueObject as ArrayValueObject).getRowCount() === 1 && (valueObject as ArrayValueObject).getColumnCount() === 1) {
            return (valueObject as ArrayValueObject).getFirstCell();
        }
        return valueObject;
    }
}
