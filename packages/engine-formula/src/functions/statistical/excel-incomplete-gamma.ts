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

import { excelErfc } from '../../basics/engineering';
import { gammaln, normalQuantileMagnitude } from '../../basics/statistical';

const LN_SQRT_TWO_PI = 0.9189385332046727;
const MIN_NORMAL = 2.2250738585072014e-308;
const EPSILON = 2 * Number.EPSILON;

export function log1pMinusX(x: number): number {
    if (Math.abs(x) >= 0.125) return Math.log1p(x) - x;
    let power = -x * x;
    let sum = power / 2;
    for (let n = 3; n <= 32; n++) {
        power *= -x;
        const next = sum + power / n;
        if (next === sum) break;
        sum = next;
    }
    return sum;
}

export function stirlingError(shape: number): number {
    const inverse = 1 / shape;
    const inverseSquare = inverse * inverse;
    return inverse * (1 / 12 + inverseSquare * (-1 / 360 + inverseSquare * (1 / 1260 + inverseSquare * (-1 / 1680 + inverseSquare / 1188))));
}

const LOG_GAMMA_SERIES_RADIUS = 1 / 32;

// Taylor coefficients of log Γ(1 + x) at 0, through ζ(9) / 9.
const LOG_GAMMA_COEFFICIENTS = [
    -0.5772156649015329,
    0.8224670334241132,
    -0.40068563438653143,
    0.27058080842778454,
    -0.20738555102867398,
    0.1695571769974082,
    -0.1440498967688461,
    0.12550966952474304,
    -0.11133426586956469,
];

function logGammaNearOne(offset: number): number {
    return offset * LOG_GAMMA_COEFFICIENTS.reduceRight((sum, coefficient) => offset * sum + coefficient, 0);
}

export function logGammaPositive(x: number): number {
    if (x <= LOG_GAMMA_SERIES_RADIUS) return logGammaNearOne(x) - Math.log(x);
    const fromOne = x - 1;
    if (Math.abs(fromOne) <= LOG_GAMMA_SERIES_RADIUS) return logGammaNearOne(fromOne);
    const fromTwo = x - 2;
    if (Math.abs(fromTwo) <= LOG_GAMMA_SERIES_RADIUS) return Math.log1p(fromTwo) + logGammaNearOne(fromTwo);
    if (x < 16) return gammaln(x);
    return (x - 0.5) * Math.log(x) - x + LN_SQRT_TWO_PI + stirlingError(x);
}

export function gammaLogPrefix(shape: number, x: number): number {
    if (shape < 16) return shape * Math.log(x) - x - logGammaPositive(shape);
    const relative = (x - shape) / shape;
    const deviation = Math.abs(relative) < 0.125
        ? log1pMinusX(relative)
        : (Math.log(x) - Math.log(shape)) - relative;
    return shape * deviation + Math.log(shape) / 2 - LN_SQRT_TWO_PI - stirlingError(shape);
}

export function gammaDensityTerm(shape: number, x: number): number {
    if (shape < 16 || x <= 1.1) return Math.exp(gammaLogPrefix(shape, x) - Math.log(shape));

    const difference = shape - x;
    const v = difference / (shape + x);
    let deviance: number;
    if (v === 0) {
        deviance = 0;
    } else if (Math.abs(v) <= 0.2) {
        // Preserve the distribution's deviance evaluation order in the far tail.
        const squared = v * v;
        let sum = 0;
        let term = Math.abs(v);
        for (let n = 1; n < 100; n += 2) {
            term *= (n / (n + 2)) * squared;
            sum += term;
            if (term <= Number.EPSILON * sum) break;
        }
        const inverseTanh = Math.sign(v) * (sum + Math.abs(v));
        const twiceShape = 2 * shape;
        deviance = twiceShape * inverseTanh - twiceShape * v + difference * v;
    } else {
        deviance = shape * Math.log(shape / x) - difference;
    }
    return Math.exp(-(deviance + stirlingError(shape))) / Math.sqrt((2 * Math.PI) * shape);
}

export function gammaProbability(shape: number, x: number, upper: boolean): number {
    if (x === 0) return Number(upper);
    if (shape === 1) return upper ? Math.exp(-x) : -Math.expm1(-x);
    const relative = (x - shape) / shape;
    if (shape >= 1e7 && Math.abs(relative) < 0.015) {
        // Uniform incomplete gamma expansion, DLMF 8.12. The local series
        // for c0 avoids subtracting two nearly equal reciprocals.
        const etaSquared = -2 * log1pMinusX(relative);
        const eta = Math.sign(relative) * Math.sqrt(etaSquared);
        const c0 = Math.abs(relative) < 1e-4
            ? -1 / 3 + relative * (1 / 12 - relative * 23 / 540)
            : 1 / relative - 1 / eta;
        const z = eta * Math.sqrt(shape / 2);
        const correction = Math.exp(-z * z - LN_SQRT_TWO_PI) / Math.sqrt(shape) * (c0 - 1 / (540 * shape));
        const value = upper ? excelErfc(z) / 2 + correction : excelErfc(-z) / 2 - correction;
        return Math.max(0, Math.min(1, value));
    }
    const logPrefix = gammaLogPrefix(shape, x);
    if (x < shape + 1) {
        let term = 1 / shape;
        let sum = term;
        for (let n = 1; n <= 100000; n++) {
            term *= x / (shape + n);
            sum += term;
            if (Math.abs(term) <= EPSILON * sum) break;
        }
        const lower = Math.exp(logPrefix + Math.log(sum));
        return upper ? 1 - lower : lower;
    }
    let b = x + 1 - shape;
    let c = 1e300;
    let d = 1 / b;
    let fraction = d;
    for (let n = 1; n <= 100000; n++) {
        const coefficient = n * (shape - n);
        b += 2;
        d = 1 / (coefficient * d + b || 1e-300);
        c = b + coefficient / c || 1e-300;
        const factor = d * c;
        fraction *= factor;
        if (Math.abs(factor - 1) <= EPSILON) break;
    }
    const tail = Math.exp(logPrefix + Math.log(fraction));
    return upper ? tail : 1 - tail;
}

function inverseHalfGamma(probability: number): number {
    const shape = 0.5;
    const target = probability > 0.5 ? 1 - probability : probability;
    const upper = probability > 0.5;
    const belowTarget = (x: number) => upper ? gammaProbability(shape, x, true) > target : gammaProbability(shape, x, false) < target;
    let high = Math.max(1, shape);
    while (belowTarget(high)) {
        high *= 2;
        if (!Number.isFinite(high)) return Number.NaN;
    }
    let lowLog = Math.log(MIN_NORMAL);
    let highLog = Math.log(high);
    if (!belowTarget(MIN_NORMAL)) return 0;
    for (let step = 0; step < 64; step++) {
        const mid = (lowLog + highLog) / 2;
        if (mid === lowLog || mid === highLog) break;
        if (belowTarget(Math.exp(mid))) lowLog = mid;
        else highLog = mid;
    }
    return Math.exp((lowLog + highLog) / 2);
}

// Excel seeds the inverse gamma iteration with a polynomial in the normal
// quantile. The starting point matters in the tails, where the iteration can fail.
const INVERSE_GAMMA_SEED = [
    [0.001565326, -0.001450117, 0.00009780499],
    [0.001060438, 0.00253001, -0.0008426812],
    [-0.006950356, 0.005169654, 0.00312558],
    [-0.01323293, -0.01153761, -0.008553069],
    [0.02277679, 0.01128186, 0.0001348028],
    [-0.008986007, 0.02607083, 0.4713941],
    [-0.01513904, -0.2237368, 1.0000886],
];

function inverseGammaSeed(shape: number, probability: number, upper: boolean): number {
    const logLower = upper ? Math.log1p(-probability) : Math.log(probability);
    if (-0.62 * logLower > shape) {
        const logGammaAtNext = shape <= LOG_GAMMA_SERIES_RADIUS ? logGammaNearOne(shape) : logGammaPositive(1 + shape);
        return Math.exp((logLower + logGammaAtNext) / shape);
    }

    const tail = Math.min(probability, 1 - probability);
    const normal = normalQuantileMagnitude(tail) * (upper === (probability <= 0.5) ? 1 : -1);
    if (shape <= 1) {
        const inverse = 1 / (9 * shape);
        return shape * (1 - inverse + normal * Math.sqrt(inverse)) ** 3;
    }
    const inverseShape = 0.5 / shape;
    const z = normal * Math.sqrt(inverseShape);
    let estimate = 0;
    for (const [quadratic, linear, constant] of INVERSE_GAMMA_SEED) {
        estimate = estimate * z + ((quadratic * inverseShape + linear) * inverseShape + constant);
    }
    return shape * estimate * estimate * estimate;
}

export function inverseGammaProbability(probability: number, shape: number, rightTail = false): number {
    if (shape === 0.5) {
        // Excel complements the right-tail argument before inverse erf.
        const lower = rightTail ? 0.5 + (0.5 - probability) : probability;
        return lower === 1 ? Number.NaN : inverseHalfGamma(lower);
    }
    if (shape === 1) return -(rightTail ? Math.log(probability) : Math.log1p(-probability));

    const complement = probability > 0.9999;
    const target = complement ? 1 - probability : probability;
    const upper = rightTail !== complement;
    let x = inverseGammaSeed(shape, target, upper);
    let best = x;
    let bestError = Infinity;
    for (let step = 1; step < 107; step++) {
        if (x >= 0 && x < MIN_NORMAL) return 0;
        if (!(x > 0) || !Number.isFinite(x)) return Number.NaN;

        const error = gammaProbability(shape, x, upper) - target;
        // Excel's solver treats a subnormal probability residual as zero.
        if (Math.abs(error) < MIN_NORMAL) return x;
        if (Math.abs(error) < bestError) {
            best = x;
            bestError = Math.abs(error);
        }
        const gammaTerm = gammaDensityTerm(shape, x);
        const density = (shape / x) * gammaTerm;
        if (density === 0) return x;
        const derivative = upper ? -density : density;
        const curvature = (shape - 1) / x - 1;
        const next = x - (2 * error) / (2 * derivative - error * curvature);
        if (Math.abs(next - x) <= Number.EPSILON * x) return x;
        x = next;
    }
    return bestError / target <= 1e-12 ? best : Number.NaN;
}
