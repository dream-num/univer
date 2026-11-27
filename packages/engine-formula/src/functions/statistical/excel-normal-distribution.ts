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
import type { BaseReferenceObject, FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { excelErfc } from '../../basics/engineering';
import { ErrorType } from '../../basics/error-type';
import { normalQuantileMagnitude } from '../../basics/statistical';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { excelDiscreteDistributionFunctions } from './excel-discrete-distributions';
import { coerceExcelCumulative, coerceExcelDistributionNumber } from './excel-distribution-arguments';
import { excelFDistributionFunctions } from './excel-f-distribution';
import { excelScaleDistributionFunctions } from './excel-scale-distributions';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

const SQRT_TWO_PI = Math.sqrt(2 * Math.PI);
const MIN_NORMAL = 2 ** -1022;

function normalProbability(z: number): number {
    return 0.5 * excelErfc(-z / Math.SQRT2);
}

function normalResult(z: number, scale: number, cumulative: boolean): BaseValueObject {
    if (!Number.isFinite(z)) return ErrorValueObject.create(ErrorType.NUM);
    if (cumulative) return NumberValueObject.create(normalProbability(z));
    const square = z * z;
    if (!Number.isFinite(square)) return ErrorValueObject.create(ErrorType.NUM);
    const density = Math.exp(-square / 2) / scale / SQRT_TWO_PI;
    return Number.isFinite(density) ? NumberValueObject.create(density) : ErrorValueObject.create(ErrorType.NUM);
}

type NormalDistribution = 'general' | 'standard' | 'standard-cumulative';

function normalDistributionFunction(distribution: NormalDistribution) {
    return class ExcelNormalDistribution extends BaseFunction {
        override minParams = distribution === 'general' ? 4 : distribution === 'standard' ? 2 : 1;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const xObject = coerceExcelDistributionNumber(cells[0]);
                if (xObject.isError()) return xObject;
                const x = Number(xObject.getValue());
                if (distribution === 'standard-cumulative') return normalResult(x, 1, true);
                if (distribution === 'standard') {
                    const cumulative = coerceExcelCumulative(cells[1]);
                    return typeof cumulative === 'boolean' ? normalResult(x, 1, cumulative) : cumulative;
                }

                const mean = coerceExcelDistributionNumber(cells[1]);
                if (mean.isError()) return mean;
                const scaleObject = coerceExcelDistributionNumber(cells[2]);
                if (scaleObject.isError()) return scaleObject;
                const cumulative = coerceExcelCumulative(cells[3]);
                if (typeof cumulative !== 'boolean') return cumulative;
                const scale = Number(scaleObject.getValue());
                if (!(scale > 0)) return ErrorValueObject.create(ErrorType.NUM);
                return normalResult((x - Number(mean.getValue())) / scale, scale, cumulative);
            });
        }
    };
}

function lognormalDistributionFunction(legacy: boolean) {
    return class ExcelLognormalDistribution extends BaseFunction {
        override minParams = legacy ? 3 : 4;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const x = coerceExcelDistributionNumber(cells[0]);
                if (x.isError()) return x;
                const mean = coerceExcelDistributionNumber(cells[1]);
                if (mean.isError()) return mean;
                const scale = coerceExcelDistributionNumber(cells[2]);
                if (scale.isError()) return scale;
                const cumulative = legacy ? true : coerceExcelCumulative(cells[3]);
                if (typeof cumulative !== 'boolean') return cumulative;
                const input = Number(x.getValue());
                const deviation = Number(scale.getValue());
                if (input <= 0 || deviation <= 0) return ErrorValueObject.create(ErrorType.NUM);
                const logarithm = Math.log(input);
                const centered = logarithm - Number(mean.getValue());
                if (cumulative) return normalResult(centered / deviation, 1, true);

                const variance = deviation * deviation;
                const twiceVariance = 2 * variance;
                if (variance < MIN_NORMAL || !Number.isFinite(twiceVariance)) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
                const exponent = (centered * centered) / twiceVariance;
                if (!Number.isFinite(exponent)) return ErrorValueObject.create(ErrorType.NUM);
                const density = Math.exp(-logarithm - Math.log(SQRT_TWO_PI) - Math.log(deviation) - exponent);
                return Number.isFinite(density) ? NumberValueObject.create(density) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

function normalInverseFunction(distribution: 'general' | 'standard' | 'lognormal') {
    return class ExcelNormalInverse extends BaseFunction {
        override minParams = distribution === 'standard' ? 1 : 3;

        override maxParams = this.minParams;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, (cells) => {
                const probability = coerceExcelDistributionNumber(cells[0]);
                if (probability.isError()) return probability;
                let mean = 0;
                let scale = 1;
                if (distribution !== 'standard') {
                    const meanObject = coerceExcelDistributionNumber(cells[1]);
                    if (meanObject.isError()) return meanObject;
                    const scaleObject = coerceExcelDistributionNumber(cells[2]);
                    if (scaleObject.isError()) return scaleObject;
                    mean = Number(meanObject.getValue());
                    scale = Number(scaleObject.getValue());
                }

                const p = Number(probability.getValue());
                if (!(p > 0 && p < 1 && scale > 0)) return ErrorValueObject.create(ErrorType.NUM);
                const quantile = p < 0.5 ? -normalQuantileMagnitude(p) : normalQuantileMagnitude(1 - p);
                const inverse = mean + scale * quantile;
                if (!Number.isFinite(inverse)) return ErrorValueObject.create(ErrorType.NUM);
                const result = distribution === 'lognormal' ? Math.exp(inverse) : inverse;
                return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

class ExcelZTest extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override needsReferenceObject = true;

    override calculate(sample: FunctionVariantType, x: FunctionVariantType, sigma?: FunctionVariantType): BaseValueObject {
        const container = sample.isReferenceObject() || sample.isArray();
        const observations = this._sampleNumbers(sample);
        const values = Array.isArray(observations) ? observations : [];
        const count = values.length;
        const mean = values.reduce((sum, value) => sum + value, 0) / count;
        const estimatedDeviation = sigma === undefined && count > 1
            ? Math.sqrt(values.reduce((sum, value) => sum + (value - mean) ** 2, 0) / (count - 1))
            : 0;
        const args = (sigma === undefined ? [x] : [x, sigma]).map((value) => value.isReferenceObject()
            ? (value as BaseReferenceObject).toArrayValueObject()
            : value as BaseValueObject);

        return mapFinancialScalars(args, ([hypothesis, specifiedSigma]) => {
            if (!container && observations instanceof ErrorValueObject) return observations;
            const hypothesisNumber = coerceExcelDistributionNumber(hypothesis);
            if (hypothesisNumber.isError()) return hypothesisNumber;
            const sigmaNumber = specifiedSigma === undefined ? undefined : coerceExcelDistributionNumber(specifiedSigma);
            if (sigmaNumber?.isError()) return sigmaNumber;
            if (observations instanceof ErrorValueObject) return observations;
            if (count === 0) return ErrorValueObject.create(ErrorType.NA);
            if (count === 1) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);

            if (!Number.isFinite(mean)) return ErrorValueObject.create(ErrorType.NUM);
            let standardDeviation: number;
            if (sigmaNumber === undefined) {
                standardDeviation = estimatedDeviation;
                if (standardDeviation === 0) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            } else {
                standardDeviation = Number(sigmaNumber.getValue());
                if (standardDeviation <= 0) return ErrorValueObject.create(ErrorType.NUM);
            }
            if (!Number.isFinite(standardDeviation)) return ErrorValueObject.create(ErrorType.NUM);
            const standardError = standardDeviation / Math.sqrt(count);
            if (standardError === 0) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            const z = (Number(hypothesisNumber.getValue()) - mean) / standardError;
            return normalResult(z, 1, true);
        });
    }

    private _sampleNumbers(sample: FunctionVariantType): number[] | ErrorValueObject {
        if (sample.isReferenceObject() || sample.isArray()) {
            const values: number[] = [];
            let error: ErrorValueObject | undefined;
            (sample as BaseReferenceObject | ArrayValueObject).iterator((cell) => {
                if (cell?.isError()) {
                    error = cell as ErrorValueObject;
                    return false;
                }
                if (cell?.isNumber()) values.push(Number(cell.getValue()));
                return true;
            });
            return error ?? values;
        }
        const value = sample as BaseValueObject;
        if (value.isNull()) return [];
        const scalar = coerceExcelDistributionNumber(value);
        return scalar.isError() ? scalar as ErrorValueObject : [Number(scalar.getValue())];
    }
}

const ExcelNormDist = normalDistributionFunction('general');
const ExcelNormInv = normalInverseFunction('general');
const ExcelNormSInv = normalInverseFunction('standard');
const ExcelLogNormInv = normalInverseFunction('lognormal');

export const excelNormalDistributionFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelNormDist, FUNCTION_NAMES_STATISTICAL.NORM_DIST],
    [ExcelNormDist, FUNCTION_NAMES_COMPATIBILITY.NORMDIST],
    [normalDistributionFunction('standard'), FUNCTION_NAMES_STATISTICAL.NORM_S_DIST],
    [normalDistributionFunction('standard-cumulative'), FUNCTION_NAMES_COMPATIBILITY.NORMSDIST],
    [ExcelNormInv, FUNCTION_NAMES_STATISTICAL.NORM_INV],
    [ExcelNormInv, FUNCTION_NAMES_COMPATIBILITY.NORMINV],
    [ExcelNormSInv, FUNCTION_NAMES_STATISTICAL.NORM_S_INV],
    [ExcelNormSInv, FUNCTION_NAMES_COMPATIBILITY.NORMSINV],
    [lognormalDistributionFunction(false), FUNCTION_NAMES_STATISTICAL.LOGNORM_DIST],
    [lognormalDistributionFunction(true), FUNCTION_NAMES_COMPATIBILITY.LOGNORMDIST],
    [ExcelLogNormInv, FUNCTION_NAMES_STATISTICAL.LOGNORM_INV],
    [ExcelLogNormInv, FUNCTION_NAMES_COMPATIBILITY.LOGINV],
    [ExcelZTest, FUNCTION_NAMES_STATISTICAL.Z_TEST],
    [ExcelZTest, FUNCTION_NAMES_COMPATIBILITY.ZTEST],
    ...excelScaleDistributionFunctions,
    ...excelFDistributionFunctions,
    ...excelDiscreteDistributionFunctions,
];
