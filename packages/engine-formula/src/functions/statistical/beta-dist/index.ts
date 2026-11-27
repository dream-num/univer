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
import type { BaseValueObject } from '../../../engine/value-object/base-value-object';
import { ErrorType } from '../../../basics/error-type';
import { betaCDF, betaPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { BooleanValueObject, NullValueObject, NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class BetaDist extends BaseFunction {
    override minParams = 4;

    override maxParams = 6;

    protected readonly useExcelArguments: boolean = false;

    override calculate(
        x: BaseValueObject,
        alpha: BaseValueObject,
        beta: BaseValueObject,
        cumulative: BaseValueObject,
        A?: BaseValueObject,
        B?: BaseValueObject
    ): BaseValueObject {
        const _A = resolveBetaBound(A, 0, this.useExcelArguments);
        const _B = resolveBetaBound(B, 1, this.useExcelArguments);

        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getRowCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getRowCount() : 1,
            _A.isArray() ? (_A as ArrayValueObject).getRowCount() : 1,
            _B.isArray() ? (_B as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1,
            beta.isArray() ? (beta as ArrayValueObject).getColumnCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getColumnCount() : 1,
            _A.isArray() ? (_A as ArrayValueObject).getColumnCount() : 1,
            _B.isArray() ? (_B as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));
        const betaArray = expandArrayValueObject(maxRowLength, maxColumnLength, beta, ErrorValueObject.create(ErrorType.NA));
        const cumulativeArray = expandArrayValueObject(maxRowLength, maxColumnLength, cumulative, ErrorValueObject.create(ErrorType.NA));
        const AArray = expandArrayValueObject(maxRowLength, maxColumnLength, _A, ErrorValueObject.create(ErrorType.NA));
        const BArray = expandArrayValueObject(maxRowLength, maxColumnLength, _B, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const alphaObject = alphaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const betaObject = betaArray.get(rowIndex, columnIndex) as BaseValueObject;
            const cumulativeObject = cumulativeArray.get(rowIndex, columnIndex) as BaseValueObject;
            const AObject = AArray.get(rowIndex, columnIndex) as BaseValueObject;
            const BObject = BArray.get(rowIndex, columnIndex) as BaseValueObject;

            return this._handleSingleObject(xObject, alphaObject, betaObject, cumulativeObject, AObject, BObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSingleObject(
        xObject: BaseValueObject,
        alphaObject: BaseValueObject,
        betaObject: BaseValueObject,
        cumulativeObject: BaseValueObject,
        AObject: BaseValueObject,
        BObject: BaseValueObject
    ): BaseValueObject {
        const cumulative = this.useExcelArguments && cumulativeObject.isString()
            ? parseCumulative(cumulativeObject)
            : cumulativeObject;
        const argumentsInOrder = [xObject, alphaObject, betaObject, cumulative, AObject, BObject];
        if (!this.useExcelArguments) {
            const error = argumentsInOrder.find((value) => value.isError());
            if (error) return error;
        }

        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(...argumentsInOrder);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_xObject, _alphaObject, _betaObject, _cumulativeObject, _AObject, _BObject] = variants as BaseValueObject[];

        const xValue = +_xObject.getValue();
        const alphaValue = +_alphaObject.getValue();
        const betaValue = +_betaObject.getValue();
        const cumulativeValue = +_cumulativeObject.getValue();
        const AValue = +_AObject.getValue();
        const BValue = +_BObject.getValue();

        if (alphaValue <= 0 || betaValue <= 0 || xValue < AValue || xValue > BValue || AValue === BValue) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        if (this.useExcelArguments && !cumulativeValue && (xValue === AValue || xValue === BValue)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (cumulativeValue) {
            result = betaCDF((xValue - AValue) / (BValue - AValue), alphaValue, betaValue);
        } else {
            result = betaPDF((xValue - AValue) / (BValue - AValue), alphaValue, betaValue) / (BValue - AValue);
        }

        return NumberValueObject.create(result);
    }
}

export function resolveBetaBound(value: BaseValueObject | undefined, fallback: number, useExcelArguments: boolean): BaseValueObject {
    if (!value || (value.isNull() && (!useExcelArguments || (value instanceof NullValueObject && value.isOmitted())))) {
        return NumberValueObject.create(fallback);
    }
    return value;
}

function parseCumulative(value: BaseValueObject): BaseValueObject {
    const text = String(value.getValue()).toUpperCase();
    if (text === 'TRUE' || text === 'FALSE') {
        return BooleanValueObject.create(text === 'TRUE');
    }
    return ErrorValueObject.create(ErrorType.VALUE);
}
