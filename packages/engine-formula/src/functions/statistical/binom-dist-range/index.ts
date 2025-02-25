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
import { binomialPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class BinomDistRange extends BaseFunction {
    override minParams = 3;

    override maxParams = 4;

    override calculate(
        trials: BaseValueObject,
        probabilityS: BaseValueObject,
        numberS: BaseValueObject,
        numberS2?: BaseValueObject
    ): BaseValueObject {
        let _numberS2 = numberS2 ?? numberS;

        if (_numberS2.isNull()) {
            _numberS2 = numberS;
        }

        const maxRowLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getRowCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getRowCount() : 1,
            numberS.isArray() ? (numberS as ArrayValueObject).getRowCount() : 1,
            _numberS2.isArray() ? (_numberS2 as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            trials.isArray() ? (trials as ArrayValueObject).getColumnCount() : 1,
            probabilityS.isArray() ? (probabilityS as ArrayValueObject).getColumnCount() : 1,
            numberS.isArray() ? (numberS as ArrayValueObject).getColumnCount() : 1,
            _numberS2.isArray() ? (_numberS2 as ArrayValueObject).getColumnCount() : 1
        );

        const trialsArray = expandArrayValueObject(maxRowLength, maxColumnLength, trials, ErrorValueObject.create(ErrorType.NA));
        const probabilitySArray = expandArrayValueObject(maxRowLength, maxColumnLength, probabilityS, ErrorValueObject.create(ErrorType.NA));
        const numberSArray = expandArrayValueObject(maxRowLength, maxColumnLength, numberS, ErrorValueObject.create(ErrorType.NA));
        const numberS2Array = expandArrayValueObject(maxRowLength, maxColumnLength, _numberS2, ErrorValueObject.create(ErrorType.NA));

        const resultArray = trialsArray.mapValue((trialsObject, rowIndex, columnIndex) => {
            const probabilitySObject = probabilitySArray.get(rowIndex, columnIndex) as BaseValueObject;
            const numberSObject = numberSArray.get(rowIndex, columnIndex) as BaseValueObject;
            const numberS2Object = numberS2Array.get(rowIndex, columnIndex) as BaseValueObject;

            if (trialsObject.isError()) {
                return trialsObject;
            }

            if (probabilitySObject.isError()) {
                return probabilitySObject;
            }

            if (numberSObject.isError()) {
                return numberSObject;
            }

            if (numberS2Object.isError()) {
                return numberS2Object;
            }

            return this._handleSignleObject(trialsObject, probabilitySObject, numberSObject, numberS2Object);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        trialsObject: BaseValueObject,
        probabilitySObject: BaseValueObject,
        numberSObject: BaseValueObject,
        numberS2Object: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(trialsObject, probabilitySObject, numberSObject, numberS2Object);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_trialsObject, _probabilitySObject, _numberSObject, _numberS2Object] = variants as BaseValueObject[];

        const trialsValue = Math.floor(+_trialsObject.getValue());
        const probabilitySValue = +_probabilitySObject.getValue();
        const numberSValue = Math.floor(+_numberSObject.getValue());
        const numberS2Value = Math.floor(+_numberS2Object.getValue());

        if (
            trialsValue < 0 ||
            probabilitySValue < 0 ||
            probabilitySValue > 1 ||
            numberSValue < 0 ||
            numberSValue > trialsValue ||
            numberS2Value < 0 ||
            numberS2Value < numberSValue ||
            numberS2Value > trialsValue
        ) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result = 0;

        for (let i = numberSValue; i <= numberS2Value; i++) {
            result += binomialPDF(i, trialsValue, probabilitySValue);
        }

        return NumberValueObject.create(result);
    }
}
