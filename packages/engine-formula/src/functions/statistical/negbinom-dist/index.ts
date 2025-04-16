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
import { negbinomialCDF, negbinomialPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class NegbinomDist extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(
        numberF: BaseValueObject,
        numberS: BaseValueObject,
        probabilityS: BaseValueObject,
        cumulative: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            numberF.isArray() ? (numberF as ArrayValueObject).getRowCount() : 1,
            numberS.isArray() ? (numberS as ArrayValueObject).getRowCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getRowCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            numberF.isArray() ? (numberF as ArrayValueObject).getColumnCount() : 1,
            numberS.isArray() ? (numberS as ArrayValueObject).getColumnCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getColumnCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getColumnCount() : 1
        );

        const numberFArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberF, ErrorValueObject.create(ErrorType.NA));
        const numberSArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberS, ErrorValueObject.create(ErrorType.NA));
        const probabilitySArray = expandArrayValueObject(maxRowLength, maxColumnLength, probabilityS, ErrorValueObject.create(ErrorType.NA));
        const cumulativeArray = expandArrayValueObject(maxRowLength, maxColumnLength, cumulative, ErrorValueObject.create(ErrorType.NA));

        const resultArray = numberFArray.mapValue((numberFObject, rowIndex, columnIndex) => {
            const numberSObject = numberSArray.get(rowIndex, columnIndex) as BaseValueObject;
            const probabilitySObject = probabilitySArray.get(rowIndex, columnIndex) as BaseValueObject;
            const cumulativeObject = cumulativeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (numberFObject.isError()) {
                return numberFObject;
            }

            if (numberSObject.isError()) {
                return numberSObject;
            }

            if (probabilitySObject.isError()) {
                return probabilitySObject;
            }

            if (cumulativeObject.isError()) {
                return cumulativeObject;
            }

            return this._handleSignleObject(numberFObject, numberSObject, probabilitySObject, cumulativeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        numberFObject: BaseValueObject,
        numberSObject: BaseValueObject,
        probabilitySObject: BaseValueObject,
        cumulativeObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(numberFObject, numberSObject, probabilitySObject, cumulativeObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_numberFObject, _numberSObject, _probabilitySObject, _cumulativeObject] = variants as BaseValueObject[];

        const numberFValue = Math.floor(+_numberFObject.getValue());
        const numberSValue = Math.floor(+_numberSObject.getValue());
        const probabilitySValue = +_probabilitySObject.getValue();
        const cumulativeValue = +_cumulativeObject.getValue();

        if (numberFValue < 0 || numberSValue < 1 || probabilitySValue <= 0 || probabilitySValue >= 1) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (cumulativeValue) {
            result = negbinomialCDF(numberFValue, numberSValue, probabilitySValue);
        } else {
            result = negbinomialPDF(numberFValue, numberSValue, probabilitySValue);
        }

        return NumberValueObject.create(result);
    }
}
