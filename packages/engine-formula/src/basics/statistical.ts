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

import type { ICellData, IObjectArrayPrimitiveType, IRowData, Nullable, ObjectMatrix } from '@univerjs/core';
import type { BaseReferenceObject, FunctionVariantType } from '../engine/reference-object/base-reference-object';
import type { MultiAreaReferenceObject } from '../engine/reference-object/multi-area-reference-object';
import type { ArrayValueObject } from '../engine/value-object/array-value-object';
import type { BaseValueObject } from '../engine/value-object/base-value-object';
import type { FormulaDataModel } from '../models/formula-data.model';
import { BooleanNumber, isRealNum } from '@univerjs/core';
import { createNewArray } from '../engine/utils/array-object';
import { ErrorValueObject } from '../engine/value-object/base-value-object';
import { NumberValueObject } from '../engine/value-object/primitive-object';
import { FUNCTION_NAMES_MATH } from '../functions/math/function-names';
import { erf, erfcINV } from './engineering';
import { ErrorType } from './error-type';
import { calculateCombin, calculateFactorial, calculateMmult, inverseMatrixByLUD, inverseMatrixByUSV, matrixTranspose } from './math';

export function betaCDF(x: number, alpha: number, beta: number): number {
    if (x <= 0) {
        return 0;
    }

    if (x >= 1) {
        return 1;
    }

    return incompleteBetaFunction(x, alpha, beta);
}

export function betaPDF(x: number, alpha: number, beta: number): number {
    if (x <= 0 || x >= 1) {
        return 0;
    }

    if (alpha === 1 && beta === 1) {
        return 1;
    }

    if (alpha < 512 && beta < 512) {
        return ((x ** (alpha - 1)) * ((1 - x) ** (beta - 1))) / betaFunction(alpha, beta);
    }

    return Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) - betaFunctionNaturalLogarithm(alpha, beta));
}

export function betaINV(probability: number, alpha: number, beta: number): number {
    if (probability <= 0) {
        return 0;
    }

    if (probability >= 1) {
        return 1;
    }

    const EPSILON = 1e-8;
    let x;

    if (alpha >= 1 && beta >= 1) {
        const p = (probability < 0.5) ? probability : 1 - probability;
        const temp = Math.sqrt(-2 * Math.log(p));

        x = (2.30753 + temp * 0.27061) / (1 + temp * (0.99229 + temp * 0.04481)) - temp;

        if (probability < 0.5) {
            x = -x;
        }

        const temp1 = (x * x - 3) / 6;
        const temp2 = 2 / (1 / (2 * alpha - 1) + 1 / (2 * beta - 1));
        const temp3 = (x * Math.sqrt(temp1 + temp2) / temp2) - (1 / (2 * beta - 1) - 1 / (2 * alpha - 1)) * (temp1 + 5 / 6 - 2 / (3 * temp2));

        x = alpha / (alpha + beta * Math.exp(2 * temp3));
    } else {
        const temp1 = Math.exp(alpha * Math.log(alpha / (alpha + beta))) / alpha;
        const temp2 = Math.exp(beta * Math.log(beta / (alpha + beta))) / beta;
        const temp3 = temp1 + temp2;

        if (probability < temp1 / temp3) {
            x = (alpha * temp3 * probability) ** (1 / alpha);
        } else {
            x = 1 - (beta * temp3 * (1 - probability)) ** (1 / beta);
        }
    }

    const betalnNeg = -betaFunctionNaturalLogarithm(alpha, beta);
    let ibeta, t, u;

    for (let j = 0; j < 10; j++) {
        if (x === 0 || x === 1) {
            return x;
        }

        ibeta = incompleteBetaFunction(x, alpha, beta) - probability;

        t = Math.exp((alpha - 1) * Math.log(x) + (beta - 1) * Math.log(1 - x) + betalnNeg);
        u = ibeta / t;
        x -= (t = u / (1 - 0.5 * Math.min(1, u * ((alpha - 1) / x - (beta - 1) / (1 - x)))));

        if (x <= 0) {
            x = 0.5 * (x + t);
        }

        if (x >= 1) {
            x = 0.5 * (x + t + 1);
        }

        if (Math.abs(t) < EPSILON * x && j > 0) {
            break;
        }
    }

    return x;
}

function incompleteBetaFunction(x: number, alpha: number, beta: number): number {
    const bt = (x === 0 || x === 1)
        ? 0
        : Math.exp(gammaln(alpha + beta) - gammaln(alpha) - gammaln(beta) + alpha * Math.log(x) + beta * Math.log(1 - x));

    if (x < (alpha + 1) / (alpha + beta + 2)) {
        return bt * betaContinuedFraction(x, alpha, beta) / alpha;
    }

    return 1 - bt * betaContinuedFraction(1 - x, beta, alpha) / beta;
}

function betaContinuedFraction(x: number, alpha: number, beta: number): number {
    const MAX_ITER = 100;
    const EPSILON = 1e-8;

    let d = 1 - (alpha + beta) * x / (alpha + 1);

    if (Math.abs(d) < EPSILON) {
        d = EPSILON;
    }

    d = 1 / d;

    let c = 1;
    let h = d;

    for (let m = 1; m <= MAX_ITER; m++) {
        let temp = m * (beta - m) * x / ((alpha - 1 + m * 2) * (alpha + m * 2));

        d = 1 + temp * d;

        if (Math.abs(d) < EPSILON) {
            d = EPSILON;
        }

        c = 1 + temp / c;

        if (Math.abs(c) < EPSILON) {
            c = EPSILON;
        }

        d = 1 / d;
        h *= d * c;

        temp = -(alpha + m) * (alpha + beta + m) * x / ((alpha + m * 2) * (alpha + 1 + m * 2));

        d = 1 + temp * d;

        if (Math.abs(d) < EPSILON) {
            d = EPSILON;
        }

        c = 1 + temp / c;

        if (Math.abs(c) < EPSILON) {
            c = EPSILON;
        }

        d = 1 / d;
        h *= d * c;

        if (Math.abs(d * c - 1) < EPSILON) {
            break;
        }
    }

    return h;
}

function betaFunction(alpha: number, beta: number): number {
    if (alpha + beta > 170) {
        return Math.exp(betaFunctionNaturalLogarithm(alpha, beta));
    }

    return gamma(alpha) * gamma(beta) / gamma(alpha + beta);
}

function betaFunctionNaturalLogarithm(alpha: number, beta: number): number {
    return gammaln(alpha) + gammaln(beta) - gammaln(alpha + beta);
}

export function binomialCDF(x: number, trials: number, probability: number): number {
    if (x < 0) {
        return 0;
    }

    if (x >= trials) {
        return 1;
    }

    if (probability < 0 || probability > 1 || trials <= 0) {
        return Number.NaN;
    }

    let result = 0;

    for (let i = 0; i <= x; i++) {
        result += binomialPDF(i, trials, probability);
    }

    return result;
}

export function binomialPDF(x: number, trials: number, probability: number): number {
    if (probability === 0 || probability === 1) {
        if (trials * probability === x) {
            return 1;
        }

        return 0;
    }

    return calculateCombin(trials, x) * (probability ** x) * ((1 - probability) ** (trials - x));
}

export function chisquareCDF(x: number, degFreedom: number): number {
    if (x <= 0) {
        return 0;
    }

    return lowRegGamma(degFreedom / 2, x / 2);
}

export function chisquarePDF(x: number, degFreedom: number): number {
    if (x < 0) {
        return 0;
    }

    if (x === 0 && degFreedom === 2) {
        return 0.5;
    }

    return Math.exp((degFreedom / 2 - 1) * Math.log(x) - x / 2 - (degFreedom / 2) * Math.log(2) - gammaln(degFreedom / 2));
}

export function chisquareINV(probability: number, degFreedom: number): number {
    if (probability <= 0) {
        return 0;
    }

    if (probability >= 1) {
        return Infinity;
    }

    return 2 * lowRegGammaInverse(probability, degFreedom / 2);
}

export function centralFCDF(x: number, degFreedom1: number, degFreedom2: number): number {
    if (x < 0) {
        return 0;
    }

    return incompleteBetaFunction((degFreedom1 * x) / (degFreedom1 * x + degFreedom2), degFreedom1 / 2, degFreedom2 / 2);
}

export function centralFPDF(x: number, degFreedom1: number, degFreedom2: number): number {
    if (x < 0) {
        return 0;
    }

    if (x === 0 && degFreedom1 < 2) {
        return Infinity;
    }

    if (x === 0 && degFreedom1 === 2) {
        return 1;
    }

    let result = 1 / betaFunction(degFreedom1 / 2, degFreedom2 / 2);
    result *= (degFreedom1 / degFreedom2) ** (degFreedom1 / 2);
    result *= x ** ((degFreedom1 / 2) - 1);
    result *= (1 + (degFreedom1 / degFreedom2) * x) ** (-(degFreedom1 + degFreedom2) / 2);

    return result;
}

export function centralFINV(probability: number, degFreedom1: number, degFreedom2: number): number {
    if (probability <= 0) {
        return 0;
    }

    if (probability >= 1) {
        return Infinity;
    }

    return degFreedom2 / (degFreedom1 * (1 / betaINV(probability, degFreedom1 / 2, degFreedom2 / 2) - 1));
}

export function exponentialCDF(x: number, lambda: number): number {
    if (x < 0) {
        return 0;
    }

    return 1 - Math.exp(-lambda * x);
}

export function exponentialPDF(x: number, lambda: number): number {
    if (x < 0) {
        return 0;
    }

    return lambda * Math.exp(-lambda * x);
}

export function forecastLinear(x: number, knownYs: number[], knownXs: number[]): number {
    const n = knownYs.length;

    let knownYsSum = 0;
    let knownXsSum = 0;

    for (let i = 0; i < n; i++) {
        knownYsSum += knownYs[i];
        knownXsSum += knownXs[i];
    }

    const knownYsMean = knownYsSum / n;
    const knownXsMean = knownXsSum / n;

    let num = 0;
    let den = 0;

    for (let i = 0; i < n; i++) {
        num += (knownYs[i] - knownYsMean) * (knownXs[i] - knownXsMean);
        den += (knownXs[i] - knownXsMean) ** 2;
    }

    if (den === 0) {
        return Infinity;
    }

    const b = num / den;
    const a = knownYsMean - b * knownXsMean;

    return a + b * x;
}

export function gamma(x: number): number {
    const p = [
        -1.716185138865495,
        24.76565080557592,
        -379.80425647094563,
        629.3311553128184,
        866.9662027904133,
        -31451.272968848367,
        -36144.413418691176,
        66456.14382024054,
    ];
    const q = [
        -30.8402300119739,
        315.35062697960416,
        -1015.1563674902192,
        -3107.771671572311,
        // eslint-disable-next-line no-loss-of-precision
        22538.118420980151,
        // eslint-disable-next-line no-loss-of-precision
        4755.8462775278811,
        -134659.9598649693,
        -115132.2596755535,
    ];

    let fact = 0;
    let y = x;

    if (x > 171.6243769536076) {
        return Infinity;
    }

    if (y <= 0) {
        const resMod = y % 1 + 3.6e-16;

        if (resMod) {
            fact = (!(y & 1) ? 1 : -1) * Math.PI / Math.sin(Math.PI * resMod);
            y = 1 - y;
        } else {
            return Infinity;
        }
    }

    const yi = y;
    let n = 0;
    let z;

    if (y < 1) {
        z = y++;
    } else {
        z = (y -= n = (y | 0) - 1) - 1;
    }

    let xnum = 0;
    let xden = 0;

    for (let i = 0; i < 8; ++i) {
        xnum = (xnum + p[i]) * z;
        xden = xden * z + q[i];
    }

    let res = xnum / xden + 1;

    if (yi < y) {
        res /= yi;
    } else if (yi > y) {
        for (let i = 0; i < n; ++i) {
            res *= y;
            y++;
        }
    }

    if (fact) {
        res = fact / res;
    }

    return res;
}

export function gammaCDF(x: number, alpha: number, beta: number): number {
    if (x <= 0) {
        return 0;
    }

    return lowRegGamma(alpha, x / beta);
}

export function gammaPDF(x: number, alpha: number, beta: number): number {
    if (x < 0) {
        return 0;
    }

    if (x === 0 && alpha === 1) {
        return 1 / beta;
    }

    return Math.exp((alpha - 1) * Math.log(x) - x / beta - gammaln(alpha) - alpha * Math.log(beta));
}

export function gammaINV(probability: number, alpha: number, beta: number): number {
    if (probability <= 0) {
        return 0;
    }

    if (probability >= 1) {
        return Infinity;
    }

    return beta * lowRegGammaInverse(probability, alpha);
}

export function gammaln(x: number): number {
    const coefficients = [
        76.18009172947146, -86.50532032941677, 24.01409824083091, // eslint-disable-line
        -1.231739572450155,
        0.1208650973866179e-2,
        -0.5395239384953e-5,
    ];

    let y = x;
    let tmp = x + 5.5;
    tmp -= (x + 0.5) * Math.log(tmp);
    let ser = 1.000000000190015;

    for (let j = 0; j < 6; j++) {
        ser += coefficients[j] / ++y;
    }

    return -tmp + Math.log(2.5066282746310005 * ser / x);  // eslint-disable-line
}

function lowRegGamma(a: number, x: number): number {
    if (x < 0 || a <= 0) {
        return Number.NaN;
    }

    const EPSILON = 1e-30;

    // calculate maximum number of itterations required for a
    const MAX_ITER = -~(Math.log((a >= 1) ? a : 1 / a) * 8.5 + a * 0.4 + 17);
    const aln = gammaln(a);
    const exp = Math.exp(-x + a * Math.log(x) - aln);

    let _a = a;
    let sum = 1 / a;
    let del = sum;

    if (x < a + 1) {
        if (exp === 0) {
            return 0;
        }

        for (let i = 1; i <= MAX_ITER; i++) {
            sum += del *= x / ++_a;

            if (Math.abs(del) < Math.abs(sum) * EPSILON) {
                break;
            }
        }

        return sum * exp;
    }

    if (exp === 0) {
        return 1;
    }

    let b = x + 1 - a;
    let c = 1 / EPSILON;
    let d = 1 / b;
    let h = d;

    for (let i = 1; i <= MAX_ITER; i++) {
        const temp = -i * (i - a);

        b += 2;
        d = temp * d + b;

        if (Math.abs(d) < EPSILON) {
            d = EPSILON;
        }

        c = b + temp / c;

        if (Math.abs(c) < EPSILON) {
            c = EPSILON;
        }

        d = 1 / d;
        h *= d * c;

        if (Math.abs(d * c - 1) < EPSILON) {
            break;
        }
    }

    return 1 - h * exp;
};

function lowRegGammaInverse(p: number, a: number): number {
    if (p <= 0) {
        return 0;
    }

    if (p >= 1) {
        return Math.max(100, a + 100 * Math.sqrt(a));
    }

    let x;

    if (a > 1) {
        const _p = (p < 0.5) ? p : 1 - p;
        const temp = Math.sqrt(-2 * Math.log(_p));

        x = (2.30753 + temp * 0.27061) / (1 + temp * (0.99229 + temp * 0.04481)) - temp;

        if (p < 0.5) {
            x = -x;
        }

        x = Math.max(1e-3, a * ((1 - 1 / (9 * a) - x / (3 * Math.sqrt(a))) ** 3));
    } else {
        const temp = 1 - a * (0.253 + a * 0.12);

        if (p < temp) {
            x = (p / temp) ** (1 / a);
        } else {
            x = 1 - Math.log(1 - (p - temp) / (1 - temp));
        }
    }

    const EPSILON = 1e-8;
    const aln = gammaln(a);

    let err, t;

    for (let j = 0; j < 12; j++) {
        if (x <= 0) {
            return 0;
        }

        err = lowRegGamma(a, x) - p;

        if (a > 1) {
            t = Math.exp((a - 1) * (Math.log(a - 1) - 1) - aln) * Math.exp(-(x - (a - 1)) + (a - 1) * (Math.log(x) - Math.log(a - 1)));
        } else {
            t = Math.exp(-x + (a - 1) * Math.log(x) - aln);
        }

        if (t !== 0) {
            t = (err / t) / (1 - 0.5 * Math.min(1, (err / t) * ((a - 1) / x - 1)));
        }

        x -= t;

        if (x <= 0) {
            x = 0.5 * (x + t);
        }

        if (Math.abs(t) < EPSILON * x) {
            break;
        }
    }

    return x;
}

export function hypergeometricCDF(x: number, n: number, M: number, N: number): number {
    let result = 0;

    for (let i = 0; i <= x; i++) {
        result += hypergeometricPDF(i, n, M, N);
    }

    return result;
}

export function hypergeometricPDF(x: number, n: number, M: number, N: number): number {
    if (n - x > N - M) {
        return 0;
    }

    return calculateCombin(M, x) * calculateCombin(N - M, n - x) / calculateCombin(N, n);
}

export function lognormalCDF(x: number, mean: number, standardDev: number): number {
    if (x < 0) {
        return 0;
    }

    return 0.5 + 0.5 * erf((Math.log(x) - mean) / Math.sqrt(2 * standardDev * standardDev));
}

export function lognormalPDF(x: number, mean: number, standardDev: number): number {
    if (x <= 0) {
        return 0;
    }

    return Math.exp(-Math.log(x) - 0.5 * Math.log(2 * Math.PI) - Math.log(standardDev) - ((Math.log(x) - mean) ** 2) / (2 * standardDev * standardDev));
}

export function lognormalINV(probability: number, mean: number, standardDev: number): number {
    return Math.exp(normalINV(probability, mean, standardDev));
}

export function negbinomialCDF(numberF: number, numberS: number, probabilityS: number): number {
    if (numberF < 0) {
        return 0;
    }

    let result = 0;

    for (let i = 0; i <= numberF; i++) {
        result += negbinomialPDF(i, numberS, probabilityS);
    }

    return result;
}

export function negbinomialPDF(numberF: number, numberS: number, probabilityS: number): number {
    if (numberF < 0) {
        return 0;
    }

    return calculateCombin(numberF + numberS - 1, numberS - 1) * (probabilityS ** numberS) * ((1 - probabilityS) ** numberF);
}

export function normalCDF(x: number, mean: number, standardDev: number): number {
    return 0.5 * (1 + erf((x - mean) / Math.sqrt(2 * standardDev * standardDev)));
}

export function normalPDF(x: number, mean: number, standardDev: number): number {
    return Math.exp(-0.5 * Math.log(2 * Math.PI) - Math.log(standardDev) - (x - mean) ** 2 / (2 * standardDev * standardDev));
}

export function normalINV(probability: number, mean: number, standardDev: number): number {
    // eslint-disable-next-line
    return -1.41421356237309505 * standardDev * erfcINV(2 * probability) + mean;
}

export function poissonCDF(x: number, mean: number): number {
    let result = 0;

    for (let i = 0; i <= x; i++) {
        result += poissonPDF(i, mean);
    }

    return result;
}

export function poissonPDF(x: number, mean: number): number {
    return Math.exp(-mean) * (mean ** x) / calculateFactorial(x);
}

export function studentTCDF(x: number, degFreedom: number): number {
    const result = 0.5 * incompleteBetaFunction(degFreedom / (x ** 2 + degFreedom), degFreedom / 2, 0.5);

    return x < 0 ? result : 1 - result;
}

export function studentTPDF(x: number, degFreedom: number): number {
    const pow = (1 + (x ** 2) / degFreedom) ** (-(degFreedom + 1) / 2);

    return 1 / (Math.sqrt(degFreedom) * betaFunction(0.5, degFreedom / 2)) * pow;
}

export function studentTINV(probability: number, degFreedom: number): number {
    let x = betaINV(2 * Math.min(probability, 1 - probability), 0.5 * degFreedom, 0.5);
    x = Math.sqrt(degFreedom * (1 - x) / x);

    return (probability > 0.5) ? x : -x;
}

export function getTwoArrayNumberValues(
    array1: BaseValueObject,
    array2: BaseValueObject,
    count: number,
    array1ColumnCount: number,
    array2ColumnCount: number
) {
    const array1Values: number[] = [];
    const array2Values: number[] = [];
    let noCalculate = true;

    for (let i = 0; i < count; i++) {
        const array1RowIndex = Math.floor(i / array1ColumnCount);
        const array1ColumnIndex = i % array1ColumnCount;

        const array2RowIndex = Math.floor(i / array2ColumnCount);
        const array2ColumnIndex = i % array2ColumnCount;

        const array1Object = array1.isArray() ? (array1 as ArrayValueObject).get(array1RowIndex, array1ColumnIndex) as BaseValueObject : array1;
        const array2Object = array2.isArray() ? (array2 as ArrayValueObject).get(array2RowIndex, array2ColumnIndex) as BaseValueObject : array2;

        if (array1Object.isError()) {
            return {
                isError: true,
                errorObject: array1Object as ErrorValueObject,
                array1Values,
                array2Values,
                noCalculate,
            };
        }

        if (array2Object.isError()) {
            return {
                isError: true,
                errorObject: array2Object as ErrorValueObject,
                array1Values,
                array2Values,
                noCalculate,
            };
        }

        if (array1Object.isNull() || array2Object.isNull() || array1Object.isBoolean() || array2Object.isBoolean()) {
            continue;
        }

        const array1Value = array1Object.getValue();
        const array2Value = array2Object.getValue();

        if (!isRealNum(array1Value) || !isRealNum(array2Value)) {
            continue;
        }

        array1Values.push(+array1Value);
        array2Values.push(+array2Value);
        noCalculate = false;
    }

    return {
        isError: false,
        errorObject: null,
        array1Values,
        array2Values,
        noCalculate,
    };
}

// eslint-disable-next-line
export function checkKnownsArrayDimensions(knownYs: BaseValueObject, knownXs?: BaseValueObject, newXs?: BaseValueObject) {
    const knownYsRowCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getRowCount() : 1;
    const knownYsColumnCount = knownYs.isArray() ? (knownYs as ArrayValueObject).getColumnCount() : 1;

    let knownXsRowCount = knownYsRowCount;
    let knownXsColumnCount = knownYsColumnCount;

    if (knownXs && !knownXs.isNull()) {
        knownXsRowCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getRowCount() : 1;
        knownXsColumnCount = knownXs.isArray() ? (knownXs as ArrayValueObject).getColumnCount() : 1;

        if (
            (knownYsRowCount === 1 && (knownXsColumnCount !== knownYsColumnCount)) ||
            (knownYsColumnCount === 1 && knownXsRowCount !== knownYsRowCount) ||
            (knownYsRowCount !== 1 && knownYsColumnCount !== 1 && (knownXsRowCount !== knownYsRowCount || knownXsColumnCount !== knownYsColumnCount))
        ) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.REF),
            };
        }
    }

    if (newXs && !newXs.isNull()) {
        const newXsRowCount = newXs.isArray() ? (newXs as ArrayValueObject).getRowCount() : 1;
        const newXsColumnCount = newXs.isArray() ? (newXs as ArrayValueObject).getColumnCount() : 1;

        if (
            (knownYsRowCount === 1 && knownXsRowCount > 1 && newXsRowCount !== knownXsRowCount) ||
            (knownYsColumnCount === 1 && knownXsColumnCount > 1 && newXsColumnCount !== knownXsColumnCount)
        ) {
            return {
                isError: true,
                errorObject: ErrorValueObject.create(ErrorType.REF),
            };
        }
    }

    return {
        isError: false,
        errorObject: null,
    };
}

export function getKnownsArrayValues(array: BaseValueObject): number[][] | ErrorValueObject {
    const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
    const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

    const values: number[][] = [];

    for (let r = 0; r < rowCount; r++) {
        values[r] = [];

        for (let c = 0; c < columnCount; c++) {
            const valueObject = array.isArray() ? (array as ArrayValueObject).get(r, c) as BaseValueObject : array;

            if (valueObject.isError() || valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            values[r].push(+valueObject.getValue());
        }
    }

    return values;
}

export function getSerialNumbersByRowsColumns(rowCount: number, columnCount: number): number[][] {
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

export function getSlopeAndIntercept(knownXsValues: number[], knownYsValues: number[], constb: number, isExponentialTransform: boolean) {
    let Y = knownYsValues;

    if (isExponentialTransform) {
        Y = knownYsValues.map((value) => Math.log(value));
    }

    let slope, intercept;

    if (constb) {
        ({ slope, intercept } = getSlopeAndInterceptOfConstbIsTrue(knownXsValues, Y));
    } else {
        ({ slope, intercept } = getSlopeAndInterceptOfConstbIsFalse(knownXsValues, Y));
    }

    if (isExponentialTransform) {
        slope = Math.exp(slope);
        intercept = Math.exp(intercept);
    }

    if (Number.isNaN(slope) && !constb) {
        slope = 0;
    }

    return { slope, intercept, Y };
}

function getSlopeAndInterceptOfConstbIsTrue(knownXsValues: number[], knownYsValues: number[]) {
    const n = knownYsValues.length;

    let sumX = 0;
    let sumY = 0;
    let sumX2 = 0;
    let sumXY = 0;

    for (let i = 0; i < n; i++) {
        sumX += knownXsValues[i];
        sumY += knownYsValues[i];
        sumX2 += knownXsValues[i] * knownXsValues[i];
        sumXY += knownXsValues[i] * knownYsValues[i];
    }

    const temp = n * sumXY - sumX * sumY;
    const slope = temp / (n * sumX2 - sumX * sumX);
    const intercept = 1 / n * sumY - slope * (1 / n) * sumX;

    return {
        slope,
        intercept,
    };
}

function getSlopeAndInterceptOfConstbIsFalse(knownXsValues: number[], knownYsValues: number[]) {
    const matrixX = [[...knownXsValues]];
    const matrixY = [...knownYsValues];

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
        slope: result[0],
        intercept: 0,
    };
}

export function getKnownsArrayCoefficients(knownYsValues: number[][], knownXsValues: number[][], newXsValues: number[][], constb: number, isExponentialTransform: boolean) {
    const isOneRow = knownYsValues.length === 1 && knownYsValues[0].length > 1;

    let Y = knownYsValues;

    if (isExponentialTransform) {
        Y = knownYsValues.map((row) => row.map((value) => Math.log(value)));
    }

    let X = knownXsValues;
    let newX = newXsValues;

    if (isOneRow) {
        Y = matrixTranspose(Y);
        X = matrixTranspose(X);
        newX = matrixTranspose(newX);
    }

    if (constb) {
        X = X.map((row) => [...row, 1]);
    }

    const XT = matrixTranspose(X);
    const XTX = calculateMmult(XT, X);
    const XTY = calculateMmult(XT, Y);

    let XTXInverse = inverseMatrixByLUD(XTX);

    if (!XTXInverse) {
        XTXInverse = inverseMatrixByUSV(XTX);

        if (!XTXInverse) {
            return ErrorValueObject.create(ErrorType.NA);
        }
    }

    let coefficients = calculateMmult(XTXInverse, XTY);

    if (!constb) {
        coefficients.push([0]);
    }

    coefficients = matrixTranspose(coefficients);

    const pop = coefficients[0].pop() as number;

    coefficients[0].reverse();
    coefficients[0].push(pop);

    if (isExponentialTransform) {
        for (let i = 0; i < coefficients[0].length; i++) {
            coefficients[0][i] = Math.exp(coefficients[0][i]);
        }
    }

    return {
        coefficients,
        Y,
        X,
        newX,
        XTXInverse,
    };
}

//#region Aggregate functions

/**
 * Parse aggregate data references into multi-area refs and normal refs, currently only used in functions like SUBTOTAL and AGGREGATE.
 * If there is any invalid reference, return isError as true.
 */
export function parseAggregateDataRefs(refs: FunctionVariantType[]) {
    const multiAreaRefs: MultiAreaReferenceObject[] = [];
    const normalRefs: BaseReferenceObject[] = [];

    let isError = false;

    for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];

        if (ref.isReferenceObject()) {
            if ((ref as BaseReferenceObject).isMultiArea()) {
                multiAreaRefs.push(ref as MultiAreaReferenceObject);
            } else {
                normalRefs.push(ref as BaseReferenceObject);
            }
        } else {
            isError = true;
            break;
        }
    }

    return {
        isError,
        multiAreaRefs,
        normalRefs,
    };
}

export enum AggregateFunctionType {
    AVERAGE = 'AVERAGE',
    COUNT = 'COUNT',
    COUNTA = 'COUNTA',
    MAX = 'MAX',
    MIN = 'MIN',
    PRODUCT = 'PRODUCT',
    STDEV = 'STDEV',
    STDEV_S = 'STDEV.S',
    STDEVP = 'STDEVP',
    STDEV_P = 'STDEV.P',
    SUM = 'SUM',
    VAR = 'VAR',
    VAR_S = 'VAR.S',
    VARP = 'VARP',
    VAR_P = 'VAR.P',
    MEDIAN = 'MEDIAN',
    MODE_SNGL = 'MODE.SNGL',
    // LARGE = 'LARGE',
    // SMALL = 'SMALL',
    // PERCENTILE_EXC = 'PERCENTILE.EXC',
    // PERCENTILE_INC = 'PERCENTILE.INC',
    // QUARTILE_EXC = 'QUARTILE.EXC',
    // QUARTILE_INC = 'QUARTILE.INC',
}

// Check if the row is hidden
function isRowHidden(rowData: IObjectArrayPrimitiveType<Partial<IRowData>>, rowIndex: number): boolean {
    const row = rowData[rowIndex];
    if (!row) {
        return false;
    }
    return row.hd === BooleanNumber.TRUE;
}

// Check if the cell is a nested SUBTOTAL or AGGREGATE result
function isNestedAggregateOrSubtotal(
    cellData: ObjectMatrix<ICellData>,
    rowIndex: number,
    columnIndex: number,
    sheetId: string,
    unitId: string,
    formulaDataModel: FormulaDataModel
): boolean {
    const cellValue = cellData.getValue(rowIndex, columnIndex);
    if (cellValue?.f || cellValue?.si) {
        const formulaString = formulaDataModel.getFormulaStringByCell(rowIndex, columnIndex, sheetId, unitId);
        // match 'SUBTOTAL(' or 'AGGREGATE(' for simple check
        if (formulaString && (formulaString.indexOf(`${FUNCTION_NAMES_MATH.SUBTOTAL}(`) > -1 || formulaString.indexOf(`${FUNCTION_NAMES_MATH.AGGREGATE}(`) > -1)) {
            return true;
        }
    }
    return false;
}

export type modeSnglValueCountMapType = Record<number, {
    count: number;
    order: number;
}>;

export function getModeSnglResult(valueCountMap: modeSnglValueCountMapType, valueMaxCount: number): BaseValueObject {
    const result = Object.entries(valueCountMap)
        .filter(([_, { count }]) => count === valueMaxCount)
        .sort((a, b) => a[1].order - b[1].order)
        .map(([value]) => +value);

    return NumberValueObject.create(result[0]);
}

export interface IAggregateIgnoreOptions {
    ignoreRowHidden: boolean; // whether to ignore hidden rows
    ignoreErrorValues: boolean; // whether to ignore error values
    ignoreNested: boolean; // whether to ignore nested SUBTOTAL or AGGREGATE results
}

// eslint-disable-next-line max-lines-per-function,complexity
export function getAggregateResult(
    options: {
        type: AggregateFunctionType; // type of aggregate function
        formulaDataModel: FormulaDataModel;
    } & IAggregateIgnoreOptions,
    refs: BaseReferenceObject[]
): BaseValueObject {
    const { type, ignoreRowHidden, ignoreErrorValues, ignoreNested, formulaDataModel } = options;
    const valueObjects: BaseValueObject[] = [];

    let count = 0;
    let counta = 0;
    let sum = 0;
    let n = 0;
    let max = 0;
    let min = 0;
    let product = 1;

    const valueCountMap: modeSnglValueCountMapType = {};
    let valueMaxCount = 1;
    let valueCountOrder = 0;

    for (let i = 0; i < refs.length; i++) {
        const ref = refs[i];

        const filteredOutRows = ref.getFilteredOutRows();
        const rowData = ref.getRowData();
        const unitId = ref.getUnitId();
        const sheetId = ref.getSheetId();
        const unitData = ref.getUnitData();
        const cellData = unitData[unitId]?.[sheetId]?.cellData;

        let errorValueObject: Nullable<BaseValueObject>;

        ref.iterator((valueObject, rowIndex, columnIndex) => {
            // Filtered rows are always excluded.
            if (filteredOutRows.includes(rowIndex)) {
                return true; // continue
            }

            if (ignoreRowHidden && isRowHidden(rowData, rowIndex)) {
                return true; // continue
            }

            if (ignoreNested && isNestedAggregateOrSubtotal(cellData, rowIndex, columnIndex, sheetId, unitId, formulaDataModel)) {
                return true; // continue
            }

            // COUNT function only counts number cells.
            if (type === AggregateFunctionType.COUNT) {
                if (valueObject?.isNumber()) count++;
                return true; // continue
            }

            // COUNTA function counts all non-blank cells.
            if (type === AggregateFunctionType.COUNTA) {
                if (valueObject !== null && valueObject !== undefined && !valueObject.isNull()) counta++;
                return true; // continue
            }

            if (valueObject?.isError()) {
                if (ignoreErrorValues) return true; // continue
                // If the value is error, return directly.
                errorValueObject = valueObject;
                return false; // break
            }

            // 'test', ' ',  blank cell, TRUE and FALSE are ignored
            if (!valueObject || valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                return true; // continue
            }

            let value = valueObject.getValue();

            if (!isRealNum(value)) {
                return true; // continue
            }

            value = +value;
            n++;

            if (type === AggregateFunctionType.MAX) {
                max = n === 1 ? value : Math.max(max, value);
                return true; // continue
            }

            if (type === AggregateFunctionType.MIN) {
                min = n === 1 ? value : Math.min(min, value);
                return true; // continue
            }

            if (type === AggregateFunctionType.MODE_SNGL) {
                if (!valueCountMap[value]) {
                    valueCountMap[value] = { count: 1, order: valueCountOrder++ };
                } else {
                    valueCountMap[value].count++;
                    if (valueCountMap[value].count > valueMaxCount) {
                        valueMaxCount = valueCountMap[value].count;
                    }
                }
                return true; // continue
            }

            sum += value;
            product *= value;
            valueObjects.push(valueObject);
        });

        if (errorValueObject?.isError()) {
            return errorValueObject;
        }
    }

    switch (type) {
        case AggregateFunctionType.AVERAGE:
            if (n === 0) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            return NumberValueObject.create(sum / n);
        case AggregateFunctionType.COUNT:
            return NumberValueObject.create(count);
        case AggregateFunctionType.COUNTA:
            return NumberValueObject.create(counta);
        case AggregateFunctionType.MAX:
            return NumberValueObject.create(max);
        case AggregateFunctionType.MIN:
            return NumberValueObject.create(min);
        case AggregateFunctionType.PRODUCT:
            return NumberValueObject.create(n === 0 ? 0 : product);
        case AggregateFunctionType.STDEV:
        case AggregateFunctionType.STDEV_S:
            if (n < 2) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            return createNewArray([valueObjects], 1, n).std(1);
        case AggregateFunctionType.STDEVP:
        case AggregateFunctionType.STDEV_P:
            if (n === 0) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            return createNewArray([valueObjects], 1, n).std();
        case AggregateFunctionType.SUM:
            return NumberValueObject.create(sum);
        case AggregateFunctionType.VAR:
        case AggregateFunctionType.VAR_S:
            if (n < 2) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            return createNewArray([valueObjects], 1, n).var(1);
        case AggregateFunctionType.VARP:
        case AggregateFunctionType.VAR_P:
            if (n === 0) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            return createNewArray([valueObjects], 1, n).var();
        case AggregateFunctionType.MEDIAN:
            if (n === 0) return ErrorValueObject.create(ErrorType.NUM);
            return getMedianResult(valueObjects.map((vo) => +vo.getValue()));
        case AggregateFunctionType.MODE_SNGL:
            if (valueCountOrder === 0 || valueMaxCount === 1) return ErrorValueObject.create(ErrorType.NA);
            return getModeSnglResult(valueCountMap, valueMaxCount);
        default:
            return ErrorValueObject.create(ErrorType.VALUE);
    }
}

// eslint-disable-next-line max-lines-per-function,complexity
export function getArrayValuesByAggregateIgnoreOptions(
    array: FunctionVariantType,
    options?: IAggregateIgnoreOptions,
    formulaDataModel?: FormulaDataModel
): number[] | ErrorValueObject {
    const { ignoreRowHidden = false, ignoreErrorValues = false, ignoreNested = false } = options ?? {};
    const values: number[] = [];

    if (array.isReferenceObject()) {
        const filteredOutRows = (array as BaseReferenceObject).getFilteredOutRows();
        const rowData = (array as BaseReferenceObject).getRowData();
        const unitId = (array as BaseReferenceObject).getUnitId();
        const sheetId = (array as BaseReferenceObject).getSheetId();
        const unitData = (array as BaseReferenceObject).getUnitData();
        const cellData = unitData[unitId]?.[sheetId]?.cellData;

        let errorValueObject: Nullable<BaseValueObject>;

        (array as BaseReferenceObject).iterator((valueObject, rowIndex, columnIndex) => {
            // Filtered rows are always excluded.
            if (filteredOutRows.includes(rowIndex)) {
                return true; // continue
            }

            if (ignoreRowHidden && isRowHidden(rowData, rowIndex)) {
                return true; // continue
            }

            if (valueObject?.isError()) {
                if (ignoreErrorValues) return true; // continue
                // If the value is error, return directly.
                errorValueObject = valueObject;
                return false; // break
            }

            if (ignoreNested && formulaDataModel && isNestedAggregateOrSubtotal(cellData, rowIndex, columnIndex, sheetId, unitId, formulaDataModel)) {
                return true; // continue
            }

            if (!valueObject || valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                return true; // continue
            }

            const value = valueObject.getValue();

            if (!isRealNum(value)) {
                return true; // continue
            }

            values.push(+value);
        });

        if (errorValueObject) {
            return errorValueObject as ErrorValueObject;
        }
    } else {
        const rowCount = array.isArray() ? (array as ArrayValueObject).getRowCount() : 1;
        const columnCount = array.isArray() ? (array as ArrayValueObject).getColumnCount() : 1;

        for (let r = 0; r < rowCount; r++) {
            for (let c = 0; c < columnCount; c++) {
                const valueObject = (array.isArray() ? (array as ArrayValueObject).get(r, c) : array) as BaseValueObject;

                if (valueObject.isError()) {
                    if (ignoreErrorValues) continue;
                    return valueObject as ErrorValueObject;
                }

                if (!valueObject || valueObject.isNull() || valueObject.isBoolean() || valueObject.isString()) {
                    continue;
                }

                const value = valueObject.getValue();

                if (!isRealNum(value)) {
                    continue;
                }

                values.push(+value);
            }
        }
    }

    if (values.length === 0) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    return values;
}

// MEDIAN(array): returns the median of the given numbers.
export function getMedianResult(array: number[]): BaseValueObject {
    const n = array.length;

    array.sort((a, b) => a - b);

    let result: number;

    if (n % 2 === 0) {
        const mid = n / 2;
        result = (array[mid - 1] + array[mid]) / 2;
    } else {
        result = array[Math.floor(n / 2)];
    }

    return NumberValueObject.create(result);
}

// LARGE(array, k): returns the k-th largest value in a data set.
export function getLargeResult(array: number[], k: number): BaseValueObject {
    if (k < 1 || k > array.length) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    array.sort((a, b) => b - a);

    const _k = Math.ceil(k);

    return NumberValueObject.create(array[_k - 1]);
}

// SMALL(array, k): returns the k-th smallest value in a data set.
export function getSmallResult(array: number[], k: number): BaseValueObject {
    if (k < 1 || k > array.length) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    array.sort((a, b) => a - b);

    const _k = Math.floor(k);

    return NumberValueObject.create(array[_k - 1]);
}

// PERCENTILE.INC(array, k): returns the k-th percentile of values in a range, where k is in the range 0..1, inclusive.
export function getPercentileIncResult(array: number[], k: number): BaseValueObject {
    const n = array.length;

    if (k < 0 || k > 1) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    array.sort((a, b) => a - b);

    const kIndex = k * (n - 1);
    const integerPart = Math.floor(kIndex);
    const fractionPart = kIndex - integerPart;

    if (fractionPart === 0) {
        return NumberValueObject.create(array[integerPart]);
    }

    const result = array[integerPart] + fractionPart * (array[integerPart + 1] - array[integerPart]);

    return NumberValueObject.create(result);
}

// PERCENTILE.EXC(array, k): returns the k-th percentile of values in a range, where k is in the range 0..1, exclusive.
export function getPercentileExcResult(array: number[], k: number): BaseValueObject {
    const n = array.length;

    if (k < 1 / (n + 1) || k > 1 - 1 / (n + 1)) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    array.sort((a, b) => a - b);

    const kIndex = k * (n + 1) - 1;
    const integerPart = Math.floor(kIndex);
    const fractionPart = kIndex - integerPart;

    if (fractionPart === 0) {
        return NumberValueObject.create(array[integerPart]);
    }

    const result = array[integerPart] + fractionPart * (array[integerPart + 1] - array[integerPart]);

    return NumberValueObject.create(result);
}

// QUARTILE.INC(array, quart): returns the quartile of a data set, based on percentile values from 0..1, inclusive.
export function getQuartileIncResult(array: number[], quart: number): BaseValueObject {
    const n = array.length;

    if (quart < 0 || quart > 4) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    array.sort((a, b) => a - b);

    const k = quart / 4;
    const kIndex = k * (n - 1);
    const integerPart = Math.floor(kIndex);
    const fractionPart = kIndex - integerPart;

    if (fractionPart === 0) {
        return NumberValueObject.create(array[integerPart]);
    }

    const result = array[integerPart] + fractionPart * (array[integerPart + 1] - array[integerPart]);

    return NumberValueObject.create(result);
}

// QUARTILE.EXC(array, quart): returns the quartile of a data set, based on percentile values from 0..1, exclusive.
export function getQuartileExcResult(array: number[], quart: number): BaseValueObject {
    const n = array.length;

    if (quart <= 0 || quart >= 4) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    array.sort((a, b) => a - b);

    const k = quart / 4;

    if (k < 1 / (n + 1) || k > 1 - 1 / (n + 1)) {
        return ErrorValueObject.create(ErrorType.NUM);
    }

    const kIndex = k * (n + 1) - 1;
    const integerPart = Math.floor(kIndex);
    const fractionPart = kIndex - integerPart;

    if (fractionPart === 0) {
        return NumberValueObject.create(array[integerPart]);
    }

    const result = array[integerPart] + fractionPart * (array[integerPart + 1] - array[integerPart]);

    return NumberValueObject.create(result);
}

//#endregion
