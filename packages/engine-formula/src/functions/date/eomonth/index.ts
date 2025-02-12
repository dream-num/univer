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

import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Eomonth extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(startDate: BaseValueObject, months: BaseValueObject) {
        let _startDate = startDate;
        let _months = months;

        if (_startDate.isArray()) {
            const rowCount = (_startDate as ArrayValueObject).getRowCount();
            const columnCount = (_startDate as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _startDate = (_startDate as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_months.isArray()) {
            const rowCount = (_months as ArrayValueObject).getRowCount();
            const columnCount = (_months as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _months = (_months as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_startDate.isError()) {
            return _startDate;
        }

        if (_months.isError()) {
            return _months;
        }

        const startDateSerialNumber = getDateSerialNumberByObject(_startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        if (_months.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
        const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() : 0;

        const monthsValue = Math.floor(+_months.getValue());

        if (Number.isNaN(monthsValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const targetDate = new Date(Date.UTC(startYear, startMonth + monthsValue + 1, 0));
        const result = excelDateSerial(targetDate);

        return NumberValueObject.create(result);
    }
}
