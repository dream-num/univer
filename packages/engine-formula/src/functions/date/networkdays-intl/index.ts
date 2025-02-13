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

import { countWorkingDays, getDateSerialNumberByObject, isValidWeekend } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class NetworkdaysIntl extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, weekend?: BaseValueObject, holidays?: BaseValueObject) {
        if (startDate.isError()) {
            return startDate;
        }

        if (endDate.isError()) {
            return endDate;
        }

        if (weekend?.isError()) {
            return weekend;
        }

        if (holidays?.isError()) {
            return holidays;
        }

        if (weekend?.isArray()) {
            return weekend.map((weekendItem) => this._handleSingleObject(startDate, endDate, weekendItem, holidays));
        }

        return this._handleSingleObject(startDate, endDate, weekend, holidays);
    }

    private _handleSingleObject(startDate: BaseValueObject, endDate: BaseValueObject, weekend?: BaseValueObject, holidays?: BaseValueObject) {
        let _startDate = startDate;
        let _endDate = endDate;

        if (_startDate.isArray()) {
            const rowCount = (_startDate as ArrayValueObject).getRowCount();
            const columnCount = (_startDate as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _startDate = (_startDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_startDate.isError()) {
            return _startDate;
        }

        if (_endDate.isArray()) {
            const rowCount = (_endDate as ArrayValueObject).getRowCount();
            const columnCount = (_endDate as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _endDate = (_endDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_endDate.isError()) {
            return _endDate;
        }

        let weekendValue: number | string = 1;

        if (weekend) {
            weekendValue = weekend.getValue() as number | string;

            if (weekend.isBoolean()) {
                weekendValue = +weekendValue;
            }

            if (weekend.isString() && !isValidWeekend(weekendValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (!isValidWeekend(weekendValue)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
        }

        if (_startDate.isBoolean() || _endDate.isBoolean()) {
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

        if (holidays) {
            return this._getResultByHolidays(startDateSerialNumber, endDateSerialNumber, weekendValue, holidays);
        }

        const result = countWorkingDays(startDateSerialNumber, endDateSerialNumber, weekendValue);

        return NumberValueObject.create(result);
    }

    private _getResultByHolidays(startDateSerialNumber: number, endDateSerialNumber: number, weekendValue: number | string, holidays: BaseValueObject): BaseValueObject {
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

        const result = countWorkingDays(startDateSerialNumber, endDateSerialNumber, weekendValue, holidaysValueArray);

        return NumberValueObject.create(result);
    }
}
