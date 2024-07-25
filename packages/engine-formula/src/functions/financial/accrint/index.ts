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

import { checkVariantsErrorIsArrayOrBoolean } from '../../../basics/check-error';
import { getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Accrint extends BaseFunction {
    override minParams = 6;

    override maxParams = 8;

    override calculate(issue: BaseValueObject, firstInterest: BaseValueObject, settlement: BaseValueObject, rate: BaseValueObject, par: BaseValueObject, frequency: BaseValueObject, basis?: BaseValueObject, calcMethod?: BaseValueObject) {
        basis = basis ?? NumberValueObject.create(0);
        calcMethod = calcMethod ?? BooleanValueObject.create(true);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(issue, firstInterest, settlement, rate, par, frequency, basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        issue = (variants as BaseValueObject[])[0];
        firstInterest = (variants as BaseValueObject[])[1];
        settlement = (variants as BaseValueObject[])[2];
        rate = (variants as BaseValueObject[])[3];
        par = (variants as BaseValueObject[])[4];
        frequency = (variants as BaseValueObject[])[5];
        basis = (variants as BaseValueObject[])[6];

        const issueSerialNumber = getDateSerialNumberByObject(issue);

        if (typeof issueSerialNumber !== 'number') {
            return issueSerialNumber;
        }

        const firstInterestSerialNumber = getDateSerialNumberByObject(firstInterest);

        if (typeof firstInterestSerialNumber !== 'number') {
            return firstInterestSerialNumber;
        }

        const settlementSerialNumber = getDateSerialNumberByObject(settlement);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const rateValue = +rate.getValue();
        const parValue = +par.getValue();
        const frequencyValue = Math.floor(+frequency.getValue());
        const basisValue = Math.floor(+basis.getValue());
        const calcMethodValue = +calcMethod.getValue();

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

        let TwoDateDays;

        if (Math.floor(settlementSerialNumber) >= Math.floor(firstInterestSerialNumber) && !calcMethodValue) {
            TwoDateDays = getTwoDateDaysByBasis(firstInterestSerialNumber, settlementSerialNumber, basisValue);
        } else {
            TwoDateDays = getTwoDateDaysByBasis(issueSerialNumber, settlementSerialNumber, basisValue);
        }

        const { days, yearDays } = TwoDateDays;

        const NC = Math.ceil((days / yearDays) * frequencyValue);
        const NLi = yearDays / frequencyValue;

        let accruedDaysSum = 0;
        for (let i = 1; i <= NC; i++) {
            if (i * NLi > days) {
                const Ai = days - (i - 1) * NLi;
                accruedDaysSum += Ai / NLi;
            } else {
                accruedDaysSum += 1;
            }
        }

        // TO DO  now result is error
        const result = parValue * (rateValue / frequencyValue) * accruedDaysSum;

        return NumberValueObject.create(result);
    }
}
