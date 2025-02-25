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

import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { calculateCoupdays, validCouppcdIsGte0ByTwoDate } from '../../../basics/financial';
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Oddlyield extends BaseFunction {
    override minParams = 8;

    override maxParams = 9;

    override calculate(
        settlement: BaseValueObject,
        maturity: BaseValueObject,
        lastInterest: BaseValueObject,
        rate: BaseValueObject,
        pr: BaseValueObject,
        redemption: BaseValueObject,
        frequency: BaseValueObject,
        basis?: BaseValueObject
    ): BaseValueObject {
        let _basis = basis ?? NumberValueObject.create(0);

        if (_basis.isNull()) {
            _basis = NumberValueObject.create(0);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, lastInterest, rate, pr, redemption, frequency, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, lastInterestObject, rateObject, prObject, redemptionObject, frequencyObject, basisObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const lastInterestSerialNumber = getDateSerialNumberByObject(lastInterestObject);

        if (typeof lastInterestSerialNumber !== 'number') {
            return lastInterestSerialNumber;
        }

        const rateValue = +rateObject.getValue();
        const prValue = +prObject.getValue();
        const redemptionValue = +redemptionObject.getValue();
        const frequencyValue = Math.floor(+frequencyObject.getValue());
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(rateValue) || Number.isNaN(prValue) || Number.isNaN(redemptionValue) || Number.isNaN(frequencyValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            rateValue < 0 ||
            prValue <= 0 ||
            redemptionValue <= 0 ||
            ![1, 2, 4].includes(frequencyValue) ||
            basisValue < 0 ||
            basisValue > 4 ||
            !this._validDate(maturitySerialNumber, settlementSerialNumber, lastInterestSerialNumber, frequencyValue)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = this._getResult(settlementSerialNumber, maturitySerialNumber, lastInterestSerialNumber, rateValue, prValue, redemptionValue, frequencyValue, basisValue);

        return NumberValueObject.create(result);
    }

    private _validDate(maturitySerialNumber: number, settlementSerialNumber: number, lastInterestSerialNumber: number, frequencyValue: number): boolean {
        return Math.floor(maturitySerialNumber) > Math.floor(settlementSerialNumber)
            && Math.floor(settlementSerialNumber) > Math.floor(lastInterestSerialNumber)
            && validCouppcdIsGte0ByTwoDate(lastInterestSerialNumber, maturitySerialNumber, frequencyValue);
    }

    private _getResult(
        settlementSerialNumber: number,
        maturitySerialNumber: number,
        lastInterestSerialNumber: number,
        rate: number,
        pr: number,
        redemption: number,
        frequency: number,
        basis: number
    ): number {
        const coupDateSerialNumber = this._getCoupDate(maturitySerialNumber, lastInterestSerialNumber, frequency);

        const fAi = this._getFrac(lastInterestSerialNumber, settlementSerialNumber, coupDateSerialNumber, frequency, basis);
        const fDCi = this._getFrac(lastInterestSerialNumber, maturitySerialNumber, coupDateSerialNumber, frequency, basis);
        const fDSCi = this._getFrac(settlementSerialNumber, maturitySerialNumber, coupDateSerialNumber, frequency, basis);

        const result = (frequency * (redemption - pr) + 100 * rate * (fDCi - fAi)) / (fDSCi * pr + 100 * rate * fAi * fDSCi / frequency);

        return result;
    }

    private _getCoupDate(maturitySerialNumber: number, lastInterestSerialNumber: number, frequency: number): number {
        const maturityDate = excelSerialToDate(maturitySerialNumber);
        const coupDate = excelSerialToDate(lastInterestSerialNumber);

        coupDate.setUTCFullYear(maturityDate.getUTCFullYear());

        if (coupDate > maturityDate) {
            coupDate.setUTCFullYear(coupDate.getUTCFullYear() - 1);
        }

        // eslint-disable-next-line
        while (coupDate < maturityDate) {
            coupDate.setUTCMonth(coupDate.getUTCMonth() + 12 / frequency);
        }

        return excelDateSerial(coupDate);
    }

    private _getFrac(startDateSerialNumber: number, endDateSerialNumber: number, coupDateSerialNumber: number, frequency: number, basis: number): number {
        const startDate = excelSerialToDate(startDateSerialNumber);
        const endDate = excelSerialToDate(endDateSerialNumber);
        const coupDate = excelSerialToDate(coupDateSerialNumber);

        coupDate.setUTCFullYear(startDate.getUTCFullYear());

        if (coupDate < startDate) {
            coupDate.setUTCFullYear(coupDate.getUTCFullYear() + 1);
        }

        // eslint-disable-next-line
        while (coupDate > startDate) {
            coupDate.setUTCMonth(coupDate.getUTCMonth() - 12 / frequency);
        }

        let earlyCouponSerialNumber = excelDateSerial(coupDate);

        coupDate.setUTCMonth(coupDate.getUTCMonth() + 12 / frequency);

        let lateCouponSerialNumber = excelDateSerial(coupDate);

        if (lateCouponSerialNumber >= endDateSerialNumber) {
            const { days } = getTwoDateDaysByBasis(startDateSerialNumber, endDateSerialNumber, basis);
            const coupdays = calculateCoupdays(earlyCouponSerialNumber, lateCouponSerialNumber, frequency, basis);

            return days / coupdays;
        }

        const { days: daysF } = getTwoDateDaysByBasis(startDateSerialNumber, lateCouponSerialNumber, basis);
        const coupdaysF = calculateCoupdays(earlyCouponSerialNumber, lateCouponSerialNumber, frequency, basis);
        let result = daysF / coupdaysF;

        const earlyCoupon = excelSerialToDate(lateCouponSerialNumber);
        const lateCoupon = excelSerialToDate(lateCouponSerialNumber);
        lateCoupon.setUTCMonth(lateCoupon.getUTCMonth() + 12 / frequency);

        // eslint-disable-next-line
        while (lateCoupon < endDate) {
            earlyCoupon.setUTCMonth(earlyCoupon.getUTCMonth() + 12 / frequency);
            lateCoupon.setUTCMonth(lateCoupon.getUTCMonth() + 12 / frequency);
            result += 1;
        }

        earlyCouponSerialNumber = excelDateSerial(earlyCoupon);
        lateCouponSerialNumber = excelDateSerial(lateCoupon);

        const { days: daysL } = getTwoDateDaysByBasis(earlyCouponSerialNumber, endDateSerialNumber, basis);
        const coupdaysL = calculateCoupdays(earlyCouponSerialNumber, lateCouponSerialNumber, frequency, basis);

        result += daysL / coupdaysL;

        return result;
    }
}
