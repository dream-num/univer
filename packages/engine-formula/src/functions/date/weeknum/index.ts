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
import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject, getWeekDayByDateSerialNumber } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Weeknum extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    private returnTypeMap: {
        [index: number]: number;
    } = {
            1: 0,
            2: 1,
            11: 1,
            12: 2,
            13: 3,
            14: 4,
            15: 5,
            16: 6,
            17: 0,
            21: 4,
        };

    override calculate(serialNumber: BaseValueObject, returnType?: BaseValueObject) {
        if (serialNumber.isArray()) {
            const rowCount = (serialNumber as ArrayValueObject).getRowCount();
            const columnCount = (serialNumber as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            serialNumber = (serialNumber as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (returnType?.isArray()) {
            const rowCount = (returnType as ArrayValueObject).getRowCount();
            const columnCount = (returnType as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            returnType = (returnType as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (serialNumber.isError()) {
            return serialNumber;
        }

        if (returnType?.isError()) {
            return returnType;
        }

        if (serialNumber.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const dateSerialNumber = getDateSerialNumberByObject(serialNumber);

        if (typeof dateSerialNumber !== 'number') {
            return dateSerialNumber;
        }

        let returnTypeValue = 1;

        if (returnType) {
            returnTypeValue = Math.floor(+returnType.getValue());

            if (returnType.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (returnType.isString() && !isRealNum(returnTypeValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }
        }

        if (!(returnTypeValue in this.returnTypeMap)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const currentDate = excelSerialToDate(dateSerialNumber);
        const currentYear = dateSerialNumber > 0 ? currentDate.getUTCFullYear() : 1900;
        let yearStart = new Date(Date.UTC(currentYear, 0, 1));
        let yearStartSerialNumber = excelDateSerial(yearStart);
        let yearStartWeekDay = getWeekDayByDateSerialNumber(yearStartSerialNumber);

        let yearWeekStartSerialNumber: number;

        if (returnTypeValue === 21) {
            // System 2
            // The week containing the first Thursday of the year is the first week of the year, and is numbered as week 1. This system is the methodology specified in ISO 8601, which is commonly known as the European week numbering system.
            if (yearStartWeekDay < 1) {
                yearWeekStartSerialNumber = yearStartSerialNumber + 1;
            } else if (yearStartWeekDay <= 4) {
                yearWeekStartSerialNumber = yearStartSerialNumber - (yearStartWeekDay - 1);
            } else {
                yearWeekStartSerialNumber = yearStartSerialNumber + (11 - yearStartWeekDay);
            }

            if (dateSerialNumber < yearWeekStartSerialNumber) {
                yearStart = new Date(Date.UTC(currentYear - 1, 0, 1));
                yearStartSerialNumber = excelDateSerial(yearStart);
                yearStartWeekDay = getWeekDayByDateSerialNumber(yearStartSerialNumber);

                if (yearStartWeekDay < 1) {
                    yearWeekStartSerialNumber = yearStartSerialNumber + 1;
                } else if (yearStartWeekDay <= 4) {
                    yearWeekStartSerialNumber = yearStartSerialNumber - (yearStartWeekDay - 1);
                } else {
                    yearWeekStartSerialNumber = yearStartSerialNumber + (11 - yearStartWeekDay);
                }
            }
        } else {
            // System 1
            // The week containing January 1 is the first week of the year, and is numbered week 1.
            const weekDay = this.returnTypeMap[returnTypeValue];

            if (yearStartWeekDay < weekDay) {
                yearWeekStartSerialNumber = yearStartSerialNumber - (yearStartWeekDay + 7 - weekDay);
            } else {
                yearWeekStartSerialNumber = yearStartSerialNumber - (yearStartWeekDay - weekDay);
            }
        }

        const result = Math.ceil((dateSerialNumber - yearWeekStartSerialNumber + 1) / 7);

        return NumberValueObject.create(result);
    }
}
