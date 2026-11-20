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
import type { NullValueObject } from '../../engine/value-object/primitive-object';
import { ErrorType } from '../../basics/error-type';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { Avedev } from './avedev';
import { Countblank } from './countblank';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { Maxifs } from './maxifs';
import { Minifs } from './minifs';
import { ModeMult } from './mode-mult';
import { ModeSngl } from './mode-sngl';
import { RankAvg } from './rank-avg';
import { RankEq } from './rank-eq';

const MIN_NORMAL = 2.2250738585072014e-308;

function sampleMoment(observations: number[], sum: number, sample: boolean, kurtosis: boolean): BaseValueObject {
    const count = observations.length;
    if (count < (kurtosis ? 4 : 3)) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);

    let overflow = !Number.isFinite(sum);
    const accumulate = (current: number, term: number): number => {
        // Excel uses zero for a failed term or overflowing accumulator. A zero
        // variance is reported before a numerical error in the accumulation.
        if (!Number.isFinite(term)) {
            overflow = true;
            return current;
        }
        const next = current + term;
        if (!Number.isFinite(next)) {
            overflow = true;
            return 0;
        }
        return Math.abs(next) < MIN_NORMAL ? 0 : next;
    };

    const mean = (overflow ? observations.reduce(accumulate, 0) : sum) / count;
    let squaredDeviations = 0;
    for (const number of observations) {
        const difference = number - mean;
        const square = difference * difference;
        if (square >= MIN_NORMAL) squaredDeviations = accumulate(squaredDeviations, square);
    }

    const variance = squaredDeviations / (count - Number(sample));
    if (variance < MIN_NORMAL) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
    if (overflow) return ErrorValueObject.create(ErrorType.NUM);

    const deviation = Math.sqrt(variance);
    let moment = 0;
    for (const number of observations) {
        const scaled = (number - mean) / deviation;
        const square = scaled * scaled;
        moment += kurtosis ? square * square : square * scaled;
    }
    let result: number;
    if (kurtosis) {
        const normalization = (count - 2) * (count - 3);
        result = count * (count + 1) / ((count - 1) * normalization) * moment -
            3 * (count - 1) ** 2 / normalization;
    } else {
        result = sample ? count / ((count - 1) * (count - 2)) * moment : moment / count;
    }
    return Number.isFinite(result) ? NumberValueObject.create(result === 0 ? 0 : result) : ErrorValueObject.create(ErrorType.NUM);
}

function observationStatistic(
    statistic: 'average' | 'variance' | 'deviation' | 'skewness' | 'kurtosis',
    sample = false,
    standardDeviation = false,
    includeReferenceValues = true
) {
    return class ExcelObservationStatistic extends BaseFunction {
        override minParams = 1;

        override maxParams = 255;

        override needsReferenceObject = true;

        override evaluatesIfArgumentsAsArrays = statistic === 'variance';

        override calculate(...args: FunctionVariantType[]): BaseValueObject {
            const isMoment = statistic === 'skewness' || statistic === 'kurtosis';
            const isVariance = statistic === 'variance';
            const referenceValues = statistic === 'average' || (isVariance && includeReferenceValues);
            // Excel validates direct arguments before visiting cells in ranges and arrays.
            const scalars: (number | undefined)[] = [];
            for (const argument of args) {
                if (argument.isReferenceObject()) {
                    scalars.push(undefined);
                    continue;
                }
                const value = argument as BaseValueObject;
                const missingVarianceArgument = isVariance && value.isNull() && (value as NullValueObject).isOmitted();
                if (value.isArray() || (value.isNull() && !isMoment && !missingVarianceArgument)) {
                    scalars.push(undefined);
                    continue;
                }
                if (value.isError()) return value;
                const number = value.convertToNumberObjectValue();
                if (number.isError()) return number;
                scalars.push(Number(number.getValue()));
            }

            const observations: number[] = [];
            let count = 0;
            let sum = 0;
            let sumOfSquares = 0;
            const record = (number: number) => {
                sum += number;
                count++;
                if (statistic !== 'average') observations.push(number);
                if (isVariance) sumOfSquares += number * number;
            };
            for (const [index, argument] of args.entries()) {
                const scalar = scalars[index];
                if (scalar !== undefined) {
                    record(scalar);
                    continue;
                }
                const reference = argument.isReferenceObject();
                if (!reference && !argument.isArray()) continue;
                const referenceGrid = isVariance && argument instanceof MultiAreaReferenceObject && argument.isArrayOfReferences();
                const source = referenceGrid ? argument.toArrayValueObject() : argument as BaseReferenceObject | ArrayValueObject;
                let error: BaseValueObject | undefined;
                source.iterator((value) => {
                    if (value?.isError()) {
                        error = value;
                        return false;
                    }
                    if (value?.isNumber()) record(Number(value.getValue()));
                    if (value?.isBoolean() && reference && !referenceGrid && referenceValues) record(Number(value.getValue()));
                    if (value?.isString() && (statistic === 'average' || (reference && !referenceGrid && referenceValues))) record(0);
                    return true;
                });
                if (error) return error;
            }

            if (isMoment) return sampleMoment(observations, sum, sample, statistic === 'kurtosis');
            if (!Number.isFinite(sum) || (isVariance && (!Number.isFinite(sumOfSquares) || !Number.isFinite(sum * sum)))) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
            if (count === 0) return ErrorValueObject.create(statistic === 'deviation' ? ErrorType.NUM : ErrorType.DIV_BY_ZERO);
            const mean = sum / count;
            if (statistic === 'average') return NumberValueObject.create(mean);
            if (sample && count === 1) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            const squaredDeviations = observations.reduce((result, number) => result + (number - mean) ** 2, 0);
            const variance = sample ? squaredDeviations / (count - 1) : squaredDeviations * (1 / count);
            const value = statistic === 'deviation' ? squaredDeviations : variance;
            const result = standardDeviation ? Math.sqrt(value) : value;
            return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
        }
    };
}

const ExcelSampleVariance = observationStatistic('variance', true, false, false);
const ExcelPopulationVariance = observationStatistic('variance', false, false, false);
const ExcelSampleDeviation = observationStatistic('variance', true, true, false);
const ExcelPopulationDeviation = observationStatistic('variance', false, true, false);

class ExcelAvedev extends Avedev {
    override needsReferenceObject = true;

    override calculate(...args: FunctionVariantType[]): BaseValueObject {
        return super.calculate(...args.map((argument) => {
            if (argument.isReferenceObject()) return (argument as BaseReferenceObject).toArrayValueObject();
            const value = argument as BaseValueObject;
            return value.isNull() && (value as NullValueObject).isOmitted() ? NumberValueObject.create(0) : value;
        }));
    }
}

function zeroIfNoNumericExtremum(result: BaseValueObject): BaseValueObject {
    if (result.isArray()) return (result as ArrayValueObject).mapValue(zeroIfNoNumericExtremum);
    return result.isNumber() && !Number.isFinite(Number(result.getValue())) ? NumberValueObject.create(0) : result;
}

class ExcelMaxifs extends Maxifs {
    override calculate(range: FunctionVariantType, ...criteria: FunctionVariantType[]): BaseValueObject {
        return zeroIfNoNumericExtremum(super.calculate(range, ...criteria));
    }
}

class ExcelMinifs extends Minifs {
    override calculate(range: FunctionVariantType, ...criteria: FunctionVariantType[]): BaseValueObject {
        return zeroIfNoNumericExtremum(super.calculate(range, ...criteria));
    }
}

class ExcelModeSngl extends ModeSngl {
    protected override readonly validateStringArguments = false;
}

class ExcelModeMult extends ModeMult {
    protected override readonly validateStringArguments = false;
}

class ExcelRankAvg extends RankAvg {
    protected override readonly numbersOnly = true;
}

class ExcelRankEq extends RankEq {
    protected override readonly numbersOnly = true;
}

class ExcelCountblank extends Countblank {
    override needsReferenceObject = true;

    override calculate(value: FunctionVariantType): BaseValueObject {
        if (value instanceof MultiAreaReferenceObject && value.isSheetSpan) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        return super.calculate(value.isReferenceObject() ? (value as BaseReferenceObject).toArrayValueObject() : value as BaseValueObject);
    }
}

export const excelObservationStatisticsFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelCountblank, FUNCTION_NAMES_STATISTICAL.COUNTBLANK],
    [ExcelMaxifs, FUNCTION_NAMES_STATISTICAL.MAXIFS],
    [ExcelMinifs, FUNCTION_NAMES_STATISTICAL.MINIFS],
    [ExcelModeSngl, FUNCTION_NAMES_STATISTICAL.MODE_SNGL],
    [ExcelModeSngl, FUNCTION_NAMES_COMPATIBILITY.MODE],
    [ExcelModeMult, FUNCTION_NAMES_STATISTICAL.MODE_MULT],
    [ExcelRankAvg, FUNCTION_NAMES_STATISTICAL.RANK_AVG],
    [ExcelRankEq, FUNCTION_NAMES_STATISTICAL.RANK_EQ],
    [ExcelRankEq, FUNCTION_NAMES_COMPATIBILITY.RANK],
    [observationStatistic('average'), FUNCTION_NAMES_STATISTICAL.AVERAGEA],
    [ExcelAvedev, FUNCTION_NAMES_STATISTICAL.AVEDEV],
    [observationStatistic('deviation'), FUNCTION_NAMES_STATISTICAL.DEVSQ],
    [observationStatistic('variance', true), FUNCTION_NAMES_STATISTICAL.VARA],
    [observationStatistic('variance'), FUNCTION_NAMES_STATISTICAL.VARPA],
    [observationStatistic('variance', true, true), FUNCTION_NAMES_STATISTICAL.STDEVA],
    [observationStatistic('variance', false, true), FUNCTION_NAMES_STATISTICAL.STDEVPA],
    [ExcelSampleVariance, FUNCTION_NAMES_STATISTICAL.VAR_S],
    [ExcelSampleVariance, FUNCTION_NAMES_COMPATIBILITY.VAR],
    [ExcelPopulationVariance, FUNCTION_NAMES_STATISTICAL.VAR_P],
    [ExcelPopulationVariance, FUNCTION_NAMES_COMPATIBILITY.VARP],
    [ExcelSampleDeviation, FUNCTION_NAMES_STATISTICAL.STDEV_S],
    [ExcelSampleDeviation, FUNCTION_NAMES_COMPATIBILITY.STDEV],
    [ExcelPopulationDeviation, FUNCTION_NAMES_STATISTICAL.STDEV_P],
    [ExcelPopulationDeviation, FUNCTION_NAMES_COMPATIBILITY.STDEVP],
    [observationStatistic('skewness', true), FUNCTION_NAMES_STATISTICAL.SKEW],
    [observationStatistic('skewness'), FUNCTION_NAMES_STATISTICAL.SKEW_P],
    [observationStatistic('kurtosis', true), FUNCTION_NAMES_STATISTICAL.KURT],
];
