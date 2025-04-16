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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { matrixTranspose } from '../../../basics/math';
import { checkKnownsArrayDimensions, getKnownsArrayCoefficients, getKnownsArrayValues, getSerialNumbersByRowsColumns, getSlopeAndIntercept } from '../../../basics/statistical';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Trend extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override calculate(knownYs: BaseValueObject, knownXs?: BaseValueObject, newXs?: BaseValueObject, constb?: BaseValueObject): BaseValueObject {
        const { isError, errorObject } = checkKnownsArrayDimensions(knownYs, knownXs, newXs);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const knownYsValues = getKnownsArrayValues(knownYs);

        if (knownYsValues instanceof ErrorValueObject) {
            return knownYsValues;
        }

        const knownXsValues = this._getKnownXsValues(knownYsValues, knownXs);

        if (knownXsValues instanceof ErrorValueObject) {
            return knownXsValues;
        }

        const newXsValues = this._getNewXsValues(knownXsValues, newXs);

        if (newXsValues instanceof ErrorValueObject) {
            return newXsValues;
        }

        let _constb = constb ?? BooleanValueObject.create(true);

        if (_constb.isArray()) {
            _constb = (_constb as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_constb.isString()) {
            _constb = _constb.convertToNumberObjectValue();
        }

        if (_constb.isError()) {
            return _constb;
        }

        const constbValue = +_constb.getValue();

        return this._getResult(knownYsValues, knownXsValues, newXsValues, constbValue);
    }

    private _getResult(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constb: number): BaseValueObject {
        if ((knownYsValues.length === 1 && knownXsValues.length > 1) || (knownYsValues[0].length === 1 && knownXsValues[0].length > 1)) {
            if (knownYsValues.length === 1 && knownXsValues.length > 1) {
                const count = constb ? knownXsValues.length + 1 : knownXsValues.length;

                if (count > knownYsValues[0].length) {
                    return ErrorValueObject.create(ErrorType.NA);
                }
            }

            if (knownYsValues[0].length === 1 && knownXsValues[0].length > 1) {
                const count = constb ? knownXsValues[0].length + 1 : knownXsValues[0].length;

                if (count > knownYsValues.length) {
                    return ErrorValueObject.create(ErrorType.NA);
                }
            }

            return this._getResultByMultipleVariables(knownYsValues, knownXsValues, newXsValues, constb);
        }

        return this._getResultBySimpleVariables(knownYsValues, knownXsValues, newXsValues, constb);
    }

    private _getResultByMultipleVariables(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constb: number): BaseValueObject {
        const isOneRow = knownYsValues.length === 1 && knownYsValues[0].length > 1;

        const _coefficients = getKnownsArrayCoefficients(knownYsValues, knownXsValues, newXsValues, constb, false);

        if (_coefficients instanceof ErrorValueObject) {
            return _coefficients;
        }

        const { coefficients, newX } = _coefficients;

        const cl = coefficients[0].length;
        const b = coefficients[0][cl - 1];

        let result: number[][] = [];

        for (let i = 0; i < newX.length; i++) {
            result[i] = [];

            let value = b;

            for (let j = cl - 2; j >= 0; j--) {
                value += coefficients[0][cl - 2 - j] * newX[i][j];
            }

            result[i].push(value);
        }

        if (isOneRow) {
            result = matrixTranspose(result);
        }

        return ArrayValueObject.createByArray(result);
    }

    private _getResultBySimpleVariables(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constb: number): BaseValueObject {
        const knownYsValuesFlat = knownYsValues.flat();
        const knownXsValuesFlat = knownXsValues.flat();

        const { slope: m, intercept: b } = getSlopeAndIntercept(knownXsValuesFlat, knownYsValuesFlat, constb, false);

        if (Number.isNaN(m)) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const result = newXsValues.map((row) => {
            return row.map((value) => m * value + b);
        });

        return ArrayValueObject.createByArray(result);
    }

    private _getKnownXsValues(knownYsValues: number[][], knownXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!knownXs || knownXs.isNull()) {
            return getSerialNumbersByRowsColumns(knownYsValues.length, knownYsValues[0].length);
        }

        return getKnownsArrayValues(knownXs);
    }

    private _getNewXsValues(knownXsValues: number[][], newXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!newXs || newXs.isNull()) {
            return knownXsValues;
        }

        return getKnownsArrayValues(newXs);
    }
}
