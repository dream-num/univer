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

import { DEFAULT_TIME_FORMAT } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Time extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(hour: BaseValueObject, minute: BaseValueObject, second: BaseValueObject) {
        if (hour.isError()) {
            return hour;
        }

        if (minute.isError()) {
            return minute;
        }

        if (second.isError()) {
            return second;
        }

        // get max row length
        const maxRowLength = Math.max(
            hour.isArray() ? (hour as ArrayValueObject).getRowCount() : 1,
            minute.isArray() ? (minute as ArrayValueObject).getRowCount() : 1,
            second.isArray() ? (second as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            hour.isArray() ? (hour as ArrayValueObject).getColumnCount() : 1,
            minute.isArray() ? (minute as ArrayValueObject).getColumnCount() : 1,
            second.isArray() ? (second as ArrayValueObject).getColumnCount() : 1
        );

        const hourArray = expandArrayValueObject(maxRowLength, maxColumnLength, hour);
        const minuteArray = expandArrayValueObject(maxRowLength, maxColumnLength, minute);
        const secondArray = expandArrayValueObject(maxRowLength, maxColumnLength, second);

        return hourArray.map((hourValueObject, rowIndex, columnIndex) => {
            return this._calculateTime(hourValueObject, minuteArray, secondArray, rowIndex, columnIndex);
        });
    }

    private _calculateTime(hourValueObject: BaseValueObject, minuteArray: ArrayValueObject, secondArray: ArrayValueObject, rowIndex: number, columnIndex: number) {
        let _hourValueObject = hourValueObject;
        let minuteValueObject = minuteArray.get(rowIndex, columnIndex) || NullValueObject.create();
        let secondValueObject = secondArray.get(rowIndex, columnIndex) || NullValueObject.create();

        if (_hourValueObject.isString() || _hourValueObject.isBoolean()) {
            _hourValueObject = _hourValueObject.convertToNumberObjectValue();
        }

        if (minuteValueObject.isString() || minuteValueObject.isBoolean()) {
            minuteValueObject = minuteValueObject.convertToNumberObjectValue();
        }

        if (secondValueObject.isString() || secondValueObject.isBoolean()) {
            secondValueObject = secondValueObject.convertToNumberObjectValue();
        }

        if (_hourValueObject.isError()) {
            return _hourValueObject;
        }

        if (minuteValueObject.isError()) {
            return minuteValueObject;
        }

        if (secondValueObject.isError()) {
            return secondValueObject;
        }

        let hourValue = Math.floor(+_hourValueObject.getValue());
        let minuteValue = Math.floor(+minuteValueObject.getValue());
        let secondValue = Math.floor(+secondValueObject.getValue());

        if (hourValue < 0 || minuteValue < 0 || secondValue < 0 || hourValue > 32767 || minuteValue > 32767 || secondValue > 32767) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

            // Normalize seconds to minutes
        minuteValue += Math.floor(secondValue / 60);
        secondValue %= 60;

            // Normalize minutes to hours
        hourValue += Math.floor(minuteValue / 60);
        minuteValue %= 60;

            // Normalize hours to valid 24-hour format
        hourValue %= 24;

        const totalSeconds = hourValue * 3600 + minuteValue * 60 + secondValue;
        const fractionOfDay = totalSeconds / 86400; // Total seconds in a day

        const valueObject = NumberValueObject.create(fractionOfDay, DEFAULT_TIME_FORMAT);

        return valueObject;
    }
}
