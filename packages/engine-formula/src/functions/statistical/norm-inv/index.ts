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
import { normalINV } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class NormInv extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(
        probability: BaseValueObject,
        mean: BaseValueObject,
        standardDev: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            probability.isArray() ? (probability as ArrayValueObject).getRowCount() : 1,
            mean.isArray() ? (mean as ArrayValueObject).getRowCount() : 1,
            standardDev.isArray() ? (standardDev as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            probability.isArray() ? (probability as ArrayValueObject).getColumnCount() : 1,
            mean.isArray() ? (mean as ArrayValueObject).getColumnCount() : 1,
            standardDev.isArray() ? (standardDev as ArrayValueObject).getColumnCount() : 1
        );

        const probabilityArray = expandArrayValueObject(maxRowLength, maxColumnLength, probability, ErrorValueObject.create(ErrorType.NA));
        const meanArray = expandArrayValueObject(maxRowLength, maxColumnLength, mean, ErrorValueObject.create(ErrorType.NA));
        const standardDevArray = expandArrayValueObject(maxRowLength, maxColumnLength, standardDev, ErrorValueObject.create(ErrorType.NA));

        const resultArray = probabilityArray.mapValue((probabilityObject, rowIndex, columnIndex) => {
            const meanObject = meanArray.get(rowIndex, columnIndex) as BaseValueObject;
            const standardDevObject = standardDevArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (probabilityObject.isError()) {
                return probabilityObject;
            }

            if (meanObject.isError()) {
                return meanObject;
            }

            if (standardDevObject.isError()) {
                return standardDevObject;
            }

            return this._handleSignleObject(probabilityObject, meanObject, standardDevObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        probabilityObject: BaseValueObject,
        meanObject: BaseValueObject,
        standardDevObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(probabilityObject, meanObject, standardDevObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_probabilityObject, _meanObject, _standardDevObject] = variants as BaseValueObject[];

        const probabilityValue = +_probabilityObject.getValue();
        const meanValue = +_meanObject.getValue();
        const standardDevValue = +_standardDevObject.getValue();

        if (probabilityValue <= 0 || probabilityValue >= 1 || standardDevValue <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = normalINV(probabilityValue, meanValue, standardDevValue);

        return NumberValueObject.create(result);
    }
}
