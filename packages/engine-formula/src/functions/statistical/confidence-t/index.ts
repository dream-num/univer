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
import { studentTINV } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class ConfidenceT extends BaseFunction {
    override minParams = 3;

    override maxParams = 3;

    override calculate(alpha: BaseValueObject, standardDev: BaseValueObject, size: BaseValueObject): BaseValueObject {
        const maxRowLength = Math.max(
            alpha.isArray() ? (alpha as ArrayValueObject).getRowCount() : 1,
            standardDev.isArray() ? (standardDev as ArrayValueObject).getRowCount() : 1,
            size.isArray() ? (size as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            alpha.isArray() ? (alpha as ArrayValueObject).getColumnCount() : 1,
            standardDev.isArray() ? (standardDev as ArrayValueObject).getColumnCount() : 1,
            size.isArray() ? (size as ArrayValueObject).getColumnCount() : 1
        );

        const alphaArray = expandArrayValueObject(maxRowLength, maxColumnLength, alpha, ErrorValueObject.create(ErrorType.NA));
        const standardDevArray = expandArrayValueObject(maxRowLength, maxColumnLength, standardDev, ErrorValueObject.create(ErrorType.NA));
        const sizeArray = expandArrayValueObject(maxRowLength, maxColumnLength, size, ErrorValueObject.create(ErrorType.NA));

        const resultArray = alphaArray.mapValue((alphaObject, rowIndex, columnIndex) => {
            const standardDevObject = standardDevArray.get(rowIndex, columnIndex) as BaseValueObject;
            const sizeObject = sizeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (alphaObject.isError()) {
                return alphaObject;
            }

            if (standardDevObject.isError()) {
                return standardDevObject;
            }

            if (sizeObject.isError()) {
                return sizeObject;
            }

            const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(alphaObject, standardDevObject, sizeObject);

            if (isError) {
                return errorObject as ErrorValueObject;
            }

            const [_alphaObject, _standardDevObject, _sizeObject] = variants as BaseValueObject[];

            const alphaValue = +_alphaObject.getValue();
            const standardDevValue = +_standardDevObject.getValue();
            const sizeValue = Math.floor(+_sizeObject.getValue());

            if (alphaValue <= 0 || alphaValue >= 1 || standardDevValue <= 0 || sizeValue < 1) {
                return ErrorValueObject.create(ErrorType.NUM);
            }

            if (sizeValue === 1) {
                return ErrorValueObject.create(ErrorType.DIV_BY_ZERO);
            }

            const result = Math.abs(studentTINV(alphaValue / 2, sizeValue - 1) * standardDevValue / Math.sqrt(sizeValue));

            return NumberValueObject.create(result);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }
}
