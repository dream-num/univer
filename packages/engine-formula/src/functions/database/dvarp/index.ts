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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { checkCriteria, checkDatabase, checkField, isCriteriaMatch } from '../../../basics/database';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Dvarp extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(database: BaseValueObject, field: BaseValueObject, criteria: BaseValueObject) {
        const { isError: databaseIsError, errorObject: databaseErrorObject, databaseValues } = checkDatabase(database);

        if (databaseIsError) {
            return databaseErrorObject as ErrorValueObject;
        }

        const { isError: fieldIsError, errorObject: filedErrorObject, fieldIndex } = checkField(field, databaseValues);

        if (fieldIsError) {
            return filedErrorObject as ErrorValueObject;
        }

        const { isError: criteriaIsError, errorObject: criteriaErrorObject, criteriaValues } = checkCriteria(criteria);

        if (criteriaIsError) {
            return criteriaErrorObject as ErrorValueObject;
        }

        const values = [];

        let sum = 0;
        let count = 0;

        for (let r = 1; r < databaseValues.length; r++) {
            const value = databaseValues[r][fieldIndex];

            if (typeof value !== 'number') {
                continue;
            }

            if (isCriteriaMatch(criteriaValues, databaseValues, r)) {
                values.push(value);
                sum += value;
                count++;
            }
        }

        if (count === 0) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        const mean = sum / count;

        let sumOfSquaresDifferences = 0;

        for (let i = 0; i < count; i++) {
            sumOfSquaresDifferences += (values[i] - mean) ** 2;
        }

        const result = sumOfSquaresDifferences / count;

        return NumberValueObject.create(result);
    }
}