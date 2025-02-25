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

import { DEFAULT_DATE_FORMAT, excelDateSerial } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class DateFunction extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

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

        // get max row length
        const maxRowLength = Math.max(
            year.isArray() ? (year as ArrayValueObject).getRowCount() : 1,
            month.isArray() ? (month as ArrayValueObject).getRowCount() : 1,
            day.isArray() ? (day as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            year.isArray() ? (year as ArrayValueObject).getColumnCount() : 1,
            month.isArray() ? (month as ArrayValueObject).getColumnCount() : 1,
            day.isArray() ? (day as ArrayValueObject).getColumnCount() : 1
        );

        const yearArray = expandArrayValueObject(maxRowLength, maxColumnLength, year);
        const monthArray = expandArrayValueObject(maxRowLength, maxColumnLength, month);
        const dayArray = expandArrayValueObject(maxRowLength, maxColumnLength, day);

        return yearArray.map((yearValueObject, rowIndex, columnIndex) => {
            const monthValueObject = monthArray.get(rowIndex, columnIndex) || NullValueObject.create();
            const dayValueObject = dayArray.get(rowIndex, columnIndex) || NullValueObject.create();

            if (yearValueObject.isError()) {
                return yearValueObject;
            }

            if (monthValueObject.isError()) {
                return monthValueObject;
            }

            if (dayValueObject.isError()) {
                return dayValueObject;
            }

            if (yearValueObject.isString() || monthValueObject.isString() || dayValueObject.isString()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            let yearValue = +yearValueObject.getValue();
            const monthValue = Math.floor(+monthValueObject.getValue());
            const dayValue = +dayValueObject.getValue();

            if (yearValue < 0 || yearValue > 9999) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (yearValue >= 0 && yearValue < 1899) {
                yearValue += 1900;
            }

            const date = new Date(yearValue, monthValue - 1, dayValue);

            const currentSerial = excelDateSerial(date);

            if (currentSerial < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const valueObject = NumberValueObject.create(currentSerial, DEFAULT_DATE_FORMAT);

            return valueObject;
        });
    }
}
