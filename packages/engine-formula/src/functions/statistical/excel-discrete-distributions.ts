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
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { coerceExcelCumulative, coerceExcelDistributionNumber } from './excel-distribution-arguments';
import { betaTailProbability } from './excel-f-distribution';
import { binomialMass } from './excel-hypergeometric';
import { gammaDensityTerm, gammaProbability } from './excel-incomplete-gamma';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

const MAX_BINOMIAL_TRIALS = 2_147_483_647;

function binomialTail(trials: number, probability: number, successes: number, upper: boolean): number {
    if (successes < 0 || (probability === 1 && successes < trials)) return Number(upper);
    if (successes >= trials || probability === 0) return Number(!upper);
    if (successes === 0) {
        const logMass = trials * Math.log1p(-probability);
        return upper ? -Math.expm1(logMass) : Math.exp(logMass);
    }
    return betaTailProbability(probability, 1 - probability, successes + 1, trials - successes, !upper);
}

function binomialDistribution(successes: number, trials: number, probability: number, cumulative: boolean): number {
    const k = Math.trunc(successes);
    const n = Math.trunc(trials);
    if (successes < 0 || trials < 0 || n >= MAX_BINOMIAL_TRIALS || k > n || probability < 0 || probability > 1) return NaN;
    if (!cumulative && k === 0 && n > 0 && probability === 1) return NaN;
    return cumulative ? binomialTail(n, probability, k, false) : binomialMass(n, probability, k);
}

function binomialRange(trials: number, probability: number, first: number, last: number): number {
    const n = Math.trunc(trials);
    const start = Math.trunc(first);
    const end = Math.trunc(last);
    if (trials < 0 || n >= MAX_BINOMIAL_TRIALS || first < 0 || last < 0 || start > end || end > n || probability < 0 || probability > 1) return NaN;
    if (end - start <= 64) {
        let result = 0;
        for (let k = start; k <= end; k++) {
            result += binomialMass(n, probability, k);
        }
        return result;
    }
    const upper = start > n * probability;
    return upper
        ? binomialTail(n, probability, start - 1, true) - binomialTail(n, probability, end, true)
        : binomialTail(n, probability, end, false) - binomialTail(n, probability, start - 1, false);
}

function binomialInverse(trials: number, probability: number, alpha: number): number {
    let low = 0;
    const n = Math.trunc(trials);
    let high = n;
    if (trials < 0 || n >= MAX_BINOMIAL_TRIALS || probability <= 0 || probability >= 1 || alpha <= 0 || alpha >= 1) return NaN;
    while (low < high) {
        const mid = Math.floor((low + high) / 2);
        const reached = alpha > 0.5
            ? binomialTail(n, probability, mid, true) <= 1 - alpha
            : binomialTail(n, probability, mid, false) >= alpha;
        if (reached) {
            high = mid;
        } else {
            low = mid + 1;
        }
    }
    return low;
}

function negativeBinomialDistribution(failures: number, successes: number, probability: number, cumulative: boolean): number {
    const k = Math.trunc(failures);
    const r = Math.trunc(successes);
    if (failures < 0 || r < 1 || probability <= 0 || probability >= 1) return NaN;
    if (k === 0) return Math.exp(r * Math.log(probability));
    if (cumulative) return betaTailProbability(probability, 1 - probability, r, k + 1, false);
    const total = k + r;
    if (!Number.isFinite(total) || total === r) return NaN;
    return (r / total) * binomialMass(total, probability, r);
}

function poissonDistribution(events: number, mean: number, cumulative: boolean): number {
    const k = Math.trunc(events);
    if (events < 0) return NaN;
    if (k === 0) return Math.exp(-mean);
    if (mean < 0) return NaN;
    // Excel's small-count kernels double the mean for these two cases.
    if (k === (cumulative ? 1 : 2) && !Number.isFinite(2 * mean)) return NaN;
    if (mean === 0) return Number(cumulative);
    return cumulative ? gammaProbability(k + 1, mean, true) : gammaDensityTerm(k, mean);
}

type Distribution = 'binomial' | 'binomial-range' | 'binomial-inverse' | 'negative-binomial' | 'negative-binomial-mass' | 'poisson';

function discreteDistributionFunction(kind: Distribution) {
    return class ExcelDiscreteDistribution extends BaseFunction {
        override minParams = kind === 'binomial' || kind === 'negative-binomial' ? 4 : 3;
        override maxParams = kind === 'binomial-range' ? 4 : this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const numbers: number[] = [];
                for (const cell of cells.slice(0, kind === 'poisson' ? 2 : 3)) {
                    const value = coerceExcelDistributionNumber(cell);
                    if (value.isError()) return value;
                    numbers.push(Number(value.getValue()));
                }
                const [first, second, third] = numbers;
                let result: number;
                if (kind === 'binomial-range') {
                    const last = cells[3];
                    const bound = last === undefined || (last instanceof NullValueObject && last.isOmitted())
                        ? null
                        : coerceExcelDistributionNumber(last);
                    if (bound?.isError()) return bound;
                    result = binomialRange(first, second, third, bound === null ? third : Number(bound.getValue()));
                } else if (kind === 'binomial-inverse') {
                    result = binomialInverse(first, second, third);
                } else {
                    const cumulative = kind === 'negative-binomial-mass' ? false : coerceExcelCumulative(cells[kind === 'poisson' ? 2 : 3]);
                    if (typeof cumulative !== 'boolean') return cumulative;
                    if (kind === 'poisson') {
                        result = poissonDistribution(first, second, cumulative);
                    } else if (kind === 'binomial') {
                        result = binomialDistribution(first, second, third, cumulative);
                    } else {
                        result = negativeBinomialDistribution(first, second, third, cumulative);
                    }
                }
                return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

const ExcelBinomDist = discreteDistributionFunction('binomial');
const ExcelBinomInv = discreteDistributionFunction('binomial-inverse');
const ExcelPoisson = discreteDistributionFunction('poisson');

export const excelDiscreteDistributionFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelBinomDist, FUNCTION_NAMES_STATISTICAL.BINOM_DIST],
    [ExcelBinomDist, FUNCTION_NAMES_COMPATIBILITY.BINOMDIST],
    [discreteDistributionFunction('binomial-range'), FUNCTION_NAMES_STATISTICAL.BINOM_DIST_RANGE],
    [ExcelBinomInv, FUNCTION_NAMES_STATISTICAL.BINOM_INV],
    [ExcelBinomInv, FUNCTION_NAMES_COMPATIBILITY.CRITBINOM],
    [discreteDistributionFunction('negative-binomial'), FUNCTION_NAMES_STATISTICAL.NEGBINOM_DIST],
    [discreteDistributionFunction('negative-binomial-mass'), FUNCTION_NAMES_COMPATIBILITY.NEGBINOMDIST],
    [ExcelPoisson, FUNCTION_NAMES_STATISTICAL.POISSON_DIST],
    [ExcelPoisson, FUNCTION_NAMES_COMPATIBILITY.POISSON],
];
