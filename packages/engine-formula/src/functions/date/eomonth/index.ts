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

import { isRealNum } from '@univerjs/core';
import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Eomonth extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(startDate: BaseValueObject, months: BaseValueObject) {
        if (startDate.isArray()) {
            const rowCount = (startDate as ArrayValueObject).getRowCount();
            const columnCount = (startDate as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            startDate = (startDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (months.isArray()) {
            const rowCount = (months as ArrayValueObject).getRowCount();
            const columnCount = (months as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            months = (months as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (startDate.isError()) {
            return startDate;
        }

        if (months.isError()) {
            return months;
        }

        const startDateSerialNumber = getDateSerialNumberByObject(startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
        const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() : 0;

        let monthsValue = months.getValue();

        if (months.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (months.isString() && !isRealNum(monthsValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        monthsValue = Math.floor(+monthsValue);

        const targetDate = new Date(Date.UTC(startYear, startMonth + monthsValue + 1, 0));
        const result = excelDateSerial(targetDate);

        return NumberValueObject.create(result);
    }
}
