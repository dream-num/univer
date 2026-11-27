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

import type { IUniverEngineFormulaConfig } from '../../config/config';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { calculateFactorial } from '../../basics/math';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { coerceExcelCumulative } from './excel-distribution-arguments';
import { gammaDensityTerm, gammaProbability, inverseGammaProbability, logGammaPositive } from './excel-incomplete-gamma';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

function gamma(x: number): number {
    // Keep Excel's direct factorial values for small positive integers.
    if (Number.isInteger(x) && x > 0 && x <= 25) return calculateFactorial(x - 1);
    if (x > 0) return Math.exp(logGammaPositive(x));
    if (Number.isInteger(x)) return Number.NaN;

    // Reduce before evaluating sin(πx) so values near negative integer poles
    // retain their distance from the pole.
    const whole = Math.round(x);
    const sine = (whole % 2 === 0 ? 1 : -1) * Math.sin(Math.PI * (x - whole));
    const logMagnitude = Math.log(Math.PI) - Math.log(Math.abs(sine)) - logGammaPositive(1 - x);
    return Math.sign(sine) * Math.exp(logMagnitude);
}

function gammaDensity(x: number, shape: number, scaled: number): number {
    if (scaled === 0) return shape > 1 ? 0 : Number.NaN;
    return (shape / x) * gammaDensityTerm(shape, scaled);
}

type GammaOperation = 'gamma' | 'log-gamma' | 'distribution' | 'inverse';

function gammaFunction(operation: GammaOperation) {
    return class ExcelGammaFunction extends BaseFunction {
        override minParams = operation === 'distribution' ? 4 : operation === 'inverse' ? 3 : 1;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const error = cells.find((cell) => cell.isError());
                if (error) return error;
                const numeric = cells.slice(0, operation === 'distribution' ? 3 : cells.length)
                    .map((cell) => cell.convertToNumberObjectValue());
                const conversionError = numeric.find((cell) => cell.isError());
                if (conversionError) return conversionError;
                const [x, shape, scale] = numeric.map((cell) => Number(cell.getValue()));

                let result: number;
                if (operation === 'gamma') {
                    result = gamma(x);
                } else if (operation === 'log-gamma') {
                    result = x > 0 ? logGammaPositive(x) : Number.NaN;
                } else if (operation === 'inverse') {
                    result = x >= 0 && x < 1 && shape > 0 && scale > 0
                        ? x === 0 ? 0 : scale * inverseGammaProbability(x, shape)
                        : Number.NaN;
                } else {
                    const cumulative = coerceExcelCumulative(cells[3]);
                    if (typeof cumulative !== 'boolean') return cumulative;
                    const scaled = x / scale;
                    if (!(x >= 0 && shape > 0 && scale > 0) || !Number.isFinite(scaled)) {
                        result = Number.NaN;
                    } else {
                        result = cumulative ? gammaProbability(shape, scaled, false) : gammaDensity(x, shape, scaled);
                    }
                }
                return Number.isFinite(result) ? NumberValueObject.create(result === 0 ? 0 : result) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

const ExcelLogGamma = gammaFunction('log-gamma');
const ExcelGammaDist = gammaFunction('distribution');
const ExcelGammaInv = gammaFunction('inverse');

export const excelGammaFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [gammaFunction('gamma'), FUNCTION_NAMES_STATISTICAL.GAMMA],
    [ExcelLogGamma, FUNCTION_NAMES_STATISTICAL.GAMMALN],
    [ExcelLogGamma, FUNCTION_NAMES_STATISTICAL.GAMMALN_PRECISE],
    [ExcelGammaDist, FUNCTION_NAMES_STATISTICAL.GAMMA_DIST],
    [ExcelGammaDist, FUNCTION_NAMES_COMPATIBILITY.GAMMADIST],
    [ExcelGammaInv, FUNCTION_NAMES_STATISTICAL.GAMMA_INV],
    [ExcelGammaInv, FUNCTION_NAMES_COMPATIBILITY.GAMMAINV],
];
