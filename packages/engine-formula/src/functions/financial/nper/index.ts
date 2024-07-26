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

export class Nper extends BaseFunction {
    override minParams = 3;

    override maxParams = 5;

    override calculate(rate: BaseValueObject, pmt: BaseValueObject, pv: BaseValueObject, fv?: BaseValueObject, type?: BaseValueObject) {
        fv = fv ?? NumberValueObject.create(0);
        type = type ?? NumberValueObject.create(0);

        const maxRowLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getRowCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getRowCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getColumnCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getColumnCount() : 1,
            type.isArray() ? (type as ArrayValueObject).getColumnCount() : 1
        );

        const rateArray = expandArrayValueObject(maxRowLength, maxColumnLength, rate, ErrorValueObject.create(ErrorType.NA));
        const pmtArray = expandArrayValueObject(maxRowLength, maxColumnLength, pmt, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, fv, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, type, ErrorValueObject.create(ErrorType.NA));

        const resultArray = rateArray.map((rateObject, rowIndex, columnIndex) => {
            let pmtObject = pmtArray.get(rowIndex, columnIndex) as BaseValueObject;
            let pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            let fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;
            let typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (rateObject.isString()) {
                rateObject = rateObject.convertToNumberObjectValue();
            }

            if (rateObject.isError()) {
                return rateObject;
            }

            if (pmtObject.isString()) {
                pmtObject = pmtObject.convertToNumberObjectValue();
            }

            if (pmtObject.isError()) {
                return pmtObject;
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
            const pmtValue = +pmtObject.getValue();
            const pvValue = +pvObject.getValue();
            const fvValue = +fvObject.getValue();
            let typeValue = +typeObject.getValue();
            typeValue = typeValue ? 1 : 0;

            if (rateValue === 0 && pmtValue === 0) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            let result;

            if (rateValue === 0) {
                result = -(pvValue + fvValue) / pmtValue;
            } else {
                const num = pmtValue * (1 + rateValue * typeValue) - fvValue * rateValue;
                const den = pvValue * rateValue + pmtValue * (1 + rateValue * typeValue);

                result = Math.log(num / den) / Math.log(1 + rateValue);
            }

            if (Number.isNaN(result) || !Number.isFinite(result)) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as NumberValueObject;
        }

        return resultArray;
    }
}
