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

import { excelSerialToDate, getDateSerialNumberByObject, getDaysInYear } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { checkVariantsErrorIsNullorArrayOrBoolean } from '../../../engine/utils/check-variant-error';
import { getCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Tbillprice extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override needsLocale = true;

    override calculate(settlement: BaseValueObject, maturity: BaseValueObject, discount: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, discount);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, discountObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const discountValue = +discountObject.getValue();

        if (Number.isNaN(discountValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            discountValue <= 0 ||
            settlementSerialNumber >= maturitySerialNumber
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // where DSM is the number of days between settlement and maturity computed according to the 360 days per year basis.
        const DSM = Math.floor(maturitySerialNumber) - Math.floor(settlementSerialNumber);

        const date = excelSerialToDate(settlementSerialNumber);
        const year = date.getUTCFullYear();
        const yearDays = getDaysInYear(year);

        // if maturity is more than one year after settlement, TBILLPRICE returns the #NUM! error value.
        if (DSM > yearDays) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // TBILLPRICE is calculated as TBILLPRICE = 100 x (1 - discount x DSM / 360)
        const result = 100 * (1 - discountValue * DSM / 360);

        if (result < 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result, getCurrencyFormat(this.getLocale()));
    }
}
