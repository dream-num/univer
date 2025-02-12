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

import { getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Amorlinc extends BaseFunction {
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

        const datePurchasedSerialNumber = getDateSerialNumberByObject(datePurchasedObject);

        if (typeof datePurchasedSerialNumber !== 'number') {
            return datePurchasedSerialNumber;
        }

        const firstPeriodSerialNumber = getDateSerialNumberByObject(firstPeriodObject);

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
        const totalDepreciation = costValue - salvageValue;
        const baseDepreciation = costValue * rateValue;
        const { days, yearDays } = getTwoDateDaysByBasis(datePurchasedSerialNumber, firstPeriodSerialNumber, basisValue);
        const firstPeriodYearsFraction = days / yearDays;
        const life = Math.ceil(totalDepreciation / baseDepreciation - firstPeriodYearsFraction);

        if (life < 0) {
            return NumberValueObject.create(0);
        }

        let result = baseDepreciation;

        if (periodValue === 0) {
            result = baseDepreciation * firstPeriodYearsFraction;
        } else if (periodValue === life) {
            result = totalDepreciation - baseDepreciation * (firstPeriodYearsFraction + periodValue - 1);
        } else if (periodValue > life) {
            result = 0;
        }

        return NumberValueObject.create(result);
    }
}
