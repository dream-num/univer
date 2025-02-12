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
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Pricedisc extends BaseFunction {
    override minParams = 4;

    override maxParams = 5;

    override calculate(
        settlement: BaseValueObject,
        maturity: BaseValueObject,
        discount: BaseValueObject,
        redemption: BaseValueObject,
        basis?: BaseValueObject
    ): BaseValueObject {
        let _basis = basis ?? NumberValueObject.create(0);

        if (_basis.isNull()) {
            _basis = NumberValueObject.create(0);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, discount, redemption, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, discountObject, redemptionObject, basisObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const discountValue = +discountObject.getValue();
        const redemptionValue = +redemptionObject.getValue();
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(discountValue) || Number.isNaN(redemptionValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            discountValue <= 0 ||
            redemptionValue <= 0 ||
            basisValue < 0 ||
            basisValue > 4 ||
            settlementSerialNumber >= maturitySerialNumber
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // B = number of days in year, depending on year basis.
        // DSM = number of days from settlement to maturity.
        const { days: DSM, yearDays: B } = getTwoDateDaysByBasis(settlementSerialNumber, maturitySerialNumber, basisValue);

        const result = redemptionValue - discountValue * redemptionValue * DSM / B;

        return NumberValueObject.create(result);
    }
}
