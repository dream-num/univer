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
import { calculateNpv } from '../../basics/financial';
import { MultiAreaReferenceObject } from '../../engine/reference-object/multi-area-reference-object';
import { getCurrencyFormat } from '../../engine/utils/numfmt-kit';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { compoundQuotient } from './excel-rate';
import { FUNCTION_NAMES_FINANCIAL } from './function-names';
import { ExcelPduration } from './pduration';
import { mapFinancialScalars, resolveSingleCellArgument } from './scalar-arguments';

function numericValue(value: BaseValueObject): number | BaseValueObject {
    const number = value.isString() ? value.convertToNumberObjectValue() : value;
    return number.isError() ? number : Number(number.getValue());
}

function readCashflows(inputs: BaseValueObject[], acceptScalars: boolean): number[] | BaseValueObject {
    const amounts: number[] = [];
    for (const input of inputs) {
        if (input.isArray()) {
            let error: BaseValueObject | undefined;
            (input as ArrayValueObject).iterator((item) => {
                if (item?.isError()) {
                    error = item;
                    return false;
                }
                if (item?.isNumber()) amounts.push(Number(item.getValue()));
                return true;
            });
            if (error) return error;
        } else if (acceptScalars) {
            const amount = numericValue(input);
            if (typeof amount !== 'number') return amount;
            amounts.push(amount);
        }
    }
    return amounts;
}

class ExcelNpv extends BaseFunction {
    override minParams = 2;
    override maxParams = 255;
    override needsLocale = true;

    override calculate(rate: BaseValueObject, ...values: BaseValueObject[]): BaseValueObject {
        const amounts = readCashflows(values, true);
        return mapFinancialScalars([rate], ([rateValue], row, column) => {
            const rate = numericValue(rateValue);
            if (typeof rate !== 'number') return rate;
            if (!Array.isArray(amounts)) return amounts;
            if (rate === -1) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            const result = calculateNpv(rate, amounts);
            if (!Number.isFinite(result)) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            return NumberValueObject.create(result, row === 0 && column === 0 ? getCurrencyFormat(this.getLocale()) : undefined);
        });
    }
}

function calculateMirr(amounts: number[], financeRate: number, reinvestRate: number): number | ErrorValueObject {
    if (amounts.length < 2 || reinvestRate === -1) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
    let pv = 0;
    let fv = 0;
    for (let index = 0; index < amounts.length; index++) {
        const amount = amounts[index];
        if (amount < 0) pv += amount / (1 + financeRate) ** index;
        if (amount > 0) fv += amount * (1 + reinvestRate) ** (amounts.length - index - 1);
    }
    if (pv === 0 || !Number.isFinite(pv)) return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
    const result = (-fv / pv) ** (1 / (amounts.length - 1)) - 1;
    return Number.isFinite(result) ? result : ErrorValueObject.create(ErrorType.NUM);
}

class ExcelMirr extends BaseFunction {
    override minParams = 3;
    override maxParams = 3;

    override calculate(values: BaseValueObject, financeRate: BaseValueObject, reinvestRate: BaseValueObject): BaseValueObject {
        const amounts = readCashflows([values], false);
        return mapFinancialScalars([financeRate, reinvestRate], (rates, row, column) => {
            if (values.isError()) return values;
            const finance = numericValue(rates[0]);
            if (typeof finance !== 'number') return finance;
            const reinvest = numericValue(rates[1]);
            if (typeof reinvest !== 'number') return reinvest;
            if (!Array.isArray(amounts)) return amounts;
            if (values.isNull()) return ErrorValueObject.create(ErrorType.VALUE);
            const result = calculateMirr(amounts, finance, reinvest);
            return typeof result === 'number'
                ? NumberValueObject.create(result, row === 0 && column === 0 ? '0%' : undefined)
                : result;
        });
    }
}

function irrDiscount(rate: number): number {
    return -rate / (1 + rate);
}

function irrNpv(amounts: number[], discount: number): number {
    const period = 1 / (1 + discount);
    if (!Number.isFinite(period)) return NaN;
    let factor = 1;
    let total = 0;
    for (const amount of amounts) {
        total += amount / factor;
        factor *= period;
    }
    return total;
}

function irrSecant(amounts: number[], guess: number): number | undefined {
    const offset = 0.001;
    const tolerance = 1e-7;
    const fallbackTolerance = 1e-4;
    let previous = guess;
    let previousNpv = irrNpv(amounts, previous);
    let current = previous + (previousNpv < 0 ? -offset : offset);
    let currentNpv = irrNpv(amounts, current);
    // Each Excel iteration advances the secant twice.
    for (let step = 0; step < 200; step++) {
        if (!Number.isFinite(previousNpv) || !Number.isFinite(currentNpv)) return;
        if (Math.abs(currentNpv) <= tolerance && Math.abs(current - previous) <= tolerance) {
            return current - tolerance > -1 ? compoundQuotient(1, 1 + current) - 1 : undefined;
        }
        if (currentNpv === previousNpv) {
            previous += previous > current ? offset : -offset;
            previousNpv = irrNpv(amounts, previous);
            if (!Number.isFinite(previousNpv) || currentNpv === previousNpv) return;
        }
        const next = current - ((current - previous) * currentNpv) / (currentNpv - previousNpv);
        previous = current;
        previousNpv = currentNpv;
        current = next;
        currentNpv = irrNpv(amounts, current);
    }
    if (Math.abs(currentNpv) <= fallbackTolerance && Math.abs(current - previous) <= fallbackTolerance && current - fallbackTolerance > -1) {
        return compoundQuotient(1, 1 + current) - 1;
    }
}

function solveIrr(cashflows: number[], discount: number): number | undefined {
    if (!cashflows.some((value) => value > 0) || !cashflows.some((value) => value < 0)) return;
    const first = cashflows.findIndex((value) => value !== 0);
    const amounts = first === 0 ? cashflows : cashflows.slice(first);
    // Solve for the discount first to preserve the convergence near a zero rate.
    for (const guess of [discount, irrDiscount(0.1), irrDiscount(-0.09090909090909091), irrDiscount(2)]) {
        const result = irrSecant(amounts, guess);
        if (result !== undefined) return result;
    }
}

class ExcelIrr extends BaseFunction {
    override minParams = 1;
    override maxParams = 2;
    override needsReferenceObject = true;

    override calculate(valueArg: FunctionVariantType, guessArg?: FunctionVariantType): BaseValueObject {
        if (valueArg.isError()) return valueArg as BaseValueObject;
        const values = this._resolveArgument(valueArg);
        const amounts = readCashflows([values], false);
        const guess = guessArg === undefined ? NumberValueObject.create(0.1) : this._resolveArgument(guessArg);
        return mapFinancialScalars([guess], ([value], row, column) => {
            const rate = numericValue(value);
            if (typeof rate !== 'number') return rate;
            const discount = irrDiscount(rate);
            if (!Number.isFinite(discount) || discount <= -1 || !Array.isArray(amounts)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
            const result = solveIrr(amounts, discount);
            return result === undefined
                ? ErrorValueObject.create(ErrorType.NUM)
                : NumberValueObject.create(result, row === 0 && column === 0 ? '0%' : undefined);
        });
    }

    private _resolveArgument(value: FunctionVariantType): BaseValueObject {
        return value.isReferenceObject() ? (value as BaseReferenceObject).toArrayValueObject() : value as BaseValueObject;
    }
}

function scheduleFactor(schedule: BaseValueObject): number | BaseValueObject {
    if (schedule.isArray()) {
        let factor = 1;
        let error: BaseValueObject | undefined;
        (schedule as ArrayValueObject).iterator((rate) => {
            if (!rate || rate.isNull()) return true;
            if (rate.isNumber()) {
                factor *= 1 + Number(rate.getValue());
                return true;
            }
            error = rate.isError() ? rate : ErrorValueObject.create(ErrorType.VALUE);
            return false;
        });
        return error ?? factor;
    }
    if (schedule.isNull() && (schedule as NullValueObject).isOmitted()) return ErrorValueObject.create(ErrorType.NA);
    if (schedule.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
    const rate = numericValue(schedule);
    return typeof rate === 'number' ? 1 + rate : rate;
}

class ExcelFvschedule extends BaseFunction {
    override minParams = 2;
    override maxParams = 2;
    override needsReferenceObject = true;

    override calculate(principalArg: FunctionVariantType, scheduleArg: FunctionVariantType): BaseValueObject {
        const principal = resolveSingleCellArgument(principalArg);
        let schedule: BaseValueObject;
        if (scheduleArg instanceof MultiAreaReferenceObject && !scheduleArg.isArrayOfReferences()) {
            schedule = ErrorValueObject.create(ErrorType.VALUE);
        } else if (scheduleArg.isReferenceObject()) {
            const array = (scheduleArg as BaseReferenceObject).toArrayValueObject();
            schedule = array.getRowCount() === 1 && array.getColumnCount() === 1 ? array.getFirstCell() : array;
        } else {
            schedule = scheduleArg as BaseValueObject;
        }
        const factor = scheduleFactor(schedule);
        return mapFinancialScalars([principal], ([value]) => {
            if (value.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
            const amount = numericValue(value);
            if (typeof amount !== 'number') return amount;
            if (typeof factor !== 'number') return factor;
            const result = amount * factor;
            return NumberValueObject.create(Number.isFinite(result) ? result + 0 : 0);
        });
    }
}

export const excelCashFlowFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelFvschedule, FUNCTION_NAMES_FINANCIAL.FVSCHEDULE],
    [ExcelIrr, FUNCTION_NAMES_FINANCIAL.IRR],
    [ExcelNpv, FUNCTION_NAMES_FINANCIAL.NPV],
    [ExcelMirr, FUNCTION_NAMES_FINANCIAL.MIRR],
    [ExcelPduration, FUNCTION_NAMES_FINANCIAL.PDURATION],
];
