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

import { excelDateSerial, excelSerialToDate, getDateSerialNumberByObject } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Yearfrac extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, basis?: BaseValueObject) {
        let _basis = basis ?? NumberValueObject.create(0);

        const _startDate = this._checkArrayError(startDate);

        if (_startDate.isError()) {
            return _startDate;
        }

        const _endDate = this._checkArrayError(endDate);

        if (_endDate.isError()) {
            return _endDate;
        }

        _basis = this._checkArrayError(_basis);

        if (_basis.isError()) {
            return _basis;
        }

        if (_startDate.isBoolean() || _endDate.isBoolean() || _basis.isBoolean()) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        const startDateSerialNumber = getDateSerialNumberByObject(_startDate);

        if (typeof startDateSerialNumber !== 'number') {
            return startDateSerialNumber;
        }

        const endDateSerialNumber = getDateSerialNumberByObject(_endDate);

        if (typeof endDateSerialNumber !== 'number') {
            return endDateSerialNumber;
        }

        const basisValue = Math.floor(+_basis.getValue());

        if (Number.isNaN(basisValue)) {
            return ErrorValueObject.create(ErrorType.VALUE);
        }

        if (basisValue < 0 || basisValue > 4) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        switch (basisValue) {
            case 0:
                return this._getResultByNASD(startDateSerialNumber, endDateSerialNumber);
            case 1:
                return this._getResultByActual(startDateSerialNumber, endDateSerialNumber);
            case 2:
                return NumberValueObject.create(Math.abs(endDateSerialNumber - startDateSerialNumber) / 360);
            case 3:
                return NumberValueObject.create(Math.abs(endDateSerialNumber - startDateSerialNumber) / 365);
            case 4:
                return this._getResultByEuropean(startDateSerialNumber, endDateSerialNumber);
            default:
                return NumberValueObject.create(0);
        }
    }

    private _checkArrayError(variant: BaseValueObject): BaseValueObject {
        let _variant = variant;

        if (_variant.isArray()) {
            const rowCount = (_variant as ArrayValueObject).getRowCount();
            const columnCount = (_variant as ArrayValueObject).getColumnCount();

            if (rowCount > 1 || columnCount > 1) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            _variant = (_variant as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        if (_variant.isError()) {
            return _variant;
        }

        return _variant;
    }

    private _getResultByNASD(startDateSerialNumber: number, endDateSerialNumber: number): BaseValueObject {
        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
        const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() + 1 : 1;
        let startDay = startDateSerialNumber > 0 ? startDateDate.getUTCDate() : 0;

        let endDateDate = excelSerialToDate(endDateSerialNumber);
        let endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;
        let endMonth = endDateSerialNumber > 0 ? endDateDate.getUTCMonth() + 1 : 1;
        let endDay = endDateSerialNumber > 0 ? endDateDate.getUTCDate() : 0;

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

        const daysInYears = (endYear - startYear) * 360;
        const daysInStartMonth = endDateSerialNumber >= startDateSerialNumber ? 30 - startDay : -startDay;
        const daysInEndMonth = endDateSerialNumber >= startDateSerialNumber ? endDay : endDay - 30;
        const daysInMidMonths = (endDateSerialNumber >= startDateSerialNumber ? (endMonth - startMonth - 1) : (endMonth - startMonth + 1)) * 30;
        const totalDays = Math.abs(daysInYears + daysInStartMonth + daysInEndMonth + daysInMidMonths);

        const result = totalDays / 360;

        return NumberValueObject.create(result);
    }

    private _getResultByActual(startDateSerialNumber: number, endDateSerialNumber: number): BaseValueObject {
        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;

        const endDateDate = excelSerialToDate(endDateSerialNumber);
        const endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;

        const totalDays = Math.abs(endDateSerialNumber - startDateSerialNumber);
        const totalYear = Math.abs(endYear - startYear) + 1;

        let startYearFirstDaySerialNumber;
        let endYearLastDaySerialNumber;

        if (endYear < startYear) {
            const startYearFirstDay = new Date(Date.UTC(endYear, 0, 1));
            const endYearLastDay = new Date(Date.UTC(startYear, 11, 31));

            startYearFirstDaySerialNumber = excelDateSerial(startYearFirstDay);
            endYearLastDaySerialNumber = excelDateSerial(endYearLastDay);

            if (endYear === 1900) { // Special handle. excel 1900 days = 365, 1900/12/31 SerialNumber = 366. so start add 1
                startYearFirstDaySerialNumber += 1;
            }
        } else {
            const startYearFirstDay = new Date(Date.UTC(startYear, 0, 1));
            const endYearLastDay = new Date(Date.UTC(endYear, 11, 31));

            startYearFirstDaySerialNumber = excelDateSerial(startYearFirstDay);
            endYearLastDaySerialNumber = excelDateSerial(endYearLastDay);

            if (startYear === 1900) { // Special handle. excel 1900 days = 365, 1900/12/31 SerialNumber = 366. so start add 1
                startYearFirstDaySerialNumber += 1;
            }
        }

        const result = totalDays / ((endYearLastDaySerialNumber - startYearFirstDaySerialNumber + 1) / totalYear);

        return NumberValueObject.create(result);
    }

    private _getResultByEuropean(startDateSerialNumber: number, endDateSerialNumber: number): BaseValueObject {
        const startDateDate = excelSerialToDate(startDateSerialNumber);
        const startYear = startDateSerialNumber > 0 ? startDateDate.getUTCFullYear() : 1900;
        const startMonth = startDateSerialNumber > 0 ? startDateDate.getUTCMonth() + 1 : 1;
        let startDay = startDateSerialNumber > 0 ? startDateDate.getUTCDate() : 0;

        const endDateDate = excelSerialToDate(endDateSerialNumber);
        const endYear = endDateSerialNumber > 0 ? endDateDate.getUTCFullYear() : 1900;
        const endMonth = endDateSerialNumber > 0 ? endDateDate.getUTCMonth() + 1 : 1;
        let endDay = endDateSerialNumber > 0 ? endDateDate.getUTCDate() : 0;

        if (startDay === 31) {
            startDay = 30;
        }

        if (endDay === 31) {
            endDay = 30;
        }

        const daysInYears = (endYear - startYear) * 360;
        const daysInStartMonth = endDateSerialNumber >= startDateSerialNumber ? 30 - startDay : -startDay;
        const daysInEndMonth = endDateSerialNumber >= startDateSerialNumber ? endDay : endDay - 30;
        const daysInMidMonths = (endDateSerialNumber >= startDateSerialNumber ? (endMonth - startMonth - 1) : (endMonth - startMonth + 1)) * 30;
        const totalDays = Math.abs(daysInYears + daysInStartMonth + daysInEndMonth + daysInMidMonths);

        const result = totalDays / 360;

        return NumberValueObject.create(result);
    }
}
