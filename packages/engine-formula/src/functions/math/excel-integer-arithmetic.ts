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

import type { IFunctionNames } from '../../basics/function';
import type { IUniverEngineFormulaConfig } from '../../config/config';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { ErrorType } from '../../basics/error-type';
import { calculateGcd } from '../../basics/math';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars } from '../financial/scalar-arguments';
import { FUNCTION_NAMES_MATH } from './function-names';

const MAX_INTEGER = 2 ** 53;
const MOD_QUOTIENT_LIMIT = 1_125_900_000_000;
const ROUND_MULTIPLE_MIDPOINT = 0.5 - 5e-15;

function coerceNumber(value: BaseValueObject, allowLogical = false): number | ErrorValueObject {
    if (!allowLogical && value.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
    if (value.isError()) return value as ErrorValueObject;
    const number = value.convertToNumberObjectValue();
    return number.isError() ? number as ErrorValueObject : Number(number.getValue());
}

function gcdOrLcm(variants: BaseValueObject[], isLcm: boolean): BaseValueObject {
    const first = variants[0];
    if (first instanceof NullValueObject && first.isOmitted()) return ErrorValueObject.create(ErrorType.NA);
    let result = isLcm ? 1 : 0;
    let found = false;
    let invalid = false;
    let error: ErrorValueObject | undefined;
    const visit = (value: BaseValueObject | null | undefined) => {
        found = true;
        const number = value == null ? 0 : coerceNumber(value);
        if (typeof number !== 'number') {
            error = number;
            return false;
        }
        if (number < 0 || number > MAX_INTEGER) {
            invalid = true;
            return;
        }
        const integer = Math.trunc(number);
        if (!isLcm) {
            result = calculateGcd(result, integer);
        } else if (result === 0 || integer === 0) {
            result = 0;
        } else if (Number.isFinite(result)) {
            const reduced = result / calculateGcd(result, integer);
            const product = reduced * integer;
            result = product > MAX_INTEGER ? Infinity : product;
        }
    };

    for (const variant of variants) {
        if (variant.isArray()) {
            const array = variant as ArrayValueObject;
            if (array.getRowCount() * array.getColumnCount() === 1 && array.getFirstCell().isNull()) continue;
            array.iterator((value) => visit(value ?? null));
        } else if (!variant.isNull()) {
            visit(variant);
        }
        if (error) return error;
    }

    if (!found) return ErrorValueObject.create(ErrorType.VALUE);
    return invalid || !Number.isFinite(result) ? ErrorValueObject.create(ErrorType.NUM) : NumberValueObject.create(result);
}

class ExcelGcd extends BaseFunction {
    override minParams = 1;
    override maxParams = 255;
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return gcdOrLcm(args, false);
    }
}

class ExcelLcm extends ExcelGcd {
    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return gcdOrLcm(args, true);
    }
}

type Operation = 'mod' | 'mround' | 'quotient';

interface IExcelBinaryArithmetic extends BaseFunction {
    calculate(...args: BaseValueObject[]): BaseValueObject;
}

function binaryArithmetic(kind: Operation): new (name: IFunctionNames) => IExcelBinaryArithmetic {
    return class ExcelBinaryArithmetic extends BaseFunction {
        override minParams = 2;
        override maxParams = 2;
        override rejectsMultiCellReference = kind === 'mround';

        override calculate(...args: BaseValueObject[]): BaseValueObject {
            return mapFinancialScalars(args, ([left, right]) => {
                const coerce = (value: BaseValueObject) => kind !== 'mod' && value instanceof NullValueObject && value.isOmitted()
                    ? ErrorValueObject.create(ErrorType.NA)
                    : coerceNumber(value, kind === 'mod');
                const number = coerce(left);
                if (typeof number !== 'number') return number;
                const multiple = coerce(right);
                if (typeof multiple !== 'number') return multiple;
                if (multiple === 0) {
                    return kind === 'mround' ? NumberValueObject.create(0) : ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
                }
                const ratio = number / multiple;
                if (!Number.isFinite(ratio)) return ErrorValueObject.create(ErrorType.NUM);
                if (kind === 'mod') {
                    if (Math.abs(ratio) >= MOD_QUOTIENT_LIMIT) return ErrorValueObject.create(ErrorType.NUM);
                    const remainder = number % multiple;
                    const adjusted = remainder !== 0 && Math.sign(remainder) !== Math.sign(multiple) ? remainder + multiple : remainder;
                    return NumberValueObject.create(adjusted === multiple ? 0 : adjusted + 0);
                }
                const whole = Math.trunc(ratio);
                if (kind === 'quotient') return NumberValueObject.create(whole + 0);
                if (number !== 0 && Math.sign(number) !== Math.sign(multiple)) return ErrorValueObject.create(ErrorType.NUM);

                const rounded = whole + Number(ratio - whole >= ROUND_MULTIPLE_MIDPOINT);
                const result = rounded * multiple;
                return Number.isFinite(result) ? NumberValueObject.create(result + 0) : ErrorValueObject.create(ErrorType.NUM);
            });
        }
    };
}

export const ExcelQuotient = binaryArithmetic('quotient');

export const excelIntegerArithmeticFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelGcd, FUNCTION_NAMES_MATH.GCD],
    [ExcelLcm, FUNCTION_NAMES_MATH.LCM],
    [binaryArithmetic('mod'), FUNCTION_NAMES_MATH.MOD],
    [binaryArithmetic('mround'), FUNCTION_NAMES_MATH.MROUND],
];
