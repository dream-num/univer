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

import { countWorkingDays, excelSerialToDate, isValidDateStr } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Networkdays extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, holidays?: BaseValueObject) {
        if (startDate.isError()) {
            return startDate;
        }

        if (endDate.isError()) {
            return endDate;
        }

        if (holidays?.isError()) {
            return holidays;
        }

        if (startDate.isArray()) {
            if ((startDate as ArrayValueObject).getRowCount() > 1 || (startDate as ArrayValueObject).getColumnCount() > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            startDate = (startDate as ArrayValueObject).get(0, 0) as BaseValueObject;

            if (startDate.isError()) {
                return startDate;
            }
        }

        if (endDate.isArray()) {
            if ((endDate as ArrayValueObject).getRowCount() > 1 || (endDate as ArrayValueObject).getColumnCount() > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            endDate = (endDate as ArrayValueObject).get(0, 0) as BaseValueObject;

            if (endDate.isError()) {
                return endDate;
            }
        }

        if (startDate.isBoolean() || endDate.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        let startDateObject: Date;
        const startDateValue = startDate.getValue();

        if (startDate.isString()) {
            if (!isValidDateStr(`${startDateValue}`)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            startDateObject = new Date(`${startDateValue}`);
        } else {
            const dateSerial = +startDateValue;

            if (dateSerial < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            startDateObject = excelSerialToDate(dateSerial);
        }

        let endDateObject: Date;
        const endDateValue = endDate.getValue();

        if (endDate.isString()) {
            if (!isValidDateStr(`${endDateValue}`)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            endDateObject = new Date(`${endDateValue}`);
        } else {
            const dateSerial = +endDateValue;

            if (dateSerial < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            endDateObject = excelSerialToDate(dateSerial);
        }

        let result: number;

        if (holidays) {
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

                        let holidaysObject: Date;
                        const holidaysValue = cell.getValue();

                        if (cell.isString()) {
                            if (!isValidDateStr(`${holidaysValue}`)) {
                                return ErrorValueObject.create(ErrorType.VALUE);
                            }

                            holidaysObject = new Date(`${holidaysValue}`);
                        } else {
                            const dateSerial = +holidaysValue;

                            if (dateSerial < 0) {
                                return ErrorValueObject.create(ErrorType.NUM);
                            }

                            holidaysObject = excelSerialToDate(dateSerial);
                        }

                        holidaysValueArray.push(holidaysObject);
                    }
                }
            } else {
                let holidaysObject: Date;
                const holidaysValue = holidays.getValue();

                if (holidays.isBoolean()) {
                    return ErrorValueObject.create(ErrorType.VALUE);
                }

                if (holidays.isString()) {
                    if (!isValidDateStr(`${holidaysValue}`)) {
                        return ErrorValueObject.create(ErrorType.VALUE);
                    }

                    holidaysObject = new Date(`${holidaysValue}`);
                } else {
                    const dateSerial = +holidaysValue;

                    if (dateSerial < 0) {
                        return ErrorValueObject.create(ErrorType.NUM);
                    }

                    holidaysObject = excelSerialToDate(dateSerial);
                }

                holidaysValueArray.push(holidaysObject);
            }

            result = countWorkingDays(startDateObject, endDateObject, 1, holidaysValueArray);
        } else {
            result = countWorkingDays(startDateObject, endDateObject);
        }

        return NumberValueObject.create(result);
    }
}
