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
import { binomialCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class BinomInv extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(
        trials: BaseValueObject,
        probabilityS: BaseValueObject,
        alpha: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getRowCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getColumnCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1
        );

        const trialsArray = expandArrayValueObject(maxRowLength, maxColumnLength, trials, ErrorValueObject.create(ErrorType.NA));
        const probabilitySArray = expandArrayValueObject(maxRowLength, maxColumnLength, probabilityS, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));

        const resultArray = trialsArray.mapValue((trialsObject, rowIndex, columnIndex) => {
            const probabilitySObject = probabilitySArray.get(rowIndex, columnIndex) as BaseValueObject;
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (trialsObject.isError()) {
                return trialsObject;
            }

            if (probabilitySObject.isError()) {
                return probabilitySObject;
            }

            if (alphaObject.isError()) {
                return alphaObject;
            }

            return this._handleSingleObject(trialsObject, probabilitySObject, alphaObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(
        trialsObject: BaseValueObject,
        probabilitySObject: BaseValueObject,
        alphaObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(trialsObject, probabilitySObject, alphaObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_trialsObject, _probabilitySObject, _alphaObject] = variants as BaseValueObject[];

        const trialsValue = Math.floor(+_trialsObject.getValue());
        const probabilitySValue = +_probabilitySObject.getValue();
        const alphaValue = +_alphaObject.getValue();

        if (trialsValue < 0 || probabilitySValue <= 0 || probabilitySValue >= 1 || alphaValue <= 0 || alphaValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const quantile = findBinomialQuantile(trialsValue, probabilitySValue, alphaValue);
        if (quantile !== undefined) {
            return Number.isFinite(quantile)
                ? NumberValueObject.create(quantile)
                : ErrorValueObject.create(ErrorType.NUM);
        }

        let result = 0;

        while (result <= trialsValue) {
            if (binomialCDF(result, trialsValue, probabilitySValue) >= alphaValue) {
                break;
            }

            result++;
        }

        return NumberValueObject.create(result);
    }
}

function findBinomialQuantile(trials: number, probability: number, alpha: number): number | undefined {
    if (!Number.isSafeInteger(trials) || !Number.isFinite(probability) || !Number.isFinite(alpha)) {
        return undefined;
    }

    const direct = searchBinomialQuantile(trials, (successes) => {
        const cdf = binomialCDF(successes, trials, probability);
        return Number.isFinite(cdf) ? cdf >= alpha : undefined;
    });
    if (direct !== undefined) {
        return direct;
    }

    // Restart the bracket when the direct combination sum overflows: its
    // accumulated rounding error can place the previous lower bound too high.
    return searchBinomialQuantile(trials, (successes) => {
        const upperTail = alpha > 0.5;
        const probabilityAtSuccesses = upperTail
            ? binomialBetaTail(probability, 1 - probability, successes + 1, trials - successes)
            : binomialBetaTail(1 - probability, probability, trials - successes, successes + 1);
        if (!Number.isFinite(probabilityAtSuccesses)) {
            return undefined;
        }

        // P(X <= k) = I_(1-p)(n-k, k+1); compare its complement directly
        // near alpha = 1 so subtracting a small tail does not lose precision.
        return upperTail ? probabilityAtSuccesses <= 1 - alpha : probabilityAtSuccesses >= alpha;
    }) ?? Number.NaN;
}

function searchBinomialQuantile(trials: number, reachesAlpha: (successes: number) => boolean | undefined): number | undefined {
    const atZero = reachesAlpha(0);
    if (atZero === undefined) {
        return undefined;
    }
    if (atZero) {
        return 0;
    }

    let lower = 0;
    let upper = Math.min(1, trials);

    while (upper < trials) {
        const reached = reachesAlpha(upper);
        if (reached === undefined) {
            return undefined;
        }
        if (reached) {
            break;
        }
        lower = upper;
        upper = Math.min(2 * upper, trials);
    }

    while (upper - lower > 1) {
        const middle = lower + Math.floor((upper - lower) / 2);
        const reached = reachesAlpha(middle);
        if (reached === undefined) {
            return undefined;
        }
        if (reached) {
            upper = middle;
        } else {
            lower = middle;
        }
    }

    return upper;
}

// https://dlmf.nist.gov/8.17#E22, with the complementary tail chosen for convergence.
// This private path must converge before its value can bracket an integer
// quantile; the shared Beta helper's fixed 100 iterations are insufficient
// near the median for large trial counts.
function binomialBetaTail(x: number, complement: number, a: number, b: number): number {
    if (x === 0.5 && a === b) {
        return 0.5;
    }

    const complemented = x >= (a + 1) / (a + b + 2);
    const first = complemented ? b : a;
    const second = complemented ? a : b;
    const probability = complemented ? complement : x;
    const logFactor = binomialBetaLogFactor(x, complement, a, b);
    if (logFactor === Number.NEGATIVE_INFINITY) {
        return complemented ? 1 : 0;
    }

    const minimum = Number.MIN_VALUE / Number.EPSILON;
    const nonzero = (value: number) => Math.abs(value) < minimum ? (value < 0 ? -minimum : minimum) : value;
    let c = 1;
    let d = 1 / nonzero(1 - (first + second) * probability / (first + 1));
    let fraction = d;

    for (let iteration = 1; iteration <= 10000; iteration++) {
        const twice = 2 * iteration;
        const even = iteration * (second - iteration) * probability / ((first + twice - 1) * (first + twice));
        d = 1 / nonzero(1 + even * d);
        c = nonzero(1 + even / c);
        fraction *= d * c;

        const odd = -(first + iteration) * (first + second + iteration) * probability / ((first + twice) * (first + twice + 1));
        d = 1 / nonzero(1 + odd * d);
        c = nonzero(1 + odd / c);
        const ratio = d * c;
        fraction *= ratio;
        if (Math.abs(ratio - 1) <= 4 * Number.EPSILON) {
            const tail = Math.exp(logFactor + Math.log(fraction) - Math.log(first));
            if (tail < 0 || tail > 1) {
                return Number.NaN;
            }
            return complemented ? 1 - tail : tail;
        }
    }

    return Number.NaN;
}

function binomialBetaLogFactor(x: number, complement: number, a: number, b: number): number {
    // A short factorial ratio avoids subtracting large log-gamma values when
    // one shape is small; all shapes here are positive integers.
    const small = Math.min(a, b);
    if (small < 16) {
        const large = Math.max(a, b);
        let ratio = Math.log(large);
        for (let i = 1; i < small; i++) {
            ratio += Math.log(large + i) - Math.log(i);
        }
        const logX = x < 0.5 ? Math.log(x) : Math.log1p(-complement);
        const logComplement = complement < 0.5 ? Math.log(complement) : Math.log1p(-x);
        return ratio + a * logX + b * logComplement;
    }

    // Stirling's correction and the binomial deviance retain the small
    // logarithm near the mode instead of cancelling O(n log n) terms.
    const total = a + b;
    return 0.5 * (Math.log(a) + Math.log(b) - Math.log(total) - Math.log(2 * Math.PI))
        + binomialStirlingCorrection(total) - binomialStirlingCorrection(a) - binomialStirlingCorrection(b)
        - binomialDeviance(a, total * x) - binomialDeviance(b, total * complement);
}

function binomialStirlingCorrection(value: number): number {
    const inverse = 1 / value;
    const square = inverse * inverse;
    return inverse * (1 / 12 - square * (1 / 360 - square * (1 / 1260 - square * (1 / 1680 - square / 1188))));
}

function binomialDeviance(value: number, mean: number): number {
    const difference = value - mean;
    if (Math.abs(difference) >= 0.1 * (value + mean)) {
        return value * Math.log(value / mean) + mean - value;
    }

    const ratio = difference / (value + mean);
    const square = ratio * ratio;
    let sum = difference * ratio;
    let term = 2 * value * ratio;
    for (let denominator = 3; ; denominator += 2) {
        term *= square;
        const next = sum + term / denominator;
        if (next === sum) {
            return sum;
        }
        sum = next;
    }
}
