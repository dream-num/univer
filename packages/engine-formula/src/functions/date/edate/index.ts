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

import { DEFAULT_DATE_FORMAT, excelDateSerial, excelSerialToDate } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

/**
 * TODO@Dushusir: support plaine text date: =EDATE("2020-1-1",1), =EDATE("2020/1/1",1) and other formats
 */
export class Edate extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(startDate: BaseValueObject, months: BaseValueObject) {
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

        const startDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, startDate);
        const monthsArray = expandArrayValueObject(maxRowLength, maxColumnLength, months);

        return startDateArray.map((startDateObject, rowIndex, columnIndex) => {
            const monthsValueObject = monthsArray.get(rowIndex, columnIndex) || NullValueObject.create();

            if (startDateObject.isError()) {
                return startDateObject;
            }

            if (monthsValueObject.isError()) {
                return monthsValueObject;
            }

            if (startDateObject.isString() || startDateObject.isBoolean() || monthsValueObject.isString() || monthsValueObject.isBoolean()) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            const startDateSerial = +startDateObject.getValue();

            if (startDateSerial < 0) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const monthsValue = Math.floor(+monthsValueObject.getValue());

            const _startDate = excelSerialToDate(startDateSerial);

            const year = _startDate.getUTCFullYear();
            const month = _startDate.getUTCMonth() + monthsValue;
            const day = _startDate.getUTCDate();

            const resultDate = new Date(Date.UTC(year, month, day));
            const currentSerial = excelDateSerial(resultDate);

            return NumberValueObject.create(currentSerial, DEFAULT_DATE_FORMAT);
        });
    }
}
