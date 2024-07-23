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

import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Datedif extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, unit: BaseValueObject) {
        if (startDate.isArray()) {
            startDate = (startDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (endDate.isArray()) {
            endDate = (endDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (unit.isArray()) {
            unit = (unit as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (startDate.isError()) {
            return startDate;
        }

        if (endDate.isError()) {
            return endDate;
        }

        if (unit.isError()) {
            return unit;
        }

        const startDateSerialNumber = getDateSerialNumberByObject(startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        let endDateSerialNumber = getDateSerialNumberByObject(endDate);

        if (typeof endDateSerialNumber !== 'number') {
            return endDateSerialNumber;
        }

        if (endDateSerialNumber < startDateSerialNumber) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (!unit.isString()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateDate.getUTCFullYear();
        const startMonth = startDateDate.getUTCMonth() + 1;
        const startDay = startDateDate.getUTCDate();

        const endDateDate = excelSerialToDate(endDateSerialNumber);
        const endYear = endDateDate.getUTCFullYear();
        const endMonth = endDateDate.getUTCMonth() + 1;
        const endDay = endDateDate.getUTCDate();

        const unitValue = String(unit.getValue()).toLocaleUpperCase();

        let result: number;

        switch (unitValue) {
            case 'Y':
                // The number of complete years in the period.
                result = endYear - startYear;
                break;
            case 'M':
                // The number of complete months in the period.
                result = (endYear - startYear) * 12 + endMonth - startMonth;
                break;
            case 'D':
                // The number of days in the period.
                result = Math.floor(endDateSerialNumber) - Math.floor(startDateSerialNumber);
                break;
            case 'MD':
                // The difference between the days in start_date and end_date. The months and years of the dates are ignored.
                result = endDay - startDay;
                break;
            case 'YM':
                // The difference between the months in start_date and end_date. The days and years of the dates are ignored.
                result = endMonth - startMonth;
                break;
            case 'YD':
                // The difference between the days of start_date and end_date. The years of the dates are ignored.
                // The year is the year of the start date
                endDateSerialNumber = excelDateSerial(new Date(Date.UTC(startYear, endMonth - 1, endDay)));
                result = Math.floor(endDateSerialNumber) - Math.floor(startDateSerialNumber);
                break;
            default:
                return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
