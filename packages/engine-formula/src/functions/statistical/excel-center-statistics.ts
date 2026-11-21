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
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { Average } from './average';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';
import { Median } from './median';

const MIN_NORMAL = 2 ** -1022;

function numberResult(value: number): BaseValueObject {
    return Number.isFinite(value) ? NumberValueObject.create(value + 0) : ErrorValueObject.create(ErrorType.NUM);
}

function scalarNumber(value: BaseValueObject): BaseValueObject {
    return value.isNumber() || value.isError() ? value : value.convertToNumberObjectValue();
}

function visitNumbers(args: BaseValueObject[], record: (value: number) => void): ErrorValueObject | undefined {
    // Direct arguments are validated before any referenced or array cells.
    for (const [index, argument] of args.entries()) {
        if (argument.isArray()) continue;
        const number = scalarNumber(argument);
        if (number.isError()) return number as ErrorValueObject;
        args[index] = number;
    }
    for (const argument of args) {
        if (!argument.isArray()) {
            record(Number(argument.getValue()));
            continue;
        }
        let error: ErrorValueObject | undefined;
        (argument as ArrayValueObject).iterator((cell) => {
            if (cell?.isError()) {
                error = cell as ErrorValueObject;
                return false;
            }
            if (cell?.isNumber()) record(Number(cell.getValue()));
        });
        if (error) return error;
    }
}

class ExcelAverage extends Average {
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        let sum = 0;
        let count = 0;
        const error = visitNumbers(args.map((argument) => this._legacyImplicitDerivedArray(argument)), (number) => {
            sum += number;
            count++;
        });
        if (error) return error;
        return count === 0 ? ErrorValueObject.create(ErrorType.DIV_BY_ZERO) : numberResult(sum / count);
    }
}

class ExcelMedian extends Median {
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        const values: number[] = [];
        const error = visitNumbers(args, (number) => values.push(number));
        if (error) return error;
        if (values.length === 0) return ErrorValueObject.create(ErrorType.NUM);
        values.sort((left, right) => left - right);
        const middle = Math.floor(values.length / 2);
        if (values.length % 2 !== 0) return numberResult(values[middle]);
        const left = values[middle - 1];
        const right = values[middle];
        const sum = left + right;
        return numberResult(Number.isFinite(sum) ? sum / 2 : left / 2 + right / 2);
    }
}

function positiveMean(harmonic: boolean) {
    return class ExcelPositiveMean extends BaseFunction {
        override minParams = 1;
        override maxParams = 255;

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            let sum = 0;
            let correction = 0;
            let count = 0;
            let first = 0;
            let identical = true;
            let nonPositive = false;
            const error = visitNumbers(args, (number) => {
                if (count === 0) first = number;
                identical &&= number === first;
                count++;
                if (number <= 0) {
                    nonPositive = true;
                } else if (harmonic) {
                    const reciprocal = 1 / number;
                    if (reciprocal >= MIN_NORMAL) sum += reciprocal;
                } else {
                    const log = Math.log(number) - correction;
                    const next = sum + log;
                    correction = (next - sum) - log;
                    sum = next;
                }
            });
            if (error) return error;
            if (nonPositive || !Number.isFinite(sum)) return ErrorValueObject.create(ErrorType.NUM);
            if (count === 0) return ErrorValueObject.create(harmonic ? ErrorType.NA : ErrorType.NUM);
            if (!harmonic) return numberResult(identical ? first : Math.exp(sum / count));
            return sum === 0 ? ErrorValueObject.create(ErrorType.DIV_BY_ZERO) : numberResult(count / sum);
        }
    };
}

class ExcelTrimmean extends BaseFunction {
    override minParams = 2;
    override maxParams = 2;

    override calculate(data: BaseValueObject, percent: BaseValueObject): BaseValueObject {
        const values: number[] = [];
        const dataError = visitNumbers([data], (number) => values.push(number));
        let sorted: number[] | undefined;
        const calculate = (value: BaseValueObject) => {
            if (!data.isArray() && dataError) return dataError;
            const number = scalarNumber(value);
            if (number.isError()) return number;
            if (dataError) return dataError;
            const fraction = Number(number.getValue());
            if (values.length === 0 || fraction < 0 || fraction >= 1) return ErrorValueObject.create(ErrorType.NUM);

            const trim = Math.floor(values.length * fraction / 2);
            if (trim === 0) return numberResult(values.reduce((sum, value) => sum + value, 0) / values.length);
            sorted ??= values.slice().sort((left, right) => left - right);
            const low = sorted[trim];
            const high = sorted[values.length - trim - 1];
            let lowTies = trim;
            let highTies = trim;
            let sum = 0;
            // Excel sums the inclusive range in input order before removing boundary ties.
            for (const value of values) {
                if (value < low) lowTies--;
                else if (value > high) highTies--;
                else sum += value;
            }
            for (let index = 0; index < lowTies; index++) sum -= low;
            for (let index = 0; index < highTies; index++) sum -= high;
            return numberResult(sum / (values.length - 2 * trim));
        };
        if (!percent.isArray()) return calculate(percent);
        const result = (percent as ArrayValueObject).mapValue(calculate);
        return result.getRowCount() === 1 && result.getColumnCount() === 1 ? result.getFirstCell() : result;
    }
}

export const excelCenterStatisticsFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelAverage, FUNCTION_NAMES_STATISTICAL.AVERAGE],
    [ExcelMedian, FUNCTION_NAMES_STATISTICAL.MEDIAN],
    [positiveMean(false), FUNCTION_NAMES_STATISTICAL.GEOMEAN],
    [positiveMean(true), FUNCTION_NAMES_STATISTICAL.HARMEAN],
    [ExcelTrimmean, FUNCTION_NAMES_STATISTICAL.TRIMMEAN],
];
