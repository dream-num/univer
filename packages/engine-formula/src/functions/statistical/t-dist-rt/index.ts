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
import { studentTCDF } from '../../../basics/statistical';
import { expandArrayValueObject } from '../../../engine/utils/array-object';
import { checkVariantsErrorIsStringToNumber } from '../../../engine/utils/check-variant-error';
import { type BaseValueObject, ErrorValueObject } from '../../../engine/value-object/base-value-object';
import { NumberValueObject } from '../../../engine/value-object/primitive-object';
import { BaseFunction } from '../../base-function';

export class TDistRt extends BaseFunction {
    override minParams = 2;

    override maxParams = 2;

    override calculate(
        x: BaseValueObject,
        degFreedom: BaseValueObject
    ): BaseValueObject {
        const maxRowLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getRowCount() : 1,
            degFreedom.isArray() ? (degFreedom as ArrayValueObject).getRowCount() : 1
        );

        const maxColumnLength = Math.max(
            x.isArray() ? (x as ArrayValueObject).getColumnCount() : 1,
            degFreedom.isArray() ? (degFreedom as ArrayValueObject).getColumnCount() : 1
        );

        const xArray = expandArrayValueObject(maxRowLength, maxColumnLength, x, ErrorValueObject.create(ErrorType.NA));
        const degFreedomArray = expandArrayValueObject(maxRowLength, maxColumnLength, degFreedom, ErrorValueObject.create(ErrorType.NA));

        const resultArray = xArray.mapValue((xObject, rowIndex, columnIndex) => {
            const degFreedomObject = degFreedomArray.get(rowIndex, columnIndex) as BaseValueObject;

            if (xObject.isError()) {
                return xObject;
            }

            if (degFreedomObject.isError()) {
                return degFreedomObject;
            }

            return this._handleSignleObject(xObject, degFreedomObject);
        });

        if (maxRowLength === 1 && maxColumnLength === 1) {
            return (resultArray as ArrayValueObject).get(0, 0) as BaseValueObject;
        }

        return resultArray;
    }

    private _handleSignleObject(
        xObject: BaseValueObject,
        degFreedomObject: BaseValueObject
    ): BaseValueObject {
        const { isError, errorObject, variants } = checkVariantsErrorIsStringToNumber(xObject, degFreedomObject);

        if (isError) {
            return errorObject as ErrorValueObject;
        }

        const [_xObject, _degFreedomObject] = variants as BaseValueObject[];

        const xValue = +_xObject.getValue();
        const degFreedomValue = Math.floor(+_degFreedomObject.getValue());

        if (degFreedomValue < 1 || degFreedomValue > 10 ** 10) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        const result = studentTCDF(-xValue, degFreedomValue);

        if (Number.isNaN(result) || !Number.isFinite(result)) {
            return ErrorValueObject.create(ErrorType.NUM);
        }

        return NumberValueObject.create(result);
    }
}
