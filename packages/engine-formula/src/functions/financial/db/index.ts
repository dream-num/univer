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

import { ErrorType } from '../../../basics/error-type';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class Db extends BaseFunction {
    override minParams = 4;

    override maxParams = 5;

    override calculate(cost: BaseValueObject, salvage: BaseValueObject, life: BaseValueObject, period: BaseValueObject, month?: BaseValueObject) {
        month = month ?? NumberValueObject.create(12);

        if (month.isNull()) {
            month = NumberValueObject.create(12);
        }

        const maxRowLength = Math.max(
            cost.isArray() ? (cost as ArrayValueObject).getRowCount() : 1,
            salvage.isArray() ? (salvage as ArrayValueObject).getRowCount() : 1,
            life.isArray() ? (life as ArrayValueObject).getRowCount() : 1,
            period.isArray() ? (period as ArrayValueObject).getRowCount() : 1,
            month.isArray() ? (month as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            cost.isArray() ? (cost as ArrayValueObject).getColumnCount() : 1,
            salvage.isArray() ? (salvage as ArrayValueObject).getColumnCount() : 1,
            life.isArray() ? (life as ArrayValueObject).getColumnCount() : 1,
            period.isArray() ? (period as ArrayValueObject).getColumnCount() : 1,
            month.isArray() ? (month as ArrayValueObject).getColumnCount() : 1
        );

        const costArray = expandArrayValueObject(maxRowLength, maxColumnLength, cost, ErrorValueObject.create(ErrorType.NA));
        const salvageArray = expandArrayValueObject(maxRowLength, maxColumnLength, salvage, ErrorValueObject.create(ErrorType.NA));
        const lifeArray = expandArrayValueObject(maxRowLength, maxColumnLength, life, ErrorValueObject.create(ErrorType.NA));
        const periodArray = expandArrayValueObject(maxRowLength, maxColumnLength, period, ErrorValueObject.create(ErrorType.NA));
        const monthArray = expandArrayValueObject(maxRowLength, maxColumnLength, month, ErrorValueObject.create(ErrorType.NA));

        const resultArray = costArray.map((costObject, rowIndex, columnIndex) => {
            let salvageObject = salvageArray.get(rowIndex, columnIndex) as BaseValueObject;
            let lifeObject = lifeArray.get(rowIndex, columnIndex) as BaseValueObject;
            let periodObject = periodArray.get(rowIndex, columnIndex) as BaseValueObject;
            let monthObject = monthArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (costObject.isString()) {
                costObject = costObject.convertToNumberObjectValue();
            }

            if (costObject.isError()) {
                return costObject;
            }

            if (salvageObject.isString()) {
                salvageObject = salvageObject.convertToNumberObjectValue();
            }

            if (salvageObject.isError()) {
                return salvageObject;
            }

            if (lifeObject.isString()) {
                lifeObject = lifeObject.convertToNumberObjectValue();
            }

            if (lifeObject.isError()) {
                return lifeObject;
            }

            if (periodObject.isString()) {
                periodObject = periodObject.convertToNumberObjectValue();
            }

            if (periodObject.isError()) {
                return periodObject;
            }

            if (monthObject.isString()) {
                monthObject = monthObject.convertToNumberObjectValue();
            }

            if (monthObject.isError()) {
                return monthObject;
            }

            const costValue = +costObject.getValue();
            const salvageValue = +salvageObject.getValue();
            const lifeValue = +lifeObject.getValue();
            let periodValue = +periodObject.getValue();
            const monthValue = Math.floor(+monthObject.getValue());

            if (
                costValue < 0 ||
                salvageValue < 0 ||
                lifeValue <= 0 ||
                periodValue <= 0 ||
                Math.floor(periodValue) > Math.floor(lifeValue) ||
                monthValue < 1 ||
                monthValue > 12
            ) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (periodValue < 1) {
                periodValue = 1;
            }

            periodValue = Math.floor(periodValue);

            const rate = +((1 - (salvageValue / costValue) ** (1 / lifeValue)).toFixed(3));

            // Compute initial depreciation
            const initial = (costValue * rate * monthValue) / 12;

            // Compute total depreciation
            let total = initial;
            let current = 0;
            const ceiling = periodValue === lifeValue ? lifeValue - 1 : periodValue;

            for (let i = 2; i <= ceiling; i++) {
                current = (costValue - total) * rate;
                total += current;
            }

            let result;

            // Depreciation for the first and last periods are special cases
            if (periodValue === 1) {
                // First period
                result = initial;
            } else if (periodValue === lifeValue) {
                // Last period
                result = (costValue - total) * rate;
            } else {
                result = current;
            }

            if (Number.isNaN(result) || !Number.isFinite(result)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (rowIndex === 0 && columnIndex === 0) {
                return NumberValueObject.create(result, '"¥"#,##0.00_);[Red]("¥"#,##0.00)');
            } else {
                return NumberValueObject.create(result);
            }
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
