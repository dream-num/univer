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
import { ErrorType } from '../../../basics/error-type';
import { calculateMmult, inverseMatrixByUSV, matrixTranspose } from '../../../basics/math';
import { checkKnownsArrayDimensions, getKnownsArrayValues, getSerialNumbersByRowsColumns, getSlopeAndIntercept } from '../../../basics/statistical';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Growth extends BaseFunction {
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

    private _getResult(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constbValue: number): BaseValueObject {
        if ((knownYsValues.length === 1 && knownXsValues.length > 1) || (knownYsValues[0].length === 1 && knownXsValues[0].length > 1)) {
            return this._getResultByMultipleVariables(knownYsValues, knownXsValues, newXsValues, constbValue);
        }

        return this._getResultBySimpleVariables(knownYsValues, knownXsValues, newXsValues, constbValue);
    }

    private _getResultByMultipleVariables(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constbValue: number): BaseValueObject {
        const isOneRow = knownYsValues.length === 1 && knownYsValues[0].length > 1;

        let logYs: number[][] = [];
        let X: number[][] = [];

        if (isOneRow) {
            logYs = matrixTranspose(knownYsValues).map((row) => row.map((value) => Math.log(value)));
            X = constbValue ? matrixTranspose(knownXsValues).map((row) => [...row, 1]) : matrixTranspose(knownXsValues);
        } else {
            logYs = knownYsValues.map((row) => row.map((value) => Math.log(value)));
            X = constbValue ? knownXsValues.map((row) => [...row, 1]) : knownXsValues;
        }

        const XT = matrixTranspose(X);
        const XTX = calculateMmult(XT, X);
        const XTY = calculateMmult(XT, logYs);
        const XTXInv = inverseMatrixByUSV(XTX);

        if (!XTXInv) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        const coefficients = calculateMmult(XTXInv, XTY).map((row) => row[0]);

        let result: number[][] = [];

        if (isOneRow) {
            result = matrixTranspose(newXsValues).map((row) => {
                const newX = constbValue ? [...row, 1] : row;
                const logY = newX.reduce((acc, value, index) => acc + value * coefficients[index], 0);
                return [Math.exp(logY)];
            });
            result = matrixTranspose(result);
        } else {
            result = newXsValues.map((row) => {
                const newX = constbValue ? [...row, 1] : row;
                const logY = newX.reduce((acc, value, index) => acc + value * coefficients[index], 0);
                return [Math.exp(logY)];
            });
        }

        return ArrayValueObject.createByArray(result);
    }

    private _getResultBySimpleVariables(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constbValue: number): BaseValueObject {
        const knownYsValuesFlat = knownYsValues.flat();
        const knownXsValuesFlat = knownXsValues.flat();
        const logYs = knownYsValuesFlat.map((value) => Math.log(value));

        const { slope, intercept } = getSlopeAndIntercept(knownXsValuesFlat, logYs, constbValue, true);

        const result = newXsValues.map((row) => {
            return row.map((value) => intercept * (slope ** value));
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
