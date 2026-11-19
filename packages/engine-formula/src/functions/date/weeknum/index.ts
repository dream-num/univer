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

import { DateSystem, excelDateSerial, excelSerialToDate } from '@univerjs/core';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import {
    getDateSerialNumberByObject,
    getIsoWeekNumber,
    getWeekDayByDateSerialNumber,
} from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

interface IReturnTypeMap {
    [index: number]: number;
}

export class Weeknum extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(serialNumber: BaseValueObject, returnType?: BaseValueObject) {
        let _serialNumber = serialNumber;
        let _returnType = returnType ?? NumberValueObject.create(1);

        if (_serialNumber.isArray()) {
            const rowCount = (_serialNumber as ArrayValueObject).getRowCount();
            const columnCount = (_serialNumber as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _serialNumber = (_serialNumber as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_serialNumber.isError()) {
            return _serialNumber;
        }

        if (_returnType.isArray()) {
            const rowCount = (_returnType as ArrayValueObject).getRowCount();
            const columnCount = (_returnType as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _returnType = (_returnType as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_returnType.isError()) {
            return _returnType;
        }

        if (_serialNumber.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const dateSerialNumber = getDateSerialNumberByObject(_serialNumber, this.getDateSystem());

        if (typeof dateSerialNumber !== 'number') {
            return dateSerialNumber;
        }

        if (_returnType.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const returnTypeValue = Math.floor(+_returnType.getValue());

        if (Number.isNaN(returnTypeValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (!(returnTypeValue in this._returnTypeMap)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return this._getResult(dateSerialNumber, returnTypeValue);
    }

    private _getResult(dateSerialNumber: number, returnTypeValue: number) {
        const serialNumber = Math.floor(dateSerialNumber);

        if (returnTypeValue === 21) {
            // System 2
            // The week containing the first Thursday of the year is week 1, the methodology specified in ISO 8601.
            return NumberValueObject.create(getIsoWeekNumber(serialNumber, this.getDateSystem()));
        }

        // System 1
        // The week containing January 1 is the first week of the year, and is numbered week 1.
        const currentDate = excelSerialToDate(serialNumber, this.getDateSystem());
        const currentYear = this.getDateSystem() === DateSystem.Date1900 && serialNumber === 0
            ? 1900
            : currentDate.getUTCFullYear();
        const yearStartSerialNumber = excelDateSerial(new Date(Date.UTC(currentYear, 0, 1)), this.getDateSystem());
        const yearStartWeekDay = getWeekDayByDateSerialNumber(yearStartSerialNumber, this.getDateSystem());
        const weekDay = this._returnTypeMap[returnTypeValue];

        const yearWeekStartSerialNumber = yearStartWeekDay < weekDay
            ? yearStartSerialNumber - (yearStartWeekDay + 7 - weekDay)
            : yearStartSerialNumber - (yearStartWeekDay - weekDay);

        return NumberValueObject.create(Math.floor((serialNumber - yearWeekStartSerialNumber) / 7) + 1);
    }

    private _returnTypeMap: IReturnTypeMap = {
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
}
