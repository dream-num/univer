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

import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject, getWeekDayByDateSerialNumber } from '../../../basics/date';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Isoweeknum extends BaseFunction {
    override minParams = 1;

    override maxParams = 1;

    override calculate(date: BaseValueObject) {
        if (date.isError()) {
            return date;
        }

        if (date.isArray()) {
            return date.map((dateObject) => {
                if (dateObject.isError()) {
                    return dateObject;
                }

                return this._handleSingleObject(dateObject);
            });
        }

        return this._handleSingleObject(date);
    }

    private _handleSingleObject(date: BaseValueObject) {
        const dateSerialNumber = getDateSerialNumberByObject(date);

        if (typeof dateSerialNumber !== 'number') {
            return dateSerialNumber;
        }

        const currentDate = excelSerialToDate(dateSerialNumber);
        const currentYear = dateSerialNumber > 0 ? currentDate.getUTCFullYear() : 1900;
        let yearStart = new Date(Date.UTC(currentYear, 0, 1));
        let yearStartSerialNumber = excelDateSerial(yearStart);
        let yearStartWeekDay = getWeekDayByDateSerialNumber(yearStartSerialNumber);

        let yearWeekStartSerialNumber: number;

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

        const result = Math.ceil((dateSerialNumber - yearWeekStartSerialNumber + 1) / 7);

        return NumberValueObject.create(result);
    }
}
