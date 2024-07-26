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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class Ispmt extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(rate: BaseValueObject, per: BaseValueObject, nper: BaseValueObject, pv: BaseValueObject) {
        const maxRowLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getRowCount() : 1,
            per.isArray() ? (per as ArrayValueObject).getRowCount() : 1,
            nper.isArray() ? (nper as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getColumnCount() : 1,
            per.isArray() ? (per as ArrayValueObject).getColumnCount() : 1,
            nper.isArray() ? (nper as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1
        );

        const rateArray = expandArrayValueObject(maxRowLength, maxColumnLength, rate, ErrorValueObject.create(ErrorType.NA));
        const perArray = expandArrayValueObject(maxRowLength, maxColumnLength, per, ErrorValueObject.create(ErrorType.NA));
        const nperArray = expandArrayValueObject(maxRowLength, maxColumnLength, nper, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));

        const resultArray = rateArray.map((rateObject, rowIndex, columnIndex) => {
            let perObject = perArray.get(rowIndex, columnIndex) as BaseValueObject;
            let nperObject = nperArray.get(rowIndex, columnIndex) as BaseValueObject;
            let pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (rateObject.isString()) {
                rateObject = rateObject.convertToNumberObjectValue();
            }

            if (rateObject.isError()) {
                return rateObject;
            }

            if (perObject.isString()) {
                perObject = perObject.convertToNumberObjectValue();
            }

            if (perObject.isError()) {
                return perObject;
            }

            if (nperObject.isString()) {
                nperObject = nperObject.convertToNumberObjectValue();
            }

            if (nperObject.isError()) {
                return nperObject;
            }

            if (pvObject.isString()) {
                pvObject = pvObject.convertToNumberObjectValue();
            }

            if (pvObject.isError()) {
                return pvObject;
            }

            const rateValue = +rateObject.getValue();
            const perValue = +perObject.getValue();
            const nperValue = +nperObject.getValue();
            const pvValue = +pvObject.getValue();

            if (nperValue === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = pvValue * rateValue * (perValue / nperValue - 1);

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
