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

import { getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { calculateOddFPrice, validCouppcdIsGte0ByTwoDate, validDaysBetweenIsWholeFrequencyByTwoDate } from '../../../basics/financial';
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Oddfprice extends BaseFunction {
    override minParams = 8;

    override maxParams = 9;

    override calculate(
        settlement: BaseValueObject,
        maturity: BaseValueObject,
        issue: BaseValueObject,
        firstCoupon: BaseValueObject,
        rate: BaseValueObject,
        yld: BaseValueObject,
        redemption: BaseValueObject,
        frequency: BaseValueObject,
        basis?: BaseValueObject
    ): BaseValueObject {
        let _basis = basis ?? NumberValueObject.create(0);

        if (_basis.isNull()) {
            _basis = NumberValueObject.create(0);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, issue, firstCoupon, rate, yld, redemption, frequency, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, issueObject, firstCouponObject, rateObject, yldObject, redemptionObject, frequencyObject, basisObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const issueSerialNumber = getDateSerialNumberByObject(issueObject);

        if (typeof issueSerialNumber !== 'number') {
            return issueSerialNumber;
        }

        const firstCouponSerialNumber = getDateSerialNumberByObject(firstCouponObject);

        if (typeof firstCouponSerialNumber !== 'number') {
            return firstCouponSerialNumber;
        }

        const rateValue = +rateObject.getValue();
        const yldValue = +yldObject.getValue();
        const redemptionValue = +redemptionObject.getValue();
        const frequencyValue = Math.floor(+frequencyObject.getValue());
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(rateValue) || Number.isNaN(yldValue) || Number.isNaN(redemptionValue) || Number.isNaN(frequencyValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            rateValue < 0 ||
            yldValue < 0 ||
            redemptionValue <= 0 ||
            ![1, 2, 4].includes(frequencyValue) ||
            basisValue < 0 ||
            basisValue > 4 ||
            !this._validDate(maturitySerialNumber, firstCouponSerialNumber, settlementSerialNumber, issueSerialNumber, frequencyValue)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = calculateOddFPrice(settlementSerialNumber, maturitySerialNumber, issueSerialNumber, firstCouponSerialNumber, rateValue, yldValue, redemptionValue, frequencyValue, basisValue);

        return NumberValueObject.create(result);
    }

    private _validDate(maturitySerialNumber: number, firstCouponSerialNumber: number, settlementSerialNumber: number, issueSerialNumber: number, frequencyValue: number): boolean {
        return this._getDateCorrectOrder(maturitySerialNumber, firstCouponSerialNumber, settlementSerialNumber, issueSerialNumber)
            && validDaysBetweenIsWholeFrequencyByTwoDate(maturitySerialNumber, firstCouponSerialNumber, frequencyValue)
            && validCouppcdIsGte0ByTwoDate(issueSerialNumber, maturitySerialNumber, frequencyValue);
    }

    private _getDateCorrectOrder(maturitySerialNumber: number, firstCouponSerialNumber: number, settlementSerialNumber: number, issueSerialNumber: number): boolean {
        return Math.floor(maturitySerialNumber) > Math.floor(firstCouponSerialNumber)
            && Math.floor(firstCouponSerialNumber) > Math.floor(settlementSerialNumber)
            && Math.floor(settlementSerialNumber) > Math.floor(issueSerialNumber);
    }
}
