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
import { calculateCoupdaybs, calculateCoupdays, calculateCoupnum, calculatePrice, validCouppcdIsGte0ByTwoDate } from '../../../basics/financial';
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Yield extends BaseFunction {
    override minParams = 6;

    override maxParams = 7;

    override calculate(
        settlement: BaseValueObject,
        maturity: BaseValueObject,
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

        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, rate, pr, redemption, frequency, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, rateObject, prObject, redemptionObject, frequencyObject, basisObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
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
            settlementSerialNumber >= maturitySerialNumber ||
            !validCouppcdIsGte0ByTwoDate(settlementSerialNumber, maturitySerialNumber, frequencyValue)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = this._getResult(settlementSerialNumber, maturitySerialNumber, rateValue, prValue, redemptionValue, frequencyValue, basisValue);

        return NumberValueObject.create(result);
    }

    private _getResult(
        settlementSerialNumber: number,
        maturitySerialNumber: number,
        rate: number,
        pr: number,
        redemption: number,
        frequency: number,
        basis: number
    ): number {
        const N = calculateCoupnum(settlementSerialNumber, maturitySerialNumber, frequency);

        if (N > 1) {
            const g_Eps = 1e-7;

            let yld = rate || 0.01;
            let price = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, yld, redemption, frequency, basis);
            let eps = price - pr;

            for (let i = 0; i < 100 && Math.abs(eps) > g_Eps; i++) {
                price = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, 1.01 * yld, redemption, frequency, basis);
                yld += -eps / (price - pr - eps) * yld * 0.01;

                const priceN = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, yld, redemption, frequency, basis);
                eps = priceN - pr;
            }

            return yld;
        }

        const A = calculateCoupdaybs(settlementSerialNumber, maturitySerialNumber, frequency, basis);
        const E = calculateCoupdays(settlementSerialNumber, maturitySerialNumber, frequency, basis);
        const { days: DSR } = getTwoDateDaysByBasis(settlementSerialNumber, maturitySerialNumber, basis);

        const temp = pr / 100 + (A / E * rate / frequency);
        const result = ((redemption / 100 + rate / frequency) - temp) / temp * frequency * E / DSR;

        return result;
    }
}
