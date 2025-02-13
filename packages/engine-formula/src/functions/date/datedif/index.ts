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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject, getDaysInMonth } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Datedif extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, unit: BaseValueObject) {
        let _startDate = startDate;
        let _endDate = endDate;
        let _unit = unit;

        if (_startDate.isArray()) {
            _startDate = (_startDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_endDate.isArray()) {
            _endDate = (_endDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_unit.isArray()) {
            _unit = (_unit as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_startDate.isError()) {
            return _startDate;
        }

        if (_endDate.isError()) {
            return _endDate;
        }

        if (_unit.isError()) {
            return _unit;
        }

        const startDateSerialNumber = getDateSerialNumberByObject(_startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        const endDateSerialNumber = getDateSerialNumberByObject(_endDate);

        if (typeof endDateSerialNumber !== 'number') {
            return endDateSerialNumber;
        }

        if (endDateSerialNumber < startDateSerialNumber) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (!_unit.isString()) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return this._getResultByUnit(startDateSerialNumber, endDateSerialNumber, _unit);
    }

    private _getResultByUnit(startDateSerialNumber: number, endDateSerialNumber: number, unit: BaseValueObject): BaseValueObject {
        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateDate.getUTCFullYear();
        const startMonth = startDateDate.getUTCMonth() + 1;
        const startDay = startDateDate.getUTCDate();

        const endDateDate = excelSerialToDate(endDateSerialNumber);
        const endYear = endDateDate.getUTCFullYear();
        const endMonth = endDateDate.getUTCMonth() + 1;
        const endDay = endDateDate.getUTCDate();

        const unitValue = `${unit.getValue()}`.toLocaleUpperCase();

        let diff = 0;
        let newDate;

        switch (unitValue) {
            case 'Y':
                // The number of complete years in the period.
                diff = endYear - startYear;

                if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
                    diff -= 1;
                }
                break;
            case 'M':
                // The number of complete months in the period.
                diff = (endYear - startYear) * 12 + endMonth - startMonth;

                if (endDay < startDay) {
                    diff -= 1;
                }
                break;
            case 'D':
                // The number of days in the period.
                diff = Math.floor(endDateSerialNumber) - Math.floor(startDateSerialNumber);
                break;
            case 'MD':
                // The difference between the days in start_date and end_date. The months and years of the dates are ignored.
                diff = endDay - startDay;

                if (endDay < startDay) {
                    newDate = new Date(Date.UTC(endYear, endMonth - 1, 0));
                    diff += getDaysInMonth(newDate.getUTCFullYear(), newDate.getUTCMonth());
                }
                break;
            case 'YM':
                // The difference between the months in start_date and end_date. The days and years of the dates are ignored.
                diff = endMonth - startMonth;

                if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
                    diff += 12;
                }

                if (endDay < startDay) {
                    diff -= 1;
                }
                break;
            case 'YD':
                // The difference between the days of start_date and end_date. The years of the dates are ignored.
                // The year is the year of the start date
                newDate = new Date(Date.UTC(startYear, endMonth - 1, endDay));

                if (endMonth < startMonth || (endMonth === startMonth && endDay < startDay)) {
                    newDate = new Date(Date.UTC(startYear + 1, endMonth - 1, endDay));
                }

                diff = Math.floor(excelDateSerial(newDate)) - Math.floor(startDateSerialNumber);
                break;
            default:
                return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(diff);
    }
}
