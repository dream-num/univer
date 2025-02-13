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

import { getDateSerialNumberByObject, getNormalYearDaysByBasis, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Pricemat extends BaseFunction {
    override minParams = 5;

    override maxParams = 6;

    override calculate(
        settlement: BaseValueObject,
        maturity: BaseValueObject,
        issue: BaseValueObject,
        rate: BaseValueObject,
        yld: BaseValueObject,
        basis?: BaseValueObject
    ): BaseValueObject {
        let _basis = basis ?? NumberValueObject.create(0);

        if (_basis.isNull()) {
            _basis = NumberValueObject.create(0);
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, issue, rate, yld, _basis);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, issueObject, rateObject, yldObject, basisObject] = variants as BaseValueObject[];

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

        const rateValue = +rateObject.getValue();
        const yldValue = +yldObject.getValue();
        const basisValue = Math.floor(+basisObject.getValue());

        if (Number.isNaN(rateValue) || Number.isNaN(yldValue) || Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const isCorrectOrder = this._getDateCorrectOrder(maturitySerialNumber, settlementSerialNumber, issueSerialNumber);

        if (
            rateValue < 0 ||
            yldValue < 0 ||
            basisValue < 0 ||
            basisValue > 4 ||
            !isCorrectOrder
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // B = number of days in year, depending on year basis.
        // DSM = number of days from settlement to maturity.
        // DIM = number of days from issue to maturity.
        // A = number of days from issue to settlement.
        const B = getNormalYearDaysByBasis(settlementSerialNumber, basisValue);
        const { days: DSM } = getTwoDateDaysByBasis(settlementSerialNumber, maturitySerialNumber, basisValue);
        const { days: DIM } = getTwoDateDaysByBasis(issueSerialNumber, maturitySerialNumber, basisValue);
        const { days: A } = getTwoDateDaysByBasis(issueSerialNumber, settlementSerialNumber, basisValue);

        const result = (100 + DIM / B * rateValue * 100) / (1 + DSM / B * yldValue) - (A / B * rateValue * 100);

        return NumberValueObject.create(result);
    }

    private _getDateCorrectOrder(maturitySerialNumber: number, settlementSerialNumber: number, issueSerialNumber: number): boolean {
        return Math.floor(maturitySerialNumber) > Math.floor(settlementSerialNumber)
            && Math.floor(settlementSerialNumber) > Math.floor(issueSerialNumber);
    }
}
