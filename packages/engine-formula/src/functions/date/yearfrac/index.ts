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
import { checkVariantErrorIsArray } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Yearfrac extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, basis?: BaseValueObject) {
        let _basis = basis ?? NumberValueObject.create(0);

        const _startDate = checkVariantErrorIsArray(startDate);

        if (_startDate.isError()) {
            return _startDate;
        }

        const _endDate = checkVariantErrorIsArray(endDate);

        if (_endDate.isError()) {
            return _endDate;
        }

        _basis = checkVariantErrorIsArray(_basis);

        if (_basis.isError()) {
            return _basis;
        }

        if (_startDate.isBoolean() || _endDate.isBoolean() || _basis.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const startDateSerialNumber = getDateSerialNumberByObject(_startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        const endDateSerialNumber = getDateSerialNumberByObject(_endDate);

        if (typeof endDateSerialNumber !== 'number') {
            return endDateSerialNumber;
        }

        const basisValue = Math.floor(+_basis.getValue());

        if (Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (basisValue < 0 || basisValue > 4) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const { days, yearDays } = getTwoDateDaysByBasis(startDateSerialNumber, endDateSerialNumber, basisValue);

        const result = days / yearDays;

        return NumberValueObject.create(result);
    }
}
