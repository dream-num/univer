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
import { normalCDF, normalPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class NormDist extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(
        x: BaseValueObject,
        mean: BaseValueObject,
        standardDev: BaseValueObject,
        cumulative: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            mean.isArray() ? (mean as ArrayValueObject).getRowCount() : 1,
            standardDev.isArray() ? (standardDev as ArrayValueObject).getRowCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            mean.isArray() ? (mean as ArrayValueObject).getColumnCount() : 1,
            standardDev.isArray() ? (standardDev as ArrayValueObject).getColumnCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const meanArray = expandArrayValueObject(maxRowLength, maxColumnLength, mean, ErrorValueObject.create(ErrorType.NA));
        const standardDevArray = expandArrayValueObject(maxRowLength, maxColumnLength, standardDev, ErrorValueObject.create(ErrorType.NA));
        const cumulativeArray = expandArrayValueObject(maxRowLength, maxColumnLength, cumulative, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const meanObject = meanArray.get(rowIndex, columnIndex) as BaseValueObject;
            const standardDevObject = standardDevArray.get(rowIndex, columnIndex) as BaseValueObject;
            const cumulativeObject = cumulativeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (xObject.isError()) {
                return xObject;
            }

            if (meanObject.isError()) {
                return meanObject;
            }

            if (standardDevObject.isError()) {
                return standardDevObject;
            }

            if (cumulativeObject.isError()) {
                return cumulativeObject;
            }

            return this._handleSignleObject(xObject, meanObject, standardDevObject, cumulativeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        xObject: BaseValueObject,
        meanObject: BaseValueObject,
        standardDevObject: BaseValueObject,
        cumulativeObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(xObject, meanObject, standardDevObject, cumulativeObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_xObject, _meanObject, _standardDevObject, _cumulativeObject] = variants as BaseValueObject[];

        const xValue = +_xObject.getValue();
        const meanValue = +_meanObject.getValue();
        const standardDevValue = +_standardDevObject.getValue();
        const cumulativeValue = +_cumulativeObject.getValue();

        if (standardDevValue <= 0) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (cumulativeValue) {
            result = normalCDF(xValue, meanValue, standardDevValue);
        } else {
            result = normalPDF(xValue, meanValue, standardDevValue);
        }

        return NumberValueObject.create(result);
    }
}
