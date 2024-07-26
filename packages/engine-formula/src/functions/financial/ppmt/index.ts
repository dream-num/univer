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

import { calculateIPMT, calculatePMT } from '../../../basics/financial';
import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';

export class Ppmt extends BaseFunction {
    override minParams = 4;

    override maxParams = 6;

    override calculate(rate: BaseValueObject, per: BaseValueObject, nper: BaseValueObject, pv: BaseValueObject, fv?: BaseValueObject, type?: BaseValueObject) {
        fv = fv ?? NumberValueObject.create(0);
        type = type ?? NumberValueObject.create(0);

        const maxRowLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getRowCount() : 1,
            per.isArray() ? (per as ArrayValueObject).getRowCount() : 1,
            nper.isArray() ? (nper as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getRowCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getColumnCount() : 1,
            per.isArray() ? (per as ArrayValueObject).getColumnCount() : 1,
            nper.isArray() ? (nper as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getColumnCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getColumnCount() : 1
        );

        const rateArray = expandArrayValueObject(maxRowLength, maxColumnLength, rate, ErrorValueObject.create(ErrorType.NA));
        const perArray = expandArrayValueObject(maxRowLength, maxColumnLength, per, ErrorValueObject.create(ErrorType.NA));
        const nperArray = expandArrayValueObject(maxRowLength, maxColumnLength, nper, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, fv, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, type, ErrorValueObject.create(ErrorType.NA));

        const resultArray = rateArray.map((rateObject, rowIndex, columnIndex) => {
            let perObject = perArray.get(rowIndex, columnIndex) as BaseValueObject;
            let nperObject = nperArray.get(rowIndex, columnIndex) as BaseValueObject;
            let pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            let fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;
            let typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;

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

            if (fvObject.isString()) {
                fvObject = fvObject.convertToNumberObjectValue();
            }

            if (fvObject.isError()) {
                return fvObject;
            }

            if (typeObject.isString()) {
                typeObject = typeObject.convertToNumberObjectValue();
            }

            if (typeObject.isError()) {
                return typeObject;
            }

            const rateValue = +rateObject.getValue();
            const perValue = +perObject.getValue();
            const nperValue = +nperObject.getValue();
            const pvValue = +pvObject.getValue();
            const fvValue = +fvObject.getValue();
            const typeValue = +typeObject.getValue();

            if (perValue < 1 || Math.floor(perValue) > Math.ceil(nperValue)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const result = calculatePMT(rateValue, nperValue, pvValue, fvValue, typeValue ? 1 : 0) - calculateIPMT(rateValue, perValue, nperValue, pvValue, fvValue, typeValue ? 1 : 0);

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
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
