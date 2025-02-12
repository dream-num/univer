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

import { getDateSerialNumberByObject, getWeekDayByDateSerialNumber } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

interface IReturnTypeMap {
    [index: number]: number[];
}

export class Weekday extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(serialNumber: BaseValueObject, returnType?: BaseValueObject) {
        const _returnType = returnType ?? NumberValueObject.create(1);

        if (serialNumber.isError()) {
            return serialNumber;
        }

        if (_returnType.isError()) {
            return _returnType;
        }

        const maxRowLength = Math.max(
            serialNumber.isArray() ? (serialNumber as ArrayValueObject).getRowCount() : 1,
            _returnType.isArray() ? (_returnType as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            serialNumber.isArray() ? (serialNumber as ArrayValueObject).getColumnCount() : 1,
            _returnType.isArray() ? (_returnType as ArrayValueObject).getColumnCount() : 1
        );

        const serialNumberArray = expandArrayValueObject(maxRowLength, maxColumnLength, serialNumber, ErrorValueObject.create(ErrorType.NA));
        const returnTypeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _returnType, ErrorValueObject.create(ErrorType.NA));

        const resultArray = serialNumberArray.map((serialNumberObject, rowIndex, columnIndex) => {
            const returnTypeObject = returnTypeArray.get(rowIndex, columnIndex) as BaseValueObject;

            return this._handleSingleObject(serialNumberObject, returnTypeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(serialNumberObject: BaseValueObject, returnTypeObject: BaseValueObject) {
        let _returnTypeObject = returnTypeObject;

        if (serialNumberObject.isError()) {
            return serialNumberObject;
        }

        if (_returnTypeObject.isError()) {
            return _returnTypeObject;
        }

        const dateSerialNumber = getDateSerialNumberByObject(serialNumberObject);

        if (typeof dateSerialNumber !== 'number') {
            return dateSerialNumber;
        }

        if (_returnTypeObject.isString()) {
            _returnTypeObject = _returnTypeObject.convertToNumberObjectValue();

            if (_returnTypeObject.isError()) {
                return _returnTypeObject;
            }
        }

        const returnTypeValue = Math.floor(+_returnTypeObject.getValue());

        if (!this._returnTypeMap[returnTypeValue]) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const weekDay = getWeekDayByDateSerialNumber(dateSerialNumber);

        const result = this._returnTypeMap[returnTypeValue][weekDay];

        return NumberValueObject.create(result);
    }

    private _returnTypeMap: IReturnTypeMap = {
        1: [1, 2, 3, 4, 5, 6, 7], // Sunday = 1 ~ Saturday = 7
        2: [7, 1, 2, 3, 4, 5, 6], // Monday = 1 ~ Sunday = 7
        3: [6, 0, 1, 2, 3, 4, 5], // Monday = 0 ~ Sunday = 6
        11: [7, 1, 2, 3, 4, 5, 6], // Monday = 1 ~ Sunday = 7
        12: [6, 7, 1, 2, 3, 4, 5], // Tuesday = 1 ~ Monday = 7
        13: [5, 6, 7, 1, 2, 3, 4], // Wednesday = 1 ~ Tuesday = 7
        14: [4, 5, 6, 7, 1, 2, 3], // Thursday = 1 ~ Wednesday = 7
        15: [3, 4, 5, 6, 7, 1, 2], // Friday = 1 ~ Thursday = 7
        16: [2, 3, 4, 5, 6, 7, 1], // Saturday = 1 ~ Friday = 7
        17: [1, 2, 3, 4, 5, 6, 7], // Sunday = 1 ~ Saturday = 7
    };
}
