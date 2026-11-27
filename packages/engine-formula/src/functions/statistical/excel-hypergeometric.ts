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
import { gammaln } from '../../basics/statistical';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

const MIN_NORMAL = 2 ** -1022;
const HALF_LOG_TWO_PI = 0.9189385332046727;

function atanhSeries(value: number): number {
    const magnitude = Math.abs(value);
    const square = magnitude * magnitude;
    let term = magnitude;
    let denominator = 1;
    let tail = 0;
    for (;;) {
        const next = denominator + 2;
        term *= (denominator / next) * square;
        tail += term;
        if (term === 0 || term < Number.EPSILON * tail) {
            return Math.sign(value) * (magnitude + tail);
        }
        denominator = next;
    }
}

function deviance(observed: number, expected: number): number {
    const delta = observed - expected;
    const ratio = delta / (observed + expected);
    if (Math.abs(ratio) > 0.2) return observed * Math.log(observed / expected) - delta;
    const scaled = 2 * observed;
    return (scaled * atanhSeries(ratio) - scaled * ratio) + delta * ratio;
}

function stirlingCorrection(n: number): number {
    if (n < 16) {
        return gammaln(n + 1) - ((n + 0.5) * Math.log(n) - n + HALF_LOG_TWO_PI);
    }
    const square = n * n;
    let tail = (1 / 1680 - 1 / 1188 / square) / square;
    tail = (1 / 1260 - tail) / square;
    tail = (1 / 360 - tail) / square;
    return (1 / 12 - tail) / n;
}

export function binomialMass(trials: number, probability: number, successes: number): number {
    if (probability === 0 || probability === 1) return Number(successes === trials * probability);
    const failures = trials - successes;
    let mass: number;
    if (successes === 0) {
        mass = Math.exp(trials * Math.log1p(-probability));
    } else if (failures === 0) {
        mass = Math.exp(trials * Math.log(probability));
    } else {
        const exponent = stirlingCorrection(trials) - stirlingCorrection(successes) - deviance(successes, trials * probability) -
            stirlingCorrection(failures) - deviance(failures, trials * (1 - probability));
        mass = Math.exp(exponent) / Math.sqrt(2 * Math.PI * successes * (1 - successes / trials));
    }
    return mass < MIN_NORMAL ? 0 : mass;
}

function probabilityMass(successes: number, sample: number, populationSuccesses: number, population: number): number {
    // Condition two binomial counts on their sum. Excel rounds the individual
    // binomial probabilities, including any underflow, before combining them.
    let probability = Math.max(successes, sample - successes) / population;
    let denominator = binomialMass(population, probability, sample);
    if (denominator === 0) {
        probability = sample / population;
        denominator = binomialMass(population, probability, sample);
    }
    const mass = binomialMass(populationSuccesses, probability, successes) / denominator *
        binomialMass(population - populationSuccesses, probability, sample - successes);
    return mass < MIN_NORMAL ? 0 : mass;
}

function cumulativeProbability(successes: number, sample: number, populationSuccesses: number, population: number): number {
    // Reflect the upper tail so the recurrence always advances downward.
    const complement = successes > (sample + 1) * (populationSuccesses + 1) / (population + 2);
    const k = complement ? population - populationSuccesses : populationSuccesses;
    const start = complement ? sample - successes - 1 : successes;
    const lower = Math.max(0, sample + k - population);
    let term = probabilityMass(start, sample, k, population);
    if (!Number.isFinite(term)) return term;
    let total = term;
    for (let x = start; x > lower; x--) {
        term *= x * (population - sample - k + x) / ((sample - x + 1) * (k - x + 1));
        const next = total + term;
        if (next === total) break;
        total = next;
    }
    return complement ? Math.max(0, 1 - total) : Math.min(1, total);
}

function hypergeometric(successes: number, sample: number, populationSuccesses: number, population: number, cumulative: boolean): number {
    const lower = Math.max(0, sample + populationSuccesses - population);
    const upper = Math.min(sample, populationSuccesses);
    if (successes < lower) return 0;
    if (successes > upper || (cumulative && successes === upper)) return Number(cumulative);
    if (lower === upper) return 1;
    return cumulative
        ? cumulativeProbability(successes, sample, populationSuccesses, population)
        : probabilityMass(successes, sample, populationSuccesses, population);
}

class ExcelHypgeomDist extends BaseFunction {
    override minParams = 5;

    override maxParams = 5;

    override calculate(...input: BaseValueObject[]): BaseValueObject {
        return mapFinancialScalars(input, (args) => this._evaluate(args));
    }

    private _evaluate(args: BaseValueObject[]): BaseValueObject {
        const counts: number[] = [];
        for (const arg of args.slice(0, 4)) {
            const value = arg.isString() ? arg.withDateSystem(this.getDateSystem()).convertToNumberObjectValue() : arg;
            if (value.isError()) return value;
            counts.push(Math.floor(value.isNull() ? 0 : Number(value.getValue())));
        }
        const mode = args[4];
        if (mode?.isError()) return mode;
        let cumulative = mode && !mode.isNull() ? Boolean(mode.getValue()) : false;
        if (mode?.isString()) {
            const text = String(mode.getValue()).toUpperCase();
            if (text !== 'TRUE' && text !== 'FALSE') return ErrorValueObject.create(ErrorType.VALUE);
            cumulative = text === 'TRUE';
        }
        const [successes, sample, populationSuccesses, population] = counts;
        if (counts.some((n) => !Number.isFinite(n) || n < 0) ||
            population >= 0x7FFF_FFFF || sample > population || populationSuccesses > population) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const result = hypergeometric(successes, sample, populationSuccesses, population, cumulative);
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }
}

class ExcelHypgeomdist extends ExcelHypgeomDist {
    override minParams = 4;

    override maxParams = 4;
}

export const excelHypergeometricFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelHypgeomDist, FUNCTION_NAMES_STATISTICAL.HYPGEOM_DIST],
    [ExcelHypgeomdist, FUNCTION_NAMES_COMPATIBILITY.HYPGEOMDIST],
];
