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
import { betaCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class Betadist extends BaseFunction {
    override minParams = 3;

    override maxParams = 5;

    override calculate(
        x: BaseValueObject,
        alpha: BaseValueObject,
        beta: BaseValueObject,
        A?: BaseValueObject,
        B?: BaseValueObject
    ): BaseValueObject {
        let _A = A ?? NumberValueObject.create(0);
        let _B = B ?? NumberValueObject.create(1);

        if (_A.isNull()) {
            _A = NumberValueObject.create(0);
        }

        if (_B.isNull()) {
            _B = NumberValueObject.create(1);
        }

        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getRowCount() : 1,
            _A.isArray() ? (_A as ArrayValueObject).getRowCount() : 1,
            _B.isArray() ? (_B as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getColumnCount() : 1,
            _A.isArray() ? (_A as ArrayValueObject).getColumnCount() : 1,
            _B.isArray() ? (_B as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));
        const betaArray = expandArrayValueObject(maxRowLength, maxColumnLength, beta, ErrorValueObject.create(ErrorType.NA));
        const AArray = expandArrayValueObject(maxRowLength, maxColumnLength, _A, ErrorValueObject.create(ErrorType.NA));
        const BArray = expandArrayValueObject(maxRowLength, maxColumnLength, _B, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const betaObject = betaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const AObject = AArray.get(rowIndex, columnIndex) as BaseValueObject;
            const BObject = BArray.get(rowIndex, columnIndex) as BaseValueObject;

            return this._handleSignleObject(xObject, alphaObject, betaObject, AObject, BObject);
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
        AObject: BaseValueObject,
        BObject: BaseValueObject
    ): BaseValueObject {
        if (xObject.isError()) {
            return xObject;
        }

        if (alphaObject.isError()) {
            return alphaObject;
        }

        if (betaObject.isError()) {
            return betaObject;
        }

        if (AObject.isError()) {
            return AObject;
        }

        if (BObject.isError()) {
            return BObject;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(xObject, alphaObject, betaObject, AObject, BObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_xObject, _alphaObject, _betaObject, _AObject, _BObject] = variants as BaseValueObject[];

        const xValue = +_xObject.getValue();
        const alphaValue = +_alphaObject.getValue();
        const betaValue = +_betaObject.getValue();
        const AValue = +_AObject.getValue();
        const BValue = +_BObject.getValue();

        if (alphaValue <= 0 || betaValue <= 0 || xValue < AValue || xValue > BValue || AValue === BValue) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = betaCDF((xValue - AValue) / (BValue - AValue), alphaValue, betaValue); ;

        return NumberValueObject.create(result);
    }
}
