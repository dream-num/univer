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
import { checkKnownsArrayDimensions, getKnownsArrayCoefficients, getKnownsArrayValues, getSerialNumbersByRowsColumns, getSlopeAndIntercept } from '../../../basics/statistical';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Logest extends BaseFunction {
    override minParams = 1;

    override maxParams = 4;

    override calculate(knownYs: BaseValueObject, knownXs?: BaseValueObject, constb?: BaseValueObject, stats?: BaseValueObject): BaseValueObject {
        const { isError, errorObject } = checkKnownsArrayDimensions(knownYs, knownXs);

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

        let _constb = constb ?? BooleanValueObject.create(true);

        if (_constb.isArray()) {
            _constb = (_constb as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        let _stats = stats ?? BooleanValueObject.create(false);

        if (_stats.isArray()) {
            _stats = (_stats as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        const { isError: _isError, errorObject: _errorObject, variants } = checkVariantsErrorIsStringToNumber(_constb, _stats);

        if (_isError) {
            return _errorObject as ErrorValueObject;
        }

        const [constbObject, statsObject] = variants as BaseValueObject[];

        return this._getResult(knownYsValues, knownXsValues, +constbObject.getValue(), +statsObject.getValue());
    }

    private _getResult(knownYsValues: number[][], knownXsValues: number[][], constb: number, stats: number): BaseValueObject {
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

            return this._getResultByMultipleVariables(knownYsValues, knownXsValues, constb, stats);
        }

        return this._getResultBySimpleVariables(knownYsValues, knownXsValues, constb, stats);
    }

    // eslint-disable-next-line max-lines-per-function
    private _getResultByMultipleVariables(knownYsValues: number[][], knownXsValues: number[][], constb: number, stats: number): BaseValueObject {
        const _coefficients = getKnownsArrayCoefficients(knownYsValues, knownXsValues, knownXsValues, constb, true);

        if (_coefficients instanceof ErrorValueObject) {
            return _coefficients;
        }

        const { coefficients, Y, X, XTXInverse } = _coefficients;

        let result: Array<Array<number | string>> = [];

        if (stats) {
            const _knownYsValues = Y.flat();
            const n = _knownYsValues.length;
            const meanY = !constb ? 0 : _knownYsValues.reduce((acc, value) => acc + value, 0) / n;

            const k = XTXInverse.length;
            const df = n - k;

            const cl = coefficients[0].length;
            const fillNa = new Array(cl - 2).fill(ErrorType.NA);
            const b = coefficients[0][cl - 1];

            const newY = [];

            for (let i = 0; i < X.length; i++) {
                let value = b;

                for (let j = cl - 2; j >= 0; j--) {
                    value *= coefficients[0][cl - 2 - j] ** X[i][j];
                }

                newY.push(Math.log(value));
            }

            let sstotal = 0;
            let ssresid = 0;

            for (let i = 0; i < n; i++) {
                sstotal += (_knownYsValues[i] - meanY) ** 2;

                if (!constb && !Number.isFinite(newY[i])) {
                    continue;
                }

                ssresid += (_knownYsValues[i] - newY[i]) ** 2;
            }

            if (!Number.isFinite(ssresid)) {
                ssresid = 0;
            }

            const ssreg = sstotal - ssresid;
            const r2 = sstotal === 0 ? 0 : ssreg / sstotal;

            const seList = [];

            for (let i = k - 1; i >= 0; i--) {
                const se = df > 0 ? Math.sqrt(ssresid / df * XTXInverse[i][i]) : 0;
                seList.push(se);
            }

            // seb = #N/A when const is FALSE
            if (constb) {
                const seb = seList.shift();
                seList.push(seb);
            } else {
                seList.push(ErrorType.NA);
            }

            const sey = df > 0 ? Math.sqrt(ssresid / df) : 0;
            const F = df > 0 ? (ssreg / (cl - 1)) / (ssresid / df) : ErrorType.NUM;

            result = [
                coefficients[0], // [mn, mn-1, ..., m1, b]
                [...seList], // [sen, sen-1, ..., se1, seb]
                [r2, sey, ...fillNa], // [r2, sey]
                [F, df, ...fillNa], // [F, df]
                [ssreg, ssresid, ...fillNa], // [ssreg, ssresid]
            ];
        } else {
            result = [
                coefficients[0], // [mn, mn-1, ..., m1, b]
            ];
        }

        return ArrayValueObject.createByArray(result);
    }

    private _getResultBySimpleVariables(knownYsValues: number[][], knownXsValues: number[][], constb: number, stats: number): BaseValueObject {
        const knownYsValuesFlat = knownYsValues.flat();
        const knownXsValuesFlat = knownXsValues.flat();
        const { slope: m, intercept: b, Y } = getSlopeAndIntercept(knownXsValuesFlat, knownYsValuesFlat, constb, true);

        if (Number.isNaN(m)) {
            return ErrorValueObject.create(ErrorType.NA);
        }

        let result: Array<Array<number | string>> = [];

        if (stats) {
            const n = Y.length;

            let meanY = 0;
            let meanX = 0;
            let df = n - 1;

            if (constb) {
                let sumY = 0;
                let sumX = 0;

                for (let i = 0; i < n; i++) {
                    sumY += Y[i];
                    sumX += knownXsValuesFlat[i];
                }

                meanY = sumY / n;
                meanX = sumX / n;
                df = n - 2;
            }

            let sstotal = 0;
            let ssresid = 0;
            let ssx = 0;

            for (let i = 0; i < n; i++) {
                sstotal += (Y[i] - meanY) ** 2;
                ssresid += (Y[i] - Math.log(b * (m ** knownXsValuesFlat[i]))) ** 2;
                ssx += (knownXsValuesFlat[i] - meanX) ** 2;
            }

            const ssreg = sstotal - ssresid;
            const r2 = sstotal === 0 ? 0 : ssreg / sstotal;

            let se = 0;
            let seb: number | ErrorType = 0;
            let sey = 0;
            let F = 0;

            if (df > 0) {
                if (ssx > 0) {
                    se = Math.sqrt(ssresid / df / ssx);
                    seb = Math.sqrt(ssresid / df * (1 / n + meanX ** 2 / ssx));
                }

                sey = Math.sqrt(ssresid / df);
                F = (ssreg / 1) / (ssresid / df);
            }

            // seb = #N/A when const is FALSE
            if (!constb) {
                seb = ErrorType.NA;
            }

            result = [
                [m, b], // [m, b]
                [se, seb], // [se, seb]
                [r2, sey], // [r2, sey]
                [F, df], // [F, df]
                [ssreg, ssresid], // [ssreg, ssresid]
            ];
        } else {
            result = [
                [m, b], // [m, b]
            ];
        }

        return ArrayValueObject.createByArray(result);
    }

    private _getKnownXsValues(knownYsValues: number[][], knownXs?: BaseValueObject): number[][] | ErrorValueObject {
        if (!knownXs || knownXs.isNull()) {
            return getSerialNumbersByRowsColumns(knownYsValues.length, knownYsValues[0].length);
        }

        return getKnownsArrayValues(knownXs);
    }
}
