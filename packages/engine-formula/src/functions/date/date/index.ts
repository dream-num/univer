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

import type { BaseValueObject } from '../../..';
import { ErrorType, ErrorValueObject, NumberValueObject } from '../../..';
import { DEFFAULT_DATE_FORMAT, excelDateSerial } from '../../../basics/date';
import { BaseFunction } from '../../base-function';

export class DateFunction extends BaseFunction {
    override calculate(year: BaseValueObject, month: BaseValueObject, day: BaseValueObject) {
        if (year.isError()) {
            return year;
        }

        if (month.isError()) {
            return month;
        }

        if (day.isError()) {
            return day;
        }

        // TODO@Dushusir: array
        const yearValue = +year.getValue();
        const monthValue = +month.getValue();
        const dayValue = +day.getValue();

        const date = new Date(yearValue, monthValue - 1, dayValue);

        if (date.getMonth() !== monthValue - 1 || date.getDate() !== dayValue) {
            return new ErrorValueObject(ErrorType.VALUE);
        }

        const currentSerial = excelDateSerial(date);
        const valueObject = new NumberValueObject(currentSerial);
        valueObject.setPattern(DEFFAULT_DATE_FORMAT);
        return valueObject;
    }
}
