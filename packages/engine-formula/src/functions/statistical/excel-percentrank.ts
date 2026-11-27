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
import { ErrorType } from '../../basics/error-type';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { expandArrayValueObject } from '../../engine/utils/array-object';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_COMPATIBILITY } from '../compatibility/function-names';
import { FUNCTION_NAMES_STATISTICAL } from './function-names';

function rankInput(value: FunctionVariantType): BaseValueObject {
    return value.isReferenceObject()
        ? (value as BaseReferenceObject).toArrayValueObject()
        : value as BaseValueObject;
}

function sortedNumbers(input: FunctionVariantType): number[] | BaseValueObject {
    if (input instanceof MultiAreaReferenceObject) return ErrorValueObject.create(ErrorType.VALUE);
    const value = rankInput(input);
    if (!value.isArray()) {
        const converted = value.convertToNumberObjectValue();
        return converted.isError() ? converted : [Number(converted.getValue())];
    }
    const numbers: number[] = [];
    let error: BaseValueObject | undefined;
    (value as ArrayValueObject).iterator((cell) => {
        if (cell?.isError()) {
            error = cell;
            return false;
        }
        if (cell?.isNumber()) numbers.push(Number(cell.getValue()));
        return true;
    });
    return error ?? numbers.sort((left, right) => left - right);
}

function percentrank(values: number[], x: number, significance: number, exclusive: boolean): BaseValueObject {
    const count = values.length;
    if (count === 0 || !Number.isFinite(x) || x < values[0] || x > values[count - 1]) {
        return ErrorValueObject.create(ErrorType.NA);
    }
    if (count === 1) return NumberValueObject.create(1);
    if (significance < 1) return ErrorValueObject.create(ErrorType.NUM);
    if (significance >= 309) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);

    let upper = count;
    let low = 0;
    while (low < upper) {
        const middle = Math.floor((low + upper) / 2);
        if (values[middle] < x) {
            low = middle + 1;
        } else {
            upper = middle;
        }
    }
    const lower = upper - 1;
    const index = values[upper] === x
        ? upper
        : lower + (x - values[lower]) / (values[upper] - values[lower]);
    const rank = exclusive ? (index + 1) / (count + 1) : index / (count - 1);
    const factor = 10 ** significance;
    return NumberValueObject.create(Math.trunc(rank * factor) / factor);
}

class ExcelPercentrank extends BaseFunction {
    override minParams = 2;
    override maxParams = 3;
    override needsReferenceObject = true;
    protected readonly _exclusive: boolean = false;

    override calculate(array: FunctionVariantType, xInput: FunctionVariantType, significanceInput?: FunctionVariantType): BaseValueObject {
        const values = sortedNumbers(array);
        const x = rankInput(xInput);
        const precisionInput = significanceInput == null ? undefined : rankInput(significanceInput);
        const significance = precisionInput == null || precisionInput.isNull() ? NumberValueObject.create(3) : precisionInput;
        const calculate = (query: BaseValueObject, precision: BaseValueObject) => {
            if (query.isError()) return query;
            if (precision.isError()) return precision;
            const number = query.convertToNumberObjectValue();
            if (number.isError()) return number;
            const digits = precision.convertToNumberObjectValue();
            if (digits.isError()) return digits;
            return Array.isArray(values)
                ? percentrank(values, Number(number.getValue()), Math.trunc(Number(digits.getValue())), this._exclusive)
                : values;
        };
        if (!x.isArray() && !significance.isArray()) return calculate(x, significance);

        const rows = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            significance.isArray() ? (significance as ArrayValueObject).getRowCount() : 1
        );
        const columns = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            significance.isArray() ? (significance as ArrayValueObject).getColumnCount() : 1
        );
        const missing = ErrorValueObject.create(ErrorType.NA);
        const query = expandArrayValueObject(rows, columns, x, missing);
        const precision = expandArrayValueObject(rows, columns, significance, missing);
        const result = query.mapValue((value, row, column) => calculate(value, precision.get(row, column) ?? missing));
        return rows === 1 && columns === 1 ? result.get(0, 0) ?? missing : result;
    }
}

class ExcelPercentrankExc extends ExcelPercentrank {
    protected override readonly _exclusive = true;
}

export const excelPercentrankFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelPercentrank, FUNCTION_NAMES_COMPATIBILITY.PERCENTRANK],
    [ExcelPercentrank, FUNCTION_NAMES_STATISTICAL.PERCENTRANK_INC],
    [ExcelPercentrankExc, FUNCTION_NAMES_STATISTICAL.PERCENTRANK_EXC],
];
