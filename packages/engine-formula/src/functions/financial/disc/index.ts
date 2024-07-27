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

export class Disc extends BaseFunction {
    override minParams = 4;

    override maxParams = 5;

    override calculate(settlement: BaseValueObject, maturity: BaseValueObject, pr: BaseValueObject, redemption: BaseValueObject, basis?: BaseValueObject) {
        basis = basis ?? NumberValueObject.create(0);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(settlement, maturity, pr, redemption, basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        settlement = (variants as BaseValueObject[])[0];
        maturity = (variants as BaseValueObject[])[1];
        pr = (variants as BaseValueObject[])[2];
        redemption = (variants as BaseValueObject[])[3];
        basis = (variants as BaseValueObject[])[4];

        const settlementSerialNumber = getDateSerialNumberByObject(settlement);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturity);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const prValue = +pr.getValue();
        const redemptionValue = +redemption.getValue();
        const basisValue = Math.floor(+basis.getValue());

        if (Number.isNaN(prValue) || Number.isNaN(redemptionValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            prValue <= 0 ||
            redemptionValue <= 0 ||
            basisValue < 0 ||
            basisValue > 4 ||
            Math.floor(settlementSerialNumber) >= Math.floor(maturitySerialNumber)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const { days, yearDays } = getTwoDateDaysByBasis(settlementSerialNumber, maturitySerialNumber, basisValue);

        const result = ((redemptionValue - prValue) / redemptionValue) * (yearDays / days);

        return NumberValueObject.create(result);
    }
}
