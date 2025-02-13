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

import { getDateSerialNumberByObject, getDateSerialNumberByWorkingDays } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Workday extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, days: BaseValueObject, holidays?: BaseValueObject) {
        let _startDate = startDate;
        let _days = days;

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

        if (_days.isArray()) {
            const rowCount = (_days as ArrayValueObject).getRowCount();
            const columnCount = (_days as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _days = (_days as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_days.isError()) {
            return _days;
        }

        if (holidays?.isError()) {
            return holidays;
        }

        if (_startDate.isBoolean() || _days.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const startDateSerialNumber = getDateSerialNumberByObject(_startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        const workingDays = +_days.getValue();

        if (Number.isNaN(workingDays)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (holidays) {
            return this._getResultByHolidays(startDateSerialNumber, workingDays, holidays);
        }

        const result = getDateSerialNumberByWorkingDays(startDateSerialNumber, workingDays);

        if (typeof result !== 'number') {
            return result;
        }

        return NumberValueObject.create(result);
    }

    private _getResultByHolidays(startDateSerialNumber: number, workingDays: number, holidays: BaseValueObject) {
        const holidaysValueArray: number[] = [];

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

        const result = getDateSerialNumberByWorkingDays(startDateSerialNumber, workingDays, 1, holidaysValueArray);

        if (typeof result !== 'number') {
            return result;
        }

        return NumberValueObject.create(result);
    }
}
