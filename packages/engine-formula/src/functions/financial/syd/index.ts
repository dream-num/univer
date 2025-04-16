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

import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { ErrorType } from '../../../basics/error-type';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { getCurrencyFormat } from '../../../engine/utils/numfmt-kit';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Syd extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override needsLocale = true;

    override calculate(cost: BaseValueObject, salvage: BaseValueObject, life: BaseValueObject, per: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            cost.isArray() ? (cost as ArrayValueObject).getRowCount() : 1,
            salvage.isArray() ? (salvage as ArrayValueObject).getRowCount() : 1,
            life.isArray() ? (life as ArrayValueObject).getRowCount() : 1,
            per.isArray() ? (per as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            cost.isArray() ? (cost as ArrayValueObject).getColumnCount() : 1,
            salvage.isArray() ? (salvage as ArrayValueObject).getColumnCount() : 1,
            life.isArray() ? (life as ArrayValueObject).getColumnCount() : 1,
            per.isArray() ? (per as ArrayValueObject).getColumnCount() : 1
        );

        const costArray = expandArrayValueObject(maxRowLength, maxColumnLength, cost, ErrorValueObject.create(ErrorType.NA));
        const salvageArray = expandArrayValueObject(maxRowLength, maxColumnLength, salvage, ErrorValueObject.create(ErrorType.NA));
        const lifeArray = expandArrayValueObject(maxRowLength, maxColumnLength, life, ErrorValueObject.create(ErrorType.NA));
        const perArray = expandArrayValueObject(maxRowLength, maxColumnLength, per, ErrorValueObject.create(ErrorType.NA));

        const resultArray = costArray.map((costObject, rowIndex, columnIndex) => {
            const salvageObject = salvageArray.get(rowIndex, columnIndex) as BaseValueObject;
            const lifeObject = lifeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const perObject = perArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (salvageObject.isError()) {
                return salvageObject;
            }

            if (lifeObject.isError()) {
                return lifeObject;
            }

            if (perObject.isError()) {
                return perObject;
            }

            const costValue = +costObject.getValue();
            const salvageValue = +salvageObject.getValue();
            const lifeValue = +lifeObject.getValue();
            const perValue = +perObject.getValue();

            if (Number.isNaN(costValue) || Number.isNaN(salvageValue) || Number.isNaN(lifeValue) || Number.isNaN(perValue)) {
                return ErrorValueObject.create(ErrorType.VALUE);
            }

            if (
                salvageValue < 0 ||
                lifeValue <= 0 ||
                perValue > lifeValue
            ) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const result = (costValue - salvageValue) * (lifeValue - perValue + 1) * 2 / (lifeValue * (lifeValue + 1));

            if (rowIndex === 0 && columnIndex === 0) {
                return NumberValueObject.create(result, getCurrencyFormat(this.getLocale()));
            }

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
