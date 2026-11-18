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

import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
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
        let periodValue = +periodObject.getValue();
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

        // Same period rounding as AMORLINC.
        if (periodValue > 1) {
            periodValue = Math.floor(periodValue);
        } else {
            periodValue = Math.ceil(periodValue);
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
    ): NumberValueObject {
        const depreciationRate = rateValue * this._getCoefficient(1 / rateValue);
        const { days, yearDays } = getTwoDateDaysByBasis(datePurchasedSerialNumber, firstPeriodSerialNumber, basisValue, this.getDateSystem());

        // Period 0 runs from the purchase to the end of the first period, so it is prorated.
        // Every depreciation is rounded to a whole number.
        let depreciation = this._round((days / yearDays) * depreciationRate * costValue);
        let bookValue = costValue - depreciation;
        let depreciable = bookValue - salvageValue;

        for (let currentPeriod = 0; currentPeriod < periodValue; currentPeriod++) {
            depreciation = this._round(depreciationRate * bookValue);
            depreciable -= depreciation;

            if (depreciable < 0) {
                // The period that would pass the salvage value takes half of the book value,
                // and the ones after it take nothing.
                return NumberValueObject.create(periodValue - currentPeriod <= 1 ? this._round(bookValue * 0.5) : 0);
            }

            bookValue -= depreciation;
        }

        return NumberValueObject.create(depreciation);
    }

    /**
     * Round to the nearest whole number, with halves away from zero.
     */
    private _round(value: number): number {
        return Math.sign(value) * Math.round(Math.abs(value));
    }

    /**
     * The depreciation coefficient of the French accounting system, by the life of the asset in years (1 / rate).
     */
    private _getCoefficient(life: number): number {
        if (life < 3) {
            return 1;
        }

        if (life < 5) {
            return 1.5;
        }

        if (life <= 6) {
            return 2;
        }

        return 2.5;
    }
}
