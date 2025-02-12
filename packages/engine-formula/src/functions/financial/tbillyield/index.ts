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
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Tbillyield extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(settlement: BaseValueObject, maturity: BaseValueObject, pr: BaseValueObject): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsNullorArrayOrBoolean(settlement, maturity, pr);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [settlementObject, maturityObject, prObject] = variants as BaseValueObject[];

        const settlementSerialNumber = getDateSerialNumberByObject(settlementObject);

        if (typeof settlementSerialNumber !== 'number') {
            return settlementSerialNumber;
        }

        const maturitySerialNumber = getDateSerialNumberByObject(maturityObject);

        if (typeof maturitySerialNumber !== 'number') {
            return maturitySerialNumber;
        }

        const prValue = +prObject.getValue();

        if (Number.isNaN(prValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (
            prValue <= 0 ||
            settlementSerialNumber >= maturitySerialNumber
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // where DSM is the number of days between settlement and maturity computed according to the 360 days per year basis.
        const DSM = Math.floor(maturitySerialNumber) - Math.floor(settlementSerialNumber);

        const date = excelSerialToDate(settlementSerialNumber);
        const year = date.getUTCFullYear();
        const yearDays = getDaysInYear(year);

        // if maturity is more than one year after settlement, TBILLYIELD returns the #NUM! error value.
        if (DSM > yearDays) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        // TBILLYIELD is calculated as TBILLYIELD = (100 - pr) / pr x 360 / DSM
        const result = (100 - prValue) / prValue * 360 / DSM;

        return NumberValueObject.create(result);
    }
}
