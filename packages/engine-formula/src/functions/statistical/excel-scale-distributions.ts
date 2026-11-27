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
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { coerceExcelCumulative, coerceExcelDistributionNumber } from './excel-distribution-arguments';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

const MIN_NORMAL = 2 ** -1022;

function nonSubnormal(value: number): number {
    return Math.abs(value) < MIN_NORMAL ? 0 : value;
}

function positivePower(base: number, exponent: number): number {
    if (base === 0) return 0;
    const product = exponent * Math.log(base);
    return Number.isFinite(product) ? nonSubnormal(Math.exp(product)) : Number.NaN;
}

function exponentialResult(x: number, rate: number, cumulative: boolean): number {
    if (x < 0 || rate <= 0) return Number.NaN;
    const decay = nonSubnormal(rate * x);
    if (!Number.isFinite(decay)) return Number.NaN;
    return cumulative ? -Math.expm1(-decay) : rate * Math.exp(-decay);
}

function weibullResult(x: number, shape: number, scale: number, cumulative: boolean): number | ErrorValueObject {
    if (x < 0 || shape <= 0 || scale <= 0) return Number.NaN;
    const ratio = nonSubnormal(x / scale);
    const finiteRatio = Number.isFinite(ratio);
    const decay = finiteRatio ? positivePower(ratio, shape) : Number.NaN;
    if (finiteRatio && !Number.isFinite(decay)) return Number.NaN;
    if (cumulative) return -Math.expm1(-decay);

    const denominator = positivePower(scale, shape);
    const numerator = positivePower(x, shape - 1);
    if (!Number.isFinite(denominator) || !Number.isFinite(numerator)) return Number.NaN;
    // A zero density denominator takes precedence over overflow in the first division.
    if (denominator === 0) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
    if (x === 0) return 0;
    return nonSubnormal(nonSubnormal(shape / denominator) * numerator) * Math.exp(-decay);
}

function scaleDistributionFunction(weibull: boolean) {
    return class ExcelScaleDistribution extends BaseFunction {
        override minParams = weibull ? 4 : 3;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const x = coerceExcelDistributionNumber(cells[0]);
                if (x.isError()) return x;
                const shape = coerceExcelDistributionNumber(cells[1]);
                if (shape.isError()) return shape;
                const scale = weibull ? coerceExcelDistributionNumber(cells[2]) : undefined;
                if (scale?.isError()) return scale;
                const cumulative = coerceExcelCumulative(cells[weibull ? 3 : 2]);
                if (typeof cumulative !== 'boolean') return cumulative;
                const input = Number(x.getValue());
                const distributionParameter = Number(shape.getValue());
                const result = scale === undefined
                    ? exponentialResult(input, distributionParameter, cumulative)
                    : weibullResult(input, distributionParameter, Number(scale.getValue()), cumulative);
                if (typeof result !== 'number') return result;
                return Number.isFinite(result) ? NumberValueObject.create(result || 0) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

const ExcelExponDist = scaleDistributionFunction(false);
const ExcelWeibullDist = scaleDistributionFunction(true);

export const excelScaleDistributionFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelExponDist, FUNCTION_NAMES_STATISTICAL.EXPON_DIST],
    [ExcelExponDist, FUNCTION_NAMES_COMPATIBILITY.EXPONDIST],
    [ExcelWeibullDist, FUNCTION_NAMES_STATISTICAL.WEIBULL_DIST],
    [ExcelWeibullDist, FUNCTION_NAMES_COMPATIBILITY.WEIBULL],
];
