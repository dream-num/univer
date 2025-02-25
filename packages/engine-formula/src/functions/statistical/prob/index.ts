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
import { getTwoArrayNumberValues } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Prob extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    override calculate(xRange: BaseValueObject, probRange: BaseValueObject, lowerLimit: BaseValueObject, upperLimit?: BaseValueObject): BaseValueObject {
        const { isError, errorObject, xRangeValues, probRangeValues } = this._handleXRangeAndProbRange(xRange, probRange);

        let _upperLimit = upperLimit ?? lowerLimit;

        if (upperLimit?.isNull()) {
            _upperLimit = lowerLimit;
        }

        const maxRowLength = Math.max(
            lowerLimit.isArray() ? (lowerLimit as ArrayValueObject).getRowCount() : 1,
            _upperLimit.isArray() ? (_upperLimit as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            lowerLimit.isArray() ? (lowerLimit as ArrayValueObject).getColumnCount() : 1,
            _upperLimit.isArray() ? (_upperLimit as ArrayValueObject).getColumnCount() : 1
        );

        const lowerLimitArray = expandArrayValueObject(maxRowLength, maxColumnLength, lowerLimit, ErrorValueObject.create(ErrorType.NA));
        const upperLimitArray = expandArrayValueObject(maxRowLength, maxColumnLength, _upperLimit, ErrorValueObject.create(ErrorType.NA));

        const resultArray = lowerLimitArray.mapValue((lowerLimitObject, rowIndex, columnIndex) => {
            const upperLimitObject = upperLimitArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (xRange.isError()) {
                return xRange;
            }

            if (probRange.isError()) {
                return probRange;
            }

            if (lowerLimitObject.isError()) {
                return lowerLimitObject;
            }

            if (upperLimitObject.isError()) {
                return upperLimitObject;
            }

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            return this._handleSignleObject(xRangeValues as number[], probRangeValues as number[], lowerLimitObject, upperLimitObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        xRangeValues: number[],
        probRangeValues: number[],
        lowerLimit: BaseValueObject,
        upperLimit: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(lowerLimit, upperLimit);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [lowerLimitObject, upperLimitObject] = variants as BaseValueObject[];

        const lowerLimitValue = +lowerLimitObject.getValue();
        const upperLimitValue = +upperLimitObject.getValue();

        if (probRangeValues.reduce((acc, val) => acc + val, 0) !== 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let sum = 0;

        for (let i = 0; i < xRangeValues.length; i++) {
            if (xRangeValues[i] >= lowerLimitValue && xRangeValues[i] <= upperLimitValue) {
                sum += probRangeValues[i];
            }
        }

        return NumberValueObject.create(sum);
    }

    // eslint-disable-next-line
    private _handleXRangeAndProbRange(xRange: BaseValueObject, probRange: BaseValueObject) {
        const xRangeRowCount = xRange.isArray() ? (xRange as ArrayValueObject).getRowCount() : 1;
        const xRangeColumnCount = xRange.isArray() ? (xRange as ArrayValueObject).getColumnCount() : 1;

        const probRangeRowCount = probRange.isArray() ? (probRange as ArrayValueObject).getRowCount() : 1;
        const probRangeColumnCount = probRange.isArray() ? (probRange as ArrayValueObject).getColumnCount() : 1;

        let _xRange = xRange;

        if (xRange.isArray() && xRangeRowCount === 1 && xRangeColumnCount === 1) {
            _xRange = (xRange as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_xRange.isError()) {
            return {
                isError: true,
                errorObject: _xRange as ErrorValueObject,
                xRangeValues: [],
                probRangeValues: [],
            };
        }

        let _probRange = probRange;

        if (probRange.isArray() && probRangeRowCount === 1 && probRangeColumnCount === 1) {
            _probRange = (probRange as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_probRange.isError()) {
            return {
                isError: true,
                errorObject: _probRange as ErrorValueObject,
                xRangeValues: [],
                probRangeValues: [],
            };
        }

        if (xRangeRowCount * xRangeColumnCount === 1 || probRangeRowCount * probRangeColumnCount === 1) {
            if (_xRange.isNull() || _probRange.isNull()) {
                return {
                    isError: true,
                    errorObject: ErrorValueObject.create(ErrorType.VALUE),
                    xRangeValues: [],
                    probRangeValues: [],
                };
            }
        }

        if (xRangeRowCount * xRangeColumnCount !== probRangeRowCount * probRangeColumnCount) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.NA),
                xRangeValues: [],
                probRangeValues: [],
            };
        }

        const {
            isError,
            errorObject,
            array1Values: xRangeValues,
            array2Values: probRangeValues,
            noCalculate,
        } = getTwoArrayNumberValues(
            xRange,
            probRange,
            xRangeRowCount * xRangeColumnCount,
            xRangeColumnCount,
            probRangeColumnCount
        );

        if (isError) {
            return {
                isError: true,
                errorObject,
                xRangeValues: [],
                probRangeValues: [],
            };
        }

        if (noCalculate) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.DIV_BY_ZERO),
                xRangeValues: [],
                probRangeValues: [],
            };
        }

        return {
            isError: false,
            errorObject: null,
            xRangeValues,
            probRangeValues,
        };
    }
}
