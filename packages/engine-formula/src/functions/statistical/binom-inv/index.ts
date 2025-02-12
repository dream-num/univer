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
import { binomialCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class BinomInv extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(
        trials: BaseValueObject,
        probabilityS: BaseValueObject,
        alpha: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getRowCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getColumnCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1
        );

        const trialsArray = expandArrayValueObject(maxRowLength, maxColumnLength, trials, ErrorValueObject.create(ErrorType.NA));
        const probabilitySArray = expandArrayValueObject(maxRowLength, maxColumnLength, probabilityS, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));

        const resultArray = trialsArray.mapValue((trialsObject, rowIndex, columnIndex) => {
            const probabilitySObject = probabilitySArray.get(rowIndex, columnIndex) as BaseValueObject;
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (trialsObject.isError()) {
                return trialsObject;
            }

            if (probabilitySObject.isError()) {
                return probabilitySObject;
            }

            if (alphaObject.isError()) {
                return alphaObject;
            }

            return this._handleSignleObject(trialsObject, probabilitySObject, alphaObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        trialsObject: BaseValueObject,
        probabilitySObject: BaseValueObject,
        alphaObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(trialsObject, probabilitySObject, alphaObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_trialsObject, _probabilitySObject, _alphaObject] = variants as BaseValueObject[];

        const trialsValue = Math.floor(+_trialsObject.getValue());
        const probabilitySValue = +_probabilitySObject.getValue();
        const alphaValue = +_alphaObject.getValue();

        if (trialsValue < 0 || probabilitySValue <= 0 || probabilitySValue >= 1 || alphaValue <= 0 || alphaValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = 0;

        while (result <= trialsValue) {
            if (binomialCDF(result, trialsValue, probabilitySValue) >= alphaValue) {
                break;
            }

            result++;
        }

        return NumberValueObject.create(result);
    }
}
