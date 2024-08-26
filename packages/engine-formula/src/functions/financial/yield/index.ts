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

import { getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { calculatePrice } from '../../../basics/financial';
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
            settlementSerialNumber >= maturitySerialNumber
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = this._getResult(settlementSerialNumber, maturitySerialNumber, rateValue, prValue, redemptionValue, frequencyValue, basisValue);

        if (typeof result !== 'number') {
            return result;
        }

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
    ): number | ErrorValueObject {
        let yield1 = 0;
        let price1 = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, yield1, redemption, frequency, basis);
        let yield2 = 1;
        let price2 = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, yield2, redemption, frequency, basis);
        let yieldN = (yield2 - yield1) * 0.5;
        let priceN = 0;

        for (let i = 0; i < 100 && priceN !== pr; i++) {
            priceN = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, yieldN, redemption, frequency, basis);

            if (pr === price1) {
                return yield1;
            }

            if (pr === price2) {
                return yield2;
            }

            if (pr === priceN) {
                return yieldN;
            }

            if (pr < price2) {
                yield2 *= 2;
                price2 = calculatePrice(settlementSerialNumber, maturitySerialNumber, rate, yield2, redemption, frequency, basis);
                yieldN = (yield2 - yield1) * 0.5;
            } else {
                if (pr < priceN) {
                    yield1 = yieldN;
                    price1 = priceN;
                } else {
                    yield2 = yieldN;
                    price2 = priceN;
                }

                yieldN = yield2 - (yield2 - yield1) * ((pr - price2) / (price1 - price2));
            }
        }

        // result not precise enough
        if (Math.abs(pr - priceN) > pr / 100) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return yieldN;
    }
}
