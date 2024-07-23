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

import { excelSerialToDate, getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Days360 extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, method?: BaseValueObject) {
        if (startDate.isError()) {
            return startDate;
        }

        if (endDate.isError()) {
            return endDate;
        }

        if (method?.isError()) {
            return method;
        }

        const maxRowLength = Math.max(
            startDate.isArray() ? (startDate as ArrayValueObject).getRowCount() : 1,
            endDate.isArray() ? (endDate as ArrayValueObject).getRowCount() : 1,
            method?.isArray() ? (method as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            startDate.isArray() ? (startDate as ArrayValueObject).getColumnCount() : 1,
            endDate.isArray() ? (endDate as ArrayValueObject).getColumnCount() : 1,
            method?.isArray() ? (method as ArrayValueObject).getColumnCount() : 1
        );

        const startDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, startDate, ErrorValueObject.create(ErrorType.NA));
        const endDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, endDate, ErrorValueObject.create(ErrorType.NA));
        const methodArray = method ? expandArrayValueObject(maxRowLength, maxColumnLength, method, ErrorValueObject.create(ErrorType.NA)) : [];

        const resultArray = startDateArray.map((startDateObject, rowIndex, columnIndex) => {
            const endDateObject = endDateArray.get(rowIndex, columnIndex) as BaseValueObject;
            let methodObject = method ? (methodArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject : BooleanValueObject.create(false);

            if (startDateObject.isError()) {
                return startDateObject;
            }

            const startDateSerialNumber = getDateSerialNumberByObject(startDateObject);

            if (typeof startDateSerialNumber !== 'number') {
                return startDateSerialNumber;
            }

            if (endDateObject.isError()) {
                return endDateObject;
            }

            const endDateSerialNumber = getDateSerialNumberByObject(endDateObject);

            if (typeof endDateSerialNumber !== 'number') {
                return endDateSerialNumber;
            }

            if (methodObject.isError()) {
                return methodObject;
            }

            if (methodObject.isString()) {
                methodObject = methodObject.convertToNumberObjectValue();
            }

            if (methodObject.isError()) {
                return methodObject;
            }

            const startDateDate = excelSerialToDate(startDateSerialNumber);
            const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
            const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() + 1 : 1;
            let startDay = startDateSerialNumber > 0 ? startDateDate.getUTCDate() : 0;

            let endDateDate = excelSerialToDate(endDateSerialNumber);
            let endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;
            let endMonth = endDateSerialNumber > 0 ? endDateDate.getUTCMonth() + 1 : 1;
            let endDay = endDateSerialNumber > 0 ? endDateDate.getUTCDate() : 0;

            const methodValue = +methodObject.getValue();

            if (!methodValue) {
                // U.S. (NASD) method.
                // If the starting date is the last day of a month, it becomes equal to the 30th day of the same month.
                // If the ending date is the last day of a month and the starting date is earlier than the 30th day of a month, the ending date becomes equal to the 1st day of the next month; otherwise the ending date becomes equal to the 30th day of the same month.
                if (startDay === 31) {
                    startDay = 30;
                }

                if (endDay === 31) {
                    if (startDay < 30) {
                        endDateDate = excelSerialToDate(endDateSerialNumber + 1);
                        endYear = endDateDate.getUTCFullYear();
                        endMonth = endDateDate.getUTCMonth() + 1;
                        endDay = endDateDate.getUTCDate();
                    } else {
                        endDay = 30;
                    }
                }
            } else {
                // European method. Starting dates and ending dates that occur on the 31st day of a month become equal to the 30th day of the same month.
                if (startDay === 31) {
                    startDay = 30;
                }

                if (endDay === 31) {
                    endDay = 30;
                }
            }

            const daysInYears = (endYear - startYear) * 360;
            const daysInStartMonth = endDateSerialNumber >= startDateSerialNumber ? 30 - startDay : -startDay;
            const daysInEndMonth = endDateSerialNumber >= startDateSerialNumber ? endDay : endDay - 30;
            const daysInMidMonths = (endDateSerialNumber >= startDateSerialNumber ? (endMonth - startMonth - 1) : (endMonth - startMonth + 1)) * 30;

            const totalDays = daysInYears + daysInStartMonth + daysInEndMonth + daysInMidMonths;

            return NumberValueObject.create(totalDays);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
