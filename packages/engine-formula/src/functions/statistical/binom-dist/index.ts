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
import { binomialCDF, binomialPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class BinomDist extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(
        numberS: BaseValueObject,
        trials: BaseValueObject,
        probabilityS: BaseValueObject,
        cumulative: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            numberS.isArray() ? (numberS as ArrayValueObject).getRowCount() : 1,
            trials.isArray() ? (trials as ArrayValueObject).getRowCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getRowCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            numberS.isArray() ? (numberS as ArrayValueObject).getColumnCount() : 1,
            trials.isArray() ? (trials as ArrayValueObject).getColumnCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getColumnCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getColumnCount() : 1
        );

        const numberSArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberS, ErrorValueObject.create(ErrorType.NA));
        const trialsArray = expandArrayValueObject(maxRowLength, maxColumnLength, trials, ErrorValueObject.create(ErrorType.NA));
        const probabilitySArray = expandArrayValueObject(maxRowLength, maxColumnLength, probabilityS, ErrorValueObject.create(ErrorType.NA));
        const cumulativeArray = expandArrayValueObject(maxRowLength, maxColumnLength, cumulative, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberSArray.mapValue((numberSObject, rowIndex, columnIndex) => {
            const trialsObject = trialsArray.get(rowIndex, columnIndex) as BaseValueObject;
            const probabilitySObject = probabilitySArray.get(rowIndex, columnIndex) as BaseValueObject;
            const cumulativeObject = cumulativeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberSObject.isError()) {
                return numberSObject;
            }

            if (trialsObject.isError()) {
                return trialsObject;
            }

            if (probabilitySObject.isError()) {
                return probabilitySObject;
            }

            if (cumulativeObject.isError()) {
                return cumulativeObject;
            }

            return this._handleSignleObject(numberSObject, trialsObject, probabilitySObject, cumulativeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        numberSObject: BaseValueObject,
        trialsObject: BaseValueObject,
        probabilitySObject: BaseValueObject,
        cumulativeObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(numberSObject, trialsObject, probabilitySObject, cumulativeObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_numberSObject, _trialsObject, _probabilitySObject, _cumulativeObject] = variants as BaseValueObject[];

        const numberSValue = Math.floor(+_numberSObject.getValue());
        const trialsValue = Math.floor(+_trialsObject.getValue());
        const probabilitySValue = +_probabilitySObject.getValue();
        const cumulativeValue = +_cumulativeObject.getValue();

        if (numberSValue < 0 || numberSValue > trialsValue || probabilitySValue < 0 || probabilitySValue > 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (cumulativeValue) {
            result = binomialCDF(numberSValue, trialsValue, probabilitySValue);
        } else {
            result = binomialPDF(numberSValue, trialsValue, probabilitySValue);
        }

        return NumberValueObject.create(result);
    }
}
