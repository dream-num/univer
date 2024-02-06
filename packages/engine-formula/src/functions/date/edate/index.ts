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

import { DEFFAULT_DATE_FORMAT, excelDateSerial, excelSerialToDate } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Edate extends BaseFunction {
    override calculate(startDate: BaseValueObject, months: BaseValueObject) {
        if (startDate == null || months == null) {
            return new ErrorValueObject(ErrorType.NA);
        }

        if (startDate.isError()) {
            return startDate;
        }

        if (months.isError()) {
            return months;
        }

        // get max row length
        const maxRowLength = Math.max(
            startDate.isArray() ? (startDate as ArrayValueObject).getRowCount() : 1,
            months.isArray() ? (months as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            startDate.isArray() ? (startDate as ArrayValueObject).getColumnCount() : 1,
            months.isArray() ? (months as ArrayValueObject).getColumnCount() : 1
        );

        const yearArray = expandArrayValueObject(maxRowLength, maxColumnLength, startDate);
        const monthArray = expandArrayValueObject(maxRowLength, maxColumnLength, months);

        return yearArray.map((startDateObject, rowIndex, columnIndex) => {
            const monthValueObject = monthArray.get(rowIndex, columnIndex);

            if (startDateObject.isError()) {
                return startDateObject;
            }

            if (monthValueObject.isError()) {
                return monthValueObject;
            }

            if (startDateObject.isString() || monthValueObject.isString()) {
                return new ErrorValueObject(ErrorType.VALUE);
            }

            const startDateSerial = +startDateObject.getValue();
            const monthValue = Math.floor(+monthValueObject.getValue());

            const startDate = excelSerialToDate(startDateSerial);

            const year = startDate.getUTCFullYear();
            const month = startDate.getUTCMonth() + monthValue;
            const day = startDate.getUTCDate();

            const resultDate = new Date(Date.UTC(year, month, day));
            const currentSerial = excelDateSerial(resultDate);

            const valueObject = new NumberValueObject(currentSerial);
            valueObject.setPattern(DEFFAULT_DATE_FORMAT);

            return valueObject;
        });
    }
}
