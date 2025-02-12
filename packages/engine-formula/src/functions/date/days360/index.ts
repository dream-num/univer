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

import { getDateSerialNumberByObject, getTwoDateDaysByBasis } from '../../../basics/date';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Days360 extends BaseFunction {
    override minParams = 2;

    override maxParams = 3;

    override calculate(startDate: BaseValueObject, endDate: BaseValueObject, method?: BaseValueObject) {
        const _method = method ?? BooleanValueObject.create(false);

        if (startDate.isError()) {
            return startDate;
        }

        if (endDate.isError()) {
            return endDate;
        }

        if (_method.isError()) {
            return _method;
        }

        const maxRowLength = Math.max(
            startDate.isArray() ? (startDate as ArrayValueObject).getRowCount() : 1,
            endDate.isArray() ? (endDate as ArrayValueObject).getRowCount() : 1,
            _method.isArray() ? (_method as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            startDate.isArray() ? (startDate as ArrayValueObject).getColumnCount() : 1,
            endDate.isArray() ? (endDate as ArrayValueObject).getColumnCount() : 1,
            _method.isArray() ? (_method as ArrayValueObject).getColumnCount() : 1
        );

        const startDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, startDate, ErrorValueObject.create(ErrorType.NA));
        const endDateArray = expandArrayValueObject(maxRowLength, maxColumnLength, endDate, ErrorValueObject.create(ErrorType.NA));
        const methodArray = expandArrayValueObject(maxRowLength, maxColumnLength, _method, ErrorValueObject.create(ErrorType.NA));

        const resultArray = startDateArray.map((startDateObject, rowIndex, columnIndex) => {
            const endDateObject = endDateArray.get(rowIndex, columnIndex) as BaseValueObject;
            let methodObject = methodArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (startDateObject.isError()) {
                return startDateObject;
            }

            const startDateSerialNumber = getDateSerialNumberByObject(startDateObject);

            if (typeof startDateSerialNumber !== 'number') {
                return startDateSerialNumber;
            }

            if (endDateObject.isError()) {
                return endDateObject;
            }

            const endDateSerialNumber = getDateSerialNumberByObject(endDateObject);

            if (typeof endDateSerialNumber !== 'number') {
                return endDateSerialNumber;
            }

            if (methodObject.isString()) {
                methodObject = methodObject.convertToNumberObjectValue();
            }

            if (methodObject.isError()) {
                return methodObject;
            }

            const methodValue = +methodObject.getValue();

            const { days } = getTwoDateDaysByBasis(startDateSerialNumber, endDateSerialNumber, !methodValue ? 0 : 4);

            const result = endDateSerialNumber >= startDateSerialNumber ? days : -days;

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
