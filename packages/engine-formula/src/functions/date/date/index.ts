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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { DateSystem, excelDateSerial, getDateSystemMaxSerial } from '@univerjs/core';
import { DEFAULT_DATE_FORMAT } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class DateFunction extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    protected readonly useExcelDateBounds: boolean = false;

    override calculate(year: BaseValueObject, month: BaseValueObject, day: BaseValueObject) {
        const maxRowLength = Math.max(
            year.isArray() ? (year as ArrayValueObject).getRowCount() : 1,
            month.isArray() ? (month as ArrayValueObject).getRowCount() : 1,
            day.isArray() ? (day as ArrayValueObject).getRowCount() : 1
        );
        const maxColumnLength = Math.max(
            year.isArray() ? (year as ArrayValueObject).getColumnCount() : 1,
            month.isArray() ? (month as ArrayValueObject).getColumnCount() : 1,
            day.isArray() ? (day as ArrayValueObject).getColumnCount() : 1
        );

        const yearArray = expandArrayValueObject(maxRowLength, maxColumnLength, year, ErrorValueObject.create(ErrorType.NA));
        const monthArray = expandArrayValueObject(maxRowLength, maxColumnLength, month, ErrorValueObject.create(ErrorType.NA));
        const dayArray = expandArrayValueObject(maxRowLength, maxColumnLength, day, ErrorValueObject.create(ErrorType.NA));

        const resultArray = yearArray.map((yearObject, rowIndex, columnIndex) => {
            const monthObject = monthArray.get(rowIndex, columnIndex) as BaseValueObject;
            const dayObject = dayArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (yearObject.isError()) {
                return yearObject;
            }

            if (monthObject.isError()) {
                return monthObject;
            }

            if (dayObject.isError()) {
                return dayObject;
            }

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(yearObject, monthObject, dayObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_yearObject, _monthObject, _dayObject] = variants as BaseValueObject[];

            let yearValue = Math.floor(+_yearObject.getValue());
            const monthValue = Math.floor(+_monthObject.getValue());
            let dayValue = Math.floor(+_dayObject.getValue());

            if (yearValue < 0 || yearValue > 9999) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (yearValue < (this.useExcelDateBounds ? 1900 : 1899)) {
                yearValue += 1900;
            }
            if (this.useExcelDateBounds) {
                if (!this._isExcelMonthValid(yearValue, monthValue)) {
                    return ErrorValueObject.create(ErrorType.NUM);
                }
                // Excel uses 32767 for a day outside the signed 16-bit range.
                if (dayValue < -32768 || dayValue > 32767) {
                    dayValue = 32767;
                }
            }

            // Build the serial from the first day of the normalized month. This keeps
            // Excel's fictitious 1900-02-29 (serial 60) instead of letting native Date
            // normalize it to 1900-03-01.
            const firstDateOfMonth = new Date(Date.UTC(yearValue, monthValue - 1, 1));
            const currentSerial = excelDateSerial(firstDateOfMonth, this.getDateSystem()) + dayValue - 1;

            if (currentSerial < 0 || (this.useExcelDateBounds && currentSerial > getDateSystemMaxSerial(this.getDateSystem()))) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const valueObject = NumberValueObject.create(currentSerial, DEFAULT_DATE_FORMAT);

            return valueObject;
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _isExcelMonthValid(year: number, month: number): boolean {
        const normalizedYear = year + Math.floor((month - 1) / 12);
        const firstYear = this.getDateSystem() === DateSystem.Date1904 ? 1904 : 1900;
        return month >= -32768 && month < 32767 && normalizedYear >= firstYear && normalizedYear <= 9999;
    }
}
