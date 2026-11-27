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
import type { BaseValueObject } from '../../engine/value-object/base-value-object';
import type { NullValueObject } from '../../engine/value-object/primitive-object';
import { DateSystem, EXCEL_1904_OFFSET } from '@univerjs/core';
import { getDateSerialNumberByObject, getDaysInMonth, getFinancialNumberByObject, getYearFraction, isLeapYear } from '../../basics/date';
import { ErrorType } from '../../basics/error-type';
import { accruedDays, accruedDaysBetweenParts, addCouponMonths, getCouponDateParts, getCouponDateSerial } from '../../basics/financial';
import { ErrorValueObject } from '../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../engine/value-object/primitive-object';
import { BaseFunction } from '../base-function';
import { Coupdaybs } from './coupdaybs';
import { Coupdays } from './coupdays';
import { Coupdaysnc } from './coupdaysnc';
import { Coupncd } from './coupncd';
import { Coupnum } from './coupnum';
import { Couppcd } from './couppcd';
import { FUNCTION_NAMES_FINANCIAL } from './function-names';
import { mapFinancialScalars, resolveSingleCellArgument } from './scalar-arguments';

interface IBondPeriod {
    readonly previous: number;
    readonly next: number;
    readonly count: number;
    readonly previousDate: ReturnType<typeof getCouponDateParts>;
}

interface IBondCashFlows {
    readonly frequency: number;
    readonly coupon: number;
    readonly firstCoupon: number;
    readonly accrued: number;
    readonly redemption: number;
    readonly subsequent: number;
    readonly remaining: number;
}

interface IYieldSchedule {
    readonly years: number;
    readonly count: number;
    readonly remaining: number;
}

function getBondPeriod(settlement: number, maturity: number, frequency: number, dateSystem: DateSystem): IBondPeriod {
    const from = getCouponDateParts(settlement, dateSystem);
    const anchor = getCouponDateParts(maturity, dateSystem);
    const months = 12 / frequency;
    const distance = (anchor.year - from.year) * 12 + anchor.month - from.month;
    const useDayBeforeMonthEnd = dateSystem === DateSystem.Date1904 && anchor.day === getDaysInMonth(anchor.year, anchor.month - 1) - 1;
    const couponAt = (count: number) => {
        const coupon = addCouponMonths(anchor, -count * months);
        if (useDayBeforeMonthEnd) {
            coupon.day = getDaysInMonth(coupon.year, coupon.month - 1) - 1;
        }
        return coupon;
    };
    let count = Math.floor(distance / months);
    let previousDate = couponAt(count);
    let previous = getCouponDateSerial(previousDate, dateSystem);
    if (previous > settlement) {
        count++;
        previousDate = couponAt(count);
        previous = getCouponDateSerial(previousDate, dateSystem);
    }
    const next = getCouponDateSerial(couponAt(count - 1), dateSystem);
    return { previous, next, count, previousDate };
}

function periodLength(period: IBondPeriod, frequency: number, basis: number): number {
    if (basis === 1) return period.next - period.previous;
    return (basis === 3 ? 365 : 360) / frequency;
}

function couponBasis(basis: number, dateSystem: DateSystem): number {
    return basis === 4 && dateSystem === DateSystem.Date1904 ? 0 : basis;
}

function elapsedCouponDays(period: IBondPeriod, settlement: number, basis: number, dateSystem: DateSystem): number {
    if (basis === 0) {
        return accruedDaysBetweenParts(period.previousDate, getCouponDateParts(settlement, dateSystem));
    }
    return accruedDays(period.previous, settlement, basis, dateSystem);
}

function priceAt(flows: IBondCashFlows, yieldValue: number): number {
    const { frequency, accrued, coupon, firstCoupon, redemption, subsequent, remaining } = flows;
    const rate = yieldValue / frequency;
    if (subsequent === 0) return (redemption + firstCoupon) / (1 + rate * remaining) - accrued;
    if (rate <= -1) return NaN;
    const step = -Math.log1p(rate);
    const firstDiscount = Math.exp(remaining * step);
    const lastDiscount = Math.exp(subsequent * step);
    const tail = coupon === 0
        ? 0
        : rate === 0
            ? coupon * subsequent
            : coupon * Math.exp(step) * Math.expm1(subsequent * step) / Math.expm1(step);
    return firstDiscount * (firstCoupon + tail + redemption * lastDiscount) - accrued;
}

function yieldAt(flows: IBondCashFlows, target: number, schedule: IYieldSchedule): number {
    if (flows.subsequent === 0) {
        const dirtyPrice = target + flows.accrued;
        return (flows.redemption + flows.firstCoupon - dirtyPrice) / dirtyPrice * flows.frequency / flows.remaining;
    }
    const premium = target - 100;
    const { years } = schedule;
    let current = (flows.coupon * flows.frequency * years - premium) / (years * 100 + years * premium / 2 + premium / 4);
    for (let iteration = 1; iteration < 100; iteration++) {
        const adjustment = (target - priceAt(flows, current)) / yieldSlope(flows, current, schedule);
        if (!Number.isFinite(adjustment)) return NaN;
        if (Math.abs(adjustment) < 1e-10) return current;
        current += adjustment;
    }
    return NaN;
}

function yieldSlope(flows: IBondCashFlows, current: number, schedule: IYieldSchedule): number {
    const { count, remaining } = schedule;
    const step = -Math.log1p(current / flows.frequency);
    const total = step === 0 ? count : Math.expm1(count * step) / Math.expm1(step);
    // Use the expansion around zero so the two reciprocal terms do not cancel.
    const weightedOffset = Math.abs(step * count) < 0.0001
        ? (count - 1) / 2 + (count * count - 1) * step / 12
        : 1 / Math.expm1(-step) - count / Math.expm1(-count * step);
    const finalPeriod = remaining + count - 1;
    const coupons = flows.coupon * total * (remaining + weightedOffset);
    const redemption = flows.redemption * finalPeriod * Math.exp((count - 1) * step);
    return -(coupons + redemption) * Math.exp((remaining + 1) * step) / flows.frequency;
}

function oddCouponAmounts(issue: number, settlement: number, first: number, frequency: number, basis: number, dateSystem: DateSystem): [number, number] {
    const months = 12 / frequency;
    const fixedLength = (basis === 3 ? 365 : 360) / frequency;
    let later = getCouponDateParts(first, dateSystem);
    if (dateSystem === DateSystem.Date1900) {
        // Quasi-coupon accrual moves backward by the calendar day of each coupon.
        later = { ...later, monthEnd: false };
    }
    let firstFraction = 0;
    let accrued = 0;
    for (;;) {
        const earlier = addCouponMonths(later, -months);
        const start = getCouponDateSerial(earlier, dateSystem);
        const end = getCouponDateSerial(later, dateSystem);
        const days = basis === 1 ? end - start : fixedLength;
        const accrualStart = Math.max(start, issue);
        const accrualEnd = Math.min(end, settlement);
        if (accrualEnd > accrualStart) {
            accrued += basis === 0 && dateSystem === DateSystem.Date1904 && issue <= start && end <= settlement
                ? 1
                : oddAccrualDays(accrualStart, accrualEnd, basis, dateSystem) / days;
        }
        if (start <= issue) {
            return [firstFraction + oddAccrualDays(issue, end, basis, dateSystem) / days, accrued];
        }
        if (!Number.isFinite(start) || start >= end) return [NaN, NaN];
        firstFraction++;
        later = earlier;
    }
}

function oddAccrualDays(start: number, end: number, basis: number, dateSystem: DateSystem): number {
    const days = accruedDays(start, end, basis, dateSystem);
    if (basis !== 0 || dateSystem !== DateSystem.Date1904) return days;
    const from = getCouponDateParts(start, dateSystem);
    const to = getCouponDateParts(end, dateSystem);
    return to.month === 2 && to.monthEnd && from.day >= 30 && from.month !== 2 ? days + 30 - to.day : days;
}

function regularFlows(settlement: number, maturity: number, rate: number, redemption: number, frequency: number, basis: number, solvingYield: boolean, dateSystem: DateSystem): IBondCashFlows | undefined {
    const period = getBondPeriod(settlement, maturity, frequency, dateSystem);
    if (period.previous < 0 && dateSystem === DateSystem.Date1900) return undefined;
    const singleYield = solvingYield && period.count === 1;
    const effectiveBasis = singleYield && (basis === 2 || basis === 3) ? 1 : basis;
    const days = periodLength(period, frequency, effectiveBasis);
    const elapsed = elapsedCouponDays(period, settlement, effectiveBasis, dateSystem);
    const remaining = singleYield && dateSystem === DateSystem.Date1900
        ? accruedDays(settlement, maturity, effectiveBasis, dateSystem)
        : days - elapsed;
    const coupon = 100 * rate / frequency;
    return { frequency, coupon, firstCoupon: coupon, accrued: coupon * elapsed / days, redemption, subsequent: period.count - 1, remaining: remaining / days };
}

function firstOddFlows(settlement: number, maturity: number, issue: number, first: number, rate: number, redemption: number, frequency: number, basis: number, dateSystem: DateSystem): IBondCashFlows | undefined {
    if (issue >= settlement || settlement >= first || first >= maturity) return undefined;
    if (dateSystem === DateSystem.Date1900 && (issue === 0 || getBondPeriod(issue, first, frequency, dateSystem).previous < 0)) return undefined;
    const afterFirst = getBondPeriod(first, maturity, frequency, dateSystem);
    if (afterFirst.previous !== first) return undefined;
    const period = getBondPeriod(settlement, first, frequency, dateSystem);
    const days = periodLength(period, frequency, basis);
    const firstDays = accruedDays(issue, first, basis, dateSystem);
    const coupon = 100 * rate / frequency;
    if (firstDays < days) {
        return {
            frequency,
            coupon,
            redemption,
            firstCoupon: coupon * firstDays / days,
            accrued: coupon * accruedDays(issue, settlement, basis, dateSystem) / days,
            subsequent: afterFirst.count,
            remaining: accruedDays(settlement, first, basis, dateSystem) / days,
        };
    }
    const remainingDays = basis === 2 || basis === 3
        ? period.next - settlement
        : days - elapsedCouponDays(period, settlement, basis, dateSystem);
    const [firstFraction, accrued] = oddCouponAmounts(issue, settlement, first, frequency, basis, dateSystem);
    return {
        frequency,
        coupon,
        redemption,
        firstCoupon: coupon * firstFraction,
        accrued: coupon * accrued,
        subsequent: afterFirst.count,
        remaining: period.count - 1 + remainingDays / days,
    };
}

function readBondValues(args: BaseValueObject[], dateCount: number, maxParams: number, dateSystem: DateSystem, requireDates = false): number[] | ErrorValueObject {
    const values: number[] = [];
    for (let index = 0; index < args.length; index++) {
        const arg = args[index];
        if (arg.isBoolean()) return ErrorValueObject.create(ErrorType.VALUE);
        if (index === maxParams - 1 && arg.isNull()) {
            values.push(0);
            continue;
        }
        if (requireDates && index < dateCount && arg.isNull() && (arg as NullValueObject).isOmitted()) {
            return ErrorValueObject.create(ErrorType.NA);
        }
        const value = index < dateCount ? getDateSerialNumberByObject(arg, dateSystem) : getFinancialNumberByObject(arg, dateSystem);
        if (typeof value !== 'number') return value;
        values.push(index < dateCount ? Math.floor(value) : value);
    }
    return values;
}

abstract class ExcelBondFunction extends BaseFunction {
    override needsReferenceObject = true;

    protected abstract readonly odd: boolean;

    protected abstract readonly solvingYield: boolean;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        return mapFinancialScalars(input.map(resolveSingleCellArgument), (args) => this._calculate(args));
    }

    private _calculate(args: BaseValueObject[]): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const dateCount = this.odd ? 4 : 2;
        const values = readBondValues(args, dateCount, this.maxParams, dateSystem);
        if (!Array.isArray(values)) return values;
        const [settlement, maturity, issue, first] = values;
        const [rate, quote, redemption, suppliedFrequency, suppliedBasis = 0] = values.slice(dateCount);
        const frequency = Math.floor(suppliedFrequency);
        const basis = couponBasis(Math.floor(suppliedBasis), dateSystem);
        if (settlement >= maturity || (settlement === 0 && dateSystem === DateSystem.Date1900) ||
            rate < 0 || quote < 0 || (this.solvingYield && quote === 0) || redemption <= 0 ||
            ![1, 2, 4].includes(frequency) || basis < 0 || basis > 4) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const flows = this.odd
            ? firstOddFlows(settlement, maturity, issue, first, rate, redemption, frequency, basis, dateSystem)
            : regularFlows(settlement, maturity, rate, redemption, frequency, basis, this.solvingYield, dateSystem);
        if (!flows) return ErrorValueObject.create(ErrorType.NUM);
        const result = this.solvingYield
            ? this._yieldAt(flows, quote, settlement, maturity, basis, dateSystem)
            : priceAt(flows, quote);
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }

    private _yieldAt(flows: IBondCashFlows, quote: number, settlement: number, maturity: number, basis: number, dateSystem: DateSystem): number {
        const years = getYearFraction(settlement, maturity, basis, dateSystem);
        if (!this.odd) return yieldAt(flows, quote, { years, count: flows.subsequent + 1, remaining: flows.remaining });
        // Excel estimates the slope from a regular coupon schedule.
        const regular = getBondPeriod(settlement, maturity, flows.frequency, dateSystem);
        const remaining = accruedDays(settlement, regular.next, basis, dateSystem) / periodLength(regular, flows.frequency, basis);
        return yieldAt(flows, quote, { years, count: regular.count, remaining });
    }
}

class ExcelPrice extends ExcelBondFunction {
    override minParams = 6;

    override maxParams = 7;

    protected readonly odd = false;

    protected readonly solvingYield: boolean = false;
}

class ExcelYield extends ExcelPrice {
    protected override readonly solvingYield: boolean = true;
}

class ExcelOddfprice extends ExcelBondFunction {
    override minParams = 8;

    override maxParams = 9;

    protected readonly odd = true;

    protected readonly solvingYield: boolean = false;
}

class ExcelOddfyield extends ExcelOddfprice {
    protected override readonly solvingYield = true;
}

function couponDaysBeforeSettlement(period: IBondPeriod, settlement: number, basis: number, dateSystem: DateSystem): number {
    // Excel's 30/360 coupon day count applies the 1904 offset again when decoding
    // the dates for the day count. The coupon schedule uses the workbook dates.
    const offset = dateSystem === DateSystem.Date1904 && (basis === 0 || basis === 4) ? EXCEL_1904_OFFSET : 0;
    if (basis !== 0) return accruedDays(period.previous + offset, settlement + offset, basis, dateSystem);
    const previous = offset === 0 ? period.previousDate : getCouponDateParts(period.previous + offset, dateSystem);
    const end = getCouponDateParts(settlement + offset, dateSystem);
    const previousFebruaryEnd = previous.month === 2 && previous.monthEnd;
    const first = previousFebruaryEnd ? 30 : Math.min(previous.day, 30);
    const last = (end.day === 31 && previous.day >= 30) || (previousFebruaryEnd && end.month === 2 && end.monthEnd) ? 30 : end.day;
    return (end.year - previous.year) * 360 + (end.month - previous.month) * 30 + last - first;
}

class ExcelDuration extends BaseFunction {
    override minParams = 5;

    override maxParams = 6;

    override needsReferenceObject = true;

    protected readonly modified: boolean = false;

    override calculate(...input: FunctionVariantType[]): BaseValueObject {
        const lift = input.some((arg) => !arg.isReferenceObject() && (arg as BaseValueObject).isArray());
        const endpoints: [number, BaseValueObject, BaseValueObject][] = [];
        const values = input.map((arg, index) => {
            if (!arg.isReferenceObject()) return arg as BaseValueObject;
            const reference = arg as BaseReferenceObject;
            const range = reference.getRangePosition();
            if (range.startRow === range.endRow && range.startColumn === range.endColumn) {
                return resolveSingleCellArgument(arg);
            }
            if (lift) {
                endpoints.push([index, reference.getCellByPosition(range.startRow, range.startColumn), reference.getCellByPosition(range.endRow, range.endColumn)]);
            }
            return ErrorValueObject.create(ErrorType.VALUE);
        });
        let position = 0;
        return mapFinancialScalars(values, (args) => {
            // Legacy ATP lifting takes the shape from value arrays and uses the
            // direct range's endpoints in subsequent result cells.
            if (position > 0) {
                for (const [index, first, last] of endpoints) {
                    args[index] = position === 1 ? first : last;
                }
            }
            position++;
            return this._evaluate(args);
        });
    }

    private _evaluate(args: BaseValueObject[]): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const values = readBondValues(args, 2, this.maxParams, dateSystem, true);
        if (!Array.isArray(values)) return values;
        const [settlement, maturity, couponRate, yld, suppliedFrequency, suppliedBasis = 0] = values;
        const frequency = Math.floor(suppliedFrequency);
        const basis = Math.floor(suppliedBasis);
        if (settlement >= maturity || couponRate < 0 || yld < 0 || ![1, 2, 4].includes(frequency) || basis < 0 || basis > 4) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const period = getBondPeriod(settlement, maturity, frequency, dateSystem);
        if (dateSystem === DateSystem.Date1900 && (maturity <= 366 || period.previous <= 0)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        const days = periodLength(period, frequency, basis);
        const elapsed = couponDaysBeforeSettlement(period, settlement, basis, dateSystem);
        const offset = (days - elapsed) / days;
        const base = 1 + yld / frequency;
        const coupon = 100 * couponRate / frequency;
        let total = 0;
        let weighted = 0;
        for (let index = 0; index < period.count; index++) {
            const time = index + offset;
            const discount = base ** time;
            if (!Number.isFinite(discount)) return ErrorValueObject.create(ErrorType.NUM);
            const amount = coupon / discount;
            total += amount;
            weighted += time * amount;
            if (index === period.count - 1) {
                const redemption = 100 / discount;
                total += redemption;
                weighted += time * redemption;
            }
        }
        const duration = weighted / total / frequency;
        const result = this.modified ? duration / base : duration;
        return Number.isFinite(result) ? NumberValueObject.create(result) : ErrorValueObject.create(ErrorType.NUM);
    }
}

class ExcelMduration extends ExcelDuration {
    protected override readonly modified = true;
}

class ExcelCoupdaybs extends Coupdaybs {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number, basis: number): BaseValueObject {
        const dateSystem = this.getDateSystem();
        if (settlement === 0 && dateSystem === DateSystem.Date1900) return NumberValueObject.create(0);
        const period = getBondPeriod(settlement, maturity, frequency, dateSystem);
        if (period.previous < 0 && dateSystem === DateSystem.Date1900) {
            if (basis === 4) {
                const end = getCouponDateParts(settlement, dateSystem);
                return NumberValueObject.create((end.year - 1900) * 360 + (end.month - 1) * 30 + Math.min(end.day, 30));
            }
            return NumberValueObject.create(accruedDays(0, settlement, basis, dateSystem));
        }
        return NumberValueObject.create(couponDaysBeforeSettlement(period, settlement, basis, dateSystem));
    }
}

class ExcelCoupdays extends Coupdays {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number, basis: number): BaseValueObject {
        if (basis !== 1) return super.calculateCoupon(settlement, maturity, frequency, basis);
        const dateSystem = this.getDateSystem();
        const period = getBondPeriod(settlement, maturity, frequency, dateSystem);
        const anchor = getCouponDateParts(maturity, dateSystem);
        if (dateSystem === DateSystem.Date1900 && settlement === 0 && frequency === 2 && period.previous >= -1 && period.previous <= 0) {
            return NumberValueObject.create(184);
        }
        if (dateSystem === DateSystem.Date1900 && frequency === 1 && anchor.month === 2 && anchor.day >= 28) {
            if (period.count <= 1) return NumberValueObject.create(period.next - period.previous);
            const settled = getCouponDateParts(settlement, dateSystem);
            return NumberValueObject.create(settled.month === 2 && settled.day === 28 && isLeapYear(settled.year) ? 366 : 365);
        }
        return NumberValueObject.create(couponPeriodLength(settlement, period, anchor, frequency, dateSystem));
    }
}

function couponPeriodLength(settlement: number, period: IBondPeriod, anchor: IBondPeriod['previousDate'], frequency: number, dateSystem: DateSystem): number {
    const start = period.previousDate;
    const following = getCouponDateParts(period.next, dateSystem);
    const dayBeforeMonthEnd = anchor.day === getDaysInMonth(anchor.year, anchor.month - 1) - 1;
    if (dateSystem === DateSystem.Date1904 && (anchor.monthEnd || (dayBeforeMonthEnd && start.day > following.day))) {
        return period.next - period.previous;
    }
    const end = addCouponMonths(start, 12 / frequency);
    const stayAtCoupon = end.month === anchor.month && start.day > end.day &&
        (end.month !== 2 || following.day < 29 || period.count === 1 || anchor.day !== 29 || period.next - settlement <= 1);
    let next = period.next;
    if (!stayAtCoupon) {
        // COUPDAYS uses the previous coupon's day, including a nominal February 29.
        end.day = start.month === anchor.month && period.count <= frequency ? Math.max(start.day, anchor.day) : start.day;
        next = getCouponDateSerial(end, dateSystem);
    }
    const skipSyntheticLeapDay = dateSystem === DateSystem.Date1900 && period.previous < 0 && next >= 60;
    return next - period.previous - Number(skipSyntheticLeapDay);
}

class ExcelCoupdaysnc extends Coupdaysnc {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number, basis: number): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const period = getBondPeriod(settlement, maturity, frequency, dateSystem);
        if (basis >= 1 && basis <= 3) {
            return NumberValueObject.create(period.next - settlement);
        }
        if (couponBasis(basis, dateSystem) === 0) {
            if (period.previous >= 0 || dateSystem === DateSystem.Date1904) {
                return NumberValueObject.create(360 / frequency - elapsedCouponDays(period, settlement, 0, dateSystem));
            }
        }
        return super.calculateCoupon(settlement, maturity, frequency, basis);
    }
}

class ExcelCoupnum extends Coupnum {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const period = getBondPeriod(settlement, maturity, frequency, dateSystem);
        if (period.previous < 0 || (period.previous === 0 && dateSystem === DateSystem.Date1900)) return ErrorValueObject.create(ErrorType.NUM);
        return NumberValueObject.create(period.count);
    }
}

class ExcelCouppcd extends Couppcd {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number, _basis: number, textDates: boolean): BaseValueObject {
        const dateSystem = this.getDateSystem();
        const { previous } = getBondPeriod(settlement, maturity, frequency, dateSystem);
        const result = dateSystem === DateSystem.Date1900 ? Math.max(0, previous) : previous - (textDates ? EXCEL_1904_OFFSET : 0);
        return NumberValueObject.create(result);
    }
}

class ExcelCoupncd extends Coupncd {
    protected override calculateCoupon(settlement: number, maturity: number, frequency: number): BaseValueObject {
        const { next } = getBondPeriod(settlement, maturity, frequency, this.getDateSystem());
        return NumberValueObject.create(next);
    }
}

export const excelBondFunctions: NonNullable<IUniverEngineFormulaConfig['function']> = [
    [ExcelPrice, FUNCTION_NAMES_FINANCIAL.PRICE],
    [ExcelYield, FUNCTION_NAMES_FINANCIAL.YIELD],
    [ExcelOddfprice, FUNCTION_NAMES_FINANCIAL.ODDFPRICE],
    [ExcelOddfyield, FUNCTION_NAMES_FINANCIAL.ODDFYIELD],
    [ExcelDuration, FUNCTION_NAMES_FINANCIAL.DURATION],
    [ExcelMduration, FUNCTION_NAMES_FINANCIAL.MDURATION],
    [ExcelCoupdaybs, FUNCTION_NAMES_FINANCIAL.COUPDAYBS],
    [ExcelCoupdays, FUNCTION_NAMES_FINANCIAL.COUPDAYS],
    [ExcelCoupdaysnc, FUNCTION_NAMES_FINANCIAL.COUPDAYSNC],
    [ExcelCoupnum, FUNCTION_NAMES_FINANCIAL.COUPNUM],
    [ExcelCouppcd, FUNCTION_NAMES_FINANCIAL.COUPPCD],
    [ExcelCoupncd, FUNCTION_NAMES_FINANCIAL.COUPNCD],
];
