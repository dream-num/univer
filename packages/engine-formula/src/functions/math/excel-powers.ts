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
import { cancelsToZero } from '../../basics/math';
import { EXCEL_MIN_NORMAL_NUMBER, excelPowerValue } from '../../engine/utils/math-kit';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { mapFinancialScalars, resolveSingleCellArgument } from '../financial/scalar-arguments';
import { FUNCTION_NAMES_MATH } from './function-names';
import { Randarray } from './randarray';
import { Randbetween } from './randbetween';
import { Sum } from './sum';

function normalIntermediate(value: number): number {
    return Math.abs(value) < EXCEL_MIN_NORMAL_NUMBER ? 0 : value;
}

function numberResult(value: number): BaseValueObject {
    return Number.isFinite(value) ? NumberValueObject.create(value + 0) : ErrorValueObject.create(ErrorType.NUM);
}

function coerceNumber(value: BaseValueObject): BaseValueObject {
    return value.isError() ? value : value.convertToNumberObjectValue();
}

function strictNumber(value: BaseValueObject): BaseValueObject {
    if (value instanceof NullValueObject && value.isOmitted()) return ErrorValueObject.create(ErrorType.NA);
    return value.isBoolean() ? ErrorValueObject.create(ErrorType.VALUE) : coerceNumber(value);
}

class ExcelPower extends BaseFunction {
    override minParams = 2;
    override maxParams = 2;

    override calculate(...args: BaseValueObject[]): BaseValueObject {
        return mapFinancialScalars(args, ([base, exponent]) => {
            const number = coerceNumber(base);
            if (number.isError()) return number;
            const power = coerceNumber(exponent);
            if (power.isError()) return power;
            return NumberValueObject.createPowerResult(Number(number.getValue()), Number(power.getValue()));
        });
    }
}

class ExcelSum extends Sum {
    override calculate(...variants: BaseValueObject[]): BaseValueObject {
        let previousTotal = 0;
        let last = 0;
        const add = (value: number) => {
            previousTotal += last;
            last = value;
        };
        for (const variant of variants) {
            const input = this._legacyImplicitDerivedArray(variant);
            if (input.isArray()) {
                let error: BaseValueObject | undefined;
                (input as ArrayValueObject).iterator((value) => {
                    if (value?.isError()) {
                        error = value;
                        return false;
                    }
                    if (value?.isNumber()) add(Number(value.getValue()));
                    return true;
                });
                if (error) return error;
            } else {
                const value = coerceNumber(input);
                if (value.isError()) return value;
                add(Number(value.getValue()));
            }
        }
        const result = previousTotal + last;
        return numberResult(cancelsToZero(previousTotal, last, result, false) ? 0 : result);
    }
}

function numericAggregate(isProduct: boolean) {
    return class ExcelNumericAggregate extends BaseFunction {
        override minParams = 1;
        override maxParams = 255;
        override lazyIfReferenceArrayArgumentIndexes = Array.from({ length: this.maxParams }, (_, index) => index);

        override calculate(...variants: BaseValueObject[]): BaseValueObject {
            let result = isProduct ? 1 : 0;
            let found = false;
            const add = (value: number) => {
                found = true;
                result = isProduct
                    ? normalIntermediate(result * value)
                    : result + normalIntermediate(value * value);
            };
            for (const variant of variants) {
                if (variant.isArray()) {
                    let error: BaseValueObject | undefined;
                    (variant as ArrayValueObject).iterator((value) => {
                        if (value?.isError()) {
                            error = value;
                            return false;
                        }
                        if (value?.isNumber()) add(Number(value.getValue()));
                    });
                    if (error) return error;
                } else if (!variant.isNull()) {
                    const scalar = coerceNumber(variant);
                    if (scalar.isError()) return scalar;
                    add(Number(scalar.getValue()));
                }
            }
            return numberResult(found ? result : 0);
        }
    };
}

class ExcelSqrtpi extends BaseFunction {
    override minParams = 1;
    override maxParams = 1;
    override rejectsMultiCellReference = true;

    override calculate(value: BaseValueObject): BaseValueObject {
        return mapFinancialScalars([value], ([cell]) => {
            const input = strictNumber(cell);
            return input.isError() ? input : numberResult(Math.sqrt(Number(input.getValue()) * Math.PI));
        });
    }
}

function seriesValue(base: number, initialExponent: number, step: number, coefficients: BaseValueObject): BaseValueObject {
    let exponent = initialExponent;
    let result = 0;
    const term = (coefficient: number) => {
        if (!(base < 0 && !Number.isInteger(exponent))) {
            const factor = excelPowerValue(base, exponent);
            if (typeof factor !== 'number') return ErrorValueObject.create(ErrorType.NUM);
            result += normalIntermediate(factor * coefficient);
            if (!Number.isFinite(result)) return ErrorValueObject.create(ErrorType.NUM);
        }
        exponent += step;
    };

    if (!coefficients.isArray()) {
        const coefficient = strictNumber(coefficients);
        if (coefficient.isError()) return coefficient;
        return term(Number(coefficient.getValue())) ?? numberResult(result);
    }
    let error: BaseValueObject | undefined;
    (coefficients as ArrayValueObject).iterator((coefficient) => {
        if (coefficient?.isError()) {
            error = coefficient;
        } else if (coefficient == null || coefficient.isNull() || coefficient.isNumber()) {
            error = term(Number(coefficient?.getValue() ?? 0));
        } else {
            error = ErrorValueObject.create(ErrorType.VALUE);
        }
        if (error) return false;
    });
    return error ?? numberResult(result);
}

class ExcelSeriesSum extends BaseFunction {
    override minParams = 4;
    override maxParams = 4;
    override needsReferenceObject = true;

    override calculate(x: FunctionVariantType, n: FunctionVariantType, m: FunctionVariantType, coefficients: FunctionVariantType): BaseValueObject {
        const scalars = [x, n, m].map(resolveSingleCellArgument);
        let values = coefficients as BaseValueObject;
        if (coefficients.isReferenceObject()) {
            const reference = coefficients as BaseReferenceObject;
            values = reference.getRowCount() === 1 && reference.getColumnCount() === 1
                ? resolveSingleCellArgument(reference)
                : reference.toArrayValueObject();
        }
        return mapFinancialScalars(scalars, (cells) => {
            const args: number[] = [];
            for (const cell of cells) {
                const value = strictNumber(cell);
                if (value.isError()) return value;
                args.push(Number(value.getValue()));
            }
            return seriesValue(args[0], args[1], args[2], values);
        });
    }
}

class ExcelRandarray extends Randarray {
    protected override readonly excelCompatibility = true;
}

class ExcelRandbetween extends Randbetween {
    protected override readonly excelCompatibility = true;
}

export const excelPowerFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelPower, FUNCTION_NAMES_MATH.POWER],
    [ExcelSum, FUNCTION_NAMES_MATH.SUM],
    [numericAggregate(true), FUNCTION_NAMES_MATH.PRODUCT],
    [numericAggregate(false), FUNCTION_NAMES_MATH.SUMSQ],
    [ExcelSeriesSum, FUNCTION_NAMES_MATH.SERIESSUM],
    [ExcelSqrtpi, FUNCTION_NAMES_MATH.SQRTPI],
    [ExcelRandarray, FUNCTION_NAMES_MATH.RANDARRAY],
    [ExcelRandbetween, FUNCTION_NAMES_MATH.RANDBETWEEN],
];
