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

import type { DateSystem } from '@univerjs/core';
import { excelSerialToDate } from '@univerjs/core';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { getDateSerialNumberByObject, getDaysInMonth, isLeapYear } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Amordegrc extends BaseFunction {
    override minParams = 6;

    override maxParams = 7;

    override calculate(
        cost: BaseValueObject,
        datePurchased: BaseValueObject,
        firstPeriod: BaseValueObject,
        salvage: BaseValueObject,
        period: BaseValueObject,
        rate: BaseValueObject,
        basis?: BaseValueObject
    ): BaseValueObject {
        const _basis = basis ?? NumberValueObject.create(0);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(cost, datePurchased, firstPeriod, salvage, period, rate, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [costObject, datePurchasedObject, firstPeriodObject, salvageObject, periodObject, rateObject, basisObject] = variants as BaseValueObject[];

        const datePurchasedSerialNumber = getDateSerialNumberByObject(datePurchasedObject, this.getDateSystem());

        if (typeof datePurchasedSerialNumber !== 'number') {
            return datePurchasedSerialNumber;
        }

        const firstPeriodSerialNumber = getDateSerialNumberByObject(firstPeriodObject, this.getDateSystem());

        if (typeof firstPeriodSerialNumber !== 'number') {
            return firstPeriodSerialNumber;
        }

        const costValue = +costObject.getValue();
        const salvageValue = +salvageObject.getValue();
        const periodValue = +periodObject.getValue();
        const rateValue = +rateObject.getValue();
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(costValue) || Number.isNaN(salvageValue) || Number.isNaN(periodValue) || Number.isNaN(rateValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            costValue <= 0 ||
            salvageValue < 0 ||
            costValue < salvageValue ||
            Math.floor(datePurchasedSerialNumber) > Math.floor(firstPeriodSerialNumber) ||
            periodValue < 0 ||
            rateValue <= 0 ||
            ![0, 1, 3, 4].includes(basisValue)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return this._getResult(costValue, datePurchasedSerialNumber, firstPeriodSerialNumber, salvageValue, periodValue, rateValue, basisValue);
    }

    private _getResult(
        costValue: number,
        datePurchasedSerialNumber: number,
        firstPeriodSerialNumber: number,
        salvageValue: number,
        periodValue: number,
        rateValue: number,
        basisValue: number
    ): BaseValueObject {
        // Excel returns #NUM! for an asset whose life (1 / rate) is two years or less.
        if (1 / rateValue <= 2) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // The life in whole years picks the coefficient and ends the depreciation.
        const life = Math.ceil(1 / rateValue);

        if (costValue === salvageValue || periodValue > life) {
            return NumberValueObject.create(0);
        }

        const depreciationRate = rateValue * this._getCoefficient(life);
        const { days, yearDays } = getFirstPeriodDays(datePurchasedSerialNumber, firstPeriodSerialNumber, basisValue, this.getDateSystem());

        // Period 0 runs from the purchase to the end of the first period. A purchase on the first
        // period date counts as a whole period and leaves one period less in the asset's life.
        const prorated = days / yearDays * depreciationRate * costValue;
        const lastPeriods = prorated === 0 ? life : life + 1;
        const firstDepreciation = excelRound(Math.min(prorated === 0 ? costValue * depreciationRate : prorated, costValue - salvageValue));

        if (periodValue === 0) {
            return NumberValueObject.create(firstDepreciation);
        }

        // Excel keeps the book value unrounded from period 1 on and rounds only the result.
        let bookValue = costValue - firstDepreciation;
        let rate = depreciationRate;
        let depreciation = 0;

        for (let countedPeriod = 2; countedPeriod <= periodValue + 1; countedPeriod++) {
            const skipped = skipRegularPeriods(countedPeriod, Math.min(periodValue + 1, lastPeriods - 3), bookValue, salvageValue, rate);
            countedPeriod += skipped.periods;
            bookValue = skipped.bookValue;

            // The period before the last one takes half of the book value, and the last one the rest.
            const isSecondToLast = Math.abs(lastPeriods - countedPeriod - 2) < 1e-4;
            const scheduled = isSecondToLast ? bookValue * 0.5 : rate * bookValue;

            if (isSecondToLast) {
                rate = 1;
            }

            // Excel does not stop at the salvage value: a period that starts at or above it takes its
            // whole share, even when the book value ends below it. A period that starts below it is 0.
            depreciation = bookValue < salvageValue ? 0 : scheduled;
            bookValue -= depreciation;

            // Once nothing is left to depreciate, every later period is 0 as well.
            if (depreciation === 0 && bookValue <= salvageValue) {
                return NumberValueObject.create(0);
            }
        }

        return NumberValueObject.create(excelRound(depreciation));
    }

    /**
     * The depreciation coefficient of the French accounting system, by the life of the asset in
     * whole years: up to 4 is 1.5, 5 or 6 is 2 and longer is 2.5.
     */
    private _getCoefficient(life: number): number {
        if (life <= 4) {
            return 1.5;
        }

        if (life <= 6) {
            return 2;
        }

        return 2.5;
    }
}

/**
 * Rounds the way Excel does here: first to Excel's 15 significant digits, so that
 * 327.49999999999994 counts as 327.5, then to a whole number with halves away from zero.
 */
function excelRound(value: number): number {
    const rounded = Number(value.toPrecision(15));

    return Math.sign(rounded) * Math.round(Math.abs(rounded));
}

/**
 * Days from the purchase to the end of the first period, and the days in that year, as AMORDEGRC
 * counts them. This differs from YEARFRAC: with actual day counts a date on 28 or 29 February of a
 * leap year counts as 28 February, actual/actual uses the purchase year's length, and the US 30/360
 * method only moves the end of February when the purchase is also at the end of February.
 */
function getFirstPeriodDays(purchaseSerialNumber: number, firstPeriodSerialNumber: number, basis: number, dateSystem: DateSystem): { days: number; yearDays: number } {
    const parts = (serialNumber: number) => {
        const date = excelSerialToDate(serialNumber, dateSystem);
        return { year: date.getUTCFullYear(), month: date.getUTCMonth() + 1, day: date.getUTCDate() };
    };
    const purchase = parts(purchaseSerialNumber);
    const firstPeriod = parts(firstPeriodSerialNumber);

    if (basis === 1 || basis === 3) {
        const toFebruary28 = (serialNumber: number, date: { year: number; month: number; day: number }) =>
            isLeapYear(date.year) && date.month === 2 && date.day >= 28 ? serialNumber - (date.day - 28) : serialNumber;
        const days = toFebruary28(firstPeriodSerialNumber, firstPeriod) - toFebruary28(purchaseSerialNumber, purchase);

        return { days, yearDays: basis === 3 || !isLeapYear(purchase.year) ? 365 : 366 };
    }

    let startDay = purchase.day;
    let endDay = firstPeriod.day;

    if (basis === 0) {
        const isEndOfFebruary = (date: { year: number; month: number; day: number }) => date.month === 2 && date.day === getDaysInMonth(date.year, 1);

        if (isEndOfFebruary(firstPeriod) && isEndOfFebruary(purchase)) {
            endDay = 30;
        }

        if (endDay === 31 && startDay >= 30) {
            endDay = 30;
        }

        if (startDay === 31 || isEndOfFebruary(purchase)) {
            startDay = 30;
        }
    } else {
        startDay = Math.min(startDay, 30);
        endDay = Math.min(endDay, 30);
    }

    return {
        days: (firstPeriod.year - purchase.year) * 360 + (firstPeriod.month - purchase.month) * 30 + (endDay - startDay),
        yearDays: 360,
    };
}

// Runs of regular periods shorter than this are computed one by one, as Excel does.
const MIN_SKIPPED_PERIODS = 10000;

/**
 * A tiny rate gives a life of many years, and a period can ask for any of them. Each regular period
 * multiplies the book value by (1 - rate), so a long run of them is skipped in one step instead of
 * one by one, stopping before the book value would fall below the salvage value.
 */
function skipRegularPeriods(countedPeriod: number, lastRegularPeriod: number, bookValue: number, salvageValue: number, rate: number): { periods: number; bookValue: number } {
    let periods = Math.floor(lastRegularPeriod) - countedPeriod;

    if (periods >= MIN_SKIPPED_PERIODS && rate > 0 && rate < 1 && bookValue > salvageValue && salvageValue > 0) {
        periods = Math.min(periods, Math.floor(Math.log(salvageValue / bookValue) / Math.log(1 - rate)) - 1);
    }

    if (periods < MIN_SKIPPED_PERIODS || rate <= 0 || rate >= 1 || bookValue <= salvageValue) {
        return { periods: 0, bookValue };
    }

    return { periods, bookValue: bookValue * (1 - rate) ** periods };
}
