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
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

// Excel accepts probability totals within rounding at 15 significant digits.
const PROBABILITY_SUM_TOLERANCE = 5e-15 + Number.EPSILON / 2;

interface IProbabilityPairs {
    values: number[];
    weights: number[];
}

export class Prob extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    override needsReferenceObject = true;

    override calculate(xInput: FunctionVariantType, probInput: FunctionVariantType, lowerInput: FunctionVariantType, upperInput?: FunctionVariantType): BaseValueObject {
        const xRange = this._resolveInput(xInput);
        const probRange = this._resolveInput(probInput);
        const lowerLimit = this._resolveInput(lowerInput);
        const upperLimit = upperInput && this._resolveInput(upperInput, true);
        const _upperLimit = upperLimit == null || upperLimit.isNull() ? lowerLimit : upperLimit;

        const probabilities = this._getProbabilityPairs(xRange, probRange);
        if (!lowerLimit.isArray() && !_upperLimit.isArray()) {
            return this._handleSingleObject(probabilities, lowerLimit, _upperLimit);
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

            return this._handleSingleObject(probabilities, lowerLimitObject, upperLimitObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(
        probabilities: IProbabilityPairs | ErrorValueObject,
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

        if (probabilities instanceof ErrorValueObject) {
            return probabilities;
        }

        let sum = 0;
        const { values, weights } = probabilities;
        for (let index = 0; index < values.length; index++) {
            if (values[index] >= lowerLimitValue && values[index] <= upperLimitValue) {
                sum += weights[index];
            }
        }

        return NumberValueObject.create(sum);
    }

    private _resolveInput(input: FunctionVariantType, blankAsZero = false): BaseValueObject {
        if (!input.isReferenceObject()) {
            return input as BaseValueObject;
        }
        const values = (input as BaseReferenceObject).toArrayValueObject();
        if (values.getRowCount() !== 1 || values.getColumnCount() !== 1) {
            return values;
        }
        const cell = values.getFirstCell();
        return blankAsZero && cell.isNull() ? NumberValueObject.create(0) : cell;
    }

    private _getProbabilityPairs(xInput: BaseValueObject, probInput: BaseValueObject): IProbabilityPairs | ErrorValueObject {
        const x = xInput.isArray() ? (xInput as ArrayValueObject).getArrayValue() : [[xInput]];
        const probabilities = probInput.isArray() ? (probInput as ArrayValueObject).getArrayValue() : [[probInput]];
        const xWidth = x[0]?.length ?? 0;
        const probabilityWidth = probabilities[0]?.length ?? 0;
        for (const range of [x, probabilities]) {
            if (range.length === 1 && range[0].length === 1) {
                const cell = range[0][0];
                if (cell?.isError()) {
                    return cell as ErrorValueObject;
                }
                if (cell?.isNull()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }
            }
        }
        const count = x.length * xWidth;
        if (count !== probabilities.length * probabilityWidth) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        let total = 0;
        const values: number[] = [];
        const weights: number[] = [];
        for (let index = 0; index < count; index++) {
            const value = x[Math.floor(index / xWidth)][index % xWidth];
            const weight = probabilities[Math.floor(index / probabilityWidth)][index % probabilityWidth];
            if (value?.isError()) {
                return value as ErrorValueObject;
            }
            if (weight?.isError()) {
                return weight as ErrorValueObject;
            }
            if (!value?.isNumber() || !weight?.isNumber()) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
            const probability = Number(weight.getValue());
            total += probability;
            values.push(Number(value.getValue()));
            weights.push(probability);
        }
        return Math.abs(total - 1) > PROBABILITY_SUM_TOLERANCE ? ErrorValueObject.create(ErrorType.NUM) : { values, weights };
    }
}
