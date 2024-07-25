/**
 * Copyright 2023-present DreamNum Inc.
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

import { checkVariantsErrorIsArrayOrBoolean } from '../../../basics/financial';
import { getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Amorlinc extends BaseFunction {
    override minParams = 6;

    override maxParams = 7;

    override calculate(cost: BaseValueObject, datePurchased: BaseValueObject, firstPeriod: BaseValueObject, salvage: BaseValueObject, period: BaseValueObject, rate: BaseValueObject, basis?: BaseValueObject) {
        basis = basis ?? NumberValueObject.create(0);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(cost, datePurchased, firstPeriod, salvage, period, rate, basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        cost = (variants as BaseValueObject[])[0];
        datePurchased = (variants as BaseValueObject[])[1];
        firstPeriod = (variants as BaseValueObject[])[2];
        salvage = (variants as BaseValueObject[])[3];
        period = (variants as BaseValueObject[])[4];
        rate = (variants as BaseValueObject[])[5];
        basis = (variants as BaseValueObject[])[6];

        const datePurchasedSerialNumber = getDateSerialNumberByObject(datePurchased);

        if (typeof datePurchasedSerialNumber !== 'number') {
            return datePurchasedSerialNumber;
        }

        const firstPeriodSerialNumber = getDateSerialNumberByObject(firstPeriod);

        if (typeof firstPeriodSerialNumber !== 'number') {
            return firstPeriodSerialNumber;
        }

        const costValue = +cost.getValue();
        const salvageValue = +salvage.getValue();
        let periodValue = +period.getValue();
        const rateValue = +rate.getValue();
        const basisValue = Math.floor(+basis.getValue());

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

        const totalDepreciation = costValue - salvageValue;
        const baseDepreciation = costValue * rateValue;
        const { days, yearDays } = getTwoDateDaysByBasis(datePurchasedSerialNumber, firstPeriodSerialNumber, basisValue);
        const firstPeriodYearsFraction = days / yearDays;
        const life = Math.ceil(totalDepreciation / baseDepreciation - firstPeriodYearsFraction);

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
