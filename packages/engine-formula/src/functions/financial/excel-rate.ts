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

import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from './scalar-arguments';

const floatBits = new DataView(new ArrayBuffer(8));

function withoutLowSignificand(value: number): number {
    floatBits.setFloat64(0, value);
    floatBits.setUint32(4, floatBits.getUint32(4) & 0xF800_0000);
    return floatBits.getFloat64(0);
}

function midpointSpacing(value: number): number {
    floatBits.setFloat64(0, value);
    const exponent = (floatBits.getUint32(0) >>> 20) & 0x7FF;
    if ((floatBits.getUint32(4) & 1) === 0 || exponent <= 52 || exponent === 0x7FF) {
        return 0;
    }
    return 2 ** (exponent - 1075);
}

function productRoundingError(left: number, right: number, product: number): number {
    const leftHigh = withoutLowSignificand(left);
    const rightHigh = withoutLowSignificand(right);
    const leftLow = left - leftHigh;
    const rightLow = right - rightHigh;
    return ((leftHigh * rightHigh - product) + leftHigh * rightLow + leftLow * rightHigh) + leftLow * rightLow;
}

function roundRateIntermediate(value: number, ulp: number, remainder: number): number {
    // Financial calculations can round through a 64-bit significand before storing a double.
    return Math.abs(remainder) >= ulp * (2047 / 4096) ? value + Math.sign(remainder) * ulp : value;
}

function compoundProduct(left: number, right: number): number {
    const product = left * right;
    const ulp = midpointSpacing(product);
    return ulp === 0 ? product : roundRateIntermediate(product, ulp, productRoundingError(left, right, product));
}

export function compoundQuotient(left: number, right: number): number {
    const quotient = left / right;
    const ulp = midpointSpacing(quotient);
    if (ulp === 0) return quotient;
    const product = quotient * right;
    const remainder = ((left - product) - productRoundingError(quotient, right, product)) / right;
    return roundRateIntermediate(quotient, ulp, remainder);
}

function rateGrowth(rate: number, periods: number): number {
    let factor = 1 + rate;
    if (!Number.isInteger(periods) || Math.abs(periods) > 0x7FFF_FFFF) {
        return factor ** periods;
    }
    let term = 1;
    for (let exponent = Math.abs(periods); exponent > 0; exponent = Math.floor(exponent / 2)) {
        if (exponent % 2 === 1) term = compoundProduct(term, factor);
        factor = compoundProduct(factor, factor);
    }
    return periods < 0 ? 1 / term : term;
}

function solveRate(periods: number, payment: number, present: number, future: number, first: boolean, guess: number): number {
    const seedStep = 0.001;
    const tolerance = 1e-7;
    const fallbackTolerance = 1e-4;
    const residual = (rate: number) => {
        if (rate === 0) return -(payment * periods + present) - future;
        const growth = rateGrowth(rate, periods);
        const annuity = compoundQuotient(growth - 1, rate);
        return -(payment * (first ? annuity * (1 + rate) : annuity) + present * growth) - future;
    };
    let previous = guess;
    let previousResidual = residual(previous);
    let current = previous + (previousResidual < 0 ? -seedStep : seedStep);
    let currentResidual = residual(current);
    // Each Excel iteration advances the secant twice.
    for (let iteration = 0; iteration < 200; iteration++) {
        if (currentResidual === previousResidual) {
            current += current > previous ? -seedStep : seedStep;
            currentResidual = residual(current);
            if (currentResidual === previousResidual) return NaN;
        }
        const correction = compoundQuotient((current - previous) * currentResidual, currentResidual - previousResidual);
        const next = current - correction;
        const nextResidual = residual(next);
        if (!Number.isFinite(nextResidual)) return NaN;
        if (Math.abs(nextResidual) <= tolerance && Math.abs(next - current) <= tolerance) {
            return next - tolerance > -1 ? next : NaN;
        }
        previous = current;
        previousResidual = currentResidual;
        current = next;
        currentResidual = nextResidual;
    }
    const converged = Math.abs(currentResidual) <= fallbackTolerance &&
        Math.abs(current - previous) <= fallbackTolerance &&
        current - fallbackTolerance > -1;
    return converged ? current : NaN;
}

export class ExcelRate extends BaseFunction {
    override minParams = 3;

    override maxParams = 6;

    override calculate(...input: BaseValueObject[]): BaseValueObject {
        return mapFinancialScalars(input, (args) => this._evaluate(args));
    }

    private _evaluate(args: BaseValueObject[]): BaseValueObject {
        const numbers: number[] = [];
        for (const arg of args) {
            const value = arg.isString() ? arg.withDateSystem(this.getDateSystem()).convertToNumberObjectValue() : arg;
            if (value.isError()) return value;
            const number = value.isNull() ? 0 : Number(value.getValue());
            if (!Number.isFinite(number)) return ErrorValueObject.create(ErrorType.VALUE);
            numbers.push(number);
        }
        const [periods, payment, present, future = 0, type = 0, guess = 0.1] = numbers;
        if (guess <= -1) return ErrorValueObject.create(ErrorType.VALUE);
        const rate = solveRate(periods, payment, present, future, type !== 0, guess);
        return Number.isFinite(rate) ? NumberValueObject.create(rate) : ErrorValueObject.create(ErrorType.NUM);
    }
}
