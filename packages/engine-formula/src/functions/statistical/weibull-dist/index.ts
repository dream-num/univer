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
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class WeibullDist extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(
        x: BaseValueObject,
        alpha: BaseValueObject,
        beta: BaseValueObject,
        cumulative: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getRowCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getColumnCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));
        const betaArray = expandArrayValueObject(maxRowLength, maxColumnLength, beta, ErrorValueObject.create(ErrorType.NA));
        const cumulativeArray = expandArrayValueObject(maxRowLength, maxColumnLength, cumulative, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const betaObject = betaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const cumulativeObject = cumulativeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (xObject.isError()) {
                return xObject;
            }

            if (alphaObject.isError()) {
                return alphaObject;
            }

            if (betaObject.isError()) {
                return betaObject;
            }

            if (cumulativeObject.isError()) {
                return cumulativeObject;
            }

            return this._handleSignleObject(xObject, alphaObject, betaObject, cumulativeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        xObject: BaseValueObject,
        alphaObject: BaseValueObject,
        betaObject: BaseValueObject,
        cumulativeObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(xObject, alphaObject, betaObject, cumulativeObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_xObject, _alphaObject, _betaObject, _cumulativeObject] = variants as BaseValueObject[];

        const xValue = +_xObject.getValue();
        const alphaValue = +_alphaObject.getValue();
        const betaValue = +_betaObject.getValue();
        const cumulativeValue = +_cumulativeObject.getValue();

        if (xValue < 0 || alphaValue <= 0 || betaValue <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const exp = Math.exp(-((xValue / betaValue) ** alphaValue));

        let result;

        if (cumulativeValue) {
            result = 1 - exp;
        } else {
            result = alphaValue / (betaValue ** alphaValue) * (xValue ** (alphaValue - 1)) * exp;
        }

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
