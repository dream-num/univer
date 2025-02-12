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

import { ErrorType } from '../../../basics/error-type';
import { chisquareCDF, getTwoArrayNumberValues } from '../../../basics/statistical';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';

export class ChisqTest extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(actualRange: BaseValueObject, expectedRange: BaseValueObject): BaseValueObject {
        const actualRangeRowCount = actualRange.isArray() ? (actualRange as ArrayValueObject).getRowCount() : 1;
        const actualRangeColumnCount = actualRange.isArray() ? (actualRange as ArrayValueObject).getColumnCount() : 1;

        const expectedRangeRowCount = expectedRange.isArray() ? (expectedRange as ArrayValueObject).getRowCount() : 1;
        const expectedRangeColumnCount = expectedRange.isArray() ? (expectedRange as ArrayValueObject).getColumnCount() : 1;

        let _actualRange = actualRange;

        if (actualRange.isArray() && actualRangeRowCount === 1 && actualRangeColumnCount === 1) {
            _actualRange = (actualRange as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_actualRange.isError()) {
            return _actualRange;
        }

        let _expectedRange = expectedRange;

        if (expectedRange.isArray() && expectedRangeRowCount === 1 && expectedRangeColumnCount === 1) {
            _expectedRange = (expectedRange as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_expectedRange.isError()) {
            return _expectedRange;
        }

        if (actualRangeRowCount * actualRangeColumnCount === 1 || expectedRangeRowCount * expectedRangeColumnCount === 1) {
            if (_actualRange.isNull() || _expectedRange.isNull()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            return ErrorValueObject.create(ErrorType.NA);
        }

        if (actualRangeRowCount * actualRangeColumnCount !== expectedRangeRowCount * expectedRangeColumnCount) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const {
            isError,
            errorObject,
            array1Values,
            array2Values,
            noCalculate,
        } = getTwoArrayNumberValues(
            actualRange,
            expectedRange,
            actualRangeRowCount * actualRangeColumnCount,
            actualRangeColumnCount,
            expectedRangeColumnCount
        );

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        if (noCalculate) {
            return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        }

        return this._getResult(array1Values, array2Values, actualRangeRowCount, actualRangeColumnCount);
    }

    private _getResult(
        actualRangeValues: number[],
        expectedRangeValues: number[],
        actualRangeRowCount: number,
        actualRangeColumnCount: number
    ): BaseValueObject {
        let sumxmy2 = 0;

        for (let i = 0; i < actualRangeValues.length; i++) {
            if (expectedRangeValues[i] === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            sumxmy2 += (actualRangeValues[i] - expectedRangeValues[i]) ** 2 / expectedRangeValues[i];
        }

        let df = (actualRangeRowCount - 1) * (actualRangeColumnCount - 1);

        if (actualRangeRowCount === 1) {
            df = actualRangeColumnCount - 1;
        } else if (actualRangeColumnCount === 1) {
            df = actualRangeRowCount - 1;
        }

        const result = 1 - chisquareCDF(sumxmy2, df);

        return NumberValueObject.create(result);
    }
}
