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
import { gammaINV } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class GammaInv extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(
        probability: BaseValueObject,
        alpha: BaseValueObject,
        beta: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            probability.isArray() ? (probability as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            probability.isArray() ? (probability as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getColumnCount() : 1
        );

        const probabilityArray = expandArrayValueObject(maxRowLength, maxColumnLength, probability, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));
        const betaArray = expandArrayValueObject(maxRowLength, maxColumnLength, beta, ErrorValueObject.create(ErrorType.NA));

        const resultArray = probabilityArray.mapValue((probabilityObject, rowIndex, columnIndex) => {
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const betaObject = betaArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (probabilityObject.isError()) {
                return probabilityObject;
            }

            if (alphaObject.isError()) {
                return alphaObject;
            }

            if (betaObject.isError()) {
                return betaObject;
            }

            return this._handleSignleObject(probabilityObject, alphaObject, betaObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        probabilityObject: BaseValueObject,
        alphaObject: BaseValueObject,
        betaObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(probabilityObject, alphaObject, betaObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_probabilityObject, _alphaObject, _betaObject] = variants as BaseValueObject[];

        const probabilityValue = +_probabilityObject.getValue();
        const alphaValue = +_alphaObject.getValue();
        const betaValue = +_betaObject.getValue();

        if (probabilityValue < 0 || probabilityValue > 1 || alphaValue <= 0 || betaValue <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = gammaINV(probabilityValue, alphaValue, betaValue);

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
