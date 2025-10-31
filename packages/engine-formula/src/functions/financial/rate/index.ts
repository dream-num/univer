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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Rate extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    override calculate(nper: BaseValueObject, pmt: BaseValueObject, pv: BaseValueObject, fv?: BaseValueObject, type?: BaseValueObject, guess?: BaseValueObject): BaseValueObject {
        const _fv = fv ?? NumberValueObject.create(0);
        const _type = type ?? NumberValueObject.create(0);
        const _guess = guess ?? NumberValueObject.create(0.1);

        const maxRowLength = Math.max(
            nper.isArray() ? (nper as ArrayValueObject).getRowCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            _fv.isArray() ? (_fv as ArrayValueObject).getRowCount() : 1,
            _type.isArray() ? (_type as ArrayValueObject).getRowCount() : 1,
            _guess.isArray() ? (_guess as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            nper.isArray() ? (nper as ArrayValueObject).getColumnCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            _fv.isArray() ? (_fv as ArrayValueObject).getColumnCount() : 1,
            _type.isArray() ? (_type as ArrayValueObject).getColumnCount() : 1,
            _guess.isArray() ? (_guess as ArrayValueObject).getColumnCount() : 1
        );

        const nperArray = expandArrayValueObject(maxRowLength, maxColumnLength, nper, ErrorValueObject.create(ErrorType.NA));
        const pmtArray = expandArrayValueObject(maxRowLength, maxColumnLength, pmt, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, _fv, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _type, ErrorValueObject.create(ErrorType.NA));
        const guessArray = expandArrayValueObject(maxRowLength, maxColumnLength, _guess, ErrorValueObject.create(ErrorType.NA));

        const resultArray = nperArray.map((nperObject, rowIndex, columnIndex) => {
            const pmtObject = pmtArray.get(rowIndex, columnIndex) as BaseValueObject;
            const pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const guessObject = guessArray.get(rowIndex, columnIndex) as BaseValueObject;

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(nperObject, pmtObject, pvObject, fvObject, typeObject, guessObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_nperObject, _pmtObject, _pvObject, _fvObject, _typeObject, _guessObject] = variants as BaseValueObject[];

            const nperValue = +_nperObject.getValue();
            const pmtValue = +_pmtObject.getValue();
            const pvValue = +_pvObject.getValue();
            const fvValue = +_fvObject.getValue();
            let typeValue = +_typeObject.getValue();
            const guessValue = +_guessObject.getValue();

            typeValue = typeValue >= 0.5 ? 1 : 0;

            if (nperValue <= 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            // Cash flow sanity check - prevent all-positive or all-negative cash flows
            // Zero values are considered neutral (valid for both signs)
            const allPositive = pmtValue >= 0 && pvValue >= 0 && fvValue >= 0;
            const allNegative = pmtValue <= 0 && pvValue <= 0 && fvValue <= 0;

            if (allPositive || allNegative) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            return this._getResult(nperValue, pmtValue, pvValue, fvValue, typeValue, guessValue, rowIndex, columnIndex);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _getResult(
        nperValue: number,
        pmtValue: number,
        pvValue: number,
        fvValue: number,
        typeValue: number,
        guessValue: number,
        rowIndex: number,
        columnIndex: number
    ): BaseValueObject {
        const epsMax = 1e-10;
        const iterMax = 100;

        // Fast path for PMT == 0
        if (Math.abs(pmtValue) < 1e-14) {
            return this._computeSimpleGrowthRate(nperValue, pvValue, fvValue, rowIndex, columnIndex);
        }

        let result = guessValue;
        let lastResidual = Number.POSITIVE_INFINITY;

        for (let i = 0; i < iterMax; i++) {
            if (result <= -1) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const { value: y, derivative: dy } = this._evaluateRateFunction(
                result,
                nperValue,
                pmtValue,
                pvValue,
                fvValue,
                typeValue,
                epsMax
            );

            const residual = Math.abs(y);

            if (residual < epsMax) {
                break;
            }

            if (Math.abs(dy) < 1e-14) {
                break;
            }

            // Adaptive damping: larger steps when far from solution, smaller when close
            const dampedStep = this._getAdaptiveDampedStep(y, dy, residual, lastResidual);

            result -= dampedStep;
            lastResidual = residual;
        }

        // Only reject rates that are mathematically invalid or non-finite
        if (!Number.isFinite(result) || result <= -1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result, rowIndex === 0 && columnIndex === 0 ? '0%' : undefined);
    }

    private _computeSimpleGrowthRate(
        nperValue: number,
        pvValue: number,
        fvValue: number,
        rowIndex: number,
        columnIndex: number
    ): BaseValueObject {
        if (Math.sign(pvValue) === Math.sign(fvValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const r = (fvValue / -pvValue) ** (1 / nperValue) - 1;
        return NumberValueObject.create(r, rowIndex === 0 && columnIndex === 0 ? '0%' : undefined);
    }

    private _evaluateRateFunction(
        rate: number,
        nperValue: number,
        pmtValue: number,
        pvValue: number,
        fvValue: number,
        typeValue: number,
        epsMax: number
    ): { value: number; derivative: number } {
        let y: number;
        let dy: number;
        let f: number;

        if (Math.abs(rate) < epsMax) {
            // Use Taylor series limit as rate approaches 0
            y = pvValue * (1 + nperValue * rate) + pmtValue * (1 + rate * typeValue) * nperValue + fvValue;
            dy = pvValue * nperValue + pmtValue * typeValue * nperValue;
        } else {
            // Standard evaluation
            f = (1 + rate) ** nperValue;
            y = pvValue * f + pmtValue * (1 / rate + typeValue) * (f - 1) + fvValue;

            const df = nperValue * (1 + rate) ** (nperValue - 1);
            dy = pvValue * df + pmtValue * (1 / rate + typeValue) * df + pmtValue * (-1 / (rate * rate)) * (f - 1);
        }

        return { value: y, derivative: dy };
    }

    private _getAdaptiveDampedStep(
        y: number,
        dy: number,
        residual: number,
        lastResidual: number
    ): number {
        const rawStep = y / dy;

        // When residual is large (>1e-3) or not improving, allow larger steps
        // When residual is small (<1e-3), use tighter damping for precision
        if (residual > 1e-3 || residual >= lastResidual * 0.9) {
            // Far from solution - allow steps up to ±5.0
            return Math.max(Math.min(rawStep, 5.0), -5.0);
        } else {
            // Close to solution - use conservative damping for stability
            return Math.max(Math.min(rawStep, 0.5), -0.5);
        }
    }
}
