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

import { getDateSerialNumberByObject, getWeekDayByDateSerialNumber } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Weekday extends BaseFunction {
    override minParams = 1;

    override maxParams = 2;

    override calculate(serialNumber: BaseValueObject, returnType?: BaseValueObject) {
        if (serialNumber.isError()) {
            return serialNumber;
        }

        if (returnType?.isError()) {
            return returnType;
        }

        // get max row length
        const maxRowLength = Math.max(
            serialNumber.isArray() ? (serialNumber as ArrayValueObject).getRowCount() : 1,
            returnType?.isArray() ? (returnType as ArrayValueObject).getRowCount() : 1
        );

        // get max column length
        const maxColumnLength = Math.max(
            serialNumber.isArray() ? (serialNumber as ArrayValueObject).getColumnCount() : 1,
            returnType?.isArray() ? (returnType as ArrayValueObject).getColumnCount() : 1
        );

        const serialNumberArray = expandArrayValueObject(maxRowLength, maxColumnLength, serialNumber, ErrorValueObject.create(ErrorType.NA));
        const returnTypeArray = returnType ? expandArrayValueObject(maxRowLength, maxColumnLength, returnType, ErrorValueObject.create(ErrorType.NA)) : [];

        const resultArray = serialNumberArray.map((serialNumberObject, rowIndex, columnIndex) => {
            if (returnType) {
                const returnTypeObject = (returnTypeArray as ArrayValueObject).get(rowIndex, columnIndex) as BaseValueObject;
                return this._handleSingleObject(serialNumberObject, returnTypeObject);
            } else {
                return this._handleSingleObject(serialNumberObject);
            }
        });

        if ((resultArray as ArrayValueObject).getRowCount() === 1 && (resultArray as ArrayValueObject).getColumnCount() === 1) {
            return resultArray.getArrayValue()[0][0] as NumberValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(serialNumberObject: BaseValueObject, returnTypeObject?: BaseValueObject) {
        if (serialNumberObject.isError()) {
            return serialNumberObject;
        }

        if (returnTypeObject?.isError()) {
            return returnTypeObject;
        }

        const dateSerialNumber = getDateSerialNumberByObject(serialNumberObject);

        if (typeof dateSerialNumber !== 'number') {
            return dateSerialNumber;
        }

        const returnTypeMap: {
            [index: number]: number[];
        } = {
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

        let returnType = 1;

        if (returnTypeObject) {
            if (returnTypeObject.isString()) {
                returnTypeObject = returnTypeObject.convertToNumberObjectValue();
            }

            if (returnTypeObject.isError()) {
                return returnTypeObject;
            }

            returnType = Math.floor(+returnTypeObject.getValue());

            if (!returnTypeMap[returnType]) {
                return ErrorValueObject.create(ErrorType.NUM);
            }
        }

        const weekDay = getWeekDayByDateSerialNumber(dateSerialNumber);

        const result = returnTypeMap[returnType][weekDay];

        return NumberValueObject.create(result);
    }
}
