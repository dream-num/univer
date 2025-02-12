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

import { getDateSerialNumberByObject, getDateSerialNumberByWorkingDays, isValidWeekend } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class WorkdayIntl extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override calculate(startDate: BaseValueObject, days: BaseValueObject, weekend?: BaseValueObject, holidays?: BaseValueObject) {
        if (startDate.isError()) {
            return startDate;
        }

        if (days.isError()) {
            return days;
        }

        if (weekend?.isError()) {
            return weekend;
        }

        if (holidays?.isError()) {
            return holidays;
        }

        if (weekend?.isArray()) {
            return weekend.map((weekendItem) => this._handleSingleObject(startDate, days, weekendItem, holidays));
        }

        return this._handleSingleObject(startDate, days, weekend, holidays);
    }

    private _handleSingleObject(startDate: BaseValueObject, days: BaseValueObject, weekend?: BaseValueObject, holidays?: BaseValueObject) {
        const _weekend = weekend ?? NumberValueObject.create(1);

        const _startDate = this._checkArrayError(startDate);

        if (_startDate.isError()) {
            return _startDate;
        }

        const _days = this._checkArrayError(days);

        if (_days.isError()) {
            return _days;
        }

        if (_startDate.isBoolean() || _days.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const startDateSerialNumber = getDateSerialNumberByObject(startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        const workingDays = +days.getValue();

        if (Number.isNaN(workingDays)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let weekendValue = _weekend.getValue() as number | string;

        if (_weekend.isBoolean()) {
            weekendValue = +weekendValue;
        }

        // 1111111 is an invalid string.
        if (_weekend.isString() && (!isValidWeekend(weekendValue) || weekendValue === '1111111')) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (!isValidWeekend(weekendValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (holidays) {
            return this._getResultByHolidays(startDateSerialNumber, workingDays, weekendValue, holidays);
        }

        const result = getDateSerialNumberByWorkingDays(startDateSerialNumber, workingDays, weekendValue);

        if (typeof result !== 'number') {
            return result;
        }

        return NumberValueObject.create(result);
    }

    private _checkArrayError(variant: BaseValueObject): BaseValueObject {
        let _variant = variant;

        if (_variant.isArray()) {
            const rowCount = (_variant as ArrayValueObject).getRowCount();
            const columnCount = (_variant as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _variant = (_variant as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_variant.isError()) {
            return _variant;
        }

        return _variant;
    }

    private _getResultByHolidays(startDateSerialNumber: number, workingDays: number, weekendValue: number | string, holidays: BaseValueObject): BaseValueObject {
        const holidaysValueArray = [];

        if (holidays?.isArray()) {
            const rowCount = (holidays as ArrayValueObject).getRowCount();
            const columnCount = (holidays as ArrayValueObject).getColumnCount();

            for (let r = 0; r < rowCount; r++) {
                for (let c = 0; c < columnCount; c++) {
                    const cell = (holidays as ArrayValueObject).get(r, c) as BaseValueObject;

                    if (cell.isBoolean()) {
                        return ErrorValueObject.create(ErrorType.VALUE);
                    }

                    const holidaySerialNumber = getDateSerialNumberByObject(cell);

                    if (typeof holidaySerialNumber !== 'number') {
                        return holidaySerialNumber;
                    }

                    holidaysValueArray.push(holidaySerialNumber);
                }
            }
        } else {
            if (holidays.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const holidaySerialNumber = getDateSerialNumberByObject(holidays);

            if (typeof holidaySerialNumber !== 'number') {
                return holidaySerialNumber;
            }

            holidaysValueArray.push(holidaySerialNumber);
        }

        const result = getDateSerialNumberByWorkingDays(startDateSerialNumber, workingDays, weekendValue, holidaysValueArray);

        if (typeof result !== 'number') {
            return result;
        }

        return NumberValueObject.create(result);
    }
}
