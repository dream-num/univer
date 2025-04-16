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

import { excelSerialToDate, getDateSerialNumberByObject, getTwoDateDaysByBasis, lastDayOfMonth } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { calculateCoupdays, calculateCouppcd, getDateSerialNumberByMonths } from '../../../basics/financial';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Accrint extends BaseFunction {
    override minParams = 6;

    override maxParams = 8;

    override calculate(
        issue: BaseValueObject,
        firstInterest: BaseValueObject,
        settlement: BaseValueObject,
        rate: BaseValueObject,
        par: BaseValueObject,
        frequency: BaseValueObject,
        basis?: BaseValueObject,
        calcMethod?: BaseValueObject
    ): BaseValueObject {
        const _basis = basis ?? NumberValueObject.create(0);
        const _calcMethod = calcMethod ?? BooleanValueObject.create(true);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(issue, firstInterest, settlement, rate, par, frequency, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [issueObject, firstInterestObject, settlementObject, rateObject, parObject, frequencyObject, basisObject] = variants as BaseValueObject[];

        const issueSerialNumber = getDateSerialNumberByObject(issueObject);

        if (typeof issueSerialNumber !== 'number') {
            return issueSerialNumber;
        }

        const firstInterestSerialNumber = getDateSerialNumberByObject(firstInterestObject);

        if (typeof firstInterestSerialNumber !== 'number') {
            return firstInterestSerialNumber;
        }

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const rateValue = +rateObject.getValue();
        const parValue = +parObject.getValue();
        const frequencyValue = Math.floor(+frequencyObject.getValue());
        const basisValue = Math.floor(+basisObject.getValue());
        const calcMethodValue = +_calcMethod.getValue();

        if (Number.isNaN(rateValue) || Number.isNaN(parValue) || Number.isNaN(frequencyValue) || Number.isNaN(basisValue) || Number.isNaN(calcMethodValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            rateValue <= 0 ||
            parValue <= 0 ||
            ![1, 2, 4].includes(frequencyValue) ||
            basisValue < 0 ||
            basisValue > 4 ||
            Math.floor(issueSerialNumber) >= Math.floor(settlementSerialNumber)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return this._getResult(issueSerialNumber, firstInterestSerialNumber, settlementSerialNumber, rateValue, parValue, frequencyValue, basisValue, calcMethodValue);
    }

    private _getResult(
        issueSerialNumber: number,
        firstInterestSerialNumber: number,
        settlementSerialNumber: number,
        rateValue: number,
        parValue: number,
        frequencyValue: number,
        basisValue: number,
        calcMethodValue: number
    ): NumberValueObject {
        let couppcd = calculateCouppcd(issueSerialNumber, firstInterestSerialNumber, frequencyValue);
        if (couppcd <= 0) {
            return NumberValueObject.create(0);
        }
        couppcd = calculateCouppcd(settlementSerialNumber, firstInterestSerialNumber, frequencyValue);

        const numMonths = 12 / frequencyValue;
        const firstInterestDate = excelSerialToDate(firstInterestSerialNumber);
        const firstInterestDateYear = firstInterestDate.getUTCFullYear();
        const firstInterestDateMonth = firstInterestDate.getUTCMonth();
        const firstInterestDateDay = firstInterestDate.getUTCDate();
        const lastDayOfMonthF = lastDayOfMonth(firstInterestDateYear, firstInterestDateMonth, firstInterestDateDay);

        let coupDateSerialNumber = getDateSerialNumberByMonths(firstInterestSerialNumber, -numMonths, lastDayOfMonthF);
        if (settlementSerialNumber > firstInterestSerialNumber && calcMethodValue) {
            coupDateSerialNumber = firstInterestSerialNumber;
            while (coupDateSerialNumber < settlementSerialNumber) {
                coupDateSerialNumber = getDateSerialNumberByMonths(coupDateSerialNumber, numMonths, lastDayOfMonthF);
            }
        }

        let firstDateSerialNumber = issueSerialNumber > coupDateSerialNumber ? issueSerialNumber : coupDateSerialNumber;

        let { days } = getTwoDateDaysByBasis(firstDateSerialNumber, settlementSerialNumber, basisValue);
        if (couppcd >= issueSerialNumber) {
            const { days: DFS } = getTwoDateDaysByBasis(firstDateSerialNumber, settlementSerialNumber, !basisValue ? 0 : 4);
            days = DFS;
        }
        if (settlementSerialNumber < firstDateSerialNumber) {
            days = -days;
        }

        let coupdays = calculateCoupdays(coupDateSerialNumber, firstInterestSerialNumber, frequencyValue, basisValue);
        let accruedDaysSum = days / coupdays;
        let startDateSerialNumber = coupDateSerialNumber;
        let endDateSerialNumber = issueSerialNumber;

        while (startDateSerialNumber > issueSerialNumber) {
            endDateSerialNumber = startDateSerialNumber;
            startDateSerialNumber = getDateSerialNumberByMonths(startDateSerialNumber, -numMonths, lastDayOfMonthF);
            firstDateSerialNumber = issueSerialNumber > startDateSerialNumber ? issueSerialNumber : startDateSerialNumber;
            const { days: DFE } = getTwoDateDaysByBasis(firstDateSerialNumber, endDateSerialNumber, basisValue);

            if (basisValue === 0) {
                if (endDateSerialNumber >= firstDateSerialNumber || issueSerialNumber <= startDateSerialNumber) {
                    days = DFE;
                } else {
                    days = -DFE;
                }

                coupdays = calculateCoupdays(startDateSerialNumber, endDateSerialNumber, frequencyValue, basisValue);
            } else {
                days = endDateSerialNumber < firstDateSerialNumber ? -DFE : DFE;

                if (basisValue === 3) {
                    coupdays = 365 / frequencyValue;
                } else {
                    const { days: DSE } = getTwoDateDaysByBasis(startDateSerialNumber, endDateSerialNumber, basisValue);
                    coupdays = endDateSerialNumber < startDateSerialNumber ? -DSE : DSE;
                }
            }

            accruedDaysSum += (issueSerialNumber <= startDateSerialNumber) ? (calcMethodValue ? 1 : 0) : days / coupdays;
        }

        const result = parValue * rateValue / frequencyValue * accruedDaysSum;

        return NumberValueObject.create(result);
    }
}
