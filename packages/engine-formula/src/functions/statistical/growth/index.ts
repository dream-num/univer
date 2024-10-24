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
import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { calculateMmult, inverseMatrixByUSV, matrixTranspose } from '../../../basics/math';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Growth extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override calculate(knownYs: BaseValueObject, knownXs?: BaseValueObject, newXs?: BaseValueObject, constb?: BaseValueObject): BaseValueObject {
        const knownYsRowCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getRowCount() : 1;
        const knownYsColumnCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getColumnCount() : 1;
        const knownYsValues = this._getValues(knownYs, knownYsRowCount, knownYsColumnCount);

        if (knownYsValues instanceof ErrorValueObject) {
            return knownYsValues;
        }

        const knownXsValues = this._getKnownXsValues(knownYsRowCount, knownYsColumnCount, knownXs);

        if (knownXsValues instanceof ErrorValueObject) {
            return knownXsValues;
        }

        const newXsValues = this._getNewXsValues(knownXsValues, knownYsRowCount, knownYsColumnCount, newXs);

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
        const newXsRowCount = newXsValues.length;
        const newXsColumnCount = newXsValues[0].length;

        const knownYsValuesFlat = knownYsValues.flat();
        const knownXsValuesFlat = knownXsValues.flat();
        const newXsValuesFlat = newXsValues.flat();
        const logYs = knownYsValuesFlat.map((value) => Math.log(value));

        let slope, intercept;

        if (constbValue) {
            ({ slope, intercept } = this._getSlopeAndInterceptOfConstbIsTrue(knownXsValuesFlat, logYs));
        } else {
            ({ slope, intercept } = this._getSlopeAndInterceptOfConstbIsFalse(knownXsValuesFlat, logYs));
        }

        if (Number.isNaN(slope) && !constbValue) {
            slope = 0;
        }

        const result: number[][] = [];

        for (let r = 0; r < newXsRowCount; r++) {
            const row: number[] = [];

            for (let c = 0; c < newXsColumnCount; c++) {
                const value = intercept * (slope ** newXsValuesFlat[r * newXsColumnCount + c]);
                row.push(value);
            }

            result.push(row);
        }

        return ArrayValueObject.createByArray(result);
    }

    private _getSlopeAndInterceptOfConstbIsTrue(knownXsValuesFlat: number[], logYs: number[]) {
        const n = logYs.length;

        let sumX = 0;
        let sumY = 0;
        let sumX2 = 0;
        let sumXY = 0;

        for (let i = 0; i < n; i++) {
            sumX += knownXsValuesFlat[i];
            sumY += logYs[i];
            sumX2 += knownXsValuesFlat[i] * knownXsValuesFlat[i];
            sumXY += knownXsValuesFlat[i] * logYs[i];
        }

        const temp = n * sumXY - sumX * sumY;
        const slope = temp / (n * sumX2 - sumX * sumX);
        const intercept = 1 / n * sumY - slope * (1 / n) * sumX;

        return {
            slope: Math.exp(slope),
            intercept: Math.exp(intercept),
        };
    }

    private _getSlopeAndInterceptOfConstbIsFalse(knownXsValuesFlat: number[], logYs: number[]) {
        const matrixX = [[...knownXsValuesFlat]];
        const matrixY = [...logYs];

        let rowCount = matrixX.length;
        let columnCount = matrixX[0].length;
        let minCount = Math.min(rowCount, columnCount);
        const newMatrix = new Array(minCount).fill(0);

        for (let i = 0; i < minCount; i++) {
            const matrixXRow = matrixX[i];

            let sumSquare = 0;

            for (let j = 0; j < columnCount; j++) {
                sumSquare += matrixXRow[j] ** 2;
            }

            const value = matrixXRow[i] < 0 ? Math.sqrt(sumSquare) : -Math.sqrt(sumSquare);

            newMatrix[i] = value;

            if (value !== 0) {
                matrixXRow[i] -= value;

                for (let j = i + 1; j < rowCount; j++) {
                    let sum = 0;

                    for (let k = i; k < columnCount; k++) {
                        sum -= matrixX[j][k] * matrixXRow[k];
                    }

                    sum /= (value * matrixXRow[i]);

                    for (let k = i; k < columnCount; k++) {
                        matrixX[j][k] -= sum * matrixXRow[k];
                    }
                }
            }
        }

        rowCount = matrixX.length;
        columnCount = matrixX[0].length;
        minCount = Math.min(rowCount, columnCount);
        const result = new Array(rowCount).fill(0);

        for (let i = 0; i < minCount; i++) {
            const matrixXRow = matrixX[i];

            let sum = 0;

            for (let j = 0; j < columnCount; j++) {
                sum += matrixY[j] * matrixXRow[j];
            }

            sum /= (newMatrix[i] * matrixXRow[i]);

            for (let j = 0; j < columnCount; j++) {
                matrixY[j] += sum * matrixXRow[j];
            }
        }

        for (let i = newMatrix.length - 1; i >= 0; i--) {
            matrixY[i] /= newMatrix[i];

            const temp = matrixY[i];
            const matrixXRow = matrixX[i];

            result[i] = temp;

            for (let j = 0; j < i; j++) {
                matrixY[j] -= temp * matrixXRow[j];
            }
        }

        return {
            slope: Math.exp(result[0]),
            intercept: Math.exp(0),
        };
    }

    private _getKnownXsValues(knownYsRowCount: number, knownYsColumnCount: number, knownXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!knownXs || knownXs.isNull()) {
            return this._getNumberValuesByRowsColumns(knownYsRowCount, knownYsColumnCount);
        }

        if (knownXs.isError()) {
            return knownXs as ErrorValueObject;
        }

        const knownXsRowCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getRowCount() : 1;
        const knownXsColumnCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getColumnCount() : 1;

        if (
            (knownYsRowCount === 1 && knownXsColumnCount !== knownYsColumnCount) ||
            (knownYsColumnCount === 1 && knownXsRowCount !== knownYsRowCount) ||
            (knownYsRowCount !== 1 && knownYsColumnCount !== 1 && (knownXsRowCount !== knownYsRowCount || knownXsColumnCount !== knownYsColumnCount))
        ) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        return this._getValues(knownXs, knownXsRowCount, knownXsColumnCount);
    }

    private _getNewXsValues(knownXsValues: number[][], knownYsRowCount: number, knownYsColumnCount: number, newXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!newXs || newXs.isNull()) {
            return knownXsValues;
        }

        if (newXs.isError()) {
            return newXs as ErrorValueObject;
        }

        const newXsRowCount = newXs.isArray() ? (newXs as ArrayValueObject).getRowCount() : 1;
        const newXsColumnCount = newXs.isArray() ? (newXs as ArrayValueObject).getColumnCount() : 1;

        if (
            (knownYsRowCount === 1 && knownXsValues.length > 1 && newXsRowCount !== knownXsValues.length) ||
            (knownYsColumnCount === 1 && knownXsValues[0].length > 1 && newXsColumnCount !== knownXsValues[0].length)
        ) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        return this._getValues(newXs, newXsRowCount, newXsColumnCount);
    }

    private _getValues(variant: BaseValueObject, rowCount: number, columnCount: number): number[][] | ErrorValueObject {
        const values: number[][] = [];

        for (let r = 0; r < rowCount; r++) {
            values[r] = [];

            for (let c = 0; c < columnCount; c++) {
                const valueObject = variant.isArray() ? (variant as ArrayValueObject).get(r, c) as BaseValueObject : variant;

                if (valueObject.isError()) {
                    return valueObject as ErrorValueObject;
                }

                if (valueObject.isNull() || valueObject.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                const value = valueObject.getValue();

                if (!isRealNum(value)) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                values[r].push(+value);
            }
        }

        return values;
    }

    private _getNumberValuesByRowsColumns(rowCount: number, columnCount: number): number[][] {
        const values: number[][] = [];

        let n = 1;

        for (let r = 0; r < rowCount; r++) {
            values[r] = [];

            for (let c = 0; c < columnCount; c++) {
                values[r].push(n++);
            }
        }

        return values;
    }
}
