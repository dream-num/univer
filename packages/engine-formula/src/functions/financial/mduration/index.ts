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
import { calculateDuration } from '../../../basics/financial';
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Mduration extends BaseFunction {
    override minParams = 5;

    override maxParams = 6;

    override calculate(
        settlement: BaseValueObject,
        maturity: BaseValueObject,
        coupon: BaseValueObject,
        yld: BaseValueObject,
        frequency: BaseValueObject,
        basis?: BaseValueObject
    ): BaseValueObject {
        let _basis = basis ?? NumberValueObject.create(0);

        if (_basis.isNull()) {
            _basis = NumberValueObject.create(0);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, coupon, yld, frequency, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, couponObject, yldObject, frequencyObject, basisObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const couponValue = +couponObject.getValue();
        const yldValue = +yldObject.getValue();
        const frequencyValue = Math.floor(+frequencyObject.getValue());
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(couponValue) || Number.isNaN(yldValue) || Number.isNaN(frequencyValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            couponValue < 0 ||
            yldValue < 0 ||
            ![1, 2, 4].includes(frequencyValue) ||
            basisValue < 0 ||
            basisValue > 4 ||
            Math.floor(settlementSerialNumber) >= Math.floor(maturitySerialNumber)
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = calculateDuration(settlementSerialNumber, maturitySerialNumber, couponValue, yldValue, frequencyValue, basisValue);

        result /= 1 + yldValue / frequencyValue;

        return NumberValueObject.create(result);
    }
}
