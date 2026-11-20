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
import type { FunctionVariantType } from '../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import { DateSystem, EXCEL_1904_OFFSET, excelSerialToDateTimeParts } from '@univerjs/core';
import { getDaysInMonth, getFinancialDateSerialNumberByObject, getFinancialNumberByObject, getDateSerialNumberByObject, getTwoDateDaysByBasis, isLeapYear } from '../../basics/date';
import { ErrorType } from '../../basics/error-type';
import { calculateDDB } from '../../basics/financial';
import { expandArrayValueObject } from '../../engine/utils/array-object';
import { checkVariantsErrorIsArrayOrBoolean, checkVariantsErrorIsStringToNumber } from '../../engine/utils/check-variant-error';
import { round } from '../../engine/utils/math-kit';
import { getCurrencyFormat } from '../../engine/utils/numfmt-kit';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { FUNCTION_NAMES_FINANCIAL } from './function-names';
import { mapFinancialScalars, resolveSingleCellArgument } from './scalar-arguments';

abstract class ExcelDepreciationFunction extends BaseFunction {
    override needsLocale = true;

    override calculate(...input: BaseValueObject[]): BaseValueObject {
        return mapFinancialScalars(input, (args, row, column) => {
            const { variants, errorObject } = checkVariantsErrorIsStringToNumber(...args);
            if (errorObject) return errorObject;
            const result = this._calculateValue(variants!.map((value) => Number(value.getValue())));
            if (typeof result !== 'number') return result;
            if (!Number.isFinite(result)) return ErrorValueObject.create(ErrorType.NUM);
            return NumberValueObject.create(result, row === 0 && column === 0 ? getCurrencyFormat(this.getLocale()) : undefined);
        });
    }

    protected abstract _calculateValue(values: number[]): number | ErrorValueObject;
}

class ExcelSln extends ExcelDepreciationFunction {
    override minParams = 3;

    override maxParams = 3;

    protected _calculateValue([cost, salvage, life]: number[]): number | ErrorValueObject {
        return life === 0 ? ErrorValueObject.create(ErrorType.DIV_BY_ZERO) : (cost - salvage) / life;
    }
}

class ExcelSyd extends ExcelDepreciationFunction {
    override minParams = 4;

    override maxParams = 4;

    protected _calculateValue([cost, salvage, life, period]: number[]): number | ErrorValueObject {
        if (salvage < 0 || life <= 0 || period <= 0 || period > life) return ErrorValueObject.create(ErrorType.NUM);
        return (cost - salvage) * (life - period + 1) * 2 / (life * (life + 1));
    }
}

class ExcelDb extends ExcelDepreciationFunction {
    override minParams = 4;

    override maxParams = 5;

    protected _calculateValue([cost, salvage, life, period, suppliedMonths = 12]: number[]): number | ErrorValueObject {
        const months = Math.floor(suppliedMonths);
        const wholeLife = Math.floor(life);
        const wholePeriod = Math.floor(period);
        const lastPeriod = wholeLife + (months < 12 ? 1 : 0);
        if (cost < 0 || salvage < 0 || life <= 0 || period <= 0 || wholePeriod > lastPeriod || months < 1 || months > 12) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        if (cost === 0) return 0;
        const rawRate = Number((1 - (salvage / cost) ** (1 / life)).toPrecision(15));
        const rate = Math.sign(rawRate) * round(Math.abs(rawRate), 3);
        const first = cost * rate * months / 12;
        if (period < 1 || (wholePeriod === 1 && wholeLife >= 1)) return first;
        const depreciation = (cost - first) * (1 - rate) ** Math.max(0, wholePeriod - 2) * rate;
        return wholePeriod > wholeLife ? depreciation * (12 - months) / 12 : depreciation;
    }
}

class ExcelDdb extends ExcelDepreciationFunction {
    override minParams = 4;

    override maxParams = 5;

    protected _calculateValue([cost, salvage, life, period, factor = 2]: number[]): number | ErrorValueObject {
        if (cost < 0 || salvage < 0 || life <= 0 || period <= 0 || period > life || factor <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        return calculateDDB(cost, salvage, life, Math.max(period, 1), factor);
    }
}

interface ICalendarDate {
    year: number;
    month: number;
    day: number;
}

function firstPeriodYears(purchase: number, firstEnd: number, basis: number, dateSystem: DateSystem): number {
    // Date arguments and the calendar day-count conversion each apply the workbook offset.
    const offset = dateSystem === DateSystem.Date1904 ? EXCEL_1904_OFFSET : 0;
    const zero = { year: 1900, month: 1, day: 0 };
    const start = purchase === 0 && offset === 0 ? zero : excelSerialToDateTimeParts(purchase + offset, { dateSystem: DateSystem.Date1900 });
    const end = excelSerialToDateTimeParts(firstEnd + offset, { dateSystem: DateSystem.Date1900 });
    if (!start && basis === 1) return NaN;
    if (!start || !end || purchase === firstEnd) return 1;
    if (basis === 0 || basis === 4) {
        return thirtyDayPeriodYears(start, end, basis);
    }
    const year = basis === 1 && isLeapYear(start.year) ? 366 : 365;
    const leapDay = (date: ICalendarDate) => Number(date.month === 2 && date.day === 29 && isLeapYear(date.year));
    const days = firstEnd - purchase + leapDay(start) - leapDay(end);
    return days === 0 ? 1 : days / year;
}

function thirtyDayPeriodYears(start: ICalendarDate, end: ICalendarDate, basis: number): number {
    const startsAtFebruaryEnd = start.month === 2 && start.day === getDaysInMonth(start.year, 1);
    const endsAtFebruaryEnd = end.month === 2 && end.day === getDaysInMonth(end.year, 1);
    const startDay = basis === 0 && startsAtFebruaryEnd ? 30 : Math.min(start.day, 30);
    let endDay = end.day;
    if (basis === 4 || (endDay === 31 && start.day >= 30)) {
        endDay = Math.min(endDay, 30);
    } else if (startsAtFebruaryEnd && endsAtFebruaryEnd) {
        endDay = 30;
    }
    const days = (end.year - start.year) * 360 + (end.month - start.month) * 30 + endDay - startDay;
    return days === 0 ? 1 : days / 360;
}

class ExcelAmorlinc extends BaseFunction {
    override minParams = 6;

    override maxParams = 7;

    override needsReferenceObject = true;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const args = input.map((value, index) => {
            const scalar = resolveSingleCellArgument(value);
            if ((index === 1 || index === 2) && value.isReferenceObject() && scalar.isString()) {
                const serial = getFinancialNumberByObject(scalar, dateSystem);
                return typeof serial === 'number' ? NumberValueObject.create(serial) : serial;
            }
            return scalar;
        });
        return mapFinancialScalars(args, (values) => this._calculate(values, dateSystem));
    }

    private _calculate(args: BaseValueObject[], dateSystem: DateSystem): BaseValueObject {
        const numbers: number[] = [];
        for (let index = 0; index < args.length; index++) {
            const read = index === 1 || index === 2 ? getFinancialDateSerialNumberByObject : getFinancialNumberByObject;
            const value = read(args[index], dateSystem);
            if (typeof value !== 'number') {
                // An omitted day-count basis uses the same default as an absent one.
                if (index === 6 && args[index].isNull()) {
                    numbers.push(0);
                    continue;
                }
                return value;
            }
            numbers.push(value);
        }
        const [cost, purchase, firstEnd, salvage, period, rate, suppliedBasis = 0] = numbers;
        const basis = Math.floor(suppliedBasis);
        if (cost <= 0 || salvage < 0 || salvage > cost || rate <= 0 || period < 0 || purchase > firstEnd || ![0, 1, 3, 4].includes(basis)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const regular = cost * rate;
        const first = regular * firstPeriodYears(purchase, firstEnd, basis, dateSystem);
        const total = cost - salvage;
        const result = period === 0
            ? Math.min(first, total)
            : Math.min(regular, Math.max(0, total - first - Math.max(0, Math.floor(period) - 1) * regular));
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }
}

class ExcelAmordegrc extends BaseFunction {
    override minParams = 6;
    override maxParams = 7;

    override calculate(
        cost: BaseValueObject,
        datePurchased: BaseValueObject,
        firstPeriod: BaseValueObject,
        salvage: BaseValueObject,
        period: BaseValueObject,
        rate: BaseValueObject,
        basis: BaseValueObject = NumberValueObject.create(0)
    ): BaseValueObject {
        const args = [cost, datePurchased, firstPeriod, salvage, period, rate, basis] as const;
        const arrays = args.filter((item): item is ArrayValueObject => item.isArray());
        if (arrays.length === 0) {
            return this._calculateSingle(...args);
        }

        const rowCount = Math.max(...arrays.map((item) => item.getRowCount()));
        const columnCount = Math.max(...arrays.map((item) => item.getColumnCount()));
        const missing = ErrorValueObject.create(ErrorType.NA);
        const [costs, purchases, ends, salvages, periods, rates, bases] = args.map((item) => expandArrayValueObject(rowCount, columnCount, item, missing));
        const result = costs.map((item, row, column) => this._calculateSingle(
            item ?? missing,
            purchases.get(row, column) ?? missing,
            ends.get(row, column) ?? missing,
            salvages.get(row, column) ?? missing,
            periods.get(row, column) ?? missing,
            rates.get(row, column) ?? missing,
            bases.get(row, column) ?? missing
        ));
        return rowCount === 1 && columnCount === 1 ? (result as ArrayValueObject).getFirstCell() : result;
    }

    private _calculateSingle(
        cost: BaseValueObject,
        datePurchased: BaseValueObject,
        firstPeriod: BaseValueObject,
        salvage: BaseValueObject,
        period: BaseValueObject,
        rate: BaseValueObject,
        basis: BaseValueObject
    ): BaseValueObject {
        const input = checkVariantsErrorIsArrayOrBoolean(cost, datePurchased, firstPeriod, salvage, period, rate, basis);
        if (input.isError) {
            return input.errorObject!;
        }

        const [costObject, purchaseObject, endObject, salvageObject, periodObject, rateObject, basisObject] = input.variants!;
        const dateSystem = this.getDateSystem();
        const purchase = getDateSerialNumberByObject(purchaseObject, dateSystem);
        if (typeof purchase !== 'number') {
            return purchase;
        }
        const end = getDateSerialNumberByObject(endObject, dateSystem);
        if (typeof end !== 'number') {
            return end;
        }

        const [costValue, salvageValue, periodValue, rateValue, basisValue] = [costObject, salvageObject, periodObject, rateObject, basisObject].map((value) => Number(value.getValue()));
        if ([costValue, salvageValue, periodValue, rateValue, basisValue].some((value) => !Number.isFinite(value))) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const dayBasis = Math.trunc(basisValue);
        const purchaseDay = Math.trunc(purchase);
        const endDay = Math.trunc(end);
        if (costValue <= 0 || salvageValue < 0 || salvageValue > costValue || periodValue < 0 ||
            rateValue <= 0 || rateValue >= 0.5 || purchaseDay > endDay || ![0, 1, 3, 4].includes(dayBasis)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const { days, yearDays } = getTwoDateDaysByBasis(purchaseDay, endDay, dayBasis, dateSystem);
        const fraction = purchaseDay === endDay || (periodValue > 0 && periodValue < 1) ? 1 : days / yearDays;
        return this._depreciate(costValue, salvageValue, periodValue, rateValue, fraction);
    }

    private _depreciate(cost: number, salvage: number, period: number, rate: number, fraction: number): BaseValueObject {
        const life = 1 / rate;
        const lastPeriod = Math.ceil(life) - 1;
        const targetPeriod = Math.max(1, Math.trunc(period));
        if (targetPeriod > lastPeriod || cost === salvage) {
            return NumberValueObject.create(0);
        }

        const coefficient = life <= 4 ? 1.5 : life <= 6 ? 2 : 2.5;
        const depreciationRate = rate * coefficient;
        const first = Math.min(cost - salvage, Math.round(cost * depreciationRate * fraction));
        if (period === 0) {
            return NumberValueObject.create(first);
        }

        // Excel carries the unrounded book value and splits the final balance over two periods.
        const regularPeriods = Math.min(targetPeriod - 1, lastPeriod - 2);
        const balance = (cost - first) * Math.exp(regularPeriods * Math.log1p(-depreciationRate));
        const depreciation = balance * (targetPeriod >= lastPeriod - 1 ? 0.5 : depreciationRate);
        const openingBalance = targetPeriod === lastPeriod ? balance - depreciation : balance;
        return NumberValueObject.create(openingBalance < salvage ? 0 : Math.round(depreciation));
    }
}

export const excelDepreciationFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelSln, FUNCTION_NAMES_FINANCIAL.SLN],
    [ExcelSyd, FUNCTION_NAMES_FINANCIAL.SYD],
    [ExcelDb, FUNCTION_NAMES_FINANCIAL.DB],
    [ExcelDdb, FUNCTION_NAMES_FINANCIAL.DDB],
    [ExcelAmorlinc, FUNCTION_NAMES_FINANCIAL.AMORLINC],
    [ExcelAmordegrc, FUNCTION_NAMES_FINANCIAL.AMORDEGRC],
];
