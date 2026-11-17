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

import type { BaseReferenceObject, FunctionVariantType } from '../../../engine/reference-object/base-reference-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { getDateSerialNumberByObject, getDateSerialNumberByWorkingDays, isValidWeekend } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class WorkdayIntl extends BaseFunction {
    override minParams = 2;

    override maxParams = 4;

    override needsReferenceObject = true;

    override calculate(startDateInput: FunctionVariantType, daysInput: FunctionVariantType, weekendInput?: FunctionVariantType, holidaysInput?: FunctionVariantType) {
        const startDate = this._getArgument(startDateInput);
        const days = this._getArgument(daysInput);
        const weekend = weekendInput == null || (!weekendInput.isReferenceObject() && (weekendInput as BaseValueObject).isNull())
            ? NumberValueObject.create(1)
            : this._getArgument(weekendInput, true);
        const holidays = holidaysInput?.isReferenceObject()
            ? (holidaysInput as BaseReferenceObject).toArrayValueObject()
            : holidaysInput as BaseValueObject | undefined;
        const dates = this._getHolidayDates(holidays);
        const inputs = [startDate, days, weekend];
        const arrays = inputs.filter((input): input is ArrayValueObject => input.isArray());
        if (arrays.length === 0) {
            return this._calculateDate(startDate, days, weekend, dates);
        }

        const rows = Math.max(...arrays.map((input) => input.getRowCount()));
        const columns = Math.max(...arrays.map((input) => input.getColumnCount()));
        const missing = ErrorValueObject.create(ErrorType.NA);
        const [startDates, dayCounts, weekends] = inputs.map((input) => expandArrayValueObject(rows, columns, input, missing));
        return startDates.map((start, row, column) =>
            this._calculateDate(start, dayCounts.get(row, column) ?? missing, weekends.get(row, column) ?? missing, dates)
        );
    }

    private _getArgument(input: FunctionVariantType, allowRange = false): BaseValueObject {
        if (!input.isReferenceObject()) {
            return input as BaseValueObject;
        }
        const reference = input as BaseReferenceObject;
        if (!reference.isMultiArea() && reference.getRowCount() === 1 && reference.getColumnCount() === 1) {
            return reference.getFirstCell();
        }
        return allowRange ? reference.toArrayValueObject() : ErrorValueObject.create(ErrorType.VALUE);
    }

    private _calculateDate(startDate: BaseValueObject, days: BaseValueObject, weekend: BaseValueObject, holidays: number[] | ErrorValueObject) {
        if (startDate.isError()) {
            return startDate;
        }
        if (days.isError()) {
            return days;
        }
        if (startDate.isBoolean() || days.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        const serial = getDateSerialNumberByObject(startDate, this.getDateSystem());
        if (typeof serial !== 'number') {
            return serial;
        }
        const workingDays = Math.trunc(+days.getValue());
        if (Number.isNaN(workingDays)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (workingDays === 0) {
            return NumberValueObject.create(Math.floor(serial));
        }
        const value = weekend.getValue();
        const weekendValue = typeof value === 'boolean' ? Number(value) : value as string | number;
        if (weekend.isString() && (!isValidWeekend(weekendValue) || weekendValue === '1111111')) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (weekend.isError() || !isValidWeekend(weekendValue) || !Number.isFinite(workingDays)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }
        if (!Array.isArray(holidays)) {
            return holidays;
        }
        const result = getDateSerialNumberByWorkingDays(serial, workingDays, weekendValue, holidays, this.getDateSystem());
        return typeof result === 'number' ? NumberValueObject.create(result) : result;
    }

    private _getHolidayDates(holidays?: BaseValueObject): number[] | ErrorValueObject {
        if (holidays == null || holidays.isNull()) {
            return [];
        }
        if (holidays.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }
        if (!holidays.isArray()) {
            const date = getDateSerialNumberByObject(holidays, this.getDateSystem());
            return typeof date === 'number' ? [date] : date;
        }

        const values = holidays as ArrayValueObject;
        const dates: number[] = [];
        for (let row = 0; row < values.getRowCount(); row++) {
            for (let column = 0; column < values.getColumnCount(); column++) {
                const value = values.get(row, column);
                if (!value || value.isNull()) {
                    continue;
                }
                if (value.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }
                const date = getDateSerialNumberByObject(value, this.getDateSystem());
                if (typeof date === 'number') {
                    dates.push(date);
                } else if (!value.isString()) {
                    return date;
                }
            }
        }
        return dates;
    }
}
