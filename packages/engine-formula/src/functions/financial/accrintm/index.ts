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

export class Accrintm extends BaseFunction {
    override minParams = 4;

    override maxParams = 5;

    override calculate(issue: BaseValueObject, settlement: BaseValueObject, rate: BaseValueObject, par: BaseValueObject, basis?: BaseValueObject): BaseValueObject {
        const _basis = basis ?? NumberValueObject.create(0);

        const { isError, errorObject, variants } = checkVariantsErrorIsArrayOrBoolean(issue, settlement, rate, par, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [issueObject, settlementObject, rateObject, parObject, basisObject] = variants as BaseValueObject[];

        const issueSerialNumber = getDateSerialNumberByObject(issueObject);

        if (typeof issueSerialNumber !== 'number') {
            return issueSerialNumber;
        }

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const rateValue = +rateObject.getValue();
        const parValue = +parObject.getValue();
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(rateValue) || Number.isNaN(parValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (rateValue <= 0 || parValue <= 0 || basisValue < 0 || basisValue > 4 || Math.floor(issueSerialNumber) > Math.floor(settlementSerialNumber)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (Math.floor(issueSerialNumber) === Math.floor(settlementSerialNumber)) {
            return NumberValueObject.create(0);
        }

        const { days, yearDays } = getTwoDateDaysByBasis(issueSerialNumber, settlementSerialNumber, basisValue);

        const result = parValue * rateValue * days / yearDays;

        return NumberValueObject.create(result);
    }
}
