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
import { centralFCDF, centralFPDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class FDist extends BaseFunction {
    override minParams = 4;

    override maxParams = 4;

    override calculate(
        x: BaseValueObject,
        degFreedom1: BaseValueObject,
        degFreedom2: BaseValueObject,
        cumulative: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            degFreedom1.isArray() ? (degFreedom1 as ArrayValueObject).getRowCount() : 1,
            degFreedom2.isArray() ? (degFreedom2 as ArrayValueObject).getRowCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            degFreedom1.isArray() ? (degFreedom1 as ArrayValueObject).getColumnCount() : 1,
            degFreedom2.isArray() ? (degFreedom2 as ArrayValueObject).getColumnCount() : 1,
            cumulative.isArray() ? (cumulative as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const degFreedom1Array = expandArrayValueObject(maxRowLength, maxColumnLength, degFreedom1, ErrorValueObject.create(ErrorType.NA));
        const degFreedom2Array = expandArrayValueObject(maxRowLength, maxColumnLength, degFreedom2, ErrorValueObject.create(ErrorType.NA));
        const cumulativeArray = expandArrayValueObject(maxRowLength, maxColumnLength, cumulative, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const degFreedom1Object = degFreedom1Array.get(rowIndex, columnIndex) as BaseValueObject;
            const degFreedom2Object = degFreedom2Array.get(rowIndex, columnIndex) as BaseValueObject;
            const cumulativeObject = cumulativeArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (xObject.isError()) {
                return xObject;
            }

            if (degFreedom1Object.isError()) {
                return degFreedom1Object;
            }

            if (degFreedom2Object.isError()) {
                return degFreedom2Object;
            }

            if (cumulativeObject.isError()) {
                return cumulativeObject;
            }

            return this._handleSignleObject(xObject, degFreedom1Object, degFreedom2Object, cumulativeObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        xObject: BaseValueObject,
        degFreedom1Object: BaseValueObject,
        degFreedom2Object: BaseValueObject,
        cumulativeObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(xObject, degFreedom1Object, degFreedom2Object, cumulativeObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_xObject, _degFreedom1Object, _degFreedom2Object, _cumulativeObject] = variants as BaseValueObject[];

        const xValue = +_xObject.getValue();
        const degFreedom1Value = Math.floor(+_degFreedom1Object.getValue());
        const degFreedom2Value = Math.floor(+_degFreedom2Object.getValue());
        const cumulativeValue = +_cumulativeObject.getValue();

        if (xValue < 0 || degFreedom1Value < 1 || degFreedom1Value > 10 ** 10 || degFreedom2Value < 1 || degFreedom2Value > 10 ** 10) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        let result;

        if (cumulativeValue) {
            result = centralFCDF(xValue, degFreedom1Value, degFreedom2Value);
        } else {
            result = centralFPDF(xValue, degFreedom1Value, degFreedom2Value);
        }

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
