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

export class Pduration extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(rate: BaseValueObject, pv: BaseValueObject, fv: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getRowCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getRowCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            rate.isArray() ? (rate as ArrayValueObject).getColumnCount() : 1,
            pv.isArray() ? (pv as ArrayValueObject).getColumnCount() : 1,
            fv.isArray() ? (fv as ArrayValueObject).getColumnCount() : 1
        );

        const rateArray = expandArrayValueObject(maxRowLength, maxColumnLength, rate, ErrorValueObject.create(ErrorType.NA));
        const pvArray = expandArrayValueObject(maxRowLength, maxColumnLength, pv, ErrorValueObject.create(ErrorType.NA));
        const fvArray = expandArrayValueObject(maxRowLength, maxColumnLength, fv, ErrorValueObject.create(ErrorType.NA));

        const resultArray = rateArray.map((rateObject, rowIndex, columnIndex) => {
            const pvObject = pvArray.get(rowIndex, columnIndex) as BaseValueObject;
            const fvObject = fvArray.get(rowIndex, columnIndex) as BaseValueObject;

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(rateObject, pvObject, fvObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_rateObject, _pvObject, _fvObject] = variants as BaseValueObject[];

            const rateValue = +_rateObject.getValue();
            const pvValue = +_pvObject.getValue();
            const fvValue = +_fvObject.getValue();

            if (rateValue <= -1) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            const result = (Math.log(fvValue) - Math.log(pvValue)) / Math.log(1 + rateValue);

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
