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

import { getDateSerialNumberByObject } from '../../../basics/date';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Days extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(endDate: BaseValueObject, startDate: BaseValueObject) {
        if (endDate.isError()) {
            return endDate;
        }

        if (startDate.isError()) {
            return startDate;
        }

        const maxRowLength = Math.max(
            endDate.isArray() ? (endDate as ArrayValueObject).getRowCount() : 1,
            startDate.isArray() ? (startDate as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            endDate.isArray() ? (endDate as ArrayValueObject).getColumnCount() : 1,
            startDate.isArray() ? (startDate as ArrayValueObject).getColumnCount() : 1
        );

        const endDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, endDate);
        const startDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, startDate);

        const resultArray = endDateArray.map((endDateObject, rowIndex, columnIndex) => {
            const startDateObject = startDateArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (endDateObject.isError()) {
                return endDateObject;
            }

            if (startDateObject.isError()) {
                return startDateObject;
            }

            const endDateSerialNumber = getDateSerialNumberByObject(endDateObject);

            if (typeof endDateSerialNumber !== 'number') {
                return endDateSerialNumber;
            }

            const startDateSerialNumber = getDateSerialNumberByObject(startDateObject);

            if (typeof startDateSerialNumber !== 'number') {
                return startDateSerialNumber;
            }

            const result = Math.floor(endDateSerialNumber) - Math.floor(startDateSerialNumber);

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
