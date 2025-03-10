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

import { ErrorType } from '../../../basics/error-type';
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';
import type { ArrayValueObject } from '../../../engine/value-object/array-value-object';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';

export class Nper extends BaseFunction {
    override minParams = 3;

    override maxParams = 5;

    override calculate(rate: BaseValueObject, pmt: BaseValueObject, pv: BaseValueObject, fv?: BaseValueObject, type?: BaseValueObject): BaseValueObject {
        const _fv = fv ?? NumberValueObject.create(0);
        const _type = type ?? NumberValueObject.create(0);

        const maxRowLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getRowCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            _fv.isArray() ? (_fv as ArrayValueObject).getRowCount() : 1,
            _type.isArray() ? (_type as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getColumnCount() : 1,
            pmt.isArray() ? (pmt as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            _fv.isArray() ? (_fv as ArrayValueObject).getColumnCount() : 1,
            _type.isArray() ? (_type as ArrayValueObject).getColumnCount() : 1
        );

        const rateArray = expandArrayValueObject(maxRowLength, maxColumnLength, rate, ErrorValueObject.create(ErrorType.NA));
        const pmtArray = expandArrayValueObject(maxRowLength, maxColumnLength, pmt, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, _fv, ErrorValueObject.create(ErrorType.NA));
        const typeArray = expandArrayValueObject(maxRowLength, maxColumnLength, _type, ErrorValueObject.create(ErrorType.NA));

        const resultArray = rateArray.map((rateObject, rowIndex, columnIndex) => {
            const pmtObject = pmtArray.get(rowIndex, columnIndex) as BaseValueObject;
            const pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const typeObject = typeArray.get(rowIndex, columnIndex) as BaseValueObject;

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(rateObject, pmtObject, pvObject, fvObject, typeObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_rateObject, _pmtObject, _pvObject, _fvObject, _typeObject] = variants as BaseValueObject[];

            const rateValue = +_rateObject.getValue();
            const pmtValue = +_pmtObject.getValue();
            const pvValue = +_pvObject.getValue();
            const fvValue = +_fvObject.getValue();
            let typeValue = +_typeObject.getValue();
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
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
