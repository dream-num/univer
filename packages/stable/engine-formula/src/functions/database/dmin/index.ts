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

import type { BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { checkCriteria, checkDatabase, checkField, isCriteriaMatch } from '../../../basics/database';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Dmin extends BaseFunction {
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

        let result = Infinity;
        let count = 0;

        for (let r = 1; r < databaseValues.length; r++) {
            const value = databaseValues[r][fieldIndex];

            if (typeof value !== 'number') {
                continue;
            }

            if (isCriteriaMatch(criteriaValues, databaseValues, r)) {
                result = Math.min(result, value);
                count++;
            }
        }

        if (count === 0) {
            return NumberValueObject.create(0);
        }

        return NumberValueObject.create(result);
    }
}
