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

import { isRealNum } from '@univerjs/core';
import { ErrorType } from '../../../basics/error-type';
import { calculateMmult, inverseMatrixByUSV, matrixTranspose } from '../../../basics/math';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';

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

    private _getKnownXsValues(knownYsRowCount: number, knownYsColumnCount: number, knownXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!knownXs || knownXs.isNull()) {
            return this._getNumberValuesByRowsColumns(knownYsRowCount, knownYsColumnCount);
        }

        const knownXsRowCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getRowCount() : 1;
        const knownXsColumnCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getColumnCount() : 1;

        if (knownXsRowCount !== knownYsRowCount && knownXsColumnCount !== knownYsColumnCount) {
            return ErrorValueObject.create(ErrorType.REF);
        }

        return this._getValues(knownXs, knownXsRowCount, knownXsColumnCount);
    }

    private _getNewXsValues(knownXsValues: number[][], knownYsRowCount: number, knownYsColumnCount: number, newXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!newXs || newXs.isNull()) {
            return knownXsValues;
        }

        const newXsRowCount = newXs.isArray() ? (newXs as ArrayValueObject).getRowCount() : 1;
        const newXsColumnCount = newXs.isArray() ? (newXs as ArrayValueObject).getColumnCount() : 1;

        if (newXsRowCount !== knownYsRowCount && newXsColumnCount !== knownYsColumnCount) {
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
