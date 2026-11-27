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
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { betaContinuedFraction, normalQuantileMagnitude } from '../../basics/statistical';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { coerceExcelCumulative, coerceExcelDistributionNumber } from './excel-distribution-arguments';
import { log1pMinusX, stirlingError } from './excel-incomplete-gamma';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

const MIN_NORMAL = 2 ** -1022;
const LOG_SQRT_TWO_PI = 0.9189385332046727;

const GAUSS_LEGENDRE_NODES = [
    0.09501250983763744,
    0.2816035507792589,
    0.4580167776572274,
    0.6178762444026438,
    0.755404408355003,
    0.8656312023878318,
    0.9445750230732326,
    0.9894009349916499,
];
const GAUSS_LEGENDRE_WEIGHTS = [
    0.1894506104550685,
    0.1826034150449236,
    0.1691565193950025,
    0.1495959888165767,
    0.1246289712555339,
    0.09515851168249279,
    0.06225352393864789,
    0.02715245941175409,
];

function integrateTail(start: number, end: number, density: (coordinate: number) => number, width = 2): number {
    const direction = Math.sign(end - start);
    const limit = Math.abs(end - start);
    let total = 0;
    for (let distance = 0; distance < limit; distance += width) {
        const halfWidth = Math.min(width, limit - distance) / 2;
        const center = start + direction * (distance + halfWidth);
        let panel = 0;
        for (let i = 0; i < GAUSS_LEGENDRE_NODES.length; i++) {
            const offset = halfWidth * GAUSS_LEGENDRE_NODES[i];
            panel += GAUSS_LEGENDRE_WEIGHTS[i] * (density(center - offset) + density(center + offset));
        }
        const area = panel * halfWidth;
        const next = total + area;
        if (total > 0 && next === total) break;
        total = next;
    }
    return total;
}

function gammaCorrection(shape: number): number {
    if (shape >= 16) return stirlingError(shape);
    // F degrees of freedom make the gamma arguments integers or half-integers.
    let logGamma = Number.isInteger(shape) ? 0 : 0.5 * Math.log(Math.PI);
    for (let factor = shape - 1; factor > 0; factor--) logGamma += Math.log(factor);
    return logGamma - ((shape - 0.5) * Math.log(shape) - shape + LOG_SQRT_TWO_PI);
}

function betaLogMode(a: number, b: number): number {
    const total = a + b;
    return 0.5 * Math.log(a * b / total) - LOG_SQRT_TWO_PI - gammaCorrection(a) - gammaCorrection(b) + gammaCorrection(total);
}

function betaLogDeviation(value: number, offset: number, a: number, b: number): number {
    const total = a + b;
    const scaled = offset / ((a * value + b) / total);
    const lower = (b / total) * scaled;
    const upper = -(a / total) * scaled;
    if (lower > -0.98 && upper > -0.98) {
        return a * log1pMinusX(lower) + b * log1pMinusX(upper);
    }
    const logValue = Math.log(value);
    const logMean = a * value > b
        ? Math.log(a / total) + logValue + Math.log1p(b / (a * value))
        : Math.log(b / total) + Math.log1p(a * value / b);
    const lowerTerm = Math.abs(lower) <= 0.125 ? log1pMinusX(lower) : logValue - logMean - lower;
    const upperTerm = Math.abs(upper) <= 0.125 ? log1pMinusX(upper) : -logMean - upper;
    return a * lowerTerm + b * upperTerm;
}

function integerBetaComplement(small: number, large: number, x: number, complement: number): number {
    let term = 1;
    let series = 1;
    for (let i = 1; i < small; i++) {
        term *= x * ((large + i - 1) / i);
        series += term;
    }
    return Math.exp(large * (x < 0.5 ? Math.log1p(-x) : Math.log(complement)) + Math.log(series));
}

function unequalBetaComplement(small: number, large: number, x: number, mode: number): number {
    // Transform the small beta coordinate to -large * log(1 - x).
    const start = -large * Math.log1p(-x);
    const logRatio = Math.log1p(small / large);
    const logDensityFactor = mode - small * (Math.log(small) - logRatio) + large * logRatio;
    const logLarge = Math.log(large);
    return integrateTail(start, start + Math.max(48, 12 * Math.sqrt(small)), (coordinate) => {
        const logX = Math.log(-Math.expm1(-coordinate / large)) + logLarge;
        return Math.exp(logDensityFactor - coordinate + (small - 1) * logX);
    });
}

function probability(value: number, a: number, b: number, rightTail: boolean): number {
    const product = a * value;
    const ratio = product / b;
    const inputReversed = product > b;
    const smallRatio = inputReversed ? b / product : ratio;
    if (smallRatio < MIN_NORMAL) return Number(inputReversed !== rightTail);
    const smaller = smallRatio / (1 + smallRatio);
    const larger = 1 / (1 + smallRatio);
    const lower = inputReversed ? larger : smaller;
    const upper = inputReversed ? smaller : larger;
    const mode = betaLogMode(a, b);

    if (Math.min(a, b) >= 256) {
        const scale = Math.sqrt(a * b / (a + b));
        // Measure displacement in the rounded beta ratio before taking its logarithm.
        const offset = inputReversed ? (b / a - smallRatio) / smallRatio : (smallRatio - a / b) / (a / b);
        const coordinate = (offset > -1 ? Math.log1p(offset) : Math.log(value)) * scale;
        if (Math.abs(coordinate) < 37) {
            if (coordinate === 0 && a === b) return 0.5;
            const fromRight = coordinate > 0;
            const tail = integrateTail(coordinate, fromRight ? 42 : -42, (point) => {
                const offset = Math.expm1(point / scale);
                return Math.exp(mode + betaLogDeviation(1 + offset, offset, a, b)) / scale;
            });
            return fromRight === rightTail ? tail : 1 - tail;
        }
    }

    const fromRight = ratio > (a + 1) / (b + 1);
    const x = fromRight ? upper : lower;
    const complement = fromRight ? lower : upper;
    const first = fromRight ? b : a;
    const second = fromRight ? a : b;
    let tail: number;
    if (Number.isInteger(second) && second <= 32) {
        tail = integerBetaComplement(second, first, complement, x);
    } else if (second * 1e6 < first && complement < 0.01) {
        tail = unequalBetaComplement(second, first, complement, mode);
    } else {
        const weight = betaLogDeviation(value, value - 1, a, b) + mode;
        const fraction = betaContinuedFraction(x, first, second, 1e-15);
        tail = Math.exp(weight - Math.log(first) + Math.log(fraction));
    }
    tail = tail < MIN_NORMAL ? 0 : Math.min(1, tail);
    return fromRight === rightTail ? tail : 1 - tail;
}

function normalIntermediate(value: number): number {
    return Math.abs(value) < MIN_NORMAL ? 0 : value;
}

function betaLogWeight(x: number, complement: number, a: number, b: number, mode: number): number {
    const displacement = b * x - a * complement;
    const left = displacement / a;
    const right = -displacement / b;
    const leftTerm = left > -0.98 ? log1pMinusX(left) : Math.log(x) + Math.log1p(b / a) - left;
    const rightTerm = right > -0.98 ? log1pMinusX(right) : Math.log(complement) + Math.log1p(a / b) - right;
    return mode + (a * leftTerm + b * rightTerm);
}

export function betaTailProbability(x: number, complement: number, a: number, b: number, rightTail: boolean, mode = betaLogMode(a, b)): number {
    if (a === 0.5 && b === 1) return rightTail ? complement / (1 + Math.sqrt(x)) : Math.sqrt(x);
    if (a === 0.5 && b === 2) {
        const root = Math.sqrt(x);
        return rightTail ? (complement / (1 + root)) ** 2 * (1 + root / 2) : (1.5 - 0.5 * x) * root;
    }
    const smallShape = Math.min(a, b);
    if (smallShape >= 256) {
        const scale = Math.sqrt(a * b / (a + b));
        const logRatio = Math.log1p((b * x - a * complement) / (a * complement));
        const coordinate = logRatio * scale;
        if (Math.abs(coordinate) < 42) {
            if (coordinate === 0 && a === b) return 0.5;
            const fromRight = coordinate > 0;
            const width = Math.min(2, 12 / (1 + Math.abs(coordinate)));
            let tail = integrateTail(coordinate, fromRight ? 42 : -42, (point) => {
                const ratio = (a / b) * Math.exp(point / scale);
                const smaller = Math.min(ratio, 1 / ratio);
                const denominator = 1 + smaller;
                const lower = ratio > 1 ? 1 / denominator : smaller / denominator;
                const upper = ratio > 1 ? smaller / denominator : 1 / denominator;
                return Math.exp(betaLogWeight(lower, upper, a, b, mode)) / scale;
            }, width);
            // The large-shape asymptotic expansion multiplies its normalized
            // probability by 2 / sqrt(pi) after the preceding product rounds.
            if (smallShape > 10_000 && Math.abs(a * complement - b * x) <= 0.03 * smallShape
                && (tail * Math.sqrt(Math.PI)) / 2 < MIN_NORMAL) {
                tail = 0;
            }
            return fromRight === rightTail ? normalIntermediate(tail) : 1 - tail;
        }
    }

    const fromRight = x > (a + 1) / (a + b + 2);
    const lower = fromRight ? complement : x;
    const upper = fromRight ? x : complement;
    const first = fromRight ? b : a;
    const second = fromRight ? a : b;
    let tail: number;
    if (Number.isInteger(second) && second <= 32) {
        tail = integerBetaComplement(second, first, upper, lower);
    } else if (second * 1e6 < first && upper < 0.01) {
        tail = unequalBetaComplement(second, first, upper, mode);
    } else {
        const weight = betaLogWeight(lower, upper, first, second, mode);
        tail = Math.exp(weight - Math.log(first) + Math.log(betaContinuedFraction(lower, first, second, 1e-15)));
    }
    tail = normalIntermediate(tail);
    return fromRight === rightTail ? tail : 1 - tail;
}

function betaQuantileSeed(probabilityValue: number, a: number, b: number, mode: number): number {
    // Normal-based starting approximation from AS 109.
    const z = normalQuantileMagnitude(probabilityValue);
    if (a > 1 && b > 1) {
        const r = (z * z - 3) / 6;
        const s = 1 / (2 * a - 1);
        const t = 1 / (2 * b - 1);
        const h = 2 / (s + t);
        const w = z * Math.sqrt(h + r) / h - (t - s) * (r + 5 / 6 - 2 / (3 * h));
        return a / (a + b * Math.exp(2 * w));
    }

    const r = 1 / (9 * b);
    const base = 1 - r + z * Math.sqrt(r);
    const transformed = 2 * b * (base ** 3);
    const logBeta = -a * Math.log1p(b / a) - b * Math.log1p(a / b) - mode;
    if (transformed < 0) return -Math.expm1((Math.log1p(-probabilityValue) + logBeta + Math.log(b)) / b);
    const scaled = 4 * a + 2 * b - 2;
    if (transformed < scaled) return 1 - 2 / (1 + scaled / transformed);
    return Math.exp((Math.log(probabilityValue) + logBeta + Math.log(a)) / a);
}

function betaQuantile(probabilityValue: number, a: number, b: number): number {
    const mode = betaLogMode(a, b);
    const seed = betaQuantileSeed(probabilityValue, a, b, mode);
    let x = seed > 0 && seed < 1 ? seed : seed >= 1 ? 0.999999 : 1e-6;
    const tolerance = Math.min(Number.EPSILON ** 2, 10 ** Math.max(-300, 2 * (-5 / (a * a) - 13 - probabilityValue ** -0.2)));
    const logTolerance = Math.log(tolerance);
    let best = x;
    let bestError = Infinity;
    let previousError = 0;
    let stepSquared = 1;
    let stepBound = 1;
    let trials = 0;
    for (let iteration = 0; iteration <= 500; iteration++) {
        const error = normalIntermediate(betaTailProbability(x, 1 - x, a, b, false, mode) - probabilityValue);
        const absolute = Math.abs(error);
        if (absolute < bestError) {
            best = x;
            bestError = absolute;
        }
        if (error === 0) return best;
        const complement = 1 - x;
        let gradient: number;
        if (a === 0.5 && b === 1) {
            gradient = 0.5 / Math.sqrt(x);
        } else if (a === 0.5 && b === 2) {
            gradient = 0.75 * complement / Math.sqrt(x);
        } else {
            gradient = normalIntermediate(Math.exp(betaLogWeight(x, complement, a, b, mode) - Math.log(x) - Math.log(complement)));
        }
        if (!(gradient > 0) || !Number.isFinite(gradient)) return best;
        if (normalIntermediate(error * previousError) <= 0) stepBound = stepSquared || MIN_NORMAL;
        if (stepBound <= tolerance || 2 * (Math.log(absolute) - Math.log(gradient)) <= logTolerance) return best;

        const step = normalIntermediate(error / gradient);
        let damping = 1;
        while (trials < 700) {
            trials++;
            const adjustment = normalIntermediate(damping * step);
            stepSquared = normalIntermediate(adjustment * adjustment);
            const next = normalIntermediate(x - adjustment);
            if (stepSquared < stepBound && next > 0 && next < 1) {
                if (Math.abs(next - x) <= Number.EPSILON * 0.5 * Math.abs(x)) return best;
                previousError = error;
                x = next;
                break;
            }
            damping /= 3;
        }
        if (trials >= 700) break;
    }
    return bestError / probabilityValue > 1e-12 ? Number.NaN : best;
}

function inverseProbability(probabilityValue: number, d1: number, d2: number, rightTail: boolean): number {
    if (probabilityValue === 0) return rightTail ? Number.NaN : 0;
    if (probabilityValue === 1) return rightTail ? 0 : Number.NaN;
    if (probabilityValue > 1) return Number.NaN;
    const useComplement = probabilityValue > 0.5;
    const invertRatio = rightTail !== useComplement;
    const a = (invertRatio ? d2 : d1) / 2;
    const b = (invertRatio ? d1 : d2) / 2;
    const x = betaQuantile(useComplement ? 1 - probabilityValue : probabilityValue, a, b);
    const complement = 1 - x;
    return invertRatio ? (d2 / d1) * complement / x : (d2 / d1) * x / complement;
}

function densityLog1p(x: number): number {
    if (x >= 0.375) return Math.log(1 + x);
    if (x <= 2 ** -51) return x * (1 - 0.5 * x);
    const q = x / (2 + x);
    const square = q * q;
    let term = q;
    let sum = 0;
    for (let n = 1; ; n += 2) {
        term *= (n / (n + 2)) * square;
        sum += term;
        if (Number.EPSILON * sum > term || term === 0) return 2 * (q + sum);
    }
}

function density(value: number, first: number, second: number): number {
    const product = first * value;
    const largerInput = product > second;
    const shapeRatio = largerInput ? second / first : first / second;
    const inputRatio = largerInput ? second / product : product / second;
    const total = first + second;
    const logarithm = (largerInput ? second : -first) * Math.log(value) * 0.5;
    const exponent = logarithm + ((densityLog1p(inputRatio) - densityLog1p(shapeRatio)) * total) * 0.5;
    const minShape = Math.min(first, second);
    const scale = (Math.log(minShape) - densityLog1p(minShape / Math.max(first, second))) / 2;
    // Keep the neighboring logarithms separate until summation. Replacing their
    // subtraction with a log-ratio changes Excel's roundoff at high degrees.
    const logDensity = scale - (LOG_SQRT_TWO_PI + 0.5 * Math.log(2))
        - gammaCorrection(first / 2) - gammaCorrection(second / 2) + gammaCorrection(total / 2) - exponent;
    return Math.exp(logDensity) / value;
}

function result(value: number): BaseValueObject {
    return Number.isFinite(value) ? NumberValueObject.create(value || 0) : ErrorValueObject.create(ErrorType.NUM);
}

function fDistributionFunction(rightTail: boolean, inverse = false) {
    return class ExcelFDistribution extends BaseFunction {
        override minParams = rightTail || inverse ? 3 : 4;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const x = coerceExcelDistributionNumber(cells[0]);
                if (x.isError()) return x;
                const first = coerceExcelDistributionNumber(cells[1]);
                if (first.isError()) return first;
                const second = coerceExcelDistributionNumber(cells[2]);
                if (second.isError()) return second;
                const cumulative = rightTail || inverse ? true : coerceExcelCumulative(cells[3]);
                if (typeof cumulative !== 'boolean') return cumulative;

                const value = Number(x.getValue());
                const d1 = Math.trunc(Number(first.getValue()));
                const d2 = Math.trunc(Number(second.getValue()));
                if (value < 0 || d1 < 1 || d2 < 1 || d1 > 1e10 || d2 > 1e10) return ErrorValueObject.create(ErrorType.NUM);
                if (inverse) return result(inverseProbability(value, d1, d2, rightTail));
                if (value === 0) return result(cumulative ? Number(rightTail) : d1 < 2 ? Number.NaN : Number(d1 === 2));
                if (!Number.isFinite(d1 * value)) return ErrorValueObject.create(cumulative ? ErrorType.DIV_BY_ZERO : ErrorType.NUM);
                return result(cumulative ? probability(value, d1 / 2, d2 / 2, rightTail) : density(value, d1, d2));
            });
        }
    };
}

function sample(input: BaseValueObject): number[] | ErrorValueObject {
    if (!input.isArray()) {
        if (input.isError()) return input as ErrorValueObject;
        return input.isNull() ? ErrorValueObject.create(ErrorType.VALUE) : [];
    }
    const array = input as ArrayValueObject;
    const values: number[] = [];
    let error: ErrorValueObject | undefined;
    array.iterator((cell) => {
        if (cell?.isError()) {
            error = cell as ErrorValueObject;
            return false;
        }
        if (cell?.isNumber()) values.push(Number(cell.getValue()));
        return true;
    });
    if (array.getRowCount() === 1 && array.getColumnCount() === 1 && array.getFirstCell().isNull()) {
        return ErrorValueObject.create(ErrorType.VALUE);
    }
    return error ?? values;
}

function sampleVariance(values: number[]): number {
    const mean = values.reduce((sum, value) => sum + value, 0) / values.length;
    let squares = 0;
    for (const value of values) {
        const difference = value - mean;
        const square = difference * difference;
        if (square >= MIN_NORMAL) squares += square;
    }
    return squares / (values.length - 1);
}

class ExcelFTest extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(first: BaseValueObject, second: BaseValueObject): BaseValueObject {
        const left = sample(first);
        if (left instanceof ErrorValueObject) return left;
        const right = sample(second);
        if (right instanceof ErrorValueObject) return right;
        if (left.length < 2 || right.length < 2) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        const leftVariance = sampleVariance(left);
        const rightVariance = sampleVariance(right);
        if (!Number.isFinite(leftVariance) || !Number.isFinite(rightVariance)) return ErrorValueObject.create(ErrorType.NUM);
        if (leftVariance < MIN_NORMAL || rightVariance < MIN_NORMAL) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);

        const larger = leftVariance >= rightVariance;
        const ratio = larger ? leftVariance / rightVariance : rightVariance / leftVariance;
        const a = ((larger ? left.length : right.length) - 1) / 2;
        const b = ((larger ? right.length : left.length) - 1) / 2;
        if (!Number.isFinite(ratio * (2 * a))) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
        const tail = probability(ratio, a, b, true);
        return result(2 * (tail <= 0.5 ? tail : probability(ratio, a, b, false)));
    }
}

const ExcelFDistRt = fDistributionFunction(true);
const ExcelFInvRt = fDistributionFunction(true, true);

export const excelFDistributionFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [fDistributionFunction(false), FUNCTION_NAMES_STATISTICAL.F_DIST],
    [ExcelFDistRt, FUNCTION_NAMES_STATISTICAL.F_DIST_RT],
    [ExcelFDistRt, FUNCTION_NAMES_COMPATIBILITY.FDIST],
    [fDistributionFunction(false, true), FUNCTION_NAMES_STATISTICAL.F_INV],
    [ExcelFInvRt, FUNCTION_NAMES_STATISTICAL.F_INV_RT],
    [ExcelFInvRt, FUNCTION_NAMES_COMPATIBILITY.FINV],
    [ExcelFTest, FUNCTION_NAMES_STATISTICAL.F_TEST],
    [ExcelFTest, FUNCTION_NAMES_COMPATIBILITY.FTEST],
];
